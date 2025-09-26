'use client'

import { JSX, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Camera, X } from 'lucide-react'

/** JSON shape from /public/data/images.json */
interface AlbumFromJson {
  id: string
  title: string
  year: number
  description?: string
  links: { url: string }[]
}

/** One image inside an album */
interface AlbumImage {
  id: string           // imgurId or generated
  pageUrl: string      // original Imgur page (kept for optional use)
  imageUrl: string     // direct i.imgur.com URL for rendering
}

/** Card type: one per album (event) */
interface AlbumCard {
  id: string
  title: string
  year: number
  description?: string
  images: AlbumImage[] // first is cover
}

/** Convert an Imgur page/short link to a direct i.imgur.com URL */
function toDirectImgur(url: string): { imageUrl: string; pageUrl: string } {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^m\./, '')
    if (host === 'i.imgur.com') {
      // Already a direct image URL
      return { imageUrl: u.toString(), pageUrl: url }
    }
    // Handle common Imgur paths: /a/ (album), /gallery/, and direct short ids
    const parts = u.pathname.split('/').filter(Boolean)
    const last = parts[parts.length - 1] || ''
    // Remove any extension or hash fragments
    const id = last.split('.')[0].split('#')[0]
    // Best-effort: map to a .jpg direct link (Imgur will serve jpeg if available or 404 if not)
    const direct = `https://i.imgur.com/${id}.jpg`
    return { imageUrl: direct, pageUrl: url }
  } catch {
    return { imageUrl: url, pageUrl: url }
  }
}

