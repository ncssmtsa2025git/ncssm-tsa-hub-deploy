// Error alerts: Sentry reports browser crashes once NEXT_PUBLIC_SENTRY_DSN is set in Vercel.
// Loaded lazily, so visitors download nothing extra until it's turned on.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  import("@sentry/nextjs").then((Sentry) =>
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
      tracesSampleRate: 0,
    })
  );
}
