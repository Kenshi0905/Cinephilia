import { useEffect, useState } from "react";
import { movies as fallbackMovies, type Movie } from "./movies";
import { fetchLetterboxdMovies } from "./letterboxd";
import { loadHistoryFromExports, mergeAndCacheHistory } from "./history/historyCache";
import { enrichMissingPosters } from "./posters";
import { enrichMissingDetails } from "./enrichDetails";

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

          // After RSS merge, enrich posters AND details for missing items
          Promise.all([
            enrichMissingPosters(merged),
            enrichMissingDetails(merged)
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
