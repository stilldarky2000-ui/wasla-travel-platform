# Durable bookings and notification delivery

## What changes

The original Firestore booking is now the voucher source of truth. Cloud Run reads it through Application Default Credentials and returns only an explicit guest-facing field allowlist after verifying the private voucher token. No temporary voucher file, staff browser sync or local delivery cache is required. Internal notes, supplier cost, guest contact fields and passport images are not in the voucher response. Status updates are read from the booking rather than an old snapshot.

A booking-created or first transition-into-Confirmed Firestore event is captured by the existing onBookingConfirmed function name. It creates one notification_outbox document per CloudEvent ID in a transaction. Repeated delivery of that same event does not replace the payload or reset progress. A new, genuinely different confirmation transition has its own event and can create a new job.

The deliverBookingNotification function is the sole automatic sender. It claims a five-minute lease transactionally and checkpoints each successful channel separately. Retries skip those successful channels. Failed attempts back off from 30 seconds to a maximum of one hour; the one-minute scheduler adds up to one minute of polling delay. retryBookingNotifications rescues retryable jobs and expired leases after a crash. Delivery workers have maxInstances 5 and concurrency 1 per instance. The scheduled sweep processes up to five due jobs per invocation; monitor backlog before a large campaign.

Missing configuration remains retryable. Obsolete pending notifications and notifications for cancelled, refunded, missing or otherwise ineligible bookings are suppressed by re-reading the original booking. A saved booking remains saved even when notifications fail. Browser forms wait for the Firestore transaction before displaying success, and no longer claim that email was delivered immediately. The outbox is inaccessible to browser SDK clients; rules deny all client reads and writes.

## Delivery guarantees and operations

This is at-least-once delivery with transactional claims and progress, not universal exactly-once email/WhatsApp delivery. Resend receives a stable per-event/per-channel Idempotency-Key. SMTP and WhatsApp transports have no universal equivalent. A provider can accept a message before the worker crashes or loses its checkpoint write; a later retry can then duplicate that message. A successful provider response is recorded as delivered/accepted by the provider, not proof of arrival in the recipient inbox. Repeated failures remain retryable until an operator fixes configuration or resolves the job. No failed job is silently marked complete because another channel succeeded.

Monitor notification_outbox status, attempts, nextAttemptAtMs and the delivered channel map with privileged server/console access. No raw provider errors or secret values are stored in job failure records. Use the existing authenticated Owner diagnostics for provider configuration failures. Job payloads contain guest operational information and must remain server-only. There is no automatic history deletion; set a deliberate retention policy only after defining an acceptable deduplication/replay window. Keep old temporary files out of backups and never import them as authoritative booking data.

## Deployment prerequisites and order

No production deployment is performed by this patch.

1. Install the root dependencies and run npm ci in functions. Build functions before running the tests. The new functions/package-lock.json pins that worker's dependencies. The dependency follow-up refreshed both root lockfiles and aligned esbuild with Vite. A fresh root npm ci and a fresh Functions npm ci now pass, without force or legacy peer dependency flags. See dependency-installation.md for the reproduction and validation details.
2. Use a dedicated staging project/database and run the checks below. Confirm FIREBASE_PROJECT_ID and FIRESTORE_DATABASE_ID point to the intended project/named database; the Functions trigger database must match the browser database. The new rules must be applied to that same database, not accidentally only to (default).
3. Give the Cloud Run service identity read access to the intended Firestore database (for example, an appropriately scoped roles/datastore.viewer grant). Give the Functions service identity the required database read/write permissions, including outbox transactions. Use attached service identities/ADC; do not ship service account keys or elevated database credentials to the browser. Public client rules do not replace IAM checks for these server identities.
4. Configure the same VOUCHER_LINK_SECRET on Express and Functions for one environment, and a different secret in staging. It must contain at least 32 random bytes and must remain stable across restarts. Configure the notification provider credentials in the Functions runtime as well as the Owner diagnostic server where needed. If using Secret Manager, explicitly bind each secret to the relevant runtime; merely creating a secret does not expose it to process.env. The existing source consumes runtime environment variables and does not create or bind production secrets.
5. Enable the services and billing required by the chosen Cloud Functions/Eventarc/Scheduler setup. This patch adds a scheduled retry function; check associated billing and quotas before enabling it. No Cloud Run background timer or always-on request CPU is required.
6. Deploy the Cloud Run server revision that removes automatic Express sending, and update the existing onBookingConfirmed function in place together with deliverBookingNotification and retryBookingNotifications. Do not leave an old automatic sender running beside the new one. Pause booking intake for the cutover if needed, and review in-flight events to avoid old/new sender overlap. Do not deploy only the browser change and forget the worker: without the booking trigger, no outbox is created.
7. In staging, verify save failure keeps the form open, a saved request remains visible during provider failure, private-link and QR access work after restarting Cloud Run with no dashboard open, cancellation is reflected, and recovery retries only unfinished channels. Test real staff role tokens and provider delivery separately; automated provider tests send no real messages. Only then deploy publicly.

POST /api/notifications/new-booking and /booking-confirmed are compatibility acknowledgements, not send commands. The public endpoint ignores submitted guest data. Owner test notifications remain explicit diagnostics and are not durable booking jobs. POST /api/vouchers/sync is a compatibility no-op. Old booking IDs continue to work through staff-issued private links and direct Firestore reads; no booking rewrite is required.

## Local checks

Use Node with the project's tsx tooling and a Java runtime supported by Firebase CLI. From the repository root:

- npm test (builds Functions, then runs reference/token and mocked provider tests)
- npm run lint
- npm run build
- npm --prefix functions run build
- npx firebase-tools@15 emulators:exec --only firestore --project demo-wasla-outbox --config firebase.outbox-test.json "node --import tsx --test tests/durable-outbox.test.mjs"

The emulator suite refuses to run without the expected local emulator endpoint. It tests duplicate events, concurrent claims, partial-channel retry/backoff, expired leases, missing configuration recovery, provider exceptions/suppression, voucher persistence/privacy, denied client outbox access, and real Express HTTP routes. It does not verify deployed Eventarc/Scheduler wiring or real outbound delivery.
