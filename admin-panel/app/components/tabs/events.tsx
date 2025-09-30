'use client';

import { useState, useEffect } from 'react';
import EventForm from './forms/event-form';
import type { Event } from '../../../../website-frontend/app/models/event';
import { eventService } from '../../services/event';

export default function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
      console.error('Error loading events', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const uniqueCategories = Array.from(new Set(events.map((e) => e.category).filter(Boolean))) as string[];
  const categories = ['All', ...uniqueCategories];

  const filteredEvents = events.filter((ev) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = ev.title.toLowerCase().includes(q) || (ev.description || '').toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
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
        // update
  const updated = (await eventService.updateEvent(selectedEvent.id, eventData)) as unknown as Event;
  setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        // create
  const created = (await eventService.createEvent(eventData)) as unknown as Event;
  setEvents((prev) => [created, ...prev]);
      }
      handleCloseForm();
    } catch (err: unknown) {
      console.error('Save error', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to save event');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      handleCloseForm();
    } catch (err: unknown) {
      console.error('Delete error', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">NCSSM TSA Events</h2>
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
        />

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && <div className="text-sm text-gray-500">Loading events...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            onClick={() => handleEventClick(ev)}
            className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-900"
          >
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{ev.title}</h3>
                    {ev.theme && (
                      <div className="mt-1">
                        <span className="inline-block py-0.5  text-gray-700 text-xs font-medium">Theme: {ev.theme}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 shrink-0">
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium">{ev.category}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mt-3 mb-3 break-words whitespace-pre-wrap max-h-20 overflow-hidden">{ev.description}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {ev.types && ev.types.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ev.types.map((t) => (
                        <span key={t} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                  <span className="inline-block px-2 py-0.5 text-gray-700 text-xs font-medium">Team Size: {ev.teamSize || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No events found matching your criteria.</p>
        </div>
      )}

      {(selectedEvent || isCreating) && (
        <EventForm event={selectedEvent} onClose={handleCloseForm} onSave={handleSave} onDelete={handleDelete} categories={uniqueCategories} />
      )}
    </div>
  );
}