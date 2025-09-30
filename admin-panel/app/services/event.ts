import { authService } from './auth';
import type { Event } from '../../../website-frontend/app/models/event';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function stripUndefined<T extends Record<string, unknown>>(obj: Partial<T>): Partial<T> {
  if (!obj) return {} as Partial<T>;
  const tmp: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) tmp[k] = v;
  });
  return tmp as Partial<T>;
}

function slugify(input?: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

class EventService {
  private static instance: EventService;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  async listEvents(): Promise<Event[]> {
    const res = await fetch(`${API_BASE_URL}/events`);
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`);
    return res.json();
  }

  async getEvent(id: string): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch event: ${res.statusText}`);
    return res.json();
  }

  async createEvent(payload: Partial<Event>): Promise<Event> {
    const token = authService.getToken();
    const clean = stripUndefined(payload);
    // ensure id is present - backend Event model requires id in the body
    if (!clean.id && typeof clean.title === 'string' && clean.title.trim()) {
      clean.id = slugify(clean.title as string);
    }
    console.debug('[eventService] POST /events payload:', clean);
    const res = await fetch(`${API_BASE_URL}/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
      body: JSON.stringify(clean),
    });

    if (!res.ok) {
      const rawText = await res.text().catch(() => '');
      let parsed: unknown = rawText;
      try {
        parsed = rawText ? JSON.parse(rawText) : rawText;
      } catch {
        // leave parsed as rawText
      }
      throw new Error(
        `Create failed: status=${res.status} ${res.statusText} body=${
          typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
        }`
      );
    }
    return res.json();
  }

  async updateEvent(id: string, payload: Partial<Event>): Promise<Event> {
    const token = authService.getToken();
    const clean = stripUndefined(payload);
    // backend expects id field in the Event body; ensure it's present
    if (!clean.id) {
      clean.id = id;
    }
    console.debug(`[eventService] PUT /events/${id} payload:`, clean);
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
      body: JSON.stringify(clean),
    });

    if (!res.ok) {
      const rawText = await res.text().catch(() => '');
      let parsed: unknown = rawText;
      try {
        parsed = rawText ? JSON.parse(rawText) : rawText;
      } catch {
        // leave parsed as rawText
      }
      throw new Error(
        `Update failed: status=${res.status} ${res.statusText} body=${
          typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
        }`
      );
    }
    return res.json();
  }

  async deleteEvent(id: string): Promise<void> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Delete failed: ${res.statusText}`);
    }
  }
}

export const eventService = EventService.getInstance();
