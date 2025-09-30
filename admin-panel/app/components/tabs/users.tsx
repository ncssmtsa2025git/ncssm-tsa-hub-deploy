'use client';

import { useEffect, useState } from 'react';
import type { User } from '../../../../website-frontend/app/models/user';
import { userService } from '../../services/user';

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newEmails, setNewEmails] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLoading] = useState(true);

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

  const handleAddToWhitelist = async () => {
    const emails = newEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email && !whitelist.includes(email));
    if (emails.length === 0) return;
    try {
      // add sequentially and update list
      for (const email of emails) {
        await userService.addWhitelist(email);
      }
      const fresh = await userService.listWhitelist();
      setWhitelist(fresh || []);
      setNewEmails('');
    } catch (err: unknown) {
      console.error('Failed to add to whitelist', err);
    }
  };

  const handleRemoveFromWhitelist = async (email: string) => {
    try {
      await userService.deleteWhitelist(email);
      const fresh = await userService.listWhitelist();
      setWhitelist(fresh || []);
    } catch (err: unknown) {
      console.error('Failed to remove from whitelist', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">NCSSM TSA Users</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Registered Users</h3>

        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found matching your search.</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Whitelist</h3>
        <p className="text-sm text-gray-600 mb-4">Manage approved email addresses for event registration</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Emails (comma-separated)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="email1@ncssm.edu, email2@ncssm.edu"
              value={newEmails}
              onChange={(e) => setNewEmails(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
            <button onClick={handleAddToWhitelist} className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium">Add</button>
          </div>
        </div>

        <div className="space-y-2">
          {whitelist.map((email) => (
            <div key={email} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
              <span className="text-sm text-gray-700">{email}</span>
              <button onClick={() => handleRemoveFromWhitelist(email)} className="text-red-600 hover:text-red-800 font-medium text-sm">✕ Remove</button>
            </div>
          ))}
        </div>

        {whitelist.length === 0 && (
          <div className="text-center py-8 text-gray-500">No emails in whitelist.</div>
        )}
      </div>
    </div>
  );
}