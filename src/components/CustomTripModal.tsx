import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, MessageCircle, X } from 'lucide-react';
import { DestinationRegion, SITE_CONFIG, tText } from '../data/marketplaceData';
import { detectGuestCountry } from '../lib/nationalityDetect';
import { buildBookingWhatsAppUrl } from '../lib/whatsapp';
import { Lang } from '../data/i18n';
import { WaslaBrandMark } from './WaslaBrandMark';

export interface CustomTripSubmission {
  guestName: string;
  guestCountry: string;
  guestWhatsapp: string;
  guestEmail: string;
  guestContact: string;
  destination: DestinationRegion;
  date: string;
  adults: number;
  children: number;
  infants?: number;
  guideLanguage: string;
  services: string[];
  notes: string;
}

interface CustomTripModalProps {
  open: boolean;
  lang?: Lang;
  whatsappNumber?: string;
  initialServices?: string[];
  onClose: () => void;
  onSubmit: (submission: CustomTripSubmission) => string;
}

const SERVICE_OPTIONS: { id: string; label: { en: string; ar: string; de: string } }[] = [
  { id: 'Trips', label: { en: 'Private / Custom Trips', ar: 'رحلات خاصة ومخصصة', de: 'Private Ausflüge' } },
  { id: 'Shared Transfer', label: { en: 'Shared Transfer', ar: 'توصيل مشترك', de: 'Sammeltransfer' } },
  { id: 'Private Transfer', label: { en: 'Private Transfer', ar: 'توصيل خاص', de: 'Privattransfer' } },
  {
    id: 'Professional Egyptian Guide',
    label: { en: 'Licensed Egyptian Guide', ar: 'مرشد سياحي مصري معتمد', de: 'Lizenzierter Guide' },
  },
  {
    id: 'Photography Session',
    label: { en: 'Photography Session', ar: 'جلسة تصوير احترافية', de: 'Fotoshooting' },
  },
  {
    id: 'Airport Meet & Greet',
    label: { en: 'Airport Meet & Greet', ar: 'استقبال ومساعدة في المطار', de: 'Flughafen-Empfang' },
  },
];

const GUIDE_LANGUAGES = [
  { value: 'English', label: { en: 'English', ar: 'الإنجليزية', de: 'Englisch' } },
  { value: 'German', label: { en: 'German', ar: 'الألمانية', de: 'Deutsch' } },
  { value: 'Arabic', label: { en: 'Arabic', ar: 'العربية', de: 'Arabisch' } },
  { value: 'French', label: { en: 'French', ar: 'الفرنسية', de: 'Französisch' } },
  { value: 'Spanish', label: { en: 'Spanish', ar: 'الإسبانية', de: 'Spanisch' } },
  { value: 'Italian', label: { en: 'Italian', ar: 'الإيطالية', de: 'Italienisch' } },
  { value: 'Dutch', label: { en: 'Dutch', ar: 'الهولندية', de: 'Niederländisch' } },
  { value: 'Russian', label: { en: 'Russian', ar: 'الروسية', de: 'Russisch' } },
  { value: 'Polish', label: { en: 'Polish', ar: 'البولندية', de: 'Polnisch' } },
];

