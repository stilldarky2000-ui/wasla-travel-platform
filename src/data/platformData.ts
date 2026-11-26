import { ActivityCategoryId, DestinationRegion } from './marketplaceData';
import type { Lang } from './i18n';

export type PickupSpot = 'Inside Reception' | 'Outside Main Gate';

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Driver assigned'
  | 'Completed'
  | 'Refunded'
  | 'Cancelled'
  | 'No show';

export type PaymentStatus = 'Awaiting link' | 'Link sent' | 'Paid online' | 'Cash on pickup';

export interface PlatformBooking {
  id: string;
  tripId: string;
  tripTitle: string;
  category: ActivityCategoryId | 'custom';
  destination: DestinationRegion;
  date: string;
  tripStartTime?: string;
  pickupTime: string;
  pickupSpot?: PickupSpot;
  guestName: string;
  guestCountry: string;
  guestContact: string;
  guestWhatsapp?: string;
  guestEmail?: string;
  guestLang: Lang;
  hotel: string;
  roomNumber?: string;
  locationImageUrl?: string;
  adults: number;
  children: number;
  infants?: number;
  grossEur: number;
  supplierName: string;
  supplierUid?: string;
  assignedDriverOrGuide: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes: string;
  supplierNotes?: string;
  createdAtMs?: number;
}

export interface BookingUrgencyInfo {
  isUrgent: boolean;
  level: 'today' | 'tomorrow' | 'normal';
  label: string;
  shortAr: string;
}

export function getBookingUrgency(booking: Pick<PlatformBooking, 'date' | 'status'>): BookingUrgencyInfo {
  const inactiveStatuses: BookingStatus[] = ['Completed', 'Cancelled', 'Refunded', 'No show'];
  if (inactiveStatuses.includes(booking.status)) {
    return {
      isUrgent: false,
      level: 'normal',
      label: 'Normal · عادي',
      shortAr: 'عادي',
    };
  }

  const now = new Date();
  const toLocalIsoDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = toLocalIsoDate(now);
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowStr = toLocalIsoDate(tomorrowDate);
  const cleanDate = (booking.date || '').trim();

  if (cleanDate === todayStr) {
    return {
      isUrgent: true,
      level: 'today',
      label: 'Urgent Today · عاجل (اليوم)',
      shortAr: 'عاجل · اليوم',
    };
  }

  if (cleanDate === tomorrowStr) {
    return {
      isUrgent: true,
      level: 'tomorrow',
      label: 'Urgent Tomorrow · عاجل (غداً)',
      shortAr: 'عاجل · غداً',
    };
  }

  return {
    isUrgent: false,
    level: 'normal',
    label: 'Normal · عادي',
    shortAr: 'عادي',
  };
}

export const PENDING_ATTENTION_HOURS = 4;
export const PENDING_ATTENTION_THRESHOLD_MS = PENDING_ATTENTION_HOURS * 60 * 60 * 1000;

export interface PendingAttentionInfo {
  needsAttention: boolean;
  hoursPending: number;
  elapsedLabel: string;
}

export function getPendingAttentionInfo(
  booking: Pick<PlatformBooking, 'status' | 'createdAtMs'>,
  nowMs: number = Date.now()
): PendingAttentionInfo {
  if (booking.status !== 'Pending') {
    return { needsAttention: false, hoursPending: 0, elapsedLabel: '' };
  }
  const createdMs = typeof booking.createdAtMs === 'number' ? booking.createdAtMs : 0;
  if (createdMs <= 0) {
    return { needsAttention: false, hoursPending: 0, elapsedLabel: '' };
  }
  const elapsedMs = Math.max(0, nowMs - createdMs);
  if (elapsedMs <= PENDING_ATTENTION_THRESHOLD_MS) {
    return { needsAttention: false, hoursPending: 0, elapsedLabel: '' };
  }
  const totalMinutes = Math.floor(elapsedMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  const elapsedLabel =
    totalHours >= 24
      ? `${Math.floor(totalHours / 24)}d ${totalHours % 24}h`
      : `${totalHours}h ${remMinutes}m`;

  return {
    needsAttention: true,
    hoursPending: totalHours,
    elapsedLabel,
  };
}

export function sortBookingsNewestFirst(list: PlatformBooking[]): PlatformBooking[] {
  return [...list]
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const timeA = a.item.createdAtMs ?? 0;
      const timeB = b.item.createdAtMs ?? 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return a.idx - b.idx;
    })
    .map((entry) => entry.item);
}

export interface SupplierProfile {
  id: string;
  name: string;
  city: DestinationRegion;
  specialty: string;
  languages: string[];
  status: 'Active' | 'Pending' | 'Paused';
  contactPhone: string;
  email: string;
  payoutSettledEur: number;
  linkedUid?: string;
}

export interface StaffRoleRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'operations' | 'supplier';
  supplierName?: string;
  status: 'Active' | 'Paused';
}

export interface AccessRequestRecord {
  uid: string;
  email: string;
  displayName: string;
  requestedRole: 'operations' | 'supplier';
  companyName?: string;
  city?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'operator';
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  bookingRef: string;
  customerName: string;
  customerLang: Lang;
  tripTitle: string;
  pickupInfo: string;
  unread: boolean;
  messages: ChatMessage[];
}

