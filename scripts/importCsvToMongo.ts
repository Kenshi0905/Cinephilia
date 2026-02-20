import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";
import { MongoClient } from "mongodb";

interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  rating: number;
  poster: string;
  backdrop: string;
  review: string;
  watchedDate: string;
  runtime: number;
  genre: string[];
}

function normalizeKey(title: string, year: number | string): string {
  const cleanedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const cleanedYear = String(year || "").trim();
  return `${cleanedTitle}|${cleanedYear}`;
}

async function parseCsv(filePath: string): Promise<Record<string, string>[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });
  const rows = (result.data || []).filter((row) =>
    Object.values(row).some((v) => typeof v === "string" && v.trim() !== "")
  );
  return rows;
}

function rowToMovie(row: Record<string, string>, kind: "reviews" | "watched" | "diary" | "ratings"): Movie | null {
  const title = row["Name"] ?? "";
  if (!title) return null;
  const year = Number.parseInt(row["Year"] ?? "0", 10) || 0;
  const rating = Number.parseFloat(row["Rating"] ?? "0") || 0;
  const watchedDate = row["Watched Date"] || row["Date"] || "";
  const review = row["Review"] ?? "";
  const letterboxdUri = row["Letterboxd URI"] ?? "";

  const id = letterboxdUri || `${title}-${watchedDate || "unknown"}`;
  return {
    id,
    title,
    year,
    director: "",
    rating: kind === "watched" ? 0 : rating,
    poster: "",
    backdrop: "",
    review: kind === "reviews" ? review : "",
    watchedDate,
    runtime: 0,
    genre: [],
  };
}

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "cinephilia";
  if (!mongoUri) {
    console.error("MONGODB_URI env var is required");
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection<Movie>("movies");

  const csvDir = path.join(process.cwd(), "public", "letterboxd-exports");

  const files = [
    { name: "reviews.csv", kind: "reviews" as const },
    { name: "watched.csv", kind: "watched" as const },
    { name: "diary.csv", kind: "diary" as const },
    { name: "ratings.csv", kind: "ratings" as const },
  ];

  const allMovies: Movie[] = [];

  for (const f of files) {
    try {
      const fp = path.join(csvDir, f.name);
      const rows = await parseCsv(fp);
      for (const row of rows) {
        const m = rowToMovie(row, f.kind);
        if (m) allMovies.push(m);
      }
      console.log(`Parsed ${rows.length} rows from ${f.name}`);
    } catch (e) {
      console.warn(`Skipping ${f.name}:`, e);
    }
  }

  // Merge distinct by normalized key to avoid duplicates
  const map = new Map<string, Movie>();
  for (const m of allMovies) {
    const key = normalizeKey(m.title, m.year);

    const existing = map.get(key);
    if (!existing) {
      map.set(key, m);
      continue;
    }
    const existingDate = existing.watchedDate ? new Date(existing.watchedDate).getTime() : 0;
    const incomingDate = m.watchedDate ? new Date(m.watchedDate).getTime() : 0;
    map.set(key, {
      ...existing,
      ...m,
      watchedDate: incomingDate > existingDate ? m.watchedDate : existing.watchedDate,
      rating: m.rating > 0 ? m.rating : existing.rating,
      review: (() => {
        const r1 = (existing.review || "").trim();
        const r2 = (m.review || "").trim();
        if (!r1) return r2;
        if (!r2) return r1;
        if (r1 === r2) return r1;
        if (r1.includes(r2)) return r1;
        if (r2.includes(r1)) return r2;
        return `${r1}\n\n───\n\n${r2}`;
      })(),
      poster: m.poster || existing.poster,
      backdrop: m.backdrop || existing.backdrop,
      director: m.director || existing.director,
      runtime: m.runtime || existing.runtime,
      genre: m.genre.length > 0 ? m.genre : existing.genre,
      id: existing.id,
    });
  }

  const merged = Array.from(map.values());

  if (merged.length > 0) {
    const ops = merged.map((m) => ({
      updateOne: {
        filter: { id: m.id },
        update: { $set: m },
        upsert: true,
      },
    }));
    await col.bulkWrite(ops, { ordered: false });
    console.log(`Upserted ${merged.length} movies`);
  }

  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
