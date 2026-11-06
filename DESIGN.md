# Design

The student site (`website-frontend`) visual system. Tokens live in `website-frontend/app/globals.css` (`@theme`), so Tailwind classes like `bg-tsa`, `text-ink-soft`, `border-line` work everywhere.

## Theme
Light. Members read event briefs on laptops late at night and on phones between classes; visitors browse photos in daylight. Real chapter photos carry the identity.

## Color (OKLCH)
| Token | Use |
|---|---|
| `ink` / `ink-soft` / `muted` | Text, from strongest to quietest. Navy-tinted, never pure black. |
| `paper` / `paper-2` | Page background and quiet bands (key dates, skeletons). Warm off-white, never pure white. |
| `line` | Hairlines and dividers. |
| `tsa` / `tsa-deep` / `tsa-tint` | TSA blue: links, primary buttons, header, footer, banner scrims, theme callouts. |
| `signal` | TSA red. Rare: active nav underline and deadlines only. |

Strategy: committed blue on banners, header and footer; restrained inside content.

## Typography
One family, Archivo (variable, width axis), two voices:
- **Display** (`.display`): 68% width, weight 800, uppercase, tight leading. Page titles, section heads, dates, wordmark.
- **Body**: normal width. Hierarchy comes from size and weight.
- Use `.tabular` for counts and dates.
- **Two sizes per block.** A block gets the display title plus one body size; no small kickers stacked over titles or tiny labels under them. Hierarchy inside a block comes from weight and color (e.g. date lists: date bold blue, event regular, place muted, all one size). Section counts sit at the heading size in a lighter tone.

## Components
- **PageBanner** (`app/components/PageBanner.tsx`): full-bleed chapter photo, left-weighted navy scrim, left-aligned display title and a one-line deck (no kicker). Set `focus` (object-position) to keep faces clear of the title.
- **Section head**: display heading + muted count, over a 2px ink rule.
- **Events and Resources** keep the original card UI below their PageBanner (owner preference); only their data and links are current.
- **Tags** (`.tag-badge`): small rounded format labels.
- **DateList** (`app/components/DateList.tsx`): fixture-style rows (date, event, place) used on Home, Resources and the portal; reads `public/data/upcoming_dates.json`. `tone="dark"` for photo/navy backgrounds.
- **Instagram**: the pink-to-yellow logo/handle colors are a deliberate owner-approved exception to the no-gradient-text rule.

## Motion
`ease-out-quart`, 200 to 300ms (700ms for the photo carousel). Animate only transform, opacity, colors and grid rows. Everything respects `prefers-reduced-motion`.

## Don'ts
No centered icon-over-title heroes, gradient text, colored side-stripe borders, identical icon card grids, or bounce animations.
