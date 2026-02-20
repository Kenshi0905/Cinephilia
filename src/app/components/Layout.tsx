import { Outlet } from "react-router-dom";
import { GlassNavigation } from "./GlassNavigation";
import { useLetterboxdMovies } from "../data/useLetterboxdMovies";

export function Layout() {
  const moviesState = useLetterboxdMovies();

  return (
    <div className="min-h-screen bg-black">
      <GlassNavigation />
      <Outlet context={moviesState} />
    </div>
  );
}
