"use client";
import React, { JSX, useEffect, useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Team } from "../models/team";
import { User } from "../models/user";

// Card Components
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

function Card({ className = "", children }: CardProps) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>;
}
function CardHeader({ className = "", children }: CardProps) {
  return <div className={`border-b p-4 ${className}`}>{children}</div>;
}
function CardTitle({ className = "", children }: CardProps) {
  return <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>;
}
function CardContent({ className = "", children }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

// Upcoming dates
interface UpcomingDate {
  date: string;
  event: string;
  type: string;
}

const upcomingDates: UpcomingDate[] = [
  { date: "2025-02-15", event: "3D Printing Workshop", type: "Workshop" },
  { date: "2025-02-20", event: "Regional Conference Check-in", type: "Check-in Period" },
  { date: "2025-02-25", event: "Arduino Programming Workshop", type: "Workshop" },
  { date: "2025-03-10", event: "State Conference Check-in", type: "Check-in Period" },
  { date: "2025-03-18", event: "Public Speaking Workshop", type: "Workshop" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function Portal(): JSX.Element {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/teams", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch teams (${res.status})`);
        const data: Team[] = await res.json();
        setTeams(data);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name ?? "Student"}
          </h1>
          <p className="text-gray-600">NCSSM TSA Student Dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Teams */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>My Teams</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading teams...</p>
              ) : teams.length === 0 ? (
                <p className="text-gray-500">No teams found</p>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {team.event.title} {team.teamNumber}
                        </h4>
                        <p className="text-sm text-gray-600">{team.conference}</p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Team Members:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member: User) => (
                            <span
                              key={member.id}
                              className={`px-2 py-1 rounded text-sm border ${
                                member.id === team.captain.id
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-white text-gray-700"
                              }`}
                            >
                              {member.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Check-in: {formatDate(team.checkInDate)}
                          </span>
                        </div>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          type="button"
                        >
                          Upload Check-In Info
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Upcoming Dates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDates.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-3">
                    <div className="font-medium text-sm text-blue-600">
                      {formatDate(item.date)}
                    </div>
                    <div className="text-gray-800 text-sm">{item.event}</div>
                    <div className="text-xs text-gray-500">{item.type}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
