"use client";

import { useEffect, useState } from 'react';
import ContentEditor, { type EditorConfig } from './content-editor';
import { contentService, type Announcement, type Item } from '../../services/content';

const LIVE_NOTE = 'Changes show on the website within about a minute.';

const fmt = (iso: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const DATES: EditorConfig = {
  kind: 'dates',
  title: 'Key dates',
  description: `Competitions and deadlines on the home page and member portal, soonest first. Past dates drop off the home page automatically. ${LIVE_NOTE}`,
  noun: 'date',
  sortable: false,
  fields: [
    { name: 'event', label: 'What', required: true, placeholder: 'e.g., Eastern Regionals' },
    { name: 'type', label: 'Type', type: 'select', options: ['Competition', 'Deadline', 'Meeting', 'Other'], required: true, help: 'Deadlines are marked in red on the site.' },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'end', label: 'End date', type: 'date', help: 'Only for multi-day events.' },
    { name: 'location', label: 'Where', placeholder: 'e.g., ECU, Greenville' },
  ],
  primary: (i) => i.event ?? '',
  secondary: (i) =>
    [fmt(i.date) + (i.end ? ` – ${fmt(i.end)}` : ''), i.location, i.type === 'Deadline' ? 'Deadline' : null].filter(Boolean).join(' · '),
};

const OFFICERS: EditorConfig = {
  kind: 'officers',
  title: 'Officers',
  description: `The officer cards on the home page, in this order. Portrait photos (4:5) look best. ${LIVE_NOTE}`,
  noun: 'officer',
  sortable: true,
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'role', label: 'Role', required: true, placeholder: 'e.g., Vice President' },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'photo', label: 'Photo', type: 'photo', folder: 'officers', help: 'Without a photo the card shows their initials.' },
  ],
  primary: (i) => i.name ?? '',
  secondary: (i) => `${i.role} · ${i.email}`,
  photo: (i) => i.photo,
};

const RESOURCES: EditorConfig = {
  kind: 'resources',
  title: 'Resources',
  description: `The link cards on the Resources page, in this order. ${LIVE_NOTE}`,
  noun: 'resource',
  sortable: true,
  fields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'category', label: 'Tag', type: 'select', options: ['TSA', 'NCSSM', 'Chapter'], required: true },
    { name: 'href', label: 'Link', type: 'url', required: true, placeholder: 'https://' },
    { name: 'description', label: 'Description', placeholder: 'One short line' },
  ],
  primary: (i) => i.title ?? '',
  secondary: (i) => `${i.category} · ${i.href}`,
};

const GALLERY: EditorConfig = {
  kind: 'gallery',
  title: 'Gallery',
  description: `Photos on the Gallery page (grouped by album) and the home page slideshow. New photos go to the top. ${LIVE_NOTE}`,
  noun: 'photo',
  sortable: true,
  fields: [
    { name: 'src', label: 'Photo', type: 'photo', folder: 'gallery', required: true },
    { name: 'album', label: 'Album', required: true, placeholder: 'e.g., States 2027' },
    { name: 'title', label: 'Caption', placeholder: 'e.g., Trophy Time' },
  ],
  primary: (i) => i.title || 'Untitled',
  secondary: (i) => i.album ?? '',
  photo: (i) => i.src,
};

export const DatesTab = () => <ContentEditor config={DATES} />;
export const OfficersTab = () => <ContentEditor config={OFFICERS} />;
export const ResourcesTab = () => <ContentEditor config={RESOURCES} />;
export const GalleryTab = () => <ContentEditor config={GALLERY} toolbar={(reload, items) => <BulkUpload reload={reload} items={items} />} />;

