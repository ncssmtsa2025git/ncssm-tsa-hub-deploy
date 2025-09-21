"use client";
import Link from "next/link";
import { JSX, useEffect, useRef, useState } from "react";

export default function Header(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem("isLoggedIn");
    const name = localStorage.getItem("userName");
    setIsLoggedIn(loggedIn === "true");
    setUserName(name || "");

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < lastY.current) {
        // scrolling up
        setVisible(true);
      } else if (currentY > lastY.current) {
        // scrolling down (added threshold for stability)
        setVisible(false);
      }

      lastY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserName("");
    window.location.href = "/";
  };

  const iloveyitian =
    "relative pb-1 transition-colors hover:text-blue-200 " +
    "after:absolute after:left-0 after:bottom-0 after:h-[2px] " +
    "after:w-full after:origin-left after:scale-x-0 after:bg-blue-200 " +
    "after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 bg-blue-900 text-white shadow-lg ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-full flex items-center justify-center">
              <img
                src="ncssm_tsa_logo.jpg"
                alt="NCSSM TSA Logo"
                className="w-14 h-14 rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                NCSSM Technology Student Association
              </h1>
            </div>
          </div>
          <div className="hidden md:flex space-x-8 items-center text-lg">
            <Link href="/" className={iloveyitian}>
              Home
            </Link>
            <Link href="/events" className={iloveyitian}>
              Events
            </Link>
            <Link href="/gallery" className={iloveyitian}>
              Gallery
            </Link>
            <Link href="/resources" className={iloveyitian}>
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
                  <span className="text-sm text-blue-200">
                    Welcome, {userName}
                  </span>
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
                className="ml-2 px-4 py-2 rounded-lg 
                            bg-white/20 hover:bg-white/30 
                            text-white font-medium 
                            backdrop-blur-md 
                            border-2 border-white/30 
                            transition-all duration-300 shadow-sm hover:shadow-md"

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
