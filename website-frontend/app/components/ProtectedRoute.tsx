"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // App Router
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the stored token has been checked, or a refresh bounces to "/"
    if (initialized && user === null) {
      router.replace("/");
    }
  }, [initialized, user, router]);

  if (!initialized || user === null) {
    return <div className="p-4">Loading...</div>;
  }

  return <>{children}</>;
}