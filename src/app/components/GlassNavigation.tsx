import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Film, User, Search } from "lucide-react";
import { useLetterboxdMovies } from "../data/useLetterboxdMovies";

export function GlassNavigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { movies } = useLetterboxdMovies();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMovies = (normalizedQuery
    ? movies.filter((movie) =>
        movie.title.toLowerCase().includes(normalizedQuery)
      )
    : movies
  ).slice(0, 8);

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full glass-nav">
      <div className="flex items-center gap-12 relative">
        <Link 
          to="/" 
          className={`flex items-center gap-2 transition-all duration-500 ${
            isHome ? 'text-white/90' : 'text-white/40 hover:text-white/70'
          }`}
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          <Film className="w-5 h-5" />
          <span className="tracking-wider uppercase text-xs">Archive</span>
        </Link>
        <div className="w-px h-6 bg-white/10" />
        <button 
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-all duration-500"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          <User className="w-5 h-5" />
          <span className="tracking-wider uppercase text-xs">Profile</span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Search dropdown trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-all duration-500"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            <Search className="w-5 h-5" />
            <span className="tracking-wider uppercase text-xs">Search</span>
          </button>

          {isSearchOpen && (
            <div className="absolute right-0 mt-4 w-80 rounded-3xl glass-nav px-4 py-3 shadow-xl border border-white/10">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search watched films"
                className="w-full bg-transparent border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
              />

              <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
                {filteredMovies.length === 0 ? (
                  <p className="text-xs text-white/40 px-1 py-2">No matches found.</p>
                ) : (
                  filteredMovies.map((movie) => (
                    <Link
                      key={movie.id}
                        to={`/movie/${encodeURIComponent(movie.id)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-white/5 transition-colors"
                    >
                      {movie.poster && (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-8 h-12 object-cover rounded-sm flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-white/90 truncate" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                          {movie.title}
                        </p>
                        {movie.year > 0 && (
                          <p className="text-[10px] text-white/40 mt-0.5">{movie.year}</p>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}