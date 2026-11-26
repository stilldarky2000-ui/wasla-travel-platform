import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  RotateCcw,
  Search,
  Share2,
  Star,
  X,
} from 'lucide-react';
import { I18N, Lang, Translations } from '../data/i18n';
import {
  CATEGORIES,
  CurrencyCode,
  Trip,
  formatCurrencyPrice,
  formatTripOperatingDaysLabel,
  formatTripScheduleSummary,
  tText, tripDisplayName,
} from '../data/marketplaceData';
import { shareTripItem } from '../lib/shareTrip';
import { formatPerGroupUnitLabel, formatTripLockupPrice } from '../lib/tripPricing';
import { SmartImage } from './SmartImage';

type ExplorerSort = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc';

const DEFAULT_FEATURED_ORDER: readonly string[] = [
  'luxor-valley-small-van',
  'orange-bay-small-group',
  'eastern-desert-sunset-safari',
];

interface TripExplorerProps {
  trips: Trip[];
  selectedTripId: string;
  onSelectTripId: (id: string) => void;
  onBookTrip: (trip: Trip) => void;
  lang: Lang;
  t: Translations;
  isRtl: boolean;
  currency?: CurrencyCode;
  isLoading?: boolean;
  favoriteTripIds?: string[];
  onToggleFavorite?: (trip: Trip) => void;
  activeDateRange?: { startDate: string; endDate: string };
  onResetFilters?: () => void;
}

