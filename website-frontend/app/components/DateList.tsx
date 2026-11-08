import React from "react";

export type KeyDate = { date: string; end?: string | null; event: string; type: string; location?: string | null };

const md = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { timeZone: "America/New_York", ...opts });

/** "Feb 12", "Apr 15–17", or "Jun 30–Jul 2". */
export function formatRange(d: KeyDate) {
  if (!d.end) return md(d.date, { month: "short", day: "numeric" });
  const sameMonth = d.date.slice(0, 7) === d.end.slice(0, 7);
  return `${md(d.date, { month: "short", day: "numeric" })}–${md(d.end, sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" })}`;
}

/**
 * Fixture-style list: one row per date, one text size. Hierarchy comes from weight and color only.
 * `tone="dark"` is for use on photos / navy backgrounds.
 */
export default function DateList({ dates, tone = "light" }: { dates: KeyDate[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ol className={`@container border-t ${dark ? "border-paper/25" : "border-ink"}`}>
      {dates.map((d) => (
        <li
          key={d.date + d.event}
          className={`grid grid-cols-[6.5rem_1fr] gap-x-4 border-b py-3 @md:grid-cols-[6.5rem_1fr_auto] ${
            dark ? "border-paper/15" : "border-line"
          }`}
        >
          <span className={`tabular font-semibold ${dark ? "text-paper" : "text-tsa"}`}>{formatRange(d)}</span>
          <span className={dark ? "text-paper" : "text-ink"}>
            {d.event}
            {d.type === "Deadline" && <span className={dark ? "text-paper/60" : "text-signal"}> · deadline</span>}
          </span>
          {d.location && (
            <span className={`col-start-2 @md:col-start-3 @md:text-right ${dark ? "text-paper/60" : "text-muted"}`}>
              {d.location}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
