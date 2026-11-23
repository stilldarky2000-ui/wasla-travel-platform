import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Lang } from '../data/i18n';
import { LocalizedText, tText } from '../data/marketplaceData';

interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

const FAQ_COPY: Record<'title' | 'subtitle' | 'closingLine', LocalizedText> = {
  title: {
    en: 'Frequently asked questions',
    ar: 'الأسئلة الشائعة',
    de: 'Häufig gestellte Fragen',
  },
  subtitle: {
    en: 'Pickup, payment, cancellation and weather, the essentials before you book.',
    ar: 'التوصيل والدفع والإلغاء والطقس، الأساسيات قبل الحجز.',
    de: 'Abholung, Zahlung, Stornierung und Wetter, das Wichtigste vor Ihrer Buchung.',
  },
  closingLine: {
    en: 'Still have a question? Message us on WhatsApp',
    ar: 'لسه عندك سؤال؟ كلمنا واتساب',
    de: 'Noch eine Frage? Schreiben Sie uns per WhatsApp',
  },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'pickup-confirmation',
    question: {
      en: 'How does hotel pickup work in Hurghada and nearby resorts?',
      ar: 'كيف يتم التوصيل والاستلام (Pickup) من فنادق الغردقة والمناطق المجاورة؟',
      de: 'Wie funktioniert die Hotelabholung in Hurghada und den umliegenden Resorts?',
    },
    answer: {
      en: 'Pickup inside Hurghada city is free and door-to-door. After you send your booking request, we confirm your exact pickup time and meeting point (reception or main gate) by WhatsApp and email. Resorts in Sahl Hasheesh, Makadi Bay, El Gouna, Soma Bay and Safaga add a small transfer fee, always shown before you confirm.',
      ar: 'التوصيل داخل مدينة الغردقة مجاني ومن الباب للباب. بعد إرسال طلب الحجز، نؤكد لك موعد التحرك الدقيق ونقطة الانتظار (الريسبشن أو البوابة الرئيسية) عبر واتساب والإيميل. منتجعات سهل حشيش ومكادي باي والجونة وسوما باي وسفاجا عليها رسم توصيل بسيط، يظهر لك دائمًا قبل تأكيد الحجز.',
      de: 'Die Abholung in Hurghada-Stadt ist kostenlos, von Tür zu Tür. Nach Ihrer Buchungsanfrage bestätigen wir Abholzeit und Treffpunkt (Rezeption oder Haupttor) per WhatsApp und E-Mail. Für Sahl Hasheesh, Makadi Bay, El Gouna, Soma Bay und Safaga fällt ein kleiner Transferzuschlag an – immer vor der Bestätigung angezeigt.',
    },
  },
  {
    id: 'payment-timing',
    question: {
      en: 'Do I have to pay online immediately when submitting a booking request?',
      ar: 'هل يجب الدفع أونلاين فوراً عند إرسال طلب الحجز؟',
      de: 'Muss ich bei der Buchungsanfrage sofort online bezahlen?',
    },
    answer: {
      en: 'No. We check real availability first, your card is never charged automatically. Once our team confirms your seats, you simply pay cash on pickup.',
      ar: 'لا. نتحقق من الإتاحة الحقيقية أولًا، لا يتم خصم أي مبلغ من بطاقتك تلقائيًا. وبمجرد أن يؤكد فريقنا مقاعدك، تدفع كاش عند الاستلام فقط.',
      de: 'Nein. Wir prüfen zuerst die echte Verfügbarkeit – Ihre Karte wird nie automatisch belastet. Sobald unser Team Ihre Plätze bestätigt hat, zahlen Sie einfach bar bei der Abholung.',
    },
  },
  {
    id: 'whole-euro-pricing',
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
    id: 'free-cancellation',
    question: {
      en: 'What is your cancellation and rescheduling policy?',
      ar: 'ما هي سياسة الإلغاء أو تعديل موعد الرحلة؟',
      de: 'Wie lauten die Stornierungs- und Umbuchungsbedingungen?',
    },
    answer: {
      en: 'Free cancellation or rescheduling up to 24 hours before your pickup time. Inside the last 24 hours, boats, permits and drivers are already booked, but message us on WhatsApp or by email with your booking reference and we will move your date whenever we can.',
      ar: 'يمكنك الإلغاء أو تغيير الموعد مجانًا حتى 24 ساعة قبل موعد التحرك. خلال آخر 24 ساعة تكون المراكب والتصاريح والسائقون قد حُجزوا بالفعل، لكن راسلنا واتساب أو بالإيميل برقم الحجز وسنغيّر موعدك متى أمكن.',
      de: 'Kostenlose Stornierung oder Umbuchung bis 24 Stunden vor der Abholung. Innerhalb der letzten 24 Stunden sind Boote, Genehmigungen und Fahrer bereits gebucht – schreiben Sie uns per WhatsApp oder E-Mail mit Ihrer Buchungsnummer, und wir verschieben Ihren Termin, wann immer möglich.',
    },
  },
  {
    id: 'weather-cancellation',
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
  {
    id: 'children-infants',
    question: {
      en: 'Are children discounted, and do babies travel free?',
      ar: 'هل يوجد خصم للأطفال، وهل الرضّع مجانًا؟',
      de: 'Gibt es Kinderermäßigungen, und reisen Babys kostenlos?',
    },
    answer: {
      en: 'Yes. Babies travel free (€0) and are still counted in the passenger list for safety. Children pay 50% of the adult price, calculated automatically when you choose your group size in the booking form.',
      ar: 'نعم. الرضّع مجانًا (0€) مع تسجيلهم ضمن كشف الركاب لضمان الأمان. ويحصل الأطفال على خصم 50% من سعر البالغ، يُحسب تلقائيًا عند تحديد عدد المجموعة في نموذج الحجز.',
      de: 'Ja. Babys reisen kostenlos (0 €), werden aber für die Sicherheits- und Transferliste mitgezählt. Kinder zahlen 50 % des Erwachsenenpreises – automatisch berechnet, wenn Sie Ihre Gruppengröße im Buchungsformular wählen.',
    },
  },
  {
    id: 'marsa-alam-requirements',
    question: {
      en: 'What do you need from me to confirm a Marsa Alam trip?',
      ar: 'ما الذي تحتاجونه مني لتأكيد رحلة مرسى علم؟',
      de: 'Welche Angaben brauchen Sie von mir, um einen Marsa-Alam-Ausflug zu bestätigen?',
    },
    answer: {
      en: 'For Marsa Alam trips, we kindly ask for your passport details and hotel room number prior to final confirmation. This helps us smoothly clear coastal travel permits and resort security gates so your seats and pickup are fully guaranteed.',
      ar: 'في رحلات مرسى علم نطلب بلطف بيانات جواز السفر ورقم الغرفة قبل التأكيد النهائي، وذلك لإنهاء تصاريح التحرك وتنسيق بوابة الفندق بسلاسة وضمان الحجز بالكامل.',
      de: 'Für Ausflüge in Marsa Alam bitten wir vor der endgültigen Bestätigung freundlich um Ihre Passdaten und Zimmernummer, damit Küstengenehmigungen und Hotelzugang reibungslos garantiert sind.',
    },
  },
];

