import { authService } from './auth';
import type { Checkin } from '../../../website-frontend/app/models/checkin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class CheckinService {
  private static instance: CheckinService;
  private constructor() {}
  public static getInstance(): CheckinService {
    if (!CheckinService.instance) CheckinService.instance = new CheckinService();
    return CheckinService.instance;
  }

  async listTeamCheckins(teamId: string): Promise<Checkin[]> {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/checkins`);
    if (!res.ok) throw new Error(`Failed to fetch checkins: ${res.statusText}`);
    return res.json();
  }

  async deleteCheckin(checkinId: string): Promise<void> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE_URL}/checkins/${checkinId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      throw new Error(raw || `Delete checkin failed: ${res.statusText}`);
    }
  }
}

export const checkinService = CheckinService.getInstance();
