# Wasla Travel: Booking Attribution Proposal (One-Page Spec)

**Status:** PROPOSAL FOR OWNER APPROVAL ONLY. Zero code or catalog implementation before explicit owner sign-off on this PR.

## Step 0 Prerequisite: WhatsApp Business From Day 1

Configure the frozen phone line as a **WhatsApp Business** account from Day 1. Click-to-WhatsApp ads, conversation labels, and quick-reply templates all depend on it.

## 1. Primary System: Automatic Website-to-Booking Link

- Capture `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content` on first landing at `waslatravel.com` (including trip landing URLs) and persist them in browser `sessionStorage`.
- When the guest submits a booking, attach the stored UTM fields automatically to the booking record in Firestore so source tracking requires zero manual guest input.

## 2. WhatsApp-to-Booking Link

- `{bookingRef}` in approved Template 1 (`docs/whatsapp-templates.md`, used verbatim) ties the incoming WhatsApp conversation directly to the booking record and its saved UTM source.

## 3. Fixed `source` Dropdown in Owner / Operations Panels

- Replace any free-text source entry with a **fixed select dropdown** (mirrored 1:1 as WhatsApp Business chat labels) so reporting stays clean:
  `meta_paid_de_luxor` | `meta_retargeting` | `organic_instagram` | `organic_tiktok` | `organic_facebook` | `organic_pinterest` | `facebook_group` | `reddit` | `google_search` | `referral_network` | `direct_unknown`.

## 4. Fallback Signal Only: Direct Click-to-WhatsApp Without Website Form

- An opening code in the first message is retired as the primary tracking mechanism.
- For direct ad-to-WhatsApp or bio-to-WhatsApp flows that bypass the website form, use a short reference code **only as a fallback signal at the end of a natural full sentence**, for example:
  `"Hallo Wasla Travel, ich interessiere mich für den Tagesausflug nach Luxor ab Hurghada. Ref: MDE-LUX"`

## 5. Lost-Source Recovery Rule

- If neither UTM nor fallback `Ref:` is present, the operator may ask **at most one optional question in the first operator reply only** (e.g., *"By the way, where did you hear about us?"*).
- **Never** ask how the guest found Wasla in booking confirmation, day-before, pickup, or review-request messages.

## 6. Primary Basis for Judging Paid Ads

- **Meta's Messaging Conversations Started** reporting in Meta Ads Manager is the primary basis for judging paid performance, paired with attributed confirmed bookings and total batch gross margin across the **€60 10 to 14 day Luxor (Germany only) batch as one unit** (pending owner approval of the Playbook amendment).
- Unattributed bookings (`direct_unknown`) never count for or against a paid batch.

## 7. Approval & Handoff

- Upon explicit owner approval of this PR, the Tech Agent implements session UTM capture, the fixed `source` dropdown, and `{hotelName}` pre-fill on Template 1.
