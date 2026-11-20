import heroCoastImg from '../assets/images/hero_red_sea_coast_1794609167890.jpg';
import heroRedSeaVibrantImg from '../assets/images/hero_red_sea_vibrant_1795088656246.jpg';
import orangeBayImg from '../assets/images/trip_orange_bay_boat_1794609167713.jpg';
import desertSunsetImg from '../assets/images/trip_desert_quad_sunset_1794609167599.jpg';
import luxorTempleImg from '../assets/images/trip_luxor_temple_columns_1794609167708.jpg';
import luxorValleyKingsImg from '../assets/images/luxor_valley_kings_tombs_1795023936503.jpg';
import luxorHatshepsutImg from '../assets/images/luxor_hatshepsut_temple_1795023935886.jpg';
import luxorFeluccaImg from '../assets/images/luxor_nile_felucca_dusk_1795023937583.jpg';
import horseBeachImg from '../assets/images/trip_horse_sahl_hasheesh_1794609168296.jpg';
import momentGuestImg from '../assets/images/moment_guest_red_sea_1794609167642.jpg';
import cairoPyramidsImg from '../assets/images/trip_cairo_pyramids_giza_1795088654554.jpg';
import luxorBalloonImg from '../assets/images/trip_luxor_hot_air_balloon_1795088654794.jpg';
import hurghadaMarinaImg from '../assets/images/trip_hurghada_marina_city_1795088655885.jpg';
import privateVanImg from '../assets/images/trip_private_van_transfer_1795088657748.jpg';
import { Lang } from './i18n';
import { getPackPhrase } from './localePacks';

export type ActivityCategoryId =
  | 'sea'
  | 'desert'
  | 'historical'
  | 'horse'
  | 'city'
  | 'shopping'
  | 'guides'
  | 'transfers';

export type DestinationRegion = 'Hurghada' | 'Marsa Alam' | 'Luxor' | 'Cairo';

export type TargetSectionId = 'hurghada-marsa-alam' | 'cairo-luxor';

export interface LocalizedText {
  en: string;
  ar: string;
  de: string;
  fr?: string;
  es?: string;
  it?: string;
  nl?: string;
  pl?: string;
  pt?: string;
  cs?: string;
  sv?: string;
  ro?: string;
  ru?: string;
  uk?: string;
  tr?: string;
  zh?: string;
  ja?: string;
  ko?: string;
  no?: string;
  da?: string;
  fi?: string;
  hu?: string;
  el?: string;
  hi?: string;
}

export interface TransferZoneOption {
  id: string;
  feePerPersonEur: number;
  label: LocalizedText;
}

export const OUTER_TRANSFER_ZONES: TransferZoneOption[] = [
  {
    id: 'hurghada',
    feePerPersonEur: 0,
    label: {
      en: 'Hurghada City (Pickup Included · €0)',
      ar: 'مدينة الغردقة (التوصيل مشمول · 0€)',
      de: 'Hurghada Stadt (Abholung inklusive · 0 €)',
      fr: 'Hurghada Ville (Inclus · 0 €)',
      es: 'Hurghada Ciudad (Incluido · 0 €)',
      it: 'Hurghada Città (Incluso · 0 €)',
      nl: 'Hurghada Stad (Inbegrepen · €0)',
      pl: 'Hurghada Centrum (W cenie · 0 €)',
      pt: 'Hurghada Cidade (Incluído · 0 €)',
      cs: 'Hurghada Město (V ceně · 0 €)',
      sv: 'Hurghada Stad (Ingår · 0 €)',
      ro: 'Hurghada Oraș (Inclus · 0 €)',
    },
  },
  {
    id: 'el-gouna',
    feePerPersonEur: 10,
    label: {
      en: 'El Gouna (+€10 / person extra transfer)',
      ar: 'الجونة (+10€ للفرد توصيل خارج الغردقة)',
      de: 'El Gouna (+10 € / Person Transferzuschlag)',
      fr: 'El Gouna (+10 € / pers. supplément transfert)',
      es: 'El Gouna (+10 € / pers. suplemento traslado)',
      it: 'El Gouna (+10 € / pers. extra transfer)',
      nl: 'El Gouna (+€10 / pers. extra transfer)',
      pl: 'El Gouna (+10 € / os. dopłata za transfer)',
      pt: 'El Gouna (+10 € / pessoa transfer extra)',
      cs: 'El Gouna (+10 € / os. příplatek za transfer)',
      sv: 'El Gouna (+10 € / pers. extra transfer)',
      ro: 'El Gouna (+10 € / pers. transfer extra)',
    },
  },
  {
    id: 'sahl-hasheesh',
    feePerPersonEur: 10,
    label: {
      en: 'Sahl Hasheesh (+€10 / person extra transfer)',
      ar: 'سهل حشيش (+10€ للفرد توصيل خارج الغردقة)',
      de: 'Sahl Hasheesh (+10 € / Person Transferzuschlag)',
      fr: 'Sahl Hasheesh (+10 € / pers. supplément)',
      es: 'Sahl Hasheesh (+10 € / pers. suplemento)',
      it: 'Sahl Hasheesh (+10 € / pers. extra transfer)',
      nl: 'Sahl Hasheesh (+€10 / pers. extra transfer)',
      pl: 'Sahl Hasheesh (+10 € / os. dopłata)',
      pt: 'Sahl Hasheesh (+10 € / pessoa extra)',
      cs: 'Sahl Hasheesh (+10 € / os. příplatek)',
      sv: 'Sahl Hasheesh (+10 € / pers. extra)',
      ro: 'Sahl Hasheesh (+10 € / pers. extra)',
    },
  },
  {
    id: 'makadi',
    feePerPersonEur: 10,
    label: {
      en: 'Makadi Bay (+€10 / person extra transfer)',
      ar: 'خليج مكادي (+10€ للفرد توصيل خارج الغردقة)',
      de: 'Makadi Bay (+10 € / Person Transferzuschlag)',
      fr: 'Makadi Bay (+10 € / pers. supplément)',
      es: 'Makadi Bay (+10 € / pers. suplemento)',
      it: 'Makadi Bay (+10 € / pers. extra transfer)',
      nl: 'Makadi Bay (+€10 / pers. extra transfer)',
      pl: 'Makadi Bay (+10 € / os. dopłata)',
      pt: 'Makadi Bay (+10 € / pessoa extra)',
      cs: 'Makadi Bay (+10 € / os. příplatek)',
      sv: 'Makadi Bay (+10 € / pers. extra)',
      ro: 'Makadi Bay (+10 € / pers. extra)',
    },
  },
  {
    id: 'soma-bay',
    feePerPersonEur: 15,
    label: {
      en: 'Soma Bay (+€15 / person extra transfer)',
      ar: 'سوما باي (+15€ للفرد توصيل خارج الغردقة)',
      de: 'Soma Bay (+15 € / Person Transferzuschlag)',
      fr: 'Soma Bay (+15 € / pers. supplément)',
      es: 'Soma Bay (+15 € / pers. suplemento)',
      it: 'Soma Bay (+15 € / pers. extra transfer)',
      nl: 'Soma Bay (+€15 / pers. extra transfer)',
      pl: 'Soma Bay (+15 € / os. dopłata)',
      pt: 'Soma Bay (+15 € / pessoa extra)',
      cs: 'Soma Bay (+15 € / os. příplatek)',
      sv: 'Soma Bay (+15 € / pers. extra)',
      ro: 'Soma Bay (+15 € / pers. extra)',
    },
  },
  {
    id: 'safaga',
    feePerPersonEur: 15,
    label: {
      en: 'Safaga (+€15 / person extra transfer)',
      ar: 'سفاجا (+15€ للفرد توصيل خارج الغردقة)',
      de: 'Safaga (+15 € / Person Transferzuschlag)',
      fr: 'Safaga (+15 € / pers. supplément)',
      es: 'Safaga (+15 € / pers. suplemento)',
      it: 'Safaga (+15 € / pers. extra transfer)',
      nl: 'Safaga (+€15 / pers. extra transfer)',
      pl: 'Safaga (+15 € / os. dopłata)',
      pt: 'Safaga (+15 € / pessoa extra)',
      cs: 'Safaga (+15 € / os. příplatek)',
      sv: 'Safaga (+15 € / pers. extra)',
      ro: 'Safaga (+15 € / pers. extra)',
    },
  },
];

const ZONE_BASE_NAMES: Record<string, { en: string; ar: string; de: string }> = {
  hurghada: { en: 'Hurghada City', ar: 'مدينة الغردقة', de: 'Hurghada Stadt' },
  'el-gouna': { en: 'El Gouna', ar: 'الجونة', de: 'El Gouna' },
  'sahl-hasheesh': { en: 'Sahl Hasheesh', ar: 'سهل حشيش', de: 'Sahl Hasheesh' },
  makadi: { en: 'Makadi Bay', ar: 'خليج مكادي', de: 'Makadi Bay' },
  'soma-bay': { en: 'Soma Bay', ar: 'سوما باي', de: 'Soma Bay' },
  safaga: { en: 'Safaga', ar: 'سفاجا', de: 'Safaga' },
};

/**
 * Directional Extra Transfer Fee per person (EUR):
 * - Cairo trips (Northbound): Extra transfer applies ONLY to Sahl Hasheesh (+€10/pp), Makadi Bay (+€10/pp), Soma Bay (+€15/pp), and Safaga (+€15/pp). El Gouna & Hurghada City = €0.
 * - Luxor trips (Southbound): Extra transfer applies ONLY to El Gouna (+€10/pp, opposite direction). Hurghada, Sahl Hasheesh, Makadi Bay, Soma Bay, and Safaga = €0.
 * - Hurghada / other trips (when outer transfer applies): El Gouna, Sahl Hasheesh, Makadi Bay (+€10/pp); Soma Bay, Safaga (+€15/pp); Hurghada City = €0.
 */
export function getZoneTransferFeePerPerson(
  zoneId: string,
  destination?: DestinationRegion | string,
  hasOuterZoneTransfer: boolean = true
): number {
  if (!hasOuterZoneTransfer || !zoneId || zoneId === 'hurghada') return 0;

  if (destination === 'Cairo') {
    if (zoneId === 'sahl-hasheesh' || zoneId === 'makadi') return 10;
    if (zoneId === 'soma-bay' || zoneId === 'safaga') return 15;
    return 0; // El Gouna & Hurghada are on the way north to Cairo
  }

  if (destination === 'Luxor') {
    if (zoneId === 'el-gouna') return 10; // Opposite direction (north of Hurghada)
    return 0; // Sahl Hasheesh, Makadi, Soma Bay, Safaga are on the southbound route
  }

  const zone = OUTER_TRANSFER_ZONES.find((z) => z.id === zoneId);
  return zone ? zone.feePerPersonEur : 0;
}

export function getZoneTransferLabel(
  zoneId: string,
  destination: DestinationRegion | string | undefined,
  lang: Lang,
  hasOuterZoneTransfer: boolean = true
): string {
  const base = ZONE_BASE_NAMES[zoneId] || ZONE_BASE_NAMES.hurghada;
  const zoneName = lang === 'ar' ? base.ar : lang === 'de' ? base.de : base.en;
  const fee = getZoneTransferFeePerPerson(zoneId, destination, hasOuterZoneTransfer);
  if (fee === 0) {
    return lang === 'ar'
      ? `${zoneName} (التوصيل مشمول · 0€)`
      : lang === 'de'
      ? `${zoneName} (Abholung inklusive · 0 €)`
      : `${zoneName} (Pickup Included · €0)`;
  }
  return lang === 'ar'
    ? `${zoneName} (+${fee}€ للفرد توصيل إضافي)`
    : lang === 'de'
    ? `${zoneName} (+${fee} € / Person Transferzuschlag)`
    : `${zoneName} (+€${fee} / person extra transfer)`;
}

export interface TripOption {
  id: string;
  title: LocalizedText;
  detail?: LocalizedText;
  price: number;
}

export interface TripItineraryStop {
  kind: 'pickup' | 'stop' | 'break' | 'end';
  title: LocalizedText;
  subtitle?: LocalizedText;
  durationOrTime?: LocalizedText;
}

export interface TripHistoricalFact {
  era?: LocalizedText;
  title: LocalizedText;
  fact: LocalizedText;
  metric?: LocalizedText;
}

export interface Trip {
  id: string;
  name: LocalizedText;
  category: ActivityCategoryId;
  destination: DestinationRegion;
  images: string[];
  galleryCaptions?: LocalizedText[];
  rating: number;
  reviewCount: number;
  duration: LocalizedText;
  departureTimes?: string[];
  timingNote?: LocalizedText;
  price: number;
  options?: TripOption[];
  shortDescription: LocalizedText;
  fullDescription?: LocalizedText;
  itinerary?: TripItineraryStop[];
  historicalFacts?: TripHistoricalFact[];
  highlights: LocalizedText[];
  included: LocalizedText[];
  tips?: LocalizedText[];
  notSuitableFor?: LocalizedText[];
  meetingPoint?: LocalizedText;
  meetingPointUrl?: string;
  whatToBring?: LocalizedText[];
  notAllowed?: LocalizedText[];
  knowBeforeYouGo?: LocalizedText[];
  outerTransferEnabled?: boolean;
  pickup: LocalizedText;
  supplierName: string;
  supplierUid?: string;
  approvalStatus?: 'Approved' | 'Pending' | 'Paused' | 'Rejected';
  familyFriendly: boolean;
  womenFriendly: boolean;
  minChildAge?: number;
  kidsDiscount?: LocalizedText;
  /** Optional explicit numeric child price in EUR (overrides regex parsing of kidsDiscount). */
  childPriceEur?: number;
  /** Optional explicit numeric child discount percent (0-100, e.g. 50 for 50% off). */
  childDiscountPercent?: number;
  featured: boolean;
  languages?: string[];
  /** Operating days of week (0 = Sun .. 6 = Sat). Omitted means daily [0..6]. */
  operatingDays?: number[];
  /** Optional inclusive seasonal start date (YYYY-MM-DD). */
  availableFrom?: string;
  /** Optional inclusive seasonal end date (YYYY-MM-DD). */
  availableTo?: string;
}

export interface CategoryItem {
  id: ActivityCategoryId;
  name: LocalizedText;
  image: string;
  targetSection: TargetSectionId;
}

export interface MomentItem {
  id: string;
  image: string;
  guestName: string;
  country: LocalizedText;
  rating: number;
  comment: LocalizedText;
  tripId: string;
  bookingId?: string;
  verifiedBooking?: boolean;
  hasGuestPhoto?: boolean;
  visitDate?: string;
  guestLang?: Lang;
  tripTitleOverride?: string;
  fallbackTripImage?: string;
}

