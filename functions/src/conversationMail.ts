import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import type { Firestore } from 'firebase-admin/firestore';

export function conversationToken(id: string, expires = Date.now() + 30 * 86400000): string {
  const secret = process.env.VOUCHER_LINK_SECRET || '';
  if (Buffer.byteLength(secret) < 32) throw new Error('Private conversation links unavailable');
  const expiry = Math.floor(expires / 1000);
  return `${expiry}.` + crypto.createHmac('sha256', secret).update(`conversation:v1:${id.toUpperCase()}:${expiry}`).digest('hex');
}
export function conversationLink(id: string, appUrl: string, expires?: number): string {
  const url = new URL(appUrl);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('HTTPS APP_URL required');
  return url.origin + '/?conversation=' + encodeURIComponent(id) + '#conversationToken=' + conversationToken(id, expires);
}
export async function notifyConversationMessage(store: Firestore, bookingId: string, messageId: string): Promise<void> {
  const messageRef = store.doc(`conversations/${bookingId}/messages/${messageId}`);
  const snapshot = await messageRef.get();
  const message = snapshot.data();
  if (!message || message.internal || message.emailAcceptedAt) return;
  const booking = (await store.doc(`bookings/${bookingId}`).get()).data();
  if (!booking) return;
  const settings = (await store.doc('public_settings/storefront').get()).data() || {};
  const support = String(settings.email || 'booking@waslatravel.com');
  const to = message.sender === 'operator' ? [String(booking.guestEmail || '')] : String(process.env.OWNER_ALERT_EMAIL || support).split(',').map(v => v.trim());
  if (!to.length || !to.every(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) {
    await messageRef.update({ emailStatus: 'blocked_missing_recipient' });
    throw new Error('Conversation email recipient unavailable');
  }
  const appUrl = process.env.APP_URL || 'https://waslatravel.com';
  const createdAtMs = message.createdAt?.toMillis?.();
  if (!Number.isFinite(createdAtMs)) throw new Error('Message creation timestamp required');
  const link = message.sender === 'operator' ? conversationLink(bookingId, appUrl, createdAtMs + 30 * 86400000) : new URL(appUrl).origin;
  // Notification contains no message body or private staff context.
  const ar = String(booking.guestLang) === 'ar';
  const subject = message.sender === 'operator'
    ? (ar ? `رسالة جديدة من وصلة ترافيل — ${bookingId}` : `New message from Wasla Travel — ${bookingId}`)
    : `Guest message needs a reply — ${bookingId}`;
  const text = `${subject}\n\n${message.sender === 'operator' ? (ar ? 'افتح محادثة حجزك لقراءة الرسالة والرد.' : 'Open your private booking conversation to read and reply.') : 'A guest sent a message. Sign in and open Booking conversations.'}\n${link}\n\n${ar ? 'للرد داخل المحادثة، استخدم الرابط أعلاه.' : 'To keep the conversation together, reply using the link above.'}`;
  try {
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `conversation:${bookingId}:${messageId}` }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || `Wasla Travel <${support}>`, to, reply_to: support, subject, text }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Email provider did not accept notification');
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      await nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }, connectionTimeout: 10000, socketTimeout: 15000 }).sendMail({ from: process.env.SMTP_FROM || `Wasla Travel <${support}>`, to: to.join(','), replyTo: support, subject, text });
    } else throw new Error('Email provider is not configured');
    await messageRef.update({ emailStatus: 'provider_accepted', emailAcceptedAt: Date.now() });
  } catch {
    await messageRef.update({ emailStatus: 'retry', emailLastFailureAt: Date.now() });
    throw new Error('Conversation email requires retry');
  }
}
