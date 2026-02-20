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

  useEffect(() => {
    let isMounted = true;
    const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

    async function load() {
      try {
        // First, try backend API if available
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "";
          if (shouldAttemptBackendApi(apiBase)) {
            const url = `${apiBase}/api/movies`;
            const resp = await fetch(url);
            if (resp.ok) {
              const data = await resp.json();
              const apiMovies: Movie[] = Array.isArray(data?.movies) ? data.movies : [];
              if (apiMovies.length > 0) {
                setMovies(apiMovies);
                setLoading(false);
                return; // Skip local CSV/RSS when backend is present
              }
            }
          }
        } catch (_) {
          // Ignore backend errors, fall back to local flow
        }

        // Start from any existing cache (localStorage or CSV exports)
        const history = await loadHistoryFromExports();
        if (!isMounted) return;

        if (history.length > 0) {
          setMovies(history);
          setLoading(false);

          // Only enrich posters for movies that are unlikely to be in the RSS feed (index 50+)
          const moviesToEnrich = history.slice(50);

          if (moviesToEnrich.length > 0) {
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
