import heroCoastImg from '../assets/images/hero_red_sea_coast_1794609167890.jpg';
import heroRedSeaVibrantImg from '../assets/images/hero_red_sea_vibrant_1795088656246.jpg';
import orangeBayImg from '../assets/images/trip_orange_bay_boat_1794609167713.jpg';
import desertSunsetImg from '../assets/images/trip_desert_quad_sunset_1794609167599.jpg';
import luxorTempleImg from '../assets/images/trip_luxor_temple_columns_1794609167708.jpg';
import luxorKarnakAvenueImg from '../assets/images/luxor_karnak_avenue_1795453498729.jpg';
import luxorColossiMemnonImg from '../assets/images/luxor_colossi_memnon_1795453499145.jpg';
import luxorValleyKingsImg from '../assets/images/luxor_valley_kings_tombs_1795023936503.jpg';
import luxorRoyalTombImg from '../assets/images/luxor_royal_tomb_1795453499282.jpg';
import luxorHatshepsutImg from '../assets/images/luxor_hatshepsut_temple_1795023935886.jpg';
import luxorTempleExteriorImg from '../assets/images/luxor_temple_exterior_1795453498872.jpg';
import luxorFeluccaImg from '../assets/images/luxor_nile_felucca_dusk_1795023937583.jpg';
import luxorThebesCoverImg from '../assets/images/luxor_thebes_cover.webp';
import luxorHatshepsutGoldenRealImg from '../assets/images/luxor_hatshepsut_golden_real.webp';
import luxorKarnakCourtyardRealImg from '../assets/images/luxor_karnak_courtyard_real.webp';
import luxorKarnakObeliskRealImg from '../assets/images/luxor_karnak_obelisk_real.webp';
import luxorColossiMemnonRealImg from '../assets/images/luxor_colossi_memnon_real.webp';
import luxorValleyKingsKv9RealImg from '../assets/images/luxor_valley_kings_kv9_real.webp';
import luxorValleyKingsCorridorRealImg from '../assets/images/luxor_valley_kings_corridor_real.webp';
import luxorValleyKingsSarcophagusRealImg from '../assets/images/luxor_valley_kings_sarcophagus_real.webp';
import luxorHatshepsutCliffsRealImg from '../assets/images/luxor_hatshepsut_cliffs_real.webp';
import luxorHatshepsutSphinxRealImg from '../assets/images/luxor_hatshepsut_sphinx_real.webp';
import luxorWestbankColumnsRealImg from '../assets/images/luxor_westbank_columns_real.webp';
import horseBeachImg from '../assets/images/trip_horse_sahl_hasheesh_1794609168296.jpg';
import waslaHorseRideHeroImg from '../assets/images/wasla_horse_ride_hero.jpg';
import waslaHorseRide02Img from '../assets/images/wasla_horse_ride_02.jpg';
import waslaHorseRide03Img from '../assets/images/wasla_horse_ride_03.jpg';
import waslaHorseRide04Img from '../assets/images/wasla_horse_ride_04.jpg';
import waslaHorseRide05Img from '../assets/images/wasla_horse_ride_05.jpg';
import waslaHorseRide06Img from '../assets/images/wasla_horse_ride_06.jpg';
import waslaHorseRide07Img from '../assets/images/wasla_horse_ride_07.jpg';
import waslaHorseRide08Img from '../assets/images/wasla_horse_ride_08.jpg';
import waslaHorseSessionHeroImg from '../assets/images/wasla_horse_session_hero.jpg';
import waslaHorseSession02Img from '../assets/images/wasla_horse_session_02.jpg';
import waslaHorseSession03Img from '../assets/images/wasla_horse_session_03.jpg';
import waslaHorseSession04Img from '../assets/images/wasla_horse_session_04.jpg';
import waslaHorseSession05Img from '../assets/images/wasla_horse_session_05.jpg';
import waslaHorseSession06Img from '../assets/images/wasla_horse_session_06.jpg';
import waslaFlyingDressHeroImg from '../assets/images/wasla_flying_dress_hero.jpg';
import waslaFlyingDress02Img from '../assets/images/wasla_flying_dress_02.jpg';
import waslaFlyingDress03Img from '../assets/images/wasla_flying_dress_03.jpg';
import waslaFlyingDress04Img from '../assets/images/wasla_flying_dress_04.jpg';
import waslaFlyingDress05Img from '../assets/images/wasla_flying_dress_05.jpg';
import waslaFlyingDress06Img from '../assets/images/wasla_flying_dress_06.jpg';
import waslaCarriageHeroImg from '../assets/images/wasla_carriage_hero.jpg';
import waslaCarriage02Img from '../assets/images/wasla_carriage_02.jpg';
import waslaCarriage03Img from '../assets/images/wasla_carriage_03.jpg';
import waslaCarriage04Img from '../assets/images/wasla_carriage_04.jpg';
import waslaCarriage05Img from '../assets/images/wasla_carriage_05.jpg';
import waslaCarriage06Img from '../assets/images/wasla_carriage_06.jpg';
import waslaCamelHeroImg from '../assets/images/wasla_camel_hero.jpg';
import waslaCamel02Img from '../assets/images/wasla_camel_02.jpg';
import waslaCamel03Img from '../assets/images/wasla_camel_03.jpg';
import waslaCamel04Img from '../assets/images/wasla_camel_04.jpg';
import waslaCamel05Img from '../assets/images/wasla_camel_05.jpg';
import waslaCamel06Img from '../assets/images/wasla_camel_06.jpg';
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
  {
    id: 'kalawy',
    feePerPersonEur: 15,
    label: {
      en: 'Kalawy & Coral Sun (+€15 / person extra transfer)',
      ar: 'كلاوي وكورال صن (+15€ للفرد توصيل خارج الغردقة)',
      de: 'Kalawy & Coral Sun (+15 € / Person Transferzuschlag)',
      fr: 'Kalawy & Coral Sun (+15 € / pers. supplément transfert)',
      es: 'Kalawy & Coral Sun (+15 € / pers. suplemento traslado)',
      it: 'Kalawy & Coral Sun (+15 € / pers. extra transfer)',
      nl: 'Kalawy & Coral Sun (+€15 / pers. extra transfer)',
      pl: 'Kalawy & Coral Sun (+15 € / os. dopłata za transfer)',
      pt: 'Kalawy & Coral Sun (+15 € / pessoa transfer extra)',
      cs: 'Kalawy & Coral Sun (+15 € / os. příplatek za transfer)',
      sv: 'Kalawy & Coral Sun (+15 € / pers. extra transfer)',
      ro: 'Kalawy & Coral Sun (+15 € / pers. transfer extra)',
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
  kalawy: { en: 'Kalawy & Coral Sun', ar: 'كلاوي وكورال صن', de: 'Kalawy & Coral Sun' },
};

/**
 * Directional Extra Transfer Fee per person (EUR):
 * - Cairo trips (Northbound): Extra transfer applies ONLY to Sahl Hasheesh (+€10/pp), Makadi Bay (+€10/pp), Soma Bay (+€15/pp), and Safaga (+€15/pp). El Gouna & Hurghada City = €0.
 * - Luxor trips (Southbound): Extra transfer applies to El Gouna (+€10/pp, opposite direction), Sahl Hasheesh (+€10/pp), and Kalawy & Coral Sun (+€15/pp). Hurghada, Makadi Bay, Soma Bay, and Safaga = €0.
 * - Hurghada / other trips (when outer transfer applies): El Gouna, Sahl Hasheesh, Makadi Bay (+€10/pp); Soma Bay, Safaga (+€15/pp); Hurghada City = €0.
 */
export function getZoneTransferFeePerPerson(
  zoneId: string,
  destination?: DestinationRegion | string,
  hasOuterZoneTransfer: boolean = true,
  freeTransferZones?: string[]
): number {
  if (!hasOuterZoneTransfer || !zoneId || zoneId === 'hurghada') return 0;
  if (freeTransferZones && freeTransferZones.includes(zoneId)) return 0;

  if (destination === 'Cairo') {
    if (zoneId === 'sahl-hasheesh' || zoneId === 'makadi') return 10;
    if (zoneId === 'soma-bay' || zoneId === 'safaga' || zoneId === 'kalawy') return 15;
    return 0; // El Gouna & Hurghada are on the way north to Cairo
  }

  if (destination === 'Luxor') {
    if (zoneId === 'el-gouna') return 10; // Opposite direction (north of Hurghada)
    if (zoneId === 'sahl-hasheesh') return 10;
    if (zoneId === 'kalawy') return 15; // Kalawy & Coral Sun, south of Safaga
    return 0; // Makadi, Soma Bay, Safaga are on the southbound route
  }

  const zone = OUTER_TRANSFER_ZONES.find((z) => z.id === zoneId);
  return zone ? zone.feePerPersonEur : 0;
}

export function getZoneTransferLabel(
  zoneId: string,
  destination: DestinationRegion | string | undefined,
  lang: Lang,
  hasOuterZoneTransfer: boolean = true,
  freeTransferZones?: string[]
): string {
  const base = ZONE_BASE_NAMES[zoneId] || ZONE_BASE_NAMES.hurghada;
  const zoneName = lang === 'ar' ? base.ar : lang === 'de' ? base.de : base.en;
  const fee = getZoneTransferFeePerPerson(zoneId, destination, hasOuterZoneTransfer, freeTransferZones);
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
  /** Short guest-facing name (lists, detail H1, booking, WhatsApp). Falls back to name. */
  displayName?: LocalizedText;
  /** SEO/page title only (PKG-4 prerendered pages); never shown in lists. */
  seoTitle?: { en: string; de: string };
  /** Canonical trip page path for PKG-4, e.g. /trips/luxor-day-trip-from-hurghada/. */
  slug?: string;
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
  /** Optional outer transfer zone IDs included at €0 for this specific trip (e.g. ['el-gouna'] or ['sahl-hasheesh']). */
  freeTransferZones?: string[];
  /** Pricing model: 'per-group' for fixed whole-boat / whole-vehicle bookings (not multiplied by guests). */
  pricingMode?: 'per-person' | 'per-group';
  /** Optional maximum guest capacity for the booking (e.g. 6 for a private speed boat). */
  maxGuests?: number;
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
  { token: 'luxor_karnak_avenue', asset: luxorKarnakAvenueImg },
  { token: 'luxor_colossi_memnon', asset: luxorColossiMemnonImg },
  { token: 'luxor_valley_kings_tombs', asset: luxorValleyKingsImg },
  { token: 'luxor_royal_tomb', asset: luxorRoyalTombImg },
  { token: 'luxor_hatshepsut_temple', asset: luxorHatshepsutImg },
  { token: 'luxor_temple_exterior', asset: luxorTempleExteriorImg },
  { token: 'luxor_nile_felucca_dusk', asset: luxorFeluccaImg },
  { token: 'luxor_thebes_cover', asset: luxorThebesCoverImg },
  { token: 'luxor_hatshepsut_golden_real', asset: luxorHatshepsutGoldenRealImg },
  { token: 'luxor_karnak_courtyard_real', asset: luxorKarnakCourtyardRealImg },
  { token: 'luxor_karnak_obelisk_real', asset: luxorKarnakObeliskRealImg },
  { token: 'luxor_colossi_memnon_real', asset: luxorColossiMemnonRealImg },
  { token: 'luxor_valley_kings_kv9_real', asset: luxorValleyKingsKv9RealImg },
  { token: 'luxor_valley_kings_corridor_real', asset: luxorValleyKingsCorridorRealImg },
  { token: 'luxor_valley_kings_sarcophagus_real', asset: luxorValleyKingsSarcophagusRealImg },
  { token: 'luxor_hatshepsut_cliffs_real', asset: luxorHatshepsutCliffsRealImg },
  { token: 'luxor_hatshepsut_sphinx_real', asset: luxorHatshepsutSphinxRealImg },
  { token: 'luxor_westbank_columns_real', asset: luxorWestbankColumnsRealImg },
  { token: 'trip_horse_sahl_hasheesh', asset: horseBeachImg },
  { token: 'wasla_horse_ride_hero', asset: waslaHorseRideHeroImg },
  { token: 'wasla_horse_ride_02', asset: waslaHorseRide02Img },
  { token: 'wasla_horse_ride_03', asset: waslaHorseRide03Img },
  { token: 'wasla_horse_ride_04', asset: waslaHorseRide04Img },
  { token: 'wasla_horse_ride_05', asset: waslaHorseRide05Img },
  { token: 'wasla_horse_ride_06', asset: waslaHorseRide06Img },
  { token: 'wasla_horse_ride_07', asset: waslaHorseRide07Img },
  { token: 'wasla_horse_ride_08', asset: waslaHorseRide08Img },
  { token: 'wasla_horse_session_hero', asset: waslaHorseSessionHeroImg },
  { token: 'wasla_horse_session_02', asset: waslaHorseSession02Img },
  { token: 'wasla_horse_session_03', asset: waslaHorseSession03Img },
  { token: 'wasla_horse_session_04', asset: waslaHorseSession04Img },
  { token: 'wasla_horse_session_05', asset: waslaHorseSession05Img },
  { token: 'wasla_horse_session_06', asset: waslaHorseSession06Img },
  { token: 'wasla_flying_dress_hero', asset: waslaFlyingDressHeroImg },
  { token: 'wasla_flying_dress_02', asset: waslaFlyingDress02Img },
  { token: 'wasla_flying_dress_03', asset: waslaFlyingDress03Img },
  { token: 'wasla_flying_dress_04', asset: waslaFlyingDress04Img },
  { token: 'wasla_flying_dress_05', asset: waslaFlyingDress05Img },
  { token: 'wasla_flying_dress_06', asset: waslaFlyingDress06Img },
  { token: 'wasla_carriage_hero', asset: waslaCarriageHeroImg },
  { token: 'wasla_carriage_02', asset: waslaCarriage02Img },
  { token: 'wasla_carriage_03', asset: waslaCarriage03Img },
  { token: 'wasla_carriage_04', asset: waslaCarriage04Img },
  { token: 'wasla_carriage_05', asset: waslaCarriage05Img },
  { token: 'wasla_carriage_06', asset: waslaCarriage06Img },
  { token: 'wasla_camel_hero', asset: waslaCamelHeroImg },
  { token: 'wasla_camel_02', asset: waslaCamel02Img },
  { token: 'wasla_camel_03', asset: waslaCamel03Img },
  { token: 'wasla_camel_04', asset: waslaCamel04Img },
  { token: 'wasla_camel_05', asset: waslaCamel05Img },
  { token: 'wasla_camel_06', asset: waslaCamel06Img },
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
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
      },
      {
        kind: 'stop',
        title: { en: 'First snorkeling stop', ar: 'أول محطة سنوركلينج', de: 'Erster Schnorchelstopp' },
        subtitle: { en: 'Coral reef, full gear and life jacket provided', ar: 'شعاب مرجانية، مع كامل المعدات وسترة نجاة', de: 'Korallenriff, komplette Ausrüstung und Schwimmweste inklusive' },
      },
      {
        kind: 'stop',
        title: { en: 'Orange Bay island', ar: 'جزيرة أورانج باي', de: 'Insel Orange Bay' },
        subtitle: { en: 'Swimming, the sandbar and the famous water swings', ar: 'سباحة واللسان الرملي والأرجوحات المائية الشهيرة', de: 'Schwimmen, die Sandbank und die berühmten Wasserschaukeln' },
      },
      {
        kind: 'break',
        title: { en: 'Open buffet lunch on board', ar: 'غداء بوفيه مفتوح على المركب', de: 'Offenes Buffet-Mittagessen an Bord' },
      },
      {
        kind: 'stop',
        title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
        subtitle: { en: 'A different reef', ar: 'شعاب مرجانية مختلفة', de: 'Ein anderes Riff' },
      },
      {
        kind: 'end',
        title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Orange Bay Island Day Trip from Hurghada: Snorkeling, White Sand and Buffet Lunch',
      ar: 'رحلة يوم كامل إلى جزيرة أورانج باي من الغردقة: سنوركلينج ورمل أبيض وغداء بوفيه',
      de: 'Orange Bay Insel Tagestour ab Hurghada: Schnorcheln, weißer Sand und Mittagsbuffet',
    },
    displayName: { en: 'Orange Bay Island Day Trip', ar: 'رحلة جزيرة أورانج باي', de: 'Orange Bay Insel Tagestour' },
    seoTitle: { en: 'Orange Bay Island Trip from Hurghada: Snorkeling & Lunch', de: 'Orange Bay Ausflug ab Hurghada: Bootstour, Schnorcheln & Mittagessen' },
    slug: '/trips/orange-bay-hurghada/',
    category: 'sea',
    destination: 'Hurghada',
    images: [orangeBayImg, heroRedSeaVibrantImg, momentGuestImg],
    galleryCaptions: [
      { en: 'Shallow turquoise sandbars at Orange Bay, Giftun Island', ar: 'المياه الفيروزية والرمال البيضاء في جزيرة أورانج باي', de: 'Türkisfarbene Sandbänke vor Orange Bay, Giftun-Insel' },
      { en: 'Calm Red Sea morning anchorage along Giftun Reef', ar: 'إبحار هادئ في الصباح الباكر فوق شعاب الجفتون', de: 'Ruhiger Morgen-Ankerplatz am Giftun-Riff' },
      { en: 'Clear coastal visibility ideal for family snorkelling', ar: 'رؤية بحرية صافية تناسب العائلات والغطس السطحي', de: 'Klare Sichtverhältnisse für familienfreundliches Schnorcheln' },
    ],
    rating: 0,
    reviewCount: 0,
    duration: { en: 'Full day', ar: 'يوم كامل', de: 'Ganztägig' },
    departureTimes: ['09:00 AM'],
    price: 20,
    options: [
      {
        id: 'opt-orange-shared',
        title: { en: 'Small-Group Boat (Standard)', ar: 'مركب مجموعة صغيرة (عادي)', de: 'Kleingruppen-Boot (Standard)' },
        detail: {
          en: '2 coral reef snorkel stops + 2 hours on Orange Bay island · open buffet lunch & drinks all day',
          ar: 'توقفان للسنوركلينج عند الشعاب + ساعتان على جزيرة أورانج باي · غداء بوفيه مفتوح ومشروبات طول اليوم',
          de: '2 Korallenriff-Schnorchelstopps + 2 Stunden auf Orange Bay · offenes Mittagsbuffet & Getränke den ganzen Tag',
        },
        price: 20,
      },
    ],
    shortDescription: {
      en: 'The famous white-sand island with swings standing in the sea, reached after two coral reef snorkeling stops.',
      ar: 'أبحر إلى توقفين للسنوركلينج عند الشعاب المرجانية، ثم اقضِ ساعتين على جزيرة أورانج باي، شاطئ البحر الأحمر الشهير بالمراجيح داخل الماء، مع غداء بوفيه مفتوح على اليخت ومشروبات طول اليوم.',
      de: 'Segeln Sie zu zwei Korallenriff-Schnorchelstopps und verbringen Sie anschließend zwei Stunden auf Orange Bay Island, dem Strand im Roten Meer mit den berühmten Wasserschaukeln. Offenes Mittagsbuffet an Bord und Getränke den ganzen Tag.',
    },
    highlights: [
      {
        en: 'Hotel pickup and transfer to the marina',
        ar: 'الاستلام من الفندق والتوصيل إلى المارينا',
        de: 'Hotelabholung und Transfer zur Marina',
      },
      {
        en: 'First snorkeling stop at a coral reef, full gear and life jacket provided',
        ar: 'التوقف الأول للسنوركلينج عند شعاب مرجانية مع توفير المعدات الكاملة وسترة النجاة',
        de: 'Erster Schnorchelstopp an einem Korallenriff, komplette Ausrüstung und Schwimmweste inklusive',
      },
      {
        en: 'Second snorkeling stop at a different reef',
        ar: 'التوقف الثاني للسنوركلينج عند موقع شعاب آخر',
        de: 'Zweiter Schnorchelstopp an einem weiteren Riff',
      },
      {
        en: 'Two hours on Orange Bay island: swimming, the sandbar and the famous water swings',
        ar: 'ساعتان على جزيرة أورانج باي: السباحة والشريط الرملي والمراجيح المائية الشهيرة',
        de: 'Zwei Stunden auf Orange Bay Island: Schwimmen, Sandbank und die berühmten Wasserschaukeln',
      },
      {
        en: 'Open buffet lunch on board the yacht',
        ar: 'غداء بوفيه مفتوح على متن اليخت',
        de: 'Offenes Mittagsbuffet an Bord der Yacht',
      },
      {
        en: 'Drinks available all day',
        ar: 'مشروبات متوفرة طول اليوم',
        de: 'Getränke den ganzen Tag verfügbar',
      },
      {
        en: 'A sea supervisor on board and in the water with the group all day',
        ar: 'مشرف بحري على متن اليخت وفي الماء مع المجموعة طول اليوم',
        de: 'Ein Meeresbetreuer den ganzen Tag an Bord und im Wasser bei der Gruppe',
      },
      {
        en: 'Led by a professional local sea guide',
        ar: 'بقيادة مرشد بحري محلي محترف',
        de: 'Geführt von einem professionellen lokalen Meeresguide',
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
      {
        en: 'Round-trip hotel transfer within Hurghada',
        ar: 'توصيل ذهاب وعودة من فنادق الغردقة',
        de: 'Hin- und Rücktransfer ab Hotels in Hurghada',
      },
      {
        en: 'Yacht trip with two snorkeling stops and the Orange Bay island stop',
        ar: 'رحلة باليخت مع توقفين للسنوركلينج وتوقف جزيرة أورانج باي',
        de: 'Yachttour mit zwei Schnorchelstopps und dem Stopp auf Orange Bay Island',
      },
      {
        en: 'Full snorkeling gear (mask, fins and snorkel) and life jacket',
        ar: 'معدات سنوركلينج كاملة (ماسك وزعانف وأنبوب تنفس) وسترة نجاة',
        de: 'Komplette Schnorchelausrüstung (Maske, Flossen und Schnorchel) und Schwimmweste',
      },
      {
        en: 'Open buffet lunch on board',
        ar: 'غداء بوفيه مفتوح على متن اليخت',
        de: 'Offenes Mittagsbuffet an Bord',
      },
      {
        en: 'Drinks all day',
        ar: 'مشروبات طول اليوم',
        de: 'Getränke den ganzen Tag',
      },
      {
        en: 'Sea supervisor on board',
        ar: 'مشرف بحري على متن اليخت',
        de: 'Meeresbetreuer an Bord',
      },
    ],
    fullDescription: {
      en: 'Some beaches you look at. Orange Bay you walk into, slowly, because the water is that clear and the sand is that white. We pick you up from your hotel and take you to the marina, where the yacht is waiting and the crew hands you your snorkeling gear and life jacket for the day.\n\nThe yacht heads out to the first coral reef stop. The Red Sea does the showing off here: coral gardens in shallow, sunlit water, and fish in numbers that make first time snorkelers forget to be nervous. A sea supervisor is on board all day and in the water with the group, so beginners are looked after from the first minute.\n\nAfter a second snorkeling stop at another reef, the yacht anchors at Orange Bay island. You have two full hours on the island: swim in the shallow turquoise water, walk the sandbar, take your photos on the famous swings, or simply lie on the white sand and do nothing at all.\n\nLunch is an open buffet served on board the yacht, and drinks are available all day. In the afternoon the yacht sails back to the marina and the transfers take you back to your hotel.\n\nThere are no water games and no banana boats on this trip. It is a snorkeling and island day, and it is better for it.',
      ar: 'في شواطئ تتفرج عليها، لكن أورانج باي تمشي جواها بهدوء لأن المياه صافية جدًا والرمل أبيض ناعم. نستلمك من فندقك ونوصلك إلى المارينا، حيث ينتظرك اليخت ويسلمك الطاقم معدات السنوركلينج وسترة النجاة لليوم.\n\nيتجه اليخت إلى أول توقف عند الشعاب المرجانية. هنا يُظهر البحر الأحمر جماله الحقيقي: حدائق مرجانية في مياه ضحلة مضاءة بالشمس، وأسماك بأعداد تجعل المبتدئين في السنوركلينج ينسون أي توتر. يوجد مشرف بحري على متن اليخت وفي الماء مع المجموعة طول اليوم، فيتم الاهتمام بالمبتدئين من أول دقيقة.\n\nبعد توقف ثانٍ للسنوركلينج عند شعاب أخرى، يرسو اليخت عند جزيرة أورانج باي. لديك ساعتان كاملتان على الجزيرة: اسبح في المياه الفيروزية الضحلة، امشِ على الشريط الرملي، التقط صورك على المراجيح الشهيرة، أو استلقِ ببساطة على الرمل الأبيض واسترخِ.\n\nالغداء بوفيه مفتوح يُقدم على متن اليخت، والمشروبات متوفرة طول اليوم. بعد الظهر يُبحر اليخت عائدًا إلى المارينا وتعيدك التوصيلات إلى فندقك.\n\nلا توجد ألعاب مائية ولا بنانا بوت في هذه الرحلة. إنه يوم للسنوركلينج والجزيرة فقط، وهذا ما يجعله أفضل.',
      de: 'Manche Strände schaut man nur an. In Orange Bay geht man langsam hinein, weil das Wasser so klar und der Sand so weiß ist. Wir holen Sie von Ihrem Hotel ab und bringen Sie zur Marina, wo die Yacht wartet und die Crew Ihnen Schnorchelausrüstung und Schwimmweste für den Tag aushändigt.\n\nDie Yacht fährt zum ersten Korallenriff-Stopp. Hier zeigt das Rote Meer seine ganze Pracht: Korallengärten in flachem, sonnendurchflutetem Wasser und Fische in einer Vielfalt, die selbst Anfänger beim Schnorcheln jede Aufregung vergessen lässt. Ein Meeresbetreuer ist den ganzen Tag an Bord und im Wasser bei der Gruppe, sodass Anfänger von der ersten Minute an gut betreut sind.\n\nNach einem zweiten Schnorchelstopp an einem anderen Riff ankert die Yacht vor Orange Bay Island. Sie haben zwei volle Stunden auf der Insel: Schwimmen Sie im flachen türkisfarbenen Wasser, spazieren Sie über die Sandbank, machen Sie Fotos auf den berühmten Schaukeln oder liegen Sie einfach im weißen Sand und entspannen Sie.\n\nDas Mittagessen wird als offenes Buffet an Bord der Yacht serviert, und Getränke stehen den ganzen Tag zur Verfügung. Am Nachmittag segelt die Yacht zurück zur Marina und der Transfer bringt Sie zurück zu Ihrem Hotel.\n\nAuf dieser Tour gibt es keine Wasserspiele und kein Bananaboot. Es ist ein reiner Schnorchel- und Inseltag, und genau das macht ihn besser.',
    },
    tips: [
      {
        en: 'Transfer from El Gouna, Sahl Hasheesh or Makadi Bay (€10 per person)',
        ar: 'التوصيل من الجونة أو سهل حشيش أو مكادي باي (10 يورو للفرد)',
        de: 'Transfer ab El Gouna, Sahl Hasheesh oder Makadi Bay (10 € pro Person)',
      },
      {
        en: 'Transfer from Soma Bay or Safaga (€15 per person)',
        ar: 'التوصيل من سوما باي أو سفاجا (15 يورو للفرد)',
        de: 'Transfer ab Soma Bay oder Safaga (15 € pro Person)',
      },
      {
        en: 'Photos (available to purchase)',
        ar: 'الصور (متاحة للشراء)',
        de: 'Fotos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [
      {
        en: 'Guests looking for water games or banana boat rides: this is a snorkeling and island day only',
        ar: 'الضيوف الباحثون عن ألعاب مائية أو ركوب بنانا بوت: هذه رحلة سنوركلينج وجزيرة فقط',
        de: 'Gäste, die Wasserspiele oder Bananaboot-Fahrten suchen: Dies ist ein reiner Schnorchel- und Inseltag',
      },
    ],
    whatToBring: [
      { en: 'Swimsuit and towel', ar: 'مايوه وفوطة', de: 'Badekleidung und Handtuch' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Sunglasses and a hat', ar: 'نظارة شمس وقبعة', de: 'Sonnenbrille und Hut' },
      {
        en: 'A waterproof phone pouch if you want photos in the water',
        ar: 'جراب موبايل مقاوم للماء لو أردت التصوير في الماء',
        de: 'Eine wasserdichte Handyhülle, wenn Sie Fotos im Wasser machen möchten',
      },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'Your exact pickup time is confirmed the day before your trip. Boats leave on time, so please be ready at your pickup point.',
        ar: 'يتأكد وقت الاستلام بالظبط قبل الرحلة بيوم. القوارب تتحرك في موعدها، برجاء التواجد في نقطة الاستلام في الموعد.',
        de: 'Ihre genaue Abholzeit wird einen Tag vor der Tour bestätigt. Die Boote legen pünktlich ab, bitte seien Sie rechtzeitig am Abholpunkt.',
      },
      {
        en: 'The island stop is two hours. The rest of the day is sailing and snorkeling, which is exactly how this trip is meant to be spent.',
        ar: 'التوقف على الجزيرة ساعتان، وبقية اليوم إبحار وسنوركلينج، وهذه هي الطريقة المصممة لها الرحلة.',
        de: 'Der Inselaufenthalt dauert zwei Stunden. Der Rest des Tages ist Segeln und Schnorcheln, genau dafür ist diese Tour gedacht.',
      },
      {
        en: 'You do not need to be a strong swimmer. Life jackets are provided for everyone and the supervisor stays with the group in the water.',
        ar: 'لا يشترط أن تكون سباحًا محترفًا. سترات النجاة متوفرة للجميع والمشرف يبقى مع المجموعة في الماء.',
        de: 'Sie müssen kein starker Schwimmer sein. Schwimmwesten stehen für alle bereit und der Betreuer bleibt im Wasser bei der Gruppe.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'New Marina Hurghada / Hotel Lobby Pickup',
      ar: 'مارينا الغردقة الجديدة أو الاستلام من الفندق',
      de: 'Hurghada New Marina / Hotelabholung',
    },
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Captain Karim Marine',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 3,
    kidsDiscount: { en: '50% off ages 4–11 · under 4 free', ar: 'خصم 50% من 4–11 سنة · مجاناً تحت 4 سنوات', de: '50% Rabatt (4–11 J.) · unter 4 frei' },
    featured: true,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'dolphin-house-snorkeling',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
      },
      {
        kind: 'stop',
        title: { en: 'The Dolphin House reef', ar: 'شعاب بيت الدلافين', de: 'Das Dolphin-House-Riff' },
        subtitle: { en: 'Watch wild dolphins, and swim near them when conditions allow', ar: 'مشاهدة الدلافين البرية، والسباحة قربها عندما تسمح الظروف', de: 'Wilde Delfine beobachten und, wenn die Bedingungen es erlauben, in ihrer Nähe schwimmen' },
      },
      {
        kind: 'break',
        title: { en: 'Open buffet lunch on board', ar: 'غداء بوفيه مفتوح على المركب', de: 'Offenes Buffet-Mittagessen an Bord' },
      },
      {
        kind: 'stop',
        title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
        subtitle: { en: 'Another coral reef', ar: 'شعاب مرجانية أخرى', de: 'Ein weiteres Korallenriff' },
      },
      {
        kind: 'end',
        title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Dolphin House Snorkeling Trip from Hurghada: Wild Dolphins and Coral Reefs',
      ar: 'رحلة سنوركلينج بيت الدلافين من الغردقة: دلافين برية وشعاب مرجانية',
      de: 'Dolphin House Schnorcheltour ab Hurghada: Wilde Delfine und Korallenriffe',
    },
    displayName: { en: 'Dolphin House Snorkeling', ar: 'سنوركلينج بيت الدلافين', de: 'Delfinhaus Schnorchelausflug' },
    seoTitle: { en: 'Dolphin House Snorkeling Trip from Hurghada: Wild Dolphins', de: 'Delfinhaus Schnorchelausflug ab Hurghada: Wilde Delfine & Riffe' },
    slug: '/trips/dolphin-house-hurghada/',
    category: 'sea',
    destination: 'Hurghada',
    images: [heroRedSeaVibrantImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: 'Full day', ar: 'يوم كامل', de: 'Ganztägig' },
    departureTimes: ['09:00 AM'],
    price: 17,
    options: [
      {
        id: 'opt-dolphin-shared',
        title: { en: 'Small-Group Boat (Standard)', ar: 'مركب مجموعة صغيرة (عادي)', de: 'Kleingruppen-Boot (Standard)' },
        detail: {
          en: 'Dolphin House reef + 2 snorkel stops · buffet lunch & drinks',
          ar: 'شعاب بيت الدلافين + توقفان للسنوركلينج · غداء بوفيه ومشروبات',
          de: 'Dolphin-House-Riff + 2 Schnorchelstopps · Mittagsbuffet & Getränke',
        },
        price: 17,
      },
    ],
    shortDescription: {
      en: 'Sail to the reef where wild dolphins come to rest and play, and swim near them in the open sea.',
      ar: 'أبحر إلى شعاب بيت الدلافين، حيث تأتي الدلافين البرية للراحة واللعب، لفرصة مشاهدتها والسباحة بالقرب منها، مع توقفين إضافيين للسنوركلينج عند الشعاب وغداء بوفيه ومشروبات طول اليوم.',
      de: 'Segeln Sie zum Dolphin-House-Riff, wo wilde Delfine ruhen und spielen, mit der Chance, sie zu beobachten und in ihrer Nähe zu schwimmen. Zwei weitere Korallenriff-Schnorchelstopps, Mittagsbuffet und Getränke den ganzen Tag.',
    },
    fullDescription: {
      en: "There is a reef off Hurghada where the dolphins choose to spend their days. Not a pool, not a show, their own place, on their own terms. That reef is the Dolphin House, and it is where this trip goes first.\n\nWe pick you up from your hotel and sail out in the morning. At the Dolphin House, the guide reads the water and the dolphins' mood. On most days they are there, cruising slowly over the reef or playing in the bow wave, and when conditions are right you slip into the water with your mask and fins and swim while they pass around you. It is the kind of moment people cross oceans for.\n\nHonesty matters more than hype here: these are wild animals and nobody can book them. Sightings happen on the great majority of trips, but they are never guaranteed, and if the dolphins are resting or absent, the crew will not chase or disturb them. What is guaranteed is the rest of the day: two further snorkeling stops at coral reefs full of colour and fish, with a professional sea guide in the water who teaches beginners how to snorkel properly and stays with anyone who is nervous.\n\nBetween stops, the yacht is yours to relax on. Lunch is an open buffet served on board, and drinks are available all day. Then the sail back to the marina and the transfer to your hotel.",
      ar: 'هناك شعاب مرجانية قبالة الغردقة تختار الدلافين أن تقضي فيها أيامها. ليست حوضًا ولا عرضًا، بل مكانها الطبيعي وبشروطها الخاصة. هذه الشعاب هي بيت الدلافين، وهي أول وجهة في هذه الرحلة.\n\nنستلمك من فندقك ونبحر صباحًا. عند بيت الدلافين يراقب المرشد حالة المياه ومزاج الدلافين. في معظم الأيام تكون موجودة تسبح بهدوء فوق الشعاب أو تلعب عند مقدمة القارب، وعندما تكون الظروف مناسبة تنزل إلى الماء بالماسك والزعانف لتسبح بينما تمر حولك. إنها اللحظة التي يسافر الناس عبر المحيطات من أجلها.\n\nالصدق هنا أهم من المبالغة: هذه كائنات برية ولا أحد يستطيع حجزها. تحدث المشاهدة في الغالبية العظمى من الرحلات، لكنها ليست مضمونة أبدًا، وإذا كانت الدلافين ترتاح أو غير موجودة فلن يطاردها الطاقم أو يزعجها. أما المضمون فهو بقية اليوم: توقفان إضافيان للسنوركلينج عند شعاب مرجانية مليئة بالألوان والأسماك، مع مرشد بحري محترف في الماء يعلّم المبتدئين طريقة السنوركلينج الصحيحة ويبقى مع أي شخص يشعر بالتوتر.\n\nبين التوقفات، اليخت ملكك للاسترخاء. الغداء بوفيه مفتوح يُقدم على متن اليخت، والمشروبات متوفرة طول اليوم، ثم الإبحار عائدًا إلى المارينا والتوصيل إلى فندقك.',
      de: 'Vor Hurghada liegt ein Riff, an dem Delfine ihre Tage verbringen. Kein Becken, keine Show, ihr eigener Ort, zu ihren eigenen Bedingungen. Dieses Riff ist das Dolphin House, und dorthin führt diese Tour zuerst.\n\nWir holen Sie am Hotel ab und legen am Morgen ab. Am Dolphin House liest der Guide das Wasser und die Stimmung der Delfine. An den meisten Tagen sind sie da, gleiten ruhig über das Riff oder spielen in der Bugwelle, und wenn die Bedingungen stimmen, gleiten Sie mit Maske und Flossen ins Wasser und schwimmen, während sie an Ihnen vorbeiziehen. Ein Moment, für den Menschen Ozeane überqueren.\n\nEhrlichkeit zählt hier mehr als große Versprechen: Es sind wilde Tiere, die niemand buchen kann. Sichtungen gelingen auf den allermeisten Touren, sind aber nie garantiert, und wenn die Delfine ruhen oder nicht da sind, wird die Crew sie niemals jagen oder stören. Garantiert ist der Rest des Tages: zwei weitere Schnorchelstopps an farbenfrohen Korallenriffen voller Fische, begleitet von einem professionellen Meeresguide im Wasser, der Anfängern das richtige Schnorcheln zeigt und bei unsicheren Schwimmern bleibt.\n\nZwischen den Stopps entspannen Sie an Bord der Yacht. Das Mittagessen wird als offenes Buffet an Bord serviert, Getränke stehen den ganzen Tag bereit. Danach segeln wir zurück zur Marina und bringen Sie zu Ihrem Hotel.',
    },
    highlights: [
      {
        en: 'Hotel pickup and transfer to the marina',
        ar: 'الاستلام من الفندق والتوصيل إلى المارينا',
        de: 'Hotelabholung und Transfer zur Marina',
      },
      {
        en: 'The Dolphin House reef: watch wild dolphins, and swim near them when conditions allow',
        ar: 'شعاب بيت الدلافين: شاهد الدلافين البرية واسبح بالقرب منها عندما تسمح الظروف',
        de: 'Das Dolphin-House-Riff: wilde Delfine beobachten und bei geeigneten Bedingungen in ihrer Nähe schwimmen',
      },
      {
        en: 'Two further snorkeling stops at coral reefs',
        ar: 'توقفان إضافيان للسنوركلينج عند الشعاب المرجانية',
        de: 'Zwei weitere Schnorchelstopps an Korallenriffen',
      },
      {
        en: 'Full snorkeling gear and life jacket provided',
        ar: 'توفير معدات السنوركلينج الكاملة وسترة النجاة',
        de: 'Komplette Schnorchelausrüstung und Schwimmweste inklusive',
      },
      {
        en: 'Open buffet lunch on board the yacht',
        ar: 'غداء بوفيه مفتوح على متن اليخت',
        de: 'Offenes Mittagsbuffet an Bord der Yacht',
      },
      {
        en: 'Drinks available all day',
        ar: 'مشروبات متوفرة طول اليوم',
        de: 'Getränke den ganzen Tag verfügbar',
      },
      {
        en: 'A professional sea guide in the water, teaching beginners and looking after the group',
        ar: 'مرشد بحري محترف في الماء يعلّم المبتدئين ويعتني بالمجموعة',
        de: 'Ein professioneller Meeresguide im Wasser, der Anfänger anleitet und die Gruppe betreut',
      },
      {
        en: 'Led by a professional local sea guide',
        ar: 'بقيادة مرشد بحري محلي محترف',
        de: 'Geführt von einem professionellen lokalen Meeresguide',
      },
    ],
    included: [
      {
        en: 'Round-trip hotel transfer within Hurghada',
        ar: 'توصيل ذهاب وعودة من فنادق الغردقة',
        de: 'Hin- und Rücktransfer ab Hotels in Hurghada',
      },
      {
        en: 'Yacht trip to the Dolphin House and two further reef stops',
        ar: 'رحلة باليخت إلى بيت الدلافين وتوقفين إضافيين عند الشعاب',
        de: 'Yachttour zum Dolphin House und zwei weiteren Riffstopps',
      },
      {
        en: 'Full snorkeling gear (mask, fins and snorkel) and life jacket',
        ar: 'معدات سنوركلينج كاملة (ماسك وزعانف وأنبوب تنفس) وسترة نجاة',
        de: 'Komplette Schnorchelausrüstung (Maske, Flossen und Schnorchel) und Schwimmweste',
      },
      {
        en: 'Open buffet lunch on board',
        ar: 'غداء بوفيه مفتوح على متن اليخت',
        de: 'Offenes Mittagsbuffet an Bord',
      },
      {
        en: 'Drinks all day',
        ar: 'مشروبات طول اليوم',
        de: 'Getränke den ganzen Tag',
      },
      {
        en: 'Professional sea guide',
        ar: 'مرشد بحري محترف',
        de: 'Professioneller Meeresguide',
      },
    ],
    tips: [
      {
        en: 'Transfer from El Gouna, Sahl Hasheesh or Makadi Bay (€10 per person)',
        ar: 'التوصيل من الجونة أو سهل حشيش أو مكادي باي (10 يورو للفرد)',
        de: 'Transfer ab El Gouna, Sahl Hasheesh oder Makadi Bay (10 € pro Person)',
      },
      {
        en: 'Transfer from Soma Bay or Safaga (€15 per person)',
        ar: 'التوصيل من سوما باي أو سفاجا (15 يورو للفرد)',
        de: 'Transfer ab Soma Bay oder Safaga (15 € pro Person)',
      },
      {
        en: 'Photos and videos (available to purchase)',
        ar: 'الصور والفيديوهات (متاحة للشراء)',
        de: 'Fotos und Videos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [
      {
        en: 'Guests who need a guaranteed dolphin sighting: the dolphins are wild, and no honest operator can promise them',
        ar: 'الضيوف الذين يشترطون مشاهدة مضمونة للدلافين: الدلافين برية ولا يمكن لأي منظم صادق ضمان ظهورها',
        de: 'Gäste, die eine garantierte Delfinsichtung erwarten: Die Delfine leben wild, kein seriöser Anbieter kann sie garantieren',
      },
    ],
    whatToBring: [
      { en: 'Swimsuit and towel', ar: 'مايوه وفوطة', de: 'Badekleidung und Handtuch' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Sunglasses and a hat', ar: 'نظارة شمس وقبعة', de: 'Sonnenbrille und Hut' },
      {
        en: 'An underwater camera if you have one, this is the day for it',
        ar: 'كاميرا تحت الماء إن وُجدت، فهذا هو اليوم المناسب لها',
        de: 'Eine Unterwasserkamera, falls vorhanden, das ist der richtige Tag dafür',
      },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'Wild dolphins cannot be guaranteed. They are seen on most trips to this reef, but if they are resting or away, we watch the reef instead and never chase or disturb them.',
        ar: 'لا يمكن ضمان مشاهدة الدلافين البرية. تظهر في معظم الرحلات لهذه الشعاب، ولكن إذا كانت ترتاح أو غائبة نستمتع بالشعاب ولا نطاردها أو نزعجها أبدًا.',
        de: 'Wilde Delfine können nicht garantiert werden. Sie werden auf den meisten Touren zu diesem Riff gesehen, doch wenn sie ruhen oder fernbleiben, beobachten wir stattdessen das Riff und jagen oder stören sie niemals.',
      },
      {
        en: "Swimming near the dolphins depends on their behaviour and the sea conditions on the day, and the guide's call is final.",
        ar: 'السباحة بالقرب من الدلافين تعتمد على سلوكها وحالة البحر في ذلك اليوم، وقرار المرشد نهائي.',
        de: 'Das Schwimmen in der Nähe der Delfine hängt von ihrem Verhalten und den Seebedingungen am Tag ab, die Entscheidung des Guides ist verbindlich.',
      },
      {
        en: 'Your exact pickup time is confirmed the day before your trip. Please be ready at your pickup point.',
        ar: 'يتأكد وقت الاستلام بالظبط قبل الرحلة بيوم. برجاء التواجد في نقطة الاستلام في الموعد.',
        de: 'Ihre genaue Abholzeit wird einen Tag vor der Tour bestätigt. Bitte seien Sie rechtzeitig am Abholpunkt.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Hurghada Marina / Hotel Lobby Pickup',
      ar: 'مارينا الغردقة أو الاستلام من بهو الفندق',
      de: 'Hurghada Marina / Hotelabholung',
    },
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Red Sea Boat Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'paradise-island-premium',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
      },
      {
        kind: 'stop',
        title: { en: 'First snorkeling stop', ar: 'أول محطة سنوركلينج', de: 'Erster Schnorchelstopp' },
        subtitle: { en: 'A protected reef away from the crowds', ar: 'شعاب محمية بعيدًا عن الزحام', de: 'Ein geschütztes Riff abseits der Menschenmengen' },
      },
      {
        kind: 'stop',
        title: { en: 'Paradise Island', ar: 'جزيرة بارادايس', de: 'Paradise Island' },
        subtitle: { en: 'A long, unhurried stop on the island', ar: 'وقفة طويلة على الجزيرة من غير استعجال', de: 'Ein langer, entspannter Aufenthalt auf der Insel' },
      },
      {
        kind: 'break',
        title: { en: 'Premium open buffet lunch on the island', ar: 'غداء بوفيه مفتوح فاخر على الجزيرة', de: 'Premium-Buffet-Mittagessen auf der Insel' },
      },
      {
        kind: 'stop',
        title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
        subtitle: { en: 'Another quiet reef', ar: 'شعاب هادئة أخرى', de: 'Ein weiteres ruhiges Riff' },
      },
      {
        kind: 'end',
        title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Paradise Island Premium Day Trip: Quiet Reefs, Fewer Guests and Lunch on the Island',
      ar: 'رحلة جزيرة بارادايس بريميوم: شعاب هادئة وعدد ضيوف أقل وغداء على الجزيرة',
      de: 'Paradise Island Premium Tagestour: Ruhige Riffe, weniger Gäste und Mittagessen auf der Insel',
    },
    displayName: { en: 'Paradise Island Premium', ar: 'جزيرة بارادايس بريميوم', de: 'Paradise Island Premium' },
    seoTitle: { en: 'Paradise Island Trip from Hurghada: Quiet Reefs & Lunch', de: 'Paradise Island Ausflug ab Hurghada: Ruhige Riffe & Mittagessen' },
    slug: '/trips/paradise-island-hurghada/',
    category: 'sea',
    destination: 'Hurghada',
    images: [orangeBayImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: 'Full day', ar: 'يوم كامل', de: 'Ganztägig' },
    departureTimes: ['09:00 AM'],
    price: 37,
    options: [
      {
        id: 'opt-paradise-premium',
        title: { en: 'Premium Small-Group Boat', ar: 'قارب مجموعة صغيرة بريميوم', de: 'Premium-Kleingruppen-Boot' },
        detail: {
          en: 'Fewer guests · 2 quiet reef stops · premium lunch on the island',
          ar: 'عدد ضيوف أقل · توقفان عند شعاب هادئة · غداء بريميوم على الجزيرة',
          de: 'Weniger Gäste · 2 ruhige Riffstopps · Premium-Mittagessen auf der Insel',
        },
        price: 37,
      },
    ],
    shortDescription: {
      en: 'The island day, done quietly: protected reefs, fewer guests, and lunch served on the island itself.',
      ar: 'يوم الجزيرة بهدوء حقيقي. استمتع بالسنوركلينج في شعاب محمية بعيدًا عن الزحام مع عدد ضيوف أقل عمدًا على المركب، ثم توقف طويل وهادئ على جزيرة بارادايس مع غداء بوفيه بريميوم يُقدم على الجزيرة نفسها.',
      de: 'Der Inseltag in aller Ruhe. Schnorcheln Sie an geschützten Riffen abseits der Massen mit bewusst weniger Gästen an Bord und genießen Sie danach einen langen, entspannten Aufenthalt auf Paradise Island samt Premium-Mittagsbuffet direkt auf der Insel.',
    },
    fullDescription: {
      en: "Paradise Island is what the Red Sea looks like when nobody is in a hurry. This trip is built around that feeling, and everything about it is deliberately calmer than the standard island run.\n\nWe keep the boat's guest list short on purpose. Fewer people at the rail, fewer fins in the water at each stop, more room on deck, and a crew that actually has time for you. We pick you up from your hotel and sail out to the first snorkeling stop, in a protected reef area away from the busy sites, where the coral is healthy and the water is clear enough to read the reef like a map.\n\nAfter a second snorkeling stop, again chosen away from the crowds, the boat takes you to Paradise Island for the long stop of the day. This is not a rushed photo break. It is hours of white sand and shallow turquoise water, with time to swim, walk the shoreline, or claim a quiet corner and stay there.\n\nLunch is the other difference you will notice: a premium open buffet served on the island, not on board, so you eat with your feet near the sand and the sea in front of you. Drinks are varied and available through the day. In the afternoon, the sail back to the marina and the transfer to your hotel.\n\nIf you want the liveliest boat in the marina, this is not it. If you want the Red Sea at its most peaceful, it is.",
      ar: 'جزيرة بارادايس هي شكل البحر الأحمر عندما لا يكون أحد في عجلة من أمره. هذه الرحلة مبنية حول هذا الإحساس، وكل تفصيلة فيها أهدأ عن قصد من رحلات الجزر المعتادة.\n\nنحافظ عمدًا على قائمة ضيوف محدودة على القارب: أشخاص أقل عند السور، زعانف أقل في الماء عند كل توقف، مساحة أوسع على السطح، وطاقم لديه وقت فعلي للاهتمام بك. نستلمك من فندقك ونبحر إلى أول توقف للسنوركلينج في منطقة شعاب محمية بعيدة عن المواقع المزدحمة، حيث المرجان صحي والمياه صافية كالمرآة.\n\nبعد توقف ثانٍ للسنوركلينج مختار أيضًا بعيدًا عن الزحام، يأخذك القارب إلى جزيرة بارادايس للتوقف الطويل في اليوم. هذه ليست استراحة سريعة للصور، بل ساعات من الرمل الأبيض والمياه الفيروزية الضحلة، مع وقت للسباحة أو المشي على الشاطئ أو الاسترخاء في ركن هادئ.\n\nوالغداء هو الفارق الثاني الذي ستلاحظه فورًا: بوفيه مفتوح بريميوم يُقدم على الجزيرة نفسها وليس على القارب، فتتناول طعامك وقدميك قرب الرمل والبحر أمامك. المشروبات متنوعة ومتوفرة خلال اليوم، وفي فترة بعد الظهر نبحر عائدين إلى المارينا والتوصيل إلى فندقك.\n\nإن كنت تبحث عن أكثر قارب صاخب في المارينا فهذه ليست رحلتك، أما إن أردت البحر الأحمر في أهدأ وأرقى صورة، فهذه هي.',
      de: 'Paradise Island zeigt, wie das Rote Meer aussieht, wenn niemand in Eile ist. Diese Tour dreht sich genau um dieses Gefühl, und alles daran ist bewusst ruhiger als eine Standard-Inseltour.\n\nWir halten die Gästeliste an Bord absichtlich kurz: weniger Menschen an der Reling, weniger Flossen im Wasser bei jedem Stopp, mehr Platz an Deck und eine Crew, die wirklich Zeit für Sie hat. Wir holen Sie vom Hotel ab und segeln zum ersten Schnorchelstopp in einem geschützten Riffgebiet abseits der belebten Spots, wo die Korallen gesund sind und das Wasser glasklar ist.\n\nNach einem zweiten Schnorchelstopp, erneut abseits der Massen gewählt, bringt Sie das Boot nach Paradise Island für den langen Aufenthalt des Tages. Das ist keine gehetzte Fotopause, sondern Stunden voller weißem Sand und flachem türkisfarbenem Wasser zum Schwimmen, Spazieren am Ufer oder einfach zum Verweilen in einer ruhigen Ecke.\n\nDas Mittagessen ist der zweite Unterschied, den Sie sofort bemerken: ein hochwertiges offenes Buffet direkt auf der Insel, nicht an Bord, sodass Sie mit den Füßen nah am Sand und Blick aufs Meer essen. Abwechslungsreiche Getränke stehen den ganzen Tag bereit. Am Nachmittag geht es zurück zur Marina und per Transfer zu Ihrem Hotel.\n\nWenn Sie das lauteste Boot der Marina suchen, ist diese Tour nichts für Sie. Wenn Sie das Rote Meer von seiner friedlichsten Seite erleben möchten, ist sie genau richtig.',
    },
    highlights: [
      {
        en: 'Hotel pickup and transfer to the marina',
        ar: 'الاستلام من الفندق والتوصيل إلى المارينا',
        de: 'Hotelabholung und Transfer zur Marina',
      },
      {
        en: 'Deliberately fewer guests on board than a standard island trip',
        ar: 'عدد ضيوف أقل عن قصد على متن القارب مقارنة بالرحلات العادية',
        de: 'Bewusst weniger Gäste an Bord als bei einer Standard-Inseltour',
      },
      {
        en: 'First snorkeling stop at a protected reef away from the crowds',
        ar: 'التوقف الأول للسنوركلينج عند شعاب محمية بعيدًا عن الزحام',
        de: 'Erster Schnorchelstopp an einem geschützten Riff abseits der Massen',
      },
      {
        en: 'Second snorkeling stop at another quiet reef',
        ar: 'التوقف الثاني للسنوركلينج عند شعاب هادئة أخرى',
        de: 'Zweiter Schnorchelstopp an einem weiteren ruhigen Riff',
      },
      {
        en: 'A long, unhurried stop on Paradise Island',
        ar: 'توقف طويل وهادئ بدون استعجال على جزيرة بارادايس',
        de: 'Ein langer, entspannter Aufenthalt auf Paradise Island',
      },
      {
        en: 'Premium open buffet lunch served on the island',
        ar: 'غداء بوفيه مفتوح بريميوم يُقدم على الجزيرة',
        de: 'Premium-Mittagsbuffet direkt auf der Insel serviert',
      },
      {
        en: 'Varied drinks available through the day',
        ar: 'مشروبات متنوعة متوفرة خلال اليوم',
        de: 'Abwechslungsreiche Getränke den ganzen Tag verfügbar',
      },
      {
        en: 'Led by a professional local sea guide',
        ar: 'بقيادة مرشد بحري محلي محترف',
        de: 'Geführt von einem professionellen lokalen Meeresguide',
      },
    ],
    included: [
      {
        en: 'Round-trip hotel transfer within Hurghada',
        ar: 'توصيل ذهاب وعودة من فنادق الغردقة',
        de: 'Hin- und Rücktransfer ab Hotels in Hurghada',
      },
      {
        en: 'Yacht trip with a reduced guest list',
        ar: 'رحلة باليخت بعدد ضيوف محدود',
        de: 'Yachttour mit reduzierter Gästezahl',
      },
      {
        en: 'Full snorkeling gear (mask, fins and snorkel) and life jacket',
        ar: 'معدات سنوركلينج كاملة (ماسك وزعانف وأنبوب تنفس) وسترة نجاة',
        de: 'Komplette Schnorchelausrüstung (Maske, Flossen und Schnorchel) und Schwimmweste',
      },
      {
        en: 'Two snorkeling stops in protected reef areas',
        ar: 'توقفان للسنوركلينج في مناطق شعاب محمية',
        de: 'Zwei Schnorchelstopps in geschützten Riffgebieten',
      },
      {
        en: 'Premium open buffet lunch on Paradise Island',
        ar: 'غداء بوفيه مفتوح بريميوم على جزيرة بارادايس',
        de: 'Premium-Mittagsbuffet auf Paradise Island',
      },
      {
        en: 'Varied drinks through the day',
        ar: 'مشروبات متنوعة خلال اليوم',
        de: 'Abwechslungsreiche Getränke während des Tages',
      },
    ],
    tips: [
      {
        en: 'Transfer from El Gouna, Sahl Hasheesh or Makadi Bay (€10 per person)',
        ar: 'التوصيل من الجونة أو سهل حشيش أو مكادي باي (10 يورو للفرد)',
        de: 'Transfer ab El Gouna, Sahl Hasheesh oder Makadi Bay (10 € pro Person)',
      },
      {
        en: 'Transfer from Soma Bay or Safaga (€15 per person)',
        ar: 'التوصيل من سوما باي أو سفاجا (15 يورو للفرد)',
        de: 'Transfer ab Soma Bay oder Safaga (15 € pro Person)',
      },
      {
        en: 'Photos (available to purchase)',
        ar: 'الصور (متاحة للشراء)',
        de: 'Fotos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [
      {
        en: 'Guests looking for a party boat or water games: this trip is deliberately quiet',
        ar: 'الضيوف الباحثون عن قارب حفلات أو ألعاب مائية: هذه الرحلة هادئة عن قصد',
        de: 'Gäste, die ein Partyboot oder Wasserspiele suchen: Diese Tour ist bewusst ruhig gehalten',
      },
    ],
    whatToBring: [
      { en: 'Swimsuit and towel', ar: 'مايوه وفوطة', de: 'Badekleidung und Handtuch' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Sunglasses and a hat', ar: 'نظارة شمس وقبعة', de: 'Sonnenbrille und Hut' },
      {
        en: 'A book, if you are the kind of person who reads on beaches. You will have time',
        ar: 'كتاب، إن كنت تحب القراءة على الشاطئ، سيكون لديك وقت كافٍ',
        de: 'Ein Buch, falls Sie gern am Strand lesen. Sie werden die Zeit dafür haben',
      },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'The smaller guest list is real and it is the point of this trip, so places are limited each day and booking ahead is wise in busy weeks.',
        ar: 'عدد الضيوف المحدود حقيقي وهو جوهر هذه الرحلة، لذا فالأماكن محدودة يوميًا ويفضل الحجز مبكرًا في الأسابيع المزدحمة.',
        de: 'Die kleinere Gästeliste ist echt und der Kern dieser Tour, daher sind die Plätze täglich begrenzt und eine frühzeitige Buchung in belebten Wochen ratsam.',
      },
      {
        en: 'Lunch is served on the island on this trip, not on the boat.',
        ar: 'يُقدم الغداء على الجزيرة في هذه الرحلة وليس على القارب.',
        de: 'Das Mittagessen wird bei dieser Tour auf der Insel serviert, nicht auf dem Boot.',
      },
      {
        en: 'Your exact pickup time is confirmed the day before your trip. Please be ready at your pickup point.',
        ar: 'يتأكد وقت الاستلام بالظبط قبل الرحلة بيوم. برجاء التواجد في نقطة الاستلام في الموعد.',
        de: 'Ihre genaue Abholzeit wird einen Tag vor der Tour bestätigt. Bitte seien Sie rechtzeitig am Abholpunkt.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Hurghada Marina / Hotel Lobby Pickup',
      ar: 'مارينا الغردقة أو الاستلام من بهو الفندق',
      de: 'Hurghada Marina / Hotelabholung',
    },
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Red Sea Boat Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hula-hula-island',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
      },
      {
        kind: 'stop',
        title: { en: 'First snorkeling stop', ar: 'أول محطة سنوركلينج', de: 'Erster Schnorchelstopp' },
        subtitle: { en: 'Colourful reef fish, full gear and life jacket provided', ar: 'أسماك شعاب ملونة، مع كامل المعدات وسترة نجاة', de: 'Bunte Rifffische, komplette Ausrüstung und Schwimmweste inklusive' },
      },
      {
        kind: 'stop',
        title: { en: 'Hula Hula island', ar: 'جزيرة هولا هولا', de: 'Insel Hula Hula' },
        subtitle: { en: 'Soft white sand and crystal clear water', ar: 'رمال بيضاء ناعمة ومياه صافية', de: 'Weicher weißer Sand und kristallklares Wasser' },
      },
      {
        kind: 'break',
        title: { en: 'Open buffet lunch on board', ar: 'غداء بوفيه مفتوح على المركب', de: 'Offenes Buffet-Mittagessen an Bord' },
      },
      {
        kind: 'stop',
        title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
        subtitle: { en: 'Another reef', ar: 'شعاب أخرى', de: 'Ein weiteres Riff' },
      },
      {
        kind: 'end',
        title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Hula Hula Island Day Trip from Hurghada: Snorkeling and a Quieter White-Sand Island',
      ar: 'رحلة جزيرة هولا هولا من الغردقة: سنوركلينج وجزيرة رمل أبيض أهدأ',
      de: 'Hula Hula Island Tagestour ab Hurghada: Schnorcheln und eine ruhigere Weißsandinsel',
    },
    displayName: { en: 'Hula Hula Island Day Trip', ar: 'رحلة جزيرة هولا هولا', de: 'Hula Hula Insel Tagestour' },
    seoTitle: { en: 'Hula Hula Island Trip from Hurghada: Snorkeling & White Sand', de: 'Hula Hula Insel Ausflug ab Hurghada: Schnorcheln & Weißer Sand' },
    slug: '/trips/hula-hula-island-hurghada/',
    category: 'sea',
    destination: 'Hurghada',
    images: [momentGuestImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: 'Full day', ar: 'يوم كامل', de: 'Ganztägig' },
    departureTimes: ['09:00 AM'],
    price: 22,
    options: [
      {
        id: 'opt-hula-shared',
        title: { en: 'Small-Group Boat (Standard)', ar: 'مركب مجموعة صغيرة (عادي)', de: 'Kleingruppen-Boot (Standard)' },
        detail: {
          en: '2 snorkel stops + 2 hours on Hula Hula island · buffet lunch & drinks',
          ar: 'توقفان للسنوركلينج + ساعتان على جزيرة هولا هولا · غداء بوفيه ومشروبات',
          de: '2 Schnorchelstopps + 2 Stunden auf Hula Hula Island · Mittagsbuffet & Getränke',
        },
        price: 22,
      },
    ],
    shortDescription: {
      en: 'Two snorkeling stops among clouds of colourful fish, then the quieter white-sand island, away from the famous-name crowds.',
      ar: 'توقفان للسنوركلينج بين أسراب الأسماك الملونة، ثم ساعتان على جزيرة هولا هولا برملها الأبيض الناعم ومياهها الكريستالية بعيدًا عن زحام الشواطئ الشهيرة، مع غداء بوفيه ومشروبات طول اليوم.',
      de: 'Zwei Schnorchelstopps inmitten bunter Fischschwärme, anschließend zwei Stunden auf Hula Hula Island mit feinem weißem Sand und kristallklarem Wasser, ohne den Trubel der bekanntesten Strände. Mittagsbuffet und Getränke den ganzen Tag.',
    },
    fullDescription: {
      en: 'Everyone in Hurghada has heard of the famous island. Fewer have heard of Hula Hula, and the island is better for it. This is the island day for people who looked at the popular beach, saw the crowds, and wanted the same turquoise water with room to breathe in it.\n\nWe pick you up from your hotel and sail out to the first snorkeling stop, where the reef is busy in the right way: shoals of colourful fish moving over the coral like one animal. Your gear and life jacket are included, and a sea supervision and rescue team is on board all day, so everyone from confident swimmers to first timers is properly looked after in the water.\n\nA second snorkeling stop follows, then the boat anchors at Hula Hula island and the pace changes completely. You have two hours on soft white sand at the edge of water so clear it barely looks real. Swim, walk out along the shallows, take the photos, or find your spot and stay in it.\n\nLunch is an open buffet served on board the yacht, and drinks are available all day. In the afternoon, the sail back to the marina and the transfer to your hotel.\n\nSame sea, same reefs, calmer island. That is the whole idea of this trip, and it works.',
      ar: 'الجميع في الغردقة سمع عن الجزيرة الأشهر، لكن قليلين سمعوا عن هولا هولا، وهذا ما يجعلها أجمل. هذه رحلة الجزيرة لمن نظروا إلى الشاطئ الأشهر ورأوا الزحام، فأرادوا نفس المياه الفيروزية مع مساحة أكبر للتنفس والهدوء.\n\nنستلمك من فندقك ونبحر إلى التوقف الأول للسنوركلينج، حيث الشعاب مزدحمة بالطريقة الصحيحة: أسراب من الأسماك الملونة تتحرك فوق المرجان معًا. معداتك وسترة النجاة مشمولة، وهناك فريق إشراف وإنقاذ بحري على متن اليخت طول اليوم، ليحظى الجميع من السباحين المتمرسين إلى المبتدئين برعاية كاملة في الماء.\n\nيتبع ذلك توقف ثانٍ للسنوركلينج، ثم يرسو القارب عند جزيرة هولا هولا ويتغير الإيقاع تمامًا. لديك ساعتان على رمل أبيض ناعم على حافة مياه صافية بشكل مدهش. اسبح، امشِ في المياه الضحلة، التقط صورك، أو اختر مكانك واستمتع به.\n\nالغداء بوفيه مفتوح يُقدم على متن اليخت، والمشروبات متوفرة طول اليوم. بعد الظهر نبحر عائدين إلى المارينا والتوصيل إلى فندقك.\n\nنفس البحر، نفس الشعاب، وجزيرة أهدأ. هذه هي فكرة الرحلة كلها، وهي تنجح بامتياز.',
      de: 'Jeder in Hurghada hat von der berühmtesten Insel gehört. Weniger kennen Hula Hula, und genau das tut der Insel gut. Dies ist der Inseltag für alle, die den bekannten Strand gesehen, den Trubel bemerkt und sich dasselbe türkisfarbene Wasser mit mehr Platz zum Durchatmen gewünscht haben.\n\nWir holen Sie vom Hotel ab und segeln zum ersten Schnorchelstopp, wo das Riff auf die schönste Art belebt ist: Schwärme bunter Fische ziehen gemeinsam über die Korallen. Ausrüstung und Schwimmweste sind inklusive, und ein Meeresaufsichts- und Rettungsteam ist den ganzen Tag an Bord, sodass sichere Schwimmer wie auch Anfänger im Wasser bestens betreut sind.\n\nEs folgt ein zweiter Schnorchelstopp, dann ankert das Boot vor Hula Hula Island und das Tempo verlangsamt sich spürbar. Sie haben zwei Stunden auf weichem weißem Sand an kristallklarem Wasser. Schwimmen Sie, laufen Sie durch das flache Wasser, machen Sie Fotos oder suchen Sie sich Ihren ruhigen Platz.\n\nDas Mittagessen wird als offenes Buffet an Bord der Yacht serviert, Getränke gibt es den ganzen Tag. Am Nachmittag segeln wir zurück zur Marina und bringen Sie zum Hotel.\n\nDasselbe Meer, dieselben Riffe, eine ruhigere Insel. Das ist die ganze Idee dieser Tour, und sie geht auf.',
    },
    highlights: [
      {
        en: 'Hotel pickup and transfer to the marina',
        ar: 'الاستلام من الفندق والتوصيل إلى المارينا',
        de: 'Hotelabholung und Transfer zur Marina',
      },
      {
        en: 'First snorkeling stop among colourful reef fish, full gear and life jacket provided',
        ar: 'التوقف الأول للسنوركلينج بين أسماك الشعاب الملونة مع المعدات الكاملة وسترة النجاة',
        de: 'Erster Schnorchelstopp inmitten bunter Rifffische, komplette Ausrüstung und Schwimmweste inklusive',
      },
      {
        en: 'Second snorkeling stop at another reef',
        ar: 'التوقف الثاني للسنوركلينج عند شعاب أخرى',
        de: 'Zweiter Schnorchelstopp an einem weiteren Riff',
      },
      {
        en: 'Two hours on Hula Hula island: soft white sand and crystal clear water',
        ar: 'ساعتان على جزيرة هولا هولا: رمل أبيض ناعم ومياه كريستالية صافية',
        de: 'Zwei Stunden auf Hula Hula Island: weicher weißer Sand und kristallklares Wasser',
      },
      {
        en: 'Open buffet lunch on board the yacht',
        ar: 'غداء بوفيه مفتوح على متن اليخت',
        de: 'Offenes Mittagsbuffet an Bord der Yacht',
      },
      {
        en: 'Drinks available all day',
        ar: 'مشروبات متوفرة طول اليوم',
        de: 'Getränke den ganzen Tag verfügbar',
      },
      {
        en: 'A sea supervision and rescue team on board all day',
        ar: 'فريق إشراف وإنقاذ بحري على متن اليخت طول اليوم',
        de: 'Ein Meeresaufsichts- und Rettungsteam den ganzen Tag an Bord',
      },
      {
        en: 'Led by a professional local sea guide',
        ar: 'بقيادة مرشد بحري محلي محترف',
        de: 'Geführt von einem professionellen lokalen Meeresguide',
      },
    ],
    included: [
      {
        en: 'Round-trip hotel transfer within Hurghada',
        ar: 'توصيل ذهاب وعودة من فنادق الغردقة',
        de: 'Hin- und Rücktransfer ab Hotels in Hurghada',
      },
      {
        en: 'Yacht trip with two snorkeling stops and the Hula Hula island stop',
        ar: 'رحلة باليخت مع توقفين للسنوركلينج وتوقف جزيرة هولا هولا',
        de: 'Yachttour mit zwei Schnorchelstopps und dem Stopp auf Hula Hula Island',
      },
      {
        en: 'Full snorkeling gear (mask, fins and snorkel) and life jacket',
        ar: 'معدات سنوركلينج كاملة (ماسك وزعانف وأنبوب تنفس) وسترة نجاة',
        de: 'Komplette Schnorchelausrüstung (Maske, Flossen und Schnorchel) und Schwimmweste',
      },
      {
        en: 'Open buffet lunch on board',
        ar: 'غداء بوفيه مفتوح على متن اليخت',
        de: 'Offenes Mittagsbuffet an Bord',
      },
      {
        en: 'Drinks all day',
        ar: 'مشروبات طول اليوم',
        de: 'Getränke den ganzen Tag',
      },
      {
        en: 'Sea supervision and rescue team on board',
        ar: 'فريق إشراف وإنقاذ بحري على متن اليخت',
        de: 'Meeresaufsichts- und Rettungsteam an Bord',
      },
    ],
    tips: [
      {
        en: 'Transfer from El Gouna, Sahl Hasheesh or Makadi Bay (€10 per person)',
        ar: 'التوصيل من الجونة أو سهل حشيش أو مكادي باي (10 يورو للفرد)',
        de: 'Transfer ab El Gouna, Sahl Hasheesh oder Makadi Bay (10 € pro Person)',
      },
      {
        en: 'Transfer from Soma Bay or Safaga (€15 per person)',
        ar: 'التوصيل من سوما باي أو سفاجا (15 يورو للفرد)',
        de: 'Transfer ab Soma Bay oder Safaga (15 € pro Person)',
      },
      {
        en: 'Photos (available to purchase)',
        ar: 'الصور (متاحة للشراء)',
        de: 'Fotos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [
      {
        en: 'Guests who want the busiest, most famous beach scene: this island is the quiet alternative',
        ar: 'الضيوف الذين يريدون أكثر شاطئ صاخب ومشهور: هذه الجزيرة هي البديل الأهدأ',
        de: 'Gäste, die die belebteste und bekannteste Strandszene suchen: Diese Insel ist die ruhigere Alternative',
      },
    ],
    whatToBring: [
      { en: 'Swimsuit and towel', ar: 'مايوه وفوطة', de: 'Badekleidung und Handtuch' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Sunglasses and a hat', ar: 'نظارة شمس وقبعة', de: 'Sonnenbrille und Hut' },
      {
        en: 'A waterproof phone pouch if you want photos in the water',
        ar: 'جراب موبايل مقاوم للماء لو أردت التصوير في الماء',
        de: 'Eine wasserdichte Handyhülle, wenn Sie Fotos im Wasser machen möchten',
      },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'The island stop is two hours. The rest of the day is sailing and snorkeling.',
        ar: 'التوقف على الجزيرة ساعتان، وبقية اليوم إبحار وسنوركلينج.',
        de: 'Der Inselaufenthalt dauert zwei Stunden. Der Rest des Tages ist Segeln und Schnorcheln.',
      },
      {
        en: 'You do not need to be a strong swimmer. Life jackets are provided for everyone and the team stays with the group in the water.',
        ar: 'لا يشترط أن تكون سباحًا محترفًا. سترات النجاة متوفرة للجميع والفريق يبقى مع المجموعة في الماء.',
        de: 'Sie müssen kein starker Schwimmer sein. Schwimmwesten stehen für alle bereit und das Team bleibt im Wasser bei der Gruppe.',
      },
      {
        en: 'Your exact pickup time is confirmed the day before your trip. Please be ready at your pickup point.',
        ar: 'يتأكد وقت الاستلام بالظبط قبل الرحلة بيوم. برجاء التواجد في نقطة الاستلام في الموعد.',
        de: 'Ihre genaue Abholzeit wird einen Tag vor der Tour bestätigt. Bitte seien Sie rechtzeitig am Abholpunkt.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Hurghada Marina / Hotel Lobby Pickup',
      ar: 'مارينا الغردقة أو الاستلام من بهو الفندق',
      de: 'Hurghada Marina / Hotelabholung',
    },
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Red Sea Boat Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-private-speed-boat',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Transfer to the marina, departure time agreed with you after booking', ar: 'الانتقال إلى المارينا، وموعد التحرك يُتفق عليه معك بعد الحجز', de: 'Transfer zur Marina, die Abfahrtszeit wird nach der Buchung mit Ihnen vereinbart' },
      },
      {
        kind: 'stop',
        title: { en: 'Board your private speed boat', ar: 'ركوب اللانش السريع الخاص بك', de: 'An Bord Ihres privaten Speedboots' },
        subtitle: { en: 'For your group only, with a captain and a guide', ar: 'لمجموعتك فقط، مع قبطان ومرشد', de: 'Nur für Ihre Gruppe, mit Kapitän und Guide' },
      },
      {
        kind: 'stop',
        title: { en: 'Fast run across the Red Sea', ar: 'جولة سريعة في البحر الأحمر', de: 'Schnelle Fahrt über das Rote Meer' },
      },
      {
        kind: 'stop',
        title: { en: 'Photo and swim stops along the coast', ar: 'وقفات تصوير وسباحة على الساحل', de: 'Foto- und Badestopps entlang der Küste' },
        subtitle: { en: 'Wherever you want them', ar: 'في الأماكن اللي تختارها', de: 'Wo immer Sie möchten' },
      },
      {
        kind: 'end',
        title: { en: 'Return to the marina and hotel drop-off', ar: 'العودة للمارينا والتوصيل للفندق', de: 'Rückkehr zur Marina und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Private Speed Boat in Hurghada: One Fixed Price for the Whole Boat',
      ar: 'سبيد بوت خاص في الغردقة: سعر واحد ثابت للقارب بالكامل',
      de: 'Privates Speedboot in Hurghada: Ein Festpreis für das ganze Boot',
    },
    displayName: { en: 'Private Speed Boat: Your Boat, Your Group', ar: 'سبيد بوت خاص: قاربك ومجموعتك', de: 'Privates Speedboot: Dein Boot, Deine Gruppe' },
    seoTitle: { en: 'Private Speed Boat Trip in Hurghada: Your Own Boat & Captain', de: 'Privates Speedboot in Hurghada: Eigenes Boot mit Kapitän' },
    slug: '/trips/private-speed-boat-hurghada/',
    category: 'sea',
    destination: 'Hurghada',
    images: [heroCoastImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: 'By agreement', ar: 'بالاتفاق', de: 'Nach Vereinbarung' },
    departureTimes: [],
    timingNote: {
      en: 'Departure time and trip length are agreed with you when you book.',
      ar: 'يتم الاتفاق معك على وقت الانطلاق ومدة الرحلة عند الحجز.',
      de: 'Abfahrtszeit und Dauer der Tour werden bei der Buchung mit Ihnen vereinbart.',
    },
    price: 101,
    options: [
      {
        id: 'opt-speedboat-whole',
        title: {
          en: 'Private Speed Boat (Whole Boat · €101 Fixed)',
          ar: 'سبيد بوت خاص (القارب بالكامل · 101€ سعر ثابت)',
          de: 'Privates Speedboot (Ganzes Boot · 101 € Festpreis)',
        },
        detail: {
          en: '€101 fixed for the whole boat, up to 6 guests · departure time agreed when you book · private captain & guide',
          ar: '101€ سعر ثابت للقارب بالكامل حتى 6 ضيوف · وقت الانطلاق بالاتفاق عند الحجز · قبطان ومرشد خاص',
          de: '101 € Festpreis für das gesamte Boot, bis zu 6 Gäste · Abfahrtszeit nach Vereinbarung · privater Kapitän & Guide',
        },
        price: 101,
      },
    ],
    shortDescription: {
      en: 'Your own speed boat at your own pace, €101 for the whole boat, stopping for photos wherever the light is best.',
      ar: 'قاربك السريع الخاص وبإيقاعك الخاص. 101 يورو تغطي القارب بالكامل لمجموعتك، مع مرشد محترف وقبطان مدرب، ووقفات تصوير أينما كانت الإضاءة أجمل، ومشروبات على متن القارب طول الرحلة.',
      de: 'Ihr eigenes Speedboot, Ihr eigenes Tempo. 101 € decken das gesamte Boot für Ihre Gruppe ab, inklusive professionellem Guide, erfahrenem Kapitän, Fotostopps beim besten Licht und Getränken an Bord während der gesamten Fahrt.',
    },
    fullDescription: {
      en: "No group to keep up with, no schedule written by strangers, no waiting for forty people to climb back on board. A private speed boat is the Red Sea at your speed, and this one is priced the simple way: one fixed price for the whole boat, whoever is in it, within the boat's capacity.\n\nWe pick you up from your hotel and bring you to the marina, where your boat, your professional guide and your trained captain are ready. Then it is out onto open water: fast runs across the blue, slower stretches when someone spots something worth looking at, and photo stops wherever the coast, the light or a quiet bay asks for one.\n\nFamilies use this boat to give the kids the ride of the holiday without a crowd around them. Small groups of friends use it to make the day entirely theirs. Couples use it to disappear for a while. The boat does not mind which one you are.\n\nLife jackets and full safety equipment are on board for everyone, and drinks are served throughout the trip. The departure time and the length of the trip are agreed with you when you book, so the day fits around your plans rather than the other way round.\n\nOne boat, one price, your group only. That is the whole offer, and it needs nothing added.",
      ar: 'لا مجموعة تضطر لمجاراتها، ولا جدول وضعه غرباء، ولا انتظار لأربعين شخصًا حتى يصعدوا للقارب. السبيد بوت الخاص هو البحر الأحمر بسرعتك الخاصة، وتسعيره بسيط وواضح: سعر واحد ثابت للقارب بالكامل مهما كان عددكم ضمن سعة القارب.\n\nنستلمك من فندقك ونوصلك إلى المارينا، حيث يكون قاربك ومرشدك المحترف وقبطانك المدرب جاهزين. بعدها تنطلق في المياه المفتوحة: انطلاقات سريعة فوق الزرقة، وتباطؤ هادئ كلما لمحت ما يستحق المشاهدة، ووقفات تصوير أينما طلبت الساحل أو الإضاءة أو خليج هادئ.\n\nالعائلات تختار هذا القارب لتمنح الأطفال أجمل جولة في الإجازة بدون زحام. مجموعات الأصدقاء الصغيرة تجعل اليوم ملكها بالكامل. والأزواج يختارونه لخصوصية هادئة لبعض الوقت.\n\nسترات النجاة ومعدات السلامة الكاملة متوفرة للجميع على القارب، والمشروبات تُقدم طول الرحلة. يتم الاتفاق معك على وقت الانطلاق ومدة الرحلة عند الحجز ليناسب اليوم خططك تمامًا.\n\nقارب واحد، سعر واحد، ومجموعتك فقط. هذا هو العرض كله ولا يحتاج أي إضافات.',
      de: 'Keine Gruppe, mit der Sie Schritt halten müssen, kein fremder Zeitplan, kein Warten darauf, dass vierzig Personen wieder an Bord klettern. Ein privates Speedboot ist das Rote Meer in Ihrem Tempo, und der Preis ist einfach: ein Festpreis für das ganze Boot, innerhalb der Bootskapazität.\n\nWir holen Sie vom Hotel ab und bringen Sie zur Marina, wo Ihr Boot, Ihr professioneller Guide und Ihr erfahrener Kapitän bereitstehen. Dann geht es hinaus aufs offene Meer: schnelle Fahrten über das Blau, ruhigere Abschnitte, wenn jemand etwas Besonderes entdeckt, und Fotostopps überall dort, wo Küste, Licht oder eine stille Bucht danach verlangen.\n\nFamilien nutzen dieses Boot, um den Kindern ohne Menschenmenge die schönste Fahrt des Urlaubs zu schenken. Kleine Freundesgruppen machen den Tag ganz zu ihrem eigenen. Paare gönnen sich eine private Auszeit auf dem Wasser.\n\nSchwimmwesten und vollständige Sicherheitsausrüstung sind für alle an Bord, und Getränke werden während der gesamten Tour serviert. Abfahrtszeit und Dauer werden bei der Buchung mit Ihnen abgestimmt, damit sich der Tag nach Ihren Plänen richtet.\n\nEin Boot, ein Preis, nur Ihre Gruppe. Das ist das ganze Angebot, mehr braucht es nicht.',
    },
    highlights: [
      {
        en: 'Hotel pickup and transfer to the marina',
        ar: 'الاستلام من الفندق والتوصيل إلى المارينا',
        de: 'Hotelabholung und Transfer zur Marina',
      },
      {
        en: 'A private speed boat for your group only',
        ar: 'سبيد بوت خاص لمجموعتك فقط',
        de: 'Ein privates Speedboot nur für Ihre Gruppe',
      },
      {
        en: 'Fast runs across the open Red Sea',
        ar: 'انطلاقات سريعة عبر مياه البحر الأحمر المفتوحة',
        de: 'Schnelle Fahrten über das offene Rote Meer',
      },
      {
        en: 'Photo stops along the coast wherever you want them',
        ar: 'وقفات تصوير على طول الساحل أينما أردت',
        de: 'Fotostopps entlang der Küste, wo immer Sie möchten',
      },
      {
        en: 'Life jackets and full safety equipment for everyone',
        ar: 'سترات نجاة ومعدات سلامة كاملة للجميع',
        de: 'Schwimmwesten und komplette Sicherheitsausrüstung für alle',
      },
      {
        en: 'Drinks served throughout the trip',
        ar: 'مشروبات تُقدم طول الرحلة',
        de: 'Getränke während der gesamten Tour serviert',
      },
      {
        en: 'A professional guide and a trained captain on board with you',
        ar: 'مرشد محترف وقبطان مدرب معك على متن القارب',
        de: 'Ein professioneller Guide und ein geschulter Kapitän an Bord',
      },
    ],
    included: [
      {
        en: 'Round-trip hotel transfer within Hurghada',
        ar: 'توصيل ذهاب وعودة من فنادق الغردقة',
        de: 'Hin- und Rücktransfer ab Hotels in Hurghada',
      },
      {
        en: 'Private speed boat for the agreed trip',
        ar: 'سبيد بوت خاص للرحلة المتفق عليها',
        de: 'Privates Speedboot für die vereinbarte Tour',
      },
      {
        en: 'Professional guide and trained captain',
        ar: 'مرشد محترف وقبطان مدرب',
        de: 'Professioneller Guide und geschulter Kapitän',
      },
      {
        en: 'Life jackets and full safety equipment',
        ar: 'سترات نجاة ومعدات سلامة كاملة',
        de: 'Schwimmwesten und komplette Sicherheitsausrüstung',
      },
      {
        en: 'Drinks throughout the trip',
        ar: 'مشروبات طول الرحلة',
        de: 'Getränke während der gesamten Tour',
      },
    ],
    tips: [
      {
        en: 'Transfer from El Gouna, Sahl Hasheesh or Makadi Bay (€10 per person)',
        ar: 'التوصيل من الجونة أو سهل حشيش أو مكادي باي (10 يورو للفرد)',
        de: 'Transfer ab El Gouna, Sahl Hasheesh oder Makadi Bay (10 € pro Person)',
      },
      {
        en: 'Transfer from Soma Bay or Safaga (€15 per person)',
        ar: 'التوصيل من سوما باي أو سفاجا (15 يورو للفرد)',
        de: 'Transfer ab Soma Bay oder Safaga (15 € pro Person)',
      },
      {
        en: 'Photos (available to purchase)',
        ar: 'الصور (متاحة للشراء)',
        de: 'Fotos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    whatToBring: [
      {
        en: 'Sunscreen and sunglasses (the wind on a fast boat is stronger than it feels)',
        ar: 'واقي شمس ونظارة شمس (الهواء على القارب السريع أقوى مما يبدو)',
        de: 'Sonnencreme und Sonnenbrille (der Fahrtwind auf einem schnellen Boot ist stärker, als er sich anfühlt)',
      },
      {
        en: 'A towel and swimsuit if you plan to swim at a stop',
        ar: 'فوطة ومايوه إن كنت تخطط للسباحة في أحد التوقفات',
        de: 'Handtuch und Badekleidung, wenn Sie bei einem Stopp schwimmen möchten',
      },
      {
        en: 'A light layer for the ride back',
        ar: 'قطعة ملابس خفيفة لطريق العودة',
        de: 'Eine leichte Schicht für die Rückfahrt',
      },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'The price is €101 for the whole boat, not per person. Split it between your group however you like.',
        ar: 'السعر 101 يورو للقارب بالكامل وليس للفرد، ويمكن تقسيمه بين مجموعتك كما تشاء.',
        de: 'Der Preis von 101 € gilt für das ganze Boot, nicht pro Person. Sie können ihn beliebig in Ihrer Gruppe aufteilen.',
      },
      {
        en: 'Departure time and trip length are agreed with you when you book.',
        ar: 'يتم الاتفاق معك على وقت الانطلاق ومدة الرحلة عند الحجز.',
        de: 'Abfahrtszeit und Dauer der Tour werden bei der Buchung mit Ihnen vereinbart.',
      },
      {
        en: 'The boat takes up to 6 guests.',
        ar: 'يتسع القارب حتى 6 ضيوف.',
        de: 'Das Boot bietet Platz für bis zu 6 Gäste.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Hurghada Marina / Hotel Lobby Pickup',
      ar: 'مارينا الغردقة أو الاستلام من بهو الفندق',
      de: 'Hurghada Marina / Hotelabholung',
    },
    outerTransferEnabled: true,
    pricingMode: 'per-group',
    maxGuests: 6,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Red Sea Boat Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'sahl-hasheesh-beach-dive',
    itinerary: [
      {
        kind: 'stop',
        title: { en: 'Welcome at the beach in Sahl Hasheesh', ar: 'الاستقبال على الشاطئ في سهل حشيش', de: 'Begrüßung am Strand in Sahl Hasheesh' },
        subtitle: { en: 'Full equipment fitting', ar: 'تجهيز كامل المعدات', de: 'Komplette Ausrüstungsanpassung' },
      },
      {
        kind: 'stop',
        title: { en: 'Safety briefing', ar: 'شرح السلامة', de: 'Sicherheitsbriefing' },
        subtitle: { en: 'Equipment introduction, step by step', ar: 'تعريف بالمعدات خطوة بخطوة', de: 'Einführung in die Ausrüstung, Schritt für Schritt' },
      },
      {
        kind: 'stop',
        title: { en: 'Guided dive from the shore', ar: 'غوصة إرشادية من الشاطئ', de: 'Geführter Tauchgang vom Ufer' },
        subtitle: { en: 'Coral reefs and marine life, no boat required', ar: 'شعاب مرجانية وحياة بحرية، من غير مركب', de: 'Korallenriffe und Meeresleben, ganz ohne Boot' },
      },
      {
        kind: 'break',
        title: { en: 'Soft drinks and debrief', ar: 'مشروبات غازية وختام الجلسة', de: 'Softdrinks und Nachbesprechung' },
      },
      {
        kind: 'end',
        title: { en: 'End of the session', ar: 'نهاية الجلسة', de: 'Ende der Session' },
      },
    ],
    name: {
      en: 'Sahl Hasheesh Beach Dive: A Beginner Dive Straight from the Shore',
      ar: 'غوص من شاطئ سهل حشيش: تجربة غوص للمبتدئين مباشرة من الشاطئ',
      de: 'Sahl Hasheesh Strandtauchgang: Ein Anfängertauchgang direkt vom Ufer',
    },
    displayName: { en: 'Sahl Hasheesh Beach Dive', ar: 'غوص شاطئ سهل حشيش', de: 'Sahl Hasheesh Strandtauchen' },
    seoTitle: { en: 'Sahl Hasheesh Beach Dive: Shore Diving for All Levels', de: 'Sahl Hasheesh Strandtauchen: Für Anfänger & Fortgeschrittene' },
    slug: '/trips/sahl-hasheesh-beach-dive/',
    category: 'sea',
    destination: 'Hurghada',
    images: [heroCoastImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '3 hours', ar: '3 ساعات', de: '3 Stunden' },
    departureTimes: ['09:00 AM'],
    price: 27,
    options: [
      {
        id: 'opt-beach-dive-intro',
        title: {
          en: 'Beach Dive for Beginners (Small Group)',
          ar: 'غوص شاطئي للمبتدئين (مجموعة صغيرة)',
          de: 'Strandtauchgang für Anfänger (Kleingruppe)',
        },
        detail: {
          en: 'Shore entry, no boat · full equipment included · max 10 participants',
          ar: 'دخول مباشر من الشاطئ بدون مركب · المعدات الكاملة مشمولة · بحد أقصى 10 مشاركين',
          de: 'Einstieg vom Strand, ohne Boot · komplette Ausrüstung inklusive · max. 10 Teilnehmer',
        },
        price: 27,
      },
    ],
    shortDescription: {
      en: 'Walk straight into the Red Sea from the beach with a certified instructor beside you, over the reef at your own pace.',
      ar: 'بدون مركب، بدون زحام، وبدون أي ضغط. ادخل البحر الأحمر مشيًا من شاطئ سهل حشيش مع مدرب معتمد بجانبك، في مجموعة صغيرة لا تتجاوز عشرة مشاركين، واكتشف الشعاب المرجانية على مهلك.',
      de: 'Kein Boot, keine Menschenmassen, kein Druck. Gehen Sie am Strand von Sahl Hasheesh mit einem zertifizierten Tauchlehrer an Ihrer Seite ins Rote Meer, in einer kleinen Gruppe von höchstens zehn Personen, und entdecken Sie das Korallenriff in Ihrem eigenen Tempo.',
    },
    fullDescription: {
      en: 'Most diving starts with a boat. This one starts with your feet in the sand. At Sahl Hasheesh the reef begins right at the shoreline, so your first dive, or your first dive in a long time, can start the easy way: walking in from the beach.\n\nYou are welcomed by the dive team and fitted with high-quality equipment, everything included, mask, fins, tank and wetsuit. Then a full safety briefing and an introduction to the equipment, step by step, until you feel confident and relaxed. No prior experience is needed, and your certified instructor stays beside you for the whole dive.\n\nUnderwater, the Sahl Hasheesh reef does the rest: colourful coral and vibrant marine life in crystal-clear water, explored slowly because the group is small, at most ten participants, and the instructor has time for every single person.\n\nWhether it is your very first dive or simply the calmest way to meet the Red Sea, a beach dive gives you the magic of diving without a boat schedule, without a crowd, and without any rush.',
      ar: 'معظم تجارب الغوص تبدأ من على متن مركب، أما هذه التجربة فتبدأ وقدماك على الرمل. في سهل حشيش تبدأ الشعاب المرجانية مباشرة من خط الشاطئ، لذلك يمكن لأول غطسة لك، أو أول غطسة منذ فترة طويلة، أن تبدأ بأسهل طريقة ممكنة: بالدخول مشيًا من الشاطئ.\n\nيستقبلك فريق الغوص ويجهزك بمعدات عالية الجودة تشمل كل شيء: القناع والزعانف والأسطوانة وبدلة الغوص. بعدها تحصل على شرح كامل للسلامة وتعريف بالمعدات خطوة بخطوة حتى تشعر بالثقة والراحة. لا يلزم أي خبرة سابقة، ويبقى مدربك المعتمد بجانبك طول الغطسة.\n\nتحت الماء، تتكفل شعاب سهل حشيش بالباقي: مرجان ملون وحياة بحرية نابضة في مياه صافية، تستكشفها بهدوء لأن المجموعة صغيرة بحد أقصى عشرة مشاركين ولأن المدرب لديه وقت كافٍ لكل شخص.\n\nسواء كانت هذه غطستك الأولى على الإطلاق أو أهدأ طريقة للقاء البحر الأحمر، يمنحك الغوص الشاطئي سحر الغوص بدون جدول مركب، وبدون زحام، وبدون أي استعجال.',
      de: 'Die meisten Tauchgänge beginnen auf einem Boot. Dieser beginnt mit Ihren Füßen im Sand. In Sahl Hasheesh fängt das Riff direkt an der Uferlinie an, sodass Ihr erster Tauchgang, oder Ihr erster nach langer Zeit, ganz entspannt starten kann: indem Sie einfach vom Strand ins Wasser gehen.\n\nDas Tauchteam empfängt Sie und passt Ihnen hochwertige Ausrüstung an, alles inklusive: Maske, Flossen, Flasche und Neoprenanzug. Danach folgen eine ausführliche Sicherheitseinweisung und eine Schritt-für-Schritt-Einführung in die Ausrüstung, bis Sie sich sicher und entspannt fühlen. Vorkenntnisse sind nicht erforderlich, und Ihr zertifizierter Tauchlehrer bleibt den gesamten Tauchgang an Ihrer Seite.\n\nUnter Wasser übernimmt das Riff von Sahl Hasheesh den Rest: farbenfrohe Korallen und lebendige Unterwasserwelt in kristallklarem Wasser, in aller Ruhe erkundet, da die Gruppe mit maximal zehn Teilnehmern klein bleibt und der Tauchlehrer für jeden Einzelnen Zeit hat.\n\nOb es Ihr allererster Tauchgang ist oder einfach die ruhigste Art, das Rote Meer zu erleben: Ein Strandtauchgang schenkt Ihnen die Magie des Tauchens ohne Bootsfahrplan, ohne Gedränge und ohne jede Eile.',
    },
    highlights: [
      {
        en: 'A warm welcome and full equipment fitting at the beach',
        ar: 'استقبال دافئ وتجهيز كامل بمعدات الغوص على الشاطئ',
        de: 'Herzlicher Empfang und komplette Ausrüstungsanpassung am Strand',
      },
      {
        en: 'A complete safety briefing and equipment introduction, step by step',
        ar: 'شرح كامل للسلامة وتعريف بالمعدات خطوة بخطوة',
        de: 'Ausführliche Sicherheitseinweisung und Ausrüstungseinführung Schritt für Schritt',
      },
      {
        en: 'A guided dive straight from the shore, no boat required',
        ar: 'غطسة بإرشاد مباشر من الشاطئ بدون الحاجة لمركب',
        de: 'Geführter Tauchgang direkt vom Ufer, kein Boot erforderlich',
      },
      {
        en: 'Colourful coral reefs and vibrant marine life',
        ar: 'شعاب مرجانية ملونة وحياة بحرية نابضة',
        de: 'Farbenfrohe Korallenriffe und lebendige Unterwasserwelt',
      },
      {
        en: 'A small group of at most ten participants',
        ar: 'مجموعة صغيرة بحد أقصى عشرة مشاركين',
        de: 'Kleine Gruppe mit maximal zehn Teilnehmern',
      },
      {
        en: 'Soft drinks included',
        ar: 'المشروبات الغازية مشمولة',
        de: 'Softdrinks inklusive',
      },
      {
        en: 'Led by certified professional diving instructors',
        ar: 'بقيادة مدربي غوص محترفين ومعتمدين',
        de: 'Geleitet von zertifizierten professionellen Tauchlehrern',
      },
    ],
    included: [
      {
        en: 'Professional diving instructor',
        ar: 'مدرب غوص محترف',
        de: 'Professioneller Tauchlehrer',
      },
      {
        en: 'Full diving equipment (mask, fins, tank, wetsuit)',
        ar: 'معدات غوص كاملة (قناع، زعانف، أسطوانة، بدلة غوص)',
        de: 'Komplette Tauchausrüstung (Maske, Flossen, Flasche, Neoprenanzug)',
      },
      {
        en: 'Introductory dive session from the beach',
        ar: 'جلسة غوص تعريفية من الشاطئ',
        de: 'Einführungstauchgang direkt vom Strand',
      },
      {
        en: 'All safety briefings and instructions',
        ar: 'جميع شروحات وتعليمات السلامة',
        de: 'Alle Sicherheitseinweisungen und Instruktionen',
      },
      {
        en: 'Soft drinks',
        ar: 'مشروبات غازية',
        de: 'Softdrinks',
      },
    ],
    tips: [
      {
        en: 'Pickup from El Gouna, Soma Bay or Safaga (available for an additional fee, payable on site)',
        ar: 'الاستلام من الجونة أو سوما باي أو سفاجا (متاح برسوم إضافية تُدفع في الموقع)',
        de: 'Abholung ab El Gouna, Soma Bay oder Safaga (gegen Aufpreis vor Ort zahlbar)',
      },
      {
        en: 'Photos (available to purchase)',
        ar: 'الصور (متاحة للشراء)',
        de: 'Fotos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips and personal expenses',
        ar: 'الإكراميات والمصاريف الشخصية',
        de: 'Trinkgeld und persönliche Ausgaben',
      },
    ],
    notSuitableFor: [
      {
        en: 'Children under 10 years',
        ar: 'الأطفال تحت 10 سنوات',
        de: 'Kinder unter 10 Jahren',
      },
      {
        en: 'People with heart problems',
        ar: 'الأشخاص الذين يعانون من مشاكل في القلب',
        de: 'Personen mit Herzproblemen',
      },
      {
        en: 'Wheelchair users',
        ar: 'مستخدمو الكراسي المتحركة',
        de: 'Rollstuhlfahrer',
      },
      {
        en: 'People with respiratory issues',
        ar: 'الأشخاص الذين يعانون من مشاكل في الجهاز التنفسي',
        de: 'Personen mit Atemwegsproblemen',
      },
    ],
    whatToBring: [
      {
        en: 'Swimwear and a towel',
        ar: 'ملابس سباحة وفوطة',
        de: 'Badekleidung und ein Handtuch',
      },
      {
        en: 'Sunscreen',
        ar: 'واقي شمس',
        de: 'Sonnencreme',
      },
      {
        en: 'A camera',
        ar: 'كاميرا',
        de: 'Eine Kamera',
      },
      {
        en: 'Comfortable clothes',
        ar: 'ملابس مريحة',
        de: 'Bequeme Kleidung',
      },
    ],
    notAllowed: [
      {
        en: 'Touching marine life',
        ar: 'لمس الكائنات البحرية',
        de: 'Berühren von Meereslebewesen',
      },
      {
        en: 'Alcohol and drugs',
        ar: 'الكحول والمخدرات',
        de: 'Alkohol und Drogen',
      },
    ],
    knowBeforeYouGo: [
      {
        en: 'Participants should be comfortable in the water. No diving licence or prior experience is needed.',
        ar: 'يجب أن يشعر المشاركون بالراحة في الماء، ولا يلزم وجود رخصة غوص أو خبرة سابقة.',
        de: 'Teilnehmer sollten sich im Wasser wohlfühlen. Es sind weder Tauchschein noch Vorkenntnisse erforderlich.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Sahl Hasheesh Beach Dive Center / Hotel Pickup Available',
      ar: 'مركز الغوص على شاطئ سهل حشيش أو الاستلام من الفندق',
      de: 'Tauchbasis am Strand von Sahl Hasheesh / Hotelabholung verfügbar',
    },
    outerTransferEnabled: true,
    freeTransferZones: ['sahl-hasheesh'],
    pickup: {
      en: 'Sahl Hasheesh & Hurghada pickup available · Extra fee for El Gouna, Soma Bay and Safaga (payable on site)',
      ar: 'يتوفر الاستلام من سهل حشيش والغردقة · رسوم إضافية للجونة وسوما باي وسفاجا (تُدفع في الموقع)',
      de: 'Abholung ab Sahl Hasheesh & Hurghada verfügbar · Aufpreis für El Gouna, Soma Bay und Safaga (vor Ort zahlbar)',
    },
    supplierName: 'Red Sea Diving Partner',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 10,
    featured: false,
    languages: ['English', 'German', 'French', 'Italian'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-diving-snorkeling-boat',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
      },
      {
        kind: 'stop',
        title: { en: 'Board the dive boat', ar: 'ركوب مركب الغوص', de: 'An Bord des Tauchboots' },
        subtitle: { en: 'Meet the dive team and fit your equipment', ar: 'التعرف على فريق الغوص وتجهيز المعدات', de: 'Tauchteam kennenlernen und Ausrüstung anpassen' },
      },
      {
        kind: 'stop',
        title: { en: 'First site', ar: 'الموقع الأول', de: 'Erster Spot' },
        subtitle: { en: 'Snorkelling, intro dive or certified dive, as booked', ar: 'سنوركلينج أو غوصة تعريفية أو غوصة معتمدة، حسب الحجز', de: 'Schnorcheln, Schnuppertauchen oder zertifiziertes Tauchen, je nach Buchung' },
      },
      {
        kind: 'break',
        title: { en: 'Buffet lunch on board', ar: 'غداء بوفيه على المركب', de: 'Buffet-Mittagessen an Bord' },
        subtitle: { en: 'With fruit and unlimited soft drinks', ar: 'مع فاكهة ومشروبات غازية بلا حدود', de: 'Mit Obst und unbegrenzten Softdrinks' },
      },
      {
        kind: 'stop',
        title: { en: 'Second site', ar: 'الموقع الثاني', de: 'Zweiter Spot' },
        subtitle: { en: 'Sites are chosen daily for weather and experience level', ar: 'المواقع تُختار يوميًا حسب الطقس ومستوى الخبرة', de: 'Die Spots werden täglich nach Wetter und Erfahrungsstand gewählt' },
      },
      {
        kind: 'end',
        title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Hurghada Diving and Snorkeling Boat Day: Beginners, Certified Divers and Snorkellers',
      ar: 'يوم مركب الغوص والسنوركلينج في الغردقة: للمبتدئين والغواصين المعتمدين ومحبي السنوركلينج',
      de: 'Hurghada Tauch- und Schnorchelboot-Tag: Anfänger, zertifizierte Taucher und Schnorchler',
    },
    displayName: { en: 'Hurghada Diving & Snorkeling Boat', ar: 'مركب الغوص والسنوركلينج بالغردقة', de: 'Hurghada Tauch- & Schnorchelboot' },
    seoTitle: { en: 'Hurghada Diving & Snorkeling Boat Trip: Two Reef Dives Daily', de: 'Hurghada Tauchen & Schnorcheln Bootstour: Schnuppertauchen & Riffe' },
    slug: '/trips/diving-snorkeling-boat-hurghada/',
    category: 'sea',
    destination: 'Hurghada',
    images: [orangeBayImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '7 hours', ar: '7 ساعات', de: '7 Stunden' },
    departureTimes: ['09:00 AM'],
    price: 25,
    options: [
      {
        id: 'opt-boat-snorkel',
        title: {
          en: 'Boat Cruise with 2 Snorkelling Stops',
          ar: 'رحلة مركب مع وقفتي سنوركلينج',
          de: 'Bootsfahrt mit 2 Schnorchelstopps',
        },
        detail: {
          en: 'Snorkel two reef sites · no diving · lunch & unlimited soft drinks',
          ar: 'سنوركلينج في موقعي شعاب مرجانية · بدون غوص · غداء ومشروبات غازية مفتوحة',
          de: 'Schnorcheln an zwei Riffen · ohne Tauchen · Mittagessen & unbegrenzte Softdrinks',
        },
        price: 25,
      },
      {
        id: 'opt-boat-intro-dive',
        title: {
          en: 'Boat Cruise with 2 Intro Dives (Beginners)',
          ar: 'رحلة مركب مع غطستين تعريفيتين (للمبتدئين)',
          de: 'Bootsfahrt mit 2 Schnuppertauchgängen (Anfänger)',
        },
        detail: {
          en: 'Two guided intro dives, about 15 minutes each · no licence needed · instructor beside you',
          ar: 'غطستان تعريفيتان بإرشاد، حوالي 15 دقيقة لكل غطسة · بدون رخصة · مدرب بجانبك',
          de: 'Zwei geführte Schnuppertauchgänge, je ca. 15 Minuten · kein Tauchschein nötig · Tauchlehrer an Ihrer Seite',
        },
        price: 42,
      },
      {
        id: 'opt-boat-certified',
        title: {
          en: 'Boat Trip for Certified Divers',
          ar: 'رحلة مركب للغواصين المعتمدين',
          de: 'Bootsausflug für zertifizierte Taucher',
        },
        detail: {
          en: 'Two guided dives of 45 to 60 minutes · certification required',
          ar: 'غطستان بإرشاد من 45 إلى 60 دقيقة · تتطلب شهادة غوص معتمدة',
          de: 'Zwei geführte Tauchgänge von 45 bis 60 Minuten · Tauchschein erforderlich',
        },
        price: 38,
      },
    ],
    shortDescription: {
      en: 'One boat, three ways down to the reef: snorkel it, try your first dive, or dive it certified.',
      ar: 'مركب واحد وثلاث طرق للاستمتاع بالشعاب المرجانية. مارس السنوركلينج في موقعين مرجانيين، أو جرّب غطستين تعريفيتين كمبتدئ تمامًا، أو غُص كغواص معتمد، مع غداء بوفيه وفواكه ومشروبات غازية مفتوحة على المركب، وكل المعدات ورسوم المحمية مشمولة.',
      de: 'Ein Boot, drei Möglichkeiten das Riff zu erleben. Schnorcheln Sie an zwei Korallenplätzen, machen Sie als kompletter Anfänger zwei Schnuppertauchgänge oder tauchen Sie als zertifizierter Taucher, inklusive Mittagsbuffet, Obst, unbegrenzten Softdrinks an Bord sowie kompletter Ausrüstung und Nationalparkgebühren.',
    },
    fullDescription: {
      en: 'This is the Red Sea boat day that fits everyone in your group at once. We pick you up from your hotel in Hurghada and take you to the marina, where you meet the dive team, receive your safety briefing and board a spacious, fully equipped dive boat.\n\nThe boat visits two carefully selected sites in the Red Sea, chosen on the day according to the weather and the experience level of the guests. Between stops, the deck is yours: sunshine, a fresh buffet lunch with fruit, and unlimited soft drinks.\n\nThen you choose how your day goes. Snorkellers swim at both reef sites while the diving happens around them. Beginners take two intro dives under the direct supervision of an instructor, no licence and no experience needed, the underwater world fifteen minutes at a time. Certified divers make two full guided dives with a professional guide who knows these reefs by heart.\n\nAll diving equipment and national park fees are included in every option. There are no hidden rental costs waiting for you on board.',
      ar: 'هذا هو يوم البحر الأحمر الذي يناسب الجميع في مجموعتك في وقت واحد. نستلمك من فندقك في الغردقة ونوصلك إلى المارينا، حيث تلتقي بفريق الغوص وتتلقى شرح السلامة وتصعد إلى مركب غوص واسع ومجهز بالكامل.\n\nيزور المركب موقعين مختارين بعناية في البحر الأحمر وفقًا لحالة الطقس ومستوى خبرة الضيوف في ذلك اليوم. وبين التوقفات، سطح المركب ملكك بالكامل: شمس دافئة، وغداء بوفيه طازج مع فواكه، ومشروبات غازية مفتوحة.\n\nبعدها تختار كيف تعيش يومك. محبو السنوركلينج يسبحون في الموقعين بينما يجري الغوص حولهم. والمبتدئون يخوضون غطستين تعريفيتين تحت إشراف مباشر من مدرب بدون الحاجة لرخصة أو خبرة سابقة، لاكتشاف عالم الأعماق بهدوء. أما الغواصون المعتمدون فيقومون بغطستين كاملتين مع مرشد محترف يعرف هذه الشعاب عن ظهر قلب.\n\nجميع معدات الغوص ورسوم المحمية الطبيعية مشمولة في كل اختيار، ولا توجد أي رسوم إيجار مخفية بانتظارك على المركب.',
      de: 'Das ist der Bootstag am Roten Meer, der zu jedem in Ihrer Gruppe gleichzeitig passt. Wir holen Sie von Ihrem Hotel in Hurghada ab und bringen Sie zur Marina, wo Sie das Tauchteam kennenlernen, Ihre Sicherheitseinweisung erhalten und an Bord eines geräumigen, voll ausgestatteten Tauchboots gehen.\n\nDas Boot steuert zwei sorgfältig ausgewählte Plätze im Roten Meer an, die am jeweiligen Tag je nach Wetter und Erfahrungsstand der Gäste gewählt werden. Zwischen den Stopps gehört das Deck Ihnen: Sonnenschein, ein frisches Mittagsbuffet mit Obst und unbegrenzte Softdrinks.\n\nDann entscheiden Sie, wie Ihr Tag verläuft. Schnorchler schwimmen an beiden Riffen, während um sie herum getaucht wird. Anfänger machen zwei Schnuppertauchgänge unter direkter Aufsicht eines Tauchlehrers, ganz ohne Tauchschein und Vorkenntnisse. Zertifizierte Taucher unternehmen zwei vollständige geführte Tauchgänge mit einem professionellen Guide, der diese Riffe in- und auswendig kennt.\n\nDie komplette Tauchausrüstung sowie die Nationalparkgebühren sind in jeder Option inbegriffen. An Bord erwarten Sie keine versteckten Leihgebühren.',
    },
    highlights: [
      {
        en: 'Hotel pickup in Hurghada and transfer to the marina',
        ar: 'الاستلام من الفندق في الغردقة والتوصيل إلى المارينا',
        de: 'Hotelabholung in Hurghada und Transfer zur Marina',
      },
      {
        en: 'A spacious, fully equipped dive boat with a professional dive team',
        ar: 'مركب غوص واسع ومجهز بالكامل مع فريق غوص محترف',
        de: 'Geräumiges, voll ausgestattetes Tauchboot mit professionellem Tauchteam',
      },
      {
        en: 'Two Red Sea sites chosen daily for weather and experience level',
        ar: 'موقعان في البحر الأحمر يُختاران يوميًا حسب الطقس ومستوى الخبرة',
        de: 'Zwei Plätze im Roten Meer, täglich nach Wetter und Erfahrungsstand gewählt',
      },
      {
        en: 'Your choice on one boat: snorkelling, intro diving or certified diving',
        ar: 'خيارك على مركب واحد: سنوركلينج أو غوص تعريفي أو غوص للمعتمدين',
        de: 'Ihre Wahl auf einem Boot: Schnorcheln, Schnuppertauchen oder Tauchen für Zertifizierte',
      },
      {
        en: 'Fresh buffet lunch with fruit and unlimited soft drinks on board',
        ar: 'غداء بوفيه طازج مع فواكه ومشروبات غازية مفتوحة على المركب',
        de: 'Frisches Mittagsbuffet mit Obst und unbegrenzten Softdrinks an Bord',
      },
      {
        en: 'All equipment and national park fees included, no rental costs on board',
        ar: 'جميع المعدات ورسوم المحمية مشمولة بدون أي تكاليف إيجار على المركب',
        de: 'Komplette Ausrüstung und Nationalparkgebühren inklusive, keine Leihgebühren an Bord',
      },
      {
        en: 'Led by professional local diving instructors',
        ar: 'بقيادة مدربي غوص محليين محترفين',
        de: 'Geleitet von professionellen lokalen Tauchlehrern',
      },
    ],
    included: [
      {
        en: 'Hotel pickup and drop-off in Hurghada, air-conditioned transfers',
        ar: 'الاستلام والتوصيل من فنادق الغردقة بسيارات مكيفة',
        de: 'Hotelabholung und Rücktransfer in Hurghada im klimatisierten Fahrzeug',
      },
      {
        en: 'Full-day boat trip in the Red Sea',
        ar: 'رحلة مركب ليوم كامل في البحر الأحمر',
        de: 'Ganztägiger Bootsausflug im Roten Meer',
      },
      {
        en: 'Professional dive instructor and guide',
        ar: 'مدرب غوص ومرشد محترف',
        de: 'Professioneller Tauchlehrer und Guide',
      },
      {
        en: 'Two snorkelling stops (snorkelling option)',
        ar: 'وقفتا سنوركلينج (اختيار السنوركلينج)',
        de: 'Zwei Schnorchelstopps (Schnorchel-Option)',
      },
      {
        en: 'Two intro dives for beginners (intro dive option)',
        ar: 'غطستان تعريفيتان للمبتدئين (اختيار الغوص التعريفي)',
        de: 'Zwei Schnuppertauchgänge für Anfänger (Anfänger-Option)',
      },
      {
        en: 'Two guided dives for certified divers (certified option)',
        ar: 'غطستان بإرشاد للغواصين المعتمدين (اختيار الغواصين المعتمدين)',
        de: 'Zwei geführte Tauchgänge für zertifizierte Taucher (Option für Zertifizierte)',
      },
      {
        en: 'Full scuba diving equipment',
        ar: 'معدات غوص كاملة',
        de: 'Komplette Tauchausrüstung',
      },
      {
        en: 'Lunch served on board, with fruit',
        ar: 'غداء يُقدم على المركب مع فواكه',
        de: 'Mittagessen an Bord inklusive Obst',
      },
      {
        en: 'Soft drinks and water, unlimited',
        ar: 'مشروبات غازية ومياه مفتوحة',
        de: 'Softdrinks und Wasser unbegrenzt',
      },
      {
        en: 'National park fees',
        ar: 'رسوم المحمية الطبيعية',
        de: 'Nationalparkgebühren',
      },
      {
        en: 'Safety briefing and basic diving instructions',
        ar: 'شرح السلامة وتعليمات الغوص الأساسية',
        de: 'Sicherheitseinweisung und grundlegende Tauchinstruktionen',
      },
    ],
    tips: [
      {
        en: 'Underwater photos and videos (available to purchase)',
        ar: 'الصور والفيديوهات تحت الماء (متاحة للشراء)',
        de: 'Unterwasserfotos und -videos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Pickup and drop-off outside Hurghada: Makadi, Sahl Hasheesh, El Gouna, Soma Bay, Safaga (extra charge)',
        ar: 'الاستلام والتوصيل خارج الغردقة: مكادي، سهل حشيش، الجونة، سوما باي، سفاجا (رسوم إضافية)',
        de: 'Abholung und Rücktransfer außerhalb von Hurghada: Makadi, Sahl Hasheesh, El Gouna, Soma Bay, Safaga (gegen Aufpreis)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [
      {
        en: 'People with heart problems',
        ar: 'الأشخاص الذين يعانون من مشاكل في القلب',
        de: 'Personen mit Herzproblemen',
      },
      {
        en: 'People with respiratory issues',
        ar: 'الأشخاص الذين يعانون من مشاكل في الجهاز التنفسي',
        de: 'Personen mit Atemwegsproblemen',
      },
      {
        en: 'People with epilepsy',
        ar: 'الأشخاص الذين يعانون من الصرع',
        de: 'Personen mit Epilepsie',
      },
      {
        en: 'People with recent surgeries',
        ar: 'الأشخاص الذين أجروا عمليات جراحية مؤخرًا',
        de: 'Personen mit kürzlichen Operationen',
      },
      {
        en: 'Children under 10 years for diving (children under 10 can snorkel with an adult)',
        ar: 'الأطفال تحت 10 سنوات للغوص (يمكن للأطفال تحت 10 سنوات ممارسة السنوركلينج برفقة بالغ)',
        de: 'Kinder unter 10 Jahren beim Tauchen (Kinder unter 10 Jahren können in Begleitung eines Erwachsenen schnorcheln)',
      },
    ],
    whatToBring: [
      {
        en: 'Swimwear and a towel',
        ar: 'ملابس سباحة وفوطة',
        de: 'Badekleidung und ein Handtuch',
      },
      {
        en: 'Sunscreen and a sun hat',
        ar: 'واقي شمس وقبعة شمس',
        de: 'Sonnencreme und Sonnenhut',
      },
      {
        en: 'Sunglasses',
        ar: 'نظارة شمس',
        de: 'Sonnenbrille',
      },
      {
        en: 'Your diving certification (certified divers)',
        ar: 'شهادة الغوص الخاصة بك (للغواصين المعتمدين)',
        de: 'Ihren Tauchschein (für zertifizierte Taucher)',
      },
    ],
    notAllowed: [
      {
        en: 'Unaccompanied minors',
        ar: 'القُصّر بدون مرافق بالغ',
        de: 'Unbegleitete Minderjährige',
      },
      {
        en: 'Touching marine life',
        ar: 'لمس الكائنات البحرية',
        de: 'Berühren von Meereslebewesen',
      },
      {
        en: 'Alcohol and drugs',
        ar: 'الكحول والمخدرات',
        de: 'Alkohol und Drogen',
      },
    ],
    knowBeforeYouGo: [
      {
        en: 'Diving and flying on the same day is not permitted. At least 18 hours must pass between your last dive and your flight.',
        ar: 'لا يُسمح بالغوص والسفر بالطائرة في نفس اليوم؛ يجب مرور 18 ساعة على الأقل بين آخر غطسة وموعد رحلتك الجوية.',
        de: 'Tauchen und Fliegen am selben Tag ist nicht erlaubt. Zwischen dem letzten Tauchgang und dem Flug müssen mindestens 18 Stunden liegen.',
      },
      {
        en: 'Participants under 18 must be accompanied by a parent or legal guardian.',
        ar: 'يجب أن يكون المشاركون دون 18 عامًا برفقة أحد الوالدين أو ولي أمر قانوني.',
        de: 'Teilnehmer unter 18 Jahren müssen von einem Elternteil oder Erziehungsberechtigten begleitet werden.',
      },
      {
        en: 'Weather conditions may affect the choice of dive sites on the day.',
        ar: 'قد تؤثر الأحوال الجوية على اختيار مواقع الغوص في يوم الرحلة.',
        de: 'Die Wetterbedingungen können am Tag des Ausflugs die Wahl der Tauchplätze beeinflussen.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Hurghada Marina / Hotel Lobby Pickup',
      ar: 'مارينا الغردقة أو الاستلام من بهو الفندق',
      de: 'Hurghada Marina / Hotelabholung',
    },
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · Extra charge for Makadi, Sahl Hasheesh, El Gouna, Soma Bay and Safaga',
      ar: 'الغردقة مشمولة · رسوم إضافية لمكادي وسهل حشيش والجونة وسوما باي وسفاجا',
      de: 'Hurghada inklusive · Aufpreis für Makadi, Sahl Hasheesh, El Gouna, Soma Bay und Safaga',
    },
    supplierName: 'Red Sea Diving Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German', 'French', 'Italian'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'luxor-valley-small-van',
    name: {
      en: "Ancient Thebes in a Day: Karnak, the Valley of the Kings and Hatshepsut's Temple, from Hurghada",
      ar: 'طيبة القديمة في يوم واحد: الكرنك ووادي الملوك ومعبد حتشبسوت من الغردقة',
      de: 'Das antike Theben an einem Tag: Karnak, Tal der Könige und Hatschepsut-Tempel ab Hurghada',
    },
    displayName: { en: 'Luxor Day Trip from Hurghada', ar: 'رحلة الأقصر اليومية من الغردقة', de: 'Luxor Tagesausflug ab Hurghada' },
    seoTitle: { en: 'Luxor Day Trip from Hurghada: Karnak & Valley of the Kings', de: 'Luxor Tagesausflug ab Hurghada: Karnak & Tal der Könige' },
    slug: '/trips/luxor-day-trip-from-hurghada/',
    category: 'historical',
    destination: 'Luxor',
    images: [
      luxorThebesCoverImg,
      luxorHatshepsutGoldenRealImg,
      luxorKarnakCourtyardRealImg,
      luxorKarnakObeliskRealImg,
      luxorColossiMemnonRealImg,
      luxorValleyKingsKv9RealImg,
      luxorValleyKingsCorridorRealImg,
      luxorValleyKingsSarcophagusRealImg,
      luxorHatshepsutCliffsRealImg,
      luxorHatshepsutSphinxRealImg,
      luxorWestbankColumnsRealImg,
    ],
    galleryCaptions: [
      {
        en: 'Golden morning light through the Great Hypostyle Hall columns and Hatshepsut obelisk at Karnak Temple',
        ar: 'ضوء الصباح الذهبي بين أعمدة بهو الأعمدة العظيم ومسلة حتشبسوت في معبد الكرنك',
        de: 'Goldenes Morgenlicht zwischen den Säulen der Großen Säulenhalle und dem Obelisken der Hatschepsut in Karnak',
      },
      {
        en: "Three-tiered Temple of Queen Hatshepsut carved into the cliffs of Deir el-Bahari",
        ar: 'معبد الملكة حتشبسوت بمدرجاته الثلاثة المنحوتة في جبال الدير البحري بالأقصر',
        de: 'Dreistufiger Tempel der Königin Hatschepsut vor den Steilwänden von Deir el-Bahari',
      },
      {
        en: 'Sunlit temple courtyard, colonnades and ancient obelisk at Karnak Temple (East Bank)',
        ar: 'الساحة المشمسة والأعمدة والمسلة الأثرية داخل مجمع معابد الكرنك بالبر الشرقي',
        de: 'Sonnendurchfluteter Hof, Säulenhallen und antiker Obelisk im Karnak-Tempel (Ostufer)',
      },
      {
        en: 'Carved granite obelisk of Queen Hatshepsut rising above Karnak Temple',
        ar: 'مسلة الجرانيت المنقوشة للملكة حتشبسوت شامخة فوق معبد الكرنك',
        de: 'Granitobelisk der Königin Hatschepsut über den Mauern des Karnak-Tempels',
      },
      {
        en: 'Twin Colossi of Memnon standing on the sunlit Theban plain (West Bank)',
        ar: 'تمثالا ممنون العملاقان في سهل طيبة بالبر الغربي بالأقصر',
        de: 'Die beiden Memnonkolosse in der sonnigen Ebene von Theben (Westufer)',
      },
      {
        en: 'Royal burial chamber with astronomical ceiling and sarcophagus in the Valley of the Kings',
        ar: 'حجرة الدفن الملكية بالسقف الفلكي والتابوت الأثري في وادي الملوك',
        de: 'Königliche Grabkammer mit astronomischer Decke und Sarkophag im Tal der Könige',
      },
      {
        en: 'Painted descending corridor and winged ceiling inside a royal tomb in the Valley of the Kings',
        ar: 'الممر الهابط المزيّن بالنقوش الملونة والسقف المجنّح داخل إحدى مقابر وادي الملوك',
        de: 'Bemalter Abstiegskorridor mit geflügelter Decke in einem Königsgrab im Tal der Könige',
      },
      {
        en: 'Carved red granite sarcophagus and vivid hieroglyphic walls inside a royal burial chamber',
        ar: 'تابوت الجرانيت الوردي المنقوش والجدران الهيروغليفية الملونة داخل حجرة دفن ملكية',
        de: 'Roter Granitsarkophag und farbenprächtige Hieroglyphenwände in einer königlichen Grabkammer',
      },
      {
        en: "Panoramic view of Queen Hatshepsut's terraced temple beneath the towering limestone cliffs",
        ar: 'إطلالة بانورامية لمعبد الملكة حتشبسوت أسفل جروف الدير البحري الشاهقة',
        de: 'Panoramablick auf den Terrassentempel der Königin Hatschepsut unter den Kalksteinfelsen',
      },
      {
        en: 'Preserved painted sphinx statue of Queen Hatshepsut at Deir el-Bahari',
        ar: 'تمثال أبو الهول الملوّن للملكة حتشبسوت في الدير البحري',
        de: 'Bemalte Sphinx-Statue der Königin Hatschepsut in Deir el-Bahari',
      },
      {
        en: 'Carved sandstone temple columns and hieroglyphic reliefs beneath the Theban mountains',
        ar: 'أعمدة الحجر الرملي المنقوشة والرسوم الهيروغليفية أسفل جبال طيبة بالبر الغربي',
        de: 'Sandsteinsäulen mit feinen Hieroglyphenreliefs vor den Thebanischen Bergen',
      },
    ],
    rating: 0,
    reviewCount: 0,
    duration: { en: 'Full day', ar: 'يوم كامل', de: 'Ganztags' },
    departureTimes: ['04:00 AM'],
    timingNote: {
      en: 'Hotel pickup between 03:00 and 04:00, exact time confirmed after booking',
      ar: 'الاستلام من الفندق بين 03:00 و04:00 صباحاً، ويتم تأكيد الموعد الدقيق بعد الحجز',
      de: 'Hotelabholung zwischen 03:00 und 04:00 Uhr, genaue Zeit wird nach Buchung bestätigt',
    },
    price: 78,
    options: [
      {
        id: 'opt-luxor-van',
        title: {
          en: 'Luxor Full-Day Trip (Standard)',
          ar: 'رحلة الأقصر اليوم الكامل (البرنامج الأساسي)',
          de: 'Luxor Tagestour (Standard)',
        },
        detail: {
          en: "Karnak Temple, Colossi of Memnon, Valley of the Kings (3 included tombs), Hatshepsut's Temple, lunch with drinks & licensed Egyptologist",
          ar: 'معبد الكرنك، تمثالا ممنون، وادي الملوك (3 مقابر مشمولة)، معبد حتشبسوت، غداء مع المشروبات، ومرشد أثري مرخّص',
          de: 'Karnak-Tempel, Memnonkolosse, Tal der Könige (3 Gräber inklusive), Hatschepsut-Tempel, Mittagessen mit Getränken & lizenzierter Ägyptologe',
        },
        price: 78,
      },
      {
        id: 'opt-luxor-felucca',
        title: {
          en: 'Luxor Full-Day Trip + Nile Boat Crossing',
          ar: 'رحلة الأقصر اليوم الكامل + عبور النيل بالمركب',
          de: 'Luxor Tagestour + Nil-Bootsüberfahrt',
        },
        detail: {
          en: 'Includes the full standard program plus the boat crossing on the Nile to the West Bank',
          ar: 'يشمل البرنامج الأساسي بالكامل بالإضافة إلى عبور نهر النيل بالمركب نحو البر الغربي',
          de: 'Inklusive komplettem Standardprogramm plus Bootsüberfahrt über den Nil zum Westufer',
        },
        price: 88,
      },
      {
        id: 'opt-luxor-tutankhamun',
        title: {
          en: 'Luxor Full-Day Trip + Tomb of Tutankhamun',
          ar: 'رحلة الأقصر اليوم الكامل + مقبرة توت عنخ آمون',
          de: 'Luxor Tagestour + Grab des Tutanchamun',
        },
        detail: {
          en: 'Includes the full standard program plus separate entry ticket to the Tomb of Tutankhamun',
          ar: 'يشمل البرنامج الأساسي بالكامل بالإضافة إلى تذكرة الدخول المنفصلة لمقبرة توت عنخ آمون',
          de: 'Inklusive komplettem Standardprogramm plus separater Eintrittskarte für das Grab des Tutanchamun',
        },
        price: 103,
      },
      {
        id: 'opt-luxor-complete',
        title: {
          en: 'Luxor Full-Day Trip + Nile Boat Crossing & Tomb of Tutankhamun',
          ar: 'رحلة الأقصر اليوم الكامل + عبور النيل بالمركب ومقبرة توت عنخ آمون',
          de: 'Luxor Tagestour + Nil-Bootsüberfahrt & Grab des Tutanchamun',
        },
        detail: {
          en: 'Includes the full standard program, the Nile boat crossing to the West Bank, and entry to the Tomb of Tutankhamun',
          ar: 'يشمل البرنامج الأساسي بالكامل وعبور النيل بالمركب إلى البر الغربي وتذكرة دخول مقبرة توت عنخ آمون',
          de: 'Inklusive komplettem Standardprogramm, Nil-Bootsüberfahrt zum Westufer und Eintritt zum Grab des Tutanchamun',
        },
        price: 113,
      },
    ],
    shortDescription: {
      en: "Stand in Karnak's great hall at opening quiet, then descend into three royal tombs in the Valley of the Kings.",
      ar: 'من الغردقة عبر الطريق الصحراوي إلى طيبة القديمة: معبد الكرنك، عبور النيل اختيارياً بالمركب، تمثالا ممنون، ثلاث مقابر ملكية في وادي الملوك، ومعبد الملكة حتشبسوت بصحبة مرشد أثري مرخّص.',
      de: 'Von Hurghada durch die Wüste ins antike Theben: Karnak-Tempel, optionale Nil-Bootsüberfahrt, Memnonkolosse, drei Königsgräber im Tal der Könige und der Hatschepsut-Tempel mit lizenziertem Ägyptologen.',
    },
    highlights: [
      {
        en: "Walk Karnak's processional avenues through one of the largest temple complexes ever built",
        ar: 'السير في ممرات معبد الكرنك المهيبة داخل أحد أكبر مجمعات المعابد التي بُنيت في التاريخ',
        de: 'Spazieren Sie über die Prozessionsalleen von Karnak durch eine der größten Tempelanlagen der Geschichte',
      },
      {
        en: 'Take to the water: cross the Nile by boat to the West Bank, or stay on the coach over the bridge',
        ar: 'اعبر نهر النيل بالمركب إلى البر الغربي، أو استكمل الطريق بالباص عبر الكوبري',
        de: 'Überqueren Sie den Nil optional per Boot zum Westufer oder fahren Sie bequem im Bus über die Brücke',
      },
      {
        en: 'Go underground in the Valley of the Kings, inside three royal tombs, entry included',
        ar: 'ادخل إلى أعماق وادي الملوك واستكشف ثلاث مقابر ملكية بتذاكر دخول مشمولة',
        de: 'Steigen Sie im Tal der Könige in drei königliche Gräber hinab, Eintritt inklusive',
      },
      {
        en: 'Add the tomb of Tutankhamun, or the tomb of Ramses V and VI, as an optional extra',
        ar: 'أضف زيارة مقبرة توت عنخ آمون أو مقبرة رمسيس الخامس والسادس كخيار إضافي',
        de: 'Ergänzen Sie das Grab des Tutanchamun oder das Grab von Ramses V. und VI. als optionale Leistung',
      },
      {
        en: "Face the Colossi of Memnon, then walk the terraced ramps of Queen Hatshepsut's temple",
        ar: 'قف أمام تمثالي ممنون العملاقين ثم اصعد مدرجات معبد الملكة حتشبسوت المنحوت في الجبل',
        de: 'Bestaunen Sie die Memnonkolosse und begehen Sie anschließend die Terrassen des Hatschepsut-Tempels',
      },
      {
        en: 'A licensed local Egyptologist leads the day, with deep knowledge of every site you enter',
        ar: 'يرافقك طوال اليوم مرشد أثري مصري مرخّص بمعرفة عميقة بكل موقع تدخله',
        de: 'Ein lizenzierter lokaler Ägyptologe begleitet den Tag mit fundiertem Wissen zu jeder Stätte',
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
      en: `The alarm goes off in the dark, and it is worth it. We collect you from your hotel in Hurghada and settle you into an air-conditioned coach or minivan for the desert road south, a bottle of water in hand for the journey. The road unrolls through empty country as the sky lightens, with a pause along the way to stretch your legs, use the facilities and grab a drink.

In Luxor, your guide is waiting, in the language you chose when you booked, and the day begins where it should: at Karnak. This is not one temple but a city of them, courts, halls and towering columns added to over more than a thousand years. Walk it with an Egyptologist and the carvings stop being decoration. They become records: names, dates, boasts and prayers cut into stone, and the whole place starts to make sense.

Then the river. The coach crosses to the West Bank by bridge, or you can take the older way over: an optional boat crossing, out on the Nile with Luxor behind you and the necropolis ahead.

Lunch is at a local restaurant in Luxor. After it, the giants. The two Colossi of Memnon have sat on the Theban plain for over 3,000 years, and there is time here for photographs and for the story of who they were and why they are still sitting there.

Then down into the valley. Your ticket takes you inside three of the royal tombs open on the day, and no two visits are ever quite the same, because the tombs rotate as restoration work moves from one to the next. If you want to push further, two great names sit on separate tickets: Tutankhamun, and Ramses V and VI. Add either when you book, or decide with your guide on the day.

Before the final visit, a pause. You are welcomed with a cold local drink at a rest stop where you can watch the craftsmen at work, rest, or use the facilities, and gather yourself for the finale.

The day saves a strong sight for last: the Temple of Queen Hatshepsut, its terraces climbing straight out of the desert floor against the cliffs of Deir el-Bahari, built for one of the most remarkable rulers of ancient Egypt.

Then the road home, air conditioning on and the whole of ancient Thebes behind you, back to your hotel in Hurghada.`,
      ar: `يرن المنبّه قبل الفجر، لكن التجربة تستحق كل لحظة. نصطحبك من فندقك في الغردقة إلى حافلة أو ميني فان مكيفة مريحة في اتجاه الطريق الصحراوي جنوباً، ومعك زجاجة مياه للطريق. يمتد الطريق عبر الصحراء الهادئة مع تباشير الصباح الأولى، مع استراحة في منتصف الطريق لمدّ الساقين واستخدام المرافق وتناول مشروب.

في الأقصر يكون مرشدك في انتظارك باللغة التي اخترتها عند الحجز، ويبدأ اليوم من حيث يجب أن يبدأ: معبد الكرنك. هذا ليس مجرد معبد واحد، بل مدينة كاملة من المعابد والساحات والصالات والأعمدة الشاهقة التي أُضيفت وتوسّعت على مدى أكثر من ألف عام. حين تسير بينها برفقة عالم مصريات، تتحول النقوش من مجرد زخارف إلى سجلات حية: أسماء وتواريخ وانتصارات وصلوات محفورة في الحجر تجعل المكان بأكمله ينبض بالمعنى.

ثم نصل إلى النهر. تعبر الحافلة إلى البر الغربي عبر الكوبري، أو يمكنك اختيار الطريقة الأقدم: عبور اختياري بالمركب على صفحة النيل، حيث تترك الأقصر خلفك وتتجه نحو مدينة الموتى الأثرية.

يُقدَّم الغداء في مطعم محلي في الأقصر. وبعده تقف أمام العملاقين: تمثالا ممنون اللذان يجلسان في سهل طيبة منذ أكثر من ثلاثة آلاف عام، مع وقت كافٍ للتصوير ومعرفة قصتهما ولماذا لا يزالان صامدين في مكانهما حتى اليوم.

بعد ذلك ننزل إلى الوادي. تذكرتك تتيح لك دخول ثلاث من المقابر الملكية المفتوحة في ذلك اليوم، ولا تتشابه زيارتان أبداً لأن المقابر المفتوحة تتبدل دورياً مع استمرار أعمال الترميم. وإذا أردت التعمق أكثر، هناك اسمان بارزان بتذاكر منفصلة: مقبرة توت عنخ آمون، ومقبرة رمسيس الخامس والسادس. يمكنك إضافة أي منهما عند الحجز أو حسم اختيارك مع المرشد في يوم الرحلة.

وقبل المحطة الأخيرة، تأتي استراحة لطيفة تُستقبل فيها بمشروب محلي بارد في استراحة يمكنك فيها مشاهدة الحرفيين أثناء عملهم، أو الاستراحة واستخدام المرافق وتجديد نشاطك قبل الختام.

ويحتفظ اليوم بأقوى مشاهده للنهاية: معبد الملكة حتشبسوت، بمدرجاته التي ترتفع مباشرة من أرض الصحراء في قلب جبال الدير البحري، والذي شُيّد لإحدى أبرز الشخصيات التي حكمت مصر القديمة.

ثم يبدأ طريق العودة في الحافلة المكيفة، وقد حملت معك ذكريات طيبة القديمة كلها، حتى الوصول مجدداً إلى فندقك في الغردقة.`,
      de: `Der Wecker klingelt noch im Dunkeln, und es lohnt sich. Wir holen Sie an Ihrem Hotel in Hurghada ab und bringen Sie in einem klimatisierten Reisebus oder Minivan auf die Wüstenstraße Richtung Süden, mit einer Flasche Wasser für die Fahrt. Während der Himmel langsam heller wird, führt die Straße durch weite Wüstenlandschaft, unterbrochen von einer Rast zum Beinevertreten, für die sanitären Anlagen und ein Getränk.

In Luxor erwartet Sie Ihr Guide in der bei der Buchung gewählten Sprache, und der Tag beginnt dort, wo er beginnen muss: in Karnak. Dies ist kein einzelner Tempel, sondern eine ganze Tempelstadt aus Höfen, Hallen und gewaltigen Säulen, die über mehr als tausend Jahre hinweg erweitert wurde. Mit einem Ägyptologen an Ihrer Seite werden die Reliefs lebendig: Namen, Daten, Taten und Gebete im Stein fügen sich zu einem verständlichen Bild zusammen.

Dann folgt der Fluss. Der Bus überquert den Nil über die Brücke zum Westufer, oder Sie wählen den historischen Weg: eine optionale Bootsüberfahrt über den Nil, mit Luxor hinter sich und der Nekropole vor Augen.

Das Mittagessen wird in einem lokalen Restaurant in Luxor serviert. Danach warten die Giganten. Die beiden Memnonkolosse wachen seit über 3.000 Jahren über die Ebene von Theben, mit genügend Zeit für Fotos und die Geschichte, wen sie darstellen und warum sie bis heute hier sitzen.

Anschließend geht es hinab ins Tal der Könige. Ihre Eintrittskarte öffnet drei der am jeweiligen Tag zugänglichen Königsgräber, und kaum ein Besuch gleicht dem anderen, da die Gräber im Zuge laufender Restaurierungsarbeiten wechseln. Wer noch tiefer eintauchen möchte, kann zwei berühmte Namen über separate Tickets ergänzen: Tutanchamun sowie Ramses V. und VI. Buchen Sie sie vorab hinzu oder entscheiden Sie am Ausflugstag mit Ihrem Guide.

Vor dem letzten Höhepunkt folgt eine Pause. Bei einem kühlen lokalen Getränk an einem Rastplatz können Sie Handwerkern bei der Arbeit zusehen, sich kurz ausruhen, die Einrichtungen nutzen und Kraft für das Finale sammeln.

Der Tag hebt sich einen starken Anblick bis zum Schluss auf: den Tempel der Königin Hatschepsut, dessen Terrassen vor den Steilwänden von Deir el-Bahari aus dem Wüstenboden aufragen, erbaut für eine der bemerkenswertesten Herrscherinnen des alten Ägypten.

Danach geht es klimatisiert zurück durch die Wüste, mit dem ganzen antiken Theben im Gepäck, bis vor Ihr Hotel in Hurghada.`,
    },
    itinerary: [
      {
        kind: 'pickup',
        title: {
          en: 'Hotel pickup in Hurghada',
          ar: 'الاستلام من الفندق في الغردقة',
          de: 'Hotelabholung in Hurghada',
        },
        subtitle: {
          en: 'Between 03:00 and 04:00, exact time confirmed after booking',
          ar: 'بين 03:00 و04:00 صباحاً، ويتم تأكيد الموعد الدقيق بعد الحجز',
          de: 'Zwischen 03:00 und 04:00 Uhr, genaue Zeit wird nach Buchung bestätigt',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'The desert road to Luxor',
          ar: 'الطريق الصحراوي إلى الأقصر',
          de: 'Fahrt über die Wüstenstraße nach Luxor',
        },
      },
      {
        kind: 'break',
        title: {
          en: 'Rest stop on the road',
          ar: 'استراحة على الطريق',
          de: 'Rastpause unterwegs',
        },
        subtitle: {
          en: 'Break, facilities, drinks',
          ar: 'استراحة، مرافق، مشروبات',
          de: 'Pause, sanitäre Anlagen, Getränke',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Karnak Temple',
          ar: 'معبد الكرنك',
          de: 'Karnak-Tempel',
        },
        subtitle: {
          en: 'Guided visit',
          ar: 'زيارة إرشادية',
          de: 'Geführte Besichtigung',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Crossing to the West Bank',
          ar: 'العبور إلى البر الغربي',
          de: 'Überfahrt zum Westufer',
        },
        subtitle: {
          en: 'Optional Nile boat, or by coach over the bridge',
          ar: 'مركب نيلي اختياري، أو بالحافلة عبر الكوبري',
          de: 'Optional per Nil-Boot oder mit dem Bus über die Brücke',
        },
      },
      {
        kind: 'break',
        title: {
          en: 'Lunch at a local restaurant',
          ar: 'غداء في مطعم محلي',
          de: 'Mittagessen in einem lokalen Restaurant',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'The Colossi of Memnon',
          ar: 'تمثالا ممنون',
          de: 'Die Memnonkolosse',
        },
        subtitle: {
          en: 'Photo stop and visit',
          ar: 'وقفة تصوير وزيارة',
          de: 'Fotostopp und Besichtigung',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Valley of the Kings',
          ar: 'وادي الملوك',
          de: 'Tal der Könige',
        },
        subtitle: {
          en: 'Three included tombs',
          ar: 'ثلاث مقابر مشمولة',
          de: 'Drei inbegriffene Gräber',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Optional extra: the tomb of Tutankhamun',
          ar: 'إضافة اختيارية: مقبرة توت عنخ آمون',
          de: 'Optionales Extra: das Grab des Tutanchamun',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Optional extra: the tomb of Ramses V and VI',
          ar: 'إضافة اختيارية: مقبرة رمسيس الخامس والسادس',
          de: 'Optionales Extra: das Grab von Ramses V. und VI.',
        },
      },
      {
        kind: 'break',
        title: {
          en: 'Rest stop',
          ar: 'استراحة',
          de: 'Rastpause',
        },
        subtitle: {
          en: 'Cold drink, craftsmen at work, facilities, free time',
          ar: 'مشروب بارد، مشاهدة الحرفيين أثناء العمل، مرافق، وقت حر',
          de: 'Kühles Getränk, Handwerker bei der Arbeit, Einrichtungen, freie Zeit',
        },
      },
      {
        kind: 'stop',
        title: {
          en: 'Temple of Queen Hatshepsut',
          ar: 'معبد الملكة حتشبسوت',
          de: 'Tempel der Königin Hatschepsut',
        },
        subtitle: {
          en: 'Guided visit',
          ar: 'زيارة إرشادية',
          de: 'Geführte Besichtigung',
        },
      },
      {
        kind: 'break',
        title: {
          en: 'Rest stop on the return road',
          ar: 'استراحة في طريق العودة',
          de: 'Rastpause auf dem Rückweg',
        },
      },
      {
        kind: 'end',
        title: {
          en: 'Return to Hurghada, drop-off at your hotel',
          ar: 'العودة إلى الغردقة والتوصيل إلى فندقك',
          de: 'Rückfahrt nach Hurghada, Rücktransfer zu Ihrem Hotel',
        },
      },
    ],
    included: [
      {
        en: 'Pickup from your Hurghada hotel, and drop-off at the end of the day',
        ar: 'الاستلام من فندقك في الغردقة والتوصيل إليه في نهاية اليوم',
        de: 'Abholung von Ihrem Hotel in Hurghada und Rücktransfer am Ende des Tages',
      },
      {
        en: 'Air-conditioned coach or minivan transport in a small group',
        ar: 'نقل بحافلة أو ميني فان مكيفة ضمن مجموعة صغيرة',
        de: 'Klimatisierter Transfer im Reisebus oder Minivan in einer kleinen Gruppe',
      },
      {
        en: 'Professional live guide in your selected language',
        ar: 'مرشد سياحي محترف باللغة التي تختارها',
        de: 'Professioneller Live-Guide in Ihrer gewählten Sprache',
      },
      {
        en: 'Entry ticket to Karnak Temple',
        ar: 'تذكرة دخول معبد الكرنك',
        de: 'Eintrittskarte für den Karnak-Tempel',
      },
      {
        en: 'Entry ticket to the Valley of the Kings, including three standard tombs',
        ar: 'تذكرة دخول وادي الملوك شاملة ثلاث مقابر قياسية',
        de: 'Eintrittskarte für das Tal der Könige inklusive drei Standardgräbern',
      },
      {
        en: 'Entry ticket to the Temple of Hatshepsut',
        ar: 'تذكرة دخول معبد حتشبسوت',
        de: 'Eintrittskarte für den Tempel der Hatschepsut',
      },
      {
        en: 'Visit to the Colossi of Memnon',
        ar: 'زيارة تمثالي ممنون',
        de: 'Besuch der Memnonkolosse',
      },
      {
        en: 'Photo stop at Luxor Temple, from the outside',
        ar: 'وقفة تصوير أمام معبد الأقصر من الخارج',
        de: 'Fotostopp am Luxor-Tempel von außen',
      },
      {
        en: 'Lunch at a local restaurant in Luxor, with drinks during lunch',
        ar: 'غداء في مطعم محلي في الأقصر مع المشروبات أثناء الغداء',
        de: 'Mittagessen in einem lokalen Restaurant in Luxor inklusive Getränken zum Essen',
      },
      {
        en: 'A bottle of water for the road to Luxor',
        ar: 'زجاجة مياه للطريق إلى الأقصر',
        de: 'Eine Flasche Wasser für die Fahrt nach Luxor',
      },
    ],
    tips: [
      {
        en: 'The optional Nile boat crossing',
        ar: 'عبور نهر النيل بالمركب (اختياري)',
        de: 'Die optionale Bootsüberfahrt über den Nil',
      },
      {
        en: 'Optional tomb entries (Tutankhamun; Ramses V and VI)',
        ar: 'تذاكر المقابر الاختيارية (توت عنخ آمون؛ رمسيس الخامس والسادس)',
        de: 'Optionale Grabeintritte (Tutanchamun; Ramses V. und VI.)',
      },
      {
        en: 'Personal expenses and tips',
        ar: 'المصاريف الشخصية والإكراميات',
        de: 'Persönliche Ausgaben und Trinkgelder',
      },
    ],
    notSuitableFor: [
      {
        en: 'Pregnant women',
        ar: 'النساء الحوامل',
        de: 'Schwangere Frauen',
      },
      {
        en: 'Wheelchair users',
        ar: 'مستخدمو الكراسي المتحركة',
        de: 'Rollstuhlfahrer',
      },
    ],
    meetingPoint: {
      en: 'Hotel pickup in Hurghada between 03:00 and 04:00, with the exact time confirmed after booking.',
      ar: 'الاستلام من فندقك في الغردقة بين 03:00 و04:00 صباحاً، ويتم تأكيد الموعد الدقيق بعد الحجز.',
      de: 'Hotelabholung in Hurghada zwischen 03:00 und 04:00 Uhr, die genaue Zeit wird nach der Buchung bestätigt.',
    },

    whatToBring: [
      {
        en: 'A pillow for the road',
        ar: 'وسادة سفر للطريق',
        de: 'Ein Reisekissen für die Fahrt',
      },
      {
        en: 'Cash',
        ar: 'مبلغ نقدي (كاش)',
        de: 'Bargeld',
      },
      {
        en: 'Sunglasses',
        ar: 'نظارة شمسية',
        de: 'Sonnenbrille',
      },
      {
        en: 'Camera',
        ar: 'كاميرا',
        de: 'Kamera',
      },
      {
        en: 'A charged smartphone',
        ar: 'هاتف ذكي مشحون بالكامل',
        de: 'Ein geladenes Smartphone',
      },
      {
        en: 'Sunscreen',
        ar: 'كريم واقٍ من الشمس',
        de: 'Sonnencreme',
      },
      {
        en: 'Comfortable shoes',
        ar: 'حذاء مريح للمشي',
        de: 'Bequeme Schuhe',
      },
    ],
    notAllowed: [
      {
        en: 'Luggage or large bags',
        ar: 'حقائب السفر أو الشنط الكبيرة',
        de: 'Gepäck oder große Taschen',
      },
      {
        en: 'Alcohol and drugs',
        ar: 'الكحول والمواد المخدرة',
        de: 'Alkohol und Drogen',
      },
      {
        en: 'Baby strollers',
        ar: 'عربات الأطفال',
        de: 'Kinderwagen',
      },
      {
        en: 'Smoking in the vehicle',
        ar: 'التدخين داخل المركبة',
        de: 'Rauchen im Fahrzeug',
      },
    ],
    knowBeforeYouGo: [
      {
        en: 'This is an early start. Pickup runs between 03:00 and 04:00, and your exact pickup time is confirmed after booking.',
        ar: 'تبدأ الرحلة في وقت مبكر، حيث يتراوح الاستلام بين 03:00 و04:00 صباحاً، ويتم تأكيد موعد الاستلام الدقيق بعد الحجز.',
        de: 'Der Ausflug beginnt früh. Die Abholung erfolgt zwischen 03:00 und 04:00 Uhr, Ihre genaue Abholzeit wird nach der Buchung bestätigt.',
      },
      {
        en: 'Staying in Makadi, Sahl Hasheesh, El Gouna, Soma Bay or Safaga? Pickup from your area is available as an add-on. TUI Magic Life Kalawy and Coral Sun sit outside the pickup zone, and pickup from either is available as an add-on.',
        ar: 'هل تقيم في مكادي أو سهل حشيش أو الجونة أو سوما باي أو سفاجا؟ التوصيل من منطقتك متاح كإضافة. كما يقع فندقا TUI Magic Life Kalawy وCoral Sun خارج نطاق الاستلام الأساسي، ويتوفر التوصيل منهما كإضافة.',
        de: 'Sie übernachten in Makadi, Sahl Hasheesh, El Gouna, Soma Bay oder Safaga? Die Abholung aus Ihrer Region ist als Zusatzleistung verfügbar. Auch TUI Magic Life Kalawy und Coral Sun liegen außerhalb der Standard-Abholzone und können als Zusatzleistung gebucht werden.',
      },
      {
        en: 'Ask your hotel reception for a breakfast box on the evening before the trip. You will be glad of it on the road.',
        ar: 'اطلب من استقبال الفندق تجهيز بوكس إفطار في المساء السابق للرحلة، وستسعد بوجوده معك على الطريق.',
        de: 'Bestellen Sie am Vorabend an Ihrer Hotelrezeption eine Frühstücksbox. Auf der Fahrt werden Sie froh darüber sein.',
      },
      {
        en: 'Your Valley of the Kings ticket opens any three of the tombs open on the day. The tombs rotate for restoration, so which three depends on the day, and Tutankhamun and Ramses V and VI are never part of the three: they sit on separate tickets.',
        ar: 'تتيح لك تذكرة وادي الملوك دخول أي ثلاث مقابر من المقابر المفتوحة في ذلك اليوم. تتبدل المقابر دورياً لأعمال الترميم، ولا تشمل هذه الثلاث أبداً مقبرة توت عنخ آمون أو رمسيس الخامس والسادس، فلكل منهما تذكرة منفصلة.',
        de: 'Ihre Eintrittskarte für das Tal der Könige gilt für drei der am jeweiligen Tag geöffneten Gräber. Die Gräber wechseln wegen Restaurierungsarbeiten; Tutanchamun sowie Ramses V. und VI. gehören nie zu diesen drei und erfordern separate Tickets.',
      },
      {
        en: 'Expect plenty of walking, some of it on uneven ground.',
        ar: 'توقّع الكثير من المشي خلال اليوم، وبعضه على أرضيات غير مستوية.',
        de: 'Rechnen Sie mit viel Fußweg, teilweise auf unebenem Untergrund.',
      },
      {
        en: "For everyone's safety, the whole group returns to Hurghada together at the end of the day. Staying behind in Luxor is not possible.",
        ar: 'حرصاً على سلامة الجميع، تعود المجموعة بالكامل معاً إلى الغردقة في نهاية اليوم، ولا يمكن البقاء في الأقصر بعد انتهاء الرحلة.',
        de: 'Zur Sicherheit aller kehrt die gesamte Gruppe am Ende des Tages gemeinsam nach Hurghada zurück. Ein Verbleib in Luxor ist nicht möglich.',
      },
    ],
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada City included · Outer zones available as add-on',
      ar: 'مدينة الغردقة مشمولة · المناطق الخارجية متاحة كإضافة',
      de: 'Hurghada-Stadt inklusive · Außenzonen als Zusatzleistung verfügbar',
    },
    languages: ['English', 'German', 'French', 'Spanish', 'Italian'],
    supplierName: 'Wasla Local Operations',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 5,
    kidsDiscount: { en: '35% off ages 5–11 · under 5 free', ar: 'خصم 35% للأطفال 5–11 سنة · مجاناً تحت 5 سنوات', de: '35% Rabatt für Kinder (5–11 J.) · unter 5 frei' },
    featured: true,
    operatingDays: [0, 2, 4],
  },
  {
    id: 'eastern-desert-sunset-safari',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Air-conditioned vehicle to the quad station', ar: 'عربية مكيفة إلى محطة الكواد', de: 'Klimatisiertes Fahrzeug zur Quad-Station' },
      },
      {
        kind: 'stop',
        title: { en: 'Quad station', ar: 'محطة الكواد', de: 'Quad-Station' },
        subtitle: { en: 'Helmet fitting, safety briefing and a practice ride', ar: 'تجهيز الخوذة وشرح السلامة وجولة تجريبية', de: 'Helmanpassung, Sicherheitsbriefing und Probefahrt' },
      },
      {
        kind: 'stop',
        title: { en: 'Quad ride to the Bedouin village', ar: 'ركوب الكواد إلى القرية البدوية', de: 'Quadfahrt zum Beduinendorf' },
        subtitle: { en: 'Across open desert', ar: 'عبر الصحراء المفتوحة', de: 'Durch die offene Wüste' },
      },
      {
        kind: 'break',
        title: { en: 'In the Bedouin village', ar: 'في القرية البدوية', de: 'Im Beduinendorf' },
        subtitle: { en: 'Bread baking and Bedouin tea', ar: 'خبز العيش وشاي بدوي', de: 'Brotbacken und Beduinentee' },
      },
      {
        kind: 'stop',
        title: { en: 'Camel ride', ar: 'ركوب الجمال', de: 'Kamelritt' },
        subtitle: { en: 'With the Red Sea mountains as your backdrop', ar: 'وجبال البحر الأحمر خلفك', de: 'Mit den Bergen des Roten Meeres als Kulisse' },
      },
      {
        kind: 'end',
        title: { en: 'Return quad ride and hotel drop-off', ar: 'ركوب الكواد عودة والتوصيل للفندق', de: 'Rückfahrt mit dem Quad und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Quad Safari from Hurghada: Desert Ride to a Bedouin Village, Camel Ride and Bedouin Tea',
      ar: 'سفاري كواد من الغردقة: جولة صحراوية إلى قرية بدوية وركوب جمل وشاي بدوي',
      de: 'Quad-Safari ab Hurghada: Wüstenfahrt zu einem Beduinendorf, Kamelritt und Beduinentee',
    },
    displayName: { en: 'Quad Safari: Bedouin Village & Camel Ride', ar: 'سفاري كواد: قرية بدوية وركوب جمل', de: 'Quad Safari: Beduinendorf & Kamelritt' },
    seoTitle: { en: 'Quad Safari from Hurghada: Bedouin Village & Camel Ride', de: 'Quad Safari ab Hurghada: Beduinendorf, Kamelritt & Beduinentee' },
    slug: '/trips/quad-safari-hurghada/',
    category: 'desert',
    destination: 'Hurghada',
    images: [desertSunsetImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '3 hours', ar: '3 ساعات', de: '3 Stunden' },
    departureTimes: ['09:00 AM (Morning)', '02:30 PM (Sunset)'],
    price: 32,
    options: [
      {
        id: 'opt-safari-quad',
        title: {
          en: 'Morning Departure, 09:00',
          ar: 'انطلاق الصباح، 09:00',
          de: 'Morgenabfahrt, 09:00 Uhr',
        },
        detail: {
          en: 'The full quad program in the cool of the morning: 40 km desert ride, Bedouin village, bread baking, tea and a camel ride. Back at your hotel around midday, with the rest of the day free.',
          ar: 'برنامج الكواد الكامل في هدوء الصباح: 40 كم قيادة في الصحراء وقرية بدوية وخبز بدوي وشاي وركوب جمل، والعودة للفندق قرب الظهر مع بقية اليوم حرة.',
          de: 'Das volle Quad-Programm am kühlen Morgen: 40 km Wüstenfahrt, Beduinendorf, Brotbacken, Tee und Kamelritt. Rückkehr am Hotel um die Mittagszeit.',
        },
        price: 32,
      },
      {
        id: 'opt-safari-quad-sunset',
        title: {
          en: 'Sunset Departure',
          ar: 'انطلاق الغروب',
          de: 'Sonnenuntergangs-Abfahrt',
        },
        detail: {
          en: 'The same full program timed for the golden hour: ride out in the afternoon light and make the return ride as the sun drops behind the mountains. No dinner is served on this departure either.',
          ar: 'نفس البرنامج الكامل في توقيت الساعة الذهبية: الانطلاق في ضوء العصر والعودة مع غروب الشمس خلف الجبال، ولا يوجد عشاء في هذا الانطلاق أيضًا.',
          de: 'Dasselbe volle Programm zur goldenen Stunde: Hinfahrt im Nachmittagslicht und Rückfahrt, wenn die Sonne hinter den Bergen untergeht. Auch hier wird kein Abendessen serviert.',
        },
        price: 32,
      },
    ],
    shortDescription: {
      en: 'Ride your own quad 40 km into the desert to a Bedouin village, for Bedouin tea and a camel ride.',
      ar: 'قد الكواد الخاص بك لمسافة 40 كم داخل الصحراء إلى قرية بدوية تقليدية، تذوق الخبز البدوي الطازج واشرب الشاي البدوي واركب الجمل ثم عد بالقيادة. بدون وجبات، الصحراء فقط.',
      de: 'Fahren Sie Ihr eigenes Quad 40 km durch die Wüste zu einem traditionellen Beduinendorf, probieren Sie Beduinenbrot, trinken Sie Beduinentee, reiten Sie ein Kamel und fahren Sie zurück. Keine Mahlzeiten, nur die Wüste.',
    },
    fullDescription: {
      en: 'The resorts end, the asphalt ends, and the desert takes over. We pick you up from your hotel in an air-conditioned vehicle and drive you to the quad station, where the team fits your helmet, walks you through the controls and gives you a short practice ride so that every rider, first timer or experienced, sets off steady and confident.\n\nThen the real ride begins: 40 km of quad biking across open desert, over packed tracks and soft sand, with the Red Sea mountains growing on the horizon. Your destination is a traditional Bedouin village, where life runs at a different speed. Watch bread being baked the Bedouin way, sit down in the shade for a glass of Bedouin tea, and take a camel ride with the mountains behind you.\n\nAfter the village, it is back on the quads for the return ride to the station and the transfer back to your hotel. Choose the morning departure for clear light and cooler air, or the sunset departure and ride the last stretch in the golden hour.\n\nThis trip serves no meals at all, and that is deliberate: it is a riding trip, not a dinner trip. Eat before you come, bring your appetite for the desert instead.',
      ar: 'تنتهي المنتجعات، وينتهي الأسفلت، وتبدأ الصحراء. نستلمك من فندقك في سيارة مكيفة ونوصلك إلى محطة الكواد، حيث يضبط الفريق خوذتك ويشرح لك التحكم ويمنحك تجربة قيادة قصيرة حتى ينطلق كل راكب، مبتدئًا كان أو متمرسًا، بثبات وثقة.\n\nثم تبدأ الجولة الحقيقية: 40 كم من قيادة الكواد عبر الصحراء المفتوحة، بين الدروب الممهدة والرمال الناعمة، بينما تكبر جبال البحر الأحمر في الأفق. وجهتك هي قرية بدوية تقليدية تسير فيها الحياة بإيقاع مختلف. شاهد خبز البدو يُخبز بالطريقة التقليدية، واجلس في الظل لكوب شاي بدوي، واستمتع بركوب الجمل والجبال خلفك.\n\nبعد القرية، تعود على الكواد في رحلة الرجوع إلى المحطة ثم التوصيل إلى فندقك. اختر الانطلاق الصباحي للإضاءة الصافية والهواء الألطف، أو انطلاق الغروب لتقود المرحلة الأخيرة في الساعة الذهبية.\n\nهذه الرحلة لا تقدم أي وجبات على الإطلاق، وذلك عن قصد: إنها رحلة قيادة، وليست رحلة عشاء. تناول طعامك قبل الحضور، وأحضر شغفك بالصحراء فقط.',
      de: 'Die Resorts enden, der Asphalt endet, und die Wüste übernimmt. Wir holen Sie in einem klimatisierten Fahrzeug vom Hotel ab und bringen Sie zur Quad-Station, wo das Team Ihren Helm anpasst, die Bedienung erklärt und eine kurze Übungsfahrt mit Ihnen macht, damit jeder Fahrer, ob Anfänger oder erfahren, sicher und gelassen startet.\n\nDann beginnt die eigentliche Fahrt: 40 km Quadfahren durch die offene Wüste, über feste Pisten und weichen Sand, während die Berge des Roten Meeres am Horizont wachsen. Ihr Ziel ist ein traditionelles Beduinendorf, in dem das Leben in einem anderen Tempo läuft. Schauen Sie beim traditionellen Brotbacken zu, genießen Sie im Schatten ein Glas Beduinentee und unternehmen Sie einen Kamelritt vor der Bergkulisse.\n\nNach dem Dorf geht es auf den Quads zurück zur Station und anschließend per Transfer zurück zu Ihrem Hotel. Wählen Sie die Morgenabfahrt für klares Licht und kühlere Luft oder die Sonnenuntergangs-Abfahrt für den letzten Abschnitt in der goldenen Stunde.\n\nAuf dieser Tour werden bewusst keinerlei Mahlzeiten serviert: Es ist eine Fahrttour, keine Dinner-Tour. Essen Sie vorab und bringen Sie Ihren Appetit auf die Wüste mit.',
    },
    highlights: [
      {
        en: 'Hotel pickup in an air-conditioned vehicle',
        ar: 'الاستلام من الفندق بسيارة مكيفة',
        de: 'Hotelabholung im klimatisierten Fahrzeug',
      },
      {
        en: 'Helmet fitting, safety briefing and a practice ride at the quad station',
        ar: 'ضبط الخوذة وشرح الأمان وتجربة قيادة قصيرة في محطة الكواد',
        de: 'Helmanpassung, Sicherheitseinweisung und Übungsfahrt an der Quad-Station',
      },
      {
        en: 'A 40 km quad ride across open desert to a traditional Bedouin village',
        ar: 'جولة كواد لمسافة 40 كم عبر الصحراء المفتوحة إلى قرية بدوية تقليدية',
        de: '40 km Quadfahrt durch die offene Wüste zu einem traditionellen Beduinendorf',
      },
      {
        en: 'Bread baking and Bedouin tea in the village',
        ar: 'خبز بدوي وشاي بدوي في القرية',
        de: 'Brotbacken und Beduinentee im Dorf',
      },
      {
        en: 'A camel ride with the Red Sea mountains as your backdrop',
        ar: 'ركوب الجمل مع جبال البحر الأحمر في الخلفية',
        de: 'Kamelritt mit den Bergen des Roten Meeres im Hintergrund',
      },
      {
        en: 'The return quad ride to the station, then transfer back to your hotel',
        ar: 'العودة بالكواد إلى المحطة ثم التوصيل إلى فندقك',
        de: 'Rückfahrt mit dem Quad zur Station und Transfer zurück zum Hotel',
      },
      {
        en: 'Led by an experienced local desert guide',
        ar: 'بقيادة مرشد صحراوي محلي خبير',
        de: 'Geführt von einem erfahrenen lokalen Wüstenguide',
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
      {
        en: 'Round-trip transfer from Hurghada city hotels (air-conditioned vehicle)',
        ar: 'توصيل ذهاب وعودة من فنادق مدينة الغردقة (سيارة مكيفة)',
        de: 'Hin- und Rücktransfer ab Hotels in Hurghada-Stadt (klimatisiertes Fahrzeug)',
      },
      {
        en: 'Quad, helmet, safety briefing & Bedouin tea',
        ar: 'الكواد والخوذة وشرح الأمان والشاي البدوي',
        de: 'Quad, Helm, Sicherheitseinweisung & Beduinentee',
      },
      {
        en: 'Practice ride at the quad station',
        ar: 'تجربة قيادة قصيرة في محطة الكواد',
        de: 'Übungsfahrt an der Quad-Station',
      },
      {
        en: 'Bedouin village visit with bread baking and Bedouin tea',
        ar: 'زيارة القرية البدوية مع الخبز البدوي والشاي البدوي',
        de: 'Besuch eines Beduinendorfs mit Brotbacken und Beduinentee',
      },
      {
        en: 'Camel ride',
        ar: 'ركوب الجمل',
        de: 'Kamelritt',
      },
      {
        en: 'Bottled water',
        ar: 'مياه معبأة',
        de: 'Wasser in Flaschen',
      },
    ],
    tips: [
      {
        en: 'Meals (no food is served on this trip)',
        ar: 'الوجبات (لا يُقدم أي طعام في هذه الرحلة)',
        de: 'Mahlzeiten (auf dieser Tour wird kein Essen serviert)',
      },
      {
        en: 'Transfer from Makadi Bay, Sahl Hasheesh, El Gouna, Safaga or Soma Bay (per-person extra fee)',
        ar: 'التوصيل من مكادي باي أو سهل حشيش أو الجونة أو سفاجا أو سوما باي (رسوم إضافية للفرد)',
        de: 'Transfer ab Makadi Bay, Sahl Hasheesh, El Gouna, Safaga oder Soma Bay (Aufpreis pro Person)',
      },
      {
        en: 'Goggles and scarf (available to buy at the station)',
        ar: 'النظارة والكوفية (متوفرة للشراء في المحطة)',
        de: 'Schutzbrille und Tuch (an der Station käuflich)',
      },
      {
        en: 'Photos (available to purchase)',
        ar: 'الصور (متاحة للشراء)',
        de: 'Fotos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    whatToBring: [
      {
        en: 'Comfortable clothes that can get dusty',
        ar: 'ملابس مريحة تتحمل الأتربة',
        de: 'Bequeme Kleidung, die staubig werden darf',
      },
      { en: 'Closed shoes', ar: 'حذاء مقفول', de: 'Geschlossene Schuhe' },
      { en: 'Sunglasses and sunscreen', ar: 'نظارة شمس وواقي شمس', de: 'Sonnenbrille und Sonnencreme' },
      {
        en: 'A scarf against the dust, if you have one',
        ar: 'كوفية أو وشاح ضد الأتربة إن وُجد',
        de: 'Ein Tuch gegen den Staub, falls vorhanden',
      },
    ],
    notSuitableFor: [
      { en: 'Children under 6 years', ar: 'الأطفال أقل من 6 سنوات', de: 'Kinder unter 6 Jahren' },
      { en: 'Pregnant women', ar: 'النساء الحوامل', de: 'Schwangere Frauen' },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
      { en: 'Baby strollers', ar: 'عربات الأطفال', de: 'Kinderwagen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'Guests aged 16 and above may drive their own quad. Children aged 6 to 15 ride as passengers with an adult and are not permitted to drive.',
        ar: 'يُسمح للضيوف من عمر 16 عامًا فأكثر بقيادة الكواد الخاص بهم. الأطفال من 6 إلى 15 عامًا يركبون كمرافقين مع بالغ ولا يُسمح لهم بالقيادة.',
        de: 'Gäste ab 16 Jahren dürfen ihr eigenes Quad fahren. Kinder von 6 bis 15 Jahren fahren als Beifahrer bei einem Erwachsenen mit und dürfen nicht selbst fahren.',
      },
      {
        en: 'Your exact pickup time is confirmed the day before your trip. Please be ready at your pickup point at least 10 minutes before it.',
        ar: 'يتأكد وقت الاستلام بالظبط قبل الرحلة بيوم. برجاء التواجد في نقطة الاستلام قبل الموعد بـ 10 دقائق على الأقل.',
        de: 'Ihre genaue Abholzeit wird einen Tag vor der Tour bestätigt. Bitte seien Sie mindestens 10 Minuten vorher am Abholpunkt.',
      },
      {
        en: 'No meals are served on this trip, on either departure. Have breakfast or an early meal before pickup.',
        ar: 'لا تُقدم أي وجبات في هذه الرحلة في أي من الانطلاقين. تناول الإفطار أو وجبة مبكرة قبل الاستلام.',
        de: 'Auf dieser Tour werden bei keiner der beiden Abfahrten Mahlzeiten serviert. Essen Sie vor der Abholung.',
      },
      {
        en: 'You will get dusty. That is part of the fun, but do not wear your best clothes.',
        ar: 'ستتعرّض للأتربة، وهذا جزء من المتعة، لذا لا ترتدِ أفضل ملابسك.',
        de: 'Sie werden staubig werden. Das gehört zum Spaß dazu, tragen Sie also nicht Ihre beste Kleidung.',
      },
    ],
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Wadi Trail Hurghada',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 6,
    featured: true,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-super-safari',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Air-conditioned vehicle to the desert station', ar: 'عربية مكيفة إلى محطة الصحراء', de: 'Klimatisiertes Fahrzeug zur Wüstenstation' },
      },
      {
        kind: 'stop',
        title: { en: 'Desert station', ar: 'محطة الصحراء', de: 'Wüstenstation' },
        subtitle: { en: 'Safety briefing, driving test and helmet fitting', ar: 'شرح السلامة واختبار قيادة وتجهيز الخوذة', de: 'Sicherheitsbriefing, Fahrtest und Helmanpassung' },
      },
      {
        kind: 'stop',
        title: { en: 'Quad bike ride', ar: 'ركوب الكواد', de: 'Quadfahrt' },
        subtitle: { en: 'Across open desert', ar: 'عبر الصحراء المفتوحة', de: 'Durch die offene Wüste' },
      },
      {
        kind: 'stop',
        title: { en: 'Spider car ride', ar: 'ركوب سيارة العنكبوت', de: 'Fahrt im Spider Car' },
        subtitle: { en: 'Two seats, built for the sand', ar: 'مقعدان، مصممة للرمال', de: 'Zwei Sitze, gebaut für den Sand' },
      },
      {
        kind: 'stop',
        title: { en: 'Jeep journey to the Bedouin village', ar: 'رحلة بالجيب إلى القرية البدوية', de: 'Jeepfahrt zum Beduinendorf' },
      },
      {
        kind: 'break',
        title: { en: 'In the Bedouin village', ar: 'في القرية البدوية', de: 'Im Beduinendorf' },
        subtitle: { en: 'Bedouin tea and a camel ride', ar: 'شاي بدوي وركوب جمال', de: 'Beduinentee und Kamelritt' },
      },
      {
        kind: 'break',
        title: { en: 'Open-buffet BBQ dinner', ar: 'عشاء مشويات بوفيه مفتوح', de: 'BBQ-Abendessen vom offenen Buffet' },
      },
      {
        kind: 'stop',
        title: { en: 'Oriental show', ar: 'العرض الشرقي', de: 'Orientalische Show' },
        subtitle: { en: 'Tanoura, belly dance and fire performance', ar: 'تنورة ورقص شرقي وعرض نار', de: 'Tanoura, Bauchtanz und Feuershow' },
      },
      {
        kind: 'end',
        title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
      },
    ],
    name: {
      en: 'Super Safari from Hurghada: Quad, Spider Car, Bedouin Village and BBQ Dinner Under the Stars',
      ar: 'سوبر سفاري من الغردقة: كواد وسبايدر كار وقرية بدوية وعشاء مشويات تحت النجوم',
      de: 'Super Safari ab Hurghada: Quad, Spider Car, Beduinendorf und BBQ-Abendessen unter den Sternen',
    },
    displayName: { en: 'Super Safari: Quad, Buggy & BBQ Dinner', ar: 'سوبر سفاري: كواد وباجي وعشاء مشويات', de: 'Super Safari: Quad, Buggy & BBQ-Abendessen' },
    seoTitle: { en: 'Super Safari from Hurghada: Quad, Spider Car, Dinner & Show', de: 'Super Safari ab Hurghada: Quad, Spider Car, Abendessen & Show' },
    slug: '/trips/super-safari-hurghada/',
    category: 'desert',
    destination: 'Hurghada',
    images: [desertSunsetImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '7 hours', ar: '7 ساعات', de: '7 Stunden' },
    departureTimes: ['01:00 PM'],
    price: 20,
    options: [
      {
        id: 'opt-super-safari-full',
        title: {
          en: 'Super Safari (Full Program · Dinner & Show Included)',
          ar: 'سوبر سفاري (البرنامج الكامل · شامل العشاء والعرض)',
          de: 'Super Safari (Komplettprogramm · inkl. Abendessen & Show)',
        },
        detail: {
          en: 'Quad & spider car · jeep to Bedouin village · BBQ buffet dinner & oriental show',
          ar: 'كواد وسبايدر كار · جيب إلى القرية البدوية · عشاء مشويات بوفيه مفتوح وعرض شرقي',
          de: 'Quad & Spider Car · Jeep zum Beduinendorf · BBQ-Buffet-Abendessen & orientalische Show',
        },
        price: 20,
      },
    ],
    shortDescription: {
      en: 'The full desert day: quad and spider car, a Bedouin village by jeep, then BBQ dinner and a live show under the stars.',
      ar: 'يوم الصحراء الكامل في رحلة واحدة: قيادة كواد وسبايدر كار، ورحلة جيب إلى قرية بدوية مع شاي وركوب جمل، ثم عشاء مشويات بوفيه مفتوح وعرض شرقي حي تحت النجوم.',
      de: 'Der komplette Wüstentag in einer Tour: Quadfahren und eine Fahrt im Spider Car, Jeepfahrt zu einem Beduinendorf mit Tee und Kamelritt, anschließend ein offenes BBQ-Buffet und eine orientalische Live-Show unter den Sternen.',
    },
    fullDescription: {
      en: 'This is the desert day with nothing left out. We pick you up from your hotel and take you to the desert station, where the team runs the safety briefing and a short driving test, fits your helmet, and gets everyone comfortable before the engines start.\n\nFirst the quad bike, across open desert with the mountains ahead of you. Then the spider car, a two-seat buggy built for the sand, fast and low and enormous fun. From the station a jeep takes you deeper, to a traditional Bedouin village, where you sit down for Bedouin tea and take a camel ride, the oldest way of crossing this landscape there is.\n\nAs the light fades the evening program begins: an open-buffet BBQ dinner with freshly grilled meats and local dishes, served in the desert. Then the show, Tanoura spinning, belly dance and a fire performance, under a sky full of stars. When it ends, the transfer takes you back to your hotel.',
      ar: 'هذا هو يوم الصحراء الكامل دون أن ينقصه شيء. نستلمك من فندقك ونوصلك إلى محطة الصحراء، حيث يقدم الفريق شرح الأمان واختبار قيادة قصيرًا ويضبط خوذتك حتى يطمئن الجميع قبل تشغيل المحركات.\n\nأولًا الكواد عبر الصحراء المفتوحة والجبال أمامك. ثم السبايدر كار، وهي باجي بمقعدين مصممة للرمال، سريعة ومنخفضة وممتعة للغاية. ومن المحطة يأخذك الجيب أعمق نحو قرية بدوية تقليدية، حيث تجلس لشرب الشاي البدوي وتركب الجمل، أقدم وسيلة لعبور هذه الصحراء.\n\nومع خفوت الضوء يبدأ البرنامج المسائي: عشاء مشويات بوفيه مفتوح بلحوم مشوية طازجة وأطباق محلية في قلب الصحراء. ثم العرض الشرقي الحي من التنورة والرقص الشرقي وعرض النار تحت سماء مرصعة بالنجوم، وبعدها يعيدك التوصيل إلى فندقك.',
      de: 'Dies ist der Wüstentag, bei dem nichts fehlt. Wir holen Sie vom Hotel ab und bringen Sie zur Wüstenstation, wo das Team die Sicherheitseinweisung und eine kurze Fahrprobe durchführt, Ihren Helm anpasst und sicherstellt, dass sich alle wohlfühlen, bevor die Motoren starten.\n\nZuerst das Quad durch die offene Wüste mit den Bergen vor Ihnen. Danach das Spider Car, ein zweisitziger Buggy für den Sand, schnell, flach und voller Fahrspaß. Von der Station bringt Sie ein Jeep tiefer hinein zu einem traditionellen Beduinendorf, wo Sie Beduinentee trinken und auf einem Kamel reiten, der ältesten Art, diese Landschaft zu durchqueren.\n\nWenn das Licht schwindet, beginnt das Abendprogramm: ein offenes BBQ-Buffet mit frisch gegrilltem Fleisch und lokalen Gerichten mitten in der Wüste. Danach folgt die Show mit Tanoura-Tanz, Bauchtanz und Feuershow unter einem Sternenhimmel. Am Ende bringt Sie der Transfer zurück zu Ihrem Hotel.',
    },
    highlights: [
      {
        en: 'Hotel pickup in an air-conditioned vehicle',
        ar: 'الاستلام من الفندق بسيارة مكيفة',
        de: 'Hotelabholung im klimatisierten Fahrzeug',
      },
      {
        en: 'Safety briefing, driving test and helmet fitting at the desert station',
        ar: 'شرح الأمان واختبار القيادة وضبط الخوذة في محطة الصحراء',
        de: 'Sicherheitseinweisung, Fahrprobe und Helmanpassung an der Wüstenstation',
      },
      {
        en: 'Quad bike ride across open desert',
        ar: 'قيادة الكواد عبر الصحراء المفتوحة',
        de: 'Quadfahrt durch die offene Wüste',
      },
      {
        en: 'Spider car ride, two seats, built for the sand',
        ar: 'قيادة السبايدر كار بمقعدين، مصممة للرمال',
        de: 'Fahrt im zweisitzigen Spider Car, gebaut für den Sand',
      },
      {
        en: 'Jeep journey to a traditional Bedouin village',
        ar: 'رحلة جيب إلى قرية بدوية تقليدية',
        de: 'Jeepfahrt zu einem traditionellen Beduinendorf',
      },
      {
        en: 'Bedouin tea and a camel ride in the village',
        ar: 'شاي بدوي وركوب جمل في القرية',
        de: 'Beduinentee und Kamelritt im Dorf',
      },
      {
        en: 'Open-buffet BBQ dinner in the desert',
        ar: 'عشاء مشويات بوفيه مفتوح في الصحراء',
        de: 'Offenes BBQ-Buffet-Abendessen in der Wüste',
      },
      {
        en: 'Live oriental show: Tanoura, belly dance and fire performance',
        ar: 'عرض شرقي حي: تنورة ورقص شرقي وعرض نار',
        de: 'Orientalische Live-Show: Tanoura, Bauchtanz und Feuershow',
      },
      {
        en: 'Transfer back to your hotel',
        ar: 'التوصيل عائدًا إلى فندقك',
        de: 'Rücktransfer zu Ihrem Hotel',
      },
      {
        en: 'Led by an experienced local desert guide',
        ar: 'بقيادة مرشد صحراوي محلي خبير',
        de: 'Geführt von einem erfahrenen lokalen Wüstenguide',
      },
    ],
    included: [
      {
        en: 'Round-trip transfer from Hurghada city hotels (air-conditioned vehicle)',
        ar: 'توصيل ذهاب وعودة من فنادق مدينة الغردقة (سيارة مكيفة)',
        de: 'Hin- und Rücktransfer ab Hotels in Hurghada-Stadt (klimatisiertes Fahrzeug)',
      },
      {
        en: 'Quad bike ride and spider car ride',
        ar: 'قيادة الكواد وقيادة السبايدر كار',
        de: 'Quadfahrt und Fahrt mit dem Spider Car',
      },
      {
        en: 'Jeep trip to the Bedouin village',
        ar: 'رحلة الجيب إلى القرية البدوية',
        de: 'Jeepfahrt zum Beduinendorf',
      },
      {
        en: 'Helmet, safety briefing and driving test',
        ar: 'خوذة وشرح أمان واختبار قيادة',
        de: 'Helm, Sicherheitseinweisung und Fahrprobe',
      },
      {
        en: 'Bedouin village visit with Bedouin tea',
        ar: 'زيارة القرية البدوية مع شاي بدوي',
        de: 'Besuch des Beduinendorfs mit Beduinentee',
      },
      {
        en: 'Camel ride',
        ar: 'ركوب الجمل',
        de: 'Kamelritt',
      },
      {
        en: 'Open-buffet BBQ dinner',
        ar: 'عشاء مشويات بوفيه مفتوح',
        de: 'Offenes BBQ-Buffet-Abendessen',
      },
      {
        en: 'Oriental show (Tanoura, belly dance, fire show)',
        ar: 'عرض شرقي (تنورة، رقص شرقي، عرض نار)',
        de: 'Orientalische Show (Tanoura, Bauchtanz, Feuershow)',
      },
      {
        en: 'Tour guide assistance',
        ar: 'مرافقة وإرشاد سياحي',
        de: 'Betreuung durch einen Tourguide',
      },
    ],
    tips: [
      {
        en: 'Transfer from El Gouna, Safaga, Sahl Hasheesh or Makadi (per-person extra fee)',
        ar: 'التوصيل من الجونة أو سفاجا أو سهل حشيش أو مكادي (رسوم إضافية للفرد)',
        de: 'Transfer ab El Gouna, Safaga, Sahl Hasheesh oder Makadi (Aufpreis pro Person)',
      },
      {
        en: 'Protective goggles and scarf (available at the station)',
        ar: 'النظارة الواقية والكوفية (متوفرة في المحطة)',
        de: 'Schutzbrille und Tuch (an der Station erhältlich)',
      },
      {
        en: 'Photo and video sessions (available to purchase)',
        ar: 'جلسات التصوير والفيديو (متاحة للشراء)',
        de: 'Foto- und Videoaufnahmen (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [
      { en: 'Pregnant women', ar: 'النساء الحوامل', de: 'Schwangere Frauen' },
      { en: 'People with back problems', ar: 'الأشخاص الذين يعانون من مشاكل في الظهر', de: 'Personen mit Rückenproblemen' },
      { en: 'People over 65 years', ar: 'الأشخاص فوق 65 عامًا', de: 'Personen über 65 Jahre' },
      { en: 'Wheelchair users', ar: 'مستخدمو الكراسي المتحركة', de: 'Rollstuhlfahrer' },
      { en: 'Babies under 1 year', ar: 'الرضّع أقل من سنة', de: 'Babys unter 1 Jahr' },
    ],
    whatToBring: [
      {
        en: 'Comfortable clothes that can get dusty',
        ar: 'ملابس مريحة تتحمل الأتربة',
        de: 'Bequeme Kleidung, die staubig werden darf',
      },
      { en: 'Comfortable closed shoes', ar: 'حذاء مريح مقفول', de: 'Bequeme geschlossene Schuhe' },
      { en: 'Sunglasses and sunscreen', ar: 'نظارة شمس وواقي شمس', de: 'Sonnenbrille und Sonnencreme' },
      {
        en: 'A light jacket for the desert evening',
        ar: 'جاكيت خفيف لمساء الصحراء',
        de: 'Eine leichte Jacke für den Wüstenabend',
      },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'Helmets are provided and must be worn during the quad and spider car rides.',
        ar: 'تُوفر الخوذات ويجب ارتداؤها أثناء قيادة الكواد والسبايدر كار.',
        de: 'Helme werden gestellt und müssen während der Quad- und Spider-Car-Fahrten getragen werden.',
      },
      {
        en: 'Every driver completes a short driving test at the station before setting off.',
        ar: 'يجري كل سائق اختبار قيادة قصيرًا في المحطة قبل الانطلاق.',
        de: 'Jeder Fahrer absolviert vor dem Start eine kurze Fahrprobe an der Station.',
      },
      {
        en: 'Your exact pickup time is confirmed the day before your trip, by WhatsApp or email.',
        ar: 'يتأكد وقت الاستلام بالظبط قبل الرحلة بيوم عبر واتساب أو البريد الإلكتروني.',
        de: 'Ihre genaue Abholzeit wird einen Tag vor der Tour per WhatsApp oder E-Mail bestätigt.',
      },
    ],
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Desert Safari Partner',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 1,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-star-gazing-jeep',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in the early evening', ar: 'الاستلام من الفندق أول الليل', de: 'Hotelabholung am frühen Abend' },
      },
      {
        kind: 'stop',
        title: { en: 'Jeep ride into the open desert', ar: 'رحلة بالجيب إلى الصحراء المفتوحة', de: 'Jeepfahrt in die offene Wüste' },
        subtitle: { en: 'Away from the city lights', ar: 'بعيدًا عن أضواء المدينة', de: 'Weit weg von den Lichtern der Stadt' },
      },
      {
        kind: 'break',
        title: { en: 'Dinner in the desert', ar: 'عشاء في الصحراء', de: 'Abendessen in der Wüste' },
      },
      {
        kind: 'stop',
        title: { en: 'Star watching', ar: 'مشاهدة النجوم', de: 'Sterne beobachten' },
        subtitle: { en: 'Under a dark desert sky, with the Milky Way overhead', ar: 'تحت سماء صحراوية مظلمة، ودرب التبانة فوقك', de: 'Unter dunklem Wüstenhimmel, mit der Milchstraße über Ihnen' },
      },
      {
        kind: 'end',
        title: { en: 'Jeep ride back to your hotel', ar: 'العودة بالجيب إلى فندقك', de: 'Rückfahrt mit dem Jeep zu Ihrem Hotel' },
      },
    ],
    name: {
      en: 'Star Gazing by Jeep from Hurghada: Desert Dinner and a Sky Full of Stars',
      ar: 'مشاهدة النجوم بالجيب من الغردقة: عشاء صحراوي وسماء مليئة بالنجوم',
      de: 'Sternenbeobachtung im Jeep ab Hurghada: Wüsten-Abendessen und ein Himmel voller Sterne',
    },
    displayName: { en: 'Star Gazing by Jeep', ar: 'مشاهدة النجوم بالجيب', de: 'Sternenbeobachtung per Jeep' },
    seoTitle: { en: 'Star Gazing by Jeep from Hurghada: Desert Dinner & Night Sky', de: 'Sternenbeobachtung per Jeep ab Hurghada: Abendessen in der Wüste' },
    slug: '/trips/star-gazing-jeep-hurghada/',
    category: 'desert',
    destination: 'Hurghada',
    images: [desertSunsetImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: 'Evening trip', ar: 'رحلة مسائية', de: 'Abendausflug' },
    departureTimes: ['05:00 PM'],
    price: 22,
    options: [
      {
        id: 'opt-stargazing-jeep',
        title: {
          en: 'Star Gazing by Jeep (Dinner Included)',
          ar: 'مشاهدة النجوم بالجيب (شامل العشاء)',
          de: 'Sternenbeobachtung im Jeep (inkl. Abendessen)',
        },
        detail: {
          en: 'Jeep into the desert · dinner included · star watching away from city lights',
          ar: 'جيب إلى الصحراء · العشاء مشمول · مشاهدة النجوم بعيدًا عن أضواء المدينة',
          de: 'Jeepfahrt in die Wüste · Abendessen inklusive · Sternenbeobachtung fernab der Stadtlichter',
        },
        price: 22,
      },
    ],
    shortDescription: {
      en: 'Leave the resort lights behind: dinner in the open desert, then a night sky the way it looked before cities existed.',
      ar: 'اترك أضواء المنتجعات خلفك. يأخذك الجيب إلى الصحراء لعشاء في الهواء الطلق، ثم الحدث الأهم: سماء ليلية كما كانت قبل وجود المدن.',
      de: 'Lassen Sie die Lichter der Resorts hinter sich. Ein Jeep bringt Sie zum Abendessen unter freiem Himmel in die Wüste, gefolgt vom Höhepunkt: einem Nachthimmel wie aus der Zeit vor den Städten.',
    },
    fullDescription: {
      en: 'Hurghada is bright, and bright is the enemy of stars. So in the early evening we put you in a jeep, collect you from your hotel, and drive the other way, out into the desert, where the lights end and the sky starts doing something most people have never actually seen.\n\nOut in the open desert, dinner is served and included in your price. Eat in the cool evening air, with sand under your feet instead of a restaurant floor.\n\nThen the lights go down and you look up. Away from the city, the Milky Way stops being a photograph you have seen online and becomes a river of light running across the whole sky, with more stars than your eyes know what to do with. Desert silence, cold clear air, and that sky. Some evenings of a holiday get forgotten by February. This is not one of them.\n\nAfter the star watching, the jeep takes you back to your hotel.',
      ar: 'الغردقة مضيئة، والضوء عدو النجوم. لذلك في بداية المساء نستلمك من فندقك في سيارة جيب ونتجه في الاتجاه المعاكس، إلى قلب الصحراء حيث تنتهي الأضواء وتبدأ السماء في عرض مشهد لم يره معظم الناس من قبل.\n\nفي الصحراء المفتوحة، يُقدم لك العشاء وهو مشمول في السعر. تتناول طعامك في هواء المساء اللطيف والرمل تحت قدميك بدلًا من أرضية مطعم.\n\nثم تنطفئ الأضواء وتنظر إلى الأعلى. بعيدًا عن المدينة، لا تعود مجرة درب التبانة مجرد صورة رأيتها على الإنترنت، بل تتحول إلى نهر من الضوء يمتد عبر السماء كلها مع نجوم أكثر مما تستوعبه عيناك. صمت الصحراء، هواء نقي بارد، وهذه السماء. بعض أمسيات الإجازة تُنسى سريعًا، أما هذه فلا.\n\nوبعد مشاهدة النجوم، يعيدك الجيب إلى فندقك.',
      de: 'Hurghada ist hell, und Helligkeit ist der Feind der Sterne. Deshalb holen wir Sie am frühen Abend im Jeep vom Hotel ab und fahren in die entgegengesetzte Richtung hinaus in die Wüste, dorthin, wo die Lichter enden und der Himmel etwas zeigt, das die meisten Menschen noch nie wirklich gesehen haben.\n\nDraußen in der offenen Wüste wird das im Preis inbegriffene Abendessen serviert. Sie essen in der kühlen Abendluft, mit Sand unter den Füßen statt eines Restaurantbodens.\n\nDann gehen die Lichter aus und Sie blicken hinauf. Fernab der Stadt ist die Milchstraße kein Foto mehr aus dem Internet, sondern ein Lichtfluss quer über den ganzen Himmel mit mehr Sternen, als das Auge fassen kann. Wüstenstille, klare Luft und dieser Himmel. Manche Urlaubsabende vergisst man bis Februar. Dieser gehört nicht dazu.\n\nNach der Sternenbeobachtung bringt Sie der Jeep zurück zu Ihrem Hotel.',
    },
    highlights: [
      {
        en: 'Hotel pickup in the early evening',
        ar: 'الاستلام من الفندق في بداية المساء',
        de: 'Hotelabholung am frühen Abend',
      },
      {
        en: 'A jeep ride out into the open desert, away from the city lights',
        ar: 'رحلة جيب إلى الصحراء المفتوحة بعيدًا عن أضواء المدينة',
        de: 'Jeepfahrt hinaus in die offene Wüste, fernab der Stadtlichter',
      },
      {
        en: 'Dinner served in the desert, included in the price',
        ar: 'عشاء يُقدم في الصحراء ومشمول في السعر',
        de: 'Abendessen in der Wüste, im Preis inbegriffen',
      },
      {
        en: 'Star watching under a dark desert sky, with the Milky Way overhead',
        ar: 'مشاهدة النجوم تحت سماء صحراوية مظلمة مع مجرة درب التبانة فوقك',
        de: 'Sternenbeobachtung unter dunklem Wüstenhimmel mit der Milchstraße über Ihnen',
      },
      {
        en: 'The jeep ride back to your hotel',
        ar: 'العودة بالجيب إلى فندقك',
        de: 'Rückfahrt im Jeep zu Ihrem Hotel',
      },
      {
        en: 'Led by an experienced local desert guide',
        ar: 'بقيادة مرشد صحراوي محلي خبير',
        de: 'Geführt von einem erfahrenen lokalen Wüstenguide',
      },
    ],
    included: [
      {
        en: 'Round-trip hotel transfer',
        ar: 'توصيل ذهاب وعودة من الفندق',
        de: 'Hin- und Rücktransfer vom Hotel',
      },
      {
        en: 'Jeep desert trip',
        ar: 'رحلة صحراوية بالجيب',
        de: 'Wüstentour im Jeep',
      },
      {
        en: 'Dinner',
        ar: 'العشاء',
        de: 'Abendessen',
      },
      {
        en: 'Star watching in the desert',
        ar: 'مشاهدة النجوم في الصحراء',
        de: 'Sternenbeobachtung in der Wüste',
      },
    ],
    tips: [
      {
        en: 'Transfer from Makadi Bay, Sahl Hasheesh, El Gouna, Safaga or Soma Bay (per-person extra fee)',
        ar: 'التوصيل من مكادي باي أو سهل حشيش أو الجونة أو سفاجا أو سوما باي (رسوم إضافية للفرد)',
        de: 'Transfer ab Makadi Bay, Sahl Hasheesh, El Gouna, Safaga oder Soma Bay (Aufpreis pro Person)',
      },
      {
        en: 'Photos (available to purchase)',
        ar: 'الصور (متاحة للشراء)',
        de: 'Fotos (gegen Aufpreis erhältlich)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [],
    whatToBring: [
      {
        en: 'A light jacket: the desert cools down fast after sunset, even after a hot day',
        ar: 'جاكيت خفيف: تبرد الصحراء سريعًا بعد الغروب حتى بعد يوم حار',
        de: 'Eine leichte Jacke: Die Wüste kühlt nach Sonnenuntergang schnell ab, selbst nach einem heißen Tag',
      },
      { en: 'Comfortable shoes for sand', ar: 'حذاء مريح للرمل', de: 'Bequeme Schuhe für Sand' },
      {
        en: 'Your phone or camera, if you want to try photographing the sky',
        ar: 'هاتفك أو كاميرتك إن أردت تجربة تصوير السماء',
        de: 'Ihr Handy oder Ihre Kamera, wenn Sie den Himmel fotografieren möchten',
      },
    ],
    notAllowed: [
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'Departure is at 17:00. Your exact pickup time is confirmed the day before your trip, so please be ready at your pickup point.',
        ar: 'الانطلاق الساعة 17:00. يتأكد وقت الاستلام بالظبط قبل الرحلة بيوم، برجاء التواجد في نقطة الاستلام في الموعد.',
        de: 'Die Abfahrt ist um 17:00 Uhr. Ihre genaue Abholzeit wird einen Tag vor der Tour bestätigt, bitte seien Sie rechtzeitig am Abholpunkt.',
      },
      {
        en: 'The star watching depends on a clear sky. Cloudy nights happen rarely in the desert, but no one can order the weather.',
        ar: 'تعتمد مشاهدة النجوم على صفاء السماء. الليالي الغائمة نادرة في الصحراء، لكن لا أحد يتحكم في الطقس.',
        de: 'Die Sternenbeobachtung hängt von einem klaren Himmel ab. Bewölkte Nächte sind in der Wüste selten, aber das Wetter lässt sich nicht bestellen.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada included · El Gouna, Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة مشمولة · الجونة وسهل حشيش ومكادي +10 يورو للفرد · سوما باي وسفاجا +15 يورو للفرد',
      de: 'Hurghada inklusive · El Gouna, Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Desert Safari Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'sahl-hasheesh-horse-swim',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
        subtitle: { en: 'Transfer to the stables', ar: 'الانتقال إلى الإسطبل', de: 'Transfer zum Stall' },
      },
      {
        kind: 'stop',
        title: { en: 'At the stables', ar: 'في الإسطبل', de: 'Im Stall' },
        subtitle: { en: 'Meet your horse, matched to your riding level, and fit your helmet', ar: 'التعرف على حصانك المناسب لمستواك وتجهيز الخوذة', de: 'Ihr Pferd kennenlernen, passend zu Ihrem Reitniveau, und Helm anpassen' },
      },
      {
        kind: 'stop',
        title: { en: 'Guided ride', ar: 'جولة ركوب إرشادية', de: 'Geführter Ritt' },
        subtitle: { en: 'Along the Red Sea shore or out into the desert, your choice on the day', ar: 'على شاطئ البحر الأحمر أو في الصحراء، اختيارك في اليوم نفسه', de: 'Entlang der Küste des Roten Meeres oder in die Wüste, Ihre Wahl am Tag selbst' },
      },
      {
        kind: 'stop',
        title: { en: 'Swim stop with your horse', ar: 'وقفة سباحة مع حصانك', de: 'Badestopp mit Ihrem Pferd' },
        subtitle: { en: 'On the 3-hour ride, take your horse into the sea', ar: 'في جولة الثلاث ساعات، تنزل بحصانك إلى البحر', de: 'Beim 3-stündigen Ritt geht es mit Ihrem Pferd ins Meer' },
      },
      {
        kind: 'end',
        title: { en: 'Ride back and hotel drop-off', ar: 'الركوب عودة والتوصيل للفندق', de: 'Rückritt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Hurghada Horse Riding: Beach or Desert, with a Swim Stop',
      ar: 'ركوب الخيل في الغردقة: شاطئ أو صحراء مع وقفة سباحة',
      de: 'Ausritt in Hurghada: Strand oder Wüste, mit Badestopp',
    },
    displayName: { en: 'Horse Riding: Beach, Desert & Swim', ar: 'ركوب الخيل: شاطئ وصحراء وسباحة', de: 'Ausritt: Strand, Wüste & Schwimmen' },
    seoTitle: { en: 'Hurghada Horse Riding Trip: Beach, Desert & Swim with Horses', de: 'Reiten in Hurghada: Strand, Wüste & Schwimmen mit Pferden' },
    slug: '/trips/horse-riding-hurghada-swim/',
    category: 'horse',
    destination: 'Hurghada',
    images: [
      waslaHorseRideHeroImg,
      waslaHorseRide02Img,
      waslaHorseRide03Img,
      waslaHorseRide04Img,
      waslaHorseRide05Img,
      waslaHorseRide06Img,
      waslaHorseRide07Img,
      waslaHorseRide08Img,
    ],
    galleryCaptions: [
      {
        en: 'Riders take their horses deep into the Red Sea',
        ar: 'فرسان داخلين بخيولهم في البحر الأحمر',
        de: 'Reiter reiten mit ihren Pferden tief ins Rote Meer',
      },
      {
        en: 'A gallop along the beach',
        ar: 'عدو على الشاطئ',
        de: 'Galopp am Strand',
      },
      {
        en: 'An evening ride along the shore',
        ar: 'ركوب مسائي على الشاطئ',
        de: 'Abendritt entlang der Küste',
      },
      {
        en: 'A swim stop with the horses at sunset',
        ar: 'وقفة سباحة مع الخيل وقت الغروب',
        de: 'Badestopp mit den Pferden bei Sonnenuntergang',
      },
      {
        en: 'Friends galloping together on the sand',
        ar: 'أصدقاء بيعدوا سوا على الرمل',
        de: 'Freundinnen galoppieren gemeinsam über den Sand',
      },
      {
        en: 'Out in the desert behind Hurghada',
        ar: 'في صحرا الغردقة',
        de: 'In der Wüste hinter Hurghada',
      },
      {
        en: 'The group rides back as the sun goes down',
        ar: 'المجموعة راجعة مع غروب الشمس',
        de: 'Die Gruppe reitet bei Sonnenuntergang zurück',
      },
      {
        en: 'A quiet moment with your horse after the ride',
        ar: 'لحظة هادية مع حصانك بعد الرحلة',
        de: 'Ein ruhiger Moment mit Ihrem Pferd nach dem Ritt',
      },
    ],
    rating: 0,
    reviewCount: 0,
    duration: {
      en: '2 or 3 hours',
      ar: 'ساعتين أو ٣ ساعات',
      de: '2 oder 3 Stunden',
    },
    departureTimes: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'],
    timingNote: {
      en: '2-hour rides start at the times shown. The 3-hour ride starts at any time you choose, confirmed after booking.',
      ar: 'رحلات الساعتين تبدأ في المواعيد المعروضة، ورحلة التلات ساعات تبدأ في أي وقت تختاره ويتأكد بعد الحجز.',
      de: 'Der 2-stündige Ritt startet zu den angegebenen Zeiten. Der 3-stündige Ritt startet zu Ihrer Wunschzeit, bestätigt nach der Buchung.',
    },
    price: 30,
    options: [
      {
        id: 'opt-horse-2h',
        title: {
          en: 'Horse Ride, 2 Hours (Beach or Desert)',
          ar: 'ركوب خيل، ساعتين (شاطئ أو صحراء)',
          de: 'Ausritt, 2 Stunden (Strand oder Wüste)',
        },
        detail: {
          en: 'Guided ride with an instructor, Hurghada hotel pickup included',
          ar: 'ركوب موجّه مع مدرب، والاستلام من فنادق الغردقة مشمول',
          de: 'Geführter Ritt mit Reitlehrer, Hotelabholung in Hurghada inklusive',
        },
        price: 30,
      },
      {
        id: 'opt-horse-3h-swim',
        title: {
          en: 'Horse Ride, 3 Hours, with a Swim Stop',
          ar: 'ركوب خيل، ٣ ساعات، مع وقفة سباحة',
          de: 'Ausritt, 3 Stunden, mit Badestopp',
        },
        detail: {
          en: 'Longer guided ride with a swim stop in the sea with your horse, start at a time of your choice',
          ar: 'ركوب موجّه أطول مع وقفة سباحة في البحر مع حصانك، والبداية في وقت من اختيارك',
          de: 'Längerer geführter Ritt mit Badestopp im Meer, Start zu Ihrer Wunschzeit',
        },
        price: 45,
      },
    ],
    shortDescription: {
      en: 'A real ride along the shore or through the desert, on a horse matched to your level.',
      ar: 'ركوب موجّه حقيقي على شاطئ البحر الأحمر أو في الصحرا، على حصان مناسب لمستواك، مع وقفة سباحة في الرحلة الأطول.',
      de: 'Ein echter geführter Ritt am Roten Meer oder durch die Wüste, auf einem Pferd passend zu Ihrem Niveau, mit Badestopp beim längeren Ritt.',
    },
    fullDescription: {
      en: 'This is a riding trip first: you come to ride, and the horses, the shore and the desert do the rest. After pickup from your hotel, you meet the team at the coastal stables, get your safety briefing, and are offered a helmet and vest before you mount. Your horse is matched to your level, and your instructor rides with you the whole way.\n\nYou ride out along the Red Sea shore or into the desert behind Hurghada, as you choose on the day and as the weather allows. The pace follows the least experienced rider in the group, and nobody is ever pushed to go faster than they are comfortable with. On the 3-hour ride there is a swim stop, where you take your horse into the sea.\n\nThe team takes casual photos along the way, and if you want a dedicated photoshoot with directed poses, that is our separate Horse Photoshoot Session. Small groups, a private option, and horses that are worked and rested in rotation.',
      ar: 'دي رحلة ركوب قبل أي حاجة: انت جاي تركب، والخيل والبحر والصحرا هيكملوا الباقي. بعد الاستلام من فندقك بتقابل الفريق في الاسطبلات الساحلية، تسمع شرح الأمان، وتتجهز بخوذة وصديرية قبل ما تركب. حصانك بيتناسب مع مستواك، ومدربك راكب معاك الطريق كله.\n\nبتركب على شاطئ البحر الأحمر أو في صحرا الغردقة، حسب اختيارك في اليوم وحسب الجو. السرعة على حسب أقل راكب خبرة في المجموعة، ومحدش بيتدفع يجري أسرع من اللي هو مرتاح له أبدًا. وفي رحلة التلات ساعات فيه وقفة سباحة بتدخل فيها بحصانك البحر.\n\nالفريق بياخد لقطات عابرة على الطريق، ولو عايز سيشن تصوير كامل بوقفات موجهة دي رحلتنا المنفصلة سيشن تصوير الحصان. مجموعات صغيرة، واختيار خاص، وخيل بتشتغل وبترتاح بالتناوب.',
      de: 'Dies ist zuerst ein Reitausflug: Sie kommen zum Reiten, den Rest übernehmen die Pferde, das Meer und die Wüste. Nach der Abholung am Hotel lernen Sie das Team am Küstenstall kennen, erhalten die Sicherheitseinweisung und bekommen Helm und Weste angeboten. Ihr Pferd wird passend zu Ihrem Niveau ausgewählt, Ihr Reitlehrer begleitet Sie den ganzen Weg.\n\nSie reiten am Roten Meer entlang oder in die Wüste hinter Hurghada, nach Ihrer Wahl am Tag und je nach Wetter. Das Tempo richtet sich nach dem unerfahrensten Reiter der Gruppe, niemand wird je zu mehr Tempo gedrängt, als ihm angenehm ist. Beim 3-stündigen Ritt gibt es einen Badestopp, bei dem Sie mit Ihrem Pferd ins Meer reiten.\n\nDas Team macht unterwegs beiläufige Fotos. Wenn Sie ein eigenes Fotoshooting mit angeleiteten Posen möchten, ist das unsere separate Pferde-Fotosession. Kleine Gruppen, eine Privatoption und Pferde, die im Wechsel arbeiten und ruhen.',
    },
    highlights: [
      {
        en: 'Ride along the Red Sea shore or out into the desert, your choice on the day',
        ar: 'اركب على شاطئ البحر الأحمر أو في الصحرا، اختيارك في اليوم نفسه',
        de: 'Reiten Sie am Roten Meer entlang oder in die Wüste, Ihre Wahl am Tag',
      },
      {
        en: 'A horse and a pace matched to your riding level, beginner or experienced',
        ar: 'حصان وسرعة مناسبين لمستواك، مبتدئ أو متمرس',
        de: 'Pferd und Tempo passend zu Ihrem Niveau, Anfänger oder erfahren',
      },
      {
        en: 'On the 3-hour ride, take your horse into the sea for a swim stop',
        ar: 'في رحلة التلات ساعات، ادخل بحصانك البحر في وقفة سباحة',
        de: 'Beim 3-stündigen Ritt reiten Sie mit Ihrem Pferd zum Baden ins Meer',
      },
      {
        en: 'Small groups, with a private option for your group only',
        ar: 'مجموعات صغيرة، مع اختيار خاص لمجموعتك بس',
        de: 'Kleine Gruppen, mit Privatoption nur für Ihre Gruppe',
      },
      {
        en: 'A professional instructor rides with you the whole way',
        ar: 'مدرب محترف راكب معاك الطريق كله',
        de: 'Ein professioneller Reitlehrer begleitet Sie den ganzen Weg',
      },
    ],
    included: [
      {
        en: 'Hotel pickup and drop-off in Hurghada',
        ar: 'الاستلام من فنادق الغردقة والرجوع',
        de: 'Hotelabholung und Rücktransfer in Hurghada',
      },
      {
        en: 'Professional instructor riding with you',
        ar: 'مدرب محترف راكب معاك',
        de: 'Professioneller Reitlehrer an Ihrer Seite',
      },
      {
        en: 'Safety briefing and supervision throughout',
        ar: 'شرح أمان وإشراف طول الرحلة',
        de: 'Sicherheitseinweisung und Betreuung durchgehend',
      },
      {
        en: 'Horse and full riding equipment',
        ar: 'الحصان ومعدات الركوب كاملة',
        de: 'Pferd und komplette Reitausrüstung',
      },
      {
        en: 'Helmet and safety vest, offered to every rider before mounting',
        ar: 'خوذة وصديرية أمان بيتقدموا لكل راكب قبل الركوب',
        de: 'Helm und Sicherheitsweste werden jedem Reiter vor dem Aufsteigen angeboten',
      },
      {
        en: 'Bottled water',
        ar: 'مياه معبأة',
        de: 'Wasser in Flaschen',
      },
    ],
    tips: [
      {
        en: 'Pickup outside Hurghada and El Gouna is not included: Sahl Hasheesh and Makadi +€10 per person, Soma Bay and Safaga +€15 per person, payable on site.',
        ar: 'الاستلام خارج الغردقة والجونة غير مشمول: سهل حشيش ومكادي +١٠ يورو للفرد، سوما باي وسفاجا +١٥ يورو للفرد، وتدفع في المكان.',
        de: 'Abholung außerhalb von Hurghada und El Gouna ist nicht inklusive: Sahl Hasheesh und Makadi +10 € pro Person, Soma Bay und Safaga +15 € pro Person, zahlbar vor Ort.',
      },
      {
        en: 'A dedicated photoshoot with directed poses is our separate Horse Photoshoot Session',
        ar: 'سيشن التصوير الكامل بوقفات موجهة هو رحلتنا المنفصلة سيشن تصوير الحصان',
        de: 'Ein eigenes Fotoshooting mit angeleiteten Posen ist unsere separate Pferde-Fotosession',
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
      en: 'Coastal Stables, Hurghada South / Hotel Lobby Pickup',
      ar: 'اسطبلات ساحلية في جنوب الغردقة أو الاستلام من بهو الفندق',
      de: 'Küstenstall Hurghada Süd / Hotelabholung',
    },
    whatToBring: [
      { en: 'Hat', ar: 'قبعة', de: 'Hut' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Comfortable clothes and closed shoes', ar: 'ملابس مريحة وحذاء مقفول', de: 'Bequeme Kleidung und geschlossene Schuhe' },
      { en: 'Swimwear and a towel on the 3-hour ride', ar: 'مايوه وفوطة في رحلة التلات ساعات', de: 'Badesachen und Handtuch beim 3-stündigen Ritt' },
    ],
    notAllowed: [
      { en: 'Pets', ar: 'الحيوانات الأليفة', de: 'Haustiere' },
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'Suitable for beginners and experienced riders, the pace follows the least experienced rider and nobody is pushed to ride faster than they are comfortable with',
        ar: 'مناسبة للمبتدئين والمتمرسين، والسرعة على حسب أقل راكب خبرة ومحدش بيتدفع يجري أسرع من راحته',
        de: 'Für Anfänger und Erfahrene geeignet, das Tempo richtet sich nach dem unerfahrensten Reiter und niemand wird zu mehr Tempo gedrängt',
      },
      {
        en: 'Want the ride just for your group? A private ride adds €30 per booking, tell us when you book and we will arrange it',
        ar: 'عايز الرحلة لمجموعتك بس؟ الرحلة الخاصة بتضيف ٣٠ يورو على الحجز كله، قولنا وقت الحجز ونرتبها',
        de: 'Nur für Ihre Gruppe? Ein privater Ritt kostet 30 € Aufpreis pro Buchung, sagen Sie uns bei der Buchung Bescheid',
      },
      {
        en: 'Tell us your hotel and we confirm your exact pickup time after booking',
        ar: 'قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز',
        de: 'Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung',
      },
    ],
    outerTransferEnabled: true,
    freeTransferZones: ['el-gouna'],
    pickup: {
      en: 'Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد',
      de: 'Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Al-Bahr Stables',
    childPriceEur: 45,
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 5,
    featured: true,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-horse-photoshoot-session',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
        subtitle: { en: 'Transfer to the stables', ar: 'الانتقال إلى الإسطبل', de: 'Transfer zum Stall' },
      },
      {
        kind: 'stop',
        title: { en: 'Meet the team and your horse', ar: 'التعرف على الفريق وحصانك', de: 'Team und Ihr Pferd kennenlernen' },
        subtitle: { en: 'A decorated horse, prepared for the session', ar: 'حصان مزيّن ومجهّز للجلسة', de: 'Ein geschmücktes Pferd, vorbereitet für die Session' },
      },
      {
        kind: 'stop',
        title: { en: 'Photoshoot on the beach', ar: 'جلسة التصوير على الشاطئ', de: 'Fotoshooting am Strand' },
        subtitle: { en: 'Directed poses at hand-picked spots, the team sets up every shot', ar: 'وضعيات موجّهة في أماكن مختارة، والفريق يجهّز كل لقطة', de: 'Angeleitete Posen an ausgewählten Spots, das Team richtet jede Aufnahme ein' },
      },
      {
        kind: 'stop',
        title: { en: 'Photos in the sea', ar: 'صور في البحر', de: 'Fotos im Meer' },
        subtitle: { en: 'With a gentle ride between locations, no riding experience needed', ar: 'مع ركوب هادئ بين الأماكن، من غير ما تحتاج خبرة ركوب', de: 'Mit einem ruhigen Ritt zwischen den Locations, ganz ohne Reiterfahrung' },
      },
      {
        kind: 'end',
        title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
        subtitle: { en: 'Everyone in your group gets photographed', ar: 'كل فرد في مجموعتك بيتصور', de: 'Jeder in Ihrer Gruppe wird fotografiert' },
      },
    ],
    name: {
      en: 'Horse Photoshoot Session in Hurghada: Beach and Sea Shots',
      ar: 'سيشن تصوير على الحصان في الغردقة: لقطات الشاطئ والبحر',
      de: 'Pferde-Fotoshooting in Hurghada: Strand- und Meerbilder',
    },
    displayName: { en: 'Horse Photoshoot Session', ar: 'سيشن تصوير على الخيل', de: 'Pferde-Fotoshooting' },
    seoTitle: { en: 'Horse Photoshoot in Hurghada: Beach & Sea Photo Session', de: 'Pferde Fotoshooting in Hurghada: Fotos am Strand & im Meer' },
    slug: '/trips/horse-photoshoot-hurghada/',
    category: 'horse',
    destination: 'Hurghada',
    images: [
      waslaHorseSessionHeroImg,
      waslaHorseSession02Img,
      waslaHorseSession03Img,
      waslaHorseSession04Img,
      waslaHorseSession05Img,
      waslaHorseSession06Img,
    ],
    galleryCaptions: [
      {
        en: 'A quiet portrait with a white horse by the sea',
        ar: 'بورتريه هادي مع حصان أبيض على البحر',
        de: 'Ein ruhiges Porträt mit einem weißen Pferd am Meer',
      },
      {
        en: "Reclining on her horse at the water's edge",
        ar: 'مستلقية على حصانها عند حافة المية',
        de: 'Zurückgelehnt auf ihrem Pferd am Wasser',
      },
      {
        en: 'Golden hour with a pinto horse',
        ar: 'الساعة الذهبية مع حصان مرقط',
        de: 'Goldene Stunde mit einem gescheckten Pferd',
      },
      {
        en: 'A kiss for the horse',
        ar: 'بوسة للحصان',
        de: 'Ein Kuss für das Pferd',
      },
      {
        en: 'Standing tall in the shallows',
        ar: 'واقفة على الحصان في المية الضحلة',
        de: 'Aufrecht stehend im flachen Wasser',
      },
      {
        en: 'Feeding time at the stables',
        ar: 'وقت الأكل في الاسطبل',
        de: 'Fütterungszeit am Stall',
      },
    ],
    rating: 0,
    reviewCount: 0,
    duration: {
      en: '1 or 2 hours',
      ar: 'ساعة أو ساعتين',
      de: '1 oder 2 Stunden',
    },
    departureTimes: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'],
    timingNote: {
      en: 'Your exact start time is confirmed after booking, around the light you want.',
      ar: 'وقت البداية بالظبط بيتأكد بعد الحجز، على حسب الإضاءة اللي عايزها.',
      de: 'Ihre genaue Startzeit wird nach der Buchung bestätigt, passend zum Licht Ihrer Wahl.',
    },
    price: 60,
    options: [
      {
        id: 'opt-session-1h',
        title: {
          en: 'Photoshoot Session, 1 Hour',
          ar: 'سيشن تصوير، ساعة',
          de: 'Fotosession, 1 Stunde',
        },
        detail: {
          en: 'Directed phone photoshoot on a decorated horse, Hurghada pickup included',
          ar: 'سيشن تصوير موجّه بالموبايل على حصان مزين، واستلام الغردقة مشمول',
          de: 'Angeleitetes Handy-Fotoshooting auf einem geschmückten Pferd, Abholung in Hurghada inklusive',
        },
        price: 60,
      },
      {
        id: 'opt-session-2h',
        title: {
          en: 'Photoshoot Session, 2 Hours',
          ar: 'سيشن تصوير، ساعتين',
          de: 'Fotosession, 2 Stunden',
        },
        detail: {
          en: 'A longer session with more spots and more looks, same price',
          ar: 'سيشن أطول بأماكن ولقطات أكتر، بنفس السعر',
          de: 'Eine längere Session mit mehr Orten und Looks, gleicher Preis',
        },
        price: 60,
      },
    ],
    shortDescription: {
      en: 'A guided photoshoot on horseback at the beach and in the sea shallows, posed at the spots that photograph best.',
      ar: 'سيشن تصوير موجّه على الحصان على الشاطئ وفي المية الضحلة، بيتصور بالموبايل بوقفات موجهة في الأماكن اللي تصويرها أحلى.',
      de: 'Ein angeleitetes Fotoshooting zu Pferd am Strand und im flachen Meer, mit dem Handy fotografiert und angeleiteten Posen an den fotogensten Orten.',
    },
    fullDescription: {
      en: 'This is the photoshoot, not a riding tour with photos on the side. The team prepares a decorated horse, walks you between the spots that photograph best on the beach and in the sea shallows, and directs every pose: standing with your horse, sitting tall in the saddle, lying back along its neck, walking it through the water.\n\nNo riding experience is needed. Between locations you ride at a gentle walk with a handler beside you, and everyone booked in your group is photographed, not just one of you.\n\nThe session is shot on phone and the photos are shared with you afterwards. If you want a professional camera, a flying dress and edited photos, that is our Flying Dress Photoshoot. If you want to actually ride, that is our Horse Riding trip.',
      ar: 'ده سيشن التصوير نفسه، مش رحلة ركوب وعلى جنبها صور. الفريق بيجهز حصان مزين، ويمشي بيك بين الأماكن اللي تصويرها أحلى على الشاطئ وفي المية الضحلة، ويوجهك في كل وقفة: واقف جنب حصانك، قاعد على السرج، مستلقي على رقبته، ماشي بيه في المية.\n\nمش محتاج خبرة ركوب. بين الأماكن بتركب بمشية هادية ومرافق جنبك، وكل اللي حاجزين في مجموعتك بيتصوروا مش واحد بس.\n\nالسيشن بيتصور بالموبايل والصور بتوصلك بعدها. ولو عايز كاميرا احترافية وفستان طائر وصور معدلة، دي رحلتنا سيشن الفستان الطائر. ولو عايز تركب بجد، دي رحلتنا ركوب الخيل.',
      de: 'Dies ist das Fotoshooting selbst, keine Reittour mit Fotos nebenbei. Das Team bereitet ein geschmücktes Pferd vor, führt Sie zu den Orten am Strand und im flachen Meer, die sich am besten fotografieren lassen, und leitet jede Pose an: stehend neben Ihrem Pferd, aufrecht im Sattel, zurückgelehnt am Hals, durchs Wasser führend.\n\nReiterfahrung ist nicht nötig. Zwischen den Orten reiten Sie im ruhigen Schritt mit einem Begleiter an Ihrer Seite, und alle Gebuchten Ihrer Gruppe werden fotografiert, nicht nur einer.\n\nDie Session wird mit dem Handy fotografiert und die Fotos werden Ihnen danach geteilt. Wenn Sie eine Profikamera, ein Flying Dress und bearbeitete Fotos möchten, ist das unser Flying-Dress-Fotoshooting. Wenn Sie wirklich reiten möchten, ist das unser Ausritt.',
    },
    highlights: [
      {
        en: 'A dedicated photoshoot on a decorated horse, at the beach and in the sea',
        ar: 'سيشن تصوير كامل على حصان مزين، على الشاطئ وفي البحر',
        de: 'Ein eigenes Fotoshooting auf einem geschmückten Pferd, am Strand und im Meer',
      },
      {
        en: 'Directed poses at hand-picked spots, the team sets up every shot',
        ar: 'وقفات موجهة في أماكن مختارة، والفريق بيظبط كل لقطة',
        de: 'Angeleitete Posen an ausgewählten Orten, das Team richtet jede Aufnahme ein',
      },
      {
        en: 'A gentle ride between locations, no riding experience needed',
        ar: 'ركوب هادي بين الأماكن، من غير خبرة ركوب',
        de: 'Ruhiges Reiten zwischen den Orten, keine Reiterfahrung nötig',
      },
      {
        en: 'Everyone in your group gets photographed',
        ar: 'كل مجموعتك بتتصور',
        de: 'Alle in Ihrer Gruppe werden fotografiert',
      },
      {
        en: 'Guided throughout by the team who shoot these sessions every day',
        ar: 'معاك طول الوقت الفريق اللي بيصور السيشنز دي كل يوم',
        de: 'Begleitet vom Team, das diese Sessions jeden Tag fotografiert',
      },
    ],
    included: [
      {
        en: 'Hotel pickup and drop-off in Hurghada',
        ar: 'الاستلام من فنادق الغردقة والرجوع',
        de: 'Hotelabholung und Rücktransfer in Hurghada',
      },
      {
        en: 'Decorated horse and handler',
        ar: 'حصان مزين ومرافق',
        de: 'Geschmücktes Pferd und Begleiter',
      },
      {
        en: 'Phone photoshoot with directed poses',
        ar: 'سيشن تصوير بالموبايل بوقفات موجهة',
        de: 'Handy-Fotoshooting mit angeleiteten Posen',
      },
      {
        en: 'Safety briefing and supervision throughout',
        ar: 'شرح أمان وإشراف طول السيشن',
        de: 'Sicherheitseinweisung und Betreuung durchgehend',
      },
      {
        en: 'Bottled water',
        ar: 'مياه معبأة',
        de: 'Wasser in Flaschen',
      },
    ],
    tips: [
      {
        en: 'Pickup outside Hurghada and El Gouna is not included: Sahl Hasheesh and Makadi +€10 per person, Soma Bay and Safaga +€15 per person, payable on site.',
        ar: 'الاستلام خارج الغردقة والجونة غير مشمول: سهل حشيش ومكادي +١٠ يورو للفرد، سوما باي وسفاجا +١٥ يورو للفرد، وتدفع في المكان.',
        de: 'Abholung außerhalb von Hurghada und El Gouna ist nicht inklusive: Sahl Hasheesh und Makadi +10 € pro Person, Soma Bay und Safaga +15 € pro Person, zahlbar vor Ort.',
      },
      {
        en: 'Professional camera work and edited photos are the Flying Dress Photoshoot, a separate experience',
        ar: 'التصوير بكاميرا احترافية والصور المعدلة هو سيشن الفستان الطائر، تجربة منفصلة',
        de: 'Profikamera und bearbeitete Fotos sind das Flying-Dress-Fotoshooting, ein separates Erlebnis',
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
      en: 'Coastal Stables, Hurghada South / Hotel Lobby Pickup',
      ar: 'اسطبلات ساحلية في جنوب الغردقة أو الاستلام من بهو الفندق',
      de: 'Küstenstall Hurghada Süd / Hotelabholung',
    },
    whatToBring: [
      { en: 'An outfit you love being photographed in', ar: 'لبس بتحب تتصور بيه', de: 'Ein Outfit, in dem Sie sich gern fotografieren lassen' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Hat', ar: 'قبعة', de: 'Hut' },
      { en: 'Comfortable clothes and closed shoes for mounting', ar: 'ملابس مريحة وحذاء مقفول للركوب', de: 'Bequeme Kleidung und geschlossene Schuhe zum Aufsteigen' },
    ],
    notAllowed: [
      { en: 'Pets', ar: 'الحيوانات الأليفة', de: 'Haustiere' },
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'No riding experience is needed, the horse is led and a handler walks beside you',
        ar: 'مش محتاج خبرة ركوب، الحصان بيتمشى بيه ومرافق ماشي جنبك',
        de: 'Keine Reiterfahrung nötig, das Pferd wird geführt und ein Begleiter geht neben Ihnen',
      },
      {
        en: 'Everyone booked in your group is photographed',
        ar: 'كل اللي حاجزين في مجموعتك بيتصوروا',
        de: 'Alle Gebuchten Ihrer Gruppe werden fotografiert',
      },
      {
        en: 'Tell us your hotel and we confirm your exact pickup time after booking',
        ar: 'قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز',
        de: 'Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung',
      },
    ],
    outerTransferEnabled: true,
    freeTransferZones: ['el-gouna'],
    pickup: {
      en: 'Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد',
      de: 'Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Al-Bahr Stables',
    childPriceEur: 60,
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 5,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-flying-dress-photoshoot',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
        subtitle: { en: 'Timing arranged with you after booking', ar: 'الموعد يُرتّب معك بعد الحجز', de: 'Die Zeit wird nach der Buchung mit Ihnen abgestimmt' },
      },
      {
        kind: 'stop',
        title: { en: 'Choose your dress', ar: 'اختيار فستانك', de: 'Wählen Sie Ihr Kleid' },
        subtitle: { en: 'Dress and colour from the dresses provided', ar: 'الفستان واللون من الفساتين المتوفرة', de: 'Kleid und Farbe aus den bereitgestellten Kleidern' },
      },
      {
        kind: 'stop',
        title: { en: 'First location: the sea shallows', ar: 'الموقع الأول: مياه البحر الضحلة', de: 'Erste Location: das flache Meerwasser' },
        subtitle: { en: 'Shoot with a prepared horse, the team sets up every shot', ar: 'تصوير مع حصان مجهّز، والفريق يجهّز كل لقطة', de: 'Shooting mit einem vorbereiteten Pferd, das Team richtet jede Aufnahme ein' },
      },
      {
        kind: 'stop',
        title: { en: 'Second location: the desert', ar: 'الموقع الثاني: الصحراء', de: 'Zweite Location: die Wüste' },
      },
      {
        kind: 'end',
        title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
        subtitle: { en: '22 professionally edited photos to take home', ar: 'اتنين وعشرين صورة معدّلة باحتراف تاخدها معاك', de: '22 professionell bearbeitete Fotos für Sie' },
      },
    ],
    name: {
      en: 'Flying Dress Photoshoot with Horses in Hurghada',
      ar: 'سيشن الفستان الطائر مع الخيل في الغردقة',
      de: 'Flying-Dress-Fotoshooting mit Pferden in Hurghada',
    },
    displayName: { en: 'Flying Dress Photoshoot with Horses', ar: 'سيشن الفستان الطائر مع الخيل', de: 'Flying Dress Fotoshooting mit Pferden' },
    seoTitle: { en: 'Flying Dress Photoshoot in Hurghada: Horses, Beach & Sea', de: 'Flying Dress Fotoshooting in Hurghada: Pferde, Strand & Meer' },
    slug: '/trips/flying-dress-photoshoot-hurghada/',
    category: 'horse',
    destination: 'Hurghada',
    images: [
      waslaFlyingDressHeroImg,
      waslaFlyingDress02Img,
      waslaFlyingDress03Img,
      waslaFlyingDress04Img,
      waslaFlyingDress05Img,
      waslaFlyingDress06Img,
    ],
    galleryCaptions: [
      {
        en: 'The red dress flies over the sea shallows',
        ar: 'الفستان الأحمر طاير فوق المية الضحلة',
        de: 'Das rote Kleid fliegt über das flache Meer',
      },
      {
        en: 'A rearing horse under a dramatic sky',
        ar: 'حصان شابب تحت سما درامية',
        de: 'Ein steigendes Pferd unter dramatischem Himmel',
      },
      {
        en: 'The blue dress at a gallop',
        ar: 'الفستان الأزرق في العدو',
        de: 'Das blaue Kleid im Galopp',
      },
      {
        en: 'The red dress in the desert at sunset',
        ar: 'الفستان الأحمر في الصحرا وقت الغروب',
        de: 'Das rote Kleid in der Wüste bei Sonnenuntergang',
      },
      {
        en: 'The blue dress on the beach',
        ar: 'الفستان الأزرق على الشاطئ',
        de: 'Das blaue Kleid am Strand',
      },
      {
        en: 'White dress, red hat, calm sea',
        ar: 'فستان أبيض وقبعة حمرا وبحر هادي',
        de: 'Weißes Kleid, roter Hut, ruhiges Meer',
      },
    ],
    rating: 0,
    reviewCount: 0,
    duration: {
      en: 'Timing arranged with you',
      ar: 'التوقيت بيترتب معاك',
      de: 'Die Zeit wird mit Ihnen abgestimmt',
    },
    departureTimes: [],
    timingNote: {
      en: 'We arrange the start around the best light and confirm it after booking.',
      ar: 'بنرتب البداية على أحلى إضاءة ونأكدها بعد الحجز.',
      de: 'Wir legen den Start auf das beste Licht und bestätigen ihn nach der Buchung.',
    },
    price: 250,
    options: [
      {
        id: 'opt-flying-dress',
        title: {
          en: 'Flying Dress Photoshoot, Two Locations',
          ar: 'سيشن الفستان الطائر، مكانين',
          de: 'Flying-Dress-Fotoshooting, zwei Orte',
        },
        detail: {
          en: 'Two dresses, professional camera and editing, 22 edited photos',
          ar: 'فستانين، كاميرا احترافية وتعديل احترافي، ٢٢ صورة معدلة',
          de: 'Zwei Kleider, Profikamera und Bearbeitung, 22 bearbeitete Fotos',
        },
        price: 250,
      },
    ],
    shortDescription: {
      en: 'A professional flying dress shoot on a prepared horse at two locations, with 22 finished photos.',
      ar: 'سيشن فستان طائر احترافي على حصان مجهز في مكانين، بكاميرا احترافية وتعديل احترافي و٢٢ صورة جاهزة.',
      de: 'Ein professionelles Flying-Dress-Shooting auf einem vorbereiteten Pferd an zwei Orten, mit Profikamera, professioneller Bearbeitung und 22 fertigen Fotos.',
    },
    fullDescription: {
      en: 'You choose your dress and its colour from the dresses provided, and the team prepares your horse. Then the shoot moves between two locations: the sea shallows, where the dress flies over the water, and the open desert.\n\nA professional photographer shoots on a professional camera, and the team sets up every shot around you, the dress and the horse. No riding experience is needed, the horse is led and handled by the team throughout.\n\nYour photos are professionally retouched, and you receive 22 edited photos from the session.',
      ar: 'بتختاري فستانك ولونه من الفساتين المتوفرة، والفريق بيجهز حصانك. وبعدين السيشن بيتنقل بين مكانين: المية الضحلة على البحر، وهناك الفستان بيطير فوق المية، والصحرا المفتوحة.\n\nمصور محترف بيصور بكاميرا احترافية، والفريق بيظبط كل لقطة حواليكي وحوالين الفستان والحصان. مش محتاجة خبرة ركوب، الحصان بيتمشى بيه والفريق ماسكه طول الوقت.\n\nصورك بتتعدل باحترافية، وبتستلمي ٢٢ صورة معدلة من السيشن.',
      de: 'Sie wählen Ihr Kleid und seine Farbe aus den bereitgestellten Kleidern, und das Team bereitet Ihr Pferd vor. Dann wechselt das Shooting zwischen zwei Orten: dem flachen Meer, wo das Kleid über dem Wasser fliegt, und der offenen Wüste.\n\nEin professioneller Fotograf fotografiert mit einer Profikamera, und das Team richtet jede Aufnahme um Sie, das Kleid und das Pferd ein. Reiterfahrung ist nicht nötig, das Pferd wird durchgehend vom Team geführt und gehalten.\n\nIhre Fotos werden professionell retuschiert, und Sie erhalten 22 bearbeitete Fotos aus der Session.',
    },
    highlights: [
      {
        en: 'Choose your dress and colour from the dresses provided',
        ar: 'اختاري فستانك ولونه من الفساتين المتوفرة',
        de: 'Wählen Sie Ihr Kleid und seine Farbe aus den bereitgestellten Kleidern',
      },
      {
        en: 'Two locations: the sea shallows and the desert',
        ar: 'مكانين: المية الضحلة على البحر والصحرا',
        de: 'Zwei Orte: das flache Meer und die Wüste',
      },
      {
        en: 'A prepared horse and a team that sets up every shot',
        ar: 'حصان مجهز وفريق بيظبط كل لقطة',
        de: 'Ein vorbereitetes Pferd und ein Team, das jede Aufnahme einrichtet',
      },
      {
        en: 'Professional camera and professional editing',
        ar: 'كاميرا احترافية وتعديل احترافي',
        de: 'Profikamera und professionelle Bearbeitung',
      },
      {
        en: '22 edited photos to take home',
        ar: '٢٢ صورة معدلة تاخديها معاكي',
        de: '22 bearbeitete Fotos zum Mitnehmen',
      },
    ],
    included: [
      {
        en: 'Private hotel pickup and drop-off',
        ar: 'استلام خاص من الفندق والرجوع',
        de: 'Private Hotelabholung und Rücktransfer',
      },
      {
        en: 'Dress of your choice from the dresses provided',
        ar: 'فستان من اختيارك من الفساتين المتوفرة',
        de: 'Kleid Ihrer Wahl aus den bereitgestellten Kleidern',
      },
      {
        en: 'Prepared horse and the full team',
        ar: 'حصان مجهز والفريق كله',
        de: 'Vorbereitetes Pferd und das ganze Team',
      },
      {
        en: 'Professional photographer and camera',
        ar: 'مصور محترف وكاميرا احترافية',
        de: 'Professioneller Fotograf und Kamera',
      },
      {
        en: 'Professional retouching',
        ar: 'تعديل احترافي على الصور',
        de: 'Professionelle Retusche',
      },
      {
        en: '22 edited photos',
        ar: '٢٢ صورة معدلة',
        de: '22 bearbeitete Fotos',
      },
    ],
    tips: [
      {
        en: 'Pickup outside Hurghada is arranged individually, ask us when you book',
        ar: 'الاستلام خارج الغردقة بيترتب بشكل فردي، اسألنا وقت الحجز',
        de: 'Abholung außerhalb von Hurghada wird individuell vereinbart, fragen Sie uns bei der Buchung',
      },
    ],
    notSuitableFor: [
      { en: 'Pregnant women', ar: 'النساء الحوامل', de: 'Schwangere Frauen' },
      { en: 'People with back problems', ar: 'الأشخاص الذين يعانون من مشاكل في الظهر', de: 'Personen mit Rückenproblemen' },
      { en: 'Wheelchair users', ar: 'مستخدمو الكراسي المتحركة', de: 'Rollstuhlfahrer' },
      { en: 'People over 243 lbs (110 kg)', ar: 'الأشخاص فوق وزن 110 كجم (243 رطل)', de: 'Personen über 110 kg Körpergewicht' },
    ],
    meetingPoint: {
      en: 'Coastal Stables, Hurghada South / Hotel Lobby Pickup',
      ar: 'اسطبلات ساحلية في جنوب الغردقة أو الاستلام من بهو الفندق',
      de: 'Küstenstall Hurghada Süd / Hotelabholung',
    },
    whatToBring: [
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Hat', ar: 'قبعة', de: 'Hut' },
      { en: 'Your own camera for behind-the-scenes shots', ar: 'كاميرتك لصور كواليس', de: 'Ihre eigene Kamera für Behind-the-Scenes-Fotos' },
    ],
    notAllowed: [
      { en: 'Pets', ar: 'الحيوانات الأليفة', de: 'Haustiere' },
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'No riding experience is needed, the horse is led by the team throughout',
        ar: 'مش محتاجة خبرة ركوب، الفريق ماشي بالحصان طول الوقت',
        de: 'Keine Reiterfahrung nötig, das Pferd wird durchgehend vom Team geführt',
      },
      {
        en: 'The start time is set around the best light and confirmed after booking',
        ar: 'وقت البداية بيتحط على أحلى إضاءة ويتأكد بعد الحجز',
        de: 'Die Startzeit wird auf das beste Licht gelegt und nach der Buchung bestätigt',
      },
      {
        en: 'You receive 22 edited photos from the session',
        ar: 'بتستلمي ٢٢ صورة معدلة من السيشن',
        de: 'Sie erhalten 22 bearbeitete Fotos aus der Session',
      },
    ],
    outerTransferEnabled: false,
    pickup: {
      en: 'Private hotel pickup included',
      ar: 'استلام خاص من الفندق مشمول',
      de: 'Private Hotelabholung inklusive',
    },
    supplierName: 'Al-Bahr Stables',
    childPriceEur: 250,
    familyFriendly: false,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-horse-carriage-sea-ride',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
        subtitle: { en: 'Transfer to the carriage point', ar: 'الانتقال إلى نقطة العربة', de: 'Transfer zum Kutschenpunkt' },
      },
      {
        kind: 'stop',
        title: { en: 'Board the horse carriage', ar: 'ركوب عربة الحصان', de: 'Einsteigen in die Pferdekutsche' },
        subtitle: { en: 'Families and groups ride together in one carriage', ar: 'العائلات والمجموعات تركب معًا في عربة واحدة', de: 'Familien und Gruppen fahren gemeinsam in einer Kutsche' },
      },
      {
        kind: 'stop',
        title: { en: 'Ride along the beach', ar: 'جولة على الشاطئ', de: 'Fahrt entlang des Strandes' },
      },
      {
        kind: 'stop',
        title: { en: 'The carriage rolls into the shallow sea', ar: 'العربة تدخل مياه البحر الضحلة', de: 'Die Kutsche rollt ins flache Meer' },
      },
      {
        kind: 'stop',
        title: { en: 'Photo stops along the way', ar: 'وقفات تصوير على الطريق', de: 'Fotostopps unterwegs' },
      },
      {
        kind: 'end',
        title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
      },
    ],
    name: {
      en: 'Horse Carriage Ride in Hurghada: Along the Beach and Into the Sea',
      ar: 'جولة بعربة الحصان في الغردقة: على الشاطئ وجوه المية',
      de: 'Kutschfahrt in Hurghada: Am Strand entlang und ins Meer',
    },
    displayName: { en: 'Horse Carriage Sea Ride', ar: 'جولة عربة الحصان في البحر', de: 'Kutschfahrt ins Meer' },
    seoTitle: { en: 'Horse Carriage Ride in Hurghada: Beach Ride Into the Sea', de: 'Pferdekutschenfahrt in Hurghada: Strandfahrt & Meerwasser' },
    slug: '/trips/horse-carriage-ride-hurghada/',
    category: 'horse',
    destination: 'Hurghada',
    images: [
      waslaCarriageHeroImg,
      waslaCarriage02Img,
      waslaCarriage03Img,
      waslaCarriage04Img,
      waslaCarriage05Img,
      waslaCarriage06Img,
    ],
    galleryCaptions: [
      {
        en: 'The carriage rolls into the sea, and everyone laughs',
        ar: 'العربة داخلة المية، والكل بيضحك',
        de: 'Die Kutsche fährt ins Meer, und alle lachen',
      },
      {
        en: 'A family ride at sunset',
        ar: 'جولة عائلية وقت الغروب',
        de: 'Eine Familienfahrt bei Sonnenuntergang',
      },
      {
        en: 'Standing in the carriage as the sun goes down',
        ar: 'واقفين في العربة والشمس بتغيب',
        de: 'Stehend in der Kutsche, während die Sonne untergeht',
      },
      {
        en: 'The carriage horses on the beach',
        ar: 'خيول العربة على الشاطئ',
        de: 'Die Kutschpferde am Strand',
      },
      {
        en: 'Three friends share the carriage',
        ar: 'تلات صديقات بيتشاركوا العربة',
        de: 'Drei Freundinnen teilen sich die Kutsche',
      },
      {
        en: 'Into the sea at sunset',
        ar: 'دخول المية وقت الغروب',
        de: 'Ins Meer bei Sonnenuntergang',
      },
    ],
    rating: 0,
    reviewCount: 0,
    duration: {
      en: '2 hours',
      ar: 'ساعتين',
      de: '2 Stunden',
    },
    departureTimes: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'],
    price: 20,
    options: [
      {
        id: 'opt-carriage-2h',
        title: {
          en: 'Carriage Ride, 2 Hours',
          ar: 'جولة بالعربة، ساعتين',
          de: 'Kutschfahrt, 2 Stunden',
        },
        detail: {
          en: 'Per person',
          ar: 'للفرد',
          de: 'Pro Person',
        },
        price: 20,
      },
    ],
    shortDescription: {
      en: 'A relaxed carriage ride along the beach and right into the shallow sea, the whole family in one carriage.',
      ar: 'جولة هادية بعربة حصان على شاطئ الغردقة، ودخول بالعربة جوه المية الضحلة، وعيلتك سوا في عربة واحدة.',
      de: 'Eine entspannte Kutschfahrt am Strand von Hurghada entlang, und direkt ins flache Meer hinein, mit Ihrer Familie gemeinsam in einer Kutsche.',
    },
    fullDescription: {
      en: 'Some Hurghada experiences are about speed. This one is about slowing down. Your carriage rolls along the beach at a walking pace, and then does the thing guests remember most: it rolls straight into the shallow sea, horses and wheels in the water, while you sit back and take it in.\n\nFamilies and groups ride together in one carriage, with a driver and team with you the whole way and photo stops whenever the light or the view asks for one.\n\nIt is an easy, gentle outing for all ages.',
      ar: 'فيه تجارب في الغردقة عن السرعة، ودي عن الهدوء. عربتك بتمشي على الشاطئ بخطوة هادية، وبعدين بتعمل الحاجة اللي الضيوف بيفتكروها أكتر حاجة: بتدخل على طول جوه المية الضحلة، الخيل والعجل في المية، وانت قاعد مسترخي وبتتفرج.\n\nالعائلات والمجموعات بيركبوا سوا في عربة واحدة، مع سواق وفريق معاك الطريق كله ووقفات تصوير كل ما الإضاءة أو المنظر يطلب.\n\nخروجة سهلة وهادية لكل الأعمار.',
      de: 'Manche Erlebnisse in Hurghada drehen sich um Tempo. Dieses dreht sich ums Entschleunigen. Ihre Kutsche rollt im Schritt am Strand entlang und tut dann das, woran sich Gäste am meisten erinnern: Sie fährt direkt ins flache Meer hinein, Pferde und Räder im Wasser, während Sie sich zurücklehnen und genießen.\n\nFamilien und Gruppen fahren gemeinsam in einer Kutsche, mit Fahrer und Team an Ihrer Seite und Fotostopps, wann immer Licht oder Aussicht danach verlangen.\n\nEin leichter, sanfter Ausflug für alle Altersgruppen.',
    },
    highlights: [
      {
        en: 'Ride in a traditional horse carriage along the beach',
        ar: 'اركب عربة حصان تقليدية على الشاطئ',
        de: 'Fahren Sie in einer traditionellen Pferdekutsche am Strand entlang',
      },
      {
        en: 'The carriage rolls right into the shallow sea',
        ar: 'العربة بتدخل على طول جوه المية الضحلة',
        de: 'Die Kutsche fährt direkt ins flache Meer hinein',
      },
      {
        en: 'Families and groups ride together in one carriage',
        ar: 'العائلات والمجموعات بيركبوا سوا في عربة واحدة',
        de: 'Familien und Gruppen fahren gemeinsam in einer Kutsche',
      },
      {
        en: 'Photo stops along the way',
        ar: 'وقفات تصوير على الطريق',
        de: 'Fotostopps unterwegs',
      },
      {
        en: 'A driver and team with you the whole ride',
        ar: 'سواق وفريق معاك الجولة كلها',
        de: 'Ein Fahrer und Team begleiten Sie die ganze Fahrt',
      },
    ],
    included: [
      {
        en: 'Hotel pickup and drop-off in Hurghada',
        ar: 'الاستلام من فنادق الغردقة والرجوع',
        de: 'Hotelabholung und Rücktransfer in Hurghada',
      },
      {
        en: 'Carriage ride with a driver',
        ar: 'جولة بالعربة مع سواق',
        de: 'Kutschfahrt mit Fahrer',
      },
      {
        en: 'Photo stops along the way',
        ar: 'وقفات تصوير على الطريق',
        de: 'Fotostopps unterwegs',
      },
      {
        en: 'Assistance and supervision throughout',
        ar: 'مساعدة وإشراف طول الجولة',
        de: 'Betreuung und Aufsicht durchgehend',
      },
    ],
    tips: [
      {
        en: 'Pickup outside Hurghada and El Gouna is not included: Sahl Hasheesh and Makadi +€10 per person, Soma Bay and Safaga +€15 per person, payable on site.',
        ar: 'الاستلام خارج الغردقة والجونة غير مشمول: سهل حشيش ومكادي +١٠ يورو للفرد، سوما باي وسفاجا +١٥ يورو للفرد، وتدفع في المكان.',
        de: 'Abholung außerhalb von Hurghada und El Gouna ist nicht inklusive: Sahl Hasheesh und Makadi +10 € pro Person, Soma Bay und Safaga +15 € pro Person, zahlbar vor Ort.',
      },
    ],
    notSuitableFor: [
      { en: 'People with back problems', ar: 'الأشخاص الذين يعانون من مشاكل في الظهر', de: 'Personen mit Rückenproblemen' },
      { en: 'Wheelchair users', ar: 'مستخدمو الكراسي المتحركة', de: 'Rollstuhlfahrer' },
    ],
    meetingPoint: {
      en: 'Coastal Stables, Hurghada South / Hotel Lobby Pickup',
      ar: 'اسطبلات ساحلية في جنوب الغردقة أو الاستلام من بهو الفندق',
      de: 'Küstenstall Hurghada Süd / Hotelabholung',
    },
    whatToBring: [
      { en: 'Hat', ar: 'قبعة', de: 'Hut' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Camera', ar: 'كاميرا', de: 'Kamera' },
    ],
    notAllowed: [
      { en: 'Pets', ar: 'الحيوانات الأليفة', de: 'Haustiere' },
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'The price is per person',
        ar: 'السعر للفرد',
        de: 'Der Preis gilt pro Person',
      },
      {
        en: 'Tell us your hotel and we confirm your exact pickup time after booking',
        ar: 'قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز',
        de: 'Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung',
      },
    ],
    outerTransferEnabled: true,
    freeTransferZones: ['el-gouna'],
    pickup: {
      en: 'Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد',
      de: 'Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Al-Bahr Stables',
    familyFriendly: true,
    womenFriendly: true,
    childPriceEur: 20,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-camel-ride-beach',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
        subtitle: { en: 'Transfer to the beach', ar: 'الانتقال إلى الشاطئ', de: 'Transfer zum Strand' },
      },
      {
        kind: 'stop',
        title: { en: 'Meet your camel', ar: 'التعرف على جملك', de: 'Ihr Kamel kennenlernen' },
        subtitle: { en: 'Led by an experienced camel handler the whole way', ar: 'بقيادة قائد جمال خبير طوال الطريق', de: 'Den ganzen Weg von einem erfahrenen Kamelführer begleitet' },
      },
      {
        kind: 'stop',
        title: { en: 'Camel ride along the beach', ar: 'ركوب الجمل على الشاطئ', de: 'Kamelritt entlang des Strandes' },
        subtitle: { en: 'And the desert edge', ar: 'وعلى حافة الصحراء', de: 'Und am Rand der Wüste' },
      },
      {
        kind: 'stop',
        title: { en: 'Photo stops on the shore', ar: 'وقفات تصوير على الشاطئ', de: 'Fotostopps am Ufer' },
      },
      {
        kind: 'break',
        title: { en: 'Bedouin tea stop', ar: 'وقفة شاي بدوي', de: 'Pause mit Beduinentee' },
      },
      {
        kind: 'end',
        title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
      },
    ],
    name: {
      en: 'Camel Ride in Hurghada: Along the Beach at Golden Hour',
      ar: 'ركوب الجمل في الغردقة: على الشاطئ في الساعة الذهبية',
      de: 'Kamelritt in Hurghada: Am Strand zur goldenen Stunde',
    },
    displayName: { en: 'Camel Ride on the Beach', ar: 'ركوب الجمل على الشاطئ', de: 'Kamelritt am Strand' },
    seoTitle: { en: 'Camel Ride in Hurghada: Beach Ride at Golden Hour & Sunset', de: 'Kamelritt in Hurghada: Strandritt bei Sonnenuntergang & Goldene Stunde' },
    slug: '/trips/camel-ride-hurghada-beach/',
    category: 'desert',
    destination: 'Hurghada',
    images: [
      waslaCamelHeroImg,
      waslaCamel02Img,
      waslaCamel03Img,
      waslaCamel04Img,
      waslaCamel05Img,
      waslaCamel06Img,
    ],
    galleryCaptions: [
      {
        en: 'The camels take a break standing in the sea',
        ar: 'الجمال واخدة راحة وهي واقفة في البحر',
        de: 'Die Kamele pausieren stehend im Meer',
      },
      {
        en: 'Riding out at the desert edge',
        ar: 'ركوب عند حافة الصحرا',
        de: 'Ausritt am Wüstenrand',
      },
      {
        en: 'A smile from the saddle',
        ar: 'ابتسامة من على السرج',
        de: 'Ein Lächeln aus dem Sattel',
      },
      {
        en: 'Pausing on the sand',
        ar: 'وقفة على الرمل',
        de: 'Pause auf dem Sand',
      },
      {
        en: 'The group waves from the desert',
        ar: 'المجموعة بتشاور من الصحرا',
        de: 'Die Gruppe winkt aus der Wüste',
      },
      {
        en: 'Getting to know her camel on the beach',
        ar: 'بتتعرف على جملها على الشاطئ',
        de: 'Sie lernt ihr Kamel am Strand kennen',
      },
    ],
    rating: 0,
    reviewCount: 0,
    duration: {
      en: '1 or 2 hours',
      ar: 'من ساعة لساعتين',
      de: '1 bis 2 Stunden',
    },
    departureTimes: ['08:00 AM (Morning)', '04:00 PM (Sunset)'],
    price: 25,
    options: [
      {
        id: 'opt-camel-1h',
        title: {
          en: 'Camel Ride, 1 Hour',
          ar: 'ركوب جمل، ساعة',
          de: 'Kamelritt, 1 Stunde',
        },
        detail: {
          en: 'A gentle first taste, along the beach',
          ar: 'تجربة أولى هادية على الشاطئ',
          de: 'Ein sanfter erster Eindruck, am Strand entlang',
        },
        price: 25,
      },
      {
        id: 'opt-camel-2h',
        title: {
          en: 'Camel Ride, 2 Hours',
          ar: 'ركوب جمل، ساعتين',
          de: 'Kamelritt, 2 Stunden',
        },
        detail: {
          en: 'More beach, the desert edge and a tea stop',
          ar: 'شاطئ أكتر وحافة الصحرا ووقفة شاي',
          de: 'Mehr Strand, der Wüstenrand und ein Teestopp',
        },
        price: 25,
      },
    ],
    shortDescription: {
      en: 'A slow camel ride along the shore and the desert edge, in the morning or at golden sunset.',
      ar: 'ركوب جمل هادي على شاطئ الغردقة وحافة الصحرا، صباحًا أو مع الغروب، مع وقفات تصوير ووقفة شاي بدوي.',
      de: 'Ein langsamer Kamelritt an der Küste von Hurghada und am Wüstenrand, morgens oder bei Sonnenuntergang, mit Fotostopps und einem Beduinentee-Stopp.',
    },
    fullDescription: {
      en: 'Camels do not hurry, and that is the point. You meet your camel at the shore, climb up as it rises, and set off at the oldest pace in the desert: a slow, swaying walk along the beach and the desert edge behind it.\n\nYou ride in the morning or at sunset, when the light turns golden over the sea. There are photo stops along the way, and a stop for traditional Bedouin tea in a quiet spot.\n\nNo experience is needed, the camels are led by an experienced handler, and groups stay small. Children pay the same price as adults on this ride.',
      ar: 'الجمال مش بتستعجل، ودي هي النقطة. بتقابل جملك على الشاطئ، تطلع عليه وهو بيقوم، وتمشي بأقدم خطوة في الصحرا: مشية هادية متمايلة على الشاطئ وحافة الصحرا وراه.\n\nبتركب صباحًا أو مع الغروب، لما الإضاءة تبقى ذهبية فوق البحر. فيه وقفات تصوير على الطريق، ووقفة لشاي بدوي تقليدي في مكان هادي.\n\nمش محتاج خبرة، الجمال بيتمشى بيها مرشد متمرس، والمجموعات صغيرة. الأطفال بيدفعوا نفس سعر البالغين في الرحلة دي.',
      de: 'Kamele haben es nicht eilig, und genau das ist der Punkt. Sie treffen Ihr Kamel an der Küste, steigen auf, während es sich erhebt, und ziehen im ältesten Tempo der Wüste los: ein langsamer, wiegender Gang am Strand und am Wüstenrand dahinter.\n\nSie reiten morgens oder bei Sonnenuntergang, wenn das Licht über dem Meer golden wird. Unterwegs gibt es Fotostopps und einen Stopp für traditionellen Beduinentee an einem ruhigen Ort.\n\nErfahrung ist nicht nötig, die Kamele werden von einem erfahrenen Führer geleitet, und die Gruppen bleiben klein. Kinder zahlen bei diesem Ritt denselben Preis wie Erwachsene.',
    },
    highlights: [
      {
        en: 'Ride a camel along the beach and the desert edge',
        ar: 'اركب جمل على الشاطئ وحافة الصحرا',
        de: 'Reiten Sie ein Kamel am Strand und am Wüstenrand',
      },
      {
        en: 'Morning or sunset departures, when the light is best',
        ar: 'انطلاق صباحًا أو مع الغروب، لما الإضاءة أحلى',
        de: 'Abfahrt morgens oder bei Sonnenuntergang, wenn das Licht am schönsten ist',
      },
      {
        en: 'Photo stops on the shore along the way',
        ar: 'وقفات تصوير على الشاطئ على الطريق',
        de: 'Fotostopps an der Küste unterwegs',
      },
      {
        en: 'A traditional Bedouin tea stop',
        ar: 'وقفة شاي بدوي تقليدي',
        de: 'Ein Stopp für traditionellen Beduinentee',
      },
      {
        en: 'Led by an experienced camel handler the whole way',
        ar: 'معاك مرشد جمال متمرس الطريق كله',
        de: 'Geführt von einem erfahrenen Kamelführer den ganzen Weg',
      },
    ],
    included: [
      {
        en: 'Hotel pickup and drop-off in Hurghada',
        ar: 'الاستلام من فنادق الغردقة والرجوع',
        de: 'Hotelabholung und Rücktransfer in Hurghada',
      },
      {
        en: 'Experienced camel handler and guide',
        ar: 'مرشد جمال متمرس ودليل',
        de: 'Erfahrener Kamelführer und Guide',
      },
      {
        en: 'Bedouin tea',
        ar: 'شاي بدوي',
        de: 'Beduinentee',
      },
      {
        en: 'Safety assistance and supervision throughout',
        ar: 'مساعدة سلامة وإشراف طول الرحلة',
        de: 'Sicherheitshilfe und Aufsicht durchgehend',
      },
      {
        en: 'Photo stops',
        ar: 'وقفات تصوير',
        de: 'Fotostopps',
      },
    ],
    tips: [
      {
        en: 'Pickup outside Hurghada and El Gouna is not included: Sahl Hasheesh and Makadi +€10 per person, Soma Bay and Safaga +€15 per person, payable on site.',
        ar: 'الاستلام خارج الغردقة والجونة غير مشمول: سهل حشيش ومكادي +١٠ يورو للفرد، سوما باي وسفاجا +١٥ يورو للفرد، وتدفع في المكان.',
        de: 'Abholung außerhalb von Hurghada und El Gouna ist nicht inklusive: Sahl Hasheesh und Makadi +10 € pro Person, Soma Bay und Safaga +15 € pro Person, zahlbar vor Ort.',
      },
      {
        en: 'Children pay the full price on this ride, there is no child rate',
        ar: 'الأطفال بيدفعوا السعر الكامل في الرحلة دي، مفيش سعر أطفال',
        de: 'Kinder zahlen bei diesem Ritt den vollen Preis, es gibt keinen Kindertarif',
      },
    ],
    notSuitableFor: [
      { en: 'Pregnant women', ar: 'النساء الحوامل', de: 'Schwangere Frauen' },
      { en: 'People with back problems', ar: 'الأشخاص الذين يعانون من مشاكل في الظهر', de: 'Personen mit Rückenproblemen' },
      { en: 'Wheelchair users', ar: 'مستخدمو الكراسي المتحركة', de: 'Rollstuhlfahrer' },
    ],
    meetingPoint: {
      en: 'Coastal Stables, Hurghada South / Hotel Lobby Pickup',
      ar: 'اسطبلات ساحلية في جنوب الغردقة أو الاستلام من بهو الفندق',
      de: 'Küstenstall Hurghada Süd / Hotelabholung',
    },
    whatToBring: [
      { en: 'Hat', ar: 'قبعة', de: 'Hut' },
      { en: 'Sunscreen', ar: 'واقي شمس', de: 'Sonnencreme' },
      { en: 'Camera', ar: 'كاميرا', de: 'Kamera' },
      { en: 'Comfortable clothes', ar: 'ملابس مريحة', de: 'Bequeme Kleidung' },
    ],
    notAllowed: [
      { en: 'Pets', ar: 'الحيوانات الأليفة', de: 'Haustiere' },
      { en: 'Alcohol and drugs', ar: 'الكحول والمخدرات', de: 'Alkohol und Drogen' },
    ],
    knowBeforeYouGo: [
      {
        en: 'Small groups of up to 10, no experience needed, the camels are led',
        ar: 'مجموعات صغيرة لحد ١٠ أفراد، من غير خبرة، والجمال بتتمشى بيها',
        de: 'Kleine Gruppen bis zu 10, keine Erfahrung nötig, die Kamele werden geführt',
      },
      {
        en: 'Children pay the full adult price on this ride',
        ar: 'الأطفال بيدفعوا سعر البالغين الكامل في الرحلة دي',
        de: 'Kinder zahlen bei diesem Ritt den vollen Erwachsenenpreis',
      },
      {
        en: 'Tell us your hotel and we confirm your exact pickup time after booking',
        ar: 'قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز',
        de: 'Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung',
      },
    ],
    outerTransferEnabled: true,
    freeTransferZones: ['el-gouna'],
    pickup: {
      en: 'Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد',
      de: 'Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Al-Bahr Stables',
    familyFriendly: true,
    womenFriendly: true,
    childPriceEur: 25,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
    {
    id: 'marsa-alam-samadai-dolphin-house',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Marsa Alam', ar: 'الاستلام من الفندق في مرسى علم', de: 'Hotelabholung in Marsa Alam' },
        subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
      },
      {
        kind: 'stop',
        title: { en: 'Boat trip to Shaab Samadai reef', ar: 'رحلة بالمركب إلى شعاب صمداي', de: 'Bootsfahrt zum Riff Shaab Samadai' },
        subtitle: { en: 'The natural home of wild spinner dolphins', ar: 'الموطن الطبيعي للدلافين الدوّارة البرية', de: 'Die natürliche Heimat wilder Spinnerdelfine' },
      },
      {
        kind: 'stop',
        title: { en: 'First guided snorkelling session', ar: 'أول جلسة سنوركلينج إرشادية', de: 'Erste geführte Schnorchelsession' },
        subtitle: { en: 'Over the coral gardens, full equipment and life jackets provided', ar: 'فوق حدائق المرجان، مع كامل المعدات وسترات النجاة', de: 'Über den Korallengärten, komplette Ausrüstung und Schwimmwesten inklusive' },
      },
      {
        kind: 'break',
        title: { en: 'Buffet lunch on board', ar: 'غداء بوفيه على المركب', de: 'Buffet-Mittagessen an Bord' },
        subtitle: { en: 'With soft drinks', ar: 'مع مشروبات غازية', de: 'Mit Softdrinks' },
      },
      {
        kind: 'stop',
        title: { en: 'Second guided snorkelling session', ar: 'ثاني جلسة سنوركلينج إرشادية', de: 'Zweite geführte Schnorchelsession' },
      },
      {
        kind: 'end',
        title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Dolphin House Adventure from Marsa Alam: Snorkeling with Wild Dolphins at Shaab Samadai',
      ar: 'مغامرة بيت الدلافين من مرسى علم: سنوركلينج مع الدلافين البرية في شعاب صمداي',
      de: 'Dolphin House Abenteuer ab Marsa Alam: Schnorcheln mit wilden Delfinen am Shaab Samadai',
    },
    displayName: { en: 'Samadai Dolphin House', ar: 'بيت دلافين صمداي', de: 'Samadai Delfinhaus' },
    seoTitle: { en: 'Samadai Dolphin House Snorkeling Trip from Marsa Alam', de: 'Samadai Delfinhaus Schnorcheln ab Marsa Alam: Wilde Delfine' },
    slug: '/trips/samadai-dolphin-house-marsa-alam/',
    category: 'sea',
    destination: 'Marsa Alam',
    images: [heroRedSeaVibrantImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '7 hours', ar: '7 ساعات', de: '7 Stunden' },
    departureTimes: ['08:00 AM'],
    price: 68,
    options: [
      {
        id: 'opt-samadai-snorkel',
        title: {
          en: 'Dolphin House Snorkeling Day',
          ar: 'يوم سنوركلينج في بيت الدلافين (صمداي)',
          de: 'Dolphin House Schnorcheltag',
        },
        detail: {
          en: '2 guided snorkelling sessions at Shaab Samadai · buffet lunch & soft drinks',
          ar: 'جلستا سنوركلينج بإرشاد في شعاب صمداي · غداء بوفيه ومشروبات غازية',
          de: '2 geführte Schnorchelgänge am Shaab Samadai · Mittagsbuffet & Softdrinks',
        },
        price: 68,
      },
    ],
    shortDescription: {
      en: 'Sail to Shaab Samadai, the reef where spinner dolphins live, for two guided snorkels over coral gardens.',
      ar: 'رحلة مركب ليوم كامل إلى شعاب صمداي حيث تعيش الدلافين الدوّارة. جلستا سنوركلينج بإرشاد فوق حدائق مرجانية مليئة بالأسماك وأسماك الراي، مع غداء بوفيه ومشروبات غازية على المركب.',
      de: 'Ein ganztägiger Bootsausflug zum Shaab Samadai, dem Riff, in dem Spinnerdelfine leben. Zwei geführte Schnorchelgänge über Korallengärten voller Fische und Rochen, inklusive Mittagsbuffet und Softdrinks an Bord.',
    },
    fullDescription: {
      en: 'Shaab Samadai is a protected reef shaped like a horseshoe, and it is famous for one reason: a resident group of spinner dolphins rests and plays inside it. This trip takes you there from Marsa Alam, with a professional snorkelling guide and two full sessions in the water.\n\nWe collect you from your hotel in Marsa Alam and board the boat for the sail out to the reef. The water over Samadai is warm and clear, and the coral gardens below are busy: clouds of colourful fish, rays gliding over the sand, and, on the days they choose to show themselves, the dolphins moving through their home.\n\nBetween the two snorkelling sessions you relax on deck, eat a freshly prepared buffet lunch and help yourself to refreshments and soft drinks. All snorkelling equipment and life jackets are provided, and the guide is in the water with the group at every stop.\n\nThe dolphins are wild and completely free, and that is exactly what makes meeting them special. They are seen on most trips to this reef, but no honest operator can guarantee them, and the crew never chases or disturbs them.',
      ar: 'شعاب صمداي محمية طبيعية على شكل حدوة حصان، وتشتهر بسبب واحد مميز: وجود مجموعة مقيمة من الدلافين الدوّارة تستريح وتلعب بداخلها. تأخذك هذه الرحلة إليها من مرسى علم مع مرشد سنوركلينج محترف وجلستين كاملتين في الماء.\n\nنستلمك من فندقك في مرسى علم ونصعد على المركب للإبحار إلى الشعاب. المياه فوق صمداي دافئة وصافية، والحدائق المرجانية بالأسفل عامرة بالحياة: أسراب من الأسماك الملونة، وأسماك الراي تنساب فوق الرمل، وفي الأيام التي تختار فيها الظهور، تتحرك الدلافين بحرية داخل موطنها.\n\nبين جلستي السنوركلينج تسترخي على سطح المركب وتتناول غداء بوفيه مُعدًا طازجًا مع المرطبات والمشروبات الغازية. جميع معدات السنوركلينج وسترات النجاة متوفرة، والمرشد يكون مع المجموعة داخل الماء في كل وقفة.\n\nالدلافين برية وحرة تمامًا، وهذا بالضبط ما يجعل لقاءها مميزًا. تُشاهد في معظم الرحلات إلى هذه الشعاب، لكن لا يمكن لأي منظّم صادق ضمان ظهورها، وطاقمنا لا يطاردها أو يزعجها أبدًا.',
      de: 'Shaab Samadai ist ein geschütztes, hufeisenförmiges Riff und aus einem Grund berühmt: Eine ansässige Gruppe von Spinnerdelfinen ruht und spielt darin. Dieser Ausflug bringt Sie ab Marsa Alam mit einem professionellen Schnorchelguide und zwei ausgiebigen Schnorchelgängen dorthin.\n\nWir holen Sie von Ihrem Hotel in Marsa Alam ab und gehen an Bord des Bootes für die Fahrt hinaus zum Riff. Das Wasser über Samadai ist warm und klar, und die Korallengärten darunter sind voller Leben: Schwärme bunter Fische, Rochen, die über den Sand gleiten, und an den Tagen, an denen sie sich zeigen möchten, die Delfine in ihrem natürlichen Zuhause.\n\nZwischen den beiden Schnorchelgängen entspannen Sie an Deck, genießen ein frisch zubereitetes Mittagsbuffet sowie Erfrischungen und Softdrinks. Die komplette Schnorchelausrüstung und Schwimmwesten werden gestellt, und der Guide ist bei jedem Stopp mit der Gruppe im Wasser.\n\nDie Delfine sind wild und völlig frei, und genau das macht eine Begegnung so besonders. Sie werden auf den meisten Fahrten zu diesem Riff gesichtet, aber kein seriöser Veranstalter kann Sichtungen garantieren, und die Crew jagt oder stört die Tiere niemals.',
    },
    highlights: [
      {
        en: 'Hotel pickup in Marsa Alam and boat trip to Shaab Samadai reef',
        ar: 'الاستلام من الفندق في مرسى علم ورحلة مركب إلى شعاب صمداي',
        de: 'Hotelabholung in Marsa Alam und Bootsfahrt zum Riff Shaab Samadai',
      },
      {
        en: 'The chance to watch wild spinner dolphins in their natural home',
        ar: 'فرصة مشاهدة الدلافين الدوّارة البرية في موطنها الطبيعي',
        de: 'Die Chance, wilde Spinnerdelfine in ihrem natürlichen Lebensraum zu beobachten',
      },
      {
        en: 'First guided snorkelling session over the coral gardens',
        ar: 'أول جلسة سنوركلينج بإرشاد فوق الحدائق المرجانية',
        de: 'Erster geführter Schnorchelstopp über den Korallengärten',
      },
      {
        en: 'Buffet lunch and soft drinks on board',
        ar: 'غداء بوفيه ومشروبات غازية على المركب',
        de: 'Mittagsbuffet und Softdrinks an Bord',
      },
      {
        en: 'Second guided snorkelling session at the reef',
        ar: 'ثاني جلسة سنوركلينج بإرشاد في الشعاب المرجانية',
        de: 'Zweiter geführter Schnorchelstopp am Riff',
      },
      {
        en: 'Full snorkelling equipment and life jackets provided',
        ar: 'توفير كامل معدات السنوركلينج وسترات النجاة',
        de: 'Komplette Schnorchelausrüstung und Schwimmwesten inklusive',
      },
      {
        en: 'Led by a professional local snorkelling guide',
        ar: 'بقيادة مرشد سنوركلينج محلي محترف',
        de: 'Geleitet von einem professionellen lokalen Schnorchelguide',
      },
    ],
    included: [
      {
        en: 'Hotel pickup and drop-off in Marsa Alam',
        ar: 'الاستلام والتوصيل من فنادق مرسى علم',
        de: 'Hotelabholung und Rücktransfer in Marsa Alam',
      },
      {
        en: 'Full-day boat trip to Shaab Samadai reef',
        ar: 'رحلة مركب ليوم كامل إلى شعاب صمداي',
        de: 'Ganztägiger Bootsausflug zum Riff Shaab Samadai',
      },
      {
        en: 'Two guided snorkelling sessions, equipment included',
        ar: 'جلستا سنوركلينج بإرشاد مع المعدات',
        de: 'Zwei geführte Schnorchelgänge inklusive Ausrüstung',
      },
      {
        en: 'Professional snorkelling guide',
        ar: 'مرشد سنوركلينج محترف',
        de: 'Professioneller Schnorchelguide',
      },
      {
        en: 'Buffet lunch on board',
        ar: 'غداء بوفيه على المركب',
        de: 'Mittagsbuffet an Bord',
      },
      {
        en: 'Refreshments and soft drinks on board',
        ar: 'مرطبات ومشروبات غازية على المركب',
        de: 'Erfrischungen und Softdrinks an Bord',
      },
      {
        en: 'Life jackets and safety equipment',
        ar: 'سترات نجاة ومعدات سلامة',
        de: 'Schwimmwesten und Sicherheitsausrüstung',
      },
    ],
    tips: [
      {
        en: 'Wetsuit (€10 per person)',
        ar: 'بدلة غوص (10 يورو للفرد)',
        de: 'Neoprenanzug (10 € pro Person)',
      },
      {
        en: 'Transfers from North and South Marsa Alam hotels (available for an extra charge)',
        ar: 'التوصيل من فنادق شمال وجنوب مرسى علم (متاح برسوم إضافية)',
        de: 'Transfers ab Hotels im Norden und Süden von Marsa Alam (gegen Aufpreis)',
      },
      {
        en: 'Photos (provided by a third-party photography service)',
        ar: 'الصور (تقدمها خدمة تصوير مستقلة)',
        de: 'Fotos (durch einen externen Fotoservice)',
      },
      {
        en: 'Tips',
        ar: 'الإكراميات',
        de: 'Trinkgeld',
      },
    ],
    notSuitableFor: [
      {
        en: 'Pregnant women',
        ar: 'السيدات الحوامل',
        de: 'Schwangere Frauen',
      },
      {
        en: 'Wheelchair users',
        ar: 'مستخدمو الكراسي المتحركة',
        de: 'Rollstuhlfahrer',
      },
      {
        en: 'People prone to seasickness',
        ar: 'الأشخاص المعرضون لدوار البحر',
        de: 'Personen, die zu Seekrankheit neigen',
      },
    ],
    whatToBring: [
      {
        en: 'Swimwear and a towel',
        ar: 'ملابس سباحة وفوطة',
        de: 'Badekleidung und ein Handtuch',
      },
      {
        en: 'Sunscreen',
        ar: 'واقي شمس',
        de: 'Sonnencreme',
      },
      {
        en: 'A camera',
        ar: 'كاميرا',
        de: 'Eine Kamera',
      },
    ],
    notAllowed: [
      {
        en: 'Touching marine life',
        ar: 'لمس الكائنات البحرية',
        de: 'Berühren von Meereslebewesen',
      },
      {
        en: 'Alcohol and drugs',
        ar: 'الكحول والمخدرات',
        de: 'Alkohol und Drogen',
      },
    ],
    knowBeforeYouGo: [
      {
        en: 'Please send a passport copy for every participant, and your hotel room number, immediately after booking confirmation. The passport copies are required for the area permits, and the room number lets our pickup cars enter the resort and collect you from inside.',
        ar: 'يرجى إرسال صورة جواز السفر لكل مشارك، ورقم غرفتك بالفندق، فور تأكيد الحجز مباشرة. صور جوازات السفر مطلوبة لتصاريح المنطقة، ورقم الغرفة يسمح لسيارات الاستلام بدخول المنتجع واستلامك من الداخل.',
        de: 'Bitte senden Sie direkt nach der Buchungsbestätigung eine Passkopie für jeden Teilnehmer sowie Ihre Hotelzimmernummer. Die Passkopien sind für die Gebietsgenehmigungen erforderlich, und die Zimmernummer ermöglicht unseren Abholfahrzeugen die Einfahrt ins Resort, um Sie direkt innen abzuholen.',
      },
      {
        en: 'On the Marsa Alam trips, marine park permits are arranged in advance and are not refundable once issued.',
        ar: 'في رحلات مرسى علم، تصاريح المحمية البحرية تُجهَّز مقدمًا ولا تُسترد بعد إصدارها.',
        de: 'Bei den Touren nach Marsa Alam gilt: Genehmigungen für den Meerespark werden im Voraus beschafft und sind nach Ausstellung nicht erstattungsfähig.',
      },
      {
        en: 'While Shaab Samadai is known for its wild dolphins, sightings cannot be guaranteed, as they are in their natural habitat.',
        ar: 'رغم شهرة شعاب صمداي بالدلافين البرية، لا يمكن ضمان رؤيتها لأنها تعيش في بيئتها الطبيعية.',
        de: 'Obwohl Shaab Samadai für seine wilden Delfine bekannt ist, können Sichtungen nicht garantiert werden, da sie in ihrem natürlichen Lebensraum leben.',
      },
      {
        en: 'Basic swimming skills are recommended. Life jackets are available for all participants.',
        ar: 'يُنصح بإجادة أساسيات السباحة، وتتوفر سترات النجاة لجميع المشاركين.',
        de: 'Grundlegende Schwimmkenntnisse werden empfohlen. Schwimmwesten stehen für alle Teilnehmer bereit.',
      },
      {
        en: 'Children must be supervised by an adult at all times.',
        ar: 'يجب أن يكون الأطفال تحت إشراف شخص بالغ طول الوقت.',
        de: 'Kinder müssen jederzeit von einem Erwachsenen beaufsichtigt werden.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Marsa Alam Hotel Pickup',
      ar: 'الاستلام من فنادق مرسى علم',
      de: 'Hotelabholung in Marsa Alam',
    },
    outerTransferEnabled: false,
    pickup: {
      en: 'Marsa Alam hotels included · North and South Marsa Alam hotels available for an extra charge',
      ar: 'فنادق مرسى علم مشمولة · فنادق شمال وجنوب مرسى علم متاحة برسوم إضافية',
      de: 'Hotels in Marsa Alam inklusive · Hotels im Norden und Süden von Marsa Alam gegen Aufpreis',
    },
    supplierName: 'Marsa Alam Sea Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German', 'French', 'Italian'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'marsa-alam-mubarak-turtles',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Pickup in Marsa Alam', ar: 'الاستلام في مرسى علم', de: 'Abholung in Marsa Alam' },
        subtitle: { en: 'Transfer to Marsa Mubarak', ar: 'الانتقال إلى مرسى مبارك', de: 'Transfer nach Marsa Mubarak' },
      },
      {
        kind: 'stop',
        title: { en: 'Snorkelling in the sheltered bay', ar: 'سنوركلينج في الخليج المحمي', de: 'Schnorcheln in der geschützten Bucht' },
        subtitle: { en: 'Calm, sheltered water', ar: 'مياه هادئة ومحمية', de: 'Ruhiges, geschütztes Wasser' },
      },
      {
        kind: 'stop',
        title: { en: 'Sea turtles over the seagrass beds', ar: 'سلاحف بحرية فوق مروج الأعشاب البحرية', de: 'Meeresschildkröten über den Seegraswiesen' },
        subtitle: { en: 'And the chance to spot the rare dugong, the sea cow', ar: 'وفرصة لمشاهدة الأطوم النادر، بقرة البحر', de: 'Und die Chance, das seltene Dugong, die Seekuh, zu sehen' },
      },
      {
        kind: 'break',
        title: { en: 'Freshly prepared lunch on board', ar: 'غداء طازج على المركب', de: 'Frisch zubereitetes Mittagessen an Bord' },
        subtitle: { en: 'With soft drinks', ar: 'مع مشروبات غازية', de: 'Mit Softdrinks' },
      },
      {
        kind: 'stop',
        title: { en: 'Coral reef snorkelling', ar: 'سنوركلينج عند الشعاب المرجانية', de: 'Schnorcheln am Korallenriff' },
        subtitle: { en: 'Vibrant reefs full of colourful fish, or an optional dive with an instructor', ar: 'شعاب نابضة مليئة بالأسماك الملونة، أو غوصة اختيارية مع مدرب', de: 'Lebendige Riffe voller bunter Fische, oder ein optionaler Tauchgang mit einem Instructor' },
      },
      {
        kind: 'end',
        title: { en: 'Transfer back', ar: 'الانتقال عودة', de: 'Rücktransfer' },
      },
    ],
    name: {
      en: 'Marsa Mubarak Snorkeling Trip from Marsa Alam: Sea Turtles and the Dugong Bay',
      ar: 'رحلة سنوركلينج مرسى مبارك من مرسى علم: السلاحف البحرية وخليج الدوجونج',
      de: 'Marsa Mubarak Schnorchelausflug ab Marsa Alam: Meeresschildkröten und Dugong-Bucht',
    },
    displayName: { en: 'Marsa Mubarak: Turtles & Dugong Bay', ar: 'مرسى مبارك: سلاحف وخليج الدوجونج', de: 'Marsa Mubarak: Schildkröten & Dugong' },
    seoTitle: { en: 'Marsa Mubarak Snorkeling from Marsa Alam: Turtles & Dugong', de: 'Marsa Mubarak Schnorcheln ab Marsa Alam: Schildkröten & Dugong' },
    slug: '/trips/marsa-mubarak-marsa-alam/',
    category: 'sea',
    destination: 'Marsa Alam',
    images: [momentGuestImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '8 hours', ar: '8 ساعات', de: '8 Stunden' },
    departureTimes: ['08:00 AM'],
    price: 54,
    options: [
      {
        id: 'opt-mubarak-snorkel',
        title: {
          en: 'Marsa Mubarak Snorkeling Day',
          ar: 'يوم سنوركلينج في مرسى مبارك',
          de: 'Marsa Mubarak Schnorcheltag',
        },
        detail: {
          en: 'Sea turtles & dugong bay · lunch and soft drinks on board · park fees included',
          ar: 'خليج السلاحف البحرية والدوجونج · غداء ومشروبات غازية على المركب · رسوم المحمية مشمولة',
          de: 'Bucht der Meeresschildkröten & Dugongs · Mittagessen & Softdrinks an Bord · Nationalparkgebühren inklusive',
        },
        price: 54,
      },
    ],
    shortDescription: {
      en: 'A calm, clear bay where sea turtles graze the seagrass and a dugong still comes to feed.',
      ar: 'مارس السنوركلينج في خليج مرسى مبارك الهادئ والصافي، موطن السلاحف البحرية الرشيقة وحيوان الدوجونج النادر. شعاب مرجانية، وغداء طازج ومشروبات غازية على المركب، مع إمكانية إضافة غطسة اختيارية لمن يرغب في التعمق أكثر.',
      de: 'Schnorcheln Sie in der ruhigen, klaren Bucht von Marsa Mubarak, Heimat anmutiger Meeresschildkröten und des seltenen Dugongs. Korallenriffe, frisch zubereitetes Mittagessen und Softdrinks an Bord sowie ein optionaler Tauchgang für alle, die tiefer eintauchen möchten.',
    },
    fullDescription: {
      en: 'Marsa Mubarak is one of the most loved bays in the Marsa Alam region, and the reason swims slowly over its seagrass beds: sea turtles graze here every day, and the bay is one of the few places in Egypt where the rare dugong, the sea cow, is regularly seen.\n\nWe pick you up in Marsa Alam and transfer you to the bay, where your snorkelling adventure begins in calm, sheltered, crystal-clear water. That shelter is what makes Mubarak special for everyone: beginners feel safe in the shallows, and experienced snorkellers can spend long, quiet sessions over the coral reefs that ring the bay, alive with colourful fish.\n\nYour professional instructors are in the water with you, pointing out the turtles and the reef life you would otherwise swim past. For guests who want more, an optional diving session with a professional instructor is available on the day.\n\nBetween sessions, relax on board in the sun with a freshly prepared lunch and soft drinks. National park fees are included in your price. Turtles are seen here on the great majority of days and the dugong often, but both are wild animals and sightings can never be guaranteed.',
      ar: 'مرسى مبارك واحد من أحب الخلجان في منطقة مرسى علم، والسبب يسبح ببطء فوق مروج الأعشاب البحرية: السلاحف البحرية ترعى هنا كل يوم، والخليج من الأماكن القليلة في مصر التي يُشاهد فيها حيوان الدوجونج النادر (عروس البحر) بانتظام.\n\nنستلمك من مرسى علم ونوصلك إلى الخليج لتبدأ مغامرة السنوركلينج في مياه هادئة ومحمية وشديدة الصفاء. هذا الهدوء هو ما يجعل مرسى مبارك مثاليًا للجميع: المبتدئون يشعرون بالأمان في المياه الضحلة، وذوو الخبرة يقضون أوقاتًا طويلة وهادئة فوق الشعاب المرجانية المحيطة بالخليج والمليئة بالأسماك الملونة.\n\nيكون مدربوك المحترفون معك في الماء ليدلّوك على السلاحف وتفاصيل الحياة المرجانية التي قد تمر بجوارها دون أن تنتبه لها. وللضيوف الراغبين في المزيد، تتوفر جلسة غوص اختيارية مع مدرب محترف في نفس اليوم.\n\nبين الجلسات تسترخي على المركب تحت الشمس مع غداء مُعد طازجًا ومشروبات غازية. رسوم المحمية الطبيعية مشمولة في السعر. تُشاهد السلاحف هنا في الغالبية العظمى من الأيام ويُشاهد الدوجونج كثيرًا، لكن كليهما من الكائنات البرية ولا يمكن ضمان رؤيتهما أبدًا.',
      de: 'Marsa Mubarak zählt zu den beliebtesten Buchten der Region Marsa Alam, und der Grund dafür schwimmt gemächlich über ihre Seegraswiesen: Meeresschildkröten grasen hier jeden Tag, und die Bucht gehört zu den wenigen Orten in Ägypten, an denen der seltene Dugong, die Seekuh, regelmäßig gesichtet wird.\n\nWir holen Sie in Marsa Alam ab und bringen Sie zur Bucht, wo Ihr Schnorchelabenteuer in ruhigem, geschütztem, kristallklarem Wasser beginnt. Genau dieser Schutz macht Mubarak für alle so besonders: Anfänger fühlen sich im flachen Wasser sicher, und erfahrene Schnorchler genießen lange, ruhige Erkundungen über den Korallenriffen rund um die Bucht voller bunter Fische.\n\nIhre professionellen Guides sind mit Ihnen im Wasser und zeigen Ihnen die Schildkröten sowie das Riffleben, an dem man sonst leicht vorbeischwimmt. Für Gäste, die mehr möchten, ist am selben Tag ein optionaler Tauchgang mit einem professionellen Tauchlehrer möglich.\n\nZwischen den Gängen entspannen Sie an Bord in der Sonne bei einem frisch zubereiteten Mittagessen und Softdrinks. Die Nationalparkgebühren sind im Preis enthalten. Schildkröten werden hier an den allermeisten Tagen gesichtet und der Dugong oft, doch beide sind Wildtiere und Sichtungen können niemals garantiert werden.',
    },
    highlights: [
      {
        en: 'Pickup and transfer from Marsa Alam',
        ar: 'الاستلام والتوصيل من مرسى علم',
        de: 'Abholung und Transfer ab Marsa Alam',
      },
      {
        en: 'Snorkelling in the calm, sheltered water of Marsa Mubarak',
        ar: 'سنوركلينج في مياه مرسى مبارك الهادئة والمحمية',
        de: 'Schnorcheln im ruhigen, geschützten Wasser von Marsa Mubarak',
      },
      {
        en: 'Sea turtles grazing over the seagrass beds',
        ar: 'السلاحف البحرية وهي ترعى فوق مروج الأعشاب البحرية',
        de: 'Meeresschildkröten beim Grasen über den Seegraswiesen',
      },
      {
        en: 'The chance to spot the rare dugong, the sea cow',
        ar: 'فرصة رؤية حيوان الدوجونج النادر (عروس البحر)',
        de: 'Die Chance, den seltenen Dugong, die Seekuh, zu entdecken',
      },
      {
        en: 'Vibrant coral reefs full of colourful fish',
        ar: 'شعاب مرجانية زاهية مليئة بالأسماك الملونة',
        de: 'Farbenprächtige Korallenriffe voller bunter Fische',
      },
      {
        en: 'Freshly prepared lunch and soft drinks on board',
        ar: 'غداء طازج ومشروبات غازية على المركب',
        de: 'Frisch zubereitetes Mittagessen und Softdrinks an Bord',
      },
      {
        en: 'An optional diving session with a professional instructor',
        ar: 'جلسة غوص اختيارية مع مدرب محترف',
        de: 'Optionaler Tauchgang mit einem professionellen Tauchlehrer',
      },
      {
        en: 'Led by professional local snorkelling instructors',
        ar: 'بقيادة مدربي سنوركلينج محليين محترفين',
        de: 'Geleitet von professionellen lokalen Schnorchelguides',
      },
    ],
    included: [
      {
        en: 'Pickup and transfer from Marsa Alam',
        ar: 'الاستلام والتوصيل من مرسى علم',
        de: 'Abholung und Transfer ab Marsa Alam',
      },
      {
        en: 'Snorkelling adventure with professional instructors',
        ar: 'مغامرة سنوركلينج مع مدربين محترفين',
        de: 'Schnorchelabenteuer mit professionellen Guides',
      },
      {
        en: 'Snorkelling equipment (mask, fins, life jacket)',
        ar: 'معدات السنوركلينج (قناع، زعانف، سترة نجاة)',
        de: 'Schnorchelausrüstung (Maske, Flossen, Schwimmweste)',
      },
      {
        en: 'Lunch and soft drinks on board',
        ar: 'غداء ومشروبات غازية على المركب',
        de: 'Mittagessen und Softdrinks an Bord',
      },
      {
        en: 'National park fees',
        ar: 'رسوم المحمية الطبيعية',
        de: 'Nationalparkgebühren',
      },
    ],
    tips: [
      {
        en: 'The optional diving session (arranged and paid on the day)',
        ar: 'جلسة الغوص الاختيارية (تُرتّب وتُدفع في يوم الرحلة)',
        de: 'Der optionale Tauchgang (wird am Tag vor Ort arrangiert und bezahlt)',
      },
      {
        en: 'Transfers from remote areas of Marsa Alam (available for an extra charge)',
        ar: 'التوصيل من المناطق البعيدة في مرسى علم (متاح برسوم إضافية)',
        de: 'Transfers aus entlegenen Gebieten von Marsa Alam (gegen Aufpreis)',
      },
      {
        en: 'Photos (provided by a third-party photography service)',
        ar: 'الصور (تقدمها خدمة تصوير مستقلة)',
        de: 'Fotos (durch einen externen Fotoservice)',
      },
      {
        en: 'Tips and personal expenses',
        ar: 'الإكراميات والمصاريف الشخصية',
        de: 'Trinkgeld und persönliche Ausgaben',
      },
    ],
    notSuitableFor: [
      {
        en: 'Pregnant women',
        ar: 'السيدات الحوامل',
        de: 'Schwangere Frauen',
      },
      {
        en: 'Wheelchair users',
        ar: 'مستخدمو الكراسي المتحركة',
        de: 'Rollstuhlfahrer',
      },
      {
        en: 'People with respiratory issues',
        ar: 'الأشخاص الذين يعانون من مشاكل في الجهاز التنفسي',
        de: 'Personen mit Atemwegsproblemen',
      },
    ],
    whatToBring: [
      {
        en: 'Swimwear and a towel',
        ar: 'ملابس سباحة وفوطة',
        de: 'Badekleidung und ein Handtuch',
      },
      {
        en: 'Sunscreen',
        ar: 'واقي شمس',
        de: 'Sonnencreme',
      },
      {
        en: 'A camera',
        ar: 'كاميرا',
        de: 'Eine Kamera',
      },
      {
        en: 'Cash for any extras on the day',
        ar: 'مبلغ نقدي لأي إضافات في يوم الرحلة',
        de: 'Bargeld für eventuelle Extras vor Ort',
      },
    ],
    notAllowed: [
      {
        en: 'Pets',
        ar: 'الحيوانات الأليفة',
        de: 'Haustiere',
      },
      {
        en: 'Touching marine life',
        ar: 'لمس الكائنات البحرية',
        de: 'Berühren von Meereslebewesen',
      },
      {
        en: 'Alcohol and drugs',
        ar: 'الكحول والمخدرات',
        de: 'Alkohol und Drogen',
      },
    ],
    knowBeforeYouGo: [
      {
        en: 'Please send a passport copy for every participant, and your hotel room number, immediately after booking confirmation. The passport copies are required for the area permits, and the room number lets our pickup cars enter the resort and collect you from inside.',
        ar: 'يرجى إرسال صورة جواز السفر لكل مشارك، ورقم غرفتك بالفندق، فور تأكيد الحجز مباشرة. صور جوازات السفر مطلوبة لتصاريح المنطقة، ورقم الغرفة يسمح لسيارات الاستلام بدخول المنتجع واستلامك من الداخل.',
        de: 'Bitte senden Sie direkt nach der Buchungsbestätigung eine Passkopie für jeden Teilnehmer sowie Ihre Hotelzimmernummer. Die Passkopien sind für die Gebietsgenehmigungen erforderlich, und die Zimmernummer ermöglicht unseren Abholfahrzeugen die Einfahrt ins Resort, um Sie direkt innen abzuholen.',
      },
      {
        en: 'On the Marsa Alam trips, marine park permits are arranged in advance and are not refundable once issued.',
        ar: 'في رحلات مرسى علم، تصاريح المحمية البحرية تُجهَّز مقدمًا ولا تُسترد بعد إصدارها.',
        de: 'Bei den Touren nach Marsa Alam gilt: Genehmigungen für den Meerespark werden im Voraus beschafft und sind nach Ausstellung nicht erstattungsfähig.',
      },
      {
        en: 'Sightings of sea turtles and dugongs are common but cannot be guaranteed, as they are wild animals.',
        ar: 'رؤية السلاحف البحرية والدوجونج شائعة لكنها غير مضمونة لأنها كائنات برية.',
        de: 'Sichtungen von Meeresschildkröten und Dugongs sind häufig, können aber als Wildtiere nicht garantiert werden.',
      },
      {
        en: 'The trip is subject to weather conditions. In case of cancellation, an alternative date or a full refund is offered.',
        ar: 'تخضع الرحلة للأحوال الجوية، وفي حالة الإلغاء يُعرض موعد بديل أو استرداد كامل للمبلغ.',
        de: 'Der Ausflug ist wetterabhängig. Bei einer Absage wird ein Ersatztermin oder eine vollständige Rückerstattung angeboten.',
      },
      {
        en: 'Cash on pickup is how you pay. There is nothing to pay in advance.',
        ar: 'الدفع نقدًا عند الاستلام، ولا يوجد أي مبلغ يُدفع مقدمًا.',
        de: 'Sie zahlen bar bei Abholung. Eine Vorauszahlung ist nicht erforderlich.',
      },
    ],
    meetingPoint: {
      en: 'Marsa Alam Hotel Pickup',
      ar: 'الاستلام من فنادق مرسى علم',
      de: 'Hotelabholung in Marsa Alam',
    },
    outerTransferEnabled: false,
    pickup: {
      en: 'Marsa Alam included · Remote areas of Marsa Alam available for an extra charge',
      ar: 'مرسى علم مشمولة · المناطق البعيدة في مرسى علم متاحة برسوم إضافية',
      de: 'Marsa Alam inklusive · Entlegene Gebiete von Marsa Alam gegen Aufpreis',
    },
    supplierName: 'Marsa Alam Sea Partner',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German', 'French', 'Italian'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-old-town-marina-walk',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Meet your guide in Hurghada', ar: 'مقابلة مرشدك في الغردقة', de: 'Treffen mit Ihrem Guide in Hurghada' },
      },
      {
        kind: 'stop',
        title: { en: 'Hurghada Marina', ar: 'مارينا الغردقة', de: 'Hurghada Marina' },
        subtitle: { en: 'A walk along the promenade', ar: 'تمشية على الكورنيش', de: 'Ein Spaziergang entlang der Promenade' },
      },
      {
        kind: 'stop',
        title: { en: 'El Dahar, the old town', ar: 'الدهار، البلد القديمة', de: 'El Dahar, die Altstadt' },
        subtitle: { en: 'The souq, real local bakeries and markets, zero commission shopping pressure', ar: 'السوق ومخابز وأسواق محلية حقيقية، من غير أي ضغط شراء بعمولات', de: 'Der Souq, echte lokale Bäckereien und Märkte, ganz ohne Kaufdruck' },
      },
      {
        kind: 'stop',
        title: { en: 'The mosque', ar: 'المسجد', de: 'Die Moschee' },
      },
      {
        kind: 'end',
        title: { en: 'End of the walk', ar: 'نهاية الجولة', de: 'Ende des Rundgangs' },
      },
    ],
    name: {
      en: 'Hurghada Marina, El Dahar Souq & Mosque City Tour',
      ar: 'جولة مدينة الغردقة: المارينا وسوق الدهار والمسجد الكبير',
      de: 'Hurghada Stadttour: Marina, El-Dahar-Basar & Moschee',
    },
    displayName: { en: 'Hurghada Old Town & Marina Walk', ar: 'جولة البلد القديمة والمارينا بالغردقة', de: 'Hurghada Altstadt & Marina Rundgang' },
    seoTitle: { en: 'Hurghada City Tour: Marina, El Dahar Souq & Mosque Walk', de: 'Hurghada Stadttour: Marina, Altstadt, Basar & Moscheebesuch' },
    slug: '/trips/hurghada-city-tour-marina/',
    category: 'city',
    destination: 'Hurghada',
    images: [hurghadaMarinaImg, heroCoastImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '3.5 hours', ar: '3.5 ساعات', de: '3,5 Stunden' },
    departureTimes: ['10:00 AM (Morning)', '04:00 PM (Afternoon)'],
    price: 24,
    shortDescription: {
      en: 'An afternoon walk through spice stalls and harbourfront coffee, from the Coptic church to Al Mina Mosque.',
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
        en: 'Zero commission shopping pressure, real local bakeries and markets',
        ar: 'بدون ضغط تسوق، مخابز وأسواق محلية حقيقية',
        de: 'Kein Verkaufsdruck, echte lokale Bäckereien und Märkte',
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
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
        subtitle: { en: 'Early morning, exact time confirmed after booking', ar: 'بدري الصبح، ويتم تأكيد الموعد الدقيق بعد الحجز', de: 'Früh am Morgen, genaue Zeit wird nach Buchung bestätigt' },
      },
      {
        kind: 'stop',
        title: { en: 'The road to Cairo', ar: 'الطريق إلى القاهرة', de: 'Die Fahrt nach Kairo' },
      },
      {
        kind: 'stop',
        title: { en: 'The Giza Pyramids', ar: 'أهرامات الجيزة', de: 'Die Pyramiden von Gizeh' },
        subtitle: { en: 'Guided visit with a dedicated Egyptologist', ar: 'زيارة إرشادية مع عالم مصريات متخصص', de: 'Geführte Besichtigung mit einem spezialisierten Ägyptologen' },
      },
      {
        kind: 'stop',
        title: { en: 'The Sphinx', ar: 'أبو الهول', de: 'Die Sphinx' },
      },
      {
        kind: 'stop',
        title: { en: 'The Grand Egyptian Museum', ar: 'المتحف المصري الكبير', de: 'Das Grand Egyptian Museum' },
      },
      {
        kind: 'end',
        title: { en: 'The road back and hotel drop-off', ar: 'طريق العودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
      },
    ],
    name: {
      en: 'Giza Pyramids, Sphinx & Grand Egyptian Museum',
      ar: 'أهرامات الجيزة وأبو الهول والمتحف المصري الكبير',
      de: 'Pyramiden von Gizeh, Sphinx & Großes Ägyptisches Museum',
    },
    displayName: { en: 'Cairo Day Trip from Hurghada', ar: 'رحلة القاهرة اليومية من الغردقة', de: 'Kairo Tagesausflug ab Hurghada' },
    seoTitle: { en: 'Cairo Day Trip from Hurghada: Giza Pyramids, Sphinx & Museum', de: 'Kairo Tagesausflug ab Hurghada: Pyramiden, Sphinx & Museum' },
    slug: '/trips/cairo-day-trip-hurghada/',
    category: 'historical',
    destination: 'Cairo',
    images: [cairoPyramidsImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '16 hours', ar: '16 ساعة', de: '16 Stunden' },
    departureTimes: ['04:00 AM'],
    price: 115,
    shortDescription: {
      en: "The Pyramids before the crowds build, then the Grand Egyptian Museum's galleries in the cool of midday.",
      ar: 'دخول منظم لهضبة الجيزة وأبو الهول مع جولة في المتحف المصري الكبير وغداء مريح.',
      de: 'Geplanter Einlass am Gizeh-Plateau mit Sphinx, Großem Ägyptischem Museum und Mittagessen.',
    },
    highlights: [
      {
        en: 'Dedicated Egyptologist focused on architecture and daily life',
        ar: 'مرشد أثري متخصص في التاريخ والعمارة الفرعونية',
        de: 'Eigener Ägyptologe mit Fokus auf Geschichte und Architektur',
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
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Pickup at the agreed point', ar: 'الاستلام من النقطة المتفق عليها', de: 'Abholung am vereinbarten Punkt' },
        subtitle: { en: 'Driver details and vehicle plate sent via WhatsApp before pickup', ar: 'بيانات السائق ولوحة العربية تُرسل واتساب قبل الاستلام', de: 'Fahrerdaten und Kennzeichen werden vor der Abholung per WhatsApp gesendet' },
      },
      {
        kind: 'stop',
        title: { en: 'The drive', ar: 'الطريق', de: 'Die Fahrt' },
        subtitle: { en: 'Private air-conditioned vehicle', ar: 'عربية خاصة مكيفة', de: 'Privates, klimatisiertes Fahrzeug' },
      },
      {
        kind: 'end',
        title: { en: 'Drop-off', ar: 'الوصول', de: 'Ankunft' },
        subtitle: { en: 'At the airport or your hotel, as booked', ar: 'في المطار أو فندقك، حسب الحجز', de: 'Am Flughafen oder an Ihrem Hotel, je nach Buchung' },
      },
    ],
    name: {
      en: 'Hurghada Airport & Resort Private Transfers',
      ar: 'توصيلات خاصة من مطار الغردقة إلى مرسى علم والأقصر',
      de: 'Privattransfers: Flughafen Hurghada & Resorts',
    },
    displayName: { en: 'Hurghada Airport Transfer', ar: 'توصيلة مطار الغردقة', de: 'Hurghada Flughafentransfer' },
    seoTitle: { en: 'Hurghada Airport Transfer: Private Resort Pickup & Drop Off', de: 'Hurghada Flughafentransfer: Privater Resort Transfer & Service' },
    slug: '/trips/hurghada-airport-transfer/',
    category: 'transfers',
    destination: 'Hurghada',
    images: [privateVanImg, hurghadaMarinaImg],
    rating: 0,
    reviewCount: 0,
    duration: { en: '30–240 mins', ar: '30–240 دقيقة', de: '30–240 Min.' },
    departureTimes: [],
    timingNote: { en: 'According to flight time', ar: 'حسب ميعاد الطيارة', de: 'Nach Flugzeit' },
    price: 18,
    shortDescription: {
      en: 'Your driver waits at arrivals with a name sign, tracks your flight, and the price is fixed before you land.',
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
    outerTransferEnabled: false,
    pricingMode: 'per-group',
    pickup: { en: 'HRG Airport, Hurghada, El Gouna & Marsa Alam', ar: 'مطار الغردقة، الجونة، مرسى علم', de: 'Flughafen HRG, Hurghada, El Gouna & Marsa Alam' },
    supplierName: 'Wasla Fleet Dispatch',
    familyFriendly: true,
    womenFriendly: true,
    featured: false,
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
    {
    id: 'luxor-sunrise-balloon',
    itinerary: [
      {
        kind: 'pickup',
        title: { en: 'Hotel pickup before dawn', ar: 'الاستلام من الفندق قبل الفجر', de: 'Hotelabholung vor Sonnenaufgang' },
      },
      {
        kind: 'stop',
        title: { en: 'Motorboat crossing of the Nile', ar: 'عبور النيل بمركب بمحرك', de: 'Überfahrt über den Nil per Motorboot' },
        subtitle: { en: 'With warm tea before takeoff', ar: 'مع شاي دافئ قبل الإقلاع', de: 'Mit warmem Tee vor dem Start' },
      },
      {
        kind: 'stop',
        title: { en: 'Balloon takeoff', ar: 'إقلاع البالون', de: 'Ballonstart' },
        subtitle: { en: 'Licensed civil aviation pilot', ar: 'طيار مرخّص من الطيران المدني', de: 'Lizenzierter Pilot der Zivilluftfahrt' },
      },
      {
        kind: 'stop',
        title: { en: 'Sunrise flight over the West Bank', ar: 'طيران وقت الشروق فوق البر الغربي', de: 'Flug bei Sonnenaufgang über dem Westufer' },
      },
      {
        kind: 'end',
        title: { en: 'Landing and transfer back', ar: 'الهبوط والانتقال عودة', de: 'Landung und Rücktransfer' },
      },
    ],
    name: {
      en: 'Luxor Sunrise Hot Air Balloon & West Bank',
      ar: 'منطاد الأقصر عند الشروق والبر الغربي',
      de: 'Luxor Heißluftballon bei Sonnenaufgang & Westufer',
    },
    displayName: { en: 'Luxor Sunrise Balloon', ar: 'منطاد الأقصر عند الشروق', de: 'Luxor Ballonfahrt bei Sonnenaufgang' },
    seoTitle: { en: 'Luxor Balloon Ride from Hurghada: Sunrise over the West Bank', de: 'Luxor Ballonfahrt ab Hurghada: Sonnenaufgang über Westbank' },
    slug: '/trips/luxor-balloon-ride-hurghada/',
    category: 'historical',
    destination: 'Luxor',
    images: [luxorBalloonImg, luxorValleyKingsImg],
    rating: 0,
    reviewCount: 0,
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
      de: 'Ruhige Pferde bei Sonnenaufgang, unsere 7-jährige Tochter fühlte sich rundum sicher.',
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
      en: 'Zero souvenir detours, our small van got us to Karnak right as the golden light hit.',
      ar: 'بدون توقفات تسوق، وصلنا معبد الكرنك مع أول ضوء ذهبي في الصباح.',
      de: 'Keine Verkaufsstopps, unser Kleinbus erreichte Karnak genau zum schönsten Licht.',
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

/** Guest-facing trip name: the short displayName when present, else the full name. */
export function tripDisplayName(trip: Trip, lang: Lang): string {
  return tText(trip.displayName ?? trip.name, lang);
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
