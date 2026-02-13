import React from "react";
import { MovieCard } from "./MovieCard";
import { useLetterboxdMovies } from "../data/useLetterboxdMovies";

export function MovieGrid() {
  const { movies } = useLetterboxdMovies();

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
  const visibleMovies = moviesWithPoster.slice(0, maxVisible);

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
          <div className="w-[500px] h-[3px] bg-white/90 mb-3 mx-auto" style={{ transform: 'scaleX(1.15)' }}></div>
          
          {/* CINEMA */}
          <h1 
            className="text-white/95 leading-[0.8] mb-1" 
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif', 
              fontWeight: 400, 
              fontSize: '10rem',
              letterSpacing: '-0.05em',
              textTransform: 'uppercase'
            }}
          >
            CINEMA
          </h1>
          
          {/* ARCHIVE */}
          <h1 
            className="text-white/95 leading-[0.8]" 
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif', 
              fontWeight: 400, 
              fontSize: '10rem',
              letterSpacing: '-0.05em',
              textTransform: 'uppercase'
            }}
          >
            ARCHIVE
          </h1>
          
          {/* Bottom line */}
          <div className="w-[500px] h-[3px] bg-white/90 mt-3 mx-auto"></div>
          
          {/* Subtitle */}
          <p className="text-white/40 tracking-wider mt-6 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
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

      </div>
    </div>
  );
}