import { Event } from "../models/event";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${API_BASE_URL}/events/`);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  const data = await res.json();
  return data as Event[];
}