/** Next/Image wrapper that auto-falls back to <img> for external URLs + has error placeholder */
function SafeImage(props: {
  src: string; alt: string; className?: string; sizes?: string; fill?: boolean
}) {
  const [src, setSrc] = useState(props.src)
  const isExternal = /^https?:\/\//i.test(src)

  if (isExternal) {
    return (
      <img
        src={src}
        alt={props.alt}
        className={props.className ?? ''}
        onError={() => setSrc('/api/placeholder/1200/800')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    )
  }
  return (
    <Image
      {...props}
      src={src}
      onError={() => setSrc('/api/placeholder/1200/800')}
      alt={props.alt}
    />
  )
}

type SortKey = 'newest' | 'oldest' | 'title'

export default function GalleryPage(): JSX.Element {
  const [albums, setAlbums] = useState<AlbumCard[]>([])
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [query, setQuery] = useState('')

  // Lightbox state (album-scoped)
  const [isOpen, setIsOpen] = useState(false)
  const [activeAlbumIdx, setActiveAlbumIdx] = useState<number>(0)
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0)

  // Load JSON → album cards (grouped)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/data/images.json', { cache: 'no-store' })
        const raw: AlbumFromJson[] = await res.json()

        const grouped: AlbumCard[] = raw.map((a) => {
          const imgsRaw: AlbumImage[] = (a.links ?? []).map(({ url }) => {
            const { imageUrl, pageUrl } = toDirectImgur(url)
            const imgurId = imageUrl.split('/').pop()?.split('.')[0] ?? Math.random().toString(36).slice(2)
            return { id: imgurId, pageUrl, imageUrl }
          })

          // ---- DEDUPE by direct imageUrl to avoid repeated cover/album collisions ----
          const seen = new Set<string>()
          const imgs: AlbumImage[] = []
          for (const im of imgsRaw) {
            if (!im.imageUrl) continue
            if (seen.has(im.imageUrl)) continue
            seen.add(im.imageUrl)
            imgs.push(im)
          }

          return {
            id: a.id,
            title: a.title,
            year: a.year,
            description: a.description,
            images: imgs
          }
        }).filter(a => a.images.length > 0)

        if (!cancelled) setAlbums(grouped)
      } catch (e) {
        console.error('Failed to load /data/images.json', e)
        if (!cancelled) setAlbums([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = albums
    if (q) {
      list = list.filter((a) =>
        [a.title, String(a.year), a.description ?? ''].some((s) => s.toLowerCase().includes(q))
      )
    }
    if (sortBy === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'oldest') return [...list].sort((a, b) => a.year - b.year)
    return [...list].sort((a, b) => b.year - a.year) // newest
  }, [albums, query, sortBy])

  // Lightbox controls (album-scoped)
  const openLightbox = (albumIdx: number, startImage = 0) => {
    setActiveAlbumIdx(albumIdx)
    setActiveImageIdx(startImage)
    setIsOpen(true)
  }
  const closeLightbox = () => setIsOpen(false)

  const prevImage = () => {
    const curr = visible[activeAlbumIdx]
    const n = curr?.images.length ?? 0
    if (n === 0) return
    setActiveImageIdx((i) => (i - 1 + n) % n)
  }
  const nextImage = () => {
    const curr = visible[activeAlbumIdx]
    const n = curr?.images.length ?? 0
    if (n === 0) return
    setActiveImageIdx((i) => (i + 1) % n)
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, visible, activeAlbumIdx])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Camera className="h-16 w-16 text-blue-200" />
          </div>
          <h1 className="text-5xl font-bold mb-4">NCSSM TSA Gallery</h1>
          <p className="text-lg opacity-90">Photos are displayed directly on-site from your <code>images.json</code>.</p>
        </div>
      </section>

      {/* Controls */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, year, or description…"
            className="w-full sm:w-1/2 rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title (A→Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid of ALBUM cards (click to open album lightbox) */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {visible.length === 0 ? (
            <div className="text-center text-gray-500 py-20">No albums found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visible.map((a, idx) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openLightbox(idx, 0)}
                  className="group rounded-2xl overflow-hidden bg-white shadow hover:shadow-lg transition-shadow text-left"
                  aria-label={`Open ${a.title}`}
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    <SafeImage
                      src={a.images[0]?.imageUrl ?? '/api/placeholder/1200/800'}
                      alt={a.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    {/* Small count pill */}
                    {a.images.length > 1 && (
                      <span className="absolute right-2 top-2 rounded-full bg-black/60 text-white text-xs px-2 py-1">
                        {a.images.length} photos
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{a.title}</h3>
                      <span className="text-xs text-gray-500">{a.year}</span>
                    </div>
                    {a.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{a.description}</p>
                    )}
                    <p className="mt-3 text-xs text-blue-700/80 group-hover:text-blue-700">
                      View photos →
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal (album-scoped) */}
      {isOpen && visible.length > 0 && visible[activeAlbumIdx] && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-6xl">
            {/* Close */}
            <button
              onClick={closeLightbox}
              aria-label="Close"
              className="absolute -top-10 right-0 text-white/90 hover:text-white transition"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image area */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black">
              <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                <SafeImage
                  src={visible[activeAlbumIdx].images[activeImageIdx]?.imageUrl ?? '/api/placeholder/1200/800'}
                  alt={visible[activeAlbumIdx].title}
                  fill
                  sizes="100vw"
                  className="object-contain bg-black"
                />
              </div>

              {/* Nav arrows (within album) */}
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-2xl"
                onClick={prevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-2xl"
                onClick={nextImage}
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            {/* Caption */}
            <div className="mt-3 text-white/90">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <span className="font-semibold">{visible[activeAlbumIdx].title}</span>
                  <span className="opacity-80"> · {visible[activeAlbumIdx].year}</span>
                  {visible[activeAlbumIdx].description && (
                    <span className="opacity-80"> · {visible[activeAlbumIdx].description}</span>
                  )}
                </div>
                <div className="text-sm opacity-80">
                  {activeImageIdx + 1} / {visible[activeAlbumIdx].images.length}
                </div>
              </div>
              {/* Optional original Imgur link:
              <div className="mt-1 text-sm">
                <a
                  href={visible[activeAlbumIdx].images[activeImageIdx]?.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Open original on Imgur
                </a>
              </div>
              */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
