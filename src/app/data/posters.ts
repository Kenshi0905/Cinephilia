import type { Movie } from "./movies";
import { fetchWithRssProxyFallback } from "./network";

const POSTER_CACHE_KEY = "cinephilia-poster-cache-v1";

function loadPosterCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(POSTER_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function savePosterCache(cache: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

function getLetterboxdUrlFromMovie(movie: Movie): string | null {
  if (movie.id && movie.id.startsWith("http")) {
    return movie.id;
  }
  return null;
}

export async function enrichMissingPosters(movies: Movie[]): Promise<Movie[]> {
  if (typeof window === "undefined") return movies;

  const cache = loadPosterCache();
  const updated = [...movies];
  let changed = false;
  const MAX_FETCH_PER_RUN = 12;
  const timeoutMs = 4000;
  const toFetch: Array<{ index: number; url: string; movie: Movie }> = [];

  for (let i = 0; i < updated.length; i++) {
    const movie = updated[i];

    // If we already have a poster, assume it's good (e.g. from RSS) and don't re-fetch
    if (movie.poster && movie.poster.length > 0) continue;

    const url = getLetterboxdUrlFromMovie(movie);
    if (!url) continue;

    const cachedPoster = cache[url];
    if (cachedPoster) {
      updated[i] = {
        ...movie,
        poster: cachedPoster,
        backdrop: movie.backdrop || cachedPoster,
      };
      changed = true;
      continue;
    }

    if (toFetch.length < MAX_FETCH_PER_RUN) {
      toFetch.push({ index: i, url, movie });
    }
  }

  const fetched = await Promise.all(
    toFetch.map(async ({ index, url, movie }) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetchWithRssProxyFallback(url, { signal: controller.signal });
        if (!response.ok) return null;

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const ogImage =
          doc
            .querySelector('meta[property="og:image"]')
            ?.getAttribute("content") ?? "";

        if (!ogImage) return null;
        return { index, movie, url, ogImage };
      } catch {
        return null;
      } finally {
        window.clearTimeout(timeoutId);
      }
    }),
  );

  for (const item of fetched) {
    if (!item) continue;
    const { index, movie, url, ogImage } = item;
    cache[url] = ogImage;
    updated[index] = {
      ...movie,
      poster: ogImage,
      backdrop: movie.backdrop || ogImage,
    };
    changed = true;
  }

  if (changed) {
    savePosterCache(cache);
    return updated;
  }

  return movies;
}
