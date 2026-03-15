import { useState } from "react";
import { Mail, Lock, ArrowRight, X, LogIn, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await login({ email, password, remember });
      navigate("/dashboard");
      onClose();
    } catch (error: any) {
      setErrorMsg(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md xl:max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 xl:p-10 shadow-2xl shadow-black/50 animate-slide-in-up">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl xl:text-3xl font-black text-white mb-1">
            Welcome!
          </h2>
          <p className="text-gray-400 text-sm">Sign in to continue</p>
        </div>

        {errorMsg && (
          <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>

            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">

      
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="email"
              placeholder=".......@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-[#FFC107] focus:bg-white/10 transition-all"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-[#FFC107] focus:bg-white/10 transition-all"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#FFC107] focus:ring-[#FFC107]"
            />

            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
              Remember me
            </label>
          </div>

        
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3 rounded-xl font-bold text-sm text-slate-900 overflow-hidden bg-gradient-to-r from-[#FFC107] to-[#FFD54F] hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight />}
          </button>
        </form>

      
        <div className="flex items-center my-6 text-gray-400 text-sm">
          <hr className="flex-grow border-t border-white/10" />
          <span className="mx-2">or continue with</span>
          <hr className="flex-grow border-t border-white/10" />
        </div>

        <button
          onClick={() =>
            (window.location.href = "https://localhost/api/auth/google/login")
          }
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>

      </div>
    </div>
  );
}