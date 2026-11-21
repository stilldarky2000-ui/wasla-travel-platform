import React, { useMemo, useRef, useState } from 'react';
import { Check, Clock, Eye, ImagePlus, Languages, Pencil, Plus, ShieldCheck, Ship, Sparkles, Trash2, Upload } from 'lucide-react';
import { authFetch } from '../../lib/apiAuth';
import { I18N } from '../../data/i18n';
import {
  ActivityCategoryId,
  DestinationRegion,
  LocalizedText,
  Trip,
  TripHistoricalFact,
  TripItineraryStop,
  TripOption,
  formatTripScheduleSummary,
} from '../../data/marketplaceData';
import {
  PlatformBooking,
  SupplierProfile,
  getBookingUrgency,
  sortBookingsNewestFirst,
} from '../../data/platformData';
import { TripDetailModal } from '../TripDetailModal';
import { ThemeSwitch } from '../ThemeSwitch';
import { OwnerTripEditorModal } from './OwnerTripEditorModal';

interface OptionDraft {
  id: string;
  title: string;
  detail: string;
  price: number;
}

interface SupplierItineraryStopDraft {
  id: string;
  kind: TripItineraryStop['kind'];
  title: string;
  subtitle: string;
  durationOrTime: string;
}

interface SupplierHistoricalFactDraft {
  id: string;
  era: string;
  metric: string;
  title: string;
  fact: string;
}

const SUPPLIER_WEEKDAY_OPTIONS: Array<{ day: number; label: string }> = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
];

const createDefaultSupplierItinerary = (): SupplierItineraryStopDraft[] => [
  {
    id: `sup-stop-${Date.now()}-1`,
    kind: 'pickup',
    title: 'Hotel Reception Pickup',
    subtitle: 'Air-conditioned hotel pickup',
    durationOrTime: 'Morning pickup',
  },
  {
    id: `sup-stop-${Date.now()}-2`,
    kind: 'stop',
    title: 'Main Excursion Experience & Guided Stops',
    subtitle: 'Guided program with photo opportunities',
    durationOrTime: '2 hours',
  },
  {
    id: `sup-stop-${Date.now()}-3`,
    kind: 'end',
    title: 'Return Drop-Off at Your Hotel',
    subtitle: 'Direct return transfer',
    durationOrTime: '',
  },
];

interface SupplierPortalProps {
  trips: Trip[];
  bookings: PlatformBooking[];
  suppliers: SupplierProfile[];
  commissionRate: number;
  lockedSupplierName?: string;
  isOwnerUser?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onAddTrip: (trip: Trip) => Promise<void> | void;
  onUpdateTrip?: (trip: Trip) => Promise<void> | void;
  onUpdateBooking: (id: string, patch: Partial<PlatformBooking>) => void;
}

