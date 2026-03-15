import { useState, useEffect } from "react";
import { User, Mail, Lock, ArrowRight, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
}

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // auto-close after 4s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        backgroundColor: type === "success" ? "#4ade80" : "#f87171",
        color: "white",
        padding: "12px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {message}
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ×
      </button>
    </div>
  );
};

export default function RegisterModal({ open, onClose }: RegisterModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { register } = useAuth();
  const inputStyle =
    "w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FFC107] focus:bg-white/10 focus:shadow-lg focus:shadow-[#FFC107]/20 transition-all duration-300";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

try {
  await register({ firstName, lastName, username, email, password });

  setNotification({ message: "Account created successfully", type: "success" });

 
  setFirstName("");
  setLastName("");
  setUsername("");
  setEmail("");
  setPassword("");

  setTimeout(() => {
    onClose();
  }, 1500);  
} catch (error: any) {
  setNotification({
    message: error.message || "Something went wrong",
    type: "error",
  });
} finally {
  setLoading(false);
}
  };

  if (!open) return null;

  return (
    <>
     
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <div className="relative w-full max-w-md xl:max-w-lg mx-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>

         
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white mb-1">
              Create your account
            </h2>
            <p className="text-gray-400 text-sm">
              Join thousands of members and start exploring
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputStyle}
                minLength={3}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 rounded-xl font-bold text-sm text-slate-900 overflow-hidden bg-gradient-to-r from-[#FFC107] to-[#FFD54F] hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Register"}{" "}
              {!loading && <ArrowRight />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4 text-gray-400 text-sm">
            <hr className="flex-grow border-t border-white/10" />
            <span className="mx-2">or continue with Google</span>
            <hr className="flex-grow border-t border-white/10" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={() =>
              (window.location.href = "https://localhost/api/auth/google/login")
            }
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  );
}
