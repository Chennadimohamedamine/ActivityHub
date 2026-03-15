import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoginOpen: () => void;     // trigger for LoginModal
  onRegisterOpen: () => void;  // trigger for RegisterModal
};

export default function MobileMenu({
  open,
  onClose,
  onLoginOpen,
  onRegisterOpen,
}: Props) {
  if (!open) return null;

  const navItems = [
    { label: "Explore", path: "/explore" },
    { label: "Events", path: "/events" },
    { label: "About", path: "/about" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 h-full w-72 bg-slate-950
        border-l border-white/10 p-6 flex flex-col
        animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-lg font-bold text-white">
            Activity<span className="text-[#FFC107]">Hub</span>
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-5 text-gray-300">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `transition ${isActive ? "text-white font-semibold" : "hover:text-white"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <button
            onClick={() => {
              onLoginOpen();
              onClose();
            }}
            className="text-center py-2 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition"
          >
            Sign in
          </button>

          <button
            onClick={() => {
              onRegisterOpen();
              onClose();
            }}
            className="text-center py-2 rounded-lg font-semibold text-slate-900 bg-gradient-to-r from-[#FFC107] to-[#FFD54F] hover:scale-[1.02] transition"
          >
            Join now
          </button>
        </div>
      </div>
    </div>
  );
}
