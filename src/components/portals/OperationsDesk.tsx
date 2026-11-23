import { ConversationWorkspace } from '../conversations/ConversationPanel';
import { createBookingReference } from '../../lib/bookingReference';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '../../lib/apiAuth';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Unlock,
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
  buildGuestPickupWhatsAppUrl,
  buildLocalizedPickupConfirmationEmail,
  normalizeWhatsAppDigits,
  resolveGuestLanguageCode,
} from '../../lib/whatsapp';
import { CURATED_EGYPT_HOTELS } from '../WaslaHotelMapPicker';
import { HorizontalScrollTableFrame } from '../HorizontalScrollTableFrame';

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
type DispatchTemplateId = 'welcome' | 'payment' | 'pickup' | 'custom';

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

function addOneDayIso(isoDate: string): string {
  const base = isoDate ? new Date(`${isoDate}T12:00:00Z`) : new Date();
  if (Number.isNaN(base.getTime())) {
    return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  }
  base.setUTCDate(base.getUTCDate() + 1);
  return base.toISOString().slice(0, 10);
}

function buildDispatchEmailTemplate(
  templateId: DispatchTemplateId,
  b: PlatformBooking,
  _operatorIsAr: boolean
): { subject: string; body: string; logType: PlatformEmailLog['type'] } {
  const guestLangCode = resolveGuestLanguageCode(undefined, b.notes, b.guestLang);
  const guestIsAr = guestLangCode === 'ar';

  if (templateId === 'pickup') {
    const localized = buildLocalizedPickupConfirmationEmail({
      bookingId: b.id,
      guestName: b.guestName,
      tripTitle: b.tripTitle,
      date: b.date,
      tripStartTime: b.tripStartTime,
      pickupTime: b.pickupTime,
      pickupSpot: b.pickupSpot,
      hotel: b.hotel,
      roomNumber: b.roomNumber,
      guestCountry: b.guestCountry,
      adults: b.adults,
      children: b.children,
      infants: b.infants,
      grossEur: b.grossEur,
      paymentStatus: b.paymentStatus,
      driverOrGuide: b.assignedDriverOrGuide,
      notes: b.notes,
      guestLang: b.guestLang,
    });
    return {
      logType: 'Booking Confirmation',
      subject: localized.subject,
      body: localized.body,
    };
  }

  if (templateId === 'welcome') {
    return {
      logType: 'Booking Confirmation',
      subject: guestIsAr
        ? `استلام طلب حجزك ${b.id}، ${b.tripTitle}`
        : `Booking Request Received (${b.id}), ${b.tripTitle}`,
      body: guestIsAr
        ? `مرحباً ${b.guestName}،\n\nشكرًا لحجزك مع وصلة ترافيل. استلمنا طلب حجزك رقم ${b.id} لرحلة "${b.tripTitle}" بتاريخ ${b.date} (${b.adults} بالغين${b.children > 0 ? ` + ${b.children} أطفال` : ''}${(b.infants ?? 0) > 0 ? ` + ${b.infants} رضع` : ''}).\n\nنقوم حالياً بمراجعة الإتاحة وتحديد موعد البيك أب الدقيق لفندقك (${b.hotel})، وسنرسل لك التأكيد النهائي وتذكرة الصعود قريباً.\n\nمع التحية،\nفريق عمليات وصلة ترافيل`
        : `Dear ${b.guestName},\n\nThank you for choosing Wasla Travel. We have received your booking request (${b.id}) for "${b.tripTitle}" on ${b.date} (${b.adults} Adults${b.children > 0 ? `, ${b.children} Children` : ''}${(b.infants ?? 0) > 0 ? `, ${b.infants} Infants` : ''}).\n\nOur Reservations & Dispatch team is verifying seat availability and assigning your exact pickup time from ${b.hotel}. Your final Digital Boarding Voucher will unlock as soon as confirmed.\n\nWarm regards,\nWasla Travel Operations Desk`,
    };
  }

  if (templateId === 'payment') {
    return {
      logType: 'Payment Link',
      subject: guestIsAr
        ? `تأكيد الإتاحة وخيارات الدفع، حجز ${b.id} (€${b.grossEur})`
        : `Availability Confirmed & Payment Options, ${b.id} (€${b.grossEur})`,
      body: guestIsAr
        ? `مرحباً ${b.guestName}،\n\nيسعدنا إبلاغك بتأكيد الإتاحة لرحلتك "${b.tripTitle}" (${b.id}) بتاريخ ${b.date}.\n\n• إجمالي المبلغ: €${b.grossEur}\n• طريقة الدفع الحالية: ${b.paymentStatus}\n• العملات المقبولة عند الدفع كاش: يورو (EUR) أو دولار (USD) أو جنيه مصري (EGP)\n\nيمكنك السداد كاش عند الاستلام من الفندق بأي عملة تفضلها، أو الرد علينا إذا كنت تفضل الدفع أونلاين عبر رابط دفع رسمي.\n\nمع التحية،\nفريق عمليات وصلة ترافيل`
        : `Dear ${b.guestName},\n\nWe are pleased to confirm seat availability for "${b.tripTitle}" (${b.id}) on ${b.date}.\n\n• Total Amount: €${b.grossEur}\n• Registered Payment Method: ${b.paymentStatus}\n• Accepted Currencies for Cash on Pickup: EUR, USD, or EGP\n\nYou may pay Cash on pickup in EUR, USD, or EGP, or reply to this message if you would like us to send an official online payment link.\n\nWarm regards,\nWasla Travel Operations Desk`,
    };
  }

  return {
    logType: 'Booking Confirmation',
    subject: guestIsAr
      ? `متابعة بخصوص حجزك ${b.id}، ${b.tripTitle}`
      : `Update Regarding Your Booking ${b.id}, ${b.tripTitle}`,
    body: guestIsAr
      ? `مرحباً ${b.guestName}،\n\nبخصوص حجزك رقم ${b.id} لرحلة "${b.tripTitle}" بتاريخ ${b.date}:\n\n`
      : `Dear ${b.guestName},\n\nRegarding your booking ${b.id} for "${b.tripTitle}" on ${b.date}:\n\n`,
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
  commissionRate,
  whatsappNumber,
  contactEmail,
  onLogDispatchEmail,
  onCreateBooking,
  onUpdateBooking,
  onSendChatMessage,
  onCreateChat,
  onUpdateComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<OpsTab>('sheet');
  const [workspaceLang, setWorkspaceLang] = useState<'en' | 'ar'>('en');
  const [commsSubView, setCommsSubView] = useState<'chats' | 'dispatch'>('chats');
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filters & multi-select state for Booking Sheet
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'attention'>('all');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  // Quick Dispatch 4-Template Composer State
  const [dispatchBookingId, setDispatchBookingId] = useState<string>(bookings[0]?.id || '');
  const [dispatchTemplateId, setDispatchTemplateId] = useState<DispatchTemplateId>('pickup');
  const [dispatchSubject, setDispatchSubject] = useState<string>('');
  const [dispatchBody, setDispatchBody] = useState<string>('');
  const [dispatchSentToast, setDispatchSentToast] = useState<string>('');

  // Interactive Email / Message Reader Modal State (works from Guest Comms AND Cases & Refunds)
  const [readerModal, setReaderModal] = useState<
    | { kind: 'email'; email: PlatformEmailLog; caseItem?: ComplaintCase }
    | { kind: 'chat'; thread: ChatThread; caseItem?: ComplaintCase }
    | null
  >(null);

  // Selected Supplier for Full Manifest & Settlement Inspector
  const [selectedSupplierName, setSelectedSupplierName] = useState<string | null>(null);

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

  const isAr = workspaceLang === 'ar';
  const safeCommissionPct = Math.max(0, Math.min(100, Number(commissionRate) || 15));

  // Allow closing an opened Supplier Excel/Manifest Sheet with Escape key (when no modal is open)
  useEffect(() => {
    if (!selectedSupplierName || modalMode || readerModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSupplierName(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedSupplierName, modalMode, readerModal]);

  const sortedBookings = useMemo(() => sortBookingsNewestFirst(bookings), [bookings]);

  // Keep dispatchBookingId synced with newest booking if empty
  useEffect(() => {
    if (!dispatchBookingId && sortedBookings.length > 0) {
      setDispatchBookingId(sortedBookings[0].id);
    }
  }, [dispatchBookingId, sortedBookings]);

  const activeDispatchBooking = useMemo(
    () => sortedBookings.find((b) => b.id === dispatchBookingId) || sortedBookings[0] || null,
    [sortedBookings, dispatchBookingId]
  );

  // Populate editable template subject & body whenever template, booking, or language changes
  useEffect(() => {
    if (!activeDispatchBooking) return;
    const tpl = buildDispatchEmailTemplate(dispatchTemplateId, activeDispatchBooking, isAr);
    setDispatchSubject(tpl.subject);
    setDispatchBody(tpl.body);
  }, [dispatchTemplateId, activeDispatchBooking?.id, isAr]);

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

  // Complaint case conversation state
  const [openComplaintId, setOpenComplaintId] = useState<string | null>(
    complaints[0]?.id ?? null
  );
  const [complaintChannelTab, setComplaintChannelTab] = useState<
    Record<string, 'all' | 'whatsapp' | 'email'>
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
      id: createBookingReference(),
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
      paymentStatus: 'Cash on pickup',
      status: 'Confirmed',
      notes: '',
      createdAtMs: Date.now(),
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

  const handleRescheduleTomorrow = (booking: PlatformBooking) => {
    const nextDate = addOneDayIso(booking.date);
    const weatherNote = isAr
      ? `[تأجيل 24 ساعة بسبب الرياح/الطقس إلى ${nextDate}]`
      : `[Rescheduled +1 Day due to Marina Wind/Weather to ${nextDate}]`;
    const mergedNotes = [booking.notes, weatherNote].filter(Boolean).join(' · ');
    onUpdateBooking(booking.id, {
      date: nextDate,
      notes: mergedNotes,
    });
    if (modalDraft && modalDraft.id === booking.id) {
      setModalDraft((prev) => (prev ? { ...prev, date: nextDate, notes: mergedNotes } : prev));
    }
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
        if (urgencyFilter === 'urgent' && !urg.isUrgent && !attn.needsAttention) return false;
        if (urgencyFilter === 'attention' && !attn.needsAttention) return false;
      }
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (supplierFilter !== 'all' && b.supplierName !== supplierFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (!q) return true;
      return [
        b.id,
        b.tripTitle,
        b.guestName,
        b.guestCountry,
        b.hotel,
        b.roomNumber,
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

  const exportBookingsToCsv = (targetBookings: PlatformBooking[], filenameSuffix: string) => {
    const headers = [
      'Booking Ref',
      'Booked At (Date & Time)',
      'Alert / Priority',
      'Trip Date',
      'Trip Start Time',
      'Hotel Pickup Time',
      'Meeting Spot',
      'Excursion / Service',
      'Category',
      'Destination',
      'Guest Name',
      'Nationality',
      'Hotel',
      'Room No.',
      'Passport / Permit Status',
      'Adults',
      'Children',
      'Infants (INF)',
      'Total Pax',
      'Booking Status',
      'Customer Voucher State',
      'Payment Method',
      'Accepted Currencies',
      'Gross Selling EUR',
      'Wasla Commission Rate %',
      'Wasla Commission EUR',
      'Supplier Net EUR',
      'Settlement Accounting Rule',
      'Supplier Name',
      'Driver / Guide',
      'Guest WhatsApp',
      'Guest Email',
      'Notes',
    ];

    const escapeCell = (val: string | number) => {
      const s = String(val ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = targetBookings.map((b) => {
      const urg = getBookingUrgency(b);
      const attn = getPendingAttentionInfo(b, nowMs);
      const bookedAt = formatBookedTimestamp(b.createdAtMs, nowMs, false);
      const bookedAtStr =
        bookedAt.clock !== '—' ? `${bookedAt.date} ${bookedAt.clock}` : 'Recorded';
      const priorityLabel = attn.needsAttention
        ? `URGENT OVERDUE (${attn.elapsedLabel})`
        : urg.level === 'today'
        ? 'URGENT TODAY'
        : urg.level === 'tomorrow'
        ? 'URGENT TOMORROW'
        : '';
      const isActiveFinance =
        b.status !== 'Cancelled' && b.status !== 'Refunded' && b.status !== 'No show';
      const gross = isActiveFinance ? b.grossEur : 0;
      const commEur = Math.round((gross * safeCommissionPct) / 100);
      const netEur = gross - commEur;
      const settlementRule = !isActiveFinance
        ? 'Cancelled / Refunded (0 EUR)'
        : b.paymentStatus === 'Paid online'
        ? `Collected Online by Wasla -> Wasla pays Supplier Net €${netEur}`
        : `Cash on Pickup (EUR/USD/EGP) collected by Supplier -> Supplier owes Wasla Commission €${commEur}`;
      const voucherUnlocked =
        b.status === 'Confirmed' || b.status === 'Driver assigned' || b.status === 'Completed'
          ? 'Unlocked (Confirmed)'
          : 'Locked (Awaiting Confirmation)';
      const permitState =
        b.destination === 'Marsa Alam'
          ? b.locationImageUrl
            ? `Passport Uploaded & Room ${b.roomNumber || 'Set'}`
            : 'Marsa Alam Passport Pending'
          : 'Not Required';

      return [
        b.id,
        bookedAtStr,
        priorityLabel,
        b.date,
        b.tripStartTime || '',
        b.pickupTime || 'TBD',
        b.pickupSpot || 'Inside Reception',
        b.tripTitle,
        b.category,
        b.destination,
        b.guestName,
        b.guestCountry || 'Guest',
        b.hotel,
        b.roomNumber || '',
        permitState,
        b.adults,
        b.children,
        b.infants ?? 0,
        b.adults + b.children + (b.infants ?? 0),
        b.status,
        voucherUnlocked,
        b.paymentStatus,
        'EUR / USD / EGP (Any Currency)',
        gross,
        `${safeCommissionPct}%`,
        commEur,
        netEur,
        settlementRule,
        b.supplierName,
        b.assignedDriverOrGuide || '',
        b.guestWhatsapp || b.guestContact || '',
        b.guestEmail || '',
        b.notes || '',
      ]
        .map(escapeCell)
        .join(',');
    });

    const csv = ['\uFEFF' + headers.map(escapeCell).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wasla-manifest-settlement-${filenameSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const targetBookings =
      selectedBookingsForCsv.length > 0 ? selectedBookingsForCsv : filteredBookings;
    const suffix =
      selectedBookingsForCsv.length > 0
        ? `selected-${selectedBookingsForCsv.length}`
        : dateFilter || 'all';
    exportBookingsToCsv(targetBookings, suffix);
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
      const res = await authFetch('/api/assistant', {
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
            (isAr
              ? `تم تجهيز الرد (${(data.targetLanguage || activeThread.customerLang).toUpperCase()})`
              : `Smart draft ready (${(data.targetLanguage || activeThread.customerLang).toUpperCase()})`),
        });
        window.setTimeout(() => composerRef.current?.focus(), 60);
      }
    } catch {
      setAiError(isAr ? 'تعذر الاتصال بخدمة المساعد الذكي.' : 'Network error contacting /api/assistant.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !composerText.trim()) return;
    window.dispatchEvent(new CustomEvent('wasla:open-conversation', {
      detail: { bookingId: activeThread.bookingRef, text: composerText.trim() },
    }));
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
      const res = await authFetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: sourceLang || 'auto',
          targetLang: isAr ? 'ar' : 'en',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.translation) {
        setTranslationErrors((prev) => ({
          ...prev,
          [msgId]: data.error || (isAr ? 'تعذر ترجمة الرسالة.' : 'Could not translate message.'),
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
        [msgId]: isAr ? 'تعذر الاتصال بالسيرفر للترجمة.' : 'Translation service unavailable.',
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
      const from = (log.from || '').toLowerCase();
      const ref = (log.bookingRef || '').toLowerCase();
      if (cleanRef && (sub.includes(cleanRef) || ref === cleanRef)) return true;
      if (
        linkedBooking?.guestEmail &&
        (to === linkedBooking.guestEmail.toLowerCase() ||
          from === linkedBooking.guestEmail.toLowerCase())
      ) {
        return true;
      }
      if (
        nameTokens.length > 0 &&
        nameTokens.every((t) => to.includes(t) || from.includes(t) || sub.includes(t))
      ) {
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
      const res = await authFetch('/api/assistant', {
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
          [c.id]: data.error || (isAr ? 'تعذر تجهيز الرد الذكي.' : 'Could not prepare smart draft.'),
        }));
      } else {
        setComplaintReplyText((prev) => ({ ...prev, [c.id]: data.draft }));
        setComplaintAiNote((prev) => ({
          ...prev,
          [c.id]:
            data.operatorNote ||
            (isAr
              ? `تم تجهيز الرد (${String(data.targetLanguage || defaultLang).toUpperCase()})`
              : `Draft prepared (${String(data.targetLanguage || defaultLang).toUpperCase()})`),
        }));
      }
    } catch {
      setComplaintAiError((prev) => ({
        ...prev,
        [c.id]: isAr ? 'تعذر الاتصال بالسيرفر.' : 'Error contacting server.',
      }));
    } finally {
      setComplaintAiLoading((prev) => ({ ...prev, [c.id]: false }));
    }
  };

  const handleSendComplaintChatReply = (c: ComplaintCase) => {
    setActiveTab('chat');
    // Dispatch after mounting the shared inbox; no legacy record is marked sent.
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('wasla:open-conversation', { detail: { bookingId: c.bookingRef, text: complaintReplyText[c.id] || '' } })), 100);
  };

  const handleSendComplaintEmail = (c: ComplaintCase) => {
    const { linkedBooking, linkedEmails } = getComplaintCaseContext(c);
    const recipient =
      linkedBooking?.guestEmail ||
      linkedEmails.find((e) => e.direction === 'inbound' && e.from)?.from ||
      linkedEmails.find((e) => !e.to.includes('dispatch@') && !e.to.includes('info@') && !e.to.includes('booking@'))?.to ||
      '';
    const subject = `${c.bookingRef} Case Resolution (${c.id}), ${c.issueType}`;
    const bodyText =
      (complaintReplyText[c.id] || '').trim() ||
      `Dear ${c.customerName},\n\nRegarding booking ${c.bookingRef} (${c.tripTitle}):\n${c.summary}\n\nBest regards,\nWasla Travel Reservations & Quality Desk`;

    if (onLogDispatchEmail) {
      onLogDispatchEmail(
        recipient || `${c.customerName} (${c.bookingRef})`,
        subject,
        'Booking Confirmation',
        {
          body: bodyText,
          bookingRef: c.bookingRef,
          from: contactEmail || SITE_CONFIG.email,
          direction: 'outbound',
        }
      );
    }

    const mailtoHref = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyText)}`;
    const link = document.createElement('a');
    link.href = mailtoHref;
    link.click();

    setComplaintSentNotice((prev) => ({
      ...prev,
      [c.id]: isAr
        ? `تم تسجيل وإرسال الإيميل إلى ${recipient || c.customerName}.`
        : `Email logged and opened for ${recipient || c.customerName}.`,
    }));
    window.setTimeout(() => {
      setComplaintSentNotice((prev) => ({ ...prev, [c.id]: '' }));
    }, 3500);
  };

  const statusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
      case 'Driver assigned':
      case 'Completed':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]';
      case 'Confirmed':
        return 'bg-[#ECFDF5] text-[#047857] border-[#6EE7B7]';
      case 'Pending':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]';
      case 'Refunded':
      case 'Cancelled':
      case 'No show':
        return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]';
    }
  };

  const liveWaDigits = normalizeWhatsAppDigits(whatsappNumber || SITE_CONFIG.whatsappNumber);
  const liveDeskEmail = contactEmail || SITE_CONFIG.email;

  const urgentPickupsCount = useMemo(
    () =>
      bookings.filter((b) => {
        if (
          b.status === 'Cancelled' ||
          b.status === 'Refunded' ||
          b.status === 'No show' ||
          b.status === 'Completed'
        ) {
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

  // Per-Supplier Operational Manifest & Financial Settlement Summaries
  const supplierManifestSummaries = useMemo(() => {
    const q = directoryQuery.trim().toLowerCase();
    const filteredSups = suppliers.filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q)
      );
    });

    return filteredSups.map((sup) => {
      const supBookings = sortedBookings.filter((b) => b.supplierName === sup.name);
      const activeBookings = supBookings.filter(
        (b) => b.status !== 'Cancelled' && b.status !== 'Refunded' && b.status !== 'No show'
      );
      const pendingCount = supBookings.filter((b) => b.status === 'Pending').length;
      const confirmedCount = supBookings.filter(
        (b) => b.status === 'Confirmed' || b.status === 'Driver assigned'
      ).length;
      const completedCount = supBookings.filter((b) => b.status === 'Completed').length;

      const totalAdults = activeBookings.reduce((acc, b) => acc + b.adults, 0);
      const totalChildren = activeBookings.reduce((acc, b) => acc + b.children, 0);
      const totalInfants = activeBookings.reduce((acc, b) => acc + (b.infants ?? 0), 0);
      const totalPax = totalAdults + totalChildren + totalInfants;

      const grossEur = activeBookings.reduce((acc, b) => acc + b.grossEur, 0);
      const waslaCommissionEur = Math.round((grossEur * safeCommissionPct) / 100);
      const supplierNetEur = grossEur - waslaCommissionEur;

      // Cash vs Online split
      const cashBookings = activeBookings.filter((b) => b.paymentStatus !== 'Paid online');
      const onlineBookings = activeBookings.filter((b) => b.paymentStatus === 'Paid online');

      const cashCollectedBySupplierEur = cashBookings.reduce((acc, b) => acc + b.grossEur, 0);
      const onlineCollectedByWaslaEur = onlineBookings.reduce((acc, b) => acc + b.grossEur, 0);

      // Commission owed to Wasla on cash bookings minus Supplier net owed by Wasla on online bookings
      const commOnCash = Math.round((cashCollectedBySupplierEur * safeCommissionPct) / 100);
      const netOnOnline =
        onlineCollectedByWaslaEur -
        Math.round((onlineCollectedByWaslaEur * safeCommissionPct) / 100);
      // Positive => Supplier owes Wasla; Negative => Wasla owes Supplier
      const balanceToWaslaEur = commOnCash - netOnOnline;

      const dates = Array.from(new Set(activeBookings.map((b) => b.date))).sort();
      const nationalities = Array.from(
        new Set(activeBookings.map((b) => b.guestCountry || 'Guest').filter(Boolean))
      );

      return {
        supplier: sup,
        allBookings: supBookings,
        activeBookings,
        pendingCount,
        confirmedCount,
        completedCount,
        totalAdults,
        totalChildren,
        totalInfants,
        totalPax,
        grossEur,
        waslaCommissionEur,
        supplierNetEur,
        cashCollectedBySupplierEur,
        onlineCollectedByWaslaEur,
        balanceToWaslaEur,
        dates,
        nationalities,
      };
    });
  }, [suppliers, directoryQuery, sortedBookings, safeCommissionPct]);

  const handleCopyDeskItem = async (key: string, value: string) => {
    await copyTextToClipboard(value);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#F1F5F9] text-[#0F2233]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 space-y-5">
        {/* ============================================================ */}
        {/* EXECUTIVE HEADER + 4-WORKSPACE TABS                          */}
        {/* ============================================================ */}
        <header className="rounded-xl border border-[#CBD5E1] bg-white shadow-xs overflow-hidden">
          <div
            className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0]"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#334155] tabular-nums">
                <span className="font-bold text-[#0F2233]">{SITE_CONFIG.domain}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium">
                  {isAr
                    ? `${bookings.length} إجمالي الحجوزات (مرتبة بالأحدث)`
                    : `${bookings.length} total bookings (sorted newest first)`}
                </span>
                {(urgentPickupsCount > 0 || attentionBookingsCount > 0) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#DC2626] px-2 py-0.5 text-[11px] font-bold text-white">
                      <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>
                        {isAr
                          ? `${urgentPickupsCount} عاجل اليوم/غداً · ${attentionBookingsCount} متأخر (>4 ساعات)`
                          : `${urgentPickupsCount} urgent today/tomorrow · ${attentionBookingsCount} overdue (>4h)`}
                      </span>
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.02em] text-[#0F2233]">
                {isAr ? 'مركز الحجوزات والتشغيل' : 'Reservations & Dispatch'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Strict Language Switch (100% Pure English or 100% Pure Arabic) */}
              <div
                className="inline-flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-0.5 text-xs font-bold"
                role="group"
                aria-label="Workspace language"
              >
                <button
                  type="button"
                  onClick={() => setWorkspaceLang('en')}
                  className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    !isAr
                      ? 'bg-[#0F2233] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F2233]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceLang('ar')}
                  className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isAr
                      ? 'bg-[#0F2233] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F2233]'
                  }`}
                >
                  العربية
                </button>
              </div>

              {onCreateBooking && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="btn-wasla-primary min-h-[38px] gap-1.5 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'إضافة حجز جديد' : 'New Booking'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Purpose-Built Horizontal Workspace Tabs */}
          <nav
            aria-label="Reservations and dispatch workspaces"
            className="px-4 sm:px-5 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#F8FAFC]"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {[
              {
                id: 'sheet' as OpsTab,
                icon: FileSpreadsheet,
                label: isAr ? 'جدول الحجوزات والتشغيل' : 'Bookings & Dispatch',
                count: bookings.length,
                redAlert: urgentPickupsCount > 0 || attentionBookingsCount > 0,
              },
              {
                id: 'chat' as OpsTab,
                icon: MessageSquare,
                label: isAr ? 'تواصل الضيوف والرسائل' : 'Guest Communications',
                count: unreadChatsCount > 0 ? unreadChatsCount : chats.length,
                redAlert: unreadChatsCount > 0,
              },
              {
                id: 'quality' as OpsTab,
                icon: AlertTriangle,
                label: isAr ? 'الشكاوى والاسترداد' : 'Cases & Refunds',
                count: openComplaintsCount,
                redAlert: openComplaintsCount > 0,
              },
              {
                id: 'directory' as OpsTab,
                icon: Users,
                label: isAr ? 'كشوفات وتسويات الموردين' : 'Suppliers Manifest & Settlement',
                count: suppliers.length,
                redAlert: false,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0F2233] text-white shadow-xs'
                      : 'border border-transparent text-[#334155] hover:border-[#CBD5E1] hover:bg-white hover:text-[#0F2233]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold tabular-nums ${
                        tab.redAlert
                          ? 'bg-[#DC2626] text-white'
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E2E8F0] text-[#0F2233]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* ============================================================ */}
        {/* TAB 1: BOOKINGS & DISPATCH TABLE (NEWEST FIRST + RED ALERTS) */}
        {/* ============================================================ */}
        {activeTab === 'sheet' && (
          <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
            {/* 4-Column Shift KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button
                type="button"
                onClick={() => setUrgencyFilter((prev) => (prev === 'urgent' ? 'all' : 'urgent'))}
                className={`rounded-xl border-2 p-4 text-start space-y-1 transition-all cursor-pointer ${
                  urgencyFilter === 'urgent'
                    ? 'border-[#DC2626] bg-[#FEF2F2]'
                    : urgentPickupsCount > 0
                    ? 'border-[#FCA5A5] bg-white hover:border-[#DC2626]'
                    : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#991B1B]">
                  <span>
                    {isAr ? 'عاجل: رحلات اليوم وغداً' : 'URGENT: Today & Tomorrow'}
                  </span>
                  <AlertTriangle className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                </div>
                <div className="font-mono text-2xl font-extrabold text-[#DC2626] tabular-nums">
                  {urgentPickupsCount}
                </div>
                <div className="text-[11px] font-medium text-[#475569]">
                  {isAr ? 'اضغط لعرض الحجوزات العاجلة فقط' : 'Click to filter urgent pickups'}
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setUrgencyFilter((prev) => (prev === 'attention' ? 'all' : 'attention'))
                }
                className={`rounded-xl border-2 p-4 text-start space-y-1 transition-all cursor-pointer ${
                  urgencyFilter === 'attention'
                    ? 'border-[#DC2626] bg-[#FEF2F2]'
                    : attentionBookingsCount > 0
                    ? 'border-[#DC2626] bg-[#FFF5F5] hover:bg-[#FEF2F2]'
                    : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#991B1B]">
                  <span>
                    {isAr ? 'تنبيه أحمر: معلّق > 4 ساعات' : 'RED ALERT: Pending > 4h'}
                  </span>
                  <Clock className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                </div>
                <div
                  className={`font-mono text-2xl font-extrabold tabular-nums ${
                    attentionBookingsCount > 0 ? 'text-[#DC2626]' : 'text-[#0F2233]'
                  }`}
                >
                  {attentionBookingsCount}
                </div>
                <div className="text-[11px] font-medium text-[#475569]">
                  {attentionBookingsCount > 0
                    ? isAr
                      ? 'تجاوزت 4 ساعات بدون تأكيد نهائي'
                      : 'Overdue > 4h awaiting confirmation'
                    : isAr
                    ? 'لا توجد طلبات متأخرة'
                    : 'Zero overdue bookings'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUrgencyFilter('all');
                  setStatusFilter((prev) => (prev === 'Pending' ? 'all' : 'Pending'));
                }}
                className={`rounded-xl border-2 p-4 text-start space-y-1 transition-all cursor-pointer ${
                  statusFilter === 'Pending'
                    ? 'border-[#EE5426] bg-[#FFF7ED]'
                    : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
                  <span>
                    {isAr ? 'بانتظار التأكيد / تعيين سائق' : 'Awaiting Confirm / Driver'}
                  </span>
                  <Users className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                </div>
                <div className="font-mono text-2xl font-extrabold text-[#0F2233] tabular-nums">
                  {unassignedDriversCount}
                </div>
                <div className="text-[11px] font-medium text-[#475569]">
                  {isAr
                    ? 'التذكرة النهائية للعميل مغلقة حتى التأكيد'
                    : 'Guest voucher locked until confirmed'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="rounded-xl border-2 border-[#CBD5E1] bg-white hover:border-[#0F2233] p-4 text-start space-y-1 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
                  <span>
                    {isAr ? 'تسويات الموردين والتحصيل' : 'Supplier Settlements & Cash'}
                  </span>
                  <FileSpreadsheet className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                </div>
                <div className="font-mono text-2xl font-extrabold text-[#15803D] tabular-nums">
                  {suppliers.length}
                </div>
                <div className="text-[11px] font-medium text-[#475569]">
                  {isAr
                    ? 'تحصيل كاش (EUR/USD/EGP) أو رابط دفع'
                    : 'Cash (EUR/USD/EGP) & Online Link ledger'}
                </div>
              </button>
            </div>

            {/* Red Alert Priority Banner when Overdue > 4h exists */}
            {attentionBookingsCount > 0 && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#DC2626] bg-[#FEF2F2] px-4 py-3 text-xs shadow-xs"
              >
                <div className="flex items-center gap-2.5 text-[#991B1B]">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626] text-white shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="font-extrabold uppercase tracking-wide text-[#DC2626]">
                      {isAr ? 'تنبيه عاجل باللون الأحمر:' : 'URGENT RED ALERT:'}
                    </span>{' '}
                    <span className="font-bold text-[#7F1D1D]">
                      {isAr
                        ? `يوجد ${attentionBookingsCount} حجز معلّق منذ أكثر من 4 ساعات بانتظار تأكيد الإتاحة وفتح تذكرة العميل.`
                        : `${attentionBookingsCount} pending booking(s) have waited over 4 hours for confirmation & pickup assignment.`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setUrgencyFilter((prev) => (prev === 'attention' ? 'all' : 'attention'))
                  }
                  className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-lg px-3.5 font-bold transition-colors cursor-pointer ${
                    urgencyFilter === 'attention'
                      ? 'bg-[#0F2233] text-white'
                      : 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
                  }`}
                >
                  <span>
                    {urgencyFilter === 'attention'
                      ? isAr
                        ? 'عرض جميع الحجوزات'
                        : 'Show All Bookings'
                      : isAr
                      ? `عرض المتأخر فقط (${attentionBookingsCount})`
                      : `Filter Overdue (${attentionBookingsCount})`}
                  </span>
                </button>
              </div>
            )}

            {/* Bookings Table Toolbar: Filters + Dedicated Export CSV Button */}
            <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#0F2233]">
                    {isAr
                      ? 'جدول الحجوزات والتشغيل (الأحدث فوق بالترتيب الزمني)'
                      : 'Live Bookings & Dispatch Sheet (Ordered Newest First)'}
                  </h2>
                  <p className="text-xs text-[#475569]">
                    {isAr
                      ? 'يظهر وقت حجز التذكرة بالساعة والدقيقة، والتنبيه الأحمر يظهر فقط للحالات العاجلة.'
                      : 'Shows exact ticket booking timestamp (HH:MM). Red alerts appear strictly on urgent or overdue items.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedBookingsForCsv.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBookingIds([])}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-bold text-[#334155] hover:text-[#0F2233] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {isAr
                          ? `إلغاء تحديد (${selectedBookingsForCsv.length})`
                          : `Clear (${selectedBookingsForCsv.length})`}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border-2 border-[#0F2233] bg-[#0F2233] px-4 py-2 text-xs font-bold text-white hover:bg-[#19354F] transition-colors whitespace-nowrap cursor-pointer tabular-nums shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {selectedBookingsForCsv.length > 0
                        ? isAr
                          ? `تنزيل شيت الحسابات للمحدد (${selectedBookingsForCsv.length})`
                          : `Export Accounting & Manifest CSV (${selectedBookingsForCsv.length})`
                        : isAr
                        ? `تنزيل شيت الحجوزات والحسابات CSV (${filteredBookings.length})`
                        : `Export Accounting & Manifest CSV (${filteredBookings.length})`}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                <label className="relative block">
                  <Search
                    className="h-4 w-4 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      isAr ? 'بحث برقم الحجز، الاسم، الفندق...' : 'Search ref, guest, hotel…'
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] ps-9 pe-3 text-xs font-medium text-[#0F2233] focus:border-[#0F2233] focus:outline-none"
                  />
                </label>

                <select
                  value={urgencyFilter}
                  onChange={(e) =>
                    setUrgencyFilter(e.target.value as 'all' | 'urgent' | 'attention')
                  }
                  className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F2233]"
                  aria-label="Filter by urgency"
                >
                  <option value="all">{isAr ? 'كل الأولويات' : 'All Priorities'}</option>
                  <option value="urgent">
                    {isAr ? 'عاجل فقط (اليوم وغداً)' : 'Urgent Only (Today & Tomorrow)'}
                  </option>
                  <option value="attention">
                    {isAr ? 'متأخر أكثر من 4 ساعات' : 'Overdue (> 4 Hours)'}
                  </option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                  className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F2233]"
                  aria-label="Filter by status"
                >
                  <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
                  <option value="Pending">{isAr ? 'معلّق (Pending)' : 'Pending'}</option>
                  <option value="Confirmed">{isAr ? 'مؤكد (Confirmed)' : 'Confirmed'}</option>
                  <option value="Driver assigned">
                    {isAr ? 'تم تعيين السائق' : 'Driver assigned'}
                  </option>
                  <option value="Completed">{isAr ? 'مكتمل (Completed)' : 'Completed'}</option>
                  <option value="Cancelled">{isAr ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
                  <option value="No show">{isAr ? 'لم يحضر (No show)' : 'No show'}</option>
                  <option value="Refunded">{isAr ? 'مسترد (Refunded)' : 'Refunded'}</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F2233]"
                  aria-label="Filter by category"
                >
                  <option value="all">{isAr ? 'كل الأنشطة' : 'All Activities'}</option>
                  <option value="sea">{isAr ? 'رحلات بحرية' : 'Sea trips'}</option>
                  <option value="desert">{isAr ? 'سفاري وصحراء' : 'Desert trips'}</option>
                  <option value="historical">{isAr ? 'الأقصر والقاهرة' : 'Historical'}</option>
                  <option value="horse">{isAr ? 'ركوب خيل' : 'Horse riding'}</option>
                  <option value="guides">{isAr ? 'مرشد سياحي' : 'Egyptian guides'}</option>
                  <option value="shopping">{isAr ? 'جولات تسوق' : 'Shopping'}</option>
                  <option value="city">{isAr ? 'جولات مدينة' : 'City tour'}</option>
                  <option value="transfers">{isAr ? 'توصيل مطار' : 'Transfers'}</option>
                  <option value="custom">{isAr ? 'رحلة مخصصة' : 'Customized trip'}</option>
                </select>

                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F2233]"
                  aria-label="Filter by supplier"
                >
                  <option value="all">{isAr ? 'كل الموردين' : 'All Suppliers'}</option>
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
                  className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F2233] tabular-nums"
                  aria-label="Filter by date"
                />
              </div>
            </div>

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
              <div className="rounded-xl border border-[#CBD5E1] bg-white p-10 text-center space-y-3">
                <p className="text-sm font-bold text-[#0F2233]">
                  {isAr ? 'لا توجد حجوزات مطابقة للفلتر الحالي' : 'No bookings match your active filters'}
                </p>
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
                  className="btn-wasla-primary rounded-lg px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <HorizontalScrollTableFrame
                isAr={isAr}
                keyboardEnabled={!modalMode && !readerModal}
                ariaLabel={isAr ? 'جدول الحجوزات والتشغيل' : 'Bookings and dispatch table'}
              >
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#CBD5E1] bg-[#0F2233] text-[11px] font-bold text-white">
                        <th className="py-3 px-2.5 w-9 text-center whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={allFilteredSelected}
                            onChange={toggleSelectAllFiltered}
                            className="h-4 w-4 rounded border-[#CBD5E1] text-[#EE5426] focus:ring-[#EE5426] cursor-pointer"
                            aria-label="Select all visible bookings"
                          />
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'رقم الحجز والتنبيه' : 'Ref & Alert'}
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'وقت حجز التذكرة' : 'Booked At'}
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'تاريخ الرحلة والبيك أب' : 'Trip Date & Pickup'}
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'الرحلة والوجهة' : 'Excursion'}
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'العميل والفندق' : 'Guest & Hotel'}
                        </th>
                        <th className="py-3 px-2.5 text-end whitespace-nowrap">
                          {isAr ? 'الأفراد' : 'Pax'}
                        </th>
                        <th className="py-3 px-2.5 text-end whitespace-nowrap">
                          {isAr ? 'الإجمالي (€)' : 'Total (€)'}
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'طريقة الدفع' : 'Payment'}
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'الحالة وتذكرة العميل' : 'Status & Voucher'}
                        </th>
                        <th className="py-3 px-2.5 text-start whitespace-nowrap">
                          {isAr ? 'المورد والسائق' : 'Supplier & Driver'}
                        </th>
                        <th className="py-3 px-2.5 text-end whitespace-nowrap">
                          {isAr ? 'التذكرة' : 'Ticket'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD5E1]">
                      {filteredBookings.map((b) => {
                        const isChecked = selectedBookingIds.includes(b.id);
                        const urgency = getBookingUrgency(b);
                        const attention = getPendingAttentionInfo(b, nowMs);
                        const bookedTime = formatBookedTimestamp(b.createdAtMs, nowMs, isAr);
                        const isRedRow =
                          attention.needsAttention ||
                          urgency.level === 'today' ||
                          urgency.level === 'tomorrow';
                        const isVoucherUnlocked =
                          b.status === 'Confirmed' ||
                          b.status === 'Driver assigned' ||
                          b.status === 'Completed';

                        return (
                          <tr
                            key={b.id}
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.closest('input, select, a, button')) return;
                              openBookingTicket(b);
                            }}
                            className={`transition-colors cursor-pointer ${
                              isRedRow
                                ? 'bg-[#FEF2F2]/75 hover:bg-[#FEE2E2]/70'
                                : isChecked
                                ? 'bg-[#FFF7ED] hover:bg-[#FFEDD5]/70'
                                : 'bg-white hover:bg-[#F8FAFC]'
                            }`}
                          >
                            {/* Checkbox */}
                            <td
                              onClick={(e) => e.stopPropagation()}
                              className={`py-3 px-2.5 text-center whitespace-nowrap ${
                                isRedRow ? 'border-s-4 border-s-[#DC2626]' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectBooking(b.id)}
                                className="h-4 w-4 rounded border-[#CBD5E1] text-[#EE5426] focus:ring-[#EE5426] cursor-pointer"
                                aria-label={`Select booking ${b.id}`}
                              />
                            </td>

                            {/* Ref & RED Alert (Strictly Urgent or Empty) */}
                            <td className="py-3 px-2.5 whitespace-nowrap space-y-1">
                              <div className="font-mono text-xs font-extrabold text-[#0F2233]">
                                {b.id}
                              </div>
                              {attention.needsAttention && (
                                <div className="inline-flex items-center gap-1 rounded bg-[#DC2626] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-2xs">
                                  <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span>
                                    {isAr
                                      ? `متأخر · ${attention.elapsedLabel}`
                                      : `OVERDUE · ${attention.elapsedLabel}`}
                                  </span>
                                </div>
                              )}
                              {urgency.level === 'today' && (
                                <div className="inline-flex items-center gap-1 rounded bg-[#DC2626] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                                  <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span>{isAr ? 'عاجل · اليوم' : 'URGENT · TODAY'}</span>
                                </div>
                              )}
                              {urgency.level === 'tomorrow' && (
                                <div className="inline-flex items-center gap-1 rounded border border-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#DC2626]">
                                  <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span>{isAr ? 'عاجل · غداً' : 'URGENT · TOMORROW'}</span>
                                </div>
                              )}
                            </td>

                            {/* Exact Booked At Timestamp */}
                            <td className="py-3 px-2.5 whitespace-nowrap tabular-nums">
                              <div className="font-mono text-xs font-bold text-[#0F2233]">
                                {bookedTime.clock}
                              </div>
                              <div className="text-[11px] font-medium text-[#334155]">
                                {bookedTime.date}
                              </div>
                              {bookedTime.relative && (
                                <div className="text-[10.5px] font-semibold text-[#EE5426]">
                                  {bookedTime.relative}
                                </div>
                              )}
                            </td>

                            {/* Trip Date & Manual Pickup Time */}
                            <td className="py-3 px-2.5 whitespace-nowrap tabular-nums space-y-0.5">
                              <div className="font-mono font-bold text-[#0F2233]">{b.date}</div>
                              {b.tripStartTime && (
                                <div className="text-[11px] text-[#334155]">
                                  {isAr ? 'بداية الرحلة:' : 'Start:'} {b.tripStartTime}
                                </div>
                              )}
                              <div className="text-[11px] font-bold text-[#0F2233]">
                                {isAr ? 'البيك أب:' : 'Pickup:'}{' '}
                                <span
                                  className={
                                    !b.pickupTime || b.pickupTime === 'TBD'
                                      ? 'text-[#DC2626]'
                                      : 'text-[#15803D]'
                                  }
                                >
                                  {b.pickupTime || (isAr ? 'يُحدد يدوياً' : 'Set manually')}
                                </span>
                              </div>
                              <div className="text-[10.5px] font-semibold text-[#475569]">
                                {b.pickupSpot === 'Outside Main Gate'
                                  ? isAr
                                    ? 'أمام البوابة الرئيسية'
                                    : 'Outside Main Gate'
                                  : isAr
                                  ? 'داخل الريسبشن'
                                  : 'Inside Reception'}
                              </div>
                            </td>

                            {/* Excursion & Destination */}
                            <td className="py-3 px-2.5 min-w-[175px]">
                              <div className="font-bold text-[#0F2233] line-clamp-1">
                                {b.tripTitle}
                              </div>
                              <div className="text-[11px] font-medium text-[#475569]">
                                {b.destination} · {b.category}
                              </div>
                              {b.destination === 'Marsa Alam' && (
                                <span
                                  className={`mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                    b.locationImageUrl && b.roomNumber
                                      ? 'bg-[#DCFCE7] text-[#15803D]'
                                      : 'bg-[#FEE2E2] text-[#DC2626]'
                                  }`}
                                >
                                  {b.locationImageUrl && b.roomNumber
                                    ? isAr
                                      ? '✓ مرفق الجواز ورقم الغرفة'
                                      : '✓ Passport & Room Ready'
                                    : isAr
                                    ? '⚠ مطلوب صورة الجواز والغرفة'
                                    : '⚠ Passport & Room Required'}
                                </span>
                              )}
                            </td>

                            {/* Guest & Hotel + Quick WA/Email */}
                            <td className="py-3 px-2.5 min-w-[195px] space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-[#0F2233]">{b.guestName}</span>
                                {b.guestCountry && (
                                  <span className="rounded bg-[#F1F5F9] border border-[#CBD5E1] px-1.5 py-0.5 text-[10px] font-bold text-[#0F2233]">
                                    {b.guestCountry}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium text-[#334155] truncate max-w-[200px]">
                                {b.hotel}
                                {b.roomNumber
                                  ? isAr
                                    ? ` · غرفة ${b.roomNumber}`
                                    : ` · Rm ${b.roomNumber}`
                                  : ''}
                              </div>
                              <div
                                className="flex flex-wrap items-center gap-1.5 pt-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
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
                                    guestLang: b.guestLang,
                                    notes: b.notes,
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
                                    guestLang: b.guestLang,
                                    notes: b.notes,
                                  });
                                  return (
                                    <>
                                      {waDispatch && (
                                        <a
                                          href={waDispatch}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 rounded border border-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-bold text-[#15803D] hover:bg-[#DCFCE7]"
                                        >
                                          <MessageCircle className="h-2.5 w-2.5" aria-hidden="true" />
                                          <span>{isAr ? 'واتساب' : 'WA Pickup'}</span>
                                        </a>
                                      )}
                                      {emailDispatch && (
                                        <a
                                          href={emailDispatch}
                                          onClick={() => {
                                            if (onLogDispatchEmail) {
                                              onLogDispatchEmail(
                                                b.guestEmail || b.guestContact,
                                                `Pickup Details, ${b.id} (${b.date})`,
                                                'Booking Confirmation',
                                                { bookingRef: b.id, direction: 'outbound' }
                                              );
                                            }
                                          }}
                                          className="inline-flex items-center gap-1 rounded border border-[#EE5426] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-bold text-[#D9461B] hover:bg-[#FFEDD5]"
                                        >
                                          <Mail className="h-2.5 w-2.5" aria-hidden="true" />
                                          <span>{isAr ? 'إيميل' : 'Email'}</span>
                                        </a>
                                      )}
                                      {isBookingFinishedForReview(b) && (
                                        <button
                                          type="button"
                                          onClick={() => void handleCopyReviewLink(b)}
                                          className="inline-flex items-center gap-1 rounded border border-[#F59E0B] bg-[#FFFBEB] px-1.5 py-0.5 text-[10px] font-bold text-[#B45309] hover:bg-[#FEF3C7] cursor-pointer"
                                        >
                                          <Star className="h-2.5 w-2.5 fill-[#F59E0B] text-[#F59E0B]" />
                                          <span>
                                            {copiedReviewId === b.id
                                              ? isAr
                                                ? 'تم النسخ'
                                                : 'Copied'
                                              : isAr
                                              ? 'رابط التقييم'
                                              : 'Review Link'}
                                          </span>
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>

                            {/* Pax */}
                            <td className="py-3 px-2.5 text-end whitespace-nowrap font-mono font-bold text-[#0F2233] tabular-nums">
                              {b.adults}A{b.children > 0 ? `+${b.children}C` : ''}
                              {(b.infants ?? 0) > 0 ? `+${b.infants}INF` : ''}
                            </td>

                            {/* Gross EUR */}
                            <td className="py-3 px-2.5 text-end whitespace-nowrap tabular-nums">
                              <div className="font-mono text-xs font-extrabold text-[#0F2233]">
                                €{b.grossEur}
                              </div>
                              <div className="text-[10px] font-medium text-[#475569]">
                                {isAr ? 'EUR / USD / EGP' : 'EUR/USD/EGP'}
                              </div>
                            </td>

                            {/* Payment Status */}
                            <td
                              className="py-3 px-2.5 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={b.paymentStatus}
                                onChange={(e) =>
                                  onUpdateBooking(b.id, {
                                    paymentStatus: e.target.value as PaymentStatus,
                                  })
                                }
                                className="rounded-lg border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-semibold text-[#0F2233]"
                              >
                                <option value="Awaiting link">
                                  {isAr ? 'بانتظار الرابط' : 'Awaiting link'}
                                </option>
                                <option value="Link sent">
                                  {isAr ? 'تم إرسال الرابط' : 'Link sent'}
                                </option>
                                <option value="Paid online">
                                  {isAr ? 'مدفوع أونلاين' : 'Paid online'}
                                </option>
                                <option value="Cash on pickup">
                                  {isAr ? 'كاش عند الاستلام' : 'Cash on pickup'}
                                </option>
                              </select>
                            </td>

                            {/* Booking Status + Customer Digital Voucher Lock Indicator */}
                            <td
                              className="py-3 px-2.5 whitespace-nowrap space-y-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={b.status}
                                onChange={(e) =>
                                  onUpdateBooking(b.id, {
                                    status: e.target.value as BookingStatus,
                                  })
                                }
                                className={`rounded-lg border px-2 py-1 text-xs font-bold ${statusBadgeStyle(
                                  b.status
                                )}`}
                              >
                                <option value="Pending">{isAr ? 'معلّق' : 'Pending'}</option>
                                <option value="Confirmed">{isAr ? 'مؤكد' : 'Confirmed'}</option>
                                <option value="Driver assigned">
                                  {isAr ? 'تم تعيين السائق' : 'Driver assigned'}
                                </option>
                                <option value="Completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                                <option value="Cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                                <option value="No show">{isAr ? 'لم يحضر' : 'No show'}</option>
                                <option value="Refunded">{isAr ? 'مسترد' : 'Refunded'}</option>
                              </select>
                              <div className="flex items-center gap-1 text-[10px] font-bold">
                                {isVoucherUnlocked ? (
                                  <span className="inline-flex items-center gap-1 text-[#15803D]">
                                    <Unlock className="h-2.5 w-2.5" />
                                    <span>{isAr ? 'التذكرة مفتوحة' : 'Voucher Unlocked'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[#B45309]">
                                    <Lock className="h-2.5 w-2.5" />
                                    <span>{isAr ? 'التذكرة مغلقة' : 'Voucher Locked'}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Supplier & Driver */}
                            <td
                              className="py-3 px-2.5 min-w-[160px] space-y-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-[11px] font-bold text-[#0F2233] truncate">
                                {b.supplierName}
                              </div>
                              <input
                                type="text"
                                value={b.assignedDriverOrGuide}
                                onChange={(e) =>
                                  onUpdateBooking(b.id, {
                                    assignedDriverOrGuide: e.target.value,
                                  })
                                }
                                placeholder={
                                  isAr ? 'اسم السائق / المرشد...' : 'Assign driver / guide…'
                                }
                                className="w-full rounded border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-medium text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                              />
                            </td>

                            {/* Ticket Button */}
                            <td
                              className="py-3 px-2.5 text-end whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => openBookingTicket(b)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#0F2233] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white transition-colors cursor-pointer"
                              >
                                <Eye className="h-3 w-3" aria-hidden="true" />
                                <span>{isAr ? 'التذكرة' : 'Ticket'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              </HorizontalScrollTableFrame>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: GUEST COMMUNICATIONS (CHATS + 4 DISPATCH TEMPLATES)   */}
        {/* ============================================================ */}
        {activeTab === 'chat' && <ConversationWorkspace bookings={bookings} ar={isAr} />}
        {activeTab === 'chat' && (

          <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Top Bar, WhatsApp Button Kept, Raw Visible Phone Number Hidden */}
            <div className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="font-bold text-[#0F2233]">
                    {isAr ? 'قنوات تواصل العمليات:' : 'Official Operations Channels:'}
                  </span>
                  <a
                    href={`https://wa.me/${liveWaDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 py-1 text-xs font-bold text-white hover:bg-[#15803D]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isAr ? 'فتح واتساب العمليات' : 'Open WhatsApp Desk'}</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                  <span aria-hidden="true" className="text-[#CBD5E1]">
                    |
                  </span>
                  <span dir="ltr" className="font-mono font-bold text-[#0F2233]">
                    {liveDeskEmail}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyDeskItem('email', liveDeskEmail)}
                    className="inline-flex items-center gap-1 font-bold text-[#EE5426] hover:underline cursor-pointer"
                  >
                    {copiedKey === 'email' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>
                      {copiedKey === 'email'
                        ? isAr
                          ? 'تم النسخ'
                          : 'Copied'
                        : isAr
                        ? 'نسخ الإيميل'
                        : 'Copy Email'}
                    </span>
                  </button>
                </div>
                <h2 className="text-base font-bold text-[#0F2233]">
                  {isAr
                    ? 'محادثات الضيوف، قوالب الرسائل الـ 4، وسجل الإيميلات'
                    : 'Guest Live Chats, 4 Dispatch Templates & Email Log'}
                </h2>
              </div>

              <div className="inline-flex max-w-full flex-wrap sm:flex-nowrap items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-1 text-xs font-bold self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setCommsSubView('chats')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 cursor-pointer whitespace-nowrap ${
                    commsSubView === 'chats'
                      ? 'bg-[#0F2233] text-white shadow-xs'
                      : 'text-[#334155] hover:text-[#0F2233]'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {isAr ? `محادثات الضيوف (${chats.length})` : `Live Chats (${chats.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCommsSubView('dispatch')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 cursor-pointer whitespace-nowrap ${
                    commsSubView === 'dispatch'
                      ? 'bg-[#EE5426] text-white shadow-xs'
                      : 'text-[#334155] hover:text-[#0F2233]'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {isAr
                      ? `القوالب الـ 4 وسجل الإيميلات (${emailLogs.length})`
                      : `4 Dispatch Templates & Emails (${emailLogs.length})`}
                  </span>
                </button>
              </div>
            </div>

            {commsSubView === 'dispatch' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 7 Cols: 4 Editable Guest Dispatch Templates */}
                <div className="lg:col-span-7 rounded-xl border border-[#CBD5E1] bg-white p-5 space-y-4 shadow-xs">
                  <div className="border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-base font-bold text-[#0F2233]">
                      {isAr
                        ? 'قوالب مراسلة الضيوف الـ 4 (قابلة للتعديل قبل الإرسال)'
                        : '4 Editable Guest Dispatch Message Templates'}
                    </h3>
                    <p className="text-xs font-medium text-[#334155] mt-0.5">
                      {isAr
                        ? 'اختر الحجز والقالب المناسب، عدّل النص كما تريد، ثم أرسله عبر واتساب أو الإيميل.'
                        : 'Select a booking and template, customize the text if needed, and send via WhatsApp or Email.'}
                    </p>
                  </div>

                  {/* Step 1: Select Booking */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0F2233]">
                      {isAr ? '1. اختر حجز العميل:' : '1. Select Guest Booking:'}
                    </label>
                    <select
                      value={activeDispatchBooking?.id || ''}
                      onChange={(e) => setDispatchBookingId(e.target.value)}
                      className="min-h-[42px] w-full rounded-lg border-2 border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F2233] focus:border-[#0F2233] focus:outline-none"
                    >
                      {sortedBookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.id}, {b.guestName} ({b.guestCountry || 'Guest'}) · {b.tripTitle} ·{' '}
                          {b.date} · €{b.grossEur} [{b.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Select 1 of the 4 Templates */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-[#0F2233]">
                      {isAr ? '2. اختر قالب الرسالة:' : '2. Choose Message Template:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(
                        [
                          {
                            id: 'welcome' as DispatchTemplateId,
                            title: isAr
                              ? '1. رسالة افتتاحية (استلام الطلب)'
                              : '1. Request Received (Opening)',
                            sub: isAr
                              ? 'تأكيد استلام الطلب وجاري مراجعة الإتاحة'
                              : 'Acknowledge request & availability check',
                          },
                          {
                            id: 'payment' as DispatchTemplateId,
                            title: isAr
                              ? '2. تأكيد الإتاحة وخيارات الدفع'
                              : '2. Availability & Payment Options',
                            sub: isAr
                              ? 'كاش بأي عملة (EUR/USD/EGP) أو رابط دفع'
                              : 'Cash in EUR/USD/EGP or Official Payment Link',
                          },
                          {
                            id: 'pickup' as DispatchTemplateId,
                            title: isAr
                              ? '3. تفاصيل البيك أب وتذكرة الصعود'
                              : '3. Final Pickup & Boarding Pass',
                            sub: isAr
                              ? 'موعد البيك أب، الريسبشن/البوابة، والسائق'
                              : 'Exact pickup time, meeting spot & driver',
                          },
                          {
                            id: 'custom' as DispatchTemplateId,
                            title: isAr ? '4. رسالة مخصصة' : '4. Custom Message',
                            sub: isAr
                              ? 'كتابة رسالة حرة للعميل'
                              : 'Write a custom message to the guest',
                          },
                        ]
                      ).map((tpl) => {
                        const active = dispatchTemplateId === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setDispatchTemplateId(tpl.id)}
                            className={`rounded-xl border-2 p-3 text-start transition-all cursor-pointer ${
                              active
                                ? 'border-[#EE5426] bg-[#FFF7ED]'
                                : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                            }`}
                          >
                            <div className="text-xs font-bold text-[#0F2233]">{tpl.title}</div>
                            <div className="text-[11px] font-medium text-[#475569] mt-0.5">
                              {tpl.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Editable Subject & Body */}
                  {activeDispatchBooking && (
                    <div className="space-y-3 pt-1">
                      <label className="block space-y-1">
                        <span className="text-xs font-bold text-[#0F2233]">
                          {isAr ? 'عنوان الرسالة / الإيميل:' : 'Email / Message Subject:'}
                        </span>
                        <input
                          type="text"
                          value={dispatchSubject}
                          onChange={(e) => setDispatchSubject(e.target.value)}
                          className="min-h-[40px] w-full rounded-lg border-2 border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                        />
                      </label>

                      <label className="block space-y-1">
                        <span className="text-xs font-bold text-[#0F2233]">
                          {isAr
                            ? 'نص الرسالة (يمكنك التعديل قبل الإرسال):'
                            : 'Message Body (Editable before sending):'}
                        </span>
                        <textarea
                          rows={8}
                          value={dispatchBody}
                          onChange={(e) => setDispatchBody(e.target.value)}
                          className="w-full rounded-xl border-2 border-[#CBD5E1] bg-white p-3.5 text-xs sm:text-sm font-medium leading-relaxed text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                        />
                      </label>

                      {dispatchSentToast && (
                        <div className="rounded-lg border border-[#16A34A] bg-[#F0FDF4] px-3.5 py-2 text-xs font-bold text-[#15803D]">
                          {dispatchSentToast}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`https://wa.me/${(
                              activeDispatchBooking.guestWhatsapp ||
                              activeDispatchBooking.guestContact ||
                              ''
                            ).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(dispatchBody)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#16A34A] px-4 text-xs font-bold text-white hover:bg-[#15803D] shadow-xs"
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                            <span>
                              {isAr ? 'إرسال عبر واتساب ↗' : 'Send via WhatsApp ↗'}
                            </span>
                          </a>

                          <a
                            href={`mailto:${encodeURIComponent(
                              activeDispatchBooking.guestEmail || ''
                            )}?subject=${encodeURIComponent(
                              dispatchSubject
                            )}&body=${encodeURIComponent(dispatchBody)}`}
                            onClick={() => {
                              const tpl = buildDispatchEmailTemplate(
                                dispatchTemplateId,
                                activeDispatchBooking,
                                isAr
                              );
                              if (onLogDispatchEmail) {
                                onLogDispatchEmail(
                                  activeDispatchBooking.guestEmail ||
                                    activeDispatchBooking.guestContact ||
                                    activeDispatchBooking.guestName,
                                  dispatchSubject,
                                  tpl.logType,
                                  {
                                    body: dispatchBody,
                                    bookingRef: activeDispatchBooking.id,
                                    from: liveDeskEmail,
                                    direction: 'outbound',
                                  }
                                );
                              }
                              setDispatchSentToast(
                                isAr
                                  ? `تم تسجيل الإيميل في سجل مراسلات العميل (${activeDispatchBooking.id}).`
                                  : `Email logged to customer correspondence history (${activeDispatchBooking.id}).`
                              );
                              window.setTimeout(() => setDispatchSentToast(''), 3500);
                            }}
                            className="btn-wasla-primary min-h-[42px] rounded-xl px-4 py-2 text-xs font-bold"
                          >
                            <Mail className="h-4 w-4" aria-hidden="true" />
                            <span>
                              {isAr ? 'إرسال وتسجيل الإيميل' : 'Send & Log Email'}
                            </span>
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => openBookingTicket(activeDispatchBooking)}
                          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border-2 border-[#CBD5E1] bg-white px-3.5 text-xs font-bold text-[#0F2233] hover:border-[#0F2233] cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#EE5426]" />
                          <span>{isAr ? 'فتح تذكرة الحجز' : 'Open Ticket'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right 5 Cols: Clickable Sent & Received Email Log */}
                <div className="lg:col-span-5 rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-xs">
                  <div className="px-5 py-4 border-b border-[#E2E8F0]">
                    <h3 className="text-sm font-bold text-[#0F2233]">
                      {isAr
                        ? `سجل الإيميلات الواردة والمرسلة (${emailLogs.length})`
                        : `Inbound & Sent Email History (${emailLogs.length})`}
                    </h3>
                    <p className="text-xs font-medium text-[#334155] mt-0.5">
                      {isAr
                        ? 'اضغط على أي إيميل لفتح نص الرسالة بالكامل وقراءة ما كتبه العميل.'
                        : 'Click any email below to open the full message reader and inspect what the guest wrote.'}
                    </p>
                  </div>

                  {emailLogs.length === 0 ? (
                    <div className="px-5 py-10 text-center text-xs font-medium text-[#475569]">
                      {isAr ? 'لا توجد إيميلات مسجلة بعد.' : 'No emails logged yet.'}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E2E8F0] max-h-[600px] overflow-y-auto">
                      {emailLogs.map((log) => (
                        <button
                          key={log.id}
                          type="button"
                          onClick={() => setReaderModal({ kind: 'email', email: log })}
                          className="w-full text-start px-5 py-3.5 text-xs space-y-1.5 hover:bg-[#FFF7ED] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                log.direction === 'inbound'
                                  ? 'bg-[#DC2626] text-white'
                                  : 'bg-[#0F2233] text-white'
                              }`}
                            >
                              {log.direction === 'inbound'
                                ? isAr
                                  ? 'وارد من العميل'
                                  : 'INBOUND FROM GUEST'
                                : isAr
                                ? 'صادر من العمليات'
                                : 'SENT BY DESK'}
                            </span>
                            <span className="text-[11px] font-semibold text-[#475569] tabular-nums">
                              {log.sentAt}
                            </span>
                          </div>
                          <div className="font-bold text-[#0F2233] line-clamp-1">
                            {log.subject}
                          </div>
                          {log.body && (
                            <p className="text-[11.5px] font-medium text-[#334155] line-clamp-2 leading-relaxed">
                              {log.body}
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#EE5426] pt-0.5">
                            <span dir="ltr" className="truncate font-mono text-[#334155]">
                              {log.direction === 'inbound'
                                ? `From: ${log.from || log.to}`
                                : `To: ${log.to}`}
                            </span>
                            <span>
                              {isAr ? 'اضغط لقراءة الإيميل ←' : 'Click to read email →'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Live Chats Split View with High-Contrast Typography */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Thread List */}
                <div className="lg:col-span-4 rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-3.5 shadow-xs">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0F2233]">
                        {isAr
                          ? `محادثات الضيوف (${chats.length})`
                          : `Guest Conversations (${chats.length})`}
                      </h3>
                      <span className="text-xs font-semibold text-[#334155]">
                        {isAr ? 'اختر محادثة' : 'Select thread'}
                      </span>
                    </div>
                    <label className="relative block">
                      <Search
                        className="h-4 w-4 text-[#475569] absolute start-3 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        placeholder={
                          isAr ? 'ابحث باسم العميل أو رقم الحجز...' : 'Search customer, ref, hotel…'
                        }
                        className="min-h-[40px] w-full rounded-xl border-2 border-[#CBD5E1] bg-white ps-9 pe-3 text-xs font-semibold text-[#0F2233] focus:border-[#0F2233] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[620px] pe-0.5">
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
                              ? 'border-[#EE5426] bg-[#FFF7ED]/60 shadow-xs'
                              : 'border-[#CBD5E1] bg-white hover:border-[#0F2233]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-extrabold text-[#EE5426]">
                              {thread.bookingRef}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {thread.unread && (
                                <span className="rounded bg-[#DC2626] px-2 py-0.5 text-[10px] font-extrabold text-white">
                                  {isAr ? 'جديد' : 'NEW'}
                                </span>
                              )}
                              <span className="rounded bg-[#0F2233] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                {thread.customerLang}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm font-bold text-[#0F2233] leading-snug">
                            {thread.customerName}
                          </p>

                          <p className="text-xs font-semibold text-[#334155] line-clamp-1">
                            {linkedBooking?.tripTitle || thread.tripTitle}
                          </p>
                          {lastMsg && (
                            <p
                              dir="auto"
                              className="text-xs font-medium text-[#0F2233] line-clamp-1 pt-1 border-t border-[#E2E8F0]"
                            >
                              {lastMsg.text}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Active Conversation Box */}
                {activeThread && (
                  <div className="lg:col-span-8 rounded-xl border border-[#CBD5E1] flex flex-col justify-between bg-white overflow-hidden min-h-[620px] shadow-xs">
                    <div className="border-b border-[#CBD5E1] bg-[#F8FAFC] px-5 py-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#EE5426]">
                            <span>{isAr ? 'محادثة العميل' : 'Active Guest Thread'}</span>
                            <span className="font-mono text-[#0F2233]">
                              {activeThread.bookingRef}
                            </span>
                            {matchedBooking && (
                              <span
                                className={`rounded border px-2 py-0.5 text-[11px] font-bold ${statusBadgeStyle(
                                  matchedBooking.status
                                )}`}
                              >
                                {matchedBooking.status}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-[#0F2233]">
                            {activeThread.customerName}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-bold text-[#0F2233] uppercase">
                            {isAr ? 'اللغة:' : 'Lang:'} {activeThread.customerLang}
                          </span>
                          {matchedBooking && (
                            <button
                              type="button"
                              onClick={() => openBookingTicket(matchedBooking)}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border-2 border-[#0F2233] bg-white px-3 text-xs font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{isAr ? 'تذكرة الحجز' : 'View Ticket'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {matchedBooking && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-xl border border-[#CBD5E1] bg-white p-3 text-xs">
                          <div>
                            <span className="block text-[10.5px] font-bold text-[#475569]">
                              {isAr ? 'الرحلة والتاريخ' : 'Trip & Date'}
                            </span>
                            <strong className="font-bold text-[#0F2233] line-clamp-1">
                              {matchedBooking.tripTitle}
                            </strong>
                            <span className="block font-mono text-[#334155]">
                              {matchedBooking.date} · €{matchedBooking.grossEur}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10.5px] font-bold text-[#475569]">
                              {isAr ? 'الفندق والبيك أب' : 'Hotel & Pickup'}
                            </span>
                            <strong className="font-bold text-[#0F2233] line-clamp-1">
                              {matchedBooking.hotel}
                            </strong>
                            <span className="block font-bold text-[#EE5426]">
                              {matchedBooking.pickupTime || 'TBD'} ·{' '}
                              {matchedBooking.pickupSpot === 'Outside Main Gate'
                                ? isAr
                                  ? 'أمام البوابة'
                                  : 'Outside Gate'
                                : isAr
                                ? 'داخل الريسبشن'
                                : 'Inside Reception'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10.5px] font-bold text-[#475569]">
                              {isAr ? 'السائق والدفع' : 'Driver & Payment'}
                            </span>
                            <strong className="font-bold text-[#0F2233] line-clamp-1">
                              {matchedBooking.assignedDriverOrGuide ||
                                (isAr ? 'لم يعين بعد' : 'Unassigned')}
                            </strong>
                            <span className="block font-semibold text-[#15803D]">
                              {matchedBooking.paymentStatus}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Feed */}
                    <div className="flex-1 px-5 py-4 space-y-3.5 overflow-y-auto min-h-[340px] max-h-[480px] bg-[#F8FAFC]">
                      {activeThread.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            msg.sender === 'operator'
                              ? 'ms-auto border-2 border-[#D9461B] bg-[#EE5426] text-white'
                              : 'border-2 border-[#CBD5E1] bg-white text-[#0F2233] shadow-2xs'
                          }`}
                        >
                          <p
                            dir="auto"
                            className="text-sm font-medium leading-relaxed whitespace-pre-wrap"
                          >
                            {msg.text}
                          </p>
                          <span
                            className={`mt-1 block text-[11px] font-semibold tabular-nums ${
                              msg.sender === 'operator' ? 'text-white/90' : 'text-[#475569]'
                            }`}
                          >
                            {msg.sender === 'operator'
                              ? isAr
                                ? 'العمليات'
                                : 'Operations'
                              : activeThread.customerName}{' '}
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
                                    activeThread.customerLang
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                              >
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform ${
                                    expandedTranslations[msg.id] ? 'rotate-180 text-[#EE5426]' : ''
                                  }`}
                                />
                                <span>{isAr ? 'ترجمة' : 'Translate'}</span>
                              </button>

                              {expandedTranslations[msg.id] && (
                                <div
                                  dir="auto"
                                  className="mt-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs font-medium text-[#0F2233]"
                                >
                                  {translatingIds[msg.id] ? (
                                    <span className="inline-flex items-center gap-1.5 text-[#475569]">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>{isAr ? 'جاري الترجمة...' : 'Translating...'}</span>
                                    </span>
                                  ) : translationErrors[msg.id] ? (
                                    <span className="text-[#DC2626] font-bold">
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
                      <div ref={chatEndRef} />
                    </div>

                    {/* Composer */}
                    <div className="border-t-2 border-[#CBD5E1] p-4 space-y-2.5 bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={aiLoading}
                            onClick={() => void handleDraftWithAi()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F2233] bg-[#FAF4ED] px-3 py-1.5 font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white disabled:opacity-60 cursor-pointer transition-colors"
                          >
                            {aiLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {aiLoading
                                ? isAr
                                  ? 'جاري التجهيز...'
                                  : 'Drafting...'
                                : isAr
                                ? 'تجهيز رد ذكي بلغة العميل'
                                : 'Smart Draft in Guest Language'}
                            </span>
                          </button>

                          <select
                            value={replyLangOverride}
                            onChange={(e) => setReplyLangOverride(e.target.value)}
                            aria-label="Target reply language"
                            className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0F2233] cursor-pointer"
                          >
                            <option value="auto">
                              {isAr
                                ? `تلقائي (${activeThread.customerLang.toUpperCase()})`
                                : `Auto (${activeThread.customerLang.toUpperCase()})`}
                            </option>
                            <option value="en">English (EN)</option>
                            <option value="de">Deutsch (DE)</option>
                            <option value="ar">العربية (AR)</option>
                            <option value="fr">Français (FR)</option>
                            <option value="ru">Русский (RU)</option>
                            <option value="it">Italiano (IT)</option>
                          </select>
                        </div>

                        {aiDraftMeta && (
                          <span className="inline-flex items-center gap-1 text-[#15803D] font-bold">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>{aiDraftMeta.note}</span>
                          </span>
                        )}
                      </div>

                      {aiError && (
                        <p className="text-xs font-bold text-[#DC2626]">{aiError}</p>
                      )}

                      <form
                        onSubmit={handleSendReply}
                        className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5"
                      >
                        <textarea
                          ref={composerRef}
                          rows={2}
                          dir="auto"
                          value={composerText}
                          onChange={(e) => setComposerText(e.target.value)}
                          placeholder={
                            isAr
                              ? 'اكتب ردك هنا ثم اضغط إرسال...'
                              : 'Type your reply here and press Send…'
                          }
                          className="flex-1 min-h-[56px] rounded-xl border-2 border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          {matchedBooking &&
                            composerText.trim() &&
                            (matchedBooking.guestWhatsapp || matchedBooking.guestContact) && (
                              <a
                                href={`https://wa.me/${(
                                  matchedBooking.guestWhatsapp || matchedBooking.guestContact
                                ).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  composerText.trim()
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-[#16A34A] px-4 text-xs font-bold text-white hover:bg-[#15803D]"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          <button
                            type="submit"
                            className="btn-wasla-primary min-h-[46px] gap-1.5 rounded-xl px-5 py-2 text-xs font-bold cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                            <span>{isAr ? 'إرسال' : 'Send'}</span>
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

        {/* ============================================================ */}
        {/* TAB 3: CASES & REFUNDS (CLICKABLE EMAIL & WHATSAPP READER)   */}
        {/* ============================================================ */}
        {activeTab === 'quality' && (
          <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#0F2233]">
                  {isAr
                    ? 'شكاوى الضيوف، تأجيل الطقس، وطلبات الاسترداد'
                    : 'Customer Cases, Weather Rescheduling & Refund Requests'}
                </h2>
                <p className="text-xs font-medium text-[#334155] mt-0.5">
                  {isAr
                    ? 'اضغط على أي إيميل أو محادثة واتساب لفتح شاشة القراءة الكاملة ومعرفة ما كتبه العميل والرد عليه فوراً.'
                    : 'Click any customer email or WhatsApp chat below to open the full message reader screen and reply directly.'}
                </p>
              </div>
              <div className="text-xs font-bold text-[#0F2233] tabular-nums shrink-0">
                {isAr
                  ? `${openComplaintsCount} حالة مفتوحة · ${complaints.length - openComplaintsCount} مغلقة`
                  : `${openComplaintsCount} open · ${complaints.length - openComplaintsCount} resolved`}
              </div>
            </div>

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
                        replyDraft.trim() ? `?text=${encodeURIComponent(replyDraft.trim())}` : ''
                      }`
                    : `https://wa.me/${
                        replyDraft.trim() ? `?text=${encodeURIComponent(replyDraft.trim())}` : ''
                      }`;

                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl bg-white overflow-hidden transition-all ${
                      isOpen
                        ? 'border-2 border-[#0F2233] shadow-md'
                        : 'border border-[#CBD5E1] hover:border-[#0F2233] shadow-xs'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setOpenComplaintId(isOpen ? null : c.id)}
                        className="flex-1 text-start space-y-1.5 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded bg-[#DC2626] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                            {c.id}
                          </span>
                          <span className="font-mono font-bold text-[#0F2233]">
                            {isAr ? `حجز ${c.bookingRef}` : `Booking ${c.bookingRef}`}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-[#EE5426]">{c.issueType}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#334155]">
                            {isAr ? `الأولوية: ${c.severity}` : `Severity: ${c.severity}`}
                          </span>
                        </div>
                        <p className="text-base font-bold text-[#0F2233]">
                          {c.customerName}, {c.tripTitle}
                        </p>
                        <p className="text-xs font-medium text-[#334155] leading-relaxed">
                          {c.summary}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
                          <span className="inline-flex items-center gap-1 rounded-md border border-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 text-[#15803D]">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>
                              {isAr
                                ? `شات وواتساب (${chatMessages.length})`
                                : `WhatsApp & Chat (${chatMessages.length})`}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-[#EE5426] bg-[#FFF7ED] px-2.5 py-1 text-[#D9461B]">
                            <Mail className="h-3.5 w-3.5" />
                            <span>
                              {isAr
                                ? `سجل الإيميلات (${linkedEmails.length})`
                                : `Customer Emails (${linkedEmails.length})`}
                            </span>
                          </span>
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="font-mono text-sm font-extrabold text-[#DC2626] tabular-nums">
                          €{c.refundRequestedEur}
                        </span>
                        {linkedBooking && (
                          <button
                            type="button"
                            onClick={() => handleRescheduleTomorrow(linkedBooking)}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border-2 border-[#0F2233] bg-white px-3 text-xs font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white cursor-pointer"
                            title={
                              isAr
                                ? 'تأجيل الرحلة لليوم التالي بسبب الطقس بدلاً من الإلغاء'
                                : 'Postpone trip +1 day due to weather before resorting to refund'
                            }
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>
                              {isAr ? 'تأجيل للغد (+1 يوم)' : 'Reschedule +1 Day'}
                            </span>
                          </button>
                        )}
                        <select
                          value={c.status}
                          onChange={(e) =>
                            onUpdateComplaint(c.id, {
                              status: e.target.value as ComplaintCase['status'],
                            })
                          }
                          className="min-h-[36px] rounded-lg border-2 border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#0F2233]"
                        >
                          <option value="Open">{isAr ? 'مفتوحة (Open)' : 'Open'}</option>
                          <option value="Investigating">
                            {isAr ? 'قيد المراجعة' : 'Investigating'}
                          </option>
                          <option value="Refunded">
                            {isAr ? 'تم الاسترداد' : 'Refunded'}
                          </option>
                          <option value="Resolved">
                            {isAr ? 'تم الحل (Resolved)' : 'Resolved'}
                          </option>
                        </select>
                        {c.status !== 'Refunded' && c.status !== 'Resolved' && (
                          <button
                            type="button"
                            onClick={() => onUpdateComplaint(c.id, { status: 'Refunded' })}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#DC2626] px-3 text-xs font-bold text-white hover:bg-[#B91C1C] cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{isAr ? 'إصدار استرداد' : 'Issue Refund'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t-2 border-[#CBD5E1] bg-[#F8FAFC] p-5 space-y-4">
                        {/* Channel Tabs + Full Reader Modal Launchers */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="inline-flex rounded-xl border border-[#CBD5E1] bg-white p-1 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() =>
                                setComplaintChannelTab((prev) => ({ ...prev, [c.id]: 'all' }))
                              }
                              className={`rounded-lg px-3 py-1.5 cursor-pointer ${
                                channelTab === 'all'
                                  ? 'bg-[#0F2233] text-white'
                                  : 'text-[#334155] hover:text-[#0F2233]'
                              }`}
                            >
                              {isAr
                                ? `المدمج: واتساب + إيميل (${chatMessages.length + linkedEmails.length})`
                                : `Combined: WhatsApp + Email (${chatMessages.length + linkedEmails.length})`}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setComplaintChannelTab((prev) => ({
                                  ...prev,
                                  [c.id]: 'email',
                                }))
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 cursor-pointer ${
                                channelTab === 'email'
                                  ? 'bg-[#EE5426] text-white'
                                  : 'text-[#334155] hover:text-[#0F2233]'
                              }`}
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>
                                {isAr
                                  ? `الإيميلات (${linkedEmails.length})`
                                  : `Emails (${linkedEmails.length})`}
                              </span>
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
                                  : 'text-[#334155] hover:text-[#0F2233]'
                              }`}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>
                                {isAr
                                  ? `شات وواتساب (${chatMessages.length})`
                                  : `WhatsApp Chat (${chatMessages.length})`}
                              </span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {linkedChat && (
                              <button
                                type="button"
                                onClick={() =>
                                  setReaderModal({
                                    kind: 'chat',
                                    thread: linkedChat,
                                    caseItem: c,
                                  })
                                }
                                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 text-xs font-bold text-white hover:bg-[#15803D] cursor-pointer"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>
                                  {isAr
                                    ? 'فتح شاشة محادثة الواتساب الكاملة'
                                    : 'Open Full WhatsApp Chat Screen'}
                                </span>
                              </button>
                            )}
                            {linkedBooking && (
                              <button
                                type="button"
                                onClick={() => openBookingTicket(linkedBooking)}
                                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#0F2233] bg-white px-3 text-xs font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>{isAr ? 'تذكرة الحجز' : 'View Ticket'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Clickable Customer Email Log Section */}
                        {(channelTab === 'all' || channelTab === 'email') && (
                          <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D9461B]">
                                <Mail className="h-4 w-4" />
                                <span>
                                  {isAr
                                    ? 'سجل إيميلات العميل (اضغط على أي إيميل لفتحه في شاشة القراءة)'
                                    : 'Customer Email Log (Click any email to open full reader screen)'}
                                </span>
                              </span>
                              <span className="text-xs font-mono font-semibold text-[#334155]">
                                {linkedBooking?.guestEmail || c.bookingRef}
                              </span>
                            </div>

                            {linkedEmails.length === 0 ? (
                              <p className="text-xs font-medium text-[#475569] py-2">
                                {isAr
                                  ? 'لا توجد إيميلات مسجلة لهذا الحجز بعد.'
                                  : 'No emails recorded for this booking yet.'}
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {linkedEmails.map((em) => (
                                  <button
                                    key={em.id}
                                    type="button"
                                    onClick={() =>
                                      setReaderModal({
                                        kind: 'email',
                                        email: em,
                                        caseItem: c,
                                      })
                                    }
                                    className="w-full text-start rounded-xl border-2 border-[#CBD5E1] bg-[#FFFDFB] hover:border-[#EE5426] hover:bg-[#FFF7ED]/50 p-3.5 text-xs space-y-2 transition-all cursor-pointer"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span
                                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                            em.direction === 'inbound'
                                              ? 'bg-[#DC2626] text-white'
                                              : 'bg-[#0F2233] text-white'
                                          }`}
                                        >
                                          {em.direction === 'inbound'
                                            ? isAr
                                              ? 'إيميل وارد من العميل'
                                              : 'CUSTOMER EMAIL'
                                            : isAr
                                            ? 'رد مرسل من العمليات'
                                            : 'SENT BY OPERATIONS'}
                                        </span>
                                        <span className="font-bold text-[#0F2233] text-sm">
                                          {em.subject}
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-bold text-[#EE5426]">
                                        {isAr ? 'فتح وقراءة الإيميل ↗' : 'Open Email Reader ↗'}
                                      </span>
                                    </div>
                                    <div className="text-xs font-medium text-[#0F2233] whitespace-pre-wrap leading-relaxed line-clamp-3">
                                      {em.body || em.subject}
                                    </div>
                                    <div className="text-[11px] font-semibold text-[#475569] flex items-center justify-between">
                                      <span>
                                        {em.direction === 'inbound'
                                          ? `From: ${em.from || em.to}`
                                          : `To: ${em.to}`}
                                      </span>
                                      <span>{em.sentAt}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Clickable WhatsApp / Chat Section */}
                        {(channelTab === 'all' || channelTab === 'whatsapp') && (
                          <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803D]">
                                <MessageCircle className="h-4 w-4" />
                                <span>
                                  {isAr
                                    ? 'محادثة الواتساب والشات المرتبطة بالعميل'
                                    : 'Linked WhatsApp & Live Chat Transcript'}
                                </span>
                              </span>
                              {linkedChat && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReaderModal({
                                      kind: 'chat',
                                      thread: linkedChat,
                                      caseItem: c,
                                    })
                                  }
                                  className="text-xs font-bold text-[#15803D] hover:underline cursor-pointer"
                                >
                                  {isAr
                                    ? 'فتح في شاشة مستقلة ↗'
                                    : 'Expand in Full Screen Reader ↗'}
                                </button>
                              )}
                            </div>

                            {chatMessages.length === 0 ? (
                              <p className="text-xs font-medium text-[#475569] py-2">
                                {isAr
                                  ? 'لا توجد رسائل شات مسجلة بعد، اكتب ردك بالأسفل للتواصل الفوري.'
                                  : 'No chat messages recorded yet, write a reply below to start.'}
                              </p>
                            ) : (
                              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pe-1">
                                {chatMessages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    onClick={() => {
                                      if (linkedChat) {
                                        setReaderModal({
                                          kind: 'chat',
                                          thread: linkedChat,
                                          caseItem: c,
                                        });
                                      }
                                    }}
                                    className={`max-w-[88%] rounded-xl px-4 py-2.5 cursor-pointer ${
                                      msg.sender === 'operator'
                                        ? 'ms-auto bg-[#EE5426] text-white'
                                        : 'border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F2233]'
                                    }`}
                                  >
                                    <p
                                      dir="auto"
                                      className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap"
                                    >
                                      {msg.text}
                                    </p>
                                    <span
                                      className={`mt-1 block text-[10.5px] font-semibold ${
                                        msg.sender === 'operator'
                                          ? 'text-white/85'
                                          : 'text-[#475569]'
                                      }`}
                                    >
                                      {msg.sender === 'operator'
                                        ? isAr
                                          ? 'العمليات'
                                          : 'Operations'
                                        : c.customerName}{' '}
                                      · {msg.timestamp}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Direct Reply Composer */}
                        <div className="rounded-xl border-2 border-[#0F2233] bg-white p-4 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                disabled={!!complaintAiLoading[c.id]}
                                onClick={() => void handleComplaintSmartDraft(c)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F2233] bg-[#FAF4ED] px-3 py-1.5 font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white disabled:opacity-60 cursor-pointer transition-colors"
                              >
                                {complaintAiLoading[c.id] ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5" />
                                )}
                                <span>
                                  {complaintAiLoading[c.id]
                                    ? isAr
                                      ? 'جاري التجهيز...'
                                      : 'Drafting...'
                                    : isAr
                                    ? 'تجهيز رد ذكي'
                                    : 'Smart Reply Draft'}
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
                                className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0F2233] cursor-pointer"
                              >
                                <option value="auto">
                                  {isAr
                                    ? `لغة العميل (${defaultCustomerLang.toUpperCase()})`
                                    : `Guest Lang (${defaultCustomerLang.toUpperCase()})`}
                                </option>
                                <option value="en">English (EN)</option>
                                <option value="de">Deutsch (DE)</option>
                                <option value="ar">العربية (AR)</option>
                                <option value="fr">Français (FR)</option>
                                <option value="it">Italiano (IT)</option>
                                <option value="ru">Русский (RU)</option>
                              </select>
                            </div>

                            {complaintAiNote[c.id] && (
                              <span className="inline-flex items-center gap-1 text-[#15803D] font-bold">
                                <Check className="h-3.5 w-3.5 shrink-0" />
                                <span>{complaintAiNote[c.id]}</span>
                              </span>
                            )}
                          </div>

                          {complaintAiError[c.id] && (
                            <p className="text-xs font-bold text-[#DC2626]">
                              {complaintAiError[c.id]}
                            </p>
                          )}
                          {complaintSentNotice[c.id] && (
                            <p className="text-xs font-bold text-[#15803D]">
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
                            placeholder={
                              isAr
                                ? `اكتب ردك إلى ${c.customerName} هنا...`
                                : `Write your response to ${c.customerName} here…`
                            }
                            className="w-full min-h-[60px] rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                          />

                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleSendComplaintEmail(c)}
                              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#EE5426] bg-[#FFF7ED] px-3.5 text-xs font-bold text-[#D9461B] hover:bg-[#FFEDD5] cursor-pointer"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>{isAr ? 'رد عبر الإيميل' : 'Reply via Email'}</span>
                            </button>

                            <a
                              href={waHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#16A34A] px-3.5 text-xs font-bold text-white hover:bg-[#15803D]"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>{isAr ? 'رد عبر واتساب ↗' : 'Reply on WhatsApp ↗'}</span>
                            </a>

                            <button
                              type="button"
                              disabled={!replyDraft.trim()}
                              onClick={() => handleSendComplaintChatReply(c)}
                              className="btn-wasla-primary min-h-[38px] gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>{isAr ? 'إرسال في الشات' : 'Send to Chat'}</span>
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
        {/* TAB 4: SUPPLIERS MANIFEST & FINANCIAL SETTLEMENT DIRECTORY   */}
        {/* ============================================================ */}
        {activeTab === 'directory' && (
          <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Financial & Multi-Currency Settlement Banner */}
            <div className="rounded-xl border border-[#CBD5E1] bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#EE5426]">
                  {isAr
                    ? 'كشوفات التشغيل وتسوية الحسابات مع الموردين'
                    : 'Supplier Operational Manifests & Financial Settlement Ledger'}
                </div>
                <h2 className="text-lg font-bold text-[#0F2233]">
                  {isAr
                    ? `كشف حجوزات الموردين والأفراد والتواريخ والجنسيات والحسابات (${suppliers.length} مورد)`
                    : `Full Supplier Bookings, Pax Counts, Dates, Nationalities & Cash/Link Settlements (${suppliers.length} Partners)`}
                </h2>
                <p className="text-xs font-medium text-[#334155]">
                  {isAr
                    ? 'التحصيل متاح بأي عملة (بالمصري EGP أو اليورو EUR أو الدولار USD). اضغط على أي مورد لفتح كشف الركاب الكامل أو تنزيل شيت حسابات المورد CSV.'
                    : 'Cash on pickup is accepted in any currency (EUR, USD, or EGP). Click any supplier to open their full passenger manifest or download their settlement CSV sheet.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <label className="relative block w-full sm:w-64">
                  <Search
                    className="h-3.5 w-3.5 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={directoryQuery}
                    onChange={(e) => setDirectoryQuery(e.target.value)}
                    placeholder={
                      isAr ? 'ابحث باسم المورد أو المدينة...' : 'Search supplier or city...'
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white ps-8 pe-3 text-xs font-semibold text-[#0F2233] focus:border-[#0F2233] focus:outline-none"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => exportBookingsToCsv(sortedBookings, 'all-suppliers-ledger')}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#0F2233] px-4 py-2 text-xs font-bold text-white hover:bg-[#19354F] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>
                    {isAr ? 'تنزيل شيت تسويات كل الموردين CSV' : 'Export All Suppliers Ledger CSV'}
                  </span>
                </button>
              </div>
            </div>

            {/* Suppliers Operational & Settlement View OR Dedicated Opened Supplier Excel Sheet */}
            {(() => {
              const openedSupplier = selectedSupplierName
                ? supplierManifestSummaries.find(
                    (s) => s.supplier.name === selectedSupplierName
                  ) || null
                : null;

              if (openedSupplier) {
                return (
                  <div className="space-y-4">
                    {/* Sticky Top Return / Close / Export Action Bar */}
                    <div className="sticky top-0 z-30 rounded-xl border-2 border-[#0F2233] bg-white/95 backdrop-blur-sm p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierName(null)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border-2 border-[#0F2233] bg-white px-3.5 text-xs font-extrabold text-[#0F2233] hover:bg-[#0F2233] hover:text-white transition-colors cursor-pointer shrink-0"
                        >
                          <ArrowLeft
                            className={`h-4 w-4 shrink-0 ${isAr ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                          <span>
                            {isAr ? 'رجوع لقائمة الموردين' : 'Back to Suppliers'}
                          </span>
                        </button>

                        <div className="min-w-0">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-[#EE5426]">
                            {isAr
                              ? 'شيت كشف الركاب والتسويات المالية للمورد'
                              : 'Supplier Passenger Manifest & Settlement Sheet'}
                          </div>
                          <h3 className="text-base sm:text-lg font-extrabold text-[#0F2233] truncate">
                            {openedSupplier.supplier.name}{' '}
                            <span className="text-xs font-semibold text-[#475569]">
                              · {openedSupplier.supplier.city}
                            </span>
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            exportBookingsToCsv(
                              openedSupplier.allBookings,
                              openedSupplier.supplier.name
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                            )
                          }
                          className="btn-wasla-primary min-h-[38px] gap-1.5 rounded-lg px-4 py-2 text-xs font-bold cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {isAr
                              ? `تنزيل شيت ${openedSupplier.supplier.name} (CSV)`
                              : `Download ${openedSupplier.supplier.name} CSV`}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedSupplierName(null)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border-2 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-extrabold text-[#0F2233] hover:border-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors cursor-pointer"
                          aria-label={isAr ? 'إغلاق الشيت' : 'Close supplier sheet'}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          <span>{isAr ? 'إغلاق الشيت' : 'Close Sheet'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Supplier Settlement Financial Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="rounded-xl border border-[#CBD5E1] bg-white p-3.5">
                        <div className="text-[11px] font-bold text-[#475569]">
                          {isAr ? 'إجمالي الحجوزات' : 'Total Bookings'}
                        </div>
                        <div className="mt-1 font-mono text-lg font-extrabold text-[#0F2233] tabular-nums">
                          {openedSupplier.allBookings.length}
                        </div>
                        <div className="text-[10.5px] font-semibold text-[#475569]">
                          {openedSupplier.confirmedCount}C · {openedSupplier.pendingCount}P ·{' '}
                          {openedSupplier.completedCount}D
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#CBD5E1] bg-white p-3.5">
                        <div className="text-[11px] font-bold text-[#475569]">
                          {isAr ? 'إجمالي الأفراد' : 'Total Pax'}
                        </div>
                        <div className="mt-1 font-mono text-lg font-extrabold text-[#EE5426] tabular-nums">
                          {openedSupplier.totalPax}
                        </div>
                        <div className="text-[10.5px] font-semibold text-[#475569]">
                          {openedSupplier.totalAdults}A + {openedSupplier.totalChildren}C +{' '}
                          {openedSupplier.totalInfants}INF
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#CBD5E1] bg-white p-3.5">
                        <div className="text-[11px] font-bold text-[#475569]">
                          {isAr ? 'إجمالي المبيعات' : 'Gross Sales'}
                        </div>
                        <div className="mt-1 font-mono text-lg font-extrabold text-[#0F2233] tabular-nums">
                          €{openedSupplier.grossEur}
                        </div>
                        <div className="text-[10.5px] font-semibold text-[#475569]">
                          {isAr ? 'صافي المورد:' : 'Supplier Net:'} €{openedSupplier.supplierNetEur}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#CBD5E1] bg-white p-3.5">
                        <div className="text-[11px] font-bold text-[#475569]">
                          {isAr ? 'تحصيل كاش (المورد)' : 'Cash Collected'}
                        </div>
                        <div className="mt-1 font-mono text-lg font-extrabold text-[#B45309] tabular-nums">
                          €{openedSupplier.cashCollectedBySupplierEur}
                        </div>
                        <div className="text-[10.5px] font-semibold text-[#475569]">
                          EUR / USD / EGP
                        </div>
                      </div>

                      <div className="card-wasla rounded-xl p-3.5">
                        <div className="text-[11px] font-bold text-[#64748B]">
                          {isAr ? 'مدفوع أونلاين لوصلة' : 'Paid Online (Wasla)'}
                        </div>
                        <div className="mt-1 font-mono text-lg font-extrabold text-[#0F2233] tabular-nums">
                          €{openedSupplier.onlineCollectedByWaslaEur}
                        </div>
                        <div className="text-[10.5px] font-semibold text-[#64748B]">
                          {isAr ? `عمولة وصلة (${safeCommissionPct}%):` : `Wasla Comm (${safeCommissionPct}%):`} €
                          {openedSupplier.waslaCommissionEur}
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-[#0F2233]/20 bg-[#FAF4ED] p-3.5">
                        <div className="text-[11px] font-bold text-[#475569]">
                          {isAr ? 'صافي التسوية النهائية' : 'Net Settlement'}
                        </div>
                        {openedSupplier.balanceToWaslaEur > 0 ? (
                          <>
                            <div className="mt-1 font-mono text-lg font-extrabold text-[#15803D] tabular-nums">
                              +€{openedSupplier.balanceToWaslaEur}
                            </div>
                            <div className="text-[10.5px] font-bold text-[#15803D]">
                              {isAr ? 'مطلوب من المورد لوصلة' : 'Supplier owes Wasla'}
                            </div>
                          </>
                        ) : openedSupplier.balanceToWaslaEur < 0 ? (
                          <>
                            <div className="mt-1 font-mono text-lg font-extrabold text-[#D9461B] tabular-nums">
                              €{Math.abs(openedSupplier.balanceToWaslaEur)}
                            </div>
                            <div className="text-[10.5px] font-bold text-[#D9461B]">
                              {isAr ? 'مستحق للمورد من وصلة' : 'Wasla pays Supplier'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mt-1 font-mono text-lg font-extrabold text-[#64748B] tabular-nums">
                              €0
                            </div>
                            <div className="text-[10.5px] font-bold text-[#64748B]">
                              {isAr ? 'خالص / متوازن' : 'Settled / Balanced'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Full Passenger & Settlement Sheet Table with Always-Visible Horizontal Scrollbar & Keyboard Arrows */}
                    {openedSupplier.allBookings.length === 0 ? (
                      <div className="rounded-xl border border-[#CBD5E1] bg-white p-8 text-center space-y-3">
                        <p className="text-sm font-bold text-[#475569]">
                          {isAr
                            ? 'لا توجد حجوزات مسجلة لهذا المورد حالياً.'
                            : 'No bookings assigned to this supplier yet.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierName(null)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#0F2233] px-4 text-xs font-bold text-white hover:bg-[#19354F] cursor-pointer"
                        >
                          <ArrowLeft
                            className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                          <span>{isAr ? 'العودة لقائمة الموردين' : 'Back to Suppliers List'}</span>
                        </button>
                      </div>
                    ) : (
                      <HorizontalScrollTableFrame
                        isAr={isAr}
                        keyboardEnabled={!modalMode && !readerModal}
                        ariaLabel={
                          isAr
                            ? `شيت كشف ركاب ${openedSupplier.supplier.name}`
                            : `${openedSupplier.supplier.name} passenger manifest sheet`
                        }
                      >
                        <table className="w-full text-start border-collapse text-xs">
                          <thead>
                            <tr className="border-b-2 border-[#CBD5E1] bg-[#0F2233] text-[11px] font-bold text-white">
                              <th className="py-3 px-3 text-start whitespace-nowrap">
                                {isAr ? 'رقم الحجز' : 'Ref'}
                              </th>
                              <th className="py-3 px-3 text-start whitespace-nowrap">
                                {isAr ? 'التاريخ والبيك أب' : 'Date & Pickup'}
                              </th>
                              <th className="py-3 px-3 text-start whitespace-nowrap">
                                {isAr ? 'الرحلة' : 'Excursion'}
                              </th>
                              <th className="py-3 px-3 text-start whitespace-nowrap">
                                {isAr ? 'العميل والجنسية' : 'Guest & Nationality'}
                              </th>
                              <th className="py-3 px-3 text-start whitespace-nowrap">
                                {isAr ? 'الفندق والغرفة' : 'Hotel & Room'}
                              </th>
                              <th className="py-3 px-3 text-end whitespace-nowrap">
                                {isAr ? 'الأفراد' : 'Pax'}
                              </th>
                              <th className="py-3 px-3 text-start whitespace-nowrap">
                                {isAr ? 'الحالة' : 'Status'}
                              </th>
                              <th className="py-3 px-3 text-start whitespace-nowrap">
                                {isAr ? 'التحصيل والعملات' : 'Collection & Currencies'}
                              </th>
                              <th className="py-3 px-3 text-end whitespace-nowrap">
                                {isAr ? 'الإجمالي' : 'Gross'}
                              </th>
                              <th className="py-3 px-3 text-end whitespace-nowrap">
                                {isAr ? 'عمولة وصلة' : 'Wasla Comm'}
                              </th>
                              <th className="py-3 px-3 text-end whitespace-nowrap">
                                {isAr ? 'صافي المورد' : 'Supplier Net'}
                              </th>
                              <th className="py-3 px-3 text-end whitespace-nowrap">
                                {isAr ? 'التذكرة' : 'Ticket'}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#CBD5E1]">
                            {openedSupplier.allBookings.map((bk) => {
                              const isActiveFinance =
                                bk.status !== 'Cancelled' &&
                                bk.status !== 'Refunded' &&
                                bk.status !== 'No show';
                              const gross = isActiveFinance ? bk.grossEur : 0;
                              const comm = Math.round((gross * safeCommissionPct) / 100);
                              const net = gross - comm;
                              return (
                                <tr
                                  key={bk.id}
                                  onClick={() => openBookingTicket(bk)}
                                  className="bg-white hover:bg-[#FFF7ED] cursor-pointer transition-colors"
                                >
                                  <td className="py-3 px-3 font-mono font-extrabold text-[#EE5426] whitespace-nowrap">
                                    {bk.id}
                                  </td>
                                  <td className="py-3 px-3 font-mono tabular-nums whitespace-nowrap">
                                    <div className="font-bold text-[#0F2233]">{bk.date}</div>
                                    <div className="text-[11px] font-semibold text-[#475569]">
                                      {bk.pickupTime || 'TBD'}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-semibold text-[#0F2233] min-w-[180px]">
                                    <div className="line-clamp-1">{bk.tripTitle}</div>
                                    <div className="text-[10.5px] font-medium text-[#475569]">
                                      {bk.destination} · {bk.category}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-semibold text-[#0F2233] whitespace-nowrap">
                                    <span>{bk.guestName}</span>{' '}
                                    <span className="rounded bg-[#F1F5F9] border border-[#CBD5E1] px-1.5 py-0.5 text-[10px] font-bold text-[#334155]">
                                      {bk.guestCountry || 'Guest'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-[#334155] min-w-[170px]">
                                    <div className="font-semibold text-[#0F2233] truncate max-w-[200px]">
                                      {bk.hotel}
                                    </div>
                                    {bk.roomNumber && (
                                      <div className="text-[10.5px] font-medium text-[#475569]">
                                        {isAr ? `غرفة ${bk.roomNumber}` : `Room ${bk.roomNumber}`}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-end font-mono font-bold whitespace-nowrap tabular-nums">
                                    {bk.adults}A
                                    {bk.children > 0 ? `+${bk.children}C` : ''}
                                    {(bk.infants ?? 0) > 0 ? `+${bk.infants}INF` : ''}
                                  </td>
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span
                                      className={`rounded border px-2 py-0.5 text-[10.5px] font-bold ${statusBadgeStyle(
                                        bk.status
                                      )}`}
                                    >
                                      {bk.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-[11px] font-semibold whitespace-nowrap">
                                    <div className="text-[#0F2233]">{bk.paymentStatus}</div>
                                    <div className="text-[10px] text-[#64748B]">
                                      EUR / USD / EGP
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-end font-mono font-bold whitespace-nowrap tabular-nums">
                                    €{gross}
                                  </td>
                                  <td className="py-3 px-3 text-end font-mono font-bold text-[#EE5426] whitespace-nowrap tabular-nums">
                                    €{comm}
                                  </td>
                                  <td className="py-3 px-3 text-end font-mono font-bold text-[#15803D] whitespace-nowrap tabular-nums">
                                    €{net}
                                  </td>
                                  <td
                                    className="py-3 px-3 text-end whitespace-nowrap"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => openBookingTicket(bk)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-[#0F2233] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white cursor-pointer"
                                    >
                                      <Eye className="h-3 w-3" aria-hidden="true" />
                                      <span>{isAr ? 'فتح' : 'Open'}</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </HorizontalScrollTableFrame>
                    )}

                    {/* Bottom Return / Close Bar so you can close immediately after reading */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 shadow-xs">
                      <span className="text-xs font-medium text-[#475569]">
                        {isAr
                          ? 'انتهيت من مراجعة شيت المورد؟ اضغط رجوع أو إغلاق (أو زر Esc في الكيبورد).'
                          : 'Finished reading this supplier sheet? Click Back or Close (or press Esc).'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierName(null)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#0F2233] bg-white px-4 text-xs font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white cursor-pointer"
                        >
                          <ArrowLeft
                            className={`h-3.5 w-3.5 ${isAr ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                          <span>{isAr ? 'العودة لكل الموردين' : 'Back to All Suppliers'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierName(null)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#0F2233] px-4 text-xs font-bold text-white hover:bg-[#19354F] cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{isAr ? 'إغلاق / إلغاء' : 'Close / Cancel'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <HorizontalScrollTableFrame
                  isAr={isAr}
                  keyboardEnabled={!modalMode && !readerModal}
                  ariaLabel={
                    isAr ? 'جدول كشوفات وتسويات الموردين' : 'Suppliers manifest and settlement table'
                  }
                >
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#CBD5E1] bg-[#0F2233] text-[11px] font-bold text-white">
                        <th className="py-3 px-4 text-start whitespace-nowrap">
                          {isAr ? 'المورد والمدينة' : 'Supplier & City'}
                        </th>
                        <th className="py-3 px-3 text-center whitespace-nowrap">
                          {isAr ? 'الحجوزات (مؤكد / معلّق / مكتمل)' : 'Bookings (Conf / Pend / Comp)'}
                        </th>
                        <th className="py-3 px-3 text-center whitespace-nowrap">
                          {isAr ? 'إجمالي الأفراد (بالغ / طفل / رضيع)' : 'Total Pax (A / C / INF)'}
                        </th>
                        <th className="py-3 px-3 text-start whitespace-nowrap">
                          {isAr ? 'تواريخ الرحلات والجنسيات' : 'Trip Dates & Nationalities'}
                        </th>
                        <th className="py-3 px-3 text-end whitespace-nowrap">
                          {isAr ? 'إجمالي المبيعات' : 'Gross Sales'}
                        </th>
                        <th className="py-3 px-3 text-end whitespace-nowrap">
                          {isAr ? 'تحصيل كاش (EUR/USD/EGP)' : 'Cash Collected'}
                        </th>
                        <th className="py-3 px-3 text-end whitespace-nowrap">
                          {isAr ? 'مدفوع أونلاين لوصلة' : 'Paid Online'}
                        </th>
                        <th className="py-3 px-3 text-end whitespace-nowrap">
                          {isAr
                            ? `عمولة وصلة (${safeCommissionPct}%)`
                            : `Wasla Comm (${safeCommissionPct}%)`}
                        </th>
                        <th className="py-3 px-3 text-end whitespace-nowrap">
                          {isAr ? 'صافي التسوية' : 'Net Settlement'}
                        </th>
                        <th className="py-3 px-4 text-end whitespace-nowrap">
                          {isAr ? 'كشف المورد والشيت' : 'Manifest & CSV'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD5E1]">
                      {supplierManifestSummaries.map((item) => (
                        <tr
                          key={item.supplier.id}
                          onClick={() => setSelectedSupplierName(item.supplier.name)}
                          className="cursor-pointer bg-white hover:bg-[#FFF7ED]/70 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0F2233] text-sm">
                              {item.supplier.name}
                            </div>
                            <div className="text-[11px] font-medium text-[#475569]">
                              {item.supplier.city} · {item.supplier.specialty}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center whitespace-nowrap tabular-nums">
                            <div className="font-mono font-extrabold text-[#0F2233] text-sm">
                              {item.allBookings.length}
                            </div>
                            <div className="text-[10.5px] font-semibold text-[#334155]">
                              <span className="text-[#15803D]">{item.confirmedCount}C</span> ·{' '}
                              <span className="text-[#B45309]">{item.pendingCount}P</span> ·{' '}
                              <span className="text-[#0F2233]">{item.completedCount}D</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center whitespace-nowrap tabular-nums">
                            <div className="font-mono font-extrabold text-[#EE5426] text-sm">
                              {item.totalPax} {isAr ? 'فرد' : 'pax'}
                            </div>
                            <div className="text-[10.5px] font-semibold text-[#334155]">
                              {item.totalAdults}A + {item.totalChildren}C + {item.totalInfants}INF
                            </div>
                          </td>

                          <td className="py-3.5 px-3 max-w-[230px] space-y-1">
                            <div className="text-[11px] font-mono font-bold text-[#0F2233] truncate">
                              {item.dates.length > 0
                                ? item.dates.join(', ')
                                : isAr
                                ? 'لا توجد تواريخ نشطة'
                                : 'No active dates'}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.nationalities.slice(0, 4).map((nat) => (
                                <span
                                  key={nat}
                                  className="rounded bg-[#F1F5F9] border border-[#CBD5E1] px-1.5 py-0.5 text-[10px] font-bold text-[#0F2233]"
                                >
                                  {nat}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-end font-mono font-bold text-[#0F2233] whitespace-nowrap tabular-nums">
                            €{item.grossEur}
                          </td>

                          <td className="py-3.5 px-3 text-end font-mono font-bold text-[#B45309] whitespace-nowrap tabular-nums">
                            €{item.cashCollectedBySupplierEur}
                          </td>

                          <td className="py-3.5 px-3 text-end font-mono font-bold text-[#0F2233] whitespace-nowrap tabular-nums">
                            €{item.onlineCollectedByWaslaEur}
                          </td>

                          <td className="py-3.5 px-3 text-end font-mono font-bold text-[#EE5426] whitespace-nowrap tabular-nums">
                            €{item.waslaCommissionEur}
                          </td>

                          <td className="py-3.5 px-3 text-end whitespace-nowrap tabular-nums">
                            {item.balanceToWaslaEur > 0 ? (
                              <span className="inline-flex flex-col items-end">
                                <strong className="font-mono text-xs font-extrabold text-[#15803D]">
                                  +€{item.balanceToWaslaEur}
                                </strong>
                                <span className="text-[10px] font-bold text-[#15803D]">
                                  {isAr ? 'مطلوب من المورد لوصلة' : 'Supplier owes Wasla'}
                                </span>
                              </span>
                            ) : item.balanceToWaslaEur < 0 ? (
                              <span className="inline-flex flex-col items-end">
                                <strong className="font-mono text-xs font-extrabold text-[#D9461B]">
                                  €{Math.abs(item.balanceToWaslaEur)}
                                </strong>
                                <span className="text-[10px] font-bold text-[#D9461B]">
                                  {isAr ? 'مستحق للمورد من وصلة' : 'Wasla pays Supplier'}
                                </span>
                              </span>
                            ) : (
                              <span className="font-mono text-xs font-bold text-[#64748B]">
                                €0
                              </span>
                            )}
                          </td>

                          <td
                            className="py-3.5 px-4 text-end whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedSupplierName(item.supplier.name)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#0F2233] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white cursor-pointer"
                              >
                                <FileText className="h-3 w-3" />
                                <span>{isAr ? 'فتح الشيت' : 'Open Sheet'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  exportBookingsToCsv(
                                    item.allBookings,
                                    item.supplier.name.toLowerCase().replace(/\s+/g, '-')
                                  )
                                }
                                className="btn-wasla-primary gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer"
                              >
                                <Download className="h-3 w-3" />
                                <span>CSV</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </HorizontalScrollTableFrame>
              );
            })()}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE FULL EMAIL & WHATSAPP READER MODAL               */}
      {/* ============================================================ */}
      {readerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/70 p-4 backdrop-blur-xs"
          onClick={() => setReaderModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[#0F2233] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#CBD5E1] bg-[#0F2233] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                {readerModal.kind === 'email' ? (
                  <Mail className="h-5 w-5 text-[#FDBA74] shrink-0" />
                ) : (
                  <MessageCircle className="h-5 w-5 text-[#4ADE80] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#FDBA74]">
                    {readerModal.kind === 'email'
                      ? isAr
                        ? 'عارض محتوى الإيميل الكامل'
                        : 'Full Customer Email Reader'
                      : isAr
                      ? 'عارض محادثة الواتساب والشات'
                      : 'Full WhatsApp & Chat Transcript'}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {readerModal.kind === 'email'
                      ? readerModal.email.subject
                      : `${readerModal.thread.customerName} (${readerModal.thread.bookingRef})`}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReaderModal(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {readerModal.kind === 'email' ? (
              <div className="p-5 space-y-4 text-xs sm:text-sm">
                <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#0F2233]">
                      {isAr ? 'من:' : 'From:'}{' '}
                      <span className="font-mono">
                        {readerModal.email.from ||
                          (readerModal.email.direction === 'inbound'
                            ? readerModal.email.to
                            : liveDeskEmail)}
                      </span>
                    </span>
                    <span className="font-mono text-[#475569]">{readerModal.email.sentAt}</span>
                  </div>
                  <div className="font-bold text-[#0F2233]">
                    {isAr ? 'إلى:' : 'To:'}{' '}
                    <span className="font-mono">{readerModal.email.to}</span>
                  </div>
                  {readerModal.email.bookingRef && (
                    <div className="font-bold text-[#EE5426]">
                      {isAr ? 'رقم الحجز:' : 'Booking Ref:'}{' '}
                      <span className="font-mono">{readerModal.email.bookingRef}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border-2 border-[#CBD5E1] bg-white p-4 text-sm font-medium leading-relaxed text-[#0F2233] whitespace-pre-wrap">
                  {readerModal.email.body || readerModal.email.subject}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <a
                    href={`mailto:${encodeURIComponent(
                      readerModal.email.direction === 'inbound'
                        ? readerModal.email.from || readerModal.email.to
                        : readerModal.email.to
                    )}?subject=${encodeURIComponent(`Re: ${readerModal.email.subject}`)}`}
                    className="btn-wasla-primary min-h-[40px] gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{isAr ? 'الرد على هذا الإيميل' : 'Reply to Email'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setReaderModal(null)}
                    className="min-h-[40px] rounded-xl border border-[#CBD5E1] bg-white px-4 text-xs font-bold text-[#0F2233] cursor-pointer"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="space-y-3 max-h-[55vh] overflow-y-auto bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1]">
                  {readerModal.thread.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[85%] rounded-xl px-4 py-3 ${
                        m.sender === 'operator'
                          ? 'ms-auto bg-[#EE5426] text-white'
                          : 'border border-[#CBD5E1] bg-white text-[#0F2233]'
                      }`}
                    >
                      <p dir="auto" className="text-sm font-medium whitespace-pre-wrap">
                        {m.text}
                      </p>
                      <span
                        className={`mt-1 block text-[11px] font-semibold ${
                          m.sender === 'operator' ? 'text-white/85' : 'text-[#475569]'
                        }`}
                      >
                        {m.sender === 'operator'
                          ? isAr
                            ? 'العمليات'
                            : 'Operations'
                          : readerModal.thread.customerName}{' '}
                        · {m.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedThreadId(readerModal.thread.id);
                      setActiveTab('chat');
                      setCommsSubView('chats');
                      setReaderModal(null);
                    }}
                    className="min-h-[40px] rounded-xl bg-[#16A34A] px-4 text-xs font-bold text-white hover:bg-[#15803D] cursor-pointer"
                  >
                    {isAr ? 'الرد في شاشة الشات' : 'Reply in Live Chat'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderModal(null)}
                    className="min-h-[40px] rounded-xl border border-[#CBD5E1] bg-white px-4 text-xs font-bold text-[#0F2233] cursor-pointer"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* BOOKING TICKET / EDIT / CREATE MODAL                         */}
      {/* ============================================================ */}
      {modalMode && modalDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/65 p-4 backdrop-blur-[2px]"
          onClick={() => {
            setModalMode(null);
            setModalDraft(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white/95 px-6 py-4 backdrop-blur-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#EE5426]">
                  <span>
                    {modalMode === 'ticket'
                      ? isAr
                        ? `تذكرة حجز العميل · ${modalDraft.id}`
                        : `Customer Booking Ticket · ${modalDraft.id}`
                      : isAr
                      ? `إدارة الحجز وموعد البيك أب · ${modalDraft.id}`
                      : `Booking & Manual Pickup Control · ${modalDraft.id}`}
                  </span>
                  {getBookingUrgency(modalDraft).isUrgent && (
                    <span className="rounded bg-[#DC2626] px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {isAr ? 'عاجل' : 'URGENT'}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#0F2233]">
                  {modalMode === 'create'
                    ? isAr
                      ? 'إضافة حجز يدوي جديد'
                      : 'Add Manual Booking'
                    : `${modalDraft.guestName}, ${modalDraft.tripTitle}`}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {modalMode === 'ticket' && (
                  <button
                    type="button"
                    onClick={() => setModalMode('edit')}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#EE5426] bg-[#FFF7ED] px-3.5 text-xs font-bold text-[#D9461B] hover:bg-[#FFEDD5] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>{isAr ? 'تعديل الحجز والبيك أب' : 'Edit Booking & Pickup'}</span>
                  </button>
                )}
                {modalMode === 'edit' && (
                  <button
                    type="button"
                    onClick={() => setModalMode('ticket')}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-bold text-[#0F2233] hover:bg-[#E2E8F0] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#EE5426]" />
                    <span>{isAr ? 'عرض التذكرة' : 'Back to Ticket'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setModalMode(null);
                    setModalDraft(null);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {modalMode === 'ticket' ? (
              <div className="p-6 space-y-5">
                {/* Digital Customer Voucher Lock / Unlock Banner */}
                {(() => {
                  const isUnlocked =
                    modalDraft.status === 'Confirmed' ||
                    modalDraft.status === 'Driver assigned' ||
                    modalDraft.status === 'Completed';
                  return (
                    <div
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-xs ${
                        isUnlocked
                          ? 'border-[#16A34A] bg-[#F0FDF4] text-[#14532D]'
                          : 'border-[#DC2626] bg-[#FEF2F2] text-[#7F1D1D]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <Unlock className="h-4 w-4 text-[#15803D] shrink-0" />
                        ) : (
                          <Lock className="h-4 w-4 text-[#DC2626] shrink-0" />
                        )}
                        <span className="font-bold">
                          {isUnlocked
                            ? isAr
                              ? '✓ تذكرة العميل الرقمية النهائية مفتوحة ومؤكدة للعميل'
                              : '✓ Customer Digital Boarding Voucher is UNLOCKED & active'
                            : isAr
                            ? '🔒 تذكرة العميل النهائية مغلقة حالياً، لن تفتح للعميل إلا بعد ضغطك على تأكيد الحجز'
                            : '🔒 Customer Final Boarding Voucher is LOCKED until you confirm this booking'}
                        </span>
                      </div>
                      {!isUnlocked && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateBooking(modalDraft.id, { status: 'Confirmed' });
                            setModalDraft((prev) =>
                              prev ? { ...prev, status: 'Confirmed' } : prev
                            );
                          }}
                          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-[#16A34A] px-3.5 text-xs font-bold text-white hover:bg-[#15803D] cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            {isAr
                              ? 'تأكيد الحجز وفتح تذكرة العميل'
                              : 'Confirm & Unlock Customer Voucher'}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Ticket Body */}
                <div className="overflow-hidden rounded-2xl border-2 border-[#0F2233] bg-white shadow-md">
                  <div className="bg-[#0F2233] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#FDBA74]">
                        {isAr
                          ? 'تذكرة صعود رقمية · وصلة ترافيل'
                          : 'WASLA TRAVEL DIGITAL BOARDING VOUCHER'}
                      </span>
                      <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                        {modalDraft.tripTitle}
                      </div>
                      <div className="text-xs text-[#E2E8F0]">
                        {modalDraft.destination} · {modalDraft.category} ·{' '}
                        {isAr ? 'المورد:' : 'Supplier:'} {modalDraft.supplierName}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-lg bg-[#EE5426] px-3 py-1 font-mono text-xs font-bold text-white">
                        {modalDraft.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="rounded bg-white/15 px-2 py-0.5 font-bold text-white">
                          {modalDraft.status}
                        </span>
                        <span className="rounded bg-[#10B981]/25 px-2 py-0.5 font-bold text-[#A7F3D0]">
                          {modalDraft.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3">
                        <span className="block text-[11px] font-bold text-[#475569]">
                          {isAr ? 'اسم العميل' : 'Guest Name'}
                        </span>
                        <strong className="mt-1 block text-sm font-bold text-[#0F2233]">
                          {modalDraft.guestName}
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-3">
                        <span className="block text-[11px] font-bold text-[#9A3412]">
                          {isAr ? 'الجنسية' : 'Nationality'}
                        </span>
                        <strong className="mt-1 block text-sm font-bold text-[#EE5426]">
                          {modalDraft.guestCountry || 'Guest'}
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3">
                        <span className="block text-[11px] font-bold text-[#15803D]">
                          {isAr ? 'الإجمالي (يُقبل EUR / USD / EGP)' : 'Total (EUR / USD / EGP)'}
                        </span>
                        <strong className="mt-1 block font-mono text-base font-extrabold text-[#15803D] tabular-nums">
                          €{modalDraft.grossEur}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-bold text-[#475569]">
                          {isAr ? 'التاريخ وموعد البيك أب اليدوي' : 'Trip Date & Manual Pickup Time'}
                        </span>
                        <div className="font-bold text-[#0F2233] tabular-nums">
                          {isAr ? 'التاريخ:' : 'Date:'} {modalDraft.date}
                        </div>
                        {modalDraft.tripStartTime && (
                          <div className="font-semibold text-[#334155]">
                            {isAr ? 'انطلاق الرحلة:' : 'Trip Start:'} {modalDraft.tripStartTime}
                          </div>
                        )}
                        <div className="font-bold text-[#EE5426]">
                          {isAr ? 'البيك أب:' : 'Hotel Pickup:'} {modalDraft.pickupTime || 'TBD'} (
                          {modalDraft.pickupSpot === 'Outside Main Gate'
                            ? isAr
                              ? 'أمام البوابة الرئيسية'
                              : 'Outside Main Gate'
                            : isAr
                            ? 'داخل الريسبشن'
                            : 'Inside Reception'}
                          )
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-bold text-[#475569]">
                          {isAr ? 'الفندق ورقم الغرفة' : 'Hotel & Room Number'}
                        </span>
                        <strong className="block text-sm font-bold text-[#0F2233]">
                          {modalDraft.hotel}
                        </strong>
                        <span className="block font-semibold text-[#334155]">
                          {modalDraft.roomNumber
                            ? isAr
                              ? `غرفة رقم: ${modalDraft.roomNumber}`
                              : `Room No: ${modalDraft.roomNumber}`
                            : isAr
                            ? 'لم يُسجل رقم الغرفة بعد'
                            : 'Room number not provided'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-bold text-[#475569]">
                          {isAr ? 'عدد الأفراد' : 'Passengers Manifest'}
                        </span>
                        <strong className="block text-sm font-bold text-[#0F2233] tabular-nums">
                          {modalDraft.adults} {isAr ? 'بالغ' : 'Adults'}
                          {modalDraft.children > 0
                            ? ` + ${modalDraft.children} ${isAr ? 'طفل' : 'Children'}`
                            : ''}
                          {(modalDraft.infants ?? 0) > 0
                            ? ` + ${modalDraft.infants} ${isAr ? 'رضيع' : 'Infants'}`
                            : ''}
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-bold text-[#475569]">
                          {isAr ? 'تسوية الحساب والعمولة' : 'Accounting & Settlement'}
                        </span>
                        {(() => {
                          const comm = Math.round(
                            (modalDraft.grossEur * safeCommissionPct) / 100
                          );
                          const net = modalDraft.grossEur - comm;
                          return (
                            <>
                              <strong className="block text-xs font-bold text-[#0F2233] tabular-nums">
                                {isAr
                                  ? `عمولة وصلة (${safeCommissionPct}%): €${comm} · صافي المورد: €${net}`
                                  : `Wasla Comm (${safeCommissionPct}%): €${comm} · Supplier Net: €${net}`}
                              </strong>
                              <span className="block text-[11px] font-semibold text-[#15803D]">
                                {modalDraft.paymentStatus === 'Paid online'
                                  ? isAr
                                    ? `محصل أونلاين لدى وصلة (يُحول €${net} للمورد)`
                                    : `Collected Online by Wasla (Pay €${net} to Supplier)`
                                  : isAr
                                  ? `تحصيل كاش عند الاستلام بأي عملة (عمولة وصلة €${comm})`
                                  : `Cash on Pickup in EUR/USD/EGP (Supplier owes €${comm} comm)`}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {modalDraft.locationImageUrl && (
                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 space-y-1.5">
                        <span className="block text-xs font-bold text-[#0F2233]">
                          {modalDraft.destination === 'Marsa Alam'
                            ? isAr
                              ? 'صورة جواز السفر المرفقة لتصريح مرسى علم'
                              : 'Uploaded Passport Photo (Marsa Alam Permit)'
                            : isAr
                            ? 'المرفق / صورة جواز السفر أو الفندق'
                            : 'Attached Passport / Location Photo'}
                        </span>
                        <img
                          src={modalDraft.locationImageUrl}
                          alt="Booking attachment"
                          className="max-h-52 w-auto rounded-lg object-contain mx-auto border border-[#CBD5E1] bg-white p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket Actions Footer */}
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
                    guestLang: modalDraft.guestLang,
                    notes: modalDraft.notes,
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
                    guestLang: modalDraft.guestLang,
                    notes: modalDraft.notes,
                  });
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {liveWaUrl && (
                          <a
                            href={liveWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#16A34A] px-3.5 text-xs font-bold text-white hover:bg-[#15803D]"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{isAr ? 'إرسال عبر واتساب' : 'Send WhatsApp'}</span>
                          </a>
                        )}
                        {liveEmailUrl && (
                          <a
                            href={liveEmailUrl}
                            onClick={() => {
                              if (onLogDispatchEmail) {
                                onLogDispatchEmail(
                                  modalDraft.guestEmail || modalDraft.guestContact,
                                  `Pickup Details, ${modalDraft.id} (${modalDraft.date})`,
                                  'Booking Confirmation',
                                  { bookingRef: modalDraft.id, direction: 'outbound' }
                                );
                              }
                            }}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#EE5426] bg-[#FFF7ED] px-3.5 text-xs font-bold text-[#D9461B] hover:bg-[#FFEDD5]"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>{isAr ? 'إرسال إيميل' : 'Send Email'}</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRescheduleTomorrow(modalDraft)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#0F2233] bg-white px-3.5 text-xs font-bold text-[#0F2233] hover:bg-[#0F2233] hover:text-white cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {isAr
                              ? 'تأجيل للغد (+1 يوم طقس/رياح)'
                              : 'Reschedule +1 Day (Weather)'}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setModalMode('edit')}
                          className="btn-wasla-primary min-h-[38px] gap-1.5 rounded-lg px-4 py-2 text-xs font-bold cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>{isAr ? 'تعديل' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalMode(null);
                            setModalDraft(null);
                          }}
                          className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-xs font-bold text-[#334155] cursor-pointer"
                        >
                          {isAr ? 'إغلاق' : 'Close'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* EDIT / CREATE FORM (Manual Pickup Time Setter, No Auto Deduction) */
              <form onSubmit={handleSaveBookingModal} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'اسم العميل' : 'Guest Name'}
                    </span>
                    <input
                      type="text"
                      required
                      value={modalDraft.guestName}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, guestName: e.target.value } : prev
                        )
                      }
                      className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-medium"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'الجنسية' : 'Nationality'}
                    </span>
                    <input
                      type="text"
                      value={modalDraft.guestCountry || ''}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, guestCountry: e.target.value } : prev
                        )
                      }
                      className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-medium"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'اسم الرحلة' : 'Excursion Title'}
                    </span>
                    <input
                      type="text"
                      required
                      value={modalDraft.tripTitle}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, tripTitle: e.target.value } : prev
                        )
                      }
                      className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-medium"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <label className="sm:col-span-3 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'تاريخ الرحلة' : 'Trip Date'}
                    </span>
                    <input
                      type="date"
                      required
                      value={modalDraft.date}
                      onChange={(e) =>
                        setModalDraft((prev) => (prev ? { ...prev, date: e.target.value } : prev))
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-bold tabular-nums"
                    />
                  </label>

                  <label className="sm:col-span-2 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'الوجهة' : 'Destination'}
                    </span>
                    <select
                      value={modalDraft.destination}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev
                            ? { ...prev, destination: e.target.value as DestinationRegion }
                            : prev
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold"
                    >
                      <option value="Hurghada">Hurghada</option>
                      <option value="Marsa Alam">Marsa Alam</option>
                      <option value="Luxor">Luxor</option>
                      <option value="Cairo">Cairo</option>
                    </select>
                  </label>

                  <label className="sm:col-span-2 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'النشاط' : 'Category'}
                    </span>
                    <select
                      value={modalDraft.category}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                category: e.target.value as ActivityCategoryId | 'custom',
                              }
                            : prev
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold"
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

                  <label className="sm:col-span-3 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'الفندق' : 'Hotel'}
                    </span>
                    <input
                      type="text"
                      required
                      list="ops-egypt-hotels-list"
                      value={modalDraft.hotel}
                      onChange={(e) =>
                        setModalDraft((prev) => (prev ? { ...prev, hotel: e.target.value } : prev))
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-bold"
                    />
                    <datalist id="ops-egypt-hotels-list">
                      {CURATED_EGYPT_HOTELS.map((h) => (
                        <option key={h.name} value={h.name}>
                          {h.area}
                        </option>
                      ))}
                    </datalist>
                  </label>

                  <label className="sm:col-span-2 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'رقم الغرفة' : 'Room No.'}
                    </span>
                    <input
                      type="text"
                      value={modalDraft.roomNumber || ''}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, roomNumber: e.target.value } : prev
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-bold tabular-nums"
                    />
                  </label>
                </div>

                {/* Manual Pickup Time Assignment (No Auto Subtraction) */}
                <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#0F2233]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#EE5426]" />
                      <span>
                        {isAr
                          ? 'تحديد موعد البيك أب يدوياً (لا يتم خصمه تلقائياً من بداية الرحلة)'
                          : 'Manual Hotel Pickup Time Assignment (Set directly by operator)'}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <label className="sm:col-span-3 block space-y-1">
                      <span className="text-xs font-bold text-[#0F2233]">
                        {isAr ? 'بداية الرحلة' : 'Trip Start Time'}
                      </span>
                      <input
                        type="text"
                        value={modalDraft.tripStartTime || ''}
                        onChange={(e) =>
                          setModalDraft((prev) =>
                            prev ? { ...prev, tripStartTime: e.target.value } : prev
                          )
                        }
                        className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#EE5426]"
                      />
                    </label>

                    <label className="sm:col-span-2 block space-y-1">
                      <span className="text-xs font-bold text-[#0F2233]">
                        {isAr ? 'ساعة البيك أب' : 'Pickup Clock'}
                      </span>
                      <input
                        type="text"
                        value={pickupClock}
                        onChange={(e) => setPickupClock(e.target.value)}
                        placeholder="08:30"
                        className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm font-bold tabular-nums"
                      />
                    </label>

                    <div className="sm:col-span-2 space-y-1">
                      <span className="block text-xs font-bold text-[#0F2233]">AM / PM</span>
                      <div className="grid grid-cols-2 rounded-lg border border-[#CBD5E1] bg-white p-0.5">
                        {(['AM', 'PM'] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setPickupPeriod(period)}
                            className={`min-h-[32px] rounded-md text-xs font-bold cursor-pointer ${
                              pickupPeriod === period
                                ? 'bg-[#EE5426] text-white'
                                : 'text-[#475569] hover:text-[#0F2233]'
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-5 space-y-1">
                      <span className="block text-xs font-bold text-[#0F2233]">
                        {isAr ? 'مكان الانتظار' : 'Meeting Point'}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            {
                              value: 'Inside Reception' as PickupSpot,
                              label: isAr ? 'داخل الريسبشن' : 'Inside Reception',
                            },
                            {
                              value: 'Outside Main Gate' as PickupSpot,
                              label: isAr ? 'أمام البوابة الرئيسية' : 'Outside Main Gate',
                            },
                          ]
                        ).map((opt) => {
                          const active =
                            (modalDraft.pickupSpot || 'Inside Reception') === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setModalDraft((prev) =>
                                  prev ? { ...prev, pickupSpot: opt.value } : prev
                                )
                              }
                              className={`min-h-[36px] rounded-lg border px-2.5 text-xs font-bold cursor-pointer ${
                                active
                                  ? 'border-[#EE5426] bg-[#EE5426] text-white'
                                  : 'border-[#CBD5E1] bg-white text-[#0F2233]'
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

                {/* Contact, Pax, Price, Supplier, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'رقم واتساب العميل' : 'Guest WhatsApp'}
                    </span>
                    <input
                      type="text"
                      value={modalDraft.guestWhatsapp || ''}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, guestWhatsapp: e.target.value } : prev
                        )
                      }
                      className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm font-mono tabular-nums"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'إيميل العميل' : 'Guest Email'}
                    </span>
                    <input
                      type="email"
                      value={modalDraft.guestEmail || ''}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, guestEmail: e.target.value } : prev
                        )
                      }
                      className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                  <label className="sm:col-span-2 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'بالغين' : 'Adults'}
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
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold tabular-nums"
                    />
                  </label>
                  <label className="sm:col-span-2 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'أطفال' : 'Children'}
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
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold tabular-nums"
                    />
                  </label>
                  <label className="sm:col-span-2 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'رضع (INF)' : 'Infants'}
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
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold tabular-nums"
                    />
                  </label>
                  <label className="sm:col-span-3 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'الإجمالي (€)' : 'Total Price (€)'}
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
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-mono font-bold tabular-nums"
                    />
                  </label>
                  <label className="sm:col-span-3 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'المورد' : 'Supplier'}
                    </span>
                    <select
                      value={modalDraft.supplierName}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, supplierName: e.target.value } : prev
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sm:col-span-4 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'السائق / المرشد' : 'Driver / Guide'}
                    </span>
                    <input
                      type="text"
                      value={modalDraft.assignedDriverOrGuide}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, assignedDriverOrGuide: e.target.value } : prev
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold"
                    />
                  </label>
                  <label className="sm:col-span-4 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'طريقة الدفع' : 'Payment Method'}
                    </span>
                    <select
                      value={modalDraft.paymentStatus}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev
                            ? { ...prev, paymentStatus: e.target.value as PaymentStatus }
                            : prev
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold"
                    >
                      <option value="Awaiting link">Awaiting link</option>
                      <option value="Link sent">Link sent</option>
                      <option value="Paid online">Paid online</option>
                      <option value="Cash on pickup">Cash on pickup (EUR/USD/EGP)</option>
                    </select>
                  </label>
                  <label className="sm:col-span-4 block space-y-1">
                    <span className="text-xs font-bold text-[#0F2233]">
                      {isAr ? 'حالة الحجز' : 'Booking Status'}
                    </span>
                    <select
                      value={modalDraft.status}
                      onChange={(e) =>
                        setModalDraft((prev) =>
                          prev ? { ...prev, status: e.target.value as BookingStatus } : prev
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold"
                    >
                      <option value="Pending">Pending (Voucher Locked)</option>
                      <option value="Confirmed">Confirmed (Voucher Unlocked)</option>
                      <option value="Driver assigned">Driver assigned</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No show">No show</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </label>
                </div>

                {/* Passport / Gate Image Attachment */}
                <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#0F2233]">
                        {modalDraft.destination === 'Marsa Alam'
                          ? isAr
                            ? 'صورة جواز السفر (أساسي لتصاريح مرسى علم)'
                            : 'Passport Photo Upload (Required for Marsa Alam Permits)'
                          : isAr
                          ? 'مرفق صورة (اختياري)'
                          : 'Photo Attachment (Optional)'}
                      </div>
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
                        className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#0F2233] hover:border-[#EE5426] cursor-pointer"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                        <span>
                          {uploadingLocImage
                            ? isAr
                              ? 'جاري الرفع...'
                              : 'Uploading…'
                            : isAr
                            ? 'رفع صورة'
                            : 'Upload Photo'}
                        </span>
                      </button>
                      {modalDraft.locationImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setModalDraft((prev) =>
                              prev ? { ...prev, locationImageUrl: '' } : prev
                            )
                          }
                          className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-2.5 text-xs font-bold text-[#B91C1C] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{isAr ? 'حذف' : 'Remove'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {modalDraft.locationImageUrl && (
                    <img
                      src={modalDraft.locationImageUrl}
                      alt="Passport or hotel attachment"
                      className="max-h-44 w-auto rounded border border-[#CBD5E1] bg-white p-1 mx-auto object-contain"
                    />
                  )}
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-[#0F2233]">
                    {isAr ? 'ملاحظات التشغيل' : 'Operations Notes'}
                  </span>
                  <textarea
                    rows={2}
                    value={modalDraft.notes}
                    onChange={(e) =>
                      setModalDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))
                    }
                    className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs font-medium"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {modalMode === 'edit' && (
                      <>
                        {!confirmCancelStep ? (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelStep(true)}
                            className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 text-xs font-bold text-[#B91C1C] cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{isAr ? 'إلغاء الحجز' : 'Cancel Booking'}</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-2 rounded-lg border border-[#DC2626] bg-[#FEF2F2] px-3 py-1.5">
                            <span className="text-xs font-bold text-[#991B1B]">
                              {isAr ? 'تأكيد الإلغاء النهائي؟' : 'Confirm final cancellation?'}
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
                              className="rounded bg-[#DC2626] px-2.5 py-1 text-xs font-bold text-white cursor-pointer"
                            >
                              {isAr ? 'نعم، إلغاء' : 'Yes, Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancelStep(false)}
                              className="rounded border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-bold text-[#334155] cursor-pointer"
                            >
                              {isAr ? 'تراجع' : 'Back'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmCancelStep(false);
                        if (modalMode === 'edit') setModalMode('ticket');
                        else {
                          setModalMode(null);
                          setModalDraft(null);
                        }
                      }}
                      className="min-h-[40px] rounded-lg border border-[#CBD5E1] px-4 text-xs font-bold text-[#334155] cursor-pointer"
                    >
                      {modalMode === 'edit'
                        ? isAr
                          ? 'العودة للتذكرة'
                          : 'Back to Ticket'
                        : isAr
                        ? 'إغلاق'
                        : 'Close'}
                    </button>
                    <button
                      type="submit"
                      disabled={savingBooking}
                      className="btn-wasla-primary min-h-[40px] rounded-lg px-5 py-2 text-xs font-bold cursor-pointer"
                    >
                      {savingBooking
                        ? isAr
                          ? 'جاري الحفظ...'
                          : 'Saving…'
                        : modalMode === 'create'
                        ? isAr
                          ? 'إنشاء الحجز'
                          : 'Create Booking'
                        : isAr
                        ? 'حفظ وعرض التذكرة'
                        : 'Save & View Ticket'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
