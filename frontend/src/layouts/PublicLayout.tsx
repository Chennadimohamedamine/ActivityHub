import { Outlet } from "react-router-dom";
import PublicNavbar from "./public/NavBar";
import PublicFooter from "./public/Footer";
import PublicHero from "./public/Hero";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white">
      <PublicNavbar />

      <PublicHero />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <Outlet />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}


