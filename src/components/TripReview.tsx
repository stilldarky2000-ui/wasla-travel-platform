import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Lang } from '../data/i18n';
import { Trip, tText } from '../data/marketplaceData';
import { INITIAL_BOOKINGS, INITIAL_TRIP_REVIEWS, TripReviewRecord } from '../data/platformData';
import {
  BookingVerificationStatus,
  SafeStorefrontBookingRef,
  markBookingIdLocallyReviewed,
  sanitizeBookingId,
  useBookingReviewVerification,
  useStorefrontTripBookingHandoff,
} from '../hooks/useBookingReviewVerification';
import { OperationType, db, handleFirestoreError } from '../lib/firebase';
import { WaslaBrandMark } from './WaslaBrandMark';

interface TripReviewProps {
  trip: Trip;
  lang: Lang;
  previewMode?: boolean;
  bookingStatusById?: Record<string, string>;
  storefrontBookingRefs?: SafeStorefrontBookingRef[];
  onOpenReviewModal?: (bookingId?: string) => void;
}

interface PostTripReviewModalProps {
  open: boolean;
  trip: Trip;
  lang: Lang;
  initialBookingId?: string;
  bookingStatusById?: Record<string, string>;
  previewMode?: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const REVIEW_COPY: Record<
  'en' | 'ar' | 'de',
  {
    heading: string;
    reviewsWord: string;
    reviewSingular: string;
    postTripPrompt: string;
    writeBtn: string;
    cancelBtn: string;
    loading: string;
    emptyTitle: string;
    emptySub: string;
    formTitle: string;
    formSubtitle: string;
    ratingLabel: string;
    bookingRefLabel: string;
    bookingRefPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    countryLabel: string;
    countryPlaceholder: string;
    dateLabel: string;
    photoLabel: string;
    photoHint: string;
    photoUploadBtn: string;
    photoChangeBtn: string;
    photoRemoveBtn: string;
    photoTooLargeErr: string;
    commentLabel: string;
    commentPlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
    approvalHint: string;
    submittedTitle: string;
    submittedDesc: string;
    validationBookingRef: string;
    bookingNotFoundErr: string;
    bookingWrongTripErr: string;
    bookingNotConfirmedErr: string;
    bookingNotFinishedErr: string;
    bookingAlreadyReviewedErr: string;
    bookingCheckingLabel: string;
    bookingVerifiedReadyLabel: string;
    bookingConfirmedReadyLabel: string;
    detectedReadyBadge: string;
    detectedPendingBadge: string;
    validationName: string;
    validationComment: string;
    catalogPendingErr: string;
    previewBlockedNotice: string;
    loadError: string;
    verifiedBookingBadge: string;
  }
> = {
  en: {
    heading: 'Guest ratings & photos',
    reviewsWord: 'reviews',
    reviewSingular: 'review',
    postTripPrompt: 'Already finished this trip?',
    writeBtn: 'Leave post-trip review & photo',
    cancelBtn: 'Cancel',
    loading: 'Loading guest testimonials...',
    emptyTitle: 'No published reviews for this trip yet',
    emptySub: 'Reviews and guest photos appear here once travelers complete their trip and the owner approves them.',
    formTitle: 'Post-Trip Review & Photo',
    formSubtitle: 'Review-only form — no booking options needed.',
    ratingLabel: 'Your rating',
    bookingRefLabel: 'Completed Booking Ref (Required)',
    bookingRefPlaceholder: 'e.g. WT-416',
    nameLabel: 'Your name',
    namePlaceholder: 'e.g. Hannah L.',
    countryLabel: 'Country (optional)',
    countryPlaceholder: 'e.g. Germany',
    dateLabel: 'Trip date',
    photoLabel: 'Add a photo from your trip (optional)',
    photoHint: 'Upload a favorite photo from your excursion, boat, or guide.',
    photoUploadBtn: 'Upload photo',
    photoChangeBtn: 'Change photo',
    photoRemoveBtn: 'Remove',
    photoTooLargeErr: 'Could not process that image. Please choose a smaller JPEG or PNG photo.',
    commentLabel: 'Your review',
    commentPlaceholder: 'Share pickup punctuality, guide quality, boat or vehicle comfort...',
    submitBtn: 'Submit Review',
    submittingBtn: 'Submitting review...',
    approvalHint:
      'Only unlocks for confirmed/completed Wasla bookings AFTER the trip has ended. Submitted directly to Wasla management to Approve or Reject.',
    submittedTitle: 'Review submitted for approval',
    submittedDesc:
      'Thank you! Your review & photo were sent to our team and will go live once approved.',
    validationBookingRef: 'Please enter your confirmed Wasla Booking Reference ID (e.g. WT-416).',
    bookingNotFoundErr:
      'Booking reference not found. Only guests who booked with Wasla Travel can leave a post-trip review.',
    bookingWrongTripErr: 'This booking reference belongs to a different excursion.',
    bookingNotConfirmedErr:
      'Only confirmed or completed bookings can leave a review after the trip finishes.',
    bookingNotFinishedErr:
      'This button unlocks only AFTER your trip finishes. Please come back once your excursion ends.',
    bookingAlreadyReviewedErr: 'A post-trip review has already been submitted for this booking reference.',
    bookingCheckingLabel: 'Verifying booking reference against Wasla records...',
    bookingVerifiedReadyLabel: 'Verified completed booking — ready for post-trip review',
    bookingConfirmedReadyLabel: 'Confirmed post-trip booking matched for this excursion',
    detectedReadyBadge: 'Eligible booking detected:',
    detectedPendingBadge: 'Booking logged — review unlocks after your trip ends',
    validationName: 'Please enter your name.',
    validationComment: 'Please write at least 5 characters for your review.',
    catalogPendingErr:
      'Storefront database is still syncing. Please try submitting again shortly.',
    previewBlockedNotice: 'Review submission is disabled in Preview mode.',
    loadError: 'Could not load live reviews right now.',
    verifiedBookingBadge: 'Verified booking',
  },
  ar: {
    heading: 'تقييمات وصور المسافرين',
    reviewsWord: 'تقييمات',
    reviewSingular: 'تقييم',
    postTripPrompt: 'هل أتممت هذه الرحلة بالفعل؟',
    writeBtn: 'أضف تقييمك وصورة بعد الرحلة',
    cancelBtn: 'إلغاء',
    loading: 'جاري تحميل آراء المسافرين...',
    emptyTitle: 'لا توجد تقييمات منشورة لهذه الرحلة بعد',
    emptySub: 'تظهر التقييمات والصور هنا فور انتهاء رحلة المسافر وموافقة الإدارة على نشرها.',
    formTitle: 'تقييم الرحلة وإضافة صورة',
    formSubtitle: 'صفحة مخصصة للتقييم فقط — بدون أي اختيارات حجز.',
    ratingLabel: 'تقييمك بالنجوم',
    bookingRefLabel: 'رقم مرجع الحجز المنتهي (إجباري)',
    bookingRefPlaceholder: 'مثال: WT-416',
    nameLabel: 'الاسم',
    namePlaceholder: 'مثال: كريم م.',
    countryLabel: 'الدولة (اختياري)',
    countryPlaceholder: 'مثال: مصر / ألمانيا',
    dateLabel: 'تاريخ الرحلة',
    photoLabel: 'ارفع صورة من رحلتك (اختياري)',
    photoHint: 'يمكنك رفع صورة التقطتها أثناء الرحلة أو مع القائد/المركب.',
    photoUploadBtn: 'رفع صورة',
    photoChangeBtn: 'تغيير الصورة',
    photoRemoveBtn: 'حذف',
    photoTooLargeErr: 'تعذر معالجة هذه الصورة، يرجى اختيار صورة أصغر.',
    commentLabel: 'تقييمك للرحلة',
    commentPlaceholder: 'شاركنا رأيك في دقة المواعيد، المرشد، القارب أو السيارة...',
    submitBtn: 'إرسال التقييم',
    submittingBtn: 'جاري إرسال التقييم...',
    approvalHint:
      'يُفتح هذا النموذج فقط بعد انتهاء الرحلة المؤكدة، ويصل تقييمك وصورتك إلينا مباشرة للمراجعة والموافقة قبل النشر.',
    submittedTitle: 'تم إرسال تقييمك للمراجعة بنجاح',
    submittedDesc:
      'شكراً لك! وصل تقييمك وصورتك لإدارة وصلة ترافل وسيظهر على صفحة الرحلة فور اعتماده.',
    validationBookingRef: 'يرجى إدخال رقم مرجع الحجز بعد انتهاء الرحلة (مثال: WT-416).',
    bookingNotFoundErr:
      'رقم الحجز غير موجود. التقييم متاح فقط للعملاء الذين حجزوا معنا بعد انتهاء رحلتهم.',
    bookingWrongTripErr: 'رقم الحجز هذا خاص برحلة أخرى.',
    bookingNotConfirmedErr:
      'التقييم يُفتح فقط للحجوزات المؤكدة والمكتملة بعد انتهاء الرحلة.',
    bookingNotFinishedErr:
      'يُفتح التقييم فقط بعد انتهاء موعد رحلتك. ننتظر رأيك وصورك بعد العودة!',
    bookingAlreadyReviewedErr: 'تم إرسال تقييم مسبقاً لرقم الحجز هذا.',
    bookingCheckingLabel: 'جاري التحقق من رقم الحجز في سجلات وصلة...',
    bookingVerifiedReadyLabel: 'حجز مكتمل وموثّق — جاهز لإضافة تقييم ما بعد الرحلة',
    bookingConfirmedReadyLabel: 'تم التحقق من مطابقة الحجز المؤكد لهذه الرحلة',
    detectedReadyBadge: 'حجز مؤهل للتقييم:',
    detectedPendingBadge: 'الحجز مسجل — يُفتح التقييم بعد انتهاء موعد الرحلة',
    validationName: 'يرجى كتابة الاسم.',
    validationComment: 'يرجى كتابة 5 أحرف على الأقل في تقييمك.',
    catalogPendingErr: 'جاري مزامنة قاعدة بيانات الرحلات، يرجى المحاولة بعد قليل.',
    previewBlockedNotice: 'إرسال التقييمات معطل أثناء وضع المعاينة.',
    loadError: 'تعذر تحميل التقييمات المباشرة حالياً.',
    verifiedBookingBadge: 'حجز موثّق',
  },
  de: {
    heading: 'Gästebewertungen & Fotos',
    reviewsWord: 'Bewertungen',
    reviewSingular: 'Bewertung',
    postTripPrompt: 'Tour bereits abgeschlossen?',
    writeBtn: 'Bewertung & Foto nach der Tour senden',
    cancelBtn: 'Abbrechen',
    loading: 'Gästebewertungen werden geladen...',
    emptyTitle: 'Noch keine veröffentlichten Bewertungen für diese Tour',
    emptySub: 'Bewertungen und Gästefotos erscheinen nach Abschluss der Tour und Freigabe.',
    formTitle: 'Bewertung & Foto nach der Tour',
    formSubtitle: 'Reines Bewertungsformular — ohne Buchungsoptionen.',
    ratingLabel: 'Ihre Bewertung',
    bookingRefLabel: 'Buchungsreferenz-ID (Erforderlich)',
    bookingRefPlaceholder: 'z.B. WT-416',
    nameLabel: 'Ihr Name',
    namePlaceholder: 'z.B. Hannah L.',
    countryLabel: 'Land (optional)',
    countryPlaceholder: 'z.B. Deutschland',
    dateLabel: 'Reisedatum',
    photoLabel: 'Foto von Ihrer Tour hochladen (optional)',
    photoHint: 'Laden Sie ein Foto von der Tour, dem Boot oder Ihrem Guide hoch.',
    photoUploadBtn: 'Foto hochladen',
    photoChangeBtn: 'Foto ändern',
    photoRemoveBtn: 'Entfernen',
    photoTooLargeErr: 'Dieses Bild konnte nicht verarbeitet werden. Bitte wählen Sie ein kleineres Foto.',
    commentLabel: 'Ihre Bewertung',
    commentPlaceholder: 'Berichten Sie über Abholung, Guide, Boot oder Fahrzeugkomfort...',
    submitBtn: 'Bewertung absenden',
    submittingBtn: 'Wird gesendet...',
    approvalHint:
      'Wird erst NACH Ende der bestätigten Tour freigeschaltet und direkt zur Freigabe an Wasla Travel gesendet.',
    submittedTitle: 'Bewertung zur Freigabe eingereicht',
    submittedDesc:
      'Vielen Dank! Ihre Bewertung und Ihr Foto wurden an unser Team zur Freigabe gesendet.',
    validationBookingRef: 'Bitte geben Sie Ihre bestätigte Buchungsreferenz ein (z.B. WT-416).',
    bookingNotFoundErr:
      'Buchungsreferenz nicht gefunden. Nur Gäste mit Wasla-Buchung können nach Tourende bewerten.',
    bookingWrongTripErr: 'Diese Buchungsnummer gehört zu einer anderen Tour.',
    bookingNotConfirmedErr:
      'Nur bestätigte oder abgeschlossene Buchungen können nach Tourende bewertet werden.',
    bookingNotFinishedErr:
      'Bewertungen werden erst NACH dem Ende Ihrer Tour freigeschaltet.',
    bookingAlreadyReviewedErr: 'Für diese Buchungsnummer wurde bereits eine Bewertung eingereicht.',
    bookingCheckingLabel: 'Buchungsnummer wird automatisch geprüft...',
    bookingVerifiedReadyLabel: 'Abgeschlossene Buchung verifiziert — bereit für Bewertung',
    bookingConfirmedReadyLabel: 'Bestätigte Buchung für diese Tour gefunden',
    detectedReadyBadge: 'Verifizierte Buchung erkannt:',
    detectedPendingBadge: 'Buchung erfasst — Bewertung nach Tourende verfügbar',
    validationName: 'Bitte geben Sie Ihren Namen ein.',
    validationComment: 'Bitte schreiben Sie mindestens 5 Zeichen.',
    catalogPendingErr: 'Die Datenbank wird noch synchronisiert. Bitte versuchen Sie es später erneut.',
    previewBlockedNotice: 'Im Vorschaumodus können keine Bewertungen abgesendet werden.',
    loadError: 'Live-Bewertungen konnten gerade nicht geladen werden.',
    verifiedBookingBadge: 'Verifizierte Buchung',
  },
};

type ReviewCopyShape = (typeof REVIEW_COPY)['en'];

function getLocalizedReviewCopy(lang: Lang): ReviewCopyShape {
  if (lang === 'en' || lang === 'ar' || lang === 'de') {
    return REVIEW_COPY[lang];
  }
  const result = {} as ReviewCopyShape;
  (Object.keys(REVIEW_COPY.en) as Array<keyof ReviewCopyShape>).forEach((key) => {
    result[key] = tText(
      {
        en: REVIEW_COPY.en[key],
        ar: REVIEW_COPY.ar[key],
        de: REVIEW_COPY.de[key],
      },
      lang
    );
  });
  return result;
}

function getVerificationStatusMessage(
  status: BookingVerificationStatus,
  copy: ReviewCopyShape
): string {
  switch (status) {
    case 'invalid-format':
      return copy.validationBookingRef;
    case 'not-found':
      return copy.bookingNotFoundErr;
    case 'wrong-trip':
      return copy.bookingWrongTripErr;
    case 'not-confirmed':
      return copy.bookingNotConfirmedErr;
    case 'not-finished':
      return copy.bookingNotFinishedErr;
    case 'already-reviewed':
      return copy.bookingAlreadyReviewedErr;
    case 'error':
      return copy.loadError;
    default:
      return '';
  }
}

async function compressReviewPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
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
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let quality = 0.78;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > 220000 && quality > 0.35) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > 240000) {
          reject(new Error('Image too large after compression'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export const PostTripReviewModal: React.FC<PostTripReviewModalProps> = ({
  open,
  trip,
  lang,
  initialBookingId = '',
  bookingStatusById,
  previewMode = false,
  onClose,
  onSubmitted,
}) => {
  const copy = getLocalizedReviewCopy(lang);
  const isRtl = lang === 'ar';
  const todayIso = new Date().toISOString().slice(0, 10);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [bookingIdInput, setBookingIdInput] = useState(() => sanitizeBookingId(initialBookingId));
  const [rating, setRating] = useState<number>(5);
  const [guestName, setGuestName] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [visitDate, setVisitDate] = useState(todayIso);
  const [dateTouched, setDateTouched] = useState(false);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const { cleanBookingId, verification, isChecking, verifyNow } = useBookingReviewVerification({
    tripId: trip.id,
    bookingId: bookingIdInput,
    enabled: open && !previewMode && !submittedNotice,
    bookingStatusById,
  });

  useEffect(() => {
    if (!open) return;
    setBookingIdInput(sanitizeBookingId(initialBookingId));
    setDateTouched(false);
    setVisitDate(todayIso);
    setFormError('');
    setSubmittedNotice(false);
  }, [open, initialBookingId, todayIso]);

  useEffect(() => {
    if (!dateTouched && verification.tripDate && /^\d{4}-\d{2}-\d{2}/.test(verification.tripDate)) {
      setVisitDate(verification.tripDate.slice(0, 10));
    }
  }, [dateTouched, verification.tripDate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError('');
    setPhotoLoading(true);
    try {
      const compressed = await compressReviewPhoto(file);
      setPhotoUrl(compressed);
    } catch {
      setFormError(copy.photoTooLargeErr);
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || photoLoading) return;
    if (previewMode) {
      setFormError(copy.previewBlockedNotice);
      return;
    }

    const sanitizedId = sanitizeBookingId(bookingIdInput);
    const cleanName = guestName.trim().slice(0, 80);
    const cleanCountry = guestCountry.trim().slice(0, 60);
    const cleanComment = comment.trim().slice(0, 800);

    if (sanitizedId.length < 3) {
      setFormError(copy.validationBookingRef);
      return;
    }
    if (!cleanName) {
      setFormError(copy.validationName);
      return;
    }
    if (cleanComment.length < 5) {
      setFormError(copy.validationComment);
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      // Programmatically re-verify the booking receipt right before Firestore write
      const liveCheck = await verifyNow(sanitizedId);

      if (!liveCheck.tripPublishedInCatalog) {
        setFormError(copy.catalogPendingErr);
        return;
      }

      if (!liveCheck.canSubmitReview) {
        const msg = getVerificationStatusMessage(liveCheck.status, copy) || copy.bookingNotFoundErr;
        setFormError(msg);
        return;
      }

      const reviewId = `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const cleanTripTitle = (tText(trip.name, 'en') || trip.id).trim().slice(0, 240);
      const safeDate = (visitDate || liveCheck.tripDate || todayIso).slice(0, 20);

      const payload: Record<string, unknown> = {
        id: reviewId,
        tripId: trip.id,
        bookingId: liveCheck.bookingId,
        // Computed programmatically from verified booking receipt status, never client-supplied
        verifiedBooking: liveCheck.verifiedBooking,
        tripTitle: cleanTripTitle.length >= 2 ? cleanTripTitle : 'Wasla Excursion',
        guestName: cleanName,
        guestCountry: cleanCountry,
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        comment: cleanComment,
        visitDate: safeDate,
        lang,
        approvalStatus: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (photoUrl) {
        payload.photoUrl = photoUrl;
      }

      try {
        await setDoc(doc(db, 'trip_reviews', reviewId), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `trip_reviews/${reviewId}`);
      }

      markBookingIdLocallyReviewed(liveCheck.bookingId);
      setSubmittedNotice(true);
      setBookingIdInput('');
      setGuestName('');
      setGuestCountry('');
      setComment('');
      setPhotoUrl('');
      setRating(5);
      onSubmitted?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : copy.loadError;
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const liveStatusError =
    cleanBookingId.length >= 3 ? getVerificationStatusMessage(verification.status, copy) : '';

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F2233]/70 p-3 sm:p-5 backdrop-blur-xs"
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-trip-review-title"
      onClick={onClose}
    >
      <div
        className="card-wasla p-0 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 bg-gradient-to-r from-[#EE5426] to-[#D9461B] flex items-center justify-between gap-3 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <WaslaBrandMark size="sm" className="ring-white/40" />
            <div className="min-w-0">
              <h2 id="post-trip-review-title" className="font-display text-lg font-semibold leading-tight text-white truncate">
                {copy.formTitle}
              </h2>
              <p className="text-[11px] text-[#FAF4ED]/90 truncate">{tText(trip.name, lang)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.cancelBtn}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
          {submittedNotice ? (
            <div className="space-y-4 py-4">
              <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.submittedTitle}</span>
                </div>
                <p className="text-xs leading-relaxed text-[#166534]">{copy.submittedDesc}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-wasla-primary min-h-[42px] w-full rounded-full px-5 py-2 text-sm cursor-pointer"
              >
                {copy.cancelBtn === 'Cancel' ? 'Done' : copy.cancelBtn === 'إلغاء' ? 'تم' : 'Fertig'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/70 px-3.5 py-2.5 text-xs text-[#475569] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F2233]">
                  <Lock className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                  <span>{copy.formSubtitle}</span>
                </div>
                <p className="leading-relaxed">{copy.approvalHint}</p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#0F2233]">{copy.bookingRefLabel}</span>
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={bookingIdInput}
                      onChange={(e) => setBookingIdInput(sanitizeBookingId(e.target.value))}
                      placeholder={copy.bookingRefPlaceholder}
                      className="min-h-[42px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm font-mono uppercase text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                    />
                  </label>

                  <div className="space-y-1">
                    <span className="block text-xs font-semibold text-[#0F2233]">{copy.ratingLabel}</span>
                    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label={copy.ratingLabel}>
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const active = starVal <= rating;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setRating(starVal)}
                            aria-label={`${starVal} / 5`}
                            aria-checked={rating === starVal}
                            role="radio"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:border-[#F59E0B] transition-colors cursor-pointer"
                          >
                            <Star
                              className={`h-4 w-4 ${active ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#CBD5E1]'}`}
                              aria-hidden="true"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Programmatic Verification Banner */}
                {!previewMode && cleanBookingId && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                      isChecking
                        ? 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]'
                        : verification.status === 'eligible'
                        ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]'
                        : 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                    }`}
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#EE5426]" aria-hidden="true" />
                        <span>{copy.bookingCheckingLabel}</span>
                      </>
                    ) : verification.status === 'eligible' ? (
                      <>
                        <BadgeCheck className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                        <span className="flex-1">
                          {verification.verifiedBooking
                            ? copy.bookingVerifiedReadyLabel
                            : copy.bookingConfirmedReadyLabel}{' '}
                          <strong className="font-mono font-bold tabular-nums">
                            ({verification.bookingId}
                            {verification.tripDate ? ` · ${verification.tripDate}` : ''})
                          </strong>
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
                        <span className="flex-1">{liveStatusError}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">{copy.nameLabel}</span>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={copy.namePlaceholder}
                    className="min-h-[42px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">{copy.countryLabel}</span>
                  <input
                    type="text"
                    maxLength={60}
                    value={guestCountry}
                    onChange={(e) => setGuestCountry(e.target.value)}
                    placeholder={copy.countryPlaceholder}
                    className="min-h-[42px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">{copy.dateLabel}</span>
                  <input
                    type="date"
                    max={todayIso}
                    value={visitDate}
                    onChange={(e) => {
                      setDateTouched(true);
                      setVisitDate(e.target.value);
                    }}
                    className="min-h-[42px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F2233] focus:border-[#EE5426] focus:outline-none tabular-nums"
                  />
                </label>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#0F2233]">{copy.photoLabel}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                {photoUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/50 p-2.5">
                    <img
                      src={photoUrl}
                      alt="Trip upload preview"
                      className="h-16 w-20 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-full border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F2233] hover:border-[#EE5426] cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                        <span>{copy.photoChangeBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="inline-flex items-center gap-1 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{copy.photoRemoveBtn}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={photoLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-xs font-medium text-[#475569] hover:border-[#EE5426] hover:bg-[#FFF7ED]/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                    <span>{photoLoading ? '...' : copy.photoUploadBtn}</span>
                    <span className="text-[11px] text-[#64748B] hidden sm:inline">· {copy.photoHint}</span>
                  </button>
                )}
              </div>

              <label className="block space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F2233]">{copy.commentLabel}</span>
                  <span className="text-[#475569] tabular-nums">{comment.length} / 800</span>
                </div>
                <textarea
                  rows={3}
                  required
                  maxLength={800}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={copy.commentPlaceholder}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
                />
              </label>

              {formError && (
                <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[42px] rounded-full border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:text-[#0F2233] cursor-pointer"
                >
                  {copy.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitting || photoLoading}
                  className="btn-wasla-primary min-h-[42px] rounded-full px-6 py-2 text-xs disabled:opacity-60 transition-all cursor-pointer"
                >
                  {submitting ? copy.submittingBtn : copy.submitBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const TripReview: React.FC<TripReviewProps> = ({
  trip,
  lang,
  previewMode = false,
  bookingStatusById,
  storefrontBookingRefs,
  onOpenReviewModal,
}) => {
  const copy = getLocalizedReviewCopy(lang);

  const [reviews, setReviews] = useState<TripReviewRecord[]>([]);
  const [liveReceiptStatuses, setLiveReceiptStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [localReviewOpen, setLocalReviewOpen] = useState(false);
  const [localReviewBookingId, setLocalReviewBookingId] = useState('');

  const { eligibleBooking, latestBooking, buildSafeReviewHandoff } =
    useStorefrontTripBookingHandoff({
      tripId: trip.id,
      externalBookingRefs: storefrontBookingRefs,
      bookingStatusById,
      enabled: !previewMode,
    });

  const handleLaunchReviewProcess = () => {
    const handoff = buildSafeReviewHandoff(eligibleBooking?.bookingId);
    if (onOpenReviewModal) {
      onOpenReviewModal(handoff.bookingId || undefined);
      return;
    }
    setLocalReviewBookingId(handoff.bookingId);
    setLocalReviewOpen(true);
  };

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    setLightboxPhoto(null);

    // Public reviews are curated locally and updated manually by the owner
    // (INITIAL_TRIP_REVIEWS in src/data/platformData.ts), so this section
    // makes no Firestore reads. Display, order, and layout are unchanged.
    const matched = INITIAL_TRIP_REVIEWS.filter(
      (r) => r.tripId === trip.id && r.approvalStatus === 'Approved'
    ).sort((a, b) => (b.visitDate || '').localeCompare(a.visitDate || ''));
    setReviews(matched);
    setLoading(false);
  }, [trip.id]);

  useEffect(() => {
    const bookingIds = Array.from(
      new Set(
        reviews
          .map((r) => r.bookingId)
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      )
    );
    if (bookingIds.length === 0) return;

    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(
        bookingIds.map(async (bId) => {
          if (bookingStatusById?.[bId]) {
            return [bId, bookingStatusById[bId]] as const;
          }
          try {
            const snap = await getDoc(doc(db, 'booking_receipts', bId));
            if (snap.exists()) {
              const st = snap.data()?.status;
              if (typeof st === 'string') return [bId, st] as const;
            }
          } catch {
            // Fall back to starter booking state if receipt isn't reachable yet
          }
          const starter = INITIAL_BOOKINGS.find((b) => b.id === bId);
          return starter ? ([bId, starter.status] as const) : null;
        })
      );
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const entry of entries) {
        if (entry) next[entry[0]] = entry[1];
      }
      if (Object.keys(next).length > 0) {
        setLiveReceiptStatuses((prev) => ({ ...prev, ...next }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reviews, bookingStatusById]);

  const isReviewVerifiedBooking = (rev: TripReviewRecord): boolean => {
    if (!rev.bookingId) return false;
    const statusFromProp = bookingStatusById?.[rev.bookingId];
    if (statusFromProp !== undefined) return statusFromProp === 'Completed';
    const statusFromReceipt = liveReceiptStatuses[rev.bookingId];
    if (statusFromReceipt !== undefined) return statusFromReceipt === 'Completed';
    return Boolean(rev.verifiedBooking);
  };

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: trip.rating.toFixed(1),
        count: trip.reviewCount,
      };
    }
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return {
      average: (sum / reviews.length).toFixed(1),
      count: reviews.length,
    };
  }, [reviews, trip.rating, trip.reviewCount]);

  return (
    <section className="space-y-4" aria-label={copy.heading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-semibold text-[#0F2233]">{copy.heading}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] tabular-nums">
            <span className="inline-flex items-center gap-1 font-semibold text-[#0F2233]">
              <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
              <span>{stats.average} / 5.0</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {stats.count} {stats.count === 1 ? copy.reviewSingular : copy.reviewsWord}
            </span>
          </div>
        </div>

        {!previewMode && (
          <div className="flex flex-wrap items-center gap-2.5">
            {eligibleBooking ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1.5 text-xs font-semibold text-[#047857] tabular-nums">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {copy.detectedReadyBadge} {eligibleBooking.bookingId}
                </span>
              </span>
            ) : latestBooking &&
              (latestBooking.verification.status === 'not-finished' ||
                latestBooking.verification.status === 'not-confirmed') ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-medium text-[#475569] tabular-nums">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#EE5426]" aria-hidden="true" />
                <span>
                  {latestBooking.bookingId} · {copy.detectedPendingBadge}
                </span>
              </span>
            ) : (
              <span className="hidden sm:inline text-xs font-medium text-[#64748B]">
                {copy.postTripPrompt}
              </span>
            )}

            <button
              type="button"
              onClick={handleLaunchReviewProcess}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border-[1.5px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                eligibleBooking
                  ? 'border-[#15803D] bg-[#15803D] text-white hover:bg-[#166534]'
                  : 'border-[#EE5426]/70 bg-[#FFF7ED] text-[#EE5426] hover:bg-[#EE5426] hover:text-white'
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  eligibleBooking ? 'fill-[#FDE047] text-[#FDE047]' : 'fill-[#F59E0B] text-[#F59E0B]'
                }`}
                aria-hidden="true"
              />
              <span>{copy.writeBtn}</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-3 text-xs text-[#475569]">{copy.loading}</p>
      ) : loadError ? (
        <p className="py-3 text-xs text-[#B91C1C]">{loadError}</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-1">
          <p className="text-sm font-medium text-[#0F2233]">{copy.emptyTitle}</p>
          <p className="text-xs text-[#475569]">{copy.emptySub}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {reviews.map((rev) => (
            <li
              key={rev.id}
              className="rounded-xl border border-[#E2E8F0] bg-white p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#475569]">
                    <span className="font-semibold text-[#0F2233]">{rev.guestName}</span>
                    {rev.guestCountry && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{rev.guestCountry}</span>
                      </>
                    )}
                    {rev.visitDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{rev.visitDate}</span>
                      </>
                    )}
                  </div>

                  <div
                    className="inline-flex items-center gap-0.5 tabular-nums"
                    aria-label={`${rev.rating} / 5`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-3.5 w-3.5 ${
                          n <= rev.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#E2E8F0]'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>

                {isReviewVerifiedBooking(rev) && (
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{copy.verifiedBookingBadge}</span>
                    </span>
                  </div>
                )}

                <p className="text-sm leading-relaxed text-[#384C54]">{rev.comment}</p>
              </div>

              {rev.photoUrl && (
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(rev.photoUrl || null)}
                  className="group relative mt-1 h-32 w-full overflow-hidden rounded-lg border border-[#E2E8F0] cursor-pointer"
                >
                  <img
                    src={rev.photoUrl}
                    alt={`${rev.guestName} trip`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {lightboxPhoto && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close photo"
              className="absolute top-4 end-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxPhoto}
              alt="Guest excursion"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}

      {localReviewOpen && (
        <PostTripReviewModal
          open={true}
          trip={trip}
          lang={lang}
          initialBookingId={localReviewBookingId}
          bookingStatusById={bookingStatusById}
          previewMode={previewMode}
          onClose={() => setLocalReviewOpen(false)}
        />
      )}
    </section>
  );
};
