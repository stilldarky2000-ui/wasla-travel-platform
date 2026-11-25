import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Lang, Translations } from '../data/i18n';
import {
  CATEGORY_FALLBACK_IMAGE,
  CurrencyCode,
  Trip,
  formatCurrencyPrice,
  formatTripScheduleSummary,
  tText,
} from '../data/marketplaceData';
import { SmartImage } from './SmartImage';
import { formatPerGroupUnitLabel, formatTripLockupPrice } from '../lib/tripPricing';

interface HeroCarouselProps {
  variant: 'hero';
  slides: Trip[];
  lang: Lang;
  t: Translations;
  isRtl: boolean;
  currency?: CurrencyCode;
  isLoading?: boolean;
  onViewTrip: (trip: Trip) => void;
  categoryLabel: (category: Trip['category']) => string;
}

interface CardsCarouselProps {
  variant: 'cards';
  isRtl: boolean;
  children: React.ReactNode;
  ariaLabel: string;
  headerTitle?: React.ReactNode;
  headerSubtitle?: React.ReactNode;
  isLoading?: boolean;
  skeletonCount?: number;
  desktopGridClassName?: string;
  hideArrowsAt?: 'sm' | 'md' | 'lg';
  trackClassName?: string;
}

export type CarouselProps = HeroCarouselProps | CardsCarouselProps;

export const Carousel: React.FC<CarouselProps> = (props) => {
  if (props.variant === 'hero') {
    return <HeroSlider {...props} />;
  }
  return <CardsTrack {...props} />;
};

const HeroCarouselSkeleton: React.FC<{ ariaLabel: string }> = ({ ariaLabel }) => (
  <div
    className="relative h-[420px] sm:h-[440px] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0F2233]"
    role="region"
    aria-label={ariaLabel}
    aria-busy="true"
  >
    {/* Background Shimmer Surface */}
    <div className="shimmer-wave absolute inset-0 bg-gradient-to-br from-[#19354F] via-[#0F2233] to-[#19354F]" />

    {/* Bottom Contrast Scrim */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#1C1008]/90 via-[#1C1008]/45 to-transparent" />

    {/* Bottom Info Bar Skeleton */}
    <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-11 pt-6 sm:px-8 sm:pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="space-y-2.5 w-full max-w-2xl">
        <div className="flex items-center gap-2">
          <div className="shimmer-wave h-5 w-24 rounded bg-white/20" />
          <div className="shimmer-wave h-4 w-20 rounded bg-white/15" />
        </div>
        <div className="shimmer-wave h-8 sm:h-9 w-4/5 max-w-md rounded-lg bg-white/25" />
        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          <div className="shimmer-wave h-4 w-16 rounded bg-white/20" />
          <div className="shimmer-wave h-4 w-24 rounded bg-white/15" />
          <div className="shimmer-wave h-4 w-28 rounded bg-white/20" />
          <div className="shimmer-wave h-4 w-24 rounded bg-white/25" />
        </div>
      </div>

      <div className="shimmer-wave h-11 w-36 rounded-full bg-white/25 shrink-0" />
    </div>

    {/* Prev / Next Button Placeholders */}
    <div className="shimmer-wave absolute start-3 sm:start-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/20" />
    <div className="shimmer-wave absolute end-3 sm:end-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/20" />

    {/* Bottom Center Dots Skeleton */}
    <div className="absolute bottom-3.5 inset-x-0 z-20 flex items-center justify-center gap-2">
      <div className="h-2 w-6 rounded-full bg-white/60" />
      <div className="h-2 w-2 rounded-full bg-white/30" />
      <div className="h-2 w-2 rounded-full bg-white/30" />
      <div className="h-2 w-2 rounded-full bg-white/30" />
    </div>
  </div>
);

const CardsCarouselSkeletonItem: React.FC = () => (
  <div
    aria-hidden="true"
    className="card-wasla p-0 snap-start shrink-0 basis-[86%] sm:basis-[calc((100%-20px)/2)] lg:basis-[calc((100%-40px)/3)] flex flex-col overflow-hidden"
  >
    {/* 16:10 Media Header Skeleton */}
    <div className="shimmer-wave relative aspect-[16/10] w-full bg-[#F1F5F9]">
      <div className="absolute top-3 start-3 flex items-center gap-1.5">
        <div className="h-8 w-8 rounded-full bg-white/75" />
        <div className="h-8 w-8 rounded-full bg-white/75" />
      </div>
      <div className="absolute top-3 end-3 h-7 w-20 rounded-lg bg-white/80" />
      <div className="absolute bottom-3 start-3 h-5 w-24 rounded-md bg-white/75" />
    </div>

    {/* Card Body Skeleton */}
    <div className="flex flex-1 flex-col justify-between p-5 gap-4">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="shimmer-wave h-3.5 w-20 rounded bg-[#F1F5F9]" />
          <div className="shimmer-wave h-3.5 w-24 rounded bg-[#F1F5F9]" />
        </div>
        <div className="shimmer-wave h-5 w-4/5 rounded-md bg-[#E2E8F0]" />
        <div className="space-y-1.5 pt-0.5">
          <div className="shimmer-wave h-3.5 w-full rounded bg-[#F1F5F9]" />
          <div className="shimmer-wave h-3.5 w-2/3 rounded bg-[#F1F5F9]" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] pt-3.5">
        <div className="space-y-1.5">
          <div className="shimmer-wave h-3.5 w-16 rounded bg-[#F1F5F9]" />
          <div className="shimmer-wave h-5 w-24 rounded bg-[#E2E8F0]" />
        </div>
        <div className="shimmer-wave h-9 w-28 rounded-full bg-[#E2E8F0]" />
      </div>
    </div>
  </div>
);

