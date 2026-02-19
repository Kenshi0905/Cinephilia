import type { IncomingMessage, ServerResponse } from "http";
import type { Movie } from "./types";
import { getCollection } from "./_lib/mongo";

function parseRatingFromTitle(title: string): number {
  const match = title.match(/ - ([★½]+)$/);
  if (!match) return 0;
  const stars = match[1];
  let rating = 0;
  for (const char of stars) {
    if (char === "★") rating += 1;
    if (char === "½") rating += 0.5;
  }
  return rating;
}

function parseDescriptionToPosterAndReview(descriptionHtml: string): { poster: string; review: string } {
  if (!descriptionHtml) return { poster: "", review: "" };
  // Minimal HTML extraction without DOMParser on Node: use regex fallback
  const imgMatch = descriptionHtml.match(/<img[^>]+src="([^"]+)"/i);
  const poster = imgMatch?.[1] || "";

  // Strip tags and basic spoiler/watched lines
  const text = descriptionHtml
    .replace(/<[^>]+>/g, "\n")
    .split(/\n+/)
    .map((t) => t.trim())
    .filter((t) => t && !/^Watched on /i.test(t) && !/contains spoilers/i.test(t) && !/^$/.test(t))
    .join("\n\n");

  return { poster, review: text };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    const rssUrl = process.env.LETTERBOXD_RSS_URL || "https://letterboxd.com/kenshi05/rss/";
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`Letterboxd RSS request failed with status ${response.status}`);
    }

    const xmlText = await response.text();

    // Lightweight XML parsing: pull items via regex
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const items = xmlText.match(itemRegex) || [];
    const toUpsert: Movie[] = [];

    for (const raw of items) {
      const guid = (raw.match(/<guid>\s*([^<]+)\s*<\/guid>/) || [])[1] || "";
      const titleRaw = (raw.match(/<title>\s*([^<]+)\s*<\/title>/) || [])[1] || "Untitled";
      let filmTitle = titleRaw.trim();
      let rating = parseRatingFromTitle(filmTitle);
      if (rating > 0) {
        filmTitle = filmTitle.replace(/ - [★½]+$/, "").trim();
      }

      const memberRatingRaw = (raw.match(/<letterboxd:memberRating>\s*([^<]+)\s*<\/letterboxd:memberRating>/) || [])[1];
      if (memberRatingRaw) {
        const parsed = Number.parseFloat(memberRatingRaw);
        if (!Number.isNaN(parsed) && parsed > 0) rating = parsed;
      }

      const yearRaw = (raw.match(/<letterboxd:filmYear>\s*([^<]+)\s*<\/letterboxd:filmYear>/) || [])[1] || "0";
      const watchedDate = (raw.match(/<letterboxd:watchedDate>\s*([^<]+)\s*<\/letterboxd:watchedDate>/) || [])[1] || "";
      const descriptionHtml = (raw.match(/<description>\s*([\s\S]*?)\s*<\/description>/) || [])[1] || "";
      const { poster, review } = parseDescriptionToPosterAndReview(descriptionHtml);

      const year = Number.parseInt(yearRaw, 10) || 0;
      if (year > 0 && filmTitle.endsWith(`, ${year}`)) {
        filmTitle = filmTitle.slice(0, -(`, ${year}`).length).trim();
      }

      const movie: Movie = {
        id: guid || `${filmTitle}-${watchedDate || "unknown"}`,
        title: filmTitle,
        year,
        director: "",
        rating,
        poster,
        backdrop: poster,
        review,
        watchedDate,
        runtime: 0,
        genre: [],
      };
      toUpsert.push(movie);
    }

    if (toUpsert.length > 0) {
      const col = await getCollection<Movie>("movies");
      const ops = toUpsert.map((m) => ({
        updateOne: {
          filter: { id: m.id },
          update: { $set: m },
          upsert: true,
        },
      }));
      await col.bulkWrite(ops, { ordered: false });
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ updated: toUpsert.length }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err?.message || "Error" }));
  }
}
