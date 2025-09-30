"use client";

import { useEffect, useState } from 'react';
import { checkinService } from '../../services/checkin';
import type { Checkin } from '../../../../website-frontend/app/models/checkin';

interface Props {
  teamId: string;
  onClose: () => void;
}

export default function CheckinsModal({ teamId, onClose }: Props) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await checkinService.listTeamCheckins(teamId);
        setCheckins(items || []);
      } catch (err: unknown) {
        console.error('Failed to load checkins', err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);

  const handleDelete = async (id: string) => {
    const ok = confirm('Delete this checkin?');
    if (!ok) return;
    try {
      await checkinService.deleteCheckin(id);
      setCheckins((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      console.error('Delete failed', err);
      alert('Failed to delete checkin');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-blue-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Team Checkins</h2>
            <p className="text-sm text-blue-100 mt-0.5">All submissions for this team</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                <span className="text-sm">Loading checkins...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && checkins.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600">No checkins submitted yet</p>
            </div>
          )}

          <div className="space-y-3">
            {checkins.map((c) => (
              <div key={c.id} className="group border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all bg-white">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(c.submitted_at).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                    title="Delete checkin"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="space-y-2">
                  {c.links.map((l, idx) => (
                    <a
                      key={idx}
                      href={l}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors group/link"
                    >
                      <svg className="w-4 h-4 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="break-all group-hover/link:underline">{l}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}