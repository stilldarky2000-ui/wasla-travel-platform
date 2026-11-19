import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageCircle, ShieldCheck, Star, X } from 'lucide-react';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { Lang } from '../data/i18n';
import { SITE_CONFIG, Trip, tText } from '../data/marketplaceData';
import {
  isValidBookingIdFormat,
  sanitizeBookingId,
} from '../hooks/useBookingReviewVerification';
import { db } from '../lib/firebase';
import { normalizeWhatsAppDigits } from '../lib/whatsapp';
import { BookingRequest } from './TripDetailModal';
import { WaslaBrandMark } from './WaslaBrandMark';

interface WhatsAppInquiryModalProps {
  open: boolean;
  lang?: Lang;
  isRtl?: boolean;
  initialTopic?: string;
  activeTripName?: string;
  whatsappNumber?: string;
  bookingRequests: BookingRequest[];
  trips?: Trip[];
  onOpenPostTripReview?: (trip: Trip, bookingId: string) => void;
  onOpenTrackBooking?: () => void;
  onClose: () => void;
}

const TOPIC_OPTIONS = [
  {
    value: 'Family trip recommendation',
    label: { en: 'Family trip recommendation', ar: 'ترشيح رحلة عائلية مناسبة', de: 'Familienausflug-Empfehlung' },
  },
  {
    value: 'Hotel pickup timing',
    label: { en: 'Hotel pickup timing', ar: 'مواعيد التوصيل من الفندق', de: 'Hotelabholzeiten' },
  },
  {
    value: 'Horse riding ages & weight',
    label: { en: 'Horse riding ages & weight', ar: 'ركوب الخيل والأعمار المناسبة', de: 'Reiten: Alter & Gewicht' },
  },
  {
    value: 'Sea conditions & swimming',
    label: { en: 'Sea conditions & swimming', ar: 'حالة البحر والسباحة والسنوركلينج', de: 'Meeresbedingungen & Schwimmen' },
  },
  {
    value: 'Private Luxor / Cairo transfer',
    label: { en: 'Private Luxor / Cairo transfer', ar: 'توصيل خاص للأقصر أو القاهرة', de: 'Privattransfer Luxor / Kairo' },
  },
];

const HOTEL_ZONE_OPTIONS = [
  { value: 'Hurghada Central', label: { en: 'Hurghada Central', ar: 'وسط الغردقة', de: 'Hurghada Zentrum' } },
  { value: 'El Gouna', label: { en: 'El Gouna', ar: 'الجونة', de: 'El Gouna' } },
  { value: 'Sahl Hasheesh', label: { en: 'Sahl Hasheesh', ar: 'سهل حشيش', de: 'Sahl Hasheesh' } },
  { value: 'Makadi Bay', label: { en: 'Makadi Bay', ar: 'خليج مكادي', de: 'Makadi Bay' } },
  { value: 'Soma Bay / Safaga', label: { en: 'Soma Bay / Safaga', ar: 'سوما باي / سفاجا', de: 'Soma Bay / Safaga' } },
  {
    value: 'Marsa Alam / Luxor / Cairo',
    label: { en: 'Marsa Alam / Luxor / Cairo', ar: 'مرسى علم / الأقصر / القاهرة', de: 'Marsa Alam / Luxor / Kairo' },
  },
];

