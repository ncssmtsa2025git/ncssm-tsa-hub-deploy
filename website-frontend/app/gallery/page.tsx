import fs from "fs";
import path from "path";
import Image from "next/image";
import { Camera } from "lucide-react";

type GalleryJsonItem = {
  src: string;   // e.g. /pics/nats_2025/IMG_0001.jpg
  title: string; // display name
  date: string;  // "Nationals 2025" or "April 2025"
};

function readGalleryJson(): GalleryJsonItem[] {
  const jsonPath = path.join(process.cwd(), "public", "data", "gallery.json");
  try {
    const raw = fs.readFileSync(jsonPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (x: any) => x && typeof x.src === "string" && typeof x.title === "string" && typeof x.date === "string"
    );
  } catch {
    return [];
  }
}

export default function Page() {
  const items = readGalleryJson();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Camera className="h-16 w-16 text-blue-200" />
          </div>
          <h1 className="text-5xl font-bold mb-6">NCSSM TSA Gallery</h1>
          <p className="text-xl mb-8 max-w-4xl mx-auto">
            Explore highlights from Nationals and workshops, curated from JSON.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Highlights
          </h2>

          {items.length === 0 ? (
            <div className="mx-auto max-w-xl text-center text-gray-600">
              No entries found in <code>/public/data/gallery.json</code>.
            </div>
          ) : (
            <ul
              className="
                grid gap-6
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {items.map((it, i) => (
                <li
                  key={`${it.src}-${i}`}
                  className="
                    group overflow-hidden rounded-2xl bg-white shadow
                    ring-1 ring-gray-200 transition
                    hover:shadow-lg
                  "
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={it.src}
                      alt={it.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={i < 3}
                    />
                  </div>

                  <div className="p-5">
                    {/* Title first */}
                    <h3 className="text-lg font-bold text-gray-900">{it.title}</h3>
                    {/* Date second */}
                    <p className="mt-1 text-sm text-gray-500">{it.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
