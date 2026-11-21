import { onDocumentWritten, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { notifyConversationMessage } from './conversationMail';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { enqueue, processJob } from './notificationOutbox';
import { logger } from 'firebase-functions/v2';
import { dispatchBookingNotifications, configuredNotificationChannels } from './bookingNotifications';

const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-waslatravelhurgh-3fa1bc37-c47f-4aef-af93-bd53d7bb71d1';

interface PublicSiteSettings {
  email?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
}

const adminApp = getApps()[0] || initializeApp();
const store = getFirestore(adminApp,FIRESTORE_DATABASE_ID);
export const notifyBookingConversation = onDocumentCreated({
  document: 'conversations/{bookingId}/messages/{messageId}', database: FIRESTORE_DATABASE_ID,
  region: 'europe-west1', retry: true, timeoutSeconds: 60, memory: '256MiB', maxInstances: 5, concurrency: 1,
}, async event => {
  await notifyConversationMessage(store, event.params.bookingId, event.params.messageId);
});
async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  const snapshot = await store.doc('public_settings/storefront').get();
  return (snapshot.data() || {}) as PublicSiteSettings;
}

/**
 * Cloud Function v2: Automatically triggers on Firestore `bookings/{bookingId}` writes:
 *  1. When a new booking document is created (customer clicks "Confirm Booking"), OR
 *  2. When an existing booking transitions into `status === 'Confirmed'` (operator confirms pickup/voucher).
 *
 * Persists a server-only outbox event; a separate worker dispatches:
 *  - Bilingual AR/EN confirmation email to the customer (using waslaEmailTemplate.ts)
 *  - Bilingual booking alert email to the official owner email(s)
 *  - Instant WhatsApp push alert to the official owner WhatsApp contact
 */
