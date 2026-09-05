import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("explorebd_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("explorebd_token"))
      .finally(() => setLoading(false));
  }, []);

  function loginSuccess(token, userData) {
    localStorage.setItem("explorebd_token", token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("explorebd_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
