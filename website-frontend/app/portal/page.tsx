"use client";
import React from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

// Type definitions
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface Team {
  name: string;
  conference: string;
  members: string[];
  captain: string;
  checkIn: string;
}

interface UpcomingDate {
  date: string;
  event: string;
  type: string;
}
// Card Components
function Card({ className = "", children }: CardProps): JSX.Element {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children }: CardProps): JSX.Element {
  return (
    <div className={`border-b border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ className = "", children }: CardProps): JSX.Element {
  return (
    <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}

function CardContent({ className = "", children }: CardProps): JSX.Element {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

// Mock user data
const mockUser = { name: "Alex Johnson" };

export default function Portal(): JSX.Element {
  const { user } = useAuth();

  const teams: Team[] = [
    {
      name: "Animatronics Team 1",
      conference: "State TSA Conference 2025",
      members: ["Alex Johnson", "Sarah Chen", "Marcus Rodriguez"],
      captain: "Alex Johnson",
      checkIn: "March 14-16, 2025",
    },
    {
      name: "Programming Challenge Team",
      conference: "Regional TSA Conference 2025",
      members: ["Alex Johnson"],
      captain: "Alex Johnson",
      checkIn: "February 27-28, 2025",
    },
    {
      name: "Video Game Design Team 2",
      conference: "State TSA Conference 2025",
      members: ["Alex Johnson", "Emma Wilson", "David Park", "Lisa Martinez"],
      captain: "Emma Wilson",
      checkIn: "March 21-22, 2025",
    },
  ];

  const upcomingDates: UpcomingDate[] = [
    { date: "Feb 15", event: "3D Printing Workshop", type: "Workshop" },
    {
      date: "Feb 20-22",
      event: "Regional Conference Check-in",
      type: "Check-in Period",
    },
    { date: "Feb 25", event: "Arduino Programming Workshop", type: "Workshop" },
    {
      date: "Mar 10-12",
      event: "State Conference Check-in",
      type: "Check-in Period",
    },
    { date: "Mar 18", event: "Public Speaking Workshop", type: "Workshop" },
  ];

  const actionItems: string[] = [
    "Submit transportation form",
    "Complete liability waiver",
    "Upload team portfolio",
    "Fill out dietary restrictions form",
    "Confirm hotel roommate preferences",
    "Submit project documentation",
  ];

  const handleUploadCheckIn = (): void => {
    // Implementation for upload check-in functionality
    console.log("Upload check-in info clicked");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {mockUser.name}
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
              <div className="space-y-4">
                {teams.map((team: Team, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {team.name}
                      </h4>
                      <p className="text-sm text-gray-600">{team.conference}</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Team Members:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member: string, memberIndex: number) => (
                          <span
                            key={memberIndex}
                            className={`px-2 py-1 rounded text-sm border ${
                              member === team.captain
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-white text-gray-700"
                            }`}
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Check-in: {team.checkIn}</span>
                      </div>
                      <button 
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        onClick={handleUploadCheckIn}
                        type="button"
                      >
                        Upload Check-In Info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                {upcomingDates.map((item: UpcomingDate, index: number) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-3">
                    <div className="font-medium text-sm text-blue-600">
                      {item.date}
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