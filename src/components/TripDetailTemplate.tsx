import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  Heart,
  Info,
  Luggage,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  Minus,
  Navigation,
  Plus,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { Lang, Translations } from '../data/i18n';
import {
  CATEGORIES,
  CurrencyCode,
  OUTER_TRANSFER_ZONES,
  SITE_CONFIG,
  Trip,
  formatCurrencyPrice,
  formatSlotLabel,
  formatTripOperatingDaysLabel,
  formatTripScheduleSummary,
  getNextOperatingDate,
  getTripStartTimeOptions,
  getZoneTransferFeePerPerson,
  getZoneTransferLabel,
  isTripOperatingOnDate,
  tText,
} from '../data/marketplaceData';
import {
  SafeStorefrontBookingRef,
  persistStorefrontBookingHandoff,
  sanitizeBookingId,
} from '../hooks/useBookingReviewVerification';
import { detectGuestCountry } from '../lib/nationalityDetect';
import { printWaslaBoardingVoucher } from '../lib/printVoucher';
import { shareTripItem } from '../lib/shareTrip';
import { SmartImage } from './SmartImage';
import { TripReview } from './TripReview';
import { WaslaBrandMark } from './WaslaBrandMark';
import { WaslaHotelMapPicker } from './WaslaHotelMapPicker';

export interface BookingRequest {
  id: string;
  tripId: string;
  tripTitle: string;
  supplierName: string;
  destination?: string;
  duration?: string;
  transferZoneLabel?: string;
  date: string;
  tripStartTime?: string;
  adults: number;
  children: number;
  infants?: number;
  totalEur: number;
  hotel: string;
  roomNumber?: string;
  guestName: string;
  guestCountry: string;
  guestLang?: Lang;
  guideLanguage?: string;
  whatsapp: string;
  email: string;
  contact: string;
  notes: string;
  locationImageUrl?: string;
  createdAt: string;
}

export interface TripDetailTemplateProps {
  trip: Trip;
  initialDate?: string;
  whatsappNumber?: string;
  contactEmail?: string;
  previewMode?: boolean;
  lang: Lang;
  t: Translations;
  currency?: CurrencyCode;
  isFavorite?: boolean;
  bookingStatusById?: Record<string, string>;
  storefrontBookingRefs?: SafeStorefrontBookingRef[];
  relatedTrips?: Trip[];
  onSelectRelatedTrip?: (trip: Trip) => void;
  onToggleFavorite?: (trip: Trip) => void;
  onOpenPostTripReview?: (trip: Trip, bookingId?: string) => void;
  onClose: () => void;
  onSubmitBooking: (request: BookingRequest) => void;
}

interface TicketReceiptSnapshot {
  adultUnitEur: number;
  childUnitEur: number;
  adultsSubtotalEur: number;
  childrenSubtotalEur: number;
  infantsCount: number;
  zoneFeePerPersonEur: number;
  payingGuestsCount: number;
  transferSurchargeTotalEur: number;
  totalEur: number;
  zoneLabel?: string;
}

function computeChildUnitPrice(adultUnitPrice: number, trip: Trip): number {
  if (typeof trip.childPriceEur === 'number' && Number.isFinite(trip.childPriceEur) && trip.childPriceEur >= 0) {
    return Math.min(adultUnitPrice, Math.round(trip.childPriceEur));
  }
  if (
    typeof trip.childDiscountPercent === 'number' &&
    Number.isFinite(trip.childDiscountPercent)
  ) {
    const pct = Math.min(100, Math.max(0, trip.childDiscountPercent));
    return Math.max(0, Math.round(adultUnitPrice * (1 - pct / 100)));
  }
  const discountEn = trip.kidsDiscount?.en?.trim() || '';
  const pctMatch = discountEn.match(/(\d+)\s*%\s*off/i);
  if (pctMatch) {
    const pct = Math.min(95, Math.max(0, Number(pctMatch[1]) || 50));
    return Math.max(0, Math.round(adultUnitPrice * (1 - pct / 100)));
  }
  const flatEurMatch = discountEn.match(/€\s*(\d+)/i);
  if (flatEurMatch && !discountEn.includes('%')) {
    const flatEur = Math.max(0, Number(flatEurMatch[1]) || 0);
    return Math.min(adultUnitPrice, flatEur);
  }
  return Math.round(adultUnitPrice * 0.5);
}

