'use client';

import { useState } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import EventsTab from './components/tabs/events';
import UsersTab from './components/tabs/users';
import TeamsTab from './components/tabs/teams';

type TabType = 'events' | 'users' | 'teams';

export default function AdminPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('events');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'events', label: 'Events' },
    { id: 'users', label: 'Users' },
    { id: 'teams', label: 'Teams' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventsTab />;
      case 'users':
        return <UsersTab />;
      case 'teams':
        return <TeamsTab />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-blue-900 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-bold text-white">
                  NCSSM TSA Admin Portal
                </h1>
                <p className="text-blue-200 text-xs">
                  Management System
                </p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-white bg-blue-800 hover:bg-blue-700 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="flex max-w-7xl mx-auto">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}