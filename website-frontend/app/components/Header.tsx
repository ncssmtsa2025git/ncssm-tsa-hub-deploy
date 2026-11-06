"use client";
import Link from "next/link";
import Image from "next/image";
import AuthActionBar from "./AuthActionBar";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/resources", label: "Resources" },
  // { href: "/projects", label: "Past Projects" },
];

export default function Header(): React.ReactElement {
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { user, login, logoutUser } = useAuth();

  // Avoid rendering auth-dependent UI during SSR to prevent hydration mismatches.
  // We only show the real AuthActionBar after the client has mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Active logic: "/" must match exactly; others match prefix (e.g., /events/123)
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // fetchUser is now handled by AuthProvider and token-based flow.

  // useEffect(() => {
  //   const channel = new BroadcastChannel("auth");
  //   channel.onmessage = () => {
  //     fetchUser()
  //       .then(setUser)
  //       .catch(() => setUser(null));
  //   };
  //   return () => channel.close();
  // }, []);

  // async function handleLogout() {
  //   await logout();
  //   setUser(null);
  // }

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
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeaderVar);
    };
  }, []);

  // --header-offset is how much of the header is on screen, so sticky toolbars can sit right under it.
  useEffect(() => {
    document.documentElement.style.setProperty("--header-offset", visible ? "var(--header-h)" : "0px");
  }, [visible]);

  // Scroll hide/show (don't hide while mobile menu is open)
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
        className={`bg-tsa-deep text-paper transition-transform duration-300 ease-out-quart ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="NCSSM Durham TSA home">
            <Image
              width={48}
              height={48}
              src="/ncssm_tsa_logo.jpg"
              alt=""
              priority
              className="h-10 w-10 shrink-0 rounded-full ring-2 ring-paper/15 lg:h-12 lg:w-12"
            />
            <span className="min-w-0 leading-none">
              <span className="display block truncate text-2xl lg:text-[1.75rem]">NCSSM Durham</span>
              <span className="mt-1 hidden truncate text-xs font-medium tracking-wide text-paper/70 sm:block">
                Technology Student Association
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-signal after:transition-transform after:duration-300 after:ease-out-quart ${
                    active ? "text-paper after:scale-x-100" : "text-paper/75 after:scale-x-0 hover:text-paper"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <div className="ml-4">
              {mounted ? (
                <AuthActionBar user={user} onLogin={login} onLogout={logoutUser} />
              ) : (
                <div className="h-10 w-20" />
              )}
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-paper/10 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out-quart lg:hidden ${
            mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden" inert={!mobileOpen}>
            <nav aria-label="Main" className="mx-auto max-w-7xl space-y-1 border-t border-paper/15 px-4 py-3 sm:px-6">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`display block rounded px-2 py-2 text-3xl ${
                    isActive(n.href) ? "text-paper" : "text-paper/60 hover:text-paper"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-paper/10 pt-3">
                {mounted ? <AuthActionBar user={user} onLogin={login} onLogout={logoutUser} /> : <div className="h-10 w-full" />}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