export interface ComplaintCase {
  id: string;
  bookingRef: string;
  customerName: string;
  tripTitle: string;
  issueType: string;
  ownerRole: string;
  severity: 'Low' | 'Medium' | 'High';
  refundRequestedEur: number;
  status: 'Open' | 'Investigating' | 'Refunded' | 'Resolved';
  summary: string;
  createdAt: string;
}

export interface PlatformEmailLog {
  id: string;
  to: string;
  from?: string;
  subject: string;
  body?: string;
  bookingRef?: string;
  direction?: 'inbound' | 'outbound';
  type: 'Booking Confirmation' | 'Payment Link' | 'Supplier Dispatch' | 'Newsletter';
  sentAt: string;
  status: 'Delivered' | 'Received';
}

export interface TripReviewRecord {
  id: string;
  tripId: string;
  bookingId?: string;
  verifiedBooking?: boolean;
  tripTitle: string;
  guestName: string;
  guestCountry: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  visitDate: string;
  lang: Lang;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

export const INITIAL_SUPPLIERS: SupplierProfile[] = [];

export const INITIAL_BOOKINGS: PlatformBooking[] = [];

export const INITIAL_CHATS: ChatThread[] = [];

export const INITIAL_COMPLAINTS: ComplaintCase[] = [];

export const INITIAL_EMAIL_LOGS: PlatformEmailLog[] = [];

export const INITIAL_TRIP_REVIEWS: TripReviewRecord[] = [
  {
    id: 'rev-orange-1',
    tripId: 'orange-bay-small-group',
    bookingId: 'WT-412',
    verifiedBooking: false,
    tripTitle: 'Orange Bay & Giftun Reef Small-Group Boat Day',
    guestName: 'Hannah Lindner',
    guestCountry: 'Germany',
    rating: 5,
    comment: 'Only 14 of us on the boat, spotless towels, calm coral reefs for our first snorkel and fresh lunch aboard.',
    visitDate: '2026-11-08',
    lang: 'en',
    approvalStatus: 'Approved',
  },
  {
    id: 'rev-orange-2',
    tripId: 'orange-bay-small-group',
    verifiedBooking: false,
    tripTitle: 'Orange Bay & Giftun Reef Small-Group Boat Day',
    guestName: 'Sofia Van Dijk',
    guestCountry: 'Netherlands',
    rating: 5,
    comment: 'Captain Karim kept our family safe and sent exact marina pickup confirmation via WhatsApp the evening before.',
    visitDate: '2026-11-03',
    lang: 'en',
    approvalStatus: 'Approved',
  },
  {
    id: 'rev-luxor-1',
    tripId: 'luxor-valley-small-van',
    bookingId: 'WT-413',
    verifiedBooking: false,
    tripTitle: 'Luxor Temples & Valley of the Kings Small-Van Day',
    guestName: 'Martin Vestergaard',
    guestCountry: 'Denmark',
    rating: 5,
    comment: 'Zero souvenir factory detours, our small 8-seat van arrived at Karnak Temple right as the morning golden light hit.',
    visitDate: '2026-11-06',
    lang: 'en',
    approvalStatus: 'Approved',
  },
  {
    id: 'rev-desert-1',
    tripId: 'eastern-desert-sunset-safari',
    tripTitle: 'Eastern Desert Quad, Buggy & Bedouin Tea at Dusk',
    guestName: 'Nadia Patel',
    guestCountry: 'United Kingdom',
    rating: 5,
    comment: 'Travelled with my sister; the desert guides checked our pace constantly and fresh Bedouin tea at sunset was unforgettable.',
    visitDate: '2026-11-05',
    lang: 'en',
    approvalStatus: 'Approved',
  },
  {
    id: 'rev-horse-1',
    tripId: 'sahl-hasheesh-horse-swim',
    tripTitle: 'Sunrise Horse Riding on Sahl Hasheesh Bay',
    guestName: 'Claire Beaumont',
    guestCountry: 'France',
    rating: 5,
    comment: 'Calm Arabian horses at sunrise and our 7-year-old daughter felt completely safe walking gently into the warm shallows.',
    visitDate: '2026-11-09',
    lang: 'en',
    approvalStatus: 'Approved',
  },
    {
    id: 'rev-cairo-1',
    tripId: 'cairo-pyramids-gem-day',
    tripTitle: 'Giza Pyramids, Sphinx & Grand Egyptian Museum',
    guestName: 'Karim El-Masry',
    guestCountry: 'UAE',
    rating: 5,
    comment: 'تنظيم رائع لدخول هضبة الجيزة والمتحف المصري الكبير مع مرشد أثري محترف وغداء هادئ.',
    visitDate: '2026-11-02',
    lang: 'ar',
    approvalStatus: 'Approved',
  },
  {
    id: 'rev-transfer-1',
    tripId: 'hurghada-private-airport-transfer',
    tripTitle: 'Private Hurghada Airport, Marsa Alam & Luxor Transfers',
    guestName: 'Jonas Berg',
    guestCountry: 'Germany',
    rating: 5,
    comment: 'Pünktliche Abholung am Flughafen Hurghada trotz Flugverspätung, sauberes Auto mit Kindersitz und Festpreis.',
    visitDate: '2026-11-10',
    lang: 'de',
    approvalStatus: 'Approved',
  },
  ];
