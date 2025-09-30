"use client";

import { useState, useEffect, useRef } from 'react';
import type { Team } from '../../../../../website-frontend/app/models/team';
import type { Event } from '../../../../../website-frontend/app/models/event';
import type { User } from '../../../../../website-frontend/app/models/user';

interface TeamFormProps {
  team: Team | null;
  onClose: () => void;
  onSave: (team: Partial<Team>) => void;
  onDelete?: (id: string) => void;
  availableEvents: Event[];
  availableUsers: User[];
}

export default function TeamForm({ team, onClose, onSave, onDelete, availableEvents, availableUsers }: TeamFormProps) {
  const [formData, setFormData] = useState<Partial<Team>>({
    teamNumber: '',
    conference: 'Regional',
    checkInDate: '',
    event: undefined,
    members: [],
    captain: undefined,
  });
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [selectedCaptain, setSelectedCaptain] = useState<User | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (team) {
      // Normalize incoming checkInDate (backend may send ISO datetime). HTML date input expects yyyy-MM-dd
      const normalizeDate = (d?: string | null) => {
        if (!d) return '';
        // If already in yyyy-mm-dd form
        const m = d.match(/^\d{4}-\d{2}-\d{2}/);
        if (m) return m[0];
        // Fallback: split at T if present
        if (d.includes('T')) return d.split('T')[0];
        return d;
      };

      setFormData({
        teamNumber: team.teamNumber,
        conference: team.conference,
        checkInDate: normalizeDate(team.checkInDate),
        event: team.event,
        members: team.members,
        captain: team.captain,
      });
      setSelectedMembers(team.members || []);
      setSelectedCaptain(team.captain || null);
    }
  }, [team]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'eventId') {
      const selectedEvent = availableEvents.find(ev => ev.id === value);
      setFormData((prev) => ({ ...prev, event: selectedEvent }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = (user: User) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      const newMembers = [...selectedMembers, user];
      setSelectedMembers(newMembers);
      setFormData((prev) => ({ ...prev, members: newMembers }));
    }
    setMemberSearch('');
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = (userId: string) => {
    const newMembers = selectedMembers.filter(m => m.id !== userId);
    setSelectedMembers(newMembers);
    setFormData((prev) => ({ ...prev, members: newMembers }));
    
    // If removed member was captain, clear captain
    if (selectedCaptain?.id === userId) {
      setSelectedCaptain(null);
      setFormData((prev) => ({ ...prev, captain: undefined }));
    }
  };

  const handleSetCaptain = (user: User) => {
    setSelectedCaptain(user);
    setFormData((prev) => ({ ...prev, captain: user }));
  };

  const filteredUsers = availableUsers.filter(user => 
    user.name?.toLowerCase().includes(memberSearch.toLowerCase()) &&
    !selectedMembers.find(m => m.id === user.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event) {
      alert('Please select an event');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('Please add at least one team member');
      return;
    }
    if (!selectedCaptain) {
      alert('Please select a team captain');
      return;
    }
    // Ensure checkInDate is normalized to yyyy-MM-dd before submitting
    const normalizeDateForSubmit = (d?: string | null) => {
      if (!d) return undefined;
      const m = d.match(/^\d{4}-\d{2}-\d{2}/);
      if (m) return m[0];
      if (d.includes('T')) return d.split('T')[0];
      return d;
    };

    onSave({
      ...formData,
      checkInDate: normalizeDateForSubmit(formData.checkInDate as string) || undefined,
      members: selectedMembers,
      captain: selectedCaptain,
      conference: formData.conference,
    });
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
              {team ? 'Edit Team' : 'Create New Team'}
            </h3>
            {team && (
              <p className="text-blue-100 text-sm mt-1">Updating: Team {team.teamNumber}</p>
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
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Team Number *
                </label>
                <input 
                  type="text" 
                  name="teamNumber" 
                  value={formData.teamNumber || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                  placeholder="e.g., T001"
                  required 
                />
              </div>

              {/* Conference */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Conference *
                </label>
                <select
                  name="conference"
                  value={formData.conference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200 bg-white"
                  required
                >
                  <option value="Regional Conference 2025">Regional Conference 2025</option>
                  <option value="State Conference 2025">State Conference 2025</option>
                  <option value="National Conference 2025">National Conference 2025</option>
                </select>
              </div>
            </div>

            {/* Event Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Event *
              </label>
              <select
                name="eventId"
                value={formData.event?.id || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200 bg-white"
                required
              >
                <option value="">Select an event</option>
                {availableEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({event.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Check-in Date *
              </label>
              <input 
                type="date" 
                name="checkInDate" 
                value={formData.checkInDate || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                required 
              />
            </div>

            {/* Team Members Search */}
            <div ref={searchRef}>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Team Members *
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-200" 
                  placeholder="Search and add members..."
                />
                
                {/* Dropdown */}
                {showMemberDropdown && memberSearch && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleAddMember(user)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-500 text-sm">No users found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Members Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-900 rounded-lg border border-blue-200"
                  >
                    <span className="text-sm font-medium">{member.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">Search for users and click to add them to the team</p>
            </div>

            {/* Captain Selection */}
            {selectedMembers.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Team Captain *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedMembers.map((member) => (
                    <label
                      key={member.id}
                      className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedCaptain?.id === member.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-400 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="captain"
                        value={member.id}
                        checked={selectedCaptain?.id === member.id}
                        onChange={() => handleSetCaptain(member)}
                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-slate-500">{member.email}</div>
                      </div>
                      {selectedCaptain?.id === member.id && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t-2 border-slate-100">
              {team && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (!team) return;
                    const ok = confirm('Delete this team? This action cannot be undone.');
                    if (ok && onDelete) {
                      onDelete(team.id);
                    }
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Team
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
                  {team ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}