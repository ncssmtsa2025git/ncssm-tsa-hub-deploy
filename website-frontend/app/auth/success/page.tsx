"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  not_whitelisted:
    "Your email isn't on the TSA Hub whitelist yet. Ask a TSA officer to add you, then try logging in again.",
  access_denied: "Google sign-in was cancelled.",
  unverified_email: "Your Google account's email isn't verified. Sign in with your school account.",
  expired: "That sign-in took too long or didn't start here. Try logging in again.",
};

export default function AuthSuccess() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The API redirects here with #access_token=... or #error=...
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("access_token");
    const err = params.get("error");

    if (token) {
      try {
        localStorage.setItem("token", token);
      } catch {}
      let next = "/";
      try {
        const saved = sessionStorage.getItem("postLoginPath");
        sessionStorage.removeItem("postLoginPath");
        if (saved && saved.startsWith("/") && !saved.startsWith("//") && saved !== "/auth/success") next = saved;
      } catch {}
      window.location.replace(next);
      return;
    }

    if (err) {
      setError(ERROR_MESSAGES[err] ?? "Login failed. Please try again.");
      return;
    }

    window.location.replace("/");
  }, []);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md rounded-lg border bg-white p-6 shadow-sm text-center">
          <h1 className="text-lg font-semibold text-ink mb-2">Couldn&apos;t log you in</h1>
          <p className="text-ink-soft mb-4">{error}</p>
          <Link href="/" className="text-tsa hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return <p className="p-6">Logging you in...</p>;
}