export const WhatsAppInquiryModal: React.FC<WhatsAppInquiryModalProps> = ({
  open,
  lang = 'en',
  isRtl = false,
  initialTopic = '',
  activeTripName = '',
  whatsappNumber = SITE_CONFIG.whatsappNumber,
  bookingRequests,
  trips = [],
  onOpenPostTripReview,
  onOpenTrackBooking,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ask' | 'requests'>('ask');
  const [topic, setTopic] = useState(initialTopic || 'Family trip recommendation');
  const [hotelZone, setHotelZone] = useState('Hurghada Central');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [receiptStatusMap, setReceiptStatusMap] = useState<
    Record<string, { status: string; tripEndAtMs: number }>
  >({});

  useEffect(() => {
    if (!open) return;
    if (initialTopic) setTopic(initialTopic);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, initialTopic, onClose]);

  useEffect(() => {
    if (!open || activeTab !== 'requests' || bookingRequests.length === 0) return;
    let active = true;
    Promise.all(
      bookingRequests.map(async (req) => {
        const cleanId = sanitizeBookingId(req.id);
        if (!isValidBookingIdFormat(cleanId)) return null;
        try {
          const snap = await getDoc(doc(db, 'booking_receipts', cleanId));
          if (!snap.exists()) return null;
          const data = snap.data() as {
            status?: string;
            tripDate?: string;
            tripEndAt?: Timestamp;
          };
          const endMs =
            data.tripEndAt && typeof data.tripEndAt.toMillis === 'function'
              ? data.tripEndAt.toMillis()
              : data.tripDate
              ? new Date(`${data.tripDate}T23:59:59Z`).getTime()
              : 0;
          return [req.id, { status: data.status || 'Pending', tripEndAtMs: endMs }] as const;
        } catch {
          return null;
        }
      })
    ).then((entries) => {
      if (!active) return;
      const nextMap: Record<string, { status: string; tripEndAtMs: number }> = {};
      for (const entry of entries) {
        if (entry) nextMap[entry[0]] = entry[1];
      }
      if (Object.keys(nextMap).length > 0) {
        setReceiptStatusMap((prev) => ({ ...prev, ...nextMap }));
      }
    });
    return () => {
      active = false;
    };
  }, [open, activeTab, bookingRequests]);

  if (!open) return null;

  const copy = {
    title: tText(
      {
        en: 'Direct WhatsApp Inquiry',
        ar: 'استفسار فوري عبر واتساب',
        de: 'Direkte WhatsApp-Anfrage',
      },
      lang
    ),
    tabAsk: tText(
      {
        en: 'Ask on WhatsApp',
        ar: 'اسأل فريقنا مباشرة',
        de: 'Direkt per WhatsApp fragen',
      },
      lang
    ),
    tabRequests: `${tText(
      {
        en: 'Your booking requests',
        ar: 'طلبات حجزك',
        de: 'Ihre Anfragen',
      },
      lang
    )} (${bookingRequests.length})`,
    intro: tText(
      {
        en: 'Message us directly on WhatsApp with children’s ages, swim confidence, or hotel pickup questions — our team replies before you book.',
        ar: 'تواصل معنا مباشرة عبر واتساب للاستفسار عن أعمار الأطفال، تفاصيل الاستلام من الفندق، أو اختيار الرحلة الأنسب لك قبل الحجز.',
        de: 'Schreiben Sie uns direkt per WhatsApp bei Fragen zu Kinderalter, Hotelabholung oder Tourauswahl — unser Team antwortet vor Ihrer Buchung.',
      },
      lang
    ),
    topicLabel: tText({ en: 'Topic', ar: 'موضوع الاستفسار', de: 'Thema' }, lang),
    zoneLabel: tText(
      { en: 'Hotel zone', ar: 'منطقة الفندق / الإقامة', de: 'Hotelzone / Ort' },
      lang
    ),
    waLabel: tText(
      { en: 'Your WhatsApp number', ar: 'رقم الواتساب الخاص بك', de: 'Ihre WhatsApp-Nummer' },
      lang
    ),
    waPlaceholder:
      lang === 'ar'
        ? '+20 100 … أو +49 170 …'
        : lang === 'de'
        ? '+49 170 … / +43 664 …'
        : '+44 7700 … / +49 170 …',
    questionLabel: tText(
      {
        en: 'What would you like to check?',
        ar: 'ما الذي تود الاستفسار عنه؟',
        de: 'Was möchten Sie anfragen?',
      },
      lang
    ),
    questionPlaceholder: tText(
      {
        en: 'e.g. Travelling with kids aged 6 and 9 — which boat or desert safari works best?',
        ar: 'مثال: نسافر مع أطفال أعمارهم 6 و9 سنوات — ما هي أفضل رحلة بحرية أو سفاري مناسبة لنا؟',
        de: 'z. B. Wir reisen mit Kindern (6 und 9 Jahre) — welche Bootstour oder Wüstensafari passt am besten?',
      },
      lang
    ),
    sendWhatsapp: tText(
      {
        en: 'Send on WhatsApp Now',
        ar: 'تواصل عبر واتساب الآن',
        de: 'Jetzt per WhatsApp senden',
      },
      lang
    ),
    noRequestsTitle: tText(
      {
        en: 'No booking requests yet',
        ar: 'لا توجد طلبات حجز حتى الآن',
        de: 'Noch keine Buchungsanfragen',
      },
      lang
    ),
    noRequestsSub: tText(
      {
        en: 'Open any trip and submit a request — no payment is taken until our team confirms your date.',
        ar: 'افتح أي رحلة وأرسل طلب الحجز — لا يتم دفع أي مبلغ حتى يؤكد فريقنا الموعد معك عبر واتساب.',
        de: 'Wählen Sie einen Ausflug und senden Sie eine Anfrage — keine Vorauszahlung vor unserer Bestätigung.',
      },
      lang
    ),
    awaitingConfirm: tText(
      {
        en: 'Awaiting operator confirmation',
        ar: 'بانتظار تأكيد الموعد',
        de: 'Wartet auf Bestätigung',
      },
      lang
    ),
  };

  const digits = normalizeWhatsAppDigits(whatsappNumber);
  const composedLines = [
    lang === 'ar'
      ? `مرحباً وصلة ترافيل، لدي استفسار مباشر:`
      : `Hello Wasla Travel, I have a question:`,
    `• ${copy.topicLabel}: ${topic}${activeTripName ? ` (${activeTripName})` : ''}`,
    `• ${copy.zoneLabel}: ${hotelZone}`,
    guestWhatsapp.trim() ? `• WhatsApp: ${guestWhatsapp.trim()}` : '',
    message.trim() ? `• ${message.trim()}` : '',
  ].filter(Boolean);

  const directWaUrl = `https://wa.me/${digits}?text=${encodeURIComponent(composedLines.join('\n'))}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = directWaUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/65 p-3 sm:p-4 backdrop-blur-[2px]"
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div
        className="w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Sticky Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 sm:px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <WaslaBrandMark size="sm" />
            <h2
              id="whatsapp-modal-title"
              className="font-display text-base sm:text-lg font-semibold text-[#0F172A] truncate"
            >
              {copy.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-5 pt-3 shrink-0">
          <div className="inline-flex rounded-xl bg-[#F1F5F9] p-1 w-full">
            <button
              type="button"
              onClick={() => setActiveTab('ask')}
              className={`flex-1 min-h-[34px] rounded-lg px-2.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'ask'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {copy.tabAsk}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`flex-1 min-h-[34px] rounded-lg px-2.5 text-xs font-semibold transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {copy.tabRequests}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'ask' ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">{copy.intro}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">{copy.topicLabel}</span>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs sm:text-sm text-[#0F172A] focus:border-[#EA580C] focus:outline-none"
                  >
                    {TOPIC_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {tText(opt.label, lang)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">{copy.zoneLabel}</span>
                  <select
                    value={hotelZone}
                    onChange={(e) => setHotelZone(e.target.value)}
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs sm:text-sm text-[#0F172A] focus:border-[#EA580C] focus:outline-none"
                  >
                    {HOTEL_ZONE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {tText(opt.label, lang)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F172A]">{copy.waLabel}</span>
                <input
                  type="tel"
                  placeholder={copy.waPlaceholder}
                  value={guestWhatsapp}
                  onChange={(e) => setGuestWhatsapp(e.target.value)}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs sm:text-sm text-[#0F172A] placeholder:text-[#7B8E95] focus:border-[#EA580C] focus:outline-none tabular-nums"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F172A]">{copy.questionLabel}</span>
                <textarea
                  rows={2}
                  placeholder={copy.questionPlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2.5 text-xs sm:text-sm text-[#0F172A] placeholder:text-[#7B8E95] focus:border-[#EA580C] focus:outline-none"
                />
              </label>

              <div className="pt-1">
                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wasla-wa-glare min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold text-white cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.sendWhatsapp}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-white/90" aria-hidden="true" />
                </a>
              </div>
            </form>
          ) : bookingRequests.length === 0 ? (
            <div className="py-6 text-center space-y-3">
              <ShieldCheck className="h-7 w-7 text-[#EA580C] mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-[#0F172A]">{copy.noRequestsTitle}</p>
              <p className="text-xs text-[#475569] max-w-xs mx-auto">{copy.noRequestsSub}</p>
              {onOpenTrackBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTrackBooking();
                  }}
                  className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-[#EA580C] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-colors cursor-pointer"
                >
                  {tText(
                    {
                      en: 'Track a booking by WT reference ID',
                      ar: 'تتبّع حجز برقم المرجع (WT-...)',
                      de: 'Buchung mit WT-Referenz verfolgen',
                    },
                    lang
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {onOpenTrackBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTrackBooking();
                  }}
                  className="inline-flex min-h-[36px] w-full items-center justify-center rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors cursor-pointer"
                >
                  {tText(
                    {
                      en: 'Open full Booking Tracker (lookup any WT ID)',
                      ar: 'فتح متتبّع الحجز الكامل (للبحث بأي رقم WT)',
                      de: 'Vollständigen Buchungs-Tracker öffnen',
                    },
                    lang
                  )}
                </button>
              )}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pe-1">
                {bookingRequests.map((req) => {
                  const liveReceipt = receiptStatusMap[req.id];
                  const isCompletedBooking = Boolean(
                    liveReceipt &&
                      (liveReceipt.status === 'Completed' ||
                        (['Confirmed', 'Driver assigned'].includes(liveReceipt.status) &&
                          liveReceipt.tripEndAtMs > 0 &&
                          Date.now() >= liveReceipt.tripEndAtMs))
                  );
                  const matchingTrip = trips.find((t) => t.id === req.tripId);
                  const statusText = isCompletedBooking
                    ? tText({ en: 'Completed', ar: 'رحلة منتهية', de: 'Abgeschlossen' }, lang)
                    : liveReceipt?.status || copy.awaitingConfirm;

                  return (
                    <div
                      key={req.id}
                      className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-[#475569]">
                        <span className="font-semibold text-[#EA580C] tabular-nums">{req.id}</span>
                        <span
                          className={
                            isCompletedBooking
                              ? 'rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]'
                              : ''
                          }
                        >
                          {statusText}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#0F172A]">{req.tripTitle}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#475569] tabular-nums">
                        <span>{req.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{req.hotel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#0F172A]">
                          {req.totalEur > 0
                            ? `€${req.totalEur}`
                            : tText({ en: 'Custom Quote', ar: 'عرض سعر', de: 'Angebot' }, lang)}
                        </span>
                      </div>

                      {isCompletedBooking && matchingTrip && onOpenPostTripReview && (
                        <div className="pt-1 border-t border-[#F1F5F9]">
                          <button
                            type="button"
                            onClick={() => onOpenPostTripReview(matchingTrip, sanitizeBookingId(req.id))}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1.5 text-xs font-semibold text-[#EA580C] hover:bg-[#FFEDD5] transition-colors cursor-pointer"
                          >
                            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                            <span>
                              {tText(
                                {
                                  en: 'Leave post-trip review & photo',
                                  ar: 'أضف تقييمك وصورة بعد الرحلة',
                                  de: 'Bewertung & Foto nach der Tour senden',
                                },
                                lang
                              )}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