interface StorefrontFaqProps {
  lang: Lang;
}

export const StorefrontFaq: React.FC<StorefrontFaqProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string>('pickup-confirmation');

  return (
    <section id="faq" className="reveal-item scroll-mt-24">
      <div className="card-wasla p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-[#C8C2B8]/50 dark:border-[#334155] pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] text-[#0F2233] leading-tight">
              {tText(FAQ_COPY.title, lang)}
            </h2>
            <p className="text-sm text-[#64748B]">{tText(FAQ_COPY.subtitle, lang)}</p>
          </div>
        </div>

        {/* Clean Hairline Accordion List */}
        <div className="divide-y divide-[#C8C2B8]/50 dark:divide-[#334155]">
          {FAQ_ITEMS.map((item) => {
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
                  <div className="text-sm sm:text-[15.5px] font-semibold leading-snug text-[#0F2233]">
                    {tText(item.question, lang)}
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
                    className="pb-4 pe-8 text-xs sm:text-sm leading-relaxed text-[#475569] max-w-3xl"
                  >
                    {tText(item.answer, lang)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiet closing line to the single WhatsApp door in the Contact section */}
        <div className="pt-1">
          <a
            href="#contact"
            className="text-sm font-semibold text-[#EE5426] hover:underline"
          >
            {tText(FAQ_COPY.closingLine, lang)} <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </section>
  );
};
