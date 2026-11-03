"use client"
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "../models/user";
import { startGoogleLogin } from "../services/auth";

type AuthContextType = {
  user: User | null;
  token: string | null;
  initialized: boolean;
  setTokenFromString: (token: string | null) => void;
  login: () => Promise<void>;
  logoutUser: () => Promise<void>;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Important: do NOT read localStorage during render (server vs client mismatch).
  // Initialize to null and hydrate from localStorage inside a client-only effect.
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Hydrate token+user from localStorage on client mount to avoid SSR/client mismatch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (t) {
          setToken(t);
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            if (res.ok) {
              const u = await res.json();
              if (mounted) setUser(u as unknown as User);
            } else if (res.status === 401) {
              // Expired/invalid token: drop it so the user sees a clean "Login" state
              localStorage.removeItem("token");
              if (mounted) setToken(null);
            }
          } catch {}
        }
      } catch {}
      if (mounted) setInitialized(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setTokenFromString = useCallback((t: string | null) => {
    try {
      if (t) {
        localStorage.setItem("token", t);
      } else {
        localStorage.removeItem("token");
      }
    } catch {}
    setToken(t);
    const payload = parseJwt(t);
    if (payload) {
      setUser({ id: payload.sub || null, email: payload.email || null, name: payload.name || null } as User);
    } else {
      setUser(null);
    }
  }, []);

  const login = async () => {
    // Navigates away to Google; /auth/success stores the token and returns here.
    await startGoogleLogin();
  };

  const logoutUser = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch {}
    setTokenFromString(null);
  };

  // Stable identity so effects depending on it don't refetch on every render
  const fetchWithAuth = useCallback(async (input: RequestInfo, init?: RequestInit) => {
    const tokenLocal = token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    const headers = new Headers(init?.headers || {});
    if (tokenLocal) headers.set("Authorization", `Bearer ${tokenLocal}`);
    const merged: RequestInit = { ...(init || {}), headers };
    return fetch(input, merged);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, initialized, setTokenFromString, login, logoutUser, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}