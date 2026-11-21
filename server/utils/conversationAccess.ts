import crypto from 'node:crypto';

export function conversationToken(id: string, expires = Date.now() + 30 * 86400000): string {
  const secret = process.env.VOUCHER_LINK_SECRET || '';
  if (Buffer.byteLength(secret) < 32) throw new Error('Private conversation links are unavailable');
  const expiry = Math.floor(expires / 1000);
  const mac = crypto.createHmac('sha256', secret).update(`conversation:v1:${id.toUpperCase()}:${expiry}`).digest('hex');
  return `${expiry}.${mac}`;
}

export function validConversationToken(id: string, token: string, now = Date.now()): boolean {
  const match = /^(\d{10})\.([a-f0-9]{64})$/.exec(token);
  if (!match || Number(match[1]) * 1000 <= now) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(conversationToken(id, Number(match[1]) * 1000)), Buffer.from(token));
  } catch { return false; }
}
