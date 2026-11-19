import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Printer,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  X,
} from 'lucide-react';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { Lang } from '../data/i18n';
import {
  CurrencyCode,
  SITE_CONFIG,
  Trip,
  formatCurrencyPrice,
  tText,
} from '../data/marketplaceData';
import {
  isValidBookingIdFormat,
  sanitizeBookingId,
} from '../hooks/useBookingReviewVerification';
import { db } from '../lib/firebase';
import { normalizeWhatsAppDigits } from '../lib/whatsapp';
import { BookingRequest } from './TripDetailModal';
import { WaslaBrandMark } from './WaslaBrandMark';

interface TrackBookingModalProps {
  open: boolean;
  lang: Lang;
  isRtl: boolean;
  currency: CurrencyCode;
  whatsappNumber?: string;
  contactEmail?: string;
  bookingRequests: BookingRequest[];
  trips: Trip[];
  onOpenPostTripReview?: (trip: Trip, bookingId: string) => void;
  onClose: () => void;
}

interface LiveReceiptResult {
  id: string;
  tripId: string;
  tripDate: string;
  status: string;
  tripEndAtMs: number;
}

function getStatusMeta(status: string, lang: Lang): {
  label: string;
  tone: string;
  stepIndex: number;
  isCancelled: boolean;
} {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'cancelled' || normalized === 'refunded') {
    return {
      label:
        normalized === 'refunded'
          ? tText({ en: 'Refunded', ar: 'تم الاسترداد', de: 'Erstattet' }, lang)
          : tText({ en: 'Cancelled', ar: 'ملغي', de: 'Storniert' }, lang),
      tone: 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]',
      stepIndex: -1,
      isCancelled: true,
    };
  }
  if (normalized === 'completed') {
    return {
      label: tText({ en: 'Trip Completed', ar: 'تمت الرحلة بنجاح', de: 'Tour abgeschlossen' }, lang),
      tone: 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]',
      stepIndex: 3,
      isCancelled: false,
    };
  }
  if (normalized === 'driver assigned') {
    return {
      label: tText(
        { en: 'Driver & Pickup Assigned', ar: 'تم تحديد السائق وموعد التوصيل', de: 'Fahrer & Abholung zugewiesen' },
        lang
      ),
      tone: 'text-[#0369A1] bg-[#F0F9FF] border-[#BAE6FD]',
      stepIndex: 2,
      isCancelled: false,
    };
  }
  if (normalized === 'confirmed') {
    return {
      label: tText(
        { en: 'Confirmed · Seats Reserved', ar: 'مؤكد · تم حجز المقاعد', de: 'Bestätigt · Plätze reserviert' },
        lang
      ),
      tone: 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]',
      stepIndex: 1,
      isCancelled: false,
    };
  }
  return {
    label: tText(
      { en: 'Pending Operations Check', ar: 'قيد المراجعة مع فريق العمليات', de: 'Wartet auf Operations-Prüfung' },
      lang
    ),
    tone: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
    stepIndex: 0,
    isCancelled: false,
  };
}

