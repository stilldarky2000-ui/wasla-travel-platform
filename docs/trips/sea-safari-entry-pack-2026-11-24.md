# Wasla — Sea & Safari Entry Pack (2026-11-24)

Instructions for the entering agent (Gemini in AI Studio / Antigravity). Source of truth for all copy: `docs/trips/trips-copy-expert-2026-11-24.md` (same repo). Enter every trip exactly to the pattern of the existing trips in `src/data/marketplaceData.ts` (see the Orange Bay object): EN copy below is final; produce the AR and DE fields by translation, following the existing trips' style. Hard rules: rating 0 and reviewCount 0 on every new trip; NO em dashes anywhere; NO supplier name in any guest-visible field; NO meetingPointUrl; guide languages ['English', 'German'] unless stated; "Alcohol and drugs" appears once, in Not allowed only; no durations inside description prose (durations live in the duration field only).

Common sea-trip wiring (Dolphin House, Paradise, Hula Hula, Speed Boat): category 'sea', destination 'Hurghada', departure from the marina with hotel pickup before, transfer zones in the tips/not-included lines exactly as Orange Bay: El Gouna, Sahl Hasheesh, Makadi +€10 per person; Soma Bay, Safaga +€15 per person. Internal supplierName (never guest-visible): 'Red Sea Boat Partner'.

PHOTOS: no photos have been selected for the new trips yet. Leave the images array with the closest existing sea image as a TEMPORARY placeholder and flag it in your report; the operator will replace galleries before launch. Do not invent captions for placeholder images.

---

## NEW TRIP 1 — Dolphin House

- id: `dolphin-house-snorkeling`
- Price: €17 per person (trip price 17, one option: id `opt-dolphin-shared`, title 'Small-Group Boat (Standard)', detail 'Dolphin House reef + 2 snorkel stops · buffet lunch & drinks', price 17)
- Departure: ['08:30 AM'], duration: 'Full day'
- Copy: section 4 of the expert copy file (title, short description, full description, highlights, included, not included, not suitable, what to bring, not allowed, know before you go), verbatim EN.
- Keep the honesty lines exactly as written: dolphins are wild and never guaranteed, the crew never chases or disturbs them.
- The [OPERATOR TO CONFIRM] item in Not suitable stays OUT of the published copy; use only the guaranteed-sighting line.

## NEW TRIP 2 — Paradise Island Premium

- id: `paradise-island-premium`
- Price: €37 per person (trip price 37, one option: id `opt-paradise-premium`, title 'Premium Small-Group Boat', detail 'Fewer guests · 2 quiet reef stops · premium lunch on the island', price 37)
- Departure: ['08:30 AM'], duration: 'Full day'
- Copy: section 5 of the expert copy file, verbatim EN. The premium rests on two facts that must survive entry word for word: deliberately fewer guests, and lunch served ON the island.
- The [OPERATOR TO CONFIRM] item in Not suitable stays OUT; use only the quiet-boat line.

## NEW TRIP 3 — Hula Hula Island

- id: `hula-hula-island`
- Price: €22 per person (trip price 22, one option: id `opt-hula-shared`, title 'Small-Group Boat (Standard)', detail '2 snorkel stops + 2 hours on Hula Hula island · buffet lunch & drinks', price 22)
- Departure: ['08:30 AM'], duration: 'Full day'
- Copy: section 6 of the expert copy file, verbatim EN. Position is the quieter alternative island, priced ABOVE Orange Bay on purpose.
- The [OPERATOR TO CONFIRM] item in Not suitable stays OUT; use only the famous-beach line.

## NEW TRIP 4 — Private Speed Boat (own trip)

