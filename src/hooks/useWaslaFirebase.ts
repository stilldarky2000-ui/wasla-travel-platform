import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { Lang } from '../data/i18n';
import {
  CATEGORY_FALLBACK_IMAGE,
  LocalizedText,
  SITE_CONFIG,
  TRIPS,
  Trip,
  resolveBundledMediaUrl,
} from '../data/marketplaceData';
import {
  AccessRequestRecord,
  ChatThread,
  ComplaintCase,
  INITIAL_BOOKINGS,
  INITIAL_CHATS,
  INITIAL_COMPLAINTS,
  INITIAL_EMAIL_LOGS,
  INITIAL_SUPPLIERS,
  INITIAL_TRIP_REVIEWS,
  PlatformBooking,
  PlatformEmailLog,
  StaffRoleRecord,
  SupplierProfile,
  TripReviewRecord,
  sortBookingsNewestFirst,
} from '../data/platformData';
import {
  isBookingSoundMuted,
  playNewBookingChime,
  setBookingSoundMuted,
  showDesktopBookingNotification,
} from '../lib/alerts';
import {
  BOOTSTRAPPED_OWNER_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../lib/firebase';

export type EffectiveRole = 'owner' | 'operations' | 'supplier' | 'none';
export type HeroFontStyle = 'editorial' | 'modern' | 'clean' | 'luxury' | 'bold' | 'architectural';
export type HeroThemeStyle =
  | 'red-sea'
  | 'midnight'
  | 'golden-dusk'
  | 'minimal'
  | 'deep-turquoise'
  | 'coral-horizon'
  | 'desert-amber'
  | 'obsidian-gold';

export interface AdminUserRecord {
  uid: string;
  email: string;
}

export interface PublicStorefrontSettings {
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  domain: string;
  airTicketsEnabled: boolean;
  metaPixelId?: string;
  ga4Id?: string;
  heroImageUrl?: string;
  heroCaptionEn?: string;
  heroCaptionAr?: string;
  heroCaptionDe?: string;
  heroSubEn?: string;
  heroSubAr?: string;
  heroSubDe?: string;
  heroFontStyle?: HeroFontStyle;
  heroTheme?: HeroThemeStyle;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

function truncateText(value: unknown, maxLen: number, fallback = ''): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  const safe = raw || fallback;
  return safe.length > maxLen ? safe.slice(0, maxLen) : safe;
}

function sanitizeDocId(value: unknown, fallbackPrefix: string): string {
  const cleaned = String(value || '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 128);
  return cleaned.length >= 2 ? cleaned : `${fallbackPrefix}-${Date.now()}`;
}

const SUPPORTED_LANGS: readonly Lang[] = [
  'en', 'ar', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'cs', 'sv', 'ro',
  'ru', 'uk', 'tr', 'zh', 'ja', 'ko', 'no', 'da', 'fi', 'hu', 'el', 'hi',
];

function normalizeLang(val: unknown): Lang {
  return typeof val === 'string' && SUPPORTED_LANGS.includes(val as Lang) ? (val as Lang) : 'en';
}

function sanitizeLocalized(
  input: Partial<LocalizedText> | undefined,
  maxLen: number,
  fallback: string
): LocalizedText {
  const baseEn = truncateText(input?.en || input?.ar || input?.de, maxLen, fallback);
  const out: LocalizedText = {
    en: truncateText(input?.en, maxLen, baseEn),
    ar: truncateText(input?.ar, maxLen, baseEn),
    de: truncateText(input?.de, maxLen, baseEn),
  };
  const extraKeys = [
    'fr', 'es', 'it', 'nl', 'pl', 'pt', 'cs', 'sv', 'ro',
    'ru', 'uk', 'tr', 'zh', 'ja', 'ko', 'no', 'da', 'fi', 'hu', 'el', 'hi',
  ] as const;
  for (const k of extraKeys) {
    const val = input?.[k];
    if (typeof val === 'string' && val.trim().length > 0) {
      out[k] = truncateText(val, maxLen, '');
    }
  }
  return out;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number, round = true): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  const bounded = Math.min(max, Math.max(min, num));
  return round ? Math.round(bounded) : bounded;
}

function sanitizeTripForFirestore(trip: Trip, supplierUid?: string): Record<string, unknown> {
  const cleanOptions = trip.options?.slice(0, 10).map((opt, idx) =>
    stripUndefined({
      id: sanitizeDocId(opt.id, `opt-${idx + 1}`),
      title: sanitizeLocalized(opt.title, 160, 'Standard Option'),
      detail: opt.detail ? sanitizeLocalized(opt.detail, 240, 'Included') : undefined,
      price: clampNumber(opt.price, 1, 50000, 10),
    })
  );

  const rawHighlights = Array.isArray(trip.highlights) && trip.highlights.length > 0
    ? trip.highlights.slice(0, 8)
    : [{ en: 'Vetted local operator', ar: 'منظم محلي معتمد', de: 'Geprüfter lokaler Anbieter' }];
  const cleanHighlights = rawHighlights.map((item) =>
    sanitizeLocalized(item, 240, 'Vetted local operator')
  );

  const rawIncluded = Array.isArray(trip.included) && trip.included.length > 0
    ? trip.included.slice(0, 8)
    : [{ en: 'Hotel pickup & local guide', ar: 'التوصيل من الفندق ومرشد محلي', de: 'Hotelabholung & lokaler Guide' }];
  const cleanIncluded = rawIncluded.map((item) =>
    sanitizeLocalized(item, 240, 'Hotel pickup & local guide')
  );

  const cleanImagesRaw = (trip.images || [])
    .filter((img): img is string => typeof img === 'string' && img.trim().length > 0 && img.length <= 250000)
    .map((img) => resolveBundledMediaUrl(img, trip.category))
    .slice(0, 8);
  const cleanImages =
    cleanImagesRaw.length > 0
      ? cleanImagesRaw
      : [CATEGORY_FALLBACK_IMAGE[trip.category] || SITE_CONFIG.heroBackground];

  const cleanSupplierName = truncateText(trip.supplierName, 120, 'Wasla Partner');
  const safeSupplierName = cleanSupplierName.length >= 2 ? cleanSupplierName : 'Wasla Partner';

  const resolvedUid = supplierUid ?? trip.supplierUid;
  const safeSupplierUid =
    typeof resolvedUid === 'string' && resolvedUid.trim().length > 0
      ? resolvedUid.trim().slice(0, 128)
      : undefined;

  const safeMinChildAge =
    trip.minChildAge !== undefined && Number.isFinite(Number(trip.minChildAge))
      ? clampNumber(trip.minChildAge, 0, 18, 4)
      : undefined;

  const sanitizeOptionalList = (items: LocalizedText[] | undefined, maxItemLen: number) =>
    Array.isArray(items) && items.length > 0
      ? items
          .slice(0, 15)
          .filter((it) => Boolean(it?.en?.trim() || it?.ar?.trim() || it?.de?.trim()))
          .map((it) => sanitizeLocalized(it, maxItemLen, ''))
      : undefined;

  const cleanTips = sanitizeOptionalList(trip.tips, 400);
  const cleanNotSuitable = sanitizeOptionalList(trip.notSuitableFor, 240);
  const cleanWhatToBring = sanitizeOptionalList(trip.whatToBring, 240);
  const cleanNotAllowed = sanitizeOptionalList(trip.notAllowed, 240);
  const cleanKnowBefore = sanitizeOptionalList(trip.knowBeforeYouGo, 320);

  const cleanDepartureTimes = Array.isArray(trip.departureTimes)
    ? trip.departureTimes
        .map((t) => truncateText(t, 60, ''))
        .filter((t) => t.length > 0)
        .slice(0, 8)
    : undefined;

  const cleanTimingNote =
    trip.timingNote && (trip.timingNote.en?.trim() || trip.timingNote.ar?.trim() || trip.timingNote.de?.trim())
      ? sanitizeLocalized(trip.timingNote, 160, 'According to flight time')
      : undefined;

  const cleanItinerary = Array.isArray(trip.itinerary)
    ? trip.itinerary
        .slice(0, 20)
        .filter((stop) => stop && (stop.title?.en?.trim() || stop.title?.ar?.trim() || stop.title?.de?.trim()))
        .map((stop) =>
          stripUndefined({
            kind:
              stop.kind === 'pickup' || stop.kind === 'stop' || stop.kind === 'break' || stop.kind === 'end'
                ? stop.kind
                : 'stop',
            title: sanitizeLocalized(stop.title, 160, 'Stop'),
            subtitle:
              stop.subtitle && (stop.subtitle.en?.trim() || stop.subtitle.ar?.trim() || stop.subtitle.de?.trim())
                ? sanitizeLocalized(stop.subtitle, 200, '')
                : undefined,
            durationOrTime:
              stop.durationOrTime &&
              (stop.durationOrTime.en?.trim() || stop.durationOrTime.ar?.trim() || stop.durationOrTime.de?.trim())
                ? sanitizeLocalized(stop.durationOrTime, 80, '')
                : undefined,
          })
        )
    : undefined;

  const cleanGalleryCaptions = Array.isArray(trip.galleryCaptions)
    ? trip.galleryCaptions
        .slice(0, 8)
        .filter((c) => c && (c.en?.trim() || c.ar?.trim() || c.de?.trim()))
        .map((c) => sanitizeLocalized(c, 200, 'Excursion photo'))
    : undefined;

  const cleanHistoricalFacts = Array.isArray(trip.historicalFacts)
    ? trip.historicalFacts
        .slice(0, 10)
        .filter((f) => f && (f.title?.en?.trim() || f.title?.ar?.trim() || f.fact?.en?.trim() || f.fact?.ar?.trim()))
        .map((f) =>
          stripUndefined({
            era:
              f.era && (f.era.en?.trim() || f.era.ar?.trim() || f.era.de?.trim())
                ? sanitizeLocalized(f.era, 120, '')
                : undefined,
            title: sanitizeLocalized(f.title, 180, 'Historical Note'),
            fact: sanitizeLocalized(f.fact, 1000, ''),
            metric:
              f.metric && (f.metric.en?.trim() || f.metric.ar?.trim() || f.metric.de?.trim())
                ? sanitizeLocalized(f.metric, 120, '')
                : undefined,
          })
        )
    : undefined;

  const cleanOperatingDays = Array.isArray(trip.operatingDays)
    ? Array.from(
        new Set(
          trip.operatingDays
            .map((d) => Number(d))
            .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
        )
      )
        .sort((a, b) => a - b)
        .slice(0, 7)
    : undefined;

  const cleanAvailableFrom =
    typeof trip.availableFrom === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(trip.availableFrom.trim())
      ? trip.availableFrom.trim()
      : undefined;
  const cleanAvailableTo =
    typeof trip.availableTo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(trip.availableTo.trim())
      ? trip.availableTo.trim()
      : undefined;

  return stripUndefined({
    id: sanitizeDocId(trip.id, 'trip'),
    name: sanitizeLocalized(trip.name, 160, 'Wasla Red Sea Excursion'),
    category: trip.category,
    destination: trip.destination,
    images: cleanImages,
    galleryCaptions:
      cleanGalleryCaptions && cleanGalleryCaptions.length > 0 ? cleanGalleryCaptions : undefined,
    rating: clampNumber(trip.rating, 0, 5, 5, false),
    reviewCount: clampNumber(trip.reviewCount, 0, 100000, 1),
    duration: sanitizeLocalized(trip.duration, 60, '4 hours'),
    departureTimes: cleanDepartureTimes,
    timingNote: cleanTimingNote,
    price: clampNumber(trip.price, 1, 50000, 25),
    options: cleanOptions && cleanOptions.length > 0 ? cleanOptions : undefined,
    shortDescription: sanitizeLocalized(trip.shortDescription, 600, 'Curated Red Sea & Egypt excursion.'),
    fullDescription: trip.fullDescription
      ? sanitizeLocalized(trip.fullDescription, 4500, 'Curated Red Sea & Egypt excursion.')
      : undefined,
    itinerary: cleanItinerary && cleanItinerary.length > 0 ? cleanItinerary : undefined,
    historicalFacts:
      cleanHistoricalFacts && cleanHistoricalFacts.length > 0 ? cleanHistoricalFacts : undefined,
    highlights: cleanHighlights,
    included: cleanIncluded,
    tips: cleanTips && cleanTips.length > 0 ? cleanTips : undefined,
    notSuitableFor: cleanNotSuitable && cleanNotSuitable.length > 0 ? cleanNotSuitable : undefined,
    meetingPoint: trip.meetingPoint
      ? sanitizeLocalized(trip.meetingPoint, 300, 'Hotel Lobby Pickup')
      : undefined,
    meetingPointUrl: trip.meetingPointUrl
      ? truncateText(trip.meetingPointUrl, 400, '')
      : undefined,
    whatToBring: cleanWhatToBring && cleanWhatToBring.length > 0 ? cleanWhatToBring : undefined,
    notAllowed: cleanNotAllowed && cleanNotAllowed.length > 0 ? cleanNotAllowed : undefined,
    knowBeforeYouGo: cleanKnowBefore && cleanKnowBefore.length > 0 ? cleanKnowBefore : undefined,
    outerTransferEnabled:
      trip.outerTransferEnabled !== undefined ? Boolean(trip.outerTransferEnabled) : undefined,
    pickup: sanitizeLocalized(trip.pickup, 160, 'Hurghada hotels'),
    supplierName: safeSupplierName,
    supplierUid: safeSupplierUid,
    approvalStatus: trip.approvalStatus ?? 'Approved',
    familyFriendly: Boolean(trip.familyFriendly),
    womenFriendly: Boolean(trip.womenFriendly),
    minChildAge: safeMinChildAge,
    kidsDiscount: trip.kidsDiscount
      ? sanitizeLocalized(trip.kidsDiscount, 160, 'Child discount available')
      : undefined,
    featured: Boolean(trip.featured),
    languages: trip.languages
      ?.map((l) => truncateText(l, 40, ''))
      .filter((l) => l.length > 0)
      .slice(0, 12),
    operatingDays:
      cleanOperatingDays && cleanOperatingDays.length > 0 && cleanOperatingDays.length < 7
        ? cleanOperatingDays
        : undefined,
    availableFrom: cleanAvailableFrom,
    availableTo: cleanAvailableTo,
  });
}

function normalizeRemoteTripImages(trip: Trip, fallbackImages?: string[]): string[] {
  const categoryFallback = CATEGORY_FALLBACK_IMAGE[trip.category] || SITE_CONFIG.heroBackground;
  const rawList = Array.isArray(trip.images) ? trip.images : [];
  const normalized = Array.from(
    new Set(
      rawList
        .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
        .map((img) => resolveBundledMediaUrl(img, trip.category))
    )
  );
  if (normalized.length > 0) return normalized;
  if (fallbackImages && fallbackImages.length > 0) return fallbackImages;
  return [categoryFallback];
}

function mergeTripsWithStarterCatalog(remoteTrips: Trip[]): Trip[] {
  if (!remoteTrips || remoteTrips.length === 0) return TRIPS;
  const starterById = new Map<string, Trip>(TRIPS.map((t) => [t.id, t]));
  const remoteById = new Map<string, Trip>();

  for (const rt of remoteTrips) {
    if (!rt || !rt.id) continue;
    const starter = starterById.get(rt.id);
    if (starter) {
      // Keep current bundle asset URLs for starter trips unless remote carries genuine custom/uploaded media
      const rawImages = Array.isArray(rt.images) ? rt.images : [];
      const hasCustomDataImage = rawImages.some(
        (img) =>
          typeof img === 'string' &&
          (img.startsWith('data:') ||
            (/^https?:\/\//i.test(img) &&
              !/^https?:\/\/(?:localhost|127\.0\.0\.1|ais-dev-|ais-pre-)/i.test(img)))
      );
      const remoteHasRichDesc = Boolean(rt.fullDescription?.en || rt.fullDescription?.ar);
      const remoteHasItinerary = Array.isArray(rt.itinerary) && rt.itinerary.length > 0;
      const remoteStillHasOldTimeline = Boolean(rt.fullDescription?.en?.includes('Full Day Program & Timeline'));
      remoteById.set(rt.id, {
        ...starter,
        ...rt,
        images: hasCustomDataImage
          ? normalizeRemoteTripImages(rt, starter.images)
          : starter.images,
        galleryCaptions:
          Array.isArray(rt.galleryCaptions) && rt.galleryCaptions.length > 0
            ? rt.galleryCaptions
            : starter.galleryCaptions,
        departureTimes: rt.departureTimes !== undefined ? rt.departureTimes : starter.departureTimes,
        timingNote: rt.timingNote ?? starter.timingNote,
        shortDescription: remoteHasRichDesc ? rt.shortDescription : starter.shortDescription,
        fullDescription:
          remoteStillHasOldTimeline || !rt.fullDescription ? starter.fullDescription : rt.fullDescription,
        itinerary: remoteHasItinerary ? rt.itinerary : starter.itinerary,
        historicalFacts:
          Array.isArray(rt.historicalFacts) && rt.historicalFacts.length > 0
            ? rt.historicalFacts
            : starter.historicalFacts,
        highlights:
          remoteHasRichDesc && Array.isArray(rt.highlights) && rt.highlights.length >= starter.highlights.length
            ? rt.highlights
            : starter.highlights,
        included:
          remoteHasRichDesc && Array.isArray(rt.included) && rt.included.length >= starter.included.length
            ? rt.included
            : starter.included,
        options:
          remoteHasRichDesc && Array.isArray(rt.options) && rt.options.length >= (starter.options?.length || 0)
            ? rt.options
            : starter.options,
        tips: rt.tips && rt.tips.length > 0 ? rt.tips : starter.tips,
        notSuitableFor:
          rt.notSuitableFor && rt.notSuitableFor.length > 0 ? rt.notSuitableFor : starter.notSuitableFor,
        meetingPoint: rt.meetingPoint ?? starter.meetingPoint,
        meetingPointUrl: rt.meetingPointUrl ?? starter.meetingPointUrl,
        whatToBring: rt.whatToBring && rt.whatToBring.length > 0 ? rt.whatToBring : starter.whatToBring,
        notAllowed: rt.notAllowed && rt.notAllowed.length > 0 ? rt.notAllowed : starter.notAllowed,
        knowBeforeYouGo:
          rt.knowBeforeYouGo && rt.knowBeforeYouGo.length > 0 ? rt.knowBeforeYouGo : starter.knowBeforeYouGo,
        outerTransferEnabled: rt.outerTransferEnabled ?? starter.outerTransferEnabled,
        languages: rt.languages && rt.languages.length > 0 ? rt.languages : starter.languages,
        operatingDays:
          Array.isArray(rt.operatingDays) && rt.operatingDays.length > 0
            ? rt.operatingDays
            : starter.operatingDays,
        availableFrom: rt.availableFrom ?? starter.availableFrom,
        availableTo: rt.availableTo ?? starter.availableTo,
      });
    } else {
      remoteById.set(rt.id, {
        ...rt,
        images: normalizeRemoteTripImages(rt),
      });
    }
  }

  const customTrips = Array.from(remoteById.values()).filter((t) => !starterById.has(t.id));
  const mergedStarters = TRIPS.map((st) => remoteById.get(st.id) || st);
  return [...customTrips, ...mergedStarters];
}


function sanitizeBookingForFirestore(
  booking: PlatformBooking,
  supplierUid?: string
): Record<string, unknown> {
  const safeTripId = truncateText(booking.tripId, 128, 'custom-itinerary');
  const safeTripTitle = truncateText(booking.tripTitle, 240, 'Wasla Excursion');
  const safeContact = truncateText(booking.guestContact, 160, 'WhatsApp guest');
  const safeWhatsapp = booking.guestWhatsapp ? truncateText(booking.guestWhatsapp, 60, '') : undefined;
  const safeEmail = booking.guestEmail ? truncateText(booking.guestEmail, 160, '') : undefined;
  const safeSupplier = truncateText(booking.supplierName, 120, 'Wasla City Hosts');
  const safeDate = truncateText(booking.date, 20, new Date().toISOString().slice(0, 10));
  const safePickupSpot =
    booking.pickupSpot === 'Inside Reception' || booking.pickupSpot === 'Outside Main Gate'
      ? booking.pickupSpot
      : undefined;

  const safeRoomNumber = booking.roomNumber ? truncateText(booking.roomNumber, 40, '') : undefined;
  const safeLocationImageUrl =
    typeof booking.locationImageUrl === 'string' &&
    booking.locationImageUrl.trim().length > 0 &&
    booking.locationImageUrl.length <= 250000
      ? booking.locationImageUrl.trim()
      : undefined;

  const safeTripStartTime =
    booking.tripStartTime && booking.tripStartTime.trim().length > 0
      ? truncateText(booking.tripStartTime, 80, '')
      : undefined;

  return stripUndefined({
    id: sanitizeDocId(booking.id, 'WT'),
    tripId: safeTripId.length >= 2 ? safeTripId : 'custom-itinerary',
    tripTitle: safeTripTitle.length >= 2 ? safeTripTitle : 'Wasla Excursion',
    category: booking.category,
    destination: booking.destination,
    date: safeDate.length >= 8 ? safeDate : new Date().toISOString().slice(0, 10),
    tripStartTime: safeTripStartTime || undefined,
    pickupTime: truncateText(booking.pickupTime, 24, ''),
    pickupSpot: safePickupSpot,
    guestName: truncateText(booking.guestName, 120, 'Guest'),
    guestCountry: truncateText(booking.guestCountry, 80, ''),
    guestContact: safeContact.length >= 3 ? safeContact : 'WhatsApp',
    guestWhatsapp: safeWhatsapp || undefined,
    guestEmail: safeEmail || undefined,
    guestLang: normalizeLang(booking.guestLang),
    hotel: truncateText(booking.hotel, 200, 'Hurghada Hotel'),
    roomNumber: safeRoomNumber || undefined,
    locationImageUrl: safeLocationImageUrl,
    adults: clampNumber(booking.adults, 1, 50, 1),
    children: clampNumber(booking.children, 0, 50, 0),
    infants: clampNumber(booking.infants ?? 0, 0, 50, 0),
    grossEur: clampNumber(booking.grossEur, 0, 100000, 0),
    supplierName: safeSupplier.length >= 2 ? safeSupplier : 'Wasla City Hosts',
    supplierUid: supplierUid ? supplierUid.slice(0, 128) : undefined,
    assignedDriverOrGuide: truncateText(booking.assignedDriverOrGuide, 160, ''),
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    notes: truncateText(booking.notes, 800, ''),
    supplierNotes:
      booking.supplierNotes !== undefined
        ? truncateText(booking.supplierNotes, 500, '')
        : undefined,
  });
}

function buildTripEndTimestamp(dateStr: string): Timestamp {
  const cleaned = truncateText(dateStr, 20, new Date().toISOString().slice(0, 10));
  const parsed = new Date(`${cleaned}T23:59:59Z`);
  if (Number.isNaN(parsed.getTime())) {
    return Timestamp.fromDate(new Date(Date.now() + 86400000));
  }
  return Timestamp.fromDate(parsed);
}

function buildBookingReceiptFields(booking: {
  id: string;
  tripId: string;
  date: string;
  status: PlatformBooking['status'];
}) {
  const safeId = sanitizeDocId(booking.id, 'WT');
  const safeTripId = truncateText(booking.tripId, 128, 'custom-itinerary');
  const safeDate = truncateText(booking.date, 20, new Date().toISOString().slice(0, 10));
  return {
    id: safeId,
    tripId: safeTripId.length >= 2 ? safeTripId : 'custom-itinerary',
    tripDate: safeDate.length >= 8 ? safeDate : new Date().toISOString().slice(0, 10),
    tripEndAt: buildTripEndTimestamp(safeDate),
    status: booking.status,
  };
}

type SupplierDispatchStatus = 'Confirmed' | 'Driver assigned' | 'Completed';

function isSupplierVisibleBookingStatus(
  status: PlatformBooking['status']
): status is SupplierDispatchStatus {
  return status === 'Confirmed' || status === 'Driver assigned' || status === 'Completed';
}

function sanitizeOperationalNoteForSupplier(raw?: string): string {
  if (!raw) return '';
  const redacted = raw
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted]')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[redacted]')
    .replace(/(?:\+?\d[\d\s().-]{6,}\d)/g, '[redacted]')
    .replace(/(?:€|\$|£)\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?(?:eur|euro|euros|usd|egp|gbp)\b/gi, '[redacted]')
    .replace(/\s+/g, ' ')
    .trim();
  return truncateText(redacted, 500, '');
}

