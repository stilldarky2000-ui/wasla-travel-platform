import { Lang } from './i18n';

export type ExtraLang = Exclude<Lang, 'en' | 'ar' | 'de'>;

const PACK_CACHE: Partial<Record<ExtraLang, Record<string, string>>> = {};
const INFLIGHT: Partial<Record<ExtraLang, Promise<Record<string, string>>>> = {};

function loadPackModule(lang: ExtraLang): Promise<{ default: Record<string, string> }> {
  switch (lang) {
    case 'fr':
      return import('./packs/fr');
    case 'es':
      return import('./packs/es');
    case 'it':
      return import('./packs/it');
    case 'nl':
      return import('./packs/nl');
    case 'pl':
      return import('./packs/pl');
    case 'pt':
      return import('./packs/pt');
    case 'cs':
      return import('./packs/cs');
    case 'sv':
      return import('./packs/sv');
    case 'ro':
      return import('./packs/ro');
    case 'ru':
      return import('./packs/ru');
    case 'uk':
      return import('./packs/uk');
    case 'no':
      return import('./packs/no');
    case 'da':
      return import('./packs/da');
    case 'fi':
      return import('./packs/fi');
    case 'hu':
      return import('./packs/hu');
    case 'el':
      return import('./packs/el');
    case 'tr':
      return import('./packs/tr');
    case 'zh':
      return import('./packs/zh');
    case 'ja':
      return import('./packs/ja');
    case 'ko':
      return import('./packs/ko');
    case 'hi':
      return import('./packs/hi');
  }
}

export function isExtraLang(lang: Lang): lang is ExtraLang {
  return lang !== 'en' && lang !== 'ar' && lang !== 'de';
}

export async function ensureLocalePack(lang: Lang): Promise<boolean> {
  if (!isExtraLang(lang)) return false;
  if (PACK_CACHE[lang]) return false;

  if (!INFLIGHT[lang]) {
    INFLIGHT[lang] = loadPackModule(lang)
      .then((mod) => {
        PACK_CACHE[lang] = mod.default;
        return mod.default;
      })
      .catch(() => {
        PACK_CACHE[lang] = {};
        return {};
      })
      .finally(() => {
        delete INFLIGHT[lang];
      });
  }

  await INFLIGHT[lang];
  return true;
}

export function getPackPhrase(enText: string | undefined, lang: Lang): string | undefined {
  if (!enText || !isExtraLang(lang)) return undefined;
  return PACK_CACHE[lang]?.[enText];
}
