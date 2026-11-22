import React, { useMemo, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Lang } from '../data/i18n';
import { LocalizedText, tText } from '../data/marketplaceData';

type FaqCategoryId = 'all' | 'excursions' | 'payment' | 'cancellation';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategoryId, 'all'>;
  categoryLabel: LocalizedText;
  question: LocalizedText;
  answer: LocalizedText;
}

const FAQ_COPY: Record<
  'eyebrow' | 'title' | 'subtitle' | 'stillHaveTitle' | 'stillHaveSub' | 'askWhatsapp' | 'viewPolicies',
  LocalizedText
> = {
  eyebrow: {
    en: 'Frequently Asked Questions',
    ar: 'الأسئلة الشائعة',
    de: 'Häufig gestellte Fragen',
  },
  title: {
    en: 'Excursions, Pickup, Payment & Cancellation Answers',
    ar: 'إجابات حول رحلات الغردقة، الدفع، التوصيل وسياسة الإلغاء',
    de: 'Antworten zu Ausflügen, Abholung, Zahlung & Stornierung',
  },
  subtitle: {
    en: 'Clear, human-verified answers before you book your Red Sea, Luxor, or Cairo experience.',
    ar: 'كل التفاصيل واضحة وشفافة قبل حجز رحلتك في الغردقة أو الأقصر أو القاهرة.',
    de: 'Klare und verlässliche Informationen vor Ihrer Buchung am Roten Meer, in Luxor oder Kairo.',
  },
  stillHaveTitle: {
    en: 'Need help with a specific hotel or group size?',
    ar: 'لديك استفسار عن فندقك أو رحلة عائلية خاصة؟',
    de: 'Fragen zu Ihrem Hotel oder einer privaten Gruppe?',
  },
  stillHaveSub: {
    en: 'Our Hurghada operations coordinators reply directly in your language—no automated bots.',
    ar: 'فريق العمليات في الغردقة يرد عليك مباشرة بلغتك دون ردود آلية.',
    de: 'Unser Team vor Ort in Hurghada antwortet Ihnen direkt in Ihrer Sprache – ganz ohne Bots.',
  },
  askWhatsapp: {
    en: 'Ask on WhatsApp',
    ar: 'اسألنا عبر واتساب',
    de: 'Per WhatsApp fragen',
  },
  viewPolicies: {
    en: 'Cancellation & Terms',
    ar: 'سياسة الإلغاء والشروط',
    de: 'Stornierung & Bedingungen',
  },
};

