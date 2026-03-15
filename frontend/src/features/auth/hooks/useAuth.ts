import { useState, useEffect } from "react";
import api from "./axiosConfig"; 

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ===== GET CURRENT USER =====
  useEffect(() => {
     api
      .get("/auth/me")
      .then((res : any) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ===== LOGIN EMAIL/PASSWORD =====
  const login = async ({ email, password }: any) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  // ===== REGISTER =====
  const register = async (payload: any) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Register failed");
    }
  };

  // ===== LOGOUT =====
  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (err: any) {
      throw err
    }
  };

  // ===== LOGIN WITH GOOGLE =====

  const loginWithGoogle = async () => {
    try {
      const popup = window.open(
        "https://localhost/api/auth/google",
        "_blank",
        "width=500,height=600"
      );
      if (!popup) throw new Error("Popup blocked");

      const userData: any = await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== "https://localhost/api") return;
          if (event.data.error) reject(event.data.error);
          else resolve(event.data.user);
          window.removeEventListener("message", handleMessage);
          popup.close();
        };
        window.addEventListener("message", handleMessage);
      });

      setUser(userData);
      return userData;
    } catch (err: any) {
     
      throw err;
    }
  };

  return { user, loading, login, register, logout, loginWithGoogle };
}