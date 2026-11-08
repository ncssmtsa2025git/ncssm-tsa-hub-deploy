import { authService } from './auth';
import { resizeImage } from '../lib/resize';

export type Kind = 'dates' | 'officers' | 'resources' | 'gallery';
export type Item = { id: string } & Record<string, string | null>;
export type Announcement = { message: string; link: string | null; active: boolean };

// Admin requests carry X-Admin-Token, so the API never serves them from the CDN cache.
const req = <T>(path: string, method = 'GET', body?: unknown) =>
  authService.makeAuthenticatedRequest<T>(path, {
    method,
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });

export const contentService = {
  list: (kind: Kind) => req<Item[]>(`/content/${kind}`),
  create: (kind: Kind, data: Record<string, unknown>) => req<Item>(`/content/${kind}`, 'POST', data),
  update: (kind: Kind, id: string, data: Record<string, unknown>) => req<Item>(`/content/${kind}/${id}`, 'PUT', data),
  remove: (kind: Kind, id: string) => req<{ deleted: string }>(`/content/${kind}/${id}`, 'DELETE'),
  reorder: (kind: Kind, ids: string[]) => req<Item[]>(`/content/${kind}/order`, 'PUT', { ids }),

  getAnnouncement: () => req<Announcement>('/content/announcement'),
  setAnnouncement: (a: Announcement) => req<Announcement>('/content/announcement', 'PUT', a),

  listAdmins: () => req<{ admins: string[]; me: string | null }>('/auth/admins'),
  addAdmin: (email: string) => req<{ added: string }>('/auth/admins', 'POST', { email }),
  removeAdmin: (email: string) => req<{ removed: string }>(`/auth/admins?email=${encodeURIComponent(email)}`, 'DELETE'),

  /** Resize in the browser, upload to Supabase Storage via the API, return the public URL. */
  async uploadPhoto(file: File, folder: 'officers' | 'gallery'): Promise<string> {
    const blob = await resizeImage(file, folder === 'officers' ? 1200 : 2000);
    const form = new FormData();
    form.append('folder', folder);
    form.append('file', blob, 'photo.jpg');
    const { url } = await authService.makeAuthenticatedRequest<{ url: string }>('/content/upload', { method: 'POST', body: form });
    return url;
  },
};

// Photos already on the website (e.g. /officers/david.jpg) are previewed from the live site.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ncssm-tsa-hub.vercel.app';
export const previewUrl = (src: string) => (src.startsWith('/') ? SITE_URL + src : src);
