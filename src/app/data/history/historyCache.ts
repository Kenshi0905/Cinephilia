import Papa from "papaparse";
import type { Movie } from "../movies";

// Use runtime URLs so build does not require local CSV assets to exist
const assetBase = import.meta.env.BASE_URL || "/";
const reviewsUrl = `${assetBase}letterboxd-exports/reviews.csv`;
const watchedUrl = `${assetBase}letterboxd-exports/watched.csv`;
const diaryUrl = `${assetBase}letterboxd-exports/diary.csv`;
const ratingsUrl = `${assetBase}letterboxd-exports/ratings.csv`;

const STORAGE_KEY = "cinephilia_movie_history_v2";

function normalizeKey(title: string, year: number | string): string {
  const cleanedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const cleanedYear = String(year || "").trim();
  return `${cleanedTitle}|${cleanedYear}`;
}

function movieKey(movie: Movie): string {
  return normalizeKey(movie.title, movie.year);
}

async function loadCsv(url: string): Promise<Record<string, string>[]> {
  // Add cache buster to ensure we get the latest file content
  // URLs from Vite imports might already have query params (e.g. ?url)
  // but usually for assets they are just paths.
  const now = Date.now();
  const separator = url.includes("?") ? "&" : "?";
  const cleanUrl = `${url}${separator}t=${now}`;

  try {
    const response = await fetch(cleanUrl);
    if (!response.ok) {
      // Try without cache buster if it fails? No, just throw.
      console.warn(`Failed to load CSV ${url}: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors && result.errors.length > 0) {
      console.warn("CSV parse errors", result.errors.slice(0, 3));
    }

    const rows = (result.data as Record<string, string>[]).filter((row: Record<string, string>) =>
      Object.values(row).some((v) => typeof v === "string" && v.trim() !== "")
    );

    return rows;
  } catch (err) {
    console.warn("Failed to fetch/parse CSV", err);
    return [];
  }
}

async function loadReviewsFromCsv(): Promise<Movie[]> {
  try {
    const rows = await loadCsv(reviewsUrl);

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
    const rows = await loadCsv(watchedUrl);

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
    const rows = await loadCsv(diaryUrl);

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
    const rows = await loadCsv(ratingsUrl);

    const movies: Movie[] = [];

    for (const row of rows) {
      const title = row["Name"] ?? "";
      if (!title) continue;

      const year = Number.parseInt(row["Year"] ?? "0", 10) || 0;
      const rating = Number.parseFloat(row["Rating"] ?? "0") || 0;
      const watchedDate = row["Date"] ?? "";
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
      const key = movieKey(movie);
      const existing = map.get(key);

      if (!existing) {
        map.set(key, movie);
        continue;
      }

      const existingDate = existing.watchedDate ? new Date(existing.watchedDate).getTime() : 0;
      const incomingDate = movie.watchedDate ? new Date(movie.watchedDate).getTime() : 0;

      // Merge per-field so we never lose ratings/reviews when we pick up posters from another source.
      const mergedMovie: Movie = {
        ...existing,
        ...movie,
        watchedDate: incomingDate > existingDate ? movie.watchedDate : existing.watchedDate,
        rating: movie.rating > 0 ? movie.rating : existing.rating,
        // Concatenate reviews if they differ
        review: (() => {
          const r1 = existing.review?.trim();
          const r2 = movie.review?.trim();
          if (!r1) return r2;
          if (!r2) return r1;
          if (r1 === r2) return r1; // Identical
          if (r1.includes(r2)) return r1; // r2 is subset
          if (r2.includes(r1)) return r2; // r1 is subset

          // Different reviews. Concatenate with a nice separator.
          // Check if dates are available to add context?
          // For simplicity, just stack them with a divider.
          return `${r1}\n\n───\n\n${r2}`;
        })(),
        poster: movie.poster || existing.poster,
        backdrop: movie.backdrop || existing.backdrop,
        director: movie.director || existing.director,
        runtime: movie.runtime || existing.runtime,
        genre: movie.genre.length > 0 ? movie.genre : existing.genre,
        id: existing.id // Keep existing ID if possible, usually the same
      };

      map.set(key, mergedMovie);
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

function getLocalCache(): Movie[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to parse local movie history", e);
    return [];
  }
}

function setLocalCache(movies: Movie[]) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch (e) {
    console.warn("Failed to save movie history to localStorage", e);
  }
}

export async function loadHistoryFromExports(): Promise<Movie[]> {
  if (typeof window === "undefined") {
    return [];
  }

  // Load from multiple sources parallel
  const [reviews, watched, diary, ratings] = await Promise.all([
    loadReviewsFromCsv(),
    loadWatchedFromCsv(),
    loadDiaryFromCsv(),
    loadRatingsFromCsv(),
  ]);

  // Also include whatever is in localStorage (e.g. from previous RSS fetches)
  const cached = getLocalCache();

  const merged = mergeDistinctMovies([reviews, watched, diary, ratings, cached]);

  // Update cache immediately to ensure CSV data is also locally saved for offline/faster subsequent loads
  setLocalCache(merged);

  return merged;
}

export function mergeAndCacheHistory(existingHistory: Movie[], latestRemote: Movie[]): Movie[] {
  const merged = mergeDistinctMovies([existingHistory, latestRemote]);

  if (typeof window !== "undefined") {
    setLocalCache(merged);
  }

  return merged;
}
