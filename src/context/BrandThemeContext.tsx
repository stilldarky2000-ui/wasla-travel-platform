import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'ar' | 'en';
export type ColorMode = 'light' | 'dark';

interface BrandThemeContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  mode: ColorMode;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  toggleMode: () => void;
}

const BrandThemeContext = createContext<BrandThemeContextValue | undefined>(undefined);

export const BrandThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('wasla_active_lang');
      return saved === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  const [mode, setMode] = useState<ColorMode>(() => {
    try {
      const saved = localStorage.getItem('wasla_theme') || localStorage.getItem('wasla_mode');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem('wasla_active_lang', lang);
    } catch {
      // Ignore storage failures on restricted browsers
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('wasla_mode', mode);
    } catch {
      // Ignore storage failures on restricted browsers
    }
  }, [mode]);

  const toggleLang = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <BrandThemeContext.Provider value={{ lang, dir, mode, setLang, toggleLang, toggleMode }}>
      {children}
    </BrandThemeContext.Provider>
  );
};

export const useBrandTheme = () => {
  const ctx = useContext(BrandThemeContext);
  if (!ctx) throw new Error('useBrandTheme must be used within BrandThemeProvider');
  return ctx;
};
