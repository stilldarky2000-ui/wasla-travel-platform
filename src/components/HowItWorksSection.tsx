import React from 'react';
import {
  Camera,
  CalendarCheck,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Lang, Translations } from '../data/i18n';
import { tText } from '../data/marketplaceData';

interface HowItWorksSectionProps {
  lang: Lang;
  t: Translations;
  onOpenCustomTrip: (services?: string[]) => void;
  onOpenPolicies: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  lang,
  t,
  onOpenCustomTrip,
  onOpenPolicies,
}) => {
  const steps = [
    {
      num: '01',
      title: tText(
        {
          en: 'Choose your trip & preferred date',
          ar: 'اختر رحلتك والتاريخ المناسب',
          de: 'Tour & Wunschdatum wählen',
        },
        lang
      ),
      desc: tText(
        {
          en: 'Send your booking request with your hotel name and group size. Zero automatic card charge or deposit required upfront.',
          ar: 'أرسل طلب الحجز باسم فندقك وعدد الأفراد في دقيقة واحدة، بدون أي خصم تلقائي أو بطاقة بنكية مسبقاً.',
          de: 'Senden Sie Ihre unverbindliche Anfrage mit Hotelname und Personenanzahl, ohne sofortige Kartenabbuchung.',
        },
        lang
      ),
    },
    {
      num: '02',
      title: tText(
        {
          en: 'Our Hurghada team confirms live seats',
          ar: 'فريق الغردقة يؤكد الإتاحة وموعد البيك أب',
          de: 'Unser Team vor Ort bestätigt live',
        },
        lang
      ),
      desc: tText(
        {
          en: 'A real coordinator verifies seats with the boat captain, desert host, or Egyptologist and sends your exact pickup minute via WhatsApp & Email.',
          ar: 'يتحقق منسّق بشري من المقاعد مع القبطان أو المرشد أو السائق، ويرسل لك دقيقة الاستلام ومكان الانتظار عبر واتساب والإيميل.',
          de: 'Ein echter Ansprechpartner prüft die Plätze direkt beim Kapitän oder Guide und sendet Ihre genaue Abholzeit per WhatsApp & E-Mail.',
        },
        lang
      ),
    },
    {
      num: '03',
      title: tText(
        {
          en: 'Pay cash on pickup or via official link',
          ar: 'ادفع كاش عند الاستلام أو عبر رابط رسمي',
          de: 'Bar vor Ort oder per Zahlungslink',
        },
        lang
      ),
      desc: tText(
        {
          en: 'Once confirmed, pay cash on pickup on the morning of your trip. If you would rather pay in advance, just ask us and we will send you a payment link. Cancel free up to 24h before.',
          ar: 'بعد التأكيد، ادفع كاش عند الاستلام صباح الرحلة. وإذا كنت تفضل الدفع مقدماً، فقط اطلب منا وسنرسل لك رابط دفع. إلغاء مجاني قبل 24 ساعة.',
          de: 'Nach Bestätigung zahlen Sie bar bei der Abholung. Wenn Sie lieber im Voraus zahlen, fragen Sie uns einfach und wir senden Ihnen einen Zahlungslink. Kostenlos stornierbar bis 24 Std. vorab.',
        },
        lang
      ),
    },
  ];

  const standards = [
    {
      icon: Users,
      title: t.whyItems.family.title,
      desc: t.whyItems.family.desc,
    },
    {
      icon: ShieldCheck,
      title: t.whyItems.women.title,
      desc: t.whyItems.women.desc,
    },
    {
      icon: CalendarCheck,
      title: t.whyItems.cancel.title,
      desc: t.whyItems.cancel.desc,
    },
    {
      icon: CheckCircle2,
      title: tText(
        {
          en: 'Zero forced shopping detours',
          ar: 'بدون توقفات بازارات إجبارية',
          de: 'Keine erzwungenen Verkaufsstopps',
        },
        lang
      ),
      desc: tText(
        {
          en: 'Small groups capped tightly so your day stays focused on reefs, temples, and genuine local places.',
          ar: 'مجموعات صغيرة ومنظمة حتى يستمتع يومك بالبحر والمعابد والتجارب المحلية الحقيقية دون إضاعة وقت.',
          de: 'Kleine Gruppen ohne Zeitverlust in Souvenirfabriken, voller Fokus auf Riffe, Tempel und echte Erlebnisse.',
        },
        lang
      ),
    },
  ];

  return (
    <section id="how-it-works" className="reveal-item scroll-mt-24 space-y-8">
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#EE5426]">
            {tText(
              {
                en: 'Simple, human-verified booking',
                ar: 'حجز بسيط وموثّق بتواصل بشري مباشر',
                de: 'Einfach & persönlich bestätigt',
              },
              lang
            )}
          </p>
          <h2 className="font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight text-[#0F2233]">
            {tText(
              {
                en: 'How booking with Wasla Travel works',
                ar: 'كيف يتم الحجز والدفع مع وصلة ترافيل؟',
                de: 'So funktioniert Ihre Buchung bei Wasla Travel',
              },
              lang
            )}
          </h2>
          <p className="text-[15px] leading-relaxed text-[#64748B]">
            {tText(
              {
                en: 'Availability-first confirmation by our Hurghada team, clear pricing in whole euros, zero upfront guesswork.',
                ar: 'نتأكد أولاً من الإتاحة الفعلية ثم نرسل لك تفاصيل التوصيل، أسعار واضحة باليورو بدون أي مفاجآت.',
                de: 'Zuerst echte Verfügbarkeit prüfen, dann entspannt bestätigen, klare Preise ohne versteckte Kosten.',
              },
              lang
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPolicies}
          className="self-start sm:self-auto text-xs font-semibold text-[#EE5426] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
        >
          {tText(
            {
              en: 'Read payment & 24h cancellation terms →',
              ar: 'اقرأ سياسة الدفع والإلغاء قبل 24 ساعة ←',
              de: 'Zahlungs- & 24h-Stornobedingungen lesen →',
            },
            lang
          )}
        </button>
      </div>

      {/* 3-Step Editorial Process Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step) => (
          <div
            key={step.num}
            className="card-wasla space-y-3 hover:border-[#EE5426]/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-[#EE5426] tabular-nums">
                {step.num}.
              </span>
              <span className="h-px flex-1 bg-[#C8C2B8]/50 dark:bg-[#334155]" aria-hidden="true" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#0F2233] leading-snug">
              {step.title}
            </h3>
            <p className="text-xs sm:text-[13.5px] leading-relaxed text-[#64748B]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Clean 4-Column Standards Row */}
      <div className="card-wasla bg-[#FAF4ED]/80 dark:bg-[#19354F]/50 p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {standards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EE5426]/10 text-[#EE5426]">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs sm:text-[13.5px] font-semibold text-[#0F2233] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#64748B]">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Bespoke Itinerary, Private Guide & Photography Strip */}
      <div className="card-wasla bg-[#FAF4ED] dark:bg-[#19354F]/70 border-[#EE5426]/30 px-5 py-5 sm:px-7 sm:py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#EE5426]">
            <span className="inline-flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.footerAddonEyebrow}</span>
            </span>
            <span aria-hidden="true" className="text-[#C8C2B8]">·</span>
            <span>{t.footerGuideTitle}</span>
            <span aria-hidden="true" className="text-[#C8C2B8]">·</span>
            <span>{t.footerPhotoTitle}</span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-semibold text-[#0F2233] leading-snug">
            {t.footerAddonTitle}
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-[#64748B]">
            {tText(
              {
                en: 'Planning a private family boat, multi-city Nile route, licensed Egyptologist in your language, or coastal photographer? Tell us your dates and we prepare a custom quote.',
                ar: 'تخطط لقارب عائلي خاص، برنامج متعدد المدن، مرشد أثري بلغتك، أو جلسة تصوير على البحر الأحمر؟ أرسل لنا تفاصيلك وسنجهز لك عرض سعر مخصص.',
                de: 'Privates Familienboot, individuelle Nil-Route, lizenzierter Guide in Ihrer Sprache oder Fotoshooting? Teilen Sie uns Ihre Wünsche für ein maßgeschneidertes Angebot mit.',
              },
              lang
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenCustomTrip(['Photography Session', 'Professional Egyptian Guide'])}
            className="btn-wasla-outline min-h-[42px] gap-1.5 rounded-lg bg-white dark:bg-[#0F2233] px-4 py-2 text-xs whitespace-nowrap cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
            <span>{t.footerAddonCta}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCustomTrip(undefined)}
            className="btn-wasla-primary min-h-[42px] gap-1.5 rounded-lg px-5 py-2 text-xs whitespace-nowrap cursor-pointer"
          >
            <span>{t.quickJumpCustom}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