function buildSupplierDispatchFields(
  booking: PlatformBooking,
  supplierUid: string
): Record<string, unknown> {
  const safeId = sanitizeDocId(booking.id, 'WT');
  const safeTripId = truncateText(booking.tripId, 128, 'custom-itinerary');
  const safeTripTitle = truncateText(booking.tripTitle, 240, 'Wasla Excursion');
  const safeSupplier = truncateText(booking.supplierName, 120, 'Wasla City Hosts');
  const safeDate = truncateText(booking.date, 20, new Date().toISOString().slice(0, 10));
  const safePickupSpot =
    booking.pickupSpot === 'Inside Reception' || booking.pickupSpot === 'Outside Main Gate'
      ? booking.pickupSpot
      : undefined;
  const safeRoomNumber = booking.roomNumber ? truncateText(booking.roomNumber, 40, '') : undefined;
  const safeTripStartTime =
    booking.tripStartTime && booking.tripStartTime.trim().length > 0
      ? truncateText(booking.tripStartTime, 80, '')
      : undefined;

  return stripUndefined({
    id: safeId,
    bookingId: safeId,
    tripId: safeTripId.length >= 2 ? safeTripId : 'custom-itinerary',
    tripTitle: safeTripTitle.length >= 2 ? safeTripTitle : 'Wasla Excursion',
    category: booking.category,
    destination: booking.destination,
    date: safeDate.length >= 8 ? safeDate : new Date().toISOString().slice(0, 10),
    tripStartTime: safeTripStartTime || undefined,
    pickupTime: truncateText(booking.pickupTime, 24, ''),
    pickupSpot: safePickupSpot,
    guestName: truncateText(booking.guestName, 120, 'Guest'),
    guestCountry: truncateText(booking.guestCountry, 80, ''),
    hotel: truncateText(booking.hotel, 200, 'Hurghada Hotel'),
    roomNumber: safeRoomNumber || undefined,
    adults: clampNumber(booking.adults, 1, 50, 1),
    children: clampNumber(booking.children, 0, 50, 0),
    infants: clampNumber(booking.infants ?? 0, 0, 50, 0),
    supplierName: safeSupplier.length >= 2 ? safeSupplier : 'Wasla City Hosts',
    supplierUid: supplierUid.slice(0, 128),
    assignedDriverOrGuide: truncateText(booking.assignedDriverOrGuide, 160, ''),
    status: isSupplierVisibleBookingStatus(booking.status) ? booking.status : 'Confirmed',
    // Strictly dedicated, sanitized operational instructions only — never copies customer booking.notes
    operationalNotes: sanitizeOperationalNoteForSupplier(booking.supplierNotes),
  });
}

