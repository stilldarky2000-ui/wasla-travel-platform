import 'dotenv/config';
import { voucherToken, validVoucherToken } from './server/utils/voucherAccess';
import crypto from 'crypto';
import fs from 'fs';
import { readBooking, guestVoucher } from './server/utils/bookingStore';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  dispatchBookingNotifications,
  getNotificationChannelStatus,
} from './server/utils/bookingNotifications';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const BOOTSTRAPPED_OWNER_EMAIL = 'stilldarky2000@gmail.com';
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

interface FirebaseAppletConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

const firebaseConfig: FirebaseAppletConfig = (() => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8');
    return JSON.parse(raw) as FirebaseAppletConfig;
  } catch {
    return { projectId: '', firestoreDatabaseId: '(default)' };
  }
})();

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || '';
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)';
const FIRESTORE_API_ORIGIN = process.env.FIRESTORE_EMULATOR_HOST && process.env.NODE_ENV !== 'production'
  ? 'http://' + process.env.FIRESTORE_EMULATOR_HOST : 'https://firestore.googleapis.com';
const FIRESTORE_DOCS_BASE = `${FIRESTORE_API_ORIGIN}/v1/projects/${encodeURIComponent(
  FIREBASE_PROJECT_ID
)}/databases/${encodeURIComponent(FIRESTORE_DATABASE_ID)}/documents`;

type ServerRole = 'owner' | 'operations' | 'supplier' | 'none';

interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  idToken: string;
}

let cachedGoogleCerts: Record<string, string> = {};
let cachedCertsExpiresAt = 0;

async function getGooglePublicCerts(forceRefresh = false): Promise<Record<string, string>> {
  const now = Date.now();
  if (!forceRefresh && cachedCertsExpiresAt > now && Object.keys(cachedGoogleCerts).length > 0) {
    return cachedGoogleCerts;
  }
  const resp = await fetch(GOOGLE_CERTS_URL);
  if (!resp.ok) {
    throw new Error(`Failed to fetch Firebase public keys (HTTP ${resp.status})`);
  }
  const certs = (await resp.json()) as Record<string, string>;
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedGoogleCerts = certs;
  cachedCertsExpiresAt = now + Math.max(60, maxAgeSec) * 1000;
  return certs;
}

function decodeBase64UrlJson<T>(segment: string): T {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const raw = Buffer.from(padded + '='.repeat(padLen), 'base64').toString('utf8');
  return JSON.parse(raw) as T;
}

async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser | null> {
  if (!FIREBASE_PROJECT_ID || !idToken) return null;
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = decodeBase64UrlJson<{ alg?: string; kid?: string }>(parts[0]);
    const payload = decodeBase64UrlJson<{
      aud?: string;
      iss?: string;
      sub?: string;
      exp?: number;
      iat?: number;
      email?: string;
      email_verified?: boolean;
    }>(parts[1]);

    if (header.alg !== 'RS256' || !header.kid) return null;
    if (payload.aud !== FIREBASE_PROJECT_ID) return null;
    if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;
    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 128) return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp <= nowSec) return null;
    if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) return null;
    if (payload.email_verified !== true) return null;

    let certs = await getGooglePublicCerts(false);
    let cert = certs[header.kid];
    if (!cert) {
      certs = await getGooglePublicCerts(true);
      cert = certs[header.kid];
    }
    if (!cert) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();

    const sigB64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const sigPad = (4 - (sigB64.length % 4)) % 4;
    const signatureBuf = Buffer.from(sigB64 + '='.repeat(sigPad), 'base64');
    if (!verifier.verify(cert, signatureBuf)) return null;

    return {
      uid: payload.sub,
      email: String(payload.email || '').toLowerCase(),
      emailVerified: true,
      idToken,
    };
  } catch {
    return null;
  }
}

const TRUST_PROXY_ENABLED = process.env.TRUST_PROXY === '1';

async function resolveCallerRole(user: VerifiedFirebaseUser): Promise<ServerRole> {
  if (!user.emailVerified) return 'none';

  const authHeaders = { Authorization: `Bearer ${user.idToken}` };

  try {
    // Live uncached Firestore REST check on every protected request (no 30s role cache).
    // Even for the bootstrapped owner, hitting Firestore with the caller's Bearer token
    // ensures Google's Firestore backend validates token acceptance live on every call.
    const adminResp = await fetch(
      `${FIRESTORE_DOCS_BASE}/admins/${encodeURIComponent(user.uid)}`,
      { headers: authHeaders }
    );
    if (adminResp.status === 401) {
      return 'none';
    }
    if (adminResp.ok) {
      return 'owner';
    }
    if (user.email === BOOTSTRAPPED_OWNER_EMAIL && adminResp.status < 500) {
      return 'owner';
    }

    const roleResp = await fetch(
      `${FIRESTORE_DOCS_BASE}/staff_roles/${encodeURIComponent(user.uid)}`,
      { headers: authHeaders }
    );
    if (roleResp.status === 401) {
      return 'none';
    }
    if (roleResp.ok) {
      const docJson = (await roleResp.json()) as {
        fields?: {
          status?: { stringValue?: string };
          role?: { stringValue?: string };
        };
      };
      const status = docJson.fields?.status?.stringValue;
      const roleVal = docJson.fields?.role?.stringValue;
      if (status === 'Active') {
        if (roleVal === 'owner') return 'owner';
        if (roleVal === 'operations') return 'operations';
        if (roleVal === 'supplier') return 'supplier';
      }
    }
  } catch {
    return 'none';
  }

  return 'none';
}

