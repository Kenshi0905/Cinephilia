import React from "react";
import { useOutletContext } from "react-router-dom";
import { MovieCard } from "./MovieCard";
import type { UseLetterboxdMoviesResult } from "../data/useLetterboxdMovies";

export function MovieGrid() {
  const { movies, loading, error } = useOutletContext<UseLetterboxdMoviesResult>();

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-8 relative overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
          <div className="space-y-2">
            <p className="text-white/85 tracking-[0.2em] text-xs uppercase">Loading Archive</p>
            <p className="text-white/40 text-sm">Fetching films, posters, and notes…</p>
          </div>
        </div>
      </div>
    );
  }

  // Use only movies that have a poster for the hero ring,
  // so the front page always shows actual artwork.
  const moviesWithPoster = movies.filter((m) => !!m.poster);

  // Define concentric rings around the CINEMA ARCHIVE title.
  // We keep just two well-spaced rings to avoid any overlap.
  const ringConfigs = [
    // Inner ring: closest to the title
    { maxCount: 8, radius: 320, scale: 0.9, blur: 0, opacity: 0.9 },
    // Outer ring: pushed much further out and scaled down
    { maxCount: 12, radius: 520, scale: 0.7, blur: 2, opacity: 0.7 },
  ] as const;

  const maxVisible = ringConfigs.reduce((sum, r) => sum + r.maxCount, 0);
  const sourceMovies = moviesWithPoster.length > 0 ? moviesWithPoster : movies;
  const visibleMovies = sourceMovies.slice(0, maxVisible);

  const getCircularPosition = (index: number, total: number, radius: number) => {
    // Start from the top (-90deg) so the circle is nicely aligned
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  const moviePositions: {
    movie: (typeof visibleMovies)[number];
    style: React.CSSProperties;
  }[] = [];

  let offset = 0;
  for (const ring of ringConfigs) {
    const remaining = visibleMovies.length - offset;
    if (remaining <= 0) break;

    const count = Math.min(ring.maxCount, remaining);
    for (let i = 0; i < count; i++) {
      const movie = visibleMovies[offset + i];
      const pos = getCircularPosition(i, count, ring.radius);

      moviePositions.push({
        movie,
        style: {
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${ring.scale})`,
          filter: ring.blur > 0 ? `blur(${ring.blur}px)` : undefined,
          opacity: ring.opacity,
        },
      });
    }

    offset += count;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 relative overflow-hidden">
      <div className="relative w-full h-[calc(100vh-12rem)] min-h-[800px]">
        
        {/* Centered Logo Block */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center pointer-events-none">
          {/* Top line */}
          <div className="w-[500px] h-[3px] bg-white/90 mb-6 mx-auto" style={{ transform: "scaleX(1.15)" }} />

          {/* Logo image */}
           <div className="mx-auto max-w-[260px] md:max-w-[320px] lg:max-w-[380px]">
            <img
              src="/cinema-archive-logo.png"
              alt="Cinema Archive"
              className="w-full h-auto"
            />
          </div>

          {/* Bottom line */}
          <div className="w-[500px] h-[3px] bg-white/90 mt-6 mx-auto" />

          {/* Subtitle */}
          <p
            className="text-white/40 tracking-wider mt-6 text-sm"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            {movies.length} films watched
          </p>
        </div>

        {/* Movies arranged in concentric circular pattern */}
        <div className="absolute inset-0">
          {moviePositions.map(({ movie, style }, index) => (
            <div 
              key={movie.id} 
              style={style}
              className="w-[110px] md:w-[140px] hover:opacity-100 hover:z-50 transition-opacity duration-500 pointer-events-auto"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Empty/Loading state message */}
        {moviesWithPoster.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white/50 text-sm tracking-wider uppercase">
              {loading ? "Loading your archive…" : error ? "Unable to fetch posters right now" : "No posters available yet"}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}