"use client";
import { useEffect } from "react";

function parseFragmentToken(hash: string): string | null {
  if (!hash) return null;
  // remove leading '#'
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(h);
  return params.get("access_token");
}

export default function AuthSuccess() {
  useEffect(() => {
    const token = parseFragmentToken(window.location.hash);

    const allowedOrigin = process.env.NEXT_PUBLIC_SELF_URL || window.location.origin;

    if (token) {
      // If opened by a popup, post message back to opener securely
      if (window.opener) {
        try {
          window.opener.postMessage({ type: "oauth", token }, allowedOrigin);
        } catch {
          // ignore
        }
        // close the popup after a short delay to ensure message is delivered
        setTimeout(() => window.close(), 300);
        return;
      }

      // If not opened as a popup, save token to localStorage and navigate to root
      try {
        localStorage.setItem("token", token);
      } catch {
        // ignore storage errors
      }

      window.location.replace("/");
      return;
    }

    // No token found: still notify opener so it can react if needed
    if (window.opener) {
      try {
        window.opener.postMessage({ type: "oauth", token: null }, allowedOrigin);
      } catch {}
      setTimeout(() => window.close(), 300);
      return;
    }

    // Fallback UX
    // If there's no opener and no token, just redirect home
    window.location.replace("/");
  }, []);

  return <p>Logging you in...</p>;
}