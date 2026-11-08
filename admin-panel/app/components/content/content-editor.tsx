"use client";

import { useCallback, useEffect, useState } from 'react';
import { contentService, previewUrl, type Item, type Kind } from '../../services/content';

export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'email' | 'url' | 'select' | 'photo';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  folder?: 'officers' | 'gallery';
};

export type EditorConfig = {
  kind: Kind;
  title: string;
  description: string;
  noun: string; // "date", "officer", ...
  fields: Field[];
  sortable: boolean;
  primary: (i: Item) => string;
  secondary?: (i: Item) => string;
  photo?: (i: Item) => string | null;
};

type Editing = { id: string | null; values: Record<string, string> };

/**
 * List + inline form for one kind of site content. Changes reach the website within about a minute
 * (the public API is cached on Vercel's CDN for 60 seconds).
 */
export default function ContentEditor({
  config,
  toolbar,
}: {
  config: EditorConfig;
  /** Extra controls above the list (e.g. bulk photo upload); gets a reload callback. */
  toolbar?: (reload: () => Promise<void>, items: Item[]) => React.ReactNode;
}) {
  const { kind, fields } = config;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await contentService.list(kind));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    reload();
  }, [reload]);

  const startNew = () => setEditing({ id: null, values: Object.fromEntries(fields.map((f) => [f.name, f.options?.[0] ?? ''])) });
  const startEdit = (it: Item) =>
    setEditing({ id: it.id, values: Object.fromEntries(fields.map((f) => [f.name, it[f.name] ?? ''])) });
  const setValue = (name: string, value: string) =>
    setEditing((e) => (e ? { ...e, values: { ...e.values, [name]: value } } : e));

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    // Empty dates are "none"; other empty fields are sent as blank text
    const payload = Object.fromEntries(
      fields.map((f) => {
        const v = (editing.values[f.name] ?? '').trim();
        return [f.name, f.type === 'date' || f.type === 'photo' ? v || null : v];
      })
    );
    setSaving(true);
    setError(null);
    try {
      if (editing.id) {
        const saved = await contentService.update(kind, editing.id, payload);
        setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      } else {
        await contentService.create(kind, payload);
        await reload(); // the API decides where new rows go
      }
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: Item) => {
    if (!window.confirm(`Delete "${config.primary(it)}"? This can't be undone.`)) return;
    try {
      await contentService.remove(kind, it.id);
      setItems((prev) => prev.filter((i) => i.id !== it.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const move = async (index: number, delta: number) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + delta, 0, moved);
    setItems(next);
    try {
      setItems(await contentService.reorder(kind, next.map((i) => i.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder');
      reload();
    }
  };

  const uploadPhoto = async (field: Field, file: File | undefined) => {
    if (!file || !field.folder) return;
    setUploading(field.name);
    setError(null);
    try {
      setValue(field.name, await contentService.uploadPhoto(file, field.folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const form = editing && (
    <form onSubmit={save} className="space-y-4 bg-paper-2 border border-line rounded-lg p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.type === 'photo' || f.name === 'description' ? 'sm:col-span-2' : ''}>
            <label htmlFor={`f-${f.name}`} className="block text-sm font-medium text-ink-soft mb-1">
              {f.label}
              {!f.required && <span className="font-normal text-muted"> (optional)</span>}
            </label>
            {f.type === 'select' ? (
              <select
                id={`f-${f.name}`}
                value={editing.values[f.name]}
                onChange={(e) => setValue(f.name, e.target.value)}
                className="field"
              >
                {f.options!.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === 'photo' ? (
              <div className="flex items-center gap-4">
                {editing.values[f.name] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl(editing.values[f.name])} alt="" className="h-20 w-16 rounded object-cover bg-paper-2" />
                ) : (
                  <div className="h-20 w-16 rounded bg-paper-2" />
                )}
                <label className="btn btn-secondary cursor-pointer">
                  {uploading === f.name ? 'Uploading…' : editing.values[f.name] ? 'Replace photo' : 'Upload photo'}
                  <input
                    id={`f-${f.name}`}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading !== null}
                    onChange={(e) => uploadPhoto(f, e.target.files?.[0])}
                  />
                </label>
                {editing.values[f.name] && !f.required && (
                  <button type="button" onClick={() => setValue(f.name, '')} className="text-sm text-signal hover:text-signal/75">
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <input
                id={`f-${f.name}`}
                type={f.type ?? 'text'}
                value={editing.values[f.name]}
                onChange={(e) => setValue(f.name, e.target.value)}
                required={f.required}
                placeholder={f.placeholder}
                className="field"
              />
            )}
            {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || uploading !== null}
          className="btn btn-primary"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{config.title}</h2>
          <p className="text-sm text-ink-soft mt-1 max-w-2xl">{config.description}</p>
        </div>
        <button
          onClick={startNew}
          disabled={editing !== null}
          className="shrink-0 btn btn-primary"
        >
          Add {config.noun}
        </button>
      </div>

      {error && (
        <div role="alert" className="bg-signal/5 border border-signal/25 text-signal text-sm font-medium p-3 rounded-lg">
          {error}
        </div>
      )}

      {toolbar?.(reload, items)}

      <div className="panel">
        {editing?.id === null && <div className="p-4 border-b border-line">{form}</div>}
        {loading && items.length === 0 ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-muted">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((it, i) =>
              editing?.id === it.id ? (
                <li key={it.id} className="p-4">
                  {form}
                </li>
              ) : (
                <li key={it.id} className="flex items-center gap-4 px-4 py-3">
                  {config.photo &&
                    (config.photo(it) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl(config.photo(it)!)} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded object-cover bg-paper-2" />
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded bg-paper-2" />
                    ))}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink truncate">{config.primary(it)}</p>
                    {config.secondary && <p className="text-sm text-muted truncate">{config.secondary(it)}</p>}
                  </div>
                  {config.sortable && (
                    <div className="flex shrink-0">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0 || editing !== null}
                        aria-label={`Move ${config.primary(it)} up`}
                        className="px-2 py-1 text-muted hover:text-ink disabled:opacity-25"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === items.length - 1 || editing !== null}
                        aria-label={`Move ${config.primary(it)} down`}
                        className="px-2 py-1 text-muted hover:text-ink disabled:opacity-25"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => startEdit(it)}
                    disabled={editing !== null}
                    className="shrink-0 text-sm font-medium text-tsa hover:text-tsa-deep disabled:opacity-40"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(it)}
                    disabled={editing !== null}
                    className="shrink-0 text-sm font-medium text-signal hover:text-signal/75 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
