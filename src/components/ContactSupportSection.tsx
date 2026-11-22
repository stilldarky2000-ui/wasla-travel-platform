import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Lang } from '../data/i18n';
import { tText } from '../data/marketplaceData';
import { normalizeWhatsAppDigits } from '../lib/whatsapp';

interface ContactSupportSectionProps {
  lang: Lang;
  isRtl: boolean;
  whatsappNumber: string;
  contactEmail: string;
}

type TopicId = 'trip' | 'pickup' | 'group' | 'booking';

/**
 * WhatsApp glyph (speech bubble + handset), drawn in the brand's two-tone
 * style: `bubble` is the bubble fill, `phone` the handset fill.
 */
const WhatsAppGlyph: React.FC<{ bubble: string; phone: string; className?: string }> = ({
  bubble,
  phone,
  className,
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
    <path
      d="M12 2C6.48 2 2 6.48 2 12c0 1.89.53 3.65 1.44 5.16L2 22l4.99-1.4A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
      fill={bubble}
    />
    <g transform="translate(4.6 4.6) scale(0.62)">
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill={phone}
      />
    </g>
  </svg>
);

export const ContactSupportSection: React.FC<ContactSupportSectionProps> = ({
  lang,
  isRtl,
  whatsappNumber,
  contactEmail,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null);
  const [copied, setCopied] = useState(false);

  const waDigits = normalizeWhatsAppDigits(whatsappNumber);

  const topicMessages: Record<TopicId, string> = {
    trip:
      lang === 'ar'
        ? 'مرحباً وصلة، عندي سؤال عن رحلة.'
        : lang === 'de'
        ? 'Hallo Wasla, ich habe eine Frage zu einer Tour.'
        : 'Hi Wasla, I have a question about a trip.',
    pickup:
      lang === 'ar'
        ? 'مرحباً وصلة، هل يمكن التوصيل من فندقي؟ فندقي هو: '
        : lang === 'de'
        ? 'Hallo Wasla, können Sie mich an meinem Hotel abholen? Mein Hotel: '
        : 'Hi Wasla, can you pick up from my hotel? My hotel is: ',
    group:
      lang === 'ar'
        ? 'مرحباً وصلة، أريد سعرًا لرحلة جماعية / خاصة.'
        : lang === 'de'
        ? 'Hallo Wasla, ich hätte gern einen Preis für eine Gruppen- / Privattour.'
        : "Hi Wasla, I'd like a price for a group / private trip.",
    booking:
      lang === 'ar'
        ? 'مرحباً وصلة، أحتاج تعديل حجزي. رقم الحجز: '
        : lang === 'de'
        ? 'Hallo Wasla, ich muss meine Buchung ändern. Meine Buchungsnummer: '
        : 'Hi Wasla, I need to change my booking. My booking reference is: ',
  };

  const defaultMessage =
    lang === 'ar'
      ? 'مرحباً وصلة، عندي استفسار.'
      : lang === 'de'
      ? 'Hallo Wasla, ich habe eine Frage.'
      : 'Hi Wasla, I have a question.';

  const whatsappUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    selectedTopic ? topicMessages[selectedTopic] : defaultMessage
  )}`;

  const topics: Array<{ id: TopicId; label: string }> = [
    {
      id: 'trip',
      label: tText({ en: 'Trip details', ar: 'تفاصيل رحلة', de: 'Tour-Details' }, lang),
    },
    {
      id: 'pickup',
      label: tText({ en: 'Hotel pickup', ar: 'توصيل الفندق', de: 'Hotelabholung' }, lang),
    },
    {
      id: 'group',
      label: tText(
        { en: 'Group or private quote', ar: 'عرض سعر لمجموعة أو رحلة خاصة', de: 'Gruppen- oder Privattour-Angebot' },
        lang
      ),
    },
    {
      id: 'booking',
      label: tText({ en: 'Change my booking', ar: 'تعديل حجزي', de: 'Buchung ändern' }, lang),
    },
  ];

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  return (
    <section
      id="contact"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="reveal-item scroll-mt-24"
      aria-labelledby="contact-desk-heading"
    >
      <div className="card-wasla p-0 overflow-hidden">
        <div className="bg-[#FAF4ED]/80 dark:bg-[#0F2233]/60 p-6 sm:p-8">
          <div className="max-w-2xl space-y-5">
            {/* Heading — one line of job: start a conversation */}
            <div className="space-y-2.5">
              <h2
                id="contact-desk-heading"
                className="font-display text-2xl sm:text-[26px] font-semibold tracking-[-0.02em] text-[#0F2233] leading-tight"
              >
                {tText(
                  {
                    en: 'Talk to us before you book',
                    ar: 'تحدث معنا قبل الحجز',
                    de: 'Sprechen Sie vor der Buchung mit uns',
                  },
                  lang
                )}
              </h2>
              <p className="text-sm leading-relaxed text-[#52525B]">
                {tText(
                  {
                    en: 'Ask about child ages, sea conditions, hotel pickup zones, or group pricing. You message the owner directly — the person who runs your trip. No call centre, no bots.',
                    ar: 'اسأل عن مناسبة الرحلة للأطفال، حالة البحر، منطقة توصيل فندقك، أو أسعار المجموعات. بتكلم صاحب الشغل نفسه مباشرة — الشخص اللي هيشغّل رحلتك. من غير كول سنتر ولا ردود آلية.',
                    de: 'Fragen zu Kindern, Seebedingungen, Abholzonen oder Gruppenpreisen? Sie schreiben direkt dem Inhaber — der Person, die Ihre Tour durchführt. Kein Callcenter, keine Bots.',
                  },
                  lang
                )}
              </p>
            </div>

            {/* The one card: WhatsApp with topic chips */}
            <div className="rounded-2xl border border-[#E7DFD2] bg-white p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E4F6EA]">
                  <WhatsAppGlyph bubble="#1FA855" phone="#FFFFFF" className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-[#0F2233]">
                    {tText(
                      { en: 'Message us on WhatsApp', ar: 'راسلنا على واتساب', de: 'Schreiben Sie uns auf WhatsApp' },
                      lang
                    )}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {tText(
                      {
                        en: 'Pick a topic and your message is written for you.',
                        ar: 'اختار الموضوع ورسالتك هتتكتب مكانك.',
                        de: 'Wählen Sie ein Thema — Ihre Nachricht wird für Sie formuliert.',
                      },
                      lang
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium text-[#94A3B8] mb-2">
                  {tText({ en: "What's it about?", ar: 'الموضوع عن إيه؟', de: 'Worum geht es?' }, lang)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => {
                    const active = selectedTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedTopic((prev) => (prev === topic.id ? null : topic.id))}
                        className={`min-h-[38px] rounded-full px-3.5 py-2 text-[13px] font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#1FA855] bg-[#E4F6EA] text-[#0F2233]'
                            : 'border-[#D8D2C4] bg-white text-[#0F2233] hover:border-[#1FA855]'
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wasla-wa-glare w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
              >
                <WhatsAppGlyph bubble="#FFFFFF" phone="#1FA855" className="h-5 w-5" />
                <span>
                  {tText(
                    { en: 'Start WhatsApp Chat', ar: 'ابدأ محادثة واتساب الآن', de: 'WhatsApp-Chat starten' },
                    lang
                  )}
                </span>
              </a>
            </div>

            {/* Email — a quiet row, not a card */}
            <div className="flex items-center gap-2 flex-wrap border-t border-[#C8C2B8]/50 dark:border-[#334155] pt-4">
              <span className="text-[13px] text-[#64748B]">
                {tText({ en: 'Email us:', ar: 'راسلنا بالإيميل:', de: 'E-Mail:' }, lang)}
              </span>
              <a
                href={`mailto:${contactEmail}`}
                className="text-[13px] font-semibold text-[#EE5426] hover:underline underline-offset-4"
              >
                {contactEmail}
              </a>
              <button
                type="button"
                onClick={() => void handleCopyEmail()}
                aria-label="Copy email address"
                className="ms-auto inline-flex h-8 items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2 text-[11px] font-semibold text-[#475569] hover:border-[#EE5426] hover:text-[#EE5426] cursor-pointer shrink-0"
              >
                {copied ? (
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

            {/* One honest trust line */}
            <p className="text-xs leading-relaxed text-[#94A3B8]">
              {tText(
                {
                  en: 'Open daily 08:00–23:00 (Egypt time) · Replies in English, German & Arabic · Owner-run in Hurghada',
                  ar: 'متاحين يوميًا 08:00–23:00 بتوقيت مصر · الرد بالإنجليزية والألمانية والعربية · يديره المالك بنفسه في الغردقة',
                  de: 'Täglich 08:00–23:00 Uhr (Ägypten-Zeit) · Antworten auf Deutsch, Englisch & Arabisch · Inhabergeführt in Hurghada',
                },
                lang
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSupportSection;
