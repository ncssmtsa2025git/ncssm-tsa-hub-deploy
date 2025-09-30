import { authService } from './auth';
import type { User } from '../../../website-frontend/app/models/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class UserService {
  private static instance: UserService;
  private constructor() {}
  public static getInstance(): UserService {
    if (!UserService.instance) UserService.instance = new UserService();
    return UserService.instance;
  }

  async listUsers(): Promise<User[]> {
    return authService.makeAuthenticatedRequest<{ users: User[] }>('/auth/users').then((r) => r.users || []);
  }

  async listWhitelist(): Promise<string[]> {
    return authService.makeAuthenticatedRequest<{ whitelist: string[] }>('/auth/whitelist').then((r) => r.whitelist || []);
  }

  async addWhitelist(email: string): Promise<string> {
    const token = authService.getToken();
    if (!token) throw new Error('No admin token');
    // API expects email as a query parameter (per server snippet: add_whitelist(email: str))
    const url = new URL(`${API_BASE_URL}/auth/whitelist`);
    url.searchParams.set('email', email);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'X-Admin-Token': token,
      },
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      let parsed: unknown = raw;
      try { parsed = raw ? JSON.parse(raw) : raw; } catch { }
      throw new Error(`Add whitelist failed: status=${res.status} body=${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
    }
    const body = await res.json().catch(() => ({}));
    return (body && body.added) || email;
  }

  async deleteWhitelist(email: string): Promise<string> {
    const token = authService.getToken();
    if (!token) throw new Error('No admin token');
    const url = new URL(`${API_BASE_URL}/auth/whitelist`);
    url.searchParams.set('email', email);
    const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'X-Admin-Token': token,
      },
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      let parsed: unknown = raw;
      try { parsed = raw ? JSON.parse(raw) : raw; } catch { }
      throw new Error(`Remove whitelist failed: status=${res.status} body=${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
    }
    const body = await res.json().catch(() => ({}));
    return (body && body.removed) || email;
  }
}

export const userService = UserService.getInstance();