- id: `hurghada-private-speed-boat`
- Price: €101 FIXED for the whole boat, not per person (trip price 101, one option: id `opt-speedboat-whole`, title 'Private Speed Boat (Whole Boat · €101 Fixed)', detail '€101 fixed for the whole boat, up to 6 guests · departure time agreed when you book · private captain & guide', price 101)
- Capacity: up to 6 guests (operator's ruling for this boat).
- Departure: [] with know-before-you-go carrying 'Departure time and trip length are agreed with you when you book.' If the schema requires a departureTimes entry, use ['By agreement'].
- Duration: 'By agreement'
- Copy: section 7 of the expert copy file, verbatim EN, with the capacity line completed as 'The boat takes up to 6 guests.'

## NEW TRIP 5 — Star Gazing by Jeep

- id: `hurghada-star-gazing-jeep`
- category 'desert', destination 'Hurghada', internal supplierName 'Desert Safari Partner'
- Price: €22 per person (trip price 22, one option: id `opt-stargazing-jeep`, title 'Star Gazing by Jeep (Dinner Included)', detail 'Jeep into the desert · dinner included · star watching away from city lights', price 22)
- Departure: ['05:00 PM'], duration: 'Evening trip'
- Copy: section 8 of the expert copy file, verbatim EN. It is deliberately minimal: only confirmed facts (jeep, desert, dinner included, 17:00, pickup, star watching). Do NOT add a village stop, telescope, show or return time; those are unconfirmed and listed at the top of section 8.
- The [OPERATOR TO CONFIRM] Not suitable stays OUT; publish with an empty not-suitable list rather than inventing one.

## NEW TRIP 6 — Super Safari (own trip, split out of the safari trip)

- id: `hurghada-super-safari`
- category 'desert', destination 'Hurghada', internal supplierName 'Desert Safari Partner'
- Price: €20 per person (trip price 20, one option: id `opt-super-safari-full`, title 'Super Safari (Full Program · Dinner & Show Included)', detail 'Quad & spider car · jeep to Bedouin village · BBQ buffet dinner & oriental show', price 20)
- Duration: '7 hours'
- Departure: ['01:00 PM'] as the working afternoon pattern, flagged for operator confirmation in your report.
- Copy: section 2 of the expert copy file, verbatim EN (program and price confirmed by the operator 2026-11-24). The one [OPERATOR TO CONFIRM] line in Know before you go (driving age rule) stays OUT of published copy.

---

## RESTRUCTURE A — Orange Bay (`orange-bay-small-group`)

1. Trip price 38 → 20. Option `opt-orange-shared` price 38 → 20.
2. DELETE option `opt-orange-private` (the €145 speedboat). The speed boat is now its own trip (New Trip 4 above). Nothing about a speedboat stays on the Orange Bay page.
3. Replace short description, highlights, included and full description with section 3 of the expert copy file (the €20 copy: two snorkeling stops, two hours on the island, open buffet lunch on board, drinks all day, no water games stated as a virtue). Keep the existing images and galleryCaptions.
4. Do not touch rating/reviewCount in this pack; ratings are handled in a separate decided step.

## RESTRUCTURE B — Safari split (`eastern-desert-sunset-safari` becomes Quad only)

1. DELETE option `opt-safari-buggy` (the €49 'Super Safari' option). Super Safari is now its own trip (New Trip 6 above).
2. Duration back to { en: '3 hours', ar: '3 ساعات', de: '3 Stunden' }.
3. departureTimes stay ['09:00 AM (Morning)', '02:30 PM (Sunset)'] (operator's ruling: morning and sunset runs).
4. Included line 2 becomes the quad-only wording, EN: 'Quad, helmet, safety briefing & Bedouin tea', AR: 'الكواد والخوذة وشرح الأمان والشاي البدوي', DE: 'Quad, Helm, Sicherheitseinweisung & Beduinentee' (the Super Safari parenthesis comes out, dinner is not part of this trip in any wording).
5. Full copy for this trip: section 1 of the expert copy file (quad-only master: village, tea and camel ride included, NO meals, stated plainly). Keep the existing image (desertSunsetImg).

## After entry — report back

List per trip: id, price, options count, image placeholder used. Confirm: tsc clean, build OK, zero em dashes introduced, no supplier name in any guest-visible field, no meetingPointUrl on any new trip.