function extractBearerToken(req: express.Request): string {
  const header = String(req.headers.authorization || '').trim();
  if (!header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

function getClientIp(req: express.Request): string {
  // Never trust raw X-Forwarded-For headers directly; only use req.ip when Express
  // trust proxy is explicitly enabled for a known reverse proxy (e.g., Cloud Run).
  if (TRUST_PROXY_ENABLED) {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
  return req.socket.remoteAddress || 'unknown';
}

function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  useGlobalKey?: boolean;
}): express.RequestHandler {
  const hits = new Map<string, number[]>();
  return (req, res, next) => {
    const now = Date.now();
    const uid = (req as express.Request & { authUser?: VerifiedFirebaseUser }).authUser?.uid;
    const identity = options.useGlobalKey ? 'global' : uid || getClientIp(req);
    const key = `${options.keyPrefix}:${identity}`;
    const recent = (hits.get(key) || []).filter((ts) => now - ts < options.windowMs);
    if (recent.length >= options.maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((options.windowMs - (now - recent[0])) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
        retryAfterSec,
      });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, timestamps] of hits.entries()) {
        if (timestamps.every((ts) => now - ts >= options.windowMs)) {
          hits.delete(k);
        }
      }
    }
    next();
  };
}

function requireRole(allowedRoles: ServerRole[]): express.RequestHandler {
  return async (req, res, next) => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please sign in to access this endpoint.' });
      return;
    }
    const verified = await verifyFirebaseIdToken(token);
    if (!verified) {
      res.status(401).json({ error: 'Invalid or expired Firebase authentication token.' });
      return;
    }
    const role = await resolveCallerRole(verified);
    if (!allowedRoles.includes(role)) {
      res.status(403).json({ error: 'Insufficient permissions for this action.' });
      return;
    }
    (req as express.Request & { authUser?: VerifiedFirebaseUser; authRole?: ServerRole }).authUser =
      verified;
    (req as express.Request & { authUser?: VerifiedFirebaseUser; authRole?: ServerRole }).authRole =
      role;
    next();
  };
}

interface VerifiedBookingReceipt {
  exists: boolean;
  reason?: string;
  tripId?: string;
  tripDate?: string;
  status?: string;
  verifiedTripTitle?: string;
  verifiedDestination?: string;
  verifiedSupplierName?: string;
  catalogBasePriceEur?: number;
}

async function verifyBookingReceiptAndTrip(
  bookingId: string,
  expectedDate?: string,
  expectedTripId?: string
): Promise<VerifiedBookingReceipt> {
  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(bookingId)) {
    return { exists: false, reason: 'Invalid booking ID format.' };
  }
  try {
    const resp = await fetch(
      `${FIRESTORE_DOCS_BASE}/booking_receipts/${encodeURIComponent(bookingId)}`
    );
    if (!resp.ok) {
      return { exists: false, reason: 'Booking record not found in Firestore.' };
    }
    const docJson = (await resp.json()) as {
      createTime?: string;
      fields?: {
        tripId?: { stringValue?: string };
        tripDate?: { stringValue?: string };
        status?: { stringValue?: string };
      };
    };
    const receiptTripId = (docJson.fields?.tripId?.stringValue || '').trim();
    const receiptDate = (docJson.fields?.tripDate?.stringValue || '').trim();
    const receiptStatus = (docJson.fields?.status?.stringValue || '').trim();

    if (!receiptTripId || !receiptDate) {
      return { exists: false, reason: 'Incomplete booking receipt in Firestore.' };
    }
    if (expectedTripId && receiptTripId !== expectedTripId) {
      return { exists: false, reason: 'Booking trip ID mismatch.' };
    }
    if (expectedDate && receiptDate !== expectedDate) {
      return { exists: false, reason: 'Booking date mismatch.' };
    }
    if (docJson.createTime) {
      const createdMs = Date.parse(docJson.createTime);
      if (Number.isFinite(createdMs) && Date.now() - createdMs > 15 * 60 * 1000) {
        return { exists: false, reason: 'Booking notification window expired.' };
      }
    }

    // Pull authoritative trip catalog details from Firestore for non-custom trips
    if (receiptTripId !== 'custom-itinerary') {
      const tripResp = await fetch(
        `${FIRESTORE_DOCS_BASE}/trips/${encodeURIComponent(receiptTripId)}`
      );
      if (!tripResp.ok) {
        return { exists: false, reason: 'Referenced excursion does not exist in catalog.' };
      }
      const tripJson = (await tripResp.json()) as {
        fields?: {
          name?: { mapValue?: { fields?: { en?: { stringValue?: string } } } };
          destination?: { stringValue?: string };
          supplierName?: { stringValue?: string };
          price?: { integerValue?: string; doubleValue?: number };
        };
      };
      const verifiedTripTitle = tripJson.fields?.name?.mapValue?.fields?.en?.stringValue?.trim();
      const verifiedDestination = tripJson.fields?.destination?.stringValue?.trim();
      const verifiedSupplierName = tripJson.fields?.supplierName?.stringValue?.trim();
      const rawPrice =
        tripJson.fields?.price?.doubleValue !== undefined
          ? Number(tripJson.fields.price.doubleValue)
          : tripJson.fields?.price?.integerValue !== undefined
          ? Number(tripJson.fields.price.integerValue)
          : undefined;

      return {
        exists: true,
        tripId: receiptTripId,
        tripDate: receiptDate,
        status: receiptStatus,
        verifiedTripTitle,
        verifiedDestination,
        verifiedSupplierName,
        catalogBasePriceEur: Number.isFinite(rawPrice) ? rawPrice : undefined,
      };
    }

    return {
      exists: true,
      tripId: receiptTripId,
      tripDate: receiptDate,
      status: receiptStatus,
    };
  } catch {
    return { exists: false, reason: 'Unable to verify booking record.' };
  }
}

