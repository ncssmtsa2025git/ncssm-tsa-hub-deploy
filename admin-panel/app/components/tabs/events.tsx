"use client";

import { useState, useEffect } from "react";
import EventForm from "./forms/event-form";
import type { Event } from "../../../../website-frontend/app/models/event";
import { eventService } from "../../services/event";

export default function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await eventService.listEvents()) as unknown as Event[];
      setEvents(data || []);
    } catch (err: unknown) {
      console.error("Error loading events", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const uniqueCategories = Array.from(
    new Set(events.map((e) => e.category).filter(Boolean))
  ) as string[];
  const categories = ["All", ...uniqueCategories];
  
  const filteredEvents = events.filter((ev) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ev.title.toLowerCase().includes(q) ||
      (ev.description || "").toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "All" || ev.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventClick = (ev: Event) => {
    setSelectedEvent(ev);
    setIsCreating(false);
  };
  const handleCreateClick = () => {
    setSelectedEvent(null);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setSelectedEvent(null);
    setIsCreating(false);
  };

  const handleSave = async (eventData: Partial<Event>) => {
    try {
      if (selectedEvent?.id) {
        const updated = (await eventService.updateEvent(
          selectedEvent.id,
          eventData
        )) as unknown as Event;
        setEvents((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        );
      } else {
        const created = (await eventService.createEvent(
          eventData
        )) as unknown as Event;
        setEvents((prev) => [created, ...prev]);
      }
      handleCloseForm();
    } catch (err: unknown) {
      console.error("Save error", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to save event");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      handleCloseForm();
    } catch (err: unknown) {
      console.error("Delete error", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-ink">Events</h2>
        <button
          onClick={handleCreateClick}
          className="btn btn-primary"
        >
          New event
        </button>
      </div>

      <div className="panel p-4 space-y-3">
        <input
          type="text"
          placeholder="Search events"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="field w-full"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-tsa-tint font-medium text-tsa-deep"
                    : "text-ink-soft hover:bg-paper-2"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="text-sm text-muted">{filteredEvents.length} result{filteredEvents.length === 1 ? '' : 's'}</div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted mt-3">
            <div className="w-4 h-4 border-2 border-line border-t-ink-soft rounded-full animate-spin"></div>
            <span>Loading events…</span>
          </div>
        )}
        {error && (
          <div className="bg-signal/5 border border-signal/25 text-signal p-3 rounded-md mt-3">
            <p className="text-sm text-signal font-medium">{error}</p>
          </div>
        )}
      </div>

  {/* Events Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            onClick={() => handleEventClick(ev)}
            className="bg-white rounded-md border border-line hover:border-tsa/40 transition-colors cursor-pointer overflow-hidden group"
          >
            <div className="p-5">
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-ink group-hover:text-tsa transition-colors">
                        {ev.title}
                      </h3>
                      {ev.theme && (
                        <p className="mt-1 text-sm text-muted">{ev.theme}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className="text-sm text-muted">
                        {ev.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-ink-soft text-sm mt-3 break-words whitespace-pre-wrap line-clamp-3">
                    {ev.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {ev.types && ev.types.length > 0 && (
                      <>
                        {ev.types.map((t) => (
                          <span
                            key={t}
                            className="inline-block px-2 py-0.5 bg-paper-2 text-ink-soft rounded text-xs font-medium border border-line"
                          >
                            {t}
                          </span>
                        ))}
                      </>
                    )}
                    <span className="ml-1 text-xs text-muted">
                    {ev.teamSize || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-8 panel">
          <svg
            className="w-10 h-10 mx-auto text-line mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-muted text-sm font-medium">No events found</p>
          <p className="text-muted text-xs mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {(selectedEvent || isCreating) && (
        <EventForm
          event={selectedEvent}
          onClose={handleCloseForm}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
