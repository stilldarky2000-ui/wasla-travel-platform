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

export const INITIAL_SUPPLIERS: SupplierProfile[] = [
  {
    id: 'sup-karim',
    name: 'Captain Karim Marine',
    city: 'Hurghada',
    specialty: 'Small-group sea days & Orange Bay',
    languages: ['English', 'German', 'Arabic'],
    status: 'Active',
    contactPhone: '+20 100 342 1190',
    email: 'karim@marinedays.example',
    payoutSettledEur: 280,
  },
  {
    id: 'sup-nile',
    name: 'Nile Horizon Guides',
    city: 'Luxor',
    specialty: 'Licensed Egyptologists (EN/DE/FR/AR/ES) & Cairo/Luxor vans',
    languages: ['English', 'German', 'French', 'Spanish', 'Arabic'],
    status: 'Active',
    contactPhone: '+20 122 881 4020',
    email: 'dispatch@nilehorizon.example',
    payoutSettledEur: 410,
  },
  {
    id: 'sup-wadi',
    name: 'Wadi Trail Hurghada',
    city: 'Hurghada',
    specialty: 'Desert quads, family buggies & Bedouin camp',
    languages: ['English', 'Arabic', 'Russian'],
    status: 'Active',
    contactPhone: '+20 111 704 9912',
    email: 'ops@waditrail.example',
    payoutSettledEur: 140,
  },
  {
    id: 'sup-albahr',
    name: 'Al-Bahr Stables',
    city: 'Hurghada',
    specialty: 'Beach horse riding & family coastal carriages',
    languages: ['English', 'German', 'Arabic'],
    status: 'Active',
    contactPhone: '+20 106 552 3301',
    email: 'stables@albahr.example',
    payoutSettledEur: 95,
  },
  {
    id: 'sup-hosts',
    name: 'Wasla City Hosts',
    city: 'Hurghada',
    specialty: 'El Dahar Souq shopping, women-friendly city walks & local guides',
    languages: ['English', 'German', 'French', 'Italian', 'Arabic'],
    status: 'Active',
    contactPhone: '+20 112 915 5520',
    email: 'booking@waslatravel.com',
    payoutSettledEur: 60,
  },
  {
    id: 'sup-thebes',
    name: 'Thebes Sky Balloons',
    city: 'Luxor',
    specialty: 'Sunrise hot air balloon flights',
    languages: ['English', 'Arabic'],
    status: 'Pending',
    contactPhone: '+20 109 813 2200',
    email: 'fly@thebessky.example',
    payoutSettledEur: 0,
  },
];

