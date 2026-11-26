import { createBookingReference } from '../lib/bookingReference';
import { optimizeImageToWebP } from '../lib/imageOptimization';
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
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { I18N, Lang, Translations } from '../data/i18n';
import { formatPerGroupUnitLabel, formatTripLockupPrice } from '../lib/tripPricing';
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
  tText, tripDisplayName,
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
  onSubmitBooking: (request: BookingRequest) => Promise<void> | void;
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
  isFixedGroupPrice?: boolean;
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
  return optimizeImageToWebP(file, 'passport');
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
  const [descExpanded, setDescExpanded] = useState(false);
  const [adults, setAdults] = useState(trip.familyFriendly === false ? 1 : 2);
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
  const [bookingStep, setBookingStep] = useState(1);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [guideLanguage, setGuideLanguage] = useState<string>(() =>
    lang === 'de' ? 'German' : 'English'
  );
  const [guestLanguageTouched, setGuestLanguageTouched] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!guestLanguageTouched) {
      setGuideLanguage(lang === 'de' ? 'German' : 'English');
    }
  }, [lang, guestLanguageTouched]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [bookingSaving, setBookingSaving] = useState(false);
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
    setBookingStep(1);
    setExtrasOpen(false);
    setReceiptOpen(false);
    setActiveImageIndex(0);
    setLightboxOpen(false);
    setDescExpanded(false);
    setAdults(trip.familyFriendly === false ? 1 : 2);
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
    trip.outerTransferEnabled === false
      ? false
      : trip.destination === 'Hurghada' ||
        trip.destination === 'Cairo' ||
        trip.destination === 'Luxor' ||
        trip.outerTransferEnabled === true;
  const activeZone =
    OUTER_TRANSFER_ZONES.find((z) => z.id === transferZoneId) ?? OUTER_TRANSFER_ZONES[0];
  const zoneFeePerPerson = getZoneTransferFeePerPerson(
    transferZoneId,
    trip.destination,
    hasOuterZoneTransfer,
    trip.freeTransferZones
  );
  const directionalZoneLabel = hasOuterZoneTransfer
    ? getZoneTransferLabel(
        activeZone.id,
        trip.destination,
        lang,
        hasOuterZoneTransfer,
        trip.freeTransferZones
      )
    : undefined;

  const isFixedGroupPrice = trip.pricingMode === 'per-group';
  const maxGuestsLimit =
    typeof trip.maxGuests === 'number' && trip.maxGuests > 0 ? trip.maxGuests : null;
  const fixedPriceUnitLabel = formatPerGroupUnitLabel(trip, lang);
  const bookNowMicrocopy = t.bookNowMicrocopy || I18N.en.bookNowMicrocopy;
  const hasVisibleRating = trip.reviewCount > 0;

  const selectedOption = trip.options?.find((o) => o.id === selectedOptionId) || trip.options?.[0];
  const activeUnitPrice = selectedOption ? selectedOption.price : trip.price;
  const childPrice = isFixedGroupPrice ? 0 : computeChildUnitPrice(activeUnitPrice, trip);

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
  const atMaxGuestCapacity = maxGuestsLimit !== null && totalHeadcount >= maxGuestsLimit;

  const adultsSubtotalEur = isFixedGroupPrice ? activeUnitPrice : safeAdults * activeUnitPrice;
  const childrenSubtotalEur = isFixedGroupPrice ? 0 : safeChildren * childPrice;
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
    isFixedGroupPrice,
  };

  const title = tripDisplayName(trip, lang);
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
    return `${title}, ${trip.destination}`;
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
      { en: 'Infants', ar: 'رضيع', de: 'Kleinkinder' },
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
      { en: 'Total', ar: 'الإجمالي', de: 'Gesamt' },
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
    if (bookingStep === 1) {
      handleAdvanceToDetails();
      return;
    }
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
        createBookingReference(),
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

  const handleConfirmTicket = async () => {
    if (!pendingTicketRequest || bookingSaving) return;
    setBookingSaving(true);
    setError('');
    try {
      if (!previewMode) await onSubmitBooking(pendingTicketRequest);
      setConfirmedRequest(pendingTicketRequest);
      setConfirmedReceipt(pendingReceipt || currentReceipt);
      setPendingTicketRequest(null);
      window.setTimeout(() => confirmedCardRef.current?.scrollIntoView({behavior:'smooth',block:'center'}),50);
    } catch {
      setError(tText({en:'Could not save your booking. Please try again.',ar:'تعذر حفظ الحجز. حاول مرة أخرى.',de:'Buchung konnte nicht gespeichert werden. Bitte erneut versuchen.'},lang));
    } finally { setBookingSaving(false); }

  };

  const handleAdvanceToDetails = () => {
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
    setError('');
    setBookingStep(2);
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
                  en: 'Live Trip Page Preview, Guests see this exact full-page layout',
                  ar: 'معاينة حية لصفحة الرحلة، هذا هو الشكل الكامل الذي يظهر للضيف',
                  de: 'Live-Reiseseitenvorschau, Gäste sehen exakt dieses vollständige Seitenlayout',
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
                            {/* Title, Unboxed Metadata & Short Description */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#475569] tabular-nums">
                    <span className="inline-flex items-center gap-1 text-[#EE5426]">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {trip.destination}
                    </span>
                    {hasVisibleRating && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-[#0F2233]">
                          <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                          {trip.rating.toFixed(1)} ({trip.reviewCount}{' '}
                          {tText({ en: 'reviews', ar: 'تقييم', de: 'Bewertungen' }, lang)})
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#15803D]">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {verifiedPartnerLabel}
                    </span>
                    {trip.familyFriendly && (
                      <span className="rounded-full bg-[#EE5426] px-2 py-0.5 text-[10.5px] font-bold text-white">
                        {t.familyFriendly}
                      </span>
                    )}
                    {trip.womenFriendly && (
                      <span className="rounded-full border border-[#C8C2B8] px-2 py-0.5 text-[10.5px] font-bold text-[#0F2233]">
                        {t.womenFriendly}
                      </span>
                    )}
                  </div>
                  <div className="text-end">
                    <span className="text-[11px] font-medium text-[#64748B] block">
                      {isFixedGroupPrice
                        ? tText({ en: 'Fixed price', ar: 'سعر ثابت', de: 'Festpreis' }, lang)
                        : tText({ en: 'Starting from', ar: 'يبدأ من', de: 'Ab' }, lang)}
                    </span>
                    <span className="font-display text-2xl font-bold text-[#0F2233] tabular-nums">
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

              {/* Quick Facts Row (borderless) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 border-t border-[#C8C2B8]/60 pt-4">
                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    {tText({ en: 'Duration', ar: 'المدة الزمنية', de: 'Dauer' }, lang)}
                  </span>
                  <p className="text-sm font-semibold text-[#0F2233]">{tText(trip.duration, lang)}</p>
                </div>
                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    {tText({ en: 'Departure', ar: 'ميعاد التحرك', de: 'Startzeit' }, lang)}
                  </span>
                  <p className="text-sm font-semibold text-[#0F2233] tabular-nums">{scheduleSummary}</p>
                </div>
                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    {tText({ en: 'Hotel Pickup', ar: 'الاستلام والتوصيل', de: 'Abholung' }, lang)}
                  </span>
                  <p className="text-sm font-semibold text-[#0F2233]">{tText(trip.pickup, lang)}</p>
                </div>
                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    {tText({ en: 'Live Guide', ar: 'لغات الإرشاد', de: 'Sprachen' }, lang)}
                  </span>
                  <p className="text-sm font-semibold text-[#0F2233]">
                    {trip.languages && trip.languages.length > 0
                      ? trip.languages.join(' · ')
                      : 'English · العربية · Deutsch'}
                  </p>
                </div>
              </div>

</div>

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
                    className="font-display text-base font-semibold text-[#0F2233] flex items-center gap-2 border-b border-[#C8C2B8]/60 pb-2.5"
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
                    <h2 className="font-display text-base font-semibold text-[#0F2233] flex items-center gap-2 border-b border-[#C8C2B8]/60 pb-2.5">
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

              <div className="pt-3.5 border-t border-[#C8C2B8]/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[#475569]">
                <span className="inline-flex items-center gap-1.5 text-[#0F2233] font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                  {tText({ en: 'Whole-euro transparent pricing', ar: 'أسعار واضحة باليورو بدون رسوم خفية', de: 'Transparente Euro-Endpreise' }, lang)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{t.modalPayAfter}</span>
                <span aria-hidden="true">·</span>
                <span>
                        {tText(
                          {
                            en: 'Free cancellation up to 24 hours before the trip',
                            ar: 'إلغاء مجاني حتى 24 ساعة قبل الرحلة',
                            de: 'Kostenlose Stornierung bis 24 Stunden vor der Tour',
                          },
                          lang
                        )}
                      </span>
              </div>
            </section>

            {/* SECTION 6: Important Information (single collapsible, theme surface, no inner cards) */}
            {Boolean(
              trip.notSuitableFor?.length ||
                trip.meetingPoint ||
                trip.whatToBring?.length ||
                trip.notAllowed?.length ||
                trip.knowBeforeYouGo?.length ||
                trip.familyFriendly ||
                trip.womenFriendly ||
                trip.minChildAge !== undefined ||
                trip.kidsDiscount
            ) && (
              <section id="trip-sec-know" className="card-wasla scroll-mt-24 p-5 sm:p-6">
                <details>
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-semibold text-[#0F2233]">
                      {tText(
                        {
                          en: 'Important information',
                          ar: 'معلومات مهمة',
                          de: 'Wichtige Informationen',
                        },
                        lang
                      )}
                    </span>
                    <span className="text-xs font-semibold text-[#EE5426]" aria-hidden="true">
                      ▾
                    </span>
                  </summary>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-5">
                    {trip.notSuitableFor && trip.notSuitableFor.length > 0 && (
                      <div className="space-y-2.5">
                        <h3 className="text-sm font-semibold text-[#0F2233] flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
                          <span>{t.modalNotSuitableTitle}</span>
                        </h3>
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
                      <div className="space-y-2.5">
                        <h3 className="text-sm font-semibold text-[#0F2233] flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                          <span>{t.modalMeetingPointTitle}</span>
                        </h3>
                        <p className="text-sm leading-relaxed text-[#384C54]">
                          {tText(trip.meetingPoint, lang)}
                        </p>
                        {trip.meetingPointUrl && (
                          <a
                            href={trip.meetingPointUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EE5426]/65 bg-[#FFF7ED] px-3 py-2 text-xs font-semibold text-[#EE5426] hover:bg-[#EE5426] hover:text-white transition-colors"
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

                    {trip.whatToBring && trip.whatToBring.length > 0 && (
                      <div className="space-y-2.5">
                        <h3 className="text-sm font-semibold text-[#0F2233] flex items-center gap-2">
                          <Luggage className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                          <span>{t.modalWhatToBringTitle}</span>
                        </h3>
                        <ul className="space-y-2 text-sm text-[#384C54]">
                          {trip.whatToBring.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span aria-hidden="true" className="text-[#EE5426] font-bold">•</span>
                              <span className="leading-relaxed">{tText(item, lang)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {trip.notAllowed && trip.notAllowed.length > 0 && (
                      <div className="space-y-2.5">
                        <h3 className="text-sm font-semibold text-[#0F2233] flex items-center gap-2">
                          <Ban className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                          <span>{t.modalNotAllowedTitle}</span>
                        </h3>
                        <ul className="space-y-2 text-sm text-[#384C54]">
                          {trip.notAllowed.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span aria-hidden="true" className="text-[#DC2626] font-bold">•</span>
                              <span className="leading-relaxed">{tText(item, lang)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {trip.knowBeforeYouGo && trip.knowBeforeYouGo.length > 0 && (
                      <div className="space-y-2.5">
                        <h3 className="text-sm font-semibold text-[#0F2233] flex items-center gap-2">
                          <Info className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                          <span>{t.modalKnowBeforeYouGoTitle}</span>
                        </h3>
                        <ul className="space-y-2 text-sm text-[#384C54]">
                          {trip.knowBeforeYouGo.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span aria-hidden="true" className="text-[#EE5426] font-bold">•</span>
                              <span className="leading-relaxed">{tText(item, lang)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(trip.familyFriendly ||
                      trip.womenFriendly ||
                      trip.minChildAge !== undefined ||
                      trip.kidsDiscount) && (
                      <div className="space-y-2.5">
                        <h3 className="text-sm font-semibold text-[#0F2233] flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                          <span>{t.modalChildPolicy}</span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-[#384C54] tabular-nums">
                          {trip.familyFriendly && (
                            <span className="font-semibold text-[#0F2233]">✓ {t.familyFriendly}</span>
                          )}
                          {trip.familyFriendly && trip.womenFriendly && <span aria-hidden="true">·</span>}
                          {trip.womenFriendly && (
                            <span className="font-semibold text-[#0F2233]">✓ {t.womenFriendly}</span>
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
                      </div>
                    )}
                  </div>
                </details>
              </section>
            )}
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
                      <div className="py-2.5 flex items-start justify-between gap-4">
                        <span className="text-[#64748B] shrink-0">
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
                        <strong className="font-semibold text-[#EE5426] tabular-nums text-end min-w-0 leading-snug">
                          {pendingTicketRequest.tripStartTime}
                        </strong>
                      </div>
                    )}

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-[#64748B]">
                        {tText(
                          {
                            en: 'Guests',
                            ar: 'الأفراد',
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
                          ? ` · ${pendingTicketRequest.infants} ${receiptLabels.infantsUnit}`
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
                            {snap.isFixedGroupPrice
                              ? tText(
                                  {
                                    en: `Fixed rate (${fixedPriceUnitLabel})`,
                                    ar: `سعر ثابت (${fixedPriceUnitLabel})`,
                                    de: `Festpreis (${fixedPriceUnitLabel})`,
                                  },
                                  lang
                                )
                              : `${receiptLabels.adultsUnit} (${pendingTicketRequest.adults} × ${formatLinePrice(snap.adultUnitEur)})`}
                          </span>
                          <span className="font-semibold text-[#0F2233]">
                            {formatLinePrice(snap.adultsSubtotalEur)}
                          </span>
                        </div>

                        {pendingTicketRequest.children > 0 && !snap.isFixedGroupPrice && (
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
                    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                    <button
                      type="button"
                      onClick={handleConfirmTicket}
                      disabled={bookingSaving}
                      aria-busy={bookingSaving}
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
                              en: 'REQUEST SAVED, PENDING REVIEW',
                              ar: 'تم حفظ الطلب، قيد المراجعة',
                              de: 'ANFRAGE GESPEICHERT, IN PRÜFUNG',
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
                            en: 'Your request is saved, confirmation will follow after review',
                            ar: 'تم تسجيل طلبك، التأكيد ورسالة التفاصيل بعد المراجعة',
                            de: 'Ihre Anfrage ist gespeichert, die Bestätigung folgt nach Prüfung',
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
                            en: 'Your request is saved. Our team will review it and contact you with the details. A delayed email does not mean your request failed.',
                            ar: 'طلبك محفوظ. سيراجعه فريقنا ويتواصل معك بالتفاصيل. تأخر رسالة البريد لا يعني فشل تسجيل الطلب.',
                            de: 'Ihre Anfrage ist gespeichert. Unser Team prüft sie und meldet sich mit den Details. Eine verzögerte E-Mail ändert daran nichts.',
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
                      <div className="py-2 flex items-start justify-between gap-3">
                        <span className="text-[#64748B] shrink-0">
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
                        <strong className="font-semibold text-[#EE5426] tabular-nums text-end min-w-0 leading-snug">
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
                        {(confirmedRequest.infants ?? 0) > 0 ? ` + ${confirmedRequest.infants} ${receiptLabels.infantsUnit}` : ''}
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
                            {snap.isFixedGroupPrice
                              ? tText(
                                  {
                                    en: `Fixed rate (${fixedPriceUnitLabel})`,
                                    ar: `سعر ثابت (${fixedPriceUnitLabel})`,
                                    de: `Festpreis (${fixedPriceUnitLabel})`,
                                  },
                                  lang
                                )
                              : `${receiptLabels.adultsUnit} (${confirmedRequest.adults} × ${formatLinePrice(snap.adultUnitEur)})`}
                          </span>
                          <span className="font-semibold text-[#0F2233]">
                            {formatLinePrice(snap.adultsSubtotalEur)}
                          </span>
                        </div>
                        {confirmedRequest.children > 0 && !snap.isFixedGroupPrice && (
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
                              en: 'We are preparing your exact hotel pickup time now, your printable boarding voucher unlocks automatically as soon as dispatch assigns your driver.',
                              ar: 'نقوم الآن بتجهيز موعد الاستلام الدقيق من فندقك، وستفتح التذكرة القابلة للطباعة تلقائياً فور تحديد السائق وموعد التحرك.',
                              de: 'Wir bereiten Ihre genaue Hotelabholzeit vor, Ihr druckbarer Voucher wird automatisch freigeschaltet, sobald Ihr Fahrer zugewiesen ist.',
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
                                  en: 'Your request is saved. Confirmation will follow after review. You can also contact us on WhatsApp.',
                                  ar: 'طلبك محفوظ والتأكيد بعد المراجعة. يمكنك أيضاً التواصل معنا عبر واتساب.',
                                  de: 'Ihre Anfrage ist gespeichert. Die Bestätigung folgt nach Prüfung. Sie können uns auch per WhatsApp kontaktieren.',
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
                {/* Card header: from-price, unified rating, one trust line */}
                <div className="border-b border-[#C8C2B8]/60 pb-3 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="tabular-nums">
                      {isFixedGroupPrice ? (
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                          <span className="font-display text-xl font-bold text-[#0F2233]">
                            {formatTripLockupPrice(activeUnitPrice, currency, lang, currency !== 'EUR')}
                          </span>
                          <span className="text-xs font-medium text-[#64748B]">
                            · {fixedPriceUnitLabel}
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="text-[11px] font-medium text-[#64748B]">
                            {tText({ en: 'From', ar: 'يبدأ من', de: 'Ab' }, lang)}{' '}
                          </span>
                          <span className="font-display text-xl font-bold text-[#0F2233]">
                            {formatPrice(activeUnitPrice)}
                          </span>
                          <span className="text-[11px] font-medium text-[#64748B]">
                            {' '}· {tText({ en: 'per adult', ar: 'للبالغ', de: 'pro Erw.' }, lang)}
                          </span>
                        </>
                      )}
                    </div>
                    {hasVisibleRating && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2233] tabular-nums">
                        <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                        {trip.rating.toFixed(1)} ({trip.reviewCount}{' '}
                        {tText({ en: 'reviews', ar: 'تقييم', de: 'Bewertungen' }, lang)})
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] font-medium text-[#475569]">
                    {tText(
                      {
                        en: 'Free cancellation up to 24 hours before the trip start time shown on your booking. Cancellations within 24 hours of the start time are charged at the full trip price. On the Marsa Alam trips, marine park permits are arranged in advance and are not refundable once issued.',
                        ar: 'إلغاء مجاني حتى 24 ساعة قبل موعد بداية الرحلة المكتوب في حجزك. الإلغاء خلال آخر 24 ساعة قبل البداية يُحسب بسعر الرحلة الكامل. في رحلات مرسى علم، تصاريح المحمية البحرية تُجهَّز مقدمًا ولا تُسترد بعد إصدارها.',
                        de: 'Kostenlose Stornierung bis 24 Stunden vor der auf Ihrer Buchung angegebenen Startzeit der Tour. Bei einer Stornierung innerhalb von 24 Stunden vor der Startzeit wird der volle Tourpreis berechnet. Bei den Touren nach Marsa Alam gilt: Genehmigungen für den Meerespark werden im Voraus beschafft und sind nach Ausstellung nicht erstattungsfähig.',
                      },
                      lang
                    )}
                    {' · '}
                    {tText(
                      {
                        en: 'Confirmation via WhatsApp',
                        ar: 'التأكيد عبر واتساب',
                        de: 'Bestätigung per WhatsApp',
                      },
                      lang
                    )}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold">
                    <span className={bookingStep === 1 ? 'text-[#EE5426]' : 'text-[#64748B]'}>
                      1 ·{' '}
                      {tText(
                        { en: 'Check availability', ar: 'التحقق من التوفر', de: 'Verfügbarkeit prüfen' },
                        lang
                      )}
                    </span>
                    <span className="flex-1 border-t border-[#C8C2B8]/70" aria-hidden="true" />
                    <span className={bookingStep === 2 ? 'text-[#EE5426]' : 'text-[#64748B]'}>
                      2 ·{' '}
                      {tText({ en: 'Your details', ar: 'بياناتك', de: 'Ihre Daten' }, lang)}
                    </span>
                  </div>
                </div>

                {bookingStep === 1 ? (
                  <>
                    {trip.options && trip.options.length === 1 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-[#0F2233]">
                          {t.modalOptionsLabel}
                        </span>
                        <p className="rounded-lg border border-[#C8C2B8]/70 bg-[#F8FAFC] px-3.5 py-2.5 text-sm font-medium text-[#0F2233]">
                          {tText(trip.options[0].title, lang)} ·{' '}
                          {formatLinePrice(trip.options[0].price)}
                        </p>
                      </div>
                    )}

                    {trip.options && trip.options.length > 1 && (
                      <div className="space-y-2" role="radiogroup" aria-label={t.modalOptionsLabel}>
                        <span className="text-xs font-semibold text-[#0F2233]">
                          {t.modalOptionsLabel}
                        </span>
                        {trip.options.map((opt) => {
                          const isSelected = selectedOption?.id === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setSelectedOptionId(opt.id);
                                if (startTimeOptions.length > 1) {
                                  const optLower = `${opt.id} ${opt.title.en}`.toLowerCase();
                                  const matchedSlot = startTimeOptions.find((s) => {
                                    const sl = s.toLowerCase();
                                    return (
                                      (optLower.includes('morning') && sl.includes('morning')) ||
                                      (optLower.includes('sunset') && sl.includes('sunset'))
                                    );
                                  });
                                  if (matchedSlot) setSelectedDepartureTime(matchedSlot);
                                }
                              }}
                              className={`w-full text-start rounded-xl border p-3 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                isSelected
                                  ? 'border-[#EE5426] bg-[#FFF7ED]/60 ring-1 ring-[#EE5426]/40'
                                  : 'border-[#C8C2B8]/70 bg-white hover:border-[#94A3B8]'
                              }`}
                            >
                              <span className="space-y-0.5 min-w-0">
                                <span className="flex items-center gap-2">
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
                                </span>
                                {opt.detail && (
                                  <span className="block text-xs text-[#475569] ps-6 leading-relaxed">
                                    {tText(opt.detail, lang)}
                                  </span>
                                )}
                              </span>
                              <span className="shrink-0 text-end">
                                <span className="block text-sm font-bold text-[#0F2233] tabular-nums">
                                  {formatLinePrice(opt.price)}
                                </span>
                                <span className="block text-[10px] font-medium text-[#64748B]">
                                  {isFixedGroupPrice
                                    ? fixedPriceUnitLabel
                                    : tText({ en: 'per adult', ar: 'للبالغ', de: 'pro Erw.' }, lang)}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label htmlFor="trip-booking-date" className="text-xs font-semibold text-[#0F2233]">
                          {tText({ en: 'Date', ar: 'التاريخ', de: 'Datum' }, lang)}
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
                        className={`min-h-[48px] w-full rounded-lg border bg-white px-3.5 text-sm text-[#0F2233] focus:outline-none tabular-nums ${
                          !isSelectedDateOperating
                            ? 'border-[#DC2626] focus:border-[#DC2626]'
                            : 'border-[#C8C2B8] focus:border-[#EE5426]'
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
                          <span className="text-[11px] font-medium text-[#475569]">
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
                          className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
                        />
                      </label>
                    ) : startTimeOptions.length > 1 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#0F2233]">
                            {tText({ en: 'Time', ar: 'الوقت', de: 'Uhrzeit' }, lang)}
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
                        <div className="grid grid-cols-2 gap-2">
                          {startTimeOptions.map((slot) => {
                            const activeSlot = (selectedDepartureTime || startTimeOptions[0]) === slot;
                            const fullLabel = formatSlotLabel(slot, lang);
                            const labelMatch = fullLabel.match(/^(.*?)\s*\((.*)\)\s*$/);
                            const timePart = labelMatch ? labelMatch[1] : fullLabel;
                            const notePart = labelMatch ? labelMatch[2] : '';
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  setSelectedDepartureTime(slot);
                                  if (trip.options && trip.options.length > 1) {
                                    const slotLower = slot.toLowerCase();
                                    const matchedOpt = trip.options.find((o) => {
                                      const ol = `${o.id} ${o.title.en}`.toLowerCase();
                                      return (
                                        (slotLower.includes('morning') && ol.includes('morning')) ||
                                        (slotLower.includes('sunset') && ol.includes('sunset'))
                                      );
                                    });
                                    if (matchedOpt) setSelectedOptionId(matchedOpt.id);
                                  }
                                }}
                                aria-pressed={activeSlot}
                                className={`min-h-[52px] rounded-xl border px-2 py-1.5 transition-all cursor-pointer tabular-nums flex flex-col items-center justify-center ${
                                  activeSlot
                                    ? 'border-[#EE5426] bg-[#FFF7ED] ring-1 ring-[#EE5426]/40'
                                    : 'border-[#C8C2B8] bg-white hover:border-[#EE5426]'
                                }`}
                              >
                                <span className="text-[13px] font-bold text-[#0F2233] leading-tight">
                                  {timePart}
                                </span>
                                {notePart && (
                                  <span className="text-[10.5px] font-medium text-[#64748B] leading-tight">
                                    {notePart}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : startTimeOptions[0] ? (
                      <div className="rounded-xl border border-[#C8C2B8]/60 bg-[#F8FAFC] px-3.5 py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="block text-[11px] font-semibold text-[#0F2233]">
                            {tText(
                              {
                                en: 'Trip Start Time',
                                ar: 'توقيت بداية الرحلة',
                                de: 'Offizielle Startzeit',
                              },
                              lang
                            )}
                          </span>
                          <span className="block text-[11px] text-[#64748B] leading-snug">
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
                        <span className="shrink-0 font-bold text-xs text-[#0F2233] tabular-nums whitespace-nowrap">
                          {formatSlotLabel(startTimeOptions[0], lang)}
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#C8C2B8]/60 bg-[#F8FAFC] px-3.5 py-3 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#0F2233]">
                          {tText(
                            {
                              en: 'Trip Start Time',
                              ar: 'توقيت بداية الرحلة',
                              de: 'Offizielle Startzeit',
                            },
                            lang
                          )}
                        </span>
                        <p className="text-xs font-bold text-[#0F2233] leading-snug break-words">
                          {scheduleSummary}
                        </p>
                        <span className="block text-[11px] text-[#64748B] leading-snug">
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
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-3 py-2 border-b border-[#C8C2B8]/40">
                        <div>
                          <span className="block text-sm font-semibold text-[#0F2233]">{t.modalAdults}</span>
                          <span className="block text-[11px] text-[#64748B] tabular-nums">
                            {isFixedGroupPrice
                              ? tText(
                                  {
                                    en: 'Included in fixed price',
                                    ar: 'مشمول في السعر الثابت',
                                    de: 'Im Festpreis enthalten',
                                  },
                                  lang
                                )
                              : formatLinePrice(activeUnitPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAdults((a) => Math.max(1, a - 1))}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8C2B8] bg-white text-[#0F2233] hover:border-[#EE5426] cursor-pointer"
                            aria-label="Decrease adults"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-bold tabular-nums min-w-[18px] text-center">{safeAdults}</span>
                          <button
                            type="button"
                            disabled={atMaxGuestCapacity}
                            onClick={() =>
                              setAdults((a) =>
                                atMaxGuestCapacity ? a : Math.min(maxGuestsLimit ?? 12, a + 1)
                              )
                            }
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8C2B8] bg-white text-[#0F2233] hover:border-[#EE5426] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase adults"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 py-2 border-b border-[#C8C2B8]/40">
                        <div>
                          <span className="block text-sm font-semibold text-[#0F2233]">{t.modalChildren}</span>
                          <span className="block text-[11px] text-[#64748B] tabular-nums">
                            {isFixedGroupPrice ? (
                              tText(
                                {
                                  en: 'Included in fixed price',
                                  ar: 'مشمول في السعر الثابت',
                                  de: 'Im Festpreis enthalten',
                                },
                                lang
                              )
                            ) : childPrice === 0 ? (
                              <span className="font-semibold text-[#15803D]">{receiptLabels.freeLabel}</span>
                            ) : (
                              formatLinePrice(childPrice)
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setChildren((c) => Math.max(0, c - 1))}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8C2B8] bg-white text-[#0F2233] hover:border-[#EE5426] cursor-pointer"
                            aria-label="Decrease children"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-bold tabular-nums min-w-[18px] text-center">{children}</span>
                          <button
                            type="button"
                            disabled={atMaxGuestCapacity}
                            onClick={() =>
                              setChildren((c) =>
                                atMaxGuestCapacity ? c : Math.min(maxGuestsLimit ?? 10, c + 1)
                              )
                            }
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8C2B8] bg-white text-[#0F2233] hover:border-[#EE5426] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase children"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 py-2">
                        <div>
                          <span className="block text-sm font-semibold text-[#0F2233]">
                            {tText({ en: 'Infants', ar: 'الرضع', de: 'Kleinkinder' }, lang)}
                          </span>
                          <span className="block text-[11px] font-semibold text-[#15803D]">
                            {tText({ en: 'Free', ar: 'مجاناً', de: 'Kostenlos' }, lang)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setInfants((i) => Math.max(0, i - 1))}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8C2B8] bg-white text-[#0F2233] hover:border-[#EE5426] cursor-pointer"
                            aria-label="Decrease infants"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-bold tabular-nums min-w-[18px] text-center">{infants}</span>
                          <button
                            type="button"
                            disabled={atMaxGuestCapacity}
                            onClick={() =>
                              setInfants((i) =>
                                atMaxGuestCapacity ? i : Math.min(maxGuestsLimit ?? 10, i + 1)
                              )
                            }
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8C2B8] bg-white text-[#0F2233] hover:border-[#EE5426] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase infants"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="pt-1 text-xs font-medium text-[#64748B] tabular-nums">
                        {trip.category === 'sea'
                          ? tText({ en: 'Total passengers:', ar: 'إجمالي الركاب:', de: 'Gesamtpassagiere:' }, lang)
                          : tText({ en: 'Total travelers:', ar: 'إجمالي المسافرين:', de: 'Reisende gesamt:' }, lang)}{' '}
                        <strong className="font-bold text-[#0F2233]">
                          {totalHeadcount} {receiptLabels.paxWord}
                        </strong>
                        {maxGuestsLimit !== null && (
                          <span className="text-[#475569]">
                            {' '}·{' '}
                            {tText(
                              {
                                en: `max ${maxGuestsLimit} guests`,
                                ar: `بحد أقصى ${maxGuestsLimit} ضيوف`,
                                de: `max. ${maxGuestsLimit} Gäste`,
                              },
                              lang
                            )}
                          </span>
                        )}
                      </p>
                    </div>

                    {hasOuterZoneTransfer && trip.destination === 'Hurghada' && (
                      <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-[#0F2233]">
                          {tText(
                            { en: 'Pickup area', ar: 'منطقة الاستلام', de: 'Abholgebiet' },
                            lang
                          )}
                        </span>
                        <select
                          value={transferZoneId}
                          onChange={(e) => setTransferZoneId(e.target.value)}
                          className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3 text-sm font-medium text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                        >
                          {OUTER_TRANSFER_ZONES.map((z) => (
                            <option key={z.id} value={z.id}>
                              {getZoneTransferLabel(
                                z.id,
                                trip.destination,
                                lang,
                                hasOuterZoneTransfer,
                                trip.freeTransferZones
                              )}
                            </option>
                          ))}
                        </select>
                        {zoneFeePerPerson > 0 && (
                          <span className="block text-[11.5px] font-medium text-[#9A3412] tabular-nums">
                            +{formatLinePrice(zoneFeePerPerson)} × {payingGuestsCount} = +
                            {formatLinePrice(transferSurchargeTotal)}{' '}
                            {tText(
                              { en: 'added to your total', ar: 'مضافة إلى إجماليك', de: 'wird zum Gesamtpreis addiert' },
                              lang
                            )}
                          </span>
                        )}
                      </label>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <WaslaHotelMapPicker
                        value={hotel}
                        onChange={setHotel}
                        destination={trip.destination}
                        hasOuterZoneTransfer={hasOuterZoneTransfer}
                        freeTransferZones={trip.freeTransferZones}
                        transferZoneId={transferZoneId}
                        onAutoDetectTransferZone={setTransferZoneId}
                        lang={lang}
                        label={t.modalHotelLabel}
                        placeholder={t.modalHotelPlaceholder}
                      />
                      <div className="space-y-1 pt-0.5">
                        <p className="text-xs font-medium text-[#475569] leading-snug">
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
                        className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3.5 text-sm text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
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
                          className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none tabular-nums"
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
                          className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
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
                        className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3.5 text-sm font-medium text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                      >
                        <option value="English">English</option>
                        <option value="German">Deutsch (German)</option>
                        <option value="French">Français (French)</option>
                        <option value="Italian">Italiano (Italian)</option>
                        <option value="Spanish">Español (Spanish)</option>
                        <option value="Dutch">Nederlands (Dutch)</option>
                        <option value="Polish">Polski (Polish)</option>
                        <option value="Russian">Русский (Russian)</option>
                      </select>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={whatsappOptIn}
                        onChange={(e) => setWhatsappOptIn(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#16A34A]"
                      />
                      <span className="text-[11.5px] leading-relaxed text-[#64748B]">
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

                    {!isMarsaAlamTrip && (
                      <button
                        type="button"
                        onClick={() => setExtrasOpen((o) => !o)}
                        aria-expanded={extrasOpen}
                        className="text-xs font-semibold text-[#EE5426] hover:underline cursor-pointer"
                      >
                        {extrasOpen ? '− ' : '+ '}
                        {tText(
                          {
                            en: 'Add room no. / promo code / notes',
                            ar: 'إضافة رقم الغرفة / كود الخصم / ملاحظات',
                            de: 'Zimmernr. / Aktionscode / Hinweise hinzufügen',
                          },
                          lang
                        )}
                      </button>
                    )}

                    {(extrasOpen || isMarsaAlamTrip) && (
                      <div className="space-y-4">
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
                              className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3.5 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none tabular-nums"
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
                              className="min-h-[48px] w-full rounded-lg border border-[#C8C2B8] bg-white px-3.5 text-sm font-mono uppercase text-[#0F2233] placeholder:font-sans placeholder:normal-case placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
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
                            className="w-full rounded-lg border border-[#C8C2B8] bg-white p-3 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}

                {error && (
                  <p role="alert" className="rounded-lg bg-[#FDF2F2] border border-[#EBC6C6] px-3.5 py-2.5 text-xs font-medium text-[#8A2424]">
                    {error}
                  </p>
                )}

                {/* Card footer: total + receipt details toggle + main action */}
                <div className="border-t border-[#C8C2B8]/60 pt-3.5 space-y-3">
                  <button
                    type="button"
                    onClick={() => setReceiptOpen((o) => !o)}
                    aria-expanded={receiptOpen}
                    className="flex w-full items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-[#0F2233]">
                      {receiptLabels.totalLabel}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-display text-xl font-bold text-[#0F2233] tabular-nums">
                        {formatPrice(totalEur)}
                      </span>
                      <span className="text-[11px] font-semibold text-[#EE5426]">
                        {tText({ en: 'details', ar: 'التفاصيل', de: 'Details' }, lang)}{' '}
                        {receiptOpen ? '▴' : '▾'}
                      </span>
                    </span>
                  </button>

                  {receiptOpen && (
                    <div className="rounded-xl border border-[#C8C2B8]/60 bg-[#F8FAFC] overflow-hidden">
                      <div className="px-4 py-3 bg-white border-b border-[#C8C2B8]/60 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#0F2233]">
                          {receiptLabels.summaryHeader}
                        </span>
                        <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
                          {totalHeadcount} {receiptLabels.paxWord} · {safeAdults}A
                          {safeChildren > 0 ? ` + ${safeChildren}C` : ''}
                          {safeInfants > 0 ? ` + ${safeInfants} ${receiptLabels.infantsUnit}` : ''}
                        </span>
                      </div>

                      <div className="px-4 py-3.5 space-y-2 text-xs tabular-nums">
                        {selectedOption && (
                          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-[#C8C2B8]/50">
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
                          <span className="font-semibold text-[#0F2233] text-end min-w-0 leading-snug break-words">
                            {resolvedTripStartTime}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#475569]">
                            {isFixedGroupPrice
                              ? tText(
                                  {
                                    en: `Fixed rate (${fixedPriceUnitLabel})`,
                                    ar: `سعر ثابت (${fixedPriceUnitLabel})`,
                                    de: `Festpreis (${fixedPriceUnitLabel})`,
                                  },
                                  lang
                                )
                              : `${receiptLabels.adultsUnit} (${safeAdults} × ${formatLinePrice(activeUnitPrice)})`}
                          </span>
                          <span className="font-semibold text-[#0F2233]">
                            {formatLinePrice(adultsSubtotalEur)}
                          </span>
                        </div>

                        {!isFixedGroupPrice && (
                          safeChildren > 0 ? (
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
                                {childPrice === 0
                                  ? receiptLabels.freeLabel
                                  : `${formatLinePrice(childPrice)} / ${tText({ en: 'child', ar: 'طفل', de: 'Kind' }, lang)}`}
                              </span>
                            </div>
                          )
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

                      <div className="px-4 py-3 bg-white border-t border-dashed border-[#C8C2B8] flex items-center justify-between gap-3">
                        <div>
                          <span className="block text-xs font-semibold text-[#0F2233]">
                            {receiptLabels.totalLabel}
                          </span>
                          <span className="block text-[11px] text-[#64748B]">{t.modalPayAfter}</span>
                        </div>
                        <span className="text-xl font-bold text-[#0F2233] tabular-nums shrink-0">
                          {formatPrice(totalEur)}
                        </span>
                      </div>
                    </div>
                  )}

                  {bookingStep === 1 ? (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={handleAdvanceToDetails}
                        className="min-h-[52px] w-full rounded-xl bg-[#EE5426] hover:bg-[#D9461B] px-6 text-sm font-bold text-white transition-colors cursor-pointer"
                      >
                        {tText(
                          { en: 'Check availability', ar: 'التحقق من التوفر', de: 'Verfügbarkeit prüfen' },
                          lang
                        )}
                      </button>
                      <p className="text-[11px] font-medium text-[#64748B] text-center leading-tight">
                        {bookNowMicrocopy}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <button
                          type="submit"
                          className="min-h-[52px] w-full rounded-xl bg-[#EE5426] hover:bg-[#D9461B] px-6 text-sm font-bold text-white transition-colors cursor-pointer"
                        >
                          {previewMode ? 'Preview Booking Ticket' : t.modalSubmitBooking}
                        </button>
                        <p className="text-[11px] font-medium text-[#64748B] text-center leading-tight">
                          {bookNowMicrocopy}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingStep(1)}
                        className="w-full text-center text-xs font-semibold text-[#475569] hover:text-[#EE5426] transition-colors cursor-pointer"
                      >
                        ←{' '}
                        {tText(
                          { en: 'Back to date & travelers', ar: 'العودة للتاريخ والمسافرين', de: 'Zurück zu Datum & Reisenden' },
                          lang
                        )}
                      </button>
                    </>
                  )}

                  <div className="space-y-1.5 pt-0.5">
                    {hasOuterZoneTransfer && (
                      <p className="text-[11px] leading-relaxed text-[#64748B]">
                        {t.modalTransferZoneNotice}
                      </p>
                    )}
                    <p className="text-xs font-medium leading-relaxed text-[#475569]">
                      {tText(
                        {
                          en: 'Pickup time and location will be sent to you the day before the trip at 6:00 PM.',
                          ar: 'سيتم إرسال موعد ومكان الاستلام (البيك أب) إليك في اليوم السابق للرحلة الساعة 6:00 مساءً.',
                          de: 'Abholzeit und Abholort werden Ihnen am Tag vor dem Ausflug um 18:00 Uhr zugeschickt.',
                        },
                        lang
                      )}
                    </p>
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
            hideReviewPrompt
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
                        alt={tripDisplayName(rel, lang)}
                        className="h-full w-full group-hover:scale-[1.04] transition-transform duration-300"
                        placeholderLabel={tripDisplayName(rel, lang)}
                      />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748B] tabular-nums">
                        <span>{rel.destination} · {tText(rel.duration, lang)}</span>
                        {rel.reviewCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-[#0F2233]">
                            <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                            {rel.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#0F2233] line-clamp-2 group-hover:text-[#EE5426] transition-colors">
                        {tripDisplayName(rel, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-[#C8C2B8]/40 px-3.5 py-2.5 flex items-center justify-between text-xs tabular-nums">
                    <span className="font-bold text-[#0F2233]">
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
              <span className="block text-lg font-bold text-[#0F2233] leading-tight">
                {formatLinePrice(totalEur)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => jumpToSection('trip-booking-form')}
                className="btn-wasla-primary min-h-[44px] rounded-full px-6 py-2 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
              >
                {t.bookNow}
              </button>
              <span className="text-[10px] text-[#64748B] leading-tight text-end">
                {bookNowMicrocopy}
              </span>
            </div>
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