const BUNDLED_IMAGE_ENTRIES: Array<{ token: string; asset: string }> = [
  { token: 'hero_red_sea_vibrant', asset: heroRedSeaVibrantImg },
  { token: 'hero_red_sea_coast', asset: heroCoastImg },
  { token: 'trip_orange_bay_boat', asset: orangeBayImg },
  { token: 'trip_desert_quad_sunset', asset: desertSunsetImg },
  { token: 'trip_luxor_temple_columns', asset: luxorTempleImg },
  { token: 'luxor_valley_kings_tombs', asset: luxorValleyKingsImg },
  { token: 'luxor_hatshepsut_temple', asset: luxorHatshepsutImg },
  { token: 'luxor_nile_felucca_dusk', asset: luxorFeluccaImg },
  { token: 'trip_horse_sahl_hasheesh', asset: horseBeachImg },
  { token: 'moment_guest_red_sea', asset: momentGuestImg },
  { token: 'trip_cairo_pyramids_giza', asset: cairoPyramidsImg },
  { token: 'trip_luxor_hot_air_balloon', asset: luxorBalloonImg },
  { token: 'trip_hurghada_marina_city', asset: hurghadaMarinaImg },
  { token: 'trip_private_van_transfer', asset: privateVanImg },
];

export const CATEGORY_FALLBACK_IMAGE: Record<ActivityCategoryId, string> = {
  sea: orangeBayImg,
  desert: desertSunsetImg,
  historical: luxorTempleImg,
  horse: horseBeachImg,
  city: hurghadaMarinaImg,
  shopping: heroCoastImg,
  guides: luxorHatshepsutImg,
  transfers: privateVanImg,
};

export function resolveBundledMediaUrl(
  rawUrl: string | undefined | null,
  category?: ActivityCategoryId
): string {
  const fallback = (category && CATEGORY_FALLBACK_IMAGE[category]) || heroCoastImg;
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!trimmed) return fallback;

  for (const entry of BUNDLED_IMAGE_ENTRIES) {
    if (trimmed.includes(entry.token)) {
      return entry.asset;
    }
  }

  // Discard stale dev/local Vite paths or dead preview origins that do not resolve in production
  if (
    trimmed.startsWith('/src/') ||
    trimmed.startsWith('src/') ||
    /^https?:\/\/(?:localhost|127\.0\.0\.1|ais-dev-|ais-pre-)/i.test(trimmed) ||
    (trimmed.startsWith('/assets/') && !trimmed.startsWith('/assets/aistudio/'))
  ) {
    return fallback;
  }

  return trimmed;
}

export const SITE_CONFIG = {
  domain: 'waslatravel.com',
  whatsappNumber: '+201129155520',
  whatsappDisplay: '+20 112 915 5520',
  email: 'booking@waslatravel.com',
  heroBackground: heroRedSeaVibrantImg,
};

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'sea',
    name: {
      en: 'Sea trips', ar: 'رحلات بحرية', de: 'Bootstouren',
      fr: 'Sorties en mer', es: 'Excursiones marítimas', it: 'Gite in barca',
      nl: 'Boottochten', pl: 'Rejsy morskie', pt: 'Passeios de barco',
      cs: 'Plavby lodí', sv: 'Båtturer', ro: 'Excursii pe mare',
    },
    image: orangeBayImg,
    targetSection: 'hurghada-marsa-alam',
  },
  {
    id: 'desert',
    name: {
      en: 'Desert trips', ar: 'رحلات الصحراء', de: 'Wüstensafaris',
      fr: 'Safaris désert', es: 'Safaris desierto', it: 'Safari nel deserto',
      nl: 'Woestijnsafari', pl: 'Safari na pustyni', pt: 'Safáris no deserto',
      cs: 'Pouštní safari', sv: 'Ökensafari', ro: 'Safari în deșert',
    },
    image: desertSunsetImg,
    targetSection: 'hurghada-marsa-alam',
  },
  {
    id: 'historical',
    name: {
      en: 'Historical', ar: 'رحلات تاريخية', de: 'Geschichte',
      fr: 'Historique', es: 'Histórico', it: 'Storico',
      nl: 'Historisch', pl: 'Historyczne', pt: 'Histórico',
      cs: 'Historie', sv: 'Historiska turer', ro: 'Istoric',
    },
    image: luxorTempleImg,
    targetSection: 'cairo-luxor',
  },
  {
    id: 'horse',
    name: {
      en: 'Horse riding', ar: 'ركوب الخيل', de: 'Reiten',
      fr: 'Équitation', es: 'Paseos a caballo', it: 'Equitazione',
      nl: 'Paardrijden', pl: 'Jazda konna', pt: 'Passeio a cavalo',
      cs: 'Jízda na koni', sv: 'Ridning', ro: 'Echitație',
    },
    image: horseBeachImg,
    targetSection: 'hurghada-marsa-alam',
  },
  {
    id: 'guides',
    name: {
      en: 'Egyptian guides', ar: 'مرشدون مصريون', de: 'Ägyptische Guides',
      fr: 'Guides égyptiens', es: 'Guías egipcios', it: 'Guide egiziane',
      nl: 'Egyptische gidsen', pl: 'Egipscy przewodnicy', pt: 'Guias egípcios',
      cs: 'Egyptští průvodci', sv: 'Egyptiska guider', ro: 'Ghizi egipteni',
    },
    image: luxorHatshepsutImg,
    targetSection: 'cairo-luxor',
  },
  {
    id: 'shopping',
    name: {
      en: 'Shopping tours', ar: 'جولات تسوق', de: 'Shopping-Touren',
      fr: 'Circuits shopping', es: 'Tours de compras', it: 'Tour shopping',
      nl: 'Shopping tours', pl: 'Wycieczki zakupowe', pt: 'Tours de compras',
      cs: 'Nákupní prohlídky', sv: 'Shoppingturer', ro: 'Tururi de cumpărături',
    },
    image: heroCoastImg,
    targetSection: 'hurghada-marsa-alam',
  },
  {
    id: 'city',
    name: {
      en: 'City tour', ar: 'جولة المدينة', de: 'Stadttour',
      fr: 'Visite de ville', es: 'Tour por la ciudad', it: 'Tour della città',
      nl: 'Stadstour', pl: 'Zwiedzanie miasta', pt: 'Tour pela cidade',
      cs: 'Prohlídka města', sv: 'Stadstur', ro: 'Tur de oraș',
    },
    image: hurghadaMarinaImg,
    targetSection: 'hurghada-marsa-alam',
  },
  {
    id: 'transfers',
    name: {
      en: 'Transfers', ar: 'توصيلات خاصة', de: 'Transfers',
      fr: 'Transferts privés', es: 'Traslados privados', it: 'Transfer privati',
      nl: 'Privétransfers', pl: 'Transfery prywatne', pt: 'Transfers privados',
      cs: 'Soukromé transfery', sv: 'Privat transfer', ro: 'Transferuri private',
    },
    image: privateVanImg,
    targetSection: 'hurghada-marsa-alam',
  },
];

