import { useEffect, useState } from "react";
import { api } from "../api";
import { AuthContext } from "./AuthContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await api.me();
        if (mounted) setUser(data.user);
      } catch (err) {
        if (mounted) setUser(null);
        localStorage.removeItem("token");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(credentials) {
    const data = await api.login(credentials);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  }

  async function register(body) {
    const data = await api.register(body);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
