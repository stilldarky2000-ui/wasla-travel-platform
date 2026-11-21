import type { Channel } from './notificationOutbox';
import { voucherToken } from './voucherAccess';
import { conversationLink } from './conversationMail';
import nodemailer, { type SendMailOptions } from 'nodemailer';
import { buildSingleLangWaslaEmailHtml, buildWaslaEmailHtml } from './waslaEmailTemplate';

export type BookingNotificationEventType = 'booking_created' | 'booking_confirmed' | 'test';

export interface BookingNotificationPayload {
  notificationCreatedAtMs?: number;
  bookingId: string;
  eventType: BookingNotificationEventType;
  tripTitle: string;
  destination: string;
  tripDate: string;
  startTime?: string;
  pickupTime?: string;
  pickupSpot?: string;
  assignedDriverOrGuide?: string;
  supplierName: string;
  guestName: string;
  guestCountry: string;
  guestLanguage?: string;
  guestWhatsapp?: string;
  guestEmail?: string;
  guestContact?: string;
  hotel: string;
  roomNumber?: string;
  adults: number;
  children: number;
  infants: number;
  grossEur: number;
  paymentStatus: string;
  notes?: string;
}

export interface BookingNotificationRecipients {
  ownerEmails: string[];
  publicSupportEmail?: string;
  ownerWhatsappDigits: string;
  ownerWhatsappDisplay: string;
  appUrl: string;
}

export interface BookingNotificationResult {
  ok: boolean;
  delivered: boolean;
  skipped?: string;
  email: { sent: boolean; provider: string; to: string; error?: string };
  guestEmail: { sent: boolean; provider: string; to: string; error?: string };
  whatsapp: { sent: boolean; provider: string; to: string; error?: string };
  webhook: { sent: boolean; error?: string };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readEnvAny(env: NodeJS.ProcessEnv, candidateNames: string[]): string {
  for (const name of candidateNames) {
    const direct = env[name];
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
  }
  const lowered = new Set(candidateNames.map((n) => n.toLowerCase()));
  for (const [k, v] of Object.entries(env)) {
    if (lowered.has(k.toLowerCase()) && typeof v === 'string' && v.trim()) {
      return v.trim();
    }
  }
  return '';
}

const META_WA_TOKEN_KEYS = [
  'WHATSAPP_CLOUD_TOKEN',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_TOKEN',
  'WHATSAPP_API_TOKEN',
  'META_WHATSAPP_TOKEN',
];

const META_WA_PHONE_ID_KEYS = [
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_PHONE_ID',
  'META_WHATSAPP_PHONE_NUMBER_ID',
  'META_WHATSAPP_PHONE_ID',
];

interface ResolvedSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

function resolveSmtpConfig(env: NodeJS.ProcessEnv = process.env): ResolvedSmtpConfig | null {
  const rawHost = readEnvAny(env, ['SMTP_HOST']);
  const user = readEnvAny(env, ['SMTP_USER']);
  const rawPass = readEnvAny(env, ['SMTP_PASS']);
  if (!rawHost || !user || !rawPass) return null;

  const cleanedHostWithPort = rawHost
    .replace(/^(?:https?|smtps?):\/\//i, '')
    .replace(/\/.*$/, '')
    .trim();

  let host = cleanedHostWithPort;
  let hostEmbeddedPort: number | undefined;
  const colonIdx = cleanedHostWithPort.lastIndexOf(':');
  if (colonIdx > 0) {
    const maybePort = Number(cleanedHostWithPort.slice(colonIdx + 1));
    if (Number.isInteger(maybePort) && maybePort > 0 && maybePort <= 65535) {
      host = cleanedHostWithPort.slice(0, colonIdx).trim();
      hostEmbeddedPort = maybePort;
    }
  }
  if (!host) return null;

  const parsedEnvPort = Number(String(env.SMTP_PORT || '').trim());
  const port =
    Number.isInteger(parsedEnvPort) && parsedEnvPort > 0 && parsedEnvPort <= 65535
      ? parsedEnvPort
      : hostEmbeddedPort || 465;

  const rawSecure = String(env.SMTP_SECURE || '').trim().toLowerCase();
  const secure =
    rawSecure === 'true' || rawSecure === '1'
      ? true
      : rawSecure === 'false' || rawSecure === '0'
      ? false
      : port === 465;

  const pass =
    /gmail\.com$/i.test(host) &&
    /^[a-zA-Z]{4}\s+[a-zA-Z]{4}\s+[a-zA-Z]{4}\s+[a-zA-Z]{4}$/.test(rawPass)
      ? rawPass.replace(/\s+/g, '')
      : rawPass;

  return { host, port, secure, user, pass };
}

function isRetryableSmtpTransportError(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  const code = String(e?.code || '').toUpperCase();
  const msg = String(e?.message || '').toLowerCase();
  return (
    code === 'ETIMEDOUT' ||
    code === 'ESOCKET' ||
    code === 'ECONNECTION' ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    msg.includes('wrong version number') ||
    msg.includes('greeting never received') ||
    msg.includes('connection timeout') ||
    msg.includes('unexpected socket close') ||
    msg.includes('ssl3_get_record')
  );
}

async function sendMailWithSmtpFallback(
  cfg: ResolvedSmtpConfig,
  mailOptions: SendMailOptions
): Promise<void> {
  const attemptSend = async (port: number, secure: boolean) => {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port,
      secure,
      requireTLS: !secure && port === 587,
      auth: { user: cfg.user, pass: cfg.pass },
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 12_000,
    });
    try {
      await transporter.sendMail(mailOptions);
    } finally {
      transporter.close();
    }
  };

