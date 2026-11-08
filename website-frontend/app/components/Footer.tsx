import Link from "next/link";
import React from "react";
import { Instagram } from "lucide-react";

const ADVISORS = [
  { name: "Amber Smith", email: "amber.smith@ncssm.edu" },
  { name: "Camilla Brothers", email: "camilla.brothers@ncssm.edu" },
];

export default function Footer(): React.ReactElement {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="display text-5xl">NCSSM Durham TSA</p>
            <p className="mt-3 max-w-sm text-paper/65">
              The Technology Student Association chapter at the North Carolina School of Science and Mathematics, Durham.
            </p>
            <a
              href="https://www.instagram.com/ncssmtsa"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 font-semibold transition-opacity duration-200 hover:opacity-80"
            >
              <Instagram aria-hidden className="h-5 w-5 text-pink-500" />
              <span className="bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">@ncssmtsa</span>
            </a>
          </div>

          <nav aria-label="Footer">
            <p className="mb-3 font-semibold text-paper/50">Pages</p>
            <ul className="space-y-2">
              {[
                ["/events", "Events"],
                ["/gallery", "Gallery"],
                ["/resources", "Resources"],
                ["/portal", "Member portal"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-paper/80 hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-3 font-semibold text-paper/50">Advisors</p>
            <ul className="space-y-3">
              {ADVISORS.map((a) => (
                <li key={a.email}>
                  <p className="text-paper/90">{a.name}</p>
                  <a href={`mailto:${a.email}`} className="text-[oklch(0.78_0.1_250)] hover:text-paper hover:underline">
                    {a.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-2 border-t border-paper/10 pt-6 text-sm text-paper/50">
          <p>&copy; {new Date().getFullYear()} NCSSM Durham TSA</p>
          <p>North Carolina School of Science and Mathematics · Durham, NC</p>
        </div>
      </div>
    </footer>
  );
}
