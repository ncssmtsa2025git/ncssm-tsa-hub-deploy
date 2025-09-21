"use client";
import Link from "next/link";
import { JSX, useEffect, useRef, useState } from "react";

export default function Header(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const barRef = useRef<HTMLDivElement | null>(null);

  // Measure header height and expose as CSS var --header-h
  useEffect(() => {
    const updateHeaderVar = () => {
      const h = barRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };

    // Initial measurement
    updateHeaderVar();

    // Update on resize & font/layout changes
    const ro = new ResizeObserver(updateHeaderVar);
    if (barRef.current) ro.observe(barRef.current);

    window.addEventListener("resize", updateHeaderVar);
    // Re-measure after fonts/content settle
    const raf = requestAnimationFrame(updateHeaderVar);
    const tmo = setTimeout(updateHeaderVar, 300);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeaderVar);
      cancelAnimationFrame(raf);
      clearTimeout(tmo);
    };
  }, []);

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < lastY.current - 5) setVisible(true);        // up
      else if (y > lastY.current + 5 && y > 64) setVisible(false); // down
      lastY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const name = localStorage.getItem("userName");
    setIsLoggedIn(loggedIn === "true");
    setUserName(name || "");
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
    // Sticky wrapper (no fixed height here; height is measured live)
    <header className="sticky top-0 z-50">
      {/* This inner bar is what we measure */}
      <div
        ref={barRef}
        className={`bg-blue-900 text-white shadow-lg transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white rounded-full flex items-center justify-center">
                <img
                  src="/ncssm_tsa_logo.jpg"
                  alt="NCSSM TSA Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full"
                />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold whitespace-nowrap">
                NCSSM Technology Student Association
              </h1>
            </div>

            {/* Right: Nav + Auth */}
            <div className="hidden md:flex items-center gap-8 text-lg">
              <Link href="/" className={iloveyitian}>Home</Link>
              <Link href="/events" className={iloveyitian}>Events</Link>
              <Link href="/gallery" className={iloveyitian}>Gallery</Link>
              <Link href="/resources" className={iloveyitian}>Resources</Link>

              {isLoggedIn ? (
                <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                  <Link
                    href="/portal"
                    className="bg-blue-700/90 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Portal
                  </Link>
                  <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
