import React from 'react';
import { WaslaLogo } from '../brand/WaslaLogo';
import { useBrandTheme } from '../../context/BrandThemeContext';

export const WaslaNavbar: React.FC<{ onAuthClick?: () => void }> = ({ onAuthClick }) => {
  const { lang, mode, toggleLang, toggleMode } = useBrandTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[#C8C2B8]/40 dark:border-[#334155] bg-[#FAF4ED]/90 dark:bg-[#0F2233]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center focus:outline-none">
          <WaslaLogo variant="full" className="hidden sm:block h-11 w-auto" />
          <WaslaLogo variant="icon" className="block sm:hidden h-10 w-10" />
        </a>

        <div className="flex items-center gap-2.5">
          <button type="button" onClick={toggleLang} className="btn-wasla-outline px-3 py-2 text-sm">
            {lang === 'ar' ? 'EN' : 'العربية'}
          </button>
          <button type="button" onClick={toggleMode} aria-label="Toggle Dark Mode" className="btn-wasla-outline px-3 py-2 text-sm">
            {mode === 'light' ? 'Dark' : 'Light'}
          </button>
          <button type="button" onClick={onAuthClick} className="btn-wasla-primary text-sm">
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>
      </div>
    </header>
  );
};
