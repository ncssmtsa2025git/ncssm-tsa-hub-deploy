"use client";

import Link from "next/link";
import { ArrowRight, Instagram, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

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
  { name: "Moksha Agrawal", role: "Vice President", email: "agrawal27m@ncssm.edu" },
  { name: "Isabella Bai", role: "Secretary", email: "bai27i@ncssm.edu" },
  { name: "Megan Nguyen", role: "Competitive Lead", email: "nguyen27m@ncssm.edu" },
  { name: "Ayush Kamath", role: "Reporter", email: "kamath27a@ncssm.edu" },
  { name: "Aarush Jain", role: "Tech Lead", email: "jain27a@ncssm.edu", photo: "/officers/aarush.jpg" },
];

export default function Home(): React.ReactElement {
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative 
          min-h-[calc(100svh-var(--header-h))] 
          md:min-h-[calc(100vh-var(--header-h))] 
          flex items-center justify-center"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Background image */}
          <Image
            src="/front_page/background.jpg" // put your image in /public
            alt="Hero Background"
            fill
            className="object-cover blur-sm scale-110 transform-gpu"
            priority
          />
        </div>

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">NCSSM Durham TSA</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/90">
            Empowering students through technology, innovation, and competition
            at the North Carolina School of Science and Mathematics Durham
          </p>
          <div className="flex flex-row flex-wrap gap-4 justify-center">
          {/* Instagram button */}
          <a
            href="https://www.instagram.com/ncssmtsa?utm_source=ig_web_button_share_sheet&igsh=MXRyZWYwdmxreXBsaQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-8 py-4 rounded-lg font-semibold
                      bg-white/15 backdrop-blur-md border border-white/60 text-white
                      hover:bg-white/30 transition-all duration-300
                      min-w-[200px]"
          >
            <Instagram className="w-5 h-5 mr-2 text-pink-500" />
            <span className="bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent font-semibold">
              Follow Us!
            </span>
          </a>

          {/* Events button */}
          <Link
            href="/events"
            className="min-w-[200px] bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            Explore Events <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Meet the Officers Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet the Officers</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {OFFICERS.map((o) => (
              <div key={o.email} className="text-center w-full md:w-[calc(50%-1rem)] lg:w-[calc((100%-4rem)/3)]">
                <div className="aspect-[1/1] bg-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-4">
                  {o.photo ? (
                    <Image src={o.photo} alt={o.name} width={400} height={400} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-6xl font-semibold text-blue-900/40">
                      {o.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{o.name}</h3>
                <p className="text-base font-medium text-blue-600 mb-2">{o.role}</p>
                <p className="text-sm text-gray-600">{o.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Showcase Section — Slideshow with arrows */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6">Our Journey in Photos</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              See the innovation, teamwork, and achievements that define our chapter
            </p>
          </div>

          {/* Carousel */}
          <div
            className="relative mx-auto max-w-5xl"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Viewport with slide animation */}
            <div className="relative overflow-hidden rounded-2xl aspect-[21/10] bg-black/20">
              <div
                className="flex h-full w-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {slides.map((s, i) => (
                  <div key={`${s.src}-${i}`} className="relative shrink-0 grow-0 basis-full">
                    <Image
                      src={s.src}
                      alt={s.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 832px"
                      className="object-cover"
                      priority={i === index}
                    />
                    {/* Caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-5">
                      <h3 className="text-xl md:text-2xl font-semibold">{s.title}</h3>
                      <p className="text-sm md:text-base text-blue-200">{s.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Left / Right arrows */}
              <button
                aria-label="Previous slide"
                onClick={prev}
                className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center rounded-full bg-white/80 hover:bg-white p-2 shadow"
              >
                <ChevronLeft className="h-6 w-6 text-blue-900" />
              </button>
              <button
                aria-label="Next slide"
                onClick={next}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center rounded-full bg-white/80 hover:bg-white p-2 shadow"
              >
                <ChevronRight className="h-6 w-6 text-blue-900" />
              </button>
            </div>

            {/* Dots */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => go(i)}
                  className={`cursor-pointer h-2.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Camera className="h-6 w-6 mr-3" />
              All Photos
              <ArrowRight className="h-5 w-5 ml-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
