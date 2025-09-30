import Link from "next/link";
import React from "react";
import { Instagram } from "lucide-react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: About */}
          <div>
            <h3 className="text-xl font-bold mb-4">NCSSM-D TSA</h3>
            <p className="text-gray-400 mb-4">
              Technology Student Association at the North Carolina School of Science and Mathematics Durham
            </p>
            <a
              href="https://www.instagram.com/ncssmtsa?utm_source=ig_web_button_share_sheet&igsh=MXRyZWYwdmxreXBsaQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-gray-100 hover:scale-105 transition-transform duration-200"
            >
              <Instagram className="w-5 h-5 mr-2 text-pink-500" />
              <span className="bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent font-semibold">
                Follow us on Instagram!
              </span>
            </a>
          </div>

          {/* Middle: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/events" className="text-gray-400 hover:text-white block">Events</Link>
              <Link href="/gallery" className="text-gray-400 hover:text-white block">Gallery</Link>
              <Link href="/resources" className="text-gray-400 hover:text-white block">Resources</Link>
              <Link href="/projects" className="text-gray-400 hover:text-white block">Past Projects</Link>
            </div>
          </div>

          {/* Right: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400 mb-2">
              North Carolina School of Science and Mathematics<br />
              Durham, NC
            </p>
            <p className="text-gray-400 mb-1 font-medium">Advisors:</p>
            <ul className="space-y-2">
              <li className="text-gray-300">
                Amber Smith —{" "}
                <a
                  href="mailto:amber.smith@ncssm.edu"
                  className="text-blue-400 hover:underline"
                >
                  amber.smith@ncssm.edu
                </a>
              </li>
              <li className="text-gray-300">
                Camilla Brothers —{" "}
                <a
                  href="mailto:camilla.brothers@ncssm.edu"
                  className="text-blue-400 hover:underline"
                >
                  camilla.brothers@ncssm.edu
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 NCSSM TSA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}