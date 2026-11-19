import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Image as ImageIcon, Palette, RotateCcw, Save, Sparkles, Type, Upload } from 'lucide-react';
import { SITE_CONFIG, Trip } from '../../data/marketplaceData';
import {
  HeroFontStyle,
  HeroThemeStyle,
  PublicStorefrontSettings,
} from '../../hooks/useWaslaFirebase';

interface OwnerHeroStudioProps {
  trips: Trip[];
  publicSettings?: PublicStorefrontSettings;
  onSavePublicSettings?: (patch: Partial<PublicStorefrontSettings>) => Promise<void> | void;
}

const FONT_OPTIONS: Array<{
  id: HeroFontStyle;
  label: string;
  vibe: string;
  fontClass: string;
}> = [
  { id: 'editorial', label: 'Editorial (Fraunces)', vibe: 'Magazine Serif', fontClass: 'font-hero-editorial' },
  { id: 'luxury', label: 'Royal Serif (Playfair)', vibe: 'Boutique Heritage', fontClass: 'font-hero-luxury' },
  { id: 'modern', label: 'Modern (Jakarta + Cairo)', vibe: 'Contemporary Sans', fontClass: 'font-hero-modern' },
  { id: 'bold', label: 'Coastal Bold (Outfit)', vibe: 'Resort Display', fontClass: 'font-hero-bold' },
  { id: 'architectural', label: 'Executive (Manrope)', vibe: 'Balanced Crisp', fontClass: 'font-hero-architectural' },
  { id: 'clean', label: 'Minimal (DM Sans)', vibe: 'Clean Geometric', fontClass: 'font-hero-clean' },
];

const THEME_PREVIEWS: Record<
  HeroThemeStyle,
  { label: string; bg: string; overlay: string; accent: string; swatch: string; accentHex: string }
> = {
  'red-sea': {
    label: 'Red Sea Sunset Orange',
    bg: 'bg-[#431407]',
    overlay: 'from-[#2A0E05]/75 via-[#7C2D12]/42 to-[#2A0E05]/82',
    accent: 'text-[#FDBA74]',
    swatch: '#7C2D12',
    accentHex: '#FDBA74',
  },
  midnight: {
    label: 'Warm Amber Night',
    bg: 'bg-[#1C1008]',
    overlay: 'from-[#120A05]/80 via-[#29170C]/55 to-[#1C1008]/85',
    accent: 'text-[#FDBA74]',
    swatch: '#1C1008',
    accentHex: '#FDBA74',
  },
  'golden-dusk': {
    label: 'Golden Red Sea Dusk',
    bg: 'bg-[#452711]',
    overlay: 'from-[#2A1608]/75 via-[#683C19]/45 to-[#2A1608]/80',
    accent: 'text-[#FDE68A]',
    swatch: '#683C19',
    accentHex: '#FDE68A',
  },
  minimal: {
    label: 'Minimal Crisp Daylight',
    bg: 'bg-[#1C1917]',
    overlay: 'from-[#1C1917]/60 via-[#1C1917]/30 to-[#1C1917]/65',
    accent: 'text-[#FED7AA]',
    swatch: '#334155',
    accentHex: '#FED7AA',
  },
  'deep-turquoise': {
    label: 'Hurghada Deep Lagoon',
    bg: 'bg-[#042F2E]',
    overlay: 'from-[#022C22]/80 via-[#0F766E]/45 to-[#042F2E]/85',
    accent: 'text-[#5EEAD4]',
    swatch: '#0F766E',
    accentHex: '#5EEAD4',
  },
  'coral-horizon': {
    label: 'Coral Reef Horizon',
    bg: 'bg-[#4C0519]',
    overlay: 'from-[#3B0714]/78 via-[#9F1239]/42 to-[#7C2D12]/82',
    accent: 'text-[#FDA4AF]',
    swatch: '#9F1239',
    accentHex: '#FDA4AF',
  },
  'desert-amber': {
    label: 'Sahara Desert Bronze',
    bg: 'bg-[#29160B]',
    overlay: 'from-[#1C0F06]/78 via-[#78350F]/45 to-[#451A03]/84',
    accent: 'text-[#FCD34D]',
    swatch: '#78350F',
    accentHex: '#FCD34D',
  },
  'obsidian-gold': {
    label: 'Obsidian & Gold Luxury',
    bg: 'bg-[#090D16]',
    overlay: 'from-[#05080F]/84 via-[#111827]/58 to-[#090D16]/88',
    accent: 'text-[#FDE047]',
    swatch: '#090D16',
    accentHex: '#FDE047',
  },
};

