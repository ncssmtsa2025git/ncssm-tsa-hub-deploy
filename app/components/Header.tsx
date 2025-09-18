"use client";
import Link from "next/link";
import { JSX, useEffect, useState } from "react";

export default function Header(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn')
    const name = localStorage.getItem('userName')
    setIsLoggedIn(loggedIn === 'true')
    setUserName(name || '')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setUserName('')
    window.location.href = '/'
  }

  return (
     <nav className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full flex items-center justify-center">
                <img src="ncssm_tsa_logo.jpg" alt="NCSSM TSA Logo" className="w-14 h-14 rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-bold">NCSSM Technology Student Association</h1>
              </div>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/" className="hover:text-blue-200 transition-colors">
                Home
              </Link>
              <Link
                href="/events"
                className="hover:text-blue-200 transition-colors"
              >
                Events
              </Link>
              <Link
                href="/gallery"
                className="hover:text-blue-200 transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/resources"
                className="hover:text-blue-200 transition-colors"
              >
                Resources
              </Link>
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/portal"
                    className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Portal
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-200">Welcome, {userName}</span>
                    <button
                      onClick={handleLogout}
                      className="text-blue-200 hover:text-white transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
}