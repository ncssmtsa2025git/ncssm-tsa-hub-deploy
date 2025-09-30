"use client";
import React, { JSX, useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Team } from "../models/team";
import { Checkin, CheckinCreate } from "../models/checkin";
import { fetchTeams, getTeamCheckins, createCheckin } from "../services/portal";
// import { User } from "../models/user"; // not directly used here
import TeamCard from "../components/TeamCard";
import { UpcomingDate, loadUpcomingDates } from "../models/upcoming";

// Card Components
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

function Card({ className = "", children }: CardProps) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>;
}
function CardHeader({ className = "", children }: CardProps) {
  return <div className={`border-b p-4 ${className}`}>{children}</div>;
}
function CardTitle({ className = "", children }: CardProps) {
  return <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>;
}
function CardContent({ className = "", children }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

// Upcoming dates (loaded from public JSON)
const [/* placeholder for top-level const used below */,] = [];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function Portal(): JSX.Element {
  const { user, fetchWithAuth } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamCheckins, setTeamCheckins] = useState<Record<string, Checkin[]>>({});
  const [viewingCheckin, setViewingCheckin] = useState<Checkin | null>(null);
  const [uploadingForTeam, setUploadingForTeam] = useState<string | null>(null);
  const [newLinks, setNewLinks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(true);
  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([]);

  useEffect(() => {
    // load upcoming dates from public JSON
    loadUpcomingDates().then((d) => setUpcomingDates(d)).catch(() => setUpcomingDates([]));
  }, [fetchWithAuth]);

  // validation helper: accepts http/https URLs
  const isValidUrl = (s: string) => {
    const trimmed = s.trim();
    if (trimmed.length === 0) return false;
    try {
      const u = new URL(trimmed);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      try {
  const data = await fetchTeams(fetchWithAuth);
        setTeams(data);
        // fetch checkins for each team
        const checkinsMap: Record<string, Checkin[]> = {};
        await Promise.all(
          data.map(async (t) => {
            try {
              const c = await getTeamCheckins(t.id, fetchWithAuth);
              checkinsMap[t.id] = c;
            } catch {
              checkinsMap[t.id] = [];
            }
          })
        );
        setTeamCheckins(checkinsMap);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, [fetchWithAuth]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name ?? "Student"}
          </h1>
          <p className="text-gray-600">Student Dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Teams */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>My Teams</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading teams...</p>
              ) : teams.length === 0 ? (
                <p className="text-gray-500">No teams found</p>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      checkins={teamCheckins[team.id] || []}
                      onViewCheckin={(c) => setViewingCheckin(c)}
                      onUpload={(tid) => {
                        setUploadingForTeam(tid);
                        setNewLinks([""]);
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Upcoming Dates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDates.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-3">
                    <div className="font-medium text-sm text-blue-600">
                      {formatDate(item.date)}
                    </div>
                    <div className="text-gray-800 text-sm">{item.event}</div>
                    <div className="text-xs text-gray-500">{item.type}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View checkin modal */}
        {viewingCheckin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingCheckin(null)} />
            <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-6 py-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Check-in Details</h3>
                <button 
                  onClick={() => setViewingCheckin(null)} 
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submitted {new Date(viewingCheckin.submitted_at).toLocaleString()}
                </p>

                <div className="space-y-2">
                  {viewingCheckin.links.map((l, idx) => (
                    <a
                      key={idx}
                      href={l}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-blue-600 group-hover:underline break-all text-sm">{l}</span>
                    </a>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setViewingCheckin(null)} 
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload checkin dialog */}
        {uploadingForTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setUploadingForTeam(null)} />
            <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-6 py-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Upload Check-in</h3>
                <button 
                  onClick={() => setUploadingForTeam(null)} 
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">Add links to portfolios, video presentations, pictures of models, or other supporting documents (one per input).</p>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {newLinks.map((lnk, idx) => {
                    const trimmed = lnk.trim();
                    const valid = trimmed.length === 0 ? null : isValidUrl(trimmed);
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex gap-2 items-start">
                          <input
                            value={lnk}
                            onChange={(e) => setNewLinks((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                            className={`flex-1 px-4 py-2 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 border ${
                              valid === false ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="https://example.com/rubric.pdf"
                          />
                          <button
                            onClick={() => setNewLinks((prev) => prev.filter((_, i) => i !== idx))}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        {valid === false && (
                          <p className="text-xs text-red-600">Please enter a valid URL starting with http:// or https://</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setNewLinks((prev) => [...prev, ""])}
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 text-sm font-medium"
                >
                  + Add Link
                </button>

                {(() => {
                  const nonEmptyValidCount = newLinks.filter((s) => s.trim().length > 0 && isValidUrl(s)).length;
                  const hasInvalid = newLinks.some((s) => s.trim().length > 0 && !isValidUrl(s));
                  const canSubmit = nonEmptyValidCount > 0 && !hasInvalid;

                  return (
                    <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setUploadingForTeam(null)} 
                    className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!canSubmit) {
                        alert("Please provide at least one valid link and fix any invalid URLs before submitting.");
                        return;
                      }
                      try {
                        const links = newLinks.map((s) => s.trim()).filter((s) => s.length > 0);
                        const payload: CheckinCreate = { links };
                        await createCheckin(uploadingForTeam!, payload, fetchWithAuth);
                        const updated = await getTeamCheckins(uploadingForTeam!, fetchWithAuth);
                        setTeamCheckins((prev) => ({ ...prev, [uploadingForTeam!]: updated }));
                        setUploadingForTeam(null);
                      } catch (err) {
                        console.error("Failed to upload checkin:", err);
                        alert("Failed to submit checkin");
                      }
                    }}
                    disabled={!canSubmit}
                    className={`px-5 py-2 rounded-lg transition-colors font-medium shadow-sm ${canSubmit ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-600 text-white opacity-50 cursor-not-allowed"}`}
                  >
                    Submit Check-in
                  </button>
                </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}