export const INITIAL_BOOKINGS: PlatformBooking[] = [
  {
    id: 'WT-412',
    tripId: 'orange-bay-small-group',
    tripTitle: 'Orange Bay & Giftun Reef Small-Group Boat Day',
    category: 'sea',
    destination: 'Hurghada',
    date: '2026-11-16',
    tripStartTime: '09:00 AM',
    pickupTime: '08:00',
    guestName: 'Hannah Lindner',
    guestCountry: 'Germany',
    guestContact: '+49 170 5542190 · hannah.l@example.de',
    guestWhatsapp: '+49 170 5542190',
    guestEmail: 'hannah.l@example.de',
    guestLang: 'de',
    hotel: 'Steigenberger Al Dau Beach',
    adults: 2,
    children: 1,
    grossEur: 95,
    supplierName: 'Captain Karim Marine',
    assignedDriverOrGuide: 'Boat Al-Furat · Driver Tarek',
    paymentStatus: 'Paid online',
    status: 'Driver assigned',
    notes: 'Child age 7 — needs kids life jacket',
    createdAtMs: Date.now() - 8 * 60 * 60 * 1000,
  },
  {
    id: 'WT-413',
    tripId: 'luxor-valley-small-van',
    tripTitle: 'Luxor Temples & Valley of the Kings Small-Van Day',
    category: 'historical',
    destination: 'Luxor',
    date: '2026-11-16',
    tripStartTime: '05:00 AM',
    pickupTime: '05:15',
    guestName: 'Martin Vestergaard',
    guestCountry: 'Denmark',
    guestContact: '+45 20 88 14 20 · martin.v@example.dk',
    guestWhatsapp: '+45 20 88 14 20',
    guestEmail: 'martin.v@example.dk',
    guestLang: 'en',
    hotel: 'Oberoi Beach Resort Sahl Hasheesh',
    adults: 2,
    children: 0,
    grossEur: 156,
    supplierName: 'Nile Horizon Guides',
    assignedDriverOrGuide: 'Mona (EN Guide) · Sprinter #4',
    paymentStatus: 'Link sent',
    status: 'Confirmed',
    notes: 'Prefers vegetarian lunch in Luxor',
    createdAtMs: Date.now() - 6 * 60 * 60 * 1000,
  },
  {
    id: 'WT-414',
    tripId: 'hurghada-private-airport-transfer',
    tripTitle: 'Private Hurghada Airport, Marsa Alam & Luxor Transfers',
    category: 'transfers',
    destination: 'Hurghada',
    date: '2026-11-16',
    tripStartTime: 'Flight EZY8831 · 11:45 AM',
    pickupTime: '11:45',
    guestName: 'Claire Beaumont',
    guestCountry: 'France',
    guestContact: '+33 6 44 19 82 10 · claire.b@example.fr',
    guestWhatsapp: '+33 6 44 19 82 10',
    guestEmail: 'claire.b@example.fr',
    guestLang: 'en',
    hotel: 'HRG Terminal 1 -> El Gouna Sheraton',
    adults: 2,
    children: 2,
    grossEur: 36,
    supplierName: 'Wasla City Hosts',
    assignedDriverOrGuide: '',
    paymentStatus: 'Cash on pickup',
    status: 'Pending',
    notes: 'Flight EZY8831 — needs 1 booster seat',
    createdAtMs: Date.now() - (5 * 60 + 30) * 60 * 1000,
  },
  {
    id: 'WT-415',
    tripId: 'eastern-desert-sunset-safari',
    tripTitle: 'Eastern Desert Quad, Buggy & Bedouin Tea at Dusk',
    category: 'desert',
    destination: 'Hurghada',
    date: '2026-11-16',
    tripStartTime: '02:30 PM (Sunset)',
    pickupTime: '14:30',
    guestName: 'Nadia Patel',
    guestCountry: 'UK',
    guestContact: '+44 7700 900412 · nadia.p@example.co.uk',
    guestWhatsapp: '+44 7700 900412',
    guestEmail: 'nadia.p@example.co.uk',
    guestLang: 'en',
    hotel: 'Makadi Bay Kempinski',
    adults: 2,
    children: 0,
    grossEur: 64,
    supplierName: 'Wadi Trail Hurghada',
    assignedDriverOrGuide: 'Ahmed · Buggy Group B',
    paymentStatus: 'Paid online',
    status: 'Confirmed',
    notes: 'Two sisters travelling together — slow scenic pace requested',
    createdAtMs: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'WT-416',
    tripId: 'hurghada-artisan-shopping-tour',
    tripTitle: 'Hurghada Old Souq, Cotton & Spice Shopping with Local Host',
    category: 'shopping',
    destination: 'Hurghada',
    date: '2026-11-10',
    tripStartTime: '04:00 PM (Afternoon)',
    pickupTime: '16:00',
    guestName: 'Lukas Weber',
    guestCountry: 'Austria',
    guestContact: '+43 664 3129088 · lukas.w@example.at',
    guestWhatsapp: '+43 664 3129088',
    guestEmail: 'lukas.w@example.at',
    guestLang: 'de',
    hotel: 'Jasmine Palace Resort',
    adults: 2,
    children: 0,
    grossEur: 44,
    supplierName: 'Wasla City Hosts',
    assignedDriverOrGuide: 'Salma (DE/EN Host)',
    paymentStatus: 'Paid online',
    status: 'Completed',
    notes: 'Looking for fixed-price Egyptian cotton & spices',
    createdAtMs: Date.now() - 48 * 60 * 60 * 1000,
  },
  {
    id: 'WT-417',
    tripId: 'egyptologist-private-guide-multilang',
    tripTitle: 'Licensed Egyptian Guide (All Languages) — Cairo or Luxor',
    category: 'guides',
    destination: 'Cairo',
    date: '2026-11-18',
    tripStartTime: '08:00 AM (Morning)',
    pickupTime: '08:30',
    guestName: 'Sofia Van Dijk',
    guestCountry: 'Netherlands',
    guestContact: '+31 6 12349876 · sofia.vd@example.nl',
    guestWhatsapp: '+31 6 12349876',
    guestEmail: 'sofia.vd@example.nl',
    guestLang: 'en',
    hotel: 'Marriott Mena House Giza',
    adults: 3,
    children: 0,
    grossEur: 95,
    supplierName: 'Nile Horizon Guides',
    assignedDriverOrGuide: '',
    paymentStatus: 'Awaiting link',
    status: 'Pending',
    notes: 'Requested Dutch-speaking Egyptologist for full day at GEM',
    createdAtMs: Date.now() - 35 * 60 * 1000,
  },
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat-1',
    bookingRef: 'WT-412',
    customerName: 'Hannah Lindner',
    customerLang: 'de',
    tripTitle: 'Orange Bay & Giftun Reef Small-Group Boat Day',
    pickupInfo: 'Steigenberger Al Dau Beach · 08:00 lobby pickup · Boat Al-Furat',
    unread: true,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Hallo! Wann genau holt uns der Fahrer morgen im Steigenberger ab? Und gibt es eine Rettungsweste für unsere 7-jährige Tochter?',
        timestamp: '14:12',
      },
    ],
  },
  {
    id: 'chat-2',
    bookingRef: 'WT-414',
    customerName: 'Claire Beaumont',
    customerLang: 'en',
    tripTitle: 'Private Hurghada Airport Transfer',
    pickupInfo: 'HRG Terminal 1 · Flight EZY8831 · 11:45 arrival · Booster seat',
    unread: true,
    messages: [
      {
        id: 'm2',
        sender: 'customer',
        text: 'Hi! Our flight lands 20 minutes later than scheduled. Will the driver still wait at arrivals with a sign?',
        timestamp: '14:28',
      },
    ],
  },
  {
    id: 'chat-3',
    bookingRef: 'WT-417',
    customerName: 'Sofia Van Dijk',
    customerLang: 'en',
    tripTitle: 'Licensed Egyptian Guide — Cairo GEM',
    pickupInfo: 'Marriott Mena House · 08:30 · Requesting Dutch-speaking Egyptologist',
    unread: false,
    messages: [
      {
        id: 'm3',
        sender: 'customer',
        text: 'Do you have a Dutch-speaking Egyptologist free on November 18 for the Grand Egyptian Museum?',
        timestamp: '13:05',
      },
      {
        id: 'm4',
        sender: 'operator',
        text: 'Checking availability with our licensed Cairo guides now — we will confirm within 20 minutes before sending your payment link.',
        timestamp: '13:11',
      },
    ],
  },
  {
    id: 'chat-4',
    bookingRef: 'WT-398',
    customerName: 'Jonas Berg',
    customerLang: 'de',
    tripTitle: 'Eastern Desert Quad & Sunset Safari',
    pickupInfo: 'Makadi Bay Resort · 14:00 pickup · Delayed 25 mins at security gate',
    unread: true,
    messages: [
      {
        id: 'm5',
        sender: 'customer',
        text: 'Hallo, wir haben heute über 25 Minuten vor der Rezeption auf den Fahrer gewartet. Der Fahrer sagte, es gab einen Stau am Makadi Gate, aber wir hätten eine kleine Entschädigung erwartet.',
        timestamp: '14:35',
      },
      {
        id: 'm6',
        sender: 'operator',
        text: 'Es tut uns sehr leid für die 25 Minuten Verspätung am Makadi Gate. Wir prüfen gerade mit dem Anbieter eine Gutschrift von €15 für Sie.',
        timestamp: '14:48',
      },
    ],
  },
  {
    id: 'chat-5',
    bookingRef: 'WT-401',
    customerName: 'Elena Rossi',
    customerLang: 'en',
    tripTitle: 'Orange Bay Small-Group Boat Day',
    pickupInfo: 'Hurghada Marina · Cancelled due to coast guard wind closure',
    unread: false,
    messages: [
      {
        id: 'm7',
        sender: 'customer',
        text: 'Good morning, we heard the marina is closed because of high winds today. Will our €76 payment be refunded automatically?',
        timestamp: '07:50',
      },
      {
        id: 'm8',
        sender: 'operator',
        text: 'Yes Elena, the coast guard closed the marina this morning. We processed your full €76 refund immediately and sent the confirmation email.',
        timestamp: '08:05',
      },
    ],
  },
];

