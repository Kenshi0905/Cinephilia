import Papa from "papaparse";
import type { Movie } from "../movies";

function normalizeKey(title: string, year: number | string): string {
  const cleanedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const cleanedYear = String(year || "").trim();
  return `${cleanedTitle}|${cleanedYear}`;
}

async function loadCsv(url: string): Promise<Record<string, string>[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status}`);
  }

  const text = await response.text();
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors && result.errors.length > 0) {
    console.warn("CSV parse errors", result.errors.slice(0, 3));
  }

  return result.data.filter((row) => Object.values(row).some((v) => v && v.trim() !== ""));
}

async function loadReviewsFromCsv(): Promise<Movie[]> {
  try {
    const url = new URL("../letterboxd-exports/reviews.csv", import.meta.url).href;
    const rows = await loadCsv(url);

    const movies: Movie[] = [];

    for (const row of rows) {
      const title = row["Name"] ?? "";
      if (!title) continue;

      const year = Number.parseInt(row["Year"] ?? "0", 10) || 0;
      const rating = Number.parseFloat(row["Rating"] ?? "0") || 0;
      const watchedDate = row["Watched Date"] || row["Date"] || "";
      const review = row["Review"] ?? "";
      const letterboxdUri = row["Letterboxd URI"] ?? "";

      const movie: Movie = {
        id: letterboxdUri || `${title}-${watchedDate || "unknown"}`,
        title,
        year,
        director: "",
        rating,
        poster: "",
        backdrop: "",
        review,
        watchedDate,
        runtime: 0,
        genre: [],
      };

      movies.push(movie);
    }

    return movies;
  } catch (err) {
    console.warn("Failed to load Letterboxd reviews CSV", err);
    return [];
  }
}

async function loadWatchedFromCsv(): Promise<Movie[]> {
  try {
    const url = new URL("../letterboxd-exports/watched.csv", import.meta.url).href;
    const rows = await loadCsv(url);

    const movies: Movie[] = [];

    for (const row of rows) {
      const title = row["Name"] ?? "";
      if (!title) continue;

      const year = Number.parseInt(row["Year"] ?? "0", 10) || 0;
      const watchedDate = row["Date"] ?? "";
      const letterboxdUri = row["Letterboxd URI"] ?? "";

      const movie: Movie = {
        id: letterboxdUri || `${title}-${watchedDate || "unknown"}`,
        title,
        year,
        director: "",
        rating: 0,
        poster: "",
        backdrop: "",
        review: "",
        watchedDate,
        runtime: 0,
        genre: [],
      };

      movies.push(movie);
    }

    return movies;
  } catch (err) {
    console.warn("Failed to load Letterboxd watched CSV", err);
    return [];
  }
}

async function loadDiaryFromCsv(): Promise<Movie[]> {
  try {
    const url = new URL("../letterboxd-exports/diary.csv", import.meta.url).href;
    const rows = await loadCsv(url);

    const movies: Movie[] = [];

    for (const row of rows) {
      const title = row["Name"] ?? "";
      if (!title) continue;

      const year = Number.parseInt(row["Year"] ?? "0", 10) || 0;
      const rating = Number.parseFloat(row["Rating"] ?? "0") || 0;
      const watchedDate = row["Watched Date"] || row["Date"] || "";
      const letterboxdUri = row["Letterboxd URI"] ?? "";

      const movie: Movie = {
        id: letterboxdUri || `${title}-${watchedDate || "unknown"}`,
        title,
        year,
        director: "",
        rating,
        poster: "",
        backdrop: "",
        review: "",
        watchedDate,
        runtime: 0,
        genre: [],
      };

      movies.push(movie);
    }

    return movies;
  } catch (err) {
    console.warn("Failed to load Letterboxd diary CSV", err);
    return [];
  }
}

async function loadRatingsFromCsv(): Promise<Movie[]> {
  try {
    const url = new URL("../letterboxd-exports/ratings.csv", import.meta.url).href;
    const rows = await loadCsv(url);

    const movies: Movie[] = [];

    for (const row of rows) {
      const title = row["Name"] ?? "";
      if (!title) continue;

      const year = Number.parseInt(row["Year"] ?? "0", 10) || 0;
      const rating = Number.parseFloat(row["Rating"] ?? "0") || 0;
      const watchedDate = row["Date"] || "";
      const letterboxdUri = row["Letterboxd URI"] ?? "";

      const movie: Movie = {
        id: letterboxdUri || `${title}-${watchedDate || "unknown"}`,
        title,
        year,
        director: "",
        rating,
        poster: "",
        backdrop: "",
        review: "",
        watchedDate,
        runtime: 0,
        genre: [],
      };

      movies.push(movie);
    }

    return movies;
  } catch (err) {
    console.warn("Failed to load Letterboxd ratings CSV", err);
    return [];
  }
}

function mergeDistinctMovies(sources: Movie[][]): Movie[] {
  const map = new Map<string, Movie>();

  for (const list of sources) {
    for (const movie of list) {
      const key = normalizeKey(movie.title, movie.year);
      const existing = map.get(key);

      if (!existing) {
        map.set(key, movie);
        continue;
      }

      // Prefer the one with a later watched date, or non-zero rating / non-empty review
      const existingDate = existing.watchedDate ? new Date(existing.watchedDate).getTime() : 0;
      const incomingDate = movie.watchedDate ? new Date(movie.watchedDate).getTime() : 0;

      const incomingHasBetterMedia = (!existing.poster && !!movie.poster) || (!existing.backdrop && !!movie.backdrop);

      const shouldReplace =
        incomingDate > existingDate ||
        (incomingDate === existingDate && (movie.rating > existing.rating || movie.review.length > existing.review.length)) ||
        incomingHasBetterMedia;

      if (shouldReplace) {
        map.set(key, {
          ...existing,
          ...movie,
        });
      }
    }
  }

  const merged = Array.from(map.values());

  // Sort by watched date descending when available
  merged.sort((a, b) => {
    const aTime = a.watchedDate ? new Date(a.watchedDate).getTime() : 0;
    const bTime = b.watchedDate ? new Date(b.watchedDate).getTime() : 0;
    return bTime - aTime;
  });

  return merged;
}

export async function loadHistoryFromExports(): Promise<Movie[]> {
  if (typeof window === "undefined") {
    return [];
  }

  // Always (re)build from CSV exports so new data is picked up
  const [reviews, watched, diary, ratings] = await Promise.all([
    loadReviewsFromCsv(),
    loadWatchedFromCsv(),
    loadDiaryFromCsv(),
    loadRatingsFromCsv(),
  ]);

  const merged = mergeDistinctMovies([reviews, watched, diary, ratings]);

  return merged;
}

export function mergeAndCacheHistory(existingHistory: Movie[], latestRemote: Movie[]): Movie[] {
  if (typeof window === "undefined") {
    return mergeDistinctMovies([existingHistory, latestRemote]);
  }

  const merged = mergeDistinctMovies([existingHistory, latestRemote]);

  return merged;
}
