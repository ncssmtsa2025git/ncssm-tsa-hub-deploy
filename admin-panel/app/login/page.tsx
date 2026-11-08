"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';

const GOOGLE_ERRORS: Record<string, string> = {
  not_admin: "That Google account isn't on the admin list. Ask another officer to add you under Admins.",
  access_denied: 'Google sign-in was cancelled.',
  unverified_email: "That Google account's email isn't verified. Use your school account.",
  expired: 'That sign-in took too long. Try again.',
};

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, loginWithToken, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Back from Google: the API puts #admin_token=... or #error=... in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('admin_token');
    const err = params.get('error');
    if (!token && !err) return;
    window.history.replaceState(null, '', window.location.pathname);
    if (token) loginWithToken(token);
    else setError(GOOGLE_ERRORS[err!] ?? 'Google sign-in failed. Try again.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      window.location.assign(await authService.googleLoginUrl());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(password);
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-tsa-deep text-white">
      {/* The chapter at states, under the same navy scrim the website uses on its page banners */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/sign-in.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_30%]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-tsa-deep/90 sm:bg-transparent sm:bg-[linear-gradient(90deg,oklch(0.2_0.09_264/0.97)_0%,oklch(0.22_0.09_264/0.9)_40%,oklch(0.26_0.1_264/0.35)_100%)]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ncssm_tsa_logo.jpg" alt="" className="h-10 w-10 rounded-full ring-2 ring-white/15" />
          <span className="display text-2xl">NCSSM Durham</span>
        </div>

        <section className="my-auto w-full max-w-md py-16">
          <h1 className="display whitespace-nowrap text-5xl sm:text-6xl">Officer sign-in</h1>
          <p className="mt-4 max-w-sm text-white/75">Teams, events and everything on the chapter website.</p>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleLoading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 font-medium text-ink transition-colors hover:bg-paper-2 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
            </svg>
            {googleLoading ? 'Opening Google…' : 'Sign in with Google'}
          </button>
          <p className="mt-3 text-sm text-white/65">Use your NCSSM account. It has to be on the admin list.</p>

          {error && (
            <p role="alert" className="mt-6 rounded-md bg-white px-4 py-3 text-sm text-signal">
              {error}
            </p>
          )}

          {!showPassword ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setShowPassword(true);
              }}
              className="mt-8 text-sm text-white/65 underline underline-offset-4 hover:text-white"
            >
              Use the chapter password instead
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 border-t border-white/15 pt-6">
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
                Chapter password
              </label>
              <div className="flex gap-2">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 rounded-md border border-white/30 px-4 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </form>
          )}
        </section>

        <NextDate />
      </div>
    </main>
  );
}

type KeyDate = { date: string; end_date?: string | null; end?: string | null; event: string; location?: string | null };

const md = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { timeZone: 'America/New_York', ...opts });

/** The chapter's next key date, straight from the public site, so the door already shows what's coming. */
function NextDate() {
  const [next, setNext] = useState<KeyDate | null>(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/content/dates`)
      .then((r) => (r.ok ? r.json() : []))
      .then((dates: KeyDate[]) => setNext(dates.find((d) => (d.end ?? d.end_date ?? d.date) >= today) ?? null))
      .catch(() => {});
  }, []);

  if (!next) return null;
  const end = next.end ?? next.end_date;
  const when = end
    ? `${md(next.date, { month: 'short', day: 'numeric' })}–${md(end, next.date.slice(0, 7) === end.slice(0, 7) ? { day: 'numeric' } : { month: 'short', day: 'numeric' })}`
    : md(next.date, { month: 'short', day: 'numeric' });

  return (
    <p className="text-sm text-white/65">
      Next up <span className="ml-2 font-semibold text-white tabular">{when}</span>
      <span className="ml-2 text-white">{next.event}</span>
      {next.location && <span className="ml-2">{next.location}</span>}
    </p>
  );
}