function mapSupplierDispatchToBooking(
  raw: Record<string, unknown>,
  createdAtMs: number
): PlatformBooking {
  const rawStatus = String(raw.status || 'Confirmed');
  const status: SupplierDispatchStatus =
    rawStatus === 'Driver assigned' || rawStatus === 'Completed' ? rawStatus : 'Confirmed';
  return {
    id: String(raw.bookingId || raw.id || ''),
    tripId: String(raw.tripId || 'custom-itinerary'),
    tripTitle: String(raw.tripTitle || 'Wasla Excursion'),
    category: (raw.category as PlatformBooking['category']) || 'sea',
    destination: (raw.destination as PlatformBooking['destination']) || 'Hurghada',
    date: String(raw.date || ''),
    ...(raw.tripStartTime ? { tripStartTime: String(raw.tripStartTime) } : {}),
    pickupTime: String(raw.pickupTime || ''),
    ...(raw.pickupSpot === 'Inside Reception' || raw.pickupSpot === 'Outside Main Gate'
      ? { pickupSpot: raw.pickupSpot }
      : {}),
    guestName: String(raw.guestName || 'Guest'),
    guestCountry: String(raw.guestCountry || ''),
    guestContact: '',
    guestWhatsapp: '',
    guestEmail: '',
    guestLang: 'en',
    hotel: String(raw.hotel || ''),
    ...(raw.roomNumber ? { roomNumber: String(raw.roomNumber) } : {}),
    adults: Number(raw.adults || 1),
    children: Number(raw.children || 0),
    infants: Number(raw.infants || 0),
    grossEur: 0,
    supplierName: String(raw.supplierName || ''),
    supplierUid: String(raw.supplierUid || ''),
    assignedDriverOrGuide: String(raw.assignedDriverOrGuide || ''),
    paymentStatus: 'Paid online',
    status,
    notes: '',
    supplierNotes: String(raw.operationalNotes || ''),
    createdAtMs,
  };
}

function sanitizeChatForFirestore(chat: ChatThread): Record<string, unknown> {
  const safeBookingRef = truncateText(chat.bookingRef, 64, 'WT-000');
  const safeMessages =
    Array.isArray(chat.messages) && chat.messages.length > 0
      ? chat.messages.slice(-50).map((m, idx) => ({
          id: sanitizeDocId(m.id, `msg-${idx + 1}`),
          sender: m.sender === 'operator' ? 'operator' : 'customer',
          text: truncateText(m.text, 1000, 'Inquiry'),
          timestamp: truncateText(m.timestamp, 40, 'Just now'),
        }))
      : [{ id: `msg-${Date.now()}`, sender: 'customer', text: 'Inquiry', timestamp: 'Just now' }];

  return {
    id: sanitizeDocId(chat.id, 'chat'),
    bookingRef: safeBookingRef.length >= 2 ? safeBookingRef : 'WT-000',
    customerName: truncateText(chat.customerName, 120, 'Guest'),
    customerLang: normalizeLang(chat.customerLang),
    tripTitle: truncateText(chat.tripTitle, 240, 'Custom Inquiry'),
    pickupInfo: truncateText(chat.pickupInfo, 300, 'Hurghada'),
    unread: Boolean(chat.unread),
    messages: safeMessages,
  };
}

function sanitizeTripReviewForFirestore(review: TripReviewRecord): Record<string, unknown> {
  const safeComment = truncateText(review.comment, 800, 'Great trip experience.');
  const safeTripTitle = truncateText(review.tripTitle, 240, 'Wasla Excursion');
  const rawPhoto = typeof review.photoUrl === 'string' ? review.photoUrl.trim() : '';
  const safePhoto =
    rawPhoto && rawPhoto.length <= 250000 && /^(data:image\/|https?:\/\/)/i.test(rawPhoto)
      ? rawPhoto
      : undefined;
  return stripUndefined({
    id: sanitizeDocId(review.id, 'rev'),
    tripId: sanitizeDocId(review.tripId, 'trip'),
    bookingId: review.bookingId ? sanitizeDocId(review.bookingId, 'WT') : undefined,
    verifiedBooking: review.verifiedBooking !== undefined ? Boolean(review.verifiedBooking) : undefined,
    tripTitle: safeTripTitle.length >= 2 ? safeTripTitle : 'Wasla Excursion',
    guestName: truncateText(review.guestName, 80, 'Guest'),
    guestCountry: truncateText(review.guestCountry, 60, ''),
    rating: clampNumber(review.rating, 1, 5, 5),
    comment: safeComment.length >= 5 ? safeComment : `${safeComment} · Guest experience.`,
    photoUrl: safePhoto,
    visitDate: truncateText(review.visitDate, 20, new Date().toISOString().slice(0, 10)),
    lang: normalizeLang(review.lang),
    approvalStatus: review.approvalStatus || 'Pending',
  });
}

