"use client";

import { useState, useEffect, useRef } from 'react';
import type { Event as EventModel } from '../../../../../website-frontend/app/models/event';

interface EventFormProps {
  event: EventModel | null;
  onClose: () => void;
  onSave: (event: Partial<EventModel>) => void;
  onDelete?: (id: string) => void;
  categories?: string[];
}

export default function EventForm({ event, onClose, onSave, onDelete, categories }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<EventModel>>({
    title: '',
    theme: '',
    fullThemeUrl: '',
    description: '',
    category: 'Engineering',
    teamSize: '1',
    types: [],
    rubricUrl: '',
  });
  const [typesRaw, setTypesRaw] = useState<string>('');
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        theme: event.theme,
        fullThemeUrl: event.fullThemeUrl,
        description: event.description,
        category: event.category,
        teamSize: event.teamSize,
        types: event.types || [],
        rubricUrl: event.rubricUrl,
      });
      setTypesRaw((event.types || []).join(', '));
      // teamSize is handled by formData.teamSize directly
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'types') {
      // allow raw typing including commas
      setTypesRaw(value);
      return;
    }
    setFormData((prev: Partial<EventModel>) => ({ ...prev, [name]: value }));
  };

  // team size is stored directly on formData.teamSize

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const types = typesRaw.split(',').map((s) => s.trim()).filter(Boolean);
    onSave({ ...formData, types });
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        // close when clicking the overlay (outside the dialog)
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div onMouseDown={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">{event ? `Edit ${event.title}` : 'Create Event'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme (short)</label>
            <input type="text" name="theme" value={formData.theme || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Theme URL</label>
            <input type="url" name="fullThemeUrl" value={formData.fullThemeUrl || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category || (event ? event.category || 'Engineering' : 'Engineering')}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              {((categories && categories.length ? categories : ['Engineering', 'Science', 'Technology', 'Design']) ).map((cat: string) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
            <input type="text" name="teamSize" value={formData.teamSize || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Types (comma separated)</label>
            <input name="types" value={typesRaw} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rubric URL</label>
            <input type="url" name="rubricUrl" value={formData.rubricUrl || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            {event && (
              <button
                type="button"
                onClick={() => {
                  if (!event) return;
                  const ok = confirm('Delete this event? This action cannot be undone.');
                  if (ok && onDelete) {
                    onDelete(event.id);
                  }
                }}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            )}
            <button type="submit" className="bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium">{event ? 'Update Event' : 'Create Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}