export const TRIPS: Trip[] = [
  {
    id: 'orange-bay-small-group',
    name: {
      en: 'Orange Bay & Giftun Reef Small-Group Boat Day',
      ar: 'رحلة بحرية بمجموعة صغيرة إلى أورانج باي وشعاب الجفتون',
      de: 'Orange Bay & Giftun Riff Kleingruppen-Bootstag',
    },
    category: 'sea',
    destination: 'Hurghada',
    images: [orangeBayImg, heroRedSeaVibrantImg, momentGuestImg],
    galleryCaptions: [
      { en: 'Shallow turquoise sandbars at Orange Bay, Giftun Island', ar: 'المياه الفيروزية والرمال البيضاء في جزيرة أورانج باي', de: 'Türkisfarbene Sandbänke vor Orange Bay, Giftun-Insel' },
      { en: 'Calm Red Sea morning anchorage along Giftun Reef', ar: 'إبحار هادئ في الصباح الباكر فوق شعاب الجفتون', de: 'Ruhiger Morgen-Ankerplatz am Giftun-Riff' },
      { en: 'Clear coastal visibility ideal for family snorkelling', ar: 'رؤية بحرية صافية تناسب العائلات والغطس السطحي', de: 'Klare Sichtverhältnisse für familienfreundliches Schnorcheln' },
    ],
    rating: 4.9,
    reviewCount: 64,
    duration: { en: '7 hours', ar: '7 ساعات', de: '7 Stunden' },
    departureTimes: ['09:00 AM'],
    price: 38,
    options: [
      {
        id: 'opt-orange-shared',
        title: { en: 'Small-Group Boat (Standard)', ar: 'مركب مجموعة صغيرة (عادي)', de: 'Kleingruppen-Boot (Standard)' },
        detail: { en: 'Max 16 guests · 2 snorkel stops + buffet lunch', ar: 'بحد أقصى 16 ضيفاً · غطس + غداء بوفيه', de: 'Max. 16 Gäste · 2 Stopps + Mittagessen' },
        price: 38,
      },
      {
        id: 'opt-orange-vip',
        title: { en: 'VIP Seafood Yacht + Water Sports', ar: 'يخت VIP غداء سي فود + ألعاب مائية', de: 'VIP-Yacht mit Meeresfrüchten & Wassersport' },
        detail: { en: 'Fresh seafood lunch + sofa/banana boat ride', ar: 'غداء سي فود طازج + بنانا وصوفا بوت', de: 'Meeresfrüchte-Lunch + Bananaboot inklusive' },
        price: 54,
      },
      {
        id: 'opt-orange-private',
        title: { en: 'Private Speedboat (Up to 6 Guests)', ar: 'سبيد بوت خاص (حتى 6 أفراد)', de: 'Privates Speedboot (bis 6 Personen)' },
        detail: { en: 'Flexible departure time & private captain', ar: 'ميعاد تحرك مرن وقبطان خاص للرحلة', de: 'Flexible Abfahrtszeit & privater Kapitän' },
        price: 145,
      },
    ],
    shortDescription: {
      en: 'Uncrowded morning sailing to Orange Bay sandbar with two guided coral reef snorkel stops and fresh lunch aboard.',
      ar: 'إبحار صباحي هادئ إلى جزيرة أورانج باي مع توقفين للغطس السطحي وغداء طازج على القارب.',
      de: 'Ruhige Morgenfahrt zur Sandbank Orange Bay mit zwei geführten Schnorchelstopps und frischem Mittagessen.',
    },
    highlights: [
      {
        en: 'Capped at 16 guests so the upper sun deck never feels crowded',
        ar: 'بحد أقصى 16 ضيفاً لراحة كاملة على سطح القارب',
        de: 'Maximal 16 Gäste für entspannten Platz auf dem Sonnendeck',
      },
      {
        en: 'Two 45-minute snorkel stops over shallow Giftun coral gardens',
        ar: 'توقفان للغطس السطحي لمدة 45 دقيقة فوق شعاب الجفتون',
        de: 'Zwei 45-minütige Schnorchelstopps über flachen Korallengärten',
      },
    ],
    historicalFacts: [
      {
        era: { en: 'Protected Reserve · Est. 1995', ar: 'محمية طبيعية · أُعلنت 1995', de: 'Naturschutzgebiet · Seit 1995' },
        title: { en: 'Giftun Islands Marine Sanctuary', ar: 'محمية جزر الجفتون البحرية', de: 'Meeresschutzgebiet der Giftun-Inseln' },
        metric: { en: '1,200+ reef species', ar: '+1,200 كائن بحري', de: '1.200+ Riffarten' },
        fact: {
          en: 'Giftun Kebir and Giftun Soraya form the first protected island park in the Egyptian Red Sea, sheltering hard and soft coral gardens only 45 minutes from Hurghada Marina.',
          ar: 'تُعد جزيرتا الجفتون الكبرى والصغرى أول محمية جزر بحرية في البحر الأحمر المصري، وتضم حدائق مرجانية بكر على بُعد 45 دقيقة فقط من مارينا الغردقة.',
          de: 'Giftun Kebir und Giftun Soraya bilden den ersten geschützten Inselpark im ägyptischen Roten Meer und beherbergen artenreiche Korallengärten.',
        },
      },
      {
        era: { en: 'Red Sea Geology', ar: 'جيولوجيا البحر الأحمر', de: 'Geologie des Roten Meeres' },
        title: { en: 'Ancient Myos Hormos Coastline', ar: 'ساحل ميرموس هورموس التاريخي', de: 'Historische Küste von Myos Hormos' },
        metric: { en: '2,000+ years of sailing', ar: '+2,000 سنة ملاحة', de: '2.000+ Jahre Seefahrt' },
        fact: {
          en: 'Just north of Giftun lay the Ptolemaic and Roman port of Myos Hormos, once Egypt’s gateway connecting Upper Egypt caravan routes from Coptos and Thebes to the Indian Ocean spice trade.',
          ar: 'إلى الشمال مباشرة من الجفتون كان يقع ميناء ميوس هورموس البطلمي والروماني، الذي ربط قوافل قفط وطيبة (الأقصر) بتجارة المحيط الهندي عبر البحر الأحمر.',
          de: 'Unweit der Küste lag der ptolemäisch-römische Hafen Myos Hormos, der einst die Karawanenrouten aus Theben mit dem Seehandel verband.',
        },
      },
    ],
    included: [
      { en: 'Hotel pickup & drop-off from Hurghada city', ar: 'التوصيل من وإلى فنادق مدينة الغردقة', de: 'Hotelabholung & Rücktransfer ab Hurghada-Stadt' },
      { en: 'National park environmental fee & freshly prepared buffet lunch', ar: 'رسوم المحمية الطبيعية وغداء بوفيه طازج', de: 'Nationalparkgebühr & frisch zubereitetes Mittagsbuffet' },
      { en: 'Snorkel mask, fins, life jacket & English/German speaking boat guide', ar: 'معدات الغطس وسترة النجاة ومرشد بحري', de: 'Schnorchelausrüstung, Schwimmweste & Boot-Guide' },
    ],
    fullDescription: {
      en: 'Sail across the turquoise Red Sea aboard a comfortably capped small-group boat limited to 16 guests.\n\nYou will stop at two untouched Giftun Island coral gardens with calm morning visibility before relaxing for nearly two hours on the white sandbars of Orange Bay. Freshly cooked Egyptian lunch, chilled soft drinks, and shaded deck seating are included all day.',
      ar: 'أبحر عبر مياه البحر الأحمر الفيروزية على متن قارب بمجموعة صغيرة بحد أقصى 16 ضيفاً.\n\nستتوقف في موقعين رائعين للشعاب المرجانية حول جزيرة الجفتون مع رؤية صباحية صافية قبل الاسترخاء على الرمال البيضاء في أورانج باي. يشمل اليوم غداءً طازجاً ومشروبات باردة وأماكن مظللة.',
      de: 'Segeln Sie über das türkisfarbene Rote Meer auf einem ruhigen Kleingruppenboot (maximal 16 Gäste).\n\nEs erwarten Sie zwei ruhige Korallenriffe vor der Giftun-Insel sowie rund zwei Stunden Entspannung an den weißen Sandbänken der Orange Bay inklusive frischem Mittagessen und Schattenplätzen.',
    },
    tips: [
      {
        en: 'Pick-up & drop-off outside Hurghada (El Gouna, Sahl Hasheesh, Makadi +€10/pp · Soma Bay, Safaga +€15/pp) is NOT included — please select your hotel zone at checkout.',
        ar: 'التوصيل خارج مدينة الغردقة (الجونة، سهل حشيش، مكادي +10€ للفرد · سوما باي، سفاجا +15€ للفرد) غير مشمول — يرجى تحديد منطقة الفندق عند الحجز.',
        de: 'Abholung außerhalb von Hurghada (El Gouna, Sahl Hasheesh, Makadi +10 €/Pers. · Soma Bay, Safaga +15 €/Pers.) ist nicht inklusive — bitte wählen Sie Ihre Hotelzone beim Buchen.',
      },
      {
        en: 'Optional professional underwater photography & drone gallery session available on board.',
        ar: 'جلسة التصوير الاحترافية تحت الماء اختيارية وغير مشمولة ما لم تُطلب.',
        de: 'Optionale professionelle Unterwasserfotografie ist gegen Aufpreis zubuchbar.',
      },
    ],
    whatToBring: [
      { en: 'Swimwear, beach towel & reef-safe sunscreen', ar: 'ملابس السباحة، منشفة، وواقي شمس', de: 'Badekleidung, Handtuch & Sonnencreme' },
      { en: 'Sunglasses & a copy/photo of passport for marina coast guard check', ar: 'نظارة شمسية وصورة جواز السفر لتصريح المارينا', de: 'Sonnenbrille & Ausweisfoto für den Hafen' },
    ],
    notAllowed: [
      { en: 'Touching or standing on living coral reefs', ar: 'لمس أو الوقوف على الشعاب المرجانية', de: 'Berühren oder Betreten lebender Korallen' },
      { en: 'Single-use glass bottles on sun deck', ar: 'العبوات الزجاجية على سطح القارب', de: 'Glasflaschen auf dem Sonnendeck' },
    ],
    knowBeforeYouGo: [
      { en: 'Life jackets in adult and children sizes are carried on every vessel', ar: 'سترات نجاة متوفرة للكبار والأطفال على القارب', de: 'Schwimmwesten für Erwachsene und Kinder sind an Bord' },
      { en: 'Exact marina pickup time (Reception or Outside Gate) arrives via Email & WhatsApp the evening before.', ar: 'موعد البيك أب الدقيق ومكان الانتظار (الريسبشن أو البوابة) يصلك عبر الإيميل والواتساب.', de: 'Genaue Abholzeit & Treffpunkt folgen am Vorabend per E-Mail & WhatsApp.' },
    ],
    meetingPoint: {
      en: 'New Marina Hurghada / Hotel Lobby Pickup',
      ar: 'مارينا الغردقة الجديدة أو الاستلام من الفندق',
      de: 'Hurghada New Marina / Hotelabholung',
    },
    meetingPointUrl: 'https://maps.google.com/?q=Hurghada+Marina+Egypt',
    outerTransferEnabled: true,
    pickup: { en: 'Hurghada City included · Outer zones +€10–15/pp', ar: 'مدينة الغردقة مشمولة · المناطق الخارجية +10–15€ للفرد', de: 'Hurghada Stadt inklusive · Außenzonen +10–15 €/Pers.' },
    supplierName: 'Captain Karim Marine',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 3,
    kidsDiscount: { en: '50% off ages 4–11 · under 4 free', ar: 'خصم 50% من 4–11 سنة · مجاناً تحت 4 سنوات', de: '50% Rabatt (4–11 J.) · unter 4 frei' },
    featured: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'luxor-valley-small-van',
    name: {
      en: 'Luxor Temples & Valley of the Kings Small-Van Day',
      ar: 'رحلة معابد الأقصر ووادي الملوك بسيارة مرسيدس صغيرة',
      de: 'Luxor-Tempel & Tal der Könige im Kleinbus',
    },
    category: 'historical',
    destination: 'Luxor',
    images: [luxorTempleImg, luxorValleyKingsImg, luxorHatshepsutImg, luxorFeluccaImg],
    galleryCaptions: [
      {
        en: 'Great Hypostyle Hall & 134 carved sandstone columns at Karnak Temple (East Bank)',
        ar: 'صالة الأعمدة الكبرى و134 عموداً أثرياً في مجمع معابد الكرنك بالبر الشرقي',
        de: 'Große Säulenhalle mit 134 Sandsteinsäulen im Karnak-Tempel (Ostufer)',
      },
      {
        en: 'Sunlit canyon cliffs & royal painted tomb entrance in the Valley of the Kings',
        ar: 'منحدرات جبال طيبة ومداخل المقابر الملكية الملونة في وادي الملوك بالبر الغربي',
        de: 'Sonnendurchflutete Kalksteinfelsen und Königsgräber im Tal der Könige',
      },
      {
        en: 'Three-tiered limestone colonnades of Queen Hatshepsut at Deir el-Bahari',
        ar: 'المدرجات الثلاثة المنحوتة في الجبل بمعبد الملكة حتشبسوت بالدير البحري',
        de: 'Dreistufige Terrassenanlage der Königin Hatschepsut in Deir el-Bahari',
      },
      {
        en: 'Traditional Nile Felucca boat gliding past palm groves and Theban hills',
        ar: 'مركب الفلوكة الشراعي التقليدي يعبر نهر النيل أمام تلال البر الغربي',
        de: 'Traditionelle Felukke auf dem Nil vor Palmenhainen und den Thebanischen Bergen',
      },
    ],
    rating: 4.9,
    reviewCount: 49,
    duration: { en: '14 hours', ar: '14 ساعة (يوم كامل)', de: '14 Stunden' },
    departureTimes: ['05:00 AM'],
    timingNote: {
      en: 'Direct hotel pickup 04:45–05:15 AM · Return to hotel around 08:00 PM',
      ar: 'الاستلام من الفندق 04:45–05:15 صباحاً · العودة للفندق حوالي 08:00 مساءً',
      de: 'Hotelabholung 04:45–05:15 Uhr · Rückkehr ca. 20:00 Uhr',
    },
    price: 78,
    options: [
      {
        id: 'opt-luxor-van',
        title: {
          en: '8-Seat Mercedes Small-Van Tour',
          ar: 'جولة بميكروباص مرسيدس VIP (بحد أقصى 8 أفراد)',
          de: '8-Sitzer Mercedes Kleinbus-Tour',
        },
        detail: {
          en: 'Licensed Egyptologist + Karnak, Valley of the Kings (3 tombs), Hatshepsut Temple & Nile lunch',
          ar: 'مرشد أثري مرخص + معبد الكرنك ووادي الملوك (3 مقابر) وحتشبسوت وغداء على النيل',
          de: 'Ägyptologe + Karnak, Tal der Könige (3 Gräber), Hatschepsut & Nil-Mittagessen',
        },
        price: 78,
      },
      {
        id: 'opt-luxor-felucca',
        title: {
          en: 'Small-Van Tour + Felucca Nile Sail & Banana Island',
          ar: 'جولة الميكروباص الصغير + رحلة فلوكة في النيل وجزيرة الموز',
          de: 'Kleinbus-Tour + Felukenfahrt auf dem Nil & Bananeninsel',
        },
        detail: {
          en: 'Includes all East & West Bank temples + 45-min traditional Felucca boat crossing & fruit tasting',
          ar: 'شامل جميع معابد البر الشرقي والغربي + جولة فلوكة شراعية 45 دقيقة في النيل وتذوق الفاكهة',
          de: 'Inkl. Ost- & Westufer-Tempel + 45 Min. traditionelle Felukenfahrt & Obstverkostung',
        },
        price: 94,
      },
      {
        id: 'opt-luxor-private',
        title: {
          en: 'Private Sedan / Van + Dedicated Egyptologist',
          ar: 'سيارة خاصة + مرشد أثري خاص بك وعائلتك فقط',
          de: 'Privater PKW / Van + eigener Ägyptologe',
        },
        detail: {
          en: '100% flexible pace · Private A/C vehicle, custom temple schedule & private Nile-view table',
          ar: 'خصوصية ومرونة كاملة · سيارة مكيفة خاصة وترتيب مزارات مرن وطاولة غداء خاصة على النيل',
          de: 'Eigenes Tempo · Klimatisierter Privatwagen, flexibler Zeitplan & privater Tisch am Nil',
        },
        price: 145,
      },
    ],
    shortDescription: {
      en: 'Explore Ancient Thebes in an 8-seat A/C Mercedes Sprinter with a licensed Egyptologist: Karnak Temple, Valley of the Kings, Hatshepsut Temple, Colossi of Memnon, and a freshly cooked Nile-side lunch — with zero forced bazaar stops.',
      ar: 'استكشف طيبة القديمة في سيارة مرسيدس مكيفة (8 مقاعد فقط) مع مرشد أثري مرخص: معبد الكرنك، وادي الملوك، معبد حتشبسوت، تمثالا ممنون، وغداء مصري طازج على ضفاف النيل — بدون أي توقفات تسوق إجبارية.',
      de: 'Entdecken Sie das antike Theben im klimatisierten 8-Sitzer Mercedes Sprinter mit lizenziertem Ägyptologen: Karnak-Tempel, Tal der Könige, Hatschepsut-Tempel, Memnonkolosse und Mittagessen am Nil — ohne Verkaufsstopps.',
    },
    highlights: [
      {
        en: 'Strictly 8 guests max per Mercedes Sprinter — beat the 50-seat coach crowds by 90 minutes',
        ar: 'بحد أقصى 8 ضيوف فقط في سيارة مرسيدس سبرينتر — وصول أسرع وتجنب زحام الأتوبيسات الكبيرة',
        de: 'Maximal 8 Gäste pro Mercedes Sprinter — 90 Minuten schneller als große Reisebusse',
      },
      {
        en: 'Walk through the Great Hypostyle Hall of Karnak Temple (134 giant columns) in the cool morning light',
        ar: 'جولة معمقة داخل صالة الأعمدة الكبرى بمعبد الكرنك (134 عموداً فرعونياً) في هدوء الصباح',
        de: 'Spaziergang durch die Große Säulenhalle des Karnak-Tempels (134 Säulen) im kühlen Morgenlicht',
      },
      {
        en: 'Enter 3 royal painted tombs inside the Valley of the Kings with full historical briefing',
        ar: 'دخول 3 مقابر ملكية ملونة داخل وادي الملوك بالبر الغربي مع شرح تاريخي مفصل',
        de: 'Besuch von 3 reich verzierten Königsgräbern im Tal der Könige mit ausführlicher Führung',
      },
      {
        en: 'Visit the cliff-carved Mortuary Temple of Queen Hatshepsut at Deir el-Bahari & Colossi of Memnon',
        ar: 'زيارة معبد الملكة حتشبسوت المنحوت في جبل الدير البحري والوقوف أمام تمثالي ممنون العملاقين',
        de: 'Besichtigung des Terrassentempels der Königin Hatschepsut und der Memnonkolosse',
      },
      {
        en: 'Freshly prepared Egyptian lunch on a shaded terrace overlooking the Nile River',
        ar: 'غداء مصري طازج في مطعم مطل مباشرة على نهر النيل في أجواء هادئة ومظللة',
        de: 'Frisch zubereitetes ägyptisches Mittagessen auf einer schattigen Terrasse direkt am Nil',
      },
      {
        en: '100% Zero-Bazaar Guarantee — no forced alabaster, papyrus, or perfume factory detours',
        ar: 'ضمان صفر بازارات إجبارية — لا نضيع وقتك في مصانع الألباستر أو البردي أو العطور',
        de: '100 % Ohne-Verkaufsstopps-Garantie — keine erzwungene Alabaster- oder Papyrusfabriken',
      },
    ],
    historicalFacts: [
      {
        era: { en: 'New Kingdom · c. 2055–1070 BC', ar: 'الدولة الحديثة · ق.م 2055–1070', de: 'Neues Reich · ca. 2055–1070 v. Chr.' },
        title: { en: 'Karnak: World’s Largest Temple Complex', ar: 'الكرنك: أكبر مجمع معابد دينية في التاريخ', de: 'Karnak: Größte Tempelanlage der Antike' },
        metric: { en: '134 columns · 23m tall', ar: '134 عموداً · ارتفاع 23م', de: '134 Säulen · 23 m hoch' },
        fact: {
          en: 'Built and expanded across more than 1,500 years by over 30 pharaohs, Karnak’s Great Hypostyle Hall covers 5,000 square meters with central papyrus columns tall enough for six people to stand atop each capital.',
          ar: 'تم تشييد وتوسيع معابد الكرنك على مدار أكثر من 1,500 عام بأمر أكثر من 30 ملكاً فرعونياً؛ وتضم صالة الأعمدة الكبرى 134 عموداً عملاقاً من الحجر الرملي على مساحة 5,000 متر مربع.',
          de: 'Über 30 Pharaonen bauten über 1.500 Jahre an Karnak. Die Große Säulenhalle bedeckt 5.000 m² und zählt 134 gewaltige Papyrussäulen aus Sandstein.',
        },
      },
      {
        era: { en: 'Dynasties XVIII–XX · c. 1539–1075 BC', ar: 'الأسرات 18–20 · ق.م 1539–1075', de: '18.–20. Dynastie · ca. 1539–1075 v. Chr.' },
        title: { en: 'Valley of the Kings Royal Necropolis', ar: 'وادي الملوك ومقابر الفراعنة المحفوظة', de: 'Königsgräber im Tal der Könige' },
        metric: { en: '63 rock-cut tombs', ar: '63 مقبرة منحوتة بالصخر', de: '63 Felsengräber' },
        fact: {
          en: 'To protect royal burials from tomb raiders, New Kingdom rulers abandoned pyramids for hidden corridors carved deep beneath the pyramid-shaped peak of Al-Qurn, adorned with astronomical ceilings and the Book of Gates.',
          ar: 'لحماية المقابر الملكية، ترك فراعنة الدولة الحديثة بناء الأهرامات ونحتوا ممرات سرية في باطن الجبل أسفل قمة القرنة الهرمية، وزُينت جدرانها بنصوص البعث والألوان الطبيعية الساطعة.',
          de: 'Um Plünderungen zu entgehen, ließen Pharaonen des Neuen Reiches tief im Kalkstein unter dem Gipfel Al-Qurn prachtvoll bemalte Felsengräber anlegen.',
        },
      },
      {
        era: { en: 'Eighteenth Dynasty · c. 1479–1458 BC', ar: 'الأسرة 18 · ق.م 1479–1458', de: '18. Dynastie · ca. 1479–1458 v. Chr.' },
        title: { en: 'Hatshepsut & Royal Architect Senenmut', ar: 'الملكة حتشبسوت وعمارة الدير البحري', de: 'Hatschepsut & Architekt Senenmut' },
        metric: { en: '3 monumental terraces', ar: '3 مدرجات معمارية', de: '3 monumentale Terrassen' },
        fact: {
          en: 'Designed by Senenmut for Egypt’s most celebrated female pharaoh, the temple blends seamlessly into the vertical cliffs of Deir el-Bahari and preserves detailed stone reliefs of her maritime expedition to the Land of Punt.',
          ar: 'صممه المهندس الملكي سننموت للملكة حتشبسوت في انسجام مذهل مع جرف الدير البحري الجبلي، وتروي نقوشه تفاصيل بعثتها التجارية التاريخية إلى بلاد بونت.',
          de: 'Vom Baumeister Senenmut für Ägyptens bedeutendste Pharaonin entworfen, schmiegen sich die drei Säulenterrassen direkt an die Steilwand von Deir el-Bahari.',
        },
      },
      {
        era: { en: 'Amenhotep III · c. 1350 BC', ar: 'أمنحتب الثالث · ق.م 1350', de: 'Amenophis III. · ca. 1350 v. Chr.' },
        title: { en: 'Singing Colossi of Memnon', ar: 'تمثالا ممنون وحجر الكوارتزيت النوبي', de: 'Die singenden Memnonkolosse' },
        metric: { en: '18m height · ~720 tons', ar: 'ارتفاع 18م · ~720 طن', de: '18 m Höhe · ca. 720 Tonnen' },
        fact: {
          en: 'Carved from single quartzite blocks quarried near Cairo and dragged 670 km south, these twin seated statues of Amenhotep III famously drew Roman emperors after an earthquake made the northern statue “sing” at dawn.',
          ar: 'نُحت التمثالان من كتلتين هائلتين من الكوارتزيت نُقلتا من الجبل الأحمر لمسافة 670 كم، واشتُهرا في العصر الروماني بالصوت الموسيقي الذي كان يصدر عند شروق الشمس.',
          de: 'Aus je einem einzigen Quarzitblock gehauen und 670 km weit transportiert, zogen die Kolosse in der Antike Besucher an, da der Nordkoloss bei Sonnenaufgang zu „singen“ schien.',
        },
      },
    ],
    fullDescription: {
      en: `Discover Upper Egypt in an 8-seat A/C Mercedes Sprinter with a licensed Egyptologist — arriving at Karnak Temple 90 minutes ahead of large tour coaches and exploring both East and West Banks at an unhurried pace.

We guarantee zero forced souvenir, alabaster, or perfume factory detours so your full day stays focused on ancient monuments, shaded rest breaks, and a freshly cooked Nile-side lunch.`,
      ar: `استكشف مدينة الأقصر في سيارة مرسيدس سبرينتر حديثة ومكيفة بحد أقصى 8 أفراد فقط مع مرشد أثري مرخص — وصول مبكر لمعبد الكرنك قبل زحام الأتوبيسات الكبيرة مع وتيرة مريحة تشمل معابد البر الشرقي والغربي.

نضمن لك صفر توقفات تسوق إجبارية في مصانع الألباستر أو البردي، ليظل يومك مخصصاً للتاريخ، استراحات الظل، وغداء طازج على ضفاف النيل.`,
      de: `Erleben Sie Oberägypten im klimatisierten 8-Sitzer Mercedes Sprinter mit lizenziertem Ägyptologen — ohne Massenabfertigung und 90 Minuten vor den großen Reisebussen am Karnak-Tempel.

Wir garantieren 0 % erzwungene Verkaufsstopps, damit der ganze Tag den Tempeln, schattigen Pausen und einem frisch gekochten Mittagessen am Nil gehört.`,
    },
    itinerary: [
      {
        kind: 'pickup',
        title: {
          en: 'Pickup location:',
          ar: 'نقطة الاستلام:',
          de: 'Abholort:',
        },
        subtitle: {
          en: 'Hurghada & Outer Zones (05:00 AM)',
          ar: 'فندقك في الغردقة والمناطق الخارجية (05:00 صباحاً)',
          de: 'Hurghada & Umgebung (05:00 Uhr)',
        },
      },
      {
        kind: 'break',
        title: {
          en: 'Desert coffee & rest stop (20 min)',
          ar: 'استراحة قهوة في الطريق الصحراوي (20 دقيقة)',
          de: 'Kaffee- & Rastpause in der Ostwüste (20 Min.)',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Karnak Temple Complex',
          ar: 'مجمع معابد الكرنك (البر الشرقي)',
          de: 'Tempelanlage von Karnak',
        },
        subtitle: {
          en: 'Guided tour · Great Hypostyle Hall (2 hours)',
          ar: 'جولة إرشادية · صالة الأعمدة الكبرى (ساعتان)',
          de: 'Geführte Tour · Große Säulenhalle (2 Stunden)',
        },
      },
      {
        kind: 'break',
        title: {
          en: 'Nile-side Egyptian lunch',
          ar: 'غداء مصري طازج على ضفاف النيل',
          de: 'Mittagessen direkt am Nil',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Valley of the Kings',
          ar: 'وادي الملوك (البر الغربي)',
          de: 'Tal der Könige',
        },
        subtitle: {
          en: 'Guided visit & 3 royal painted tombs (1.5 hours)',
          ar: 'زيارة 3 مقابر ملكية ملونة مع الشرح (ساعة ونصف)',
          de: 'Führung & 3 Königsgräber (1,5 Stunden)',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Temple of Queen Hatshepsut',
          ar: 'معبد الملكة حتشبسوت (الدير البحري)',
          de: 'Terrassentempel der Hatschepsut',
        },
        subtitle: {
          en: 'Guided tour & photo stop (1 hour)',
          ar: 'جولة إرشادية وتصوير (ساعة واحدة)',
          de: 'Führung & Fotostopp (1 Stunde)',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Colossi of Memnon',
          ar: 'تمثالا ممنون العملاقان',
          de: 'Memnonkolosse',
        },
        subtitle: {
          en: 'Photo stop (20 min)',
          ar: 'وقفة تصوير وشرح (20 دقيقة)',
          de: 'Fotostopp (20 Min.)',
        },
      },
      {
        kind: 'end',
        title: {
          en: 'Arrive back at:',
          ar: 'العودة إلى:',
          de: 'Rückkehr nach:',
        },
        subtitle: {
          en: 'Your hotel in Hurghada (~08:00 PM)',
          ar: 'فندقك في الغردقة (حوالي 08:00 مساءً)',
          de: 'Ihr Hotel in Hurghada (ca. 20:00 Uhr)',
        },
      },
    ],
    included: [
      {
        en: 'Door-to-door A/C 8-seat Mercedes Sprinter transfer with chilled bottled water on board',
        ar: 'انتقالات من وإلى بوابة الفندق بسيارة مرسيدس سبرينتر 8 مقاعد مكيفة مع مياه معدنية باردة طوال الطريق',
        de: 'Hin- & Rücktransfer im klimatisierten 8-Sitzer Mercedes Sprinter inkl. gekühltem Wasser',
      },
      {
        en: 'Official entry tickets: Karnak Temple, Valley of the Kings (3 tombs), Hatshepsut Temple & Colossi of Memnon',
        ar: 'تذاكر الدخول الرسمية: معبد الكرنك، وادي الملوك (3 مقابر)، معبد حتشبسوت، وتمثالا ممنون',
        de: 'Alle Eintrittskarten: Karnak-Tempel, Tal der Könige (3 Gräber), Hatschepsut-Tempel & Memnonkolosse',
      },
      {
        en: 'State-licensed Egyptologist tour guide in your chosen language (English, Arabic, or German)',
        ar: 'مرشد سياحي وأثري معتمد من وزارة السياحة والآثار باللغة العربية أو الإنجليزية أو الألمانية',
        de: 'Staatlich lizenzierter Ägyptologe in Ihrer gewählten Sprache (Deutsch, Englisch oder Arabisch)',
      },
      {
        en: 'Freshly cooked Egyptian buffet lunch at a shaded Nile-view restaurant',
        ar: 'وجبة غداء بوفيه مصري طازج في مطعم مطل مباشرة على نهر النيل',
        de: 'Frisch zubereitetes ägyptisches Mittagsbuffet in einem Restaurant direkt am Nil',
      },
      {
        en: 'All highway security permits, tourist police clearance, taxes & parking fees',
        ar: 'جميع تصاريح الطريق والأمن السياحي والضرائب ورسوم الانتظار',
        de: 'Alle Straßengenehmigungen, Steuern und Parkgebühren',
      },
    ],
    tips: [
      {
        en: 'Drinks during restaurant lunch & optional King Tutankhamun extra tomb ticket (~€14 on site)',
        ar: 'المشروبات داخل مطعم الغداء وتذكرة دخول مقبرة توت عنخ آمون الإضافية (اختيارية ~14 يورو)',
        de: 'Getränke beim Mittagessen & optionales Zusatz-Ticket für das Tutanchamun-Grab (~14 € vor Ort)',
      },
      {
        en: 'Outer-zone hotel pickup surcharge (+€10–15/pp from El Gouna, Makadi, Soma Bay, or Safaga)',
        ar: 'رسوم التوصيل الإضافية للمناطق الخارجية (+10–15 يورو للفرد من الجونة أو مكادي أو سوما باي أو سفاجا)',
        de: 'Transferzuschlag für Außenbezirke (+10–15 €/Person ab El Gouna, Makadi, Soma Bay oder Safaga)',
      },
      {
        en: 'Optional driver & Egyptologist gratuities',
        ar: 'إكراميات السائق والمرشد الأثري (اختيارية تماماً)',
        de: 'Optionale Trinkgelder für Fahrer und Ägyptologen',
      },
    ],
    notSuitableFor: [
      {
        en: 'Guests with severe mobility impairments unable to walk on uneven temple stones or tomb stairs',
        ar: 'الأشخاص الذين يعانون من صعوبات حركية شديدة تمنعهم من المشي على أرضيات المعابد أو سلالم المقابر',
        de: 'Gäste mit starker Gehbehinderung (unebene Tempelböden und Stufen in den Königsgräbern)',
      },
      {
        en: 'Infants under 2 years old during peak mid-summer daytime temperatures (July–August)',
        ar: 'الأطفال الرضع أقل من سنتين خلال ذروة حرارة الظهيرة في شهري يوليو وأغسطس',
        de: 'Kleinkinder unter 2 Jahren während der Hochsommerhitze im Juli und August',
      },
    ],
    meetingPoint: {
      en: 'Direct pickup from your hotel main security gate in Hurghada or outer zones (exact minute confirmed via WhatsApp the evening before) · First monument stop: Karnak Temple Plaza, Luxor.',
      ar: 'استلام مباشر من البوابة الرئيسية لفندقك في الغردقة أو المناطق المجاورة (يتم تأكيد الدقيقة المحددة عبر واتساب مساء اليوم السابق) · أول نقطة وصول: ساحة معبد الكرنك بالأقصر.',
      de: 'Direkte Abholung am Haupteingang Ihres Hotels (genaue Uhrzeit am Vorabend per WhatsApp) · Erster Besichtigungspunkt: Karnak-Tempelplatz, Luxor.',
    },
    meetingPointUrl: 'https://maps.google.com/?q=Karnak+Temple+Luxor+Egypt',
    whatToBring: [
      {
        en: 'Passport or clear mobile photo of your passport bio page (required at the Safaga desert checkpoint)',
        ar: 'جواز السفر أو البطاقة الشخصية (أو صورة واضحة على الهاتف لنقطة تصاريح طريق سفاجا - الأقصر)',
        de: 'Reisepass oder deutliches Handyfoto der Passseite (erforderlich am Kontrollpunkt Safaga)',
      },
      {
        en: 'Comfortable walking shoes, sunglasses, sun hat & high-SPF sunscreen',
        ar: 'حذاء مشي مريح، نظارة شمسية، قبعة للرأس، وكريم وقاية من الشمس',
        de: 'Bequeme Laufschuhe, Sonnenbrille, Sonnenhut und Sonnencreme',
      },
      {
        en: 'Breakfast box from your hotel reception (order it the evening before prior to 08:00 PM)',
        ar: 'بوكس الإفطار الصباحي من استقبال الفندق (يُطلب من الريسبشن مساء اليوم السابق قبل 8 مساءً)',
        de: 'Frühstücksbox von Ihrer Hotelrezeption (bitte am Vorabend bis 20:00 Uhr bestellen)',
      },
      {
        en: 'Light shawl or jacket for the air-conditioned van in the early morning',
        ar: 'شال خفيف أو جاكيت خفيف لبرودة التكييف في الصباح الباكر',
        de: 'Leichte Jacke oder Schal für den klimatisierten Kleinbus am frühen Morgen',
      },
    ],
    notAllowed: [
      {
        en: 'Flash photography or professional tripod stands inside the painted tombs of the Valley of the Kings',
        ar: 'التصوير بالفلاش أو استخدام حامل الكاميرا الثلاثي (Tripod) داخل مقابر وادي الملوك الملونة',
        de: 'Blitzlichtfotografie oder Stative im Inneren der bemalten Königsgräber',
      },
      {
        en: 'Touching carved hieroglyphic reliefs or tomb wall pigments',
        ar: 'لمس النقوش الهيروغليفية البارزة أو الألوان الأصلية على جدران المقابر',
        de: 'Berühren der Hieroglyphen-Reliefs oder Wandmalereien in den Gräbern',
      },
      {
        en: 'Drones or unmanned aerial cameras (strictly prohibited at Egyptian archaeological sites)',
        ar: 'طائرات الدرون للتصوير الجوي (ممنوعة تماماً في المناطق الأثرية المصرية)',
        de: 'Drohnen (an allen ägyptischen archäologischen Stätten streng verboten)',
      },
    ],
    knowBeforeYouGo: [
      {
        en: 'Travel license clearance requires guest nationality and room number via WhatsApp by 07:00 PM the day before.',
        ar: 'لتجهيز تصريح الشرطة السياحية، نحتاج الاسم ورقم الغرفة والجنسية عبر واتساب قبل الساعة 7:00 مساء اليوم السابق.',
        de: 'Für die Reisegenehmigung benötigen wir bis 19:00 Uhr am Vorabend Ihre Nationalität und Zimmernummer per WhatsApp.',
      },
      {
        en: 'Mobile photography inside the 3 included royal tombs is completely free of charge.',
        ar: 'التصوير بالهاتف المحمول (بدون فلاش) داخل المقابر الثلاث المشمولة مجاني تماماً.',
        de: 'Das Fotografieren mit dem Smartphone (ohne Blitz) ist in den 3 enthaltenen Gräbern kostenlos.',
      },
      {
        en: 'Vegetarian, vegan, and gluten-free lunch plates are available upon request when booking.',
        ar: 'تتوفر وجبات غداء نباتية أو خالية من الجلوتين عند الإشارة لذلك في ملاحظات الحجز.',
        de: 'Vegetarische, vegane und glutenfreie Gerichte sind auf Anfrage beim Mittagessen verfügbar.',
      },
    ],
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada City included · Outer zones +€10–15/pp',
      ar: 'مدينة الغردقة مشمولة · المناطق الخارجية +10–15€ للفرد',
      de: 'Hurghada Stadt inklusive · Außenzonen +10–15 €/Pers.',
    },
    languages: ['English', 'العربية', 'Deutsch'],
    supplierName: 'Nile Horizon Guides',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 5,
    kidsDiscount: { en: '35% off ages 5–11 · under 5 free', ar: 'خصم 35% للأطفال 5–11 سنة · مجاناً تحت 5 سنوات', de: '35% Rabatt für Kinder (5–11 J.) · unter 5 frei' },
    featured: true,
    operatingDays: [0, 2, 4],
  },
  {
    id: 'eastern-desert-sunset-safari',
    name: {
      en: 'Eastern Desert Quad, Buggy & Bedouin Tea at Dusk',
      ar: 'سفاري الصحراء الشرقية بالكواد وشاي بدوي عند الغروب',
      de: 'Wüstensafari mit Quad, Buggy & Beduinentee',
    },
    category: 'desert',
    destination: 'Hurghada',
    images: [desertSunsetImg, horseBeachImg],
    rating: 4.8,
    reviewCount: 53,
    duration: { en: '4 hours', ar: '4 ساعات', de: '4 Stunden' },
    departureTimes: ['02:30 PM (Sunset)'],
    price: 32,
    options: [
      {
        id: 'opt-safari-quad',
        title: { en: 'Single Quad + Bedouin Tea', ar: 'بيتش باجي فردي + شاي بدوي', de: 'Einzel-Quad + Beduinentee' },
        detail: { en: '1 rider per quad · sunset stop + camel ride', ar: 'راكب واحد · توقف للغروب وركوب جمال', de: '1 Fahrer pro Quad · Sonnenuntergang & Kamelritt' },
        price: 32,
      },
      {
        id: 'opt-safari-buggy',
        title: { en: '2-Seat Family Dune Buggy + Dinner', ar: 'باجي عائلي لشخصين + عشاء بدوي', de: '2-Sitzer Familien-Buggy + Abendessen' },
        detail: { en: 'Side-by-side steering wheel buggy + BBQ dinner', ar: 'باجي بمقود مزدوج للعائلات + عشاء مشويات', de: 'Nebeneinander-Buggy + BBQ-Abendessen' },
        price: 49,
      },
    ],
    shortDescription: {
      en: 'Ride open Red Sea mountain wadis before sunset, enjoy fresh Bedouin bread and tea, and return under clear desert skies.',
      ar: 'جولة في وديان جبال البحر الأحمر قبل الغروب مع خبز بدوي طازج وشاي تحت سماء الصحراء.',
      de: 'Fahrt durch weite Bergwadis zum Sonnenuntergang mit frischem Beduinenbrot und Tee.',
    },
    highlights: [
      {
        en: 'Guided pace matched to your group — never a rushed convoy',
        ar: 'سرعة تناسب مجموعتك بدون استعجال',
        de: 'Angepasstes Tempo ohne gehetzte Kolonnen',
      },
      {
        en: '2-seat family buggies available for parents riding with kids',
        ar: 'توافر باجي عائلي بمقعدين للأهل مع الأطفال',
        de: '2-Sitzer-Familienbuggys für Eltern mit Kindern verfügbar',
      },
    ],
    historicalFacts: [
      {
        era: { en: 'Eastern Desert Heritage', ar: 'تراث الصحراء الشرقية', de: 'Erbe der Ostwüste' },
        title: { en: 'Ma’aza & Ababda Bedouin Trails', ar: 'مسارات قبائل المعازة والعبابدة في جبال البحر الأحمر', de: 'Karawanenpfade der Ma’aza-Beduinen' },
        metric: { en: 'Red Sea Range · 2,187m peaks', ar: 'سلاسل البحر الأحمر', de: 'Bis zu 2.187 m Gipfelhöhe' },
        fact: {
          en: 'The wadis west of Hurghada follow ancient Roman porphyry quarry roads and traditional Ma’aza Bedouin seasonal camel tracks connecting the Nile Valley to Red Sea trading posts.',
          ar: 'تتبع وديان غرب الغردقة مسارات القوافل البدوية القديمة وطرق محاجر الرخام السماقي الرومانية التي ربطت وادي النيل بسواحل البحر الأحمر.',
          de: 'Die Wadis westlich von Hurghada folgen uralten Karawanenwegen der Beduinen und römischen Porphyr-Transportrouten zwischen Nil und Rotem Meer.',
        },
      },
    ],
    included: [
      { en: 'Round-trip Hurghada city hotel transfer', ar: 'توصيل ذهاب وعودة من فنادق مدينة الغردقة', de: 'Hin- & Rücktransfer ab Hurghada-Stadt' },
      { en: 'Quad/buggy, helmet, safety briefing & Bedouin supper', ar: 'الكواد أو الباجي والخوذة وعشاء بدوي وشاي', de: 'Quad/Buggy, Helm, Einweisung & Abendessen' },
    ],
    tips: [
      {
        en: 'Pick-up & drop-off outside Hurghada (El Gouna, Sahl Hasheesh, Makadi +€10/pp · Soma Bay, Safaga +€15/pp) is NOT included — please select your zone at checkout.',
        ar: 'التوصيل خارج الغردقة (الجونة، سهل حشيش، مكادي +10€ للفرد · سوما باي، سفاجا +15€ للفرد) رسوم إضافية — اختر منطقتك عند الحجز.',
        de: 'Abholung außerhalb von Hurghada (+10–15 €/Pers.) ist ein Zusatzoption — bitte Zone beim Buchen wählen.',
      },
      { en: 'Desert headscarf (Arafat) & goggles optional at station (€3–€5).', ar: 'الكوفية ونظارة الرمال اختيارية في المحطة.', de: 'Wüstentuch & Schutzbrille optional vor Ort.' },
    ],
    whatToBring: [
      { en: 'Closed-toe shoes, sunglasses & light scarf', ar: 'حذاء مغلق، نظارة شمسية ووشاح خفيف', de: 'Feste Schuhe, Sonnenbrille & leichtes Tuch' },
    ],
    notSuitableFor: [
      { en: 'Pregnant women & guests with severe back injuries', ar: 'الحوامل ومن يعانون من إصابات الظهر الشديدة', de: 'Schwangere & Personen mit Rückenproblemen' },
    ],
    outerTransferEnabled: true,
    pickup: { en: 'Hurghada City included · Outer zones +€10–15/pp', ar: 'الغردقة مشمولة · خارج الغردقة +10–15€ للفرد', de: 'Hurghada Stadt inkl. · Außenzonen +10–15 €/Pers.' },
    supplierName: 'Wadi Trail Hurghada',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 6,
    kidsDiscount: { en: 'Passenger buggy seat €18', ar: 'مقعد مرافق بالباجي 18 يورو', de: 'Beifahrersitz im Buggy €18' },
    featured: true,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'sahl-hasheesh-horse-swim',
    name: {
      en: 'Hurghada Coastal & Desert Horseback Ride',
      ar: 'ركوب الخيل على الساحل والصحراء في الغردقة',
      de: 'Hurghada Ausritt am Strand & durch die Wüste',
    },
    category: 'horse',
    destination: 'Hurghada',
    images: [horseBeachImg, heroRedSeaVibrantImg],
    rating: 5.0,
    reviewCount: 38,
    duration: { en: '2.5 hours', ar: '2.5 ساعة', de: '2,5 Stunden' },
    departureTimes: ['07:30 AM (Sunrise)', '10:00 AM (Morning)', '02:30 PM (Afternoon)', '04:30 PM (Sunset)'],
    price: 45,
    options: [
      {
        id: 'opt-horse-ride-only',
        title: {
          en: 'Guided Horse Ride (Beach or Desert · Hurghada Pickup)',
          ar: 'جولة ركوب خيل مع مدرب (شاطئ أو صحراء · شامل توصيل الغردقة)',
          de: 'Geführter Ausritt (Strand oder Wüste · inkl. Hurghada-Transfer)',
        },
        detail: {
          en: 'Safety briefing, instructor & bottled water · 2.5 hrs',
          ar: 'شرح أمان + مدرب يتحدث الإنجليزية + مياه معدنية · 2.5 ساعة',
          de: 'Sicherheitseinweisung, Reitlehrer & Wasser · 2,5 Std.',
        },
        price: 45,
      },
      {
        id: 'opt-horse-photoshoot',
        title: {
          en: 'Horseback Ride + Professional Photoshoot Add-On',
          ar: 'جولة ركوب الخيل + جلسة تصوير فوتوغرافي احترافية',
          de: 'Ausritt + Professionelles Fotoshooting',
        },
        detail: {
          en: 'Dedicated photographer capturing candid & posed Red Sea photos',
          ar: 'مصور محترف لالتقاط أجمل الصور مع الخيل على البحر والصحراء',
          de: 'Eigener Fotograf für unvergessliche Strand- & Wüstenfotos',
        },
        price: 75,
      },
    ],
    shortDescription: {
      en: 'Guided horseback ride along the Red Sea coast or desert wadis, tailored for beginners and experienced riders with optional photoshoot.',
      ar: 'تجربة فريدة لركوب الخيل على ساحل البحر الأحمر أو في الصحراء للمبتدئين والمحترفين مع خيار جلسة تصوير احترافية.',
      de: 'Geführter Ausritt entlang des Roten Meeres oder durch die Wüste – ideal für Anfänger & Fortgeschrittene mit optionalem Fotoshooting.',
    },
    fullDescription: {
      en: 'Experience a unique horse-riding adventure in Hurghada, combining nature, relaxation and the option to capture unforgettable moments with an optional professional photoshoot.\n\nBegin your journey with a guided horseback ride through stunning desert landscapes or along the Red Sea coast, depending on weather conditions and your preference. Whether you are a beginner or an experienced rider, our professional team will ensure a safe and enjoyable experience tailored to your level.\n\nFor those who want to make the experience even more special, an optional photoshoot is available during the ride. Capture beautiful, Instagram-style moments with the horses in breathtaking natural surroundings — from candid shots to posed photos that highlight the beauty of the landscape.\n\nThis experience is perfect for couples, friends, solo travellers and content creators looking for something unique and memorable in Hurghada. Enjoy the peaceful atmosphere, connect with nature and create lasting memories in one of Egypt’s most beautiful destinations.',
      ar: 'استمتع بتجربة فريدة لركوب الخيل في الغردقة تجمع بين الطبيعة والاسترخاء وإمكانية توثيق لحظات لا تُنسى مع خيار جلسة تصوير احترافية.\n\nابدأ رحلتك بجولة ركوب خيل مع مدرب عبر المناظر الصحراوية الخلابة أو على ساحل البحر الأحمر حسب حالة الطقس ورغبتك. سواء كنت مبتدئاً أو فارساً محترفاً، يضمن فريقنا تجربة آمنة وممتعة تناسب مستواك.\n\nإذا رغبت بجعل التجربة أكثر تميزاً، تتوفر جلسة تصوير احترافية أثناء الجولة لالتقاط أجمل الصور الطبيعية مع الخيول. هذه التجربة مثالية للأزواج والأصدقاء والمسافرين المنفردين وصنّاع المحتوى.',
      de: 'Erleben Sie ein unvergessliches Reitabenteuer in Hurghada – eine Verbindung aus Natur, Entspannung und der Möglichkeit für ein professionelles Fotoshooting.\n\nBeginnen Sie Ihren geführten Ausritt durch beeindruckende Wüstenlandschaften oder entlang der Küste des Roten Meeres, angepasst an Wetter und Ihr Reitniveau. Ob Anfänger oder erfahrener Reiter: unser Team sorgt für Sicherheit und Freude.\n\nIdeal für Paare, Freunde, Alleinreisende und Content-Creator.',
    },
    highlights: [
      {
        en: 'Enjoy a guided horseback ride along the Red Sea or through the desert',
        ar: 'استمتع بجولة ركوب خيل مع مدرب على ساحل البحر الأحمر أو في الصحراء',
        de: 'Geführter Ausritt am Roten Meer oder durch die Wüste',
      },
      {
        en: 'Capture your adventure with an optional professional photoshoot',
        ar: 'وثّق مغامرتك بخيار جلسة تصوير احترافية مع الخيول',
        de: 'Optionales professionelles Fotoshooting während des Ritts',
      },
      {
        en: 'Choose between a beach or desert ride, depending on the weather',
        ar: 'اختر بين جولة الشاطئ أو الصحراء حسب رغبتك وحالة الطقس',
        de: 'Wahl zwischen Strand- oder Wüstenritt je nach Wetterlage',
      },
      {
        en: 'Get high-quality photos of you with the horses in stunning scenery',
        ar: 'احصل على صور عالية الجودة لك مع الخيول في مناظر طبيعية خلابة',
        de: 'Hochwertige Fotos mit den Pferden in traumhafter Kulisse',
      },
      {
        en: 'Experience a safe and enjoyable ride, whether you’re a beginner or an expert',
        ar: 'تجربة آمنة وممتعة تناسب المبتدئين والفرسان المحترفين على حد سواء',
        de: 'Sicherer & angenehmer Ritt für Anfänger wie auch erfahrene Reiter',
      },
    ],
    included: [
      { en: 'Optional hotel pickup and drop-off from Hurghada (if selected)', ar: 'التوصيل من وإلى فنادق مدينة الغردقة', de: 'Hotelabholung & Rücktransfer ab Hurghada-Stadt' },
      { en: 'Guided horse riding experience & professional English-speaking instructor', ar: 'تجربة ركوب الخيل مع مدرب محترف يتحدث الإنجليزية', de: 'Geführter Ausritt mit professionellem englischsprachigem Reitlehrer' },
      { en: 'Professional photoshoot during the activity (if selected)', ar: 'جلسة تصوير احترافية أثناء النشاط (عند اختيار أوبشن التصوير)', de: 'Professionelles Fotoshooting (wenn als Option gewählt)' },
      { en: 'Safety briefing, assistance, horse equipment & supervision throughout the tour', ar: 'شرح الأمان والمعدات والعناية والإشراف طوال الجولة', de: 'Sicherheitseinweisung, Reitausrüstung & durchgehende Betreuung' },
      { en: 'Bottled water', ar: 'مياه معدنية معبأة', de: 'Mineralwasser' },
    ],
    tips: [
      {
        en: 'Photography services unless the Photoshoot option is selected',
        ar: 'خدمات التصوير الاحترافي غير مشمولة إلا عند اختيار أوبشن جلسة التصوير',
        de: 'Fotografieservice nicht inbegriffen, sofern nicht als Option gebucht',
      },
      {
        en: 'Pick-up and drop-off outside Hurghada are not included (Makadi, Sahl Hasheesh, El Gouna +€10/pp · Soma Bay or Safaga +€15/pp). Please select the hotel zone add-on at checkout.',
        ar: 'التوصيل خارج الغردقة غير مشمول بالسعر الأساسي (مكادي، سهل حشيش، الجونة +10€ للفرد · سوما باي أو سفاجا +15€ للفرد). يرجى تحديد منطقة الفندق عند الحجز لتفادي أي خلاف.',
        de: 'Abholung außerhalb von Hurghada (Makadi, Sahl Hasheesh, El Gouna +10 €/Pers. · Soma Bay, Safaga +15 €/Pers.) ist nicht inklusive — bitte wählen Sie die Zone beim Checkout.',
      },
    ],
    notSuitableFor: [
      { en: 'Children under 5 years', ar: 'الأطفال أقل من 5 سنوات', de: 'Kinder unter 5 Jahren' },
      { en: 'Pregnant women', ar: 'النساء الحوامل', de: 'Schwangere Frauen' },
      { en: 'People with back problems', ar: 'الأشخاص الذين يعانون من مشاكل في الظهر', de: 'Personen mit Rückenproblemen' },
      { en: 'Wheelchair users', ar: 'مستخدمو الكراسي المتحركة', de: 'Rollstuhlfahrer' },
      { en: 'People over 243 lbs (110 kg)', ar: 'الأشخاص فوق وزن 110 كجم (243 رطل)', de: 'Personen über 110 kg Körpergewicht' },
    ],
    meetingPoint: {
      en: 'Al-Bahr Coastal Stables, Hurghada South / Hotel Lobby Pickup',
      ar: 'اسطبلات البحر الساحلية الغردقة أو الاستلام من الفندق',
      de: 'Al-Bahr Küstenstall Hurghada / Hotelabholung',
    },
    meetingPointUrl: 'https://maps.google.com/?q=Sahl+Hasheesh+Hurghada+Egypt',
    whatToBring: [
      { en: 'Hat', ar: 'قبعة شمسية', de: 'Sonnenhut' },
      { en: 'Camera', ar: 'كاميرا أو هاتف مشحون', de: 'Kamera' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Comfortable clothes & closed shoes', ar: 'ملابس مريحة وأحذية مغلقة', de: 'Bequeme Kleidung & feste Schuhe' },
    ],
    notAllowed: [
      { en: 'Pets', ar: 'الحيوانات الأليفة', de: 'Haustiere' },
      { en: 'Alcohol and drugs', ar: 'الكحوليات والمواد المخدرة', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      { en: 'This experience is suitable for both beginners and experienced riders', ar: 'التجربة مناسبة للمبتدئين والفرسان أصحاب الخبرة على حد سواء', de: 'Für Anfänger und erfahrene Reiter gleichermaßen geeignet' },
      { en: 'Please wear comfortable clothing suitable for riding (no skirts or dresses)', ar: 'يرجى ارتداء ملابس مريحة مناسبة للركوب (يُمنع الجيب/الفساتين أثناء الركوب)', de: 'Bitte bequeme Reitkleidung tragen (keine Röcke oder Kleider)' },
      { en: 'Closed shoes recommended; helmets are fitted cleanly before mounting', ar: 'يفضل ارتداء حذاء رياضي مغلق وتُوفر الخوذة في الاسطبل', de: 'Geschlossene Schuhe empfohlen; Reithelme werden gestellt' },
    ],
    outerTransferEnabled: true,
    pickup: { en: 'Hurghada City included · Outer zones +€10–15/pp', ar: 'مدينة الغردقة مشمولة · المناطق الخارجية +10–15€ للفرد', de: 'Hurghada Stadt inkl. · Außenzonen +10–15 €/Pers.' },
    supplierName: 'Al-Bahr Stables',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 5,
    kidsDiscount: { en: 'Lead-rein pony walk €25', ar: 'جولة بوني للأطفال 25 يورو', de: 'Geführter Ponyritt €25' },
    featured: true,
    operatingDays: [1, 3, 5, 6],
  },
  {
    id: 'marsa-alam-abu-dabbab-turtles',
    name: {
      en: 'Marsa Alam Abu Dabbab Reef & Sea Turtles Day',
      ar: 'خليج أبو دباب في مرسى علم والسباحة مع السلاحف البحرية',
      de: 'Marsa Alam Abu Dabbab Riff & Meeresschildkröten',
    },
    category: 'sea',
    destination: 'Marsa Alam',
    images: [momentGuestImg, heroRedSeaVibrantImg, orangeBayImg],
    rating: 4.9,
    reviewCount: 41,
    duration: { en: '6 hours', ar: '6 ساعات', de: '6 Stunden' },
    departureTimes: ['09:00 AM'],
    price: 49,
    shortDescription: {
      en: 'Sandy-entry bay famous for resident green sea turtles and gentle seagrass meadows — zero boat required.',
      ar: 'خليج رملي شهير بالسلاحف البحرية الخضراء والشعاب المرجانية الهادئة بدون الحاجة لقارب.',
      de: 'Sandige Bucht bekannt für Meeresschildkröten und bunte Riffe — direkter Strandeinstieg ohne Boot.',
    },
    highlights: [
      {
        en: 'Walk straight in from soft sand — ideal for gentle swimmers',
        ar: 'دخول مباشر من الشاطئ الرملي بدون موج قوي',
        de: 'Bequemer Einstieg direkt vom weichen Sandstrand',
      },
      {
        en: 'Guided wildlife etiquette briefing with local reef ranger',
        ar: 'شرح احترام الحياة البحرية مع مرشد محلي',
        de: 'Respektvolle Tierbeobachtung mit lokalem Riff-Guide',
      },
    ],
    historicalFacts: [
      {
        era: { en: 'Southern Coast Ecology', ar: 'بيئة ساحل جنوب البحر الأحمر', de: 'Ökologie des südlichen Roten Meeres' },
        title: { en: 'Seagrass Sanctuary & Berenice Coast', ar: 'مرعى الأعشاب البحرية وساحل برنيس القديم', de: 'Seegraswiesen vor historischer Küste' },
        metric: { en: 'Resident Green Turtles', ar: 'سلاحف بحرية مقيمة', de: 'Heimische Meeresschildkröten' },
        fact: {
          en: 'Abu Dabbab’s shallow seagrass meadow shelters resident green sea turtles and rare dugongs just north of ancient Ptolemaic Berenice Troglodytica.',
          ar: 'يحتضن خليج أبو دباب مروج أعشاب بحرية طبيعية ترعى فيها السلاحف الخضراء والأطوم النادرة شمال ميناء برنيس البطلمي الأثري.',
          de: 'Die geschützte Seegraswiese von Abu Dabbab bietet Meeresschildkröten und seltenen Seekühen Nahrung nördlich des antiken Hafens Berenike.',
        },
      },
    ],
    included: [
      { en: 'Marsa Alam hotel transfer & beach beds', ar: 'توصيل مرسى علم وكراسي الشاطئ', de: 'Transfer in Marsa Alam & Sonnenliegen' },
      { en: 'Snorkel gear & coastal lunch', ar: 'معدات الغطس والغداء', de: 'Schnorchelausrüstung & Mittagessen' },
    ],
    pickup: { en: 'Marsa Alam & Port Ghalib', ar: 'مرسى علم وبورت غالب', de: 'Marsa Alam & Port Ghalib' },
    supplierName: 'South Red Sea Guides',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 4,
    kidsDiscount: { en: '40% off ages 4–11', ar: 'خصم 40% من 4–11 سنة', de: '40% Rabatt für Kinder (4–11 J.)' },
    featured: true,
    operatingDays: [1, 3, 6],
  },
  {
    id: 'hurghada-old-town-marina-walk',
    name: {
      en: 'Hurghada Marina, El Dahar Souq & Mosque City Tour',
      ar: 'جولة مدينة الغردقة: المارينا وسوق الدهار والمسجد الكبير',
      de: 'Hurghada Stadttour: Marina, El-Dahar-Basar & Moschee',
    },
    category: 'city',
    destination: 'Hurghada',
    images: [hurghadaMarinaImg, heroCoastImg],
    rating: 4.8,
    reviewCount: 29,
    duration: { en: '3.5 hours', ar: '3.5 ساعات', de: '3,5 Stunden' },
    departureTimes: ['10:00 AM (Morning)', '04:00 PM (Afternoon)'],
    price: 24,
    shortDescription: {
      en: 'Afternoon cultural walk through Old Town spice stalls, Coptic church, Al Mina Mosque, and harbourfront coffee.',
      ar: 'جولة ثقافية مسائية في سوق التوابل القديم والكنيسة ومسجد الميناء وقهوة المارينا.',
      de: 'Kultureller Nachmittagsspaziergang über den Gewürzmarkt zur Kirche, Moschee und Marina.',
    },
    highlights: [
      {
        en: 'Female or male guide available on request for solo women travelers',
        ar: 'مرشدة متاحة عند الطلب للمسافرات المنفردات',
        de: 'Auf Wunsch weibliche Reiseleitung für Alleinreisende',
      },
      {
        en: 'Zero commission shopping pressure — real local bakeries and markets',
        ar: 'بدون ضغط تسوق — مخابز وأسواق محلية حقيقية',
        de: 'Kein Verkaufsdruck — echte lokale Bäckereien und Märkte',
      },
    ],
    included: [
      { en: 'Door-to-door air-conditioned car', ar: 'سيارة مكيفة من وإلى الفندق', de: 'Klimatisierter Tür-zu-Tür-Transfer' },
      { en: 'Local guide & fresh sugarcane juice', ar: 'مرشد محلي وعصير قصب طازج', de: 'Lokaler Guide & frischer Zuckerrohrsaft' },
    ],
    pickup: { en: 'All Hurghada hotels', ar: 'جميع فنادق الغردقة', de: 'Alle Hotels in Hurghada' },
    supplierName: 'Wasla City Hosts',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 2,
    featured: false,
    operatingDays: [0, 2, 4, 6],
  },
  {
    id: 'cairo-pyramids-gem-day',
    name: {
      en: 'Giza Pyramids, Sphinx & Grand Egyptian Museum',
      ar: 'أهرامات الجيزة وأبو الهول والمتحف المصري الكبير',
      de: 'Pyramiden von Gizeh, Sphinx & Großes Ägyptisches Museum',
    },
    category: 'historical',
    destination: 'Cairo',
    images: [cairoPyramidsImg, luxorTempleImg],
    rating: 4.9,
    reviewCount: 34,
    duration: { en: '16 hours', ar: '16 ساعة', de: '16 Stunden' },
    departureTimes: ['04:00 AM'],
    price: 115,
    shortDescription: {
      en: 'Timed entry to the Giza Plateau and Sphinx paired with the Grand Egyptian Museum galleries and seated lunch.',
      ar: 'دخول منظم لهضبة الجيزة وأبو الهول مع جولة في المتحف المصري الكبير وغداء مريح.',
      de: 'Geplanter Einlass am Gizeh-Plateau mit Sphinx, Großem Ägyptischem Museum und Mittagessen.',
    },
    highlights: [
      {
        en: 'Dedicated Egyptologist focused on architecture and daily life',
        ar: 'مرشد أثري متخصص في التاريخ والعمارة الفرعونية',
        de: 'Eigener Ägyptologe mit Fokus auf Geschichte und Architektur',
      },
      {
        en: 'Optional domestic flight upgrade from Hurghada available',
        ar: 'إمكانية الترقية لطيران داخلي من الغردقة',
        de: 'Optionales Inlandsflug-Upgrade ab Hurghada möglich',
      },
    ],
    historicalFacts: [
      {
        era: { en: 'Old Kingdom · c. 2560 BC', ar: 'الدولة القديمة · ق.م 2560', de: 'Altes Reich · ca. 2560 v. Chr.' },
        title: { en: 'Great Pyramid of Khufu & Giza Necropolis', ar: 'الهرم الأكبر للملك خوفو وهضبة الجيزة', de: 'Cheops-Pyramide & Plateau von Gizeh' },
        metric: { en: '2.3 million blocks', ar: '2.3 مليون كتلة حجرية', de: '2,3 Mio. Steinblöcke' },
        fact: {
          en: 'Built by skilled Egyptian engineers and seasonal crews, the Great Pyramid stood as the tallest human-made structure on Earth for over 3,800 years.',
          ar: 'شُيد الهرم الأكبر بيد مهندسين وحرفيين مصريين، وظل أطول بناء من صنع الإنسان على وجه الأرض لأكثر من 3,800 عام.',
          de: 'Von erfahrenen ägyptischen Baumeistern errichtet, war die Große Pyramide über 3.800 Jahre lang das höchste Bauwerk der Welt.',
        },
      },
      {
        era: { en: 'Fourth Dynasty · c. 2520 BC', ar: 'الأسرة الرابعة · ق.م 2520', de: '4. Dynastie · ca. 2520 v. Chr.' },
        title: { en: 'The Great Sphinx of Khafre', ar: 'تمثال أبو الهول العظيم', de: 'Die Große Sphinx von Gizeh' },
        metric: { en: '73m length · Bedrock monolith', ar: 'طول 73م · صخرة واحدة', de: '73 m Länge · Monolith' },
        fact: {
          en: 'Sculpted directly out of the Giza plateau’s natural limestone ridge, the Sphinx guards the eastern causeway leading up to Khafre’s pyramid.',
          ar: 'نُحت التمثال مباشرة من صخر هضبة الجيزة الطبيعي ليحرس الطريق الصاعد إلى هرم الملك خفرع.',
          de: 'Direkt aus dem anstehenden Kalkstein des Plateaus gemeißelt, bewacht die Sphinx den Aufweg zur Chephren-Pyramide.',
        },
      },
    ],
    included: [
      { en: 'Return transfer & all tickets', ar: 'التوصيل والتذاكر الكاملة', de: 'Transfer & alle Eintrittskarten' },
      { en: 'Seated lunch overlooking Giza', ar: 'غداء مطل على الأهرامات', de: 'Mittagessen mit Blick auf Gizeh' },
    ],
    pickup: { en: 'Hurghada or Cairo hotels', ar: 'فنادق الغردقة أو القاهرة', de: 'Hotels in Hurghada oder Kairo' },
    supplierName: 'Nile Horizon Guides',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 6,
    kidsDiscount: { en: '30% off ages 6–11', ar: 'خصم 30% من 6–11 سنة', de: '30% Rabatt für Kinder (6–11 J.)' },
    featured: false,
    operatingDays: [1, 3, 5],
  },
  {
    id: 'hurghada-private-airport-transfer',
    name: {
      en: 'Hurghada Airport & Resort Private Transfers',
      ar: 'توصيلات خاصة من مطار الغردقة إلى مرسى علم والأقصر',
      de: 'Privattransfers: Flughafen Hurghada & Resorts',
    },
    category: 'transfers',
    destination: 'Hurghada',
    images: [privateVanImg, hurghadaMarinaImg],
    rating: 4.9,
    reviewCount: 82,
    duration: { en: '30–240 mins', ar: '30–240 دقيقة', de: '30–240 Min.' },
    departureTimes: [],
    timingNote: { en: 'According to flight time', ar: 'حسب ميعاد الطيارة', de: 'Nach Flugzeit' },
    price: 18,
    shortDescription: {
      en: 'Fixed whole-euro private sedan or minivan with flight tracking, name sign at arrivals, and child seats on request.',
      ar: 'سيارة خاصة أو ميني فان بسعر ثابت باليورو مع متابعة الرحلة ومقعد أطفال عند الطلب.',
      de: 'Festpreis-Privatwagen oder Minivan mit Flugverfolgung, Namensschild und Kindersitzen auf Wunsch.',
    },
    highlights: [
      {
        en: 'Driver details & vehicle plate sent via WhatsApp before pickup',
        ar: 'إرسال بيانات السائق ورقم السيارة عبر واتساب قبل الموعد',
        de: 'Fahrerdaten und Kennzeichen vorab per WhatsApp',
      },
      {
        en: 'Free child booster or infant seat when noted in booking',
        ar: 'مقعد أطفال مجاني عند طلبه أثناء الحجز',
        de: 'Kostenloser Kindersitz bei Angabe in der Anfrage',
      },
    ],
    included: [
      { en: 'Flight delay waiting & luggage help', ar: 'انتظار تأخير الطيران ومساعدة الحقائب', de: 'Wartezeit bei Verspätung & Gepäckhilfe' },
      { en: 'All highway & airport parking fees', ar: 'رسوم الطرق ومواقف المطار', de: 'Alle Maut- und Parkgebühren' },
    ],
    pickup: { en: 'HRG Airport, Hurghada, El Gouna & Marsa Alam', ar: 'مطار الغردقة، الجونة، مرسى علم', de: 'Flughafen HRG, Hurghada, El Gouna & Marsa Alam' },
    supplierName: 'Wasla Fleet Dispatch',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'cairo-khan-el-khalili-nile-evening',
    name: {
      en: 'Cairo Old Bazaar, Citadel & Sunset Felucca Sail',
      ar: 'جولة خان الخليلي والقلعة ومركب فلوكة عند الغروب في القاهرة',
      de: 'Kairo Basar, Zitadelle & Sonnenuntergangs-Felukke auf dem Nil',
    },
    category: 'city',
    destination: 'Cairo',
    images: [luxorFeluccaImg, hurghadaMarinaImg],
    rating: 4.8,
    reviewCount: 25,
    duration: { en: '5 hours', ar: '5 ساعات', de: '5 Stunden' },
    departureTimes: ['02:00 PM (Afternoon)', '04:30 PM (Sunset)'],
    price: 42,
    shortDescription: {
      en: 'Walk historic Moez Street and Khan el-Khalili with a local host before gliding across the Nile on a wooden felucca.',
      ar: 'جولة في شارع المعز وخان الخليلي مع مضيف محلي ثم إبحار هادئ بالفلوكة في النيل.',
      de: 'Spaziergang durch die Moez-Straße und Khan el-Khalili mit abschließender Nil-Felukkenfahrt.',
    },
    highlights: [
      {
        en: 'Curated route avoiding crowded tourist traps',
        ar: 'مسار مدروس بعيداً عن الزحام المزعج',
        de: 'Kuratierte Route abseits überlaufener Souvenirläden',
      },
      {
        en: 'Private wooden felucca sail at golden hour',
        ar: 'مركب فلوكة خاص وقت الغروب',
        de: 'Private Holzfelukke zur goldenen Stunde',
      },
    ],
    included: [
      { en: 'Cairo hotel pickup & local host', ar: 'التوصيل من فندق القاهرة والمرافق', de: 'Abholung in Kairo & lokaler Gastgeber' },
      { en: 'Private felucca charter & mint tea', ar: 'تأجير الفلوكة وشاي بالنعناع', de: 'Private Felukke & Minztee' },
    ],
    pickup: { en: 'Central Cairo & Giza hotels', ar: 'فنادق وسط القاهرة والجيزة', de: 'Hotels in Kairo & Gizeh' },
    supplierName: 'Nile Horizon Guides',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 3,
    featured: false,
    operatingDays: [0, 4, 5, 6],
  },
  {
    id: 'luxor-sunrise-balloon',
    name: {
      en: 'Luxor Sunrise Hot Air Balloon & West Bank',
      ar: 'منطاد الأقصر عند الشروق والبر الغربي',
      de: 'Luxor Heißluftballon bei Sonnenaufgang & Westufer',
    },
    category: 'historical',
    destination: 'Luxor',
    images: [luxorBalloonImg, luxorValleyKingsImg],
    rating: 4.9,
    reviewCount: 44,
    duration: { en: '3.5 hours', ar: '3.5 ساعات', de: '3,5 Stunden' },
    departureTimes: ['05:00 AM (Sunrise)'],
    price: 89,
    shortDescription: {
      en: 'Float silently above the Nile, Hatshepsut Temple and the Valley of the Kings at first light with certified pilots.',
      ar: 'تحليق هادئ بالمنطاد فوق النيل ومعبد حتشبسوت ووادي الملوك مع أول خيوط الفجر.',
      de: 'Lautloses Schweben über dem Nil, dem Hatschepsut-Tempel und dem Tal der Könige im Morgenlicht.',
    },
    highlights: [
      {
        en: 'Sunrise motorboat Nile crossing with warm tea before takeoff',
        ar: 'عبور النيل صباحاً مع شاي ساخن قبل الإقلاع',
        de: 'Sonnenaufgangs-Bootsfahrt über den Nil mit warmem Tee vor dem Start',
      },
      {
        en: 'Licensed civil aviation pilot & small basket partition',
        ar: 'طيار مرخص وسلة منظمة بمجموعات صغيرة',
        de: 'Lizenzierter Pilot und übersichtliche Korbaufteilung',
      },
    ],
    included: [
      { en: 'Hotel pickup & Nile boat transfer', ar: 'التوصيل من الفندق ومركب النيل', de: 'Hotelabholung & Nil-Bootstransfer' },
      { en: '45-minute flight & certificate', ar: 'رحلة 45 دقيقة وشهادة طيران', de: '45-Minuten-Flug & Zertifikat' },
    ],
    pickup: { en: 'Luxor East & West Bank hotels', ar: 'فنادق البر الشرقي والغربي بالأقصر', de: 'Hotels am Ost- & Westufer in Luxor' },
    supplierName: 'Thebes Sky Balloons',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 6,
    kidsDiscount: { en: '20% off ages 6–11', ar: 'خصم 20% من 6–11 سنة', de: '20% Rabatt für Kinder (6–11 J.)' },
    featured: false,
    operatingDays: [1, 2, 4, 5, 6],
  },
  {
    id: 'hurghada-artisan-shopping-tour',
    name: {
      en: 'Hurghada Old Souq & Spice Shopping Tour',
      ar: 'جولة تسوق في سوق الغردقة القديم والتوابل',
      de: 'Hurghada Basar- & Gewürz-Shopping mit Guide',
    },
    category: 'shopping',
    destination: 'Hurghada',
    images: [heroCoastImg, hurghadaMarinaImg],
    rating: 4.8,
    reviewCount: 31,
    duration: { en: '3 hours', ar: '3 ساعات', de: '3 Stunden' },
    departureTimes: ['10:00 AM (Morning)', '04:00 PM (Afternoon)', '07:00 PM (Evening)'],
    price: 22,
    shortDescription: {
      en: 'Fixed-price Egyptian cotton workshops, spice merchants, and papyrus artisans with zero pushy commission stops.',
      ar: 'زيارة ورش القطن المصري وتجار التوابل بأسعار ثابتة بدون أي إجبار أو ضغط للشراء.',
      de: 'Feste Preise bei ägyptischen Baumwollhändlern und Gewürzmärkten ohne aufdringliche Verkaufsstopps.',
    },
    highlights: [
      {
        en: 'Trusted fixed-price shops vetted by local Hurghada hosts',
        ar: 'متاجر بأسعار واضحة ومعتمدة من مضيفين محليين',
        de: 'Geprüfte Festpreisgeschäfte empfohlen von lokalen Gastgebern',
      },
      {
        en: 'Available in English, German, Arabic, French, and Russian',
        ar: 'متاحة بالإنجليزية والألمانية والعربية والفرنسية والروسية',
        de: 'Verfügbar auf Deutsch, Englisch, Arabisch, Französisch & Russisch',
      },
    ],
    included: [
      { en: 'Hotel pickup & private host', ar: 'التوصيل من الفندق ومضيف خاص', de: 'Hotelabholung & privater Gastgeber' },
      { en: 'Fresh mint tea at El Dahar market', ar: 'شاي بالنعناع في سوق الدهار', de: 'Frischer Minztee auf dem Markt' },
    ],
    pickup: { en: 'All Hurghada hotels', ar: 'جميع فنادق الغردقة', de: 'Alle Hotels in Hurghada' },
    supplierName: 'Wasla City Hosts',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    operatingDays: [2, 4, 6],
    languages: ['English', 'German', 'Arabic', 'French', 'Russian'],
  },
  {
    id: 'egyptologist-private-guide-multilang',
    name: {
      en: 'Private Licensed Egyptologist Guide',
      ar: 'مرشد سياحي وأثري مصري مرخص بجميع اللغات',
      de: 'Privater lizenzierter Ägyptologe (alle Sprachen)',
    },
    category: 'guides',
    destination: 'Cairo',
    images: [luxorHatshepsutImg, luxorValleyKingsImg],
    rating: 5.0,
    reviewCount: 57,
    duration: { en: '8 hours', ar: '8 ساعات', de: '8 Stunden' },
    departureTimes: ['08:00 AM (Morning)', '01:00 PM (Afternoon)'],
    price: 65,
    shortDescription: {
      en: 'Book a Ministry-licensed Egyptian historian fluent in English, German, French, Dutch, Spanish, Italian, Polish, or Arabic.',
      ar: 'احجز مرشداً مصرياً مرخصاً يتحدث الإنجليزية أو الألمانية أو الفرنسية أو الإسبانية أو الإيطالية أو الهولندية أو العربية.',
      de: 'Staatlich geprüfte ägyptische Guides fließend auf Deutsch, Englisch, Französisch, Spanisch, Italienisch, Niederländisch & Arabisch.',
    },
    highlights: [
      {
        en: 'Matched to your preferred language & archaeological focus',
        ar: 'تخصيص المرشد حسب لغتك واهتماماتك التاريخية',
        de: 'Passend zu Ihrer Wunschsprache und Ihren Interessen',
      },
      {
        en: 'Option to combine with a private air-conditioned van',
        ar: 'إمكانية إضافة سيارة مكيفة خاصة طوال اليوم',
        de: 'Optional kombinierbar mit privatem klimatisiertem Van',
      },
    ],
    included: [
      { en: 'Full-day licensed Egyptologist', ar: 'مرشد أثري مرخص ليوم كامل', de: 'Ganztägiger lizenzierter Ägyptologe' },
      { en: 'Custom museum & temple route plan', ar: 'تخطيط مسار مخصص للمتاحف والمعابد', de: 'Individuelle Routenplanung' },
    ],
    pickup: { en: 'Cairo, Giza, Luxor or Hurghada link', ar: 'القاهرة والجيزة والأقصر', de: 'Kairo, Gizeh oder Luxor' },
    supplierName: 'Nile Horizon Guides',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
    languages: ['English', 'German', 'French', 'Dutch', 'Spanish', 'Italian', 'Polish', 'Arabic'],
  },
];

export const MOMENTS: MomentItem[] = [
  {
    id: 'm1',
    image: momentGuestImg,
    guestName: 'Hannah',
    country: { en: 'Germany', ar: 'ألمانيا', de: 'Deutschland' },
    rating: 5,
    comment: {
      en: 'Only 14 of us on the boat, spotless towels and calm reefs for our first snorkel.',
      ar: 'كنا 14 شخصاً فقط على القارب، تنظيم ممتاز وشعاب مرجانية هادئة للغطس الأول.',
      de: 'Nur 14 Gäste auf dem Boot, blitzsauber und herrlich ruhige Riffe zum Schnorcheln.',
    },
    tripId: 'orange-bay-small-group',
  },
  {
    id: 'm2',
    image: horseBeachImg,
    guestName: 'Claire',
    country: { en: 'France', ar: 'فرنسا', de: 'Frankreich' },
    rating: 5,
    comment: {
      en: 'Gentle mares at sunrise and our 7-year-old felt completely safe walking in the shallows.',
      ar: 'خيول هادئة عند الشروق وابنتنا ذات السبع سنوات شعرت بأمان تام في المياه الضحلة.',
      de: 'Ruhige Pferde bei Sonnenaufgang — unsere 7-jährige Tochter fühlte sich rundum sicher.',
    },
    tripId: 'sahl-hasheesh-horse-swim',
  },
  {
    id: 'm3',
    image: luxorTempleImg,
    guestName: 'Martin',
    country: { en: 'Denmark', ar: 'الدنمارك', de: 'Dänemark' },
    rating: 5,
    comment: {
      en: 'Zero souvenir detours — our small van got us to Karnak right as the golden light hit.',
      ar: 'بدون توقفات تسوق — وصلنا معبد الكرنك مع أول ضوء ذهبي في الصباح.',
      de: 'Keine Verkaufsstopps — unser Kleinbus erreichte Karnak genau zum schönsten Licht.',
    },
    tripId: 'luxor-valley-small-van',
  },
  {
    id: 'm4',
    image: desertSunsetImg,
    guestName: 'Nadia',
    country: { en: 'UK', ar: 'المملكة المتحدة', de: 'Großbritannien' },
    rating: 5,
    comment: {
      en: 'Travelled with my sister; the desert guides checked our pace constantly and tea at dusk was magical.',
      ar: 'سافرت مع أختي؛ مرشدو الصحراء اهتموا بنا طوال الوقت وكان الشاي عند الغروب رائعاً.',
      de: 'Mit meiner Schwester unterwegs; die Guides achteten toll auf unser Tempo bei Tee im Abendlicht.',
    },
    tripId: 'eastern-desert-sunset-safari',
  },
  {
    id: 'm5',
    image: heroCoastImg,
    guestName: 'Lukas',
    country: { en: 'Austria', ar: 'النمسا', de: 'Österreich' },
    rating: 5,
    comment: {
      en: 'Swam right beside two green sea turtles in Abu Dabbab without stepping onto a boat.',
      ar: 'سبحنا بجانب سلحفاتين بحريتين في خليج أبو دباب مباشرة من الشاطئ.',
      de: 'Direkt vom Strand mit zwei Meeresschildkröten in Abu Dabbab geschwommen.',
    },
    tripId: 'marsa-alam-abu-dabbab-turtles',
  },
  {
    id: 'm6',
    image: orangeBayImg,
    guestName: 'Sofia',
    country: { en: 'Netherlands', ar: 'هولندا', de: 'Niederlande' },
    rating: 5,
    comment: {
      en: 'WhatsApp updates arrived the evening before with exact pickup time and captain confirmation.',
      ar: 'وصلنا تأكيد واتساب قبل الرحلة بيوم مع موعد التوصيل الدقيق واسم القبطان.',
      de: 'Am Vorabend kam per WhatsApp die genaue Abholzeit samt Bestätigung vom Kapitän.',
    },
    tripId: 'orange-bay-small-group',
  },
];

export interface TopLinkEntry {
  label: LocalizedText;
  tripId?: string;
  sectionId?: string;
}

export const TOP_LINK_COLUMNS: {
  key: 'attractions' | 'destinations' | 'thingsToDo' | 'topTrips';
  links: TopLinkEntry[];
}[] = [
  {
    key: 'attractions',
    links: [
      { label: { en: 'Orange Bay Sandbar', ar: 'جزيرة أورانج باي', de: 'Orange Bay Sandbank' }, tripId: 'orange-bay-small-group' },
      { label: { en: 'Giftun Coral Reefs', ar: 'شعاب الجفتون المرجانية', de: 'Giftun Korallenriffe' }, tripId: 'orange-bay-small-group' },
      { label: { en: 'Sahl Hasheesh Bay', ar: 'خليج سهل حشيش', de: 'Bucht von Sahl Hasheesh' }, tripId: 'sahl-hasheesh-horse-swim' },
      { label: { en: 'El Dahar Old Souq', ar: 'سوق الدهار القديم', de: 'Altstadt-Basar El Dahar' }, tripId: 'hurghada-old-town-marina-walk' },
      { label: { en: 'Abu Dabbab Bay', ar: 'خليج أبو دباب', de: 'Abu Dabbab Bucht' }, tripId: 'marsa-alam-abu-dabbab-turtles' },
    ],
  },
  {
    key: 'destinations',
    links: [
      { label: { en: 'Hurghada', ar: 'الغردقة', de: 'Hurghada' }, sectionId: 'hurghada-marsa-alam' },
      { label: { en: 'Marsa Alam', ar: 'مرسى علم', de: 'Marsa Alam' }, sectionId: 'hurghada-marsa-alam' },
      { label: { en: 'Luxor', ar: 'الأقصر', de: 'Luxor' }, sectionId: 'cairo-luxor' },
      { label: { en: 'Cairo', ar: 'القاهرة', de: 'Kairo' }, sectionId: 'cairo-luxor' },
    ],
  },
  {
    key: 'thingsToDo',
    links: [
      { label: { en: 'Sea trips', ar: 'رحلات بحرية', de: 'Bootstouren' }, sectionId: 'hurghada-marsa-alam' },
      { label: { en: 'Desert trips', ar: 'رحلات الصحراء', de: 'Wüstensafaris' }, sectionId: 'hurghada-marsa-alam' },
      { label: { en: 'Historical tours', ar: 'جولات تاريخية', de: 'Historische Touren' }, sectionId: 'cairo-luxor' },
      { label: { en: 'Horse riding', ar: 'ركوب الخيل', de: 'Reiten am Strand' }, sectionId: 'hurghada-marsa-alam' },
      { label: { en: 'City tours & transfers', ar: 'جولات المدينة والتوصيل', de: 'Stadttouren & Transfers' }, sectionId: 'all-trips' },
    ],
  },
  {
    key: 'topTrips',
    links: [
      { label: { en: 'Orange Bay Small-Group Boat', ar: 'قارب أورانج باي الصغير', de: 'Orange Bay Kleingruppenboot' }, tripId: 'orange-bay-small-group' },
      { label: { en: 'Luxor & Valley of the Kings', ar: 'الأقصر ووادي الملوك', de: 'Luxor & Tal der Könige' }, tripId: 'luxor-valley-small-van' },
      { label: { en: 'Eastern Desert Sunset Quad', ar: 'سفاري غروب الصحراء الشرقية', de: 'Wüstensafari zum Sonnenuntergang' }, tripId: 'eastern-desert-sunset-safari' },
      { label: { en: 'Giza Pyramids & GEM Day', ar: 'أهرامات الجيزة والمتحف الكبير', de: 'Pyramiden von Gizeh & GEM' }, tripId: 'cairo-pyramids-gem-day' },
      { label: { en: 'HRG Airport Private Transfer', ar: 'توصيل خاص مطار الغردقة', de: 'Flughafentransfer Hurghada' }, tripId: 'hurghada-private-airport-transfer' },
    ],
  },
];

export type CurrencyCode = 'EUR' | 'USD' | 'EGP';

export const CURRENCY_OPTIONS: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EGP', symbol: 'ج.م', label: 'EGP (ج.م)' },
];

