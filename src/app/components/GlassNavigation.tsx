import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Film, User, Search, X } from "lucide-react";
import { useLetterboxdMovies } from "../data/useLetterboxdMovies";
import type { Movie } from "../data/movies";
import { getOptimizedPosterSrcSet, getOptimizedPosterUrl } from "../data/posterUrl";

export function GlassNavigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { movies } = useLetterboxdMovies();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search when location changes (navigating to a movie)
  useEffect(() => {
    setIsSearchOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  }, [location.pathname]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Smart search logic
  const filteredMovies = useMemo(() => {
    if (!query.trim()) return movies.slice(0, 8); // Default: recent movies

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    return movies
      .map((movie) => {
        let score = 0;
        const title = movie.title.toLowerCase();

        // Scoring
        if (title === query.toLowerCase()) score += 100; // Exact match
        else if (title.startsWith(query.toLowerCase())) score += 50; // Starts with
        else if (title.includes(query.toLowerCase())) score += 20; // Contains

        // Multi-term matching
        const matchesAllTerms = terms.every(term => title.includes(term));
        if (matchesAllTerms) score += 10;

        return { movie, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.movie)
      .slice(0, 8);
  }, [movies, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredMovies.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredMovies.length) % filteredMovies.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredMovies[selectedIndex]) {
        navigate(`/movie/${encodeURIComponent(filteredMovies[selectedIndex].id)}`);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  // Custom navigation hook isn't available easily here without import, 
  // so we'll add an imperative navigation handler if user preses Enter.
  // We can just use window.location or import useNavigate. 
  // `useNavigate` is from `react-router`.
  // Let's add it cleanly.

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-[100] rounded-full glass-nav transition-all duration-500 ease-out border border-white/10 ${isHome
          ? "top-8 px-8 py-4"
          : "top-6 px-6 py-3 bg-[#050505]/80 backdrop-blur-xl scale-90"
        }`}
    >
      <div className={`flex items-center transition-all duration-500 ${isHome ? "gap-12" : "gap-6"}`} ref={searchRef}>
        <Link
          to="/"
          className={`flex items-center gap-2 transition-all duration-500 ${isHome ? 'text-white/90' : 'text-white/60 hover:text-white'
            }`}
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          <Film className={`transition-all duration-500 ${isHome ? "w-5 h-5" : "w-4 h-4"}`} />
          <span className={`tracking-wider uppercase transition-all duration-500 ${isHome ? "text-xs" : "text-[10px]"}`}>
            Archive
          </span>
        </Link>

        <div className={`w-px bg-white/10 transition-all duration-500 ${isHome ? "h-6" : "h-4"}`} />

        <button
          className={`flex items-center gap-2 transition-all duration-500 ${isHome ? 'text-white/40 hover:text-white/70' : 'text-white/40 hover:text-white/70'
            }`}
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          <User className={`transition-all duration-500 ${isHome ? "w-5 h-5" : "w-4 h-4"}`} />
          <span className={`tracking-wider uppercase transition-all duration-500 ${isHome ? "text-xs" : "text-[10px]"}`}>
            Profile
          </span>
        </button>

        <div className={`w-px bg-white/10 transition-all duration-500 ${isHome ? "h-6" : "h-4"}`} />

        {/* Search Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            className={`flex items-center gap-2 transition-all duration-500 ${isSearchOpen || !isHome ? 'text-white/90' : 'text-white/40 hover:text-white/70'
              }`}
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            {isSearchOpen ? (
              <X className={`transition-all duration-500 ${isHome ? "w-5 h-5" : "w-4 h-4"}`} />
            ) : (
              <Search className={`transition-all duration-500 ${isHome ? "w-5 h-5" : "w-4 h-4"}`} />
            )}
            <span className={`tracking-wider uppercase transition-all duration-500 ${isHome ? "text-xs" : "text-[10px]"}`}>
              {isSearchOpen ? "Close" : "Search"}
            </span>
          </button>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full right-0 mt-6 w-[360px] rounded-2xl bg-[#050505]/95 backdrop-blur-2xl overflow-hidden shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-white/5">
              <div className="p-3 border-b border-white/5">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0); // Reset selection on type
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedIndex >= 0 && filteredMovies[selectedIndex]) {
                      // We can't easily use useNavigate without changing imports/setup slightly 
                      // but we can just click the link element if we had a ref array, or...
                      // simpler: just link logic.
                      // For this iteration, let's just let the user click or tab.
                      // Actually, let's allow Enter to work by finding the ID and navigating?
                      // We'll skip complex Enter logic for this step to minimize risk, 
                      // or rely on the user tabbing.
                      // WAIT: I can just import useNavigate.
                    }
                    handleKeyDown(e);
                  }}
                  placeholder="Find a film..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/15 transition-all"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
                />
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {filteredMovies.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-white/30 text-xs tracking-wider uppercase">No films found</p>
                  </div>
                ) : (
                  <div className="px-2 pb-2 space-y-1">
                    {filteredMovies.map((movie, index) => (
                      <Link
                        key={movie.id}
                        to={`/movie/${encodeURIComponent(movie.id)}`}
                        className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${index === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                        onClick={() => setIsSearchOpen(false)}
                      >
                        {/* Poster - Smaller as requested */}
                        <div className="w-10 h-14 bg-white/5 rounded-md overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-all relative">
                          {movie.poster ? (
                            <img
                              src={getOptimizedPosterUrl(movie.poster, "tiny")}
                              srcSet={getOptimizedPosterSrcSet(movie.poster, [80, 120, 160])}
                              sizes="40px"
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10">
                              <Film className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm text-white/90 font-medium truncate group-hover:text-white transition-colors leading-tight">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {movie.year > 0 && (
                              <span className="text-[10px] text-white/40 font-mono">
                                {movie.year}
                              </span>
                            )}
                            {movie.rating > 0 && (
                              <div className="flex items-center gap-0.5">
                                <span className="text-[10px] text-white/40">•</span>
                                <span className="text-[10px] text-yellow-500/80">★</span>
                                <span className="text-[10px] text-white/40">{movie.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}