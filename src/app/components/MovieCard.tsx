import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import type { Movie } from "../data/movies";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movie/${encodeURIComponent(movie.id)}`} className="pointer-events-auto">
      <motion.div
        className="group relative aspect-[2/3] overflow-hidden cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.03, opacity: 1 }}
      >
        {/* Poster Image */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />
        
        {/* Glass Overlay on Hover */}
        <motion.div
          className="absolute inset-0 glass-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6"
          initial={false}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(movie.rating)
                        ? 'fill-white/90 text-white/90'
                        : i < movie.rating
                        ? 'fill-white/50 text-white/50'
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/70 text-xs tracking-wider">
                {movie.rating.toFixed(1)}
              </span>
            </div>
            <h3 className="text-white/95 tracking-wide text-lg" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
              {movie.title}
            </h3>
            <p className="text-white/60 text-xs tracking-wider uppercase" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              {movie.director} • {movie.year}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}