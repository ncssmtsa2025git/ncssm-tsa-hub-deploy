import { Team } from "../models/team";
import { CheckinCreate, Checkin } from "../models/checkin";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type Fetcher = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export async function fetchTeams(fetcher: Fetcher = fetch): Promise<Team[]> {
  const res = await fetcher(`${API_BASE}/teams`, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`Failed to fetch teams (${res.status})`);
  const data = await res.json();
  return data as Team[];
}

export async function getTeamCheckins(teamId: string, fetcher: Fetcher = fetch): Promise<Checkin[]> {
  const res = await fetcher(`${API_BASE}/teams/${teamId}/checkins`, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`Failed to fetch checkins (${res.status})`);
  const data = await res.json();
  return data as Checkin[];
}

export async function createCheckin(teamId: string, payload: CheckinCreate, fetcher: Fetcher = fetch): Promise<Checkin> {
  const res = await fetcher(`${API_BASE}/teams/${teamId}/checkins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create checkin (${res.status})`);
  const data = await res.json();
  return data as Checkin;
}

