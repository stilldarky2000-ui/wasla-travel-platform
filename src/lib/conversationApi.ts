/** A static host or stale deployment may return index.html with HTTP 200 for /api. */
export async function readConversationResponse(response: Response, ar = false): Promise<any> {
  const unavailable = ar
    ? 'خدمة رسائل الحجز غير متاحة على هذا العنوان حاليًا. يلزم التحقق من نشر السيرفر وتوجيه /api. يمكنك متابعة العمل من الواجهة الأصلية.'
    : 'Booking messaging is unavailable at this address. Check backend deployment and /api routing. The original workspace remains available.';
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error(unavailable);
  let result: any;
  try { result = await response.json(); } catch { throw new Error(unavailable); }
  if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : unavailable);
  if (!result || typeof result !== 'object') throw new Error(unavailable);
  return result;
}
