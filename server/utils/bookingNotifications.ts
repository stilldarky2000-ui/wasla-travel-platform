import { voucherToken } from './voucherAccess';
import nodemailer, { type SendMailOptions } from 'nodemailer';
import { buildSingleLangWaslaEmailHtml, buildWaslaEmailHtml } from './waslaEmailTemplate';

export type BookingNotificationEventType = 'booking_created' | 'booking_confirmed' | 'test';

export interface BookingNotificationPayload {
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
  catalogBasePriceEur?: number;
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

export interface NotificationChannelStatus {
  emailConfigured: boolean;
  emailProvider: 'smtp' | 'resend' | 'none';
  whatsappConfigured: boolean;
  whatsappProvider: 'whatsapp-cloud' | 'twilio' | 'callmebot' | 'webhook' | 'none';
  webhookConfigured: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  whatsappHasToken?: boolean;
  whatsappHasPhoneId?: boolean;
}

export interface BookingNotificationResult {
  ok: boolean;
  delivered: boolean;
  retryable?: boolean;
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

  const parsedEnvPort = Number(readEnvAny(env, ['SMTP_PORT']));
  const port =
    Number.isInteger(parsedEnvPort) && parsedEnvPort > 0 && parsedEnvPort <= 65535
      ? parsedEnvPort
      : hostEmbeddedPort || 465;

  const rawSecure = readEnvAny(env, ['SMTP_SECURE']).toLowerCase();
  let secure: boolean;
  if (rawSecure === 'true' || rawSecure === '1') {
    secure = true;
  } else if (rawSecure === 'false' || rawSecure === '0') {
    secure = false;
  } else {
    secure = port === 465;
  }

  // Normalize Google App Passwords pasted with 4x4 spaces (e.g. "abcd efgh ijkl mnop")
  const pass =
    /gmail\.com$/i.test(host) &&
    /^[a-zA-Z]{4}\s+[a-zA-Z]{4}\s+[a-zA-Z]{4}\s+[a-zA-Z]{4}$/.test(rawPass)
      ? rawPass.replace(/\s+/g, '')
      : rawPass;

  return { host, port, secure, user, pass };
}

function formatSmtpError(err: unknown, cfg: { host: string; port: number; secure: boolean }): string {
  const e = err as { code?: string; responseCode?: number; command?: string; message?: string };
  const code = e?.code || (e?.responseCode ? `SMTP_${e.responseCode}` : '');
  const msg = String(e?.message || 'SMTP delivery failed').slice(0, 220);
  const mode = cfg.secure ? 'SSL' : 'STARTTLS';
  return `SMTP (${cfg.host}:${cfg.port} ${mode})${code ? ` [${code}]` : ''}: ${msg}`;
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
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
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
    if (!isRetryableSmtpTransportError(primaryErr)) {
      throw new Error(formatSmtpError(primaryErr, cfg));
    }
    const fallbackPort = cfg.port === 465 && cfg.secure ? 587 : 465;
    const fallbackSecure = fallbackPort === 465;
    try {
      await attemptSend(fallbackPort, fallbackSecure);
    } catch (fallbackErr) {
      throw new Error(
        `${formatSmtpError(primaryErr, cfg)} | Fallback (${cfg.host}:${fallbackPort} ${
          fallbackSecure ? 'SSL' : 'STARTTLS'
        }) also failed: ${
          fallbackErr instanceof Error ? fallbackErr.message.slice(0, 140) : 'failed'
        }`
      );
    }
  }
}

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getNotificationChannelStatus(
  env: NodeJS.ProcessEnv = process.env
): NotificationChannelStatus {
  const smtpCfg = resolveSmtpConfig(env);
  const hasSmtp = Boolean(smtpCfg);
  const hasResend = Boolean(readEnvAny(env, ['RESEND_API_KEY']));
  const waToken = readEnvAny(env, META_WA_TOKEN_KEYS);
  const waPhoneId = readEnvAny(env, META_WA_PHONE_ID_KEYS);
  const hasMetaWa = Boolean(waToken && waPhoneId);
  const hasTwilioWa = Boolean(
    readEnvAny(env, ['TWILIO_ACCOUNT_SID']) &&
      readEnvAny(env, ['TWILIO_AUTH_TOKEN']) &&
      readEnvAny(env, ['TWILIO_WHATSAPP_FROM'])
  );
  const hasCallMeBot = Boolean(readEnvAny(env, ['CALLMEBOT_API_KEY']));
  const hasWebhook = Boolean(readEnvAny(env, ['OWNER_ALERT_WEBHOOK_URL']));

  return {
    emailConfigured: hasResend || hasSmtp,
    emailProvider: hasResend ? 'resend' : hasSmtp ? 'smtp' : 'none',
    whatsappConfigured: hasMetaWa || hasTwilioWa || hasCallMeBot || hasWebhook,
    whatsappProvider: hasMetaWa
      ? 'whatsapp-cloud'
      : hasTwilioWa
      ? 'twilio'
      : hasCallMeBot
      ? 'callmebot'
      : hasWebhook
      ? 'webhook'
      : 'none',
    webhookConfigured: hasWebhook,
    whatsappHasToken: Boolean(waToken),
    whatsappHasPhoneId: Boolean(waPhoneId),
    ...(!hasResend && smtpCfg
      ? {
          smtpHost: smtpCfg.host,
          smtpPort: smtpCfg.port,
          smtpSecure: smtpCfg.secure,
          smtpUser: smtpCfg.user,
        }
      : {}),
  };
}

