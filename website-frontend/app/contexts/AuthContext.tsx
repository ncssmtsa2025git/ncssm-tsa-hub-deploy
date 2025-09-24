"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../models/user";
import { fetchUser, logout, startGoogleLogin } from "../services/auth";

type AuthContextType = {
  user: User | null;
  refreshUser: () => Promise<void>;
  login: () => Promise<void>;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const u = await fetchUser();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  const login = async () => {
    const popup = await startGoogleLogin();
    if (!popup) return;

    // Wait until popup closes
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        refreshUser();
      }
    }, 500);
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, refreshUser, login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}