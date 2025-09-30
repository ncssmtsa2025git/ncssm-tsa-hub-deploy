"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // App Router
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/");
    }
  }, [user, router]);

  if (user === null) {
    return <div className="p-4">Loading...</div>;
  }

  return <>{children}</>;
}