export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.08,
  EGP: 54,
};

export function formatCurrencyPrice(
  eurAmount: number,
  currency: CurrencyCode = 'EUR',
  withBaseHint = false
): string {
  const safeEur = Math.max(0, Math.round(Number(eurAmount) || 0));
  if (currency === 'USD') {
    const usd = Math.round(safeEur * CURRENCY_RATES.USD);
    return withBaseHint ? `$${usd.toLocaleString()} (€${safeEur})` : `$${usd.toLocaleString()}`;
  }
  if (currency === 'EGP') {
    const egp = Math.round(safeEur * CURRENCY_RATES.EGP);
    return withBaseHint ? `${egp.toLocaleString()} EGP (€${safeEur})` : `${egp.toLocaleString()} EGP`;
  }
  return `€${safeEur.toLocaleString()}`;
}

export function tText(text: LocalizedText | undefined, lang: Lang): string {
  if (!text) return '';
  if (text[lang]) return text[lang] as string;
  if (lang !== 'en' && lang !== 'ar' && lang !== 'de') {
    const packed = getPackPhrase(text.en, lang);
    if (packed) return packed;
  }
  return text.en || text.de || text.ar || '';
}

export function getTripStartTimeOptions(trip: Trip): string[] {
  if (trip.category === 'transfers') return [];
  return (trip.departureTimes || []).map((s) => s.trim()).filter(Boolean);
}