/** Add a whole album at once: pick an album name, select many photos. */
function BulkUpload({ reload, items }: { reload: () => Promise<void>; items: Item[] }) {
  const [album, setAlbum] = useState('');
  const [progress, setProgress] = useState<string | null>(null);
  const [failures, setFailures] = useState<string[]>([]);
  const albums = [...new Set(items.map((i) => i.album).filter(Boolean))] as string[];

  const upload = async (files: FileList | null) => {
    if (!files?.length || !album.trim()) return;
    const list = Array.from(files);
    const failed: string[] = [];
    // New photos are added at the top, so upload in reverse to keep the order they were picked in
    for (let n = list.length - 1, done = 0; n >= 0; n--, done++) {
      setProgress(`Uploading ${done + 1} of ${list.length}…`);
      try {
        const src = await contentService.uploadPhoto(list[n], 'gallery');
        await contentService.create('gallery', { src, album: album.trim(), title: '' });
      } catch (e) {
        failed.push(`${list[n].name}: ${e instanceof Error ? e.message : 'failed'}`);
      }
    }
    setFailures(failed);
    setProgress(null);
    await reload();
  };

  return (
    <div className="panel p-5">
      <h3 className="font-semibold text-ink">Add an album</h3>
      <p className="text-sm text-ink-soft mt-1">Photos are resized before uploading. Add captions afterwards with Edit (optional).</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="bulk-album" className="block text-sm font-medium text-ink-soft mb-1">Album</label>
          <input
            id="bulk-album"
            list="albums"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="e.g., Regionals 2027"
            className="field w-64"
          />
          <datalist id="albums">
            {albums.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <label
          className={`btn btn-primary ${album.trim() && !progress ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
        >
          {progress ?? 'Choose photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={!album.trim() || progress !== null}
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      {failures.length > 0 && (
        <ul role="alert" className="mt-3 text-sm text-signal list-disc pl-5">
          {failures.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AnnouncementTab() {
  const [a, setA] = useState<Announcement | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    contentService
      .getAnnouncement()
      .then((x) => setA({ ...x, link: x.link ?? '' }))
      .catch((e) => setStatus({ ok: false, text: e.message }));
  }, []);

  const save = async (next: Announcement) => {
    setSaving(true);
    setStatus(null);
    try {
      const saved = await contentService.setAnnouncement({ ...next, link: next.link?.trim() || null });
      setA({ ...saved, link: saved.link ?? '' });
      setStatus({ ok: true, text: saved.active ? 'Saved. The bar is on.' : 'Saved. The bar is off.' });
    } catch (e) {
      setStatus({ ok: false, text: e instanceof Error ? e.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Announcement</h2>
        <p className="text-sm text-ink-soft mt-1 max-w-2xl">
          A one-line notice under the header on every page, e.g. a registration deadline. {LIVE_NOTE}
        </p>
      </div>
      {!a ? (
        <p className="text-sm text-muted">{status?.text ?? 'Loading…'}</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(a);
          }}
          className="panel p-6 space-y-4 max-w-2xl"
        >
          <div>
            <label htmlFor="ann-message" className="block text-sm font-medium text-ink-soft mb-1">Message</label>
            <input
              id="ann-message"
              value={a.message}
              maxLength={200}
              onChange={(e) => setA({ ...a, message: e.target.value })}
              placeholder="e.g., State registration closes Feb 26. Sign up with your captain."
              className="field"
            />
          </div>
          <div>
            <label htmlFor="ann-link" className="block text-sm font-medium text-ink-soft mb-1">
              Link <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="ann-link"
              value={a.link ?? ''}
              onChange={(e) => setA({ ...a, link: e.target.value })}
              placeholder="https://… or a page on the site like /resources"
              className="field"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input type="checkbox" checked={a.active} onChange={(e) => setA({ ...a, active: e.target.checked })} className="h-4 w-4" />
            Show the bar on the website
          </label>
          {a.message && (
            <div>
              <p className="text-xs font-medium text-muted mb-1">Preview</p>
              <div className="rounded border border-line bg-tsa-tint px-4 py-2.5 text-center text-sm text-ink">
                <span className="font-medium">{a.message}</span>
                {a.link && <span className="ml-3 font-semibold text-tsa-deep">Details →</span>}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            {status && <p className={`text-sm ${status.ok ? 'text-green-700' : 'text-signal'}`}>{status.text}</p>}
          </div>
        </form>
      )}
    </div>
  );
}

export function AdminsTab() {
  const [admins, setAdmins] = useState<string[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    contentService
      .listAdmins()
      .then((r) => {
        setAdmins(r.admins);
        setMe(r.me);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await contentService.addAdmin(email);
      setEmail('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    }
  };

  const remove = async (addr: string) => {
    if (!window.confirm(`Remove ${addr}? They won't be able to sign in to the admin panel.`)) return;
    setError(null);
    try {
      await contentService.removeAdmin(addr);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Admins</h2>
        <p className="text-sm text-ink-soft mt-1 max-w-2xl">
          Who can sign in to this admin panel with their Google account. Remove officers when they graduate. Sessions last up to an hour after removal.
        </p>
      </div>
      {error && (
        <div role="alert" className="bg-signal/5 border border-signal/25 text-signal text-sm font-medium p-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="panel p-6 max-w-2xl">
        {me === null ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            You signed in with the chapter password. Sign in with Google to add or remove admins.
          </p>
        ) : (
        <form onSubmit={add} className="flex gap-2">
          <label htmlFor="admin-email" className="sr-only">Email</label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="officer@ncssm.edu"
            className="field"
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>
        )}
        <ul className="mt-4 divide-y divide-line">
          {admins.map((addr) => (
            <li key={addr} className="flex items-center justify-between py-3">
              <span className="text-sm text-ink">
                {addr}
                {addr === me && <span className="ml-2 text-muted">(you)</span>}
              </span>
              {me !== null && addr !== me && (
                <button onClick={() => remove(addr)} className="text-sm font-medium text-signal hover:text-signal/75">
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
