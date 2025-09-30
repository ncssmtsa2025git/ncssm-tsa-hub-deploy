'use client'

import React from 'react'
import Link from 'next/link'
import { ExternalLink, BookOpen } from 'lucide-react'

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
    description: 'Topics for specific events',
    href: 'https://tsaweb.org/competitions/themes-and-problems',
    category: 'TSA',
  },
  {
    title: 'NCTSA App',
    description: 'Competition-day app, developed by our own chapter',
    href: 'https://apps.apple.com/us/app/north-carolina-tsa-conference/id6743861783',
    category: 'TSA',
  },
  {
    title: 'TSA Student Member Site',
    description: 'Submit projects here',
    href: 'https://tsamembership.registermychapter.com/members#',
    category: 'TSA',
  },
  {
    title: 'TSACE',
    description: 'Database of past projects from across the nation',
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
  }
]

export default function ResourcesPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16 text-blue-200" />
          </div>
          <h1 className="text-5xl font-bold mb-6">Resources</h1>
          <p className="text-xl mb-8 max-w-4xl mx-auto">
            Helpful links for NCSSM students and TSA members: guides, calendars, and official sites.
          </p>
        </div>
      </section>    

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


