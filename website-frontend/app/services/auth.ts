import { User } from "../models/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Full-page redirect instead of a popup: Safari/iOS block popups opened after an
// await, and Google's Cross-Origin-Opener-Policy cuts the popup off from its opener.
export async function startGoogleLogin(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/login`);

  if (!res.ok) {
    throw new Error("Failed to start login");
  }

  const data = await res.json();
  try {
    sessionStorage.setItem("postLoginPath", window.location.pathname);
  } catch {}
  window.location.assign(data.auth_url);
}

export async function fetchUser(): Promise<User | null> {
  // kept for backward compatibility but will be replaced by a fetcher-aware version
  const res = await fetch(`${API_BASE_URL}/auth/me`);
  if (!res.ok) return null;
  const user = await res.json();
  return user as User;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST" });
}