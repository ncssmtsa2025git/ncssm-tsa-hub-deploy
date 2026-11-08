'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {authService} from '../services/auth';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<void>;
  loginWithToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = authService.getToken();
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (password: string) => {
    const adminToken = await authService.login(password);
    authService.saveToken(adminToken);
    setToken(adminToken);
  };

  // Google sign-in: the API hands the admin token back to /login in the URL fragment
  const loginWithToken = (adminToken: string) => {
    authService.saveToken(adminToken);
    setToken(authService.getToken());
  };

  const logout = () => {
    authService.removeToken();
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}