function stripSlotNote(slot: string): string {
  return slot.replace(/\s*\([^)]*\)/g, '').trim();
}

const SLOT_NOTE_TRANSLATIONS: Record<string, { ar: string; de: string }> = {
  Morning: { ar: 'صباحاً', de: 'Morgens' },
  Afternoon: { ar: 'العصر', de: 'Nachmittags' },
  Sunset: { ar: 'غروب الشمس', de: 'Sonnenuntergang' },
  Sunrise: { ar: 'شروق الشمس', de: 'Sonnenaufgang' },
  Evening: { ar: 'مساءً', de: 'Abends' },
};

export function formatSlotLabel(slot: string, lang: Lang): string {
  return slot.replace(/\(([^)]+)\)/g, (_full, inner: string) => {
    const trimmed = inner.trim();
    const mapped = SLOT_NOTE_TRANSLATIONS[trimmed];
    const localized = mapped
      ? tText({ en: trimmed, ar: mapped.ar, de: mapped.de }, lang)
      : getPackPhrase(trimmed, lang) || trimmed;
    return `(${localized})`;
  });
}

export function formatTripScheduleSummary(trip: Trip, lang: Lang, compact = false): string {
  if (trip.category === 'transfers') {
    const customNote = tText(trip.timingNote, lang);
    if (customNote) return customNote;
    return tText(
      {
        en: 'According to flight time',
        ar: 'حسب ميعاد الطيارة',
        de: 'Nach Flugzeit',
      },
      lang
    );
  }

  const slots = getTripStartTimeOptions(trip);
  if (slots.length === 1) {
    const localizedSlot = formatSlotLabel(slots[0], lang);
    if (compact) return localizedSlot;
    const startsWord = tText({ en: 'Starts', ar: 'بداية', de: 'Start' }, lang);
    return `${startsWord} ${localizedSlot}`;
  }

  if (slots.length === 2) {
    if (compact) {
      return `${stripSlotNote(slots[0])} · ${stripSlotNote(slots[1])}`;
    }
    return slots.map((s) => formatSlotLabel(s, lang)).join(' · ');
  }

  if (slots.length >= 3) {
    if (compact) {
      const dailyWord = tText(
        { en: 'daily times', ar: 'مواعيد يومياً', de: 'Zeiten täglich' },
        lang
      );
      return `${slots.length} ${dailyWord}`;
    }
    return slots.map((s) => formatSlotLabel(s, lang)).join(' · ');
  }

  const customNote = tText(trip.timingNote, lang);
  if (customNote) return customNote;
  return tText(
    {
      en: 'Flexible daily',
      ar: 'مواعيد مرنة',
      de: 'Täglich flexibel',
    },
    lang
  );
}

