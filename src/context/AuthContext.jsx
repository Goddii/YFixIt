import { useState } from "react";
import { api } from "../api";
import { AuthContext } from "./AuthContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

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
