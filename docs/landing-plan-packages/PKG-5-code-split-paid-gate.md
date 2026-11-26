# PKG-5 — Minimal code split + paid gate (December; hard gate before the first paid euro)

Settled by the confirmation round (performance + SEO experts): the split is NOT a launch gate; it IS a paid gate. The launch carve-outs (admin split, hero preload, seed-first render) live in PKG-4 and ship with the launch build.

## Scope (the minimal split only)
1. Language packs: dynamic `import()` of the active locale only; EN bundled as fallback; a language switch fetches its pack on demand. Today a German guest downloads 21+ language packs to read one.
2. Below-fold sections lazy-loaded with React.lazy: MomentsReviewCarousel, StorefrontFaq, ContactSupportSection (and any comparably heavy below-fold block).
3. Vendor chunk split (React/Firebase) so it caches independently of app code.
Explicitly deferred (do not do in this package): full route-level splitting, prefetch strategies, AVIF pipeline.

## The gate (all measured on the LUXOR trip page, production build, production hosting)
- Tool/profile: Lighthouse mobile emulation, Moto G Power class, 4x CPU slowdown.
- Network: Slow 4G throttling (1.6 Mbps, 150 ms RTT).
- Pass = median of 3 runs satisfies BOTH: initial-route JS ≤ 400 KB gzip (all JS loaded before the trip detail is interactive) AND LCP ≤ 3.0s.
- The 3.0s is the hard number. The 400 KB is a guardrail: it is waived if real-user field data from the soft-launch weeks shows p75 LCP ≤ 3.0s, or if the Luxor page demonstrably passes LCP at a higher JS weight.
- Evidence: the Lighthouse report itself filed with this package, not a screenshot of a score.

## Acceptance
1. Gate measurements filed and passing (or a documented waiver under the two conditions above).
2. No visual or behavioural change on any page; language switching still works for EN/AR/DE and the extra packs.
3. tsc clean; tests pass.
