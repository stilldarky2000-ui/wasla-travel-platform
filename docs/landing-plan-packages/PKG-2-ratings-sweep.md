# PKG-2 — Ratings sweep (Day 3 of the directive, hard precondition for any public surface)

Goal: zero seeded ratings anywhere a guest, Google, or a lawyer's crawler can see them: visible UI, code seed, Firestore, and structured data. Verified on the RENDERED site, not only in code.

## Code edits (src/data/marketplaceData.ts)
Set `rating: 0` and `reviewCount: 0` on these 11 trips (current seeded values in brackets):
- orange-bay-small-group (4.9 / 64)
- luxor-valley-small-van (4.9 / 49)
- eastern-desert-sunset-safari (4.8 / 53)
- marsa-alam-abu-dabbab-turtles (4.9 / 41)
- hurghada-old-town-marina-walk (4.8 / 29)
- cairo-pyramids-gem-day (4.9 / 34)
- hurghada-private-airport-transfer (4.9 / 82)
- cairo-khan-el-khalili-nile-evening (4.8 / 25)
- luxor-sunrise-balloon (4.9 / 44)
- hurghada-artisan-shopping-tour (4.8 / 31) — note: this trip is separately flagged for removal on the owner's word; zero it either way.
- egyptologist-private-guide-multilang (5.0 / 57)

## Structured data
- src/App.tsx (~line 438) injects an `aggregateRating` block client-side. Remove it entirely until real reviews exist. No `aggregateRating` and no `reviewCount` may remain in any JSON-LD the app emits, including per-trip schema.
- index.html static JSON-LD (TravelAgency + FAQPage): verify it carries no rating fields.

## Homepage curated set
- The Moments carousel currently mixes curated review content. Until PKG-6 (testimonials, after rehearsal week), the carousel must not present any text as a Wasla booking review and must show no stars, scores, or counts. If a clean interim state cannot be achieved by labelling alone, hide the review text and keep photos only.

## Firestore step (owner, same checklist line)
After the code push: in the current Studio preview, delete each of the 11 trips once in Owner Control and reload signed in as owner so they re-seed at 0/0; verify each on its rendered page.

## Acceptance (all must pass)
1. grep for `aggregateRating` in src and index.html returns nothing.
2. grep of marketplaceData.ts shows no trip with rating above 0 or reviewCount above 0 (Moments m1–m6 items are a separate structure, handled in PKG-6).
3. Rendered check in the preview: homepage, Explorer list + detail, and two trip pages show no stars, no scores, no review counts.
4. View-source / rendered DOM contains no rating JSON-LD.
5. tsc clean; the one-page sweep checklist is signed (item, surface, checked, date) and filed with this package.