const MS_PER_DAY = 86_400_000;

function parseIsoUtcDayMs(isoDate?: string): number | null {
  if (typeof isoDate !== 'string') return null;
  const trimmed = isoDate.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

export function normalizeSearchDateRange(
  rawStart?: string,
  rawEnd?: string
): { startMs: number | null; endMs: number | null; startDate: string; endDate: string } {
  const sMs = parseIsoUtcDayMs(rawStart);
  const eMs = parseIsoUtcDayMs(rawEnd);
  if (sMs !== null && eMs !== null) {
    const minMs = Math.min(sMs, eMs);
    const maxMs = Math.max(sMs, eMs);
    return {
      startMs: minMs,
      endMs: maxMs,
      startDate: new Date(minMs).toISOString().slice(0, 10),
      endDate: new Date(maxMs).toISOString().slice(0, 10),
    };
  }
  if (sMs !== null) {
    const dStr = new Date(sMs).toISOString().slice(0, 10);
    return { startMs: sMs, endMs: sMs, startDate: dStr, endDate: dStr };
  }
  if (eMs !== null) {
    const dStr = new Date(eMs).toISOString().slice(0, 10);
    return { startMs: eMs, endMs: eMs, startDate: dStr, endDate: dStr };
  }
  return { startMs: null, endMs: null, startDate: '', endDate: '' };
}

/**
 * Returns true if the trip operates on at least one date within [startDate, endDate] inclusive,
 * honoring both optional seasonal dates (`availableFrom`/`availableTo`) and weekly `operatingDays`.
 */
export function doesTripRunInDateRange(
  trip: Trip,
  startDate?: string,
  endDate?: string
): boolean {
  const { startMs, endMs } = normalizeSearchDateRange(startDate, endDate);
  if (startMs === null || endMs === null) return true;

  const tripFromMs = parseIsoUtcDayMs(trip.availableFrom);
  const tripToMs = parseIsoUtcDayMs(trip.availableTo);

  const effectiveStartMs = tripFromMs !== null ? Math.max(startMs, tripFromMs) : startMs;
  const effectiveEndMs = tripToMs !== null ? Math.min(endMs, tripToMs) : endMs;

  if (effectiveStartMs > effectiveEndMs) return false;

  const operatingDays =
    Array.isArray(trip.operatingDays) && trip.operatingDays.length > 0
      ? trip.operatingDays
      : [0, 1, 2, 3, 4, 5, 6];

  if (operatingDays.length >= 7) return true;

  const allowedSet = new Set(operatingDays);
  const totalDays = Math.floor((effectiveEndMs - effectiveStartMs) / MS_PER_DAY) + 1;
  const checkCount = Math.min(totalDays, 7);

  for (let i = 0; i < checkCount; i += 1) {
    const dayOfWeek = new Date(effectiveStartMs + i * MS_PER_DAY).getUTCDay();
    if (allowedSet.has(dayOfWeek)) {
      return true;
    }
  }
  return false;
}

const SHORT_WEEKDAYS: Record<'en' | 'ar' | 'de', string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
};

