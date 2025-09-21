'use client'
import { JSX, useState, useEffect } from 'react'
import { Search, Download, Users, X, ExternalLink } from 'lucide-react'

interface Event {
  id: string
  title: string
  theme?: string
  fullThemeUrl?: string
  description: string
  category: string
  teamSize: string
  types: string[] // event type tags (onsite testing, poster, portfolio, etc.)
  rubricUrl: string
}

const events: Event[] = [
  {
    id: 'animatronics',
    title: 'Animatronics',
    theme: 'Time Travelers\' Museum',
    fullThemeUrl: 'https://example.com/full-theme/animatronics',
    description: 'Create an animatronic figure or scene from a key moment in American history. The character should "come to life" to explain their world to a young audience.',
    category: 'Engineering',
    teamSize: '1-3 members',
    types: ['onsite testing', 'poster'],
    rubricUrl: '#'
  },
  {
    id: 'coding',
    title: 'Coding',
    // no fullThemeUrl provided for coding (will hide button)
    theme: 'Programming Challenge',
    description: 'Solve complex programming problems using various programming languages including Python, Java, C++, and more.',
    category: 'Programming',
    teamSize: '1 member',
    types: ['prelim submission', 'testing'],
    rubricUrl: '#'
  },
  {
    id: 'video-game-design',
    title: 'Video Game Design',
    theme: 'Retro Revival',
    fullThemeUrl: 'https://example.com/full-theme/video-game-design',
    description: 'Reimagine an 8-bit or 16-bit era type of game with a modern twist. Create engaging gameplay with contemporary elements.',
    category: 'Design',
    teamSize: '1-6 members',
    types: ['prelim submission', 'portfolio'],
    rubricUrl: '#'
  },
  {
    id: 'robotics',
    title: 'Robotics',
    theme: 'Design Problem',
    description: 'Design, build, and program a robot to complete specific tasks and challenges outlined in the official competition rules.',
    category: 'Engineering',
    teamSize: '2-6 members',
    types: ['onsite challenge', 'testing'],
    rubricUrl: '#'
  },
  {
    id: 'digital-video-production',
    title: 'Digital Video Production',
    theme: 'A Twist in Time',
    fullThemeUrl: 'https://example.com/full-theme/digital-video-production',
    description: 'Create a story that alters a key historical moment—or imagines a character from the past suddenly appearing in the modern day.',
    category: 'Media',
    teamSize: '1-6 members',
    types: ['prelim submission', 'video'],
    rubricUrl: '#'
  },
  {
    id: 'webmaster',
    title: 'Webmaster',
    theme: 'Community Resource Hub',
    description: 'Create a website that will serve as a community resource hub to highlight resources available to residents within the community.',
    category: 'Programming',
    teamSize: '1-6 members',
    types: ['portfolio', 'website'],
    rubricUrl: '#'
  },
  {
    id: 'biotechnology-design',
    title: 'Biotechnology Design',
    theme: 'Bioconjugation',
    description: 'Highlight the science behind bioconjugation and demonstrate one of its many uses in medicine, diagnostics, or materials.',
    category: 'Science',
    teamSize: '1-6 members',
    types: ['testing', 'research'],
    rubricUrl: '#'
  },
  {
    id: 'music-production',
    title: 'Music Production',
    // intentionally no fullThemeUrl here
    theme: 'USA 250th Birthday',
    description: 'Create a musical piece that can be played as the opening number at a July 4th fireworks show celebrating America\'s 250th birthday.',
    category: 'Media',
    teamSize: '1-6 members',
    types: ['prelim submission', 'music'],
    rubricUrl: '#'
  }
]

const categories = ['All', 'Engineering', 'Programming', 'Design', 'Media', 'Science']

export default function EventsPage(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Close modal when Escape is pressed
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedEvent(null)
    }
    if (selectedEvent) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedEvent])

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.theme ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6 font-serif">TSA Events & Competitions</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-200">
            Discover competitions across engineering, programming, design, and more.
          </p>
          <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center mx-auto">
            <Download className="mr-2 h-5 w-5" />
            Master PDF Download
          </button>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Available
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-sm font-medium text-blue-600 mb-3">Theme: {event.theme ?? 'N/A'}</p>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {event.teamSize}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2 mt-2">
                    {event.types.map((t) => (
                      <span key={t} className="tag-badge">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Event Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">{selectedEvent.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Theme</h3>
                  <p className="text-blue-600">{selectedEvent.theme ?? 'N/A'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Team Size</h3>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {selectedEvent.teamSize}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Event Type</h3>
                    <div className="flex items-center text-gray-600 flex-wrap gap-2">
                      {selectedEvent.types.map((t) => (
                        <span key={t} className="tag-badge">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <a
                    href={selectedEvent.rubricUrl}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Rubric
                  </a>
                  {selectedEvent.fullThemeUrl ? (
                    <a
                      href={selectedEvent.fullThemeUrl}
                      className="flex-1 bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Full Theme
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}