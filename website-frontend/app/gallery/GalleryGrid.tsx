"use client";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type GalleryItem = { src: string; title: string; date: string };

// Some photos get a large 2x2 tile for rhythm. Pick how many so the 4-column grid
// (and the 2-column mobile grid) fills with no holes: n + 3f must be a multiple of 4.
function featureSet(n: number): Set<number> {
  let f = Math.floor(n / 3);
  while (f > 0 && (n + 3 * f) % 4 !== 0) f--;
  return new Set(Array.from({ length: f }, (_, k) => Math.floor((k * n) / f)));
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (i: number) => {
    setActive(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setActive(null);
    dlg.addEventListener("keydown", onKey);
    dlg.addEventListener("close", onClose);
    return () => {
      dlg.removeEventListener("keydown", onKey);
      dlg.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = active === null ? null : items[active];
  const features = featureSet(items.length);
  const isFeature = (i: number) => features.has(i);

  return (
    <>
      <ul className="grid grid-flow-dense auto-rows-[11rem] grid-cols-2 gap-2 sm:auto-rows-[13rem] sm:gap-3 lg:grid-cols-4">
        {items.map((it, i) => (
          <li key={it.src} className={isFeature(i) ? "col-span-2 row-span-2" : ""}>
            <button
              onClick={() => open(i)}
              className="group relative block h-full w-full overflow-hidden rounded-md bg-paper-2"
              aria-label={`View photo: ${it.title}`}
            >
              <Image
                src={it.src}
                alt={it.title}
                fill
                sizes={isFeature(i) ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                className="object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-3 pb-2.5 pt-8 text-left text-sm font-semibold text-paper opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                {it.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-ink/90 p-0 backdrop:bg-transparent"
        aria-label={current ? current.title : "Photo viewer"}
      >
        {current && (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-10" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="relative h-full max-h-[80dvh] w-full max-w-6xl">
              <Image src={current.src} alt={current.title} fill sizes="100vw" className="object-contain" priority />
            </div>
            <div className="flex w-full max-w-6xl items-center justify-between gap-4 text-paper">
              <p>
                <span className="font-semibold">{current.title}</span>
                <span className="tabular ml-3 text-paper/70">
                  {active! + 1} / {items.length}
                </span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => step(-1)} aria-label="Previous photo" className="rounded-full bg-paper/10 p-2.5 hover:bg-paper/20">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => step(1)} aria-label="Next photo" className="rounded-full bg-paper/10 p-2.5 hover:bg-paper/20">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button onClick={close} aria-label="Close" className="rounded-full bg-paper/10 p-2.5 hover:bg-paper/20">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
