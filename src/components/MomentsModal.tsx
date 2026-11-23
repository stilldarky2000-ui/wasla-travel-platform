import React, { useEffect, useRef } from 'react';
import { BadgeCheck, ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
import { Lang, Translations } from '../data/i18n';
import { MomentItem, Trip, tText } from '../data/marketplaceData';
import { SmartImage } from './SmartImage';

interface MomentsModalProps {
  moments: MomentItem[];
  activeIndex: number | null;
  trips: Trip[];
  lang: Lang;
  t: Translations;
  isRtl: boolean;
  onChangeIndex: (index: number) => void;
  onClose: () => void;
  onSelectTrip: (trip: Trip) => void;
}

export const MomentsModal: React.FC<MomentsModalProps> = ({
  moments,
  activeIndex,
  trips,
  lang,
  t,
  isRtl,
  onChangeIndex,
  onClose,
  onSelectTrip,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const isOpen = activeIndex !== null && moments[activeIndex] !== undefined;
  const moment = isOpen ? moments[activeIndex] : null;
  const linkedTrip = moment ? trips.find((tr) => tr.id === moment.tripId) : undefined;

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const nextIdx = isRtl
          ? (activeIndex + 1) % moments.length
          : (activeIndex - 1 + moments.length) % moments.length;
        onChangeIndex(nextIdx);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = isRtl
          ? (activeIndex - 1 + moments.length) % moments.length
          : (activeIndex + 1) % moments.length;
        onChangeIndex(nextIdx);
        return;
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, moments.length, isRtl, onChangeIndex, onClose]);

  if (!isOpen || !moment || activeIndex === null) return null;

  const goPrev = () => onChangeIndex((activeIndex - 1 + moments.length) % moments.length);
  const goNext = () => onChangeIndex((activeIndex + 1) % moments.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/65 p-4 backdrop-blur-[2px] animate-[heroRise_220ms_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="moment-modal-title"
    >
      <div
        ref={containerRef}
        className="card-wasla p-0 relative w-full max-w-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="group relative md:col-span-7 aspect-square md:aspect-auto md:min-h-[400px] bg-[#FAF4ED]">
          <SmartImage
            src={
              moment.hasGuestPhoto !== false && moment.image
                ? moment.image
                : moment.fallbackTripImage || linkedTrip?.images[0] || moment.image
            }
            alt={`${moment.guestName}, ${moment.tripTitleOverride || (linkedTrip ? tText(linkedTrip.name, lang) : '')}`}
            loading="eager"
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0F2233]/80 via-[#0F2233]/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between gap-2 text-xs text-white/95">
            <span className="font-medium truncate">
              {moment.hasGuestPhoto !== false
                ? tText(
                    {
                      en: 'Photo shared by traveler',
                      ar: 'صورة مرفوعة من المسافر',
                      de: 'Vom Gast hochgeladenes Foto',
                    },
                    lang
                  )
                : tText(
                    {
                      en: 'Excursion view · Written review',
                      ar: 'صورة الرحلة · تقييم كتابي',
                      de: 'Tourenansicht · Schriftliche Bewertung',
                    },
                    lang
                  )}
            </span>
            {moment.visitDate && (
              <span className="tabular-nums text-[#FED7AA] shrink-0">{moment.visitDate}</span>
            )}
          </div>
          <button
            type="button"
            onClick={isRtl ? goNext : goPrev}
            className="absolute start-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#0F2233] hover:bg-white shadow-sm cursor-pointer"
            aria-label={t.momentPrev}
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={isRtl ? goPrev : goNext}
            className="absolute end-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#0F2233] hover:bg-white shadow-sm cursor-pointer"
            aria-label={t.momentNext}
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>

        <div className="md:col-span-5 p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="moment-modal-title" className="font-display text-xl font-semibold text-[#0F2233]">
                  {moment.guestName}
                </h3>
                <p className="text-xs font-medium text-[#475569]">
                  {tText(moment.country, lang)}
                  {moment.visitDate ? ` · ${moment.visitDate}` : ''}
                </p>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                aria-label={t.momentClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1" aria-label={`${moment.rating} out of 5 stars`}>
                {Array.from({ length: moment.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                ))}
                <span className="ms-1.5 text-xs font-semibold text-[#0F2233] tabular-nums">
                  {moment.rating.toFixed(1)}
                </span>
              </div>
              {moment.verifiedBooking === true && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {tText(
                      {
                        en: 'Verified booking',
                        ar: 'حجز موثّق',
                        de: 'Verifizierte Buchung',
                      },
                      lang
                    )}
                  </span>
                </span>
              )}
            </div>

            <p dir="auto" className="text-sm sm:text-[15px] leading-relaxed text-[#384C54]">
              “{tText(moment.comment, lang)}”
            </p>
          </div>

          <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
            {linkedTrip && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectTrip(linkedTrip);
                }}
                className="text-start text-sm font-semibold text-[#EE5426] hover:underline underline-offset-4 cursor-pointer"
              >
                {moment.tripTitleOverride || tText(linkedTrip.name, lang)} {isRtl ? '←' : '→'}
              </button>
            )}

            <div className="flex items-center justify-between text-xs text-[#475569] tabular-nums">
              <span>
                {activeIndex + 1} / {moments.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  {t.momentPrev}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  {t.momentNext}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
