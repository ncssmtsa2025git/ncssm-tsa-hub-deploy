import Link from "next/link";
import { JSX } from "react";

export default function Footer(): JSX.Element {
  return (
     <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">NCSSM TSA</h3>
              <p className="text-gray-400">
                Technology Student Association at North Carolina School of Science and Mathematics
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/events" className="text-gray-400 hover:text-white block">Events</Link>
                <Link href="/gallery" className="text-gray-400 hover:text-white block">Gallery</Link>
                <Link href="/resources" className="text-gray-400 hover:text-white block">Resources</Link>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                North Carolina School of Science and Mathematics<br />
                Durham, NC
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NCSSM TSA. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}