const FAQ_TABS: Array<{ id: FaqCategoryId; label: LocalizedText }> = [
  {
    id: 'all',
    label: { en: 'All Questions', ar: 'كل الأسئلة', de: 'Alle Fragen' },
  },
  {
    id: 'excursions',
    label: { en: 'Excursions & Pickup', ar: 'الرحلات والتوصيل', de: 'Ausflüge & Abholung' },
  },
  {
    id: 'payment',
    label: { en: 'Payment & Pricing', ar: 'الدفع والأسعار', de: 'Zahlung & Preise' },
  },
  {
    id: 'cancellation',
    label: { en: 'Cancellation & Weather', ar: 'الإلغاء والطقس', de: 'Stornierung & Wetter' },
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'pickup-confirmation',
    category: 'excursions',
    categoryLabel: { en: 'Excursions & Pickup', ar: 'الرحلات والتوصيل', de: 'Ausflüge & Abholung' },
    question: {
      en: 'How does hotel pickup work in Hurghada and nearby resorts?',
      ar: 'كيف يتم التوصيل والاستلام (Pickup) من فنادق الغردقة والمناطق المجاورة؟',
      de: 'Wie funktioniert die Hotelabholung in Hurghada und den umliegenden Resorts?',
    },
    answer: {
      en: 'Door-to-door pickup inside Hurghada city is included free of charge. After you submit your booking request, our operations desk confirms your exact pickup time and meeting spot (Inside Reception or Outside Main Gate) directly via WhatsApp and Email. For resorts in Sahl Hasheesh, Makadi Bay, El Gouna, Soma Bay, or Safaga, the small outer-zone transfer fee is shown transparently before you confirm.',
      ar: 'التوصيل من وإلى فنادق مدينة الغردقة مشمول مجاناً في سعر الرحلة. فور إرسال طلبك، يؤكد فريق العمليات موعد التحرك الدقيق ومكان الانتظار (داخل الريسبشن أو أمام البوابة الرئيسية) عبر واتساب والإيميل. بالنسبة لمنتجعات سهل حشيش ومكادي والجونة وسوما باي وسفاجا، يتم احتساب رسوم التوصيل الإضافية بوضوح تام قبل تأكيد الحجز.',
      de: 'Die Abholung innerhalb von Hurghada-Stadt ist kostenlos enthalten. Nach Ihrer Buchungsanfrage bestätigt unser Team die genaue Abholzeit und den Treffpunkt (Rezeption oder Haupttor) direkt per WhatsApp und E-Mail. Für Resorts in Sahl Hasheesh, Makadi Bay, El Gouna, Soma Bay oder Safaga wird der geringe Transferzuschlag transparent vorab angezeigt.',
    },
  },
  {
    id: 'payment-timing',
    category: 'payment',
    categoryLabel: { en: 'Payment & Pricing', ar: 'الدفع والأسعار', de: 'Zahlung & Preise' },
    question: {
      en: 'Do I have to pay online immediately when submitting a booking request?',
      ar: 'هل يجب الدفع أونلاين فوراً عند إرسال طلب الحجز؟',
      de: 'Muss ich bei der Buchungsanfrage sofort online bezahlen?',
    },
    answer: {
      en: 'No. Wasla Travel uses an availability-first system—your card is never charged automatically by a bot. Once our team verifies seats with the boat captain, desert camp, or private driver, you choose between paying cash on pickup or via an official payment link sent by our operations desk.',
      ar: 'لا. نعمل بنظام التأكد من الإتاحة أولاً دون أي خصم تلقائي. بعد أن يراجع فريق العمليات طلبك ويؤكد توافر المقاعد مع المركب أو السائق أو المرشد، يمكنك الدفع كاش عند الاستلام أو عبر رابط دفع رسمي يرسله لك فريقنا.',
      de: 'Nein. Wir prüfen zuerst die reale Verfügbarkeit – es gibt keine automatische Sofortabbuchung. Sobald unser Team die Plätze bestätigt hat, zahlen Sie bequem bar bei Abholung oder über einen offiziellen Zahlungslink.',
    },
  },
  {
    id: 'free-cancellation',
    category: 'cancellation',
    categoryLabel: { en: 'Cancellation & Weather', ar: 'الإلغاء والطقس', de: 'Stornierung & Wetter' },
    question: {
      en: 'What is your cancellation and rescheduling policy?',
      ar: 'ما هي سياسة الإلغاء أو تعديل موعد الرحلة؟',
      de: 'Wie lauten die Stornierungs- und Umbuchungsbedingungen?',
    },
    answer: {
      en: 'You can cancel or reschedule free of charge up to 24 hours before your scheduled hotel pickup. Within the final 24 hours, boat seats, permits, and drivers are already confirmed, so cancellations become difficult—though our team is always glad to help adjust your date whenever possible. Simply message us on WhatsApp or email with your reference code (e.g., WT-...).',
      ar: 'يمكنك إلغاء الحجز أو تغيير الموعد مجاناً قبل موعد التحرك بـ 24 ساعة على الأقل. أما خلال آخر 24 ساعة فتكون المراكب والتصاريح والسائقون قد تم تثبيتهم بالفعل مما يجعل الإلغاء صعباً، مع حرص فريقنا دائماً على مساعدتك في تعديل الموعد متى أمكن.',
      de: 'Bis zu 24 Stunden vor der geplanten Hotelabholung können Sie kostenlos stornieren oder umbuchen. Innerhalb der letzten 24 Stunden sind Boote, Genehmigungen und Fahrer bereits fest eingeplant, sodass eine Stornierung schwierig wird – unser Team hilft Ihnen jedoch gern bei einer möglichen Umbuchung.',
    },
  },
  {
    id: 'whole-euro-pricing',
    category: 'payment',
    categoryLabel: { en: 'Payment & Pricing', ar: 'الدفع والأسعار', de: 'Zahlung & Preise' },
    question: {
      en: 'Are there any marine park fees, outer-zone transfers, or extra charges?',
      ar: 'هل توجد رسوم محميات بحرية أو رسوم توصيل للمناطق الخارجية؟',
      de: 'Fallen Naturschutzgebühren oder Transferzuschläge für äußere Gebiete an?',
    },
    answer: {
      en: 'Inside Hurghada city, pickup is included. Outer coastal resorts (El Gouna, Sahl Hasheesh, Makadi Bay, Soma Bay, and Safaga) carry a small transfer fee shown clearly during final booking. Additionally, certain sea and island trips occasionally include a protected marine park entry fee—whenever applicable, we will always let you know clearly in advance before confirmation.',
      ar: 'التوصيل داخل مدينة الغردقة مشمول مجاناً، أما المنتجعات الخارجية (الجونة، سهل حشيش، مكادي باي، سوما باي، سفاجا) فلها رسم ترانسفير بسيط يظهر بوضوح في صفحة الحجز النهائية. كما قد تخضع بعض الرحلات البحرية أحياناً لرسم دخول محمية طبيعية وسننوه لك بذلك بوضوح مسبقاً قبل التأكيد.',
      de: 'Die Abholung in Hurghada-Stadt ist inklusive; für umliegende Gebiete (El Gouna, Sahl Hasheesh, Makadi Bay, Soma Bay, Safaga) fällt ein geringer Transferzuschlag an, der beim Abschluss klar gezeigt wird. Bei einigen Bootsausflügen kann gelegentlich eine Nationalparkgebühr anfallen – darauf weisen wir Sie vorab stets klar hin.',
    },
  },
  {
    id: 'marsa-alam-requirements',
    category: 'excursions',
    categoryLabel: { en: 'Excursions & Pickup', ar: 'الرحلات والتوصيل', de: 'Ausflüge & Abholung' },
    question: {
      en: 'What is needed before confirming Marsa Alam excursions?',
      ar: 'ما هي البيانات المطلوبة قبل تأكيد رحلات مرسى علم؟',
      de: 'Welche Angaben werden vor der Bestätigung für Marsa-Alam-Ausflüge benötigt?',
    },
    answer: {
      en: 'For Marsa Alam trips, we kindly ask for your passport details and hotel room number prior to final confirmation. This helps us smoothly clear coastal travel permits and resort security gates so your seats and pickup are fully guaranteed.',
      ar: 'في رحلات مرسى علم نطلب بلطف بيانات جواز السفر ورقم الغرفة قبل التأكيد النهائي، وذلك لإنهاء تصاريح التحرك وتنسيق بوابة الفندق بسلاسة وضمان الحجز بالكامل.',
      de: 'Für Ausflüge in Marsa Alam bitten wir vor der endgültigen Bestätigung freundlich um Ihre Passdaten und Zimmernummer, damit Küstengenehmigungen und Hotelzugang reibungslos garantiert sind.',
    },
  },
  {
    id: 'children-infants',
    category: 'excursions',
    categoryLabel: { en: 'Excursions & Pickup', ar: 'الرحلات والتوصيل', de: 'Ausflüge & Abholung' },
    question: {
      en: 'Are children and infants (INF) discounted or free on trips?',
      ar: 'هل يوجد خصم للأطفال وما هي تكلفة الرضع (INF)؟',
      de: 'Gibt es Kinderermäßigungen und fahren Kleinkinder (INF) kostenlos mit?',
    },
    answer: {
      en: 'Yes. Infants (INF) travel free of charge (€0) and are still counted on the boat and transfer passenger manifest for safety. Child pricing is automatically calculated at 50% of the adult rate when you select your group size inside the booking form.',
      ar: 'نعم. الرضع (INF) مجاناً (0€) مع تسجيلهم ضمن كشف الباص والمركب لضمان الأمان وتوافر سترة نجاة ومقعد مخصص. ويحصل الأطفال تلقائياً على خصم 50% من سعر البالغ عند تحديد العدد في نموذج الحجز.',
      de: 'Ja. Kleinkinder (INF) reisen kostenlos (0 €), werden aber für die Sicherheits- und Transferliste mitgezählt. Für Kinder wird im Buchungsformular automatisch ein Rabatt von 50 % auf den Erwachsenenpreis berechnet.',
    },
  },
  {
    id: 'weather-cancellation',
    category: 'cancellation',
    categoryLabel: { en: 'Cancellation & Weather', ar: 'الإلغاء والطقس', de: 'Stornierung & Wetter' },
    question: {
      en: 'What happens if Red Sea wind or weather cancels a boat trip?',
      ar: 'ماذا يحدث إذا تم إلغاء رحلة بحرية بسبب سوء الأحوال الجوية أو الرياح؟',
      de: 'Was passiert, wenn ein Bootsausflug wegen Wind oder Wetter ausfällt?',
    },
    answer: {
      en: 'Your safety comes first. If the Hurghada Marina Port Authority restricts sailing due to high winds or sea conditions, we notify you immediately and offer a free transfer to another day, an alternative desert/city excursion, or a 100% refund of any amount paid.',
      ar: 'سلامتك أولاً. إذا أوقفت هيئة الموانئ بالبحر الأحمر الإبحار بسبب سرعة الرياح أو الطقس، نتواصل معك فوراً لنخيرك بين تعديل الموعد مجاناً، تبديل الرحلة لنشاط بديل، أو استرداد 100% من أي مبلغ مدفوع.',
      de: 'Ihre Sicherheit steht an erster Stelle. Sollte die Hafenbehörde in Hurghada Fahrten wetterbedingt absagen, informieren wir Sie umgehend – Sie wählen zwischen kostenloser Umbuchung, einer Alternativtour oder 100 % Rückerstattung.',
    },
  },
];

