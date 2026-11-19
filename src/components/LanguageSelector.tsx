import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Globe, Search, X } from 'lucide-react';
import { LANGUAGE_OPTIONS, Lang, LanguageOption, LanguageRegion } from '../data/i18n';

import { CURRENCY_OPTIONS, CurrencyCode } from '../data/marketplaceData';

interface LanguageSelectorProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
  variant?: 'header' | 'footer';
  currency?: CurrencyCode;
  onChangeCurrency?: (code: CurrencyCode) => void;
}

type RegionFilter = 'all' | LanguageRegion;

interface SwitcherCopy {
  heading: string;
  footerLabel: string;
  searchPlaceholder: string;
  noResults: string;
  clearSearch: string;
  regions: Record<RegionFilter, string>;
}

function getSwitcherCopy(lang: Lang): SwitcherCopy {
  if (lang === 'ar') {
    return {
      heading: 'اختر اللغة',
      footerLabel: 'اللغة والمنطقة',
      searchPlaceholder: 'ابحث عن لغة (مثلاً: Deutsch, 日本語, العربية...)',
      noResults: 'لا توجد لغة مطابقة لبحثك.',
      clearSearch: 'عرض كل اللغات',
      regions: {
        all: 'الكل',
        popular: 'الأكثر طلباً',
        europe: 'أوروبا',
        global: 'عالمي وآسيا',
      },
    };
  }
  if (lang === 'de') {
    return {
      heading: 'Sprache wählen',
      footerLabel: 'Sprache & Region',
      searchPlaceholder: 'Sprache suchen (z. B. English, العربية, 日本語...)',
      noResults: 'Keine passende Sprache gefunden.',
      clearSearch: 'Alle Sprachen zeigen',
      regions: {
        all: 'Alle',
        popular: 'Beliebt',
        europe: 'Europa',
        global: 'Global & Asien',
      },
    };
  }
  return {
    heading: 'Choose Language',
    footerLabel: 'Language & Region',
    searchPlaceholder: 'Search language (e.g. Deutsch, العربية, 日本語...)',
    noResults: 'No matching language found.',
    clearSearch: 'Show all languages',
    regions: {
      all: 'All',
      popular: 'Popular',
      europe: 'Europe',
      global: 'Global & Asia',
    },
  };
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  lang,
  onChange,
  variant = 'header',
  currency,
  onChangeCurrency,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [regionTab, setRegionTab] = useState<RegionFilter>('all');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const current = LANGUAGE_OPTIONS.find((opt) => opt.code === lang) ?? LANGUAGE_OPTIONS[0];
  const copy = useMemo(() => getSwitcherCopy(lang), [lang]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LANGUAGE_OPTIONS.filter((opt) => {
      if (regionTab !== 'all' && opt.region !== regionTab) return false;
      if (!q) return true;
      return (
        opt.nativeName.toLowerCase().includes(q) ||
        opt.englishName.toLowerCase().includes(q) ||
        opt.short.toLowerCase().includes(q) ||
        opt.code.toLowerCase().includes(q)
      );
    });
  }, [query, regionTab]);

  const groupedSections = useMemo(() => {
    const q = query.trim();
    if (q || regionTab !== 'all') {
      return [{ key: 'filtered' as const, label: null as string | null, items: filteredOptions }];
    }
    const order: LanguageRegion[] = ['popular', 'europe', 'global'];
    return order
      .map((region) => ({
        key: region,
        label: copy.regions[region],
        items: filteredOptions.filter((opt) => opt.region === region),
      }))
      .filter((section) => section.items.length > 0);
  }, [copy.regions, filteredOptions, query, regionTab]);

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current || typeof window === 'undefined') return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;
    const menuWidth = Math.min(440, vw - margin * 2);

    const isRtl = document.documentElement.dir === 'rtl';
    let left = isRtl ? rect.right - menuWidth : rect.left;
    if (left + menuWidth > vw - margin) {
      left = vw - menuWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    const spaceBelow = vh - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUpward =
      variant === 'footer'
        ? spaceAbove >= 220 || spaceAbove > spaceBelow
        : spaceBelow < 280 && spaceAbove > spaceBelow;
    const availableSpace = openUpward ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(220, Math.min(460, availableSpace - 10));

    setMenuStyle({
      position: 'fixed',
      width: `${menuWidth}px`,
      left: `${Math.round(left)}px`,
      ...(openUpward
        ? { bottom: `${Math.round(vh - rect.top + 8)}px` }
        : { top: `${Math.round(rect.bottom + 8)}px` }),
      maxHeight: `${Math.round(maxHeight)}px`,
      zIndex: 9999,
    });
  }, [variant]);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleScrollOrResize = (e: Event) => {
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) {
        return;
      }
      updateMenuPosition();
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    window.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [open, updateMenuPosition]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setQuery('');
        setRegionTab('all');
      }
      return next;
    });
  };

  const handleSelect = (code: Lang) => {
    onChange(code);
    setOpen(false);
  };

  const renderOptionButton = (opt: LanguageOption) => {
    const active = opt.code === lang;
    return (
      <button
        key={opt.code}
        type="button"
        role="option"
        aria-selected={active}
        onClick={() => handleSelect(opt.code)}
        className={`group flex min-h-[42px] items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-start text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/50 ${
          active
            ? 'bg-[#FFF7ED] text-[#9A3412] ring-1 ring-[#FDBA74]'
            : 'text-[#0F172A] hover:bg-[#F8FAFC]'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            className={`inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold tracking-wide transition-colors ${
              active
                ? 'bg-[#EA580C] text-white'
                : 'bg-[#F1F5F9] text-[#475569] group-hover:bg-[#E2E8F0]'
            }`}
          >
            {opt.short}
          </span>
          <span className="min-w-0">
            <span className={`block truncate text-[12px] leading-tight ${active ? 'font-bold' : 'font-semibold'}`}>
              {opt.nativeName}
            </span>
            <span className="block truncate text-[10px] leading-tight text-[#64748B]">
              {opt.englishName}
            </span>
          </span>
        </span>
        {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#EA580C]" aria-hidden="true" />}
      </button>
    );
  };

  const triggerButton =
    variant === 'footer' ? (
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.footerLabel}
        className="inline-flex min-h-[46px] w-full items-center justify-between gap-3 rounded-xl border border-white/25 bg-white/12 px-3.5 py-2 text-start text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/75 leading-tight">
              {copy.footerLabel}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-bold text-white leading-tight">
              <span>{current.nativeName}</span>
              <span className="font-mono text-[10px] font-semibold text-white/80">
                ({current.short} · {LANGUAGE_OPTIONS.length})
              </span>
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/85 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
    ) : (
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.heading}
        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#FFF7ED] hover:border-[#FED7AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
      >
        <Globe className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden="true" />
        <span className="font-mono text-[11px] font-bold">
          {current.short}
          {currency ? ` · ${currency}` : ''}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#64748B] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
    );

  return (
    <div ref={containerRef} className={variant === 'footer' ? 'relative z-30 w-full' : 'relative z-30'}>
      {triggerButton}

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label={copy.heading}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            style={menuStyle}
            className="wasla-lang-listbox flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172A] shadow-[0_24px_60px_rgba(15,23,42,0.28)]"
          >
            {/* Header & Search */}
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC]/80 px-3 pt-3 pb-2.5 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
                  <span className="text-xs font-bold text-[#0F172A]">{copy.heading}</span>
                  <span className="rounded-md bg-[#E2E8F0]/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#475569]">
                    {LANGUAGE_OPTIONS.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close language switcher"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#E2E8F0]/70 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {currency && onChangeCurrency && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold text-[#475569]">
                    {lang === 'ar' ? 'العملة' : lang === 'de' ? 'Währung' : 'Currency'}
                  </span>
                  <div className="flex items-center gap-1" role="group" aria-label="Currency selector">
                    {CURRENCY_OPTIONS.map((opt) => {
                      const active = currency === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          aria-pressed={active}
                          onClick={() => onChangeCurrency(opt.code)}
                          className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer tabular-nums ${
                            active
                              ? 'bg-[#EA580C] text-white'
                              : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                          }`}
                        >
                          {opt.code === 'EUR' ? '€ EUR' : opt.code === 'USD' ? '$ USD' : 'EGP'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="relative">
                <Search
                  className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white py-2 ps-8 pe-8 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute end-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Region Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5" role="tablist" aria-label="Language regions">
                {(['all', 'popular', 'europe', 'global'] as RegionFilter[]).map((key) => {
                  const selected = regionTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setRegionTab(key)}
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#0F172A] text-white'
                          : 'text-[#475569] hover:bg-[#E2E8F0]/70 hover:text-[#0F172A]'
                      }`}
                    >
                      {copy.regions[key]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-[#64748B]">{copy.noResults}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setRegionTab('all');
                    }}
                    className="inline-flex min-h-[36px] items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                  >
                    {copy.clearSearch}
                  </button>
                </div>
              ) : (
                groupedSections.map((section) => (
                  <div key={section.key} className="space-y-1.5">
                    {section.label && (
                      <div className="px-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        {section.label}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {section.items.map(renderOptionButton)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
