import React, { useEffect } from 'react';
import { Lang, Translations } from '../data/i18n';
import { CurrencyCode, Trip } from '../data/marketplaceData';
import { SafeStorefrontBookingRef } from '../hooks/useBookingReviewVerification';
import { BookingRequest, TripDetailTemplate } from './TripDetailTemplate';

export type { BookingRequest };

interface TripDetailModalProps {
  trip: Trip | null;
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

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  initialDate,
  whatsappNumber,
  contactEmail,
  previewMode = false,
  lang,
  t,
  currency = 'EUR',
  isFavorite = false,
  bookingStatusById,
  storefrontBookingRefs,
  relatedTrips,
  onSelectRelatedTrip,
  onToggleFavorite,
  onOpenPostTripReview,
  onClose,
  onSubmitBooking,
}) => {
  useEffect(() => {
    if (!trip) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [trip, onClose]);

  if (!trip) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#E2E8F0]/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-modal-title"
    >
      <TripDetailTemplate
        trip={trip}
        initialDate={initialDate}
        whatsappNumber={whatsappNumber}
        contactEmail={contactEmail}
        previewMode={previewMode}
        lang={lang}
        t={t}
        currency={currency}
        isFavorite={isFavorite}
        bookingStatusById={bookingStatusById}
        storefrontBookingRefs={storefrontBookingRefs}
        relatedTrips={relatedTrips}
        onSelectRelatedTrip={onSelectRelatedTrip}
        onToggleFavorite={onToggleFavorite}
        onOpenPostTripReview={onOpenPostTripReview}
        onClose={onClose}
        onSubmitBooking={onSubmitBooking}
      />
    </div>
  );
};