const HeroSlider: React.FC<HeroCarouselProps> = ({
  slides,
  lang,
  t,
  isRtl,
  currency = 'EUR',
  isLoading = false,
  onViewTrip,
  categoryLabel,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 8000);
    return () => window.clearInterval(id);
  }, [count, paused]);

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + count) % count);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % count);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (isRtl) {
      delta > 0 ? goNext() : goPrev();
    } else {
      delta < 0 ? goNext() : goPrev();
    }
  };

  if (isLoading || count === 0) {
    return <HeroCarouselSkeleton ariaLabel={t.sectionTopActivities} />;
  }

  return (
    <div
      className="wasla-hero-glare group relative h-[420px] sm:h-[440px] w-full overflow-hidden rounded-2xl border border-[#C8C2B8]/50 bg-[#0F2233]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.sectionTopActivities}
    >
      {slides.map((trip, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={trip.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className={`h-full w-full ${isActive ? 'slide-zoom-active' : ''}`}>
              <SmartImage
                src={trip.images?.[0]}
                fallbackSrc={CATEGORY_FALLBACK_IMAGE[trip.category]}
                alt={tText(trip.name, lang)}
                loading="eager"
                className="h-full w-full"
              />
            </div>

            {/* Bottom contrast scrim: clean photo above, crisp legible info bar at bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0F2233]/92 via-[#0F2233]/50 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-11 pt-6 sm:px-8 sm:pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#FED7AA]">
                  <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                    {categoryLabel(trip.category)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{trip.destination}</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-semibold leading-tight text-white text-balance">
                  {tText(trip.name, lang)}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#FFF7ED] tabular-nums">
                  {trip.reviewCount > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1 font-semibold text-white">
                        <Star className="h-3.5 w-3.5 fill-[#F0B85A] text-[#F0B85A]" aria-hidden="true" />
                        {trip.rating.toFixed(1)}
                        <span className="font-normal text-[#FED7AA]">({trip.reviewCount})</span>
                      </span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <span>{tText(trip.duration, lang)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#FED7AA]">
                    {formatTripScheduleSummary(trip, lang, true)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-baseline gap-1.5 tracking-normal">
                    {trip.pricingMode === 'per-group' ? (
                      <>
                        <strong className="text-white font-semibold">
                          {formatTripLockupPrice(trip.price, currency, lang)}
                        </strong>
                        <span>· {formatPerGroupUnitLabel(trip, lang)}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.fromPrice}</span>
                        <strong className="text-white font-semibold">
                          {formatCurrencyPrice(trip.price, currency)}
                        </strong>
                        <span>{t.perPerson}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onViewTrip(trip)}
                className="btn-wasla-primary self-start sm:self-auto min-h-[44px] rounded-full px-6 py-2.5 text-sm whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.viewTrip}
              </button>
            </div>
          </div>
        );
      })}

      {/* Prev / Next Controls */}
      <button
        type="button"
        onClick={isRtl ? goNext : goPrev}
        className="absolute start-3 sm:start-4 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-[#0F2233] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
        aria-label={isRtl ? 'Next slide' : 'Previous slide'}
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
      </button>

      <button
        type="button"
        onClick={isRtl ? goPrev : goNext}
        className="absolute end-3 sm:end-4 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-[#0F2233] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
        aria-label={isRtl ? 'Previous slide' : 'Next slide'}
      >
        <ChevronRight className="h-5 w-5 rtl:rotate-180" />
      </button>

      {/* Bottom Center Dots */}
      <div className="absolute bottom-3.5 inset-x-0 z-20 flex items-center justify-center gap-2">
        {slides.map((slide, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
              aria-current={active ? 'true' : undefined}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                active ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

const CardsTrack: React.FC<CardsCarouselProps> = ({
  isRtl,
  children,
  ariaLabel,
  headerTitle,
  headerSubtitle,
  isLoading = false,
  skeletonCount = 3,
  desktopGridClassName = '',
  hideArrowsAt,
  trackClassName = 'gap-4 sm:gap-5',
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0.2);
  const childCount = React.Children.count(children);
  const showSkeletons = isLoading || childCount === 0;

  const updateProgress = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(1);
      return;
    }
    const ratio = Math.min(1, Math.max(0.15, Math.abs(el.scrollLeft) / maxScroll));
    setScrollProgress(ratio);
  };

  useEffect(() => {
    updateProgress();
  }, [children, showSkeletons]);

  const scrollTrack = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardStep = firstCard ? firstCard.offsetWidth + 20 : Math.max(el.clientWidth * 0.85, 280);
    const distance = Math.max(cardStep, el.clientWidth * 0.72);
    const signedDistance = isRtl ? -direction * distance : direction * distance;
    el.scrollBy({ left: signedDistance, behavior: 'smooth' });
  };

  const arrowVisibilityClass =
    hideArrowsAt === 'sm'
      ? 'inline-flex sm:hidden'
      : hideArrowsAt === 'md'
      ? 'inline-flex md:hidden'
      : hideArrowsAt === 'lg'
      ? 'inline-flex lg:hidden'
      : 'inline-flex';

  const progressHiddenClass =
    hideArrowsAt === 'sm'
      ? 'sm:hidden'
      : hideArrowsAt === 'md'
      ? 'md:hidden'
      : hideArrowsAt === 'lg'
      ? 'lg:hidden'
      : 'sm:hidden';

  return (
    <div
      className="relative space-y-4"
      role="region"
      aria-label={ariaLabel}
      aria-busy={showSkeletons ? 'true' : undefined}
    >
      {(headerTitle || headerSubtitle || !showSkeletons) && (
        <div className="flex items-end justify-between gap-4">
          <div className="reveal-item space-y-1.5 min-w-0">
            {headerTitle}
            {headerSubtitle}
          </div>

          {!showSkeletons && (
            <div className={`${arrowVisibilityClass} items-center gap-2 shrink-0 pb-0.5`}>
              <button
                type="button"
                onClick={() => scrollTrack(-1)}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F2233] shadow-xs hover:border-[#EE5426] hover:bg-[#FFF7ED] hover:text-[#EE5426] active:scale-95 transition-all cursor-pointer"
                aria-label="Scroll previous"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => scrollTrack(1)}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F2233] shadow-xs hover:border-[#EE5426] hover:bg-[#FFF7ED] hover:text-[#EE5426] active:scale-95 transition-all cursor-pointer"
                aria-label="Scroll next"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        onScroll={updateProgress}
        className={`no-scrollbar carousel-track flex ${trackClassName} overflow-x-auto snap-x snap-proximity py-2 px-1 -mx-1 ${desktopGridClassName}`}
      >
        {showSkeletons
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <CardsCarouselSkeletonItem key={`carousel-skeleton-${idx}`} />
            ))
          : children}
      </div>

      <div className={`mt-1 h-1 w-full rounded-full bg-[#FED7AA]/50 overflow-hidden ${progressHiddenClass}`}>
        <div
          className="h-full rounded-full bg-[#EE5426] transition-all duration-200"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>
    </div>
  );
};
