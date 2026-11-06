'use client'

import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import PageBanner from '../components/PageBanner'

type Resource = {
  title: string
  description: string
  href: string
  category: 'NCSSM' | 'TSA' | 'Chapter'
}

const resources: Resource[] = [
  {
    title: 'Events List',
    description: 'Full categorized list of events',
    href: 'https://tsaweb.org/competitions',
    category: 'TSA',
  },
  {
    title: 'Events Manager',
    description: 'See & sign up for events.',
    href: 'https://docs.google.com/spreadsheets/d/1TbLTrIRu7-l_Uhu94ux0SDNcvHvIvzpCRTqWR_-HfA8/edit?usp=sharing',
    category: 'NCSSM',
  },
  {
    title: 'NCTSA Website',
    description: 'Resources for NCTSA',
    href: 'https://www.nctsa.org',
    category: 'TSA',
  },
  {
    title: 'Themes & Problems',
    description: '2026–27 topics for specific events',
    href: 'https://tsaweb.org/competitions/themes-and-problems',
    category: 'TSA',
  },
  {
    title: 'NCTSA App',
    description: 'Competition-day app, developed by our own chapter (Android)',
    href: 'https://play.google.com/store/apps/details?id=com.northcarolinatsa.android',
    category: 'TSA',
  },
  {
    title: 'TSA Student Member Site',
    description: 'Submit projects here',
    href: 'https://tsamembership.registermychapter.com/members',
    category: 'TSA',
  },
  {
    title: 'TSACE',
    description: 'Student-run database of past projects from across the nation',
    href: 'https://www.tsace.org/projects',
    category: 'TSA',
  },
  {
    title: 'High School Competitive Events Directory',
    description: 'Quick links to multiple resources',
    href: 'https://www.nctsa.org/high-school-events',
    category: 'TSA',
  },
  {
    title: 'Competition Updates',
    description: 'View yearly event-specific changes',
    href: 'https://tsaweb.org/competitions/competition-updates',
    category: 'TSA',
  },
  {
    title: 'Competitive Events Guide',
    description: '2027 & 2028 rules and rubrics, shared by NCTSA',
    href: 'https://drive.google.com/file/d/1SwPAK48hAUQKy1NkzkMRvvktUQ4qYXoI/view',
    category: 'TSA',
  },
  {
    title: 'NCTSA State Conference',
    description: 'April 15–17, 2027 in Greensboro',
    href: 'https://www.nctsa.org/state-conference',
    category: 'TSA',
  },
  {
    title: 'Nationals Dates & Deadlines',
    description: 'June 23–27, 2027 in Orlando',
    href: 'https://tsaweb.org/conferences/2027-national-tsa-conference/dates-and-deadlines_2027',
    category: 'TSA',
  }
]

export default function ResourcesPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        title="Resources"
        image="/pics/states_2026/IMG_4631.jpg"
        alt="Two NCSSM Durham members holding their trophy in front of the NC TSA backdrop at the 2026 State Conference"
        focus="50% 38%"
      >
        Everything for the 2026–27 season in one place.
      </PageBanner>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <Link
                key={r.title}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                    {r.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      r.category === 'NCSSM'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : r.category === 'TSA'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}
                  >
                    {r.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{r.description}</p>
                <div className="flex items-center text-blue-700 font-medium gap-1">
                  Visit resource <ExternalLink className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


