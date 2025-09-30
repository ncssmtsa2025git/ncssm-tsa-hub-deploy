"use client";

import { useState, useEffect, useRef } from 'react';
import type { Event as EventModel } from '../../../../../website-frontend/app/models/event';

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
    category: 'Architecture & Construction',
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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
    >
      <div 
        onMouseDown={(e) => e.stopPropagation()} 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-4 flex justify-between items-center shadow-lg">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {event ? 'Edit Event' : 'Create New Event'}
            </h3>
            {event && (
              <p className="text-blue-100 text-sm mt-1">Updating: {event.title}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 text-3xl transition-all duration-200 w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Event Title *
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                placeholder="e.g., Architectural Design"
                required 
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Theme (Short)
                </label>
                <input 
                  type="text" 
                  name="theme" 
                  value={formData.theme || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                  placeholder="Brief theme description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Category *
                </label>
                {/* Hardcoded categories - do not update dynamically from props */}
                <select
                  name="category"
                  value={formData.category || (event ? event.category || 'Architecture & Construction' : 'Architecture & Construction')}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200 bg-white"
                >
                  {([
                    'Architecture & Construction',
                    'Communications',
                    'Computer Science & IT',
                    'Leadership',
                    'Manufacturing',
                    'STEM',
                    'STEM & Arts',
                    'Tech & Research',
                  ]).map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Theme URL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Full Theme URL
              </label>
              <input 
                type="url" 
                name="fullThemeUrl" 
                value={formData.fullThemeUrl || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                placeholder="https://..."
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Size */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Team Size
                </label>
                <input 
                  type="text" 
                  name="teamSize" 
                  value={formData.teamSize || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                  placeholder="e.g., 1-3"
                />
              </div>

              {/* Rubric URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Rubric URL
                </label>
                <input 
                  type="url" 
                  name="rubricUrl" 
                  value={formData.rubricUrl || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Types */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Event Types
              </label>
              <input 
                name="types" 
                value={typesRaw} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                placeholder="Individual, Team, Design Brief (comma separated)"
              />
              <p className="text-xs text-slate-500 mt-2">Separate multiple types with commas</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Description
              </label>
              <textarea 
                name="description" 
                value={formData.description || ''} 
                onChange={handleChange} 
                rows={5} 
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200 resize-none" 
                placeholder="Provide a detailed description of the event..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t-2 border-slate-100">
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
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Event
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {event ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}