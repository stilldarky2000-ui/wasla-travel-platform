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
  hasOuterZoneTransfer: boolean = true
): number {
  if (!hasOuterZoneTransfer || !zoneId || zoneId === 'hurghada') return 0;

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
        id: 'opt-orange-private',
        title: {
          en: 'Private Speedboat (Whole Boat, Up to 6 Guests · €145 Fixed)',
          ar: 'سبيد بوت خاص (القارب بالكامل حتى 6 أفراد · 145€ سعر ثابت)',
          de: 'Privates Speedboot (Ganzes Boot, bis 6 Personen · 145 € Festpreis)',
        },
        detail: {
          en: '€145 fixed price for the whole boat (not per person), up to 6 guests · flexible departure time & private captain',
          ar: '145€ سعر ثابت للقارب بالكامل وليس للفرد (حتى 6 أفراد) · ميعاد تحرك مرن وقبطان خاص',
          de: '145 € Festpreis für das gesamte Boot (nicht pro Person), bis zu 6 Gäste · flexible Abfahrtszeit & privater Kapitän',
        },
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
        en: 'Pick-up & drop-off outside Hurghada (El Gouna, Sahl Hasheesh, Makadi +€10/pp · Soma Bay, Safaga +€15/pp) is NOT included, please select your hotel zone at checkout.',
        ar: 'التوصيل خارج مدينة الغردقة (الجونة، سهل حشيش، مكادي +10€ للفرد · سوما باي، سفاجا +15€ للفرد) غير مشمول، يرجى تحديد منطقة الفندق عند الحجز.',
        de: 'Abholung außerhalb von Hurghada (El Gouna, Sahl Hasheesh, Makadi +10 €/Pers. · Soma Bay, Safaga +15 €/Pers.) ist nicht inklusive, bitte wählen Sie Ihre Hotelzone beim Buchen.',
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
      en: "Ancient Thebes in a Day: Karnak, the Valley of the Kings and Hatshepsut's Temple, from Hurghada",
      ar: 'طيبة القديمة في يوم واحد: الكرنك ووادي الملوك ومعبد حتشبسوت من الغردقة',
      de: 'Das antike Theben an einem Tag: Karnak, Tal der Könige und Hatschepsut-Tempel ab Hurghada',
    },
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
    rating: 4.9,
    reviewCount: 49,
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
      en: "From Hurghada across the desert to ancient Thebes: Karnak Temple, an optional Nile boat crossing, the Colossi of Memnon, three royal tombs in the Valley of the Kings, and Queen Hatshepsut's Temple with a licensed Egyptologist.",
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
    name: {
      en: 'Eastern Desert Quad, Buggy & Bedouin Tea at Dusk',
      ar: 'سفاري الصحراء الشرقية بالكواد وشاي بدوي عند الغروب',
      de: 'Wüstensafari mit Quad, Buggy & Beduinentee',
    },
    category: 'desert',
    destination: 'Hurghada',
    images: [desertSunsetImg],
    rating: 4.8,
    reviewCount: 53,
    duration: { en: '3 or 7 hours', ar: '3 أو 7 ساعات', de: '3 oder 7 Stunden' },
    departureTimes: ['09:00 AM (Morning)', '02:30 PM (Sunset)'],
    price: 32,
    options: [
      {
        id: 'opt-safari-quad',
        title: {
          en: 'Single Quad Safari (3 Hours · No Meals)',
          ar: 'سفاري كواد فردي (3 ساعات · بدون وجبات)',
          de: 'Einzel-Quad-Safari (3 Stunden · ohne Mahlzeiten)',
        },
        detail: {
          en: '3-hour guided quad ride · 1 rider per quad · Bedouin village, Bedouin tea & camel ride · no meals included',
          ar: 'جولة كواد موجّهة لمدة 3 ساعات · راكب واحد لكل كواد · قرية بدوية وشاي بدوي وركوب جمال · لا تشمل وجبات',
          de: '3-stündige geführte Quad-Tour · 1 Fahrer pro Quad · Beduinendorf, Beduinentee & Kamelritt · keine Mahlzeiten inklusive',
        },
        price: 32,
      },
      {
        id: 'opt-safari-buggy',
        title: {
          en: 'Super Safari (7 Hours · Dinner Included)',
          ar: 'سوبر سفاري (7 ساعات · شامل العشاء)',
          de: 'Super Safari (7 Stunden · inkl. Abendessen)',
        },
        detail: {
          en: 'Full 7-hour Super Safari · quad & 2-seat family buggy · camel ride, Bedouin village & BBQ dinner included',
          ar: 'سوبر سفاري كامل لمدة 7 ساعات · كواد وباجي عائلي لشخصين · ركوب جمال وقرية بدوية وعشاء مشويات مشمول',
          de: 'Volle 7-stündige Super Safari · Quad & 2-Sitzer Familien-Buggy · Kamelritt, Beduinendorf & BBQ-Abendessen inklusive',
        },
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
        en: 'Guided pace matched to your group, never a rushed convoy',
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
      {
        en: 'Quad/buggy, helmet, safety briefing & Bedouin tea (BBQ dinner included with Super Safari option only)',
        ar: 'الكواد أو الباجي والخوذة وشرح الأمان والشاي البدوي (عشاء المشويات مشمول في خيار السوبر سفاري فقط)',
        de: 'Quad/Buggy, Helm, Sicherheitseinweisung & Beduinentee (BBQ-Abendessen nur bei der Option Super Safari inklusive)',
      },
    ],
    tips: [
      {
        en: 'Pick-up & drop-off outside Hurghada (El Gouna, Sahl Hasheesh, Makadi +€10/pp · Soma Bay, Safaga +€15/pp) is NOT included, please select your zone at checkout.',
        ar: 'التوصيل خارج الغردقة (الجونة، سهل حشيش، مكادي +10€ للفرد · سوما باي، سفاجا +15€ للفرد) رسوم إضافية، اختر منطقتك عند الحجز.',
        de: 'Abholung außerhalb von Hurghada (+10–15 €/Pers.) ist ein Zusatzoption, bitte Zone beim Buchen wählen.',
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
      en: 'Hurghada Horse Riding: Beach or Desert, with a Swim Stop',
      ar: 'ركوب الخيل في الغردقة: شاطئ أو صحراء مع وقفة سباحة',
      de: 'Ausritt in Hurghada: Strand oder Wüste, mit Badestopp',
    },
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
    price: 40,
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
        price: 40,
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
        price: 60,
      },
    ],
    shortDescription: {
      en: 'A real guided ride along the Red Sea shore or through the desert, on a horse matched to your level, with a swim stop on the longer ride.',
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
    pickup: {
      en: 'Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد',
      de: 'Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Al-Bahr Stables',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 5,
    featured: true,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-horse-photoshoot-session',
    name: {
      en: 'Horse Photoshoot Session in Hurghada: Beach and Sea Shots',
      ar: 'سيشن تصوير على الحصان في الغردقة: لقطات الشاطئ والبحر',
      de: 'Pferde-Fotoshooting in Hurghada: Strand- und Meerbilder',
    },
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
      en: 'A guided photoshoot on horseback at the beach and in the sea shallows, shot on phone with directed poses at the spots that photograph best.',
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
    pickup: {
      en: 'Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد',
      de: 'Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Al-Bahr Stables',
    familyFriendly: true,
    womenFriendly: true,
    minChildAge: 5,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-flying-dress-photoshoot',
    name: {
      en: 'Flying Dress Photoshoot with Horses in Hurghada',
      ar: 'سيشن الفستان الطائر مع الخيل في الغردقة',
      de: 'Flying-Dress-Fotoshooting mit Pferden in Hurghada',
    },
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
      en: 'A professional flying dress shoot on a prepared horse at two locations, with a professional camera, professional editing and 22 finished photos.',
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
    familyFriendly: false,
    womenFriendly: true,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-horse-carriage-sea-ride',
    name: {
      en: 'Horse Carriage Ride in Hurghada: Along the Beach and Into the Sea',
      ar: 'جولة بعربة الحصان في الغردقة: على الشاطئ وجوه المية',
      de: 'Kutschfahrt in Hurghada: Am Strand entlang und ins Meer',
    },
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
      en: '2 or 3 hours',
      ar: 'ساعتين أو ٣ ساعات',
      de: '2 oder 3 Stunden',
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
          en: 'Per person, children ride free with a paying adult',
          ar: 'للفرد، والأطفال مجانًا مع بالغ دافع',
          de: 'Pro Person, Kinder fahren kostenlos mit einem zahlenden Erwachsenen',
        },
        price: 20,
      },
      {
        id: 'opt-carriage-3h',
        title: {
          en: 'Carriage Ride, 3 Hours',
          ar: 'جولة بالعربة، ٣ ساعات',
          de: 'Kutschfahrt, 3 Stunden',
        },
        detail: {
          en: 'The longer ride, more beach and more photo stops, same price',
          ar: 'الجولة الأطول، شاطئ أكتر ووقفات تصوير أكتر، بنفس السعر',
          de: 'Die längere Fahrt, mehr Strand und mehr Fotostopps, gleicher Preis',
        },
        price: 20,
      },
    ],
    shortDescription: {
      en: 'A relaxed horse carriage ride along the Hurghada beach, and right into the shallow sea, with your family together in one carriage.',
      ar: 'جولة هادية بعربة حصان على شاطئ الغردقة، ودخول بالعربة جوه المية الضحلة، وعيلتك سوا في عربة واحدة.',
      de: 'Eine entspannte Kutschfahrt am Strand von Hurghada entlang, und direkt ins flache Meer hinein, mit Ihrer Familie gemeinsam in einer Kutsche.',
    },
    fullDescription: {
      en: 'Some Hurghada experiences are about speed. This one is about slowing down. Your carriage rolls along the beach at a walking pace, and then does the thing guests remember most: it rolls straight into the shallow sea, horses and wheels in the water, while you sit back and take it in.\n\nFamilies and groups ride together in one carriage, with a driver and team with you the whole way and photo stops whenever the light or the view asks for one.\n\nIt is an easy, gentle outing for all ages, and children ride free with a paying adult.',
      ar: 'فيه تجارب في الغردقة عن السرعة، ودي عن الهدوء. عربتك بتمشي على الشاطئ بخطوة هادية، وبعدين بتعمل الحاجة اللي الضيوف بيفتكروها أكتر حاجة: بتدخل على طول جوه المية الضحلة، الخيل والعجل في المية، وانت قاعد مسترخي وبتتفرج.\n\nالعائلات والمجموعات بيركبوا سوا في عربة واحدة، مع سواق وفريق معاك الطريق كله ووقفات تصوير كل ما الإضاءة أو المنظر يطلب.\n\nخروجة سهلة وهادية لكل الأعمار، والأطفال بيركبوا مجانًا مع بالغ دافع.',
      de: 'Manche Erlebnisse in Hurghada drehen sich um Tempo. Dieses dreht sich ums Entschleunigen. Ihre Kutsche rollt im Schritt am Strand entlang und tut dann das, woran sich Gäste am meisten erinnern: Sie fährt direkt ins flache Meer hinein, Pferde und Räder im Wasser, während Sie sich zurücklehnen und genießen.\n\nFamilien und Gruppen fahren gemeinsam in einer Kutsche, mit Fahrer und Team an Ihrer Seite und Fotostopps, wann immer Licht oder Aussicht danach verlangen.\n\nEin leichter, sanfter Ausflug für alle Altersgruppen, und Kinder fahren kostenlos mit einem zahlenden Erwachsenen.',
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
        en: 'The price is per person, and children ride free with a paying adult',
        ar: 'السعر للفرد، والأطفال بيركبوا مجانًا مع بالغ دافع',
        de: 'Der Preis gilt pro Person, und Kinder fahren kostenlos mit einem zahlenden Erwachsenen',
      },
      {
        en: 'Tell us your hotel and we confirm your exact pickup time after booking',
        ar: 'قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز',
        de: 'Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung',
      },
    ],
    outerTransferEnabled: true,
    pickup: {
      en: 'Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp',
      ar: 'الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد',
      de: 'Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.',
    },
    supplierName: 'Al-Bahr Stables',
    familyFriendly: true,
    womenFriendly: true,
    kidsDiscount: {
      en: 'Children ride free with a paying adult',
      ar: 'الأطفال بيركبوا مجانًا مع بالغ دافع',
      de: 'Kinder fahren kostenlos mit einem zahlenden Erwachsenen',
    },
    childPriceEur: 0,
    featured: false,
    languages: ['English', 'German'],
    operatingDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'hurghada-camel-ride-beach',
    name: {
      en: 'Camel Ride in Hurghada: Along the Beach at Golden Hour',
      ar: 'ركوب الجمل في الغردقة: على الشاطئ في الساعة الذهبية',
      de: 'Kamelritt in Hurghada: Am Strand zur goldenen Stunde',
    },
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
      en: '1 to 3 hours',
      ar: 'من ساعة لتلات ساعات',
      de: '1 bis 3 Stunden',
    },
    departureTimes: ['08:00 AM (Morning)', '04:00 PM (Sunset)'],
    price: 20,
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
        price: 20,
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
        price: 20,
      },
      {
        id: 'opt-camel-3h',
        title: {
          en: 'Camel Ride, 3 Hours',
          ar: 'ركوب جمل، ٣ ساعات',
          de: 'Kamelritt, 3 Stunden',
        },
        detail: {
          en: 'The full slow ride, morning or sunset',
          ar: 'الركوب الهادي الكامل، صباحًا أو مع الغروب',
          de: 'Der volle langsame Ritt, morgens oder bei Sonnenuntergang',
        },
        price: 20,
      },
    ],
    shortDescription: {
      en: 'A slow camel ride along the Hurghada shore and the desert edge, in the morning or at sunset, with photo stops and a Bedouin tea stop.',
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
      en: 'Sandy-entry bay famous for resident green sea turtles and gentle seagrass meadows, zero boat required.',
      ar: 'خليج رملي شهير بالسلاحف البحرية الخضراء والشعاب المرجانية الهادئة بدون الحاجة لقارب.',
      de: 'Sandige Bucht bekannt für Meeresschildkröten und bunte Riffe, direkter Strandeinstieg ohne Boot.',
    },
    highlights: [
      {
        en: 'Walk straight in from soft sand, ideal for gentle swimmers',
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
    name: {
      en: 'Giza Pyramids, Sphinx & Grand Egyptian Museum',
      ar: 'أهرامات الجيزة وأبو الهول والمتحف المصري الكبير',
      de: 'Pyramiden von Gizeh, Sphinx & Großes Ägyptisches Museum',
    },
    category: 'historical',
    destination: 'Cairo',
    images: [cairoPyramidsImg],
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
    languages: ['English', 'German', 'French', 'Russian'],
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
    languages: ['English', 'German', 'French', 'Dutch', 'Spanish', 'Italian', 'Polish'],
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