export async function dispatchBookingNotifications(
  payload: BookingNotificationPayload,
  recipients: BookingNotificationRecipients,
  env: NodeJS.ProcessEnv = process.env
): Promise<BookingNotificationResult> {
  const isTest = payload.eventType === 'test';
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

  // ---------------------------------------------------------------------------
  // 1. Owner WhatsApp Message Text
  // ---------------------------------------------------------------------------
  const whatsappAlertText = [
    isTest
      ? `🧪 *TEST ALERT — Wasla Travel Owner Desk*`
      : isConfirmedUpdate
      ? `✅ *BOOKING CONFIRMED — ${payload.bookingId}*`
      : `🔔 *NEW BOOKING ALERT — ${payload.bookingId}*`,
    `━━━━━━━━━━━━━━━━━━`,
    `🎫 *Excursion:* ${payload.tripTitle} (${payload.destination})`,
    `📅 *Trip Date:* ${payload.tripDate}${payload.startTime ? ` · ${payload.startTime}` : ''}`,
    pickupLine ? `🚐 *Pickup:* ${pickupLine}` : '',
    payload.assignedDriverOrGuide ? `🧑‍✈️ *Driver / Guide:* ${payload.assignedDriverOrGuide}` : '',
    `🏢 *Supplier:* ${payload.supplierName}`,
    payload.catalogBasePriceEur !== undefined
      ? `🏷️ *Catalog Base Price:* €${payload.catalogBasePriceEur}/adult`
      : '',
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

  // ---------------------------------------------------------------------------
  // 2. Bilingual Owner Alert Email (via waslaEmailTemplate.ts)
  // ---------------------------------------------------------------------------
  const ownerEmailSubject = isTest
    ? `[TEST] Wasla Travel Owner Booking Alert — ${payload.bookingId}`
    : isConfirmedUpdate
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
      ${
        pickupLine
          ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Confirmed Pickup</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #EE5426;">${escapeHtml(pickupLine)}</td></tr>`
          : ''
      }
      ${
        payload.assignedDriverOrGuide
          ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Driver / Guide</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.assignedDriverOrGuide)}</td></tr>`
          : ''
      }
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Hotel &amp; Room</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.hotel)}${payload.roomNumber ? ` · Room ${escapeHtml(payload.roomNumber)}` : ''}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Passengers</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(paxLine)}</td></tr>
      ${
        payload.catalogBasePriceEur !== undefined
          ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Catalog Base Price</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">€${payload.catalogBasePriceEur} / adult</td></tr>`
          : ''
      }
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Total</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 800; color: #10B981;">€${payload.grossEur} (${escapeHtml(payload.paymentStatus)})</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Assigned Supplier</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(payload.supplierName)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Guest WhatsApp</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(guestWa || 'Not provided')}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; color: #64748B;">Guest Email</td><td style="padding: 8px 0; border-bottom: 1px solid #E5DFD7; font-weight: 700; color: #0F2233;">${escapeHtml(guestEmail || 'Not provided')}</td></tr>
      ${payload.notes ? `<tr><td style="padding: 8px 0; color: #64748B;">Special Notes</td><td style="padding: 8px 0; font-weight: 600; color: #0F2233;">${escapeHtml(payload.notes)}</td></tr>` : ''}
    </table>
    ${
      guestWaLink
        ? `<div style="margin-top: 16px; text-align: center;">
            <a href="${escapeHtml(guestWaLink)}" style="display: inline-block; background: #10B981; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 10px;">Message Guest on WhatsApp</a>
          </div>`
        : ''
    }
  `;

  const ownerBodyAr = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">
      ${
        isConfirmedUpdate
          ? `تم تأكيد الحجز نهائياً بتاريخ <strong>${escapeHtml(bookedAtStr)}</strong> (بتوقيت القاهرة) — <strong>${escapeHtml(payload.destination)}</strong>.`
          : `تم تسجيل طلب حجز جديد بتاريخ <strong>${escapeHtml(bookedAtStr)}</strong> (بتوقيت القاهرة) — <strong>${escapeHtml(payload.destination)}</strong>.`
      }
    </p>
    <p style="margin:0 0 10px;font-size:14px;color:#0F2233;">
      • <strong>الرحلة:</strong> ${escapeHtml(payload.tripTitle)}<br/>
      • <strong>تاريخ الرحلة:</strong> ${escapeHtml(payload.tripDate)}${payload.startTime ? ` · ${escapeHtml(payload.startTime)}` : ''}<br/>
      ${pickupLine ? `• <strong>موعد البيك أب:</strong> ${escapeHtml(pickupLine)}<br/>` : ''}
      ${payload.assignedDriverOrGuide ? `• <strong>السائق / المرشد:</strong> ${escapeHtml(payload.assignedDriverOrGuide)}<br/>` : ''}
      • <strong>المورد:</strong> ${escapeHtml(payload.supplierName)}<br/>
      • <strong>العميل:</strong> ${escapeHtml(payload.guestName)} (${escapeHtml(payload.guestCountry)})<br/>
      • <strong>لغة العميل / المرشد المطلوب:</strong> <strong style="color:#EE5426;">${escapeHtml(guestLangDisplay)}</strong><br/>
      • <strong>الفندق:</strong> ${escapeHtml(payload.hotel)}${payload.roomNumber ? ` · غرفة ${escapeHtml(payload.roomNumber)}` : ''}<br/>
      • <strong>الأفراد:</strong> ${escapeHtml(paxLine)}<br/>
      • <strong>الإجمالي:</strong> €${payload.grossEur} (${escapeHtml(payload.paymentStatus)})
    </p>
  `;

  const ownerEmailHtml = buildWaslaEmailHtml({
    titleAr: isTest
      ? `تنبيه تجريبي لحجز جديد — ${escapeHtml(payload.bookingId)}`
      : isConfirmedUpdate
      ? `تم تأكيد الحجز ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`
      : `طلب حجز جديد ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`,
    titleEn: isTest
      ? `Test Booking Alert — ${escapeHtml(payload.bookingId)}`
      : isConfirmedUpdate
      ? `Booking Confirmed ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`
      : `New Booking ${escapeHtml(payload.bookingId)} — ${escapeHtml(payload.tripTitle)}`,
    bodyHtmlAr: ownerBodyAr,
    bodyHtmlEn: ownerBodyEn,
    ctaTextAr: 'فتح لوحة الحجوزات والتشغيل',
    ctaTextEn: 'Open Dispatch Desk',
    ctaUrl: escapeHtml(appUrl),
  });

  // ---------------------------------------------------------------------------
  // 3. Single-Language Customer Confirmation Email (strictly in guest's chosen language)
  // ---------------------------------------------------------------------------
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

  const gc = GUEST_EMAIL_COPY[guestLangCode];
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

  const guestEmailSubject = isTest
    ? `[TEST] ${gc.subjectNew}`
    : isConfirmedUpdate
    ? gc.subjectConfirmed
    : gc.subjectNew;

  let privateTrackUrl = appUrl;
  if (isConfirmedUpdate) {
    try { privateTrackUrl = appUrl + '/?track=' + encodeURIComponent(payload.bookingId) + '#voucherToken=' + voucherToken(payload.bookingId); } catch { /* Fail closed until configured. */ }
  }
  const guestEmailText = [
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

  const channelStatus = getNotificationChannelStatus(env);
  const anyChannelConfigured =
    channelStatus.emailConfigured ||
    channelStatus.whatsappConfigured ||
    channelStatus.webhookConfigured;

  const result: BookingNotificationResult = {
    ok: true,
    delivered: false,
    email: { sent: false, provider: 'none', to: ownerEmails.join(', ') },
    guestEmail: { sent: false, provider: 'none', to: hasValidGuestEmail ? guestEmail : '' },
    whatsapp: { sent: false, provider: 'none', to: ownerWaDigits },
    webhook: { sent: false },
  };

  if (!anyChannelConfigured) {
    result.skipped = 'no_channels_configured';
    return result;
  }

  const smtpCfg = resolveSmtpConfig(env);
  const smtpFrom =
    readEnvAny(env, ['SMTP_FROM']) ||
    `Wasla Travel <${smtpCfg?.user || publicSupportEmail}>`;
  const resendApiKey = readEnvAny(env, ['RESEND_API_KEY']);
  const rawResendFrom =
    readEnvAny(env, ['RESEND_FROM_EMAIL']) || `Wasla Travel <${publicSupportEmail}>`;
  const angleMatch = rawResendFrom.match(/<([^>]+)>/);
  const verifiedResendAddress = (angleMatch ? angleMatch[1] : rawResendFrom).trim();
  const formattedResendFrom = EMAIL_REGEX.test(verifiedResendAddress)
    ? `Wasla Travel <${verifiedResendAddress}>`
    : rawResendFrom;
  const resendOwnerFrom = formattedResendFrom;
  const resendGuestFrom = formattedResendFrom;
  const metaWaToken = readEnvAny(env, META_WA_TOKEN_KEYS);
  const metaWaPhoneId = readEnvAny(env, META_WA_PHONE_ID_KEYS);
  const twilioSid = readEnvAny(env, ['TWILIO_ACCOUNT_SID']);
  const twilioToken = readEnvAny(env, ['TWILIO_AUTH_TOKEN']);
  const twilioFrom = readEnvAny(env, ['TWILIO_WHATSAPP_FROM']);
  const callMeBotKey = readEnvAny(env, ['CALLMEBOT_API_KEY']);
  const webhookUrl = readEnvAny(env, ['OWNER_ALERT_WEBHOOK_URL']);

  // ---------------------------------------------------------------------------
  // 4. Simultaneous Parallel Dispatch (Customer Email + Owner Email + Owner WhatsApp + Webhook)
  // ---------------------------------------------------------------------------
  const sendOwnerEmailTask = async () => {
    if (resendApiKey) {
      result.email.provider = 'resend';
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
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
        if (!resendRes.ok) {
          const errText = await resendRes.text();
          result.email.error = `Resend API ${resendRes.status}: ${errText.slice(0, 180)}`;
        } else {
          result.email.sent = true;
        }
      } catch (err) {
        result.email.error = err instanceof Error ? err.message : 'Resend owner delivery failed';
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
        result.email.error = err instanceof Error ? err.message : 'SMTP owner email delivery failed';
      }
    }
  };

  const sendCustomerEmailTask = async () => {
    if (isTest || !hasValidGuestEmail) return;
    if (resendApiKey) {
      result.guestEmail.provider = 'resend';
      try {
        const guestResendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
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
        if (!guestResendRes.ok) {
          const errText = await guestResendRes.text();
          result.guestEmail.error = `Resend API ${guestResendRes.status}: ${errText.slice(0, 180)}`;
        } else {
          result.guestEmail.sent = true;
        }
      } catch (err) {
        result.guestEmail.error =
          err instanceof Error ? err.message : 'Resend guest delivery failed';
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
        result.guestEmail.error =
          err instanceof Error ? err.message : 'SMTP guest email delivery failed';
      }
    }
  };

  const sendOwnerWhatsappTask = async () => {
    if (!ownerWaDigits) return;
    if (metaWaToken && metaWaPhoneId) {
      result.whatsapp.provider = 'whatsapp-cloud';
      try {
        const waRes = await fetch(
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
        if (!waRes.ok) {
          const errText = await waRes.text();
          result.whatsapp.error = `Meta WhatsApp API ${waRes.status}: ${errText.slice(0, 180)}`;
        } else {
          result.whatsapp.sent = true;
        }
      } catch (err) {
        result.whatsapp.error =
          err instanceof Error ? err.message : 'Meta WhatsApp delivery failed';
      }
    } else if (twilioSid && twilioToken && twilioFrom) {
      result.whatsapp.provider = 'twilio';
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const form = new URLSearchParams({
          From: twilioFrom.startsWith('whatsapp:')
            ? twilioFrom
            : `whatsapp:+${twilioFrom.replace(/\D/g, '')}`,
          To: `whatsapp:+${ownerWaDigits}`,
          Body: whatsappAlertText,
        });
        const twRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
          signal: AbortSignal.timeout(10_000),
        });
        if (!twRes.ok) {
          const errText = await twRes.text();
          result.whatsapp.error = `Twilio API ${twRes.status}: ${errText.slice(0, 180)}`;
        } else {
          result.whatsapp.sent = true;
        }
      } catch (err) {
        result.whatsapp.error = err instanceof Error ? err.message : 'Twilio delivery failed';
      }
    } else if (callMeBotKey) {
      result.whatsapp.provider = 'callmebot';
      try {
        const cmUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
          ownerWaDigits
        )}&text=${encodeURIComponent(whatsappAlertText)}&apikey=${encodeURIComponent(
          callMeBotKey
        )}`;
        const cmRes = await fetch(cmUrl, { method: 'GET', signal: AbortSignal.timeout(10_000) });
        const cmText = await cmRes.text().catch(() => '');
        if (!cmRes.ok || /error|invalid|not\s+found|not\s+activated/i.test(cmText)) {
          result.whatsapp.error = `CallMeBot (${cmRes.status}): ${cmText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Delivery failed'}`;
        } else {
          result.whatsapp.sent = true;
        }
      } catch (err) {
        result.whatsapp.error =
          err instanceof Error ? err.message : 'CallMeBot delivery failed';
      }
    } else if (metaWaPhoneId && !metaWaToken) {
      result.whatsapp.error =
        'WHATSAPP_CLOUD_TOKEN (access token) is missing in Secrets (Phone ID is detected).';
    } else if (metaWaToken && !metaWaPhoneId) {
      result.whatsapp.error =
        'WHATSAPP_PHONE_NUMBER_ID (or whatsapp_phone_id) is missing in Secrets (Token is detected).';
    }
  };

  const sendWebhookTask = async () => {
    if (!webhookUrl) return;
    try {
      const hookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: payload.eventType,
          bookingId: payload.bookingId,
          bookedAt: bookedAtStr,
          tripTitle: payload.tripTitle,
          destination: payload.destination,
          tripDate: payload.tripDate,
          startTime: payload.startTime || '',
          pickupTime: payload.pickupTime || '',
          pickupSpot: payload.pickupSpot || '',
          assignedDriverOrGuide: payload.assignedDriverOrGuide || '',
          guestName: payload.guestName,
          guestCountry: payload.guestCountry,
          guestWhatsapp: guestWa,
          guestEmail,
          hotel: payload.hotel,
          roomNumber: payload.roomNumber || '',
          adults: payload.adults,
          children: payload.children,
          infants: payload.infants,
          grossEur: payload.grossEur,
          supplierName: payload.supplierName,
          paymentStatus: payload.paymentStatus,
          notes: payload.notes || '',
          guestLanguage: guestLangDisplay,
          ownerEmail: ownerEmails[0] || publicSupportEmail,
          publicSupportEmail,
          ownerWhatsapp: ownerWaDigits,
          formattedWhatsappMessage: whatsappAlertText,
          guestEmailSubject,
          guestEmailText,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (hookRes.ok) {
        result.webhook.sent = true;
        if (!result.whatsapp.sent && result.whatsapp.provider === 'none') {
          result.whatsapp.provider = 'webhook';
          result.whatsapp.sent = true;
        }
      } else {
        result.webhook.error = `Webhook HTTP ${hookRes.status}`;
      }
    } catch (err) {
      result.webhook.error = err instanceof Error ? err.message : 'Webhook failed';
    }
  };

  await Promise.allSettled([
    sendOwnerEmailTask(),
    sendCustomerEmailTask(),
    sendOwnerWhatsappTask(),
    sendWebhookTask(),
  ]);

  const anyDelivered =
    result.email.sent ||
    result.guestEmail.sent ||
    result.whatsapp.sent ||
    result.webhook.sent;
  result.delivered = anyDelivered;
  if (!anyDelivered) {
    result.ok = false;
    result.retryable = true;
  }

  return result;
}