export const TrackBookingModal: React.FC<TrackBookingModalProps> = ({
  open,
  lang,
  isRtl,
  currency,
  whatsappNumber = SITE_CONFIG.whatsappNumber,
  contactEmail = SITE_CONFIG.email,
  bookingRequests,
  trips,
  onOpenPostTripReview,
  onClose,
}) => {
  const [queryId, setQueryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [liveReceipt, setLiveReceipt] = useState<LiveReceiptResult | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const lookupBooking = async (rawId: string) => {
    const cleanId = sanitizeBookingId(rawId);
    setQueryId(cleanId);
    setErrorMsg('');
    setSearchedOnce(true);

    if (!cleanId || !isValidBookingIdFormat(cleanId)) {
      setLiveReceipt(null);
      setErrorMsg(
        tText(
          {
            en: 'Please enter a valid booking reference (example: WT-4829).',
            ar: 'يرجى إدخال رقم حجز صحيح (مثال: WT-4829).',
            de: 'Bitte geben Sie eine gültige Buchungsnummer ein (Beispiel: WT-4829).',
          },
          lang
        )
      );
      return;
    }

    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'booking_receipts', cleanId));
      if (snap.exists()) {
        const data = snap.data() as {
          id?: string;
          tripId?: string;
          tripDate?: string;
          status?: string;
          tripEndAt?: Timestamp;
        };
        const endMs =
          data.tripEndAt && typeof data.tripEndAt.toMillis === 'function'
            ? data.tripEndAt.toMillis()
            : data.tripDate
            ? new Date(`${data.tripDate}T23:59:59Z`).getTime()
            : 0;
        setLiveReceipt({
          id: data.id || cleanId,
          tripId: data.tripId || '',
          tripDate: data.tripDate || '',
          status: data.status || 'Pending',
          tripEndAtMs: endMs,
        });
      } else {
        const localFallback = bookingRequests.find(
          (req) => sanitizeBookingId(req.id) === cleanId
        );
        if (localFallback) {
          setLiveReceipt({
            id: cleanId,
            tripId: localFallback.tripId,
            tripDate: localFallback.date,
            status: 'Pending',
            tripEndAtMs: localFallback.date
              ? new Date(`${localFallback.date}T23:59:59Z`).getTime()
              : 0,
          });
        } else {
          setLiveReceipt(null);
          setErrorMsg(
            tText(
              {
                en: 'No booking found with this reference. Double-check the ID or message our team on WhatsApp.',
                ar: 'لم يتم العثور على حجز بهذا الرقم. تأكد من كتابة الرقم بشكل صحيح أو تواصل معنا عبر واتساب.',
                de: 'Keine Buchung mit dieser Nummer gefunden. Bitte prüfen Sie die ID oder kontaktieren Sie uns per WhatsApp.',
              },
              lang
            )
          );
        }
      }
    } catch {
      const localFallback = bookingRequests.find(
        (req) => sanitizeBookingId(req.id) === cleanId
      );
      if (localFallback) {
        setLiveReceipt({
          id: cleanId,
          tripId: localFallback.tripId,
          tripDate: localFallback.date,
          status: 'Pending',
          tripEndAtMs: 0,
        });
      } else {
        setLiveReceipt(null);
        setErrorMsg(
          tText(
            {
              en: 'Unable to check status right now. Please try again or contact WhatsApp support.',
              ar: 'تعذّر التحقق من الحالة حالياً. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.',
              de: 'Statusabfrage derzeit nicht möglich. Bitte versuchen Sie es erneut oder schreiben Sie uns per WhatsApp.',
            },
            lang
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void lookupBooking(queryId);
  };

  const localMatch = liveReceipt
    ? bookingRequests.find((req) => sanitizeBookingId(req.id) === sanitizeBookingId(liveReceipt.id))
    : undefined;
  const matchedTrip = liveReceipt
    ? trips.find((tr) => tr.id === liveReceipt.tripId)
    : undefined;

  const statusMeta = liveReceipt ? getStatusMeta(liveReceipt.status, lang) : null;
  const isReviewEligible = Boolean(
    liveReceipt &&
      matchedTrip &&
      onOpenPostTripReview &&
      (liveReceipt.status === 'Completed' ||
        (['Confirmed', 'Driver assigned'].includes(liveReceipt.status) &&
          liveReceipt.tripEndAtMs > 0 &&
          Date.now() >= liveReceipt.tripEndAtMs))
  );

  const digits = normalizeWhatsAppDigits(whatsappNumber);
  const waFollowUpUrl = liveReceipt
    ? `https://wa.me/${digits}?text=${encodeURIComponent(
        lang === 'ar'
          ? `مرحباً وصلة ترافيل، أرغب بالاستفسار عن حالة الحجز رقم ${liveReceipt.id} (${matchedTrip ? tText(matchedTrip.name, lang) : liveReceipt.tripId}).`
          : lang === 'de'
          ? `Hallo Wasla Travel, ich möchte den Status meiner Buchung ${liveReceipt.id} erfragen.`
          : `Hello Wasla Travel, I am checking the status of my booking ${liveReceipt.id}.`
      )}`
    : `https://wa.me/${digits}`;

  const steps = [
    tText({ en: 'Received', ar: 'تم الاستلام', de: 'Eingegangen' }, lang),
    tText({ en: 'Confirmed', ar: 'تم التأكيد', de: 'Bestätigt' }, lang),
    tText({ en: 'Pickup Set', ar: 'تحديد التوصيل', de: 'Abholung klar' }, lang),
    tText({ en: 'Completed', ar: 'مكتملة', de: 'Abgeschlossen' }, lang),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 p-3 sm:p-4 backdrop-blur-xs"
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-booking-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#FFFFFF] px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <WaslaBrandMark size="sm" />
            <div className="min-w-0">
              <h2
                id="track-booking-title"
                className="font-display text-lg font-semibold text-[#0F172A] truncate"
              >
                {tText(
                  {
                    en: 'Track Your Booking',
                    ar: 'تتبّع حالة حجزك',
                    de: 'Buchung verfolgen',
                  },
                  lang
                )}
              </h2>
              <p className="text-xs text-[#64748B] truncate">
                {tText(
                  {
                    en: 'Check live confirmation & pickup status using your WT reference',
                    ar: 'تحقق من حالة التأكيد وموعد التوصيل مباشرة برقم الحجز',
                    de: 'Prüfen Sie Bestätigung & Abholstatus direkt mit Ihrer WT-Nummer',
                  },
                  lang
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5">
          {/* Lookup Search Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label
              htmlFor="track-booking-input"
              className="block text-xs font-semibold text-[#0F172A]"
            >
              {tText(
                {
                  en: 'Booking Reference ID',
                  ar: 'رقم مرجع الحجز (Booking ID)',
                  de: 'Buchungsreferenznummer',
                },
                lang
              )}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]"
                  aria-hidden="true"
                />
                <input
                  id="track-booking-input"
                  type="text"
                  value={queryId}
                  onChange={(e) => setQueryId(e.target.value.toUpperCase())}
                  placeholder="WT-4829"
                  className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] bg-white ps-9 pe-3 text-sm font-mono uppercase text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#EA580C] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="wasla-book-glare inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-4 text-xs sm:text-sm font-semibold text-white cursor-pointer disabled:opacity-60 shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>
                  {tText({ en: 'Check Status', ar: 'تحقق الآن', de: 'Prüfen' }, lang)}
                </span>
              </button>
            </div>
            {errorMsg && (
              <p className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#B91C1C]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>

          {/* Live Status Card */}
          {liveReceipt && statusMeta && (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    {tText({ en: 'Booking Reference', ar: 'رقم الحجز', de: 'Referenz' }, lang)}
                  </p>
                  <p className="font-mono text-lg font-bold text-[#0F172A] tabular-nums">
                    {liveReceipt.id}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusMeta.tone}`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  {statusMeta.label}
                </span>
              </div>

              {/* 4-Step Horizontal Tracker */}
              {!statusMeta.isCancelled && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {steps.map((label, idx) => {
                    const reached = idx <= statusMeta.stepIndex;
                    return (
                      <div key={label} className="space-y-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-colors ${
                            reached ? 'bg-[#EA580C]' : 'bg-[#CBD5E1]'
                          }`}
                        />
                        <p
                          className={`text-[10.5px] font-semibold leading-tight ${
                            reached ? 'text-[#0F172A]' : 'text-[#94A3B8]'
                          }`}
                        >
                          {label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Trip Summary Details */}
              <div className="space-y-2 text-xs text-[#334155]">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {localMatch?.tripTitle ||
                    (matchedTrip ? tText(matchedTrip.name, lang) : liveReceipt.tripId)}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 tabular-nums">
                  {liveReceipt.tripDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#EA580C]" />
                      {liveReceipt.tripDate}
                    </span>
                  )}
                  {localMatch?.tripStartTime && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#EA580C]" />
                        {localMatch.tripStartTime}
                      </span>
                    </>
                  )}
                  {localMatch?.hotel && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#EA580C]" />
                        {localMatch.hotel}
                        {localMatch.roomNumber ? ` (${localMatch.roomNumber})` : ''}
                      </span>
                    </>
                  )}
                </div>

                {localMatch && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs">
                    <span className="text-[#475569]">
                      {localMatch.adults}{' '}
                      {tText({ en: 'Adult(s)', ar: 'بالغ', de: 'Erw.' }, lang)}
                      {localMatch.children > 0
                        ? ` · ${localMatch.children} ${tText({ en: 'Child(ren)', ar: 'طفل', de: 'Kind(er)' }, lang)}`
                        : ''}
                      {localMatch.infants && localMatch.infants > 0
                        ? ` · ${localMatch.infants} INF`
                        : ''}
                    </span>
                    <span className="font-bold text-[#0F172A] tabular-nums">
                      {localMatch.totalEur > 0
                        ? formatCurrencyPrice(localMatch.totalEur, currency, currency !== 'EUR')
                        : tText(
                            { en: 'Custom Quote', ar: 'عرض سعر مخصص', de: 'Individuelles Angebot' },
                            lang
                          )}
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  {tText(
                    {
                      en: 'Payment is collected in cash on pickup or via an official payment link sent by our Operations Desk once seats are verified. Free cancellation up to 24 hours before pickup.',
                      ar: 'يتم الدفع كاش عند الاستلام من الفندق أو عبر رابط الدفع الرسمي الذي يرسله فريق العمليات بعد تأكيد المقاعد. الإلغاء مجاني قبل 24 ساعة من موعد التوصيل.',
                      de: 'Die Zahlung erfolgt bar bei Abholung oder über einen offiziellen Zahlungslink nach Platzbestätigung. Kostenlose Stornierung bis 24 Stunden vor Abholung.',
                    },
                    lang
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={waFollowUpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wasla-wa-glare inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>
                    {tText(
                      { en: 'Message Operations', ar: 'تواصل مع العمليات', de: 'Team schreiben' },
                      lang
                    )}
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-3.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-[#475569]" />
                  <span>
                    {tText({ en: 'Print Ticket', ar: 'طباعة التذكرة', de: 'Drucken' }, lang)}
                  </span>
                </button>
              </div>

              {isReviewEligible && matchedTrip && onOpenPostTripReview && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPostTripReview(matchedTrip, sanitizeBookingId(liveReceipt.id));
                  }}
                  className="inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#EA580C] hover:bg-[#FFEDD5] cursor-pointer"
                >
                  <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>
                    {tText(
                      {
                        en: 'Leave verified post-trip review & photo',
                        ar: 'أضف تقييمك الموثق وصورة من الرحلة',
                        de: 'Verifizierte Bewertung & Foto senden',
                      },
                      lang
                    )}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Locally Saved Bookings on This Device */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0F172A]">
                {tText(
                  {
                    en: 'Saved Bookings on This Device',
                    ar: 'حجوزاتك المحفوظة على هذا الجهاز',
                    de: 'Gespeicherte Buchungen auf diesem Gerät',
                  },
                  lang
                )}{' '}
                ({bookingRequests.length})
              </span>
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-[#EA580C] hover:underline font-medium"
                >
                  {contactEmail}
                </a>
              )}
            </div>

            {bookingRequests.length === 0 ? (
              !searchedOnce && (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center space-y-1.5">
                  <ShieldCheck className="h-6 w-6 text-[#EA580C] mx-auto" />
                  <p className="text-xs font-semibold text-[#0F172A]">
                    {tText(
                      {
                        en: 'Booked on another device? Enter your WT code above.',
                        ar: 'حجزت من جهاز آخر؟ أدخل رقم الحجز (WT-...) بالأعلى.',
                        de: 'Auf einem anderen Gerät gebucht? Geben Sie oben Ihre WT-Nummer ein.',
                      },
                      lang
                    )}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {tText(
                      {
                        en: 'Every booking request automatically receives a unique tracking reference.',
                        ar: 'كل طلب حجز يحصل تلقائياً على رقم مرجع فريد لمتابعة التأكيد وموعد التوصيل.',
                        de: 'Jede Buchungsanfrage erhält automatisch eine eindeutige Referenznummer.',
                      },
                      lang
                    )}
                  </p>
                </div>
              )
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pe-1">
                {bookingRequests.map((req) => {
                  const selected =
                    liveReceipt &&
                    sanitizeBookingId(liveReceipt.id) === sanitizeBookingId(req.id);
                  return (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => void lookupBooking(req.id)}
                      className={`w-full text-start rounded-xl border p-3 transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#EA580C] bg-[#FFF7ED]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#FDBA74] hover:bg-[#FFF7ED]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono font-bold text-[#EA580C] tabular-nums">
                          {req.id}
                        </span>
                        <span className="text-[#64748B] tabular-nums">{req.date}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-[#0F172A] truncate">
                        {req.tripTitle}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[11.5px] text-[#475569] tabular-nums">
                        <span className="truncate">{req.hotel}</span>
                        <span className="font-semibold text-[#0F172A] shrink-0">
                          {req.totalEur > 0
                            ? formatCurrencyPrice(req.totalEur, currency)
                            : tText({ en: 'Custom quote', ar: 'عرض سعر', de: 'Auf Anfrage' }, lang)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
