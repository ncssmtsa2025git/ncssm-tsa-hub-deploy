import { authService } from './auth';
import type { Team } from '../../../website-frontend/app/models/team';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class TeamService {
  private static instance: TeamService;
  private constructor() {}
  public static getInstance(): TeamService {
    if (!TeamService.instance) TeamService.instance = new TeamService();
    return TeamService.instance;
  }

  async listTeams(): Promise<Team[]> {
    const res = await fetch(`${API_BASE_URL}/teams`);
    if (!res.ok) throw new Error(`Failed to fetch teams: ${res.statusText}`);
    return res.json();
  }

  async getTeam(id: string): Promise<Team> {
    const res = await fetch(`${API_BASE_URL}/teams/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch team: ${res.statusText}`);
    return res.json();
  }

  async createTeam(payload: Partial<Team>): Promise<Team> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE_URL}/teams/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      throw new Error(raw || `Create team failed: ${res.statusText}`);
    }
    return res.json();
  }

  async updateTeam(id: string, payload: Partial<Team>): Promise<Team> {
    const token = authService.getToken();
    // ensure id present in body per backend expectations
    const body = { ...(payload as Record<string, unknown>), id };
    const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      throw new Error(raw || `Update team failed: ${res.statusText}`);
    }
    return res.json();
  }

  async deleteTeam(id: string): Promise<void> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      throw new Error(raw || `Delete team failed: ${res.statusText}`);
    }
  }
}

export const teamService = TeamService.getInstance();
