"use client";

import { useState } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import EventsTab from './components/tabs/events';
import UsersTab from './components/tabs/users';
import TeamsTab from './components/tabs/teams';
import { AdminsTab, AnnouncementTab, DatesTab, GalleryTab, OfficersTab, ResourcesTab } from './components/content/site-tabs';

type TabType = 'events' | 'users' | 'teams' | 'announcement' | 'dates' | 'officers' | 'resources' | 'gallery' | 'admins';

const icon = (d: string) => (
  <svg className="size-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
  </svg>
);

// Pages officers edit on the public website
const SITE_TABS: { id: TabType; label: string; icon: React.ReactElement }[] = [
  { id: 'announcement', label: 'Announcement', icon: icon('M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z') },
  { id: 'dates', label: 'Key dates', icon: icon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z') },
  { id: 'officers', label: 'Officers', icon: icon('M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z') },
  { id: 'resources', label: 'Resources', icon: icon('M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1') },
  { id: 'gallery', label: 'Gallery', icon: icon('M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z') },
];
const ACCESS_TABS: { id: TabType; label: string; icon: React.ReactElement }[] = [
  { id: 'admins', label: 'Admins', icon: icon('M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z') },
];

export default function AdminPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('teams');

  const tabs: { id: TabType; label: string; icon: React.ReactElement }[] = [
    { id: 'teams', label: 'Teams', icon: icon('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z') },
    { id: 'events', label: 'Events', icon: icon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z') },
    { id: 'users', label: 'Users', icon: icon('M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z') },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventsTab />;
      case 'users':
        return <UsersTab />;
      case 'teams':
        return <TeamsTab />;
      case 'announcement':
        return <AnnouncementTab />;
      case 'dates':
        return <DatesTab />;
      case 'officers':
        return <OfficersTab />;
      case 'resources':
        return <ResourcesTab />;
      case 'gallery':
        return <GalleryTab />;
      case 'admins':
        return <AdminsTab />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-paper">
        <header className="sticky top-0 z-40 bg-tsa-deep text-white">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ncssm_tsa_logo.jpg" alt="" className="h-8 w-8 rounded-full ring-2 ring-white/15" />
              <span className="display text-xl">NCSSM Durham</span>
              <span className="text-sm text-white/60">Admin</span>
            </div>
            <div className="flex items-center gap-5 text-sm">
              <a
                href={process.env.NEXT_PUBLIC_SITE_URL || 'https://ncssm-tsa-hub.vercel.app'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/75 hover:text-white"
              >
                View website ↗
              </a>
              <button onClick={logout} className="text-white/75 hover:text-white">
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line bg-white px-3 py-5">
            <nav className="space-y-6" aria-label="Admin sections">
              {[
                { heading: 'Chapter', items: tabs },
                { heading: 'Website', items: SITE_TABS },
                { heading: 'Access', items: ACCESS_TABS },
              ].map((group) => (
                <div key={group.heading}>
                  <p className="mb-1 px-3 text-xs text-muted">{group.heading}</p>
                  <div className="space-y-0.5">
                    {group.items.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                        className={`flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'bg-tsa-tint font-medium text-tsa-deep'
                            : 'text-ink-soft hover:bg-paper-2 hover:text-ink'
                        }`}
                      >
                        <span className={activeTab === tab.id ? 'text-tsa' : 'text-muted'}>{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
            <div className="mx-auto max-w-5xl">{renderTabContent()}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
