import React, { useCallback, useEffect, useRef, useState } from 'react';
import { authFetch } from '../../lib/apiAuth';
import type { PlatformBooking } from '../../data/platformData';

interface Message { id: string; text: string; authorName: string; sender: string; createdAt: string; internal?: boolean; emailStatus?: string; }
type Summary = { id: string; lastText?: string; status?: string; assigneeName?: string; updatedAt?: string };
interface Data { voucherPath?: string; booking: Partial<PlatformBooking>; thread: Summary | null; items: Message[]; notes?: Message[]; nextPageToken: string; notesPageToken?: string; }
const labels: Record<string, [string, string]> = { needs_reply: ['محتاج رد الفريق', 'Needs team reply'], waiting_guest: ['في انتظار العميل', 'Waiting for guest'], closed: ['مغلقة', 'Closed'] };
const box = 'min-w-0 rounded-xl border border-[#CBD5E1] bg-white p-3';

export function ConversationPanel({ bookingId, staff = false, ar = false, initialText = '' }: { bookingId: string; staff?: boolean; ar?: boolean; initialText?: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [text, setText] = useState('');
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [language, setLanguage] = useState('auto');
  const [drafting, setDrafting] = useState(false);
  const requestRef = useRef<{ text: string; internal: boolean; messageId: string } | null>(null);
  const generation = useRef(0);
  const olderPagesLoaded = useRef(false);
  const token = new URLSearchParams(window.location.hash.slice(1)).get('conversationToken') || '';
  const base = `/api/${staff ? 'staff' : 'guest'}/conversations/${encodeURIComponent(bookingId)}`;
  const call = useCallback(async (suffix = '', options: RequestInit = {}) => {
    const response = await (staff ? authFetch : fetch)(base + suffix, { ...options, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(staff ? {} : { 'X-Conversation-Token': token }) } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || (ar ? 'تعذر إكمال الطلب. حاول مرة أخرى.' : 'Request failed. Please retry.'));
    return result;
  }, [base, staff, token]);
  const refresh = useCallback(async (older = false) => {
    const version = generation.current;
    const query = older && data ? '?' + new URLSearchParams({ pageToken: data.nextPageToken, notesPageToken: data.notesPageToken || '' }) : '';
    const result: Data = await call(query);
    if (version !== generation.current) return;
    if (older) olderPagesLoaded.current = true;
    setData(previous => {
      const merge = (a: Message[] = [], b: Message[] = []) => [...new Map([...a, ...b].map(m => [m.id, m])).values()];
      return { ...result, nextPageToken: !older && olderPagesLoaded.current ? previous?.nextPageToken || '' : result.nextPageToken, notesPageToken: !older && olderPagesLoaded.current ? previous?.notesPageToken || '' : result.notesPageToken, items: merge(previous?.items, result.items), notes: staff ? merge(previous?.notes, result.notes) : [] };
    });
  }, [call, data, staff]);
  useEffect(() => {
    generation.current++;
    olderPagesLoaded.current = false;
    setData(null); setText(initialText); setError(''); setNotice(''); setInternal(false); requestRef.current = null;
    let active = true;
    const poll = async () => {
      try { const result = await call(); if (active) setData(previous => {
        const merge = (a: Message[] = [], b: Message[] = []) => [...new Map([...a, ...b].map(m => [m.id, m])).values()];
        return { ...result, nextPageToken: olderPagesLoaded.current ? previous?.nextPageToken || '' : result.nextPageToken, notesPageToken: olderPagesLoaded.current ? previous?.notesPageToken || '' : result.notesPageToken, items: merge(previous?.items, result.items), notes: staff ? merge(previous?.notes, result.notes) : [] };
      }); } catch (e) { if (active) setError((e as Error).message); }
    };
    void poll(); const timer = window.setInterval(poll, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [call, staff, initialText]);
  const send = async (event: React.FormEvent) => {
    event.preventDefault(); if (!text.trim() || busy) return;
    const version = generation.current;
    const pending = requestRef.current;
    const request = pending && pending.text === text.trim() && pending.internal === internal ? pending : { text: text.trim(), internal, messageId: crypto.randomUUID() };
    requestRef.current = request; setBusy(true); setError(''); setNotice('');
    try {
      await call('/messages', { method: 'POST', body: JSON.stringify(request) });
      if (version !== generation.current) return;
      setText(''); requestRef.current = null;
      setNotice(internal ? (ar ? 'تم حفظ الملاحظة للفريق فقط.' : 'Internal note saved.') : (ar ? 'تم حفظ الرسالة في المحادثة. تنبيه الإيميل يُعالَج بشكل منفصل.' : 'Message saved to the conversation. Email notification is processed separately.'));
      await refresh();
    } catch (e) { if (version === generation.current) setError((e as Error).message); }
    finally { setBusy(false); }
  };
  const update = async (status: string, claim = false) => {
    setError(''); try { await call('', { method: 'PATCH', body: JSON.stringify({ status, claim }) }); await refresh(); } catch (e) { setError((e as Error).message); }
  };
  const draft = async () => {
    if (!data || internal) return;
    const version = generation.current; const original = text;
    setDrafting(true); setError('');
    try {
      // Internal notes never enter the customer-draft prompt.
      const history = data.items.map(m => ({ sender: m.sender, text: m.text }));
      const response = await authFetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: data.booking.guestName, language: data.booking.guestLang || 'en', ...(language !== 'auto' ? { targetLanguageOverride: language } : {}), bookingRef: bookingId, tripTitle: data.booking.tripTitle, latestMessage: [...history].reverse().find(m => m.sender === 'customer')?.text || '', conversationHistory: history, bookingContext: data.booking, operatorIntent: text }) });
      const result = await response.json(); if (!response.ok || !result.draft) throw new Error(result.error || 'Reply assistant is unavailable. You can still reply manually.');
      if (version !== generation.current) return;
      setText(current => current === original ? result.draft : current);
      setNotice(ar ? 'مسودة مقترحة — راجعها قبل الإرسال. لا يتم إرسالها تلقائيًا.' : 'Suggested draft — review before sending. Nothing was sent automatically.');
    } catch (e) { if (version === generation.current) setError((e as Error).message); } finally { setDrafting(false); }
  };
  const messages = [...(data?.items || []), ...(staff ? data?.notes || [] : [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  return <section className="min-w-0 w-full space-y-3 text-[#0F2233]" dir={ar ? 'rtl' : 'ltr'}>
    <header className={box}><h2 className="font-bold text-lg">{staff ? (ar ? 'محادثة العميل' : 'Guest conversation') : (ar ? 'حجزك والتواصل مع وصلة' : 'Your booking & Wasla support')}</h2><p className="text-sm">{bookingId} · {data?.booking.guestName} · {data?.booking.tripTitle}</p></header>
    {data && <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className={box}>
        {(data.nextPageToken || data.notesPageToken) && <button type="button" className="underline mb-3" onClick={() => void refresh(true).catch(e => setError(e.message))}>{ar ? 'تحميل الرسائل الأقدم' : 'Load older messages'}</button>}
        <div className="max-h-[480px] min-h-[200px] overflow-y-auto space-y-3" aria-live="polite">
          {!messages.length && <p className="text-slate-500 p-4">{ar ? 'ابدأ المحادثة هنا. الرسائل محفوظة مع الحجز.' : 'Start the conversation here. Messages stay with your booking.'}</p>}
          {messages.map(message => <article key={(message.internal ? 'note:' : '') + message.id} className={`rounded-xl border p-3 ${message.internal ? 'bg-amber-50 border-amber-300' : message.sender === 'operator' ? 'bg-[#FAF4ED] border-[#C8C2B8]' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs font-bold break-words">{message.internal ? (ar ? 'ملاحظة داخلية · ' : 'Internal note · ') : ''}{staff || message.sender === 'customer' ? message.authorName : 'Wasla Operations'}</p>
            <p dir="auto" className="whitespace-pre-wrap break-words text-sm my-2">{message.text}</p>
            <time className="text-xs text-slate-500" dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString(ar ? 'ar-EG' : undefined)}</time>
            {staff && !message.internal && <p className="text-xs text-slate-500 mt-1">{ar ? 'تنبيه الإيميل: ' : 'Email alert: '}{message.emailStatus === 'provider_accepted' ? (ar ? 'قبلته خدمة الإرسال' : 'Accepted by provider') : message.emailStatus === 'retry' ? (ar ? 'في انتظار إعادة المحاولة' : 'Retry pending') : message.emailStatus === 'blocked_missing_recipient' ? (ar ? 'عنوان المستلم غير متاح' : 'Recipient unavailable') : (ar ? 'قيد المعالجة' : 'Pending')}</p>}
          </article>)}
        </div>
      </div>
      <aside className={box + ' space-y-3 text-sm'}><strong>{ar ? 'ملخص الحجز' : 'Booking summary'}</strong><p>{data.booking.status}</p><p>{data.booking.date}</p><p>{data.booking.hotel}</p><p>{ar ? 'الاستلام: ' : 'Pickup: '}{data.booking.pickupTime || (ar ? 'لم يحدد بعد' : 'Not assigned yet')}</p><p>{data.booking.paymentStatus} · €{data.booking.grossEur}</p>{data.voucherPath && <a className="block underline text-[#EE5426]" href={data.voucherPath}>{ar ? 'فتح تذكرة الحجز' : 'Open booking voucher'}</a>}
        {staff && <><label className="block">{ar ? 'حالة المحادثة' : 'Conversation status'}<select aria-label="Conversation status" className="block border rounded p-2 w-full" value={data.thread?.status || 'needs_reply'} onChange={e => void update(e.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label[ar ? 0 : 1]}</option>)}</select></label><p className="break-words text-xs">{ar ? 'المسؤول: ' : 'Assigned: '}{data.thread?.assigneeName || '—'}</p><button type="button" className="underline" onClick={() => void update(data.thread?.status || 'needs_reply', true)}>{ar ? 'استلام المحادثة' : 'Assign to me'}</button><button type="button" className="block underline" onClick={async () => { try { const link = await call('/link', { method: 'POST' }); await navigator.clipboard.writeText(window.location.origin + link.path); setNotice(ar ? 'تم نسخ رابط خاص صالح لمدة 30 يومًا. شاركه مع العميل فقط.' : 'Private 30-day link copied. Share only with the guest.'); } catch (e) { setError((e as Error).message); } }}>{ar ? 'نسخ رابط العميل الخاص' : 'Copy private guest link'}</button></>}
      </aside>
    </div>}
    {error && <p role="alert" className="text-red-700 rounded-lg bg-red-50 p-3">{error}</p>}
    {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
    {data && <form onSubmit={send} className={box + (internal ? ' border-amber-400 bg-amber-50' : '')}>
      {staff && <div className="flex flex-wrap gap-3 mb-3"><label><input type="checkbox" checked={internal} disabled={busy || drafting} onChange={e => setInternal(e.target.checked)} /> {ar ? 'ملاحظة داخلية — للفريق فقط' : 'Internal note — team only'}</label>{!internal && <><button type="button" disabled={drafting || busy} onClick={() => void draft()} className="underline disabled:opacity-50">{drafting ? (ar ? 'جارٍ تجهيز المسودة…' : 'Drafting…') : (ar ? 'مساعد الردود' : 'Reply assistant')}</button><select aria-label="Reply language" value={language} onChange={e => setLanguage(e.target.value)} className="border rounded"><option value="auto">{ar ? 'لغة العميل' : 'Guest language'}</option>{['ar','en','de','fr','it','es','nl','pl','ru'].map(code => <option key={code}>{code}</option>)}</select></>}</div>}
      <textarea aria-label={internal ? 'Internal note' : 'Message'} dir="auto" rows={3} maxLength={4000} disabled={busy || drafting} value={text} onChange={e => setText(e.target.value)} placeholder={ar ? 'اكتب رسالتك هنا…' : 'Write your message…'} className="w-full rounded-lg border p-3 bg-white" />
      <button disabled={busy || drafting || !text.trim()} className="mt-2 rounded-lg bg-[#EE5426] text-white font-bold px-5 py-2 disabled:opacity-50">{busy ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : internal ? (ar ? 'حفظ ملاحظة داخلية' : 'Save internal note') : (staff ? (ar ? 'إرسال للعميل' : 'Send to guest') : (ar ? 'إرسال لفريق العمليات' : 'Send to Operations'))}</button>
    </form>}
  </section>;
}

export function OperationsInbox({ bookings, ar = false }: { bookings: PlatformBooking[]; ar?: boolean }) {
  const [selected, setSelected] = useState('');
  const [forwardedDraft, setForwardedDraft] = useState('');
  const sectionRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!bookings.some(b => b.id === detail?.bookingId)) return;
      setSelected(detail.bookingId); setForwardedDraft(String(detail.text || ''));
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('wasla:open-conversation', open);
    return () => window.removeEventListener('wasla:open-conversation', open);
  }, [bookings]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async (page = '') => {
    const response = await authFetch('/api/staff/conversations?' + new URLSearchParams({ pageToken: page }));
    if (!response.ok) throw new Error(ar ? 'تعذر تحديث قائمة المحادثات.' : 'Could not refresh conversations.');
    const result = await response.json();
    setSummaries(previous => [...new Map([...previous, ...result.items].map(item => [item.id, item])).values()]); setNext(result.nextPageToken);
  }, [ar]);
  useEffect(() => { void load().catch(e => setError(e.message)); const timer = window.setInterval(() => { void load().catch(e => setError(e.message)); }, 30000); return () => window.clearInterval(timer); }, [load]);
  const summary = new Map(summaries.map(s => [s.id, s]));
  const visible = bookings.filter(b => `${b.id} ${b.guestName} ${b.tripTitle}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || (summary.get(b.id)?.status || 'new') === filter)).sort((a, b) => String(summary.get(b.id)?.updatedAt || '').localeCompare(String(summary.get(a.id)?.updatedAt || '')));
  return <section ref={sectionRef} className="rounded-2xl border border-[#CBD5E1] bg-[#FAF4ED] p-4 space-y-4" dir={ar ? 'rtl' : 'ltr'}>
    <h2 className="text-xl font-bold text-[#0F2233]">{ar ? 'صندوق محادثات الحجوزات' : 'Booking conversations'}</h2>
    <p className="text-sm text-slate-600">{ar ? 'رسائل الموقع والملاحظات الداخلية. واتساب والإيميل الخارجي لا تتم مزامنتهما هنا تلقائيًا.' : 'Website messages and internal notes. External WhatsApp and email replies are not automatically synced here.'}</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
      <nav aria-label="Conversations" className={box + ' space-y-3'}><input aria-label="Search conversations" className="w-full border p-2 rounded-lg" placeholder={ar ? 'ابحث بالاسم أو رقم الحجز' : 'Search name or booking'} value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filter conversations" value={filter} onChange={e => setFilter(e.target.value)} className="w-full border rounded p-2"><option value="all">{ar ? 'كل الحجوزات' : 'All bookings'}</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label[ar ? 0 : 1]}</option>)}</select><div className="max-h-[600px] overflow-auto space-y-2">{visible.map(booking => <button key={booking.id} type="button" onClick={() => { setSelected(booking.id); setForwardedDraft(''); }} className={`text-start w-full rounded-lg border p-3 ${selected === booking.id ? 'border-[#EE5426] bg-orange-50' : 'border-slate-200'}`}><strong className="block">{booking.guestName}</strong><small className="block">{booking.id} · {booking.date}</small><small className="block truncate">{summary.get(booking.id)?.lastText || booking.tripTitle}</small><small className="text-[#EE5426]">{labels[summary.get(booking.id)?.status || '']?.[ar ? 0 : 1] || (ar ? 'لم تبدأ محادثة' : 'No conversation yet')}</small></button>)}</div>{!visible.length && <p>{ar ? 'لا توجد نتائج.' : 'No results.'}</p>}{next && <button type="button" className="underline" onClick={() => void load(next).catch(e => setError(e.message))}>{ar ? 'تحميل المزيد' : 'Load more'}</button>}</nav>
      {selected ? <ConversationPanel key={selected} bookingId={selected} staff ar={ar} initialText={forwardedDraft} /> : <p className={box}>{ar ? 'اختر حجزًا لعرض المحادثة أو بدء التواصل.' : 'Choose a booking to view or start a conversation.'}</p>}
    </div>
  </section>;
}

export function GuestConversationPage() {
  const bookingId = new URLSearchParams(window.location.search).get('conversation') || '';
  const [ar, setAr] = useState(navigator.language.startsWith('ar'));
  return <main className="min-h-screen bg-[#FAF4ED] p-3 sm:p-8"><div className="max-w-5xl mx-auto"><header className="flex justify-between items-center mb-5"><a href="/" className="font-bold text-2xl text-[#0F2233]">Wasla Travel</a><button type="button" className="underline" onClick={() => setAr(!ar)}>{ar ? 'English' : 'العربية'}</button></header><ConversationPanel bookingId={bookingId} ar={ar} /><p className="text-xs text-slate-500 mt-5">{ar ? 'الرابط خاص بحجزك. لا تشاركه مع الآخرين. تُحدّث المحادثة كل 15 ثانية.' : 'This link is private to your booking. Do not share it. Messages refresh every 15 seconds.'}</p></div></main>;
}
