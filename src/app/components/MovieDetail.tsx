import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Star, Calendar, Clock } from "lucide-react";
import { movies } from "../data/movies";

export function MovieDetail() {
  const { id } = useParams();
  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Film not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black z-10" />
        <img
          src={movie.backdrop}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Content */}
      <div className="relative pt-32 pb-24 px-8 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Back Button */}
          <Link to="/">
            <motion.button
              className="flex items-center gap-3 text-white/60 hover:text-white/90 transition-colors duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="tracking-wider uppercase text-xs">Back to Archive</span>
            </motion.button>
          </Link>

          <div className="grid md:grid-cols-[300px,1fr] gap-12">
            {/* Poster */}
            <motion.div
              className="aspect-[2/3] overflow-hidden rounded-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Title & Year */}
              <div className="space-y-3">
                <h1 className="text-white/95 text-4xl md:text-5xl lg:text-6xl" style={{ fontFamily: 'Bebas Neue, sans-serif', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {movie.title}
                </h1>
                <p className="text-white/50 tracking-wider uppercase text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  {movie.director} • {movie.year}
                </p>
              </div>

              {/* Rating */}
              <div className="glass-panel p-6 space-y-3">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(movie.rating)
                          ? 'fill-white/90 text-white/90'
                          : i < movie.rating
                          ? 'fill-white/50 text-white/50'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/70 text-2xl">
                  {movie.rating.toFixed(1)} / 5.0
                </p>
              </div>

              {/* Metadata */}
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center gap-3 text-white/60">
                  <Calendar className="w-5 h-5" />
                  <span className="tracking-wide">
                    Watched {new Date(movie.watchedDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Clock className="w-5 h-5" />
                  <span className="tracking-wide">{movie.runtime} minutes</span>
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs tracking-wider uppercase"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Review */}
              <div className="glass-panel p-8 space-y-4">
                <h2 className="text-white/80 tracking-wider uppercase text-sm">
                  Notes
                </h2>
                <p className="text-white/70 leading-relaxed tracking-wide">
                  {movie.review}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}