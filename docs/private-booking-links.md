# Booking references and private links

New references use WT plus eight cryptographically random characters without dashes. Existing references are unchanged. Creation checks for an existing receipt in the same Firestore transaction and refuses to overwrite it.

Set VOUCHER_LINK_SECRET to the same randomly generated secret (at least 32 bytes) on Express and Firebase Functions before deployment. Never use a VITE_ variable or commit the value. Keep it stable across restarts and replicas. Changing it revokes all previously issued links. Without it, private voucher access fails closed.

Owner/Operations can issue private links through POST /api/vouchers/:bookingId/link by looking up the original booking in Firestore. Supplier and anonymous callers cannot issue links. Confirmation emails include the link; initial public notification requests do not issue it. QR generation uses a staff-issued token or the token on the customer's current private link. Legacy bookings can receive new links through the same staff flow.

Tokens use HMAC-SHA256 bound to the booking reference. They are bearer credentials: anyone with the private link can view that booking's guest-facing voucher. Links have no automatic expiry; rotate the secret to revoke all. The fragment keeps tokens out of ordinary URL request logs. API reads require X-Voucher-Token and return Cache-Control: no-store. Internal notes are excluded from the response. The old public receipt remains a status lookup with no guest contact, room, or financial data.

Voucher reads now use the authoritative Firestore booking through the Cloud Run service identity. No voucher cache or staff dashboard sync is required. See durable-notifications.md for worker deployment and IAM requirements.

Verification: node --test tests/voucher-access.test.ts. Deployment also requires testing real role permissions, email delivery, QR scan, and Firestore transaction behavior in a staging project. No production settings or Firebase rules are deployed by this change.
