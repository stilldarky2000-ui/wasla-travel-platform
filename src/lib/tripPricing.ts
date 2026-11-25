import { Lang } from '../data/i18n';
import { CurrencyCode, Trip, formatCurrencyPrice, tText } from '../data/marketplaceData';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicIndicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)] ?? digit);
}

export function formatTripLockupPrice(
  eurAmount: number,
  currency: CurrencyCode,
  lang: Lang,
  withBaseHint = false
): string {
  if (lang === 'ar' && currency === 'EUR') {
    const safeEur = Math.max(0, Math.round(Number(eurAmount) || 0));
    return `${toArabicIndicDigits(safeEur)} يورو`;
  }
  return formatCurrencyPrice(eurAmount, currency, withBaseHint);
}

export function formatPerGroupUnitLabel(trip: Trip, lang: Lang): string {
  const maxGuests =
    typeof trip.maxGuests === 'number' && trip.maxGuests > 0 ? trip.maxGuests : null;

  if (trip.category === 'sea') {
    if (maxGuests !== null) {
      return tText(
        {
          en: `whole boat, up to ${maxGuests} guests`,
          ar: `القارب بالكامل، حتى ${toArabicIndicDigits(maxGuests)} ضيوف`,
          de: `ganzes Boot, bis zu ${maxGuests} Gäste`,
        },
        lang
      );
    }
    return tText(
      {
        en: 'whole boat',
        ar: 'القارب بالكامل',
        de: 'ganzes Boot',
      },
      lang
    );
  }

  if (trip.category === 'transfers') {
    if (maxGuests !== null) {
      return tText(
        {
          en: `per vehicle, up to ${maxGuests} guests`,
          ar: `للسيارة، حتى ${toArabicIndicDigits(maxGuests)} ضيوف`,
          de: `pro Fahrzeug, bis zu ${maxGuests} Gäste`,
        },
        lang
      );
    }
    return tText(
      {
        en: 'per vehicle',
        ar: 'للسيارة',
        de: 'pro Fahrzeug',
      },
      lang
    );
  }

  if (maxGuests !== null) {
    return tText(
      {
        en: `whole group, up to ${maxGuests} guests`,
        ar: `للمجموعة بالكامل، حتى ${toArabicIndicDigits(maxGuests)} ضيوف`,
        de: `ganze Gruppe, bis zu ${maxGuests} Gäste`,
      },
      lang
    );
  }

  return tText(
    {
      en: 'per group',
      ar: 'للمجموعة',
      de: 'pro Gruppe',
    },
    lang
  );
}
