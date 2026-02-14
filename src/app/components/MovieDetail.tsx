import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Star, StarHalf, Calendar, Clock } from "lucide-react";
import { useLetterboxdMovies } from "../data/useLetterboxdMovies";

export function MovieDetail() {
  const { id } = useParams();
  const { movies } = useLetterboxdMovies();
  const decodedId = id ? decodeURIComponent(id) : id;
  const movie = movies.find((m) => m.id === decodedId);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Film not found</p>
      </div>
    );
  }

  const watchedDateObj = movie.watchedDate ? new Date(movie.watchedDate) : null;
  const watchedDateLabel =
    watchedDateObj && !Number.isNaN(watchedDateObj.getTime())
      ? watchedDateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* Left Panel - Image (Fixed on Desktop) */}
      <motion.div
        className="w-full md:w-[40%] lg:w-[35%] h-[50vh] md:h-screen md:fixed top-0 left-0 z-0 overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent z-10 opacity-80 md:opacity-50" />
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {/* Mobile-only backdrop gradient for text readability if overlap happens */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent md:hidden" />
      </motion.div>

      {/* Right Panel - Content (Scrollable) */}
      <div className="flex-1 md:ml-[40%] lg:ml-[35%] relative z-10">
        <div className="min-h-screen flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 bg-gradient-to-b from-transparent to-black md:bg-none">

          <div className="max-w-2xl">
            {/* Back Button */}
            <Link to="/" className="inline-block mb-8 md:mb-12">
              <motion.button
                className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors duration-300 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="tracking-widest uppercase text-[10px] font-medium">Back to Archive</span>
              </motion.button>
            </Link>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-white/95 text-5xl md:text-6xl lg:text-7xl leading-[0.9]"
                  style={{ fontFamily: 'Bebas Neue, sans-serif', fontWeight: 400, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  {movie.title}
                </h1>
                <div className="flex items-center gap-3 text-white/40 text-sm tracking-wide font-light uppercase">
                  <span>{movie.year}</span>
                  {movie.director && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>{movie.director}</span>
                    </>
                  )}
                  {movie.runtime > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>{movie.runtime}m</span>
                    </>
                  )}
                </div>
              </div>

              {/* Rating & Action Bar */}
              <div className="flex flex-wrap items-center gap-6 py-6 border-y border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => {
                      const isFull = i < Math.floor(movie.rating);
                      const isHalf = !isFull && i < movie.rating;
                      return (
                        <span key={i}>
                          {isHalf ? (
                            <StarHalf className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <Star className={`w-5 h-5 ${isFull ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} />
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-white/90 font-medium text-2xl leading-none pt-1">{movie.rating.toFixed(1)}</span>
                </div>

                {watchedDateLabel && (
                  <>
                    <div className="w-px h-10 bg-white/10 hidden md:block" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">Watched On</span>
                      <span className="text-white/70 text-sm">{watchedDateLabel}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Review / Notes */}
              {movie.review && (
                <div>
                  <h3 className="text-white/30 text-[10px] uppercase tracking-widest mb-4 font-medium">Notes</h3>
                  <div className="text-white/80 leading-relaxed font-light text-lg opacity-90 space-y-4">
                    {movie.review.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Genres Chips */}
              {movie.genre.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-4">
                  {movie.genre.map(g => (
                    <span key={g} className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-white/5 text-white/50 border border-white/5">
                      {g}
                    </span>
                  ))}
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}