export const onBookingConfirmed = onDocumentWritten(
  {
    document: 'bookings/{bookingId}',
    retry:true,
    database: FIRESTORE_DATABASE_ID,
    region: 'europe-west1',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (event) => {
    const beforeData = event.data?.before?.data() as Record<string, unknown> | undefined;
    const afterData = event.data?.after?.data() as Record<string, unknown> | undefined;

    // Ignore document deletions
    if (!afterData) return;

    const isNewBooking = !beforeData;
    const prevStatus = String(beforeData?.status || '');
    const nextStatus = String(afterData.status || '');
    const transitionedToConfirmed = !isNewBooking && prevStatus !== 'Confirmed' && nextStatus === 'Confirmed';

    // Only fire on initial booking creation or transition into Confirmed status
    if (!isNewBooking && !transitionedToConfirmed) {
      return;
    }

    const bookingId = String(afterData.id || event.params.bookingId || '').trim();
    const publicSettings = await fetchPublicSiteSettings();

    const rawOwnerEmails = String(
      process.env.OWNER_ALERT_EMAIL || publicSettings.email || 'booking@waslatravel.com'
    ).trim();
    const ownerEmails = rawOwnerEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const ownerWhatsappDigits = String(
      process.env.OWNER_WHATSAPP_TO || publicSettings.whatsappNumber || '201129155520'
    ).replace(/\D/g, '');
    const ownerWhatsappDisplay =
      publicSettings.whatsappDisplay ||
      (ownerWhatsappDigits ? `+${ownerWhatsappDigits}` : '+20 112 915 5520');

    const rawNotes = String(afterData.notes || '').slice(0, 800);
    const guideLangMatch = rawNotes.match(/(?:Guide & Email Language|Guide Language)\s*:\s*([^·\n]+)/i);
    const extractedGuestLanguage =
      (guideLangMatch?.[1] || '').trim() ||
      String(afterData.guestLang || 'en').trim();
    const publicSupportEmail =
      publicSettings.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicSettings.email)
        ? publicSettings.email
        : 'booking@waslatravel.com';

    const jobId = await enqueue(store,event.id,{payload:{
        notificationCreatedAtMs: Date.parse(event.time),
        bookingId,
        eventType: transitionedToConfirmed || ['Confirmed', 'Driver assigned', 'Completed'].includes(nextStatus) ? 'booking_confirmed' : 'booking_created',
        tripTitle: String(afterData.tripTitle || 'Wasla Travel Excursion').slice(0, 240),
        destination: String(afterData.destination || 'Hurghada').slice(0, 60),
        tripDate: String(afterData.date || new Date().toISOString().slice(0, 10)).slice(0, 20),
        startTime: String(afterData.tripStartTime || '').slice(0, 80) || undefined,
        pickupTime: String(afterData.pickupTime || '').slice(0, 24) || undefined,
        pickupSpot: String(afterData.pickupSpot || '').slice(0, 40) || undefined,
        assignedDriverOrGuide:
          String(afterData.assignedDriverOrGuide || '').slice(0, 160) || undefined,
        supplierName: String(afterData.supplierName || 'Wasla Operations').slice(0, 120),
        guestName: String(afterData.guestName || 'Guest').slice(0, 120),
        guestCountry: String(afterData.guestCountry || 'Guest').slice(0, 80),
        guestLanguage: extractedGuestLanguage.slice(0, 60),
        guestWhatsapp: String(afterData.guestWhatsapp || '').slice(0, 60) || undefined,
        guestEmail: String(afterData.guestEmail || '').slice(0, 160) || undefined,
        guestContact: String(afterData.guestContact || '').slice(0, 160) || undefined,
        hotel: String(afterData.hotel || 'Hotel Pickup').slice(0, 200),
        roomNumber: String(afterData.roomNumber || '').slice(0, 40) || undefined,
        adults: Math.min(50, Math.max(1, Math.round(Number(afterData.adults) || 1))),
        children: Math.min(50, Math.max(0, Math.round(Number(afterData.children) || 0))),
        infants: Math.min(50, Math.max(0, Math.round(Number(afterData.infants) || 0))),
        grossEur: Math.min(100000, Math.max(0, Math.round(Number(afterData.grossEur) || 0))),
        paymentStatus: String(afterData.paymentStatus || 'Awaiting link').slice(0, 40),
        notes: rawNotes || undefined,
      }, recipients: {
        ownerEmails: ownerEmails.length > 0 ? ownerEmails : ['booking@waslatravel.com'],
        publicSupportEmail,
        ownerWhatsappDigits,
        ownerWhatsappDisplay,
        appUrl: process.env.APP_URL || 'https://waslatravel.com',
      }}
    );

    logger.info('Booking notification queued', {jobId});
  }
);

const workerOptions = {
 eligible:async (job: import("./notificationOutbox").JobInput) => {
   const booking = (await store.doc("bookings/"+job.payload.bookingId).get()).data();
   if (!booking) return false;
   return job.payload.eventType === "booking_created" ? booking.status === "Pending" : ["Confirmed","Driver assigned","Completed"].includes(String(booking.status));
 },
 channels:configuredNotificationChannels,
 send:async (job: import('./notificationOutbox').JobInput, channel: import('./notificationOutbox').Channel, idempotencyKey: string) => {
   const result = await dispatchBookingNotifications(job.payload,job.recipients,process.env,{channel,idempotencyKey});
   return result[channel].sent;
 }
};
export const deliverBookingNotification = onDocumentCreated({
 document:'notification_outbox/{jobId}',database:FIRESTORE_DATABASE_ID,
 region:'europe-west1',timeoutSeconds:240,memory:'256MiB',retry:true,maxInstances:5,concurrency:1,
},async event => {
 await processJob(store,event.params.jobId,workerOptions);
});
// Cloud Run request CPU is not used for a background polling loop.
// Scheduler rescues provider failures and workers that crashed with an outstanding lease.
export const retryBookingNotifications = onSchedule({
 schedule:'every 1 minutes',region:'europe-west1',timeoutSeconds:240,memory:'256MiB',
},async () => {
 const jobs = await store.collection('notification_outbox').where('nextAttemptAtMs','<=',Date.now()).orderBy('nextAttemptAtMs').limit(5).get();
 const results = await Promise.allSettled(jobs.docs.map(job => processJob(store,job.id,workerOptions)));
 logger.info('Notification retry sweep',{processed:results.length,failed:results.filter(r=>r.status==='rejected').length});
});