async function compressPassportImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read passport photo file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const maxDim = 960;
        let width = img.width || 800;
        let height = img.height || 600;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.76;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > 210000 && quality > 0.35) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export const TripDetailTemplate: React.FC<TripDetailTemplateProps> = ({
  trip,
  initialDate,
  whatsappNumber = SITE_CONFIG.whatsappNumber,
  contactEmail = SITE_CONFIG.email,
  previewMode = false,
  lang,
  t,
  currency = 'EUR',
  isFavorite = false,
  bookingStatusById,
  storefrontBookingRefs,
  relatedTrips = [],
  onSelectRelatedTrip,
  onToggleFavorite,
  onOpenPostTripReview,
  onClose,
  onSubmitBooking,
}) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const initialValidDate =
    getNextOperatingDate(trip, initialDate || todayIso) || initialDate || todayIso;
  const [date, setDate] = useState(initialValidDate);
  const [selectedDepartureTime, setSelectedDepartureTime] = useState<string>('');
  const [flightTimeInput, setFlightTimeInput] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [transferZoneId, setTransferZoneId] = useState<string>('hurghada');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(true);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [hotel, setHotel] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [passportPhotoDataUrl, setPassportPhotoDataUrl] = useState<string>('');
  const [passportPhotoName, setPassportPhotoName] = useState<string>('');
  const [passportUploading, setPassportUploading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [guideLanguage, setGuideLanguage] = useState<string>(() =>
    lang === 'de' ? 'German' : lang === 'ar' ? 'Arabic' : 'English'
  );
  const [guestLanguageTouched, setGuestLanguageTouched] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!guestLanguageTouched) {
      setGuideLanguage(lang === 'de' ? 'German' : lang === 'ar' ? 'Arabic' : 'English');
    }
  }, [lang, guestLanguageTouched]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [pendingTicketRequest, setPendingTicketRequest] = useState<BookingRequest | null>(null);
  const [pendingReceipt, setPendingReceipt] = useState<TicketReceiptSnapshot | null>(null);
  const [confirmedRequest, setConfirmedRequest] = useState<BookingRequest | null>(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState<TicketReceiptSnapshot | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [refCopied, setRefCopied] = useState(false);

  const pageTopRef = useRef<HTMLDivElement | null>(null);
  const confirmedCardRef = useRef<HTMLDivElement | null>(null);

  const galleryImages = Array.isArray(trip.images) && trip.images.length > 0 ? trip.images : [''];
  const safeImgIdx = activeImageIndex < galleryImages.length ? activeImageIndex : 0;

  // Reset form & gallery state when opening a different trip
  useEffect(() => {
    const baseDate = initialDate || new Date().toISOString().slice(0, 10);
    setDate(getNextOperatingDate(trip, baseDate) || baseDate);
    const opts = getTripStartTimeOptions(trip);
    setSelectedDepartureTime(opts[0] || '');
    setFlightTimeInput('');
    setSelectedOptionId(trip.options?.[0]?.id ?? '');
    setTransferZoneId('hurghada');
    setActiveImageIndex(0);
    setLightboxOpen(false);
    setDescExpanded(true);
    setAdults(2);
    setChildren(0);
    setInfants(0);
    setRoomNumber('');
    setPassportPhotoDataUrl('');
    setPassportPhotoName('');
    setPromoCode('');
    setPendingTicketRequest(null);
    setPendingReceipt(null);
    setConfirmedRequest(null);
    setConfirmedReceipt(null);
    setShareCopied(false);
    setRefCopied(false);
    setError('');
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [trip.id, initialDate]);

  // Keyboard navigation for gallery lightbox (Escape, Left, Right)
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [lightboxOpen, galleryImages.length]);

  const hasOuterZoneTransfer =
    trip.destination === 'Hurghada' ||
    trip.destination === 'Cairo' ||
    trip.destination === 'Luxor' ||
    trip.outerTransferEnabled === true;
  const activeZone =
    OUTER_TRANSFER_ZONES.find((z) => z.id === transferZoneId) ?? OUTER_TRANSFER_ZONES[0];
  const zoneFeePerPerson = getZoneTransferFeePerPerson(
    transferZoneId,
    trip.destination,
    hasOuterZoneTransfer
  );
  const directionalZoneLabel = hasOuterZoneTransfer
    ? getZoneTransferLabel(activeZone.id, trip.destination, lang, hasOuterZoneTransfer)
    : undefined;

  const selectedOption = trip.options?.find((o) => o.id === selectedOptionId) || trip.options?.[0];
  const activeUnitPrice = selectedOption ? selectedOption.price : trip.price;
  const childPrice = computeChildUnitPrice(activeUnitPrice, trip);

  const startTimeOptions = getTripStartTimeOptions(trip);
  const scheduleSummary = formatTripScheduleSummary(trip, lang, false);
  const isTransferTrip = trip.category === 'transfers';
  const resolvedTripStartTime = isTransferTrip
    ? flightTimeInput.trim() ||
      tText(trip.timingNote, lang) ||
      tText(
        { en: 'According to flight time', ar: 'حسب ميعاد الطيارة', de: 'Nach Flugzeit' },
        lang
      )
    : startTimeOptions.length > 0
      ? formatSlotLabel(selectedDepartureTime || startTimeOptions[0], lang)
      : scheduleSummary;

  const safeAdults = Math.max(1, adults);
  const safeChildren = Math.max(0, children);
  const safeInfants = Math.max(0, infants);
  const payingGuestsCount = safeAdults + safeChildren;
  const totalHeadcount = safeAdults + safeChildren + safeInfants;

  const adultsSubtotalEur = safeAdults * activeUnitPrice;
  const childrenSubtotalEur = safeChildren * childPrice;
  const transferSurchargeTotal = payingGuestsCount * zoneFeePerPerson;
  const totalEur = adultsSubtotalEur + childrenSubtotalEur + transferSurchargeTotal;

  const currentReceipt: TicketReceiptSnapshot = {
    adultUnitEur: activeUnitPrice,
    childUnitEur: childPrice,
    adultsSubtotalEur,
    childrenSubtotalEur,
    infantsCount: safeInfants,
    zoneFeePerPersonEur: zoneFeePerPerson,
    payingGuestsCount,
    transferSurchargeTotalEur: transferSurchargeTotal,
    totalEur,
    zoneLabel: directionalZoneLabel,
  };

  const title = tText(trip.name, lang);
  const formatPrice = (eur: number) => formatCurrencyPrice(eur, currency, currency !== 'EUR');
  const formatLinePrice = (eur: number) => formatCurrencyPrice(eur, currency, false);
  const bookedTitleWithOption = selectedOption
    ? `${title} (${tText(selectedOption.title, lang)})`
    : title;

  const fullDescText = trip.fullDescription ? tText(trip.fullDescription, lang) : '';
  const hasLongDesc = fullDescText.length > 420;
  const visibleFullDesc =
    hasLongDesc && !descExpanded ? `${fullDescText.slice(0, 420)}…` : fullDescText;

  const foundCategory = CATEGORIES.find((c) => c.id === trip.category);
  const categoryLabel = foundCategory ? tText(foundCategory.name, lang) : trip.category;
  const hasHistoricalFacts = Boolean(trip.historicalFacts && trip.historicalFacts.length > 0);
  const hasItinerary = Boolean(trip.itinerary && trip.itinerary.length > 0);

  const getCaptionForImage = (idx: number): string => {
    const captionObj = trip.galleryCaptions?.[idx];
    if (captionObj) return tText(captionObj, lang);
    const matchingStop = trip.itinerary?.filter((s) => s.kind === 'stop')[idx];
    if (matchingStop) return tText(matchingStop.title, lang);
    return `${title} — ${trip.destination}`;
  };

  const receiptLabels = {
    summaryHeader: tText(
      {
        en: 'Booking summary & receipt',
        ar: 'ملخص الحساب وتفصيل السعر',
        de: 'Preisaufschlüsselung & Buchung',
      },
      lang
    ),
    adultsUnit: tText({ en: 'Adults', ar: 'بالغ', de: 'Erwachsene' }, lang),
    childrenUnit: tText({ en: 'Children', ar: 'طفل', de: 'Kinder' }, lang),
    infantsUnit: tText(
      { en: 'Infants (INF)', ar: 'رضيع (INF)', de: 'Kleinkinder (INF)' },
      lang
    ),
    freeLabel: tText({ en: 'Free', ar: 'مجاناً', de: 'Kostenlos' }, lang),
    includedLabel: tText({ en: 'Included', ar: 'مشمول', de: 'Inklusive' }, lang),
    transferLine: tText(
      { en: 'Transfer & Pickup', ar: 'التوصيل والاستلام', de: 'Transfer & Abholung' },
      lang
    ),
    selectedPkg: tText({ en: 'Package', ar: 'الباقة', de: 'Option' }, lang),
    manifestLine: tText({ en: 'Manifest', ar: 'إجمالي الكشف', de: 'Personenzahl' }, lang),
    totalLabel: tText(
      { en: 'Total Selling Price', ar: 'إجمالي سعر البيع', de: 'Gesamtverkaufspreis' },
      lang
    ),
    paxWord: tText({ en: 'pax', ar: 'فرد', de: 'Pers.' }, lang),
  };

  const verifiedPartnerLabel = tText(
    {
      en: 'Verified Local Partner',
      ar: 'مشغّل محلي معتمد',
      de: 'Geprüfter lokaler Partner',
    },
    lang
  );
  const operatingDaysLabel = formatTripOperatingDaysLabel(trip, lang);
  const isSelectedDateOperating = isTripOperatingOnDate(trip, date);
  const suggestedNextOperatingDate = !isSelectedDateOperating
    ? getNextOperatingDate(trip, date)
    : null;
  const isMarsaAlamTrip = trip.destination === 'Marsa Alam';
  const requiresPassportNotice = isMarsaAlamTrip;

  const handlePassportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPassportUploading(true);
    setError('');
    try {
      const compressed = await compressPassportImageFile(file);
      setPassportPhotoDataUrl(compressed);
      setPassportPhotoName(file.name);
    } catch {
      setError(
        tText(
          {
            en: 'Could not process passport image. Please select a valid JPG or PNG photo.',
            ar: 'تعذر معالجة صورة جواز السفر. يرجى اختيار صورة واضحة بصيغة JPG أو PNG.',
            de: 'Passfoto konnte nicht verarbeitet werden. Bitte wählen Sie ein gültiges JPG/PNG.',
          },
          lang
        )
      );
    } finally {
      setPassportUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectedDateOperating) {
      setError(
        tText(
          {
            en: `This excursion does not run on ${date}. Operating schedule: ${operatingDaysLabel}. Please choose an available date.`,
            ar: `هذه الرحلة لا تعمل في تاريخ ${date}. أيام التشغيل: ${operatingDaysLabel}. يرجى اختيار تاريخ متاح.`,
            de: `Dieser Ausflug findet am ${date} nicht statt (${operatingDaysLabel}). Bitte wählen Sie ein verfügbares Datum.`,
          },
          lang
        )
      );
      return;
    }

    const cleanName = guestName.trim();
    const cleanHotel = hotel.trim();
    const cleanRoom = roomNumber.trim();
    const cleanPromo = promoCode.trim().toUpperCase();
    const cleanWhatsapp = whatsapp.trim();
    const cleanEmail = email.trim();
    const validWhatsappDigits = cleanWhatsapp.replace(/\D/g, '').length >= 6;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!cleanName || !cleanHotel || !validWhatsappDigits || !validEmail) {
      setError(t.modalValidationErr);
      return;
    }

    if (isMarsaAlamTrip && (!cleanRoom || !passportPhotoDataUrl)) {
      setError(
        tText(
          {
            en: 'For Marsa Alam trips, both your Hotel Room Number and Passport Photo upload are required for coast guard & permit clearance.',
            ar: 'في رحلات مرسى علم، يُشترط إدخال رقم الغرفة ورفع صورة جواز السفر لإصدار تصاريح حرس الحدود والمارينا.',
            de: 'Für Ausflüge in Marsa Alam sind Zimmernummer und das Hochladen eines Passfotos für die Genehmigung zwingend erforderlich.',
          },
          lang
        )
      );
      return;
    }

    setError('');
    const autoCountry = detectGuestCountry({
      whatsapp: cleanWhatsapp,
      notes,
    });
    const zoneTag =
      zoneFeePerPerson > 0
        ? `Transfer Zone: ${activeZone.id.toUpperCase()} (+€${zoneFeePerPerson}/pp = +€${transferSurchargeTotal})`
        : hasOuterZoneTransfer
        ? `Transfer Zone: ${activeZone.id.toUpperCase()} (Included €0)`
        : '';
    const passportTag =
      isMarsaAlamTrip && passportPhotoDataUrl ? 'Passport Photo Uploaded ✓' : '';
    const promoTag = cleanPromo ? `Promo/Partner Code: ${cleanPromo}` : '';
    const langTag = `Guide & Email Language: ${guideLanguage}`;
    const whatsappConsentTag = whatsappOptIn
      ? 'WhatsApp Opt-in: Yes ✓'
      : 'WhatsApp Opt-in: Email only';
    const mergedNotes = [zoneTag, passportTag, promoTag, langTag, whatsappConsentTag, notes.trim()]
      .filter(Boolean)
      .join(' · ');

    const mappedGuestLang: Lang =
      guideLanguage === 'German' ? 'de' : guideLanguage === 'Arabic' ? 'ar' : 'en';

    const req: BookingRequest = {
      id:
        pendingTicketRequest?.id ||
        `WT-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(10 + Math.random() * 89)}`,
      tripId: trip.id,
      tripTitle: bookedTitleWithOption,
      supplierName: trip.supplierName,
      destination: trip.destination,
      duration: tText(trip.duration, lang),
      transferZoneLabel: directionalZoneLabel,
      date,
      tripStartTime: resolvedTripStartTime,
      adults: safeAdults,
      children: safeChildren,
      infants: safeInfants,
      totalEur,
      hotel: cleanHotel,
      roomNumber: cleanRoom || undefined,
      guestName: cleanName,
      guestCountry: autoCountry,
      guestLang: mappedGuestLang,
      guideLanguage,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      contact: `${cleanWhatsapp} · ${cleanEmail}`,
      notes: mergedNotes,
      locationImageUrl: passportPhotoDataUrl || undefined,
      createdAt: 'Just now',
    };
    setPendingTicketRequest(req);
    setPendingReceipt(currentReceipt);

    window.setTimeout(() => {
      confirmedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleConfirmTicket = () => {
    if (!pendingTicketRequest) return;
    setConfirmedRequest(pendingTicketRequest);
    setConfirmedReceipt(pendingReceipt || currentReceipt);
    setPendingTicketRequest(null);

    if (!previewMode) {
      persistStorefrontBookingHandoff({
        bookingId: pendingTicketRequest.id,
        tripId: trip.id,
        tripDate: pendingTicketRequest.date,
      });
      onSubmitBooking(pendingTicketRequest);
    }

    window.setTimeout(() => {
      confirmedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const jumpToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={pageTopRef} className="min-h-screen w-full bg-[#FAF4ED]">
      {previewMode && (
        <div className="bg-[#EE5426] text-white px-6 py-2 text-xs font-semibold flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {tText(
                {
                  en: 'Live Trip Page Preview — Guests see this exact full-page layout',
                  ar: 'معاينة حية لصفحة الرحلة — هذا هو الشكل الكامل الذي يظهر للضيف',
                  de: 'Live-Reiseseitenvorschau — Gäste sehen exakt dieses vollständige Seitenlayout',
                },
                lang
              )}
            </span>
          </span>
        </div>
      )}

      {/* Sticky Full-Page Header & Section Quick-Jump Bar */}
      <div className="sticky top-0 z-30 border-b border-[#C8C2B8]/70 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#C8C2B8] bg-[#FAF4ED] px-3.5 py-2 text-xs font-semibold text-[#0F2233] hover:border-[#EE5426] hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? 'rotate-180' : ''}`} aria-hidden="true" />
              <span>
                {tText(
                  {
                    en: 'Back to All Trips',
                    ar: 'العودة لكل الرحلات',
                    de: 'Zurück zu allen Ausflügen',
                  },
                  lang
                )}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#475569] min-w-0">
              <WaslaBrandMark size="sm" />
              <span className="truncate font-semibold text-[#0F2233]">{trip.destination}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate text-[#EE5426] font-semibold">{categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{verifiedPartnerLabel}</span>
            </div>
          </div>

          {/* Section Anchor Quick-Jump Controls (Desktop) */}
          <nav
            aria-label="Trip sections"
            className="hidden xl:flex items-center gap-1 rounded-xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] p-1 text-xs font-semibold text-[#475569]"
          >
            <button
              type="button"
              onClick={() => jumpToSection('trip-sec-overview')}
              className="rounded-lg px-2.5 py-1.5 hover:bg-white hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {tText({ en: 'Overview', ar: 'نظرة عامة', de: 'Überblick' }, lang)}
            </button>
            <button
              type="button"
              onClick={() => jumpToSection('trip-sec-gallery')}
              className="rounded-lg px-2.5 py-1.5 hover:bg-white hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {tText({ en: 'Gallery', ar: 'المعرض', de: 'Galerie' }, lang)}
            </button>
            <button
              type="button"
              onClick={() => jumpToSection('trip-sec-highlights')}
              className="rounded-lg px-2.5 py-1.5 hover:bg-white hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.modalHighlightsTitle}
            </button>
            {(hasItinerary || fullDescText) && (
              <button
                type="button"
                onClick={() => jumpToSection('trip-sec-itinerary')}
                className="rounded-lg px-2.5 py-1.5 hover:bg-white hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {t.modalItineraryTitle || tText({ en: 'Itinerary', ar: 'مسار الرحلة', de: 'Reiseverlauf' }, lang)}
              </button>
            )}
            {hasHistoricalFacts && (
              <button
                type="button"
                onClick={() => jumpToSection('trip-sec-history')}
                className="rounded-lg px-2.5 py-1.5 hover:bg-white hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {tText({ en: 'History', ar: 'التاريخ', de: 'Geschichte' }, lang)}
              </button>
            )}
            <button
              type="button"
              onClick={() => jumpToSection('trip-sec-includes')}
              className="rounded-lg px-2.5 py-1.5 hover:bg-white hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.modalIncludesTitle}
            </button>
            <button
              type="button"
              onClick={() => jumpToSection('trip-sec-reviews')}
              className="rounded-lg px-2.5 py-1.5 hover:bg-white hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
            >
              {tText({ en: 'Reviews', ar: 'التقييمات', de: 'Bewertungen' }, lang)} ({trip.reviewCount})
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                const res = await shareTripItem(trip, lang, currency);
                if (res === 'copied') {
                  setShareCopied(true);
                  window.setTimeout(() => setShareCopied(false), 2200);
                }
              }}
              aria-label={tText({ en: 'Share trip', ar: 'مشاركة الرحلة', de: 'Ausflug teilen' }, lang)}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border-[1.5px] px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                shareCopied
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : 'border-[#94A3B8] bg-white text-[#0F2233] hover:border-[#EE5426] hover:text-[#EE5426]'
              }`}
            >
              {shareCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{tText({ en: 'Link copied', ar: 'تم نسخ الرابط', de: 'Link kopiert' }, lang)}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                  <span>{tText({ en: 'Share', ar: 'مشاركة', de: 'Teilen' }, lang)}</span>
                </>
              )}
            </button>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(trip)}
                aria-pressed={isFavorite}
                aria-label={tText({ en: 'Favorite', ar: 'المفضلة', de: 'Favorit' }, lang)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border-[1.5px] transition-all cursor-pointer ${
                  isFavorite
                    ? 'border-[#E11D48] bg-[#E11D48] text-white shadow-xs'
                    : 'border-[#94A3B8] bg-white text-[#0F2233] hover:border-[#E11D48] hover:text-[#E11D48]'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white text-white' : ''}`} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-[#94A3B8] bg-white text-[#0F2233] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              aria-label={t.modalClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Page Main Grid Container */}
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* LEFT COLUMN: Complete Reusable Excursion Sections (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION 0: Hero Lead Stage & Package Configurator */}
            <div
              id="trip-sec-overview"
              className="card-wasla scroll-mt-24 p-5 sm:p-6 space-y-5"
            >
              <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#C8C2B8]/60 bg-[#0F2233]">
                <SmartImage
                  src={galleryImages[safeImgIdx]}
                  alt={getCaptionForImage(safeImgIdx)}
                  loading="eager"
                  className="h-full w-full"
                  placeholderLabel={title}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#1C1008]/92 via-[#1C1008]/50 to-transparent" />

                {/* Prev / Next Gallery Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
                      }
                      aria-label="Previous photo"
                      className="absolute start-3 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-xs hover:bg-[#EE5426] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
                      }
                      aria-label="Next photo"
                      className="absolute end-3 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-xs hover:bg-[#EE5426] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                <div className="absolute top-3 end-3 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black/60 px-2.5 text-xs font-semibold text-white backdrop-blur-xs hover:bg-[#EE5426] transition-colors cursor-pointer tabular-nums"
                  >
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {safeImgIdx + 1} / {galleryImages.length}
                    </span>
                  </button>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 sm:px-5 pb-3.5 pt-6 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#FFF7ED]">
                    <span className="text-[#FED7AA] truncate max-w-[460px]">
                      {getCaptionForImage(safeImgIdx)}
                    </span>
                    <span className="text-[11px] font-medium text-white/90 shrink-0">
                      {operatingDaysLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title, Unboxed Metadata & Short Description */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#475569] tabular-nums">
                    <span className="inline-flex items-center gap-1 text-[#EE5426]">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {trip.destination}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#0F2233]">
                      <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                      {trip.rating.toFixed(1)} ({trip.reviewCount}{' '}
                      {tText({ en: 'reviews', ar: 'تقييم', de: 'Bewertungen' }, lang)})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#15803D]">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {verifiedPartnerLabel}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-[11px] font-medium text-[#64748B] block">
                      {tText({ en: 'Starting from', ar: 'يبدأ من', de: 'Ab' }, lang)}
                    </span>
                    <span className="font-display text-2xl font-bold text-[#EE5426] tabular-nums">
                      {formatPrice(activeUnitPrice)}
                    </span>
                  </div>
                </div>

                <h1
                  id="trip-modal-title"
                  className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2233] text-balance"
                >
                  {title}
                </h1>
                <p className="text-[15.5px] leading-relaxed text-[#384C54]">
                  {tText(trip.shortDescription, lang)}
                </p>
              </div>

              {/* 4-Card Quick Specs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
                    <Clock className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    <span>{tText({ en: 'Duration', ar: 'المدة الزمنية', de: 'Dauer' }, lang)}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0F2233] tabular-nums">
                    {tText(trip.duration, lang)}
                  </p>
                </div>

                <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
                    <Sparkles className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    <span>{tText({ en: 'Departure', ar: 'ميعاد التحرك', de: 'Startzeit' }, lang)}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#EE5426] line-clamp-2 tabular-nums">
                    {scheduleSummary}
                  </p>
                </div>

                <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
                    <Navigation className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    <span>{tText({ en: 'Hotel Pickup', ar: 'الاستلام والتوصيل', de: 'Abholung' }, lang)}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0F2233] line-clamp-2">
                    {tText(trip.pickup, lang)}
                  </p>
                </div>

                <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
                    <Globe className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    <span>{tText({ en: 'Live Guide', ar: 'لغات الإرشاد', de: 'Sprachen' }, lang)}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0F2233] line-clamp-2">
                    {trip.languages && trip.languages.length > 0
                      ? trip.languages.join(' · ')
                      : 'English · العربية · Deutsch'}
                  </p>
                </div>
              </div>

              {/* Package Options Comparison Cards */}
              {trip.options && trip.options.length > 0 && (
                <div className="pt-4 border-t-[1.5px] border-[#94A3B8] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-[#0F2233]">
                      {tText(
                        {
                          en: 'Available Packages & Options (Click to select)',
                          ar: 'الباقات والاختيارات المتاحة للرحلة (اضغط لاختيار الباقة)',
                          de: 'Verfügbare Pakete & Optionen (Klicken zum Auswählen)',
                        },
                        lang
                      )}
                    </h2>
                    <span className="text-xs font-medium text-[#475569] tabular-nums">
                      {trip.options.length}{' '}
                      {tText({ en: 'options', ar: 'باقات', de: 'Optionen' }, lang)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {trip.options.map((opt) => {
                      const isSelected = selectedOption?.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedOptionId(opt.id)}
                          className={`w-full text-start rounded-xl border-[1.5px] p-3.5 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'border-[#EE5426] bg-[#FFF7ED]/70 ring-1 ring-[#EE5426]'
                              : 'border-[#94A3B8] bg-[#F8FAFC] hover:border-[#475569] hover:bg-white'
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? 'border-[#EE5426] bg-[#EE5426] text-white'
                                    : 'border-[#64748B] bg-white'
                                }`}
                              >
                                {isSelected && <Check className="h-2.5 w-2.5" />}
                              </span>
                              <span className="text-sm font-semibold text-[#0F2233]">
                                {tText(opt.title, lang)}
                              </span>
                            </div>
                            {opt.detail && (
                              <p className="text-xs text-[#475569] ps-6 leading-relaxed">
                                {tText(opt.detail, lang)}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-end">
                            <span className="block font-display text-base font-bold text-[#EE5426] tabular-nums">
                              {formatPrice(opt.price)}
                            </span>
                            <span className="block text-[10px] font-medium text-[#64748B]">
                              {tText({ en: 'per adult', ar: 'للفرد البالغ', de: 'pro Erw.' }, lang)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 1: Dedicated Image Gallery Showcase */}
            <section
              id="trip-sec-gallery"
              aria-labelledby="trip-gallery-heading"
              className="card-wasla scroll-mt-24 p-5 sm:p-6 space-y-4"
            >
              <div className="border-b-[1.5px] border-[#94A3B8] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-[#EE5426]" aria-hidden="true" />
                  <h2 id="trip-gallery-heading" className="font-display text-lg font-bold text-[#0F2233]">
                    {tText(
                      {
                        en: 'Dedicated Excursion Gallery',
                        ar: 'معرض صور الرحلة المخصص',
                        de: 'Ausflugs-Bildergalerie',
                      },
                      lang
                    )}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F2233] hover:border-[#EE5426] hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                  <span>
                    {tText(
                      {
                        en: `View Fullscreen (${galleryImages.length})`,
                        ar: `عرض بملء الشاشة (${galleryImages.length})`,
                        de: `Vollbild (${galleryImages.length})`,
                      },
                      lang
                    )}
                  </span>
                </button>
              </div>

              <div
                className={`grid gap-3.5 ${
                  galleryImages.length === 1
                    ? 'grid-cols-1'
                    : galleryImages.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {galleryImages.map((imgUrl, idx) => {
                  const caption = getCaptionForImage(idx);
                  const isActive = safeImgIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setLightboxOpen(true);
                      }}
                      className={`group text-start overflow-hidden rounded-xl border-[1.5px] bg-[#F8FAFC] transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#EE5426] ring-1 ring-[#EE5426]/40'
                          : 'border-[#94A3B8] hover:border-[#475569]'
                      }`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0F2233]">
                        <SmartImage
                          src={imgUrl}
                          alt={caption}
                          loading={idx < 2 ? 'eager' : 'lazy'}
                          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                          placeholderLabel={caption}
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="absolute top-2.5 end-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">
                          {idx + 1} / {galleryImages.length}
                        </span>
                      </div>
                      <div className="px-3.5 py-2.5 border-t-[1.5px] border-[#94A3B8]/80 flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-[#0F2233] line-clamp-2 leading-snug">
                          {caption}
                        </p>
                        <Maximize2
                          className="h-3.5 w-3.5 shrink-0 text-[#64748B] group-hover:text-[#EE5426] transition-colors"
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: Itinerary Highlights (Clean Bullet Points) */}
            <section
              id="trip-sec-highlights"
              aria-labelledby="trip-highlights-heading"
              className="card-wasla scroll-mt-24 p-5 sm:p-6 space-y-3.5"
            >
              <div className="border-b border-[#C8C2B8]/60 pb-3 flex items-center justify-between gap-2">
                <h2 id="trip-highlights-heading" className="font-display text-lg font-bold text-[#0F2233]">
                  {t.modalHighlightsTitle}
                </h2>
                <span className="text-xs font-medium text-[#64748B] tabular-nums">
                  {trip.highlights.length}{' '}
                  {tText({ en: 'key highlights', ar: 'نقاط مميزة', de: 'Highlights' }, lang)}
                </span>
              </div>
              <ul className="list-disc ps-5 space-y-2.5 text-[14.5px] leading-relaxed text-[#0F2233] marker:text-[#EE5426]">
                {trip.highlights.map((item, idx) => (
                  <li key={idx}>{tText(item, lang)}</li>
                ))}
              </ul>
            </section>

            {/* SECTION 3: Description & Visual Route Itinerary Side-by-Side */}
            {Boolean(hasItinerary || fullDescText) && (
              <section
                id="trip-sec-itinerary"
                className="card-wasla scroll-mt-24 p-5 sm:p-6"
              >
                <div
                  className={`grid grid-cols-1 ${
                    hasItinerary && fullDescText ? 'md:grid-cols-12 gap-7 items-start' : 'gap-5'
                  }`}
                >
                  {/* Concise Description Column */}
                  {fullDescText && (
                    <div
                      id="trip-sec-description"
                      className={`scroll-mt-24 space-y-4 ${hasItinerary ? 'md:col-span-5' : ''}`}
                    >
                      <div className="border-b-[1.5px] border-[#94A3B8] pb-3 flex items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-bold text-[#0F2233]">
                          {t.modalDescriptionTitle}
                        </h2>
                        <span className="text-xs font-medium text-[#15803D] truncate">
                          {verifiedPartnerLabel}
                        </span>
                      </div>

                      <div className="space-y-3 text-[14px] leading-relaxed text-[#384C54]">
                        {visibleFullDesc
                          .split(/\n\s*\n/)
                          .map((para) => para.trim())
                          .filter(Boolean)
                          .map((para, pIdx) => (
                            <p key={pIdx} className="whitespace-pre-line">
                              {para}
                            </p>
                          ))}
                      </div>

                      {hasLongDesc && (
                        <button
                          type="button"
                          onClick={() => setDescExpanded((prev) => !prev)}
                          className="text-xs font-semibold text-[#EE5426] hover:underline cursor-pointer"
                        >
                          {descExpanded ? t.modalSeeLess : t.modalSeeMore}
                        </button>
                      )}

                      {trip.timingNote && (
                        <div className="pt-3 border-t border-[#94A3B8] space-y-1">
                          <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
                            {tText({ en: 'Timing & Pickup', ar: 'التوقيت والاستلام', de: 'Zeitplan & Abholung' }, lang)}
                          </span>
                          <p className="text-xs font-medium text-[#EE5426] leading-relaxed">
                            {tText(trip.timingNote, lang)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visual Vertical Timeline Itinerary Column */}
                  {hasItinerary && (
                    <div
                      className={
                        fullDescText
                          ? 'md:col-span-7 md:border-s-[1.5px] md:border-[#94A3B8] md:ps-6 space-y-4'
                          : 'flex flex-col md:flex-row gap-5 md:gap-10 items-start'
                      }
                    >
                      <div
                        className={
                          fullDescText
                            ? 'border-b-[1.5px] border-[#94A3B8] pb-3 flex items-center justify-between gap-2'
                            : 'md:w-40 shrink-0 space-y-1'
                        }
                      >
                        <h2 className="font-display text-lg font-bold text-[#0F2233]">
                          {t.modalItineraryTitle || tText({ en: 'Itinerary', ar: 'مسار الرحلة', de: 'Reiseverlauf' }, lang)}
                        </h2>
                        {fullDescText && (
                          <span className="text-xs font-medium text-[#475569] tabular-nums">
                            {trip.itinerary!.length}{' '}
                            {tText({ en: 'stops', ar: 'محطات', de: 'Stopps' }, lang)}
                          </span>
                        )}
                        {!fullDescText && trip.timingNote && (
                          <p className="text-xs leading-relaxed text-[#475569]">
                            {tText(trip.timingNote, lang)}
                          </p>
                        )}
                      </div>

                      <ol className="flex-1 w-full">
                        {trip.itinerary!.map((stop, idx) => {
                          const isLast = idx === trip.itinerary!.length - 1;
                          const stopTitle = tText(stop.title, lang);
                          const stopSubtitle = stop.subtitle ? tText(stop.subtitle, lang) : '';
                          const stopExtra = stop.durationOrTime ? tText(stop.durationOrTime, lang) : '';

                          return (
                            <li key={idx} className="relative flex items-start gap-3.5 pb-5 last:pb-0">
                              {!isLast && (
                                <span
                                  aria-hidden="true"
                                  className="absolute start-[16px] top-[18px] bottom-[-18px] w-[4px] bg-[#EE5426]"
                                />
                              )}

                              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center">
                                {stop.kind === 'pickup' ? (
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/15">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EE5426] text-white">
                                      <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                  </span>
                                ) : stop.kind === 'end' ? (
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EE5426] ring-2 ring-white shadow-sm" />
                                ) : stop.kind === 'break' ? (
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#334155] shadow-2xs" />
                                ) : (
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F2233] text-white shadow-xs">
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 pt-0.5 space-y-0.5">
                                {stop.kind === 'break' ? (
                                  <p className="text-[14px] font-medium text-[#0F2233] pt-1">
                                    {stopTitle}
                                    {stopExtra ? ` · ${stopExtra}` : ''}
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-[14.5px] font-bold text-[#0F2233] leading-snug">
                                      {stopTitle}
                                    </p>
                                    {(stopSubtitle || stopExtra) && (
                                      <p className="text-[13px] text-[#475569] leading-snug">
                                        {[stopSubtitle, stopExtra].filter(Boolean).join(' · ')}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* SECTION 4: Historical Facts & Cultural Heritage Context */}
            {hasHistoricalFacts && (
              <section
                id="trip-sec-history"
                aria-labelledby="trip-history-heading"
                className="card-wasla scroll-mt-24 p-5 sm:p-6 space-y-5"
              >
                <div className="border-b border-[#C8C2B8]/60 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-[#EE5426]" aria-hidden="true" />
                    <h2 id="trip-history-heading" className="font-display text-lg font-bold text-[#0F2233]">
                      {tText(
                        {
                          en: 'Historical Facts & Heritage Context',
                          ar: 'حقائق تاريخية وخلفية أثرية للرحلة',
                          de: 'Historische Fakten & Kultureller Kontext',
                        },
                        lang
                      )}
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-[#64748B]">
                    {trip.destination} · {categoryLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {trip.historicalFacts!.map((item, idx) => (
                    <article
                      key={idx}
                      className="space-y-1.5 border-b border-[#C8C2B8]/55 pb-4 sm:last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
                    >
                      {(item.era || item.metric) && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] font-semibold text-[#EE5426] tabular-nums">
                          {item.era && <span>{tText(item.era, lang)}</span>}
                          {item.era && item.metric && <span aria-hidden="true">·</span>}
                          {item.metric && <span className="text-[#64748B]">{tText(item.metric, lang)}</span>}
                        </div>
                      )}
                      <h3 className="font-display text-base font-bold text-[#0F2233] leading-snug">
                        {tText(item.title, lang)}
                      </h3>
                      <p className="text-[13.5px] leading-relaxed text-[#384C54]">
                        {tText(item.fact, lang)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 5: Included Services & Not Included / Optional Extras */}
            <section
              id="trip-sec-includes"
              aria-labelledby="trip-includes-heading"
              className="card-wasla scroll-mt-24 p-5 sm:p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h2
                    id="trip-includes-heading"
                    className="font-display text-base font-semibold text-[#0F2233] flex items-center gap-2 border-b-[1.5px] border-[#94A3B8] pb-2.5"
                  >
                    <Check className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
                    <span>
                      {tText(
                        {
                          en: 'Included Services',
                          ar: 'الخدمات المشمولة في الرحلة',
                          de: 'Inklusive Leistungen',
                        },
                        lang
                      )}
                    </span>
                  </h2>
                  <ul className="space-y-2.5 text-sm text-[#384C54]">
                    {trip.included.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="leading-relaxed">{tText(item, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {Boolean(trip.tips && trip.tips.length > 0) && (
                  <div className="space-y-3 sm:border-s-[1.5px] sm:border-[#94A3B8] sm:ps-6">
                    <h2 className="font-display text-base font-semibold text-[#0F2233] flex items-center gap-2 border-b-[1.5px] border-[#94A3B8] pb-2.5">
                      <X className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                      <span>{t.modalTipsTitle}</span>
                    </h2>
                    <ul className="space-y-2.5 text-sm text-[#384C54]">
                      {trip.tips!.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <X className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="leading-relaxed">{tText(item, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3.5 border-t-[1.5px] border-[#94A3B8]/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[#475569]">
                <span className="inline-flex items-center gap-1.5 text-[#0F2233] font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                  {tText({ en: 'Whole-euro transparent pricing', ar: 'أسعار واضحة باليورو بدون رسوم خفية', de: 'Transparente Euro-Endpreise' }, lang)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{t.modalPayAfter}</span>
                <span aria-hidden="true">·</span>
                <span>{t.modalNoBotNote}</span>
              </div>
            </section>

            {/* SECTION 6: Not Suitable For & Meeting Point */}
            {Boolean(trip.notSuitableFor?.length || trip.meetingPoint) && (
              <section className="rounded-2xl border-[1.5px] border-[#94A3B8] bg-white p-5 sm:p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {trip.notSuitableFor && trip.notSuitableFor.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="font-display text-base font-semibold text-[#0F2233] flex items-center gap-2 border-b-[1.5px] border-[#94A3B8] pb-2.5">
                        <AlertCircle className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
                        <span>{t.modalNotSuitableTitle}</span>
                      </h2>
                      <ul className="space-y-2 text-sm text-[#384C54]">
                        {trip.notSuitableFor.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span aria-hidden="true" className="text-[#D97706] font-bold">•</span>
                            <span className="leading-relaxed">{tText(item, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {trip.meetingPoint && (
                    <div
                      className={`space-y-3 ${
                        trip.notSuitableFor?.length ? 'sm:border-s-[1.5px] sm:border-[#94A3B8] sm:ps-6' : ''
                      }`}
                    >
                      <h2 className="font-display text-base font-semibold text-[#0F2233] flex items-center gap-2 border-b-[1.5px] border-[#94A3B8] pb-2.5">
                        <Navigation className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                        <span>{t.modalMeetingPointTitle}</span>
                      </h2>
                      <p className="text-sm leading-relaxed text-[#384C54]">
                        {tText(trip.meetingPoint, lang)}
                      </p>
                      {trip.meetingPointUrl && (
                        <a
                          href={trip.meetingPointUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#EE5426]/65 bg-[#FFF7ED] px-3 py-2 text-xs font-semibold text-[#EE5426] hover:bg-[#EE5426] hover:text-white transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {tText(
                              {
                                en: 'Open Location in Google Maps',
                                ar: 'فتح موقع نقطة التجمع على خرائط جوجل',
                                de: 'Standort in Google Maps öffnen',
                              },
                              lang
                            )}
                          </span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* SECTION 7: Important Info (What to Bring, Not Allowed, Know Before You Go) */}
            {Boolean(trip.whatToBring?.length || trip.notAllowed?.length || trip.knowBeforeYouGo?.length) && (
              <section
                id="trip-sec-know"
                className="scroll-mt-24 rounded-2xl border-[1.5px] border-[#EE5426]/60 bg-[#FFF7ED]/65 p-5 sm:p-6 shadow-sm space-y-5"
              >
                <h2 className="font-display text-lg font-semibold text-[#0F2233] border-b-[1.5px] border-[#EE5426]/45 pb-3">
                  {t.modalSomethingToKnowTitle}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {trip.whatToBring && trip.whatToBring.length > 0 && (
                    <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-white p-4 space-y-2.5">
                      <h3 className="text-xs font-semibold text-[#0F2233] flex items-center gap-1.5 border-b border-[#94A3B8]/60 pb-2">
                        <Luggage className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                        <span>{t.modalWhatToBringTitle}</span>
                      </h3>
                      <ul className="space-y-2 text-xs text-[#384C54] leading-relaxed">
                        {trip.whatToBring.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#EE5426] font-bold">•</span>
                            <span>{tText(item, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {trip.notAllowed && trip.notAllowed.length > 0 && (
                    <div className="rounded-xl border-[1.5px] border-[#DC2626]/50 bg-white p-4 space-y-2.5">
                      <h3 className="text-xs font-semibold text-[#0F2233] flex items-center gap-1.5 border-b border-[#DC2626]/35 pb-2">
                        <Ban className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                        <span>{t.modalNotAllowedTitle}</span>
                      </h3>
                      <ul className="space-y-2 text-xs text-[#384C54] leading-relaxed">
                        {trip.notAllowed.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#DC2626] font-bold">•</span>
                            <span>{tText(item, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {trip.knowBeforeYouGo && trip.knowBeforeYouGo.length > 0 && (
                  <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-white p-4 space-y-2.5">
                    <h3 className="text-xs font-semibold text-[#0F2233] flex items-center gap-1.5 border-b border-[#94A3B8]/60 pb-2">
                      <Info className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                      <span>{t.modalKnowBeforeYouGoTitle}</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-[#384C54] leading-relaxed">
                      {trip.knowBeforeYouGo.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#EE5426] font-bold">•</span>
                          <span>{tText(item, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* SECTION 8: Family & Child Policy (Clean Unboxed Metadata) */}
            <section className="rounded-2xl bg-white p-5 sm:p-6 border-[1.5px] border-[#94A3B8] shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F2233] border-b border-[#94A3B8]/70 pb-2.5">
                <Users className="h-4 w-4 text-[#EE5426] shrink-0" aria-hidden="true" />
                <span>{t.modalChildPolicy}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-[#384C54] tabular-nums">
                {trip.familyFriendly && (
                  <span className="font-semibold text-[#EE5426]">✓ {t.familyFriendly}</span>
                )}
                {trip.familyFriendly && trip.womenFriendly && <span aria-hidden="true">·</span>}
                {trip.womenFriendly && (
                  <span className="font-semibold text-[#EE5426]">✓ {t.womenFriendly}</span>
                )}
                {trip.minChildAge !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#0F2233] font-semibold">
                      {t.minChildAge}: {trip.minChildAge}+
                    </span>
                  </>
                )}
                {trip.kidsDiscount && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#0F2233]">
                      {t.kidsDiscount}: {tText(trip.kidsDiscount, lang)}
                    </span>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Booking & Price Calculator (5 Cols) */}
          <div className="card-wasla lg:col-span-5 lg:sticky lg:top-20 p-5 sm:p-7 space-y-4">
            {pendingTicketRequest ? (
              <div
                ref={confirmedCardRef}
                className="overflow-hidden rounded-2xl border-2 border-[#EE5426] bg-white shadow-xl"
              >
                <div className="bg-gradient-to-r from-[#0F2233] via-[#19354F] to-[#0F2233] px-5 py-4 text-white">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <WaslaBrandMark size="sm" />
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#FDBA74]">
                          {tText(
                            {
                              en: 'BOOKING TICKET · REVIEW & CONFIRM',
                              ar: 'تيكت الحجز · راجع المواصفات قبل التأكيد',
                              de: 'BUCHUNGSTICKET · BITTE PRÜFEN & BESTÄTIGEN',
                            },
                            lang
                          )}
                        </span>
                        <h3 className="font-display text-base sm:text-lg font-bold text-white">
                          {tText(
                            {
                              en: 'Your Excursion Ticket Summary',
                              ar: 'تيكت رحلتك جاهز للمراجعة',
                              de: 'Ihr Ausflugsticket zur Bestätigung',
                            },
                            lang
                          )}
                        </h3>
                      </div>
                    </div>
                    <span className="rounded-lg bg-[#EE5426] px-2.5 py-1 font-mono text-xs font-bold text-white tabular-nums">
                      {pendingTicketRequest.id}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#EE5426]">
                      {tText(
                        {
                          en: 'Excursion & Selected Option',
                          ar: 'الرحلة والباقة المختارة',
                          de: 'Ausflug & gewählte Option',
                        },
                        lang
                      )}
                    </span>
                    <div className="text-sm sm:text-base font-bold text-[#0F2233] leading-snug">
                      {pendingTicketRequest.tripTitle}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                      <span>{pendingTicketRequest.destination || trip.destination}</span>
                      {pendingTicketRequest.duration && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{pendingTicketRequest.duration}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{verifiedPartnerLabel}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#94A3B8] divide-y divide-[#E2E8F0] text-xs">
                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-[#64748B]">
                        {tText({ en: 'Excursion Date', ar: 'تاريخ الرحلة', de: 'Reisedatum' }, lang)}
                      </span>
                      <strong className="font-mono font-semibold text-[#0F2233] tabular-nums">
                        {pendingTicketRequest.date}
                      </strong>
                    </div>

                    {pendingTicketRequest.tripStartTime && (
                      <div className="py-2.5 flex items-center justify-between gap-4">
                        <span className="text-[#64748B]">
                          {isTransferTrip
                            ? tText(
                                {
                                  en: 'Flight / Transfer Time',
                                  ar: 'ميعاد الطيارة / التحرك',
                                  de: 'Flug- / Transferzeit',
                                },
                                lang
                              )
                            : tText(
                                {
                                  en: 'Trip Start Time',
                                  ar: 'توقيت بداية الرحلة',
                                  de: 'Tour-Startzeit',
                                },
                                lang
                              )}
                        </span>
                        <strong className="font-semibold text-[#EE5426] tabular-nums text-end">
                          {pendingTicketRequest.tripStartTime}
                        </strong>
                      </div>
                    )}

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-[#64748B]">
                        {tText(
                          {
                            en: 'Guests & Manifest',
                            ar: 'الأفراد (كشف الباص/المركب)',
                            de: 'Personenanzahl',
                          },
                          lang
                        )}
                      </span>
                      <strong className="font-semibold text-[#0F2233] tabular-nums text-end">
                        {pendingTicketRequest.adults}{' '}
                        {tText({ en: 'Adult(s)', ar: 'بالغ', de: 'Erw.' }, lang)}
                        {pendingTicketRequest.children > 0
                          ? ` · ${pendingTicketRequest.children} ${tText({ en: 'Child', ar: 'طفل', de: 'Kind' }, lang)}`
                          : ''}
                        {(pendingTicketRequest.infants ?? 0) > 0
                          ? ` · ${pendingTicketRequest.infants} INF`
                          : ''}
                        {' '}({pendingTicketRequest.adults + pendingTicketRequest.children + (pendingTicketRequest.infants ?? 0)}{' '}
                        {receiptLabels.paxWord})
                      </strong>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-[#64748B]">
                        {tText({ en: 'Lead Guest', ar: 'اسم المسافر', de: 'Name des Gastes' }, lang)}
                      </span>
                      <strong className="font-semibold text-[#0F2233] text-end">
                        {pendingTicketRequest.guestName}
                        {pendingTicketRequest.guestCountry && pendingTicketRequest.guestCountry !== 'Guest' ? (
                          <> · <span className="text-[#EE5426]">{pendingTicketRequest.guestCountry}</span></>
                        ) : null}
                      </strong>
                    </div>

                    <div className="py-2.5 flex items-start justify-between gap-4">
                      <span className="text-[#64748B] shrink-0">
                        {tText(
                          {
                            en: 'Pickup Hotel',
                            ar: 'الفندق ونقطة التحرك',
                            de: 'Hotel & Abholzone',
                          },
                          lang
                        )}
                      </span>
                      <div className="text-end min-w-0">
                        <strong className="font-semibold text-[#0F2233] block">{pendingTicketRequest.hotel}</strong>
                        {pendingTicketRequest.transferZoneLabel && (
                          <span className="block text-[11px] text-[#64748B]">
                            {pendingTicketRequest.transferZoneLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-2.5 flex items-start justify-between gap-4">
                      <span className="text-[#64748B] shrink-0">
                        {tText({ en: 'Contact', ar: 'التواصل', de: 'Kontakt' }, lang)}
                      </span>
                      <div className="text-end min-w-0">
                        <strong className="font-mono font-semibold text-[#0F2233] tabular-nums block">
                          {pendingTicketRequest.whatsapp}
                        </strong>
                        <span className="block text-[11px] text-[#64748B] break-all">
                          {pendingTicketRequest.email}
                        </span>
                      </div>
                    </div>

                    {pendingTicketRequest.notes && (
                      <div className="py-2.5 flex items-start justify-between gap-4">
                        <span className="text-[#64748B] shrink-0">
                          {tText({ en: 'Notes', ar: 'ملاحظات', de: 'Hinweise' }, lang)}
                        </span>
                        <span className="text-[#334155] text-end">{pendingTicketRequest.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Perforated Receipt Seam */}
                  <div className="relative flex items-center py-0.5">
                    <div className="h-4 w-4 -ms-7 rounded-full bg-[#0F2233]/15 border border-[#94A3B8]" />
                    <div className="flex-1 border-t-2 border-dashed border-[#94A3B8]" />
                    <div className="h-4 w-4 -me-7 rounded-full bg-[#0F2233]/15 border border-[#94A3B8]" />
                  </div>

                  {(() => {
                    const snap = pendingReceipt || currentReceipt;
                    return (
                      <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] p-4 space-y-2 text-xs tabular-nums">
                        <div className="flex items-center justify-between text-[#334155]">
                          <span>
                            {receiptLabels.adultsUnit} ({pendingTicketRequest.adults} × {formatLinePrice(snap.adultUnitEur)})
                          </span>
                          <span className="font-semibold text-[#0F2233]">
                            {formatLinePrice(snap.adultsSubtotalEur)}
                          </span>
                        </div>

                        {pendingTicketRequest.children > 0 && (
                          <div className="flex items-center justify-between text-[#334155]">
                            <span>
                              {receiptLabels.childrenUnit} ({pendingTicketRequest.children} × {formatLinePrice(snap.childUnitEur)})
                            </span>
                            <span className="font-semibold text-[#0F2233]">
                              {formatLinePrice(snap.childrenSubtotalEur)}
                            </span>
                          </div>
                        )}

                        {(pendingTicketRequest.infants ?? 0) > 0 && (
                          <div className="flex items-center justify-between text-[#334155]">
                            <span>
                              {receiptLabels.infantsUnit} ({pendingTicketRequest.infants} × {receiptLabels.freeLabel})
                            </span>
                            <span className="font-semibold text-[#15803D]">
                              {receiptLabels.freeLabel} ({formatLinePrice(0)})
                            </span>
                          </div>
                        )}

                        {hasOuterZoneTransfer && (
                          <div className="flex items-center justify-between text-[#334155]">
                            <span className="truncate pe-2">
                              {receiptLabels.transferLine}
                              {snap.zoneFeePerPersonEur > 0
                                ? ` (${snap.payingGuestsCount} × ${formatLinePrice(snap.zoneFeePerPersonEur)})`
                                : ''}
                            </span>
                            <span className="font-semibold text-[#0F2233] shrink-0">
                              {snap.transferSurchargeTotalEur > 0
                                ? `+${formatLinePrice(snap.transferSurchargeTotalEur)}`
                                : receiptLabels.includedLabel}
                            </span>
                          </div>
                        )}

                        <div className="pt-2.5 mt-1 border-t border-dashed border-[#94A3B8] flex items-center justify-between gap-2">
                          <div>
                            <span className="block text-xs font-bold text-[#15803D]">
                              {receiptLabels.totalLabel}
                            </span>
                            <span className="block text-[11px] text-[#64748B]">{t.modalPayAfter}</span>
                          </div>
                          <span className="text-xl sm:text-2xl font-extrabold text-[#15803D]">
                            {formatPrice(pendingTicketRequest.totalEur)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmTicket}
                      className="min-h-[48px] w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] px-6 py-3 text-sm font-bold text-white shadow-md active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>
                        {tText(
                          {
                            en: 'Confirm Booking Ticket (Confirm)',
                            ar: 'تأكيد الحجز النهائي (Confirm Ticket)',
                            de: 'Buchungsticket jetzt bestätigen (Confirm)',
                          },
                          lang
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingTicketRequest(null)}
                      className="min-h-[42px] w-full rounded-full border-[1.5px] border-[#94A3B8] bg-white px-4 py-2 text-xs font-semibold text-[#0F2233] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      {tText(
                        {
                          en: 'Edit Ticket Details Before Confirming',
                          ar: 'تعديل بيانات التيكت قبل التأكيد',
                          de: 'Ticketdaten vor Bestätigung ändern',
                        },
                        lang
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : confirmedRequest ? (
              (() => {
                const liveStatus = bookingStatusById?.[confirmedRequest.id] || 'Pending';
                const isOperatorConfirmed =
                  liveStatus === 'Confirmed' ||
                  liveStatus === 'Driver assigned' ||
                  liveStatus === 'Completed';
                return (
              <div
                ref={confirmedCardRef}
                className="space-y-4 rounded-2xl bg-white p-5 sm:p-6 border-2 border-[#16A34A]/65 shadow-lg"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#15803D]">
                    {isOperatorConfirmed ? (
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {isOperatorConfirmed
                        ? tText(
                            {
                              en: 'OFFICIAL CONFIRMED BOARDING VOUCHER',
                              ar: 'تذكرة صعود رقمية مؤكدة نهائياً',
                              de: 'OFFIZIELL BESTÄTIGTER BOARDING-VOUCHER',
                            },
                            lang
                          )
                        : tText(
                            {
                              en: 'BOOKING CONFIRMED',
                              ar: 'تم تأكيد الحجز بنجاح',
                              de: 'BUCHUNG BESTÄTIGT',
                            },
                            lang
                          )}{' '}
                      · <span className="font-mono">{confirmedRequest.id}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(confirmedRequest.id);
                      setRefCopied(true);
                      window.setTimeout(() => setRefCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#0F2233] hover:bg-[#FFF7ED] cursor-pointer"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {refCopied
                        ? tText({ en: 'Copied!', ar: 'تم نسخ الرقم', de: 'Kopiert' }, lang)
                        : tText({ en: 'Copy Ref', ar: 'نسخ رقم الحجز', de: 'Referenz kopieren' }, lang)}
                    </span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0F2233]">
                    {isOperatorConfirmed
                      ? tText(
                          {
                            en: 'Your Digital Boarding Voucher is Ready',
                            ar: 'تذكرتك الرقمية النهائية جاهزة ومؤكدة',
                            de: 'Ihr digitaler Boarding-Voucher ist bereit',
                          },
                          lang
                        )
                      : tText(
                          {
                            en: 'Your booking is confirmed — we will contact you shortly',
                            ar: 'تم تأكيد حجزك بنجاح — سنتواصل معك الآن',
                            de: 'Ihre Buchung ist bestätigt — wir melden uns in Kürze',
                          },
                          lang
                        )}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#334155]">
                    {isOperatorConfirmed
                      ? tText(
                          {
                            en: 'Your reservation has been verified and confirmed by Wasla Reservations & Dispatch. Present this digital voucher at pickup (payable in EUR, USD, or EGP if Cash on Pickup).',
                            ar: 'تمت مراجعة وتأكيد حجزك من قسم الحجوزات والتشغيل في وصلة ترافيل. يمكنك إبراز هذه التذكرة الرقمية عند الاستلام (الدفع متاح باليورو أو الدولار أو الجنيه المصري).',
                            de: 'Ihre Reservierung wurde von Wasla Dispatch bestätigt. Zeigen Sie diesen digitalen Voucher bei der Abholung vor.',
                          },
                          lang
                        )
                      : tText(
                          {
                            en: 'A confirmation email is on its way to your inbox and our team has been alerted immediately. We will reach out to you right now on WhatsApp and Email with your exact hotel pickup time and driver details.',
                            ar: 'تم إرسال إيميل بتأكيد الحجز إلى بريدك الإلكتروني وإشعار فريقنا فوراً. سنتواصل معك الآن عبر واتساب والبريد الإلكتروني لتزويدك بموعد الاستلام الدقيق من الفندق وتفاصيل السائق.',
                            de: 'Eine Bestätigungs-E-Mail wurde an Ihr Postfach gesendet und unser Team wurde sofort benachrichtigt. Wir melden uns gleich per WhatsApp und E-Mail mit Ihrer genauen Abholzeit.',
                          },
                          lang
                        )}
                  </p>
                </div>

                <div className="rounded-xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] p-4 space-y-3 text-xs text-[#0F2233]">
                  <div className="font-semibold text-sm text-[#EE5426]">
                    {confirmedRequest.tripTitle}
                  </div>
                  <div className="divide-y divide-[#CBD5E1] border-t border-[#94A3B8] text-[#334155] tabular-nums">
                    <div className="py-2 flex items-center justify-between gap-3">
                      <span className="text-[#64748B]">
                        {tText({ en: 'Lead Guest', ar: 'المسافر', de: 'Gast' }, lang)}
                      </span>
                      <strong className="font-semibold text-[#0F2233]">
                        {confirmedRequest.guestName}
                        {confirmedRequest.guestCountry && confirmedRequest.guestCountry !== 'Guest'
                          ? ` · ${confirmedRequest.guestCountry}`
                          : ''}
                      </strong>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-3">
                      <span className="text-[#64748B]">
                        {tText({ en: 'Date', ar: 'التاريخ', de: 'Datum' }, lang)}
                      </span>
                      <strong className="font-mono font-semibold text-[#0F2233]">{confirmedRequest.date}</strong>
                    </div>
                    {confirmedRequest.tripStartTime && (
                      <div className="py-2 flex items-center justify-between gap-3">
                        <span className="text-[#64748B]">
                          {isTransferTrip
                            ? tText(
                                {
                                  en: 'Flight / Transfer Time',
                                  ar: 'ميعاد الطيارة / التحرك',
                                  de: 'Flug- / Transferzeit',
                                },
                                lang
                              )
                            : tText(
                                {
                                  en: 'Trip Start Time',
                                  ar: 'توقيت بداية الرحلة',
                                  de: 'Tour-Startzeit',
                                },
                                lang
                              )}
                        </span>
                        <strong className="font-semibold text-[#EE5426] tabular-nums text-end">
                          {confirmedRequest.tripStartTime}
                        </strong>
                      </div>
                    )}
                    <div className="py-2 flex items-center justify-between gap-3">
                      <span className="text-[#64748B]">
                        {tText({ en: 'Pickup Hotel', ar: 'الفندق', de: 'Hotel' }, lang)}
                      </span>
                      <strong className="font-semibold text-[#0F2233] truncate text-end">
                        {confirmedRequest.hotel}
                      </strong>
                    </div>
                    <div className="py-2 flex items-center justify-between gap-3">
                      <span className="text-[#64748B]">
                        {tText({ en: 'Guests', ar: 'الأفراد', de: 'Gäste' }, lang)}
                      </span>
                      <strong className="font-semibold text-[#0F2233]">
                        {confirmedRequest.adults}A
                        {confirmedRequest.children > 0 ? ` + ${confirmedRequest.children}C` : ''}
                        {(confirmedRequest.infants ?? 0) > 0 ? ` + ${confirmedRequest.infants}INF` : ''}
                        {' '}({confirmedRequest.adults + confirmedRequest.children + (confirmedRequest.infants ?? 0)} {receiptLabels.paxWord})
                      </strong>
                    </div>
                  </div>

                  {(() => {
                    const snap = confirmedReceipt || currentReceipt;
                    return (
                      <div className="pt-2.5 border-t border-dashed border-[#94A3B8] space-y-1.5 tabular-nums">
                        <div className="flex items-center justify-between text-[#475569]">
                          <span>
                            {receiptLabels.adultsUnit} ({confirmedRequest.adults} × {formatLinePrice(snap.adultUnitEur)})
                          </span>
                          <span className="font-semibold text-[#0F2233]">
                            {formatLinePrice(snap.adultsSubtotalEur)}
                          </span>
                        </div>
                        {confirmedRequest.children > 0 && (
                          <div className="flex items-center justify-between text-[#475569]">
                            <span>
                              {receiptLabels.childrenUnit} ({confirmedRequest.children} × {formatLinePrice(snap.childUnitEur)})
                            </span>
                            <span className="font-semibold text-[#0F2233]">
                              {formatLinePrice(snap.childrenSubtotalEur)}
                            </span>
                          </div>
                        )}
                        {(confirmedRequest.infants ?? 0) > 0 && (
                          <div className="flex items-center justify-between text-[#475569]">
                            <span>
                              {receiptLabels.infantsUnit} ({confirmedRequest.infants} × {receiptLabels.freeLabel})
                            </span>
                            <span className="font-semibold text-[#15803D]">{receiptLabels.freeLabel}</span>
                          </div>
                        )}
                        {snap.transferSurchargeTotalEur > 0 && (
                          <div className="flex items-center justify-between text-[#475569]">
                            <span>{receiptLabels.transferLine}</span>
                            <span className="font-semibold text-[#0F2233]">
                              +{formatLinePrice(snap.transferSurchargeTotalEur)}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#94A3B8] flex items-center justify-between">
                          <span className="font-bold text-[#15803D]">{receiptLabels.totalLabel}</span>
                          <strong className="text-base font-extrabold text-[#15803D]">
                            {formatPrice(confirmedRequest.totalEur)}
                          </strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="rounded-xl border-[1.5px] border-[#EE5426]/45 bg-[#FFF7ED]/50 p-3.5 space-y-1.5 text-xs text-[#0F2233]">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-[#16A34A] shrink-0" aria-hidden="true" />
                    <span className="tabular-nums font-semibold text-[#0F2233]">{confirmedRequest.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#EE5426] shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-[#0F2233] break-all">{confirmedRequest.email}</span>
                  </div>
                  <p className="text-[11px] text-[#475569] pt-1">{t.modalPickupDispatchNote}</p>
                </div>

                {!previewMode && (
                  <div className="space-y-2.5">
                    {isOperatorConfirmed ? (
                      <button
                        type="button"
                        onClick={() =>
                          printWaslaBoardingVoucher(
                            {
                              bookingId: confirmedRequest.id,
                              status: 'Confirmed',
                              tripTitle: confirmedRequest.tripTitle,
                              destination: confirmedRequest.destination,
                              date: confirmedRequest.date,
                              tripStartTime: confirmedRequest.tripStartTime,
                              hotel: confirmedRequest.hotel,
                              roomNumber: confirmedRequest.roomNumber,
                              guestName: confirmedRequest.guestName,
                              guestCountry: confirmedRequest.guestCountry,
                              guestLang: confirmedRequest.guestLang,
                              guideLanguage: confirmedRequest.guideLanguage,
                              adults: confirmedRequest.adults,
                              children: confirmedRequest.children,
                              infants: confirmedRequest.infants,
                              totalEur: confirmedRequest.totalEur,
                              currency,
                              whatsapp: confirmedRequest.whatsapp,
                              email: confirmedRequest.email,
                              notes: confirmedRequest.notes,
                            },
                            lang
                          )
                        }
                        className="min-h-[40px] w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#16A34A] bg-[#F0FDF4] px-4 py-2 text-xs font-bold text-[#15803D] hover:bg-[#DCFCE7] transition-colors cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5 text-[#15803D]" aria-hidden="true" />
                        <span>
                          {tText(
                            {
                              en: 'Print Confirmed Boarding Voucher (PDF)',
                              ar: 'طباعة تذكرة الصعود المؤكدة (PDF)',
                              de: 'Bestätigten Boarding-Voucher drucken (PDF)',
                            },
                            lang
                          )}
                        </span>
                      </button>
                    ) : (
                      <div className="rounded-xl border border-[#16A34A]/35 bg-[#F0FDF4] px-3.5 py-2.5 text-[11px] font-semibold text-[#15803D] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                        <span>
                          {tText(
                            {
                              en: 'We are preparing your exact hotel pickup time now — your printable boarding voucher unlocks automatically as soon as dispatch assigns your driver.',
                              ar: 'نقوم الآن بتجهيز موعد الاستلام الدقيق من فندقك — وستفتح التذكرة القابلة للطباعة تلقائياً فور تحديد السائق وموعد التحرك.',
                              de: 'Wir bereiten Ihre genaue Hotelabholzeit vor — Ihr druckbarer Voucher wird automatisch freigeschaltet, sobald Ihr Fahrer zugewiesen ist.',
                            },
                            lang
                          )}
                        </span>
                      </div>
                    )}

                    {(() => {
                      const waDigits = whatsappNumber.replace(/\D/g, '') || '201129155520';
                      const waGreeting =
                        lang === 'ar'
                          ? `أهلاً وصلة ترافيل! قمت بحجز "${confirmedRequest.tripTitle}" (رقم الحجز: ${confirmedRequest.id}) ليوم ${confirmedRequest.date}. أوافق على استلام موعد البيك أب وتفاصيل الرحلة هنا على واتساب.`
                          : lang === 'de'
                          ? `Hallo Wasla Travel! Ich habe gerade "${confirmedRequest.tripTitle}" (Ref: ${confirmedRequest.id}) für den ${confirmedRequest.date} gebucht. Ich möchte meine Abholzeit und Updates gerne hier per WhatsApp erhalten.`
                          : `Hi Wasla Travel! I just booked "${confirmedRequest.tripTitle}" (Ref: ${confirmedRequest.id}) for ${confirmedRequest.date}. I agree to receive my hotel pickup time & trip updates here on WhatsApp.`;
                      const waUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(waGreeting)}`;
                      return (
                        <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 space-y-2.5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-[#0F2233]">
                              {tText(
                                {
                                  en: 'Prefer live pickup updates on WhatsApp? (Optional)',
                                  ar: 'هل تفضل استلام موعد البيك أب وتأكيد الرحلة أسرع على واتساب؟ (اختياري)',
                                  de: 'Abholzeit noch schneller per WhatsApp erhalten? (Optional)',
                                },
                                lang
                              )}
                            </p>
                            <p className="text-[11px] leading-relaxed text-[#475569]">
                              {tText(
                                {
                                  en: 'Your booking is already confirmed by email. Tap below only if you would like to open a direct WhatsApp chat with our concierge now.',
                                  ar: 'حجزك مؤكد بالفعل وتم إرسال الإيميل. اضغط أدناه فقط إذا كنت تفضل فتح محادثة واتساب مباشرة معنا الآن.',
                                  de: 'Ihre Buchung ist bereits per E-Mail bestätigt. Tippen Sie unten nur, wenn Sie direkt einen WhatsApp-Chat mit unserem Team starten möchten.',
                                },
                                lang
                              )}
                            </p>
                          </div>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[40px] w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#16A34A] bg-white px-4 py-2 text-xs font-bold text-[#15803D] hover:bg-[#F0FDF4] transition-colors"
                          >
                            <MessageCircle className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
                            <span>
                              {tText(
                                {
                                  en: 'Start Chat on WhatsApp',
                                  ar: 'ابدأ المحادثة على واتساب',
                                  de: 'Chat auf WhatsApp starten',
                                },
                                lang
                              )}
                            </span>
                          </a>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-wasla-primary min-h-[44px] flex-1 rounded-full px-5 py-2.5 text-sm cursor-pointer"
                  >
                    {t.modalBackToTrips}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedRequest(null);
                      setPendingTicketRequest(null);
                    }}
                    className="btn-wasla-outline min-h-[44px] rounded-full px-4 py-2.5 text-sm cursor-pointer"
                  >
                    {t.modalNewRequest}
                  </button>
                </div>
              </div>
                );
              })()
            ) : (
              <form id="trip-booking-form" onSubmit={handleSubmit} className="space-y-4 scroll-mt-24">
                <div className="flex items-center justify-between border-b-[1.5px] border-[#94A3B8] pb-3">
                  <span className="text-xs font-semibold text-[#0F2233]">
                    {tText({ en: 'Booking details', ar: 'تفاصيل الحجز', de: 'Buchungsdetails' }, lang)}
                  </span>
                  <span className="text-xs font-medium text-[#EE5426]">{t.modalPayAfter}</span>
                </div>

                {trip.options && trip.options.length > 0 && (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[#0F2233]">
                      {t.modalOptionsLabel}
                    </span>
                    <select
                      value={selectedOption?.id ?? ''}
                      onChange={(e) => setSelectedOptionId(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3 text-xs sm:text-sm font-medium text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                    >
                      {trip.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {tText(opt.title, lang)} — {formatLinePrice(opt.price)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="trip-booking-date" className="text-xs font-semibold text-[#0F2233]">
                      {t.modalDateLabel}
                    </label>
                    <span className="text-[11px] font-medium text-[#475569]">{operatingDaysLabel}</span>
                  </div>
                  <input
                    id="trip-booking-date"
                    type="date"
                    value={date}
                    min={trip.availableFrom && trip.availableFrom > todayIso ? trip.availableFrom : todayIso}
                    max={trip.availableTo || undefined}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setError('');
                    }}
                    className={`min-h-[44px] w-full rounded-lg border-[1.5px] bg-white px-3.5 text-sm text-[#0F2233] focus:outline-none tabular-nums ${
                      !isSelectedDateOperating
                        ? 'border-[#DC2626] focus:border-[#DC2626]'
                        : 'border-[#94A3B8] focus:border-[#EE5426]'
                    }`}
                  />
                  {!isSelectedDateOperating && (
                    <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B] space-y-1.5">
                      <p className="font-medium">
                        {tText(
                          {
                            en: `Not operating on ${date}. Runs: ${operatingDaysLabel}.`,
                            ar: `الرحلة غير متاحة يوم ${date}. أيام التشغيل: ${operatingDaysLabel}.`,
                            de: `Am ${date} nicht verfügbar. Betriebstage: ${operatingDaysLabel}.`,
                          },
                          lang
                        )}
                      </p>
                      {suggestedNextOperatingDate && (
                        <button
                          type="button"
                          onClick={() => {
                            setDate(suggestedNextOperatingDate);
                            setError('');
                          }}
                          className="btn-wasla-primary inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer tabular-nums"
                        >
                          {tText(
                            {
                              en: `Select next available: ${suggestedNextOperatingDate}`,
                              ar: `اختر أقرب يوم متاح: ${suggestedNextOperatingDate}`,
                              de: `Nächstes Datum wählen: ${suggestedNextOperatingDate}`,
                            },
                            lang
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isTransferTrip ? (
                  <label className="block space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#0F2233]">
                        {tText(
                          {
                            en: 'Flight / Transfer Time',
                            ar: 'ميعاد الطيارة / التوصيل',
                            de: 'Flug- / Abholzeit',
                          },
                          lang
                        )}
                      </span>
                      <span className="text-[11px] font-medium text-[#EE5426]">
                        {scheduleSummary}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={flightTimeInput}
                      onChange={(e) => setFlightTimeInput(e.target.value)}
                      placeholder={tText(
                        {
                          en: 'e.g. Flight EZY8831 · 14:20 (or leave blank if TBD)',
                          ar: 'مثال: الرحلة DE1234 الساعة 14:20 أو الوصول 10:30 ص',
                          de: 'z. B. Flug DE1234 um 14:20 Uhr',
                        },
                        lang
                      )}
                      className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
                    />
                  </label>
                ) : startTimeOptions.length > 1 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#0F2233]">
                        {tText(
                          {
                            en: 'Select Trip Start Time',
                            ar: 'اختر توقيت بداية الرحلة',
                            de: 'Gewünschte Startzeit wählen',
                          },
                          lang
                        )}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {tText(
                          {
                            en: 'Hotel pickup sent evening prior',
                            ar: 'البيك أب يُحدد قبلها بليلة',
                            de: 'Abholzeit folgt am Vorabend',
                          },
                          lang
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {startTimeOptions.map((slot) => {
                        const activeSlot = (selectedDepartureTime || startTimeOptions[0]) === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedDepartureTime(slot)}
                            className={`min-h-[38px] rounded-xl border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer tabular-nums ${
                              activeSlot
                                ? 'border-[#EE5426] bg-[#FFF7ED] text-[#9A3412] shadow-xs'
                                : 'border-[#94A3B8] bg-white text-[#334155] hover:border-[#EE5426]'
                            }`}
                          >
                            {formatSlotLabel(slot, lang)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border-[1.5px] border-[#EE5426]/55 bg-[#FFF7ED]/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-[11px] font-semibold text-[#9A3412]">
                        {tText(
                          {
                            en: 'Trip Start Time',
                            ar: 'توقيت بداية الرحلة',
                            de: 'Offizielle Startzeit',
                          },
                          lang
                        )}
                      </span>
                      <span className="block text-[11px] text-[#64748B]">
                        {tText(
                          {
                            en: 'Exact hotel pickup time dispatched evening before',
                            ar: 'موعد البيك أب من الفندق يصلك مساءً حسب موقع فندقك',
                            de: 'Genaue Hotelabholzeit folgt am Vorabend je nach Zone',
                          },
                          lang
                        )}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold text-xs text-[#EE5426] tabular-nums">
                      {startTimeOptions[0] ? formatSlotLabel(startTimeOptions[0], lang) : scheduleSummary}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    <div className="rounded-lg border-[1.5px] border-[#94A3B8] bg-white p-2.5 sm:p-3">
                      <span className="block text-xs font-semibold text-[#0F2233] truncate">{t.modalAdults}</span>
                      <span className="block text-[11px] text-[#475569] tabular-nums truncate">{formatLinePrice(activeUnitPrice)}</span>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setAdults((a) => Math.max(1, a - 1))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#94A3B8] text-[#0F2233] hover:bg-[#FFF7ED] cursor-pointer"
                          aria-label="Decrease adults"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-semibold tabular-nums">{safeAdults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults((a) => Math.min(12, a + 1))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#94A3B8] text-[#0F2233] hover:bg-[#FFF7ED] cursor-pointer"
                          aria-label="Increase adults"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border-[1.5px] border-[#94A3B8] bg-white p-2.5 sm:p-3">
                      <span className="block text-xs font-semibold text-[#0F2233] truncate">{t.modalChildren}</span>
                      <span className="block text-[11px] text-[#475569] tabular-nums truncate">{formatLinePrice(childPrice)}</span>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setChildren((c) => Math.max(0, c - 1))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#94A3B8] text-[#0F2233] hover:bg-[#FFF7ED] cursor-pointer"
                          aria-label="Decrease children"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-semibold tabular-nums">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren((c) => Math.min(10, c + 1))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#94A3B8] text-[#0F2233] hover:bg-[#FFF7ED] cursor-pointer"
                          aria-label="Increase children"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border-[1.5px] border-[#94A3B8] bg-white p-2.5 sm:p-3">
                      <span className="block text-xs font-semibold text-[#0F2233] truncate">
                        {tText({ en: 'Infants (INF)', ar: 'الرضع (INF)', de: 'Kleinkinder (INF)' }, lang)}
                      </span>
                      <span className="block text-[11px] font-semibold text-[#16A34A] tabular-nums">
                        {tText({ en: 'Free (€0)', ar: 'مجاناً (0€)', de: 'Kostenlos (0€)' }, lang)}
                      </span>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setInfants((i) => Math.max(0, i - 1))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#94A3B8] text-[#0F2233] hover:bg-[#FFF7ED] cursor-pointer"
                          aria-label="Decrease infants"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-semibold tabular-nums">{infants}</span>
                        <button
                          type="button"
                          onClick={() => setInfants((i) => Math.min(10, i + 1))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#94A3B8] text-[#0F2233] hover:bg-[#FFF7ED] cursor-pointer"
                          aria-label="Increase infants"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[#FFF7ED] border border-[#EE5426]/45 px-3 py-1.5 text-[11px] font-medium text-[#9A3412] tabular-nums">
                    <span>
                      {tText(
                        {
                          en: 'Total passengers on transfer & boat manifest (incl. INF):',
                          ar: 'إجمالي الأفراد في كشف الباص والمركب (شامل الرضع INF):',
                          de: 'Gesamtpersonen auf der Passagierliste (inkl. INF):',
                        },
                        lang
                      )}
                    </span>
                    <strong className="font-bold text-[#EE5426]">
                      {adults + children + infants} {receiptLabels.paxWord}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <WaslaHotelMapPicker
                    value={hotel}
                    onChange={setHotel}
                    destination={trip.destination}
                    hasOuterZoneTransfer={hasOuterZoneTransfer}
                    transferZoneId={transferZoneId}
                    onAutoDetectTransferZone={setTransferZoneId}
                    lang={lang}
                    label={t.modalHotelLabel}
                    placeholder={t.modalHotelPlaceholder}
                  />
                  <div className="space-y-1 pt-0.5">
                    <p className="text-xs font-medium text-[#EE5426] leading-snug">
                      {tText(trip.pickup, lang)}
                    </p>
                    {hasOuterZoneTransfer && (
                      <p className="text-[11px] text-[#475569] leading-snug">
                        {t.modalTransferZoneNotice}
                      </p>
                    )}
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#0F2233] leading-snug">{t.modalNameLabel}</span>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3.5 text-sm text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <label className="flex flex-col justify-end gap-1.5 h-full">
                    <span className="text-xs font-semibold text-[#0F2233] leading-snug">{t.modalWhatsappLabel}</span>
                    <input
                      type="tel"
                      required
                      placeholder={t.modalWhatsappPlaceholder}
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none tabular-nums"
                    />
                  </label>
                  <label className="flex flex-col justify-end gap-1.5 h-full">
                    <span className="text-xs font-semibold text-[#0F2233] leading-snug">{t.modalEmailLabel}</span>
                    <input
                      type="email"
                      required
                      placeholder={t.modalEmailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
                    />
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#0F2233] inline-flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    <span>
                      {tText(
                        {
                          en: 'Preferred Language (Guide & Confirmation Email)',
                          ar: 'اللغة المفضلة (للمرشد وإيميل التأكيد)',
                          de: 'Bevorzugte Sprache (Guide & Bestätigungs-E-Mail)',
                        },
                        lang
                      )}
                    </span>
                  </span>
                  <select
                    value={guideLanguage}
                    onChange={(e) => {
                      setGuideLanguage(e.target.value);
                      setGuestLanguageTouched(true);
                    }}
                    className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3.5 text-sm font-medium text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="German">Deutsch (German)</option>
                    <option value="Arabic">العربية (Arabic)</option>
                    <option value="French">Français (French)</option>
                    <option value="Italian">Italiano (Italian)</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="Dutch">Nederlands (Dutch)</option>
                    <option value="Polish">Polski (Polish)</option>
                    <option value="Russian">Русский (Russian)</option>
                  </select>
                </label>

                <label className="flex items-start gap-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#94A3B8] accent-[#16A34A] cursor-pointer"
                  />
                  <span className="text-[11.5px] leading-relaxed text-[#334155]">
                    {tText(
                      {
                        en: 'I agree to receive my hotel pickup time and trip updates from Wasla Travel via WhatsApp.',
                        ar: 'أوافق على تواصل فريق وصلة ترافيل معي عبر واتساب لإرسال موعد البيك أب وتفاصيل الرحلة.',
                        de: 'Ich stimme zu, meine Hotel-Abholzeit und Tour-Updates von Wasla Travel per WhatsApp zu erhalten.',
                      },
                      lang
                    )}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <label className="flex flex-col justify-end gap-1.5 h-full">
                    <span className="text-xs font-semibold text-[#0F2233] leading-snug">
                      {tText(
                        {
                          en: isMarsaAlamTrip
                            ? 'Hotel Room No. * (Required for Marsa Alam)'
                            : 'Hotel Room No. (Optional)',
                          ar: isMarsaAlamTrip
                            ? 'رقم الغرفة * (إلزامي لرحلات مرسى علم)'
                            : 'رقم الغرفة (اختياري)',
                          de: isMarsaAlamTrip
                            ? 'Zimmernummer * (Pflicht für Marsa Alam)'
                            : 'Zimmernummer (Optional)',
                        },
                        lang
                      )}
                    </span>
                    <input
                      type="text"
                      required={isMarsaAlamTrip}
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder={tText(
                        {
                          en: isMarsaAlamTrip ? 'e.g. 214 (Required)' : 'e.g. 214 or TBD',
                          ar: isMarsaAlamTrip ? 'مثال: 214 (أساسي للتصريح)' : 'مثال: 214 أو عند الوصول',
                          de: 'z. B. 214',
                        },
                        lang
                      )}
                      className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none tabular-nums"
                    />
                  </label>
                  <label className="flex flex-col justify-end gap-1.5 h-full">
                    <span className="text-xs font-semibold text-[#0F2233] leading-snug inline-flex items-center gap-1">
                      <Tag className="h-3 w-3 text-[#EE5426]" aria-hidden="true" />
                      {tText(
                        {
                          en: 'Promo / Partner Code (Optional)',
                          ar: 'كود خصم / إحالة (اختياري)',
                          de: 'Aktionscode (Optional)',
                        },
                        lang
                      )}
                    </span>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder={tText({ en: 'Verified by Operations', ar: 'يُراجع مع العمليات', de: 'Wird geprüft' }, lang)}
                      className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white px-3.5 text-sm font-mono uppercase text-[#0F2233] placeholder:font-sans placeholder:normal-case placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
                    />
                  </label>
                </div>

                {requiresPassportNotice && (
                  <div className="rounded-xl border-[1.5px] border-[#EE5426] bg-[#FFF7ED] p-3.5 space-y-2.5 text-xs text-[#0F2233]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="font-bold text-[#9A3412] block">
                          {tText(
                            {
                              en: 'Passport Photo Upload * (Required for Marsa Alam Permits)',
                              ar: 'رفع صورة جواز السفر * (أساسي لتصاريح رحلات مرسى علم)',
                              de: 'Passfoto hochladen * (Pflicht für Marsa Alam Genehmigung)',
                            },
                            lang
                          )}
                        </strong>
                        <p className="text-[11px] text-[#475569] mt-0.5">
                          {tText(
                            {
                              en: 'Coast Guard & Marina permits in Marsa Alam require a clear photo of your passport data page along with your room number.',
                              ar: 'تتطلب تصاريح حرس الحدود والمارينا في مرسى علم رفع صورة واضحة لصفحة جواز السفر مع رقم الغرفة على التطبيق.',
                              de: 'Für die Küstenwache in Marsa Alam ist ein Foto der Passdatenseite sowie Ihre Zimmernummer erforderlich.',
                            },
                            lang
                          )}
                        </p>
                      </div>
                      <Camera className="h-4 w-4 text-[#EE5426] shrink-0 mt-0.5" aria-hidden="true" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="btn-wasla-primary inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold cursor-pointer">
                        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {passportUploading
                            ? tText({ en: 'Processing...', ar: 'جاري المعالجة...', de: 'Lädt...' }, lang)
                            : passportPhotoDataUrl
                            ? tText({ en: 'Change Passport Photo', ar: 'تغيير صورة جواز السفر', de: 'Passfoto ändern' }, lang)
                            : tText({ en: 'Upload Passport Photo', ar: 'ارفع صورة جواز السفر', de: 'Passfoto auswählen' }, lang)}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => void handlePassportFileChange(e)}
                          className="hidden"
                        />
                      </label>
                      {passportPhotoDataUrl && (
                        <div className="inline-flex items-center gap-2 rounded-lg border border-[#16A34A]/40 bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#15803D]">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {passportPhotoName ||
                              tText({ en: 'Passport attached', ar: 'تم إرفاق الجواز', de: 'Pass beigefügt' }, lang)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPassportPhotoDataUrl('');
                              setPassportPhotoName('');
                            }}
                            className="text-[#DC2626] hover:underline ms-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#0F2233]">{t.modalNotesLabel}</span>
                  <textarea
                    rows={2}
                    placeholder={t.modalNotesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-[#94A3B8] bg-white p-3 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
                  />
                </label>

                {error && (
                  <p className="rounded-lg bg-[#FDF2F2] border border-[#EBC6C6] px-3.5 py-2.5 text-xs font-medium text-[#8A2424]">
                    {error}
                  </p>
                )}

                <div className="border-t-[1.5px] border-[#94A3B8] pt-4 space-y-3">
                  {/* Live Itemized Booking Receipt */}
                  <div className="rounded-2xl border-[1.5px] border-[#94A3B8] bg-[#F8FAFC] overflow-hidden">
                    <div className="px-4 py-3 bg-white border-b-[1.5px] border-[#94A3B8] flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#0F2233]">
                        {receiptLabels.summaryHeader}
                      </span>
                      <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
                        {totalHeadcount} {receiptLabels.paxWord} · {safeAdults}A
                        {safeChildren > 0 ? ` + ${safeChildren}C` : ''}
                        {safeInfants > 0 ? ` + ${safeInfants} INF` : ''}
                      </span>
                    </div>

                    <div className="px-4 py-3.5 space-y-2 text-xs tabular-nums">
                      {selectedOption && (
                        <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-[#94A3B8]/60">
                          <span className="text-[#64748B] shrink-0">{receiptLabels.selectedPkg}</span>
                          <span className="font-semibold text-[#0F2233] text-end truncate">
                            {tText(selectedOption.title, lang)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#64748B] shrink-0">
                          {isTransferTrip
                            ? tText(
                                {
                                  en: 'Flight Time',
                                  ar: 'ميعاد الطيارة / التحرك',
                                  de: 'Flugzeit',
                                },
                                lang
                              )
                            : tText(
                                {
                                  en: 'Trip Start',
                                  ar: 'بداية الرحلة',
                                  de: 'Startzeit',
                                },
                                lang
                              )}
                        </span>
                        <span className="font-semibold text-[#EE5426] text-end truncate">
                          {resolvedTripStartTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#475569]">
                          {receiptLabels.adultsUnit} ({safeAdults} × {formatLinePrice(activeUnitPrice)})
                        </span>
                        <span className="font-semibold text-[#0F2233]">
                          {formatLinePrice(adultsSubtotalEur)}
                        </span>
                      </div>

                      {safeChildren > 0 ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#475569]">
                            {receiptLabels.childrenUnit} ({safeChildren} × {formatLinePrice(childPrice)})
                          </span>
                          <span className="font-semibold text-[#0F2233]">
                            {formatLinePrice(childrenSubtotalEur)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 text-[11px] text-[#64748B]">
                          <span>{receiptLabels.childrenUnit}</span>
                          <span>
                            {formatLinePrice(childPrice)} / {tText({ en: 'child', ar: 'طفل', de: 'Kind' }, lang)}
                          </span>
                        </div>
                      )}

                      {safeInfants > 0 && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#475569]">
                            {receiptLabels.infantsUnit} ({safeInfants} × {receiptLabels.freeLabel})
                          </span>
                          <span className="font-semibold text-[#15803D]">
                            {receiptLabels.freeLabel} ({formatLinePrice(0)})
                          </span>
                        </div>
                      )}

                      {hasOuterZoneTransfer && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#475569] truncate">
                            {receiptLabels.transferLine}
                            {zoneFeePerPerson > 0
                              ? ` (${payingGuestsCount} × ${formatLinePrice(zoneFeePerPerson)})`
                              : ''}
                          </span>
                          <span className="font-semibold text-[#0F2233] shrink-0">
                            {transferSurchargeTotal > 0
                              ? `+${formatLinePrice(transferSurchargeTotal)}`
                              : receiptLabels.includedLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3.5 bg-[#FFF7ED] border-t border-dashed border-[#EE5426]/45 flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-xs font-semibold text-[#0F2233]">
                          {receiptLabels.totalLabel}
                        </span>
                        <span className="block text-[11px] text-[#64748B]">{t.modalPayAfter}</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold text-[#EE5426] tabular-nums shrink-0">
                        {formatPrice(totalEur)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-wasla-primary min-h-[46px] w-full rounded-full px-6 py-3 text-sm cursor-pointer"
                  >
                    {previewMode
                      ? 'Preview Booking Ticket'
                      : lang === 'ar'
                      ? 'عرض تيكت الحجز ومراجعة المواصفات'
                      : `${t.modalSubmitBooking} · ${tText(
                          { en: 'Review Ticket', ar: 'مراجعة التيكت', de: 'Ticket prüfen' },
                          lang
                        )}`}
                  </button>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#EE5426]">{t.modalPickupDispatchNote}</p>
                    <p className="text-xs text-[#64748B]">{t.modalNoBotNote}</p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Full-Width Verified Guest Reviews */}
        <section
          id="trip-sec-reviews"
          className="card-wasla mt-8 scroll-mt-24 p-6 sm:p-8"
        >
          <TripReview
            trip={trip}
            lang={lang}
            previewMode={previewMode}
            bookingStatusById={bookingStatusById}
            storefrontBookingRefs={
              confirmedRequest
                ? [
                    {
                      bookingId: sanitizeBookingId(confirmedRequest.id),
                      tripId: trip.id,
                      tripDate: confirmedRequest.date,
                      savedAt: Date.now(),
                    },
                    ...(storefrontBookingRefs || []),
                  ]
                : storefrontBookingRefs
            }
            onOpenReviewModal={
              onOpenPostTripReview
                ? (bookingId) => onOpenPostTripReview(trip, bookingId)
                : undefined
            }
          />
        </section>

        {/* Similar / Related Excursions */}
        {relatedTrips.length > 0 && onSelectRelatedTrip && (
          <section className="mt-8 pb-20 lg:pb-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold text-[#0F2233]">
                {tText(
                  {
                    en: 'Similar Excursions You May Like',
                    ar: 'رحلات مشابهة قد تعجبك',
                    de: 'Ähnliche Ausflüge, die Ihnen gefallen könnten',
                  },
                  lang
                )}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedTrips.slice(0, 3).map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectRelatedTrip(rel)}
                  className="card-wasla p-0 group text-start overflow-hidden hover:border-[#EE5426] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0F2233]">
                      <SmartImage
                        src={rel.images?.[0]}
                        alt={tText(rel.name, lang)}
                        className="h-full w-full group-hover:scale-[1.04] transition-transform duration-300"
                        placeholderLabel={tText(rel.name, lang)}
                      />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748B] tabular-nums">
                        <span>{rel.destination} · {tText(rel.duration, lang)}</span>
                        <span className="inline-flex items-center gap-0.5 font-semibold text-[#0F2233]">
                          <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                          {rel.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#0F2233] line-clamp-2 group-hover:text-[#EE5426] transition-colors">
                        {tText(rel.name, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-[#C8C2B8]/40 px-3.5 py-2.5 flex items-center justify-between text-xs tabular-nums">
                    <span className="font-bold text-[#EE5426]">
                      {formatCurrencyPrice(rel.price, currency)}
                    </span>
                    <span className="font-semibold text-[#0F2233] group-hover:text-[#EE5426]">
                      {t.bookNow} →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Book CTA Bar (< lg screens) */}
      {!pendingTicketRequest && !confirmedRequest && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#C8C2B8]/60 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-[0_-6px_20px_rgba(15,34,51,0.08)]">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="tabular-nums min-w-0">
              <span className="block text-[10.5px] font-medium text-[#64748B]">
                {tText({ en: 'Estimated total', ar: 'الإجمالي التقديري', de: 'Gesamtpreis' }, lang)}
              </span>
              <span className="block text-lg font-bold text-[#EE5426] leading-tight">
                {formatLinePrice(totalEur)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => jumpToSection('trip-booking-form')}
              className="btn-wasla-primary min-h-[42px] rounded-full px-6 py-2 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
            >
              {t.bookNow}
            </button>
          </div>
        </div>
      )}

      {/* Interactive Fullscreen Gallery Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[70] flex flex-col justify-between bg-[#0F2233]/95 p-4 sm:p-6 text-white backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={getCaptionForImage(safeImgIdx)}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-[#FED7AA] tabular-nums">
                {trip.destination} · {safeImgIdx + 1} / {galleryImages.length}
              </p>
              <p className="text-sm sm:text-base font-semibold text-white truncate">
                {getCaptionForImage(safeImgIdx)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label={t.modalClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white hover:bg-[#EE5426] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative mx-auto my-4 flex w-full max-w-[1140px] flex-1 items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full max-h-[72vh] overflow-hidden rounded-2xl border border-white/20 bg-black">
              <SmartImage
                src={galleryImages[safeImgIdx]}
                alt={getCaptionForImage(safeImgIdx)}
                loading="eager"
                className="h-full w-full"
                placeholderLabel={title}
              />
            </div>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
                  }
                  aria-label="Previous photo"
                  className="absolute start-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white hover:bg-[#EE5426] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
                  }
                  aria-label="Next photo"
                  className="absolute end-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white hover:bg-[#EE5426] transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div
              className="mx-auto flex max-w-[1140px] items-center justify-center gap-2.5 overflow-x-auto py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                    safeImgIdx === idx
                      ? 'border-[#EE5426] opacity-100 scale-105'
                      : 'border-white/30 opacity-65 hover:opacity-100'
                  }`}
                >
                  <SmartImage
                    src={imgUrl}
                    alt={getCaptionForImage(idx)}
                    className="h-full w-full"
                    placeholderLabel={`${idx + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
