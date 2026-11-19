import { Lang } from '../data/i18n';

export function normalizeWhatsAppDigits(raw: string): string {
  return raw.replace(/\D/g, '') || '201129155520';
}

export function formatWhatsAppDisplay(raw: string): string {
  const digits = normalizeWhatsAppDigits(raw);
  if (digits === '201129155520') return '+20 112 915 5520';
  return raw.startsWith('+') ? raw : `+${digits}`;
}

export interface WhatsAppBookingPayload {
  id: string;
  tripTitle: string;
  date: string;
  tripStartTime?: string;
  adults: number;
  children: number;
  infants?: number;
  totalEur: number;
  hotel: string;
  roomNumber?: string;
  guestName: string;
  guestCountry?: string;
  whatsapp?: string;
  email?: string;
  contact: string;
  notes?: string;
}

export function buildBookingWhatsAppUrl(
  whatsappNumber: string,
  booking: WhatsAppBookingPayload,
  lang: Lang
): string {
  const digits = normalizeWhatsAppDigits(whatsappNumber);
  const waDisplay = booking.whatsapp || booking.contact;
  const emailDisplay = booking.email || '';
  const rawNationality = booking.guestCountry?.trim() || '';
  const nationalityDisplay = rawNationality.toLowerCase() === 'guest' ? '' : rawNationality;
  const infantsCount = booking.infants ?? 0;
  const totalHeadcount = booking.adults + booking.children + infantsCount;
  const startTimeDisplay = booking.tripStartTime?.trim() || '';
  const roomDisplay = booking.roomNumber?.trim() || '';
  const hotelLine = roomDisplay ? `${booking.hotel} (Room ${roomDisplay})` : booking.hotel;
  const isCustomQuote = !Number.isFinite(booking.totalEur) || booking.totalEur <= 0;

  const lines =
    lang === 'ar'
      ? [
          `مرحباً وصلة ترافل، أرغب بتأكيد تيكت حجزي (${booking.id}):`,
          `• الرحلة / الأوبشن: ${booking.tripTitle}`,
          `• التاريخ: ${booking.date}`,
          startTimeDisplay ? `• توقيت بداية الرحلة: ${startTimeDisplay}` : '',
          `• الفندق / التوصيل: ${hotelLine}`,
          `• الأفراد: ${booking.adults} بالغ${booking.children > 0 ? ` + ${booking.children} طفل` : ''}${infantsCount > 0 ? ` + ${infantsCount} رضيع INF (مجاناً)` : ''} (إجمالي الكشف: ${totalHeadcount} فرد)`,
          isCustomQuote
            ? `• السعر: عرض سعر مخصص (يرسله فريق العمليات قبل التأكيد)`
            : `• الإجمالي التقديري: €${booking.totalEur} (الدفع كاش عند الاستلام أو عبر رابط الدفع الرسمي بعد التأكيد)`,
          `• الاسم: ${booking.guestName}`,
          nationalityDisplay ? `• الجنسية: ${nationalityDisplay}` : '',
          `• رقم الواتساب: ${waDisplay}`,
          emailDisplay ? `• البريد الإلكتروني (لإرسال البيك أب): ${emailDisplay}` : '',
          booking.notes ? `• ملاحظات: ${booking.notes}` : '',
        ]
      : lang === 'de'
      ? [
          `Hallo Wasla Travel, hier ist mein Buchungsticket (${booking.id}):`,
          `• Tour / Option: ${booking.tripTitle}`,
          `• Datum: ${booking.date}`,
          startTimeDisplay ? `• Tour-Startzeit: ${startTimeDisplay}` : '',
          `• Hotel / Abholort: ${hotelLine}`,
          `• Personen: ${booking.adults} Erw.${booking.children > 0 ? ` + ${booking.children} Kind(er)` : ''}${infantsCount > 0 ? ` + ${infantsCount} Kleinkind/INF (Kostenlos)` : ''} (Gesamt: ${totalHeadcount} Pers.)`,
          isCustomQuote
            ? `• Preis: Individuelles Angebot (vom Operations-Team vor Bestätigung)`
            : `• Gesamtpreis: €${booking.totalEur} (Bar bei Abholung oder offizieller Zahlungslink nach Bestätigung)`,
          `• Name: ${booking.guestName}`,
          nationalityDisplay ? `• Nationalität: ${nationalityDisplay}` : '',
          `• WhatsApp: ${waDisplay}`,
          emailDisplay ? `• E-Mail (für Abholinfos): ${emailDisplay}` : '',
          booking.notes ? `• Hinweise: ${booking.notes}` : '',
        ]
      : [
          `Hello Wasla Travel, I would like to confirm my booking ticket (${booking.id}):`,
          `• Trip / Option: ${booking.tripTitle}`,
          `• Date: ${booking.date}`,
          startTimeDisplay ? `• Trip Start Time: ${startTimeDisplay}` : '',
          `• Hotel / Pickup: ${hotelLine}`,
          `• Guests: ${booking.adults} Adult(s)${booking.children > 0 ? ` + ${booking.children} Child(ren)` : ''}${infantsCount > 0 ? ` + ${infantsCount} Infant/INF (Free)` : ''} (Total headcount: ${totalHeadcount})`,
          isCustomQuote
            ? `• Price: Custom quote (sent by Operations before confirmation)`
            : `• Estimated Total: €${booking.totalEur} (Cash on pickup or official payment link after confirmation)`,
          `• Guest Name: ${booking.guestName}`,
          nationalityDisplay ? `• Nationality: ${nationalityDisplay}` : '',
          `• WhatsApp: ${waDisplay}`,
          emailDisplay ? `• Email (for pickup details): ${emailDisplay}` : '',
          booking.notes ? `• Notes: ${booking.notes}` : '',
        ];

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`;
}

export function buildGuestPickupWhatsAppUrl(params: {
  guestWhatsapp?: string;
  guestContact: string;
  bookingId: string;
  guestName: string;
  tripTitle: string;
  date: string;
  tripStartTime?: string;
  pickupTime: string;
  pickupSpot?: string;
  hotel: string;
  roomNumber?: string;
  driverOrGuide?: string;
}): string | null {
  const candidate = (params.guestWhatsapp || params.guestContact || '').trim();
  const digits = candidate.replace(/\D/g, '');
  if (digits.length < 7) return null;

  const spotText =
    params.pickupSpot === 'Outside Main Gate'
      ? 'Outside Hotel Main Gate (أمام البوابة الخارجية)'
      : 'Inside Hotel Reception / Lobby (أمام الريسبشن)';
  const hotelLine = params.roomNumber?.trim()
    ? `${params.hotel} (Room ${params.roomNumber.trim()})`
    : params.hotel;
  const pickupDisplay =
    !params.pickupTime || params.pickupTime === 'TBD'
      ? 'TBD (Confirmed evening prior)'
      : params.pickupTime;

  const text = [
    `Hello ${params.guestName}, your Wasla Travel pickup is ready (${params.bookingId})!`,
    `• Trip: ${params.tripTitle}`,
    `• Date: ${params.date}`,
    params.tripStartTime?.trim() ? `• Trip Start Time: ${params.tripStartTime.trim()}` : '',
    `• Hotel Pickup Time: ${pickupDisplay}`,
    `• Meeting Point: ${spotText}`,
    `• Hotel / Location: ${hotelLine}`,
    `• Guide / Driver: ${params.driverOrGuide || 'Assigned at pickup point'}`,
    `Need help? Reply here anytime.`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function buildGuestPickupMailtoUrl(params: {
  guestEmail?: string;
  guestContact: string;
  bookingId: string;
  guestName: string;
  tripTitle: string;
  date: string;
  tripStartTime?: string;
  pickupTime: string;
  pickupSpot?: string;
  hotel: string;
  roomNumber?: string;
  driverOrGuide?: string;
}): string | null {
  const emailMatch = (params.guestEmail || params.guestContact || '').match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );
  if (!emailMatch) return null;
  const email = emailMatch[0];
  const spotText =
    params.pickupSpot === 'Outside Main Gate'
      ? 'Outside Hotel Main Gate'
      : 'Inside Hotel Reception / Lobby';
  const hotelLine = params.roomNumber?.trim()
    ? `${params.hotel} (Room ${params.roomNumber.trim()})`
    : params.hotel;
  const pickupDisplay =
    !params.pickupTime || params.pickupTime === 'TBD'
      ? 'TBD (Confirmed evening prior)'
      : params.pickupTime;
  const subject = `Wasla Travel Pickup Confirmation — ${params.bookingId} (${params.date})`;
  const body = [
    `Dear ${params.guestName},`,
    ``,
    `Thank you for booking with Wasla Travel (waslatravel.com). Here are your pickup details:`,
    `Booking Reference: ${params.bookingId}`,
    `Trip: ${params.tripTitle}`,
    `Date: ${params.date}`,
    params.tripStartTime?.trim() ? `Trip Start Time: ${params.tripStartTime.trim()}` : '',
    `Hotel Pickup Time: ${pickupDisplay}`,
    `Meeting Spot: ${spotText}`,
    `Hotel / Pickup Location: ${hotelLine}`,
    `Driver / Guide: ${params.driverOrGuide || 'Will greet you at the pickup point'}`,
    ``,
    `Best regards,`,
    `Wasla Travel Operations Desk`,
    `WhatsApp: +20 112 915 5520 | info@waslatravel.com`,
  ]
    .filter((line, idx, arr) => line !== '' || (idx === 1 || idx === arr.length - 4))
    .join('\n');

  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
