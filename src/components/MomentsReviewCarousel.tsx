import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  MessageSquareQuote,
  Pause,
  Play,
  Star,
} from 'lucide-react';
import { Lang, Translations } from '../data/i18n';
import { CATEGORY_FALLBACK_IMAGE, MomentItem, Trip, tText } from '../data/marketplaceData';
import { SmartImage } from './SmartImage';

interface MomentsReviewCarouselProps {
  moments: MomentItem[];
  trips: Trip[];
  fallbackTrip: Trip;
  lang: Lang;
  t: Translations;
  isRtl: boolean;
  isModalOpen: boolean;
  onOpenMoment: (index: number) => void;
  onSelectTrip: (trip: Trip) => void;
}

const LABELS = {
  en: {
    guestPhoto: 'Guest photo',
    guestStory: 'Guest review',
    verifiedBooking: 'Verified booking',
    readFull: 'Read story',
    viewTrip: 'View trip',
    pauseAuto: 'Pause strip',
    playAuto: 'Auto-slide',
    reviewsSuffix: 'reviews',
    photosSuffix: 'photos',
    prevAria: 'Previous reviews',
    nextAria: 'Next reviews',
  },
  ar: {
    guestPhoto: 'صورة من المسافر',
    guestStory: 'تقييم مسافر',
    verifiedBooking: 'حجز موثّق',
    readFull: 'اقرأ التقييم',
    viewTrip: 'عرض الرحلة',
    pauseAuto: 'إيقاف الشريط',
    playAuto: 'تشغيل الشريط',
    reviewsSuffix: 'تقييم',
    photosSuffix: 'صور مسافرين',
    prevAria: 'التقييمات السابقة',
    nextAria: 'التقييمات التالية',
  },
  de: {
    guestPhoto: 'Gästefoto',
    guestStory: 'Gästebewertung',
    verifiedBooking: 'Verifizierte Buchung',
    readFull: 'Lesen',
    viewTrip: 'Tour ansehen',
    pauseAuto: 'Pausieren',
    playAuto: 'Auto-Lauf',
    reviewsSuffix: 'Bewertungen',
    photosSuffix: 'Fotos',
    prevAria: 'Vorherige Bewertungen',
    nextAria: 'Nächste Bewertungen',
  },
};

