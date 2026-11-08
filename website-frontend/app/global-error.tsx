"use client";
import { useEffect } from "react";

// Last-resort error screen (replaces the whole layout); also reports the crash to Sentry when it's on.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem" }}>The page hit an error. Try again, or come back in a minute.</p>
        <button onClick={reset} style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