interface StorefrontFaqProps {
  lang: Lang;
}

export const StorefrontFaq: React.FC<StorefrontFaqProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategoryId>('all');
  const [openId, setOpenId] = useState<string>('pickup-confirmation');

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'all') return FAQ_ITEMS;
    return FAQ_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleSelectCategory = (catId: FaqCategoryId) => {
    setSelectedCategory(catId);
    const nextList = catId === 'all' ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => item.category === catId);
    if (nextList.length > 0 && !nextList.some((item) => item.id === openId)) {
      setOpenId(nextList[0].id);
    }
  };

  return (
    <section id="faq" className="reveal-item scroll-mt-24">
      <div className="card-wasla p-6 sm:p-8 space-y-6">
        {/* Header + Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#C8C2B8]/50 dark:border-[#334155] pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EE5426]">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{tText(FAQ_COPY.eyebrow, lang)}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] text-[#0F2233] leading-tight">
              {tText(FAQ_COPY.title, lang)}
            </h2>
            <p className="text-sm text-[#64748B]">{tText(FAQ_COPY.subtitle, lang)}</p>
          </div>

          <div
            role="tablist"
            aria-label={tText(FAQ_COPY.eyebrow, lang)}
            className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#FAF4ED] border border-[#C8C2B8]/60 p-1 self-start lg:self-auto"
          >
            {FAQ_TABS.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#EE5426] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F2233]'
                  }`}
                >
                  {tText(tab.label, lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean Hairline Accordion List */}
        <div className="divide-y divide-[#C8C2B8]/50 dark:divide-[#334155]">
          {visibleItems.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-btn-${item.id}`;
            return (
              <div key={item.id} className="py-1">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId((prev) => (prev === item.id ? '' : item.id))}
                  className="w-full py-4 flex items-center justify-between gap-4 text-start group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE5426] rounded-lg"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] font-medium text-[#64748B]">
                      {tText(item.categoryLabel, lang)}
                    </div>
                    <div
                      className={`text-sm sm:text-[15.5px] font-semibold leading-snug transition-colors ${
                        isOpen
                          ? 'text-[#EE5426]'
                          : 'text-[#0F2233] group-hover:text-[#EE5426]'
                      }`}
                    >
                      {tText(item.question, lang)}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#EE5426]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="pb-4 pe-8 text-xs sm:text-sm leading-relaxed text-[#64748B] max-w-3xl"
                  >
                    {tText(item.answer, lang)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
