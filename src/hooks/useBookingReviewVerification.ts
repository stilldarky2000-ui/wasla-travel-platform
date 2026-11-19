import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { Trip } from '../data/marketplaceData';
import { INITIAL_BOOKINGS } from '../data/platformData';
import { db } from '../lib/firebase';

export interface SafeStorefrontBookingRef {
  bookingId: string;
  tripId: string;
  tripDate: string;
  savedAt: number;
}

export type BookingVerificationStatus =
  | 'idle'
  | 'invalid-format'
  | 'checking'
  | 'eligible'
  | 'wrong-trip'
  | 'not-confirmed'
  | 'not-finished'
  | 'not-found'
  | 'already-reviewed'
  | 'error';

export interface BookingVerificationResult {
  status: BookingVerificationStatus;
  bookingId: string;
  matchedTripId?: string;
  receiptStatus?: string;
  tripDate?: string;
  tripEndAtMs?: number;
  /** Strictly computed from verified receipt status ('Completed'), never from client overrides */
  verifiedBooking: boolean;
  /** True only when the booking passes format, trip match, confirmation, and trip-end checks */
  canSubmitReview: boolean;
  tripPublishedInCatalog: boolean;
  source: 'firestore-receipt' | 'starter-catalog' | 'none';
  checkedAtMs: number;
}

const HANDOFF_STORAGE_KEY = 'wasla_verified_review_handoffs_v1';
const REVIEWED_IDS_STORAGE_KEY = 'wasla_reviewed_booking_ids_v1';
const ALLOWED_REVIEW_STATUSES = new Set(['Confirmed', 'Driver assigned', 'Completed']);
const VALID_DOC_ID_RE = /^[A-Za-z0-9_-]{3,128}$/;

/**
 * Normalizes and sanitizes any raw booking ID coming from URL params, localStorage,
 * booking confirmation tickets, or form inputs so only safe Firestore document IDs pass through.
 */
export function sanitizeBookingId(raw?: string | null): string {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 64);
}

export function isValidBookingIdFormat(cleanId: string): boolean {
  return VALID_DOC_ID_RE.test(cleanId);
}

function isSafeStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Strips any PII from storefront BookingRequest objects and returns only
 * safe verification handoff metadata (bookingId, tripId, tripDate).
 */
export function extractSafeBookingRefs(
  requests: ReadonlyArray<{ id?: string; tripId?: string; date?: string }>,
  tripIdFilter?: string
): SafeStorefrontBookingRef[] {
  const seen = new Set<string>();
  const result: SafeStorefrontBookingRef[] = [];

  for (const req of requests) {
    const cleanId = sanitizeBookingId(req.id);
    const cleanTripId = typeof req.tripId === 'string' ? req.tripId.trim().slice(0, 128) : '';
    if (!isValidBookingIdFormat(cleanId) || !cleanTripId) continue;
    if (tripIdFilter && cleanTripId !== tripIdFilter) continue;
    if (seen.has(cleanId)) continue;
    seen.add(cleanId);

    result.push({
      bookingId: cleanId,
      tripId: cleanTripId,
      tripDate: typeof req.date === 'string' ? req.date.trim().slice(0, 20) : '',
      savedAt: Date.now(),
    });
  }

  return result;
}

