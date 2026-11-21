import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { dispatchBookingNotifications } from './bookingNotifications';

const FIREBASE_PROJECT_ID = process.env.GCLOUD_PROJECT || 'platinum-rarity-67k72';
const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-waslatravelhurgh-3fa1bc37-c47f-4aef-af93-bd53d7bb71d1';

interface PublicSiteSettings {
  email?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
}

async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      FIREBASE_PROJECT_ID
    )}/databases/${encodeURIComponent(FIRESTORE_DATABASE_ID)}/documents/site_settings/public`;
    const resp = await fetch(url);
    if (!resp.ok) return {};
    const docJson = (await resp.json()) as {
      fields?: {
        email?: { stringValue?: string };
        whatsappNumber?: { stringValue?: string };
        whatsappDisplay?: { stringValue?: string };
      };
    };
    return {
      email: docJson.fields?.email?.stringValue?.trim() || undefined,
      whatsappNumber: docJson.fields?.whatsappNumber?.stringValue?.trim() || undefined,
      whatsappDisplay: docJson.fields?.whatsappDisplay?.stringValue?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Cloud Function v2: Automatically triggers on Firestore `bookings/{bookingId}` writes:
 *  1. When a new booking document is created (customer clicks "Confirm Booking"), OR
 *  2. When an existing booking transitions into `status === 'Confirmed'` (operator confirms pickup/voucher).
 *
 * Simultaneously dispatches via Promise.allSettled:
 *  - Bilingual AR/EN confirmation email to the customer (using waslaEmailTemplate.ts)
 *  - Bilingual booking alert email to the official owner email(s)
 *  - Instant WhatsApp push alert to the official owner WhatsApp contact
 */
export const onBookingConfirmed = onDocumentWritten(
  {
    document: 'bookings/{bookingId}',
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

    const result = await dispatchBookingNotifications(
      {
        bookingId,
        eventType: transitionedToConfirmed ? 'booking_confirmed' : 'booking_created',
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
      },
      {
        ownerEmails: ownerEmails.length > 0 ? ownerEmails : ['booking@waslatravel.com'],
        publicSupportEmail,
        ownerWhatsappDigits,
        ownerWhatsappDisplay,
        appUrl: process.env.APP_URL || 'https://waslatravel.com',
      }
    );

    logger.info('Wasla onBookingConfirmed notification dispatch completed', {
      bookingId,
      eventType: transitionedToConfirmed ? 'booking_confirmed' : 'booking_created',
      delivered: result.delivered,
      guestEmailSent: result.guestEmail.sent,
      ownerEmailSent: result.email.sent,
      ownerWhatsappSent: result.whatsapp.sent,
      skipped: result.skipped || null,
    });
  }
);
