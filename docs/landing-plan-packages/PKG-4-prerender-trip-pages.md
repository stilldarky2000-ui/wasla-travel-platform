# PKG-4 — Prerendered trip pages EN/DE + launch carve-outs (December, after PKG-3 starts)

Why (SEO expert, code-verified): trips currently live at `?trip=<id>` with the canonical pointing to `/`, so Google sees ONE indexable URL for 25 products; there is no hreflang and no /de/ path, so German is not indexable at all; the served HTML body is an empty shell, which also makes the site invisible to non-JS crawlers and AI search.

## Deliverables
1. Real paths per trip: `/trips/<keyword-slug>/` (slug carries the search phrase, not the internal id; keep a slug-to-id map in one place). Self-referencing canonical per trip; unique title, meta description, and H1 per trip.
   - Title pattern: `Orange Bay Island Trip from Hurghada: Snorkeling, White Sand & Lunch | Wasla Travel`
   - Meta pattern carries the price anchor: "Hurghada excursions from €17: boat trips, diving, safari and Luxor in small groups. Cash on pickup, no deposit, free cancellation up to 24h before." (homepage; per-trip metas follow the same discipline with the trip's own price.)
   - og:title aligns with the title tag (no bare brand-only og:title).
2. German: `/de/` prefix for the homepage and at least the top 6 trips (Luxor first), with genuine German titles/meta, e.g. `Luxor Tagesausflug ab Hurghada: Karnak, Tal der Könige & Hatschepsut | Wasla Travel`. hreflang en/de/ar + x-default on every prerendered page.
3. Prerender at build time: real HTML documents for `/`, every `/trips/<slug>/`, `/de/` and the German trip pages, each containing its title, meta, canonical, hreflang, JSON-LD (TouristTrip + Offer with price/EUR + BreadcrumbList) and the trip's full text content (description, itinerary, inclusions, know-before-you-go, price). The SPA boots on top for interactivity. NO aggregateRating anywhere until real reviews exist.
4. Sitemap regenerated with ALL trip URLs in both languages (replacing the current 6-URL param sitemap); robots.txt unchanged unless a rule is needed for the new paths.
5. Launch carve-outs (both experts, non-negotiable, ship IN the launch build, not later):
   - Admin/owner surface split out of the public bundle.
   - Hero image preload (`<link rel="preload" as="image">`).
   - Seed-first render: hero + Explorer paint immediately from the bundled seed data; the Firestore result refreshes the UI in the background when it lands.

## Acceptance
1. View-source (no JS) of a trip page shows its full text content, correct title/meta/canonical/hreflang and JSON-LD.
2. All 25 EN trip URLs + /de/ home + 6 DE trip URLs return 200 on the staging deploy and appear in the sitemap.
3. The old `?trip=` URLs redirect or canonicalise to the new paths; no duplicate indexable variants.
4. Lighthouse SEO category passes on home + Luxor EN/DE; tsc clean.
