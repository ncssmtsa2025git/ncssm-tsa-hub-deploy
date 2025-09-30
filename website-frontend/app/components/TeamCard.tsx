"use client";
import React from 'react';
import { Calendar } from 'lucide-react';
import { Team } from '../models/team';
import { Checkin } from '../models/checkin';
import { User } from '../models/user';

interface Props {
  team: Team;
  checkins: Checkin[];
  onViewCheckin: (c: Checkin) => void;
  onUpload: (teamId: string) => void;
}

export default function TeamCard({ team, checkins, onViewCheckin, onUpload }: Props) {
  return (
    <div className="relative border-l-2 border-blue-600 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <span className="text-xs font-medium text-slate-500">Submitted Check-ins</span>
        <div className="flex items-center gap-2">
          {checkins.length > 0 ? (
            checkins.map((c) => (
              <button
                key={c.id}
                onClick={() => onViewCheckin(c)}
                title={`Submitted ${new Date(c.submitted_at).toLocaleString()}`}
                className="px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-md hover:bg-green-100 transition-colors font-medium"
              >
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {new Date(c.submitted_at).toLocaleDateString()}
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-md border border-slate-200">None</span>
          )}
        </div>
      </div>

      <div className="mb-3 pr-32">
        <h4 className="font-semibold text-lg text-gray-900">
          {team.event.title} Team {team.teamNumber}
        </h4>
        <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-800 rounded text-xs font-semibold border border-blue-200">
          {team.conference}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Team Members
        </p>
        <div className="flex flex-wrap gap-2">
          {team.members.map((member: User) => (
            <span
              key={member.id}
              className={`px-3 py-1 rounded text-sm border ${
                member.id === team.captain.id
                  ? "bg-blue-50 text-blue-800 border-blue-200 font-medium"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {member.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Check-in:</span>
          <span>{new Date(team.checkInDate).toLocaleDateString()}</span>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          onClick={() => onUpload(team.id)}
        >
          Upload Check-In
        </button>
      </div>
    </div>
  );
}
