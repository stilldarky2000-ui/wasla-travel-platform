import crypto from 'node:crypto';
export function voucherToken(id: string): string {
 const secret = process.env.VOUCHER_LINK_SECRET || '';
 if (Buffer.byteLength(secret) < 32) throw new Error('VOUCHER_LINK_SECRET must contain at least 32 bytes');
 return crypto.createHmac('sha256', secret).update('voucher:v1:' + id.toUpperCase()).digest('hex');
}
export function validVoucherToken(id: string, token: string): boolean {
 if (!/^[a-f0-9]{64}$/.test(token)) return false;
 try { return crypto.timingSafeEqual(Buffer.from(voucherToken(id), 'hex'), Buffer.from(token, 'hex')); } catch { return false; }
}
