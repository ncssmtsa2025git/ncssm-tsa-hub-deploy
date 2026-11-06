"use client";

import Link from "next/link";
import { ArrowRight, Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { UpcomingDate, loadUpcomingDates } from "./models/upcoming";
import DateList from "./components/DateList";

type GalleryItem = {
  src: string;   // e.g. /pics/nats_2025/IMG_0001.jpg (must live under /public)
  title: string; // display name
  date: string;  // e.g. "Nationals 2025"
};

// Officers shown on the home page. Add a photo by dropping a square image in
// /public/officers and setting `photo`; officers without one show their initials.
const OFFICERS: { name: string; role: string; email: string; photo?: string }[] = [
  { name: "David Ta", role: "Co-President", email: "ta27d@ncssm.edu", photo: "/officers/david.jpg" },
  { name: "Nathaniel Joy", role: "Co-President", email: "joy27n@ncssm.edu", photo: "/officers/nathaniel.jpg" },
  { name: "Moksha Agrawal", role: "Vice President", email: "agrawal27m@ncssm.edu", photo: "/officers/moksha.jpg" },
  { name: "Isabella Bai", role: "Secretary", email: "bai27i@ncssm.edu", photo: "/officers/isabella.jpg" },
  { name: "Megan Nguyen", role: "Competitive Lead", email: "nguyen27m@ncssm.edu", photo: "/officers/megan.jpg" },
  { name: "Ayush Kamath", role: "Reporter", email: "kamath27a@ncssm.edu", photo: "/officers/ayush.jpg" },
  { name: "Aarush Jain", role: "Tech Lead", email: "jain27a@ncssm.edu", photo: "/officers/aarush.jpg" },
];

export default function Home(): React.ReactElement {
  // ===== Next key dates (same file the portal and Resources page use) =====
  const [dates, setDates] = useState<UpcomingDate[]>([]);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    loadUpcomingDates()
      .then((d) => setDates(d.filter((x) => x.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)))
      .catch(() => setDates([]));
  }, []);

  // ===== Load gallery manifest =====
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const autoplayMs = 5000;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/data/gallery.json", { cache: "no-store" });
        if (!res.ok) return;
        const raw = (await res.json()) as unknown;
        const data = Array.isArray(raw) ? raw : [];
        const cleaned = (data as unknown[]).filter((x) => {
          const obj = x as Record<string, unknown> | null;
          return !!obj && typeof obj.src === "string" && typeof obj.title === "string" && typeof obj.date === "string";
        }) as GalleryItem[];
        if (alive) setGallery(cleaned);
      } catch {
        // ignore; will show placeholders
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ===== Autoplay with pause on hover / page hidden =====
  useEffect(() => {
    if (!gallery.length || hovering) return;

    const play = () => setIndex((i) => (i + 1) % gallery.length);

    timerRef.current = window.setInterval(play, autoplayMs) as unknown as number;

    const handleVisibility = () => {
      if (document.hidden && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      } else if (!document.hidden && !timerRef.current && !hovering && gallery.length) {
        timerRef.current = window.setInterval(play, autoplayMs) as unknown as number;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [gallery.length, hovering]);

  // ===== Navigation handlers =====
  const prev = () => setIndex((i) => (i - 1 + (gallery.length || 1)) % (gallery.length || 1));
  const next = () => setIndex((i) => (i + 1) % (gallery.length || 1));
  const go = (i: number) => setIndex(i);

  // Ensure we always have at least one slide to render (placeholder)
  const slides: GalleryItem[] = useMemo(() => {
    return gallery.length
      ? gallery
      : [
          { src: "/front_page/background.jpg", title: "NCSSM TSA", date: "Welcome" },
        ];
  }, [gallery]);

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] items-end overflow-hidden text-paper">
        <Image
          src="/front_page/background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 scale-110 transform-gpu object-cover blur-sm"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(0.2_0.09_264/0.9)_0%,oklch(0.22_0.09_264/0.6)_50%,oklch(0.22_0.09_264/0.25)_100%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-tsa-deep/80 to-transparent" />

        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-20">
          <h1 className="display text-[clamp(4rem,14vw,11.5rem)]">
            NCSSM
            <br />
            Durham TSA
          </h1>
          <div className="mt-12 grid items-end gap-10 lg:mt-20 lg:grid-cols-[1fr_26rem] lg:gap-16">
            <div>
              <p className="max-w-xl text-lg leading-relaxed text-paper/90">
                The Technology Student Association chapter at NCSSM in Durham, NC. Engineers, coders, designers and
                speakers competing from regionals to nationals.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-lg bg-paper px-6 py-3.5 font-semibold text-tsa-deep transition-colors hover:bg-tsa-tint"
                >
                  This season&apos;s events <ArrowRight aria-hidden className="h-5 w-5" />
                </Link>
                <a
                  href="https://www.instagram.com/ncssmtsa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-paper/40 bg-paper/10 px-6 py-3.5 font-semibold transition-colors hover:bg-paper/20"
                >
                  <Instagram aria-hidden className="h-5 w-5 text-pink-500" />
                  <span className="bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">@ncssmtsa</span>
                </a>
              </div>
            </div>
            {dates.length > 0 && (
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="font-semibold text-paper">Next up</h2>
                  <Link href="/resources" className="text-paper/70 hover:text-paper hover:underline">
                    All dates
                  </Link>
                </div>
                <DateList dates={dates} tone="dark" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Officers */}
      <section aria-labelledby="officers" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3">
            <h2 id="officers" className="display text-5xl sm:text-6xl">
              Officers
            </h2>
            <p className="text-ink-soft">2026–27</p>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-10">
            {OFFICERS.map((o) => (
              <li
                key={o.email}
                className="w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <div className="mb-4 aspect-[4/5] overflow-hidden rounded-md bg-paper-2">
                  {o.photo ? (
                    <Image
                      src={o.photo}
                      alt={o.name}
                      width={400}
                      height={500}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="display flex h-full w-full items-center justify-center text-6xl text-tsa/30">
                      {o.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold leading-snug">{o.name}</h3>
                <p className="text-ink-soft">{o.role}</p>
                <a href={`mailto:${o.email}`} className="mt-1 block truncate font-medium text-tsa hover:underline">
                  {o.email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Photo carousel */}
      <section aria-labelledby="photos" className="bg-tsa-deep py-20 text-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-paper/80 pb-3">
            <h2 id="photos" className="display text-5xl sm:text-6xl">
              On the floor
            </h2>
            <Link href="/gallery" className="inline-flex items-center gap-1.5 font-semibold text-paper/85 hover:text-paper">
              All photos <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>

          {/* Carousel */}
          <div
            className="relative"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Viewport with slide animation */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-ink/30 sm:aspect-[21/10]">
              <div
                className="flex h-full w-full transition-transform duration-700 ease-out-quart"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {slides.map((s, i) => (
                  <div key={`${s.src}-${i}`} className="relative shrink-0 grow-0 basis-full" aria-hidden={i !== index}>
                    <Image
                      src={s.src}
                      alt={s.title}
                      fill
                      sizes="(max-width: 1280px) 100vw, 1216px"
                      className="object-cover"
                      priority={i === index}
                    />
                    {/* Caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-5 pb-5 pt-16">
                      <p className="text-xl font-semibold md:text-2xl">{s.title}</p>
                      <p className="text-sm text-paper/75 md:text-base">{s.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              {/* Progress segments */}
              <div className="flex flex-1 items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to photo ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => go(i)}
                    className="group h-6 flex-1 cursor-pointer"
                  >
                    <span
                      className={`block h-0.5 w-full rounded-full transition-colors ${
                        i === index ? "bg-paper" : "bg-paper/25 group-hover:bg-paper/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Previous photo"
                  onClick={prev}
                  className="cursor-pointer rounded-full border border-paper/30 p-2.5 hover:bg-paper/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next photo"
                  onClick={next}
                  className="cursor-pointer rounded-full border border-paper/30 p-2.5 hover:bg-paper/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