export const INITIAL_COMPLAINTS: ComplaintCase[] = [
  {
    id: 'QC-104',
    bookingRef: 'WT-398',
    customerName: 'Jonas Berg',
    tripTitle: 'Eastern Desert Quad & Sunset Safari',
    issueType: 'Late hotel pickup (25 mins)',
    ownerRole: 'Quality & Refunds Lead',
    severity: 'Medium',
    refundRequestedEur: 15,
    status: 'Investigating',
    summary: 'Driver delayed at previous Makadi Bay security gate. Supplier offered partial goodwill credit.',
    createdAt: '2026-11-12',
  },
  {
    id: 'QC-105',
    bookingRef: 'WT-401',
    customerName: 'Elena Rossi',
    tripTitle: 'Orange Bay Small-Group Boat Day',
    issueType: 'Sea wind cancellation',
    ownerRole: 'Quality & Refunds Lead',
    severity: 'Low',
    refundRequestedEur: 76,
    status: 'Refunded',
    summary: 'Coast guard closed marina due to wind; 100% refund issued automatically before departure.',
    createdAt: '2026-11-11',
  },
];

export const INITIAL_EMAIL_LOGS: PlatformEmailLog[] = [
  {
    id: 'em-1',
    to: 'hannah.l@example.de',
    from: 'booking@waslatravel.com',
    bookingRef: 'WT-412',
    direction: 'outbound',
    subject: 'WT-412 Confirmed — Payment Receipt & Marina Details',
    body: 'Dear Hannah Lindner,\n\nYour Orange Bay & Giftun Reef Small-Group Boat Day (WT-412) is confirmed.\n\nPickup Time: 08:00 AM at Steigenberger Al Dau Beach (Inside Reception)\nDriver / Boat: Driver Tarek · Boat Al-Furat\nNote: Kids life jacket reserved for your 7-year-old daughter.\n\nWarm regards,\nWasla Travel Hurghada Desk',
    type: 'Booking Confirmation',
    sentAt: 'Today · 13:50',
    status: 'Delivered',
  },
  {
    id: 'em-2',
    to: 'martin.v@example.dk',
    from: 'booking@waslatravel.com',
    bookingRef: 'WT-413',
    direction: 'outbound',
    subject: 'WT-413 Payment Link Ready — Luxor Small-Van Day',
    body: 'Dear Martin Vestergaard,\n\nWe confirmed your 2 seats with Nile Horizon Guides for Luxor Temples & Valley of the Kings Small-Van Day (WT-413).\n\nPickup: 05:15 AM at Oberoi Beach Resort Sahl Hasheesh\nGuide: Mona (English-speaking Egyptologist) · Sprinter #4\nVegetarian lunch has been noted for both guests.\n\nPlease complete payment via your official payment link or reply if you prefer cash on pickup.\n\nBest regards,\nWasla Travel Hurghada Desk',
    type: 'Payment Link',
    sentAt: 'Today · 14:05',
    status: 'Delivered',
  },
  {
    id: 'em-3',
    to: 'dispatch@nilehorizon.example',
    from: 'booking@waslatravel.com',
    bookingRef: 'WT-417',
    direction: 'outbound',
    subject: 'New Seat Request WT-417 — Dutch Egyptologist Needed',
    body: 'Hello Nile Horizon Dispatch,\n\nPlease confirm availability of a licensed Dutch-speaking Egyptologist for booking WT-417:\n\nGuest: Sofia Van Dijk (3 Adults)\nDate: 2026-11-18 · Pickup 08:30 AM\nHotel: Marriott Mena House Giza\nService: Full day Grand Egyptian Museum\n\nPlease confirm within 30 minutes so we can finalize with the guest.\n\nThanks,\nWasla Reservations & Dispatch',
    type: 'Supplier Dispatch',
    sentAt: 'Today · 14:20',
    status: 'Delivered',
  },
  {
    id: 'em-4-in',
    to: 'booking@waslatravel.com',
    from: 'jonas.berg@example.de',
    bookingRef: 'WT-398',
    direction: 'inbound',
    subject: 'Complaint WT-398 — 25 Minute Pickup Delay at Makadi Bay',
    body: 'Hello Wasla Travel Team,\n\nWe booked the Eastern Desert Quad & Sunset Safari (Ref: WT-398) for 14:00 pickup at Makadi Bay Resort.\n\nWe stood at the hotel reception from 13:55 until 14:25 without any call or update. When the driver arrived, he explained there was congestion at the Makadi security gate. The safari itself was enjoyable, but waiting 25 minutes in the heat without notification was frustrating.\n\nWe would appreciate a partial goodwill refund of €15.\n\nBest regards,\nJonas Berg',
    type: 'Booking Confirmation',
    sentAt: '2026-11-12 · 14:52',
    status: 'Received',
  },
  {
    id: 'em-4',
    to: 'jonas.berg@example.de',
    from: 'booking@waslatravel.com',
    bookingRef: 'WT-398',
    direction: 'outbound',
    subject: 'WT-398 Case Update — Pickup Delay & €15 Goodwill Credit Review',
    body: 'Dear Jonas Berg,\n\nThank you for writing to us and we sincerely apologize for the 25-minute wait at Makadi Bay reception.\n\nWe have reviewed the gate log with our desert operator and are finalizing your €15 goodwill credit. We will send confirmation as soon as it is approved.\n\nKind regards,\nWasla Travel Quality & Refunds Desk',
    type: 'Booking Confirmation',
    sentAt: '2026-11-12 · 15:10',
    status: 'Delivered',
  },
  {
    id: 'em-5-in',
    to: 'booking@waslatravel.com',
    from: 'elena.rossi@example.it',
    bookingRef: 'WT-401',
    direction: 'inbound',
    subject: 'WT-401 Weather Cancellation — Refund Request (€76)',
    body: 'Good morning,\n\nThe hotel reception just informed us that Hurghada Marina is closed by the coast guard today due to strong winds.\n\nCould you please confirm that our Orange Bay Small-Group Boat Day (WT-401) is cancelled and that our €76 payment will be refunded in full?\n\nThank you,\nElena Rossi',
    type: 'Booking Confirmation',
    sentAt: '2026-11-11 · 07:45',
    status: 'Received',
  },
  {
    id: 'em-5',
    to: 'elena.rossi@example.it',
    from: 'booking@waslatravel.com',
    bookingRef: 'WT-401',
    direction: 'outbound',
    subject: 'WT-401 Full €76 Refund Processed — Sea Wind Cancellation',
    body: 'Dear Elena Rossi,\n\nYes, the Hurghada Coast Guard closed the marina this morning due to high wind speeds.\n\nYour full refund of €76 for booking WT-401 has already been issued back to your original payment method. Please let us know if you would like to reschedule for a calmer day later this week.\n\nWarm regards,\nWasla Travel Quality & Refunds Desk',
    type: 'Booking Confirmation',
    sentAt: '2026-11-11 · 08:12',
    status: 'Delivered',
  },
];

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
    comment: 'Zero souvenir factory detours — our small 8-seat van arrived at Karnak Temple right as the morning golden light hit.',
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
    id: 'rev-marsa-1',
    tripId: 'marsa-alam-abu-dabbab-turtles',
    tripTitle: 'Marsa Alam Abu Dabbab Reef & Sea Turtles Day',
    guestName: 'Lukas Weber',
    guestCountry: 'Austria',
    rating: 5,
    comment: 'Swam right beside two green sea turtles in Abu Dabbab walking straight in from the soft sand beach without needing a boat.',
    visitDate: '2026-11-04',
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
  {
    id: 'rev-shopping-1',
    tripId: 'hurghada-artisan-shopping-tour',
    bookingId: 'WT-416',
    verifiedBooking: true,
    tripTitle: 'Hurghada Old Souq, Cotton & Spice Shopping with Local Host',
    guestName: 'Lukas Weber',
    guestCountry: 'Austria',
    rating: 5,
    comment: 'Transparent fixed prices in El Dahar souq for pure Egyptian cotton and fresh spices with zero pushy sales stops.',
    visitDate: '2026-11-10',
    lang: 'de',
    approvalStatus: 'Approved',
  },
];
