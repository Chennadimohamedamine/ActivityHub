import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <div className="max-w-md w-full text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h1 className="text-7xl font-black text-[#FFC107]">404</h1>
        <h2 className="mt-2 text-2xl font-bold text-white">Page not found</h2>
        <p className="mt-3 text-gray-400 text-sm">
          The page you’re looking for doesn’t exist.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-8 inline-flex items-center gap-2
          px-6 py-3 rounded-xl
          border border-white/20 text-gray-300
          hover:text-white hover:border-white/40 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    </div>
  );
}
