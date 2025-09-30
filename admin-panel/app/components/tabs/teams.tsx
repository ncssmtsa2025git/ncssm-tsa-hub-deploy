"use client";

import { useState, useEffect } from 'react';
import TeamForm from './forms/team-form';
import CheckinsModal from './checkins-modal';
import { eventService } from '../../services/event';
import { userService } from '../../services/user';
import { teamService } from '../../services/team';
import type { Team } from '../../../../website-frontend/app/models/team';
import type { Event } from '../../../../website-frontend/app/models/event';
import type { User } from '../../../../website-frontend/app/models/user';

export default function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  // conference filtering removed per user request
  // const [selectedConference, setSelectedConference] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [viewingCheckinsFor, setViewingCheckinsFor] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load teams, events, and users from API
      const [teamsResp, eventsResp, usersResp] = await Promise.all([
        teamService.listTeams().catch(() => [] as Team[]),
        eventService.listEvents().catch(() => [] as Event[]),
        userService.listUsers().catch(() => [] as User[]),
      ]);
      setTeams(teamsResp || []);
      setAvailableEvents(eventsResp || []);
      setAvailableUsers(usersResp || []);
    } catch (err: unknown) {
      console.error('Error loading teams', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const filteredTeams = teams.filter((team) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      team.teamNumber.toLowerCase().includes(q) ||
      team.event.title.toLowerCase().includes(q) ||
      team.captain.name?.toLowerCase().includes(q) ||
      team.members.some((m) => m.name?.toLowerCase().includes(q));
    const matchesEvent = selectedEventFilter === 'All' || team.event?.id === selectedEventFilter;
    return matchesSearch && matchesEvent;
  });

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsCreating(false);
  };

  const handleCreateClick = () => {
    setSelectedTeam(null);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setSelectedTeam(null);
    setIsCreating(false);
  };

  const handleSave = async (teamData: Partial<Team>) => {
    try {
      if (selectedTeam?.id) {
        const updated = await teamService.updateTeam(selectedTeam.id, teamData);
        setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await teamService.createTeam(teamData);
        setTeams((prev) => [created, ...prev]);
      }
      handleCloseForm();
    } catch (err: unknown) {
      console.error('Save error', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to save team');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await teamService.deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      handleCloseForm();
    } catch (err: unknown) {
      console.error('Delete error', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to delete team');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
        >
          + Create Team
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-6 py-4 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-0 outline-none"
          />
        </div>

        {/* Event filter dropdown */}
        <div className="flex items-center justify-between gap-4">
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="px-5 py-3 border border-slate-200 rounded-xl bg-white text-slate-700"
          >
            <option value="All">All Events</option>
            {availableEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
          <div className="text-sm text-slate-400">{filteredTeams.length} result{filteredTeams.length === 1 ? '' : 's'}</div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600 mt-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading teams...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md mt-3">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Teams Grid - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => handleTeamClick(team)}
            className="relative bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer border-l-2 border-blue-800 overflow-hidden group"
          >
            <div className="p-5">
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-blue-800 transition-colors duration-150">
                        {team.event.title} Team {team.teamNumber}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 rounded text-xs font-semibold">
                        {team.conference}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">Members:</span>
                      <span>{team.members.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {team.members.map((member) => {
                      const isCaptain = member.id === team.captain?.id;
                      return (
                        <span
                          key={member.id}
                          className={
                            isCaptain
                              ? 'inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 rounded text-xs font-medium border border-blue-200'
                              : 'inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200'
                          }
                        >
                          <span>{member.name}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 rounded text-xs font-medium border border-amber-200">
                      Check-in: {new Date(team.checkInDate).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingCheckinsFor(team.id);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium transition-all hover:bg-blue-700 hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Checkins
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && !loading && (
        <div className="text-center py-8 bg-white rounded-md shadow-sm border border-slate-100">
          <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-slate-500 text-sm font-medium">No teams found</p>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {(selectedTeam || isCreating) && (
        <TeamForm 
          team={selectedTeam} 
          onClose={handleCloseForm} 
          onSave={handleSave} 
          onDelete={handleDelete}
          availableEvents={availableEvents}
          availableUsers={availableUsers}
        />
      )}

      {viewingCheckinsFor && (
        <CheckinsModal teamId={viewingCheckinsFor} onClose={() => setViewingCheckinsFor(null)} />
      )}
    </div>
  );
}