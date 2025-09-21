'use client'

import { JSX, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Grid, Calendar, Users, Camera, X, ChevronDown } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  category: 'Competition' | 'Workshop' | 'Meeting' | 'Award'
  date: string
  description: string
  imageUrl: string
  participants?: number
}

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'State TSA Competition 2024',
    category: 'Competition',
    date: 'March 15, 2024',
    description: 'Our team competing at the North Carolina TSA State Conference, showcasing projects in robotics, coding, and digital design.',
    imageUrl: '/api/placeholder/600/400',
    participants: 24
  },
  {
    id: '2',
    title: 'Robotics Workshop',
    category: 'Workshop',
    date: 'February 20, 2024',
    description: 'Hands-on robotics workshop where students learned programming and mechanical design principles.',
    imageUrl: '/api/placeholder/600/400',
    participants: 15
  },
  {
    id: '3',
    title: 'National TSA Conference',
    category: 'Competition',
    date: 'June 25, 2024',
    description: 'PC TSA members representing North Carolina at the National TSA Conference in Dallas, Texas.',
    imageUrl: '/api/placeholder/600/400',
    participants: 8
  },
  {
    id: '4',
    title: 'Weekly Chapter Meeting',
    category: 'Meeting',
    date: 'January 10, 2024',
    description: 'Regular chapter meeting discussing upcoming events and project progress updates.',
    imageUrl: '/api/placeholder/600/400',
    participants: 32
  },
  {
    id: '5',
    title: 'First Place - Video Game Design',
    category: 'Award',
    date: 'March 16, 2024',
    description: 'Our video game design team receiving first place at the state competition for their innovative retro-style game.',
    imageUrl: '/api/placeholder/600/400',
    participants: 3
  },
  {
    id: '6',
    title: 'Coding Workshop',
    category: 'Workshop',
    date: 'November 8, 2024',
    description: 'Interactive coding session focusing on algorithms and data structures preparation for competitions.',
    imageUrl: '/api/placeholder/600/400',
    participants: 18
  },
  {
    id: '7',
    title: 'Team Building Activity',
    category: 'Meeting',
    date: 'September 5, 2024',
    description: 'Fun team building exercises and icebreakers to welcome new members to PC TSA.',
    imageUrl: '/api/placeholder/600/400',
    participants: 28
  },
  {
    id: '8',
    title: 'Regional Awards Ceremony',
    category: 'Award',
    date: 'April 12, 2024',
    description: 'PC TSA members being recognized for outstanding achievements in various technology competitions.',
    imageUrl: '/api/placeholder/600/400',
    participants: 12
  }
]

const categories = ['All', 'Competition', 'Workshop', 'Meeting', 'Award'] as const

type SortKey = 'newest' | 'oldest' | 'title'

export default function GalleryPage(): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [sortBy] = useState<SortKey>('newest')

  const filteredItems = useMemo(() => {
    const base = galleryItems
    const withParsedDate = base.map(i => ({ ...i, parsedDate: new Date(i.date) }))
    if (sortBy === 'title') {
      return withParsedDate.sort((a, b) => a.title.localeCompare(b.title))
    }
    if (sortBy === 'oldest') {
      return withParsedDate.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
    }
    return withParsedDate.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())
  }, [sortBy])

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Competition': return 'bg-blue-100 text-blue-800'
      case 'Workshop': return 'bg-green-100 text-green-800'
      case 'Meeting': return 'bg-purple-100 text-purple-800'
      case 'Award': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Keyboard navigation for carousel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % filteredItems.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filteredItems.length])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Camera className="h-16 w-16 text-blue-200" />
          </div>
          <h1 className="text-5xl font-bold mb-6">NCSSM TSA Gallery</h1>
          <p className="text-xl mb-8 max-w-4xl mx-auto">
            Explore moments from our competitions, workshops, meetings, and celebrations. 
          </p>
        </div>
      </section>


      {/* Gallery Carousel */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Highlights
          </h2>

          {/* Carousel viewport */}
          <div className="relative">
            {/* Slides (responsive: 1 / 2 / 3 visible) */}
            <div className="
              grid gap-6
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              items-stretch
            ">
              {[-1, 0, 1].map((offset) => {
                const idx = (currentIndex + offset + filteredItems.length) % filteredItems.length;
                const item = filteredItems[idx];
                const isCenter = offset === 0;

                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300
                      ${isCenter ? "ring-2 ring-blue-600 scale-[1.02]" : "opacity-95"}
                    `}
                  >
                    {/* Image area (replace placeholder with real images when ready) */}
                    <div className="aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {/* If you have real images, uncomment Image below and remove the placeholder block */}

                      {/* 
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      */}

                      {/* Placeholder visual */}
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <Camera className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-5 bg-white">
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>

                      {item.participants !== undefined && (
                        <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {item.participants} participants
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white
                        rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-gray-900
                        transition-all duration-200 group"
              onClick={() => setCurrentIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)}
              aria-label="Previous"
            >
              <div className="text-xl sm:text-2xl font-light group-hover:scale-110 transition-transform">‹</div>
            </button>

            <button
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white
                        rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-gray-900
                        transition-all duration-200 group"
              onClick={() => setCurrentIndex(prev => (prev + 1) % filteredItems.length)}
              aria-label="Next"
            >
              <div className="text-xl sm:text-2xl font-light group-hover:scale-110 transition-transform">›</div>
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {filteredItems.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {filteredItems.length}
            </span>
          </div>
        </div>
      </section>

    </div>
  )
}