export function useWaslaFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState<EffectiveRole>('none');
  const [assignedSupplierName, setAssignedSupplierName] = useState<string>('');
  const [ownAccessRequest, setOwnAccessRequest] = useState<AccessRequestRecord | null>(null);
  const [authError, setAuthError] = useState<string>('');

  // Storefront & Platform shared data
  const [publicSettings, setPublicSettings] = useState<PublicStorefrontSettings>({
    whatsappNumber: SITE_CONFIG.whatsappNumber,
    whatsappDisplay: SITE_CONFIG.whatsappDisplay,
    email: SITE_CONFIG.email,
    domain: SITE_CONFIG.domain,
    airTicketsEnabled: false,
    metaPixelId: '',
    ga4Id: '',
    heroImageUrl: '',
    heroCaptionEn: '',
    heroCaptionAr: '',
    heroCaptionDe: '',
    heroSubEn: '',
    heroSubAr: '',
    heroSubDe: '',
    heroFontStyle: 'editorial',
    heroTheme: 'red-sea',
  });
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [trips, setTrips] = useState<Trip[]>(TRIPS);
  const [tripsLoading, setTripsLoading] = useState<boolean>(true);
  const [firestoreSeeded, setFirestoreSeeded] = useState<boolean>(false);
  const [ownerInitComplete, setOwnerInitComplete] = useState<boolean>(false);
  const [bookings, setBookings] = useState<PlatformBooking[]>(INITIAL_BOOKINGS);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>(INITIAL_SUPPLIERS);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [complaints, setComplaints] = useState<ComplaintCase[]>(INITIAL_COMPLAINTS);
  const [emailLogs, setEmailLogs] = useState<PlatformEmailLog[]>(INITIAL_EMAIL_LOGS);
  const [tripReviews, setTripReviews] = useState<TripReviewRecord[]>(INITIAL_TRIP_REVIEWS);
  const [receiptStatusByBookingId, setReceiptStatusByBookingId] = useState<Record<string, string>>({});
  const reconciledReviewKeyRef = useRef<Set<string>>(new Set());
  const [accessRequests, setAccessRequests] = useState<AccessRequestRecord[]>([]);
  const [staffRoles, setStaffRoles] = useState<StaffRoleRecord[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);
  const [latestNewBooking, setLatestNewBooking] = useState<PlatformBooking | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(() => isBookingSoundMuted());
  const seedingLockRef = useRef(false);
  const bookingsLoadedRef = useRef(false);
  const knownBookingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTripsLoading(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  // 1. Auth listener & RBAC role lookup
  useEffect(() => {
    void getRedirectResult(auth).catch(() => {});
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthError('');

      if (!nextUser) {
        seedingLockRef.current = false;
        setOwnerInitComplete(false);
        setEffectiveRole('none');
        setAssignedSupplierName('');
        setOwnAccessRequest(null);
        setAuthReady(true);
        return;
      }

      if (!nextUser.emailVerified) {
        setOwnerInitComplete(false);
        setEffectiveRole('none');
        setAssignedSupplierName('');
        setOwnAccessRequest(null);
        setAuthReady(true);
        return;
      }

      try {
        if (nextUser.email?.toLowerCase() === BOOTSTRAPPED_OWNER_EMAIL.toLowerCase()) {
          setEffectiveRole('owner');
          setAssignedSupplierName('');
          setAuthReady(true);
          return;
        }

        const adminDoc = await getDoc(doc(db, 'admins', nextUser.uid)).catch(() => null);
        if (adminDoc?.exists()) {
          setEffectiveRole('owner');
          setAssignedSupplierName('');
          setAuthReady(true);
          return;
        }

        const roleSnap = await getDoc(doc(db, 'staff_roles', nextUser.uid)).catch(() => null);
        if (roleSnap?.exists()) {
          const roleData = roleSnap.data() as StaffRoleRecord;
          if (roleData.status === 'Active') {
            setEffectiveRole(roleData.role);
            setAssignedSupplierName(roleData.supplierName || '');
            setAuthReady(true);
            return;
          }
        }

        setEffectiveRole('none');
        const reqSnap = await getDoc(doc(db, 'access_requests', nextUser.uid)).catch(() => null);
        if (reqSnap?.exists()) {
          setOwnAccessRequest(reqSnap.data() as AccessRequestRecord);
        } else {
          setOwnAccessRequest(null);
        }
      } catch (err) {
        console.error('Role resolution error:', err);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsub();
  }, []);

  // 2. Live Public Settings listener (always safe for Storefront)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'public_settings', 'storefront'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as PublicStorefrontSettings;
          setPublicSettings({
            whatsappNumber: data.whatsappNumber || SITE_CONFIG.whatsappNumber,
            whatsappDisplay: data.whatsappDisplay || SITE_CONFIG.whatsappDisplay,
            email: data.email || SITE_CONFIG.email,
            domain: data.domain || SITE_CONFIG.domain,
            airTicketsEnabled: Boolean(data.airTicketsEnabled),
            metaPixelId: data.metaPixelId || '',
            ga4Id: data.ga4Id || '',
            heroImageUrl: data.heroImageUrl ? resolveBundledMediaUrl(data.heroImageUrl) : '',
            heroCaptionEn: data.heroCaptionEn || '',
            heroCaptionAr: data.heroCaptionAr || '',
            heroCaptionDe: data.heroCaptionDe || '',
            heroSubEn: data.heroSubEn || '',
            heroSubAr: data.heroSubAr || '',
            heroSubDe: data.heroSubDe || '',
            heroFontStyle: data.heroFontStyle || 'editorial',
            heroTheme: data.heroTheme || 'red-sea',
          });
        }
      },
      () => {
        // Fallback defaults remain active until seeded
      }
    );
    return () => unsub();
  }, [effectiveRole]);

  // 3. Auto-seed Firestore once when Owner signs in on an empty database
  useEffect(() => {
    if (!authReady || effectiveRole !== 'owner' || !user) return;
    if (seedingLockRef.current) return;

    const ownerUid = user.uid;
    const ownerEmail = truncateText(user.email, 160, BOOTSTRAPPED_OWNER_EMAIL);

    const seedIfEmpty = async () => {
      seedingLockRef.current = true;
      try {
        // Ensure admin doc exists for bootstrapped owner so admin-based checks always resolve
        try {
          const adminSnap = await getDoc(doc(db, 'admins', ownerUid));
          if (!adminSnap.exists()) {
            await setDoc(doc(db, 'admins', ownerUid), {
              uid: ownerUid,
              email: ownerEmail,
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.warn('Seed admins skipped:', err);
        }

        // Public Storefront Settings
        let publicExists = false;
        try {
          const publicSettingsSnap = await getDoc(doc(db, 'public_settings', 'storefront'));
          publicExists = publicSettingsSnap.exists();
        } catch (err) {
          console.warn('Check public_settings skipped:', err);
        }
        if (!publicExists) {
          try {
            await setDoc(doc(db, 'public_settings', 'storefront'), {
              whatsappNumber: SITE_CONFIG.whatsappNumber,
              whatsappDisplay: SITE_CONFIG.whatsappDisplay,
              email: SITE_CONFIG.email,
              domain: SITE_CONFIG.domain,
              airTicketsEnabled: false,
              metaPixelId: '',
              ga4Id: '',
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Seed public_settings skipped:', err);
          }
        }

        // Private Owner Settings
        let ownerSettingsExists = false;
        try {
          const ownerSettingsSnap = await getDoc(doc(db, 'owner_settings', 'platform'));
          ownerSettingsExists = ownerSettingsSnap.exists();
        } catch (err) {
          console.warn('Check owner_settings skipped:', err);
        }
        if (!ownerSettingsExists) {
          try {
            await setDoc(doc(db, 'owner_settings', 'platform'), {
              commissionRate: 15,
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Seed owner_settings skipped:', err);
          }
        }

        // Trips Catalog (seed starter catalog even if owner/supplier already added a custom trip)
        let existingTripIds = new Set<string>();
        let shouldSeedStarterTrips = false;
        try {
          const existingTripsSnap = await getDocs(collection(db, 'trips'));
          existingTripsSnap.docs.forEach((d) => existingTripIds.add(d.id));
          shouldSeedStarterTrips =
            existingTripsSnap.empty || existingTripIds.size < TRIPS.length;
        } catch (err) {
          console.warn('Check trips skipped:', err);
        }
        if (shouldSeedStarterTrips) {
          for (const trip of TRIPS) {
            if (existingTripIds.has(trip.id)) continue;
            try {
              await setDoc(doc(db, 'trips', trip.id), {
                ...sanitizeTripForFirestore({ ...trip, approvalStatus: 'Approved' }),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn(`Seed trip ${trip.id} skipped:`, err);
            }
          }
        }

        // Suppliers Directory
        let existingSuppliersEmpty = false;
        try {
          const existingSuppliers = await getDocs(query(collection(db, 'suppliers'), limit(1)));
          existingSuppliersEmpty = existingSuppliers.empty;
        } catch (err) {
          console.warn('Check suppliers skipped:', err);
        }
        if (existingSuppliersEmpty) {
          for (const sup of INITIAL_SUPPLIERS) {
            try {
              await setDoc(doc(db, 'suppliers', sup.id), {
                ...stripUndefined({ ...sup }),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn(`Seed supplier ${sup.id} skipped:`, err);
            }
          }
        }

        // Bookings & Verification Receipts
        let existingBookingsEmpty = false;
        let existingBookingsList: PlatformBooking[] = INITIAL_BOOKINGS;
        try {
          const existingBookings = await getDocs(collection(db, 'bookings'));
          existingBookingsEmpty = existingBookings.empty;
          if (!existingBookings.empty) {
            existingBookingsList = existingBookings.docs.map((d) => d.data() as PlatformBooking);
          }
        } catch (err) {
          console.warn('Check bookings skipped:', err);
        }
        if (existingBookingsEmpty) {
          for (const bk of INITIAL_BOOKINGS) {
            try {
              await setDoc(doc(db, 'bookings', bk.id), {
                ...sanitizeBookingForFirestore(bk),
                createdAt:
                  typeof bk.createdAtMs === 'number' && bk.createdAtMs > 0
                    ? Timestamp.fromMillis(bk.createdAtMs)
                    : serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn(`Seed booking ${bk.id} skipped:`, err);
            }
          }
        }

        // Seed missing zero-PII booking verification receipts & confirmed supplier dispatches
        for (const bk of existingBookingsList) {
          const safeBkId = sanitizeDocId(bk.id, 'WT');
          try {
            const rcptRef = doc(db, 'booking_receipts', safeBkId);
            const rcptSnap = await getDoc(rcptRef);
            if (!rcptSnap.exists()) {
              await setDoc(rcptRef, {
                ...buildBookingReceiptFields(bk),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          } catch {
            // Non-fatal if receipt sync already exists
          }
          if (isSupplierVisibleBookingStatus(bk.status) && bk.supplierUid) {
            try {
              const dispRef = doc(db, 'supplier_dispatches', safeBkId);
              const dispSnap = await getDoc(dispRef);
              if (!dispSnap.exists()) {
                await setDoc(dispRef, {
                  ...buildSupplierDispatchFields(bk, bk.supplierUid),
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              }
            } catch {
              // Non-fatal if dispatch doc already exists
            }
          }
        }

        // Chats
        let existingChatsEmpty = false;
        try {
          const existingChats = await getDocs(query(collection(db, 'chats'), limit(1)));
          existingChatsEmpty = existingChats.empty;
        } catch (err) {
          console.warn('Check chats skipped:', err);
        }
        if (existingChatsEmpty) {
          for (const ch of INITIAL_CHATS) {
            try {
              await setDoc(doc(db, 'chats', ch.id), {
                ...sanitizeChatForFirestore(ch),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn(`Seed chat ${ch.id} skipped:`, err);
            }
          }
        }

        // Complaints
        let existingComplaintsEmpty = false;
        try {
          const existingComplaints = await getDocs(query(collection(db, 'complaints'), limit(1)));
          existingComplaintsEmpty = existingComplaints.empty;
        } catch (err) {
          console.warn('Check complaints skipped:', err);
        }
        if (existingComplaintsEmpty) {
          for (const cmp of INITIAL_COMPLAINTS) {
            try {
              await setDoc(doc(db, 'complaints', cmp.id), {
                ...stripUndefined({ ...cmp }),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn(`Seed complaint ${cmp.id} skipped:`, err);
            }
          }
        }

        // Email Logs
        let existingLogsEmpty = false;
        try {
          const existingLogs = await getDocs(query(collection(db, 'email_logs'), limit(1)));
          existingLogsEmpty = existingLogs.empty;
        } catch (err) {
          console.warn('Check email_logs skipped:', err);
        }
        if (existingLogsEmpty) {
          for (const log of INITIAL_EMAIL_LOGS) {
            try {
              await setDoc(doc(db, 'email_logs', log.id), {
                ...stripUndefined({ ...log }),
                createdAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn(`Seed email_log ${log.id} skipped:`, err);
            }
          }
        }

        // Trip Reviews
        let existingReviewsEmpty = false;
        try {
          const existingReviews = await getDocs(query(collection(db, 'trip_reviews'), limit(1)));
          existingReviewsEmpty = existingReviews.empty;
        } catch (err) {
          console.warn('Check trip_reviews skipped:', err);
        }
        if (existingReviewsEmpty) {
          for (const rev of INITIAL_TRIP_REVIEWS) {
            try {
              const linkedBooking = rev.bookingId
                ? existingBookingsList.find((b) => b.id === rev.bookingId)
                : undefined;
              const syncedVerified = Boolean(linkedBooking && linkedBooking.status === 'Completed');
              await setDoc(doc(db, 'trip_reviews', rev.id), {
                ...sanitizeTripReviewForFirestore({ ...rev, verifiedBooking: syncedVerified }),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn(`Seed trip_review ${rev.id} skipped:`, err);
            }
          }
        }
      } catch (err) {
        console.warn('Background seed error:', err);
      } finally {
        setFirestoreSeeded(true);
        setOwnerInitComplete(true);
      }
    };

    if (ownerUid) {
      void seedIfEmpty();
    }
  }, [authReady, effectiveRole, user]);

  // 4. Live Firestore Subscriptions (Public Approved Trips + Role-Scoped Staff Data)
  useEffect(() => {
    if (!authReady) return;
    if (effectiveRole === 'owner' && !ownerInitComplete) return;

    const unsubscribers: Array<() => void> = [];

    if (effectiveRole === 'owner' || effectiveRole === 'operations') {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'trips'),
          (snap) => {
            if (!snap.empty) {
              setFirestoreSeeded(true);
              setTrips(mergeTripsWithStarterCatalog(snap.docs.map((d) => d.data() as Trip)));
            }
            setTripsLoading(false);
          },
          (err) => {
            console.warn('Trips listener warning:', err);
            setTripsLoading(false);
          }
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'bookings'),
          (snap) => {
            const rawList = snap.docs.map((d) => {
              const raw = d.data() as PlatformBooking & {
                createdAt?: { toMillis?: () => number; seconds?: number } | null;
              };
              const createdAtMs =
                typeof raw.createdAt?.toMillis === 'function'
                  ? raw.createdAt.toMillis()
                  : typeof raw.createdAt?.seconds === 'number'
                  ? raw.createdAt.seconds * 1000
                  : typeof raw.createdAtMs === 'number' && raw.createdAtMs > 0
                  ? raw.createdAtMs
                  : d.metadata.hasPendingWrites
                  ? Date.now()
                  : 0;
              return { ...raw, createdAtMs };
            });
            const list = sortBookingsNewestFirst(rawList);
            if (!bookingsLoadedRef.current) {
              knownBookingIdsRef.current = new Set(list.map((b) => b.id));
              bookingsLoadedRef.current = true;
            } else {
              const incomingNew = list.filter((b) => !knownBookingIdsRef.current.has(b.id));
              if (incomingNew.length > 0) {
                incomingNew.forEach((b) => knownBookingIdsRef.current.add(b.id));
                const newest = incomingNew[0];
                setLatestNewBooking(newest);
                playNewBookingChime();
                showDesktopBookingNotification(newest);
              }
            }
            if (list.length > 0) {
              setBookings(list);

            }
          },
          (err) => console.warn('Bookings listener warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'supplier_dispatches'),
          (snap) => {
            if (snap.empty) return;
            const dispatchDriverMap = new Map<
              string,
              { assignedDriverOrGuide: string; status: SupplierDispatchStatus }
            >();
            snap.docs.forEach((d) => {
              const data = d.data() as Record<string, unknown>;
              const driver = String(data.assignedDriverOrGuide || '').trim();
              const status = String(data.status || '') as SupplierDispatchStatus;
              if (driver || status === 'Driver assigned') {
                dispatchDriverMap.set(d.id, {
                  assignedDriverOrGuide: driver,
                  status,
                });
              }
            });
            if (dispatchDriverMap.size === 0) return;
            setBookings((prev) => {
              let changed = false;
              const next = prev.map((bk) => {
                const disp = dispatchDriverMap.get(bk.id);
                if (!disp) return bk;
                const needsDriverSync =
                  Boolean(disp.assignedDriverOrGuide) &&
                  disp.assignedDriverOrGuide !== bk.assignedDriverOrGuide;
                const needsStatusSync =
                  disp.status === 'Driver assigned' && bk.status === 'Confirmed';
                if (!needsDriverSync && !needsStatusSync) return bk;
                changed = true;
                const syncPatch: Record<string, unknown> = {
                  updatedAt: serverTimestamp(),
                };
                if (needsDriverSync) {
                  syncPatch.assignedDriverOrGuide = disp.assignedDriverOrGuide;
                }
                if (needsStatusSync) {
                  syncPatch.status = 'Driver assigned';
                }
                void updateDoc(doc(db, 'bookings', bk.id), syncPatch).catch(() => {});
                return {
                  ...bk,
                  ...(needsDriverSync ? { assignedDriverOrGuide: disp.assignedDriverOrGuide } : {}),
                  ...(needsStatusSync ? { status: 'Driver assigned' as const } : {}),
                };
              });
              return changed ? next : prev;
            });
          },
          (err) => console.warn('Supplier dispatches sync warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'suppliers'),
          (snap) => {
            if (!snap.empty) setSuppliers(snap.docs.map((d) => d.data() as SupplierProfile));
          },
          (err) => console.warn('Suppliers listener warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'chats'),
          (snap) => {
            if (!snap.empty) setChats(snap.docs.map((d) => d.data() as ChatThread));
          },
          (err) => console.warn('Chats listener warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'complaints'),
          (snap) => {
            if (!snap.empty) setComplaints(snap.docs.map((d) => d.data() as ComplaintCase));
          },
          (err) => console.warn('Complaints listener warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'email_logs'),
          (snap) => {
            if (!snap.empty) setEmailLogs(snap.docs.map((d) => d.data() as PlatformEmailLog));
          },
          (err) => console.warn('Email logs listener warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'newsletter_subscribers'),
          (snap) => setSubscribedEmails(snap.docs.map((d) => String(d.data().email || ''))),
          (err) => console.warn('Newsletter listener warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'trip_reviews'),
          (snap) => {
            if (!snap.empty) {
              setTripReviews(snap.docs.map((d) => d.data() as TripReviewRecord));
            }
          },
          (err) => console.warn('Trip reviews listener warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          doc(db, 'owner_settings', 'platform'),
          (snap) => {
            if (snap.exists() && typeof snap.data().commissionRate === 'number') {
              setCommissionRate(snap.data().commissionRate);
            }
          },
          (err) => console.warn('Owner settings listener warning:', err)
        )
      );

      const isPrimaryOwner =
        Boolean(user?.emailVerified) &&
        user?.email?.toLowerCase() === BOOTSTRAPPED_OWNER_EMAIL.toLowerCase();

      if (effectiveRole === 'owner' && isPrimaryOwner) {
        unsubscribers.push(
          onSnapshot(
            collection(db, 'access_requests'),
            (snap) => setAccessRequests(snap.docs.map((d) => d.data() as AccessRequestRecord)),
            (err) => console.warn('Access requests listener warning:', err)
          )
        );
        unsubscribers.push(
          onSnapshot(
            collection(db, 'staff_roles'),
            (snap) => setStaffRoles(snap.docs.map((d) => d.data() as StaffRoleRecord)),
            (err) => console.warn('Staff roles listener warning:', err)
          )
        );
        unsubscribers.push(
          onSnapshot(
            collection(db, 'admins'),
            (snap) => setAdminUsers(snap.docs.map((d) => d.data() as AdminUserRecord)),
            (err) => console.warn('Admins listener warning:', err)
          )
        );
      }
    } else if (effectiveRole === 'supplier' && user) {
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'trips'), where('approvalStatus', '==', 'Approved')),
          (approvedSnap) => {
            const approvedList = approvedSnap.docs.map((d) => d.data() as Trip);
            setTrips((prev) => {
              const mine = prev.filter((t) => t.supplierUid === user.uid && t.approvalStatus !== 'Approved');
              return mergeTripsWithStarterCatalog([...mine, ...approvedList]);
            });
            setTripsLoading(false);
          },
          (err) => {
            console.warn('Supplier approved trips warning:', err);
            setTripsLoading(false);
          }
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'trips'), where('supplierUid', '==', user.uid)),
          (mySnap) => {
            const myList = mySnap.docs.map((d) => {
              const rawTrip = d.data() as Trip;
              return { ...rawTrip, images: normalizeRemoteTripImages(rawTrip) };
            });
            setTrips((prev) => {
              const myIds = new Set(myList.map((m) => m.id));
              const others = prev.filter((p) => !myIds.has(p.id));
              return [...myList, ...others];
            });
          },
          (err) => console.warn('Supplier my trips warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(
            collection(db, 'supplier_dispatches'),
            where('supplierUid', '==', user.uid),
            where('status', 'in', ['Confirmed', 'Driver assigned', 'Completed'])
          ),
          (snap) => {
            const rawList = snap.docs.map((d) => {
              const raw = d.data() as Record<string, unknown> & {
                createdAt?: { toMillis?: () => number; seconds?: number } | null;
              };
              const createdAtMs =
                typeof raw.createdAt?.toMillis === 'function'
                  ? raw.createdAt.toMillis()
                  : typeof raw.createdAt?.seconds === 'number'
                  ? raw.createdAt.seconds * 1000
                  : d.metadata.hasPendingWrites
                  ? Date.now()
                  : 0;
              return mapSupplierDispatchToBooking(raw, createdAtMs);
            });
            const list = sortBookingsNewestFirst(rawList);
            if (!bookingsLoadedRef.current) {
              knownBookingIdsRef.current = new Set(list.map((b) => b.id));
              bookingsLoadedRef.current = true;
            } else {
              const incomingNew = list.filter((b) => !knownBookingIdsRef.current.has(b.id));
              if (incomingNew.length > 0) {
                incomingNew.forEach((b) => knownBookingIdsRef.current.add(b.id));
                const newest = incomingNew[0];
                setLatestNewBooking(newest);
                playNewBookingChime();
                showDesktopBookingNotification(newest);
              }
            }
            setBookings(list);
          },
          (err) => console.warn('Supplier dispatches warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'suppliers'), where('linkedUid', '==', user.uid)),
          (snap) => {
            if (!snap.empty) setSuppliers(snap.docs.map((d) => d.data() as SupplierProfile));
          },
          (err) => console.warn('Supplier profile warning:', err)
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'trip_reviews'), where('approvalStatus', '==', 'Approved')),
          (snap) => {
            if (!snap.empty) {
              setTripReviews(snap.docs.map((d) => d.data() as TripReviewRecord));
            }
          },
          (err) => console.warn('Supplier approved reviews warning:', err)
        )
      );
    } else {
      // Public Customer Storefront: read ONLY Approved trips & Approved reviews
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'trips'), where('approvalStatus', '==', 'Approved')),
          (snap) => {
            if (!snap.empty) {
              setFirestoreSeeded(true);
              setTrips(mergeTripsWithStarterCatalog(snap.docs.map((d) => d.data() as Trip)));
            }
            setTripsLoading(false);
          },
          () => {
            // Keep default starter catalog visible if database isn't initialized yet
            setTripsLoading(false);
          }
        )
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'trip_reviews'), where('approvalStatus', '==', 'Approved')),
          (snap) => {
            if (!snap.empty) {
              setTripReviews(snap.docs.map((d) => d.data() as TripReviewRecord));
            }
          },
          () => {
            // Keep default starter reviews visible if database isn't initialized yet
          }
        )
      );

      // Live unlock listener when a signed-in partner waits for Owner approval
      if (user && user.emailVerified) {
        unsubscribers.push(
          onSnapshot(
            doc(db, 'admins', user.uid),
            (snap) => {
              if (snap.exists()) {
                setEffectiveRole('owner');
                setAssignedSupplierName('');
              }
            },
            () => {}
          )
        );
        unsubscribers.push(
          onSnapshot(
            doc(db, 'staff_roles', user.uid),
            (snap) => {
              if (snap.exists()) {
                const roleData = snap.data() as StaffRoleRecord;
                if (roleData.status === 'Active') {
                  setEffectiveRole(roleData.role);
                  setAssignedSupplierName(roleData.supplierName || '');
                }
              }
            },
            () => {}
          )
        );
      }
    }

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [authReady, effectiveRole, user, ownerInitComplete]);

  // 4B. Live Zero-PII Receipt Sync for Public/Supplier Viewers + Auto-Reconcile for Owner/Operations
  useEffect(() => {
    if (!authReady) return;
    if (effectiveRole === 'owner' || effectiveRole === 'operations') {
      if (effectiveRole === 'owner' && !ownerInitComplete) return;
      const bookingMap = new Map<string, PlatformBooking>(bookings.map((b) => [b.id, b]));
      for (const rev of tripReviews) {
        if (!rev.id) continue;
        const linked = rev.bookingId ? bookingMap.get(rev.bookingId) : undefined;
        // Reconcile when either booking is missing verification or linked booking status differs
        if (rev.bookingId && !linked) continue;
        const expectedVerified = Boolean(linked && linked.status === 'Completed');
        if (Boolean(rev.verifiedBooking) === expectedVerified && rev.verifiedBooking !== undefined) {
          continue;
        }
        const syncKey = `${rev.id}:${expectedVerified}`;
        if (reconciledReviewKeyRef.current.has(syncKey)) continue;
        reconciledReviewKeyRef.current.add(syncKey);

        void (async () => {
          try {
            if (linked) {
              const rcptRef = doc(db, 'booking_receipts', sanitizeDocId(linked.id, 'WT'));
              const rcptSnap = await getDoc(rcptRef).catch(() => null);
              if (rcptSnap?.exists()) {
                if (rcptSnap.data()?.status !== linked.status) {
                  await updateDoc(rcptRef, {
                    status: linked.status,
                    updatedAt: serverTimestamp(),
                  }).catch(() => {});
                }
              } else {
                await setDoc(rcptRef, {
                  ...buildBookingReceiptFields(linked),
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                }).catch(() => {});
              }
            }
            await updateDoc(doc(db, 'trip_reviews', rev.id), {
              verifiedBooking: expectedVerified,
              updatedAt: serverTimestamp(),
            });
          } catch {
            // Non-fatal if collection is still on static fallback
          }
        })();
      }
      return;
    }

    const bookingIds = Array.from(
      new Set(
        tripReviews
          .map((r) => r.bookingId)
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      )
    );
    if (bookingIds.length === 0) return;

    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(
        bookingIds.map(async (bId) => {
          try {
            const snap = await getDoc(doc(db, 'booking_receipts', bId));
            if (snap.exists()) {
              const st = snap.data()?.status;
              return typeof st === 'string' ? ([bId, st] as const) : null;
            }
          } catch {
            // Fallback handled cleanly
          }
          return null;
        })
      );
      if (cancelled) return;
      const nextMap: Record<string, string> = {};
      for (const entry of entries) {
        if (entry) nextMap[entry[0]] = entry[1];
      }
      if (Object.keys(nextMap).length > 0) {
        setReceiptStatusByBookingId((prev) => ({ ...prev, ...nextMap }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, effectiveRole, ownerInitComplete, bookings, tripReviews]);

  // Actions
  const signInWithGoogle = useCallback(async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          const rMsg =
            redirectErr instanceof Error ? redirectErr.message : 'Google Sign-In redirect failed.';
          setAuthError(rMsg);
          return;
        }
      }
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setAuthError(msg);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const submitAccessRequest = useCallback(
    async (requestedRole: 'operations' | 'supplier', companyName: string, city: string) => {
      if (!user) return;
      if (!user.emailVerified) {
        setAuthError('Please use a verified Google account to request portal access.');
        return;
      }

      const cleanEmail = truncateText(user.email, 160, 'partner@waslatravel.com');
      const cleanName = truncateText(user.displayName || cleanEmail, 120, 'Partner');
      const cleanCompany = truncateText(companyName, 120, '');
      const cleanCity = truncateText(city, 60, '');

      const payload: AccessRequestRecord = {
        uid: user.uid,
        email: cleanEmail.length >= 3 ? cleanEmail : 'partner@waslatravel.com',
        displayName: cleanName,
        requestedRole,
        companyName: cleanCompany || undefined,
        city: cleanCity || undefined,
        status: 'Pending',
      };
      try {
        await setDoc(doc(db, 'access_requests', user.uid), {
          ...stripUndefined({ ...payload }),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setOwnAccessRequest(payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `access_requests/${user.uid}`);
      }
    },
    [user]
  );

  const approveAccessRequest = useCallback(
    async (req: AccessRequestRecord, supplierNameOverride?: string) => {
      try {
        const cleanEmail = truncateText(req.email, 160, 'partner@waslatravel.com');
        const cleanDisplayName = truncateText(req.displayName, 120, 'Partner');
        const cleanSupplierName = truncateText(
          supplierNameOverride || req.companyName || req.displayName,
          120,
          'Wasla Partner'
        );
        const safeSupplierName = cleanSupplierName.length >= 2 ? cleanSupplierName : 'Wasla Partner';

        const roleRef = doc(db, 'staff_roles', req.uid);
        const roleSnap = await getDoc(roleRef);
        const roleData = stripUndefined({
          uid: req.uid,
          email: cleanEmail.length >= 3 ? cleanEmail : 'partner@waslatravel.com',
          displayName: cleanDisplayName,
          role: req.requestedRole,
          supplierName: req.requestedRole === 'supplier' ? safeSupplierName : undefined,
          status: 'Active',
          updatedAt: serverTimestamp(),
        });

        if (roleSnap.exists()) {
          await updateDoc(roleRef, roleData);
        } else {
          await setDoc(roleRef, {
            ...roleData,
            createdAt: serverTimestamp(),
          });
        }

        const reqRef = doc(db, 'access_requests', req.uid);
        const reqSnap = await getDoc(reqRef);
        if (reqSnap.exists()) {
          await updateDoc(reqRef, {
            status: 'Approved',
            updatedAt: serverTimestamp(),
          });
        }

        if (req.requestedRole === 'supplier') {
          const supId = sanitizeDocId(`sup-${req.uid.slice(0, 12)}`, 'sup');
          const supRef = doc(db, 'suppliers', supId);
          const supSnap = await getDoc(supRef);
          const supPayload = {
            id: supId,
            name: safeSupplierName,
            city: (['Hurghada', 'Marsa Alam', 'Luxor', 'Cairo'].includes(req.city || '')
              ? req.city
              : 'Hurghada') as SupplierProfile['city'],
            specialty: 'Verified local partner',
            languages: ['English', 'Arabic'],
            status: 'Active',
            contactPhone: '',
            email: cleanEmail,
            payoutSettledEur: 0,
            linkedUid: req.uid,
            updatedAt: serverTimestamp(),
          };
          if (supSnap.exists()) {
            await updateDoc(supRef, supPayload);
          } else {
            await setDoc(supRef, {
              ...supPayload,
              createdAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `staff_roles/${req.uid}`);
      }
    },
    []
  );

  const grantFullOwnerAccess = useCallback(
    async (target: { uid: string; email: string; displayName?: string }) => {
      try {
        const cleanEmail = truncateText(target.email, 160, 'partner@waslatravel.com');
        const safeEmail = cleanEmail.length >= 3 ? cleanEmail : 'partner@waslatravel.com';
        const cleanDisplayName = truncateText(
          target.displayName || safeEmail.split('@')[0],
          120,
          'Co-Owner Partner'
        );

        await setDoc(doc(db, 'admins', target.uid), {
          uid: target.uid,
          email: safeEmail,
          createdAt: serverTimestamp(),
        });

        const roleRef = doc(db, 'staff_roles', target.uid);
        const roleSnap = await getDoc(roleRef);
        const rolePayload = {
          uid: target.uid,
          email: safeEmail,
          displayName: cleanDisplayName,
          role: 'owner',
          status: 'Active',
          updatedAt: serverTimestamp(),
        };
        if (roleSnap.exists()) {
          await updateDoc(roleRef, rolePayload);
        } else {
          await setDoc(roleRef, {
            ...rolePayload,
            createdAt: serverTimestamp(),
          });
        }

        const reqRef = doc(db, 'access_requests', target.uid);
        const reqSnap = await getDoc(reqRef).catch(() => null);
        if (reqSnap?.exists()) {
          await updateDoc(reqRef, {
            status: 'Approved',
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `admins/${target.uid}`);
      }
    },
    []
  );

  const revokePortalAccess = useCallback(async (uid: string) => {
    try {
      const adminSnap = await getDoc(doc(db, 'admins', uid)).catch(() => null);
      if (adminSnap?.exists()) {
        await deleteDoc(doc(db, 'admins', uid));
      }
      const roleSnap = await getDoc(doc(db, 'staff_roles', uid)).catch(() => null);
      if (roleSnap?.exists()) {
        await deleteDoc(doc(db, 'staff_roles', uid));
      }
      const reqSnap = await getDoc(doc(db, 'access_requests', uid)).catch(() => null);
      if (reqSnap?.exists()) {
        await updateDoc(doc(db, 'access_requests', uid), {
          status: 'Rejected',
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${uid}`);
    }
  }, []);

  const logDispatchEmailInDb = useCallback(
    async (
      to: string,
      subject: string,
      type: PlatformEmailLog['type'] = 'Booking Confirmation',
      extra?: {
        body?: string;
        bookingRef?: string;
        from?: string;
        direction?: 'inbound' | 'outbound';
      }
    ) => {
      const logId = sanitizeDocId(`em-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`, 'em');
      const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const entry: PlatformEmailLog = {
        id: logId,
        to: truncateText(to, 160, SITE_CONFIG.email),
        from: truncateText(extra?.from || SITE_CONFIG.email, 160, SITE_CONFIG.email),
        subject: truncateText(subject, 240, 'Wasla Travel Notification'),
        ...(extra?.body ? { body: truncateText(extra.body, 4000, '') } : {}),
        ...(extra?.bookingRef ? { bookingRef: truncateText(extra.bookingRef, 40, '') } : {}),
        direction: extra?.direction || 'outbound',
        type,
        sentAt: `Today · ${nowLabel}`,
        status: extra?.direction === 'inbound' ? 'Received' : 'Delivered',
      };
      setEmailLogs((prev) => [entry, ...prev]);
      try {
        await setDoc(doc(db, 'email_logs', logId), {
          ...entry,
          createdAt: serverTimestamp(),
        });
      } catch {
        // Non-blocking audit log error should not abort booking flow
      }
    },
    []
  );

  const resolveBookingSupplierUid = useCallback(
    (targetBooking: PlatformBooking, explicitSupplierUid?: string): string => {
      const linkedTrip = trips.find((t) => t.id === targetBooking.tripId);
      const linkedSupplier = suppliers.find((s) => s.name === targetBooking.supplierName);
      return (
        explicitSupplierUid ||
        targetBooking.supplierUid ||
        linkedTrip?.supplierUid ||
        linkedSupplier?.linkedUid ||
        ''
      ).trim();
    },
    [trips, suppliers]
  );

  const createBookingInDb = useCallback(
    async (booking: PlatformBooking, options?: { suppressSelfAlert?: boolean }) => {
      const bookingWithTs: PlatformBooking = { ...booking, createdAtMs: Date.now() };
      if (!firestoreSeeded && effectiveRole === 'none') {
        throw new Error('Booking storage is not ready. Please try again.');
      }
      const resolvedSupplierUid = resolveBookingSupplierUid(booking);
      const sanitized = sanitizeBookingForFirestore(booking, resolvedSupplierUid || undefined);
      const bookingId = String(sanitized.id);
      try {
        // Atomic batch: bookings/{id} + booking_receipts/{id} (+ supplier_dispatches/{id} if already Confirmed by Owner/Ops)
        await runTransaction(db, async (batch) => {
          if ((await batch.get(doc(db, 'booking_receipts', bookingId))).exists()) throw new Error('Booking reference already exists. Please try again.');
          batch.set(doc(db, 'bookings', bookingId), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          batch.set(doc(db, 'booking_receipts', bookingId), {
            ...buildBookingReceiptFields({
              id: bookingId,
              tripId: String(sanitized.tripId),
              date: String(sanitized.date),
              status: booking.status,
            }),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          if (
            (effectiveRole === 'owner' || effectiveRole === 'operations') &&
            isSupplierVisibleBookingStatus(booking.status) &&
            resolvedSupplierUid
          ) {
            batch.set(doc(db, 'supplier_dispatches', bookingId), {
              ...buildSupplierDispatchFields(
                { ...bookingWithTs, id: bookingId, supplierUid: resolvedSupplierUid },
                resolvedSupplierUid
              ),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

        });

      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `bookings/${bookingId}`);
        throw err;
      }
      setBookings((prev) => [bookingWithTs, ...prev.filter(b => b.id !== booking.id)]);
      knownBookingIdsRef.current.add(booking.id);
      if (effectiveRole !== 'none' && !options?.suppressSelfAlert) {
        setLatestNewBooking(booking);
        try {
          playNewBookingChime();
          showDesktopBookingNotification(booking);
        } catch { /* Local alerts never turn a committed booking into a save failure. */ }
      }

    },
    [
      firestoreSeeded,
      effectiveRole,
      resolveBookingSupplierUid,
    ]
  );

  const createChatInDb = useCallback(
    async (chat: ChatThread) => {
      setChats((prev) => [chat, ...prev]);
      if (!firestoreSeeded && effectiveRole === 'none') return;
      const sanitized = sanitizeChatForFirestore(chat);
      const chatId = String(sanitized.id);
      try {
        await setDoc(doc(db, 'chats', chatId), {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `chats/${chatId}`);
      }
    },
    [firestoreSeeded, effectiveRole]
  );

  const subscribeNewsletterInDb = useCallback(async (email: string, lang: Lang) => {
    const cleanEmail = truncateText(email, 160, '');
    if (cleanEmail.length < 5 || !cleanEmail.includes('@')) return;

    setSubscribedEmails((prev) => (prev.includes(cleanEmail) ? prev : [...prev, cleanEmail]));
    const subId = `sub-${Date.now()}`;
    try {
      await setDoc(doc(db, 'newsletter_subscribers', subId), {
        email: cleanEmail,
        lang: normalizeLang(lang),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `newsletter_subscribers/${subId}`);
    }
  }, []);

  const addSupplierTripInDb = useCallback(
    async (trip: Trip) => {
      const forcedStatus: Trip['approvalStatus'] =
        effectiveRole === 'owner' ? trip.approvalStatus || 'Approved' : 'Pending';
      const normalizedTrip: Trip = {
        ...trip,
        supplierUid: user?.uid || trip.supplierUid,
        approvalStatus: forcedStatus,
      };
      setTrips((prev) => [normalizedTrip, ...prev]);

      const sanitized = sanitizeTripForFirestore(normalizedTrip, user?.uid);
      const tripId = String(sanitized.id);
      try {
        await setDoc(doc(db, 'trips', tripId), {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `trips/${tripId}`);
      }
    },
    [effectiveRole, user]
  );

  const updateTripApprovalInDb = useCallback(
    async (tripId: string, approvalStatus: 'Approved' | 'Pending' | 'Paused' | 'Rejected') => {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, approvalStatus } : t)));
      try {
        await updateDoc(doc(db, 'trips', tripId), {
          approvalStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `trips/${tripId}`);
      }
    },
    []
  );

  const updateTripInDb = useCallback(
    async (trip: Trip) => {
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? trip : t)));
      const sanitized = sanitizeTripForFirestore(trip, trip.supplierUid);
      const tripId = String(sanitized.id);
      try {
        const ref = doc(db, 'trips', tripId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const existingData = snap.data() as Record<string, unknown>;
          const optionalTripFields = [
            'departureTimes',
            'timingNote',
            'options',
            'fullDescription',
            'tips',
            'notSuitableFor',
            'meetingPoint',
            'meetingPointUrl',
            'whatToBring',
            'notAllowed',
            'knowBeforeYouGo',
            'minChildAge',
            'kidsDiscount',
            'languages',
            'outerTransferEnabled',
          ] as const;
          const updatePayload: Record<string, unknown> = {
            ...sanitized,
            updatedAt: serverTimestamp(),
          };
          for (const field of optionalTripFields) {
            if (!(field in sanitized) && field in existingData) {
              updatePayload[field] = deleteField();
            }
          }
          await updateDoc(ref, updatePayload);
        } else {
          await setDoc(ref, {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `trips/${tripId}`);
      }
    },
    []
  );

  const deleteTripInDb = useCallback(async (tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    try {
      await deleteDoc(doc(db, 'trips', tripId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `trips/${tripId}`);
    }
  }, []);

  const updateBookingInDb = useCallback(
    async (id: string, patch: Partial<PlatformBooking>) => {
      if (effectiveRole === 'supplier') {
        const driverValue =
          patch.assignedDriverOrGuide !== undefined
            ? truncateText(patch.assignedDriverOrGuide, 160, '')
            : undefined;
        const allowedStatus =
          patch.status === 'Driver assigned' && driverValue && driverValue.trim().length >= 2
            ? 'Driver assigned'
            : undefined;
        const supplierSafePatch: Record<string, unknown> = stripUndefined({
          assignedDriverOrGuide: driverValue,
          status: allowedStatus,
        });
        if (Object.keys(supplierSafePatch).length === 0) return;

        setBookings((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...(driverValue !== undefined ? { assignedDriverOrGuide: driverValue } : {}),
                  ...(allowedStatus ? { status: allowedStatus } : {}),
                }
              : b
          )
        );
        try {
          await updateDoc(doc(db, 'supplier_dispatches', sanitizeDocId(id, 'WT')), {
            ...supplierSafePatch,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `supplier_dispatches/${id}`);
        }
        return;
      }

      const existingBooking = bookings.find((b) => b.id === id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      const safePatch: Record<string, unknown> = stripUndefined({
        tripTitle:
          patch.tripTitle !== undefined ? truncateText(patch.tripTitle, 240, 'Wasla Excursion') : undefined,
        category: patch.category,
        destination: patch.destination,
        date:
          patch.date !== undefined ? truncateText(patch.date, 20, new Date().toISOString().slice(0, 10)) : undefined,
        tripStartTime:
          patch.tripStartTime !== undefined
            ? patch.tripStartTime.trim().length > 0
              ? truncateText(patch.tripStartTime, 80, '')
              : deleteField()
            : undefined,
        pickupTime:
          patch.pickupTime !== undefined ? truncateText(patch.pickupTime, 24, '') : undefined,
        pickupSpot:
          patch.pickupSpot === 'Inside Reception' || patch.pickupSpot === 'Outside Main Gate'
            ? patch.pickupSpot
            : undefined,
        guestName:
          patch.guestName !== undefined ? truncateText(patch.guestName, 120, 'Guest') : undefined,
        guestCountry:
          patch.guestCountry !== undefined ? truncateText(patch.guestCountry, 80, '') : undefined,
        guestWhatsapp:
          patch.guestWhatsapp !== undefined ? truncateText(patch.guestWhatsapp, 60, '') : undefined,
        guestEmail:
          patch.guestEmail !== undefined ? truncateText(patch.guestEmail, 160, '') : undefined,
        guestContact:
          patch.guestContact !== undefined ? truncateText(patch.guestContact, 160, 'WhatsApp guest') : undefined,
        hotel:
          patch.hotel !== undefined ? truncateText(patch.hotel, 200, 'Hurghada Hotel') : undefined,
        roomNumber:
          patch.roomNumber !== undefined ? truncateText(patch.roomNumber, 40, '') : undefined,
        locationImageUrl:
          patch.locationImageUrl !== undefined
            ? patch.locationImageUrl.length <= 250000
              ? patch.locationImageUrl
              : ''
            : undefined,
        adults:
          patch.adults !== undefined ? clampNumber(patch.adults, 1, 50, 1) : undefined,
        children:
          patch.children !== undefined ? clampNumber(patch.children, 0, 50, 0) : undefined,
        infants:
          patch.infants !== undefined ? clampNumber(patch.infants, 0, 50, 0) : undefined,
        grossEur:
          patch.grossEur !== undefined ? clampNumber(patch.grossEur, 0, 100000, 0) : undefined,
        supplierName:
          patch.supplierName !== undefined ? truncateText(patch.supplierName, 120, 'Wasla City Hosts') : undefined,
        assignedDriverOrGuide:
          patch.assignedDriverOrGuide !== undefined
            ? truncateText(patch.assignedDriverOrGuide, 160, '')
            : undefined,
        paymentStatus: patch.paymentStatus,
        status: patch.status,
        notes: patch.notes !== undefined ? truncateText(patch.notes, 800, '') : undefined,
        supplierNotes:
          patch.supplierNotes !== undefined
            ? truncateText(patch.supplierNotes, 500, '')
            : undefined,
      });
      const safeDocId = sanitizeDocId(id, 'WT');
      try {
        // Pre-read existing dispatch & receipt docs to decide set vs update inside ONE atomic batch
        const dispRef = doc(db, 'supplier_dispatches', safeDocId);
        const rcptRef = doc(db, 'booking_receipts', safeDocId);
        const [dispSnap, rcptSnap] = await Promise.all([
          getDoc(dispRef).catch(() => null),
          patch.status !== undefined || patch.date !== undefined
            ? getDoc(rcptRef).catch(() => null)
            : Promise.resolve(null),
        ]);

        const batch = writeBatch(db);
        batch.update(doc(db, 'bookings', id), {
          ...safePatch,
          updatedAt: serverTimestamp(),
        });

        if (existingBooking) {
          const mergedBooking: PlatformBooking = { ...existingBooking, ...patch };
          const resolvedUid = resolveBookingSupplierUid(mergedBooking);
          if (isSupplierVisibleBookingStatus(mergedBooking.status) && resolvedUid) {
            const dispatchFields = buildSupplierDispatchFields(mergedBooking, resolvedUid);
            if (dispSnap?.exists()) {
              batch.update(dispRef, {
                ...dispatchFields,
                updatedAt: serverTimestamp(),
              });
            } else {
              batch.set(dispRef, {
                ...dispatchFields,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          } else {
            // Atomically revoke supplier dispatch on cancellation/refund/pending/no-show/unassigned
            batch.delete(dispRef);
          }
        } else if (patch.status !== undefined && !isSupplierVisibleBookingStatus(patch.status)) {
          batch.delete(dispRef);
        }

        if (patch.status !== undefined || patch.date !== undefined) {
          if (rcptSnap?.exists()) {
            const receiptUpdate: Record<string, unknown> = {
              updatedAt: serverTimestamp(),
            };
            if (patch.status !== undefined) receiptUpdate.status = patch.status;
            if (patch.date !== undefined) {
              receiptUpdate.tripDate = truncateText(patch.date, 20, '');
              receiptUpdate.tripEndAt = buildTripEndTimestamp(patch.date);
            }
            batch.update(rcptRef, receiptUpdate);
          } else if (existingBooking) {
            batch.set(rcptRef, {
              ...buildBookingReceiptFields({
                id: existingBooking.id,
                tripId: existingBooking.tripId,
                date: patch.date ?? existingBooking.date,
                status: patch.status ?? existingBooking.status,
              }),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        await batch.commit();

        if (patch.status !== undefined) {
          const nextVerified = patch.status === 'Completed';
          setReceiptStatusByBookingId((prev) => ({ ...prev, [id]: patch.status as string }));
          setTripReviews((prev) =>
            prev.map((r) => (r.bookingId === id ? { ...r, verifiedBooking: nextVerified } : r))
          );
          try {
            const linkedReviewsSnap = await getDocs(
              query(collection(db, 'trip_reviews'), where('bookingId', '==', id))
            );
            for (const revDoc of linkedReviewsSnap.docs) {
              const revData = revDoc.data() as TripReviewRecord;
              if (Boolean(revData.verifiedBooking) !== nextVerified) {
                await updateDoc(doc(db, 'trip_reviews', revDoc.id), {
                  verifiedBooking: nextVerified,
                  updatedAt: serverTimestamp(),
                }).catch(() => {});
              }
            }
          } catch {
            // Non-fatal if static reviews haven't been seeded yet
          }
        }
      } catch (err) {
        // Roll back optimistic state if atomic batch failed
        if (existingBooking) {
          setBookings((prev) => prev.map((b) => (b.id === id ? existingBooking : b)));
        }
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
      }
    },
    [bookings, effectiveRole, resolveBookingSupplierUid]
  );

  const sendChatMessageInDb = useCallback(
    async (threadId: string, text: string) => {
      const target = chats.find((c) => c.id === threadId);
      if (!target) return;
      const nowLabel = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const updatedMessages = [
        ...target.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'operator' as const,
          text: truncateText(text, 1000, 'Reply'),
          timestamp: nowLabel,
        },
      ].slice(-50);
      setChats((prev) =>
        prev.map((th) => (th.id === threadId ? { ...th, unread: false, messages: updatedMessages } : th))
      );
      try {
        await updateDoc(doc(db, 'chats', threadId), {
          unread: false,
          messages: updatedMessages,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `chats/${threadId}`);
      }
    },
    [chats]
  );

  const updateComplaintInDb = useCallback(async (id: string, patch: Partial<ComplaintCase>) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const safePatch: Record<string, unknown> = stripUndefined({
      status: patch.status,
      summary: patch.summary !== undefined ? truncateText(patch.summary, 800, '') : undefined,
    });
    try {
      await updateDoc(doc(db, 'complaints', id), {
        ...safePatch,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `complaints/${id}`);
    }
  }, []);

  const updateSupplierStatusInDb = useCallback(async (id: string, status: SupplierProfile['status']) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    try {
      await updateDoc(doc(db, 'suppliers', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `suppliers/${id}`);
    }
  }, []);

  const updatePublicSettingsInDb = useCallback(
    async (patch: Partial<PublicStorefrontSettings>) => {
      const merged = { ...publicSettings, ...patch };
      const rawNumber = truncateText(merged.whatsappNumber, 24, SITE_CONFIG.whatsappNumber);
      const rawDisplay = truncateText(merged.whatsappDisplay, 32, SITE_CONFIG.whatsappDisplay);
      const safeNumber = rawNumber.length >= 6 ? rawNumber : SITE_CONFIG.whatsappNumber;
      const safeDisplay = rawDisplay.length >= 6 ? rawDisplay : SITE_CONFIG.whatsappDisplay;
      const rawEmail = truncateText(merged.email, 120, SITE_CONFIG.email);
      const rawDomain = truncateText(merged.domain, 100, SITE_CONFIG.domain);

      const safeHeroFont: HeroFontStyle = (
        ['editorial', 'modern', 'clean', 'luxury', 'bold', 'architectural'].includes(
          merged.heroFontStyle || ''
        )
          ? merged.heroFontStyle
          : 'editorial'
      ) as HeroFontStyle;
      const safeHeroTheme: HeroThemeStyle = (
        [
          'red-sea',
          'midnight',
          'golden-dusk',
          'minimal',
          'deep-turquoise',
          'coral-horizon',
          'desert-amber',
          'obsidian-gold',
        ].includes(merged.heroTheme || '')
          ? merged.heroTheme
          : 'red-sea'
      ) as HeroThemeStyle;

      const rawHeroImg = typeof merged.heroImageUrl === 'string' ? merged.heroImageUrl.trim() : '';
      const safeHeroImg = rawHeroImg.length <= 250000 ? rawHeroImg : '';

      const next: PublicStorefrontSettings = {
        whatsappNumber: safeNumber,
        whatsappDisplay: safeDisplay,
        email: rawEmail.length >= 5 ? rawEmail : SITE_CONFIG.email,
        domain: rawDomain.length >= 3 ? rawDomain : SITE_CONFIG.domain,
        airTicketsEnabled: Boolean(merged.airTicketsEnabled),
        metaPixelId: truncateText(merged.metaPixelId, 64, ''),
        ga4Id: truncateText(merged.ga4Id, 64, ''),
        heroImageUrl: safeHeroImg,
        heroCaptionEn: truncateText(merged.heroCaptionEn, 240, ''),
        heroCaptionAr: truncateText(merged.heroCaptionAr, 240, ''),
        heroCaptionDe: truncateText(merged.heroCaptionDe, 240, ''),
        heroSubEn: truncateText(merged.heroSubEn, 600, ''),
        heroSubAr: truncateText(merged.heroSubAr, 600, ''),
        heroSubDe: truncateText(merged.heroSubDe, 600, ''),
        heroFontStyle: safeHeroFont,
        heroTheme: safeHeroTheme,
      };
      setPublicSettings(next);
      try {
        await setDoc(doc(db, 'public_settings', 'storefront'), {
          ...next,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'public_settings/storefront');
      }
    },
    [publicSettings]
  );

  const updateCommissionRateInDb = useCallback(async (rate: number) => {
    const safeRate = clampNumber(rate, 5, 40, 15);
    setCommissionRate(safeRate);
    try {
      await setDoc(doc(db, 'owner_settings', 'platform'), {
        commissionRate: safeRate,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'owner_settings/platform');
    }
  }, []);

  const updateTripReviewApprovalInDb = useCallback(
    async (reviewId: string, approvalStatus: 'Approved' | 'Pending' | 'Rejected') => {
      const targetReview = tripReviews.find((r) => r.id === reviewId);
      const linkedBooking = targetReview?.bookingId
        ? bookings.find((b) => b.id === targetReview.bookingId)
        : undefined;
      const resolvedVerified = targetReview?.bookingId
        ? linkedBooking
          ? linkedBooking.status === 'Completed'
          : receiptStatusByBookingId[targetReview.bookingId]
          ? receiptStatusByBookingId[targetReview.bookingId] === 'Completed'
          : Boolean(targetReview.verifiedBooking)
        : false;

      setTripReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, approvalStatus, verifiedBooking: resolvedVerified } : r
        )
      );
      try {
        await updateDoc(doc(db, 'trip_reviews', reviewId), {
          approvalStatus,
          verifiedBooking: resolvedVerified,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `trip_reviews/${reviewId}`);
      }
    },
    [tripReviews, bookings, receiptStatusByBookingId]
  );

  const bookingStatusById = useMemo<Record<string, string>>(() => {
    const hasLiveAllBookings = effectiveRole === 'owner' || effectiveRole === 'operations';
    if (hasLiveAllBookings) {
      const map: Record<string, string> = { ...receiptStatusByBookingId };
      for (const bk of bookings) {
        map[bk.id] = bk.status;
      }
      return map;
    }
    const map: Record<string, string> = {};
    if (!firestoreSeeded) {
      for (const bk of bookings) {
        map[bk.id] = bk.status;
      }
    } else if (effectiveRole === 'supplier') {
      for (const bk of bookings) {
        map[bk.id] = bk.status;
      }
    }
    for (const [bId, status] of Object.entries(receiptStatusByBookingId)) {
      map[bId] = status;
    }
    return map;
  }, [effectiveRole, firestoreSeeded, bookings, receiptStatusByBookingId]);

  const synchronizedTripReviews = useMemo<TripReviewRecord[]>(() => {
    return tripReviews.map((rev) => {
      if (!rev.bookingId) {
        return { ...rev, verifiedBooking: false };
      }
      const liveBookingStatus = bookingStatusById[rev.bookingId];
      if (liveBookingStatus !== undefined) {
        return {
          ...rev,
          verifiedBooking: liveBookingStatus === 'Completed',
        };
      }
      return {
        ...rev,
        verifiedBooking: Boolean(rev.verifiedBooking),
      };
    });
  }, [tripReviews, bookingStatusById]);

  const dismissNewBookingAlert = useCallback(() => {
    setLatestNewBooking(null);
  }, []);

  const toggleSoundMuted = useCallback(() => {
    setSoundMuted((prev) => {
      const next = !prev;
      setBookingSoundMuted(next);
      if (!next) playNewBookingChime(true);
      return next;
    });
  }, []);

  const testBookingAlert = useCallback(() => {
    playNewBookingChime(true);
    const sample: PlatformBooking = bookings[0] || INITIAL_BOOKINGS[0];
    setLatestNewBooking({ ...sample, id: sample.id });
    showDesktopBookingNotification(sample);
  }, [bookings]);

  const isPrimaryOwner =
    Boolean(user?.emailVerified) &&
    user?.email?.toLowerCase() === BOOTSTRAPPED_OWNER_EMAIL.toLowerCase();

  return {
    user,
    authReady,
    authError,
    effectiveRole,
    isPrimaryOwner,
    assignedSupplierName,
    ownAccessRequest,
    publicSettings,
    commissionRate,
    trips,
    tripsLoading,
    bookings,
    suppliers,
    chats,
    complaints,
    emailLogs,
    tripReviews: synchronizedTripReviews,
    bookingStatusById,
    receiptStatusByBookingId,
    accessRequests,
    staffRoles,
    adminUsers,
    subscribedEmails,
    latestNewBooking,
    soundMuted,
    signInWithGoogle,
    signOutUser,
    submitAccessRequest,
    approveAccessRequest,
    grantFullOwnerAccess,
    revokePortalAccess,
    createBookingInDb,
    createChatInDb,
    subscribeNewsletterInDb,
    addSupplierTripInDb,
    updateTripApprovalInDb,
    updateTripInDb,
    deleteTripInDb,
    updateTripReviewApprovalInDb,
    updateBookingInDb,
    logDispatchEmailInDb,
    sendChatMessageInDb,
    updateComplaintInDb,
    updateSupplierStatusInDb,
    updatePublicSettingsInDb,
    updateCommissionRateInDb,
    dismissNewBookingAlert,
    toggleSoundMuted,
    testBookingAlert,
  };
}
