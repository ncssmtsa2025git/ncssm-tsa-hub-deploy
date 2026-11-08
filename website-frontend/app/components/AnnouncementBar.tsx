"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { type Announcement, getContent } from "../services/content";

/** One-line notice under the header, turned on and edited in Admin > Announcement. */
export default function AnnouncementBar(): React.ReactElement | null {
  const [a, setA] = useState<Announcement | null>(null);
  useEffect(() => {
    getContent<Announcement>("announcement").then(setA).catch(() => setA(null));
  }, []);

  if (!a?.active || !a.message) return null;
  const external = a.link?.startsWith("http");

  return (
    <div role="status" className="border-b border-line bg-tsa-tint text-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center sm:px-6 lg:px-8">
        <p className="font-medium">{a.message}</p>
        {a.link && (
          <Link
            href={a.link}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center gap-1 font-semibold text-tsa-deep underline-offset-4 hover:underline"
          >
            Details <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
