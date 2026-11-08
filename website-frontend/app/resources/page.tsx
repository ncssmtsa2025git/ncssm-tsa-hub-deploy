'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import PageBanner from '../components/PageBanner'
import { type Resource, getContent } from '../services/content'

export default function ResourcesPage(): React.ReactElement {
  // Edited in Admin > Resources
  const [resources, setResources] = useState<Resource[] | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    getContent<Resource[]>('resources')
      .then(setResources)
      .catch(() => setFailed(true))
  }, [])

  return (
    <div className="min-h-screen bg-paper-2">
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
          {failed && (
            <p className="py-10 text-center text-ink-soft">Resources couldn&apos;t load. Refresh the page to try again.</p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources === null && !failed &&
              Array.from({ length: 6 }, (_, i) => (
                <div key={i} aria-hidden className="h-[7.5rem] animate-pulse rounded-lg border border-line bg-paper-2" />
              ))}
            {resources?.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg border border-line bg-white p-6 transition-colors hover:border-tsa/40"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink group-hover:text-tsa">
                    {r.title}
                    <ExternalLink aria-hidden className="ml-1.5 inline h-4 w-4 align-[-2px] text-muted group-hover:text-tsa" />
                  </h3>
                  <span className="tag-badge shrink-0">{r.category}</span>
                </div>
                <p className="text-sm text-ink-soft">{r.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


