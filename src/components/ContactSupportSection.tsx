import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  SlidersHorizontal,
  Ticket,
} from 'lucide-react';
import { Lang } from '../data/i18n';
import { tText } from '../data/marketplaceData';
import { formatWhatsAppDisplay, normalizeWhatsAppDigits } from '../lib/whatsapp';

interface ContactSupportSectionProps {
  lang: Lang;
  isRtl: boolean;
  whatsappNumber: string;
  contactEmail: string;
  onOpenTrackBooking: () => void;
  onOpenCustomTrip: () => void;
}

type InquiryTopicId = 'trip' | 'pickup' | 'group' | 'booking' | 'private';

export const ContactSupportSection: React.FC<ContactSupportSectionProps> = ({
  lang,
  isRtl,
  whatsappNumber,
  contactEmail,
  onOpenTrackBooking,
  onOpenCustomTrip,
}) => {
  const [guestName, setGuestName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [topic, setTopic] = useState<InquiryTopicId>('trip');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedPayload, setSubmittedPayload] = useState<{
    whatsappUrl: string;
    mailtoUrl: string;
    summary: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<'wa' | 'email' | null>(null);

  const waDigits = normalizeWhatsAppDigits(whatsappNumber);
  const waDisplay = formatWhatsAppDisplay(whatsappNumber);
  const directWhatsappUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    lang === 'ar'
      ? 'مرحباً فريق وصلة ترافيل، لدي استفسار عن رحلات الغردقة والأقصر والقاهرة.'
      : lang === 'de'
      ? 'Hallo Wasla Travel Team, ich habe eine Frage zu Ausflügen ab Hurghada / Marsa Alam / Luxor / Kairo.'
      : 'Hello Wasla Travel team, I have a quick question about trips in Egypt.'
  )}`;

  const topicLabels: Record<InquiryTopicId, string> = {
    trip: tText(
      { en: 'Trip details & availability', ar: 'تفاصيل رحلة والإتاحة', de: 'Tour-Details & Verfügbarkeit' },
      lang
    ),
    pickup: tText(
      { en: 'Hotel pickup & transfer zone', ar: 'التوصيل ومنطقة الفندق', de: 'Hotelabholung & Transferzone' },
      lang
    ),
    group: tText(
      { en: 'Family or private group quote', ar: 'عرض سعر عائلي أو لمجموعة خاصة', de: 'Familien- oder Gruppenangebot' },
      lang
    ),
    booking: tText(
      { en: 'Change an existing booking', ar: 'تعديل أو متابعة حجز حالي', de: 'Bestehende Buchung ändern' },
      lang
    ),
    private: tText(
      { en: 'Private guide or photographer', ar: 'مرشد خاص أو جلسة تصوير', de: 'Privater Guide oder Fotograf' },
      lang
    ),
  };

  const handleCopy = async (key: 'wa' | 'email', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = guestName.trim();
    const cleanContact = contactInfo.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanContact || !cleanMessage) {
      setErrorMsg(
        tText(
          {
            en: 'Please enter your name, WhatsApp/email, and your message.',
            ar: 'يرجى كتابة الاسم، رقم واتساب أو البريد الإلكتروني، ورسالتك.',
            de: 'Bitte geben Sie Ihren Namen, WhatsApp/E-Mail und Ihre Nachricht ein.',
          },
          lang
        )
      );
      return;
    }

    setErrorMsg('');
    const selectedTopicLabel = topicLabels[topic];
    const cleanHotel = hotelName.trim();

    const lines = [
      lang === 'ar'
        ? `مرحباً فريق وصلة ترافيل، لدي استفسار جديد من الموقع:`
        : lang === 'de'
        ? `Hallo Wasla Travel Team, neue Anfrage über die Website:`
        : `Hello Wasla Travel team, new inquiry from the website:`,
      `• ${tText({ en: 'Name', ar: 'الاسم', de: 'Name' }, lang)}: ${cleanName}`,
      `• ${tText({ en: 'Contact', ar: 'وسيلة التواصل', de: 'Kontakt' }, lang)}: ${cleanContact}`,
      `• ${tText({ en: 'Topic', ar: 'الموضوع', de: 'Thema' }, lang)}: ${selectedTopicLabel}`,
      cleanHotel
        ? `• ${tText({ en: 'Hotel / Resort', ar: 'الفندق / المنتجع', de: 'Hotel / Resort' }, lang)}: ${cleanHotel}`
        : '',
      `• ${tText({ en: 'Message', ar: 'الرسالة', de: 'Nachricht' }, lang)}: ${cleanMessage}`,
    ].filter(Boolean);

    const joined = lines.join('\n');
    const whatsappUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(joined)}`;
    const subject = `Wasla Travel Inquiry — ${selectedTopicLabel} (${cleanName})`;
    const mailtoUrl = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(joined)}`;

    setSubmittedPayload({
      whatsappUrl,
      mailtoUrl,
      summary: `${cleanName} · ${selectedTopicLabel}`,
    });
  };

  return (
    <section
      id="contact"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="reveal-item scroll-mt-24"
      aria-labelledby="contact-desk-heading"
    >
      <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Direct Hurghada Operations Desk Channels */}
          <div className="lg:col-span-5 bg-[#FFF7ED]/70 border-b lg:border-b-0 lg:border-e border-[#FED7AA]/70 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-[#EA580C]">
                  {tText(
                    {
                      en: 'Direct Human Support',
                      ar: 'التواصل المباشر مع فريقنا في الغردقة',
                      de: 'Direkter persönlicher Kontakt',
                    },
                    lang
                  )}
                </p>
                <h2
                  id="contact-desk-heading"
                  className="font-display text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] text-[#0F172A] leading-tight"
                >
                  {tText(
                    {
                      en: 'Talk to our Hurghada team before or after you book',
                      ar: 'تواصل معنا مباشرة قبل الحجز أو بعده',
                      de: 'Sprechen Sie direkt mit unserem Team in Hurghada',
                    },
                    lang
                  )}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-[#52525B]">
                  {tText(
                    {
                      en: 'Ask about child ages, sea conditions, hotel pickup zones, or group pricing. Real local coordinators answer directly — no bots.',
                      ar: 'اسأل عن مناسبة الرحلة للأطفال، حالة البحر، منطقة توصيل فندقك، أو أسعار المجموعات — يرد عليك منسّق محلي حقيقي بدون ردود آلية.',
                      de: 'Fragen zu Kindern, Wetter, Abholzonen oder Gruppenpreisen? Echte Ansprechpartner vor Ort helfen Ihnen direkt weiter.',
                    },
                    lang
                  )}
                </p>
              </div>

              {/* Direct Channel Cards */}
              <div className="space-y-3">
                {/* WhatsApp Direct Card */}
                <div className="rounded-xl border border-[#FED7AA] bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#15803D]">
                        <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#0F172A]">
                          {tText(
                            { en: 'WhatsApp Operations Desk', ar: 'مكتب عمليات واتساب المباشر', de: 'WhatsApp-Service-Desk' },
                            lang
                          )}
                        </div>
                        <div dir="ltr" className="text-xs font-mono font-semibold text-[#52525B] tabular-nums truncate">
                          {waDisplay}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCopy('wa', waDisplay)}
                      aria-label="Copy WhatsApp number"
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E2E8F0] px-2 text-[11px] font-semibold text-[#475569] hover:border-[#EA580C] hover:text-[#EA580C] cursor-pointer shrink-0"
                    >
                      {copiedKey === 'wa' ? (
                        <>
                          <Check className="h-3 w-3 text-[#15803D]" aria-hidden="true" />
                          <span>{tText({ en: 'Copied', ar: 'نُسخ', de: 'Kopiert' }, lang)}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" aria-hidden="true" />
                          <span>{tText({ en: 'Copy', ar: 'نسخ', de: 'Kopieren' }, lang)}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <a
                    href={directWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wasla-wa-glare w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {tText(
                        { en: 'Start WhatsApp Chat', ar: 'ابدأ محادثة واتساب الآن', de: 'WhatsApp-Chat starten' },
                        lang
                      )}
                    </span>
                  </a>
                </div>

                {/* Email Direct Card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#EA580C]">
                      <Mail className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#0F172A]">
                        {tText({ en: 'Email Reservations', ar: 'البريد الإلكتروني للحجوزات', de: 'E-Mail-Reservierung' }, lang)}
                      </div>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="block text-xs font-medium text-[#EA580C] hover:underline underline-offset-4 truncate"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopy('email', contactEmail)}
                    aria-label="Copy email address"
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E2E8F0] px-2 text-[11px] font-semibold text-[#475569] hover:border-[#EA580C] hover:text-[#EA580C] cursor-pointer shrink-0"
                  >
                    {copiedKey === 'email' ? (
                      <>
                        <Check className="h-3 w-3 text-[#15803D]" aria-hidden="true" />
                        <span>{tText({ en: 'Copied', ar: 'نُسخ', de: 'Kopiert' }, lang)}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" aria-hidden="true" />
                        <span>{tText({ en: 'Copy', ar: 'نسخ', de: 'Kopieren' }, lang)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Clean Desk Metadata */}
              <div className="divide-y divide-[#FED7AA]/60 text-xs text-[#475569]">
                <div className="py-2.5 flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                  <span>
                    {tText(
                      {
                        en: 'Daily 08:00 – 23:00 (Egypt Time) · Avg. reply ~15 min',
                        ar: 'يومياً 08:00 صباحاً – 11:00 مساءً بتوقيت مصر · متوسط الرد 15 دقيقة',
                        de: 'Täglich 08:00 – 23:00 Uhr (Ägypten-Zeit) · Antwortzeit ca. 15 Min.',
                      },
                      lang
                    )}
                  </span>
                </div>
                <div className="py-2.5 flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                  <span>
                    {tText(
                      {
                        en: 'Hurghada · Marsa Alam · Luxor · Cairo',
                        ar: 'مكتب العمليات: الغردقة — نخدم مرسى علم، الأقصر والقاهرة',
                        de: 'Basis: Hurghada · Marsa Alam · Luxor · Kairo',
                      },
                      lang
                    )}
                  </span>
                </div>
                <div className="py-2.5 flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                  <span>
                    {tText(
                      {
                        en: 'Direct replies in English, Arabic, German & European languages',
                        ar: 'دعم مباشر بالعربية، الإنجليزية، الألمانية واللغات الأوروبية',
                        de: 'Direkte Betreuung auf Deutsch, Englisch, Arabisch & weiteren Sprachen',
                      },
                      lang
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Self-Service Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#FED7AA]/60">
              <button
                type="button"
                onClick={onOpenTrackBooking}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors cursor-pointer"
              >
                <Ticket className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
                <span>
                  {tText({ en: 'Track Existing Booking', ar: 'تتبّع حجزك الحالي', de: 'Buchung prüfen' }, lang)}
                </span>
              </button>
              <button
                type="button"
                onClick={onOpenCustomTrip}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
                <span>
                  {tText({ en: 'Plan Custom Trip', ar: 'صمّم رحلة مخصصة', de: 'Individuelle Tour' }, lang)}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Validated Inline Quick Inquiry Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {submittedPayload ? (
              <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {tText(
                        {
                          en: 'Your message is ready to dispatch',
                          ar: 'رسالتك جاهزة للإرسال المباشر لفريق العمليات',
                          de: 'Ihre Nachricht ist versandbereit',
                        },
                        lang
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {tText(
                        {
                          en: 'Choose your preferred channel below so your inquiry opens directly with our Hurghada coordinator — pre-filled with all your details.',
                          ar: 'اختر وسيلة الإرسال المناسبة أدناه لتصل رسالتك كاملة فوراً لمنسّق العمليات في الغردقة.',
                          de: 'Wählen Sie unten Ihren bevorzugten Kanal, damit Ihre Anfrage direkt vorausgefüllt bei unserem Team eingeht.',
                        },
                        lang
                      )}
                    </p>
                    <p className="text-xs font-semibold text-[#15803D] pt-1">
                      {submittedPayload.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href={submittedPayload.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wasla-wa-glare inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {tText(
                        { en: 'Send Now via WhatsApp', ar: 'إرسال الآن عبر واتساب', de: 'Jetzt per WhatsApp senden' },
                        lang
                      )}
                    </span>
                  </a>

                  <a
                    href={submittedPayload.mailtoUrl}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-[#CBD5E1] bg-white px-5 py-2 text-xs font-semibold text-[#0F172A] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors"
                  >
                    <Mail className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
                    <span>
                      {tText(
                        { en: 'Send via Email', ar: 'إرسال عبر الإيميل', de: 'Per E-Mail senden' },
                        lang
                      )}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedPayload(null);
                      setMessage('');
                    }}
                    className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] underline underline-offset-4 px-2 py-2 cursor-pointer"
                  >
                    {tText({ en: 'Write another message', ar: 'كتابة رسالة أخرى', de: 'Weitere Nachricht' }, lang)}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[#0F172A]">
                    {tText(
                      {
                        en: 'Send a quick message to our team',
                        ar: 'أرسل استفسارك مباشرة لفريقنا',
                        de: 'Senden Sie uns eine kurze Nachricht',
                      },
                      lang
                    )}
                  </h3>
                  <p className="text-xs text-[#52525B]">
                    {tText(
                      {
                        en: 'Tell us what you are planning and we will reply with honest local advice and exact pricing.',
                        ar: 'اكتب لنا تفاصيل ما تفكر فيه وسنرد عليك بالنصيحة الصادقة والسعر الواضح.',
                        de: 'Schildern Sie uns kurz Ihren Wunsch — wir antworten mit ehrlicher Empfehlung und klarem Preis.',
                      },
                      lang
                    )}
                  </p>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]"
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#334155]">
                      {tText({ en: 'Full name *', ar: 'الاسم الكامل *', de: 'Vollständiger Name *' }, lang)}
                    </span>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={tText({ en: 'e.g. Sarah Meyer', ar: 'مثال: أحمد محمود', de: 'z. B. Sarah Meyer' }, lang)}
                      className="min-h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#334155]">
                      {tText(
                        { en: 'WhatsApp number or Email *', ar: 'رقم واتساب أو البريد الإلكتروني *', de: 'WhatsApp oder E-Mail *' },
                        lang
                      )}
                    </span>
                    <input
                      type="text"
                      required
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder={tText({ en: '+49... or you@email.com', ar: '+20... أو بريدك الإلكتروني', de: '+49... oder E-Mail' }, lang)}
                      className="min-h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#334155]">
                      {tText({ en: 'Inquiry topic', ar: 'موضوع الاستفسار', de: 'Thema' }, lang)}
                    </span>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as InquiryTopicId)}
                      className="min-h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm text-[#0F172A] cursor-pointer"
                    >
                      {(Object.keys(topicLabels) as InquiryTopicId[]).map((key) => (
                        <option key={key} value={key}>
                          {topicLabels[key]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#334155]">
                      {tText({ en: 'Hotel or resort (optional)', ar: 'اسم الفندق أو المنتجع (اختياري)', de: 'Hotel / Resort (optional)' }, lang)}
                    </span>
                    <input
                      type="text"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      placeholder={tText(
                        { en: 'e.g. Makadi Bay, Sahl Hasheesh...', ar: 'مثال: سهل حشيش، مكادي، الغردقة...', de: 'z. B. Makadi Bay, Sahl Hasheesh...' },
                        lang
                      )}
                      className="min-h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#334155]">
                    {tText({ en: 'How can we help? *', ar: 'كيف يمكننا مساعدتك؟ *', de: 'Wie können wir helfen? *' }, lang)}
                  </span>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={tText(
                      {
                        en: 'Dates, number of adults/children, or any question about pickup or payment...',
                        ar: 'اكتب التواريخ، عدد الكبار والأطفال، أو أي سؤال حول التوصيل أو الدفع...',
                        de: 'Reisedaten, Personenanzahl oder Fragen zu Abholung und Bezahlung...',
                      },
                      lang
                    )}
                    className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-[11.5px] text-[#64748B]">
                    {tText(
                      {
                        en: 'No spam — used strictly to answer your inquiry.',
                        ar: 'بياناتك تُستخدم فقط للرد على استفسارك بدون أي رسائل مزعجة.',
                        de: 'Kein Spam — nur zur direkten Beantwortung Ihrer Anfrage.',
                      },
                      lang
                    )}
                  </p>
                  <button
                    type="submit"
                    className="wasla-book-glare inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold text-white whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {tText(
                        { en: 'Prepare Direct Message', ar: 'إرسال الاستفسار', de: 'Nachricht vorbereiten' },
                        lang
                      )}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