export function formatTripOperatingDaysLabel(trip: Trip, lang: Lang): string {
  const days =
    Array.isArray(trip.operatingDays) && trip.operatingDays.length > 0
      ? Array.from(new Set(trip.operatingDays)).filter((d) => d >= 0 && d <= 6)
      : [0, 1, 2, 3, 4, 5, 6];

  if (days.length === 0 || days.length >= 7) {
    return tText({ en: 'Runs daily', ar: 'متاحة يومياً', de: 'Täglich' }, lang);
  }

  const localeKey: 'en' | 'ar' | 'de' = lang === 'ar' ? 'ar' : lang === 'de' ? 'de' : 'en';
  const labels = days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => SHORT_WEEKDAYS[localeKey][d]);
  return labels.join(' · ');
}

/**
 * Checks whether a trip operates on a specific single ISO date (YYYY-MM-DD),
 * validating both seasonal dates (availableFrom/availableTo) and weekly operatingDays.
 */
export function isTripOperatingOnDate(trip: Trip, dateIso?: string): boolean {
  if (!dateIso || !parseIsoUtcDayMs(dateIso)) return true;
  return doesTripRunInDateRange(trip, dateIso, dateIso);
}

/**
 * Finds the nearest valid operating date on or after `fromDateIso` (defaulting to today)
 * within the next 365 days, respecting both seasonal availability and weekly operatingDays.
 */
export function getNextOperatingDate(trip: Trip, fromDateIso?: string): string | null {
  const todayIso = new Date().toISOString().slice(0, 10);
  const startBase = parseIsoUtcDayMs(fromDateIso) ?? parseIsoUtcDayMs(todayIso);
  if (startBase === null) return null;

  const tripFromMs = parseIsoUtcDayMs(trip.availableFrom);
  const tripToMs = parseIsoUtcDayMs(trip.availableTo);
  const searchStart = tripFromMs !== null ? Math.max(startBase, tripFromMs) : startBase;

  if (tripToMs !== null && searchStart > tripToMs) return null;

  const operatingDays =
    Array.isArray(trip.operatingDays) && trip.operatingDays.length > 0
      ? trip.operatingDays
      : [0, 1, 2, 3, 4, 5, 6];
  const allowedSet = new Set(operatingDays);

  for (let offset = 0; offset < 366; offset += 1) {
    const candidateMs = searchStart + offset * MS_PER_DAY;
    if (tripToMs !== null && candidateMs > tripToMs) return null;
    const dow = new Date(candidateMs).getUTCDay();
    if (allowedSet.has(dow)) {
      return new Date(candidateMs).toISOString().slice(0, 10);
    }
  }
  return null;
}
