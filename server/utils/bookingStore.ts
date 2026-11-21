import { GoogleAuth } from 'google-auth-library';
const identity = new GoogleAuth({scopes: ['https://www.googleapis.com/auth/datastore']});
type Value = { stringValue?: string; integerValue?: string; doubleValue?: number; booleanValue?: boolean; timestampValue?: string; nullValue?: unknown; mapValue?: {fields?: Record<string, Value>}; arrayValue?: {values?: Value[]} };
function decode(v: Value): unknown {
 if ('stringValue' in v) return v.stringValue;
 if ('integerValue' in v) return Number(v.integerValue);
 if ('doubleValue' in v) return v.doubleValue;
 if ('booleanValue' in v) return v.booleanValue;
 if ('timestampValue' in v) return v.timestampValue;
 if ('mapValue' in v) return decodeFields(v.mapValue?.fields || {});
 if ('arrayValue' in v) return (v.arrayValue?.values || []).map(decode);
 return null;
}
function decodeFields(fields: Record<string, Value>): Record<string, unknown> {
 return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)]));
}
export async function readBooking(project: string, database: string, id: string): Promise<Record<string, unknown> | null> {
 if (!/^[A-Za-z0-9_-]{3,128}$/.test(id)) return null;
 const emulator = process.env.FIRESTORE_EMULATOR_HOST;
 if (emulator && process.env.NODE_ENV === 'production') throw new Error('Emulator forbidden in production');
 const base = emulator ? 'http://' + emulator : 'https://firestore.googleapis.com';
 const headers: Record<string,string> = emulator ? {Authorization:'Bearer owner'} : {};
 if (!emulator) {
   const token = await identity.getAccessToken();
   if (!token) throw new Error('Server identity unavailable');
   headers.Authorization = 'Bearer ' + token;
 }
 const url = base + '/v1/projects/' + encodeURIComponent(project) + '/databases/' + encodeURIComponent(database) + '/documents/bookings/' + encodeURIComponent(id);
 const response = await fetch(url, {headers, signal: AbortSignal.timeout(10000)});
 if (response.status === 404) return null;
 if (!response.ok) throw new Error('Booking storage unavailable');
 const document = await response.json() as { fields?: Record<string, Value> };
 return {...decodeFields(document.fields || {}), id};
}
const guestFields = ['id','tripId','tripTitle','destination','date','tripStartTime','pickupTime','pickupSpot','assignedDriverOrGuide','guestName','guestCountry','guestLang','hotel','roomNumber','adults','children','infants','grossEur','paymentStatus','status'] as const;
export function guestVoucher(booking: Record<string, unknown>): Record<string, unknown> {
 const voucher = Object.fromEntries(guestFields.filter(k => k in booking && ['string','number','boolean'].includes(typeof booking[k])).map(k => [k, booking[k]]));
 const language = String(booking.notes || '').match(/(?:Guide & Email Language|Guide Language)\s*:\s*(English|German|Arabic|French|Italian|Spanish|Dutch|Polish|Russian)\b/i)?.[1];
 if (language) voucher.guestLanguage = language;
 return voucher;
}