export const MomentsReviewCarousel: React.FC<MomentsReviewCarouselProps> = ({
  moments,
  trips,
  fallbackTrip,
  lang,
  t,
  isRtl,
  isModalOpen,
  onOpenMoment,
  onSelectTrip,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const lastAutoScrollLeftRef = useRef<number | null>(null);
  const cooldownUntilRef = useRef<number>(0);

  const [autoPlay, setAutoPlay] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0.18);
  const [activeSlideNumber, setActiveSlideNumber] = useState(1);

  const copy = {
    guestPhoto: tText({ en: LABELS.en.guestPhoto, ar: LABELS.ar.guestPhoto, de: LABELS.de.guestPhoto }, lang),
    guestStory: tText({ en: LABELS.en.guestStory, ar: LABELS.ar.guestStory, de: LABELS.de.guestStory }, lang),
    verifiedBooking: tText({ en: LABELS.en.verifiedBooking, ar: LABELS.ar.verifiedBooking, de: LABELS.de.verifiedBooking }, lang),
    readFull: tText({ en: LABELS.en.readFull, ar: LABELS.ar.readFull, de: LABELS.de.readFull }, lang),
    viewTrip: tText({ en: LABELS.en.viewTrip, ar: LABELS.ar.viewTrip, de: LABELS.de.viewTrip }, lang),
    pauseAuto: tText({ en: LABELS.en.pauseAuto, ar: LABELS.ar.pauseAuto, de: LABELS.de.pauseAuto }, lang),
    playAuto: tText({ en: LABELS.en.playAuto, ar: LABELS.ar.playAuto, de: LABELS.de.playAuto }, lang),
    reviewsSuffix: tText({ en: LABELS.en.reviewsSuffix, ar: LABELS.ar.reviewsSuffix, de: LABELS.de.reviewsSuffix }, lang),
    photosSuffix: tText({ en: LABELS.en.photosSuffix, ar: LABELS.ar.photosSuffix, de: LABELS.de.photosSuffix }, lang),
    prevAria: tText({ en: LABELS.en.prevAria, ar: LABELS.ar.prevAria, de: LABELS.de.prevAria }, lang),
    nextAria: tText({ en: LABELS.en.nextAria, ar: LABELS.ar.nextAria, de: LABELS.de.nextAria }, lang),
  };
  const photoCount = moments.filter((m) => m.hasGuestPhoto !== false).length;

  const getStepPixels = useCallback((el: HTMLDivElement): number => {
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (!firstCard) return Math.max(el.clientWidth * 0.78, 300);
    const computedStyle = window.getComputedStyle(el);
    const gap = parseFloat(computedStyle.columnGap || computedStyle.gap || '16') || 16;
    return firstCard.offsetWidth + gap;
  }, []);

  const updateScrollMetrics = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (maxScroll <= 4) {
      setScrollProgress(1);
      setActiveSlideNumber(1);
      return;
    }
    const offset = Math.min(maxScroll, Math.abs(el.scrollLeft));
    const ratio = offset / maxScroll;
    setScrollProgress(Math.min(1, Math.max(0.12, ratio)));

    const step = getStepPixels(el);
    const approxIndex = Math.min(
      moments.length,
      Math.max(1, Math.round(offset / Math.max(step, 1)) + 1)
    );
    setActiveSlideNumber(approxIndex);
  }, [getStepPixels, moments.length]);

  useEffect(() => {
    updateScrollMetrics();
  }, [moments.length, updateScrollMetrics]);

  const scrollByDirection = useCallback(
    (dir: 1 | -1, isManual = false) => {
      const el = trackRef.current;
      if (!el) return;
      const step = getStepPixels(el);
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= 4) return;

      if (isManual) {
        cooldownUntilRef.current = Date.now() + 6000;
        directionRef.current = dir;
      }

      const absPos = Math.abs(el.scrollLeft);
      const atEnd = absPos >= maxScroll - 8;
      const atStart = absPos <= 8;

      if (isManual) {
        if (dir === 1 && atEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
          return;
        }
        if (dir === -1 && atStart) {
          el.scrollTo({ left: isRtl ? -maxScroll : maxScroll, behavior: 'smooth' });
          return;
        }
      }

      const signedDelta = isRtl ? -dir * step : dir * step;
      el.scrollBy({ left: signedDelta, behavior: 'smooth' });
    },
    [getStepPixels, isRtl]
  );

  // Smooth ping-pong ("بيروح وييجي") auto-glide across reviews
  useEffect(() => {
    if (!autoPlay || interactionPaused || isModalOpen || moments.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      if (Date.now() < cooldownUntilRef.current) return;

      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= 8) return;

      const currentScroll = el.scrollLeft;
      const absPos = Math.abs(currentScroll);
      const atEnd = absPos >= maxScroll - 10;
      const atStart = absPos <= 10;

      // Turn around cleanly at both ends so the strip glides back and forth
      if (directionRef.current === 1 && atEnd) {
        directionRef.current = -1;
      } else if (directionRef.current === -1 && atStart) {
        directionRef.current = 1;
      } else if (
        lastAutoScrollLeftRef.current !== null &&
        Math.abs(currentScroll - lastAutoScrollLeftRef.current) < 2
      ) {
        // Failsafe turnaround for any browser RTL scrollLeft quirk
        directionRef.current = directionRef.current === 1 ? -1 : 1;
      }

      lastAutoScrollLeftRef.current = currentScroll;
      scrollByDirection(directionRef.current, false);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [autoPlay, interactionPaused, isModalOpen, moments.length, scrollByDirection]);

  if (moments.length === 0) return null;

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onTouchStart={() => setInteractionPaused(true)}
      onTouchEnd={() => {
        cooldownUntilRef.current = Date.now() + 3500;
        setInteractionPaused(false);
      }}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={() => setInteractionPaused(false)}
    >
      {/* Section Header + Back-and-Forth Carousel Controls */}
      <div className="reveal-item flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight text-[#0F172A]">
            {t.sectionMoments}
          </h2>
          <p className="text-[14.5px] text-[#475569]">{t.sectionMomentsSub}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#64748B] tabular-nums pt-0.5">
            <span>
              {moments.length} {copy.reviewsSuffix}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {photoCount} {copy.photosSuffix}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setAutoPlay((prev) => !prev)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-pressed={autoPlay}
          >
            {autoPlay ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.pauseAuto}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.playAuto}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => scrollByDirection(isRtl ? 1 : -1, true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label={isRtl ? copy.nextAria : copy.prevAria}
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={() => scrollByDirection(isRtl ? -1 : 1, true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label={isRtl ? copy.prevAria : copy.nextAria}
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Strip */}
      <div
        ref={trackRef}
        onScroll={updateScrollMetrics}
        role="region"
        aria-roledescription="carousel"
        aria-label={t.sectionMoments}
        className="no-scrollbar carousel-track flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-proximity py-2 px-0.5"
      >
        {moments.map((moment, idx) => {
          const trip = trips.find((tr) => tr.id === moment.tripId) || fallbackTrip;
          const tripLabel = moment.tripTitleOverride || tText(trip.name, lang);
          const commentText = tText(moment.comment, lang);
          const countryLabel = tText(moment.country, lang);
          const hasPhoto = moment.hasGuestPhoto !== false && Boolean(moment.image);
          const initialChar = (moment.guestName || 'G').trim().charAt(0).toUpperCase();

          return (
            <article
              key={moment.id}
              className="snap-start shrink-0 basis-[84%] sm:basis-[340px] lg:basis-[372px] group rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#EA580C]/45"
            >
              {/* Interactive Photo / Review Story Trigger */}
              <button
                type="button"
                onClick={() => onOpenMoment(idx)}
                className="flex-1 flex flex-col text-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
              >
                {/* Top Media Frame (Fixed Uniform Height Across All Cards) */}
                {hasPhoto ? (
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#FFF7ED]">
                    <SmartImage
                      src={moment.image}
                      fallbackSrc={
                        moment.fallbackTripImage ||
                        trip.images?.[0] ||
                        CATEGORY_FALLBACK_IMAGE[trip.category]
                      }
                      alt={`${moment.guestName} — ${tripLabel}`}
                      loading="eager"
                      className="h-full w-full group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0F172A]/88 via-[#0F172A]/40 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-4 bottom-3 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#FED7AA]">
                        <Camera className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span>{copy.guestPhoto}</span>
                        {moment.visitDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{moment.visitDate}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold text-white line-clamp-1">
                        {tripLabel}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#FFF7ED] border-b border-[#FED7AA]/70 p-4 sm:p-5 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-20 rounded-xl overflow-hidden border border-[#E2E8F0] bg-white shrink-0 shadow-xs">
                        <SmartImage
                          src={moment.fallbackTripImage || trip.images?.[0]}
                          fallbackSrc={CATEGORY_FALLBACK_IMAGE[trip.category]}
                          alt={tripLabel}
                          loading="eager"
                          className="h-full w-full"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#C2410C]">
                          <MessageSquareQuote className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{copy.guestStory}</span>
                        </div>
                        <p className="text-[13.5px] font-semibold text-[#0F172A] line-clamp-2 leading-snug">
                          {tripLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#FED7AA]/60">
                      <span className="font-medium text-[#0F172A]">{trip.destination}</span>
                      {moment.visitDate && (
                        <span className="tabular-nums">{moment.visitDate}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quote & Rating Prose */}
                <div className="p-4 sm:p-5 space-y-2.5 flex-1 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`${moment.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`h-3.5 w-3.5 ${
                            starIdx < moment.rating
                              ? 'fill-[#F59E0B] text-[#F59E0B]'
                              : 'text-[#CBD5E1]'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="ms-1 text-xs font-semibold text-[#0F172A] tabular-nums">
                        {moment.rating.toFixed(1)}
                      </span>
                    </div>

                    <span className="text-[11.5px] font-medium text-[#EA580C] group-hover:underline underline-offset-4">
                      {copy.readFull}
                    </span>
                  </div>

                  {moment.verifiedBooking === true && (
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{copy.verifiedBooking}</span>
                      </span>
                    </div>
                  )}

                  <p
                    dir="auto"
                    className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#334155] line-clamp-3"
                  >
                    “{commentText}”
                  </p>
                </div>
              </button>

              {/* Guest Attribution & Trip Shortcut Footer */}
              <div className="px-4 sm:px-5 py-3 border-t border-[#F1F5F9] bg-[#FAFCFF] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    aria-hidden="true"
                    className="h-8 w-8 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] font-semibold text-xs flex items-center justify-center shrink-0"
                  >
                    {initialChar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">
                      {moment.guestName}
                    </p>
                    {countryLabel && (
                      <p className="text-[11px] text-[#64748B] truncate">{countryLabel}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTrip(trip)}
                  className="text-xs font-semibold text-[#EA580C] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copy.viewTrip} {isRtl ? '←' : '→'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Live Track Progress Bar + Index Counter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[#FED7AA]/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#EA580C] transition-all duration-300"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[#64748B] tabular-nums shrink-0">
          {activeSlideNumber} / {moments.length}
        </span>
      </div>
    </div>
  );
};
