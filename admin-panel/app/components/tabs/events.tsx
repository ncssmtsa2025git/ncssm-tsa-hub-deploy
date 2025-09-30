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
        <h2 className="text-2xl font-bold text-gray-900">Events</h2>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
        >
          + Create Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-0 outline-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="text-sm text-slate-400">{filteredEvents.length} result{filteredEvents.length === 1 ? '' : 's'}</div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600 mt-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading events...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md mt-3">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}
      </div>

  {/* Events Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            onClick={() => handleEventClick(ev)}
            className="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer border-l-2 border-blue-800 overflow-hidden group"
          >
            <div className="p-5">
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-blue-800 transition-colors duration-150">
                        {ev.title}
                      </h3>
                      {ev.theme && (
                        <div className="mt-1 inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-xs font-medium">
                            {ev.theme}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 rounded text-xs font-semibold">
                        {ev.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mt-3 break-words whitespace-pre-wrap line-clamp-3">
                    {ev.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {ev.types && ev.types.length > 0 && (
                      <>
                        {ev.types.map((t) => (
                          <span
                            key={t}
                            className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 rounded text-xs font-medium border border-amber-200">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
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
        <div className="text-center py-8 bg-white rounded-md shadow-sm border border-slate-100">
          <svg
            className="w-10 h-10 mx-auto text-slate-300 mb-3"
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
          <p className="text-slate-500 text-sm font-medium">No events found</p>
          <p className="text-slate-400 text-xs mt-1">
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
          categories={uniqueCategories}
        />
      )}
    </div>
  );
}
