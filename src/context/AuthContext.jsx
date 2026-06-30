import { useEffect, useState } from "react";
import { api } from "../api";
import { AuthContext } from "./AuthContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true)


  // on first mount checks if a token exist in localstorage
  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) setLoading(false)
          return;
      }

      try {
        const data = await api.me()
        if (mounted) setUser(data.user);
      } catch (err) {
        //token invalid or expired
        localStorage.removeItem("token")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    restoreSession()

    return () => {
      mounted = false;
    };
  }, [] 
  )

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

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
