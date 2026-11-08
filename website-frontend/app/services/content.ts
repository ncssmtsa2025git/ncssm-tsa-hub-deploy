// Site content officers edit in the admin panel. The API caches these on Vercel's CDN for about a minute.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Officer = { id: string; name: string; role: string; email: string; photo: string | null };
export type Resource = { id: string; title: string; description: string; href: string; category: "NCSSM" | "TSA" | "Chapter" };
export type GalleryPhoto = { id: string; src: string; title: string; album: string };
export type Announcement = { message: string; link: string | null; active: boolean };

export async function getContent<T>(kind: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/content/${kind}`, init);
  if (!res.ok) throw new Error(`Failed to load ${kind}: ${res.status}`);
  return res.json();
}

/** Gallery photos, newest album first; untitled photos are captioned with their album. */
export async function getGallery(init?: RequestInit): Promise<GalleryPhoto[]> {
  const rows = await getContent<(Omit<GalleryPhoto, "title"> & { title: string | null })[]>("gallery", init);
  return rows.map((p) => ({ ...p, title: p.title || p.album }));
}
