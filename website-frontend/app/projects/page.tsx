"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, Calendar, Users, ExternalLink, Trophy } from "lucide-react";
import type { Project } from "../models/project";

// ---- optional: CSV helper kept in case you re-add Export later ----
export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headerLine = headers.map(escape).join(",");
  const body = rows
  .map((row) => headers.map((h) => escape((row as Record<string, unknown>)[h])).join(","))
    .join("\n");
  return `${headerLine}\n${body}`;
}

// Normalize partially-specified JSON objects into full Project objects
type PartialProject = Partial<Project> & { id: string; title: string };

function normalizeProject(p: PartialProject): Project {
  return {
    id: p.id,
    title: p.title,
    eventName: p.eventName ?? "",
    year: p.year ?? new Date().getFullYear(),
    description: p.description ?? "",
    team: p.team ?? [],
    placement: p.placement ?? undefined,
    tags: p.tags ?? [],
    coverImageUrl: p.coverImageUrl ?? undefined,
    links: p.links ?? [],
  };
}

export default function ProjectsPage(): React.ReactElement {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventName, setSelectedEventName] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch JSON from /public and normalize
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/data/past_projects.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
        const raw = await res.json();
        if (!Array.isArray(raw)) throw new Error("projects file must be a JSON array");
        const data: Project[] = (raw as PartialProject[]).map(normalizeProject);
        setProjects(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const eventOptions = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.eventName || "")))],
    [projects]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProject(null);
    };
    if (selectedProject) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !q ||
        (p.title ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.eventName ?? "").toLowerCase().includes(q) ||
        String(p.year ?? "").includes(q) ||
        (p.placement ?? "").toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => (t ?? "").toLowerCase().includes(q)) ||
        (p.team ?? []).some((name) => (name ?? "").toLowerCase().includes(q));

      const matchesEvent = selectedEventName === "All" || (p.eventName ?? "") === selectedEventName;
      return matchesSearch && matchesEvent;
    });
  }, [projects, searchTerm, selectedEventName]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Calendar className="h-16 w-16 text-blue-200" />
          </div>
          <h1 className="text-5xl font-bold mb-6">Past Projects</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            Browse completed TSA projects by event, year, and tech stack.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search title, event, year, tech, members..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              value={selectedEventName}
              onChange={(e) => setSelectedEventName(e.target.value)}
            >
              {eventOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || "Uncategorized"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <p className="text-center text-gray-500">Loading projects...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {filtered.length} Project{filtered.length !== 1 ? "s" : ""} Found
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedProject(p)}
                  >
                    {p.coverImageUrl && (
                      <div className="mb-4 -mt-2 -mx-2">
                        <div className="relative w-full h-40 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={p.coverImageUrl}
                            alt={p.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {p.eventName || "Uncategorized"}
                      </span>
                      <span className="text-sm text-gray-500">{p.year}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>

                    {p.placement && (
                      <div className="flex items-center text-sm text-amber-600 mb-2">
                        <Trophy className="h-4 w-4 mr-1" />
                        {p.placement}
                      </div>
                    )}

                    <p className="text-gray-600 mb-4 line-clamp-2">{p.description}</p>

                    <div className="space-y-2">
                      {(p.team ?? []).length > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          {(p.team ?? []).join(", ")}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2 mt-2">
                        {(p.tags ?? []).map((tag) => (
                          <span key={tag} className="tag-badge">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects match</h3>
                  <p className="text-gray-500">Try a different search or filter.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {(selectedProject.eventName || "Uncategorized")} • {selectedProject.year}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedProject.placement && (
                  <div className="flex items-center text-amber-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{selectedProject.placement}</span>
                  </div>
                )}

                {selectedProject.coverImageUrl && (
                  <div className="relative w-full h-56 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={selectedProject.coverImageUrl}
                      alt={selectedProject.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(selectedProject.team ?? []).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Team</h3>
                      <p className="text-gray-600">
                        {(selectedProject.team ?? []).join(", ")}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Tags</h3>
                    <div className="flex items-center text-gray-600 flex-wrap gap-2">
                      {(selectedProject.tags ?? []).map((t) => (
                        <span key={t} className="tag-badge">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {(selectedProject.links ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {(selectedProject.links ?? []).map((lnk, i) => (
                      <a
                        key={i}
                        href={lnk.url}
                        className="flex-1 min-w-[160px] bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium inline-flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {lnk.label ?? (lnk.type?.toUpperCase() ?? "LINK")}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
