import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Globe } from "lucide-react";
import MobileMenu from "./MobileMenu";
import LoginModal from "../../features/auth/pages/LoginPage";
import RegisterModal from "../../features/auth/pages/RegisterPage";

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);


  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1">
            <span className="text-xl font-black text-white">Activity</span>
            <span className="text-xl font-black text-[#FFC107]">Hub</span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-6">
           
            

            {/* Auth buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLoginOpen(true)}
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Sign in
              </button>

              <button
                onClick={() => setRegisterOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-900
                                        bg-gradient-to-r from-[#FFC107] to-[#FFD54F]
                                        hover:scale-105 transition"
              >
                Join now
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="md:hidden text-gray-300 hover:text-white transition"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        onLoginOpen={() => setLoginOpen(true)}
        onRegisterOpen={() => setRegisterOpen(true)}
      />

      {/* Modals */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
}
