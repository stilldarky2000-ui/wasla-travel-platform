import React, { useState } from 'react';
import { Check, Copy, Mail, MessageCircle } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Narrative & Direct Email Column */}
          <div className="lg:col-span-6 bg-[#FAF4ED]/80 dark:bg-[#0F2233]/60 border-b lg:border-b-0 lg:border-e border-[#C8C2B8]/50 dark:border-[#334155] p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EE5426]">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {tText(
                    {
                      en: 'Direct Local Support',
                      ar: 'تواصل مباشر مع فريقنا في الغردقة',
                      de: 'Direkter persönlicher Kontakt',
                    },
                    lang
                  )}
                </span>
              </div>
              <h2
                id="contact-desk-heading"
                className="font-display text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] leading-tight text-[#0F2233]"
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
              <p className="text-sm leading-relaxed text-[#64748B]">
                {tText(
                  {
                    en: 'Ask about child ages, sea conditions, hotel pickup zones, or group pricing. You message the owner directly, the person who runs your trip. No call centre, no bots.',
                    ar: 'اسأل عن مناسبة الرحلة للأطفال، حالة البحر، منطقة توصيل فندقك، أو أسعار المجموعات. بتكلم صاحب الشغل نفسه مباشرة، الشخص اللي هيشغّل رحلتك. من غير كول سنتر ولا ردود آلية.',
                    de: 'Fragen zu Kindern, Seebedingungen, Abholzonen oder Gruppenpreisen? Sie schreiben direkt dem Inhaber, der Person, die Ihre Tour durchführt. Kein Callcenter, keine Bots.',
                  },
                  lang
                )}
              </p>
            </div>

            <div className="space-y-3 border-t border-[#C8C2B8]/50 dark:border-[#334155] pt-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 text-[#EE5426] shrink-0" aria-hidden="true" />
                  <span className="text-sm text-[#64748B]">
                    {tText({ en: 'Email us:', ar: 'راسلنا بالإيميل:', de: 'E-Mail:' }, lang)}
                  </span>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm font-semibold text-[#EE5426] hover:underline underline-offset-4 truncate"
                  >
                    {contactEmail}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyEmail()}
                  aria-label="Copy email address"
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#C8C2B8]/60 bg-white px-2.5 py-1 text-xs font-semibold text-[#475569] hover:border-[#EE5426] hover:text-[#EE5426] transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#15803D]" aria-hidden="true" />
                      <span>{tText({ en: 'Copied', ar: 'نُسخ', de: 'Kopiert' }, lang)}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{tText({ en: 'Copy', ar: 'نسخ', de: 'Kopieren' }, lang)}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs leading-relaxed text-[#64748B]">
                {tText(
                  {
                    en: 'On hand throughout the day, every day, including follow-up while Cairo and Luxor trips are on the road · The owner replies personally as soon as your message arrives.',
                    ar: 'متابعة مباشرة طوال اليوم، كل يوم، بما فيها متابعة رحلات القاهرة والأقصر أثناء تنفيذها · صاحب العمل يرد عليك بنفسه فور وصول رسالتك.',
                    de: 'Den ganzen Tag über für Sie da, jeden Tag, inklusive Begleitung während der Kairo- und Luxor-Ausflüge unterwegs · Der Inhaber antwortet persönlich, sobald Ihre Nachricht eintrifft.',
                  },
                  lang
                )}
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Topic Selector & CTA Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#15803D]">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-sm sm:text-[15px] font-semibold text-[#0F2233] leading-snug">
                    {tText(
                      { en: 'Message us on WhatsApp', ar: 'راسلنا على واتساب', de: 'Schreiben Sie uns auf WhatsApp' },
                      lang
                    )}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#64748B]">
                    {tText(
                      {
                        en: 'Pick a topic and your message is written for you.',
                        ar: 'اختار الموضوع ورسالتك هتتكتب مكانك.',
                        de: 'Wählen Sie ein Thema, Ihre Nachricht wird für Sie formuliert.',
                      },
                      lang
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#64748B]">
                  {tText({ en: "What's it about?", ar: 'الموضوع عن إيه؟', de: 'Worum geht es?' }, lang)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => {
                    const active = selectedTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedTopic((prev) => (prev === topic.id ? null : topic.id))}
                        className={`min-h-[38px] rounded-lg px-3.5 py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#15803D] bg-[#DCFCE7] text-[#15803D]'
                            : 'border-[#C8C2B8]/60 bg-[#FAF4ED]/60 text-[#0F2233] hover:border-[#15803D] hover:text-[#15803D]'
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="wasla-wa-glare w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
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
        </div>
      </div>
    </section>
  );
};

export default ContactSupportSection;
