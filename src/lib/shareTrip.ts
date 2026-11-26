import { Lang } from '../data/i18n';
import { CurrencyCode, Trip, formatCurrencyPrice, tText, tripDisplayName } from '../data/marketplaceData';
import { sanitizeBookingId } from '../hooks/useBookingReviewVerification';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled';

export function buildTripShareUrl(tripId: string): string {
  const cleanTripId = tripId.trim().slice(0, 128);
  if (typeof window === 'undefined') return `https://waslatravel.com/?trip=${encodeURIComponent(cleanTripId)}`;
  const url = new URL(window.location.href);
  url.searchParams.delete('review');
  url.searchParams.delete('bookingId');
  url.searchParams.set('trip', cleanTripId);
  url.hash = '';
  return url.toString();
}

export function buildPostTripReviewUrl(tripId: string, bookingId: string): string {
  const base =
    typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://waslatravel.com/';
  const url = new URL(base);
  const cleanTripId = tripId.trim().slice(0, 128);
  const cleanBookingId = sanitizeBookingId(bookingId);
  if (cleanTripId) url.searchParams.set('trip', cleanTripId);
  if (cleanBookingId) url.searchParams.set('review', cleanBookingId);
  return url.toString();
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

export async function shareTripItem(
  trip: Trip,
  lang: Lang,
  currency: CurrencyCode = 'EUR'
): Promise<ShareOutcome> {
  const title = `${tripDisplayName(trip, lang)}, Wasla Travel`;
  const priceText = formatCurrencyPrice(trip.price, currency);
  const shortDesc = tText(trip.shortDescription, lang);
  const shareUrl = buildTripShareUrl(trip.id);

  const text =
    lang === 'ar'
      ? `${tripDisplayName(trip, lang)} (${trip.destination})، ابتداءً من ${priceText} عبر وصلة ترافيل: ${shortDesc}`
      : lang === 'de'
      ? `${tripDisplayName(trip, lang)} (${trip.destination}), ab ${priceText} bei Wasla Travel: ${shortDesc}`
      : `${tripDisplayName(trip, lang)} (${trip.destination}), from ${priceText} with Wasla Travel: ${shortDesc}`;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Fall through to clipboard copy if navigator.share fails in iframe/webview
    }
  }

  const ok = await copyTextToClipboard(shareUrl);
  return ok ? 'copied' : 'cancelled';
}
