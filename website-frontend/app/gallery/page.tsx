import fs from "fs";
import path from "path";
import PageBanner from "../components/PageBanner";
import GalleryGrid, { type GalleryItem } from "./GalleryGrid";

function readGalleryJson(): GalleryItem[] {
  const jsonPath = path.join(process.cwd(), "public", "data", "gallery.json");
  try {
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) => x && typeof x.src === "string" && typeof x.title === "string" && typeof x.date === "string"
    );
  } catch {
    return [];
  }
}

export const metadata = { title: "Gallery" };

export default function Page() {
  const items = readGalleryJson();
  // Group by event label ("States 2026", "Nationals 2026", ...) keeping file order.
  const groups = [...new Set(items.map((i) => i.date))].map((date) => ({
    date,
    items: items.filter((i) => i.date === date),
  }));

  return (
    <div className="min-h-screen bg-paper">
      <PageBanner
        title="Gallery"
        image="/pics/states_2026/IMG_4651.jpg"
        alt="The NCSSM Durham TSA chapter with its trophies and an 'NCSSM Sweeps' banner at the 2026 NC TSA State Conference"
        focus="50% 45%"
      >
        Trophies, stage walks and the moments in between.
      </PageBanner>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <p className="py-16 text-center text-ink-soft">No photos yet.</p>
        ) : (
          <div className="space-y-14">
            {groups.map((g) => (
              <section key={g.date} aria-labelledby={`g-${g.date}`}>
                <div className="mb-5 border-b-2 border-ink pb-2">
                  <h2 id={`g-${g.date}`} className="display text-3xl sm:text-4xl">
                    {g.date}
                  </h2>
                </div>
                <GalleryGrid items={g.items} />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