const TripExplorerSkeleton: React.FC = () => (
  <div
    className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
    aria-busy="true"
    aria-label="Loading trips explorer"
  >
    <div className="card-wasla order-2 lg:order-1 p-5 sm:p-6 flex flex-col justify-between gap-5">
      <div className="space-y-4">
        <div className="shimmer-wave relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#C8C2B8]/40 bg-[#FAF4ED]" />
        <div className="space-y-2.5">
          <div className="shimmer-wave h-4 w-2/3 rounded bg-[#FAF4ED]" />
          <div className="shimmer-wave h-7 w-4/5 rounded-lg bg-[#C8C2B8]/40" />
          <div className="space-y-1.5 pt-0.5">
            <div className="shimmer-wave h-4 w-full rounded bg-[#FAF4ED]" />
            <div className="shimmer-wave h-4 w-5/6 rounded bg-[#FAF4ED]" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#C8C2B8]/40 pt-4">
        <div className="shimmer-wave h-8 w-24 rounded bg-[#C8C2B8]/40" />
        <div className="shimmer-wave h-11 w-36 rounded-full bg-[#C8C2B8]/40" />
      </div>
    </div>

    <div className="card-wasla order-1 lg:order-2 p-4 sm:p-5 flex flex-col gap-3">
      <div className="shimmer-wave h-10 w-full rounded-xl bg-[#F1F5F9]" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={`trip-row-skeleton-${idx}`}
            className="flex items-center gap-3 rounded-xl p-2.5 border border-[#E2E8F0] bg-[#F8FAFC]/60"
          >
            <div className="shimmer-wave h-14 w-20 shrink-0 rounded-lg bg-[#E2E8F0]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="shimmer-wave h-4 w-3/4 rounded bg-[#E2E8F0]" />
              <div className="shimmer-wave h-3 w-1/2 rounded bg-[#F1F5F9]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TripExplorer: React.FC<TripExplorerProps> = ({
  trips,
  selectedTripId,
  onSelectTripId,
  onBookTrip,
  lang,
  t,
  isRtl,
  currency = 'EUR',
  isLoading = false,
  favoriteTripIds = [],
  onToggleFavorite,
  activeDateRange,
  onResetFilters,
}) => {
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<ExplorerSort>('featured');
  const [familyOnly, setFamilyOnly] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hasLocalFilter =
    quickFilter !== 'all' || keyword.trim().length > 0 || familyOnly || womenOnly;

  const filteredListTrips = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const list = trips.filter((tr) => {
      if (quickFilter === 'favorites' && !favoriteTripIds.includes(tr.id)) {
        return false;
      }
      if (
        quickFilter !== 'all' &&
        quickFilter !== 'favorites' &&
        tr.destination.toLowerCase() !== quickFilter.toLowerCase()
      ) {
        return false;
      }
      if (familyOnly && !tr.familyFriendly) return false;
      if (womenOnly && !tr.womenFriendly) return false;
      if (q) {
        const haystack = [
          tr.name.en,
          tr.name.ar,
          tr.name.de,
          tr.shortDescription.en,
          tr.shortDescription.ar,
          tr.shortDescription.de,
          tr.destination,
          tr.category,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating-desc') {
      return [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }
    const baseOrder = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    if (!hasLocalFilter) {
      return [...baseOrder].sort((a, b) => {
        const idxA = DEFAULT_FEATURED_ORDER.indexOf(a.id);
        const idxB = DEFAULT_FEATURED_ORDER.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }
    return baseOrder;
  }, [trips, quickFilter, favoriteTripIds, keyword, sortBy, familyOnly, womenOnly, hasLocalFilter]);

  const [hasUserSelectedTrip, setHasUserSelectedTrip] = useState(false);
  const initialSelectedTripIdRef = useRef(selectedTripId);
  const hasSyncedDefaultSelectionRef = useRef(false);

  const handleSelectTrip = (id: string) => {
    setHasUserSelectedTrip(true);
    onSelectTripId(id);
  };

  useEffect(() => {
    if (hasSyncedDefaultSelectionRef.current || hasUserSelectedTrip) return;
    const defaultTripId = DEFAULT_FEATURED_ORDER[0];
    if (
      !hasLocalFilter &&
      sortBy === 'featured' &&
      trips.some((tr) => tr.id === defaultTripId)
    ) {
      hasSyncedDefaultSelectionRef.current = true;
      if (selectedTripId !== defaultTripId) {
        onSelectTripId(defaultTripId);
      }
    }
  }, [trips, hasLocalFilter, sortBy, hasUserSelectedTrip, selectedTripId, onSelectTripId]);

  const effectiveSelectedTripId =
    !hasUserSelectedTrip &&
    !hasLocalFilter &&
    sortBy === 'featured' &&
    selectedTripId === initialSelectedTripIdRef.current
      ? DEFAULT_FEATURED_ORDER[0]
      : selectedTripId;

  const activeTrip =
    filteredListTrips.find((tr) => tr.id === effectiveSelectedTripId) ||
    filteredListTrips[0] ||
    null;
  const activeTripId = activeTrip?.id ?? '';
  const [galleryState, setGalleryState] = useState<{ tripId: string; index: number }>({
    tripId: activeTripId,
    index: 0,
  });
  const imageIndex = galleryState.tripId === activeTripId ? galleryState.index : 0;
  const setImageIndex = (updater: number | ((prev: number) => number)) => {
    setGalleryState((prev) => {
      const current = prev.tripId === activeTripId ? prev.index : 0;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { tripId: activeTripId, index: next };
    });
  };
  const touchStartX = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const resetLocalFilters = () => {
    setQuickFilter('all');
    setKeyword('');
    setFamilyOnly(false);
    setWomenOnly(false);
    setSortBy('featured');
  };

  if (isLoading) {
    return <TripExplorerSkeleton />;
  }

  if (trips.length === 0) {
    const rangeText =
      activeDateRange?.startDate && activeDateRange?.endDate
        ? activeDateRange.startDate === activeDateRange.endDate
          ? activeDateRange.startDate
          : `${activeDateRange.startDate} → ${activeDateRange.endDate}`
        : '';

    return (
      <div className="card-wasla p-8 sm:p-10 text-center space-y-4">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF4ED] text-[#EE5426]">
          <CalendarDays className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="font-display text-lg font-semibold text-[#0F2233]">
            {tText(
              {
                en: 'No excursions match your current search',
                ar: 'لا توجد رحلات مطابقة لبحثك الحالي',
                de: 'Keine Ausflüge für diese Auswahl verfügbar',
              },
              lang
            )}
          </h3>
          <p className="text-sm text-[#475569]">
            {rangeText
              ? tText(
                  {
                    en: `Try expanding your date range beyond ${rangeText} or switching destination/activity filters.`,
                    ar: `جرّب توسيع نطاق التواريخ خارج ${rangeText} أو تغيير الوجهة ونوع النشاط.`,
                    de: `Erweitern Sie Ihren Reisezeitraum über ${rangeText} hinaus oder passen Sie Ihre Filter an.`,
                  },
                  lang
                )
              : tText(
                  {
                    en: 'Adjust your destination, activity, or date range filters to view more excursions.',
                    ar: 'عدّل الوجهة أو النشاط أو التواريخ لعرض جميع الرحلات المتاحة.',
                    de: 'Passen Sie Reiseziel, Aktivität oder Zeitraum an, um weitere Ausflüge zu sehen.',
                  },
                  lang
                )}
          </p>
        </div>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#EE5426] bg-[#FFF7ED] px-5 py-2 text-xs font-semibold text-[#EE5426] hover:bg-[#EE5426] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {tText(
                {
                  en: 'Reset search filters & show all trips',
                  ar: 'إعادة ضبط الفلاتر وعرض كل الرحلات',
                  de: 'Filter zurücksetzen & alle Touren anzeigen',
                },
                lang
              )}
            </span>
          </button>
        )}
      </div>
    );
  }

  const handleShare = async (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    const res = await shareTripItem(trip, lang, currency);
    if (res === 'copied') {
      setCopiedId(trip.id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === trip.id ? null : prev));
      }, 2200);
    }
  };

  const scrollList = (direction: -1 | 1) => {
    const el = listRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardStep = firstCard ? firstCard.offsetWidth + 16 : Math.max(el.clientWidth * 0.85, 240);
    const distance = Math.max(cardStep, el.clientWidth * 0.72);
    const signedDistance = isRtl ? -direction * distance : direction * distance;
    el.scrollBy({ left: signedDistance, behavior: 'smooth' });
  };

  const shareLabel = tText(
    { en: 'Share trip', ar: 'مشاركة الرحلة', de: 'Ausflug teilen' },
    lang
  );
  const copiedLabel = tText({ en: 'Copied', ar: 'تم النسخ', de: 'Kopiert' }, lang);
  const fromWord = tText({ en: 'From', ar: 'يبدأ من', de: 'Ab' }, lang);

  const images = activeTrip && activeTrip.images.length > 0 ? activeTrip.images : [''];
  const currentImg = images[imageIndex] ?? images[0] ?? '';
  const prevImage = () => setImageIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setImageIndex((i) => (i + 1) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 35) return;
    if (isRtl) {
      delta > 0 ? nextImage() : prevImage();
    } else {
      delta < 0 ? nextImage() : prevImage();
    }
  };

  const activeName = activeTrip ? tripDisplayName(activeTrip, lang) : '';
  const categoryObj = activeTrip ? CATEGORIES.find((c) => c.id === activeTrip.category) : null;
  const categoryLabel = categoryObj
    ? tText(categoryObj.name, lang)
    : activeTrip?.category || '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Preview half */}
      <div className="card-wasla order-2 lg:order-1 p-5 sm:p-6 flex flex-col justify-between gap-5">
        {!activeTrip ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center space-y-3">
            <Search className="h-8 w-8 text-[#C8C2B8]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#0F2233]">
              {tText(
                {
                  en: 'No matching trips for this filter',
                  ar: 'لا توجد رحلات تطابق هذا الفلتر حالياً',
                  de: 'Keine passenden Ausflüge für diesen Filter',
                },
                lang
              )}
            </p>
            <button
              type="button"
              onClick={resetLocalFilters}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#EE5426] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#EE5426] hover:bg-[#EE5426] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{tText({ en: 'Show all trips', ar: 'عرض كل الرحلات', de: 'Alle zeigen' }, lang)}</span>
            </button>
          </div>
        ) : (
          <>
            <div key={activeTrip.id} className="space-y-4 animate-[heroRise_280ms_ease-out]">
              <div
                className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FFF7ED]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <SmartImage
                  src={currentImg}
                  alt={activeName}
                  loading="lazy"
                  className="h-full w-full"
                  placeholderLabel={activeName}
                />

                <div className="absolute top-3 start-3 z-20 flex items-center gap-1.5">
                  <span className="rounded-md bg-[#0F2233]/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                    {categoryLabel}
                  </span>
                </div>

                <div className="absolute top-3 end-3 z-20 flex items-center gap-1.5">
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(activeTrip);
                      }}
                      aria-pressed={favoriteTripIds.includes(activeTrip.id)}
                      aria-label="Toggle favorite"
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 active:scale-90 cursor-pointer ${
                        favoriteTripIds.includes(activeTrip.id)
                          ? 'border border-white/50 bg-[#E11D48] text-white shadow-[0_6px_18px_rgba(225,29,72,0.55)] scale-105'
                          : 'border border-white/40 bg-[#0F2233]/65 text-white hover:bg-[#E11D48]/90 backdrop-blur-xs shadow-xs'
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favoriteTripIds.includes(activeTrip.id) ? 'fill-white text-white' : 'text-white'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleShare(e, activeTrip)}
                    aria-label={shareLabel}
                    title={copiedId === activeTrip.id ? copiedLabel : shareLabel}
                    className={`inline-flex h-9 items-center justify-center gap-1 rounded-full transition-all duration-200 active:scale-90 cursor-pointer ${
                      copiedId === activeTrip.id
                        ? 'border border-white/60 bg-[#16A34A] px-2.5 text-white shadow-[0_6px_18px_rgba(22,163,74,0.5)]'
                        : 'w-9 border border-white/40 bg-[#0F2233]/65 text-white hover:bg-[#EE5426]/95 backdrop-blur-xs shadow-xs'
                    }`}
                  >
                    {copiedId === activeTrip.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="text-[10px] font-bold whitespace-nowrap">{copiedLabel}</span>
                      </>
                    ) : (
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {images.length > 1 && (
                  <>
                    <span className="pointer-events-none absolute bottom-3 end-3 z-10 rounded-md bg-[#0F2233]/78 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs tabular-nums">
                      {imageIndex + 1} / {images.length}
                    </span>
                    <button
                      type="button"
                      onClick={isRtl ? nextImage : prevImage}
                      className="absolute start-3 top-1/2 -translate-y-1/2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0F2233] hover:bg-white shadow-sm cursor-pointer"
                      aria-label="Previous trip image"
                    >
                      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={isRtl ? prevImage : nextImage}
                      className="absolute end-3 top-1/2 -translate-y-1/2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0F2233] hover:bg-white shadow-sm cursor-pointer"
                      aria-label="Next trip image"
                    >
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </button>
                    <div className="absolute bottom-3 inset-x-0 z-10 flex items-center justify-center gap-1.5">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageIndex(idx)}
                          aria-label={`Photo ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === imageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#475569] tabular-nums">
                  {activeTrip.reviewCount > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1 text-[#0F2233] font-semibold">
                        <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                        {activeTrip.rating.toFixed(1)}
                        <span className="font-normal text-[#475569]">({activeTrip.reviewCount})</span>
                      </span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    {tText(activeTrip.duration, lang)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#EE5426]">
                    {formatTripScheduleSummary(activeTrip, lang, false)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#0F2233]">
                    <CalendarDays className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    {formatTripOperatingDaysLabel(activeTrip, lang)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTrip.destination}</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#0F2233] leading-snug">
                  {activeName}
                </h3>

                <p className="text-sm text-[#475569] leading-relaxed">
                  {tText(activeTrip.shortDescription, lang)}
                </p>

                {activeTrip.options && activeTrip.options.length > 0 && (
                  <div className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED]/60 px-3 py-2 text-xs text-[#0F2233]">
                    <span className="font-semibold text-[#EE5426] tabular-nums">
                      {activeTrip.options.length} {t.optionsCountSuffix}:{' '}
                    </span>
                    <span className="text-[#475569]">
                      {activeTrip.options.map((opt) => tText(opt.title, lang)).join(' · ')}
                    </span>
                  </div>
                )}

                <div className="pt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#EE5426]">
                  {activeTrip.familyFriendly && <span>{t.familyFriendly}</span>}
                  {activeTrip.womenFriendly && (
                    <>
                      {activeTrip.familyFriendly && (
                        <span aria-hidden="true" className="text-[#94A3B8]">·</span>
                      )}
                      <span>{t.womenFriendly}</span>
                    </>
                  )}
                  {activeTrip.minChildAge !== undefined && (
                    <>
                      {(activeTrip.familyFriendly || activeTrip.womenFriendly) && (
                        <span aria-hidden="true" className="text-[#94A3B8]">·</span>
                      )}
                      <span className="text-[#475569] tabular-nums">
                        {t.minChildAge}: {activeTrip.minChildAge}+
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C8C2B8]/50 dark:border-[#334155] pt-4">
              <div className="tabular-nums">
                {activeTrip.pricingMode === 'per-group' ? (
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F2233]">
                      {formatTripLockupPrice(activeTrip.price, currency, lang, currency !== 'EUR')}
                    </span>
                    <span className="text-xs font-medium text-[#64748B]">
                      · {formatPerGroupUnitLabel(activeTrip, lang)}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="block text-[11px] font-medium text-[#64748B]">
                      {fromWord} · {tText({ en: 'per adult', ar: 'للبالغ', de: 'pro Erw.' }, lang)}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F2233]">
                      {formatCurrencyPrice(activeTrip.price, currency, currency !== 'EUR')}
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-col items-stretch sm:items-end gap-1 flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => onBookTrip(activeTrip)}
                  className="btn-wasla-primary min-h-[44px] w-full sm:w-auto rounded-lg px-7 py-2.5 text-sm whitespace-nowrap cursor-pointer"
                >
                  {t.bookNow}
                </button>
                <p className="text-[11px] text-[#64748B] text-center sm:text-end leading-tight">
                  {t.bookNowMicrocopy || I18N.en.bookNowMicrocopy}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* List half with keyword search, sorting, destination & trait filters */}
      <div className="card-wasla order-1 lg:order-2 p-4 sm:p-5 lg:pb-0 flex flex-col lg:min-h-0">
        <div className="shrink-0 flex flex-col gap-2.5 pb-3 mb-2 border-b border-[#C8C2B8]/50 dark:border-[#334155]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#475569]">{t.allTripsListHeading}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#475569] tabular-nums">
                {filteredListTrips.length}{' '}
                {filteredListTrips.length === 1 ? t.tripsCountSingle : t.tripsCountPlural}
              </span>
              <div className="flex items-center gap-1 lg:hidden">
                <button
                  type="button"
                  onClick={() => scrollList(-1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F2233] hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer"
                  aria-label="Scroll previous trips"
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollList(1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F2233] hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer"
                  aria-label="Scroll next trips"
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Keyword Search + Sort Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={tText(
                  {
                    en: 'Search Orange Bay, Quad, Luxor, Snorkeling…',
                    ar: 'ابحث: أورانج باي، سفاري، الأقصر، سنوركلينج…',
                    de: 'Suche: Orange Bay, Quad, Luxor, Schnorcheln…',
                  },
                  lang
                )}
                className="min-h-[38px] w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] ps-8.5 pe-8 text-xs text-[#0F2233] placeholder:text-[#94A3B8] focus:border-[#EE5426] focus:bg-white focus:outline-none"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  aria-label="Clear search"
                  className="absolute end-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[#64748B] hover:text-[#0F2233] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative shrink-0">
              <ArrowUpDown
                className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]"
                aria-hidden="true"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ExplorerSort)}
                aria-label={tText({ en: 'Sort trips', ar: 'ترتيب الرحلات', de: 'Sortieren' }, lang)}
                className="min-h-[38px] w-full sm:w-auto rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] ps-8 pe-3 text-xs font-medium text-[#0F2233] focus:border-[#EE5426] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="featured">
                  {tText({ en: 'Featured', ar: 'المميزة أولاً', de: 'Empfohlen' }, lang)}
                </option>
                <option value="price-asc">
                  {tText({ en: 'Price: Low → High', ar: 'السعر: الأقل أولاً', de: 'Preis: Aufsteigend' }, lang)}
                </option>
                <option value="price-desc">
                  {tText({ en: 'Price: High → Low', ar: 'السعر: الأعلى أولاً', de: 'Preis: Absteigend' }, lang)}
                </option>
                <option value="rating-desc">
                  {tText({ en: 'Top Rated', ar: 'الأعلى تقييماً', de: 'Bestbewertet' }, lang)}
                </option>
              </select>
            </div>
          </div>

          {/* Destination & Smart Attribute Filters */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: 'all', label: tText({ en: 'All', ar: 'الكل', de: 'Alle' }, lang) },
              { id: 'Hurghada', label: t.quickJumpHurghada },
              { id: 'Marsa Alam', label: t.quickJumpMarsa },
              { id: 'Luxor', label: t.quickJumpLuxor },
              { id: 'Cairo', label: t.quickJumpCairo },
              ...(favoriteTripIds.length > 0
                ? [{ id: 'favorites', label: `♥ (${favoriteTripIds.length})` }]
                : []),
            ].map((pill) => {
              const isActive = quickFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setQuickFilter(pill.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-[#EE5426] text-white shadow-xs'
                      : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#FDBA74] hover:text-[#EE5426]'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setFamilyOnly((v) => !v)}
              aria-pressed={familyOnly}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                familyOnly
                  ? 'bg-[#0F2233] text-white'
                  : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#0F2233]'
              }`}
            >
              {t.familyFriendly}
            </button>

            <button
              type="button"
              onClick={() => setWomenOnly((v) => !v)}
              aria-pressed={womenOnly}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                womenOnly
                  ? 'bg-[#0F2233] text-white'
                  : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#0F2233]'
              }`}
            >
              {t.womenFriendly}
            </button>

            {hasLocalFilter && (
              <button
                type="button"
                onClick={resetLocalFilters}
                className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#EE5426] hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                {tText({ en: 'Reset', ar: 'إعادة ضبط', de: 'Reset' }, lang)}
              </button>
            )}
          </div>
        </div>

        {filteredListTrips.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center space-y-2.5">
            <p className="text-xs sm:text-sm font-semibold text-[#0F2233]">
              {tText(
                {
                  en: 'No excursions found for this filter combination.',
                  ar: 'لا توجد رحلات متاحة بهذا الفلتر حالياً.',
                  de: 'Keine Ausflüge für diese Filterkombination gefunden.',
                },
                lang
              )}
            </p>
            <button
              type="button"
              onClick={resetLocalFilters}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#EE5426] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#EE5426] hover:bg-[#EE5426] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{tText({ en: 'Reset filters', ar: 'إعادة ضبط الفلاتر', de: 'Filter zurücksetzen' }, lang)}</span>
            </button>
          </div>
        ) : (
          <div className="lg:relative lg:flex-1 lg:min-h-0">
            <div
              ref={listRef}
              className="explorer-list-scroll carousel-track flex flex-row gap-3 overflow-x-auto snap-x snap-proximity pb-1 lg:absolute lg:inset-0 lg:flex-col lg:gap-2 lg:overflow-y-auto lg:overflow-x-hidden lg:pb-4 lg:pe-1.5"
            >
            {filteredListTrips.map((trip) => {
              const isSelected = activeTrip?.id === trip.id;
              const isFav = favoriteTripIds.includes(trip.id);
              const tripName = tripDisplayName(trip, lang);
              return (
                <div
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTrip(trip.id);
                    }
                  }}
                  className={`group snap-start shrink-0 w-[82%] sm:w-[48%] lg:w-full text-start flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#EE5426] bg-[#FFF7ED] shadow-xs'
                      : 'border-[#E2E8F0] lg:border-transparent bg-[#F8FAFC]/60 lg:bg-transparent hover:bg-[#FFF7ED]/50'
                  }`}
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-[#E2E8F0]">
                    <SmartImage
                      src={trip.images[0]}
                      alt={tripName}
                      loading="lazy"
                      className="h-full w-full"
                      placeholderLabel={trip.destination}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0F2233] truncate">{tripName}</p>
                      <span className="shrink-0 text-xs font-bold text-[#EE5426] tabular-nums">
                        {formatCurrencyPrice(trip.price, currency)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#475569] tabular-nums">
                      <span className="inline-flex items-center gap-0.5 text-[#0F2233] font-medium">
                        <MapPin className="h-3 w-3 text-[#EE5426] shrink-0" aria-hidden="true" />
                        {trip.destination}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{tText(trip.duration, lang)}</span>
                      {trip.reviewCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                            {trip.rating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, trip)}
                      aria-label={shareLabel}
                      title={copiedId === trip.id ? copiedLabel : shareLabel}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all cursor-pointer ${
                        copiedId === trip.id
                          ? 'border-[#16A34A] bg-[#16A34A] text-white shadow-xs'
                          : 'border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#EE5426] hover:text-[#EE5426]'
                      }`}
                    >
                      {copiedId === trip.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(trip);
                        }}
                        aria-pressed={isFav}
                        aria-label="Toggle favorite"
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all cursor-pointer ${
                          isFav
                            ? 'border-[#E11D48] bg-[#E11D48] text-white shadow-xs'
                            : 'border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#E11D48] hover:text-[#E11D48]'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-white text-white' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
