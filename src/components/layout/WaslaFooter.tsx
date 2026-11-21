import React from 'react';
import { WaslaLogo } from '../brand/WaslaLogo';
import { useBrandTheme } from '../../context/BrandThemeContext';

export const WaslaFooter: React.FC = () => {
  const { lang } = useBrandTheme();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0F2233] text-white border-t border-[#334155]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <WaslaLogo variant="full" theme="dark" className="h-12 w-auto" />
        <p className="text-sm text-slate-400">
          {lang === 'ar'
            ? `© ${year} وصلة ترافيل (Wasla Travel). جميع الحقوق محفوظة.`
            : `© ${year} Wasla Travel (وصلة ترافيل). All rights reserved.`}
        </p>
      </div>
    </footer>
  );
};
