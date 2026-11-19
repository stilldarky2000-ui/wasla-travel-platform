import React, { useState } from 'react';
import { Check, Clock, Heart, MapPin, Share2, Star } from 'lucide-react';
import { Lang, Translations } from '../data/i18n';
import {
  CATEGORIES,
  CATEGORY_FALLBACK_IMAGE,
  CurrencyCode,
  Trip,
  formatCurrencyPrice,
  formatTripScheduleSummary,
  tText,
} from '../data/marketplaceData';
import { shareTripItem } from '../lib/shareTrip';
import { SmartImage } from './SmartImage';

interface TripCardProps {
  trip: Trip;
  lang: Lang;
  t: Translations;
  currency?: CurrencyCode;
  onSelect: (trip: Trip) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (trip: Trip) => void;
  revealIndex?: number;
}

function getTripHighlightsSummary(trip: Trip, lang: Lang): string[] {
  const tags: string[] = [];

  if (trip.category === 'transfers') {
    tags.push(
      tText({ en: 'Flight tracking', ar: 'متابعة الطيران', de: 'Flugverfolgung' }, lang),
      tText({ en: 'Private A/C vehicle', ar: 'سيارة مكيفة خاصة', de: 'Klimatisierter Privatwagen' }, lang)
    );
    return tags;
  }

  const includedText = trip.included.map((i) => i.en.toLowerCase()).join(' ');
  const descText = trip.shortDescription.en.toLowerCase();

  if (descText.includes('8-seat') || descText.includes('8 guests') || includedText.includes('8-seat')) {
    tags.push(tText({ en: 'Small van · max 8', ar: 'ميني فان · بحد أقصى 8', de: 'Kleinbus · max. 8' }, lang));
  } else if (descText.includes('16 guests') || trip.highlights.some((h) => h.en.includes('16 guests'))) {
    tags.push(tText({ en: 'Small group · max 16', ar: 'مجموعة صغيرة · حد أقصى 16', de: 'Kleingruppe · max. 16' }, lang));
  } else if (trip.category === 'guides' || trip.category === 'city' || trip.category === 'shopping') {
    tags.push(tText({ en: 'Private local host', ar: 'مرافق محلي خاص', de: 'Privater lokaler Guide' }, lang));
  }

  if (includedText.includes('lunch') || includedText.includes('supper') || descText.includes('lunch')) {
    tags.push(tText({ en: 'Lunch included', ar: 'يشمل الغداء', de: 'Mittagessen inkl.' }, lang));
  } else if (includedText.includes('snorkel')) {
    tags.push(tText({ en: 'Snorkel gear incl.', ar: 'معدات الغطس مشمولة', de: 'Schnorchelset inkl.' }, lang));
  } else if (includedText.includes('certificate') || trip.id.includes('balloon')) {
    tags.push(tText({ en: 'Sunrise flight', ar: 'رحلة شروق', de: 'Sonnenaufgangsflug' }, lang));
  } else if (includedText.includes('felucca')) {
    tags.push(tText({ en: 'Private felucca', ar: 'فلوكة خاصة', de: 'Private Felukke' }, lang));
  } else if (trip.options && trip.options.length > 1) {
    tags.push(
      tText(
        { en: `${trip.options.length} tour options`, ar: `${trip.options.length} خيارات متاحة`, de: `${trip.options.length} Optionen` },
        lang
      )
    );
  }

  if (tags.length < 2 && trip.pickup && !trip.pickup.en.toLowerCase().includes('extra')) {
    tags.push(tText({ en: 'Hotel pickup', ar: 'توصيل الفندق', de: 'Hotelabholung' }, lang));
  } else if (tags.length < 2 && trip.kidsDiscount) {
    tags.push(tText(trip.kidsDiscount, lang));
  }

  return tags.slice(0, 2);
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  lang,
  t,
  currency = 'EUR',
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  revealIndex = 0,
}) => {
  const [shareCopied, setShareCopied] = useState(false);

  const cardHighlights = getTripHighlightsSummary(trip, lang);
  const categoryObj = CATEGORIES.find((c) => c.id === trip.category);
  const categoryLabel = categoryObj ? tText(categoryObj.name, lang) : trip.category;

  const safeRating = Number(trip.rating ?? 5).toFixed(1);
  const displayPrice = formatCurrencyPrice(trip.price, currency);
  const fromWord = tText({ en: 'From', ar: 'من', de: 'Ab' }, lang);
  const perShort = tText({ en: 'person', ar: 'فرد', de: 'Pers.' }, lang);

  const favoriteLabel = isFavorite
    ? tText({ en: 'Remove from favorites', ar: 'إزالة من المفضلة', de: 'Aus Favoriten entfernen' }, lang)
    : tText({ en: 'Save to favorites', ar: 'إضافة إلى المفضلة', de: 'Zu Favoriten hinzufügen' }, lang);

  const shareLabel = shareCopied
    ? tText({ en: 'Link copied', ar: 'تم نسخ الرابط', de: 'Link kopiert' }, lang)
    : tText({ en: 'Share trip', ar: 'مشاركة الرحلة', de: 'Ausflug teilen' }, lang);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareTripItem(trip, lang, currency);
    if (result === 'copied') {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2200);
    }
  };

  return (
    <article
      data-wasla-revealed="1"
      style={{ '--reveal-delay': `${Math.min(revealIndex, 4) * 70}ms` } as React.CSSProperties}
      onClick={() => onSelect(trip)}
      className={`wasla-trip-card reveal-item is-revealed snap-start shrink-0 basis-[82%] sm:basis-[calc((100%-20px)/2)] lg:basis-[calc((100%-60px)/4)] flex flex-col justify-between rounded-2xl border bg-white overflow-hidden cursor-pointer group ${
        isFavorite
          ? 'border-[#E11D48] ring-2 ring-[#E11D48]/20'
          : 'border-[#E2E8F0] hover:border-[#FED7AA]'
      }`}
    >
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[#E2E8F0]">
          <SmartImage
            src={trip.images?.[0]}
            fallbackSrc={CATEGORY_FALLBACK_IMAGE[trip.category]}
            alt={tText(trip.name, lang)}
            loading="eager"
            className="h-full w-full group-hover:scale-[1.05] transition-transform duration-500 ease-out"
            placeholderLabel={tText(trip.name, lang)}
          />

          {/* Top-Start Category Tag */}
          <div className="pointer-events-none absolute top-2.5 start-2.5 z-20">
            <span className="inline-flex items-center rounded-md bg-[#0F172A]/75 px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-[#FFF7ED] backdrop-blur-xs">
              {categoryLabel}
            </span>
          </div>

          {/* Top-End Share + Favorite Action Buttons */}
          <div className="absolute top-2.5 end-2.5 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              aria-label={shareLabel}
              title={shareLabel}
              className={`inline-flex h-9 items-center justify-center gap-1 rounded-full transition-all duration-200 active:scale-90 cursor-pointer ${
                shareCopied
                  ? 'border border-emerald-300/60 bg-emerald-600 px-2.5 text-[11px] font-bold text-white shadow-md'
                  : 'w-9 border border-white/40 bg-[#0F172A]/65 text-white hover:bg-[#EA580C] hover:border-white/75 backdrop-blur-xs shadow-xs'
              }`}
            >
              {shareCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white shrink-0" aria-hidden="true" />
                  <span>{tText({ en: 'Copied', ar: 'تم النسخ', de: 'Kopiert' }, lang)}</span>
                </>
              ) : (
                <Share2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              )}
            </button>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(trip);
                }}
                aria-pressed={isFavorite}
                aria-label={favoriteLabel}
                title={favoriteLabel}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 active:scale-90 cursor-pointer ${
                  isFavorite
                    ? 'border border-white/50 bg-[#E11D48] text-white shadow-[0_6px_18px_rgba(225,29,72,0.55)] scale-105'
                    : 'border border-white/40 bg-[#0F172A]/65 text-white hover:bg-[#E11D48]/90 hover:border-white/75 backdrop-blur-xs shadow-xs'
                }`}
              >
                <Heart
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isFavorite ? 'fill-white text-white scale-110' : 'text-white'
                  }`}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1C1008]/90 via-[#1C1008]/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3.5 pb-2.5 pt-4 text-white">
            <div className="flex items-center justify-between gap-2 text-[11.5px] text-[#FFF7ED] tabular-nums">
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <Star className="h-3.5 w-3.5 fill-[#F0B85A] text-[#F0B85A]" aria-hidden="true" />
                {safeRating}
                <span className="font-normal text-[#FED7AA]">({trip.reviewCount})</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[#FFF7ED] truncate">
                <MapPin className="h-3 w-3 text-[#FDBA74] shrink-0" aria-hidden="true" />
                <span className="truncate">{trip.destination}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#52525B] tabular-nums">
            <span className="inline-flex items-center gap-1 shrink-0">
              <Clock className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
              {tText(trip.duration, lang)}
            </span>
            <span className="truncate text-[11.5px] text-[#475569]">
              {formatTripScheduleSummary(trip, lang, true)}
            </span>
          </div>

          <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#EA580C] transition-colors">
            {tText(trip.name, lang)}
          </h3>

          {cardHighlights.length > 0 && (
            <p className="text-[11.5px] font-medium text-[#64748B] truncate">
              {cardHighlights.join(' · ')}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] bg-white px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
        <div className="inline-flex items-baseline gap-1 tabular-nums tracking-normal">
          <span className="text-[11px] font-medium text-[#64748B]">{fromWord}</span>
          <span className="text-[16px] font-bold text-[#0F172A]">{displayPrice}</span>
          <span className="text-[11px] font-medium text-[#64748B]">/ {perShort}</span>
        </div>

        <span className="wasla-book-glare inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-semibold tracking-normal text-white whitespace-nowrap shrink-0">
          <span>{t.viewTrip}</span>
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </article>
  );
};
