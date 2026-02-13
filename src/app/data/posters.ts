import type { Movie } from "./movies";

const POSTER_CACHE_KEY = "cinephilia-poster-cache-v1";

function buildProxyUrl(targetUrl: string): string {
  const proxyTemplate = import.meta.env
    .VITE_RSS_PROXY_TEMPLATE as string | undefined;

  if (proxyTemplate === "none") {
    return targetUrl;
  }

  if (proxyTemplate && proxyTemplate.length > 0) {
    return proxyTemplate.replace("{url}", encodeURIComponent(targetUrl));
  }

  return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
}

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
  let fetchedCount = 0;
  const MAX_FETCH_PER_RUN = 5; // avoid hammering Letterboxd

  for (let i = 0; i < updated.length; i++) {
    const movie = updated[i];
    if (movie.poster) continue;

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

    if (fetchedCount >= MAX_FETCH_PER_RUN) continue;

    try {
      const response = await fetch(buildProxyUrl(url));
      if (!response.ok) continue;
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const ogImage =
        doc
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") ?? "";

      if (!ogImage) continue;

      cache[url] = ogImage;
      updated[i] = {
        ...movie,
        poster: ogImage,
        backdrop: movie.backdrop || ogImage,
      };
      changed = true;
      fetchedCount += 1;
    } catch {
      // ignore network/parse errors and move on
    }
  }

  if (changed) {
    savePosterCache(cache);
    return updated;
  }

  return movies;
}