export const SupplierPortal: React.FC<SupplierPortalProps> = ({
  trips,
  bookings,
  suppliers,
  commissionRate: _commissionRate,
  lockedSupplierName = '',
  isOwnerUser = false,
  darkMode = false,
  onToggleDarkMode,
  onAddTrip,
  onUpdateTrip,
  onUpdateBooking,
}) => {
  const [selectedSupplierName, setSelectedSupplierName] = useState(
    lockedSupplierName || suppliers[0]?.name || 'Captain Karim Marine'
  );
  const activeSupplierName = lockedSupplierName || selectedSupplierName;
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
  const [driverDrafts, setDriverDrafts] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Trip form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategoryId>('sea');
  const [destination, setDestination] = useState<DestinationRegion>('Hurghada');
  const [price, setPrice] = useState(40);
  const [duration, setDuration] = useState('4 hours');
  const [departureTimesText, setDepartureTimesText] = useState('09:00 AM');
  const [pickup, setPickup] = useState('All Hurghada hotels');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [includedText, setIncludedText] = useState('');
  const [tipsText, setTipsText] = useState(
    'Tips\nPick-up outside Hurghada (Makadi, Sahl Hasheesh, El Gouna, Soma Bay or Safaga) via checkout add-on'
  );
  const [notSuitableText, setNotSuitableText] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [whatToBringText, setWhatToBringText] = useState('');
  const [notAllowedText, setNotAllowedText] = useState('');
  const [knowBeforeText, setKnowBeforeText] = useState('');
  const [outerTransferEnabled, setOuterTransferEnabled] = useState(true);
  const [minChildAge, setMinChildAge] = useState('4');
  const [familyFriendly, setFamilyFriendly] = useState(true);
  const [womenFriendly, setWomenFriendly] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [galleryCaptions, setGalleryCaptions] = useState<string[]>([]);
  const [itineraryDrafts, setItineraryDrafts] = useState<SupplierItineraryStopDraft[]>(
    () => createDefaultSupplierItinerary()
  );
  const [historicalFactDrafts, setHistoricalFactDrafts] = useState<SupplierHistoricalFactDraft[]>([]);
  const [operatingDays, setOperatingDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [optionDrafts, setOptionDrafts] = useState<OptionDraft[]>([
    { id: 'opt-1', title: 'Standard Shared Group', detail: 'Hotel pickup + shared boat/van', price: 40 },
    { id: 'opt-2', title: 'VIP / Private Option', detail: 'Priority pickup & private guide/table', price: 68 },
  ]);
  const [publishing, setPublishing] = useState(false);
  const [addedBanner, setAddedBanner] = useState('');
  const [previewTripDraft, setPreviewTripDraft] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const findEditableTripForBooking = (b: PlatformBooking): Trip | undefined =>
    trips.find((tr) => tr.id === b.tripId) ||
    trips.find(
      (tr) =>
        tr.name.en.toLowerCase() === b.tripTitle.toLowerCase() &&
        tr.supplierName === activeSupplierName
    ) ||
    trips.find((tr) => tr.name.en.toLowerCase() === b.tripTitle.toLowerCase());

  const splitLines = (raw: string): string[] =>
    raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const toLocalizedList = (lines: string[]): LocalizedText[] =>
    lines.map((line) => ({ en: line, ar: line, de: line }));

  const starterGallery = useMemo(() => {
    const unique = Array.from(new Set(trips.flatMap((t) => t.images).filter(Boolean)));
    return unique.slice(0, 6);
  }, [trips]);

  const supplierTrips = useMemo(
    () => trips.filter((tr) => tr.supplierName === activeSupplierName),
    [trips, activeSupplierName]
  );

  const supplierBookings = useMemo(
    () =>
      sortBookingsNewestFirst(
        bookings.filter(
          (b) =>
            b.supplierName === activeSupplierName &&
            (b.status === 'Confirmed' ||
              b.status === 'Driver assigned' ||
              b.status === 'Completed')
        )
      ),
    [bookings, activeSupplierName]
  );

  const compressImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Invalid image format'));
        img.onload = () => {
          const tryEncode = (maxWidth: number, quality: number): string => {
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) return '';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', quality);
          };

          const candidates: Array<[number, number]> = [
            [800, 0.7],
            [720, 0.58],
            [600, 0.48],
            [480, 0.4],
          ];
          let encoded = '';
          for (const [w, q] of candidates) {
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
    setUploadNote('Processing high-resolution photos...');

    try {
      const processed: string[] = [];
      for (const file of files.slice(0, 6)) {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await compressImageFile(file);
        if (dataUrl && dataUrl.length <= 240000) {
          processed.push(dataUrl);
        }
      }
      const nextAdded = processed.slice(0, Math.max(0, 8 - uploadedImages.length));
      setUploadedImages((prev) => [...prev, ...nextAdded].slice(0, 8));
      setGalleryCaptions((prev) => [...prev, ...nextAdded.map(() => '')].slice(0, 8));
      setUploadNote(
        processed.length > 0
          ? `Added ${processed.length} optimized photo(s) ready for storefront.`
          : 'Please choose valid image files (JPG, PNG, WebP).'
      );
    } catch {
      setUploadNote('Could not read one of the selected images.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setUploadNote('Please enter a valid https:// image URL.');
      return;
    }
    if (!uploadedImages.includes(url) && uploadedImages.length < 8) {
      setUploadedImages((prev) => [...prev, url].slice(0, 8));
      setGalleryCaptions((prev) => [...prev, ''].slice(0, 8));
    }
    setImageUrlInput('');
    setUploadNote('');
  };

  const buildDraftTripObject = (
    translated?: {
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
    } | null
  ): Trip => {
    const activeDrafts = optionDrafts.filter((o) => o.title.trim());
    const safeBasePrice = Math.max(5, Math.round(Number.isFinite(price) && price > 0 ? price : 40));
    const validOptions: TripOption[] = activeDrafts.map((o, idx) => {
      const trOpt = translated?.options?.[idx];
      const fallbackTitle = { en: o.title.trim(), ar: o.title.trim(), de: o.title.trim() };
      const fallbackDetail = o.detail.trim()
        ? { en: o.detail.trim(), ar: o.detail.trim(), de: o.detail.trim() }
        : undefined;
      const rawOptPrice = Number(o.price);
      return {
        id: `opt-${Date.now()}-${idx}`,
        title: trOpt?.title || fallbackTitle,
        detail: trOpt?.detail || fallbackDetail,
        price: Math.max(5, Math.round(Number.isFinite(rawOptPrice) && rawOptPrice > 0 ? rawOptPrice : safeBasePrice)),
      };
    });

    const basePrice =
      validOptions.length > 0
        ? Math.min(...validOptions.map((o) => o.price))
        : safeBasePrice;

    const templateImg =
      trips.find((t) => t.category === category)?.images.find(Boolean) ||
      trips[0]?.images.find(Boolean) ||
      '';
    const finalImages = uploadedImages.length > 0 ? uploadedImages : templateImg ? [templateImg] : [];
    const displayTitle = title.trim() || 'Untitled Excursion Preview';
    const displayDesc =
      shortDesc.trim() || 'Add your short description to preview how guests read this itinerary.';

    const rawHighlights = splitLines(highlightsText);
    const rawIncluded = splitLines(includedText);
    const rawTips = splitLines(tipsText);
    const rawNotSuit = splitLines(notSuitableText);
    const rawBring = splitLines(whatToBringText);
    const rawNotAllowed = splitLines(notAllowedText);
    const rawKnow = splitLines(knowBeforeText);

    const activeItinerary = itineraryDrafts.filter((s) => s.title.trim());
    const cleanItinerary: TripItineraryStop[] = activeItinerary.map((s, idx) => {
      const tr = translated?.itinerary?.[idx];
      const baseTitle = s.title.trim();
      const baseSub = s.subtitle.trim();
      const baseDur = s.durationOrTime.trim();
      return {
        kind: s.kind,
        title: tr?.title || { en: baseTitle, ar: baseTitle, de: baseTitle },
        subtitle: baseSub
          ? tr?.subtitle || { en: baseSub, ar: baseSub, de: baseSub }
          : undefined,
        durationOrTime: baseDur
          ? tr?.durationOrTime || { en: baseDur, ar: baseDur, de: baseDur }
          : undefined,
      };
    });

    const activeFacts = historicalFactDrafts.filter((f) => f.title.trim() || f.fact.trim());
    const cleanFacts: TripHistoricalFact[] = activeFacts.map((f, idx) => {
      const tr = translated?.historicalFacts?.[idx];
      const baseTitle = f.title.trim() || 'Heritage Note';
      const baseFact = f.fact.trim() || baseTitle;
      return {
        era: f.era.trim()
          ? tr?.era || { en: f.era.trim(), ar: f.era.trim(), de: f.era.trim() }
          : undefined,
        metric: f.metric.trim()
          ? tr?.metric || { en: f.metric.trim(), ar: f.metric.trim(), de: f.metric.trim() }
          : undefined,
        title: tr?.title || { en: baseTitle, ar: baseTitle, de: baseTitle },
        fact: tr?.fact || { en: baseFact, ar: baseFact, de: baseFact },
      };
    });

    const hasCustomCaptions = galleryCaptions.some((c) => Boolean(c.trim()));
    let trCapIdx = 0;
    const cleanGalleryCaptions: LocalizedText[] | undefined = hasCustomCaptions
      ? finalImages.map((_, idx) => {
          const rawCap = (galleryCaptions[idx] || '').trim();
          if (rawCap) {
            const trCap = translated?.galleryCaptions?.[trCapIdx++];
            return trCap || { en: rawCap, ar: rawCap, de: rawCap };
          }
          return {
            en: `${displayTitle} — Photo ${idx + 1}`,
            ar: `${displayTitle} — صورة ${idx + 1}`,
            de: `${displayTitle} — Foto ${idx + 1}`,
          };
        })
      : undefined;

    const cleanOperatingDays = Array.from(new Set(operatingDays)).sort((a, b) => a - b);

    return {
      id: `sup-trip-${Date.now()}`,
      name: translated?.name || { en: displayTitle, ar: displayTitle, de: displayTitle },
      category,
      destination,
      images: finalImages,
      galleryCaptions: cleanGalleryCaptions,
      rating: 5.0,
      reviewCount: 1,
      duration: translated?.duration || { en: duration, ar: duration, de: duration },
      departureTimes:
        category === 'transfers'
          ? []
          : departureTimesText
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 8),
      timingNote:
        category === 'transfers'
          ? { en: 'According to flight time', ar: 'حسب ميعاد الطيارة', de: 'Nach Flugzeit' }
          : undefined,
      price: basePrice,
      options: validOptions.length > 0 ? validOptions : undefined,
      shortDescription: translated?.shortDescription || {
        en: displayDesc,
        ar: displayDesc,
        de: displayDesc,
      },
      fullDescription:
        translated?.fullDescription ||
        (fullDesc.trim()
          ? { en: fullDesc.trim(), ar: fullDesc.trim(), de: fullDesc.trim() }
          : undefined),
      itinerary: cleanItinerary.length > 0 ? cleanItinerary : undefined,
      historicalFacts: cleanFacts.length > 0 ? cleanFacts : undefined,
      highlights: translated?.highlights?.length
        ? translated.highlights
        : rawHighlights.length > 0
        ? toLocalizedList(rawHighlights)
        : [
            {
              en: `Operated directly by ${activeSupplierName}`,
              ar: `بإدارة مباشرة من ${activeSupplierName}`,
              de: `Direkt durchgeführt von ${activeSupplierName}`,
            },
          ],
      included: translated?.included?.length
        ? translated.included
        : rawIncluded.length > 0
        ? toLocalizedList(rawIncluded)
        : [
            {
              en: 'Local pickup & vetted guide/captain',
              ar: 'التوصيل والمرشد المعتمد',
              de: 'Abholung & geprüfter Guide',
            },
          ],
      tips: translated?.tips?.length
        ? translated.tips
        : rawTips.length > 0
        ? toLocalizedList(rawTips)
        : undefined,
      notSuitableFor: translated?.notSuitableFor?.length
        ? translated.notSuitableFor
        : rawNotSuit.length > 0
        ? toLocalizedList(rawNotSuit)
        : undefined,
      meetingPoint: meetingPoint.trim()
        ? { en: meetingPoint.trim(), ar: meetingPoint.trim(), de: meetingPoint.trim() }
        : undefined,
      whatToBring: translated?.whatToBring?.length
        ? translated.whatToBring
        : rawBring.length > 0
        ? toLocalizedList(rawBring)
        : undefined,
      notAllowed: translated?.notAllowed?.length
        ? translated.notAllowed
        : rawNotAllowed.length > 0
        ? toLocalizedList(rawNotAllowed)
        : undefined,
      knowBeforeYouGo: translated?.knowBeforeYouGo?.length
        ? translated.knowBeforeYouGo
        : rawKnow.length > 0
        ? toLocalizedList(rawKnow)
        : undefined,
      outerTransferEnabled,
      pickup: translated?.pickup || { en: pickup, ar: pickup, de: pickup },
      supplierName: activeSupplierName,
      approvalStatus: isOwnerUser ? 'Approved' : 'Pending',
      familyFriendly,
      womenFriendly,
      minChildAge: minChildAge ? Number(minChildAge) : undefined,
      featured: false,
      operatingDays:
        cleanOperatingDays.length > 0 && cleanOperatingDays.length < 7
          ? cleanOperatingDays
          : undefined,
      availableFrom: availableFrom.trim() || undefined,
      availableTo: availableTo.trim() || undefined,
    };
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDesc.trim() || publishing) return;
    setPublishing(true);

    const activeDrafts = optionDrafts.filter((o) => o.title.trim());
    const activeStops = itineraryDrafts.filter((s) => s.title.trim());
    const activeFacts = historicalFactDrafts.filter((f) => f.title.trim() || f.fact.trim());
    const activeCaptions = uploadedImages
      .map((_, idx) => (galleryCaptions[idx] || '').trim())
      .filter(Boolean);

    let translated: {
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
    } | null = null;

    const rawHighlights = splitLines(highlightsText);
    const rawIncluded = splitLines(includedText);
    const rawTips = splitLines(tipsText);
    const rawNotSuit = splitLines(notSuitableText);
    const rawBring = splitLines(whatToBringText);
    const rawNotAllowed = splitLines(notAllowedText);
    const rawKnow = splitLines(knowBeforeText);

    try {
      const res = await authFetch('/api/trips/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          duration: duration.trim() || '4 hours',
          pickup: pickup.trim() || 'All Hurghada hotels',
          shortDescription: shortDesc.trim(),
          fullDescription: fullDesc.trim() || undefined,
          itinerary:
            activeStops.length > 0
              ? activeStops.map((s) => ({
                  title: s.title.trim(),
                  subtitle: s.subtitle.trim(),
                  durationOrTime: s.durationOrTime.trim(),
                }))
              : undefined,
          historicalFacts:
            activeFacts.length > 0
              ? activeFacts.map((f) => ({
                  era: f.era.trim(),
                  metric: f.metric.trim(),
                  title: f.title.trim(),
                  fact: f.fact.trim(),
                }))
              : undefined,
          galleryCaptions: activeCaptions.length > 0 ? activeCaptions : undefined,
          highlights:
            rawHighlights.length > 0
              ? rawHighlights
              : [`Operated directly by ${activeSupplierName}`],
          included:
            rawIncluded.length > 0 ? rawIncluded : ['Hotel pickup & vetted local guide'],
          tips: rawTips.length > 0 ? rawTips : undefined,
          notSuitableFor: rawNotSuit.length > 0 ? rawNotSuit : undefined,
          whatToBring: rawBring.length > 0 ? rawBring : undefined,
          notAllowed: rawNotAllowed.length > 0 ? rawNotAllowed : undefined,
          knowBeforeYouGo: rawKnow.length > 0 ? rawKnow : undefined,
          options: activeDrafts.map((o) => ({
            title: o.title.trim(),
            detail: o.detail.trim() || 'Standard package inclusions',
          })),
        }),
      });
      if (res.ok) {
        translated = await res.json();
      }
    } catch {
      // Non-blocking fallback uses direct text in en/ar/de if AI translation is unavailable
    }

    const newTrip = buildDraftTripObject(translated);

    try {
      await onAddTrip(newTrip);
      setAddedBanner(
        isOwnerUser
          ? `Published “${newTrip.name.en}” in EN/AR/DE (${newTrip.options?.length || 1} option(s), ${newTrip.images.length} photo(s)).`
          : `Submitted “${newTrip.name.en}” with auto-translation (EN/AR/DE) for Owner Approval before going live.`
      );
      setTitle('');
      setShortDesc('');
      setFullDesc('');
      setHighlightsText('');
      setIncludedText('');
      setNotSuitableText('');
      setMeetingPoint('');
      setWhatToBringText('');
      setNotAllowedText('');
      setKnowBeforeText('');
      setUploadedImages([]);
      setGalleryCaptions([]);
      setItineraryDrafts(createDefaultSupplierItinerary());
      setHistoricalFactDrafts([]);
      setOperatingDays([0, 1, 2, 3, 4, 5, 6]);
      setAvailableFrom('');
      setAvailableTo('');
      setUploadNote('');
      setOptionDrafts([
        { id: `opt-${Date.now()}-1`, title: 'Standard Shared Group', detail: 'Hotel pickup + shared boat/van', price: 40 },
      ]);
      setShowAddForm(false);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#F8FAFC] text-[#0F2233]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 space-y-6">
        {/* Top Bar */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#475569]">Supplier Portal · Self-Service Partner Desk</div>
            <h1 className="text-xl font-semibold text-[#0F2233]">{activeSupplierName}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onToggleDarkMode && (
              <ThemeSwitch
                darkMode={darkMode}
                onToggle={onToggleDarkMode}
                size="sm"
                badgeLabel="Supplier Theme"
              />
            )}

            {!lockedSupplierName && (
              <label className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                <span>Switch supplier view:</span>
                <select
                  value={selectedSupplierName}
                  onChange={(e) => setSelectedSupplierName(e.target.value)}
                  className="min-h-[38px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F2233]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('listings');
                setShowAddForm((v) => !v);
              }}
              className="btn-wasla-primary min-h-[38px] gap-1.5 rounded-lg px-4 py-2 text-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add New Trip / Service</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="inline-flex rounded-lg bg-[#FAF4ED] border border-[#C8C2B8]/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`rounded-md px-4 py-2 text-xs font-semibold cursor-pointer ${
              activeTab === 'listings' ? 'bg-white text-[#0F2233] shadow-xs' : 'text-[#64748B]'
            }`}
          >
            My Trips & Services ({supplierTrips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`rounded-md px-4 py-2 text-xs font-semibold cursor-pointer ${
              activeTab === 'bookings' ? 'bg-white text-[#0F2233] shadow-xs' : 'text-[#64748B]'
            }`}
          >
            Confirmed Dispatches ({supplierBookings.length})
          </button>
        </div>

        {addedBanner && (
          <div className="rounded-xl border border-[#EE5426]/30 bg-white px-4 py-3 text-sm font-medium text-[#EE5426] flex items-center justify-between">
            <span>{addedBanner}</span>
            <button
              type="button"
              onClick={() => setAddedBanner('')}
              className="text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {showAddForm && activeTab === 'listings' && (
          <form
            onSubmit={handleCreateTrip}
            className="rounded-xl border border-[#EE5426]/30 bg-white p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#0F2233]">
                Submit New Listing (Auto-translated to EN / AR / DE ·{' '}
                {isOwnerUser ? 'Publishes immediately' : 'Sent for Owner Approval'})
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#EE5426]">
                <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Write in Arabic, English, or German</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="sm:col-span-2 block space-y-1">
                <span className="text-xs font-semibold text-[#0F2233]">Trip / Service Title</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Private Red Sea Glass-Bottom Reef Morning"
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F2233]">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategoryId)}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm"
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
                <span className="text-xs font-semibold text-[#0F2233]">Destination</span>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as DestinationRegion)}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm"
                >
                  <option value="Hurghada">Hurghada</option>
                  <option value="Marsa Alam">Marsa Alam</option>
                  <option value="Luxor">Luxor</option>
                  <option value="Cairo">Cairo</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F2233]">Whole-Euro Price (€)</span>
                <input
                  type="number"
                  min={5}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm tabular-nums"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F2233]">Duration</span>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F2233]">Pickup area</span>
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F2233]">Min Child Age</span>
                <input
                  type="number"
                  min={0}
                  value={minChildAge}
                  onChange={(e) => setMinChildAge(e.target.value)}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm tabular-nums"
                />
              </label>
            </div>

            <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/50 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0F2233]">
                  توقيت بداية الرحلة · Trip Start Time(s) (separate from Hotel Pickup)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '09:00 AM', val: '09:00 AM' },
                    { label: 'Morning & Sunset', val: '08:30 AM (Morning), 02:30 PM (Sunset)' },
                    { label: 'Morning & PM', val: '10:00 AM (Morning), 04:00 PM (Afternoon)' },
                    { label: '4 Daily Slots', val: '07:30 AM (Sunrise), 10:00 AM (Morning), 02:30 PM (Afternoon), 04:30 PM (Sunset)' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setDepartureTimesText(p.val)}
                      className="rounded-md border border-[#FED7AA] bg-white px-2 py-0.5 text-[11px] font-medium text-[#9A3412] hover:bg-[#FFEDD5] cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={category === 'transfers' ? 'According to flight time (Transfers)' : departureTimesText}
                disabled={category === 'transfers'}
                onChange={(e) => setDepartureTimesText(e.target.value)}
                placeholder="e.g. 09:00 AM or 08:30 AM (Morning), 02:30 PM (Sunset)"
                className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
              />
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Short description</span>
              <textarea
                rows={2}
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Describe boat capacity, stops, languages spoken, and what is included…"
                className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm"
              />
            </label>

            {/* Full Structured Itinerary & Guest Safety Information */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
              <div className="text-xs font-semibold text-[#0F2233]">
                Highlights, Full Description, Exclusions &amp; Safety Info (one item per line)
              </div>

              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Full description (shown with See more / See less)</span>
                <textarea
                  rows={3}
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  placeholder="Write the full experience story, stops, optional photoshoot details, and pace..."
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2.5 text-xs"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-[#475569]">Highlights (1 per line)</span>
                  <textarea
                    rows={3}
                    value={highlightsText}
                    onChange={(e) => setHighlightsText(e.target.value)}
                    placeholder="Guided experience along Red Sea&#10;Optional professional photoshoot"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-[#475569]">Includes (1 per line)</span>
                  <textarea
                    rows={3}
                    value={includedText}
                    onChange={(e) => setIncludedText(e.target.value)}
                    placeholder="Hotel pickup in Hurghada&#10;Bottled water&#10;Safety briefing"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-[#475569]">Tips / Not included (1 per line)</span>
                  <textarea
                    rows={3}
                    value={tipsText}
                    onChange={(e) => setTipsText(e.target.value)}
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
                    placeholder="Children under 5&#10;Pregnant women"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-[#475569]">What to bring</span>
                  <textarea
                    rows={2}
                    value={whatToBringText}
                    onChange={(e) => setWhatToBringText(e.target.value)}
                    placeholder="Hat&#10;Camera&#10;Sunscreen"
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
                    placeholder="Beginner friendly&#10;Comfortable clothing"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white p-2 text-xs"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-[#475569]">Meeting point label</span>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  placeholder="e.g. Hurghada Marina Gate 2 or Hotel Reception"
                  className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs"
                />
              </label>
            </div>

            {/* Full-Page Route Itinerary Builder */}
            <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#0F2233]">
                    Full-Page Route Itinerary (مسار الرحلة خطوة بخطوة)
                  </span>
                  <p className="text-[11px] text-[#475569]">
                    Displayed beside Full Description in the full trip page timeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setItineraryDrafts((prev) => [
                      ...prev,
                      { id: `sup-stop-${Date.now()}`, kind: 'stop', title: '', subtitle: '', durationOrTime: '' },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#EE5426] bg-white px-2.5 py-1 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Itinerary Stop</span>
                </button>
              </div>
              <div className="space-y-2">
                {itineraryDrafts.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg border border-[#CBD5E1] bg-white p-2.5"
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
                      className="sm:col-span-2 min-h-[36px] rounded-md border border-[#E2E8F0] bg-white px-2 text-xs font-semibold"
                    >
                      <option value="pickup">Pickup</option>
                      <option value="stop">Main Stop</option>
                      <option value="break">Break / Lunch</option>
                      <option value="end">Return / End</option>
                    </select>
                    <input
                      type="text"
                      value={stop.title}
                      onChange={(e) =>
                        setItineraryDrafts((prev) =>
                          prev.map((s) => (s.id === stop.id ? { ...s, title: e.target.value } : s))
                        )
                      }
                      placeholder={`Stop ${idx + 1} title`}
                      className="sm:col-span-4 min-h-[36px] rounded-md border border-[#E2E8F0] px-2.5 text-xs"
                    />
                    <input
                      type="text"
                      value={stop.subtitle}
                      onChange={(e) =>
                        setItineraryDrafts((prev) =>
                          prev.map((s) => (s.id === stop.id ? { ...s, subtitle: e.target.value } : s))
                        )
                      }
                      placeholder="Activity / subtitle"
                      className="sm:col-span-3 min-h-[36px] rounded-md border border-[#E2E8F0] px-2.5 text-xs"
                    />
                    <input
                      type="text"
                      value={stop.durationOrTime}
                      onChange={(e) =>
                        setItineraryDrafts((prev) =>
                          prev.map((s) => (s.id === stop.id ? { ...s, durationOrTime: e.target.value } : s))
                        )
                      }
                      placeholder="Duration / time"
                      className="sm:col-span-2 min-h-[36px] rounded-md border border-[#E2E8F0] px-2.5 text-xs"
                    />
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setItineraryDrafts((prev) => prev.filter((s) => s.id !== stop.id))
                        }
                        aria-label={`Remove stop ${idx + 1}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical / Cultural Facts Builder (Optional) */}
            <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#0F2233]">
                    Historical Facts & Cultural Context (حقائق تاريخية للرحلة - اختياري)
                  </span>
                  <p className="text-[11px] text-[#475569]">
                    Optional heritage cards for cultural, Luxor, Cairo, or historical excursions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setHistoricalFactDrafts((prev) => [
                      ...prev,
                      { id: `sup-fact-${Date.now()}`, era: '', metric: '', title: '', fact: '' },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#EE5426] bg-white px-2.5 py-1 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Historical Fact</span>
                </button>
              </div>
              {historicalFactDrafts.length > 0 && (
                <div className="space-y-2.5">
                  {historicalFactDrafts.map((fact, idx) => (
                    <div
                      key={fact.id}
                      className="rounded-lg border border-[#CBD5E1] bg-white p-3 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={fact.era}
                          onChange={(e) =>
                            setHistoricalFactDrafts((prev) =>
                              prev.map((f) => (f.id === fact.id ? { ...f, era: e.target.value } : f))
                            )
                          }
                          placeholder="Era (e.g. New Kingdom)"
                          className="sm:col-span-3 min-h-[34px] rounded border border-[#E2E8F0] px-2.5 text-xs"
                        />
                        <input
                          type="text"
                          value={fact.metric}
                          onChange={(e) =>
                            setHistoricalFactDrafts((prev) =>
                              prev.map((f) => (f.id === fact.id ? { ...f, metric: e.target.value } : f))
                            )
                          }
                          placeholder="Metric (e.g. 134 Columns)"
                          className="sm:col-span-3 min-h-[34px] rounded border border-[#E2E8F0] px-2.5 text-xs"
                        />
                        <input
                          type="text"
                          value={fact.title}
                          onChange={(e) =>
                            setHistoricalFactDrafts((prev) =>
                              prev.map((f) => (f.id === fact.id ? { ...f, title: e.target.value } : f))
                            )
                          }
                          placeholder={`Fact ${idx + 1} heading`}
                          className="sm:col-span-5 min-h-[34px] rounded border border-[#E2E8F0] px-2.5 text-xs font-medium"
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
                        value={fact.fact}
                        onChange={(e) =>
                          setHistoricalFactDrafts((prev) =>
                            prev.map((f) => (f.id === fact.id ? { ...f, fact: e.target.value } : f))
                          )
                        }
                        placeholder="Concise historical detail..."
                        className="w-full rounded border border-[#E2E8F0] p-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operating Days & Date Availability */}
            <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0F2233]">
                  Operating Days & Date Range Availability (أيام التشغيل)
                </span>
                <span className="text-[11px] text-[#475569]">
                  Powers date-range filtering on storefront
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {SUPPLIER_WEEKDAY_OPTIONS.map((opt) => {
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

            {/* Supplier Photo Uploader */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                  <span className="text-xs font-semibold text-[#0F2233]">
                    Trip Photos & Gallery Captions (Upload up to 8 high-quality photos · Auto-optimized)
                  </span>
                </div>
                <span className="text-[11px] text-[#475569]">
                  First photo becomes the main storefront cover
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
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
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-dashed border-[#EE5426] bg-white px-4 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] cursor-pointer"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>Upload Photos from Device</span>
                </button>

                <div className="flex flex-1 gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste https:// photo URL (e.g. Unsplash / CDN)..."
                    className="min-h-[40px] flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="min-h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {uploadNote && (
                <p className="text-[11px] font-medium text-[#EE5426]">{uploadNote}</p>
              )}

              {uploadedImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {uploadedImages.map((imgSrc, idx) => (
                    <div
                      key={`${idx}-${imgSrc.slice(0, 24)}`}
                      className="group relative rounded-lg border border-[#CBD5E1] bg-white overflow-hidden"
                    >
                      <div className="wasla-img-glare h-24 w-full overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={`Upload ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-1.5 border-t border-[#E2E8F0]">
                        <input
                          type="text"
                          value={galleryCaptions[idx] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGalleryCaptions((prev) =>
                              uploadedImages.map((_, i) => (i === idx ? val : prev[i] || ''))
                            );
                          }}
                          placeholder={`Photo ${idx + 1} caption`}
                          className="w-full rounded border border-[#E2E8F0] px-2 py-1 text-[11px]"
                        />
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 text-[10px] border-t border-[#E2E8F0]">
                        {idx === 0 ? (
                          <span className="font-semibold text-[#EE5426]">Cover Photo</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImages((prev) => [
                                imgSrc,
                                ...prev.filter((_, i) => i !== idx),
                              ]);
                              setGalleryCaptions((prev) => [
                                prev[idx] || '',
                                ...prev.filter((_, i) => i !== idx),
                              ]);
                            }}
                            className="font-medium text-[#475569] hover:text-[#EE5426] cursor-pointer"
                          >
                            Set as cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
                            setGalleryCaptions((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-[#B91C1C] hover:text-[#991B1B] cursor-pointer"
                          aria-label={`Remove photo ${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-medium text-[#475569]">
                    Or quick-pick from verified Wasla starter gallery:
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {starterGallery.map((imgSrc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setUploadedImages([imgSrc]);
                          setGalleryCaptions(['']);
                        }}
                        className="wasla-img-glare shrink-0 rounded-lg border border-[#CBD5E1] overflow-hidden hover:border-[#EE5426] cursor-pointer"
                        title="Use this starter photo"
                      >
                        <img
                          src={imgSrc}
                          alt={`Starter option ${idx + 1}`}
                          className="h-12 w-16 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trip Options Builder (Fixed Trip Name, Flexible Options) */}
            <div className="rounded-xl border border-[#EE5426]/25 bg-[#FFF7ED]/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#0F2233]">
                    Trip Options & Pricing Variants (أوبشن الرحلة)
                  </span>
                  <p className="text-[11px] text-[#475569]">
                    Keep one fixed Trip Title above and add options inside it (e.g. Shared Boat, VIP Lunch, Private).
                    The lowest option price automatically sets the &ldquo;from €&rdquo; price.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOptionDrafts((prev) => [
                      ...prev,
                      { id: `opt-${Date.now()}`, title: '', detail: '', price: 50 },
                    ])
                  }
                  className="self-start sm:self-auto inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#EE5426] bg-white px-3 text-xs font-semibold text-[#EE5426] hover:bg-[#FFF7ED] cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {optionDrafts.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg border border-[#CBD5E1] bg-white p-2.5"
                  >
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={opt.title}
                        onChange={(e) =>
                          setOptionDrafts((prev) =>
                            prev.map((item) =>
                              item.id === opt.id ? { ...item, title: e.target.value } : item
                            )
                          )
                        }
                        placeholder={`Option ${idx + 1} name (e.g. VIP Yacht)`}
                        className="min-h-[36px] w-full rounded-md border border-[#E2E8F0] px-2.5 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={opt.detail}
                        onChange={(e) =>
                          setOptionDrafts((prev) =>
                            prev.map((item) =>
                              item.id === opt.id ? { ...item, detail: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Included extras (e.g. Lunch + private transfer)"
                        className="min-h-[36px] w-full rounded-md border border-[#E2E8F0] px-2.5 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min={5}
                        value={opt.price}
                        onChange={(e) =>
                          setOptionDrafts((prev) =>
                            prev.map((item) =>
                              item.id === opt.id ? { ...item, price: Number(e.target.value) } : item
                            )
                          )
                        }
                        aria-label={`Option ${idx + 1} price`}
                        className="min-h-[36px] w-full rounded-md border border-[#E2E8F0] px-2.5 text-xs font-semibold tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      {optionDrafts.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setOptionDrafts((prev) => prev.filter((item) => item.id !== opt.id))
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                          aria-label={`Remove option ${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#0F2233]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={familyFriendly}
                    onChange={(e) => setFamilyFriendly(e.target.checked)}
                  />
                  <span>Family friendly</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={womenFriendly}
                    onChange={(e) => setWomenFriendly(e.target.checked)}
                  />
                  <span>Women friendly</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
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
                  onClick={() => setPreviewTripDraft(buildDraftTripObject())}
                  className="inline-flex items-center gap-1.5 min-h-[40px] rounded-lg border border-[#EE5426] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#EE5426] hover:bg-[#FFEDD5] cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Preview Full Trip Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="min-h-[40px] rounded-lg border border-[#E2E8F0] px-4 text-xs font-semibold text-[#475569] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="btn-wasla-primary min-h-[40px] rounded-lg px-5 py-2 text-xs cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {publishing
                      ? 'Auto-translating (EN/AR/DE) & Saving...'
                      : isOwnerUser
                      ? 'Auto-Translate & Publish Live'
                      : 'Auto-Translate & Submit for Owner Approval'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplierTrips.map((tr) => (
              <div
                key={tr.id}
                onClick={() => setEditingTrip(tr)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setEditingTrip(tr);
                  }
                }}
                className="card-wasla p-0 group overflow-hidden flex flex-col justify-between cursor-pointer hover:border-[#EE5426] transition-all text-start"
                title="اضغط لفتح تعديل هذه الرحلة مباشرة"
              >
                <div className="flex gap-4 p-4">
                  <div className="wasla-img-glare h-20 w-24 rounded-lg overflow-hidden shrink-0 border border-[#E2E8F0]">
                    <img
                      src={tr.images[0] || trips[0]?.images[0]}
                      alt={tr.name.en}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-[#475569]">
                      {tr.destination} · {tr.category}
                    </div>
                    <h3 className="text-sm font-semibold text-[#0F2233] group-hover:text-[#EE5426] line-clamp-2 transition-colors">
                      {tr.name.en}
                    </h3>
                    <div className="text-xs text-[#475569] tabular-nums">
                      {tr.duration.en} · <span className="font-medium text-[#EE5426]">{formatTripScheduleSummary(tr, 'en', true)}</span> ·{' '}
                      <strong className="text-[#0F2233]">€{tr.price}</strong>
                      {tr.options && tr.options.length > 0 && (
                        <span> · {tr.options.length} options</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#F1F5F9] px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-[#475569]">
                  {tr.approvalStatus === 'Pending' ? (
                    <span className="inline-flex items-center gap-1 text-[#B45309] font-medium">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Pending Owner Approval
                    </span>
                  ) : tr.approvalStatus === 'Paused' || tr.approvalStatus === 'Rejected' ? (
                    <span className="inline-flex items-center gap-1 text-[#B91C1C] font-medium">
                      {tr.approvalStatus}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#15803D] font-medium">
                      <Ship className="h-3.5 w-3.5" aria-hidden="true" /> Live on marketplace
                    </span>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="tabular-nums">★ {tr.rating.toFixed(1)}</span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[11px] font-semibold text-[#D9461B] group-hover:bg-[#EE5426] group-hover:text-white transition-colors">
                      <Pencil className="h-3 w-3" aria-hidden="true" />
                      <span>تعديل · Edit</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card-wasla p-0 overflow-hidden">
            {supplierBookings.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#64748B]">
                No bookings assigned to {activeSupplierName} yet.
              </div>
            ) : (
              <div className="divide-y divide-[#C8C2B8]/40">
                {supplierBookings.map((b) => {
                  const matchedTrip = findEditableTripForBooking(b);
                  return (
                    <div
                      key={b.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-semibold text-[#EE5426]">{b.id}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              getBookingUrgency(b).isUrgent
                                ? 'font-bold text-[#EF4444]'
                                : 'text-[#64748B]'
                            }
                          >
                            {getBookingUrgency(b).label}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums font-medium">
                            {b.date}
                            {b.tripStartTime ? ` · Start: ${b.tripStartTime}` : ''} · Pickup: {b.pickupTime || 'TBD'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#0F2233]">{b.status}</span>
                        </div>
                        {matchedTrip ? (
                          <button
                            type="button"
                            onClick={() => setEditingTrip(matchedTrip)}
                            className="inline-flex flex-wrap items-center gap-2 text-start text-sm font-semibold text-[#0F2233] hover:text-[#EE5426] cursor-pointer group"
                            title="اضغط لفتح تعديل هذه الرحلة مباشرة"
                          >
                            <span className="group-hover:underline">{b.tripTitle}</span>
                            <span className="inline-flex items-center gap-1 rounded-md border border-[#EE5426]/30 bg-[#FAF4ED] px-2 py-0.5 text-[11px] font-semibold text-[#D9461B] group-hover:bg-[#EE5426] group-hover:text-white transition-colors">
                              <Pencil className="h-3 w-3" aria-hidden="true" />
                              <span>تعديل الرحلة</span>
                            </span>
                          </button>
                        ) : (
                          <p className="text-sm font-semibold text-[#0F2233]">{b.tripTitle}</p>
                        )}
                        <p className="text-xs text-[#64748B]">
                          {b.guestName} ({b.adults}A{b.children > 0 ? `+${b.children}C` : ''}{(b.infants ?? 0) > 0 ? `+${b.infants}INF` : ''}) · {b.hotel}
                          {b.roomNumber ? ` · Room ${b.roomNumber}` : ''}
                          {b.pickupSpot ? ` · ${b.pickupSpot}` : ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B]">
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-[#EE5426]" aria-hidden="true" />
                            Guest contact &amp; payments are handled centrally by Wasla Operations.
                          </span>
                        </div>
                        {b.supplierNotes && (
                          <p className="text-xs text-[#EE5426]">Dispatch Note: {b.supplierNotes}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {(() => {
                          const currentDriver = driverDrafts[b.id] ?? b.assignedDriverOrGuide ?? '';
                          const isCompleted = b.status === 'Completed';
                          const trimmedDriver = currentDriver.trim();
                          const hasDriverChanged = trimmedDriver !== (b.assignedDriverOrGuide || '').trim();
                          const canMarkAssigned = b.status === 'Confirmed' && trimmedDriver.length >= 2;
                          return (
                            <>
                              <input
                                type="text"
                                value={currentDriver}
                                disabled={isCompleted}
                                onChange={(e) =>
                                  setDriverDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))
                                }
                                placeholder="Driver / boat / guide…"
                                className="min-h-[38px] rounded-lg border border-[#C8C2B8] px-3 text-xs disabled:bg-[#FAF4ED] disabled:text-[#64748B]"
                              />
                              {!isCompleted && (canMarkAssigned || (b.status === 'Driver assigned' && hasDriverChanged && trimmedDriver.length >= 2)) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateBooking(b.id, {
                                      assignedDriverOrGuide: trimmedDriver,
                                      status: 'Driver assigned',
                                    });
                                    setDriverDrafts((prev) => {
                                      const next = { ...prev };
                                      delete next[b.id];
                                      return next;
                                    });
                                  }}
                                  className="btn-wasla-primary min-h-[38px] gap-1.5 rounded-lg px-3.5 py-2 text-xs cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>
                                    {b.status === 'Driver assigned' ? 'Update Driver' : 'Assign Driver'}
                                  </span>
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <TripDetailModal
        trip={previewTripDraft}
        previewMode
        lang="en"
        t={I18N.en}
        onClose={() => setPreviewTripDraft(null)}
        onSubmitBooking={() => {}}
      />

      {editingTrip && (
        <OwnerTripEditorModal
          initialTrip={editingTrip}
          mode="edit"
          isSupplierMode={!isOwnerUser}
          allTrips={trips}
          suppliers={suppliers}
          onClose={() => setEditingTrip(null)}
          onSaveTrip={async (updatedTrip) => {
            if (onUpdateTrip) {
              await onUpdateTrip(updatedTrip);
            }
            setAddedBanner(
              isOwnerUser
                ? `تم حفظ تعديلات رحلة «${updatedTrip.name.en}» ونشرها مباشرة.`
                : `تم حفظ تعديلات رحلة «${updatedTrip.name.en}» وإرسالها لمراجعة الأونر.`
            );
          }}
        />
      )}
    </div>
  );
};
