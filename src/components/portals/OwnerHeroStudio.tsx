import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Image as ImageIcon, RotateCcw, Save, Upload } from 'lucide-react';
import { SITE_CONFIG, Trip } from '../../data/marketplaceData';
import { PublicStorefrontSettings } from '../../hooks/useWaslaFirebase';
import { optimizeImageToWebP } from '../../lib/imageOptimization';

interface OwnerHeroStudioProps {
  trips: Trip[];
  publicSettings?: PublicStorefrontSettings;
  onSavePublicSettings?: (patch: Partial<PublicStorefrontSettings>) => Promise<void> | void;
}

type FocalPickerMode = 'desktop' | 'mobile';

export const OwnerHeroStudio: React.FC<OwnerHeroStudioProps> = ({
  trips,
  publicSettings,
  onSavePublicSettings,
}) => {
  const [heroImageUrl, setHeroImageUrl] = useState(publicSettings?.heroImageUrl || '');
  const [heroCaptionEn, setHeroCaptionEn] = useState(publicSettings?.heroCaptionEn || '');
  const [heroCaptionAr, setHeroCaptionAr] = useState(publicSettings?.heroCaptionAr || '');
  const [heroCaptionDe, setHeroCaptionDe] = useState(publicSettings?.heroCaptionDe || '');
  const [heroSubEn, setHeroSubEn] = useState(publicSettings?.heroSubEn || '');
  const [heroSubAr, setHeroSubAr] = useState(publicSettings?.heroSubAr || '');
  const [heroSubDe, setHeroSubDe] = useState(publicSettings?.heroSubDe || '');
  const [fxD, setFxD] = useState(publicSettings?.heroFocalXDesktop ?? 50);
  const [fyD, setFyD] = useState(publicSettings?.heroFocalYDesktop ?? 50);
  const [fxM, setFxM] = useState(publicSettings?.heroFocalXMobile ?? 50);
  const [fyM, setFyM] = useState(publicSettings?.heroFocalYMobile ?? 50);
  const [pickerMode, setPickerMode] = useState<FocalPickerMode>('desktop');
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!publicSettings) return;
    setHeroImageUrl(publicSettings.heroImageUrl || '');
    setHeroCaptionEn(publicSettings.heroCaptionEn || '');
    setHeroCaptionAr(publicSettings.heroCaptionAr || '');
    setHeroCaptionDe(publicSettings.heroCaptionDe || '');
    setHeroSubEn(publicSettings.heroSubEn || '');
    setHeroSubAr(publicSettings.heroSubAr || '');
    setHeroSubDe(publicSettings.heroSubDe || '');
    setFxD(publicSettings.heroFocalXDesktop ?? 50);
    setFyD(publicSettings.heroFocalYDesktop ?? 50);
    setFxM(publicSettings.heroFocalXMobile ?? 50);
    setFyM(publicSettings.heroFocalYMobile ?? 50);
  }, [publicSettings]);

  const galleryPresets = useMemo(() => {
    const imgs = [
      SITE_CONFIG.heroBackground,
      ...Array.from(new Set(trips.flatMap((t) => t.images).filter(Boolean))),
    ];
    return Array.from(new Set(imgs)).slice(0, 6);
  }, [trips]);

  const handleUploadHeroFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadNote('Resizing & converting panorama to lightweight WebP...');
    try {
      const encoded = await optimizeImageToWebP(file, 'hero');
      if (encoded && encoded.length <= 245000) {
        setHeroImageUrl(encoded);
        setUploadNote('WebP panorama uploaded and ready! Click "Save Hero & Appearance Live" to publish.');
      } else {
        setUploadNote('Image too large, please try a lighter photo or paste an https:// URL.');
      }
    } catch {
      setUploadNote('Could not process selected photo. Please try another image.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSavePublicSettings || saving) return;
    setSaving(true);
    setSavedBanner('');
    try {
      await onSavePublicSettings({
        heroImageUrl: heroImageUrl.trim(),
        heroCaptionEn: heroCaptionEn.trim(),
        heroCaptionAr: heroCaptionAr.trim(),
        heroCaptionDe: heroCaptionDe.trim(),
        heroSubEn: heroSubEn.trim(),
        heroSubAr: heroSubAr.trim(),
        heroSubDe: heroSubDe.trim(),
        heroFocalXDesktop: fxD,
        heroFocalYDesktop: fyD,
        heroFocalXMobile: fxM,
        heroFocalYMobile: fyM,
      });
      setSavedBanner('Hero photo, focal point & captions published live to customer storefront!');
    } finally {
      setSaving(false);
    }
  };

  const activeFx = pickerMode === 'desktop' ? fxD : fxM;
  const activeFy = pickerMode === 'desktop' ? fyD : fyM;

  const setActiveFx = (value: number) => {
    if (pickerMode === 'desktop') setFxD(value);
    else setFxM(value);
  };
  const setActiveFy = (value: number) => {
    if (pickerMode === 'desktop') setFyD(value);
    else setFyM(value);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = Math.min(100, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setActiveFx(x);
    setActiveFy(y);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Live Visual Mini-Preview, locked design; click to place the focal point */}
      <div
        className="relative overflow-hidden rounded-2xl bg-[#0F2233] text-white border border-[#E2E8F0] cursor-crosshair"
        onClick={handlePreviewClick}
        title="Click to set the focal point"
      >
        <img
          src={heroImageUrl.trim() || SITE_CONFIG.heroBackground}
          alt="Hero Panorama Preview"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `${activeFx}% ${activeFy}%` }}
        />
        <div className="absolute inset-0 wasla-hero-scrim" />
        <div
          className="pointer-events-none absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#F97316]/70 shadow"
          style={{ left: `${activeFx}%`, top: `${activeFy}%` }}
          aria-hidden="true"
        />
        <div className="relative z-10 p-6 sm:p-8 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
            Live Customer Storefront Preview
          </div>
          <h2 className="font-hero-standard text-2xl sm:text-3xl font-bold text-white">
            {heroCaptionEn.trim() || (
              <>
                Small-group days, <span className="text-[#F97316]">booked without the guesswork.</span>
              </>
            )}
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm text-white/90">
            {heroSubEn.trim() ||
              'Wasla Travel connects you directly with vetted local tourism providers across the Red Sea and Nile.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Panorama Photo Picker */}
        <div className="lg:col-span-6 card-wasla rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F2233]">
              <ImageIcon className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
              <span>1. Hero Panorama Image</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setHeroImageUrl('');
                setUploadNote('Reset to default Hurghada coastline panorama.');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#0F2233] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset default</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUploadHeroFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-dashed border-[#EE5426] bg-[#FFF7ED]/60 px-4 text-xs font-semibold text-[#EE5426] hover:bg-[#FFEDD5] cursor-pointer whitespace-nowrap"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Upload Panorama</span>
            </button>
            <input
              type="url"
              value={heroImageUrl.startsWith('data:') ? '' : heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="Or paste https:// wide landscape photo URL..."
              className="min-h-[40px] flex-1 rounded-lg border border-[#CBD5E1] px-3 text-xs"
            />
          </div>

          {uploadNote && <p className="text-xs font-medium text-[#EE5426]">{uploadNote}</p>}

          <div className="space-y-1.5">
            <span className="block text-[11px] font-medium text-[#475569]">
              Quick-pick from Wasla Red Sea & Nile panoramas:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {galleryPresets.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setHeroImageUrl(src);
                    setUploadNote('');
                  }}
                  className={`wasla-img-glare rounded-lg border overflow-hidden cursor-pointer ${
                    heroImageUrl === src ? 'border-[#EE5426] ring-2 ring-[#EE5426]/30' : 'border-[#CBD5E1]'
                  }`}
                >
                  <img src={src} alt={`Preset ${i + 1}`} className="h-12 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Photo Focal Point Picker */}
        <div className="lg:col-span-6 card-wasla rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F2233]">
              <Crosshair className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
              <span>2. Photo Focal Point (what stays visible)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFxD(50);
                setFyD(50);
                setFxM(50);
                setFyM(50);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#0F2233] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset focal point</span>
            </button>
          </div>

          {/* Desktop / Mobile mode toggle */}
          <div className="flex gap-2">
            {(
              [
                { id: 'desktop', label: 'Desktop' },
                { id: 'mobile', label: 'Mobile' },
              ] as Array<{ id: FocalPickerMode; label: string }>
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPickerMode(mode.id)}
                className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  pickerMode === mode.id
                    ? 'border-[#EE5426] bg-[#FFF7ED] text-[#EE5426]'
                    : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Horizontal / Vertical sliders for the active mode */}
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="flex items-center justify-between text-xs font-semibold text-[#0F2233]">
                <span>Horizontal (X)</span>
                <span className="tabular-nums text-[#64748B]">{activeFx}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={activeFx}
                onChange={(e) => setActiveFx(Number(e.target.value))}
                className="w-full accent-[#EE5426] cursor-pointer"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="flex items-center justify-between text-xs font-semibold text-[#0F2233]">
                <span>Vertical (Y)</span>
                <span className="tabular-nums text-[#64748B]">{activeFy}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={activeFy}
                onChange={(e) => setActiveFy(Number(e.target.value))}
                className="w-full accent-[#EE5426] cursor-pointer"
              />
            </label>
          </div>

          <p className="text-xs leading-relaxed text-[#64748B]">
            Click the preview photo above to place the focal point. Desktop and mobile crop
            differently, set each one.
          </p>
        </div>
      </div>

      {/* Captions & Subtitles EN / AR / DE */}
      <div className="card-wasla rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#0F2233]">
            3. Hero Caption &amp; Subtitle (Leave empty to keep built-in Wasla defaults)
          </h3>
          {savedBanner && (
            <span className="text-xs font-semibold text-[#15803D]">{savedBanner}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Headline (English)</span>
              <input
                type="text"
                value={heroCaptionEn}
                onChange={(e) => setHeroCaptionEn(e.target.value)}
                placeholder="Small-group days, booked without the guesswork."
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Subtitle (English)</span>
              <textarea
                rows={2}
                value={heroSubEn}
                onChange={(e) => setHeroSubEn(e.target.value)}
                placeholder="Wasla Travel connects you directly with vetted local tourism providers..."
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">العنوان الرئيسي (Arabic)</span>
              <input
                type="text"
                dir="rtl"
                value={heroCaptionAr}
                onChange={(e) => setHeroCaptionAr(e.target.value)}
                placeholder="رحلات مجموعات صغيرة، محجوزة بدون تخمين أو تعقيد."
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">النص التوضيحي (Arabic)</span>
              <textarea
                rows={2}
                dir="rtl"
                value={heroSubAr}
                onChange={(e) => setHeroSubAr(e.target.value)}
                placeholder="تربطك وصلة ترافل مباشرة بمقدمي السياحة المعتمدين في البحر الأحمر والنيل..."
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Titel (Deutsch)</span>
              <input
                type="text"
                value={heroCaptionDe}
                onChange={(e) => setHeroCaptionDe(e.target.value)}
                placeholder="Ausflüge in kleinen Gruppen, direkt & zuverlässig gebucht."
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F2233]">Untertitel (Deutsch)</span>
              <textarea
                rows={2}
                value={heroSubDe}
                onChange={(e) => setHeroSubDe(e.target.value)}
                placeholder="Wasla Travel verbindet Sie direkt mit geprüften lokalen Anbietern..."
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !onSavePublicSettings}
            className="btn-wasla-primary min-h-[42px] rounded-lg px-5 py-2 text-xs cursor-pointer"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>{saving ? 'Saving Live...' : 'Save Hero & Appearance Live'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
