import React, { useMemo, useRef, useState } from 'react';
import { authFetch } from '../../lib/apiAuth';
import {
  Eye,
  ImagePlus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { I18N } from '../../data/i18n';
import {
  ActivityCategoryId,
  CATEGORY_FALLBACK_IMAGE,
  DestinationRegion,
  LocalizedText,
  Trip,
  TripHistoricalFact,
  TripItineraryStop,
  TripOption,
  resolveBundledMediaUrl,
} from '../../data/marketplaceData';
import { SupplierProfile } from '../../data/platformData';
import { TripDetailModal } from '../TripDetailModal';

interface OptionDraft {
  id: string;
  titleEn: string;
  titleAr: string;
  titleDe: string;
  detailEn: string;
  detailAr?: string;
  detailDe?: string;
  price: number;
}

interface ItineraryStopDraft {
  id: string;
  kind: TripItineraryStop['kind'];
  titleEn: string;
  titleAr: string;
  titleDe: string;
  subtitleEn: string;
  subtitleAr: string;
  subtitleDe: string;
  durationOrTimeEn: string;
  durationOrTimeAr: string;
  durationOrTimeDe: string;
}

interface HistoricalFactDraft {
  id: string;
  eraEn: string;
  eraAr: string;
  eraDe: string;
  metricEn: string;
  metricAr: string;
  metricDe: string;
  titleEn: string;
  titleAr: string;
  titleDe: string;
  factEn: string;
  factAr: string;
  factDe: string;
}

const WEEKDAY_OPTIONS: Array<{ day: number; label: string }> = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
];

const createDefaultItineraryDrafts = (): ItineraryStopDraft[] => [
  {
    id: `stop-${Date.now()}-1`,
    kind: 'pickup',
    titleEn: 'Hotel Reception Pickup',
    titleAr: 'الاستلام من ريسبشن الفندق',
    titleDe: 'Abholung an der Hotelrezeption',
    subtitleEn: 'Air-conditioned private or small-group transfer',
    subtitleAr: 'انتقال مكيف خاص أو ضمن مجموعة صغيرة',
    subtitleDe: 'Klimatisierter Transfer im Kleinbus oder privat',
    durationOrTimeEn: 'Morning pickup',
    durationOrTimeAr: 'استلام صباحي',
    durationOrTimeDe: 'Morgendliche Abholung',
  },
  {
    id: `stop-${Date.now()}-2`,
    kind: 'stop',
    titleEn: 'Main Excursion Highlights & Guided Visit',
    titleAr: 'المحطة الرئيسية للرحلة والجولة الإرشادية',
    titleDe: 'Hauptprogramm & geführte Besichtigung',
    subtitleEn: 'Guided experience with photo stops',
    subtitleAr: 'جولة بإشراف مرشد مع وقفات للتصوير',
    subtitleDe: 'Geführtes Erlebnis mit Fotostopps',
    durationOrTimeEn: '2 hours',
    durationOrTimeAr: 'ساعتان',
    durationOrTimeDe: '2 Stunden',
  },
  {
    id: `stop-${Date.now()}-3`,
    kind: 'end',
    titleEn: 'Return Drop-Off at Your Hotel',
    titleAr: 'العودة والتوصيل إلى الفندق',
    titleDe: 'Rücktransfer zu Ihrem Hotel',
    subtitleEn: 'Direct drop-off at hotel reception',
    subtitleAr: 'توصيل مباشر حتى باب الفندق',
    subtitleDe: 'Direkte Rückfahrt zur Hotelrezeption',
    durationOrTimeEn: '',
    durationOrTimeAr: '',
    durationOrTimeDe: '',
  },
];

interface OwnerTripEditorModalProps {
  initialTrip: Trip | null;
  mode: 'create' | 'edit';
  isSupplierMode?: boolean;
  allTrips: Trip[];
  suppliers: SupplierProfile[];
  onClose: () => void;
  onSaveTrip: (trip: Trip, mode: 'create' | 'edit') => Promise<void> | void;
}

const splitLines = (raw: string): string[] =>
  raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

const mergeLineLocalization = (
  raw: string,
  existing?: LocalizedText[]
): LocalizedText[] => {
  const lines = splitLines(raw);
  return lines.map((line, idx) => {
    const prev = existing?.[idx];
    if (prev && prev.en.trim() === line) return prev;
    return { en: line, ar: line, de: line };
  });
};

