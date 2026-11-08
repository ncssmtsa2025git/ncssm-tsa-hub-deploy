"use client";

import { useState, useEffect, useRef } from 'react';
import type { Event as EventModel } from '../../../../../website-frontend/app/models/event';

const TSA_CATEGORIES = [
  'Architecture and Construction Technology',
  'Communications Technology',
  'Computer Science',
  'Leadership',
  'Manufacturing and Transportation Technology',
  'STEM (General)',
  'STEM and the Arts',
  'Technology and Research',
];

interface EventFormProps {
  event: EventModel | null;
  onClose: () => void;
  onSave: (event: Partial<EventModel>) => void;
  onDelete?: (id: string) => void;
}

export default function EventForm({ event, onClose, onSave, onDelete }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<EventModel>>({
    title: '',
    theme: '',
    fullThemeUrl: '',
    description: '',
    category: TSA_CATEGORIES[0],
    teamSize: '1',
    types: [],
    rubricUrl: '',
    rubricPages: '',
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
        rubricPages: event.rubricPages,
      });
      setTypesRaw((event.types || []).join(', '));
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'types') {
      setTypesRaw(value);
      return;
    }
    setFormData((prev: Partial<EventModel>) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const types = typesRaw.split(',').map((s) => s.trim()).filter(Boolean);
    onSave({ ...formData, types });
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4"
    >
      <div 
        onMouseDown={(e) => e.stopPropagation()} 
        className="bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-line px-8 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-ink">
              {event ? 'Edit event' : 'New event'}
            </h3>
            {event && (
              <p className="text-muted text-sm mt-1">Updating: {event.title}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-ink hover:bg-paper-2 rounded-md text-2xl transition-colors w-9 h-9 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="label">
                Event title *
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title || ''} 
                onChange={handleChange} 
                className="field" 
                placeholder="e.g., Architectural Design"
                required 
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme */}
              <div>
                <label className="label">
                  Theme (short)
                </label>
                <input 
                  type="text" 
                  name="theme" 
                  value={formData.theme || ''} 
                  onChange={handleChange} 
                  className="field" 
                  placeholder="Brief theme description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="label">
                  Category *
                </label>
                {/* TSA's official high school categories; the website groups events by these exact names */}
                <select
                  name="category"
                  value={formData.category || TSA_CATEGORIES[0]}
                  onChange={handleChange}
                  className="field bg-white"
                >
                  {[
                    ...TSA_CATEGORIES,
                    // keep an older event's category selectable instead of silently showing the first option
                    ...(formData.category && !TSA_CATEGORIES.includes(formData.category) ? [formData.category] : []),
                  ].map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Theme URL */}
            <div>
              <label className="label">
                Full theme link
              </label>
              <input 
                type="url" 
                name="fullThemeUrl" 
                value={formData.fullThemeUrl || ''} 
                onChange={handleChange} 
                className="field" 
                placeholder="https://..."
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Size */}
              <div>
                <label className="label">
                  Team size
                </label>
                <input 
                  type="text" 
                  name="teamSize" 
                  value={formData.teamSize || ''} 
                  onChange={handleChange} 
                  className="field" 
                  placeholder="e.g., 1-3"
                />
              </div>

              {/* Rubric URL */}
              <div>
                <label className="label">
                  Rubric link
                </label>
                <input 
                  type="url" 
                  name="rubricUrl" 
                  value={formData.rubricUrl || ''} 
                  onChange={handleChange} 
                  className="field" 
                  placeholder="https://..."
                />
              </div>

              {/* Rubric pages (the rubric lives inside the full events guide) */}
              <div>
                <label className="label">
                  Rubric pages
                </label>
                <input
                  type="text"
                  name="rubricPages"
                  value={formData.rubricPages || ''}
                  onChange={handleChange}
                  className="field"
                  placeholder="e.g., 46–48"
                />
              </div>
            </div>

            {/* Types */}
            <div>
              <label className="label">
                Event types
              </label>
              <input 
                name="types" 
                value={typesRaw} 
                onChange={handleChange} 
                className="field" 
                placeholder="Individual, Team, Design Brief (comma separated)"
              />
              <p className="text-xs text-muted mt-2">Separate multiple types with commas</p>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                Description
              </label>
              <textarea 
                name="description" 
                value={formData.description || ''} 
                onChange={handleChange} 
                rows={5} 
                className="field resize-none" 
               
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-line">
              {event && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (!event) return;
                    const ok = confirm('Delete this event? This action cannot be undone.');
                    if (ok && onDelete) {
                      onDelete(event.id);
                    }
                  }}
                  className="btn btn-danger"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {event ? 'Save' : 'Create event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}