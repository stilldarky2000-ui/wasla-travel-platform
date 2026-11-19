import React, { useEffect, useState } from 'react';
import {
  Banknote,
  FileCheck2,
  Mail,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Lang } from '../data/i18n';
import { SITE_CONFIG, tText } from '../data/marketplaceData';
import { formatWhatsAppDisplay, normalizeWhatsAppDigits } from '../lib/whatsapp';
import { WaslaBrandMark } from './WaslaBrandMark';

export type LegalPolicyTab = 'terms' | 'payment' | 'privacy' | 'permits';

interface LegalPoliciesModalProps {
  open: boolean;
  initialTab?: LegalPolicyTab;
  lang: Lang;
  isRtl: boolean;
  whatsappNumber?: string;
  contactEmail?: string;
  onClose: () => void;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  open,
  initialTab = 'terms',
  lang,
  isRtl,
  whatsappNumber = SITE_CONFIG.whatsappNumber,
  contactEmail = SITE_CONFIG.email,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalPolicyTab>(initialTab);

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, initialTab, onClose]);

  if (!open) return null;

  const digits = normalizeWhatsAppDigits(whatsappNumber);
  const waDisplay = formatWhatsAppDisplay(whatsappNumber);

  const tabs: { id: LegalPolicyTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'terms',
      label: tText({ en: 'Terms & Cancellation', ar: 'الشروط والإلغاء', de: 'AGB & Stornierung' }, lang),
      icon: <FileCheck2 className="h-3.5 w-3.5" />,
    },
    {
      id: 'payment',
      label: tText({ en: 'Payment & Transfers', ar: 'الدفع والتوصيل', de: 'Zahlung & Transfer' }, lang),
      icon: <Banknote className="h-3.5 w-3.5" />,
    },
    {
      id: 'privacy',
      label: tText({ en: 'Privacy & GDPR', ar: 'الخصوصية والبيانات', de: 'Datenschutz (DSGVO)' }, lang),
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    {
      id: 'permits',
      label: tText({ en: 'Travel Permits', ar: 'تصاريح الرحلات', de: 'Genehmigungen' }, lang),
      icon: <FileCheck2 className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 p-3 sm:p-4 backdrop-blur-xs"
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-policies-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <WaslaBrandMark size="sm" />
            <div className="min-w-0">
              <h2
                id="legal-policies-title"
                className="font-display text-lg font-semibold text-[#0F172A] truncate"
              >
                {tText(
                  {
                    en: 'Policies, Payment Terms & Privacy (GDPR)',
                    ar: 'السياسات وشروط الدفع وحماية الخصوصية',
                    de: 'Richtlinien, Zahlung & Datenschutz (DSGVO)',
                  },
                  lang
                )}
              </h2>
              <p className="text-xs text-[#64748B]">
                Wasla Travel · Red Sea &amp; Egypt Excursions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 shrink-0">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 min-h-[36px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm text-[#334155] leading-relaxed">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: '1. Availability-First Human Confirmation',
                      ar: '1. نظام التأكيد البشري المباشر قبل أي التزام',
                      de: '1. Menschliche Verfügbarkeitsprüfung vor Bestätigung',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'Submitting a booking request reserves your inquiry and assigns a tracking reference (WT-XXXX). Our local Hurghada Operations Desk verifies live boat, safari, or guide seats with our vetted partner and sends your confirmed hotel pickup time via WhatsApp and email.',
                      ar: 'عند إرسال طلب الحجز تحصل فوراً على رقم متابعة (WT-XXXX). يقوم فريق العمليات المحلي في الغردقة بمراجعة توافر المقاعد على القارب أو السفاري أو المرشد مع شريكنا المعتمد، ثم يرسل لك تأكيد الموعد وتفاصيل الاستلام من الفندق عبر واتساب والبريد الإلكتروني.',
                      de: 'Mit Ihrer Buchungsanfrage erhalten Sie sofort eine Referenznummer (WT-XXXX). Unser Operations-Team vor Ort prüft die Plätze und sendet Ihnen die bestätigte Abholzeit per WhatsApp und E-Mail.',
                    },
                    lang
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: '2. Free 24-Hour Cancellation & Rescheduling',
                      ar: '2. إلغاء وتعديل مجاني حتى 24 ساعة قبل الرحلة',
                      de: '2. Kostenlose Stornierung & Umbuchung bis 24 Std. vorher',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'You may cancel or move your excursion date free of charge up to 24 hours before your scheduled hotel pickup. Just message our Operations Desk with your WT reference ID.',
                      ar: 'يمكنك إلغاء الحجز أو تعديل تاريخ الرحلة مجاناً بالكامل قبل موعد الاستلام من الفندق بـ 24 ساعة على الأقل، عبر إرسال رقم حجزك لفريق العمليات.',
                      de: 'Sie können Ihren Ausflug bis 24 Stunden vor der geplanten Hotelabholung kostenlos stornieren oder umbuchen. Nennen Sie uns dazu einfach Ihre WT-Nummer.',
                    },
                    lang
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: '3. Weather & Red Sea Safety Guarantee',
                      ar: '3. ضمان السلامة وحالة الطقس والبحر',
                      de: '3. Wetter- & Sicherheitsgarantie am Roten Meer',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'If Egyptian Coast Guard or marine authorities restrict sea departures due to high winds, you can reschedule to another day at zero cost or cancel for a 100% refund of any amount paid.',
                      ar: 'إذا قررت السلطات البحرية تعليق الإبحار بسبب سرعة الرياح أو الطقس، يمكنك تأجيل الرحلة ليوم آخر مجاناً أو الإلغاء مع استرداد 100% من أي مبلغ مدفوع.',
                      de: 'Sollte die Küstenwache Bootstouren wetterbedingt untersagen, können Sie kostenlos umbuchen oder erhalten 100 % Erstattung.',
                    },
                    lang
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4 space-y-1.5">
                <h3 className="text-sm font-bold text-[#9A3412]">
                  {tText(
                    {
                      en: 'No Automatic Online Card Charges',
                      ar: 'لا يوجد خصم إلكتروني تلقائي من البطاقة عند الطلب',
                      de: 'Keine automatische Online-Kartenbelastung',
                    },
                    lang
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-[#7C2D12]">
                  {tText(
                    {
                      en: 'Wasla Travel does not charge your card when you submit a booking request. Once our Operations Desk confirms seats and pickup timing, you pay either in cash upon pickup or via an official payment link sent directly to you by our team.',
                      ar: 'لا تقوم وصلة ترافيل بخصم أي مبلغ من بطاقتك عند إرسال طلب الحجز. بعد تأكيد المقاعد وموعد الاستلام مع فريق العمليات، يمكنك الدفع كاش عند الاستلام من الفندق أو عبر رابط دفع رسمي يرسله لك فريقنا مباشرة.',
                      de: 'Wasla Travel belastet Ihre Karte bei der Anfrage nicht. Nach Bestätigung durch unser Team zahlen Sie entweder bar bei Abholung oder über einen offiziellen Zahlungslink unseres Teams.',
                    },
                    lang
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Base Currency (EUR) & Display Estimates',
                      ar: 'العملة الأساسية (اليورو) والعملات التقديرية',
                      de: 'Basiswährung (EUR) & Richtwerte',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'All excursion prices are officially priced in whole Euros (€). USD ($) and Egyptian Pound (EGP) amounts displayed on the website are approximate reference conversions; cash is accepted in EUR, USD, or EGP at the daily local rate.',
                      ar: 'جميع أسعار الرحلات مسعّرة رسمياً باليورو الصحيح (€). الأسعار المعروضة بالدولار ($) أو الجنيه المصري (EGP) هي قيم تقديرية للتسهيل؛ ويمكن الدفع كاش باليورو أو الدولار أو الجنيه حسب سعر الصرف اليومي.',
                      de: 'Alle Preise werden offiziell in ganzen Euro (€) kalkuliert. Angezeigte USD- und EGP-Beträge sind unverbindliche Richtwerte; Barzahlung ist in EUR, USD oder EGP möglich.',
                    },
                    lang
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Hotel Pickup & Outer Resort Zones',
                      ar: 'التوصيل من الفنادق والمنتجعات المحيطة',
                      de: 'Hotelabholung & äußere Resortzonen',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'Pickup inside Hurghada City is included (€0). Outer resorts have transparent per-person round-trip transfer supplements shown upfront before confirmation: El Gouna, Sahl Hasheesh, and Makadi Bay (+€10/person), Soma Bay and Safaga (+€15/person).',
                      ar: 'التوصيل داخل مدينة الغردقة مجاني ومشمول (0€). للمنتجعات الخارجية تُضاف رسوم توصيل ذهاب وعودة واضحة مسبقاً: الجونة وسهل حشيش ومكادي (+10€ للفرد)، سوما باي وسفاجا (+15€ للفرد).',
                      de: 'Die Abholung in Hurghada-Stadt ist inklusive (0 €). Für äußere Resorts gelten transparente Zuschläge pro Person: El Gouna, Sahl Hasheesh & Makadi Bay (+10 €), Soma Bay & Safaga (+15 €).',
                    },
                    lang
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Data Controller & Purpose of Processing',
                      ar: 'الجهة المسؤولة والغرض من جمع البيانات',
                      de: 'Verantwortliche Stelle & Verwendungszweck',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'Wasla Travel collects only the details required to arrange your excursion and hotel pickup: full name, WhatsApp number, email address, hotel name, optional room number, nationality, and participant counts. We never sell or share your personal details with third-party advertisers.',
                      ar: 'تجمع وصلة ترافيل فقط البيانات اللازمة لتنفيذ رحلتك وتوصيل الفندق: الاسم الكامل، رقم الواتساب، البريد الإلكتروني، اسم الفندق، رقم الغرفة (اختياري)، الجنسية، وعدد الأفراد. لا نقوم أبداً ببيع أو مشاركة بياناتك مع أي جهات إعلانية.',
                      de: 'Wasla Travel erhebt ausschließlich die zur Durchführung Ihres Ausflugs erforderlichen Daten: Name, WhatsApp-Nummer, E-Mail, Hotelname, optionale Zimmernummer, Nationalität und Teilnehmerzahl. Keine Weitergabe zu Werbezwecken.',
                    },
                    lang
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Operational Sharing & Security',
                      ar: 'مشاركة البيانات التشغيلية والأمان',
                      de: 'Weitergabe an Leistungsträger & Sicherheit',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'Your hotel name, guest count, and pickup details are shared strictly with the vetted local boat/transport operator assigned to your excursion and with Egyptian tourism police checkpoints when legally required for intercity or marine permits.',
                      ar: 'تُشارك بيانات التوصيل واسم الفندق وعدد الأفراد حصراً مع المشغّل المحلي المعتمد المنفّذ لرحلتك، ومع جهات تصاريح السياحة والبحرية المصرية عند اللزوم القانوني فقط.',
                      de: 'Abholdaten werden ausschließlich an den zuständigen geprüften Partner vor Ort sowie an Behörden weitergegeben, sofern gesetzliche Ausflugsgenehmigungen dies erfordern.',
                    },
                    lang
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Your GDPR Rights (Access, Correction & Deletion)',
                      ar: 'حقوقك في الوصول والتعديل وحذف البيانات',
                      de: 'Ihre DSGVO-Rechte (Auskunft, Berichtigung & Löschung)',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: `Under EU GDPR and applicable data protection laws, you may request access to, correction of, or permanent deletion of your booking data at any time by emailing ${contactEmail} or messaging our Operations Desk.`,
                      ar: `يحق لك في أي وقت طلب الاطلاع على بيانات حجزك أو تصحيحها أو حذفها نهائياً عبر مراسلتنا على البريد الإلكتروني ${contactEmail} أو عبر واتساب فريق العمليات.`,
                      de: `Gemäß DSGVO können Sie jederzeit Auskunft, Berichtigung oder Löschung Ihrer Buchungsdaten per E-Mail an ${contactEmail} oder per WhatsApp verlangen.`,
                    },
                    lang
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'permits' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Luxor, Cairo & Marsa Alam Travel Permits',
                      ar: 'تصاريح رحلات الأقصر والقاهرة ومرسى علم',
                      de: 'Reisegenehmigungen für Luxor, Kairo & Marsa Alam',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'Egyptian tourism checkpoints require advance passenger manifests for intercity trips (Luxor & Cairo) and Marsa Alam excursions. Our Operations Desk will request a clear photo of the passport data page via WhatsApp after your request is received (typically 24 hours prior).',
                      ar: 'تتطلب نقاط التفتيش السياحي كشفاً مسبقاً بأسماء المسافرين لرحلات الأقصر والقاهرة ومرسى علم. سيطلب منك فريق العمليات صورة واضحة لصفحة بيانات جواز السفر عبر واتساب بعد استلام طلبك (عادة قبل 24 ساعة من التحرك).',
                      de: 'Für Überlandtouren (Luxor & Kairo) sowie Marsa-Alam-Ausflüge sind behördliche Passagierlisten erforderlich. Unser Team fragt nach Ihrer Buchung ein Foto der Passdatenseite per WhatsApp an.',
                    },
                    lang
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Hotel Room Numbers & Resort Gates',
                      ar: 'رقم الغرفة وبوابات المنتجعات',
                      de: 'Zimmernummer & Resort-Sicherheitstore',
                    },
                    lang
                  )}
                </h3>
                <p>
                  {tText(
                    {
                      en: 'Providing your hotel room number helps our driver pass resort security gates smoothly and alert reception if needed. In certain resorts, vehicles meet guests right outside the main security gate (clearly stated in your confirmation message).',
                      ar: 'إضافة رقم الغرفة تساعد السائق على المرور من أمن المنتجع بسهولة والتواصل مع الاستقبال عند الحاجة. في بعض المنتجعات يتم الاستلام أمام البوابة الرئيسية (ويتم توضيح ذلك بدقة في رسالة التأكيد).',
                      de: 'Ihre Zimmernummer erleichtert dem Fahrer den Zugang an der Resort-Sicherheitsschranke. Bei einigen Hotels erfolgt die Abholung direkt am Haupttor (wird in der Bestätigung klar angegeben).',
                    },
                    lang
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Contact Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-[#475569]">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-1.5 hover:text-[#EA580C] font-medium"
            >
              <Mail className="h-3.5 w-3.5 text-[#EA580C]" />
              <span>{contactEmail}</span>
            </a>
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#15803D] font-medium tabular-nums"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#16A34A]" />
              <span>{waDisplay}</span>
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] rounded-full border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            {tText({ en: 'Close', ar: 'إغلاق', de: 'Schließen' }, lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
