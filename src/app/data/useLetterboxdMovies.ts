import { useEffect, useRef, useState } from "react";
import type { Movie } from "./movies";
import { fetchLetterboxdMovies } from "./letterboxd";
import { loadHistoryFromExports, mergeAndCacheHistory } from "./history/historyCache";
import { enrichMissingPosters } from "./posters";
import { enrichMissingDetails } from "./enrichDetails";
import { shouldAttemptBackendApi } from "./network";

export interface UseLetterboxdMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

export function useLetterboxdMovies(): UseLetterboxdMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasRunEnrichmentRef = useRef(false);
  const hasRunHistoryPosterEnrichmentRef = useRef(false);

  async function fetchApiMoviesWithTimeout(timeoutMs: number): Promise<Movie[] | null> {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    if (!shouldAttemptBackendApi(apiBase)) return null;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `${apiBase}/api/movies`;
      const resp = await fetch(url, { signal: controller.signal });
      if (!resp.ok) return null;

      const data = await resp.json();
      const apiMovies: Movie[] = Array.isArray(data?.movies) ? data.movies : [];
      return apiMovies.length > 0 ? apiMovies : null;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

    async function load() {
      try {
        // Start local history and backend API in parallel so UI doesn't block on slow serverless cold starts.
        const historyPromise = loadHistoryFromExports();
        const apiPromise = fetchApiMoviesWithTimeout(1800);

        // Start from any existing cache (localStorage or CSV exports)
        const history = await historyPromise;
        if (!isMounted) return;

        if (history.length > 0) {
          setMovies(history);

          // Only enrich posters for movies that are unlikely to be in the RSS feed (index 50+)
          const moviesToEnrich = history.slice(50);

          if (moviesToEnrich.length > 0 && !hasRunHistoryPosterEnrichmentRef.current) {
            hasRunHistoryPosterEnrichmentRef.current = true;
            enrichMissingPosters(moviesToEnrich)
              .then((enrichedTail) => {
                if (!isMounted) return;
                setMovies((currentMovies) => {
                  const newMovies = [...currentMovies];
                  if (newMovies.length >= 50) {
                    newMovies.splice(50, newMovies.length - 50, ...enrichedTail);
                  }
                  return newMovies;
                });
              })
              .catch(() => { /* ignore */ });
          }
        }

        // If backend API is healthy, prefer it, but never block first paint on it.
        const apiMovies = await apiPromise;
        if (!isMounted) return;
        if (apiMovies && apiMovies.length > 0) {
          setMovies(apiMovies);
          return;
        }

        const remoteMovies = await fetchLetterboxdMovies();
        if (!isMounted) return;

        if (remoteMovies && remoteMovies.length > 0) {
          const merged = mergeAndCacheHistory(history, remoteMovies);
          setMovies(merged);

          // Run heavy enrichments only once per app session to keep navigation smooth.
          if (!hasRunEnrichmentRef.current) {
            hasRunEnrichmentRef.current = true;

            const shouldEnrichDetails =
              (import.meta.env.VITE_ENABLE_DETAIL_ENRICHMENT as string | undefined) === "true";

            const detailEnrichmentPromise = shouldEnrichDetails
              ? enrichMissingDetails(merged)
              : Promise.resolve(merged);

            Promise.all([
              enrichMissingPosters(merged),
              detailEnrichmentPromise,
            ])
              .then(([enrichedPosters, enrichedDetails]) => {
                if (!isMounted) return;

                const movieMap = new Map<string, Movie>();
                // Start with original merged list to keep order
                for (const m of merged) movieMap.set(m.id, m);

                // Update with posters
                for (const m of enrichedPosters) {
                  const existing = movieMap.get(m.id);
                  if (existing) movieMap.set(m.id, { ...existing, ...m });
                }

                // Update with details
                for (const m of enrichedDetails) {
                  const existing = movieMap.get(m.id);
                  if (existing) movieMap.set(m.id, { ...existing, ...m });
                }

                // Restore order from merged list
                const finalMovies = merged.map(m => movieMap.get(m.id)!);
                setMovies(finalMovies);
              })
              .catch(() => { /* ignore */ });
          }
        }
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    const intervalId = window.setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return { movies, loading, error };
}
