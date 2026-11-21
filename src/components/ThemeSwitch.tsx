import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Lang } from '../data/i18n';

interface ThemeSwitchProps {
  darkMode: boolean;
  onToggle: () => void;
  lang?: Lang;
  size?: 'sm' | 'md';
  badgeLabel?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  darkMode,
  onToggle,
  lang = 'en',
  size = 'md',
  badgeLabel,
}) => {
  const lightLabel = lang === 'ar' ? 'عادي' : lang === 'de' ? 'Hell' : 'Light';
  const darkLabel = lang === 'ar' ? 'داكن' : lang === 'de' ? 'Dunkel' : 'Dark';

  const ariaLabel =
    lang === 'ar'
      ? darkMode
        ? 'التبديل إلى المظهر العادي'
        : 'التبديل إلى المظهر الداكن'
      : darkMode
      ? 'Switch to light mode'
      : 'Switch to dark mode';

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-2 shrink-0">
      {badgeLabel && (
        <span
          className={`hidden xl:inline text-[11px] font-semibold whitespace-nowrap ${
            darkMode ? 'text-slate-300' : 'text-[#475569]'
          }`}
        >
          {badgeLabel}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={darkMode}
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={onToggle}
        dir="ltr"
        className={`relative inline-flex items-center rounded-full border p-1 transition-all duration-300 cursor-pointer shrink-0 select-none ${
          isSmall
            ? 'h-8 w-[68px] sm:w-[104px]'
            : 'h-9 sm:h-10 w-[72px] sm:w-[116px]'
        } ${
          darkMode
            ? 'border-[#334155] bg-[#19354F] shadow-inner'
            : 'border-[#C8C2B8] bg-[#FAF4ED] shadow-xs'
        }`}
      >
        {/* Sliding Active Thumb */}
        <span
          aria-hidden="true"
          className={`bg-[#EE5426] shadow-cta absolute top-1 bottom-1 rounded-full transition-all duration-300 ${
            isSmall
              ? darkMode
                ? 'w-[30px] sm:w-[48px] left-[33px] sm:left-[51px]'
                : 'w-[30px] sm:w-[48px] left-1'
              : darkMode
              ? 'w-[32px] sm:w-[54px] left-[35px] sm:left-[57px]'
              : 'w-[32px] sm:w-[54px] left-1'
          }`}
        />

        {/* Light Option */}
        <span
          className={`relative z-10 flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
            !darkMode ? 'text-white' : 'text-slate-300'
          }`}
        >
          <Sun className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{lightLabel}</span>
        </span>

        {/* Dark Option */}
        <span
          className={`relative z-10 flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
            darkMode ? 'text-white' : 'text-[#0F2233]'
          }`}
        >
          <Moon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{darkLabel}</span>
        </span>
      </button>
    </div>
  );
};
