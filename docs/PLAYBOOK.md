# WASLA TRAVEL — PLAYBOOK (corrected edition, adopted 2026-11-24)

Owner's operating document for executor agents. This edition folds the specialist approval review into the master plan: 10 of its 11 points adopted as written, point 6 adopted with the owner's amendment (organic TikTok continues; paid TikTok frozen). Where this document and any earlier plan draft disagree, this document wins.

## 1. The business

Hurghada's lowest-friction excursion marketplace. The guest pays nothing in advance: cash on pickup, no deposit, free cancellation up to 24 hours before the trip, one unified cancellation promise worded identically on every surface. One metric: confirmed bookings per week. One promise: answer any guest on WhatsApp in under 15 minutes.

## 2. Strategy

- Trust before traffic. No ad money until the site is live, the brand profiles are real and full, pixels fire with consent, and the trust section is live. The trust section before launch is the personal-testimonials section about the owner as operator (real past guests' words, consent given, no names, no scores). There are no reviews yet and none may be fabricated: placeholder ratings and seeded review texts are removed before launch, and trips show no stars until 5 genuine reviews exist (EU fake-review law applies to German guests).
- Own the WhatsApp conversation. Ad clicks go to WhatsApp or to a trip page with a WhatsApp button, never a generic homepage. The chat is the checkout.
- Two-lane targeting. Main budget on pre-trip tourists (DE/AT/CH in German, UK/NL/PL in English, 0 to 60 days before travel, Egypt/Red Sea interests). About 20% on in-resort guests (Hurghada, El Gouna, Sahl Hasheesh, Makadi) plus retargeting.
- Reviews compound. From booking #1, every guest gets the review-request message at the end of the four-step flow.

## 3. Sprint 0 — preparation (nothing paid; deploy is the LAST act, on the owner's word)

Item zero: complete the catalogue. The sea and safari expansion pack (6 trips plus two restructures, including the Orange Bay repricing) is written and priced and must be entered before anything that promotes it. Luxor, the horse trips and the diving/Marsa Alam trips are already in.

Pre-launch checklist, in order:
1. EMAIL AND ALERTS FIRST: implemented as a Cloudflare Worker (instant alert on booking, plus a scheduled sweep for bookings never alert-flagged), PORTING the logic of the `functions/src/index.ts` codebase as the reference implementation and reusing its email templates (`waslaEmailTemplate.ts`) as-is. The functions code is the spec, not the deploy target: this project is an AI Studio Starter project with no billing and a hard owner rule of no Firebase billing, no Blaze, free tiers only (a Cloud Functions v2 deploy needs Blaze and the Cloud Build/Eventarc/Artifact Registry APIs, which restricted IAM may also block). Then a real end-to-end booking test with the device timezone set to Berlin, and a real send test from booking@waslatravel.com (inbox vs spam).
2. Production secret for the voucher link signer.
3. A real Google Maps Platform key for the hotel picker, with the Google billing decision it may force.
4. Clean the seeded sample emails from the demo data.
5. DMARC record (p=none) and sending-domain warm-up.
6. Remove the maintenance gate and the admin banner from the code entirely, not switched off.
7. Wire the booking form's hotel field into the post-booking WhatsApp pre-fill ({hotelName}).

Decisions and setup in parallel:
- Step 0: Set up and freeze the new WhatsApp line as a **WhatsApp Business** account from Day 1 (Click-to-WhatsApp ads, labels, and quick replies all depend on it), BEFORE any content publishes. Every reel and bio burns the number into the brand; changing it later burns the content. Owner confirms the line is being purchased 2026-11-24 and the final number arrives 2026-11-25; only after the number is final: unify Instagram/TikTok/Facebook (orange W icon, bio with waslatravel.com and WhatsApp button, pin the 30-second video), then publish content.
- Approve and ship the personal-testimonials section (built, awaiting the owner's word) together with the placeholder-rating removal.
- Pixels: create the Meta, TikTok and GA4 accounts, enter the IDs in the owner panel, put cookie consent in front of firing (legal requirement for German traffic), then verify with the Pixel Helper extensions.
- Load the 5 approved WhatsApp templates (EN/DE) as quick replies: post-booking, day-before confirmation, pickup-morning, pickup-point, review request.
- Google Business Profile: start NOW as a parallel slow track (video verification expected, can take weeks, may fail without papers). Nothing in the launch sequence depends on it. The review-request template points at the Google review link only once the profile is live.
- Attribution design task: define how a confirmed WhatsApp cash booking is attributed to an ad (click-to-WhatsApp entry points, per-trip links, booking-ref notation). Without this, paid performance cannot be measured and the kill rule cannot run.
- Set the owner's blackout dates as unbookable.

Deploy: once, at the end, on the finished version, when the owner says so. Code-splitting the 2.6 MB bundle is NOT in this sprint; it is scheduled before paid scale.

## 4. December — dress rehearsal and peak rules

- First week of December: one controlled dress rehearsal on a temporary URL: a friendly test guest and a real supplier, the full flow end to end (booking, email round trip including a guest reply to booking@ that is received and answered as booking@, day-before confirmation, pickup, review request). One booking tested with the device timezone set to Berlin or London. Payment-link micro-transaction and refund tested.
- Christmas and New Year peak weeks: request-only, manually confirmed, limited catalogue, or closed on the owner's chosen dates. No public soft launch in the peak: these are the highest failure-cost weeks of the year, the operation is one person, and suppliers charge 50 to 100% of the trip price for no-show transfers while the model collects nothing in advance.
- Content week runs here (after the number freeze): publish the AR and DE ad videos (EN when it arrives), articles with trip links on Blogger, Facebook, Instagram and Pinterest.

## 5. January — soft launch (gate: 5 to 10 real bookings, zero pickup failures)

- Fill 5 to 10 bookings from Hurghada traveller Facebook groups, Reddit and the personal network. No spend.
- Film guest moments and publish as social proof.
- Every booking flows end to end through the templates. Any manual patch means fix the product before spending.
- Exit criteria: 3 or more flawless flows, sub-15-minute responses, pixels recording real events.

## 6. Paid scale (after the soft-launch gate passes)

- First paid channel: META. TikTok paid stays frozen: the business has no legal papers, and TikTok Ads Manager document verification becomes mandatory past a spend threshold. Organic TikTok posting continues throughout (it carries no ad-authorisation requirement). Paid TikTok reopens only when the owner decides to formalise.
- CONFIRMED BUDGET (owner amendment, 2026-11-25): €20 per month accumulates over 3 months (**€60 total**) and runs as a single **10 to 14 day burst**, **one trip only (Luxor)**, **Germany only**, via Meta Click-to-WhatsApp, and is judged on the **entire €60 batch as one unit rather than on a single booking**. Orange Bay stays **organic plus retargeting only** (not in the first paid campaign). Scaling spend above this happens only from revenue, never from new owner money; organic content and WhatsApp networks carry growth between batches. EN and DE videos run on Reels/TikTok organic plus Meta placements, with Click-to-WhatsApp campaigns first.
- THE KILL RULE, restated (batch unit): the €60 10 to 14 day Luxor/Germany burst is judged as **one complete batch** rather than per individual booking. **Meta's Messaging Conversations Started** reporting is the primary paid judging signal alongside total attributed confirmed bookings and total batch gross margin (margin scales with party size at about €4 to €11.30 per person; target batch ad spend under 25% of total attributed batch gross margin). A passing batch earns reinvestment from revenue (+30% next batch); a failing batch pauses/adjusts creative and targeting as a whole rather than killing mid-batch on a single booking. Attribution follows `docs/ATTRIBUTION-PROPOSAL.md` (pending explicit owner approval); unattributed bookings do not count for or against a paid batch.
- Product in parallel: per-trip SEO pages per language, GA4 funnels, review widget once real reviews exist.

## 7. Months 4 to 12 — hardening the moat

Supplier scorecards (no-shows, ratings), dynamic pickup scheduling, hotel reps and dive centres reselling via private link. Targets: 40+ confirmed bookings per week, 4.8 stars on Google once the profile is live, paid under 20% of bookings.

## 8. Work orders

One packet per agent, never the whole plan. Tech agent: the pre-launch checklist and the deploy. Content agent: profiles, reels, carousels, captions and bios in EN/DE/AR. Ops agent: WhatsApp quick replies, Google Business Profile track, attribution notation. Ads agent: nothing until the soft-launch gate passes. Weekly owner review: bookings, response time, cost per booking, review count.