async function getServerPublicSiteSettings(): Promise<{
  email?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
}> {
  if (!FIREBASE_PROJECT_ID) return {};
  try {
    const resp = await fetch(`${FIRESTORE_DOCS_BASE}/public_settings/storefront`);
    if (!resp.ok) return {};
    const docJson = (await resp.json()) as {
      fields?: {
        email?: { stringValue?: string };
        whatsappNumber?: { stringValue?: string };
        whatsappDisplay?: { stringValue?: string };
      };
    };
    return {
      email: docJson.fields?.email?.stringValue?.trim() || undefined,
      whatsappNumber: docJson.fields?.whatsappNumber?.stringValue?.trim() || undefined,
      whatsappDisplay: docJson.fields?.whatsappDisplay?.stringValue?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

function parseModelJson<T>(rawText: string | undefined, contextLabel: string): T {
  const cleaned = (rawText ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (!cleaned) {
    throw new Error(`${contextLabel} returned an empty JSON response.`);
  }
  return JSON.parse(cleaned) as T;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', TRUST_PROXY_ENABLED ? 1 : false);
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/maps-config', (_req, res) => {
    const apiKey =
      process.env.GOOGLE_MAPS_PLATFORM_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';
    res.json({ apiKey });
  });

  // ============================================================================
  // AUTOMATED BOOKING NOTIFICATIONS (CUSTOMER EMAIL + OWNER EMAIL & WHATSAPP)
  // ============================================================================
  const resolveServerRecipients = async () => {
    const serverSiteSettings = await getServerPublicSiteSettings();
    const rawOwnerEmails = String(
      process.env.OWNER_ALERT_EMAIL || serverSiteSettings.email || 'booking@waslatravel.com'
    ).trim();
    const ownerEmails = rawOwnerEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    const ownerWhatsappDigits = String(
      process.env.OWNER_WHATSAPP_TO || serverSiteSettings.whatsappNumber || '201129155520'
    ).replace(/\D/g, '');
    const ownerWhatsappDisplay =
      serverSiteSettings.whatsappDisplay ||
      (ownerWhatsappDigits ? `+${ownerWhatsappDigits}` : '+20 112 915 5520');
    const appUrl = (process.env.APP_URL || 'https://waslatravel.com').replace(/\/$/, '');
    const publicSupportEmail =
      serverSiteSettings.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(serverSiteSettings.email)
        ? serverSiteSettings.email
        : 'booking@waslatravel.com';
    return {
      ownerEmails: ownerEmails.length > 0 ? ownerEmails : [publicSupportEmail],
      publicSupportEmail,
      ownerWhatsappDigits,
      ownerWhatsappDisplay,
      appUrl,
    };
  };

  const aiRateLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 25,
    keyPrefix: 'ai',
  });
  const notificationRateLimiter = createRateLimiter({
    windowMs: 10 * 60_000,
    maxRequests: 6,
    keyPrefix: 'notify-booking',
  });
  const notificationGlobalLimiter = createRateLimiter({
    windowMs: 10 * 60_000,
    maxRequests: 40,
    keyPrefix: 'notify-booking-global',
    useGlobalKey: true,
  });

  const ownerTestRateLimiter = createRateLimiter({
    windowMs: 10 * 60_000,
    maxRequests: 25,
    keyPrefix: 'notify-owner-test',
  });

  app.get('/api/notifications/status', requireRole(['owner']), async (_req, res) => {
    try {
      const recipients = await resolveServerRecipients();
      res.json({
        ...getNotificationChannelStatus(),
        ownerEmailTarget: recipients.ownerEmails.join(', '),
      });
    } catch {
      res.json(getNotificationChannelStatus());
    }
  });

  app.post('/api/notifications/new-booking', notificationGlobalLimiter, (req,res,next) => (req.body?.isTest ? ownerTestRateLimiter : notificationRateLimiter)(req,res,next), async (req, res) => {
    try {
      const body = req.body || {};
      if (body.isTest) {
        const token = extractBearerToken(req);
        const verified = token ? await verifyFirebaseIdToken(token) : null;
        if (!verified) { res.status(401).json({ok:false}); return; }
        if (await resolveCallerRole(verified) !== 'owner') { res.status(403).json({ok:false}); return; }
        const recipients = await resolveServerRecipients();
        const result = await dispatchBookingNotifications({
          bookingId:'WTTEST', eventType:'test', tripTitle:'Notification test', destination:'Hurghada',
          tripDate:new Date().toISOString().slice(0,10), supplierName:'Wasla Operations', guestName:'Owner test',
          guestCountry:'', hotel:'Test only', adults:1, children:0, infants:0, grossEur:0, paymentStatus:'Test'
        }, recipients);
        res.json(result); return;
      }
      const id = String(body.id || '').trim();
      const receipt = await verifyBookingReceiptAndTrip(id);
      if (!receipt.exists) { res.status(400).json({ok:false,error:'A saved booking is required.'}); return; }
      // Firestore booking writes enqueue notifications. This endpoint never sends or trusts guest data.
      res.status(202).json({ok:true,queued:true,delivered:false});
    } catch { res.status(503).json({ok:false,retryable:true,error:'Notification status unavailable.'}); }
  });

  app.post('/api/notifications/booking-confirmed', requireRole(['owner','operations']), notificationGlobalLimiter, async (req,res) => {
    try {
      const booking = await readBooking(FIREBASE_PROJECT_ID,FIRESTORE_DATABASE_ID,String(req.body?.id || '').trim());
      if (!booking || !['Confirmed','Driver assigned','Completed'].includes(String(booking.status))) {
        res.status(400).json({ok:false,error:'Confirmed booking required.'}); return;
      }
      res.status(202).json({ok:true,queued:true,delivered:false});
    } catch { res.status(503).json({ok:false,retryable:true,error:'Booking storage unavailable.'}); }
  });

  const voucherLookupLimiter = createRateLimiter({windowMs:60000,maxRequests:40,keyPrefix:'voucher-lookup'});
  // Compatibility endpoint for older clients; payloads are no longer copied into a cache.
  app.post('/api/vouchers/sync', requireRole(['owner','operations']), (_req,res) => {
    res.json({ok:true,source:'firestore',synced:0});
  });
  app.post('/api/vouchers/:bookingId/link', requireRole(['owner','operations']), async (req,res) => {
    res.set('Cache-Control','no-store');
    try {
      const id = String(req.params.bookingId || '').trim().toUpperCase();
      const booking = await readBooking(FIREBASE_PROJECT_ID,FIRESTORE_DATABASE_ID,id);
      if (!booking) { res.status(404).json({ok:false}); return; }
      res.json({token:voucherToken(id)});
    } catch { res.status(503).json({ok:false,error:'Private voucher links unavailable.'}); }
  });
  app.get('/api/vouchers/:bookingId', voucherLookupLimiter, async (req,res) => {
    res.set('Cache-Control','no-store');
    const id = String(req.params.bookingId || '').trim().toUpperCase();
    if (!validVoucherToken(id,String(req.get('X-Voucher-Token') || ''))) {
      res.status(403).json({ok:false,error:'Use the private booking link to view details.'}); return;
    }
    try {
      const booking = await readBooking(FIREBASE_PROJECT_ID,FIRESTORE_DATABASE_ID,id);
      if (!booking) { res.status(404).json({ok:false,error:'Booking not found.'}); return; }
      res.json({ok:true,voucher:guestVoucher(booking)});
    } catch { res.status(503).json({ok:false,retryable:true,error:'Booking storage unavailable.'}); }
  });

  app.get('/dev-sw.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store');
    res.send(
      `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.registration.unregister())
  );
});`
    );
  });

  app.post('/api/assistant', requireRole(['owner', 'operations']), aiRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable AI draft replies.',
      });
      return;
    }

      const {
        customerName,
        language,
        targetLanguageOverride,
        tripTitle,
        bookingRef,
        pickupInfo,
        latestMessage,
        conversationHistory,
        bookingContext,
        operatorIntent,
        audioBase64,
        mimeType = 'audio/webm',
      } = req.body ?? {};
      const rawAudio =
        typeof audioBase64 === 'string'
          ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim()
          : '';
      const trimmedOperatorText = String(operatorIntent ?? '').trim();
      if (!latestMessage && !trimmedOperatorText && !rawAudio) {
        res.status(400).json({ error: 'Missing message context for assistant.' });
        return;
      }

      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const preferredLang = String(targetLanguageOverride || language || 'en').trim();

        const systemInstruction =
          'You are a high-precision multilingual translator and messaging assistant for Wasla Travel (waslatravel.com).\n' +
          'CRITICAL FIDELITY RULE (HIGHEST PRIORITY):\n' +
          '1. When the operator provides specific words, sentences, facts, apologies, or instructions (e.g. "اعتذر له وقول له إنك في السكة", "قوله البيك أب الساعة 9 قدام البوابة", "I am 5 minutes away"), you MUST translate and express THAT EXACT SPECIFIC MEANING accurately and faithfully.\n' +
          '   - DO NOT invent extra sentences, unrequested apologies, extra promises, or extra booking details (like hotel/driver/price) unless the operator explicitly included them.\n' +
          '   - DO NOT alter numbers, times, locations, or facts, and DO NOT paraphrase creatively to change the meaning.\n' +
          '   - Strip out operator wrapper phrases like "قوله", "قله", "ابعتله", "بالألماني", "رد عليه وقل له", so ONLY the clean customer-facing message appears in `draft`.\n' +
          '   - Translate Egyptian Arabic idioms faithfully (e.g., "في السكة" -> "on the way / unterwegs", "قدام البوابة" -> "in front of the main gate / vor dem Haupteingang", "عشان الزحمة" -> "due to traffic / wegen des Verkehrs").\n' +
          '2. ONLY if the operator provides NO specific message (empty text, OR strictly a bare command like "رد عليه" / "رد عليه بالألماني" with zero message content), read `Full Recent Conversation` and `Latest Customer Message` to write a concise, direct reply answering what the customer just asked.\n' +
          '3. TARGET LANGUAGE RULE: If `targetLanguageOverride` is provided, or if the operator explicitly asks for a language inside their text (e.g. "بالألماني", "in German", "بالإنجليزي", "بالعربي", "بالفرنساوي"), output `draft` in THAT exact language. Otherwise use `Default Thread Language`.';

        const historyText = Array.isArray(conversationHistory)
          ? conversationHistory
              .slice(-15)
              .map((m: { sender?: string; text?: string; timestamp?: string }) =>
                `${m.sender === 'operator' ? 'Operations' : customerName || 'Customer'} (${m.timestamp || ''}): ${m.text || ''}`
              )
              .join('\n')
          : '';

        const bookingDetailsText = bookingContext
          ? JSON.stringify(bookingContext)
          : `Pickup/schedule note: ${pickupInfo || 'N/A'}`;

        const prompt = [
          `Customer Name: ${customerName || 'Guest'}`,
          `Default Thread Language: ${language || 'en'}`,
          `Target Language Override: ${preferredLang}`,
          `Booking Ref: ${bookingRef || 'Inquiry'} | Trip: ${tripTitle || 'Excursion'}`,
          `Live Booking Context (reference only if operator text is empty or asks to use booking details): ${bookingDetailsText}`,
          historyText
            ? `Full Recent Conversation:\n${historyText}`
            : `Latest Customer Message: ${latestMessage || '(none)'}`,
          rawAudio
            ? 'Operator Command: Transcribe audio into `transcript` and follow the strict fidelity rule for `draft`.'
            : trimmedOperatorText
            ? `Exact Operator Message / Command to Deliver Faithfully:\n${trimmedOperatorText}`
            : 'Operator provided empty draft: Generate a concise, direct context-based reply to the customer’s latest message above.',
        ].join('\n\n');

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            hasSpeech: {
              type: Type.BOOLEAN,
              description: 'True for text input or valid spoken speech.',
            },
            transcript: {
              type: Type.STRING,
              description: 'Empty string for text input, or exact audio transcript.',
            },
            draft: {
              type: Type.STRING,
              description: 'The exact customer-facing message in the target language, faithfully matching the operator’s exact meaning.',
            },
            targetLanguage: {
              type: Type.STRING,
              description: 'Uppercase ISO language code of the draft (e.g. DE, EN, AR, FR, NL, RU).',
            },
            operatorNote: {
              type: Type.STRING,
              description: 'Very brief Arabic confirmation note (e.g. تم تجهيز النص بدقة بالألمانية — راجعه واضغط Send).',
            },
          },
          required: ['hasSpeech', 'transcript', 'draft', 'targetLanguage', 'operatorNote'],
        };

        const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
        const contentsPayload = rawAudio
          ? {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: prompt },
              ],
            }
          : prompt;

        let modelUsed = 'gemini-4-hydrogen';
        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: contentsPayload,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
        } catch {
          modelUsed = 'gemini-3.1-flash-lite';
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: contentsPayload,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
        }

        const parsed = parseModelJson<{
          hasSpeech?: boolean;
          transcript?: string;
          draft?: string;
          targetLanguage?: string;
          operatorNote?: string;
        }>(response.text, 'Operations chat assistant');

        res.json({
          hasSpeech: parsed.hasSpeech !== false,
          transcript: (parsed.transcript ?? '').trim(),
          draft: (parsed.draft ?? '').trim(),
          targetLanguage: (parsed.targetLanguage ?? preferredLang).toUpperCase(),
          operatorNote: (parsed.operatorNote ?? '').trim(),
          modelUsed,
        });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Assistant request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/translate', requireRole(['owner', 'operations']), aiRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable message translation.',
      });
      return;
    }

    const { text, sourceLang, targetLang = 'ar' } = req.body ?? {};
    const trimmed = String(text ?? '').trim();
    if (!trimmed) {
      res.status(400).json({ error: 'Missing text to translate.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction =
        'You are a literal, high-precision translator for Wasla Travel operations.\n' +
        'Translate the given customer message accurately and naturally into clear Arabic (or requested target language).\n' +
        'CRITICAL RULES:\n' +
        '- Preserve EVERY detail, time, number, hotel name, child age, and question faithfully.\n' +
        '- DO NOT add commentary, greetings, explanations, or extra text.\n' +
        '- Output ONLY the clean translation in the JSON `translation` field.';

      const prompt = [
        `Source Language Hint: ${sourceLang || 'auto'}`,
        `Target Language: ${targetLang === 'ar' ? 'Arabic (Clear natural Arabic)' : targetLang}`,
        `Customer Message:\n${trimmed}`,
      ].join('\n\n');

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          translation: {
            type: Type.STRING,
            description: 'Clean, accurate translation of the customer message only.',
          },
        },
        required: ['translation'],
      };

      const modelUsed = 'gemini-3.1-flash-lite';
      const response = await ai.models.generateContent({
        model: modelUsed,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const parsed = parseModelJson<{ translation?: string }>(response.text, 'Message translator');
      res.json({
        translation: (parsed.translation ?? '').trim(),
        modelUsed,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Translation failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/ads/generate', requireRole(['owner']), aiRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable AI ad generation.',
      });
      return;
    }

    const {
      tripTitle,
      destination,
      price,
      duration,
      highlights,
      platform,
      audienceLanguage,
      goal,
      offerNote,
      commissionPerBooking,
    } = req.body ?? {};

    if (!tripTitle || !platform) {
      res.status(400).json({ error: 'Missing trip or platform selection.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction =
        'You are a high-ROI performance marketer for Wasla Travel (waslatravel.com), a local Red Sea & Egypt excursions marketplace in Hurghada, Marsa Alam, Luxor, and Cairo. ' +
        'Write persuasive, conversion-focused ad copy in the requested audienceLanguage (en, de, or ar) that emphasizes local direct pricing (no hotel rep markup), free hotel pickup, verified Egyptian guides, and instant WhatsApp booking. ' +
        'Keep copy authentic, punchy, and tailored to the requested platform. Provide practical audience targeting and budget advice so ad spend stays profitable relative to the commission per booking.';

      const prompt = [
        `Platform: ${platform}`,
        `Audience Language: ${audienceLanguage || 'en'}`,
        `Campaign Goal: ${goal || 'Direct Bookings'}`,
        `Trip: ${tripTitle} (${destination || 'Hurghada'})`,
        `Price: €${price ?? 45} per person | Duration: ${duration || 'Full day'}`,
        `Estimated owner commission per guest: €${commissionPerBooking ?? 7}`,
        `Key Highlights: ${Array.isArray(highlights) ? highlights.join(', ') : highlights || 'Hotel pickup included'}`,
        `Special Offer / Angle: ${offerNote || 'Pay on pickup · Instant WhatsApp confirmation'}`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook: {
                type: Type.STRING,
                description: 'Scroll-stopping opening line or video hook.',
              },
              headline: {
                type: Type.STRING,
                description: 'Short, clickable ad headline (under 60 characters).',
              },
              primaryText: {
                type: Type.STRING,
                description: 'Main persuasive body copy formatted cleanly for the chosen platform.',
              },
              cta: {
                type: Type.STRING,
                description: 'Direct call to action prompting booking or WhatsApp message.',
              },
              targetingTip: {
                type: Type.STRING,
                description: 'Practical audience geo-targeting, radius, and max CPA budget advice for this trip margin.',
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 6 relevant hashtags.',
              },
            },
            required: ['hook', 'headline', 'primaryText', 'cta', 'targetingTip', 'hashtags'],
          },
        },
      });

      const parsed = parseModelJson<Record<string, unknown>>(response.text, 'Ad generation');
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ad generation request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/owner/copilot', requireRole(['owner']), aiRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable the AI Executive Copilot.',
      });
      return;
    }

    const {
      mode = 'briefing',
      language = 'ar',
      question = '',
      audioBase64,
      mimeType = 'audio/webm',
      snapshot,
    } = req.body ?? {};
    if (!snapshot) {
      res.status(400).json({ error: 'Missing company snapshot data.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const snapshotText = JSON.stringify(snapshot, null, 2);

      const chatSystemInstruction =
        language === 'ar'
          ? 'أنت المساعد التنفيذي الشخصي (AI Chief of Staff) لمالك شركة Wasla Travel (waslatravel.com) في الغردقة والأقصر والقاهرة ومرسى علم. ' +
            'مواصفات شخصيتك وأسلوبك في الكلام: أنت شاب مصري قاهري، ذكي جداً، سريع البديهة، فطن ولمّاح. ' +
            'اتكلم بالعامية المصرية القاهرية الطبيعية الذكية والسريعة، ادخل في المفيد علطول من غير مقدمات طويلة ولا كلام إنشائي، وخلي ردودك مركزة (من جملتين لـ 4 جمل سريعة وواضحة). ' +
            'استخدم الأرقام الحقيقية من بيانات الشركة اللي قدامك، ونبّه المالك بذكاء لأي حجز عاجل أو شكوى أو فرصة تزود المكسب، ولا تخترع أرقام غير موجودة.'
          : 'You are the AI Chief of Staff for the owner of Wasla Travel (waslatravel.com). ' +
            'Your persona: a smart, quick-witted, sharp young Cairene Egyptian executive partner. ' +
            'Be brisk, direct, street-smart, and profit-focused (2 to 4 crisp sentences), grounded strictly in the live company snapshot.';

      if (mode === 'voice-chat') {
        const rawAudio =
          typeof audioBase64 === 'string'
            ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim()
            : '';
        if (!rawAudio) {
          res.status(400).json({ error: 'Missing recorded voice payload.' });
          return;
        }

        const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
        const voicePrompt =
          language === 'ar'
            ? `استمع إلى التسجيل الصوتي المرفق من مالك الشركة، وحوّل كلامه بدقة إلى نص في الحقل \`transcript\`، ثم اكتب ردك التنفيذي الذكي والسريع في الحقل \`reply\` بناءً على بيانات الشركة الحية التالية:\n${snapshotText}\nإذا كان التسجيل صامتاً تماماً أو مجرد ضوضاء بدون أي كلام بشري واضح، اجعل \`hasSpeech\` بقيمة false واجعل \`transcript\` و \`reply\` نصاً فارغاً.`
            : `Listen to the attached voice recording from the company owner, transcribe their exact words into \`transcript\`, and write your brisk executive reply in \`reply\` grounded in this live company snapshot:\n${snapshotText}\nIf the recording is silent or contains no intelligible speech, set \`hasSpeech\` to false and both \`transcript\` and \`reply\` to empty strings.`;

        const voiceChatSchema = {
          type: Type.OBJECT,
          properties: {
            hasSpeech: {
              type: Type.BOOLEAN,
              description: 'True only if clear human speech was heard in the audio clip.',
            },
            transcript: {
              type: Type.STRING,
              description: 'Exact transcription of what the owner said, or empty string if silent.',
            },
            reply: {
              type: Type.STRING,
              description: 'Your executive reply to the owner question, or empty string if silent.',
            },
          },
          required: ['hasSpeech', 'transcript', 'reply'],
        };

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: voicePrompt },
              ],
            },
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: 'application/json',
              responseSchema: voiceChatSchema,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: voicePrompt },
              ],
            },
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: voiceChatSchema,
            },
          });
        }

        const parsed = parseModelJson<{
          hasSpeech?: boolean;
          transcript?: string;
          reply?: string;
        }>(response.text, 'Voice copilot chat');

        res.json({
          hasSpeech: parsed.hasSpeech !== false,
          transcript: (parsed.transcript ?? '').trim(),
          reply: (parsed.reply ?? '').trim(),
        });
        return;
      }

      if (mode === 'transcribe') {
        const rawAudio =
          typeof audioBase64 === 'string'
            ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim()
            : '';
        if (!rawAudio) {
          res.status(400).json({ error: 'Missing recorded voice payload.' });
          return;
        }

        const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
        const transcribePrompt =
          language === 'ar'
            ? 'استمع إلى التسجيل الصوتي وحوّله بدقة إلى نص مكتوب فقط دون إضافة أي تعليق. إذا كان صامتاً اجعل hasSpeech بقيمة false و transcript فارغاً.'
            : 'Listen to the voice clip and transcribe the exact spoken words cleanly into `transcript`. If silent or unintelligible, set `hasSpeech` to false and `transcript` to empty string.';

        const transcribeSchema = {
          type: Type.OBJECT,
          properties: {
            hasSpeech: { type: Type.BOOLEAN },
            transcript: { type: Type.STRING },
          },
          required: ['hasSpeech', 'transcript'],
        };

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: transcribePrompt },
              ],
            },
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: 'application/json',
              responseSchema: transcribeSchema,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: transcribePrompt },
              ],
            },
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: transcribeSchema,
            },
          });
        }

        const parsed = parseModelJson<{
          hasSpeech?: boolean;
          transcript?: string;
        }>(response.text, 'Voice transcription');

        res.json({
          hasSpeech: parsed.hasSpeech !== false,
          transcript: (parsed.transcript ?? '').trim(),
        });
        return;
      }

      if (mode === 'chat') {
        if (!String(question).trim()) {
          res.status(400).json({ error: 'Please enter a question for the executive assistant.' });
          return;
        }

        const chatPrompt = [
          `Live Company Snapshot:\n${snapshotText}`,
          `Owner Question:\n${question}`,
        ].join('\n\n');

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: chatPrompt,
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: chatPrompt,
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });
        }

        res.json({ reply: (response.text ?? '').trim() });
        return;
      }

      const briefingSystemInstruction =
        language === 'ar'
          ? 'أنت المساعد التنفيذي الشخصي الذكي لإدارة شركة Wasla Travel بالكامل (waslatravel.com). ' +
            'شخصيتك: شاب مصري قاهري، ذكي وسريع وفطن ولمّاح. ' +
            'حلل بيانات الشركة الحية (الحجوزات، الإيرادات، نسبة العمولة، الموردين المعلقين، الشكاوى، المحادثات، والرحلات) وقدم للمالك تقريراً حازماً وسريعاً باللهجة المصرية القاهرية الذكية والمباشرة يشمل: ملخص الموقف، أهم التنبيهات العاجلة، الفرص الذهبية لزيادة المكسب، وخطة تسويق عملية للأسبوع القادم.'
          : 'You are the personal AI Chief of Staff managing Wasla Travel (waslatravel.com) with the persona of a smart, quick-witted, sharp young Cairene Egyptian executive. ' +
            'Analyze the live company snapshot and return a brisk, decisive executive briefing covering company status, critical alerts, high-margin opportunities, and a concrete 7-day marketing plan.';

      const briefingSchema = {
        type: Type.OBJECT,
        properties: {
          executiveSummary: {
            type: Type.STRING,
            description: 'Concise 2-3 sentence summary of current revenue, operations health, and top priority.',
          },
          criticalAlerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                severity: { type: Type.STRING, description: 'high or medium' },
                detail: { type: Type.STRING },
                action: { type: Type.STRING },
              },
              required: ['title', 'severity', 'detail', 'action'],
            },
          },
          growthOpportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                estimatedImpact: { type: Type.STRING },
                detail: { type: Type.STRING },
                action: { type: Type.STRING },
              },
              required: ['title', 'estimatedImpact', 'detail', 'action'],
            },
          },
          marketingPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                channel: { type: Type.STRING },
                focusTripOrAngle: { type: Type.STRING },
                weeklyAction: { type: Type.STRING },
                expectedReturn: { type: Type.STRING },
              },
              required: ['channel', 'focusTripOrAngle', 'weeklyAction', 'expectedReturn'],
            },
          },
        },
        required: ['executiveSummary', 'criticalAlerts', 'growthOpportunities', 'marketingPlan'],
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Analyze this live company snapshot and produce the executive briefing:\n${snapshotText}`,
          config: {
            systemInstruction: briefingSystemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: briefingSchema,
          },
        });
      } catch {
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Analyze this live company snapshot and produce the executive briefing:\n${snapshotText}`,
          config: {
            systemInstruction: briefingSystemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: briefingSchema,
          },
        });
      }

      const parsed = parseModelJson<Record<string, unknown>>(response.text, 'Executive briefing');
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Executive copilot request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/owner/transcribe', requireRole(['owner']), aiRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable voice input.',
      });
      return;
    }

    const { audioBase64, mimeType = 'audio/webm', language = 'ar' } = req.body ?? {};
    const rawData = typeof audioBase64 === 'string' ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim() : '';
    if (!rawData) {
      res.status(400).json({ error: 'Missing recorded audio payload.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
      const promptHint =
        language === 'auto'
          ? 'Transcribe the spoken human voice in this audio clip into its exact spoken language (Egyptian Arabic / العامية المصرية, Standard Arabic, English, or German). If the clip is silent, only background noise, or contains no intelligible speech, set hasSpeech to false and transcript to an empty string. Never invent or guess words.'
          : language === 'ar'
          ? 'حول الكلام المنطوق في هذا التسجيل الصوتي بدقة إلى النص العربي (بالعامية المصرية أو الفصحى كما قيلت) أو الإنجليزية إن نُطقت. إذا كان التسجيل صامتاً أو مجرد ضوضاء بدون كلام واضح، اجعل hasSpeech بقيمة false و transcript نصاً فارغاً تماماً دون تأليف أي جمل.'
          : 'Transcribe the spoken human voice in this audio clip accurately in its spoken language (English, German, or Arabic). If there is no intelligible speech, set hasSpeech to false and transcript to an empty string.';

      const audioPart = {
        inlineData: {
          mimeType: cleanMime,
          data: rawData,
        },
      };

      const transcribeSchema = {
        type: Type.OBJECT,
        properties: {
          hasSpeech: {
            type: Type.BOOLEAN,
            description: 'True only if clear human speech is audible in the recording.',
          },
          transcript: {
            type: Type.STRING,
            description: 'Exact transcription of the spoken words, or empty string if silent/noise.',
          },
        },
        required: ['hasSpeech', 'transcript'],
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: { parts: [audioPart, { text: promptHint }] },
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: transcribeSchema,
          },
        });
      } catch {
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: { parts: [audioPart, { text: promptHint }] },
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: transcribeSchema,
          },
        });
      }

      const parsed = parseModelJson<{ hasSpeech?: boolean; transcript?: string }>(
        response.text,
        'Voice transcription'
      );
      const transcript = parsed.hasSpeech === false ? '' : (parsed.transcript ?? '').trim();
      res.json({ transcript });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio transcription failed.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/owner/tts', requireRole(['owner']), aiRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable spoken replies.',
      });
      return;
    }

    const { text = '' } = req.body ?? {};
    const cleanedText = String(text)
      .replace(/[#*_`>~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1400);

    if (!cleanedText) {
      res.status(400).json({ error: 'Missing text to synthesize.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanedText,
                  speechMetadata: {
                    style:
                      'Smart, quick-witted, energetic young Cairene Egyptian man speaking natural Cairene Arabic clearly and briskly (شاب مصري قاهري ذكي وسريع وفطن)',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck',
                },
              },
            },
          },
        });
      } catch {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanedText,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck',
                },
              },
            },
          },
        });
      }

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const audioPart = parts.find((p) => p.inlineData?.data);
      const audioData = audioPart?.inlineData?.data;
      if (!audioData) {
        res.status(502).json({ error: 'TTS model returned no audio stream.' });
        return;
      }

      res.json({
        audioBase64: audioData,
        mimeType: audioPart?.inlineData?.mimeType || 'audio/wav',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Voice reply synthesis failed.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/trips/translate', requireRole(['owner', 'operations', 'supplier']), aiRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable auto-translation.',
      });
      return;
    }

    const {
      title,
      duration,
      pickup,
      shortDescription,
      fullDescription,
      itinerary,
      historicalFacts,
      galleryCaptions,
      highlights,
      included,
      tips,
      notSuitableFor,
      whatToBring,
      notAllowed,
      knowBeforeYouGo,
      options,
    } = req.body ?? {};
    if (!title || !shortDescription) {
      res.status(400).json({ error: 'Missing trip title or description for translation.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const localizedSchema = {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING },
          ar: { type: Type.STRING },
          de: { type: Type.STRING },
        },
        required: ['en', 'ar', 'de'],
      };

      const systemInstruction =
        'You are a professional multilingual tourism translator for Wasla Travel in Hurghada, Luxor, Cairo, and Marsa Alam. ' +
        'Translate the supplier input (which may be written in Arabic, English, German, or mixed) accurately and naturally into all three languages: ' +
        'English (en), clear modern Arabic (ar), and natural German (de). Preserve numbers, times, places, and tour package details faithfully.';

      const inputPayload = JSON.stringify({
        title,
        duration: duration || '4 hours',
        pickup: pickup || 'Hurghada City included · Outer zones +€10–15/pp',
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        itinerary: Array.isArray(itinerary) ? itinerary : [],
        historicalFacts: Array.isArray(historicalFacts) ? historicalFacts : [],
        galleryCaptions: Array.isArray(galleryCaptions) ? galleryCaptions : [],
        highlights: Array.isArray(highlights) && highlights.length > 0 ? highlights : [shortDescription],
        included: Array.isArray(included) && included.length > 0 ? included : ['Hotel pickup & vetted local guide'],
        tips: Array.isArray(tips) ? tips : [],
        notSuitableFor: Array.isArray(notSuitableFor) ? notSuitableFor : [],
        whatToBring: Array.isArray(whatToBring) ? whatToBring : [],
        notAllowed: Array.isArray(notAllowed) ? notAllowed : [],
        knowBeforeYouGo: Array.isArray(knowBeforeYouGo) ? knowBeforeYouGo : [],
        options: Array.isArray(options) ? options : [],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Translate this tourism listing JSON into en, ar, and de:\n${inputPayload}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: localizedSchema,
              duration: localizedSchema,
              pickup: localizedSchema,
              shortDescription: localizedSchema,
              fullDescription: localizedSchema,
              itinerary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: localizedSchema,
                    subtitle: localizedSchema,
                    durationOrTime: localizedSchema,
                  },
                  required: ['title'],
                },
              },
              historicalFacts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    era: localizedSchema,
                    metric: localizedSchema,
                    title: localizedSchema,
                    fact: localizedSchema,
                  },
                  required: ['title', 'fact'],
                },
              },
              galleryCaptions: { type: Type.ARRAY, items: localizedSchema },
              highlights: { type: Type.ARRAY, items: localizedSchema },
              included: { type: Type.ARRAY, items: localizedSchema },
              tips: { type: Type.ARRAY, items: localizedSchema },
              notSuitableFor: { type: Type.ARRAY, items: localizedSchema },
              whatToBring: { type: Type.ARRAY, items: localizedSchema },
              notAllowed: { type: Type.ARRAY, items: localizedSchema },
              knowBeforeYouGo: { type: Type.ARRAY, items: localizedSchema },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: localizedSchema,
                    detail: localizedSchema,
                  },
                  required: ['title', 'detail'],
                },
              },
            },
            required: ['name', 'duration', 'pickup', 'shortDescription', 'highlights', 'included', 'options'],
          },
        },
      });

      const parsed = parseModelJson<Record<string, unknown>>(response.text, 'Auto-translation');
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auto-translation request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });

    app.use('/@vite/client', async (req, res, next) => {
      try {
        const result = await vite.transformRequest(req.originalUrl || '/@vite/client');
        if (result?.code) {
          const patched = result.code.replace(
            /reject\(\/\*\s*@__PURE__\s*\*\/\s*new Error\("WebSocket closed without opened\."\)\)/g,
            'resolve()'
          );
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          res.status(200).send(patched);
          return;
        }
      } catch {
        // Fall through to default vite middleware
      }
      next();
    });

    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Wasla Travel server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();



