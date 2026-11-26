import React, { useEffect, useState } from 'react';
import { Check, Clock, Heart, MapPin, Share2, Star, Trash2, X } from 'lucide-react';
import { Lang, Translations } from '../data/i18n';
import {
  CATEGORIES,
  CurrencyCode,
  Trip,
  formatCurrencyPrice,
  tText, tripDisplayName,
} from '../data/marketplaceData';
import { shareTripItem } from '../lib/shareTrip';
import { formatPerGroupUnitLabel, formatTripLockupPrice } from '../lib/tripPricing';
import { SmartImage } from './SmartImage';

interface FavoritesModalProps {
  open: boolean;
  trips: Trip[];
  lang: Lang;
  t: Translations;
  currency: CurrencyCode;
  isRtl: boolean;
  onClose: () => void;
  onToggleFavorite: (trip: Trip) => void;
  onClearAll: () => void;
  onSelectTripForBooking: (trip: Trip) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  open,
  trips,
  lang,
  t,
  currency,
  isRtl,
  onClose,
  onToggleFavorite,
  onClearAll,
  onSelectTripForBooking,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || trips.length === 0) return null;

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

  const labels = {
    title: tText(
      {
        en: 'Your Saved Favorite Trips',
        ar: 'رحلاتك المفضلة',
        de: 'Ihre gespeicherten Favoriten',
      },
      lang
    ),
    subtitle: tText(
      {
        en: 'All excursions you marked with a heart, ready to review and book anytime',
        ar: 'الرحلات والأنشطة التي اخترتها بعلامة القلب للرجوع إليها وحجزها بسهولة',
        de: 'Alle Ausflüge, die Sie mit einem Herz markiert haben, jederzeit bereit zur Buchung',
      },
      lang
    ),
    clearAll: tText({ en: 'Clear all', ar: 'مسح المفضلة', de: 'Alle entfernen' }, lang),
    remove: tText({ en: 'Remove from favorites', ar: 'إزالة من المفضلة', de: 'Entfernen' }, lang),
    share: tText({ en: 'Share trip', ar: 'مشاركة الرحلة', de: 'Ausflug teilen' }, lang),
    copied: tText({ en: 'Copied', ar: 'تم النسخ', de: 'Kopiert' }, lang),
    bookThis: tText({ en: 'Book This Trip', ar: 'احجز هذه الرحلة', de: 'Jetzt buchen' }, lang),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/70 p-2 sm:p-4 md:p-6 backdrop-blur-xs"
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-modal-title"
      onClick={onClose}
    >
      <div
        className="card-wasla p-0 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="shrink-0 bg-gradient-to-r from-[#EE5426] to-[#D9461B] flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 text-white border-b border-white/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15">
              <Heart className="h-4.5 w-4.5 fill-white text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="favorites-modal-title"
                className="font-display text-lg sm:text-xl font-semibold leading-tight text-white"
              >
                {labels.title} ({trips.length})
              </h2>
              <p className="text-xs text-[#FAF4ED]/90 truncate sm:whitespace-normal">{labels.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{labels.clearAll}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.modalClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trips.map((trip) => {
              const cat = CATEGORIES.find((c) => c.id === trip.category);
              const catName = cat ? tText(cat.name, lang) : trip.category;
              const safeRating = Number(trip.rating ?? 5).toFixed(1);

              return (
                <article
                  key={trip.id}
                  className="card-wasla p-0 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[#C8C2B8]/50 dark:border-[#334155]">
                      <SmartImage
                        src={trip.images?.[0]}
                        alt={tripDisplayName(trip, lang)}
                        className="h-full w-full object-cover"
                        placeholderLabel={tripDisplayName(trip, lang)}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F2233]/90 via-[#0F2233]/35 to-transparent" />

                      <div className="absolute top-2.5 end-2.5 z-20 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleShare(e, trip)}
                          aria-label={labels.share}
                          title={copiedId === trip.id ? labels.copied : labels.share}
                          className={`inline-flex h-9 items-center justify-center gap-1 rounded-full transition-all cursor-pointer ${
                            copiedId === trip.id
                              ? 'border border-white/60 bg-[#10B981] px-2.5 text-white shadow-md'
                              : 'w-9 border border-white/40 bg-[#0F2233]/70 text-white hover:bg-[#EE5426] backdrop-blur-xs shadow-md'
                          }`}
                        >
                          {copiedId === trip.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="text-[10px] font-bold whitespace-nowrap">{labels.copied}</span>
                            </>
                          ) : (
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleFavorite(trip)}
                          aria-label={labels.remove}
                          title={labels.remove}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-[#EF4444] text-white shadow-md hover:bg-[#DC2626] transition-all cursor-pointer"
                        >
                          <Heart className="h-4 w-4 fill-white text-white" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="absolute bottom-2.5 inset-x-3.5 text-white space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#FAF4ED]">
                          <span className="rounded bg-white/20 px-2 py-0.5 text-white backdrop-blur-xs">
                            {catName}
                          </span>
                          <span>·</span>
                          <span>{trip.destination}</span>
                        </div>
                        <h3 className="font-display text-base sm:text-lg font-semibold leading-snug text-white line-clamp-2">
                          {tripDisplayName(trip, lang)}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#C8C2B8]/50 dark:border-[#334155]">
                        <div className="flex items-center gap-1.5 text-[#334155]">
                          <Clock className="h-3.5 w-3.5 text-[#EE5426] shrink-0" />
                          <span className="truncate">{tText(trip.duration, lang)}</span>
                        </div>
                        {(trip.reviewCount ?? 0) > 0 && (
                          <div className="text-end">
                            <div className="inline-flex items-center gap-1 rounded-full bg-[#FAF4ED] border border-[#C8C2B8]/60 px-2.5 py-1 text-xs font-bold text-[#0F2233] tabular-nums">
                              <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                              <span>{safeRating}</span>
                              <span className="font-normal text-[#64748B]">({trip.reviewCount})</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                        {tText(trip.shortDescription, lang)}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11.5px] text-[#334155]">
                        <MapPin className="h-3.5 w-3.5 text-[#EE5426] shrink-0" />
                        <span className="truncate">{trip.destination}</span>
                      </div>

                      {(trip.familyFriendly || trip.womenFriendly) && (
                        <p className="text-[11.5px] font-medium text-[#64748B]">
                          {[
                            trip.familyFriendly ? t.familyFriendly : null,
                            trip.womenFriendly ? t.womenFriendly : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#C8C2B8]/50 dark:border-[#334155] bg-[#FAF4ED]/80 dark:bg-[#0F2233]/60 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="tabular-nums min-w-0">
                      {trip.pricingMode === 'per-group' ? (
                        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                          <span className="text-base font-bold text-[#0F2233] leading-tight">
                            {formatTripLockupPrice(trip.price, currency, lang)}
                          </span>
                          <span className="text-[11px] font-medium text-[#64748B] leading-tight">
                            · {formatPerGroupUnitLabel(trip, lang)}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-[10.5px] font-medium text-[#64748B]">
                            {tText({ en: 'From', ar: 'يبدأ من', de: 'Ab' }, lang)}
                          </p>
                          <p className="text-base font-bold text-[#0F2233] leading-tight">
                            {formatCurrencyPrice(trip.price, currency)}
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectTripForBooking(trip)}
                      className="btn-wasla-primary min-h-[40px] rounded-full px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
                    >
                      {labels.bookThis}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