export const OwnerTripEditorModal: React.FC<OwnerTripEditorModalProps> = ({
  initialTrip,
  mode,
  isSupplierMode = false,
  allTrips,
  suppliers,
  onClose,
  onSaveTrip,
}) => {
  const [titleEn, setTitleEn] = useState(initialTrip?.name.en || '');
  const [titleAr, setTitleAr] = useState(initialTrip?.name.ar || '');
  const [titleDe, setTitleDe] = useState(initialTrip?.name.de || '');
  const [descEn, setDescEn] = useState(initialTrip?.shortDescription.en || '');
  const [descAr, setDescAr] = useState(initialTrip?.shortDescription.ar || '');
  const [descDe, setDescDe] = useState(initialTrip?.shortDescription.de || '');

  const [fullDescEn, setFullDescEn] = useState(initialTrip?.fullDescription?.en || '');
  const [fullDescAr, setFullDescAr] = useState(initialTrip?.fullDescription?.ar || '');
  const [fullDescDe, setFullDescDe] = useState(initialTrip?.fullDescription?.de || '');

  const [highlightsText, setHighlightsText] = useState(
    (initialTrip?.highlights || []).map((h) => h.en).join('\n')
  );
  const [includedText, setIncludedText] = useState(
    (initialTrip?.included || []).map((h) => h.en).join('\n')
  );
  const [tipsText, setTipsText] = useState(
    (initialTrip?.tips || []).map((h) => h.en).join('\n')
  );
  const [notSuitableText, setNotSuitableText] = useState(
    (initialTrip?.notSuitableFor || []).map((h) => h.en).join('\n')
  );
  const [whatToBringText, setWhatToBringText] = useState(
    (initialTrip?.whatToBring || []).map((h) => h.en).join('\n')
  );
  const [notAllowedText, setNotAllowedText] = useState(
    (initialTrip?.notAllowed || []).map((h) => h.en).join('\n')
  );
  const [knowBeforeText, setKnowBeforeText] = useState(
    (initialTrip?.knowBeforeYouGo || []).map((h) => h.en).join('\n')
  );

  const [localizedLists, setLocalizedLists] = useState<{
    highlights?: LocalizedText[];
    included?: LocalizedText[];
    tips?: LocalizedText[];
    notSuitableFor?: LocalizedText[];
    whatToBring?: LocalizedText[];
    notAllowed?: LocalizedText[];
    knowBeforeYouGo?: LocalizedText[];
  }>({
    highlights: initialTrip?.highlights,
    included: initialTrip?.included,
    tips: initialTrip?.tips,
    notSuitableFor: initialTrip?.notSuitableFor,
    whatToBring: initialTrip?.whatToBring,
    notAllowed: initialTrip?.notAllowed,
    knowBeforeYouGo: initialTrip?.knowBeforeYouGo,
  });

  const [meetingPointEn, setMeetingPointEn] = useState(initialTrip?.meetingPoint?.en || '');

  const [category, setCategory] = useState<ActivityCategoryId>(initialTrip?.category || 'sea');
  const [destination, setDestination] = useState<DestinationRegion>(
    initialTrip?.destination || 'Hurghada'
  );
  const [supplierName, setSupplierName] = useState(
    initialTrip?.supplierName || suppliers[0]?.name || 'Captain Karim Marine'
  );
  const [price, setPrice] = useState<number>(initialTrip?.price || 40);
  const [duration, setDuration] = useState(initialTrip?.duration.en || '4 hours');
  const [durationLoc, setDurationLoc] = useState<LocalizedText | undefined>(initialTrip?.duration);
  const [departureTimesText, setDepartureTimesText] = useState(
    (initialTrip?.departureTimes || []).join(', ')
  );
  const [timingNoteEn, setTimingNoteEn] = useState(initialTrip?.timingNote?.en || '');
  const [timingNoteAr, setTimingNoteAr] = useState(initialTrip?.timingNote?.ar || '');
  const [timingNoteDe, setTimingNoteDe] = useState(initialTrip?.timingNote?.de || '');
  const [pickup, setPickup] = useState(initialTrip?.pickup.en || 'All Hurghada hotels');
  const [pickupLoc, setPickupLoc] = useState<LocalizedText | undefined>(initialTrip?.pickup);
  const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Pending' | 'Paused' | 'Rejected'>(
    initialTrip?.approvalStatus || 'Approved'
  );
  const [featured, setFeatured] = useState<boolean>(Boolean(initialTrip?.featured));
  const [outerTransferEnabled, setOuterTransferEnabled] = useState<boolean>(
    initialTrip?.outerTransferEnabled ?? (initialTrip?.destination || 'Hurghada') === 'Hurghada'
  );
  const [familyFriendly, setFamilyFriendly] = useState<boolean>(
    initialTrip?.familyFriendly ?? true
  );
  const [womenFriendly, setWomenFriendly] = useState<boolean>(
    initialTrip?.womenFriendly ?? true
  );
  const [minChildAge, setMinChildAge] = useState<string>(
    initialTrip?.minChildAge !== undefined ? String(initialTrip.minChildAge) : '4'
  );

  const [images, setImages] = useState<string[]>(initialTrip?.images || []);
  const [galleryCaptionDrafts, setGalleryCaptionDrafts] = useState<
    Array<{ en: string; ar: string; de: string }>
  >(() =>
    (initialTrip?.images || []).map((_, idx) => ({
      en: initialTrip?.galleryCaptions?.[idx]?.en || '',
      ar: initialTrip?.galleryCaptions?.[idx]?.ar || '',
      de: initialTrip?.galleryCaptions?.[idx]?.de || '',
    }))
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadNote, setUploadNote] = useState('');

  const [itineraryDrafts, setItineraryDrafts] = useState<ItineraryStopDraft[]>(() => {
    if (initialTrip?.itinerary && initialTrip.itinerary.length > 0) {
      return initialTrip.itinerary.map((stop, idx) => ({
        id: `stop-${Date.now()}-${idx}`,
        kind: stop.kind,
        titleEn: stop.title.en || '',
        titleAr: stop.title.ar || '',
        titleDe: stop.title.de || '',
        subtitleEn: stop.subtitle?.en || '',
        subtitleAr: stop.subtitle?.ar || '',
        subtitleDe: stop.subtitle?.de || '',
        durationOrTimeEn: stop.durationOrTime?.en || '',
        durationOrTimeAr: stop.durationOrTime?.ar || '',
        durationOrTimeDe: stop.durationOrTime?.de || '',
      }));
    }
    return mode === 'create' ? createDefaultItineraryDrafts() : [];
  });

  const [historicalFactDrafts, setHistoricalFactDrafts] = useState<HistoricalFactDraft[]>(() => {
    if (initialTrip?.historicalFacts && initialTrip.historicalFacts.length > 0) {
      return initialTrip.historicalFacts.map((fact, idx) => ({
        id: `fact-${Date.now()}-${idx}`,
        eraEn: fact.era?.en || '',
        eraAr: fact.era?.ar || '',
        eraDe: fact.era?.de || '',
        metricEn: fact.metric?.en || '',
        metricAr: fact.metric?.ar || '',
        metricDe: fact.metric?.de || '',
        titleEn: fact.title.en || '',
        titleAr: fact.title.ar || '',
        titleDe: fact.title.de || '',
        factEn: fact.fact.en || '',
        factAr: fact.fact.ar || '',
        factDe: fact.fact.de || '',
      }));
    }
    return [];
  });

  const [operatingDays, setOperatingDays] = useState<number[]>(
    initialTrip?.operatingDays && initialTrip.operatingDays.length > 0
      ? initialTrip.operatingDays
      : [0, 1, 2, 3, 4, 5, 6]
  );
  const [availableFrom, setAvailableFrom] = useState(initialTrip?.availableFrom || '');
  const [availableTo, setAvailableTo] = useState(initialTrip?.availableTo || '');

  const [optionDrafts, setOptionDrafts] = useState<OptionDraft[]>(() => {
    if (initialTrip?.options && initialTrip.options.length > 0) {
      return initialTrip.options.map((opt) => ({
        id: opt.id,
        titleEn: opt.title.en,
        titleAr: opt.title.ar,
        titleDe: opt.title.de,
        detailEn: opt.detail?.en || '',
        detailAr: opt.detail?.ar || '',
        detailDe: opt.detail?.de || '',
        price: opt.price,
      }));
    }
    return [
      {
        id: `opt-${Date.now()}`,
        titleEn: 'Standard Small-Group Ticket',
        titleAr: 'تذكرة المجموعة الصغيرة القياسية',
        titleDe: 'Standard-Kleingruppenticket',
        detailEn: 'Direct hotel pickup & licensed guide',
        detailAr: 'توصيل مباشر من الفندق ومرشد مرخص',
        detailDe: 'Direkte Hotelabholung & lizenzierter Guide',
        price: initialTrip?.price || 40,
      },
    ];
  });

  const [translating, setTranslating] = useState(false);
  const [translateNotice, setTranslateNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [previewTrip, setPreviewTrip] = useState<Trip | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const starterGallery = useMemo(() => {
    const unique = Array.from(
      new Set(
        allTrips
          .flatMap((t) => (t.images || []).map((img) => resolveBundledMediaUrl(img, t.category)))
          .filter(Boolean)
      )
    );
    return unique.slice(0, 6);
  }, [allTrips]);

  const compressImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Invalid image'));
        img.onload = () => {
          const tryEncode = (maxW: number, q: number): string => {
            const scale = img.width > maxW ? maxW / img.width : 1;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) return '';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', q);
          };
          let encoded = '';
          for (const [w, q] of [
            [800, 0.7],
            [680, 0.56],
            [520, 0.45],
          ] as Array<[number, number]>) {
            encoded = tryEncode(w, q);
            if (encoded && encoded.length <= 220000) break;
          }
          resolve(encoded);
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadNote('Compressing photo...');
    try {
      const processed: string[] = [];
      for (const file of files.slice(0, 5)) {
        if (!file.type.startsWith('image/')) continue;
        const url = await compressImageFile(file);
        if (url && url.length <= 240000) processed.push(url);
      }
      const nextAdded = processed.slice(0, Math.max(0, 8 - images.length));
      setImages((prev) => [...prev, ...nextAdded].slice(0, 8));
      setGalleryCaptionDrafts((prev) => [
        ...prev,
        ...nextAdded.map(() => ({ en: '', ar: '', de: '' })),
      ].slice(0, 8));
      setUploadNote(
        processed.length > 0 ? `Added ${processed.length} optimized image(s).` : 'Select JPG/PNG/WebP images.'
      );
    } catch {
      setUploadNote('Could not process selected photo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setUploadNote('Please enter a valid https:// URL.');
      return;
    }
    if (!images.includes(url) && images.length < 8) {
      setImages((prev) => [...prev, url].slice(0, 8));
      setGalleryCaptionDrafts((prev) => [...prev, { en: '', ar: '', de: '' }].slice(0, 8));
    }
    setImageUrlInput('');
    setUploadNote('');
  };

  const handleAutoTranslate = async () => {
    const sourceTitle = titleEn.trim() || titleAr.trim() || titleDe.trim();
    const sourceDesc = descEn.trim() || descAr.trim() || descDe.trim();
    if (!sourceTitle || !sourceDesc || translating) {
      if (!sourceTitle || !sourceDesc) {
        setTranslateNotice({
          type: 'err',
          text: 'Enter a trip title and short description before running Auto-Translate.',
        });
      }
      return;
    }
    setTranslating(true);
    setTranslateNotice(null);
    try {
      const activeOpts = optionDrafts.filter(
        (o) => o.titleEn.trim() || o.titleAr.trim() || o.titleDe.trim()
      );
      const activeStops = itineraryDrafts.filter(
        (s) => s.titleEn.trim() || s.titleAr.trim() || s.titleDe.trim()
      );
      const activeFacts = historicalFactDrafts.filter(
        (f) => f.titleEn.trim() || f.titleAr.trim() || f.factEn.trim() || f.factAr.trim()
      );
      const activeCaptions = images
        .map((_, idx) => galleryCaptionDrafts[idx])
        .map((c) => c?.en.trim() || c?.ar.trim() || c?.de.trim() || '')
        .filter(Boolean);

      const hlLines = splitLines(highlightsText);
      const incLines = splitLines(includedText);
      const tipsLines = splitLines(tipsText);
      const notSuitLines = splitLines(notSuitableText);
      const bringLines = splitLines(whatToBringText);
      const notAllowLines = splitLines(notAllowedText);
      const knowLines = splitLines(knowBeforeText);

      const res = await authFetch('/api/trips/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sourceTitle,
          duration: duration.trim() || '4 hours',
          pickup: pickup.trim() || 'All Hurghada hotels',
          shortDescription: sourceDesc,
          fullDescription: fullDescEn.trim() || fullDescAr.trim() || fullDescDe.trim() || undefined,
          itinerary:
            activeStops.length > 0
              ? activeStops.map((s) => ({
                  title: s.titleEn.trim() || s.titleAr.trim() || s.titleDe.trim(),
                  subtitle: s.subtitleEn.trim() || s.subtitleAr.trim() || s.subtitleDe.trim() || '',
                  durationOrTime:
                    s.durationOrTimeEn.trim() || s.durationOrTimeAr.trim() || s.durationOrTimeDe.trim() || '',
                }))
              : undefined,
          historicalFacts:
            activeFacts.length > 0
              ? activeFacts.map((f) => ({
                  era: f.eraEn.trim() || f.eraAr.trim() || f.eraDe.trim() || '',
                  metric: f.metricEn.trim() || f.metricAr.trim() || f.metricDe.trim() || '',
                  title: f.titleEn.trim() || f.titleAr.trim() || f.titleDe.trim(),
                  fact: f.factEn.trim() || f.factAr.trim() || f.factDe.trim(),
                }))
              : undefined,
          galleryCaptions: activeCaptions.length > 0 ? activeCaptions : undefined,
          highlights: hlLines.length > 0 ? hlLines : [`Operated by ${supplierName}`],
          included: incLines.length > 0 ? incLines : ['Hotel pickup & vetted local guide'],
          tips: tipsLines.length > 0 ? tipsLines : undefined,
          notSuitableFor: notSuitLines.length > 0 ? notSuitLines : undefined,
          whatToBring: bringLines.length > 0 ? bringLines : undefined,
          notAllowed: notAllowLines.length > 0 ? notAllowLines : undefined,
          knowBeforeYouGo: knowLines.length > 0 ? knowLines : undefined,
          options: activeOpts.map((o) => ({
            title: o.titleEn.trim() || o.titleAr.trim() || o.titleDe.trim(),
            detail: o.detailEn.trim() || 'Standard package inclusions',
          })),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTranslateNotice({
          type: 'err',
          text: (payload as { error?: string })?.error || 'Auto-translation failed. Check server configuration.',
        });
        return;
      }

      const data = payload as {
        name?: LocalizedText;
        duration?: LocalizedText;
        pickup?: LocalizedText;
        shortDescription?: LocalizedText;
        fullDescription?: LocalizedText;
        itinerary?: Array<{ title: LocalizedText; subtitle?: LocalizedText; durationOrTime?: LocalizedText }>;
        historicalFacts?: Array<{ era?: LocalizedText; metric?: LocalizedText; title: LocalizedText; fact: LocalizedText }>;
        galleryCaptions?: LocalizedText[];
        highlights?: LocalizedText[];
        included?: LocalizedText[];
        tips?: LocalizedText[];
        notSuitableFor?: LocalizedText[];
        whatToBring?: LocalizedText[];
        notAllowed?: LocalizedText[];
        knowBeforeYouGo?: LocalizedText[];
        options?: Array<{ title: LocalizedText; detail?: LocalizedText }>;
      };

      if (data.name) {
        setTitleEn(data.name.en);
        setTitleAr(data.name.ar);
        setTitleDe(data.name.de);
      }
      if (data.duration) {
        setDuration(data.duration.en);
        setDurationLoc(data.duration);
      }
      if (data.pickup) {
        setPickup(data.pickup.en);
        setPickupLoc(data.pickup);
      }
      if (data.shortDescription) {
        setDescEn(data.shortDescription.en);
        setDescAr(data.shortDescription.ar);
        setDescDe(data.shortDescription.de);
      }
      if (data.fullDescription && (fullDescEn.trim() || fullDescAr.trim() || fullDescDe.trim())) {
        setFullDescEn(data.fullDescription.en);
        setFullDescAr(data.fullDescription.ar);
        setFullDescDe(data.fullDescription.de);
      }

      if (data.itinerary && data.itinerary.length > 0) {
        const translatedStopsById = new Map(
          activeStops.map((stop, idx) => [stop.id, data.itinerary?.[idx]])
        );
        setItineraryDrafts((prev) =>
          prev.map((stop) => {
            const tr = translatedStopsById.get(stop.id);
            return tr
              ? {
                  ...stop,
                  titleEn: tr.title.en,
                  titleAr: tr.title.ar,
                  titleDe: tr.title.de,
                  subtitleEn: stop.subtitleEn.trim() || stop.subtitleAr.trim() ? tr.subtitle?.en || stop.subtitleEn : '',
                  subtitleAr: stop.subtitleEn.trim() || stop.subtitleAr.trim() ? tr.subtitle?.ar || stop.subtitleAr : '',
                  subtitleDe: stop.subtitleEn.trim() || stop.subtitleAr.trim() ? tr.subtitle?.de || stop.subtitleDe : '',
                  durationOrTimeEn:
                    stop.durationOrTimeEn.trim() || stop.durationOrTimeAr.trim()
                      ? tr.durationOrTime?.en || stop.durationOrTimeEn
                      : '',
                  durationOrTimeAr:
                    stop.durationOrTimeEn.trim() || stop.durationOrTimeAr.trim()
                      ? tr.durationOrTime?.ar || stop.durationOrTimeAr
                      : '',
                  durationOrTimeDe:
                    stop.durationOrTimeEn.trim() || stop.durationOrTimeAr.trim()
                      ? tr.durationOrTime?.de || stop.durationOrTimeDe
                      : '',
                }
              : stop;
          })
        );
      }

      if (data.historicalFacts && data.historicalFacts.length > 0) {
        const translatedFactsById = new Map(
          activeFacts.map((fact, idx) => [fact.id, data.historicalFacts?.[idx]])
        );
        setHistoricalFactDrafts((prev) =>
          prev.map((fact) => {
            const tr = translatedFactsById.get(fact.id);
            return tr
              ? {
                  ...fact,
                  eraEn: fact.eraEn.trim() || fact.eraAr.trim() ? tr.era?.en || fact.eraEn : '',
                  eraAr: fact.eraEn.trim() || fact.eraAr.trim() ? tr.era?.ar || fact.eraAr : '',
                  eraDe: fact.eraEn.trim() || fact.eraAr.trim() ? tr.era?.de || fact.eraDe : '',
                  metricEn: fact.metricEn.trim() || fact.metricAr.trim() ? tr.metric?.en || fact.metricEn : '',
                  metricAr: fact.metricEn.trim() || fact.metricAr.trim() ? tr.metric?.ar || fact.metricAr : '',
                  metricDe: fact.metricEn.trim() || fact.metricAr.trim() ? tr.metric?.de || fact.metricDe : '',
                  titleEn: tr.title.en,
                  titleAr: tr.title.ar,
                  titleDe: tr.title.de,
                  factEn: tr.fact.en,
                  factAr: tr.fact.ar,
                  factDe: tr.fact.de,
                }
              : fact;
          })
        );
      }

      if (data.galleryCaptions && data.galleryCaptions.length > 0) {
        let capPointer = 0;
        setGalleryCaptionDrafts((prev) =>
          images.map((_, idx) => {
            const cur = prev[idx] || { en: '', ar: '', de: '' };
            const hasText = Boolean(cur.en.trim() || cur.ar.trim() || cur.de.trim());
            if (!hasText) return cur;
            const trCap = data.galleryCaptions?.[capPointer++];
            return trCap ? { en: trCap.en, ar: trCap.ar, de: trCap.de } : cur;
          })
        );
      }

      if (data.highlights?.length) {
        setHighlightsText(data.highlights.map((x) => x.en).join('\n'));
      }
      if (data.included?.length) {
        setIncludedText(data.included.map((x) => x.en).join('\n'));
      }
      if (tipsLines.length > 0 && data.tips?.length) {
        setTipsText(data.tips.map((x) => x.en).join('\n'));
      }
      if (notSuitLines.length > 0 && data.notSuitableFor?.length) {
        setNotSuitableText(data.notSuitableFor.map((x) => x.en).join('\n'));
      }
      if (bringLines.length > 0 && data.whatToBring?.length) {
        setWhatToBringText(data.whatToBring.map((x) => x.en).join('\n'));
      }
      if (notAllowLines.length > 0 && data.notAllowed?.length) {
        setNotAllowedText(data.notAllowed.map((x) => x.en).join('\n'));
      }
      if (knowLines.length > 0 && data.knowBeforeYouGo?.length) {
        setKnowBeforeText(data.knowBeforeYouGo.map((x) => x.en).join('\n'));
      }

      setLocalizedLists((prev) => ({
        ...prev,
        highlights: data.highlights?.length ? data.highlights : prev.highlights,
        included: data.included?.length ? data.included : prev.included,
        tips: tipsLines.length > 0 && data.tips?.length ? data.tips : prev.tips,
        notSuitableFor:
          notSuitLines.length > 0 && data.notSuitableFor?.length ? data.notSuitableFor : prev.notSuitableFor,
        whatToBring:
          bringLines.length > 0 && data.whatToBring?.length ? data.whatToBring : prev.whatToBring,
        notAllowed:
          notAllowLines.length > 0 && data.notAllowed?.length ? data.notAllowed : prev.notAllowed,
        knowBeforeYouGo:
          knowLines.length > 0 && data.knowBeforeYouGo?.length ? data.knowBeforeYouGo : prev.knowBeforeYouGo,
      }));

      if (data.options && data.options.length > 0) {
        const translatedByOptId = new Map(
          activeOpts.map((opt, idx) => [opt.id, data.options?.[idx]])
        );
        setOptionDrafts((prev) =>
          prev.map((opt) => {
            const tr = translatedByOptId.get(opt.id);
            return tr
              ? {
                  ...opt,
                  titleEn: tr.title.en,
                  titleAr: tr.title.ar,
                  titleDe: tr.title.de,
                  detailEn: opt.detailEn.trim() ? tr.detail?.en || opt.detailEn : '',
                  detailAr: opt.detailEn.trim() ? tr.detail?.ar || opt.detailAr : '',
                  detailDe: opt.detailEn.trim() ? tr.detail?.de || opt.detailDe : '',
                }
              : opt;
          })
        );
      }
      setTranslateNotice({
        type: 'ok',
        text: 'Translated title, descriptions, itinerary, historical facts, gallery captions, bullets, and options into EN / AR / DE.',
      });
    } catch {
      setTranslateNotice({
        type: 'err',
        text: 'Network error while reaching auto-translation service.',
      });
    } finally {
      setTranslating(false);
    }
  };

  const buildTripPayload = (): Trip => {
    const fallbackTitle = titleEn.trim() || titleAr.trim() || titleDe.trim() || 'Untitled Trip';
    const fallbackDesc =
      descEn.trim() || descAr.trim() || descDe.trim() || 'Curated Wasla Travel experience.';
    const safeBasePrice = Math.max(5, Math.round(Number.isFinite(price) && price > 0 ? price : 40));
    const activeOpts = optionDrafts.filter((o) => o.titleEn.trim() || o.titleAr.trim() || o.titleDe.trim());
    const cleanOptions: TripOption[] = activeOpts.map((o, idx) => {
      const baseOptTitle = o.titleEn.trim() || o.titleAr.trim() || o.titleDe.trim() || `Option ${idx + 1}`;
      const rawOptPrice = Number(o.price);
      const detailEnVal = o.detailEn.trim();
      return {
        id: o.id || `opt-${Date.now()}-${idx}`,
        title: {
          en: o.titleEn.trim() || baseOptTitle,
          ar: o.titleAr.trim() || baseOptTitle,
          de: o.titleDe.trim() || baseOptTitle,
        },
        detail: detailEnVal
          ? {
              en: detailEnVal,
              ar: o.detailAr?.trim() || detailEnVal,
              de: o.detailDe?.trim() || detailEnVal,
            }
          : undefined,
        price: Math.max(5, Math.round(Number.isFinite(rawOptPrice) && rawOptPrice > 0 ? rawOptPrice : safeBasePrice)),
      };
    });

    const lowestPrice =
      cleanOptions.length > 0
        ? Math.min(...cleanOptions.map((o) => o.price))
        : safeBasePrice;

    const fallbackImg =
      allTrips.find((t) => t.category === category)?.images?.[0] ||
      CATEGORY_FALLBACK_IMAGE[category] ||
      allTrips[0]?.images?.[0] ||
      '';
    const cleanedDraftImages = images
      .map((img) => resolveBundledMediaUrl(img, category))
      .filter(Boolean);
    const finalImages =
      cleanedDraftImages.length > 0
        ? cleanedDraftImages
        : fallbackImg
        ? [resolveBundledMediaUrl(fallbackImg, category)]
        : [CATEGORY_FALLBACK_IMAGE[category]];

    const finalHighlights = mergeLineLocalization(highlightsText, localizedLists.highlights);
    const finalIncluded = mergeLineLocalization(includedText, localizedLists.included);
    const finalTips = mergeLineLocalization(tipsText, localizedLists.tips);
    const finalNotSuitable = mergeLineLocalization(notSuitableText, localizedLists.notSuitableFor);
    const finalWhatToBring = mergeLineLocalization(whatToBringText, localizedLists.whatToBring);
    const finalNotAllowed = mergeLineLocalization(notAllowedText, localizedLists.notAllowed);
    const finalKnowBefore = mergeLineLocalization(knowBeforeText, localizedLists.knowBeforeYouGo);

    const cleanItinerary: TripItineraryStop[] = itineraryDrafts
      .filter((s) => s.titleEn.trim() || s.titleAr.trim() || s.titleDe.trim())
      .map((s) => {
        const baseTitle = s.titleEn.trim() || s.titleAr.trim() || s.titleDe.trim();
        const baseSub = s.subtitleEn.trim() || s.subtitleAr.trim() || s.subtitleDe.trim();
        const baseDur = s.durationOrTimeEn.trim() || s.durationOrTimeAr.trim() || s.durationOrTimeDe.trim();
        return {
          kind: s.kind,
          title: {
            en: s.titleEn.trim() || baseTitle,
            ar: s.titleAr.trim() || baseTitle,
            de: s.titleDe.trim() || baseTitle,
          },
          subtitle: baseSub
            ? {
                en: s.subtitleEn.trim() || baseSub,
                ar: s.subtitleAr.trim() || baseSub,
                de: s.subtitleDe.trim() || baseSub,
              }
            : undefined,
          durationOrTime: baseDur
            ? {
                en: s.durationOrTimeEn.trim() || baseDur,
                ar: s.durationOrTimeAr.trim() || baseDur,
                de: s.durationOrTimeDe.trim() || baseDur,
              }
            : undefined,
        };
      });

    const cleanHistoricalFacts: TripHistoricalFact[] = historicalFactDrafts
      .filter((f) => f.titleEn.trim() || f.titleAr.trim() || f.factEn.trim() || f.factAr.trim())
      .map((f) => {
        const baseTitle = f.titleEn.trim() || f.titleAr.trim() || f.titleDe.trim() || 'Historical Highlight';
        const baseFact = f.factEn.trim() || f.factAr.trim() || f.factDe.trim() || baseTitle;
        const baseEra = f.eraEn.trim() || f.eraAr.trim() || f.eraDe.trim();
        const baseMetric = f.metricEn.trim() || f.metricAr.trim() || f.metricDe.trim();
        return {
          era: baseEra
            ? {
                en: f.eraEn.trim() || baseEra,
                ar: f.eraAr.trim() || baseEra,
                de: f.eraDe.trim() || baseEra,
              }
            : undefined,
          metric: baseMetric
            ? {
                en: f.metricEn.trim() || baseMetric,
                ar: f.metricAr.trim() || baseMetric,
                de: f.metricDe.trim() || baseMetric,
              }
            : undefined,
          title: {
            en: f.titleEn.trim() || baseTitle,
            ar: f.titleAr.trim() || baseTitle,
            de: f.titleDe.trim() || baseTitle,
          },
          fact: {
            en: f.factEn.trim() || baseFact,
            ar: f.factAr.trim() || baseFact,
            de: f.factDe.trim() || baseFact,
          },
        };
      });

    const cleanGalleryCaptions: LocalizedText[] = finalImages.map((_, idx) => {
      const cap = galleryCaptionDrafts[idx];
      const baseCap = cap?.en.trim() || cap?.ar.trim() || cap?.de.trim();
      if (baseCap) {
        return {
          en: cap?.en.trim() || baseCap,
          ar: cap?.ar.trim() || baseCap,
          de: cap?.de.trim() || baseCap,
        };
      }
      const titleFallbackEn = titleEn.trim() || fallbackTitle;
      const titleFallbackAr = titleAr.trim() || fallbackTitle;
      const titleFallbackDe = titleDe.trim() || fallbackTitle;
      return {
        en: `${titleFallbackEn}, Photo ${idx + 1}`,
        ar: `${titleFallbackAr}، صورة ${idx + 1}`,
        de: `${titleFallbackDe}, Foto ${idx + 1}`,
      };
    });

    const hasCustomCaptions = galleryCaptionDrafts.some(
      (c) => Boolean(c?.en.trim() || c?.ar.trim() || c?.de.trim())
    );

    const hasFullDesc = Boolean(fullDescEn.trim() || fullDescAr.trim() || fullDescDe.trim());
    const fallbackFull = fullDescEn.trim() || fullDescAr.trim() || fullDescDe.trim();
    const cleanDuration = duration.trim() || '4 hours';
    const cleanPickup = pickup.trim() || 'All Hurghada hotels';
    const parsedMinAge = minChildAge.trim() ? Number(minChildAge) : NaN;
    const cleanOperatingDays = Array.from(new Set(operatingDays)).sort((a, b) => a - b);

    return {
      ...(initialTrip || {}),
      id: initialTrip?.id || `owner-trip-${Date.now()}`,
      name: {
        en: titleEn.trim() || fallbackTitle,
        ar: titleAr.trim() || fallbackTitle,
        de: titleDe.trim() || fallbackTitle,
      },
      category,
      destination,
      images: finalImages,
      galleryCaptions: hasCustomCaptions ? cleanGalleryCaptions : initialTrip?.galleryCaptions,
      rating: initialTrip?.rating ?? 5.0,
      reviewCount: initialTrip?.reviewCount ?? 1,
      duration:
        durationLoc && durationLoc.en.trim() === cleanDuration
          ? durationLoc
          : {
              en: cleanDuration,
              ar: initialTrip?.duration.ar || cleanDuration,
              de: initialTrip?.duration.de || cleanDuration,
            },
      departureTimes: departureTimesText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
      timingNote:
        timingNoteEn.trim() || timingNoteAr.trim() || timingNoteDe.trim()
          ? {
              en: timingNoteEn.trim() || timingNoteAr.trim() || timingNoteDe.trim(),
              ar: timingNoteAr.trim() || timingNoteEn.trim() || timingNoteDe.trim(),
              de: timingNoteDe.trim() || timingNoteEn.trim() || timingNoteAr.trim(),
            }
          : undefined,
      price: lowestPrice,
      options: cleanOptions.length > 0 ? cleanOptions : undefined,
      shortDescription: {
        en: descEn.trim() || fallbackDesc,
        ar: descAr.trim() || fallbackDesc,
        de: descDe.trim() || fallbackDesc,
      },
      fullDescription: hasFullDesc
        ? {
            en: fullDescEn.trim() || fallbackFull,
            ar: fullDescAr.trim() || fallbackFull,
            de: fullDescDe.trim() || fallbackFull,
          }
        : undefined,
      itinerary: cleanItinerary.length > 0 ? cleanItinerary : undefined,
      historicalFacts: cleanHistoricalFacts.length > 0 ? cleanHistoricalFacts : undefined,
      highlights:
        finalHighlights.length > 0
          ? finalHighlights
          : [
              {
                en: `Verified Wasla partner · ${supplierName}`,
                ar: `معتمد من وصلة ترافل · ${supplierName}`,
                de: `Geprüfter Wasla-Partner · ${supplierName}`,
              },
            ],
      included:
        finalIncluded.length > 0
          ? finalIncluded
          : [
              {
                en: 'Hotel pickup & local support',
                ar: 'التوصيل من الفندق ودعم محلي',
                de: 'Hotelabholung & Betreuung vor Ort',
              },
            ],
      tips: finalTips.length > 0 ? finalTips : undefined,
      notSuitableFor: finalNotSuitable.length > 0 ? finalNotSuitable : undefined,
      meetingPoint: meetingPointEn.trim()
        ? {
            en: meetingPointEn.trim(),
            ar: initialTrip?.meetingPoint?.ar || meetingPointEn.trim(),
            de: initialTrip?.meetingPoint?.de || meetingPointEn.trim(),
          }
        : undefined,
      whatToBring: finalWhatToBring.length > 0 ? finalWhatToBring : undefined,
      notAllowed: finalNotAllowed.length > 0 ? finalNotAllowed : undefined,
      knowBeforeYouGo: finalKnowBefore.length > 0 ? finalKnowBefore : undefined,
      outerTransferEnabled,
      pickup:
        pickupLoc && pickupLoc.en.trim() === cleanPickup
          ? pickupLoc
          : {
              en: cleanPickup,
              ar: initialTrip?.pickup.ar || cleanPickup || 'فنادق الغردقة',
              de: initialTrip?.pickup.de || cleanPickup || 'Alle Hurghada Hotels',
            },
      supplierName: isSupplierMode && initialTrip ? initialTrip.supplierName : supplierName,
      approvalStatus: isSupplierMode
        ? approvalStatus === 'Paused'
          ? 'Paused'
          : 'Pending'
        : approvalStatus,
      familyFriendly: isSupplierMode && initialTrip ? initialTrip.familyFriendly : familyFriendly,
      womenFriendly: isSupplierMode && initialTrip ? initialTrip.womenFriendly : womenFriendly,
      minChildAge:
        isSupplierMode && initialTrip
          ? initialTrip.minChildAge
          : Number.isFinite(parsedMinAge)
          ? Math.max(0, Math.min(18, Math.round(parsedMinAge)))
          : undefined,
      featured: isSupplierMode && initialTrip ? initialTrip.featured : featured,
      operatingDays:
        cleanOperatingDays.length > 0 && cleanOperatingDays.length < 7
          ? cleanOperatingDays
          : undefined,
      availableFrom: availableFrom.trim() || undefined,
      availableTo: availableTo.trim() || undefined,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSaveTrip(buildTripPayload(), mode);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save trip changes. Please verify your permissions and fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/60 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? 'Owner Create Trip' : 'Owner Edit Trip'}
    >
      <div
        className="card-wasla p-0 w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#C8C2B8]/50 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <div className="text-[11px] font-semibold text-[#EE5426]">
              {isSupplierMode
                ? 'Supplier Trip Editor · تعديل رحلة المورد'
                : 'Owner Full Catalog Control'}
            </div>
            <h2 className="font-display text-lg font-semibold text-[#0F2233]">
              {mode === 'create' ? 'Create New Trip / Service' : `Edit: ${initialTrip?.name.en}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#C8C2B8]/60 text-[#0F2233] hover:bg-[#FAF4ED] cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
            <span className="text-xs text-[#475569]">
              Write in English or Arabic, then auto-translate EN / AR / DE and preview live before saving.
            </span>
            <button
              type="button"
              disabled={translating}
              onClick={handleAutoTranslate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#EE5426] bg-white px-3 py-1.5 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{translating ? 'Translating...' : 'Auto-Translate EN / AR / DE'}</span>
            </button>
          </div>

          {translateNotice && (
            <p
              className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                translateNotice.type === 'ok'
                  ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
              }`}
            >
              {translateNotice.text}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Title (EN)</span>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Title (AR)</span>
              <input
                type="text"
                dir="rtl"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Title (DE)</span>
              <input
                type="text"
                value={titleDe}
                onChange={(e) => setTitleDe(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Destination</span>
              <select
                value={destination}
                disabled={isSupplierMode && Boolean(initialTrip)}
                onChange={(e) => setDestination(e.target.value as DestinationRegion)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-medium disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
              >
                <option value="Hurghada">Hurghada</option>
                <option value="Marsa Alam">Marsa Alam</option>
                <option value="Luxor">Luxor</option>
                <option value="Cairo">Cairo</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Category</span>
              <select
                value={category}
                disabled={isSupplierMode && Boolean(initialTrip)}
                onChange={(e) => setCategory(e.target.value as ActivityCategoryId)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-medium disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
              >
                <option value="sea">Sea trips</option>
                <option value="desert">Desert trips</option>
                <option value="historical">Historical</option>
                <option value="horse">Horse riding</option>
                <option value="guides">Egyptian guides</option>
                <option value="shopping">Shopping tour</option>
                <option value="city">City tour</option>
                <option value="transfers">Transfers</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Supplier</span>
              <select
                value={supplierName}
                disabled={isSupplierMode}
                onChange={(e) => setSupplierName(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-medium disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Listing Status</span>
              <select
                value={
                  isSupplierMode && approvalStatus !== 'Paused'
                    ? 'Pending'
                    : approvalStatus
                }
                onChange={(e) =>
                  setApprovalStatus(e.target.value as 'Approved' | 'Pending' | 'Paused' | 'Rejected')
                }
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold"
              >
                {!isSupplierMode && <option value="Approved">Approved (Live)</option>}
                <option value="Paused">Paused / Closed</option>
                <option value="Pending">Pending Review</option>
                {!isSupplierMode && <option value="Rejected">Rejected</option>}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Base Price (€)</span>
              <input
                type="number"
                min={5}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs tabular-nums"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Duration</span>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Pickup area</span>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Min Child Age</span>
              <input
                type="number"
                min={0}
                value={minChildAge}
                onChange={(e) => setMinChildAge(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs tabular-nums"
              />
            </label>
          </div>

          <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/50 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#0F2233]">
                توقيت بداية الرحلة · Trip Start Times (separate from Hotel Pickup Time)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Sea (09:00 AM)', val: '09:00 AM', note: '' },
                  {
                    label: 'Morning & Sunset',
                    val: '08:30 AM (Morning), 02:30 PM (Sunset)',
                    note: '',
                  },
                  {
                    label: 'City (Morning & PM)',
                    val: '10:00 AM (Morning), 04:00 PM (Afternoon)',
                    note: '',
                  },
                  {
                    label: 'Horse (4 Slots)',
                    val: '07:30 AM (Sunrise), 10:00 AM (Morning), 02:30 PM (Afternoon), 04:30 PM (Sunset)',
                    note: '',
                  },
                  { label: 'Flight Time (Transfers)', val: '', note: 'According to flight time' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDepartureTimesText(preset.val);
                      if (preset.note) {
                        setTimingNoteEn('According to flight time');
                        setTimingNoteAr('حسب ميعاد الطيارة');
                        setTimingNoteDe('Nach Flugzeit');
                      }
                    }}
                    className="rounded-md border border-[#FED7AA] bg-white px-2 py-0.5 text-[11px] font-medium text-[#9A3412] hover:bg-[#FFEDD5] cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">
                  Start Time Slots (comma-separated, leave blank for flight transfers)
                </span>
                <input
                  type="text"
                  value={departureTimesText}
                  onChange={(e) => setDepartureTimesText(e.target.value)}
                  placeholder="e.g. 09:00 AM or 08:30 AM (Morning), 02:30 PM (Sunset)"
                  className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs tabular-nums"
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-[#475569]">Timing Note EN</span>
                  <input
                    type="text"
                    value={timingNoteEn}
                    onChange={(e) => setTimingNoteEn(e.target.value)}
                    placeholder="According to flight time"
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-[#475569]">Note AR</span>
                  <input
                    type="text"
                    dir="rtl"
                    value={timingNoteAr}
                    onChange={(e) => setTimingNoteAr(e.target.value)}
                    placeholder="حسب ميعاد الطيارة"
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-[#475569]">Note DE</span>
                  <input
                    type="text"
                    value={timingNoteDe}
                    onChange={(e) => setTimingNoteDe(e.target.value)}
                    placeholder="Nach Flugzeit"
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Short Description (EN)</span>
              <textarea
                rows={2}
                required
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Short Description (AR)</span>
              <textarea
                rows={2}
                dir="rtl"
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Short Description (DE)</span>
              <textarea
                rows={2}
                value={descDe}
                onChange={(e) => setDescDe(e.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs"
              />
            </label>
          </div>

          {/* Full 5-Part GetYourGuide-Style Trip Details */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
            <div className="text-xs font-semibold text-[#0F2233]">
              Full Description, Highlights, Includes, Exclusions, Google Maps & Safety Info (one bullet per line)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Full Description (EN)</span>
                <textarea
                  rows={3}
                  value={fullDescEn}
                  onChange={(e) => setFullDescEn(e.target.value)}
                  placeholder="Detailed itinerary & guest experience..."
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Full Description (AR)</span>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={fullDescAr}
                  onChange={(e) => setFullDescAr(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Full Description (DE)</span>
                <textarea
                  rows={3}
                  value={fullDescDe}
                  onChange={(e) => setFullDescDe(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Highlights (1 per line)</span>
                <textarea
                  rows={3}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="Guided ride along Red Sea&#10;Optional photoshoot"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Includes (1 per line)</span>
                <textarea
                  rows={3}
                  value={includedText}
                  onChange={(e) => setIncludedText(e.target.value)}
                  placeholder="Hotel pickup in Hurghada&#10;Bottled water"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Tips / Exclusions (1 per line)</span>
                <textarea
                  rows={3}
                  value={tipsText}
                  onChange={(e) => setTipsText(e.target.value)}
                  placeholder="Tips&#10;Photography unless selected&#10;Pickup outside Hurghada (Makadi, El Gouna...)"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Not suitable for</span>
                <textarea
                  rows={2}
                  value={notSuitableText}
                  onChange={(e) => setNotSuitableText(e.target.value)}
                  placeholder="Pregnant women&#10;Children under 5"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">What to bring</span>
                <textarea
                  rows={2}
                  value={whatToBringText}
                  onChange={(e) => setWhatToBringText(e.target.value)}
                  placeholder="Hat&#10;Sunscreen&#10;Camera"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Not allowed</span>
                <textarea
                  rows={2}
                  value={notAllowedText}
                  onChange={(e) => setNotAllowedText(e.target.value)}
                  placeholder="Pets&#10;Alcohol and drugs"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Know before you go</span>
                <textarea
                  rows={2}
                  value={knowBeforeText}
                  onChange={(e) => setKnowBeforeText(e.target.value)}
                  placeholder="Suitable for beginners&#10;Comfortable clothing"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-[#475569]">Meeting point label</span>
              <input
                type="text"
                value={meetingPointEn}
                onChange={(e) => setMeetingPointEn(e.target.value)}
                placeholder="e.g. Hurghada New Marina Gate 2 / Hotel Reception"
                className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs"
              />
            </label>
          </div>

          {/* Full-Page Itinerary Timeline Builder */}
          <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[#0F2233]">
                  Full-Page Route Itinerary (مسار الرحلة خطوة بخطوة)
                </div>
                <p className="text-[11px] text-[#475569]">
                  Displayed beside Full Description on the full trip page timeline.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {itineraryDrafts.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setItineraryDrafts(createDefaultItineraryDrafts())}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F2233] hover:border-[#EE5426] hover:text-[#EE5426] cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    <span>Pre-fill 3-Step Route</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setItineraryDrafts((prev) => [
                      ...prev,
                      {
                        id: `stop-${Date.now()}`,
                        kind: 'stop',
                        titleEn: '',
                        titleAr: '',
                        titleDe: '',
                        subtitleEn: '',
                        subtitleAr: '',
                        subtitleDe: '',
                        durationOrTimeEn: '',
                        durationOrTimeAr: '',
                        durationOrTimeDe: '',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#EE5426] bg-white px-2.5 py-1 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] cursor-pointer"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  <span>Add Itinerary Stop</span>
                </button>
              </div>
            </div>

            {itineraryDrafts.length > 0 && (
              <div className="space-y-2">
                {itineraryDrafts.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg border border-[#E2E8F0] bg-white p-2.5"
                  >
                    <select
                      value={stop.kind}
                      onChange={(e) =>
                        setItineraryDrafts((prev) =>
                          prev.map((s) =>
                            s.id === stop.id ? { ...s, kind: e.target.value as TripItineraryStop['kind'] } : s
                          )
                        )
                      }
                      aria-label={`Stop ${idx + 1} type`}
                      className="sm:col-span-2 min-h-[36px] rounded border border-[#CBD5E1] bg-white px-2 text-xs font-semibold"
                    >
                      <option value="pickup">Pickup</option>
                      <option value="stop">Main Stop</option>
                      <option value="break">Break / Lunch</option>
                      <option value="end">Return / End</option>
                    </select>
                    <input
                      type="text"
                      value={stop.titleEn}
                      onChange={(e) =>
                        setItineraryDrafts((prev) =>
                          prev.map((s) => (s.id === stop.id ? { ...s, titleEn: e.target.value } : s))
                        )
                      }
                      placeholder={`Stop ${idx + 1} title`}
                      className="sm:col-span-4 min-h-[36px] rounded border border-[#CBD5E1] px-2.5 text-xs"
                    />
                    <input
                      type="text"
                      value={stop.subtitleEn}
                      onChange={(e) =>
                        setItineraryDrafts((prev) =>
                          prev.map((s) => (s.id === stop.id ? { ...s, subtitleEn: e.target.value } : s))
                        )
                      }
                      placeholder="Activity / subtitle (e.g. Guided tour & photos)"
                      className="sm:col-span-3 min-h-[36px] rounded border border-[#CBD5E1] px-2.5 text-xs"
                    />
                    <input
                      type="text"
                      value={stop.durationOrTimeEn}
                      onChange={(e) =>
                        setItineraryDrafts((prev) =>
                          prev.map((s) => (s.id === stop.id ? { ...s, durationOrTimeEn: e.target.value } : s))
                        )
                      }
                      placeholder="Duration / time (e.g. 90 mins)"
                      className="sm:col-span-2 min-h-[36px] rounded border border-[#CBD5E1] px-2.5 text-xs"
                    />
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setItineraryDrafts((prev) => prev.filter((s) => s.id !== stop.id))
                        }
                        aria-label={`Remove stop ${idx + 1}`}
                        className="p-1 text-[#B91C1C] hover:bg-[#FEF2F2] rounded cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Facts & Heritage Context Builder */}
          <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[#0F2233]">
                  Historical Facts & Cultural Context (حقائق تاريخية للرحلة - اختياري)
                </div>
                <p className="text-[11px] text-[#475569]">
                  Add heritage or destination fact cards for historical, Luxor, Cairo, or cultural excursions.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setHistoricalFactDrafts((prev) => [
                    ...prev,
                    {
                      id: `fact-${Date.now()}`,
                      eraEn: '',
                      eraAr: '',
                      eraDe: '',
                      metricEn: '',
                      metricAr: '',
                      metricDe: '',
                      titleEn: '',
                      titleAr: '',
                      titleDe: '',
                      factEn: '',
                      factAr: '',
                      factDe: '',
                    },
                  ])
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#EE5426] bg-white px-2.5 py-1 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] cursor-pointer"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                <span>Add Historical Fact</span>
              </button>
            </div>

            {historicalFactDrafts.length > 0 && (
              <div className="space-y-2.5">
                {historicalFactDrafts.map((fact, idx) => (
                  <div
                    key={fact.id}
                    className="rounded-lg border border-[#E2E8F0] bg-white p-3 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={fact.eraEn}
                        onChange={(e) =>
                          setHistoricalFactDrafts((prev) =>
                            prev.map((f) => (f.id === fact.id ? { ...f, eraEn: e.target.value } : f))
                          )
                        }
                        placeholder="Era (e.g. New Kingdom)"
                        className="sm:col-span-3 min-h-[34px] rounded border border-[#CBD5E1] px-2.5 text-xs"
                      />
                      <input
                        type="text"
                        value={fact.metricEn}
                        onChange={(e) =>
                          setHistoricalFactDrafts((prev) =>
                            prev.map((f) => (f.id === fact.id ? { ...f, metricEn: e.target.value } : f))
                          )
                        }
                        placeholder="Key stat (e.g. 63 Tombs)"
                        className="sm:col-span-3 min-h-[34px] rounded border border-[#CBD5E1] px-2.5 text-xs"
                      />
                      <input
                        type="text"
                        value={fact.titleEn}
                        onChange={(e) =>
                          setHistoricalFactDrafts((prev) =>
                            prev.map((f) => (f.id === fact.id ? { ...f, titleEn: e.target.value } : f))
                          )
                        }
                        placeholder={`Fact ${idx + 1} heading`}
                        className="sm:col-span-5 min-h-[34px] rounded border border-[#CBD5E1] px-2.5 text-xs font-medium"
                      />
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setHistoricalFactDrafts((prev) => prev.filter((f) => f.id !== fact.id))
                          }
                          aria-label={`Remove fact ${idx + 1}`}
                          className="p-1 text-[#B91C1C] hover:bg-[#FEF2F2] rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={fact.factEn}
                      onChange={(e) =>
                        setHistoricalFactDrafts((prev) =>
                          prev.map((f) => (f.id === fact.id ? { ...f, factEn: e.target.value } : f))
                        )
                      }
                      placeholder="Concise historical story or cultural context..."
                      className="w-full rounded border border-[#CBD5E1] p-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operating Schedule & Seasonal Range (powers date-range filtering) */}
          <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#0F2233]">
                Operating Days & Date Range Availability (أيام التشغيل)
              </span>
              <span className="text-[11px] text-[#475569]">
                Used by the Hero Start/End Date Range Search
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_OPTIONS.map((opt) => {
                  const selected = operatingDays.includes(opt.day);
                  return (
                    <button
                      key={opt.day}
                      type="button"
                      onClick={() =>
                        setOperatingDays((prev) =>
                          prev.includes(opt.day)
                            ? prev.length > 1
                              ? prev.filter((d) => d !== opt.day)
                              : prev
                            : [...prev, opt.day].sort((a, b) => a - b)
                        )
                      }
                      className={`min-h-[32px] rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#EE5426] bg-[#EE5426] text-white'
                          : 'border-[#CBD5E1] bg-white text-[#475569]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                  <span>From:</span>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="min-h-[32px] rounded-lg border border-[#CBD5E1] bg-white px-2 text-xs text-[#0F2233]"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                  <span>To:</span>
                  <input
                    type="date"
                    value={availableTo}
                    min={availableFrom || undefined}
                    onChange={(e) => setAvailableTo(e.target.value)}
                    className="min-h-[32px] rounded-lg border border-[#CBD5E1] bg-white px-2 text-xs text-[#0F2233]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Photos & Gallery Captions */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F2233]">
              <ImagePlus className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
              <span>Photos & Gallery Captions ({images.length}/8)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#EE5426] bg-white px-3 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Upload Photo</span>
              </button>
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste https:// photo URL"
                className="min-h-[38px] flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold cursor-pointer"
              >
                Add URL
              </button>
            </div>
            {uploadNote && <p className="text-[11px] text-[#EE5426]">{uploadNote}</p>}
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pb-1">
                {images.map((src, i) => (
                  <div key={i} className="rounded-lg border border-[#CBD5E1] bg-white overflow-hidden">
                    <div className="wasla-img-glare relative">
                      <img src={src} alt={`Trip pic ${i + 1}`} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImages((prev) => prev.filter((_, idx) => idx !== i));
                          setGalleryCaptionDrafts((prev) => prev.filter((_, idx) => idx !== i));
                        }}
                        className="absolute top-1 end-1 z-30 rounded bg-white/90 p-1 text-[#B91C1C] cursor-pointer"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="p-1.5 border-t border-[#E2E8F0]">
                      <input
                        type="text"
                        value={galleryCaptionDrafts[i]?.en || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGalleryCaptionDrafts((prev) =>
                            images.map((_, idx) =>
                              idx === i
                                ? { ...(prev[idx] || { en: '', ar: '', de: '' }), en: val }
                                : prev[idx] || { en: '', ar: '', de: '' }
                            )
                          );
                        }}
                        placeholder={`Photo ${i + 1} gallery caption`}
                        className="w-full rounded border border-[#E2E8F0] px-2 py-1 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {starterGallery.map((imgSrc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImages([imgSrc]);
                      setGalleryCaptionDrafts([{ en: '', ar: '', de: '' }]);
                    }}
                    className="wasla-img-glare shrink-0 rounded border border-[#CBD5E1] overflow-hidden hover:border-[#EE5426] cursor-pointer"
                  >
                    <img src={imgSrc} alt={`Gallery ${i + 1}`} className="h-12 w-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Options Builder */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFF7ED]/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F2233]">Options & Pricing</span>
              <button
                type="button"
                onClick={() =>
                  setOptionDrafts((prev) => [
                    ...prev,
                    { id: `opt-${Date.now()}`, titleEn: '', titleAr: '', titleDe: '', detailEn: '', price: 50 },
                  ])
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#EE5426] bg-white px-2.5 py-1 text-xs font-semibold text-[#EE5426] cursor-pointer"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                <span>Add Option</span>
              </button>
            </div>
            {optionDrafts.map((opt, idx) => (
              <div key={opt.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={opt.titleEn}
                  onChange={(e) =>
                    setOptionDrafts((prev) =>
                      prev.map((o) => (o.id === opt.id ? { ...o, titleEn: e.target.value } : o))
                    )
                  }
                  placeholder={`Option ${idx + 1} EN`}
                  className="sm:col-span-3 min-h-[36px] rounded border border-[#CBD5E1] bg-white px-2.5 text-xs"
                />
                <input
                  type="text"
                  dir="rtl"
                  value={opt.titleAr}
                  onChange={(e) =>
                    setOptionDrafts((prev) =>
                      prev.map((o) => (o.id === opt.id ? { ...o, titleAr: e.target.value } : o))
                    )
                  }
                  placeholder={`AR`}
                  className="sm:col-span-3 min-h-[36px] rounded border border-[#CBD5E1] bg-white px-2.5 text-xs"
                />
                <input
                  type="text"
                  value={opt.detailEn}
                  onChange={(e) =>
                    setOptionDrafts((prev) =>
                      prev.map((o) => (o.id === opt.id ? { ...o, detailEn: e.target.value } : o))
                    )
                  }
                  placeholder="Detail / inclusions"
                  className="sm:col-span-3 min-h-[36px] rounded border border-[#CBD5E1] bg-white px-2.5 text-xs"
                />
                <input
                  type="number"
                  min={5}
                  value={opt.price}
                  onChange={(e) =>
                    setOptionDrafts((prev) =>
                      prev.map((o) => (o.id === opt.id ? { ...o, price: Number(e.target.value) } : o))
                    )
                  }
                  className="sm:col-span-2 min-h-[36px] rounded border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold tabular-nums"
                />
                <div className="sm:col-span-1 flex justify-end">
                  {optionDrafts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setOptionDrafts((prev) => prev.filter((o) => o.id !== opt.id))}
                      className="text-[#B91C1C] cursor-pointer p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0] pt-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#0F2233]">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured on Top Carousel</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyFriendly}
                  onChange={(e) => setFamilyFriendly(e.target.checked)}
                />
                <span>Family friendly</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={womenFriendly}
                  onChange={(e) => setWomenFriendly(e.target.checked)}
                />
                <span>Women friendly</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outerTransferEnabled}
                  onChange={(e) => setOuterTransferEnabled(e.target.checked)}
                />
                <span>Outer-Zone Transfer Fee (Makadi/El Gouna/Soma)</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewTrip(buildTripPayload())}
                className="inline-flex items-center gap-1.5 min-h-[40px] rounded-lg border border-[#EE5426] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#EE5426] hover:bg-[#FFEDD5] cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Preview Full Trip Page</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] rounded-lg border border-[#CBD5E1] px-4 text-xs font-semibold text-[#475569] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-wasla-primary gap-1.5 min-h-[40px] rounded-lg px-5 py-2 text-xs cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{saving ? 'Saving...' : mode === 'create' ? 'Create & Save Trip' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {saveError && (
            <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
              {saveError}
            </p>
          )}
        </form>
      </div>

      <TripDetailModal
        trip={previewTrip}
        previewMode
        lang="en"
        t={I18N.en}
        onClose={() => setPreviewTrip(null)}
        onSubmitBooking={() => {}}
      />
    </div>
  );
};
