import { useEffect, useState } from "react";
import { movies as fallbackMovies, type Movie } from "./movies";
import { fetchLetterboxdMovies } from "./letterboxd";
import { loadHistoryFromExports, mergeAndCacheHistory } from "./history/historyCache";
import { enrichMissingPosters } from "./posters";

interface UseLetterboxdMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

export function useLetterboxdMovies(): UseLetterboxdMoviesResult {
  const [movies, setMovies] = useState<Movie[]>(fallbackMovies);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

    async function load() {
      try {
        // Start from any existing cache (localStorage or CSV exports)
        const history = await loadHistoryFromExports();
        if (!isMounted) return;

        if (history.length > 0) {
          setMovies(history);
          // Start enriching posters for CSV-only movies in the background
          enrichMissingPosters(history)
            .then((enriched) => {
              if (!isMounted) return;
              setMovies(enriched);
            })
            .catch(() => {
              // ignore enrichment errors
            });
        }

        const remoteMovies = await fetchLetterboxdMovies();
        if (!isMounted) return;

        if (remoteMovies && remoteMovies.length > 0) {
          const merged = mergeAndCacheHistory(history, remoteMovies);
          setMovies(merged);

          // Re-run poster enrichment after merging in RSS entries
          enrichMissingPosters(merged)
            .then((enriched) => {
              if (!isMounted) return;
              setMovies(enriched);
            })
            .catch(() => {
              // ignore enrichment errors
            });
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