export function readStorefrontBookingHandoffs(tripIdFilter?: string): SafeStorefrontBookingRef[] {
  if (!isSafeStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(HANDOFF_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: SafeStorefrontBookingRef[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const cleanId = sanitizeBookingId((item as { bookingId?: string }).bookingId);
      const cleanTripId =
        typeof (item as { tripId?: string }).tripId === 'string'
          ? (item as { tripId: string }).tripId.trim().slice(0, 128)
          : '';
      if (!isValidBookingIdFormat(cleanId) || !cleanTripId) continue;
      if (tripIdFilter && cleanTripId !== tripIdFilter) continue;
      if (seen.has(cleanId)) continue;
      seen.add(cleanId);
      valid.push({
        bookingId: cleanId,
        tripId: cleanTripId,
        tripDate:
          typeof (item as { tripDate?: string }).tripDate === 'string'
            ? (item as { tripDate: string }).tripDate.trim().slice(0, 20)
            : '',
        savedAt: Number((item as { savedAt?: number }).savedAt) || Date.now(),
      });
    }
    return valid;
  } catch {
    return [];
  }
}

export function persistStorefrontBookingHandoff(entry: {
  bookingId?: string;
  tripId?: string;
  tripDate?: string;
}): void {
  if (!isSafeStorageAvailable()) return;
  const cleanId = sanitizeBookingId(entry.bookingId);
  const cleanTripId = typeof entry.tripId === 'string' ? entry.tripId.trim().slice(0, 128) : '';
  if (!isValidBookingIdFormat(cleanId) || !cleanTripId) return;

  try {
    const existing = readStorefrontBookingHandoffs().filter((item) => item.bookingId !== cleanId);
    const next: SafeStorefrontBookingRef[] = [
      {
        bookingId: cleanId,
        tripId: cleanTripId,
        tripDate: typeof entry.tripDate === 'string' ? entry.tripDate.trim().slice(0, 20) : '',
        savedAt: Date.now(),
      },
      ...existing,
    ].slice(0, 25);
    window.localStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota / privacy mode failures
  }
}

export function readLocallyReviewedBookingIds(): Set<string> {
  if (!isSafeStorageAvailable()) return new Set();
  try {
    const raw = window.localStorage.getItem(REVIEWED_IDS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.map((id) => sanitizeBookingId(typeof id === 'string' ? id : '')).filter(Boolean)
    );
  } catch {
    return new Set();
  }
}

export function markBookingIdLocallyReviewed(bookingId: string): void {
  if (!isSafeStorageAvailable()) return;
  const cleanId = sanitizeBookingId(bookingId);
  if (!isValidBookingIdFormat(cleanId)) return;
  try {
    const current = Array.from(readLocallyReviewedBookingIds()).filter((id) => id !== cleanId);
    window.localStorage.setItem(
      REVIEWED_IDS_STORAGE_KEY,
      JSON.stringify([cleanId, ...current].slice(0, 50))
    );
  } catch {
    // Ignore storage errors
  }
}

export function isBookingIdLocallyReviewed(bookingId: string): boolean {
  const cleanId = sanitizeBookingId(bookingId);
  if (!cleanId) return false;
  return readLocallyReviewedBookingIds().has(cleanId);
}

function parseReceiptEndMs(tripEndAt?: Timestamp, tripDate?: string): number {
  if (tripEndAt && typeof tripEndAt.toMillis === 'function') {
    return tripEndAt.toMillis();
  }
  if (tripDate && /^\d{4}-\d{2}-\d{2}/.test(tripDate)) {
    const parsed = new Date(`${tripDate.slice(0, 10)}T23:59:59Z`).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Programmatically verifies a sanitized bookingId against zero-PII Firestore `booking_receipts`
 * (with `bookingStatusById` and `INITIAL_BOOKINGS` fallback for offline/unseeded environments).
 */
export async function verifyBookingForReview(
  rawBookingId: string,
  expectedTripId?: string,
  bookingStatusById?: Record<string, string>
): Promise<BookingVerificationResult> {
  const cleanId = sanitizeBookingId(rawBookingId);
  const now = Date.now();

  if (!cleanId) {
    return {
      status: 'idle',
      bookingId: '',
      verifiedBooking: false,
      canSubmitReview: false,
      tripPublishedInCatalog: true,
      source: 'none',
      checkedAtMs: now,
    };
  }

  if (!isValidBookingIdFormat(cleanId)) {
    return {
      status: 'invalid-format',
      bookingId: cleanId,
      verifiedBooking: false,
      canSubmitReview: false,
      tripPublishedInCatalog: true,
      source: 'none',
      checkedAtMs: now,
    };
  }

  if (isBookingIdLocallyReviewed(cleanId)) {
    return {
      status: 'already-reviewed',
      bookingId: cleanId,
      matchedTripId: expectedTripId,
      verifiedBooking: false,
      canSubmitReview: false,
      tripPublishedInCatalog: true,
      source: 'none',
      checkedAtMs: now,
    };
  }

  try {
    const [receiptSnap, tripSnap] = await Promise.all([
      getDoc(doc(db, 'booking_receipts', cleanId)),
      expectedTripId ? getDoc(doc(db, 'trips', expectedTripId)) : Promise.resolve(null),
    ]);

    const tripPublishedInCatalog = expectedTripId ? Boolean(tripSnap?.exists()) : true;

    if (receiptSnap.exists()) {
      const receipt = receiptSnap.data() as {
        tripId?: string;
        tripDate?: string;
        tripEndAt?: Timestamp;
        status?: string;
      };

      const matchedTripId = typeof receipt.tripId === 'string' ? receipt.tripId : '';
      const receiptStatus =
        bookingStatusById?.[cleanId] ||
        (typeof receipt.status === 'string' ? receipt.status : '');
      const tripDate = typeof receipt.tripDate === 'string' ? receipt.tripDate : undefined;
      const tripEndAtMs = parseReceiptEndMs(receipt.tripEndAt, tripDate);
      const isCompleted = receiptStatus === 'Completed';

      if (expectedTripId && matchedTripId !== expectedTripId) {
        return {
          status: 'wrong-trip',
          bookingId: cleanId,
          matchedTripId,
          receiptStatus,
          tripDate,
          tripEndAtMs,
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog,
          source: 'firestore-receipt',
          checkedAtMs: Date.now(),
        };
      }

      if (!receiptStatus || !ALLOWED_REVIEW_STATUSES.has(receiptStatus)) {
        return {
          status: 'not-confirmed',
          bookingId: cleanId,
          matchedTripId,
          receiptStatus,
          tripDate,
          tripEndAtMs,
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog,
          source: 'firestore-receipt',
          checkedAtMs: Date.now(),
        };
      }

      if (!isCompleted && (!tripEndAtMs || Date.now() < tripEndAtMs)) {
        return {
          status: 'not-finished',
          bookingId: cleanId,
          matchedTripId,
          receiptStatus,
          tripDate,
          tripEndAtMs,
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog,
          source: 'firestore-receipt',
          checkedAtMs: Date.now(),
        };
      }

      return {
        status: 'eligible',
        bookingId: cleanId,
        matchedTripId,
        receiptStatus,
        tripDate,
        tripEndAtMs,
        verifiedBooking: isCompleted,
        canSubmitReview: true,
        tripPublishedInCatalog,
        source: 'firestore-receipt',
        checkedAtMs: Date.now(),
      };
    }

    // Fallback check against starter bookings when Firestore receipt doc isn't seeded yet
    const starter = INITIAL_BOOKINGS.find((b) => sanitizeBookingId(b.id) === cleanId);
    if (starter) {
      const liveOrStarterStatus = bookingStatusById?.[cleanId] || starter.status;
      const tripEndAtMs = parseReceiptEndMs(undefined, starter.date);
      const isCompleted = liveOrStarterStatus === 'Completed';

      if (expectedTripId && starter.tripId !== expectedTripId) {
        return {
          status: 'wrong-trip',
          bookingId: cleanId,
          matchedTripId: starter.tripId,
          receiptStatus: liveOrStarterStatus,
          tripDate: starter.date,
          tripEndAtMs,
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog,
          source: 'starter-catalog',
          checkedAtMs: Date.now(),
        };
      }

      if (!ALLOWED_REVIEW_STATUSES.has(liveOrStarterStatus)) {
        return {
          status: 'not-confirmed',
          bookingId: cleanId,
          matchedTripId: starter.tripId,
          receiptStatus: liveOrStarterStatus,
          tripDate: starter.date,
          tripEndAtMs,
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog,
          source: 'starter-catalog',
          checkedAtMs: Date.now(),
        };
      }

      if (!isCompleted && (!tripEndAtMs || Date.now() < tripEndAtMs)) {
        return {
          status: 'not-finished',
          bookingId: cleanId,
          matchedTripId: starter.tripId,
          receiptStatus: liveOrStarterStatus,
          tripDate: starter.date,
          tripEndAtMs,
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog,
          source: 'starter-catalog',
          checkedAtMs: Date.now(),
        };
      }

      return {
        status: 'eligible',
        bookingId: cleanId,
        matchedTripId: starter.tripId,
        receiptStatus: liveOrStarterStatus,
        tripDate: starter.date,
        tripEndAtMs,
        verifiedBooking: isCompleted,
        canSubmitReview: true,
        tripPublishedInCatalog,
        source: 'starter-catalog',
        checkedAtMs: Date.now(),
      };
    }

    return {
      status: 'not-found',
      bookingId: cleanId,
      verifiedBooking: false,
      canSubmitReview: false,
      tripPublishedInCatalog,
      source: 'none',
      checkedAtMs: Date.now(),
    };
  } catch {
    return {
      status: 'error',
      bookingId: cleanId,
      verifiedBooking: false,
      canSubmitReview: false,
      tripPublishedInCatalog: true,
      source: 'none',
      checkedAtMs: Date.now(),
    };
  }
}

/**
 * Resolves a standalone `?review=<bookingId>` (even without `&trip=`) into a matched Trip
 * and programmatic verification result so deep links always land safely in the review modal.
 */
export async function resolveBookingReviewTarget(
  rawBookingId: string,
  trips: Trip[],
  bookingStatusById?: Record<string, string>
): Promise<{
  bookingId: string;
  trip: Trip;
  verification: BookingVerificationResult;
} | null> {
  const cleanId = sanitizeBookingId(rawBookingId);
  if (!isValidBookingIdFormat(cleanId)) return null;

  const verification = await verifyBookingForReview(cleanId, undefined, bookingStatusById);
  if (!verification.matchedTripId) return null;

  const matchedTrip = trips.find((t) => t.id === verification.matchedTripId);
  if (!matchedTrip) return null;

  return {
    bookingId: cleanId,
    trip: matchedTrip,
    verification,
  };
}

/**
 * Hook used inside PostTripReviewModal (or any review entry form) to continuously and
 * programmatically verify a storefront/entered `bookingId` against existing bookings.
 */
export function useBookingReviewVerification({
  tripId,
  bookingId,
  enabled = true,
  bookingStatusById,
  debounceMs = 260,
}: {
  tripId: string;
  bookingId: string;
  enabled?: boolean;
  bookingStatusById?: Record<string, string>;
  debounceMs?: number;
}) {
  const cleanId = useMemo(() => sanitizeBookingId(bookingId), [bookingId]);
  const [verification, setVerification] = useState<BookingVerificationResult>({
    status: cleanId ? 'checking' : 'idle',
    bookingId: cleanId,
    verifiedBooking: false,
    canSubmitReview: false,
    tripPublishedInCatalog: true,
    source: 'none',
    checkedAtMs: 0,
  });
  const latestReqIdRef = useRef(0);

  const runVerification = useCallback(
    async (targetId: string): Promise<BookingVerificationResult> => {
      const reqId = ++latestReqIdRef.current;
      const sanitized = sanitizeBookingId(targetId);

      if (!sanitized) {
        const idle: BookingVerificationResult = {
          status: 'idle',
          bookingId: '',
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog: true,
          source: 'none',
          checkedAtMs: Date.now(),
        };
        if (reqId === latestReqIdRef.current) setVerification(idle);
        return idle;
      }

      if (!isValidBookingIdFormat(sanitized)) {
        const invalid: BookingVerificationResult = {
          status: 'invalid-format',
          bookingId: sanitized,
          verifiedBooking: false,
          canSubmitReview: false,
          tripPublishedInCatalog: true,
          source: 'none',
          checkedAtMs: Date.now(),
        };
        if (reqId === latestReqIdRef.current) setVerification(invalid);
        return invalid;
      }

      if (reqId === latestReqIdRef.current) {
        setVerification((prev) => ({
          ...prev,
          status: 'checking',
          bookingId: sanitized,
          canSubmitReview: false,
        }));
      }

      const res = await verifyBookingForReview(sanitized, tripId, bookingStatusById);
      if (reqId === latestReqIdRef.current) {
        setVerification(res);
      }
      return res;
    },
    [tripId, bookingStatusById]
  );

  useEffect(() => {
    if (!enabled) return;
    if (!cleanId) {
      void runVerification('');
      return;
    }
    if (!isValidBookingIdFormat(cleanId)) {
      void runVerification(cleanId);
      return;
    }

    const timer = window.setTimeout(() => {
      void runVerification(cleanId);
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, cleanId, debounceMs, runVerification]);

  return {
    cleanBookingId: cleanId,
    verification,
    isChecking: verification.status === 'checking',
    verifyNow: runVerification,
  };
}

export interface DetectedStorefrontBooking extends SafeStorefrontBookingRef {
  verification: BookingVerificationResult;
}

/**
 * Hook that safely bridges storefront booking activity (local requests, confirmed ticket,
 * persisted booking handoffs) into TripReview & TripDetailTemplate with live verification
 * against `booking_receipts` and zero PII leakage.
 */
export function useStorefrontTripBookingHandoff({
  tripId,
  externalBookingRefs = [],
  bookingStatusById,
  enabled = true,
}: {
  tripId: string;
  externalBookingRefs?: SafeStorefrontBookingRef[];
  bookingStatusById?: Record<string, string>;
  enabled?: boolean;
}) {
  const [detectedBookings, setDetectedBookings] = useState<DetectedStorefrontBooking[]>([]);
  const [checkingHandoff, setCheckingHandoff] = useState(false);

  const candidateRefs = useMemo(() => {
    const persisted = readStorefrontBookingHandoffs(tripId);
    const merged = [...externalBookingRefs, ...persisted];
    const unique = new Map<string, SafeStorefrontBookingRef>();
    for (const ref of merged) {
      const cleanId = sanitizeBookingId(ref.bookingId);
      if (!isValidBookingIdFormat(cleanId) || ref.tripId !== tripId) continue;
      if (!unique.has(cleanId)) {
        unique.set(cleanId, {
          bookingId: cleanId,
          tripId: ref.tripId,
          tripDate: ref.tripDate,
          savedAt: ref.savedAt,
        });
      }
    }
    return Array.from(unique.values());
  }, [tripId, externalBookingRefs]);

  useEffect(() => {
    if (!enabled || candidateRefs.length === 0) {
      setDetectedBookings([]);
      setCheckingHandoff(false);
      return;
    }

    let cancelled = false;
    setCheckingHandoff(true);

    void Promise.all(
      candidateRefs.map(async (ref) => {
        const verification = await verifyBookingForReview(
          ref.bookingId,
          tripId,
          bookingStatusById
        );
        return {
          ...ref,
          verification,
        };
      })
    ).then((verified) => {
      if (cancelled) return;
      setDetectedBookings(verified);
      setCheckingHandoff(false);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, tripId, candidateRefs, bookingStatusById]);

  const eligibleBooking = useMemo(
    () => detectedBookings.find((b) => b.verification.canSubmitReview) || null,
    [detectedBookings]
  );

  const latestBooking = useMemo(
    () =>
      eligibleBooking ||
      detectedBookings.find(
        (b) =>
          b.verification.status === 'not-finished' ||
          b.verification.status === 'not-confirmed'
      ) ||
      detectedBookings[0] ||
      null,
    [eligibleBooking, detectedBookings]
  );

  const rememberBooking = useCallback(
    (bookingId: string, tripDate = '') => {
      persistStorefrontBookingHandoff({
        bookingId,
        tripId,
        tripDate,
      });
    },
    [tripId]
  );

  const buildSafeReviewHandoff = useCallback(
    (overrideBookingId?: string) => {
      const targetId = sanitizeBookingId(overrideBookingId || eligibleBooking?.bookingId || '');
      return {
        tripId,
        bookingId: isValidBookingIdFormat(targetId) ? targetId : '',
      };
    },
    [tripId, eligibleBooking]
  );

  return {
    candidateRefs,
    detectedBookings,
    eligibleBooking,
    latestBooking,
    checkingHandoff,
    rememberBooking,
    buildSafeReviewHandoff,
  };
}
