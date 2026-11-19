import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import {
  ActivityCategoryId,
  DestinationRegion,
  SITE_CONFIG,
  Trip,
} from '../../data/marketplaceData';
import {
  BookingStatus,
  ChatThread,
  ComplaintCase,
  PaymentStatus,
  PickupSpot,
  PlatformBooking,
  PlatformEmailLog,
  SupplierProfile,
  getBookingUrgency,
  getPendingAttentionInfo,
  sortBookingsNewestFirst,
} from '../../data/platformData';
import { detectGuestCountry } from '../../lib/nationalityDetect';
import { buildPostTripReviewUrl, copyTextToClipboard } from '../../lib/shareTrip';
import {
  buildGuestPickupMailtoUrl,
  formatWhatsAppDisplay,
  normalizeWhatsAppDigits,
} from '../../lib/whatsapp';
import { CURATED_EGYPT_HOTELS } from '../WaslaHotelMapPicker';

interface OperationsDeskProps {
  bookings: PlatformBooking[];
  trips?: Trip[];
  suppliers: SupplierProfile[];
  chats: ChatThread[];
  complaints: ComplaintCase[];
  emailLogs?: PlatformEmailLog[];
  commissionRate: number;
  whatsappNumber?: string;
  whatsappDisplay?: string;
  contactEmail?: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  soundMuted?: boolean;
  onToggleSound?: () => void;
  onTestAlert?: () => void;
  onLogDispatchEmail?: (
    to: string,
    subject: string,
    type: PlatformEmailLog['type'],
    extra?: {
      body?: string;
      bookingRef?: string;
      from?: string;
      direction?: 'inbound' | 'outbound';
    }
  ) => void;
  onCreateBooking?: (booking: PlatformBooking) => Promise<void> | void;
  onUpdateBooking: (id: string, patch: Partial<PlatformBooking>) => void;
  onSendChatMessage: (threadId: string, text: string) => void;
  onCreateChat?: (chat: ChatThread) => void;
  onUpdateComplaint: (id: string, patch: Partial<ComplaintCase>) => void;
}

type OpsTab = 'sheet' | 'chat' | 'quality' | 'directory';
type DispatchTemplateId = 'welcome' | 'pickup' | 'payment' | 'custom';

function formatBookedTimestamp(
  createdAtMs: number | undefined,
  nowMs: number,
  isAr: boolean
): { clock: string; date: string; relative: string } {
  if (!createdAtMs || createdAtMs <= 0) {
    return { clock: '—', date: '', relative: '' };
  }
  const d = new Date(createdAtMs);
  const locale = isAr ? 'ar-EG' : 'en-GB';
  const clock = d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const date = d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  });
  const diffMins = Math.max(0, Math.floor((nowMs - createdAtMs) / 60000));
  let relative = '';
  if (diffMins < 1) {
    relative = isAr ? 'الآن' : 'Just now';
  } else if (diffMins < 60) {
    relative = isAr ? `منذ ${diffMins} د` : `${diffMins}m ago`;
  } else if (diffMins < 24 * 60) {
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    relative = isAr ? `منذ ${h} س${m > 0 ? ` ${m} د` : ''}` : `${h}h ${m}m ago`;
  } else {
    const days = Math.floor(diffMins / (24 * 60));
    relative = isAr ? `منذ ${days} يوم` : `${days}d ago`;
  }
  return { clock, date, relative };
}

function buildDispatchEmailTemplate(
  templateId: DispatchTemplateId,
  b: PlatformBooking,
  isAr: boolean
): { subject: string; body: string; logType: PlatformEmailLog['type'] } {
  const spotLabel =
    b.pickupSpot === 'Outside Main Gate'
      ? isAr
        ? 'أمام البوابة الرئيسية للفندق'
        : 'Outside Main Gate'
      : isAr
      ? 'الريسبشن الداخلي للفندق'
      : 'Inside Hotel Reception';

  if (templateId === 'welcome') {
    return {
      logType: 'Booking Confirmation',
      subject: isAr
        ? `استلام طلب حجزك ${b.id} — ${b.tripTitle}`
        : `Booking Request Received (${b.id}) — ${b.tripTitle}`,
      body: isAr
        ? `مرحباً ${b.guestName}،\n\nشكرًا لتواصلك مع وصلة ترافل. استلمنا طلب حجزك رقم ${b.id} لرحلة "${b.tripTitle}" بتاريخ ${b.date} (${b.adults} بالغين${b.children > 0 ? ` + ${b.children} أطفال` : ''}).\n\nنقوم حالياً بتأكيد المقاعد مع المشغّل المحلي في ${b.destination} وسنعود إليك بالتأكيد النهائي خلال وقت قصير.\n\nمع التحية،\nفريق الحجوزات والتشغيل — وصلة ترافل`
        : `Dear ${b.guestName},\n\nThank you for booking with Wasla Travel. We have received your request (${b.id}) for "${b.tripTitle}" on ${b.date} (${b.adults} adults${b.children > 0 ? ` + ${b.children} children` : ''}).\n\nWe are verifying seat availability with our local operator in ${b.destination} and will send your final confirmation shortly.\n\nWarm regards,\nWasla Travel Reservations Desk`,
    };
  }

  if (templateId === 'pickup') {
    return {
      logType: 'Booking Confirmation',
      subject: isAr
        ? `تأكيد موعد البيك أب — ${b.id} (${b.date})`
        : `Hotel Pickup Confirmation — ${b.id} (${b.date})`,
      body: isAr
        ? `مرحباً ${b.guestName}،\n\nتم تأكيد تفاصيل التحرك والبيك أب لحجزك رقم ${b.id}:\n\n• الرحلة: ${b.tripTitle}\n• التاريخ: ${b.date}${b.tripStartTime ? `\n• بداية الرحلة: ${b.tripStartTime}` : ''}\n• موعد البيك أب: ${b.pickupTime || 'يُحدد'}\n• الفندق: ${b.hotel}${b.roomNumber ? ` (غرفة ${b.roomNumber})` : ''}\n• نقطة اللقاء: ${spotLabel}\n• السائق / المرشد: ${b.assignedDriverOrGuide || 'سيتم إرساله قبل الموعد'}\n\nيرجى التواجد قبل الموعد بـ 10 دقائق.\n\nمع التحية،\nفريق الحجوزات والتشغيل — وصلة ترافل`
        : `Dear ${b.guestName},\n\nYour hotel pickup details for booking ${b.id} are confirmed:\n\n• Excursion: ${b.tripTitle}\n• Date: ${b.date}${b.tripStartTime ? `\n• Trip Start: ${b.tripStartTime}` : ''}\n• Hotel Pickup Time: ${b.pickupTime || 'TBD'}\n• Hotel: ${b.hotel}${b.roomNumber ? ` (Room ${b.roomNumber})` : ''}\n• Meeting Point: ${spotLabel}\n• Driver / Guide: ${b.assignedDriverOrGuide || 'Assigned prior to pickup'}\n\nPlease be ready 10 minutes before pickup.\n\nWarm regards,\nWasla Travel Reservations Desk`,
    };
  }

  if (templateId === 'payment') {
    return {
      logType: 'Payment Link',
      subject: isAr
        ? `تأكيد الدفع — حجز ${b.id} (€${b.grossEur})`
        : `Payment Confirmation & Options — ${b.id} (€${b.grossEur})`,
      body: isAr
        ? `مرحباً ${b.guestName}،\n\nتم تأكيد الإتاحة لرحلتك "${b.tripTitle}" (${b.id}) بتاريخ ${b.date}.\n\nإجمالي المبلغ: €${b.grossEur}\nطريقة الدفع المسجلة: ${b.paymentStatus}\n\nيمكنك الدفع كاش عند التحرك (Cash on pickup) أو إعلامنا لإرسال رابط الدفع الرسمي الخاص بك.\n\nمع التحية،\nفريق الحجوزات والتشغيل — وصلة ترافل`
        : `Dear ${b.guestName},\n\nAvailability is confirmed for "${b.tripTitle}" (${b.id}) on ${b.date}.\n\nTotal Amount: €${b.grossEur}\nCurrent Payment Method: ${b.paymentStatus}\n\nYou may pay Cash on pickup or reply to request your official payment link.\n\nWarm regards,\nWasla Travel Reservations Desk`,
    };
  }

  return {
    logType: 'Booking Confirmation',
    subject: isAr ? `متابعة بخصوص حجزك ${b.id}` : `Update Regarding Your Booking ${b.id}`,
    body: isAr ? `مرحباً ${b.guestName}،\n\n` : `Dear ${b.guestName},\n\n`,
  };
}

function parsePickupTimeParts(raw: string): { clock: string; period: 'AM' | 'PM' } {
  const cleaned = (raw || '').trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) return { clock: '08:30', period: 'AM' };
  let h = Number(match[1]);
  const m = match[2];
  let period: 'AM' | 'PM' = (match[3] as 'AM' | 'PM' | undefined) || (h >= 12 ? 'PM' : 'AM');
  if (!match[3]) {
    if (h === 0) {
      h = 12;
      period = 'AM';
    } else if (h > 12) {
      h -= 12;
      period = 'PM';
    }
  } else if (h === 0) {
    h = 12;
  } else if (h > 12) {
    h -= 12;
  }
  return { clock: `${String(h).padStart(2, '0')}:${m}`, period };
}

function formatPickupTime(clock: string, period: 'AM' | 'PM'): string {
  const safe = (clock || '08:30').trim();
  return `${safe} ${period}`;
}

function compressBookingImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const tryEncode = (maxW: number, q: number): string => {
          const scale = img.width > maxW ? maxW / img.width : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) return '';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', q);
        };
        let encoded = '';
        for (const [w, q] of [
          [800, 0.7],
          [680, 0.56],
          [520, 0.45],
        ] as Array<[number, number]>) {
          encoded = tryEncode(w, q);
          if (encoded && encoded.length <= 220000) break;
        }
        resolve(encoded);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const OperationsDesk: React.FC<OperationsDeskProps> = ({
  bookings,
  trips = [],
  suppliers,
  chats,
  complaints,
  emailLogs = [],
  commissionRate: _commissionRate,
  whatsappNumber,
  whatsappDisplay,
  contactEmail,
  darkMode: _darkMode = false,
  onToggleDarkMode: _onToggleDarkMode,
  soundMuted: _soundMuted = false,
  onToggleSound: _onToggleSound,
  onTestAlert: _onTestAlert,
  onLogDispatchEmail,
  onCreateBooking,
  onUpdateBooking,
  onSendChatMessage,
  onCreateChat,
  onUpdateComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<OpsTab>('sheet');
  const [workspaceLang, setWorkspaceLang] = useState<'ar' | 'en'>('en');
  const [commsSubView, setCommsSubView] = useState<'chats' | 'dispatch'>('chats');
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Guest Email Dispatch Composer & Email Reader Modal state
  const [dispatchBookingId, setDispatchBookingId] = useState<string>('');
  const [dispatchTemplate, setDispatchTemplate] = useState<DispatchTemplateId>('welcome');
  const [dispatchSubject, setDispatchSubject] = useState<string>('');
  const [dispatchBody, setDispatchBody] = useState<string>('');
  const [dispatchSentToast, setDispatchSentToast] = useState<string>('');
  const [readingEmail, setReadingEmail] = useState<PlatformEmailLog | null>(null);

  // Partner Operational Sheet Modal state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Filters & multi-select state for Booking Sheet
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'attention'>('all');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  // Add / Ticket / Edit Booking Modal state
  const [modalMode, setModalMode] = useState<'ticket' | 'create' | 'edit' | null>(null);
  const [modalDraft, setModalDraft] = useState<PlatformBooking | null>(null);
  const [pickupClock, setPickupClock] = useState('08:30');
  const [pickupPeriod, setPickupPeriod] = useState<'AM' | 'PM'>('AM');
  const [savingBooking, setSavingBooking] = useState(false);
  const [confirmCancelStep, setConfirmCancelStep] = useState(false);
  const [uploadingLocImage, setUploadingLocImage] = useState(false);
  const locImageInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);

  const handleCopyReviewLink = async (booking: PlatformBooking) => {
    if (!booking.tripId || booking.tripId === 'custom-itinerary') return;
    const url = buildPostTripReviewUrl(booking.tripId, booking.id);
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedReviewId(booking.id);
      window.setTimeout(() => {
        setCopiedReviewId((prev) => (prev === booking.id ? null : prev));
      }, 2200);
    }
  };

  const isBookingFinishedForReview = (booking: PlatformBooking) => {
    if (!booking.tripId || booking.tripId === 'custom-itinerary') return false;
    if (booking.status === 'Completed') return true;
    if (['Confirmed', 'Driver assigned'].includes(booking.status) && booking.date) {
      const endMs = new Date(`${booking.date}T23:59:59Z`).getTime();
      return !Number.isNaN(endMs) && Date.now() >= endMs;
    }
    return false;
  };

  // Chat & AI assistant state
  const [selectedThreadId, setSelectedThreadId] = useState<string>(chats[0]?.id ?? '');
  const [chatSearch, setChatSearch] = useState('');
  const [composerText, setComposerText] = useState('');
  const [replyLangOverride, setReplyLangOverride] = useState<string>('auto');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiDraftMeta, setAiDraftMeta] = useState<{ lang: string; note: string } | null>(null);
  const [expandedTranslations, setExpandedTranslations] = useState<Record<string, boolean>>({});
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});
  const [translationErrors, setTranslationErrors] = useState<Record<string, string>>({});

  // Complaint case conversation & interactive email/chat reader state
  const [openComplaintId, setOpenComplaintId] = useState<string | null>(
    complaints[0]?.id ?? null
  );
  const [complaintChannelTab, setComplaintChannelTab] = useState<
    Record<string, 'all' | 'whatsapp' | 'email'>
  >({});
  const [complaintSelectedItem, setComplaintSelectedItem] = useState<
    Record<string, { kind: 'chat' } | { kind: 'email'; emailId: string }>
  >({});
  const [complaintReplyText, setComplaintReplyText] = useState<Record<string, string>>({});
  const [complaintReplyLang, setComplaintReplyLang] = useState<Record<string, string>>({});
  const [complaintAiLoading, setComplaintAiLoading] = useState<Record<string, boolean>>({});
  const [complaintAiNote, setComplaintAiNote] = useState<Record<string, string>>({});
  const [complaintAiError, setComplaintAiError] = useState<Record<string, string>>({});
  const [complaintSentNotice, setComplaintSentNotice] = useState<Record<string, string>>({});

  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const openCreateModal = () => {
    const firstTrip = trips[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    setModalMode('create');
    setConfirmCancelStep(false);
    setPickupClock('08:30');
    setPickupPeriod('AM');
    setModalDraft({
      id: `WT-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(10 + Math.random() * 89)}`,
      tripId: firstTrip?.id || 'custom-itinerary',
      tripTitle: firstTrip?.name.en || '',
      category: firstTrip?.category || 'sea',
      destination: firstTrip?.destination || 'Hurghada',
      date: tomorrow,
      tripStartTime: firstTrip?.departureTimes?.[0] || '09:00 AM',
      pickupTime: '08:30 AM',
      pickupSpot: 'Inside Reception',
      guestName: '',
      guestCountry: 'Guest',
      guestWhatsapp: '+20',
      guestEmail: '',
      guestContact: '',
      guestLang: 'en',
      hotel: '',
      roomNumber: '',
      locationImageUrl: '',
      adults: 2,
      children: 0,
      infants: 0,
      grossEur: firstTrip?.price ? firstTrip.price * 2 : 80,
      supplierName: firstTrip?.supplierName || suppliers[0]?.name || 'Captain Karim Marine',
      assignedDriverOrGuide: '',
      paymentStatus: 'Awaiting link',
      status: 'Confirmed',
      notes: '',
    });
  };

  const openBookingModal = (booking: PlatformBooking, mode: 'ticket' | 'edit' = 'ticket') => {
    const parsed = parsePickupTimeParts(booking.pickupTime);
    setModalMode(mode);
    setConfirmCancelStep(false);
    setPickupClock(parsed.clock);
    setPickupPeriod(parsed.period);
    setModalDraft({
      ...booking,
      guestCountry: booking.guestCountry || 'Guest',
      pickupSpot: booking.pickupSpot || 'Inside Reception',
      roomNumber: booking.roomNumber || '',
      locationImageUrl: booking.locationImageUrl || '',
      guestWhatsapp:
        booking.guestWhatsapp ||
        (booking.guestContact && !booking.guestContact.includes('@') ? booking.guestContact : ''),
      guestEmail:
        booking.guestEmail ||
        (booking.guestContact && booking.guestContact.includes('@') ? booking.guestContact : ''),
    });
  };

  const openBookingTicket = (booking: PlatformBooking) => {
    openBookingModal(booking, 'ticket');
  };

  const handleSaveBookingModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDraft || !modalMode || savingBooking) return;
    setSavingBooking(true);
    const formattedPickup = formatPickupTime(pickupClock, pickupPeriod);
    const cleanWa = (modalDraft.guestWhatsapp || '').trim();
    const cleanEmail = (modalDraft.guestEmail || '').trim();
    const primaryContact = cleanWa || cleanEmail || modalDraft.guestContact || 'N/A';

    const finalized: PlatformBooking = {
      ...modalDraft,
      tripTitle: modalDraft.tripTitle.trim() || 'Custom Excursion',
      guestName: modalDraft.guestName.trim() || 'Guest',
      guestCountry: detectGuestCountry({
        whatsapp: cleanWa,
        notes: modalDraft.notes,
        existingCountry: modalDraft.guestCountry,
      }),
      hotel: modalDraft.hotel.trim() || 'Hurghada Hotel',
      roomNumber: (modalDraft.roomNumber || '').trim(),
      locationImageUrl: (modalDraft.locationImageUrl || '').trim(),
      pickupTime: formattedPickup,
      pickupSpot: modalDraft.pickupSpot || 'Inside Reception',
      guestWhatsapp: cleanWa,
      guestEmail: cleanEmail,
      guestContact: primaryContact,
      adults: Math.max(1, Math.round(Number(modalDraft.adults) || 1)),
      children: Math.max(0, Math.round(Number(modalDraft.children) || 0)),
      infants: Math.max(0, Math.round(Number(modalDraft.infants) || 0)),
      grossEur: Math.max(0, Math.round(Number(modalDraft.grossEur) || 0)),
    };

    try {
      if (modalMode === 'create' && onCreateBooking) {
        await onCreateBooking(finalized);
        setModalMode(null);
        setModalDraft(null);
      } else if (modalMode === 'edit') {
        onUpdateBooking(finalized.id, {
          tripTitle: finalized.tripTitle,
          category: finalized.category,
          destination: finalized.destination,
          date: finalized.date,
          tripStartTime: finalized.tripStartTime?.trim() || undefined,
          pickupTime: finalized.pickupTime,
          pickupSpot: finalized.pickupSpot,
          guestName: finalized.guestName,
          guestCountry: finalized.guestCountry,
          guestWhatsapp: finalized.guestWhatsapp,
          guestEmail: finalized.guestEmail,
          guestContact: finalized.guestContact,
          hotel: finalized.hotel,
          roomNumber: finalized.roomNumber,
          locationImageUrl: finalized.locationImageUrl,
          adults: finalized.adults,
          children: finalized.children,
          infants: finalized.infants,
          grossEur: finalized.grossEur,
          supplierName: finalized.supplierName,
          assignedDriverOrGuide: finalized.assignedDriverOrGuide,
          paymentStatus: finalized.paymentStatus,
          status: finalized.status,
          notes: finalized.notes,
        });
        setModalDraft(finalized);
        setModalMode('ticket');
      }
    } finally {
      setSavingBooking(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedBookings = useMemo(() => sortBookingsNewestFirst(bookings), [bookings]);

  const attentionBookingsCount = useMemo(
    () => sortedBookings.filter((b) => getPendingAttentionInfo(b, nowMs).needsAttention).length,
    [sortedBookings, nowMs]
  );

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedBookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (urgencyFilter !== 'all') {
        const urg = getBookingUrgency(b);
        const attn = getPendingAttentionInfo(b, nowMs);
        if (urgencyFilter === 'urgent' && !urg.isUrgent) return false;
        if (urgencyFilter === 'attention' && !attn.needsAttention) return false;
        if (urgencyFilter === 'normal' && (urg.isUrgent || attn.needsAttention)) return false;
      }
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (supplierFilter !== 'all' && b.supplierName !== supplierFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (!q) return true;
      return [
        b.id,
        b.tripTitle,
        b.guestName,
        b.hotel,
        b.supplierName,
        b.assignedDriverOrGuide,
        b.destination,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [sortedBookings, query, statusFilter, urgencyFilter, categoryFilter, supplierFilter, dateFilter, nowMs]);

  const selectedBookingsForCsv = useMemo(
    () => sortedBookings.filter((b) => selectedBookingIds.includes(b.id)),
    [sortedBookings, selectedBookingIds]
  );

  const allFilteredSelected =
    filteredBookings.length > 0 &&
    filteredBookings.every((b) => selectedBookingIds.includes(b.id));

  const toggleSelectBooking = (bookingId: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredBookings.map((b) => b.id));
      setSelectedBookingIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([...selectedBookingIds, ...filteredBookings.map((b) => b.id)]);
      setSelectedBookingIds(Array.from(merged));
    }
  };

  const handleDownloadCsv = () => {
    const targetBookings =
      selectedBookingsForCsv.length > 0 ? selectedBookingsForCsv : filteredBookings;

    const headers = [
      'Ref',
      'Urgency',
      'Date',
      'Trip Start Time',
      'Hotel Pickup Time',
      'Pickup Spot',
      'Trip / Service',
      'Category',
      'Destination',
      'Guest Name',
      'Nationality',
      'Guest WhatsApp',
      'Guest Email',
      'Hotel / Pickup',
      'Adults',
      'Children',
      'Infants (INF)',
      'Customer Selling Price EUR',
      'Payment Status',
      'Booking Status',
      'Supplier',
      'Driver / Guide',
      'Notes',
    ];

    const escapeCell = (val: string | number) => {
      const s = String(val ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = targetBookings.map((b) => {
      const urg = getBookingUrgency(b);
      const attn = getPendingAttentionInfo(b, nowMs);
      const urgencyCsvLabel = attn.needsAttention
        ? `${urg.label} | Attention Required (${attn.elapsedLabel})`
        : urg.label;
      return [
        b.id,
        urgencyCsvLabel,
        b.date,
        b.tripStartTime || '',
        b.pickupTime,
        b.pickupSpot || 'Inside Reception',
        b.tripTitle,
        b.category,
        b.destination,
        b.guestName,
        b.guestCountry || '',
        b.guestWhatsapp || b.guestContact,
        b.guestEmail || '',
        b.hotel,
        b.adults,
        b.children,
        b.infants ?? 0,
        b.grossEur,
        b.paymentStatus,
        b.status,
        b.supplierName,
        b.assignedDriverOrGuide,
        b.notes,
      ]
        .map(escapeCell)
        .join(',');
    });

    const csv = [headers.map(escapeCell).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const suffix =
      selectedBookingsForCsv.length > 0
        ? `selected-${selectedBookingsForCsv.length}`
        : dateFilter || 'all';
    link.download = `wasla-bookings-${suffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeThread = chats.find((c) => c.id === selectedThreadId) || chats[0];

  const matchedBooking = useMemo(
    () =>
      activeThread
        ? bookings.find((b) => b.id.toLowerCase() === activeThread.bookingRef.toLowerCase())
        : undefined,
    [bookings, activeThread]
  );

  const filteredChats = useMemo(() => {
    const q = chatSearch.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((t) =>
      [t.customerName, t.bookingRef, t.tripTitle, t.pickupInfo, t.customerLang]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [chats, chatSearch]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeTab, activeThread?.id, activeThread?.messages.length]);

  useEffect(() => {
    setAiDraftMeta(null);
    setAiError('');
    setReplyLangOverride('auto');
  }, [activeThread?.id]);

  const handleDraftWithAi = async () => {
    if (!activeThread) return;
    const exactOperatorText = composerText.trim();
    setAiLoading(true);
    setAiError('');
    setAiDraftMeta(null);
    const lastCustomerMsg =
      [...activeThread.messages].reverse().find((m) => m.sender === 'customer')?.text || '';

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: activeThread.customerName,
          language: activeThread.customerLang,
          ...(replyLangOverride !== 'auto' ? { targetLanguageOverride: replyLangOverride } : {}),
          bookingRef: activeThread.bookingRef,
          tripTitle: matchedBooking?.tripTitle || activeThread.tripTitle,
          pickupInfo: activeThread.pickupInfo,
          latestMessage: lastCustomerMsg,
          conversationHistory: activeThread.messages,
          bookingContext: matchedBooking
            ? {
                bookingRef: matchedBooking.id,
                tripTitle: matchedBooking.tripTitle,
                date: matchedBooking.date,
                tripStartTime: matchedBooking.tripStartTime || '',
                pickupTime: matchedBooking.pickupTime,
                pickupSpot: matchedBooking.pickupSpot || 'Inside Reception',
                hotel: matchedBooking.hotel,
                roomNumber: matchedBooking.roomNumber,
                guestCountry: matchedBooking.guestCountry,
                adults: matchedBooking.adults,
                children: matchedBooking.children,
                infants: matchedBooking.infants ?? 0,
                assignedDriverOrGuide: matchedBooking.assignedDriverOrGuide,
                status: matchedBooking.status,
                paymentStatus: matchedBooking.paymentStatus,
                guestSellingPriceEur: matchedBooking.grossEur,
                notes: matchedBooking.notes,
              }
            : null,
          operatorIntent: exactOperatorText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'Could not generate AI reply.');
      } else if (data.draft) {
        setComposerText(data.draft);
        setAiDraftMeta({
          lang: data.targetLanguage || activeThread.customerLang.toUpperCase(),
          note:
            data.operatorNote ||
            `تم تجهيز الرد (${(data.targetLanguage || activeThread.customerLang).toUpperCase()})`,
        });
        window.setTimeout(() => composerRef.current?.focus(), 60);
      }
    } catch {
      setAiError('Network error contacting /api/assistant.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !composerText.trim()) return;
    onSendChatMessage(activeThread.id, composerText.trim());
    setComposerText('');
    setAiDraftMeta(null);
  };

  const handleToggleMessageTranslation = async (
    msgId: string,
    text: string,
    sourceLang?: string
  ) => {
    const isCurrentlyOpen = !!expandedTranslations[msgId];
    if (isCurrentlyOpen) {
      setExpandedTranslations((prev) => ({ ...prev, [msgId]: false }));
      return;
    }
    setExpandedTranslations((prev) => ({ ...prev, [msgId]: true }));
    if (translatedMessages[msgId]) return;

    setTranslatingIds((prev) => ({ ...prev, [msgId]: true }));
    setTranslationErrors((prev) => {
      const next = { ...prev };
      delete next[msgId];
      return next;
    });
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: sourceLang || 'auto',
          targetLang: 'ar',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.translation) {
        setTranslationErrors((prev) => ({
          ...prev,
          [msgId]: data.error || 'تعذر ترجمة الرسالة.',
        }));
      } else {
        setTranslatedMessages((prev) => ({
          ...prev,
          [msgId]: data.translation,
        }));
      }
    } catch {
      setTranslationErrors((prev) => ({
        ...prev,
        [msgId]: 'تعذر الاتصال بالسيرفر للترجمة.',
      }));
    } finally {
      setTranslatingIds((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  const getComplaintCaseContext = (c: ComplaintCase) => {
    const cleanRef = c.bookingRef.trim().toLowerCase();
    const cleanName = c.customerName.trim().toLowerCase();
    const nameTokens = cleanName
      .split(/\s+/)
      .filter((part) => part.length >= 3);

    const linkedBooking =
      bookings.find((b) => b.id.toLowerCase() === cleanRef) ||
      bookings.find((b) => b.guestName.toLowerCase() === cleanName);

    const linkedChat =
      chats.find((ch) => ch.bookingRef.toLowerCase() === cleanRef) ||
      chats.find((ch) => ch.customerName.toLowerCase() === cleanName);

    const linkedEmails = emailLogs.filter((log) => {
      const sub = log.subject.toLowerCase();
      const to = log.to.toLowerCase();
      if (cleanRef && sub.includes(cleanRef)) return true;
      if (linkedBooking?.guestEmail && to === linkedBooking.guestEmail.toLowerCase()) return true;
      if (nameTokens.length > 0 && nameTokens.every((t) => to.includes(t) || sub.includes(t))) {
        return true;
      }
      return false;
    });

    return { linkedBooking, linkedChat, linkedEmails };
  };

  const handleComplaintSmartDraft = async (c: ComplaintCase) => {
    const { linkedBooking, linkedChat } = getComplaintCaseContext(c);
    const exactText = (complaintReplyText[c.id] || '').trim();
    const langOverride = complaintReplyLang[c.id] || 'auto';
    const defaultLang = linkedChat?.customerLang || linkedBooking?.guestLang || 'en';
    const lastCustomerMsg =
      (linkedChat
        ? [...linkedChat.messages].reverse().find((m) => m.sender === 'customer')?.text
        : '') || `${c.issueType}: ${c.summary}`;

    setComplaintAiLoading((prev) => ({ ...prev, [c.id]: true }));
    setComplaintAiError((prev) => ({ ...prev, [c.id]: '' }));
    setComplaintAiNote((prev) => ({ ...prev, [c.id]: '' }));

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: c.customerName,
          language: defaultLang,
          ...(langOverride !== 'auto' ? { targetLanguageOverride: langOverride } : {}),
          bookingRef: c.bookingRef,
          tripTitle: c.tripTitle,
          pickupInfo: linkedBooking
            ? `${linkedBooking.hotel} · ${linkedBooking.date} · ${linkedBooking.pickupTime}`
            : c.summary,
          latestMessage: lastCustomerMsg,
          conversationHistory: linkedChat?.messages || [],
          bookingContext: linkedBooking
            ? {
                bookingRef: linkedBooking.id,
                tripTitle: linkedBooking.tripTitle,
                date: linkedBooking.date,
                pickupTime: linkedBooking.pickupTime,
                hotel: linkedBooking.hotel,
                status: linkedBooking.status,
                paymentStatus: linkedBooking.paymentStatus,
                grossEur: linkedBooking.grossEur,
                complaintSummary: c.summary,
                refundRequestedEur: c.refundRequestedEur,
              }
            : {
                bookingRef: c.bookingRef,
                tripTitle: c.tripTitle,
                complaintId: c.id,
                issueType: c.issueType,
                complaintSummary: c.summary,
                refundRequestedEur: c.refundRequestedEur,
              },
          operatorIntent: exactText,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.draft) {
        setComplaintAiError((prev) => ({
          ...prev,
          [c.id]: data.error || 'تعذر تجهيز الرد الذكي.',
        }));
      } else {
        setComplaintReplyText((prev) => ({ ...prev, [c.id]: data.draft }));
        setComplaintAiNote((prev) => ({
          ...prev,
          [c.id]:
            data.operatorNote ||
            `تم تجهيز الرد (${String(data.targetLanguage || defaultLang).toUpperCase()})`,
        }));
      }
    } catch {
      setComplaintAiError((prev) => ({
        ...prev,
        [c.id]: 'تعذر الاتصال بالسيرفر.',
      }));
    } finally {
      setComplaintAiLoading((prev) => ({ ...prev, [c.id]: false }));
    }
  };

  const handleSendComplaintChatReply = (c: ComplaintCase) => {
    const text = (complaintReplyText[c.id] || '').trim();
    if (!text) return;
    const { linkedBooking, linkedChat } = getComplaintCaseContext(c);

    if (linkedChat) {
      onSendChatMessage(linkedChat.id, text);
    } else if (onCreateChat) {
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      onCreateChat({
        id: `chat-${Date.now()}`,
        bookingRef: c.bookingRef,
        customerName: c.customerName,
        customerLang: linkedBooking?.guestLang || 'en',
        tripTitle: c.tripTitle,
        pickupInfo: linkedBooking
          ? `${linkedBooking.hotel} · ${linkedBooking.date} · ${linkedBooking.pickupTime}`
          : `${c.issueType} · ${c.id}`,
        unread: true,
        messages: [
          {
            id: `m-${Date.now()}`,
            sender: 'operator',
            text,
            timestamp,
          },
        ],
      });
    }

    setComplaintReplyText((prev) => ({ ...prev, [c.id]: '' }));
    setComplaintAiNote((prev) => ({ ...prev, [c.id]: '' }));
    setComplaintSentNotice((prev) => ({
      ...prev,
      [c.id]: 'تم إرسال وحفظ الرسالة في محادثة العميل.',
    }));
    window.setTimeout(() => {
      setComplaintSentNotice((prev) => ({ ...prev, [c.id]: '' }));
    }, 3000);
  };

  const handleSendComplaintEmail = (c: ComplaintCase) => {
    const { linkedBooking, linkedEmails } = getComplaintCaseContext(c);
    const recipient =
      linkedBooking?.guestEmail ||
      linkedEmails.find((e) => !e.to.includes('dispatch@'))?.to ||
      '';
    const subject = `${c.bookingRef} Case Update (${c.id}) — ${c.issueType}`;
    const bodyText =
      (complaintReplyText[c.id] || '').trim() ||
      `Dear ${c.customerName},\n\nRegarding booking ${c.bookingRef} (${c.tripTitle}):\n${c.summary}\n\nBest regards,\nWasla Travel Quality & Operations`;

    if (onLogDispatchEmail) {
      onLogDispatchEmail(recipient || `${c.customerName} (${c.bookingRef})`, subject, 'Booking Confirmation');
    }

    const mailtoHref = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyText)}`;
    const link = document.createElement('a');
    link.href = mailtoHref;
    link.click();

    setComplaintSentNotice((prev) => ({
      ...prev,
      [c.id]: recipient
        ? `تم فتح تطبيق الإيميل وتسجيل الإيميل إلى ${recipient}.`
        : 'تم فتح مسودة الإيميل وتسجيلها في سجل الشكوى.',
    }));
    window.setTimeout(() => {
      setComplaintSentNotice((prev) => ({ ...prev, [c.id]: '' }));
    }, 3500);
  };

  const statusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
      case 'Driver assigned':
      case 'Completed':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'Confirmed':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]';
      case 'Pending':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'Refunded':
      case 'Cancelled':
      case 'No show':
        return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
    }
  };

  const isAr = workspaceLang === 'ar';
  const liveWaDigits = normalizeWhatsAppDigits(whatsappNumber || SITE_CONFIG.whatsappNumber);
  const liveWaDisplay = whatsappDisplay || formatWhatsAppDisplay(liveWaDigits);
  const liveDeskEmail = contactEmail || SITE_CONFIG.email;

  const urgentPickupsCount = useMemo(
    () =>
      bookings.filter((b) => {
        if (b.status === 'Cancelled' || b.status === 'Refunded' || b.status === 'No show' || b.status === 'Completed') {
          return false;
        }
        const lvl = getBookingUrgency(b).level;
        return lvl === 'today' || lvl === 'tomorrow';
      }).length,
    [bookings]
  );

  const unassignedDriversCount = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (b.status === 'Pending' || b.status === 'Confirmed') &&
          !(b.assignedDriverOrGuide || '').trim()
      ).length,
    [bookings]
  );

  const unreadChatsCount = useMemo(() => chats.filter((c) => c.unread).length, [chats]);
  const openComplaintsCount = useMemo(
    () => complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Refunded').length,
    [complaints]
  );

  const upcomingQuickContactBookings = useMemo(
    () =>
      sortBookingsNewestFirst(bookings)
        .filter((b) => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Driver assigned')
        .slice(0, 12),
    [bookings]
  );

  const filteredDirectorySuppliers = useMemo(() => {
    const q = directoryQuery.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [suppliers, directoryQuery]);

  const handleCopyDeskItem = async (key: string, value: string) => {
    await copyTextToClipboard(value);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#F8FAFC] text-[#0F172A]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 space-y-6">
        {/* Clean Full-Width Executive Header + 4-Workspace Navigation */}
        <header className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
          <div
            className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0]"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] tabular-nums">
                <span className="font-semibold text-[#0F172A]">{SITE_CONFIG.domain}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {isAr
                    ? `${bookings.length} إجمالي الحجوزات · ${urgentPickupsCount} اليوم/غداً`
                    : `${bookings.length} total bookings · ${urgentPickupsCount} today/tomorrow`}
                </span>
                <span aria-hidden="true">·</span>
                <span className={attentionBookingsCount > 0 ? 'font-semibold text-[#B45309]' : ''}>
                  {attentionBookingsCount > 0
                    ? isAr
                      ? `${attentionBookingsCount} حجز متأخر (> 4 ساعات)`
                      : `${attentionBookingsCount} attention required (> 4h)`
                    : isAr
                    ? 'جميع الطلبات ضمن وقت الاستجابة'
                    : 'All requests within 4h SLA'}
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                {isAr ? 'مركز الحجوزات والتشغيل' : 'Reservations & Dispatch'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Global Workspace Language Switch */}
              <div
                className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5 text-xs font-semibold"
                role="group"
                aria-label="Workspace language"
              >
                <button
                  type="button"
                  onClick={() => setWorkspaceLang('ar')}
                  className={`rounded-md px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isAr ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceLang('en')}
                  className={`rounded-md px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    !isAr ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  English
                </button>
              </div>

              {onCreateBooking && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#EA580C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C2410C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'إضافة حجز جديد' : 'Add Booking'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {selectedBookingsForCsv.length > 0
                    ? isAr
                      ? `تصدير المحدد (${selectedBookingsForCsv.length})`
                      : `Export Selected (${selectedBookingsForCsv.length})`
                    : isAr
                    ? `تصدير CSV (${filteredBookings.length})`
                    : `Export CSV (${filteredBookings.length})`}
                </span>
              </button>
            </div>
          </div>

          {/* 4 Purpose-Built Horizontal Workspace Tabs */}
          <nav
            aria-label="Reservations and dispatch workspaces"
            className="px-4 sm:px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#F8FAFC]/70"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {[
              {
                id: 'sheet' as OpsTab,
                icon: FileSpreadsheet,
                label: isAr ? 'الحجوزات والتوصيل' : 'Bookings & Dispatch',
                count: attentionBookingsCount > 0 ? attentionBookingsCount : bookings.length,
                urgent: attentionBookingsCount > 0,
              },
              {
                id: 'chat' as OpsTab,
                icon: MessageSquare,
                label: isAr ? 'تواصل الضيوف والرسائل' : 'Guest Communications',
                count: unreadChatsCount,
                urgent: unreadChatsCount > 0,
              },
              {
                id: 'quality' as OpsTab,
                icon: AlertTriangle,
                label: isAr ? 'الشكاوى والاسترداد' : 'Cases & Refunds',
                count: openComplaintsCount,
                urgent: openComplaintsCount > 0,
              },
              {
                id: 'directory' as OpsTab,
                icon: Users,
                label: isAr ? 'الموردين وقنوات التواصل' : 'Partners & Shift Desk',
                count: suppliers.length,
                urgent: false,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-[#475569] hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.urgent
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#E2E8F0] text-[#334155]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact Shift Action Queue Bar (Only shown when real urgent items exist) */}
          {(attentionBookingsCount > 0 ||
            urgentPickupsCount > 0 ||
            unreadChatsCount > 0 ||
            openComplaintsCount > 0) && (
            <div
              className="px-5 py-2.5 border-t border-[#E2E8F0] bg-white flex flex-wrap items-center gap-2 text-xs"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <span className="font-semibold text-[#475569] shrink-0">
                {isAr ? 'مهام الوردية الآن:' : 'Shift priority:'}
              </span>

              {attentionBookingsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sheet');
                    setUrgencyFilter('attention');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#F59E0B] bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-bold text-[#92400E] hover:bg-[#FEF3C7] transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                >
                  <AlertTriangle className="h-3 w-3 shrink-0 text-[#D97706]" aria-hidden="true" />
                  <span>
                    {isAr
                      ? `متأخر عن 4 ساعات (${attentionBookingsCount})`
                      : `Attention Required > 4h (${attentionBookingsCount})`}
                  </span>
                </button>
              )}

              {urgentPickupsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sheet');
                    setUrgencyFilter('urgent');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                >
                  <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>
                    {isAr
                      ? `بيك أب اليوم وغداً (${urgentPickupsCount})`
                      : `Today & Tomorrow Pickups (${urgentPickupsCount})`}
                  </span>
                </button>
              )}

              {unreadChatsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('chat');
                    setCommsSubView('chats');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                >
                  <MessageCircle className="h-3 w-3 shrink-0 text-[#EA580C]" aria-hidden="true" />
                  <span>
                    {isAr
                      ? `${unreadChatsCount} رسالة ضيف غير مقروءة`
                      : `${unreadChatsCount} unread guest chat(s)`}
                  </span>
                </button>
              )}

              {openComplaintsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('quality')}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                >
                  <span>
                    {isAr
                      ? `${openComplaintsCount} حالة جودة/استرداد مفتوحة`
                      : `${openComplaintsCount} open case(s)`}
                  </span>
                </button>
              )}
            </div>
          )}
        </header>

        {/* ============================================================ */}
        {/* MAIN WORKSPACE VIEWPORT (100% FULL WIDTH)                    */}
        {/* ============================================================ */}
        <div className="space-y-5 min-w-0">
          {activeTab === 'sheet' && (
            <>
              {/* 4-Column Shift Pulse KPI Strip (Uniform White Cards, Clickable Filters) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir={isAr ? 'rtl' : 'ltr'}>
                <button
                  type="button"
                  onClick={() => setUrgencyFilter((prev) => (prev === 'urgent' ? 'all' : 'urgent'))}
                  className={`rounded-xl border p-4 text-start space-y-1 transition-colors cursor-pointer ${
                    urgencyFilter === 'urgent'
                      ? 'border-[#EA580C] bg-[#FFF7ED]/50'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                    <span>{isAr ? 'رحلات اليوم وغداً' : 'Today & Tomorrow'}</span>
                    <Clock className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
                  </div>
                  <div className="font-mono text-2xl font-semibold text-[#0F172A] tabular-nums">
                    {urgentPickupsCount}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isAr ? 'اضغط لتصفية البيك أب العاجل' : 'Click to filter upcoming pickups'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgencyFilter((prev) => (prev === 'attention' ? 'all' : 'attention'))}
                  className={`rounded-xl border p-4 text-start space-y-1 transition-colors cursor-pointer ${
                    urgencyFilter === 'attention'
                      ? 'border-[#D97706] bg-[#FFFBEB]'
                      : attentionBookingsCount > 0
                      ? 'border-[#FDE68A] bg-white hover:border-[#D97706]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                    <span>{isAr ? 'معلّق أكثر من 4 ساعات' : 'Attention Required (> 4h)'}</span>
                    <AlertTriangle
                      className={`h-4 w-4 ${attentionBookingsCount > 0 ? 'text-[#D97706]' : 'text-[#94A3B8]'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className={`font-mono text-2xl font-semibold tabular-nums ${
                      attentionBookingsCount > 0 ? 'text-[#B45309]' : 'text-[#0F172A]'
                    }`}
                  >
                    {attentionBookingsCount}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {attentionBookingsCount > 0
                      ? isAr
                        ? 'يتطلب تأكيد وتواصل فوري'
                        : 'Needs immediate follow-up'
                      : isAr
                      ? 'لا توجد طلبات متأخرة'
                      : 'Zero overdue requests'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUrgencyFilter('all');
                    setStatusFilter((prev) => (prev === 'Pending' ? 'all' : 'Pending'));
                  }}
                  className={`rounded-xl border p-4 text-start space-y-1 transition-colors cursor-pointer ${
                    statusFilter === 'Pending'
                      ? 'border-[#EA580C] bg-[#FFF7ED]/50'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                    <span>{isAr ? 'بانتظار تعيين سائق/مرشد' : 'Unassigned Driver / Guide'}</span>
                    <Users className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                  </div>
                  <div className="font-mono text-2xl font-semibold text-[#0F172A] tabular-nums">
                    {unassignedDriversCount}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isAr ? 'اضغط لعرض الحجوزات المعلّقة' : 'Click to view Pending bookings'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab(unreadChatsCount > 0 ? 'chat' : openComplaintsCount > 0 ? 'quality' : 'chat')}
                  className="rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] p-4 text-start space-y-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                    <span>{isAr ? 'الرسائل وحالات الدعم' : 'Guest Messages & Cases'}</span>
                    <MessageCircle className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
                  </div>
                  <div className="font-mono text-2xl font-semibold text-[#0F172A] tabular-nums">
                    {unreadChatsCount} / {openComplaintsCount}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isAr
                      ? `${unreadChatsCount} رسالة جديدة · ${openComplaintsCount} شكوى مفتوحة`
                      : `${unreadChatsCount} unread chat(s) · ${openComplaintsCount} open case(s)`}
                  </div>
                </button>
              </div>

              {/* Filter Bar + Selection Indicator */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  <label className="relative block">
                    <Search className="h-4 w-4 text-[#7B8E95] absolute start-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search ref, guest, hotel…"
                      className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] ps-9 pe-3 text-xs text-[#0F172A]"
                    />
                  </label>

                  <select
                    value={urgencyFilter}
                    onChange={(e) =>
                      setUrgencyFilter(e.target.value as 'all' | 'urgent' | 'attention' | 'normal')
                    }
                    className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A]"
                    aria-label="Filter by urgency"
                  >
                    <option value="all">All Urgency · الكل (عاجل وعادي)</option>
                    <option value="attention">
                      Attention Required (Pending &gt; 4h) · متأخر عن 4 ساعات
                    </option>
                    <option value="urgent">Urgent (Today &amp; Tomorrow) · عاجل فقط</option>
                    <option value="normal">Normal · عادي</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                    className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs text-[#0F172A]"
                    aria-label="Filter by status"
                  >
                    <option value="all">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Driver assigned">Driver assigned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No show">No show</option>
                    <option value="Refunded">Refunded</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs text-[#0F172A]"
                    aria-label="Filter by category"
                  >
                    <option value="all">All activities</option>
                    <option value="sea">Sea trips</option>
                    <option value="desert">Desert trips</option>
                    <option value="historical">Historical</option>
                    <option value="horse">Horse riding</option>
                    <option value="guides">Egyptian guides</option>
                    <option value="shopping">Shopping</option>
                    <option value="city">City tour</option>
                    <option value="transfers">Transfers</option>
                    <option value="custom">Customized trip</option>
                  </select>

                  <select
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs text-[#0F172A]"
                    aria-label="Filter by supplier"
                  >
                    <option value="all">All suppliers</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs text-[#0F172A] tabular-nums"
                    aria-label="Filter by date"
                  />
                </div>
                {selectedBookingsForCsv.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
                    <span className="font-semibold text-[#0F172A] tabular-nums">
                      {isAr
                        ? `تم تحديد ${selectedBookingsForCsv.length} حجز للتصدير`
                        : `${selectedBookingsForCsv.length} booking(s) selected for CSV export`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBookingIds([])}
                      className="inline-flex items-center gap-1 font-semibold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? 'إلغاء التحديد' : 'Clear Selection'}</span>
                    </button>
                  </div>
                )}
              </div>

                {/* Pending > 4h Attention Required Priority Banner */}
                {attentionBookingsCount > 0 && (
                  <div
                    role="status"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#D97706] bg-[#FFFBEB] px-4 py-3 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 text-[#92400E]">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
                      <div>
                        <span className="font-bold uppercase tracking-wide">Attention Required:</span>{' '}
                        <span className="font-semibold">
                          {attentionBookingsCount}{' '}
                          {attentionBookingsCount === 1
                            ? 'pending booking has waited longer than 4 hours.'
                            : 'pending bookings have waited longer than 4 hours.'}
                        </span>{' '}
                        <span className="text-[#B45309] font-medium">
                          · حجوزات معلّقة منذ أكثر من 4 ساعات
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setUrgencyFilter((prev) => (prev === 'attention' ? 'all' : 'attention'))
                      }
                      className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border px-3 font-semibold transition-colors cursor-pointer ${
                        urgencyFilter === 'attention'
                          ? 'border-[#92400E] bg-[#92400E] text-white'
                          : 'border-[#D97706] bg-white text-[#92400E] hover:bg-[#FEF3C7]'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {urgencyFilter === 'attention'
                          ? 'Showing Attention Required · عرض الكل'
                          : `Filter Attention Required (${attentionBookingsCount})`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Excel-Style Booking Sheet View (Newest First) */}
                {filteredBookings.length === 0 ? (
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center space-y-3">
                    <p className="text-sm font-semibold text-[#0F172A]">No bookings match your filters</p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setStatusFilter('all');
                        setUrgencyFilter('all');
                        setCategoryFilter('all');
                        setSupplierFilter('all');
                        setDateFilter('');
                      }}
                      className="rounded-lg bg-[#EA580C] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-[11px] font-semibold tracking-[-0.01em] text-[#334155]">
                            <th className="py-3 px-2.5 w-9 text-center whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={allFilteredSelected}
                                onChange={toggleSelectAllFiltered}
                                className="h-4 w-4 rounded border-[#CBD5E1] text-[#EA580C] focus:ring-[#EA580C] cursor-pointer"
                                aria-label="Select all visible bookings for CSV download"
                                title="Select all visible bookings for CSV download"
                              />
                            </th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Ticket</th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Ref &amp; Urgency</th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Date &amp; Times</th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Trip / Service</th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Guest &amp; Hotel</th>
                            <th className="py-3 px-2.5 whitespace-nowrap text-right">Pax</th>
                            <th
                              className="py-3 px-2.5 whitespace-nowrap text-right"
                              title="Customer-facing selling price shown to the guest"
                            >
                              <div>Selling Price</div>
                              <div className="text-[10px] font-normal text-[#64748B]">Guest (€)</div>
                            </th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Payment</th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Status</th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Supplier</th>
                            <th className="py-3 px-2.5 whitespace-nowrap">Driver / Guide</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {filteredBookings.map((b) => {
                            const isChecked = selectedBookingIds.includes(b.id);
                            const urgency = getBookingUrgency(b);
                            const attention = getPendingAttentionInfo(b, nowMs);
                            return (
                              <tr
                                key={b.id}
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('input, select, a, button')) return;
                                  openBookingTicket(b);
                                }}
                                title={
                                  attention.needsAttention
                                    ? `Attention Required: Pending for ${attention.elapsedLabel} (over 4 hours). Click to review.`
                                    : 'Click booking request to view generated ticket'
                                }
                                className={`transition-colors cursor-pointer ${
                                  attention.needsAttention
                                    ? 'bg-[#FFFBEB] hover:bg-[#FEF3C7]'
                                    : isChecked
                                    ? 'bg-[#FFF7ED]/70 hover:bg-[#FFF7ED]'
                                    : urgency.level === 'today'
                                    ? 'bg-[#FEF2F2]/40 hover:bg-[#FEF2F2]/70'
                                    : 'hover:bg-[#F8FAFC]/80'
                                }`}
                              >
                                <td
                                  onClick={(e) => e.stopPropagation()}
                                  className={`py-2.5 px-2.5 text-center whitespace-nowrap ${
                                    attention.needsAttention ? 'border-s-4 border-s-[#D97706]' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSelectBooking(b.id)}
                                    className="h-4 w-4 rounded border-[#CBD5E1] text-[#EA580C] focus:ring-[#EA580C] cursor-pointer"
                                    aria-label={`Select booking ${b.id}`}
                                  />
                                </td>
                                <td className="py-2.5 px-2.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => openBookingTicket(b)}
                                    className="inline-flex items-center gap-1 rounded-md border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] cursor-pointer"
                                    title="عرض تيكت حجز العميل (مع إمكانية التعديل أو الإرسال)"
                                  >
                                    <Eye className="h-3 w-3 text-[#EA580C]" aria-hidden="true" />
                                    <span>التيكت · Ticket</span>
                                  </button>
                                </td>
                                <td className="py-2.5 px-2.5 whitespace-nowrap space-y-1">
                                  <div className="font-mono text-[11.5px] font-semibold text-[#EA580C] hover:underline">
                                    {b.id}
                                  </div>
                                  {attention.needsAttention && (
                                    <div
                                      role="status"
                                      className="inline-flex items-center gap-1 rounded border border-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 text-[10.5px] font-bold text-[#92400E]"
                                      title={`Pending for ${attention.elapsedLabel} (exceeds 4h threshold)`}
                                    >
                                      <AlertTriangle className="h-3 w-3 shrink-0 text-[#B45309]" aria-hidden="true" />
                                      <span>Attention Required · {attention.elapsedLabel}</span>
                                    </div>
                                  )}
                                  {urgency.level === 'today' ? (
                                    <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#B91C1C]">
                                      <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                                      <span>Urgent · عاجل (اليوم)</span>
                                    </div>
                                  ) : urgency.level === 'tomorrow' ? (
                                    <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#C2410C]">
                                      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                                      <span>Urgent · عاجل (غداً)</span>
                                    </div>
                                  ) : !attention.needsAttention ? (
                                    <div className="text-[10.5px] font-medium text-[#64748B]">
                                      Normal · عادي
                                    </div>
                                  ) : null}
                                </td>
                                <td className="py-2.5 px-2.5 whitespace-nowrap tabular-nums">
                                  <div className="font-medium text-[#0F172A]">{b.date}</div>
                                  {b.tripStartTime && (
                                    <div className="text-[11px] font-medium text-[#475569]">
                                      Trip: {b.tripStartTime}
                                    </div>
                                  )}
                                  <div className="text-[11px] font-semibold text-[#0F172A]">
                                    Pickup: {b.pickupTime || 'TBD'}
                                  </div>
                                  <div className="text-[10px] text-[#EA580C]">
                                    {b.pickupSpot === 'Outside Main Gate'
                                      ? 'Outside Gate (بره)'
                                      : 'Reception (جوه)'}
                                  </div>
                                </td>
                                <td className="py-2.5 px-2.5 min-w-[175px]">
                                  <div className="font-medium text-[#0F172A] line-clamp-1 hover:text-[#EA580C]">
                                    {b.tripTitle}
                                  </div>
                                  <div className="text-[11px] text-[#475569]">
                                    {b.destination} · {b.category}
                                  </div>
                                </td>
                                <td className="py-2.5 px-2.5 min-w-[195px] space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => openBookingTicket(b)}
                                      className="font-medium text-[#0F172A] hover:text-[#EA580C] hover:underline cursor-pointer text-start"
                                    >
                                      {b.guestName}
                                    </button>
                                    {b.guestCountry && (
                                      <span className="rounded bg-[#FFF7ED] border border-[#FED7AA] px-1.5 py-0.5 text-[10px] font-semibold text-[#C2410C]">
                                        {b.guestCountry}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#475569] truncate max-w-[190px]">
                                    {b.hotel}
                                    {b.roomNumber ? ` · Rm ${b.roomNumber}` : ''}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {(() => {
                                      const waDispatch = buildGuestPickupWhatsAppUrl({
                                        guestWhatsapp: b.guestWhatsapp,
                                        guestContact: b.guestContact,
                                        bookingId: b.id,
                                        guestName: b.guestName,
                                        tripTitle: b.tripTitle,
                                        date: b.date,
                                        tripStartTime: b.tripStartTime,
                                        pickupTime: b.pickupTime,
                                        pickupSpot: b.pickupSpot,
                                        hotel: b.hotel,
                                        roomNumber: b.roomNumber,
                                        driverOrGuide: b.assignedDriverOrGuide,
                                      });
                                      const emailDispatch = buildGuestPickupMailtoUrl({
                                        guestEmail: b.guestEmail,
                                        guestContact: b.guestContact,
                                        bookingId: b.id,
                                        guestName: b.guestName,
                                        tripTitle: b.tripTitle,
                                        date: b.date,
                                        tripStartTime: b.tripStartTime,
                                        pickupTime: b.pickupTime,
                                        pickupSpot: b.pickupSpot,
                                        hotel: b.hotel,
                                        roomNumber: b.roomNumber,
                                        driverOrGuide: b.assignedDriverOrGuide,
                                      });
                                      return (
                                        <>
                                          {waDispatch && (
                                            <a
                                              href={waDispatch}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 rounded border border-[#BBF7D0] bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-semibold text-[#15803D] hover:bg-[#DCFCE7]"
                                              title={`Send pickup via WhatsApp (${b.guestWhatsapp || b.guestContact})`}
                                            >
                                              <MessageCircle className="h-2.5 w-2.5" aria-hidden="true" />
                                              <span>WA Pickup</span>
                                            </a>
                                          )}
                                          {emailDispatch && (
                                            <a
                                              href={emailDispatch}
                                              onClick={() => {
                                                if (onLogDispatchEmail) {
                                                  onLogDispatchEmail(
                                                    b.guestEmail || b.guestContact,
                                                    `Pickup Details — ${b.id} (${b.date})`,
                                                    'Booking Confirmation'
                                                  );
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 rounded border border-[#FED7AA] bg-[#FFF7ED] px-1.5 py-0.5 text-[10px] font-semibold text-[#C2410C] hover:bg-[#FFEDD5]"
                                              title={`Email pickup details (${b.guestEmail || b.guestContact})`}
                                            >
                                              <Mail className="h-2.5 w-2.5" aria-hidden="true" />
                                              <span>Email Pickup</span>
                                            </a>
                                          )}
                                          {isBookingFinishedForReview(b) && (
                                            <button
                                              type="button"
                                              onClick={() => handleCopyReviewLink(b)}
                                              className="inline-flex items-center gap-1 rounded border border-[#FDE68A] bg-[#FFFBEB] px-1.5 py-0.5 text-[10px] font-semibold text-[#B45309] hover:bg-[#FEF3C7] cursor-pointer"
                                              title="Copy direct post-trip review & photo link for completed booking"
                                            >
                                              <Star className="h-2.5 w-2.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                                              <span>
                                                {copiedReviewId === b.id ? 'Copied Link' : 'Review Link'}
                                              </span>
                                            </button>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </td>
                                <td className="py-2.5 px-2.5 text-right whitespace-nowrap tabular-nums">
                                  {b.adults}A{b.children > 0 ? ` + ${b.children}C` : ''}{(b.infants ?? 0) > 0 ? ` + ${b.infants}INF` : ''}
                                </td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-[#0F172A] whitespace-nowrap tabular-nums">
                                  €{b.grossEur}
                                </td>
                                <td className="py-2.5 px-2.5 whitespace-nowrap">
                                  <select
                                    value={b.paymentStatus}
                                    onChange={(e) =>
                                      onUpdateBooking(b.id, {
                                        paymentStatus: e.target.value as PaymentStatus,
                                      })
                                    }
                                    className="rounded border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#0F172A]"
                                  >
                                    <option value="Awaiting link">Awaiting link</option>
                                    <option value="Link sent">Link sent</option>
                                    <option value="Paid online">Paid online</option>
                                    <option value="Cash on pickup">Cash on pickup</option>
                                  </select>
                                </td>
                                <td className="py-2.5 px-2.5 whitespace-nowrap">
                                  <div className="flex flex-col items-start gap-1.5">
                                    <select
                                      value={b.status}
                                      onChange={(e) =>
                                        onUpdateBooking(b.id, { status: e.target.value as BookingStatus })
                                      }
                                      className={`rounded border px-2 py-1 text-xs font-semibold ${statusBadgeStyle(
                                        b.status
                                      )}`}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Confirmed">Confirmed</option>
                                      <option value="Driver assigned">Driver assigned</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Cancelled">Cancelled</option>
                                      <option value="No show">No show</option>
                                      <option value="Refunded">Refunded</option>
                                    </select>
                                    {attention.needsAttention && (
                                      <span
                                        role="status"
                                        className="inline-flex items-center gap-1 rounded border border-[#D97706] bg-[#FEF3C7] px-2 py-0.5 text-[10.5px] font-bold text-[#92400E]"
                                        title={`This booking has been sitting in Pending status for ${attention.elapsedLabel} (over 4 hours).`}
                                      >
                                        <AlertTriangle className="h-3 w-3 shrink-0 text-[#B45309]" aria-hidden="true" />
                                        <span>Attention Required · {attention.elapsedLabel}</span>
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-2.5 whitespace-nowrap text-[#0F172A] font-medium">
                                  {b.supplierName}
                                </td>
                                <td className="py-2.5 px-2.5 min-w-[150px]">
                                  <input
                                    type="text"
                                    value={b.assignedDriverOrGuide}
                                    onChange={(e) =>
                                      onUpdateBooking(b.id, { assignedDriverOrGuide: e.target.value })
                                    }
                                    placeholder="Assign driver / guide…"
                                    className="w-full rounded border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#0F172A] focus:border-[#EA580C] focus:outline-none"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-5">
                {/* Pinned Official Contact Desk Strip + Communications Sub-View Switcher */}
                <div
                  className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  dir={isAr ? 'rtl' : 'ltr'}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">
                        {isAr ? 'قنوات التواصل الرسمية للمكتب:' : 'Official Desk Channels:'}
                      </span>
                      <span dir="ltr" className="font-mono font-medium text-[#0F172A]">
                        {liveWaDisplay}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleCopyDeskItem('wa', liveWaDisplay)}
                        className="inline-flex items-center gap-1 font-semibold text-[#EA580C] hover:underline cursor-pointer"
                      >
                        {copiedKey === 'wa' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === 'wa' ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ' : 'Copy'}</span>
                      </button>
                      <span aria-hidden="true">·</span>
                      <span dir="ltr" className="font-mono font-medium text-[#0F172A]">
                        {liveDeskEmail}
                      </span>
                      <a
                        href={`https://wa.me/${liveWaDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#15803D] hover:underline"
                      >
                        <span>{isAr ? 'فتح واتساب' : 'Open WhatsApp'}</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>
                    <h2 className="text-base font-semibold text-[#0F172A]">
                      {isAr ? 'مركز تواصل الضيوف وسجل الإيميلات' : 'Guest Communications & Dispatch Hub'}
                    </h2>
                  </div>

                  <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5 text-xs font-semibold shrink-0 self-start lg:self-auto">
                    <button
                      type="button"
                      onClick={() => setCommsSubView('chats')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 cursor-pointer whitespace-nowrap ${
                        commsSubView === 'chats' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? `محادثات الضيوف (${chats.length})` : `Live Chats (${chats.length})`}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommsSubView('dispatch')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 cursor-pointer whitespace-nowrap ${
                        commsSubView === 'dispatch' ? 'bg-[#EA580C] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? `التواصل السريع وسجل الإيميلات (${emailLogs.length})` : `Quick Dispatch & Emails (${emailLogs.length})`}</span>
                    </button>
                  </div>
                </div>

                {commsSubView === 'dispatch' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" dir={isAr ? 'rtl' : 'ltr'}>
                    {/* Quick Guest Dispatch Contacts */}
                    <div className="lg:col-span-7 rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
                      <div className="px-5 py-4 border-b border-[#E2E8F0]">
                        <h3 className="text-sm font-semibold text-[#0F172A]">
                          {isAr ? 'تواصل سريع مع ضيوف الرحلات القادمة' : 'Quick Guest Dispatch Contacts'}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          {isAr
                            ? 'أرسل تفاصيل البيك أب أو رابط الدفع عبر واتساب أو الإيميل بضغطة واحدة.'
                            : 'Send hotel pickup confirmations or payment links via WhatsApp or Email in one click.'}
                        </p>
                      </div>
                      {upcomingQuickContactBookings.length === 0 ? (
                        <div className="px-5 py-10 text-center text-xs text-[#64748B]">
                          {isAr ? 'لا توجد حجوزات نشطة حالياً.' : 'No active upcoming bookings right now.'}
                        </div>
                      ) : (
                        <div className="divide-y divide-[#E2E8F0]">
                          {upcomingQuickContactBookings.map((b) => {
                            const waUrl = buildGuestPickupWhatsAppUrl({
                              guestWhatsapp: b.guestWhatsapp,
                              guestContact: b.guestContact,
                              bookingId: b.id,
                              guestName: b.guestName,
                              tripTitle: b.tripTitle,
                              date: b.date,
                              tripStartTime: b.tripStartTime,
                              pickupTime: b.pickupTime,
                              pickupSpot: b.pickupSpot,
                              hotel: b.hotel,
                              roomNumber: b.roomNumber,
                              driverOrGuide: b.assignedDriverOrGuide,
                            });
                            const mailUrl = buildGuestPickupMailtoUrl({
                              guestEmail: b.guestEmail,
                              guestContact: b.guestContact,
                              bookingId: b.id,
                              guestName: b.guestName,
                              tripTitle: b.tripTitle,
                              date: b.date,
                              tripStartTime: b.tripStartTime,
                              pickupTime: b.pickupTime,
                              pickupSpot: b.pickupSpot,
                              hotel: b.hotel,
                              roomNumber: b.roomNumber,
                              driverOrGuide: b.assignedDriverOrGuide,
                            });
                            return (
                              <div
                                key={b.id}
                                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#F8FAFC]"
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono font-semibold text-[#EA580C]">{b.id}</span>
                                    <span className="font-semibold text-[#0F172A]">{b.guestName}</span>
                                    <span className="text-[#64748B] tabular-nums">· {b.date} · {b.pickupTime || 'TBD'}</span>
                                  </div>
                                  <div className="text-[11px] text-[#64748B] truncate">
                                    {b.tripTitle} · {b.hotel}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                  {waUrl && (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1.5 text-[11px] font-semibold text-[#15803D] hover:bg-[#DCFCE7]"
                                    >
                                      <MessageCircle className="h-3 w-3" aria-hidden="true" />
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                  {mailUrl && (
                                    <a
                                      href={mailUrl}
                                      onClick={() => {
                                        if (onLogDispatchEmail) {
                                          onLogDispatchEmail(
                                            b.guestEmail || b.guestContact,
                                            `Pickup Details — ${b.id} (${b.date})`,
                                            'Booking Confirmation'
                                          );
                                        }
                                      }}
                                      className="inline-flex items-center gap-1 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-1.5 text-[11px] font-semibold text-[#C2410C] hover:bg-[#FFEDD5]"
                                    >
                                      <Mail className="h-3 w-3" aria-hidden="true" />
                                      <span>Email</span>
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openBookingTicket(b)}
                                    className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] cursor-pointer"
                                  >
                                    {isAr ? 'التذكرة' : 'Ticket'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Sent Dispatch Email Log */}
                    <div className="lg:col-span-5 rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
                      <div className="px-5 py-4 border-b border-[#E2E8F0]">
                        <h3 className="text-sm font-semibold text-[#0F172A]">
                          {isAr ? `سجل الإيميلات المرسلة (${emailLogs.length})` : `Sent Dispatch Email Log (${emailLogs.length})`}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          {isAr
                            ? 'تأكيدات الحجوزات وتفاصيل البيك أب الموثّقة.'
                            : 'Logged confirmations and pickup dispatch emails.'}
                        </p>
                      </div>
                      {emailLogs.length === 0 ? (
                        <div className="px-5 py-10 text-center text-xs text-[#64748B]">
                          {isAr ? 'لم يتم تسجيل إيميلات مرسلة بعد.' : 'No dispatch emails logged yet.'}
                        </div>
                      ) : (
                        <div className="divide-y divide-[#E2E8F0] max-h-[540px] overflow-y-auto">
                          {emailLogs.map((log) => (
                            <div key={log.id} className="px-5 py-3 text-xs space-y-1 hover:bg-[#F8FAFC]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[#0F172A] truncate">{log.subject}</span>
                                <span className="text-[11px] text-[#64748B] shrink-0 tabular-nums">{log.sentAt}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748B]">
                                <span dir="ltr" className="truncate font-mono">{log.to}</span>
                                <span className="font-medium text-[#EA580C] shrink-0">{log.type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left / Top Standalone Card: Customer Thread List */}
                    <div className="lg:col-span-4 xl:col-span-4 rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-3.5 flex flex-col">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-[#0F172A]">
                            {isAr ? `محادثات الضيوف (${chats.length})` : `Guest Threads (${chats.length})`}
                          </h3>
                          <span className="text-xs font-medium text-[#64748B]">
                            {isAr ? 'اختر محادثة للرد' : 'Select thread'}
                          </span>
                        </div>
                    <label className="relative block">
                      <Search
                        className="h-4 w-4 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        placeholder="Search customer, ref, hotel…"
                        className="min-h-[42px] w-full rounded-xl border-2 border-[#CBD5E1] bg-white ps-9 pe-3 text-[14px] text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[280px] lg:max-h-[650px] pe-0.5">
                    {filteredChats.map((thread) => {
                      const active = thread.id === activeThread?.id;
                      const linkedBooking = bookings.find(
                        (b) => b.id.toLowerCase() === thread.bookingRef.toLowerCase()
                      );
                      const lastMsg = thread.messages[thread.messages.length - 1];
                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => {
                            setSelectedThreadId(thread.id);
                            setAiDraftMeta(null);
                            setAiError('');
                          }}
                          className={`w-full text-start rounded-xl border-2 p-3.5 transition-all cursor-pointer space-y-1.5 ${
                            active
                              ? 'border-[#EA580C] bg-white ring-2 ring-[#EA580C]/20 shadow-sm'
                              : 'border-[#CBD5E1] bg-white hover:border-[#64748B]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[13px] font-semibold text-[#EA580C]">
                              {thread.bookingRef}
                            </span>
                            <div className="flex items-center gap-2">
                              {active && (
                                <span className="rounded-md bg-[#EA580C] px-2 py-0.5 text-[11px] font-semibold text-white">
                                  Active · الآن
                                </span>
                              )}
                              <span className="uppercase text-[12px] font-semibold text-[#475569]">
                                {thread.customerLang}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[16px] font-semibold text-[#0F172A] leading-snug">
                              {thread.customerName}
                            </p>
                            {thread.unread && !active && (
                              <span className="text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </div>

                          <p className="text-[13.5px] font-medium text-[#334155] line-clamp-1">
                            {linkedBooking?.tripTitle || thread.tripTitle}
                          </p>
                          {linkedBooking && (
                            <p className="text-[12.5px] text-[#475569] line-clamp-1 tabular-nums">
                              {linkedBooking.hotel} · {linkedBooking.date} · {linkedBooking.pickupTime}
                            </p>
                          )}
                          {lastMsg && (
                            <p
                              dir="auto"
                              className="text-[13px] text-[#64748B] line-clamp-1 pt-0.5 border-t border-[#F1F5F9]"
                            >
                              {lastMsg.text}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right / Bottom Standalone Card: Active Conversation Box */}
                {activeThread && (
                  <div className="lg:col-span-8 xl:col-span-8 rounded-xl border border-[#E2E8F0] flex flex-col justify-between bg-white overflow-hidden min-h-[620px] lg:min-h-[720px]">
                    {/* Pinned Active Customer Header & Live Booking Details */}
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 sm:px-6 py-4 space-y-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-[#EA580C]">
                            <span>محادثة نشطة الآن · Chatting with</span>
                            <span className="font-mono text-[#0F172A]">{activeThread.bookingRef}</span>
                            {matchedBooking && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span
                                  className={`rounded border px-2 py-0.5 text-[12px] font-semibold ${statusBadgeStyle(
                                    matchedBooking.status
                                  )}`}
                                >
                                  {matchedBooking.status}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="text-[22px] font-semibold tracking-[-0.015em] text-[#0F172A]">
                            {activeThread.customerName}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#0F172A] uppercase">
                            Guest Lang: {activeThread.customerLang}
                          </span>
                          {matchedBooking && (
                            <button
                              type="button"
                              onClick={() => openBookingTicket(matchedBooking)}
                              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-[13px] font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
                              <span>عرض التيكت · View Ticket</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Full Customer Info Grid */}
                      {matchedBooking ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 rounded-xl border-2 border-[#CBD5E1] bg-white p-3.5 text-[13.5px]">
                          <div className="space-y-0.5">
                            <div className="text-[11.5px] font-semibold text-[#64748B]">
                              الرحلة والتاريخ · Trip &amp; Date
                            </div>
                            <div dir="auto" className="font-semibold text-[#0F172A] line-clamp-1">
                              {matchedBooking.tripTitle}
                            </div>
                            <div className="text-[13px] text-[#475569] tabular-nums">
                              {matchedBooking.date} · {matchedBooking.adults}A
                              {matchedBooking.children > 0 ? `+${matchedBooking.children}C` : ''}
                              {(matchedBooking.infants ?? 0) > 0 ? `+${matchedBooking.infants}INF` : ''} ·{' '}
                              <span className="font-mono font-semibold text-[#0F172A]">
                                €{matchedBooking.grossEur}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="text-[11.5px] font-semibold text-[#64748B]">
                              الفندق والبيك أب · Hotel &amp; Pickup
                            </div>
                            <div dir="auto" className="font-semibold text-[#0F172A] line-clamp-1">
                              {matchedBooking.hotel}
                            </div>
                            <div className="text-[13px] font-medium text-[#EA580C] tabular-nums">
                              {matchedBooking.tripStartTime ? `Start: ${matchedBooking.tripStartTime} · ` : ''}
                              Pickup: {matchedBooking.pickupTime || 'TBD'} ·{' '}
                              {matchedBooking.pickupSpot === 'Outside Main Gate'
                                ? 'Outside Gate (بره)'
                                : 'Reception (جوه)'}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="text-[11.5px] font-semibold text-[#64748B]">
                              التواصل · WhatsApp &amp; Email
                            </div>
                            <div className="font-mono text-[13px] font-semibold text-[#0F172A] truncate tabular-nums">
                              {matchedBooking.guestWhatsapp || matchedBooking.guestContact || '—'}
                            </div>
                            <div className="text-[12.5px] text-[#475569] truncate">
                              {matchedBooking.guestEmail || 'No email saved'}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[11.5px] font-semibold text-[#64748B]">
                              السائق والدفع · Driver &amp; Pay
                            </div>
                            <div className="text-[13px] font-semibold text-[#0F172A] truncate">
                              {matchedBooking.assignedDriverOrGuide || 'Unassigned'} ·{' '}
                              <span className="text-[#475569]">{matchedBooking.paymentStatus}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(() => {
                                const waUrl = buildGuestPickupWhatsAppUrl({
                                  guestWhatsapp: matchedBooking.guestWhatsapp,
                                  guestContact: matchedBooking.guestContact,
                                  bookingId: matchedBooking.id,
                                  guestName: matchedBooking.guestName,
                                  tripTitle: matchedBooking.tripTitle,
                                  date: matchedBooking.date,
                                  tripStartTime: matchedBooking.tripStartTime,
                                  pickupTime: matchedBooking.pickupTime,
                                  pickupSpot: matchedBooking.pickupSpot,
                                  hotel: matchedBooking.hotel,
                                  driverOrGuide: matchedBooking.assignedDriverOrGuide,
                                });
                                const mailUrl = buildGuestPickupMailtoUrl({
                                  guestEmail: matchedBooking.guestEmail,
                                  guestContact: matchedBooking.guestContact,
                                  bookingId: matchedBooking.id,
                                  guestName: matchedBooking.guestName,
                                  tripTitle: matchedBooking.tripTitle,
                                  date: matchedBooking.date,
                                  tripStartTime: matchedBooking.tripStartTime,
                                  pickupTime: matchedBooking.pickupTime,
                                  pickupSpot: matchedBooking.pickupSpot,
                                  hotel: matchedBooking.hotel,
                                  driverOrGuide: matchedBooking.assignedDriverOrGuide,
                                });
                                return (
                                  <>
                                    {waUrl && (
                                      <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[11.5px] font-semibold text-[#15803D] hover:bg-[#DCFCE7]"
                                      >
                                        <MessageCircle className="h-3 w-3" aria-hidden="true" />
                                        <span>WA Pickup</span>
                                      </a>
                                    )}
                                    {mailUrl && (
                                      <a
                                        href={mailUrl}
                                        className="inline-flex items-center gap-1 rounded border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[11.5px] font-semibold text-[#C2410C] hover:bg-[#FFEDD5]"
                                      >
                                        <Mail className="h-3 w-3" aria-hidden="true" />
                                        <span>Email</span>
                                      </a>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border-2 border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#334155]">
                          <span className="font-semibold text-[#0F172A]">{activeThread.tripTitle}</span>
                          <span className="mx-2 text-[#94A3B8]">·</span>
                          <span>{activeThread.pickupInfo}</span>
                        </div>
                      )}
                    </div>

                    {/* Generous Message Feed */}
                    <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto min-h-[380px] max-h-[540px] bg-[#FAFCFF]">
                      {activeThread.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                            msg.sender === 'operator'
                              ? 'ms-auto border-2 border-[#C2410C] bg-[#EA580C] text-white shadow-xs'
                              : 'border-2 border-[#94A3B8] bg-white text-[#0F172A] shadow-xs'
                          }`}
                        >
                          <p
                            dir="auto"
                            className="text-[15.5px] sm:text-[16px] leading-[1.7] whitespace-pre-wrap"
                          >
                            {msg.text}
                          </p>
                          <span
                            className={`mt-1.5 block text-[12.5px] font-medium tabular-nums ${
                              msg.sender === 'operator' ? 'text-white/80' : 'text-[#475569]'
                            }`}
                          >
                            {msg.sender === 'operator' ? 'Operations' : activeThread.customerName} ·{' '}
                            {msg.timestamp}
                          </span>

                          {msg.sender !== 'operator' && (
                            <div className="mt-2 border-t border-[#E2E8F0] pt-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleToggleMessageTranslation(
                                    msg.id,
                                    msg.text,
                                    activeThread.customerLang
                                  )
                                }
                                aria-expanded={!!expandedTranslations[msg.id]}
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer transition-colors"
                              >
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform ${
                                    expandedTranslations[msg.id] ? 'rotate-180 text-[#EA580C]' : ''
                                  }`}
                                  aria-hidden="true"
                                />
                                <span>ترجمة</span>
                              </button>

                              {expandedTranslations[msg.id] && (
                                <div
                                  dir="rtl"
                                  className="mt-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 text-[13.5px] leading-relaxed text-[#0F172A]"
                                >
                                  {translatingIds[msg.id] ? (
                                    <span className="inline-flex items-center gap-1.5 text-[#64748B] text-[12px]">
                                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                      <span>جاري الترجمة…</span>
                                    </span>
                                  ) : translationErrors[msg.id] ? (
                                    <span className="text-[#B91C1C] text-[12px] font-medium">
                                      {translationErrors[msg.id]}
                                    </span>
                                  ) : (
                                    <p className="whitespace-pre-wrap">{translatedMessages[msg.id]}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Compact Smart Reply Strip + Multi-Line Send Composer */}
                    <div className="border-t-2 border-[#CBD5E1] p-4 sm:p-5 space-y-2.5 bg-[#F1F5F9]">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={aiLoading}
                            onClick={() => void handleDraftWithAi()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5 font-semibold text-[#4338CA] hover:bg-[#E0E7FF] disabled:opacity-60 cursor-pointer"
                            title="اكتب كلامك المحدد في الخانة بالأسفل ثم اضغط هنا لترجمته وتجهيزه بدقة للزبون"
                          >
                            {aiLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            <span>
                              {aiLoading ? 'جاري التجهيز…' : 'تجهيز رد ذكي'}
                            </span>
                          </button>

                          <select
                            value={replyLangOverride}
                            onChange={(e) => setReplyLangOverride(e.target.value)}
                            aria-label="Target reply language"
                            className="rounded-lg border border-[#CBD5E1] bg-white px-2 py-1.5 text-[11.5px] font-semibold text-[#0F172A] focus:border-[#4F46E5] focus:outline-none cursor-pointer"
                          >
                            <option value="auto">
                              لغة العميل ({activeThread.customerLang.toUpperCase()})
                            </option>
                            <option value="de">Deutsch (DE)</option>
                            <option value="en">English (EN)</option>
                            <option value="ar">العربية (AR)</option>
                            <option value="fr">Français (FR)</option>
                            <option value="nl">Nederlands (NL)</option>
                            <option value="ru">Русский (RU)</option>
                            <option value="it">Italiano (IT)</option>
                            <option value="es">Español (ES)</option>
                          </select>
                        </div>

                        {aiDraftMeta ? (
                          <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold" dir="auto">
                            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>{aiDraftMeta.note}</span>
                          </span>
                        ) : (
                          <span className="text-[#64748B] text-[11px]">
                            اكتب كلامك بالأسفل واضغط تجهيز رد ذكي لتحويله بدقة
                          </span>
                        )}
                      </div>

                      {aiError && (
                        <p className="text-[12.5px] font-semibold text-[#B91C1C]">
                          {aiError}
                        </p>
                      )}

                      <form onSubmit={handleSendReply} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <textarea
                          ref={composerRef}
                          rows={2}
                          dir="auto"
                          value={composerText}
                          onChange={(e) => setComposerText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (composerText.trim()) handleSendReply(e);
                            }
                          }}
                          placeholder="اكتب ردك المحدد هنا (أو اكتب بالعربي واضغط «تجهيز رد ذكي» لتحويله بدقة) ثم اضغط Send…"
                          className="flex-1 min-h-[64px] rounded-xl border-2 border-[#94A3B8] bg-white px-4 py-3 text-[15.5px] sm:text-[16px] leading-relaxed text-[#0F172A] resize-y focus:border-[#EA580C] focus:outline-none"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          {matchedBooking && composerText.trim() && (matchedBooking.guestWhatsapp || matchedBooking.guestContact) && (
                            <a
                              href={`https://wa.me/${(matchedBooking.guestWhatsapp || matchedBooking.guestContact).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(composerText.trim())}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-[#16A34A] bg-[#F0FDF4] px-4 text-[14px] font-semibold text-[#15803D] hover:bg-[#DCFCE7] whitespace-nowrap"
                              title="Send drafted message directly via WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" aria-hidden="true" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            type="submit"
                            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#EA580C] px-6 text-[15px] font-semibold text-white hover:bg-[#C2410C] whitespace-nowrap cursor-pointer shadow-xs"
                          >
                            <Send className="h-4 w-4" aria-hidden="true" />
                            <span>Send</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quality' && (
              <div className="space-y-4">
                <div
                  className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  dir={isAr ? 'rtl' : 'ltr'}
                >
                  <div>
                    <div className="text-xs text-[#64748B]">
                      {isAr ? 'مركز الحجوزات والتشغيل · الشكاوى والاسترداد' : 'Reservations & Dispatch · Cases & Refunds'}
                    </div>
                    <h2 className="text-lg font-semibold text-[#0F172A]">
                      {isAr ? 'الشكاوى ومعالجة المشكلات والاسترداد' : 'Complaints, Refunds & Problem Resolution'}
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {isAr
                        ? 'اضغط على أي حالة لفتح سجل محادثات الواتساب والإيميلات والتعامل مباشرة مع العميل.'
                        : 'Select any case below to inspect linked WhatsApp & email history and reply directly.'}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-[#475569] tabular-nums shrink-0">
                    {isAr
                      ? `${openComplaintsCount} مفتوحة · ${complaints.length - openComplaintsCount} مغلقة`
                      : `${openComplaintsCount} open · ${complaints.length - openComplaintsCount} resolved`}
                  </div>
                </div>

                {complaints.length === 0 && (
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center text-xs text-[#64748B]">
                    {isAr ? 'لا توجد شكاوى أو طلبات استرداد مسجلة حالياً.' : 'No quality cases or refund requests recorded.'}
                  </div>
                )}

                <div className="space-y-4">
                  {complaints.map((c) => {
                    const isOpen = openComplaintId === c.id;
                    const { linkedBooking, linkedChat, linkedEmails } = getComplaintCaseContext(c);
                    const chatMessages = linkedChat?.messages || [];
                    const channelTab = complaintChannelTab[c.id] || 'all';
                    const replyDraft = complaintReplyText[c.id] || '';
                    const replyLang = complaintReplyLang[c.id] || 'auto';
                    const defaultCustomerLang =
                      linkedChat?.customerLang || linkedBooking?.guestLang || 'en';
                    const rawPhone =
                      linkedBooking?.guestWhatsapp || linkedBooking?.guestContact || '';
                    const waDigits = rawPhone.replace(/[^0-9]/g, '');
                    const waHref =
                      waDigits.length >= 7
                        ? `https://wa.me/${waDigits}${
                            replyDraft.trim()
                              ? `?text=${encodeURIComponent(replyDraft.trim())}`
                              : ''
                          }`
                        : `https://wa.me/${
                            replyDraft.trim()
                              ? `?text=${encodeURIComponent(replyDraft.trim())}`
                              : ''
                          }`;

                    return (
                      <div
                        key={c.id}
                        className={`rounded-2xl bg-white overflow-hidden transition-all ${
                          isOpen
                            ? 'border-2 border-[#1E293B] border-t-4 border-t-[#EA580C] shadow-md'
                            : 'border-2 border-[#CBD5E1] hover:border-[#94A3B8] shadow-xs'
                        }`}
                      >
                        {/* Complaint Summary Header Row */}
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => setOpenComplaintId(isOpen ? null : c.id)}
                            aria-expanded={isOpen}
                            className="flex-1 text-start space-y-1.5 cursor-pointer group"
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-semibold text-[#EA580C]">{c.id}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-[#475569]">Booking {c.bookingRef}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-[#0F172A]">{c.issueType}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#475569]">Severity: {c.severity}</span>
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-[#0F172A] group-hover:text-[#EA580C] transition-colors">
                              {c.customerName} — {c.tripTitle}
                            </p>
                            <p className="text-xs text-[#475569] leading-relaxed">{c.summary}</p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11.5px] font-semibold">
                              <span className="inline-flex items-center gap-1 rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[#15803D]">
                                <MessageCircle className="h-3 w-3" aria-hidden="true" />
                                <span>واتساب وشات ({chatMessages.length})</span>
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[#C2410C]">
                                <Mail className="h-3 w-3" aria-hidden="true" />
                                <span>إيميلات ({linkedEmails.length})</span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-[#4338CA]">
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                  }`}
                                  aria-hidden="true"
                                />
                                <span>
                                  {isOpen
                                    ? 'إخفاء محادثة العميل'
                                    : 'فتح الشكوى والمراسلات'}
                                </span>
                              </span>
                            </div>
                          </button>

                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <span className="text-sm font-mono font-semibold text-[#0F172A] tabular-nums">
                              €{c.refundRequestedEur}
                            </span>
                            <select
                              value={c.status}
                              onChange={(e) =>
                                onUpdateComplaint(c.id, {
                                  status: e.target.value as ComplaintCase['status'],
                                })
                              }
                              className="min-h-[38px] rounded-lg border-2 border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A]"
                            >
                              <option value="Open">Open</option>
                              <option value="Investigating">Investigating</option>
                              <option value="Refunded">Refunded</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                            {c.status !== 'Refunded' && c.status !== 'Resolved' && (
                              <button
                                type="button"
                                onClick={() => onUpdateComplaint(c.id, { status: 'Refunded' })}
                                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#EA580C] px-3.5 text-xs font-semibold text-white hover:bg-[#C2410C] cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Issue Refund &amp; Close</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Case Inspector: Booking Snapshot + WhatsApp & Email Timeline + Direct Action Composer */}
                        {isOpen && (
                          <div className="border-t-2 border-[#CBD5E1] bg-[#F8FAFC] p-4 sm:p-5 space-y-4">
                            {/* Case & Booking Snapshot */}
                            <div className="rounded-xl border-2 border-[#CBD5E1] bg-white p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="font-semibold text-[#0F172A]">
                                  تفاصيل الموقف والحجز · {c.bookingRef}
                                </div>
                                {linkedBooking ? (
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#475569]">
                                    <span>
                                      <strong>الفندق:</strong> {linkedBooking.hotel}
                                    </span>
                                    <span>
                                      <strong>التاريخ والوقت:</strong> {linkedBooking.date} ·{' '}
                                      {linkedBooking.pickupTime}
                                    </span>
                                    <span>
                                      <strong>السائق/المورد:</strong>{' '}
                                      {linkedBooking.assignedDriverOrGuide || linkedBooking.supplierName}
                                    </span>
                                    <span>
                                      <strong>التواصل:</strong>{' '}
                                      {linkedBooking.guestWhatsapp ||
                                        linkedBooking.guestEmail ||
                                        linkedBooking.guestContact}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-[#475569]">
                                    التاريخ: {c.createdAt} · المسار: {c.tripTitle} · مبلغ الاسترداد المطلوب: €
                                    {c.refundRequestedEur}
                                  </div>
                                )}
                              </div>

                              {linkedBooking && (
                                <button
                                  type="button"
                                  onClick={() => openBookingTicket(linkedBooking)}
                                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border-2 border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
                                  <span>فتح تيكت الحجز</span>
                                </button>
                              )}
                            </div>

                            {/* Channel Filter Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="inline-flex rounded-xl border-2 border-[#CBD5E1] bg-white p-1 text-xs font-semibold">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setComplaintChannelTab((prev) => ({ ...prev, [c.id]: 'all' }))
                                  }
                                  className={`rounded-lg px-3 py-1.5 cursor-pointer ${
                                    channelTab === 'all'
                                      ? 'bg-[#0F172A] text-white'
                                      : 'text-[#475569] hover:text-[#0F172A]'
                                  }`}
                                >
                                  الكل ({chatMessages.length + linkedEmails.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setComplaintChannelTab((prev) => ({
                                      ...prev,
                                      [c.id]: 'whatsapp',
                                    }))
                                  }
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 cursor-pointer ${
                                    channelTab === 'whatsapp'
                                      ? 'bg-[#15803D] text-white'
                                      : 'text-[#475569] hover:text-[#0F172A]'
                                  }`}
                                >
                                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>واتساب وشات ({chatMessages.length})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setComplaintChannelTab((prev) => ({ ...prev, [c.id]: 'email' }))
                                  }
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 cursor-pointer ${
                                    channelTab === 'email'
                                      ? 'bg-[#EA580C] text-white'
                                      : 'text-[#475569] hover:text-[#0F172A]'
                                  }`}
                                >
                                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>إيميلات ({linkedEmails.length})</span>
                                </button>
                              </div>

                              <span className="text-[11.5px] font-semibold text-[#475569] uppercase">
                                لغة العميل: {defaultCustomerLang}
                              </span>
                            </div>

                            {/* WhatsApp / Chat Timeline */}
                            {(channelTab === 'all' || channelTab === 'whatsapp') && (
                              <div className="rounded-xl border-2 border-[#CBD5E1] bg-white p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                    <span>محادثة العميل (واتساب / شات)</span>
                                  </span>
                                  {linkedChat && (
                                    <span className="text-[11px] text-[#64748B]">
                                      {linkedChat.pickupInfo}
                                    </span>
                                  )}
                                </div>

                                {chatMessages.length === 0 ? (
                                  <p className="text-xs text-[#64748B] py-2">
                                    لا توجد رسائل واتساب أو شات مسجلة لهذا الحجز حتى الآن — يمكنك كتابة رد بالأسفل لبدء التواصل الفوري مع العميل.
                                  </p>
                                ) : (
                                  <div className="space-y-3 max-h-[320px] overflow-y-auto pe-1">
                                    {chatMessages.map((msg) => (
                                      <div
                                        key={msg.id}
                                        className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                                          msg.sender === 'operator'
                                            ? 'ms-auto border-2 border-[#C2410C] bg-[#EA580C] text-white'
                                            : 'border-2 border-[#94A3B8] bg-[#FAFCFF] text-[#0F172A]'
                                        }`}
                                      >
                                        <p
                                          dir="auto"
                                          className="text-[14px] leading-relaxed whitespace-pre-wrap"
                                        >
                                          {msg.text}
                                        </p>
                                        <span
                                          className={`mt-1 block text-[11px] font-medium tabular-nums ${
                                            msg.sender === 'operator'
                                              ? 'text-white/85'
                                              : 'text-[#475569]'
                                          }`}
                                        >
                                          {msg.sender === 'operator'
                                            ? 'Operations'
                                            : c.customerName}{' '}
                                          · {msg.timestamp}
                                        </span>

                                        {msg.sender !== 'operator' && (
                                          <div className="mt-1.5 border-t border-[#E2E8F0] pt-1">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                void handleToggleMessageTranslation(
                                                  msg.id,
                                                  msg.text,
                                                  defaultCustomerLang
                                                )
                                              }
                                              aria-expanded={!!expandedTranslations[msg.id]}
                                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-[#475569] hover:bg-[#E2E8F0]/60 hover:text-[#0F172A] cursor-pointer"
                                            >
                                              <ChevronDown
                                                className={`h-3.5 w-3.5 transition-transform ${
                                                  expandedTranslations[msg.id]
                                                    ? 'rotate-180 text-[#EA580C]'
                                                    : ''
                                                }`}
                                                aria-hidden="true"
                                              />
                                              <span>ترجمة</span>
                                            </button>

                                            {expandedTranslations[msg.id] && (
                                              <div
                                                dir="rtl"
                                                className="mt-1.5 rounded-lg bg-white border border-[#CBD5E1] px-3 py-2 text-[13px] leading-relaxed text-[#0F172A]"
                                              >
                                                {translatingIds[msg.id] ? (
                                                  <span className="inline-flex items-center gap-1.5 text-[#64748B] text-[11.5px]">
                                                    <Loader2
                                                      className="h-3 w-3 animate-spin"
                                                      aria-hidden="true"
                                                    />
                                                    <span>جاري الترجمة…</span>
                                                  </span>
                                                ) : translationErrors[msg.id] ? (
                                                  <span className="text-[#B91C1C] text-[11.5px] font-medium">
                                                    {translationErrors[msg.id]}
                                                  </span>
                                                ) : (
                                                  <p className="whitespace-pre-wrap">
                                                    {translatedMessages[msg.id]}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Emails Timeline */}
                            {(channelTab === 'all' || channelTab === 'email') && (
                              <div className="rounded-xl border-2 border-[#CBD5E1] bg-white p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C2410C]">
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    <span>سجل الإيميلات المرتبطة بالعميل</span>
                                  </span>
                                  <span className="text-[11px] text-[#64748B]">
                                    {linkedBooking?.guestEmail || 'Wasla Email Log'}
                                  </span>
                                </div>

                                {linkedEmails.length === 0 ? (
                                  <p className="text-xs text-[#64748B] py-2">
                                    لا توجد إيميلات مسجلة لهذا الحجز بعد — يمكنك إرسال إيميل متابعة من الخانة بالأسفل وسيُسجّل هنا تلقائيًا.
                                  </p>
                                ) : (
                                  <div className="space-y-2.5">
                                    {linkedEmails.map((em) => (
                                      <div
                                        key={em.id}
                                        className="rounded-xl border border-[#CBD5E1] bg-[#FFFDFB] p-3.5 text-xs space-y-2"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2">
                                          <div className="space-y-0.5">
                                            <div className="font-semibold text-[#0F172A]">
                                              {em.subject}
                                            </div>
                                            <div className="text-[11px] text-[#475569]">
                                              <span>To: {em.to}</span>
                                              <span className="mx-1.5">·</span>
                                              <span>{em.sentAt}</span>
                                            </div>
                                          </div>
                                          <span className="inline-flex items-center gap-1 rounded bg-[#DCFCE7] px-2 py-0.5 text-[10.5px] font-semibold text-[#15803D]">
                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                            <span>{em.status}</span>
                                          </span>
                                        </div>
                                        <div className="text-[#334155] leading-relaxed">
                                          مرسل من <span className="font-semibold">Wasla Travel Operations</span> بخصوص{' '}
                                          <span className="font-mono font-semibold">{c.bookingRef}</span> ({c.tripTitle}) — حالة الشكوى الحالية: <strong>{c.status}</strong>.
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Direct Reply & Customer Handling Bar Inside Complaint */}
                            <div className="rounded-xl border-2 border-[#94A3B8] bg-white p-4 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={!!complaintAiLoading[c.id]}
                                    onClick={() => void handleComplaintSmartDraft(c)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5 font-semibold text-[#4338CA] hover:bg-[#E0E7FF] disabled:opacity-60 cursor-pointer"
                                  >
                                    {complaintAiLoading[c.id] ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                    )}
                                    <span>
                                      {complaintAiLoading[c.id] ? 'جاري التجهيز…' : 'تجهيز رد ذكي'}
                                    </span>
                                  </button>

                                  <select
                                    value={replyLang}
                                    onChange={(e) =>
                                      setComplaintReplyLang((prev) => ({
                                        ...prev,
                                        [c.id]: e.target.value,
                                      }))
                                    }
                                    aria-label="Complaint reply language"
                                    className="rounded-lg border border-[#CBD5E1] bg-white px-2 py-1.5 text-[11.5px] font-semibold text-[#0F172A] cursor-pointer"
                                  >
                                    <option value="auto">
                                      لغة العميل ({defaultCustomerLang.toUpperCase()})
                                    </option>
                                    <option value="de">Deutsch (DE)</option>
                                    <option value="en">English (EN)</option>
                                    <option value="ar">العربية (AR)</option>
                                    <option value="fr">Français (FR)</option>
                                    <option value="it">Italiano (IT)</option>
                                    <option value="nl">Nederlands (NL)</option>
                                    <option value="ru">Русский (RU)</option>
                                    <option value="es">Español (ES)</option>
                                  </select>
                                </div>

                                {complaintAiNote[c.id] ? (
                                  <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold">
                                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                    <span>{complaintAiNote[c.id]}</span>
                                  </span>
                                ) : (
                                  <span className="text-[#64748B] text-[11px]">
                                    اكتب ردك بالعربي واضغط «تجهيز رد ذكي» ثم أرسل للزبون عبر الشات أو واتساب أو الإيميل
                                  </span>
                                )}
                              </div>

                              {complaintAiError[c.id] && (
                                <p className="text-xs font-semibold text-[#B91C1C]">
                                  {complaintAiError[c.id]}
                                </p>
                              )}
                              {complaintSentNotice[c.id] && (
                                <p className="text-xs font-semibold text-[#15803D]">
                                  {complaintSentNotice[c.id]}
                                </p>
                              )}

                              <textarea
                                rows={2}
                                dir="auto"
                                value={replyDraft}
                                onChange={(e) =>
                                  setComplaintReplyText((prev) => ({
                                    ...prev,
                                    [c.id]: e.target.value,
                                  }))
                                }
                                placeholder={`اكتب ردك لـ ${c.customerName} هنا (مثلاً: نعتذر عن التأخير وسنرد لك €${c.refundRequestedEur})…`}
                                className="w-full min-h-[64px] rounded-xl border-2 border-[#CBD5E1] bg-white px-3.5 py-2.5 text-[14.5px] leading-relaxed text-[#0F172A] focus:border-[#EA580C] focus:outline-none resize-y"
                              />

                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSendComplaintEmail(c)}
                                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-[#FED7AA] bg-[#FFF7ED] px-3.5 text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5] cursor-pointer"
                                >
                                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>إرسال إيميل</span>
                                </button>

                                <a
                                  href={waHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-[#16A34A] bg-[#F0FDF4] px-3.5 text-xs font-semibold text-[#15803D] hover:bg-[#DCFCE7]"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>واتساب ↗</span>
                                </a>

                                <button
                                  type="button"
                                  disabled={!replyDraft.trim()}
                                  onClick={() => handleSendComplaintChatReply(c)}
                                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#EA580C] px-4 text-xs font-semibold text-white hover:bg-[#C2410C] disabled:opacity-50 cursor-pointer"
                                >
                                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>إرسال في الشات</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: PARTNERS DIRECTORY & SHIFT CONTACT DESK               */}
            {/* ============================================================ */}
            {activeTab === 'directory' && (
              <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
                {/* Top 2-Column Official Contact Desk & Shift Protocol */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  <div className="lg:col-span-6 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[#EA580C]">
                        {isAr ? 'قنوات التواصل الرسمية للفريق والضيوف' : 'Official Hurghada Desk Channels'}
                      </div>
                      <h2 className="text-base font-semibold text-[#0F172A]">
                        {isAr ? 'الواتساب والبريد الإلكتروني الرسمي' : 'Live WhatsApp & Support Email'}
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-[#64748B]">
                            {isAr ? 'واتساب التشغيل والتأكيدات' : 'WhatsApp Reservations Desk'}
                          </div>
                          <div dir="ltr" className="font-mono text-sm font-semibold text-[#0F172A]">
                            {liveWaDisplay}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCopyDeskItem('dir-wa', liveWaDisplay)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 font-semibold text-[#0F172A] hover:border-[#EA580C] cursor-pointer"
                          >
                            {copiedKey === 'dir-wa' ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedKey === 'dir-wa' ? (isAr ? 'تم' : 'Copied') : isAr ? 'نسخ' : 'Copy'}</span>
                          </button>
                          <a
                            href={`https://wa.me/${liveWaDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A] px-3 py-1.5 font-semibold text-white hover:bg-[#15803D]"
                          >
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isAr ? 'فتح واتساب' : 'Open WhatsApp'}</span>
                          </a>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-[#64748B]">
                            {isAr ? 'البريد الإلكتروني الرسمي للحجوزات' : 'Official Reservations Email'}
                          </div>
                          <div dir="ltr" className="font-mono text-sm font-semibold text-[#0F172A]">
                            {liveDeskEmail}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCopyDeskItem('dir-email', liveDeskEmail)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 font-semibold text-[#0F172A] hover:border-[#EA580C] cursor-pointer"
                          >
                            {copiedKey === 'dir-email' ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedKey === 'dir-email' ? (isAr ? 'تم' : 'Copied') : isAr ? 'نسخ' : 'Copy'}</span>
                          </button>
                          <a
                            href={`mailto:${liveDeskEmail}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0F172A] px-3 py-1.5 font-semibold text-white hover:bg-[#1E293B]"
                          >
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isAr ? 'إرسال إيميل' : 'Send Email'}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
                      <h2 className="text-base font-semibold text-[#0F172A]">
                        {isAr ? 'معايير الوردية وبروتوكول التأكيد والدفع' : 'Shift SLA & Payment Protocol'}
                      </h2>
                    </div>
                    <ul className="space-y-2.5 text-xs text-[#475569] leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="font-mono font-bold text-[#EA580C]">01.</span>
                        <span>
                          {isAr
                            ? 'قاعدة الـ 4 ساعات: يجب مراجعة أي طلب معلّق وتأكيد الإتاحة مع المورد خلال أقل من 4 ساعات لتجنب تنبيه التأخير.'
                            : '4-Hour SLA: Verify seats with the local operator and confirm every Pending booking within 4 hours.'}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono font-bold text-[#EA580C]">02.</span>
                        <span>
                          {isAr
                            ? 'الدفع المعتمد: كاش عند الاستلام (Cash on pickup) أو إرسال رابط دفع رسمي بعد تأكيد الإتاحة — لا يوجد خصم تلقائي مسبق.'
                            : 'Approved Payment Flow: Collect Cash on pickup or send an Official Payment Link after availability is confirmed.'}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono font-bold text-[#EA580C]">03.</span>
                        <span>
                          {isAr
                            ? 'تأكيد البيك أب: إرسال الدقيقة الدقيقة ومكان الانتظار (الريسبشن أو البوابة الرئيسية) واسم السائق عبر واتساب والإيميل.'
                            : 'Pickup Dispatch: Send exact pickup minute, meeting spot (Reception or Main Gate), and driver name via WhatsApp & Email.'}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono font-bold text-[#EA580C]">04.</span>
                        <span>
                          {isAr
                            ? 'إلغاء مجاني حتى 24 ساعة قبل الموعد، مع توثيق صور جوازات السفر مسبقاً لرحلات الأقصر والقاهرة ومرسى علم.'
                            : 'Honor free cancellation up to 24h prior and collect passport copies in advance for Luxor, Cairo, and Marsa Alam checkpoints.'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Vetted Suppliers Direct Contact Directory */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-[#0F172A]">
                        {isAr ? `دليل التواصل مع الموردين (${suppliers.length})` : `Vetted Suppliers Contact Directory (${suppliers.length})`}
                      </h2>
                      <p className="text-xs text-[#64748B]">
                        {isAr
                          ? 'تواصل مباشر مع الموردين لتأكيد المقاعد وتعيين السائقين والمرشدين.'
                          : 'Reach operators directly to verify live seats and assign drivers or guides.'}
                      </p>
                    </div>
                    <label className="relative block w-full sm:w-64">
                      <Search className="h-3.5 w-3.5 text-[#94A3B8] absolute start-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                      <input
                        type="text"
                        value={directoryQuery}
                        onChange={(e) => setDirectoryQuery(e.target.value)}
                        placeholder={isAr ? 'ابحث باسم المورد أو المدينة...' : 'Search supplier or city...'}
                        className="min-h-[36px] w-full rounded-lg border border-[#CBD5E1] bg-white ps-8 pe-3 text-xs text-[#0F172A] focus:border-[#EA580C] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                          <th className="py-2.5 px-4 text-start">{isAr ? 'المورد' : 'Supplier'}</th>
                          <th className="py-2.5 px-4 text-start">{isAr ? 'المدينة والتخصص' : 'City & Specialty'}</th>
                          <th className="py-2.5 px-4 text-end">{isAr ? 'حجوزات نشطة' : 'Active Bookings'}</th>
                          <th className="py-2.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                          <th className="py-2.5 px-4 text-end">{isAr ? 'تواصل مباشر' : 'Direct Contact'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {filteredDirectorySuppliers.map((sup) => {
                          const activeCount = bookings.filter(
                            (b) =>
                              b.supplierName === sup.name &&
                              (b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Driver assigned')
                          ).length;
                          return (
                            <tr key={sup.id} className="bg-white hover:bg-[#F8FAFC]">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#0F172A]">{sup.name}</div>
                                <div dir="ltr" className="text-[11px] font-mono text-[#64748B]">{sup.email}</div>
                              </td>
                              <td className="py-3 px-4 max-w-[260px]">
                                <div className="font-medium text-[#0F172A]">{sup.city}</div>
                                <div className="text-[11px] text-[#64748B] truncate">{sup.specialty}</div>
                              </td>
                              <td className="py-3 px-4 text-end font-mono font-semibold text-[#0F172A] tabular-nums">
                                {activeCount}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`font-semibold ${
                                    sup.status === 'Active'
                                      ? 'text-[#15803D]'
                                      : sup.status === 'Pending'
                                      ? 'text-[#B45309]'
                                      : 'text-[#64748B]'
                                  }`}
                                >
                                  {sup.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-end whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => void handleCopyDeskItem(`sup-${sup.id}`, sup.email)}
                                    className="rounded-md border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#475569] hover:text-[#0F172A] cursor-pointer"
                                  >
                                    {copiedKey === `sup-${sup.id}` ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الإيميل' : 'Copy Email'}
                                  </button>
                                  <a
                                    href={`mailto:${sup.email}?subject=${encodeURIComponent(
                                      `Wasla Travel — Seat Availability & Dispatch Check (${sup.name})`
                                    )}`}
                                    className="inline-flex items-center gap-1 rounded-md bg-[#EA580C] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#C2410C]"
                                  >
                                    <Mail className="h-3 w-3" aria-hidden="true" />
                                    <span>{isAr ? 'مراسلة' : 'Email'}</span>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Add / Edit Booking & Pickup Control Modal */}
      {modalMode && modalDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-[2px]"
          onClick={() => {
            setModalMode(null);
            setModalDraft(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={
            modalMode === 'create'
              ? 'Add New Booking'
              : modalMode === 'ticket'
              ? `Booking Ticket ${modalDraft.id}`
              : `Edit Booking ${modalDraft.id}`
          }
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white/95 px-6 py-4 backdrop-blur-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#EA580C]">
                  <span>
                    {modalMode === 'ticket'
                      ? `تيكت حجز العميل · Customer Booking Ticket · ${modalDraft.id}`
                      : `Operations Booking & Pickup Control · ${modalDraft.id}`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      getBookingUrgency(modalDraft).isUrgent
                        ? 'text-[#B91C1C] font-bold'
                        : 'text-[#475569]'
                    }
                  >
                    {getBookingUrgency(modalDraft).label}
                  </span>
                  {getPendingAttentionInfo(modalDraft, nowMs).needsAttention && (
                    <span className="inline-flex items-center gap-1 rounded border border-[#D97706] bg-[#FEF3C7] px-2 py-0.5 text-[10.5px] font-bold text-[#92400E]">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-[#B45309]" aria-hidden="true" />
                      <span>
                        Attention Required · Pending {getPendingAttentionInfo(modalDraft, nowMs).elapsedLabel}
                      </span>
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  {modalMode === 'create'
                    ? 'Add Manual Booking'
                    : modalMode === 'ticket'
                    ? `${modalDraft.guestName} — ${modalDraft.tripTitle}`
                    : `Edit Booking: ${modalDraft.guestName || modalDraft.id}`}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {modalMode === 'ticket' && (
                  <button
                    type="button"
                    onClick={() => setModalMode('edit')}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#EA580C] bg-[#FFF7ED] px-3.5 text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>تعديل الحجز · Edit Booking</span>
                  </button>
                )}
                {modalMode === 'edit' && (
                  <button
                    type="button"
                    onClick={() => setModalMode('ticket')}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
                    <span>← عرض التيكت · Back to Ticket</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setModalMode(null);
                    setModalDraft(null);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {modalMode === 'ticket' ? (
              <div className="p-6 space-y-5">
                {getPendingAttentionInfo(modalDraft, nowMs).needsAttention && (
                  <div
                    role="status"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#D97706] bg-[#FFFBEB] px-4 py-3 text-xs text-[#92400E]"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
                      <span>
                        <strong className="font-bold">Attention Required:</strong> Pending for{' '}
                        <strong className="font-mono">
                          {getPendingAttentionInfo(modalDraft, nowMs).elapsedLabel}
                        </strong>{' '}
                        (longer than 4 hours). Please confirm or follow up with the supplier.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateBooking(modalDraft.id, { status: 'Confirmed' });
                        setModalDraft((prev) => (prev ? { ...prev, status: 'Confirmed' } : prev));
                      }}
                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg bg-[#0D9488] px-3 font-semibold text-white hover:bg-[#0F766E] cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Confirm Now · تأكيد الآن</span>
                    </button>
                  </div>
                )}
                <div className="overflow-hidden rounded-2xl border-2 border-[#EA580C]/40 bg-white shadow-lg">
                  <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#FDBA74]">
                        WASLA TRAVEL CUSTOMER TICKET · تيكت حجز العميل
                      </span>
                      <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                        {modalDraft.tripTitle}
                      </div>
                      <div className="text-xs text-[#E2E8F0]">
                        {modalDraft.destination} · {modalDraft.category} · Supplier: {modalDraft.supplierName}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-lg bg-[#EA580C] px-3 py-1 font-mono text-xs font-bold text-white">
                        {modalDraft.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="rounded bg-white/15 px-2 py-0.5 font-semibold text-white">
                          {modalDraft.status}
                        </span>
                        <span className="rounded bg-[#10B981]/25 px-2 py-0.5 font-semibold text-[#A7F3D0]">
                          {modalDraft.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          اسم الزبون · Guest Name
                        </span>
                        <strong className="mt-1 block text-sm font-bold text-[#0F172A]">
                          {modalDraft.guestName}
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/70 p-3">
                        <span className="block text-[11px] font-semibold text-[#9A3412]">
                          الجنسية · Nationality
                        </span>
                        <strong className="mt-1 block text-sm font-bold text-[#EA580C]">
                          {modalDraft.guestCountry || 'Guest'}
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3">
                        <span className="block text-[11px] font-semibold text-[#15803D]">
                          إجمالي التيكت · Total Price
                        </span>
                        <strong className="mt-1 block font-mono text-base font-extrabold text-[#15803D] tabular-nums">
                          €{modalDraft.grossEur}
                        </strong>
                      </div>
                    </div>

                    <div className="relative flex items-center py-1">
                      <div className="h-4 w-4 -ms-8 rounded-full bg-[#0F172A]/10 border border-[#CBD5E1]" />
                      <div className="flex-1 border-t-2 border-dashed border-[#CBD5E1]" />
                      <div className="h-4 w-4 -me-8 rounded-full bg-[#0F172A]/10 border border-[#CBD5E1]" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/60 p-3.5 space-y-1.5">
                        <span className="block text-[11px] font-semibold text-[#9A3412]">
                          المواعيد والتاريخ · Date, Trip Start &amp; Pickup
                        </span>
                        <div className="text-xs font-medium text-[#334155] tabular-nums space-y-0.5">
                          <div>
                            التاريخ · Date:{' '}
                            <strong className="font-mono text-[#0F172A]">{modalDraft.date}</strong>
                          </div>
                          {modalDraft.tripStartTime && (
                            <div>
                              توقيت بداية الرحلة · Trip Start:{' '}
                              <strong className="text-[#EA580C]">{modalDraft.tripStartTime}</strong>
                            </div>
                          )}
                          <div>
                            موعد البيك أب · Hotel Pickup:{' '}
                            <strong className="font-mono text-[#0F172A]">
                              {modalDraft.pickupTime || 'TBD'}
                            </strong>
                          </div>
                        </div>
                        <span className="block text-[11px] font-semibold text-[#EA580C]">
                          {modalDraft.pickupSpot === 'Outside Main Gate'
                            ? 'Outside Main Gate (أمام البوابة بره)'
                            : 'Inside Reception (أمام الريسبشن جوه)'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/60 p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#9A3412]">
                          الفندق ورقم الغرفة · Hotel &amp; Room
                        </span>
                        <strong className="block text-sm font-bold text-[#0F172A]">
                          {modalDraft.hotel}
                        </strong>
                        <span className="block text-[11px] font-semibold text-[#475569]">
                          {modalDraft.roomNumber
                            ? `Room No: ${modalDraft.roomNumber}`
                            : 'Room number not added yet'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          عدد الأفراد · Guests Manifest
                        </span>
                        <strong className="block text-sm font-bold text-[#0F172A] tabular-nums">
                          {modalDraft.adults} Adults
                          {modalDraft.children > 0 ? ` + ${modalDraft.children} Children` : ''}
                          {(modalDraft.infants ?? 0) > 0 ? ` + ${modalDraft.infants} Infants (INF)` : ''}
                        </strong>
                        <span className="block text-[11px] font-medium text-[#EA580C]">
                          إجمالي الكشف: {modalDraft.adults + modalDraft.children + (modalDraft.infants ?? 0)} فرد
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          بيانات التواصل · Guest Contact
                        </span>
                        <strong className="block font-mono text-xs font-bold text-[#0F172A] tabular-nums">
                          WA: {modalDraft.guestWhatsapp || modalDraft.guestContact || '—'}
                        </strong>
                        <span className="block text-xs font-medium text-[#334155] break-all">
                          Email: {modalDraft.guestEmail || '—'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          المورد والسائق · Supplier &amp; Driver
                        </span>
                        <strong className="block text-xs sm:text-sm font-bold text-[#0F172A]">
                          {modalDraft.supplierName}
                        </strong>
                        <span className="block text-xs font-medium text-[#EA580C]">
                          Driver / Guide: {modalDraft.assignedDriverOrGuide || 'لم يتم التعيين بعد'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          ملاحظات الحجز · Notes
                        </span>
                        <p className="text-xs font-medium text-[#334155]">
                          {modalDraft.notes || 'لا توجد ملاحظات إضافية.'}
                        </p>
                      </div>
                    </div>

                    {modalDraft.locationImageUrl && (
                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 space-y-1.5">
                        <span className="block text-xs font-semibold text-[#0F172A]">
                          صورة بوابة الفندق / كارت الغرفة
                        </span>
                        <img
                          src={modalDraft.locationImageUrl}
                          alt="Hotel gate or room card"
                          className="max-h-48 w-auto rounded-lg object-contain mx-auto border border-[#E2E8F0] bg-white p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Actions Bar on the Ticket */}
                {(() => {
                  const livePickup = formatPickupTime(pickupClock, pickupPeriod);
                  const liveWaUrl = buildGuestPickupWhatsAppUrl({
                    guestWhatsapp: modalDraft.guestWhatsapp,
                    guestContact: modalDraft.guestContact,
                    bookingId: modalDraft.id,
                    guestName: modalDraft.guestName || 'Guest',
                    tripTitle: modalDraft.tripTitle || 'Excursion',
                    date: modalDraft.date,
                    tripStartTime: modalDraft.tripStartTime,
                    pickupTime: modalDraft.pickupTime || livePickup,
                    pickupSpot: modalDraft.pickupSpot,
                    hotel: modalDraft.hotel || 'Hotel',
                    roomNumber: modalDraft.roomNumber,
                    driverOrGuide: modalDraft.assignedDriverOrGuide,
                  });
                  const liveEmailUrl = buildGuestPickupMailtoUrl({
                    guestEmail: modalDraft.guestEmail,
                    guestContact: modalDraft.guestContact,
                    bookingId: modalDraft.id,
                    guestName: modalDraft.guestName || 'Guest',
                    tripTitle: modalDraft.tripTitle || 'Excursion',
                    date: modalDraft.date,
                    tripStartTime: modalDraft.tripStartTime,
                    pickupTime: modalDraft.pickupTime || livePickup,
                    pickupSpot: modalDraft.pickupSpot,
                    hotel: modalDraft.hotel || 'Hotel',
                    roomNumber: modalDraft.roomNumber,
                    driverOrGuide: modalDraft.assignedDriverOrGuide,
                  });
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {liveWaUrl && (
                          <a
                            href={liveWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#16A34A] px-3.5 text-xs font-semibold text-white hover:bg-[#15803D]"
                          >
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>إرسال عبر واتساب · Send WhatsApp</span>
                          </a>
                        )}
                        {liveEmailUrl && (
                          <a
                            href={liveEmailUrl}
                            onClick={() => {
                              if (onLogDispatchEmail) {
                                onLogDispatchEmail(
                                  modalDraft.guestEmail || modalDraft.guestContact,
                                  `Pickup Details — ${modalDraft.id} (${modalDraft.date})`,
                                  'Booking Confirmation'
                                );
                              }
                            }}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#EA580C] bg-[#FFF7ED] px-3.5 text-xs font-semibold text-[#EA580C] hover:bg-[#FFEDD5]"
                          >
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>إرسال إيميل · Send Email</span>
                          </a>
                        )}
                        {modalDraft.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateBooking(modalDraft.id, { status: 'Confirmed' });
                              setModalDraft((prev) =>
                                prev ? { ...prev, status: 'Confirmed' } : prev
                              );
                            }}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#0D9488] px-3.5 text-xs font-semibold text-white hover:bg-[#0F766E] cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>تأكيد الحجز سريعاً · Quick Confirm</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setModalMode('edit')}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#EA580C] px-4 text-xs font-semibold text-white hover:bg-[#C2410C] cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>تعديل الحجز · Edit Booking</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalMode(null);
                            setModalDraft(null);
                          }}
                          className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#475569] cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
            <form onSubmit={handleSaveBookingModal} className="p-6 space-y-5">
              {getPendingAttentionInfo(modalDraft, nowMs).needsAttention && (
                <div
                  role="status"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#D97706] bg-[#FFFBEB] px-4 py-3 text-xs text-[#92400E]"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
                    <span>
                      <strong className="font-bold">Attention Required:</strong> This request has remained{' '}
                      <strong>Pending</strong> for{' '}
                      <strong className="font-mono">
                        {getPendingAttentionInfo(modalDraft, nowMs).elapsedLabel}
                      </strong>{' '}
                      (over 4 hours).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setModalDraft((prev) => (prev ? { ...prev, status: 'Confirmed' } : prev))
                    }
                    className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-[#D97706] px-2.5 text-[11px] font-bold text-white hover:bg-[#B45309] cursor-pointer"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    <span>Mark Confirmed</span>
                  </button>
                </div>
              )}
              {/* Guest Name + Nationality + Trip Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Guest Name / اسم الزبون
                  </span>
                  <input
                    type="text"
                    required
                    value={modalDraft.guestName}
                    onChange={(e) =>
                      setModalDraft((prev) => (prev ? { ...prev, guestName: e.target.value } : prev))
                    }
                    placeholder="e.g. Hannah Weber"
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Nationality / الجنسية
                  </span>
                  <input
                    type="text"
                    value={modalDraft.guestCountry || ''}
                    onChange={(e) =>
                      setModalDraft((prev) => (prev ? { ...prev, guestCountry: e.target.value } : prev))
                    }
                    placeholder="e.g. German, British, Egyptian..."
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Trip / Service Title · اسم الرحلة
                  </span>
                  <input
                    type="text"
                    required
                    value={modalDraft.tripTitle}
                    onChange={(e) =>
                      setModalDraft((prev) => (prev ? { ...prev, tripTitle: e.target.value } : prev))
                    }
                    placeholder="Type or edit trip title…"
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
                  />
                </label>
              </div>

              {/* Date, Destination, Category, Hotel, Room Number */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <label className="sm:col-span-3 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Trip Date
                  </span>
                  <input
                    type="date"
                    required
                    value={modalDraft.date}
                    onChange={(e) =>
                      setModalDraft((prev) => (prev ? { ...prev, date: e.target.value } : prev))
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-medium tabular-nums"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Destination
                  </span>
                  <select
                    value={modalDraft.destination}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, destination: e.target.value as DestinationRegion } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium"
                  >
                    <option value="Hurghada">Hurghada</option>
                    <option value="Marsa Alam">Marsa Alam</option>
                    <option value="Luxor">Luxor</option>
                    <option value="Cairo">Cairo</option>
                  </select>
                </label>

                <label className="sm:col-span-2 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Category
                  </span>
                  <select
                    value={modalDraft.category}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev
                          ? { ...prev, category: e.target.value as ActivityCategoryId | 'custom' }
                          : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium"
                  >
                    <option value="sea">Sea trips</option>
                    <option value="desert">Desert trips</option>
                    <option value="historical">Historical</option>
                    <option value="horse">Horse riding</option>
                    <option value="guides">Egyptian guides</option>
                    <option value="shopping">Shopping</option>
                    <option value="city">City tour</option>
                    <option value="transfers">Transfers</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>

                <label className="sm:col-span-3 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Hotel / Meeting Point
                  </span>
                  <input
                    type="text"
                    required
                    list="ops-egypt-hotels-list"
                    value={modalDraft.hotel}
                    onChange={(e) =>
                      setModalDraft((prev) => (prev ? { ...prev, hotel: e.target.value } : prev))
                    }
                    placeholder="Type hotel name…"
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-medium"
                  />
                  <datalist id="ops-egypt-hotels-list">
                    {CURATED_EGYPT_HOTELS.map((h) => (
                      <option key={h.name} value={h.name}>
                        {h.area}
                      </option>
                    ))}
                  </datalist>
                </label>

                <label className="sm:col-span-2 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Room No.
                  </span>
                  <input
                    type="text"
                    value={modalDraft.roomNumber || ''}
                    onChange={(e) =>
                      setModalDraft((prev) => (prev ? { ...prev, roomNumber: e.target.value } : prev))
                    }
                    placeholder="e.g. 412"
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-medium tabular-nums"
                  />
                </label>
              </div>

              {/* Explicit Pickup Time (AM / PM) & Pickup Spot (Inside Reception vs Outside Main Gate) */}
              <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                  <Clock className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
                  <span>Trip Start Time &amp; Hotel Pickup Schedule (بداية الرحلة وموعد البيك أب)</span>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    توقيت بداية الرحلة · Trip Start Time (or Flight Time)
                  </span>
                  <input
                    type="text"
                    value={modalDraft.tripStartTime || ''}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, tripStartTime: e.target.value } : prev
                      )
                    }
                    placeholder="e.g. 09:00 AM · 02:30 PM (Sunset) · According to flight time"
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#EA580C]"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <label className="sm:col-span-3 block space-y-1">
                    <span className="text-xs font-semibold text-[#0F172A]">Pickup Clock</span>
                    <input
                      type="text"
                      value={pickupClock}
                      onChange={(e) => setPickupClock(e.target.value)}
                      placeholder="08:30"
                      maxLength={10}
                      className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm font-semibold tabular-nums"
                    />
                  </label>

                  <div className="sm:col-span-3 space-y-1">
                    <span className="block text-xs font-semibold text-[#0F172A]">AM / PM</span>
                    <div className="grid grid-cols-2 rounded-lg border border-[#CBD5E1] bg-white p-0.5">
                      {(['AM', 'PM'] as const).map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setPickupPeriod(period)}
                          className={`min-h-[34px] rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                            pickupPeriod === period
                              ? 'bg-[#EA580C] text-white'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-6 space-y-1">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#0F172A]">
                      <MapPin className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
                      <span>Pickup Spot (جوه عند الريسبشن / بره أمام البوابة)</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          {
                            value: 'Inside Reception' as PickupSpot,
                            label: 'Inside Reception (جوه)',
                          },
                          {
                            value: 'Outside Main Gate' as PickupSpot,
                            label: 'Outside Main Gate (بره)',
                          },
                        ]
                      ).map((opt) => {
                        const active = (modalDraft.pickupSpot || 'Inside Reception') === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setModalDraft((prev) =>
                                prev ? { ...prev, pickupSpot: opt.value } : prev
                              )
                            }
                            className={`min-h-[38px] rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                              active
                                ? 'border-[#EA580C] bg-[#EA580C] text-white'
                                : 'border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#EA580C]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable WhatsApp + Editable Email (Manual input without country chip clutter) */}
              <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]/60 p-4 space-y-3">
                <div className="text-xs font-semibold text-[#15803D]">
                  Guest WhatsApp & Email (رقم الواتساب والإيميل)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#0F172A]">
                      WhatsApp Number
                    </span>
                    <input
                      type="text"
                      value={modalDraft.guestWhatsapp || ''}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, guestWhatsapp: e.target.value } : prev
                        )
                      }
                      placeholder="+49 170 1234567"
                      className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm tabular-nums"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#0F172A]">Guest Email</span>
                    <input
                      type="email"
                      value={modalDraft.guestEmail || ''}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, guestEmail: e.target.value } : prev
                        )
                      }
                      placeholder="guest@example.com"
                      className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm"
                    />
                  </label>
                </div>
              </div>

              {/* Pax, Price, Supplier, Driver, Payment, Status — Cleanly Aligned */}
              <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                <label className="sm:col-span-2 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Adults
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={modalDraft.adults}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, adults: Number(e.target.value) } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium tabular-nums"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Children
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={modalDraft.children}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, children: Number(e.target.value) } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium tabular-nums"
                  />
                </label>

                <label className="sm:col-span-2 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Infants (INF)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={modalDraft.infants ?? 0}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, infants: Number(e.target.value) } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium tabular-nums"
                  />
                </label>

                <label className="sm:col-span-3 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Guest Selling Price (€)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={modalDraft.grossEur}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, grossEur: Number(e.target.value) } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-mono font-semibold tabular-nums"
                  />
                </label>

                <label className="sm:col-span-3 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Supplier
                  </span>
                  <select
                    value={modalDraft.supplierName}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, supplierName: e.target.value } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sm:col-span-4 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Driver / Guide
                  </span>
                  <input
                    type="text"
                    value={modalDraft.assignedDriverOrGuide}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, assignedDriverOrGuide: e.target.value } : prev
                      )
                    }
                    placeholder="Driver name & plate…"
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium"
                  />
                </label>

                <label className="sm:col-span-4 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Payment Status
                  </span>
                  <select
                    value={modalDraft.paymentStatus}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, paymentStatus: e.target.value as PaymentStatus } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-medium"
                  >
                    <option value="Awaiting link">Awaiting link</option>
                    <option value="Link sent">Link sent</option>
                    <option value="Paid online">Paid online</option>
                    <option value="Cash on pickup">Cash on pickup</option>
                  </select>
                </label>

                <label className="sm:col-span-4 flex flex-col justify-end space-y-1.5">
                  <span className="block truncate whitespace-nowrap text-xs font-semibold text-[#0F172A]">
                    Booking Status
                  </span>
                  <select
                    value={modalDraft.status}
                    onChange={(e) =>
                      setModalDraft((prev) =>
                        prev ? { ...prev, status: e.target.value as BookingStatus } : prev
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Driver assigned">Driver assigned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No show">No show</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </label>
              </div>

              {/* Hotel / Pickup Location Screenshot Attachment */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A]">
                      Hotel Gate / Room Card Photo · صورة بوابة الفندق أو كارت الغرفة
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Attach a hotel gate photo or room card for the driver.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={locImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingLocImage(true);
                        try {
                          const dataUrl = await compressBookingImageFile(file);
                          if (dataUrl) {
                            setModalDraft((prev) =>
                              prev ? { ...prev, locationImageUrl: dataUrl } : prev
                            );
                          }
                        } finally {
                          setUploadingLocImage(false);
                          if (locImageInputRef.current) locImageInputRef.current.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => locImageInputRef.current?.click()}
                      disabled={uploadingLocImage}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] cursor-pointer"
                    >
                      <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{uploadingLocImage ? 'Uploading…' : 'Upload Screenshot / صورة'}</span>
                    </button>
                    {modalDraft.locationImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setModalDraft((prev) => (prev ? { ...prev, locationImageUrl: '' } : prev))
                        }
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {modalDraft.locationImageUrl && (
                  <div className="wasla-img-glare overflow-hidden rounded-lg border border-[#CBD5E1] bg-white p-2">
                    <img
                      src={modalDraft.locationImageUrl}
                      alt="Hotel or pickup location screenshot"
                      className="max-h-52 w-auto rounded object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F172A]">Operations Notes</span>
                <textarea
                  rows={2}
                  value={modalDraft.notes}
                  onChange={(e) =>
                    setModalDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))
                  }
                  placeholder="Outer zone surcharge, special dietary/child seat notes…"
                  className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs"
                />
              </label>

              {/* Footer: Instant WhatsApp + Email Pickup Buttons, Cancel / No Show & Save */}
              {(() => {
                const livePickup = formatPickupTime(pickupClock, pickupPeriod);
                const liveWaUrl = buildGuestPickupWhatsAppUrl({
                  guestWhatsapp: modalDraft.guestWhatsapp,
                  guestContact: modalDraft.guestContact,
                  bookingId: modalDraft.id,
                  guestName: modalDraft.guestName || 'Guest',
                  tripTitle: modalDraft.tripTitle || 'Excursion',
                  date: modalDraft.date,
                  tripStartTime: modalDraft.tripStartTime,
                  pickupTime: livePickup,
                  pickupSpot: modalDraft.pickupSpot,
                  hotel: modalDraft.hotel || 'Hotel',
                  roomNumber: modalDraft.roomNumber,
                  driverOrGuide: modalDraft.assignedDriverOrGuide,
                });
                const liveEmailUrl = buildGuestPickupMailtoUrl({
                  guestEmail: modalDraft.guestEmail,
                  guestContact: modalDraft.guestContact,
                  bookingId: modalDraft.id,
                  guestName: modalDraft.guestName || 'Guest',
                  tripTitle: modalDraft.tripTitle || 'Excursion',
                  date: modalDraft.date,
                  tripStartTime: modalDraft.tripStartTime,
                  pickupTime: livePickup,
                  pickupSpot: modalDraft.pickupSpot,
                  hotel: modalDraft.hotel || 'Hotel',
                  roomNumber: modalDraft.roomNumber,
                  driverOrGuide: modalDraft.assignedDriverOrGuide,
                });
                return (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {liveWaUrl ? (
                        <a
                          href={liveWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#16A34A] px-3.5 text-xs font-semibold text-white hover:bg-[#15803D]"
                        >
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Send WhatsApp Pickup</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#64748B]">Add WhatsApp to enable WA button</span>
                      )}
                      {liveEmailUrl && (
                        <a
                          href={liveEmailUrl}
                          onClick={() => {
                            if (onLogDispatchEmail) {
                              onLogDispatchEmail(
                                modalDraft.guestEmail || modalDraft.guestContact,
                                `Pickup Details — ${modalDraft.id} (${modalDraft.date})`,
                                'Booking Confirmation'
                              );
                            }
                          }}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#EA580C] bg-[#FFF7ED] px-3.5 text-xs font-semibold text-[#EA580C] hover:bg-[#FFEDD5]"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Send Email Pickup</span>
                        </a>
                      )}
                      {modalMode === 'edit' && (
                        <>
                          {!confirmCancelStep ? (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelStep(true)}
                              className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                            >
                              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Cancel Booking</span>
                            </button>
                          ) : (
                            <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-[#EF4444] bg-[#FEF2F2] px-3 py-1.5">
                              <span className="text-[11px] font-bold text-[#991B1B]">
                                تأكيد الإلغاء (خطوة ٢/٢): هل أنت متأكد؟
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateBooking(modalDraft.id, { status: 'Cancelled' });
                                  setModalDraft((prev) =>
                                    prev ? { ...prev, status: 'Cancelled' } : prev
                                  );
                                  setConfirmCancelStep(false);
                                }}
                                className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-[#DC2626] px-2.5 text-[11px] font-semibold text-white hover:bg-[#B91C1C] cursor-pointer"
                              >
                                <XCircle className="h-3 w-3" aria-hidden="true" />
                                <span>Confirm Cancel · تأكيد نهائي</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmCancelStep(false)}
                                className="inline-flex min-h-[28px] items-center rounded-md border border-[#CBD5E1] bg-white px-2.5 text-[11px] font-semibold text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
                              >
                                تراجع
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateBooking(modalDraft.id, { status: 'No show' });
                              setModalDraft((prev) =>
                                prev ? { ...prev, status: 'No show' } : prev
                              );
                            }}
                            className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 text-xs font-semibold text-[#B45309] hover:bg-[#FEF3C7] cursor-pointer"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>No Show</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {modalMode === 'edit' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmCancelStep(false);
                            setModalMode('ticket');
                          }}
                          className="min-h-[40px] rounded-lg border border-[#CBD5E1] px-4 text-xs font-semibold text-[#475569] cursor-pointer"
                        >
                          ← Back to Ticket
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmCancelStep(false);
                            setModalMode(null);
                            setModalDraft(null);
                          }}
                          className="min-h-[40px] rounded-lg border border-[#CBD5E1] px-4 text-xs font-semibold text-[#475569] cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={savingBooking}
                        className="min-h-[40px] rounded-lg bg-[#EA580C] px-5 text-xs font-semibold text-white hover:bg-[#C2410C] disabled:opacity-60 cursor-pointer"
                      >
                        {savingBooking
                          ? 'Saving…'
                          : modalMode === 'create'
                          ? 'Create Booking'
                          : 'Save & View Ticket'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
