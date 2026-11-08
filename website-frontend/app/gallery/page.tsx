import PageBanner from "../components/PageBanner";
import { getGallery } from "../services/content";
import GalleryGrid, { type GalleryItem } from "./GalleryGrid";

// Rebuilt at most once a minute, so photos added in the admin panel show up without a redeploy
export const revalidate = 60;

async function loadGallery(): Promise<GalleryItem[]> {
  try {
    return await getGallery({ next: { revalidate: 60 } });
  } catch (e) {
    // While rebuilding in the background, failing keeps the last good page instead of caching an empty gallery.
    // Only an initial build (no page yet) falls back to empty so the deploy itself can't fail on an API hiccup.
    if (process.env.NEXT_PHASE !== "phase-production-build") throw e;
    return [];
  }
}

export const metadata = { title: "Gallery" };

export default async function Page() {
  const items = await loadGallery();
  // Group by album ("States 2026", "Nationals 2026", ...) keeping the admin's order.
  const groups = [...new Set(items.map((i) => i.album))].map((album) => ({
    album,
    id: `album-${album.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    items: items.filter((i) => i.album === album),
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
              <section key={g.album} aria-labelledby={g.id}>
                <div className="mb-5 border-b-2 border-ink pb-2">
                  <h2 id={g.id} className="display text-3xl sm:text-4xl">
                    {g.album}
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
