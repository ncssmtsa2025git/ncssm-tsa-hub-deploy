import { User } from "../models/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function startGoogleLogin(): Promise<Window | null> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
  });

  if (!res.ok) {
    throw new Error("Failed to start login");
  }

  const data = await res.json();
  return window.open(data.auth_url, "google_oauth", "width=600,height=700");
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