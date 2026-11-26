# PKG-3 — Worker email/alert port + /api/ sweep (December, first item; launch blocker)

Why: the site deploys as static files on Cloudflare Pages. Every `/api/` call dies on that deploy unless its logic moves into the Cloudflare Worker (same home as the voucher signer prototype). If this package slips, booking confirmation emails and owner alerts silently never fire.

## Source material in the repo
- `functions/` holds a complete Firebase Functions v2 codebase (onBookingConfirmed trigger on bookings/{id}, notification outbox, scheduler sweep, conversation mail) with templates in `functions/src/waslaEmailTemplate.ts`. It CANNOT be deployed: Cloud Functions v2 needs Blaze billing, which the owner refuses and the Starter project lacks. Port its LOGIC and TEMPLATES into the Worker; do not deploy the functions.
- `server.ts` also carries alert logic (~line 431); treat the functions codebase as the primary source and reconcile differences in favour of the functions version, reporting any conflict.

## Scope
1. Booking confirmation path: on new booking, prepare the unified confirmation (template: ~/workspace/goals/goal/files/wasla-booking-confirmation-template.md as adopted in the Worker context) and the owner alert, sent via Resend from booking@waslatravel.com (domain already authenticated: SPF + DKIM verified). Owner reviews and sends confirmations himself per the standing workflow; the Worker prepares and, where the flow requires, sends the alert to the owner.
2. The operative-terms sentence (PKG-7) must be part of the confirmation template.
3. /api/ sweep: 19 call sites in 9 files (TrackBookingModal.tsx, WaslaHotelMapPicker.tsx, ConversationPanel.tsx, OperationsDesk.tsx, OwnerTripEditorModal.tsx, SupplierPortal.tsx, OwnerControl.tsx, src/lib/apiAuth.ts, src/lib/printVoucher.ts). For EACH site, record a disposition in this package's appendix before coding: port to Worker / replace client-side / drop with owner's approval. No site may be left undecided.
4. Secrets (Resend key, voucher secret) live only as Worker secrets, never in the repo or chat.

## Acceptance
1. End-to-end test on the staging deploy: a test booking produces the owner alert and a prepared confirmation; a real send test from booking@waslatravel.com lands in the Inbox, not Spam (Day-5 directive item).
2. Every /api/ call site has a recorded disposition and the deployed static build contains no call to a non-existent endpoint.
3. tsc clean; Worker behaviour verified live (not only locally).
