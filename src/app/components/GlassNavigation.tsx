import { Link, useLocation } from "react-router";
import { Film, User } from "lucide-react";

export function GlassNavigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full glass-nav">
      <div className="flex items-center gap-12">
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
      </div>
    </nav>
  );
}