export const CustomTripModal: React.FC<CustomTripModalProps> = ({
  open,
  lang = 'en',
  whatsappNumber = SITE_CONFIG.whatsappNumber,
  initialServices,
  onClose,
  onSubmit,
}) => {
  const isRtl = lang === 'ar';
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [guestName, setGuestName] = useState('');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [destination, setDestination] = useState<DestinationRegion>('Hurghada');
  const [date, setDate] = useState(defaultDate);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [guideLanguage, setGuideLanguage] = useState('English');
  const [services, setServices] = useState<string[]>(
    initialServices && initialServices.length > 0
      ? initialServices
      : ['Trips', 'Professional Egyptian Guide']
  );
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [createdRef, setCreatedRef] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState('');
  const autoWaRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setCreatedRef(null);
    setWaUrl('');
    setFormError('');
    setServices(
      initialServices && initialServices.length > 0
        ? initialServices
        : ['Trips', 'Professional Egyptian Guide']
    );
  }, [open, initialServices]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  const toggleService = (svc: string) => {
    setServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = guestName.trim();
    const cleanWa = guestWhatsapp.trim();
    const cleanEmail = guestEmail.trim();
    const validWa = cleanWa.replace(/\D/g, '').length >= 6;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!cleanName || !validWa || !validEmail) {
      setFormError(
        tText(
          {
            en: 'Please enter your name, a valid WhatsApp number, and a valid email address.',
            ar: 'يرجى إدخال اسمك الكامل ورقم واتساب صحيح وبريد إلكتروني صحيح.',
            de: 'Bitte geben Sie Ihren Namen, eine gültige WhatsApp-Nummer und eine gültige E-Mail-Adresse ein.',
          },
          lang
        )
      );
      return;
    }

    setFormError('');
    const autoCountry = detectGuestCountry({
      whatsapp: cleanWa,
      notes,
    });
    const selectedServices = services.length > 0 ? services : ['Customized Trip'];
    const combinedContact = `${cleanWa} · ${cleanEmail}`;
    const refId = onSubmit({
      guestName: cleanName,
      guestCountry: autoCountry,
      guestWhatsapp: cleanWa,
      guestEmail: cleanEmail,
      guestContact: combinedContact,
      destination,
      date,
      adults,
      children,
      infants,
      guideLanguage,
      services: selectedServices,
      notes: notes.trim(),
    });
    const url = buildBookingWhatsAppUrl(
      whatsappNumber,
      {
        id: refId,
        tripTitle: `Custom (${destination}): ${selectedServices.join(', ')} [${guideLanguage} Guide]`,
        date,
        adults,
        children,
        infants,
        totalEur: 0,
        hotel: `${destination} Custom Pickup`,
        guestName: cleanName,
        guestCountry: autoCountry,
        whatsapp: cleanWa,
        email: cleanEmail,
        contact: combinedContact,
        notes: notes.trim(),
      },
      lang
    );
    setWaUrl(url);
    setCreatedRef(refId);
    window.setTimeout(() => {
      autoWaRef.current?.click();
    }, 60);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/65 p-3 sm:p-4 backdrop-blur-[2px]"
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-trip-title"
    >
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 sm:px-6 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <WaslaBrandMark size="sm" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#EA580C]">
                {tText(
                  {
                    en: 'Tailored by Wasla Operations',
                    ar: 'تصميم خاص من فريق وصلة',
                    de: 'Maßgeschneidert von Wasla',
                  },
                  lang
                )}
              </p>
              <h2
                id="custom-trip-title"
                className="font-display text-lg sm:text-xl font-semibold text-[#0F172A] truncate"
              >
                {tText(
                  {
                    en: 'Build a Customized Trip or Guide',
                    ar: 'صمّم رحلتك الخاصة أو احجز مرشداً',
                    de: 'Individuelle Tour oder Guide anfragen',
                  },
                  lang
                )}
              </h2>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          {createdRef ? (
            <div className="space-y-4 py-2 text-center">
              <CheckCircle2 className="h-10 w-10 text-[#16A34A] mx-auto" />
              <div className="space-y-1">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#EA580C]">
                  {createdRef}
                </p>
                <h3 className="font-display text-xl font-semibold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Custom request received — quote coming soon',
                      ar: 'تم استلام طلبك الخاص — سنرسل لك عرض السعر قريباً',
                      de: 'Individuelle Anfrage erhalten — Angebot folgt in Kürze',
                    },
                    lang
                  )}
                </h3>
                <p className="text-sm text-[#475569]">
                  {tText(
                    {
                      en: 'No payment is taken now. Our Operations Desk will prepare a transparent whole-euro quote and confirm pickup via WhatsApp and email.',
                      ar: 'لا يوجد أي دفع الآن. سيقوم فريق العمليات بإعداد عرض سعر شفاف باليورو والتواصل معك عبر واتساب والبريد الإلكتروني للتأكيد.',
                      de: 'Keine Vorauszahlung nötig. Unser Team erstellt ein transparentes Angebot und meldet sich per WhatsApp und E-Mail.',
                    },
                    lang
                  )}
                </p>
              </div>
              <a
                ref={autoWaRef}
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wasla-wa-glare inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>
                  {tText(
                    {
                      en: 'Open Request on WhatsApp',
                      ar: 'افتح تفاصيل الطلب عبر واتساب',
                      de: 'Anfrage auf WhatsApp öffnen',
                    },
                    lang
                  )}
                </span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] w-full rounded-full border border-[#CBD5E1] bg-white px-5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
              >
                {tText({ en: 'Done', ar: 'تم', de: 'Fertig' }, lang)}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-3.5 py-2.5 text-xs text-[#9A3412]">
                {tText(
                  {
                    en: 'Custom Quote · Zero upfront payment. Operations confirms your tailored route & price before you pay (cash on pickup or official payment link).',
                    ar: 'عرض سعر مخصص · بدون أي دفع مسبق. يرسل لك فريق العمليات السعر النهائي والتفاصيل قبل الدفع (كاش عند الاستلام أو عبر رابط دفع رسمي).',
                    de: 'Individuelles Angebot · Keine Vorauszahlung. Sie erhalten erst ein transparentes Angebot (Bar bei Abholung oder offizieller Zahlungslink).',
                  },
                  lang
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {tText({ en: 'Destination', ar: 'الوجهة', de: 'Reiseziel' }, lang)}
                  </span>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as DestinationRegion)}
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A]"
                  >
                    <option value="Hurghada">
                      {tText({ en: 'Hurghada', ar: 'الغردقة', de: 'Hurghada' }, lang)}
                    </option>
                    <option value="Marsa Alam">
                      {tText({ en: 'Marsa Alam', ar: 'مرسى علم', de: 'Marsa Alam' }, lang)}
                    </option>
                    <option value="Luxor">
                      {tText({ en: 'Luxor', ar: 'الأقصر', de: 'Luxor' }, lang)}
                    </option>
                    <option value="Cairo">
                      {tText({ en: 'Cairo', ar: 'القاهرة', de: 'Kairo' }, lang)}
                    </option>
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {tText(
                      { en: 'Preferred guide language', ar: 'لغة المرشد المفضلة', de: 'Gewünschte Guide-Sprache' },
                      lang
                    )}
                  </span>
                  <select
                    value={guideLanguage}
                    onChange={(e) => setGuideLanguage(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A]"
                  >
                    {GUIDE_LANGUAGES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {tText(opt.label, lang)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-[#0F172A]">
                  {tText({ en: 'Services to include', ar: 'الخدمات المطلوبة', de: 'Gewünschte Leistungen' }, lang)}
                </span>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map((svc) => {
                    const active = services.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className={`min-h-[36px] rounded-full px-3.5 text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]'
                            : 'border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        {tText(svc.label, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {tText({ en: 'Start date', ar: 'تاريخ البداية', de: 'Startdatum' }, lang)}
                  </span>
                  <input
                    type="date"
                    min={todayIso}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm tabular-nums"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {tText({ en: 'Adults', ar: 'البالغون', de: 'Erwachsene' }, lang)}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm tabular-nums"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {tText({ en: 'Children', ar: 'الأطفال', de: 'Kinder' }, lang)}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={children}
                    onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm tabular-nums"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {tText({ en: 'Infants (Free)', ar: 'رضّع (مجاناً)', de: 'Babys (Gratis)' }, lang)}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={infants}
                    onChange={(e) => setInfants(Math.max(0, Number(e.target.value)))}
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm tabular-nums"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F172A]">
                  {tText({ en: 'Your full name', ar: 'الاسم الكامل', de: 'Ihr vollständiger Name' }, lang)}
                </span>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={tText({ en: 'Alex Morgan', ar: 'أحمد محمود', de: 'Max Mustermann' }, lang)}
                  className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-sm"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <label className="flex flex-col justify-end gap-1.5 h-full">
                  <span className="text-xs font-semibold text-[#0F172A] leading-snug">
                    {tText({ en: 'WhatsApp number', ar: 'رقم الواتساب', de: 'WhatsApp-Nummer' }, lang)}
                  </span>
                  <input
                    type="tel"
                    required
                    value={guestWhatsapp}
                    onChange={(e) => setGuestWhatsapp(e.target.value)}
                    placeholder="+49 170 5542190"
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-sm tabular-nums"
                  />
                </label>
                <label className="flex flex-col justify-end gap-1.5 h-full">
                  <span className="text-xs font-semibold text-[#0F172A] leading-snug">
                    {tText({ en: 'Email address', ar: 'البريد الإلكتروني', de: 'E-Mail-Adresse' }, lang)}
                  </span>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-sm"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F172A]">
                  {tText(
                    {
                      en: 'Itinerary wishes & pickup hotel',
                      ar: 'تفاصيل البرنامج المطلوب واسم الفندق',
                      de: 'Reisewünsche & Abholhotel',
                    },
                    lang
                  )}
                </span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tText(
                    {
                      en: 'e.g. Private guide in Luxor + sunset beach photography session',
                      ar: 'مثال: مرشد خاص في الأقصر + توصيل من فندق في سهل حشيش',
                      de: 'z. B. Privater Guide in Luxor + Abholung aus Makadi Bay',
                    },
                    lang
                  )}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm"
                />
              </label>

              {formError && (
                <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="wasla-book-glare min-h-[44px] w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
              >
                {tText(
                  {
                    en: 'Request Custom Quote from Operations',
                    ar: 'أرسل طلب عرض السعر لفريق العمليات',
                    de: 'Individuelles Angebot anfordern',
                  },
                  lang
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
