# Wasla Travel Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default-Deny Safety Net**: Every unspecified path in Firestore returns `false` for all reads and writes.
2. **No Self-Assigned Roles**: Users cannot create or mutate `admins/{uid}` or `staff_roles/{uid}`. Only the verified bootstrapped owner (`stilldarky2000@gmail.com` with `email_verified == true`) or an existing `admins/{uid}` document can grant or modify roles.
3. **Owner Approval Gate for Supplier Trips**: Suppliers may create trips ONLY with `approvalStatus == 'Pending'` and `supplierUid == request.auth.uid`, and cannot self-approve (`approvalStatus: 'Approved'`). Public tourists can read/list ONLY trips where `approvalStatus == 'Approved'`.
4. **PII Isolation**: Customer PII (`bookings`, `chats`, `complaints`, `newsletter_subscribers`, `email_logs`) is never readable or listable by public users or arbitrary signed-in users. Public booking/inquiry/newsletter creation enforces `status == 'Pending'` and strict field allowlists/bounds, while reads are restricted to verified staff/owner (and suppliers only for their own `supplierUid`).
5. **Immutable Audit & Ownership Fields**: `createdAt` must equal `request.time` on creation and remain unchanged on updates; `updatedAt` must equal `request.time` on updates; `supplierUid` on trips cannot be reassigned by non-owners.
6. **Bounded Arrays & Strict String Lengths**: All arrays (`images <= 8`, `options <= 10`, `highlights <= 8`, `included <= 8`, `messages <= 50`, `languages <= 12`) and strings have explicit upper size bounds to prevent Denial-of-Wallet attacks.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return `PERMISSION_DENIED`)
1. **Shadow Role Escalation on Access Request**: Authenticated user creates `/access_requests/{uid}` with `status: "Approved"` instead of `"Pending"`.
2. **Self-Granting Admin/Staff Role**: Authenticated non-owner writes `/staff_roles/{uid}` with `role: "owner"`.
3. **Unapproved Trip Self-Publishing**: Supplier creates `/trips/fake-trip` with `approvalStatus: "Approved"` directly bypassing owner moderation.
4. **Cross-Supplier Hijack**: Supplier A updates `/trips/trip-B` belonging to Supplier B (`supplierUid != request.auth.uid`).
5. **Unauthenticated PII Scrape**: Anonymous visitor attempts `get` or `list` on `/bookings`.
6. **Booking Ghost Field Injection**: Public booking `create` payload includes unauthorized `"isPaid": true` or `"discountOverride": 100` shadow field.
7. **Booking Status Tampering on Create**: Public booking `create` sets `status: "Confirmed"` or `paymentStatus: "Paid online"` instead of `"Pending"` / `"Awaiting link"`.
8. **Spoofed Admin Email (Unverified)**: Attacker authenticates with `email: "stilldarky2000@gmail.com"` where `email_verified: false` and attempts to read `/owner_settings/platform`.
9. **ID Poisoning Attack**: Attacker attempts `create` on `/bookings/<250-char-junk-id!@#>` violating `isValidId()`.
10. **Immutable `createdAt` Tampering**: Supplier or operator updates `/trips/{id}` while backdating `createdAt`.
11. **Terminal Booking Mutation**: Non-owner attempts to modify a booking whose existing status is `"Refunded"` or `"Completed"`.
12. **Unbounded Array / Payload Bloat**: Supplier submits `/trips/t1` with 25 images or a 5,000-character description string.
