"use client";
import Link from "next/link";
import { JSX, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Header(): JSX.Element {
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Base link style w/ hover underline animation
  const baseLink =
    "relative pb-1 transition-colors hover:text-blue-200 " +
    "after:absolute after:left-0 after:bottom-0 after:h-[2px] " +
    "after:w-full after:origin-left after:scale-x-0 after:bg-blue-200 " +
    "after:transition-transform after:duration-300 hover:after:scale-x-100";

  // Active logic: "/" must match exactly; others match prefix (e.g., /events/123)
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Helper to render a nav link with active highlight + underline
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`${baseLink} ${active ? "text-blue-200 after:scale-x-100" : ""}`}
      >
        {children}
      </Link>
    );
  };

  async function startGoogleLogin() {
    const BACKEND = "http://localhost:8000";
    const res = await fetch(`${BACKEND}/auth/login`);
    if (!res.ok) throw new Error("Failed to start login");
    const data = await res.json();
    // Open the auth URL in a popup so the main app remains loaded.
    const popup = window.open(data.auth_url, "google_oauth", "width=600,height=700");
  }

  async function fetchUser() {
    const BACKEND = "http://localhost:8000";
    const res = await fetch(`${BACKEND}/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not logged in");
    console.log(await res.json());
  } 

  // Measure header height and expose as CSS var --header-h
  useEffect(() => {
    const updateHeaderVar = () => {
      const h = barRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    updateHeaderVar();
    const ro = new ResizeObserver(updateHeaderVar);
    if (barRef.current) ro.observe(barRef.current);
    window.addEventListener("resize", updateHeaderVar);
    const raf = requestAnimationFrame(updateHeaderVar);
    const tmo = setTimeout(updateHeaderVar, 300);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeaderVar);
      cancelAnimationFrame(raf);
      clearTimeout(tmo);
    };
  }, []);

  // Scroll hide/show (don’t hide while mobile menu is open)
  useEffect(() => {
    const handleScroll = () => {
      if (mobileOpen) return;
      const y = window.scrollY;
      if (y < lastY.current - 5) setVisible(true); // up
      else if (y > lastY.current + 5 && y > 64) setVisible(false); // down
      lastY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50">
      <div
        ref={barRef}
        className={`bg-blue-900 text-white shadow-lg transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row */}
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo + title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white rounded-full flex items-center justify-center">
                <img
                  src="/ncssm_tsa_logo.jpg"
                  alt="NCSSM TSA Logo"
                  onClick={fetchUser}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full"
                />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold whitespace-nowrap">
                NCSSM Technology Student Association
              </h1>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8 text-lg">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/events">Events</NavLink>
              <NavLink href="/gallery">Gallery</NavLink>
              <NavLink href="/resources">Resources</NavLink>
              <button
                    onClick={startGoogleLogin}
                    className="ml-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 
                              text-white font-medium backdrop-blur-md 
                              border-2 border-white/30 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Login
                  </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile dropdown */}
          <div
            className={`md:hidden overflow-hidden transition-[max-height,opacity]
              duration-300 ${mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}
          >
            <nav className="py-3 border-t border-white/15 space-y-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                aria-current={isActive("/") ? "page" : undefined}
                className={`block px-2 py-2 rounded hover:bg-white/10 ${isActive("/") ? "bg-white/10 text-blue-200" : ""}`}
              >
                Home
              </Link>
              <Link
                href="/events"
                onClick={() => setMobileOpen(false)}
                aria-current={isActive("/events") ? "page" : undefined}
                className={`block px-2 py-2 rounded hover:bg-white/10 ${isActive("/events") ? "bg-white/10 text-blue-200" : ""}`}
              >
                Events
              </Link>
              <Link
                href="/gallery"
                onClick={() => setMobileOpen(false)}
                aria-current={isActive("/gallery") ? "page" : undefined}
                className={`block px-2 py-2 rounded hover:bg-white/10 ${isActive("/gallery") ? "bg-white/10 text-blue-200" : ""}`}
              >
                Gallery
              </Link>
              <Link
                href="/resources"
                onClick={() => setMobileOpen(false)}
                aria-current={isActive("/resources") ? "page" : undefined}
                className={`block px-2 py-2 rounded hover:bg-white/10 ${isActive("/resources") ? "bg-white/10 text-blue-200" : ""}`}
              >
                Resources
              </Link>

              <div className="pt-2 border-t border-white/10 mt-2">
                  <button
                    onClick={startGoogleLogin}
                    className="ml-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 
                              text-white font-medium backdrop-blur-md 
                              border-2 border-white/30 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Login with Google
                  </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
