'use client';

import { useEffect, useState } from 'react';
import type { User } from '../../../../website-frontend/app/models/user';
import { userService } from '../../services/user';

function errorText(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return /expired|No authentication token|Admin token required/i.test(msg)
    ? 'your admin session expired. Refresh the page and log in again.'
    : msg;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newEmails, setNewEmails] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [u, w] = await Promise.all([userService.listUsers(), userService.listWhitelist()]);
        if (!mounted) return;
        setUsers(u || []);
        setWhitelist(w || []);
      } catch (err: unknown) {
        console.error('Failed to load users/whitelist', err);
        if (mounted) setStatus({ kind: 'error', text: `Couldn't load users/whitelist: ${errorText(err)}` });
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.name || user.email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Whitelisted emails with no user account yet = never logged in
  const registeredEmails = new Set(users.map((u) => u.email.toLowerCase()));
  const notRegistered = whitelist.filter((email) => !registeredEmails.has(email.toLowerCase()));

  const handleCopyNotRegistered = async () => {
    try {
      await navigator.clipboard.writeText(notRegistered.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus({ kind: 'error', text: "Couldn't copy to clipboard" });
    }
  };

  const handleAddToWhitelist = async () => {
    // Accept commas, semicolons, spaces or new lines (e.g. a column pasted from a spreadsheet)
    const emails = newEmails.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (emails.length === 0) return;
    setSaving(true);
    setStatus(null);
    try {
      const r = await userService.addWhitelistBulk(emails);
      setWhitelist((await userService.listWhitelist()) || []);
      setNewEmails('');
      const parts = [`Added ${r.added.length}`];
      if (r.already.length) parts.push(`${r.already.length} already on the list`);
      if (r.invalid.length) parts.push(`skipped invalid: ${r.invalid.join(', ')}`);
      setStatus({ kind: r.invalid.length ? 'error' : 'ok', text: parts.join(' · ') });
    } catch (err: unknown) {
      console.error('Failed to add to whitelist', err);
      setStatus({ kind: 'error', text: `Nothing was added: ${errorText(err)}` });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromWhitelist = async (email: string) => {
    try {
      await userService.deleteWhitelist(email);
      const fresh = await userService.listWhitelist();
      setWhitelist(fresh || []);
    } catch (err: unknown) {
      console.error('Failed to remove from whitelist', err);
      setStatus({ kind: 'error', text: `Couldn't remove ${email}: ${errorText(err)}` });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink">Users</h2>

      <div className="panel p-6">
        <h3 className="text-xl font-semibold text-ink mb-4">Registered Users</h3>

        <input
          type="text"
          placeholder="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-line rounded-lg text-ink focus:ring-2 focus:ring-tsa/20 focus:border-transparent outline-none"
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-paper-2 border-b-2 border-line">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-paper-2">
                  <td className="px-4 py-3 text-sm text-ink">{user.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-ink-soft">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted">No users found matching your search.</div>
        )}
      </div>

      <div className="panel p-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h3 className="text-xl font-semibold text-ink">Haven&apos;t Logged In Yet</h3>
          {notRegistered.length > 0 && (
            <button
              onClick={handleCopyNotRegistered}
              className="btn btn-secondary"
            >
              {copied ? 'Copied!' : 'Copy emails'}
            </button>
          )}
        </div>
        <p className="text-sm text-ink-soft mb-4">
          {notRegistered.length} of {whitelist.length} whitelisted member{whitelist.length === 1 ? '' : 's'} haven&apos;t signed in to register yet
        </p>

        {notRegistered.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {notRegistered.map((email) => (
              <div key={email} className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg text-sm text-amber-900">
                {email}
              </div>
            ))}
          </div>
        ) : (
          whitelist.length > 0 && <div className="text-center py-4 text-green-700">Everyone on the whitelist has logged in.</div>
        )}
      </div>

      <div className="panel p-6">
        <h3 className="text-xl font-semibold text-ink mb-4">Email Whitelist</h3>
        <p className="text-sm text-ink-soft mb-4">Manage approved email addresses for event registration</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-soft mb-2">Add Emails (separated by commas, spaces or new lines)</label>
          <div className="flex gap-2 items-start">
            <textarea
              rows={3}
              placeholder="email1@ncssm.edu, email2@ncssm.edu"
              value={newEmails}
              onChange={(e) => setNewEmails(e.target.value)}
              className="field flex-1"
            />
            <button
              onClick={handleAddToWhitelist}
              disabled={saving || !newEmails.trim()}
              className="btn btn-primary"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
          {status && (
            <p className={`mt-2 text-sm ${status.kind === 'ok' ? 'text-green-700' : 'text-signal'}`}>{status.text}</p>
          )}
        </div>

        <p className="text-sm text-muted mb-2">{whitelist.length} email{whitelist.length === 1 ? '' : 's'} on the whitelist</p>

        <div className="space-y-2">
          {whitelist.map((email) => (
            <div key={email} className="flex items-center justify-between bg-paper-2 px-4 py-3 rounded-lg">
              <span className="text-sm text-ink-soft">{email}</span>
              <button onClick={() => handleRemoveFromWhitelist(email)} className="text-signal hover:text-signal/75 font-medium text-sm">✕ Remove</button>
            </div>
          ))}
        </div>

        {whitelist.length === 0 && (
          <div className="text-center py-8 text-muted">No emails in whitelist.</div>
        )}
      </div>
    </div>
  );
}