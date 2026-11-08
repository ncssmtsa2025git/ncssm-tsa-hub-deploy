"use client";
import React, { useState, useEffect } from "react";
import { Search, Users, X, ExternalLink } from "lucide-react";
import PageBanner from "../components/PageBanner";
import { Event } from "../models/event";
import { fetchEvents } from "../services/events";

export default function EventsPage(): React.ReactElement {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEvents();
        setEvents(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derive categories dynamically from events
  const categories = ["All", ...new Set(events.map((e) => e.category))];

  // Close modal when Escape is pressed
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedEvent(null);
    }
    if (selectedEvent) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEvent]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.theme ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-paper-2">
      <PageBanner
        title="Events"
        image="/pics/states_2026/IMG_4585.jpg"
        alt="An NCSSM Durham member walks across the stage to accept an award at the 2026 NC TSA State Conference"
        focus="70% 40%"
      >
        Every TSA high school event for the 2026–27 season, with its theme, team size, format and rubric.
      </PageBanner>

      {/* Search and Filter Section */}
      <section className="py-8 border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-5 w-5" />
              <input
                type="text"
                placeholder="Search events"
                className="w-full pl-10 pr-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-tsa/20 focus:border-transparent text-ink placeholder:text-muted bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-tsa/20 focus:border-transparent text-ink bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <p className="text-center text-muted">Loading events…</p>}
          {error && <p className="text-center text-signal">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-ink tabular">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white border border-line rounded-lg p-6 hover:border-tsa/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="mb-4">
                      <span className="text-sm font-medium text-muted">
                        {event.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-ink mb-2">
                      {event.title}
                    </h3>
                    {event.theme && (
                      <p className="text-sm font-medium text-tsa mb-3">Theme: {event.theme}</p>
                    )}
                    <p className="text-ink-soft mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted">
                        <Users className="h-4 w-4 mr-2" />
                        {event.teamSize}
                      </div>
                      <div className="flex items-center text-sm text-muted flex-wrap gap-2 mt-2">
                        {event.types.map((t) => (
                          <span key={t} className="tag-badge">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-ink mb-2">
                    No events found
                  </h3>
                  <p className="text-muted">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* TEST */}
      {/* Event Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-sm font-medium text-muted">
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-2xl font-bold text-ink mt-1">
                    {selectedEvent.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-muted hover:text-ink-soft"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-ink mb-1">Theme</h3>
                  <p className="text-tsa">
                    {selectedEvent.theme ?? "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-ink mb-2">
                    Description
                  </h3>
                  <p className="text-ink-soft">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-ink mb-1">
                      Team Size
                    </h3>
                    <div className="flex items-center text-ink-soft">
                      <Users className="h-4 w-4 mr-2" />
                      {selectedEvent.teamSize}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink mb-1">
                      Event Type
                    </h3>
                    <div className="flex items-center text-ink-soft flex-wrap gap-2">
                      {selectedEvent.types.map((t) => (
                        <span key={t} className="tag-badge">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {selectedEvent.rubricUrl ? (
                    <a
                      href={selectedEvent.rubricUrl}
                      className="flex-1 bg-tsa text-white py-3 px-4 rounded-lg hover:bg-tsa transition-colors text-center font-medium flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Rubric{selectedEvent.rubricPages ? ` (pp. ${selectedEvent.rubricPages})` : ""}
                    </a>
                  ) : null}
                  {selectedEvent.fullThemeUrl ? (
                    <a
                      href={selectedEvent.fullThemeUrl}
                      className="flex-1 bg-paper-2 text-ink py-3 px-4 rounded-lg hover:bg-paper-2 transition-colors text-center font-medium flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Full Theme
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
