import { NavLink } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4 text-sm">
        {/* Brand */}
        <div className="sm:col-span-2">
          <h3 className="text-lg font-bold text-white">
            Aclivity<span className="text-[#FFC107]">Hub</span>
          </h3>
          <p className="mt-3 text-gray-400 max-w-md">
            The platform to discover activities, join communities,
            and create meaningful experiences.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-white font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer transition">
              Explore
            </li>
            <li className="hover:text-white cursor-pointer transition">
              Create an event
            </li>
            <li className="hover:text-white cursor-pointer transition">
              Communities
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-gray-400">
            <NavLink to={'terms-of-service'} className="hover:text-white cursor-pointer transition">
              Terms of Service
            </NavLink>
            <br />
            <NavLink to={'privacy-policy'} className="hover:text-white cursor-pointer transition">
              Privacy Policy
            </NavLink>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 py-6 border-t border-white/5">
        © {new Date().getFullYear()} Aclivity Hub — All rights reserved
      </div>
    </footer>
  );
}
