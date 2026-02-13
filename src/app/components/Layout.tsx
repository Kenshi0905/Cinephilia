import { Outlet } from "react-router";
import { GlassNavigation } from "./GlassNavigation";

export function Layout() {
  return (
    <div className="min-h-screen bg-black">
      <GlassNavigation />
      <Outlet />
    </div>
  );
}