  try {
    await attemptSend(cfg.port, cfg.secure);
  } catch (primaryErr) {
    if (!isRetryableSmtpTransportError(primaryErr)) throw primaryErr;
    const fallbackPort = cfg.port === 465 && cfg.secure ? 587 : 465;
    await attemptSend(fallbackPort, fallbackPort === 465);
  }
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function dispatchBookingNotifications(
  payload: BookingNotificationPayload,
  recipients: BookingNotificationRecipients,
  env: NodeJS.ProcessEnv = process.env,
  delivery?: { channel: Channel; idempotencyKey: string }
): Promise<BookingNotificationResult> {
  const isConfirmedUpdate = payload.eventType === 'booking_confirmed';

  const ownerEmails =
    recipients.ownerEmails.length > 0 ? recipients.ownerEmails : ['booking@waslatravel.com'];
  const publicSupportEmail =
    recipients.publicSupportEmail && EMAIL_REGEX.test(recipients.publicSupportEmail.trim())
      ? recipients.publicSupportEmail.trim()
      : 'booking@waslatravel.com';
  const ownerWaDigits = recipients.ownerWhatsappDigits.replace(/\D/g, '');
  const ownerWaDisplay =
    recipients.ownerWhatsappDisplay || (ownerWaDigits ? `+${ownerWaDigits}` : '+20 112 915 5520');
  const appUrl = (recipients.appUrl || 'https://waslatravel.com').replace(/\/$/, '');

  const guestEmail = String(payload.guestEmail || '').trim();
  const hasValidGuestEmail = EMAIL_REGEX.test(guestEmail);
  const guestWa = String(payload.guestWhatsapp || '').trim();
  const guestWaDigits = guestWa.replace(/\D/g, '');
  const guestWaLink = guestWaDigits ? `https://wa.me/${guestWaDigits}` : '';
  const guestContact = payload.guestContact || guestWa || guestEmail || 'N/A';

  type GuestEmailLangCode = 'en' | 'de' | 'ar' | 'fr' | 'it' | 'es' | 'nl' | 'pl' | 'ru';
  const rawLangInput = String(payload.guestLanguage || '').trim();
  const normalizedLangKey = rawLangInput.toLowerCase();
  const resolveGuestEmailLang = (): { code: GuestEmailLangCode; displayLabel: string } => {
    if (/^(de|german|deutsch|ألمان)/i.test(normalizedLangKey)) {
      return { code: 'de', displayLabel: 'German (Deutsch)' };
    }
    if (/^(ar|arabic|عرب)/i.test(normalizedLangKey)) {
      return { code: 'ar', displayLabel: 'Arabic (العربية)' };
    }
    if (/^(fr|french|français|فرنس)/i.test(normalizedLangKey)) {
      return { code: 'fr', displayLabel: 'French (Français)' };
    }
    if (/^(it|italian|italiano|إيطال)/i.test(normalizedLangKey)) {
      return { code: 'it', displayLabel: 'Italian (Italiano)' };
    }
    if (/^(es|spanish|español|إسبان)/i.test(normalizedLangKey)) {
      return { code: 'es', displayLabel: 'Spanish (Español)' };
    }
    if (/^(nl|dutch|nederlands|هولند)/i.test(normalizedLangKey)) {
      return { code: 'nl', displayLabel: 'Dutch (Nederlands)' };
    }
    if (/^(pl|polish|polski|بولند)/i.test(normalizedLangKey)) {
      return { code: 'pl', displayLabel: 'Polish (Polski)' };
    }
    if (/^(ru|russian|русский|روس)/i.test(normalizedLangKey)) {
      return { code: 'ru', displayLabel: 'Russian (Русский)' };
    }
    return { code: 'en', displayLabel: rawLangInput || 'English' };
  };
  const resolvedGuestLang = resolveGuestEmailLang();
  const guestLangCode = resolvedGuestLang.code;
  const guestLangDisplay = resolvedGuestLang.displayLabel;

  const bookedAtStr = new Date().toLocaleString('en-GB', {
    timeZone: 'Africa/Cairo',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const paxLine = `${payload.adults} Adults${
    payload.children > 0 ? ` + ${payload.children} Children` : ''
  }${payload.infants > 0 ? ` + ${payload.infants} Infants` : ''}`;

  const pickupLine = payload.pickupTime
    ? `${payload.pickupTime}${payload.pickupSpot ? ` (${payload.pickupSpot})` : ''}`
    : '';

  const whatsappAlertText = [
    isConfirmedUpdate
      ? `✅ *BOOKING CONFIRMED — ${payload.bookingId}*`
      : `🔔 *NEW BOOKING ALERT — ${payload.bookingId}*`,
    `━━━━━━━━━━━━━━━━━━`,
    `🎫 *Excursion:* ${payload.tripTitle} (${payload.destination})`,
    `📅 *Trip Date:* ${payload.tripDate}${payload.startTime ? ` · ${payload.startTime}` : ''}`,
    pickupLine ? `🚐 *Pickup:* ${pickupLine}` : '',
    payload.assignedDriverOrGuide ? `🧑‍✈️ *Driver / Guide:* ${payload.assignedDriverOrGuide}` : '',
    `🏢 *Supplier:* ${payload.supplierName}`,
    `🕒 *Time:* ${bookedAtStr} (Egypt Time)`,
    `👤 *Guest:* ${payload.guestName} (${payload.guestCountry})`,
    `🗣️ *Guide & Email Language:* ${guestLangDisplay}`,
    `🏨 *Hotel:* ${payload.hotel}${payload.roomNumber ? ` · Room ${payload.roomNumber}` : ''}`,
    `👥 *Pax:* ${paxLine}`,
    `💶 *Total:* €${payload.grossEur} (${payload.paymentStatus})`,
    `📞 *Guest Contact:* ${guestContact}`,
    payload.notes ? `📝 *Notes:* ${payload.notes}` : '',
    guestWaLink ? `💬 *Message Guest:* ${guestWaLink}` : '',
    `🔗 *Dispatch Desk:* ${appUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const ownerEmailSubject = isConfirmedUpdate
    ? `✅ Booking Confirmed ${payload.bookingId} — ${payload.tripTitle} (${payload.tripDate})`
    : `🔔 New Booking ${payload.bookingId} — ${payload.tripTitle} (${payload.tripDate})`;

  const ownerBodyEn = `
    <p style="margin:0 0 14px;font-size:13px;color:#64748B;">
      ${isConfirmedUpdate ? 'Confirmed' : 'Booked'} at ${escapeHtml(bookedAtStr)} (Cairo Time) · ${escapeHtml(payload.destination)}
    </p>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B; width: 38%;">Guest Name</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.guestName)} (${escapeHtml(payload.guestCountry)})</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Guide &amp; Email Language</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 800; color: #EE5426;">${escapeHtml(guestLangDisplay)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Trip Date</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.tripDate)}${payload.startTime ? ` · ${escapeHtml(payload.startTime)}` : ''}</td></tr>
      ${pickupLine ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Confirmed Pickup</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #EE5426;">${escapeHtml(pickupLine)}</td></tr>` : ''}
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Hotel &amp; Room</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.hotel)}${payload.roomNumber ? ` · Room ${escapeHtml(payload.roomNumber)}` : ''}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Passengers</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(paxLine)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Total</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 800; color: #10B981;">€${payload.grossEur} (${escapeHtml(payload.paymentStatus)})</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Assigned Supplier</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.supplierName)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Guest WhatsApp</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(guestWa || 'Not provided')}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Guest Email</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(guestEmail || 'Not provided')}</td></tr>
      ${payload.notes ? `<tr><td style="padding: 8px 0; color: #64748B;">Special Notes</td><td style="padding: 8px 0; font-weight: 600; color: #0F2233;">${escapeHtml(payload.notes)}</td></tr>` : ''}
    </table>
    ${guestWaLink ? `<div style="margin-top: 16px; text-align: center;"><a href="${escapeHtml(guestWaLink)}" style="display: inline-block; background: #10B981; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 10px;">Message Guest on WhatsApp</a></div>` : ''}
  `;

  const ownerBodyAr = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">
      ${isConfirmedUpdate ? `تم تأكيد الحجز نهائياً بتاريخ <strong>${escapeHtml(bookedAtStr)}</strong> (بتوقيت القاهرة) — <strong>${escapeHtml(payload.destination)}</strong>.` : `تم تسجيل طلب حجز جديد بتاريخ <strong>${escapeHtml(bookedAtStr)}</strong> (بتوقيت القاهرة) — <strong>${escapeHtml(payload.destination)}</strong>.`}
    </p>
    <p style="margin:0 0 10px;font-size:14px;color:#0F2233;">
      • <strong>الرحلة:</strong> ${escapeHtml(payload.tripTitle)}<br/>
      • <strong>تاريخ الرحلة:</strong> ${escapeHtml(payload.tripDate)}${payload.startTime ? ` · ${escapeHtml(payload.startTime)}` : ''}<br/>
      ${pickupLine ? `• <strong>موعد البيك أب:</strong> ${escapeHtml(pickupLine)}<br/>` : ''}
      • <strong>المورد:</strong> ${escapeHtml(payload.supplierName)}<br/>
      • <strong>العميل:</strong> ${escapeHtml(payload.guestName)} (${escapeHtml(payload.guestCountry)})<br/>
      • <strong>لغة العميل / المرشد المطلوب:</strong> <strong style="color:#EE5426;">${escapeHtml(guestLangDisplay)}</strong><br/>
      • <strong>الفندق:</strong> ${escapeHtml(payload.hotel)}${payload.roomNumber ? ` · غرفة ${escapeHtml(payload.roomNumber)}` : ''}<br/>
      • <strong>الأفراد:</strong> ${escapeHtml(paxLine)}<br/>
      • <strong>الإجمالي:</strong> €${payload.grossEur} (${escapeHtml(payload.paymentStatus)})
    </p>
  `;

  const ownerEmailHtml = buildWaslaEmailHtml({
    titleAr: isConfirmedUpdate
      ? `تم تأكيد الحجز ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`
      : `طلب حجز جديد ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`,
    titleEn: isConfirmedUpdate
      ? `Booking Confirmed ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`
      : `New Booking ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`,
    bodyHtmlAr: ownerBodyAr,
    bodyHtmlEn: ownerBodyEn,
    ctaTextAr: 'فتح لوحة الحجوزات والتشغيل',
    ctaTextEn: 'Open Dispatch Desk',
    ctaUrl: escapeHtml(appUrl),
  });

  interface GuestEmailCopy {
    subjectNew: string;
    subjectConfirmed: string;
    titleNew: string;
    titleConfirmed: string;
    greeting: string;
    introNew: string;
    introConfirmed: string;
    refLabel: string;
    excursionLabel: string;
    dateLabel: string;
    pickupLabel: string;
    driverLabel: string;
    hotelLabel: string;
    roomWord: string;
    guestsLabel: string;
    adultsWord: string;
    childrenWord: string;
    infantsWord: string;
    langLabel: string;
    totalLabel: string;
    totalHint: string;
    customQuoteHint: string;
    supportPrefix: string;
    ctaText: string;
  }

  const GUEST_EMAIL_COPY: Record<GuestEmailLangCode, GuestEmailCopy> = {
    en: {
      subjectNew: `Your Wasla Travel Booking is Confirmed — ${payload.bookingId}`,
      subjectConfirmed: `Final Pickup & Boarding Voucher Confirmed — ${payload.bookingId}`,
      titleNew: `Your Booking is Confirmed — ${payload.bookingId}`,
      titleConfirmed: `Final Boarding Voucher Confirmed — ${payload.bookingId}`,
      greeting: `Hello`,
      introNew: `Your booking with Wasla Travel is confirmed! Our operations team has received your reservation and will contact you shortly with your exact hotel pickup time and driver details.`,
      introConfirmed: `Your final boarding voucher with Wasla Travel is confirmed! Here are your verified excursion and pickup details:`,
      refLabel: 'Booking Reference',
      excursionLabel: 'Excursion',
      dateLabel: 'Date',
      pickupLabel: 'Confirmed Pickup',
      driverLabel: 'Driver / Guide',
      hotelLabel: 'Hotel Pickup',
      roomWord: 'Room',
      guestsLabel: 'Guests',
      adultsWord: 'Adults',
      childrenWord: 'Children',
      infantsWord: 'Infants',
      langLabel: 'Guide Language',
      totalLabel: 'Total',
      totalHint: 'Cash on pickup or official link — zero online charge today',
      customQuoteHint: 'Custom quote coming shortly',
      supportPrefix: 'Need anything before pickup? Reply directly to',
      ctaText: 'Track Your Booking',
    },
    de: {
      subjectNew: `Ihre Wasla Travel Buchung ist bestätigt — ${payload.bookingId}`,
      subjectConfirmed: `Ihr finaler Abhol- & Boarding-Voucher — ${payload.bookingId}`,
      titleNew: `Ihre Buchung ist bestätigt — ${payload.bookingId}`,
      titleConfirmed: `Finaler Boarding-Voucher bestätigt — ${payload.bookingId}`,
      greeting: `Hallo`,
      introNew: `Ihre Buchung bei Wasla Travel ist bestätigt! Unser Team hat Ihre Reservierung erhalten und meldet sich in Kürze mit Ihrer genauen Hotel-Abholzeit und den Fahrerdetails.`,
      introConfirmed: `Ihr finaler Boarding-Voucher von Wasla Travel ist bestätigt! Hier sind Ihre geprüften Ausflugs- und Abholdetails:`,
      refLabel: 'Buchungsnummer',
      excursionLabel: 'Ausflug',
      dateLabel: 'Datum',
      pickupLabel: 'Bestätigte Abholung',
      driverLabel: 'Fahrer / Guide',
      hotelLabel: 'Abholhotel',
      roomWord: 'Zimmer',
      guestsLabel: 'Teilnehmer',
      adultsWord: 'Erwachsene',
      childrenWord: 'Kinder',
      infantsWord: 'Kleinkinder',
      langLabel: 'Guide-Sprache',
      totalLabel: 'Gesamtbetrag',
      totalHint: 'Bar bei Abholung oder offizieller Zahlungslink — heute keine Abbuchung',
      customQuoteHint: 'Individuelles Angebot folgt in Kürze',
      supportPrefix: 'Haben Sie noch Fragen vor der Abholung? Antworten Sie direkt an',
      ctaText: 'Buchung verfolgen',
    },
    ar: {
      subjectNew: `تم تأكيد حجزك في وصلة ترافيل — ${payload.bookingId}`,
      subjectConfirmed: `تذكرتك المؤكدة وموعد الاستلام من وصلة ترافيل — ${payload.bookingId}`,
      titleNew: `تم تأكيد حجزك بنجاح — ${payload.bookingId}`,
      titleConfirmed: `تم اعتماد تذكرتك النهائية — ${payload.bookingId}`,
      greeting: `أهلاً`,
      introNew: `تم تأكيد حجزك بنجاح في وصلة ترافيل! استلم فريق العمليات حجزك وسيتواصل معك الآن لتأكيد موعد الاستلام الدقيق من الفندق وتفاصيل السائق.`,
      introConfirmed: `تم اعتماد تذكرة الصعود النهائية لحجزك في وصلة ترافيل! إليك تفاصيل رحلتك وموعد الاستلام المؤكد:`,
      refLabel: 'رقم الحجز المرجعي',
      excursionLabel: 'الرحلة',
      dateLabel: 'التاريخ',
      pickupLabel: 'موعد ومكان البيك أب',
      driverLabel: 'السائق / المرشد',
      hotelLabel: 'الفندق',
      roomWord: 'غرفة',
      guestsLabel: 'عدد الأفراد',
      adultsWord: 'بالغين',
      childrenWord: 'أطفال',
      infantsWord: 'رضّع',
      langLabel: 'لغة المرشد',
      totalLabel: 'الإجمالي',
      totalHint: 'الدفع عند الاستلام أو عبر رابط رسمي',
      customQuoteHint: 'سيتم إرسال عرض السعر المخصص قريباً',
      supportPrefix: 'لأي استفسار قبل موعد الرحلة، يمكنك الرد مباشرة على',
      ctaText: 'متابعة حالة الحجز',
    },
    fr: {
      subjectNew: `Votre réservation Wasla Travel est confirmée — ${payload.bookingId}`,
      subjectConfirmed: `Votre bon d'embarquement final confirmé — ${payload.bookingId}`,
      titleNew: `Votre réservation est confirmée — ${payload.bookingId}`,
      titleConfirmed: `Bon d'embarquement confirmé — ${payload.bookingId}`,
      greeting: `Bonjour`,
      introNew: `Votre réservation avec Wasla Travel est confirmée ! Notre équipe a bien reçu votre demande et vous contactera très prochainement avec votre heure exacte de prise en charge à l'hôtel.`,
      introConfirmed: `Votre bon d'embarquement final avec Wasla Travel est confirmé ! Voici les détails vérifiés de votre excursion :`,
      refLabel: 'Référence',
      excursionLabel: 'Excursion',
      dateLabel: 'Date',
      pickupLabel: 'Prise en charge',
      driverLabel: 'Chauffeur / Guide',
      hotelLabel: 'Hôtel',
      roomWord: 'Chambre',
      guestsLabel: 'Participants',
      adultsWord: 'Adultes',
      childrenWord: 'Enfants',
      infantsWord: 'Bébés',
      langLabel: 'Langue du guide',
      totalLabel: 'Total',
      totalHint: 'Paiement sur place ou par lien officiel — aucun débit aujourd’hui',
      customQuoteHint: 'Devis personnalisé envoyé sous peu',
      supportPrefix: 'Une question avant le départ ? Répondez directement à',
      ctaText: 'Suivre votre réservation',
    },
    it: {
      subjectNew: `La tua prenotazione Wasla Travel è confermata — ${payload.bookingId}`,
      subjectConfirmed: `Voucher finale di imbarco confermato — ${payload.bookingId}`,
      titleNew: `La tua prenotazione è confermata — ${payload.bookingId}`,
      titleConfirmed: `Voucher finale confermato — ${payload.bookingId}`,
      greeting: `Ciao`,
      introNew: `La tua prenotazione con Wasla Travel è confermata! Il nostro team ha ricevuto la richiesta e ti contatterà a breve con l'orario esatto del prelievo in hotel.`,
      introConfirmed: `Il tuo voucher finale con Wasla Travel è confermato! Ecco i dettagli verificati della tua escursione:`,
      refLabel: 'Codice prenotazione',
      excursionLabel: 'Escursione',
      dateLabel: 'Data',
      pickupLabel: 'Prelievo confermato',
      driverLabel: 'Autista / Guida',
      hotelLabel: 'Hotel',
      roomWord: 'Camera',
      guestsLabel: 'Ospiti',
      adultsWord: 'Adulti',
      childrenWord: 'Bambini',
      infantsWord: 'Neonati',
      langLabel: 'Lingua guida',
      totalLabel: 'Totale',
      totalHint: 'Contanti al prelievo o link ufficiale — nessun addebito oggi',
      customQuoteHint: 'Preventivo personalizzato in arrivo',
      supportPrefix: 'Hai bisogno di assistenza? Rispondi direttamente a',
      ctaText: 'Monitora la prenotazione',
    },
    es: {
      subjectNew: `Tu reserva con Wasla Travel está confirmada — ${payload.bookingId}`,
      subjectConfirmed: `Voucher final de recogida confirmado — ${payload.bookingId}`,
      titleNew: `Tu reserva está confirmada — ${payload.bookingId}`,
      titleConfirmed: `Voucher final confirmado — ${payload.bookingId}`,
      greeting: `Hola`,
      introNew: `¡Tu reserva con Wasla Travel está confirmada! Nuestro equipo ha recibido tu solicitud y se pondrá en contacto contigo en breve con la hora exacta de recogida en tu hotel.`,
      introConfirmed: `¡Tu voucher final con Wasla Travel está confirmado! Aquí tienes los detalles verificados de tu excursión:`,
      refLabel: 'Referencia',
      excursionLabel: 'Excursión',
      dateLabel: 'Fecha',
      pickupLabel: 'Recogida confirmada',
      driverLabel: 'Conductor / Guía',
      hotelLabel: 'Hotel',
      roomWord: 'Hab.',
      guestsLabel: 'Participantes',
      adultsWord: 'Adultos',
      childrenWord: 'Niños',
      infantsWord: 'Bebés',
      langLabel: 'Idioma del guía',
      totalLabel: 'Total',
      totalHint: 'Efectivo al recoger o enlace oficial — sin cobro hoy',
      customQuoteHint: 'Presupuesto personalizado en camino',
      supportPrefix: '¿Necesitas algo antes de la recogida? Responde directamente a',
      ctaText: 'Seguir tu reserva',
    },
    nl: {
      subjectNew: `Uw Wasla Travel boeking is bevestigd — ${payload.bookingId}`,
      subjectConfirmed: `Definitieve ophaal- en boardingvoucher bevestigd — ${payload.bookingId}`,
      titleNew: `Uw boeking is bevestigd — ${payload.bookingId}`,
      titleConfirmed: `Definitieve voucher bevestigd — ${payload.bookingId}`,
      greeting: `Hallo`,
      introNew: `Uw boeking bij Wasla Travel is bevestigd! Ons team heeft uw reservering ontvangen en neemt spoedig contact met u op met uw exacte ophaaltijd bij het hotel.`,
      introConfirmed: `Uw definitieve boardingvoucher van Wasla Travel is bevestigd! Hier zijn uw geverifieerde excursie- en ophaalgegevens:`,
      refLabel: 'Boekingsnummer',
      excursionLabel: 'Excursie',
      dateLabel: 'Datum',
      pickupLabel: 'Bevestigde ophaaltijd',
      driverLabel: 'Chauffeur / Gids',
      hotelLabel: 'Hotel',
      roomWord: 'Kamer',
      guestsLabel: 'Gasten',
      adultsWord: 'Volwassenen',
      childrenWord: 'Kinderen',
      infantsWord: 'Baby’s',
      langLabel: 'Taal van gids',
      totalLabel: 'Totaal',
      totalHint: 'Contant bij ophalen of officiële betaallink — vandaag geen afschrijving',
      customQuoteHint: 'Persoonlijke offerte volgt spoedig',
      supportPrefix: 'Vragen voor vertrek? Reageer rechtstreeks op',
      ctaText: 'Volg uw boeking',
    },
    pl: {
      subjectNew: `Twoja rezerwacja w Wasla Travel została potwierdzona — ${payload.bookingId}`,
      subjectConfirmed: `Ostateczny voucher i godzina odbioru — ${payload.bookingId}`,
      titleNew: `Twoja rezerwacja jest potwierdzona — ${payload.bookingId}`,
      titleConfirmed: `Ostateczny voucher potwierdzony — ${payload.bookingId}`,
      greeting: `Cześć`,
      introNew: `Twoja rezerwacja w Wasla Travel została potwierdzona! Nasz zespół otrzymał zgłoszenie i wkrótce prześle dokładną godzinę odbioru z hotelu.`,
      introConfirmed: `Twój ostateczny voucher w Wasla Travel jest gotowy! Oto potwierdzone szczegóły wycieczki:`,
      refLabel: 'Numer rezerwacji',
      excursionLabel: 'Wycieczka',
      dateLabel: 'Data',
      pickupLabel: 'Potwierdzony odbiór',
      driverLabel: 'Kierowca / Przewodnik',
      hotelLabel: 'Hotel',
      roomWord: 'Pokój',
      guestsLabel: 'Uczestnicy',
      adultsWord: 'Dorośli',
      childrenWord: 'Dzieci',
      infantsWord: 'Niemowlęta',
      langLabel: 'Język przewodnika',
      totalLabel: 'Razem',
      totalHint: 'Gotówka przy odbiorze lub oficjalny link — bez obciążenia dzisiaj',
      customQuoteHint: 'Indywidualna wycena wkrótce',
      supportPrefix: 'Masz pytania przed odbiorem? Odpowiedz bezpośrednio na',
      ctaText: 'Śledź rezerwację',
    },
    ru: {
      subjectNew: `Ваше бронирование в Wasla Travel подтверждено — ${payload.bookingId}`,
      subjectConfirmed: `Финальный ваучер и время трансфера подтверждены — ${payload.bookingId}`,
      titleNew: `Бронирование подтверждено — ${payload.bookingId}`,
      titleConfirmed: `Финальный ваучер подтверждён — ${payload.bookingId}`,
      greeting: `Здравствуйте`,
      introNew: `Ваше бронирование в Wasla Travel подтверждено! Наша команда получила заявку и в ближайшее время сообщит точное время трансфера из отеля.`,
      introConfirmed: `Ваш финальный ваучер Wasla Travel подтверждён! Ниже указаны детали экскурсии и трансфера:`,
      refLabel: 'Номер брони',
      excursionLabel: 'Экскурсия',
      dateLabel: 'Дата',
      pickupLabel: 'Время трансфера',
      driverLabel: 'Водитель / Гид',
      hotelLabel: 'Отель',
      roomWord: 'Номер',
      guestsLabel: 'Гости',
      adultsWord: 'Взрослые',
      childrenWord: 'Дети',
      infantsWord: 'Младенцы',
      langLabel: 'Язык гида',
      totalLabel: 'Итого',
      totalHint: 'Оплата на месте или по официальной ссылке — без списания сегодня',
      customQuoteHint: 'Индивидуальный расчёт скоро поступит',
      supportPrefix: 'Есть вопросы до поездки? Напишите нам на',
      ctaText: 'Отследить бронирование',
    },
  };

  const pendingCopy: Record<GuestEmailLangCode, [string,string]> = {
  "en": [
    "Booking request saved",
    "Your booking request is saved. Our team will review it and send confirmation separately."
  ],
  "ar": [
    "تم حفظ طلب الحجز",
    "تم حفظ طلب الحجز. سيراجعه فريقنا ويرسل التأكيد بشكل منفصل."
  ],
  "de": [
    "Buchungsanfrage gespeichert",
    "Ihre Anfrage wurde gespeichert. Unser Team prüft sie und sendet die Bestätigung separat."
  ],
  "fr": [
    "Demande de réservation enregistrée",
    "Votre demande est enregistrée. Notre équipe la vérifiera et vous enverra une confirmation séparée."
  ],
  "it": [
    "Richiesta di prenotazione salvata",
    "La richiesta è stata salvata. Il nostro team la verificherà e invierà una conferma separata."
  ],
  "es": [
    "Solicitud de reserva guardada",
    "Tu solicitud está guardada. Nuestro equipo la revisará y enviará la confirmación por separado."
  ],
  "nl": [
    "Boekingsaanvraag opgeslagen",
    "Uw aanvraag is opgeslagen. Ons team beoordeelt deze en stuurt de bevestiging apart."
  ],
  "pl": [
    "Zapisano prośbę o rezerwację",
    "Twoja prośba została zapisana. Nasz zespół ją sprawdzi i wyśle osobne potwierdzenie."
  ],
  "ru": [
    "Заявка на бронирование сохранена",
    "Ваша заявка сохранена. Наша команда проверит её и отправит подтверждение отдельно."
  ]
};
  const pending = pendingCopy[guestLangCode];
  const gc = {...GUEST_EMAIL_COPY[guestLangCode],
    subjectNew: pending[0] + ' — ' + payload.bookingId,
    titleNew: pending[0] + ' — ' + payload.bookingId,
    introNew: pending[1],
  };
  const isGuestRtl = guestLangCode === 'ar';
  const guestPaxLine = `${payload.adults} ${gc.adultsWord}${
    payload.children > 0 ? ` + ${payload.children} ${gc.childrenWord}` : ''
  }${payload.infants > 0 ? ` + ${payload.infants} ${gc.infantsWord}` : ''}`;

  const localizeGuestPickupSpot = (spot?: string): string => {
    if (!spot) return '';
    const isOutside = spot === 'Outside Main Gate';
    switch (guestLangCode) {
      case 'de':
        return isOutside ? 'Vor dem Hotel-Haupteingang' : 'In der Hotelrezeption';
      case 'ar':
        return isOutside ? 'أمام البوابة الرئيسية للفندق' : 'داخل استقبال الفندق';
      case 'fr':
        return isOutside ? 'Devant l’entrée principale' : 'À la réception de l’hôtel';
      case 'it':
        return isOutside ? 'Davanti all’ingresso principale' : 'Alla reception dell’hotel';
      case 'es':
        return isOutside ? 'Frente a la entrada principal' : 'En la recepción del hotel';
      case 'nl':
        return isOutside ? 'Bij de hoofdingang' : 'Bij de receptie van het hotel';
      case 'pl':
        return isOutside ? 'Przed głównym wejściem' : 'W recepcji hotelu';
      case 'ru':
        return isOutside ? 'У главного входа в отель' : 'На ресепшене отеля';
      default:
        return isOutside ? 'Outside Hotel Main Gate' : 'Inside Hotel Reception / Lobby';
    }
  };
  const localizedSpot = localizeGuestPickupSpot(payload.pickupSpot);
  const guestPickupLine = payload.pickupTime
    ? `${payload.pickupTime}${localizedSpot ? ` (${localizedSpot})` : ''}`
    : '';

  const guestEmailSubject = isConfirmedUpdate ? gc.subjectConfirmed : gc.subjectNew;

  const linkCreatedAt = payload.notificationCreatedAtMs || Date.parse(payload.tripDate + 'T00:00:00Z');
  const privateConversationUrl = !delivery || delivery.channel === 'guestEmail' ? conversationLink(payload.bookingId, appUrl, linkCreatedAt + 30 * 86400000) : appUrl;
  let privateTrackUrl = privateConversationUrl;
  if (isConfirmedUpdate) {
    try { privateTrackUrl = appUrl + '/?track=' + encodeURIComponent(payload.bookingId) + '#voucherToken=' + voucherToken(payload.bookingId); } catch { throw new Error('Private voucher links are not configured'); }
  }
  const guestEmailText = [
    privateConversationUrl,
    privateTrackUrl !== appUrl ? privateTrackUrl : '',
    `${gc.greeting} ${payload.guestName},`,
    ``,
    isConfirmedUpdate ? gc.introConfirmed : gc.introNew,
    ``,
    `${gc.refLabel}: ${payload.bookingId}`,
    `${gc.excursionLabel}: ${payload.tripTitle} (${payload.destination})`,
    `${gc.dateLabel}: ${payload.tripDate}${payload.startTime ? ` · ${payload.startTime}` : ''}`,
    guestPickupLine ? `${gc.pickupLabel}: ${guestPickupLine}` : '',
    payload.assignedDriverOrGuide ? `${gc.driverLabel}: ${payload.assignedDriverOrGuide}` : '',
    `${gc.hotelLabel}: ${payload.hotel}${payload.roomNumber ? ` · ${gc.roomWord} ${payload.roomNumber}` : ''}`,
    `${gc.guestsLabel}: ${guestPaxLine}`,
    `${gc.langLabel}: ${guestLangDisplay}`,
    payload.grossEur > 0
      ? `${gc.totalLabel}: €${payload.grossEur} (${gc.totalHint})`
      : `${gc.totalLabel}: ${gc.customQuoteHint}`,
    ``,
    `${gc.supportPrefix} ${publicSupportEmail} | WhatsApp: ${ownerWaDisplay}`,
    `Wasla Travel · ${publicSupportEmail} · ${appUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const guestBodyHtml = `
    <p><a href="${escapeHtml(privateConversationUrl)}">${isGuestRtl ? 'متابعة الحجز ومراسلة فريق العمليات' : 'View booking and message Operations'}</a></p>
    <p style="margin:0 0 12px;font-size:15px;color:#0F2233;">
      ${escapeHtml(gc.greeting)} <strong>${escapeHtml(payload.guestName)}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.7;">
      ${escapeHtml(isConfirmedUpdate ? gc.introConfirmed : gc.introNew)}
    </p>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; direction: ${isGuestRtl ? 'rtl' : 'ltr'}; text-align: ${isGuestRtl ? 'right' : 'left'};">
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B; width: 38%;">${escapeHtml(gc.refLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 800; color: #EE5426;">${escapeHtml(payload.bookingId)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">${escapeHtml(gc.excursionLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.tripTitle)} (${escapeHtml(payload.destination)})</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">${escapeHtml(gc.dateLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.tripDate)}${payload.startTime ? ` · ${escapeHtml(payload.startTime)}` : ''}</td></tr>
      ${
        guestPickupLine
          ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">${escapeHtml(gc.pickupLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 800; color: #EE5426;">${escapeHtml(guestPickupLine)}</td></tr>`
          : ''
      }
      ${
        payload.assignedDriverOrGuide
          ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">${escapeHtml(gc.driverLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.assignedDriverOrGuide)}</td></tr>`
          : ''
      }
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">${escapeHtml(gc.hotelLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.hotel)}${payload.roomNumber ? ` · ${escapeHtml(gc.roomWord)} ${escapeHtml(payload.roomNumber)}` : ''}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">${escapeHtml(gc.guestsLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(guestPaxLine)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">${escapeHtml(gc.langLabel)}</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(guestLangDisplay)}</td></tr>
      ${
        payload.grossEur > 0
          ? `<tr><td style="padding: 8px 0; color: #64748B;">${escapeHtml(gc.totalLabel)}</td><td style="padding: 8px 0; font-weight: 800; color: #10B981;">€${payload.grossEur} (${escapeHtml(gc.totalHint)})</td></tr>`
          : ''
      }
    </table>
    <div style="margin-top:16px;padding:12px 14px;background:#FAF4ED;border:1px solid #C8C2B8;border-radius:10px;font-size:12px;color:#0F2233;line-height:1.6;">
      ${escapeHtml(gc.supportPrefix)} <strong dir="ltr">${escapeHtml(publicSupportEmail)}</strong> · WhatsApp: <strong dir="ltr">${escapeHtml(ownerWaDisplay)}</strong>.
    </div>
  `;

  const guestEmailHtml = buildSingleLangWaslaEmailHtml({
    langCode: guestLangCode,
    isRtl: isGuestRtl,
    title: escapeHtml(isConfirmedUpdate ? gc.titleConfirmed : gc.titleNew),
    bodyHtml: guestBodyHtml,
    ctaText: escapeHtml(gc.ctaText),
    ctaUrl: escapeHtml(privateTrackUrl),
    footerContactEmail: escapeHtml(publicSupportEmail),
  });

  const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
  const hasResend = Boolean(env.RESEND_API_KEY);
  const hasWa = Boolean(
    (readEnvAny(env, META_WA_TOKEN_KEYS) && readEnvAny(env, META_WA_PHONE_ID_KEYS)) ||
      (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM) ||
      env.CALLMEBOT_API_KEY
  );
  const hasWebhook = Boolean(env.OWNER_ALERT_WEBHOOK_URL);

  const result: BookingNotificationResult = {
    ok: true,
    delivered: false,
    email: { sent: false, provider: 'none', to: ownerEmails.join(', ') },
    guestEmail: { sent: false, provider: 'none', to: hasValidGuestEmail ? guestEmail : '' },
    whatsapp: { sent: false, provider: 'none', to: ownerWaDigits },
    webhook: { sent: false },
  };

  if (!hasSmtp && !hasResend && !hasWa && !hasWebhook) {
    result.skipped = 'no_channels_configured';
    return result;
  }

  const smtpCfg = resolveSmtpConfig(env);
  const smtpFrom =
    String(env.SMTP_FROM || '').trim() ||
    `Wasla Travel <${smtpCfg?.user || publicSupportEmail}>`;
  const resendApiKey = String(env.RESEND_API_KEY || '').trim();
  const rawResendFrom =
    String(env.RESEND_FROM_EMAIL || '').trim() || `Wasla Travel <${publicSupportEmail}>`;
  const angleMatch = rawResendFrom.match(/<([^>]+)>/);
  const verifiedResendAddress = (angleMatch ? angleMatch[1] : rawResendFrom).trim();
  const formattedResendFrom = EMAIL_REGEX.test(verifiedResendAddress)
    ? `Wasla Travel <${verifiedResendAddress}>`
    : rawResendFrom;
  const resendOwnerFrom = formattedResendFrom;
  const resendGuestFrom = formattedResendFrom;

  const sendOwnerEmailTask = async () => {
    if (resendApiKey) {
      result.email.provider = 'resend';
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            ...(delivery ? {'Idempotency-Key': delivery.idempotencyKey} : {}),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: resendOwnerFrom,
            to: ownerEmails,
            ...(hasValidGuestEmail ? { reply_to: guestEmail } : {}),
            subject: ownerEmailSubject,
            text: whatsappAlertText,
            html: ownerEmailHtml,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) result.email.sent = true;
        else result.email.error = `Resend API ${res.status}`;
      } catch (err) {
        result.email.error = err instanceof Error ? err.message : 'Resend owner email failed';
      }
    } else if (smtpCfg) {
      result.email.provider = 'smtp';
      try {
        await sendMailWithSmtpFallback(smtpCfg, {
          from: smtpFrom,
          to: ownerEmails.join(', '),
          ...(hasValidGuestEmail ? { replyTo: guestEmail } : {}),
          subject: ownerEmailSubject,
          text: whatsappAlertText,
          html: ownerEmailHtml,
        });
        result.email.sent = true;
      } catch (err) {
        result.email.error = err instanceof Error ? err.message : 'SMTP owner email failed';
      }
    }
  };

  const sendCustomerEmailTask = async () => {
    if (!hasValidGuestEmail) return;
    if (resendApiKey) {
      result.guestEmail.provider = 'resend';
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            ...(delivery ? {'Idempotency-Key': delivery.idempotencyKey} : {}),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: resendGuestFrom,
            to: [guestEmail],
            reply_to: publicSupportEmail,
            subject: guestEmailSubject,
            text: guestEmailText,
            html: guestEmailHtml,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) result.guestEmail.sent = true;
        else result.guestEmail.error = `Resend API ${res.status}`;
      } catch (err) {
        result.guestEmail.error = err instanceof Error ? err.message : 'Resend guest email failed';
      }
    } else if (smtpCfg) {
      result.guestEmail.provider = 'smtp';
      try {
        await sendMailWithSmtpFallback(smtpCfg, {
          from: smtpFrom,
          to: guestEmail,
          replyTo: publicSupportEmail,
          subject: guestEmailSubject,
          text: guestEmailText,
          html: guestEmailHtml,
        });
        result.guestEmail.sent = true;
      } catch (err) {
        result.guestEmail.error = err instanceof Error ? err.message : 'SMTP guest email failed';
      }
    }
  };

  const sendOwnerWhatsappTask = async () => {
    if (!ownerWaDigits) return;
    const metaWaToken = readEnvAny(env, META_WA_TOKEN_KEYS);
    const metaWaPhoneId = readEnvAny(env, META_WA_PHONE_ID_KEYS);
    if (metaWaToken && metaWaPhoneId) {
      result.whatsapp.provider = 'whatsapp-cloud';
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/${encodeURIComponent(metaWaPhoneId)}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${metaWaToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: ownerWaDigits,
              type: 'text',
              text: { body: whatsappAlertText },
            }),
            signal: AbortSignal.timeout(10_000),
          }
        );
        if (res.ok) result.whatsapp.sent = true;
        else result.whatsapp.error = `Meta WhatsApp API ${res.status}`;
      } catch (err) {
        result.whatsapp.error = err instanceof Error ? err.message : 'Meta WhatsApp failed';
      }
    } else if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM) {
      result.whatsapp.provider = 'twilio';
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
        const authHeader = Buffer.from(
          `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');
        const form = new URLSearchParams({
          From: env.TWILIO_WHATSAPP_FROM.startsWith('whatsapp:')
            ? env.TWILIO_WHATSAPP_FROM
            : `whatsapp:+${env.TWILIO_WHATSAPP_FROM.replace(/\D/g, '')}`,
          To: `whatsapp:+${ownerWaDigits}`,
          Body: whatsappAlertText,
        });
        const res = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        });
        if (res.ok) result.whatsapp.sent = true;
        else result.whatsapp.error = `Twilio API ${res.status}`;
      } catch (err) {
        result.whatsapp.error = err instanceof Error ? err.message : 'Twilio failed';
      }
    } else if (env.CALLMEBOT_API_KEY) {
      result.whatsapp.provider = 'callmebot';
      try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=+${encodeURIComponent(
          ownerWaDigits
        )}&text=${encodeURIComponent(whatsappAlertText)}&apikey=${encodeURIComponent(
          env.CALLMEBOT_API_KEY
        )}`;
        const res = await fetch(url, { method: 'GET' });
        if (res.ok) result.whatsapp.sent = true;
        else result.whatsapp.error = `CallMeBot HTTP ${res.status}`;
      } catch (err) {
        result.whatsapp.error = err instanceof Error ? err.message : 'CallMeBot failed';
      }
    }
  };

  const sendWebhookTask = async () => {
    if (!env.OWNER_ALERT_WEBHOOK_URL) return;
    try {
      const res = await fetch(env.OWNER_ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: payload.eventType,
          bookingId: payload.bookingId,
          tripTitle: payload.tripTitle,
          destination: payload.destination,
          tripDate: payload.tripDate,
          pickupTime: payload.pickupTime || '',
          guestName: payload.guestName,
          guestLanguage: guestLangDisplay,
          guestEmail,
          guestWhatsapp: guestWa,
          hotel: payload.hotel,
          grossEur: payload.grossEur,
          ownerEmail: ownerEmails[0] || publicSupportEmail,
          publicSupportEmail,
          ownerWhatsapp: ownerWaDigits,
          formattedWhatsappMessage: whatsappAlertText,
        }),
      });
      if (res.ok) {
        result.webhook.sent = true;
        if (!result.whatsapp.sent && result.whatsapp.provider === 'none') {
          result.whatsapp.provider = 'webhook';
          result.whatsapp.sent = true;
        }
      } else {
        result.webhook.error = `Webhook HTTP ${res.status}`;
      }
    } catch (err) {
      result.webhook.error = err instanceof Error ? err.message : 'Webhook failed';
    }
  };

  const tasks: Record<Channel, () => Promise<void>> = {
    email:sendOwnerEmailTask, guestEmail:sendCustomerEmailTask,
    whatsapp:sendOwnerWhatsappTask, webhook:sendWebhookTask,
  };
  await Promise.allSettled((delivery ? [delivery.channel] : Object.keys(tasks) as Channel[]).map(channel => tasks[channel]()));

  const anyDelivered =
    result.email.sent || result.guestEmail.sent || result.whatsapp.sent || result.webhook.sent;
  result.delivered = anyDelivered;
  result.ok = anyDelivered;
  return result;
}

export function configuredNotificationChannels(payload: BookingNotificationPayload, env: NodeJS.ProcessEnv = process.env): Channel[] {
 const channels: Channel[] = [];
 if (env.RESEND_API_KEY || resolveSmtpConfig(env)) {
   channels.push('email');
   if (EMAIL_REGEX.test(String(payload.guestEmail || ''))) channels.push('guestEmail');
 }
 if ((readEnvAny(env,META_WA_TOKEN_KEYS) && readEnvAny(env,META_WA_PHONE_ID_KEYS)) || (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM) || env.CALLMEBOT_API_KEY) channels.push('whatsapp');
 if (env.OWNER_ALERT_WEBHOOK_URL) channels.push('webhook');
 return channels;
}
