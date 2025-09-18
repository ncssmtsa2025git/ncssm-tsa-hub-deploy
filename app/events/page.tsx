'use client'
import { JSX, useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Download, Users, Clock, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'

interface Event {
  id: string
  title: string
  theme: string
  description: string
  category: string
  teamSize: string
  deadline: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  color: string
}

const events: Event[] = [
  {
    id: 'animatronics',
    title: 'Animatronics',
    theme: 'Time Travelers\' Museum',
    description: 'Create an animatronic figure or scene from a key moment in American history. The character should "come to life" to explain their world to a young audience.',
    category: 'Engineering',
    teamSize: '1-3 members',
    deadline: 'March 15, 2025',
    difficulty: 'Advanced',
    color: 'bg-purple-500'
  },
  {
    id: 'coding',
    title: 'Coding',
    theme: 'Programming Challenge',
    description: 'Solve complex programming problems using various programming languages including Python, Java, C++, and more.',
    category: 'Programming',
    teamSize: '1 member',
    deadline: 'March 20, 2025',
    difficulty: 'Intermediate',
    color: 'bg-green-500'
  },
  {
    id: 'video-game-design',
    title: 'Video Game Design',
    theme: 'Retro Revival',
    description: 'Reimagine an 8-bit or 16-bit era type of game with a modern twist. Create engaging gameplay with contemporary elements.',
    category: 'Design',
    teamSize: '1-6 members',
    deadline: 'March 10, 2025',
    difficulty: 'Advanced',
    color: 'bg-blue-500'
  },
  {
    id: 'robotics',
    title: 'Robotics',
    theme: 'Design Problem',
    description: 'Design, build, and program a robot to complete specific tasks and challenges outlined in the official competition rules.',
    category: 'Engineering',
    teamSize: '2-6 members',
    deadline: 'March 18, 2025',
    difficulty: 'Advanced',
    color: 'bg-red-500'
  },
  {
    id: 'digital-video-production',
    title: 'Digital Video Production',
    theme: 'A Twist in Time',
    description: 'Create a story that alters a key historical moment—or imagines a character from the past suddenly appearing in the modern day.',
    category: 'Media',
    teamSize: '1-6 members',
    deadline: 'March 12, 2025',
    difficulty: 'Intermediate',
    color: 'bg-yellow-500'
  },
  {
    id: 'webmaster',
    title: 'Webmaster',
    theme: 'Community Resource Hub',
    description: 'Create a website that will serve as a community resource hub to highlight resources available to residents within the community.',
    category: 'Programming',
    teamSize: '1-6 members',
    deadline: 'March 25, 2025',
    difficulty: 'Intermediate',
    color: 'bg-indigo-500'
  },
  {
    id: 'biotechnology-design',
    title: 'Biotechnology Design',
    theme: 'Bioconjugation',
    description: 'Highlight the science behind bioconjugation and demonstrate one of its many uses in medicine, diagnostics, or materials.',
    category: 'Science',
    teamSize: '1-6 members',
    deadline: 'March 8, 2025',
    difficulty: 'Advanced',
    color: 'bg-teal-500'
  },
  {
    id: 'music-production',
    title: 'Music Production',
    theme: 'USA 250th Birthday',
    description: 'Create a musical piece that can be played as the opening number at a July 4th fireworks show celebrating America\'s 250th birthday.',
    category: 'Media',
    teamSize: '1-6 members',
    deadline: 'March 22, 2025',
    difficulty: 'Intermediate',
    color: 'bg-pink-500'
  }
]

const categories = ['All', 'Engineering', 'Programming', 'Design', 'Media', 'Science']
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function EventsPage(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'All' || event.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">TSA Events & Competitions</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Discover exciting competitions that challenge your creativity, technical skills, and innovation. 
            Choose from a variety of events across engineering, programming, design, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
              <Download className="mr-2 h-5 w-5" />
              Event Guides PDF
            </button>
            <button className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Registration Forms
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
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
            <p className="text-gray-600">Students can participate in a maximum of 2 events</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className={`h-2 ${event.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {event.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(event.difficulty)}`}>
                      {event.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm font-medium text-blue-600 mb-3">Theme: {event.theme}</p>
                  <p className="text-gray-600 mb-6 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {event.teamSize}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Due: {event.deadline}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Guide
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Important Info Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Important Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Team Captain Responsibilities</h3>
              <p className="text-gray-600 mb-4">
                Each team must designate a Team Captain, who will be the first name on the sign-up sheet.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Submit progress checks to PC TSA</li>
                <li>• Handle final event submissions through official TSA portals</li>
                <li>• Coordinate team communication</li>
                <li>• Ensure project timeline adherence</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Participation</h3>
              <p className="text-gray-600 mb-4">
                Students are allowed to participate in a maximum of 2 events.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Choose events that match your interests</li>
                <li>• Consider time commitment for each event</li>
                <li>• Work logs required for most events</li>
                <li>• Review event guides carefully before starting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}