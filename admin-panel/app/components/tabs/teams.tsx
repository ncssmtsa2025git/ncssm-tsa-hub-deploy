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
        <h2 className="text-2xl font-semibold text-ink">Teams</h2>
        <button
          onClick={handleCreateClick}
          className="btn btn-primary"
        >
          New team
        </button>
      </div>

      <div className="panel p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <input
            type="text"
            placeholder="Search teams"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field flex-1"
          />
        </div>

        {/* Event filter dropdown */}
        <div className="flex items-center justify-between gap-4">
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="field w-auto"
          >
            <option value="All">All events</option>
            {availableEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
          <div className="text-sm text-muted">{filteredTeams.length} result{filteredTeams.length === 1 ? '' : 's'}</div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted mt-3">
            <div className="w-4 h-4 border-2 border-line border-t-ink-soft rounded-full animate-spin"></div>
            <span>Loading teams…</span>
          </div>
        )}
        {error && (
          <div className="bg-signal/5 border border-signal/25 text-signal p-3 rounded-md mt-3">
            <p className="text-sm text-signal font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Teams Grid - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => handleTeamClick(team)}
            className="relative bg-white rounded-md border border-line hover:border-tsa/40 transition-colors cursor-pointer overflow-hidden group"
          >
            <div className="p-5">
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-ink group-hover:text-tsa transition-colors">
                        {team.event.title} Team {team.teamNumber}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      <span className="text-sm text-muted">
                        {team.conference}
                      </span>
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
                              ? 'inline-flex items-center gap-2 px-3 py-1 bg-tsa-tint text-tsa rounded text-xs font-medium border border-line'
                              : 'inline-flex items-center gap-2 px-3 py-1 bg-paper-2 text-ink-soft rounded text-xs font-medium border border-line'
                          }
                        >
                          <span>{member.name}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-muted tabular">
                      Next check-in {team.checkInDate ? (() => {
                        const dateStr = team.checkInDate.split('T')[0];
                        const [y, m, d] = dateStr.split('-').map(Number);
                        return new Date(y, m - 1, d).toLocaleDateString();
                      })() : '-'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingCheckinsFor(team.id);
                      }}
                      className="btn btn-secondary py-1.5"
                    >
                      Check-ins
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && !loading && (
        <div className="text-center py-8 panel">
          <svg className="w-10 h-10 mx-auto text-line mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-muted text-sm font-medium">No teams found</p>
          <p className="text-muted text-xs mt-1">Try adjusting your search or filters</p>
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