const HERO_STYLE_PROFILES: Array<{
  id: string;
  name: string;
  desc: string;
  font: HeroFontStyle;
  theme: HeroThemeStyle;
}> = [
  {
    id: 'wasla-classic',
    name: 'Wasla Red Sea Classic',
    desc: 'Warm sunset gradient + editorial serif',
    font: 'editorial',
    theme: 'red-sea',
  },
  {
    id: 'el-gouna-lagoon',
    name: 'El Gouna Lagoon',
    desc: 'Turquoise Red Sea veil + bold display',
    font: 'bold',
    theme: 'deep-turquoise',
  },
  {
    id: 'luxor-royal',
    name: 'Luxor Royal Heritage',
    desc: 'Obsidian & gold + classic luxury serif',
    font: 'luxury',
    theme: 'obsidian-gold',
  },
  {
    id: 'sahara-safari',
    name: 'Sahara Safari Dusk',
    desc: 'Desert bronze + modern bilingual sans',
    font: 'modern',
    theme: 'desert-amber',
  },
  {
    id: 'coral-sunset',
    name: 'Coral Reef Sunset',
    desc: 'Coral horizon tint + executive sans',
    font: 'architectural',
    theme: 'coral-horizon',
  },
  {
    id: 'swiss-minimal',
    name: 'Crystal Daylight',
    desc: 'Clean light veil + geometric sans',
    font: 'clean',
    theme: 'minimal',
  },
];

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
  const [heroFontStyle, setHeroFontStyle] = useState<HeroFontStyle>(
    publicSettings?.heroFontStyle || 'editorial'
  );
  const [heroTheme, setHeroTheme] = useState<HeroThemeStyle>(
    publicSettings?.heroTheme || 'red-sea'
  );
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
    setHeroFontStyle(publicSettings.heroFontStyle || 'editorial');
    setHeroTheme(publicSettings.heroTheme || 'red-sea');
  }, [publicSettings]);

  const galleryPresets = useMemo(() => {
    const imgs = [
      SITE_CONFIG.heroBackground,
      ...Array.from(new Set(trips.flatMap((t) => t.images).filter(Boolean))),
    ];
    return Array.from(new Set(imgs)).slice(0, 6);
  }, [trips]);

  const handleUploadHeroFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadNote('Compressing panorama for instant page loads...');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
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
          [1100, 0.72],
          [900, 0.58],
          [720, 0.48],
        ] as Array<[number, number]>) {
          encoded = tryEncode(w, q);
          if (encoded && encoded.length <= 225000) break;
        }
        if (encoded && encoded.length <= 245000) {
          setHeroImageUrl(encoded);
          setUploadNote('Panorama uploaded and ready! Click "Save Hero & Appearance Live" to publish.');
        } else {
          setUploadNote('Image too large — please try a lighter JPG or paste an https:// URL.');
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
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
        heroFontStyle,
        heroTheme,
      });
      setSavedBanner('Hero panorama, caption, font & theme published live to customer storefront!');
    } finally {
      setSaving(false);
    }
  };

  const activeThemeCfg = THEME_PREVIEWS[heroTheme] || THEME_PREVIEWS['red-sea'];
  const fontClass =
    FONT_OPTIONS.find((opt) => opt.id === heroFontStyle)?.fontClass || 'font-hero-editorial';

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Live Visual Mini-Preview */}
      <div className={`wasla-hero-glare relative overflow-hidden rounded-2xl ${activeThemeCfg.bg} text-white border border-[#E2E8F0]`}>
        <img
          src={heroImageUrl.trim() || SITE_CONFIG.heroBackground}
          alt="Hero Panorama Preview"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${activeThemeCfg.overlay}`} />
        <div className="relative z-10 p-6 sm:p-8 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
            Live Customer Storefront Preview ({heroFontStyle} · {activeThemeCfg.label})
          </div>
          <h2 className={`${fontClass} text-2xl sm:text-3xl font-semibold text-white`}>
            {heroCaptionEn.trim() || (
              <>
                Small-group days, <em className={`font-normal italic ${activeThemeCfg.accent}`}>booked without the guesswork.</em>
              </>
            )}
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm text-[#E2EFF0]">
            {heroSubEn.trim() ||
              'Wasla Travel connects you directly with vetted local tourism providers across the Red Sea and Nile.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Panorama Photo Picker */}
        <div className="lg:col-span-6 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <ImageIcon className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
              <span>1. Hero Panorama Image</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setHeroImageUrl('');
                setUploadNote('Reset to default Hurghada coastline panorama.');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#0F172A] cursor-pointer"
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
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-dashed border-[#EA580C] bg-[#FFF7ED]/60 px-4 text-xs font-semibold text-[#EA580C] hover:bg-[#FFEDD5] cursor-pointer whitespace-nowrap"
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

          {uploadNote && <p className="text-xs font-medium text-[#EA580C]">{uploadNote}</p>}

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
                    heroImageUrl === src ? 'border-[#EA580C] ring-2 ring-[#EA580C]/30' : 'border-[#CBD5E1]'
                  }`}
                >
                  <img src={src} alt={`Preset ${i + 1}`} className="h-12 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Profiles, Font + Overlay Theme */}
        <div className="lg:col-span-6 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <Type className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
              <span>2. Hero Typography &amp; Background Overlay</span>
            </div>
            <span className="text-[11px] font-medium text-[#64748B]">
              Pick a quick profile or customize font &amp; color below
            </span>
          </div>

          {/* Ready-made 1-Click Style Profiles */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
              <Sparkles className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
              <span>Ready Style Profiles (1-Click Font + Theme)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {HERO_STYLE_PROFILES.map((profile) => {
                const isProfileActive =
                  heroFontStyle === profile.font && heroTheme === profile.theme;
                const themeCfg = THEME_PREVIEWS[profile.theme];
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setHeroFontStyle(profile.font);
                      setHeroTheme(profile.theme);
                    }}
                    className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-start transition-all cursor-pointer ${
                      isProfileActive
                        ? 'border-[#EA580C] bg-[#FFF7ED] ring-1 ring-[#EA580C]/30'
                        : 'border-[#E2E8F0] bg-white hover:border-[#FDBA74]'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 border border-white/40 shadow-xs"
                          style={{
                            background: `linear-gradient(135deg, ${themeCfg.swatch} 55%, ${themeCfg.accentHex} 100%)`,
                          }}
                        />
                        <span
                          className={`text-xs font-semibold truncate ${
                            isProfileActive ? 'text-[#EA580C]' : 'text-[#0F172A]'
                          }`}
                        >
                          {profile.name}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#64748B] truncate">{profile.desc}</p>
                    </div>
                    {isProfileActive && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#EA580C] mt-0.5" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Headline Font Families */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#0F172A]">
              Headline Font Family ({FONT_OPTIONS.length} styles)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setHeroFontStyle(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-start transition-colors cursor-pointer ${
                    heroFontStyle === opt.id
                      ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className={`${opt.fontClass} text-xs font-semibold truncate`}>
                    {opt.label}
                  </div>
                  <div className="text-[10.5px] opacity-75 truncate">{opt.vibe}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 8 Backdrop Color & Overlay Tints */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
              <Palette className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
              <span>Backdrop Color &amp; Overlay Tint ({Object.keys(THEME_PREVIEWS).length} themes)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(THEME_PREVIEWS) as HeroThemeStyle[]).map((key) => {
                const cfg = THEME_PREVIEWS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setHeroTheme(key)}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      heroTheme === key
                        ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]'
                        : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                        style={{
                          background: `linear-gradient(135deg, ${cfg.swatch} 55%, ${cfg.accentHex} 100%)`,
                        }}
                      />
                      <span className="truncate">{cfg.label}</span>
                    </span>
                    {heroTheme === key && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#EA580C]" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Captions & Subtitles EN / AR / DE */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#0F172A]">
            3. Hero Caption &amp; Subtitle (Leave empty to keep built-in Wasla defaults)
          </h3>
          {savedBanner && (
            <span className="text-xs font-semibold text-[#15803D]">{savedBanner}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F172A]">Headline (English)</span>
              <input
                type="text"
                value={heroCaptionEn}
                onChange={(e) => setHeroCaptionEn(e.target.value)}
                placeholder="Small-group days, booked without the guesswork."
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F172A]">Subtitle (English)</span>
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
              <span className="text-xs font-semibold text-[#0F172A]">العنوان الرئيسي (Arabic)</span>
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
              <span className="text-xs font-semibold text-[#0F172A]">النص التوضيحي (Arabic)</span>
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
              <span className="text-xs font-semibold text-[#0F172A]">Titel (Deutsch)</span>
              <input
                type="text"
                value={heroCaptionDe}
                onChange={(e) => setHeroCaptionDe(e.target.value)}
                placeholder="Ausflüge in kleinen Gruppen, direkt & zuverlässig gebucht."
                className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#0F172A]">Untertitel (Deutsch)</span>
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
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#EA580C] px-5 text-xs font-semibold text-white hover:bg-[#C2410C] disabled:opacity-60 cursor-pointer"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>{saving ? 'Saving Live...' : 'Save Hero & Appearance Live'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
