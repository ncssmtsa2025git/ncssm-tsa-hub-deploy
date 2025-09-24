import { User } from "../models/user";


export const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function startGoogleLogin(): Promise<Window | null> {
  const res = await fetch(`${BACKEND}/auth/login`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to start login");
  }

  const data = await res.json();
  return window.open(data.auth_url, "google_oauth", "width=600,height=700");
}

export async function fetchUser(): Promise<User | null> {
  const res = await fetch(`${BACKEND}/auth/me`, {
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const user = await res.json();
  
  return user as User;
}

export async function logout(): Promise<void> {
  await fetch(`${BACKEND}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}