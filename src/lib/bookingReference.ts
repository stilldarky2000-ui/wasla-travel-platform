/** Human-readable reference; never an authentication credential. */
export function createBookingReference(): string {
 const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
 const bytes = crypto.getRandomValues(new Uint8Array(8));
 return 'WT' + Array.from(bytes, n => alphabet[n % 32]).join('');
}
