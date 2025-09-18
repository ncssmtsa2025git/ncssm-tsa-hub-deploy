'use client'

import { JSX } from 'react'
import Link from 'next/link'
import { ExternalLink, BookOpen, Users, Calendar, Info } from 'lucide-react'

type Resource = {
  title: string
  description: string
  href: string
  category: 'NCSSM' | 'TSA' | 'Chapter'
}

const resources: Resource[] = [
  {
    title: 'NCSSM Official Site',
    description: 'Programs, admissions, calendars, and news from NCSSM.',
    href: 'https://www.ncssm.edu/',
    category: 'NCSSM',
  },
  {
    title: 'TSA Competitive Events Guide',
    description: 'Rules, themes, and updates for TSA competitive events.',
    href: 'https://tsaweb.org/competitions-programs/tsa',
    category: 'TSA',
  },
  {
    title: 'NCSSM Calendar',
    description: 'Keep track of important academic and campus dates.',
    href: 'https://www.ncssm.edu/events',
    category: 'NCSSM',
  },
]

export default function ResourcesPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-blue-200" />
            <h1 className="text-4xl font-bold">Resources</h1>
          </div>
          <p className="text-blue-100 max-w-2xl">
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


