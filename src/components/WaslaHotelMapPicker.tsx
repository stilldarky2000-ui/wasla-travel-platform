import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Building2, Check, Loader2, MapPin, Search, Sparkles, X } from 'lucide-react';
import { Lang } from '../data/i18n';
import {
  DestinationRegion,
  OUTER_TRANSFER_ZONES,
  getZoneTransferFeePerPerson,
  getZoneTransferLabel,
} from '../data/marketplaceData';

const INITIAL_ENV_KEY =
  (typeof process !== 'undefined' &&
    (process.env.GOOGLE_MAPS_PLATFORM_KEY as string | undefined)) ||
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  '';

// Regional coordinates used solely for Places API (New) locationBias (no map rendered)
const REGIONAL_CENTERS: Record<DestinationRegion, { lat: number; lng: number }> = {
  Hurghada: { lat: 27.2579, lng: 33.8116 },
  'Marsa Alam': { lat: 25.0676, lng: 34.879 },
  Luxor: { lat: 25.6872, lng: 32.6396 },
  Cairo: { lat: 30.0444, lng: 31.2357 },
};

export interface CuratedHotelSuggestion {
  name: string;
  area: string;
  destination: DestinationRegion;
  zoneId: string;
}

export const CURATED_EGYPT_HOTELS: CuratedHotelSuggestion[] = [
  // Hurghada Central / Mamsha / Sheraton Road
  { name: 'Steigenberger ALDAU Beach Hotel', area: 'El Mamsha, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Steigenberger Aqua Magic Red Sea', area: 'El Mamsha, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Sunrise Holidays Resort', area: 'Sheraton Road, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Pickalbatros Jungle Aqua Park', area: 'Safaga Road, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Pickalbatros White Beach Resort', area: 'El Mamsha, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Pickalbatros Dana Beach Resort', area: 'Villages Road, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Hurghada Marriott Beach Resort', area: 'El Mamsha, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Titanic Palace & Titanic Beach Spa', area: 'Villages Road, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Rixos Premium Magawish Suites & Villas', area: 'Magawish, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Jaz Aquamarine Resort', area: 'Villages Road, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Desert Rose Resort', area: 'Villages Road, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Sindbad Club Hurghada', area: 'El Mamsha, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },
  { name: 'Hilton Hurghada Plaza', area: 'Dahar Corniche, Hurghada', destination: 'Hurghada', zoneId: 'hurghada' },

  // Sahl Hasheesh
  { name: 'Baron Palace Sahl Hasheesh', area: 'Sahl Hasheesh, Red Sea', destination: 'Hurghada', zoneId: 'sahl-hasheesh' },
  { name: 'Oberoi Beach Resort Sahl Hasheesh', area: 'Sahl Hasheesh, Red Sea', destination: 'Hurghada', zoneId: 'sahl-hasheesh' },
  { name: 'Premier Le Reve Hotel & Spa', area: 'Sahl Hasheesh, Red Sea', destination: 'Hurghada', zoneId: 'sahl-hasheesh' },
  { name: 'Tropitel Sahl Hasheesh', area: 'Sahl Hasheesh, Red Sea', destination: 'Hurghada', zoneId: 'sahl-hasheesh' },
  { name: 'Old Palace Resort Sahl Hasheesh', area: 'Sahl Hasheesh, Red Sea', destination: 'Hurghada', zoneId: 'sahl-hasheesh' },
  { name: 'Kaisol Romance Resort Sahl Hasheesh', area: 'Sahl Hasheesh, Red Sea', destination: 'Hurghada', zoneId: 'sahl-hasheesh' },

  // Makadi Bay
  { name: 'Jaz Makadina Resort', area: 'Madinat Makadi, Makadi Bay', destination: 'Hurghada', zoneId: 'makadi' },
  { name: 'Steigenberger Makadi Hotel', area: 'Madinat Makadi, Makadi Bay', destination: 'Hurghada', zoneId: 'makadi' },
  { name: 'Sunrise Royal Makadi Resort', area: 'Makadi Bay, Red Sea', destination: 'Hurghada', zoneId: 'makadi' },
  { name: 'Xanadu Makadi Bay', area: 'Makadi Bay, Red Sea', destination: 'Hurghada', zoneId: 'makadi' },
  { name: 'Fort Arabesque Resort, Spa & Villas', area: 'Makadi Bay, Red Sea', destination: 'Hurghada', zoneId: 'makadi' },
  { name: 'Cleopatra Luxury Resort Makadi Bay', area: 'Makadi Bay, Red Sea', destination: 'Hurghada', zoneId: 'makadi' },

  // El Gouna
  { name: 'Sheraton Miramar Resort El Gouna', area: 'El Gouna, Red Sea', destination: 'Hurghada', zoneId: 'el-gouna' },
  { name: 'Steigenberger Golf Resort El Gouna', area: 'El Gouna, Red Sea', destination: 'Hurghada', zoneId: 'el-gouna' },
  { name: 'Casa Cook El Gouna', area: 'El Gouna, Red Sea', destination: 'Hurghada', zoneId: 'el-gouna' },
  { name: 'Ancient Sands Golf Resort El Gouna', area: 'El Gouna, Red Sea', destination: 'Hurghada', zoneId: 'el-gouna' },
  { name: 'Three Corners Rihana Resort', area: 'El Gouna, Red Sea', destination: 'Hurghada', zoneId: 'el-gouna' },

  // Soma Bay & Safaga
  { name: 'Kempinski Hotel Soma Bay', area: 'Soma Bay, Red Sea', destination: 'Hurghada', zoneId: 'soma-bay' },
  { name: 'Sheraton Soma Bay Resort', area: 'Soma Bay, Red Sea', destination: 'Hurghada', zoneId: 'soma-bay' },
  { name: 'Cascades Golf Resort & Spa Soma Bay', area: 'Soma Bay, Red Sea', destination: 'Hurghada', zoneId: 'soma-bay' },
  { name: 'Mövenpick Resort Soma Bay', area: 'Soma Bay / Abu Soma', destination: 'Hurghada', zoneId: 'soma-bay' },
  { name: 'Lotus Bay Beach Resort Safaga', area: 'Safaga, Red Sea', destination: 'Hurghada', zoneId: 'safaga' },

  // Marsa Alam
  { name: 'Steigenberger Coraya Beach', area: 'Madinat Coraya, Marsa Alam', destination: 'Marsa Alam', zoneId: 'hurghada' },
  { name: 'Jaz Maraya Resort', area: 'Madinat Coraya, Marsa Alam', destination: 'Marsa Alam', zoneId: 'hurghada' },
  { name: 'Hilton Marsa Alam Nubian Resort', area: 'Abu Dabbab, Marsa Alam', destination: 'Marsa Alam', zoneId: 'hurghada' },
  { name: 'Three Corners Fayrouz Plaza Beach Resort', area: 'Port Ghalib, Marsa Alam', destination: 'Marsa Alam', zoneId: 'hurghada' },

  // Luxor
  { name: 'Sofitel Winter Palace Luxor', area: 'Corniche El Nil, Luxor', destination: 'Luxor', zoneId: 'hurghada' },
  { name: 'Steigenberger Nile Palace Luxor', area: 'East Bank, Luxor', destination: 'Luxor', zoneId: 'hurghada' },
  { name: 'Hilton Luxor Resort & Spa', area: 'Karnak, Luxor', destination: 'Luxor', zoneId: 'hurghada' },
  { name: 'Sonesta St. George Hotel Luxor', area: 'Corniche El Nil, Luxor', destination: 'Luxor', zoneId: 'hurghada' },

  // Cairo
  { name: 'Marriott Mena House Cairo', area: 'Pyramids Road, Giza', destination: 'Cairo', zoneId: 'hurghada' },
  { name: 'Four Seasons Hotel Cairo at Nile Plaza', area: 'Garden City, Cairo', destination: 'Cairo', zoneId: 'hurghada' },
  { name: 'The Nile Ritz-Carlton Cairo', area: 'Downtown Tahrir, Cairo', destination: 'Cairo', zoneId: 'hurghada' },
  { name: 'Kempinski Nile Hotel Cairo', area: 'Garden City, Cairo', destination: 'Cairo', zoneId: 'hurghada' },
];

interface PlaceAddressComponent {
  longText?: string | null;
  shortText?: string | null;
}

interface PlaceInstanceLike {
  displayName?: string | null;
  formattedAddress?: string | null;
  addressComponents?: PlaceAddressComponent[] | null;
  fetchFields: (options: { fields: string[] }) => Promise<{ place: PlaceInstanceLike }>;
}

interface PlacePredictionLike {
  placeId?: string;
  text?: { text?: string };
  mainText?: { text?: string };
  secondaryText?: { text?: string };
  toPlace: () => PlaceInstanceLike;
}

interface AutocompleteSuggestionLike {
  placePrediction?: PlacePredictionLike | null;
}

interface PlacesLibraryLike {
  AutocompleteSessionToken: new () => object;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: {
      input: string;
      sessionToken?: object;
      includedRegionCodes?: string[];
      locationBias?: {
        center: { lat: number; lng: number };
        radius: number;
      };
    }) => Promise<{ suggestions: AutocompleteSuggestionLike[] }>;
  };
}

function isQuotaError(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? `${err.name} ${err.message}`
      : typeof err === 'string'
      ? err
      : JSON.stringify(err ?? '');
  return /RESOURCE_EXHAUSTED|OVER_QUERY_LIMIT|OverQuotaMapError|QuotaExceededError|\b429\b/i.test(
    msg
  );
}

export function detectRedSeaTransferZone(text: string): string {
  const normalized = text.toLowerCase();
  if (
    normalized.includes('kalawy') ||
    normalized.includes('magic life') ||
    normalized.includes('coral sun') ||
    normalized.includes('كلاوي') ||
    normalized.includes('كورال')
  ) {
    return 'kalawy';
  }
  if (
    normalized.includes('el gouna') ||
    normalized.includes('el-gouna') ||
    normalized.includes('elgouna') ||
    normalized.includes('الجونة') ||
    normalized.includes('الجونه')
  ) {
    return 'el-gouna';
  }
  if (
    normalized.includes('sahl hasheesh') ||
    normalized.includes('sahl hashesh') ||
    normalized.includes('سهل حشيش')
  ) {
    return 'sahl-hasheesh';
  }
  if (
    normalized.includes('makadi') ||
    normalized.includes('مكادي') ||
    normalized.includes('مكادى')
  ) {
    return 'makadi';
  }
  if (
    normalized.includes('soma bay') ||
    normalized.includes('abu soma') ||
    normalized.includes('somabay') ||
    normalized.includes('سوما باي') ||
    normalized.includes('أبو سومة')
  ) {
    return 'soma-bay';
  }
  if (normalized.includes('safaga') || normalized.includes('سفاجا')) {
    return 'safaga';
  }
  return 'hurghada';
}

export const WaslaMapsProvider: React.FC<{
  lang: Lang;
  children: React.ReactNode;
}> = ({ lang, children }) => {
  const [apiKey, setApiKey] = useState<string>(INITIAL_ENV_KEY);

  useEffect(() => {
    if (apiKey) return;
    let cancelled = false;
    fetch('/api/maps-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { apiKey?: string } | null) => {
        if (!cancelled && data?.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch(() => {
        // Ignore network errors if offline
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <APIProvider apiKey={apiKey} language={lang} region="EG">
      {children}
    </APIProvider>
  );
};

export interface WaslaHotelMapPickerProps {
  value: string;
  onChange: (hotelValue: string) => void;
  destination: DestinationRegion;
  hasOuterZoneTransfer: boolean;
  transferZoneId: string;
  onAutoDetectTransferZone?: (zoneId: string) => void;
  lang: Lang;
  label: string;
  placeholder: string;
}

export const WaslaHotelMapPicker: React.FC<WaslaHotelMapPickerProps> = ({
  value,
  onChange,
  destination,
  hasOuterZoneTransfer,
  transferZoneId,
  onAutoDetectTransferZone,
  lang,
  label,
  placeholder,
}) => {
  const rawPlacesLib = useMapsLibrary('places');
  const placesLib = rawPlacesLib as unknown as PlacesLibraryLike | null;
  const sessionTokenRef = useRef<object | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [apiSuggestions, setApiSuggestions] = useState<AutocompleteSuggestionLike[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [detectedZoneId, setDetectedZoneId] = useState<string | null>(null);
  const [lastSelectedName, setLastSelectedName] = useState<string>('');

  const regionCenter = REGIONAL_CENTERS[destination] || REGIONAL_CENTERS.Hurghada;

  useEffect(() => {
    setDetectedZoneId(null);
    setLastSelectedName('');
  }, [destination]);

  useEffect(() => {
    const onClickOutside = (ev: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(ev.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setApiSuggestions([]);
  }, []);

  // Filter curated hotels immediately when user opens the tab or types
  const filteredCuratedHotels = useMemo(() => {
    const q = value.trim().toLowerCase();
    const regionalPool = CURATED_EGYPT_HOTELS.filter(
      (h) =>
        h.destination === destination ||
        (hasOuterZoneTransfer && h.destination === 'Hurghada')
    );
    const pool = regionalPool.length > 0 ? regionalPool : CURATED_EGYPT_HOTELS;
    if (!q) {
      return pool.slice(0, 12);
    }
    const matches = pool.filter(
      (h) => h.name.toLowerCase().includes(q) || h.area.toLowerCase().includes(q)
    );
    if (matches.length > 0) return matches.slice(0, 8);
    return CURATED_EGYPT_HOTELS.filter(
      (h) => h.name.toLowerCase().includes(q) || h.area.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [value, destination, hasOuterZoneTransfer]);

  // Fetch Places API (New) Autocomplete suggestions when user types 2+ characters
  useEffect(() => {
    if (!placesLib) return;
    const trimmed = value.trim();
    if (trimmed.length < 2 || (lastSelectedName && trimmed === lastSelectedName)) {
      setApiSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        setIsLoading(true);
        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['eg'],
          locationBias: {
            center: { lat: regionCenter.lat, lng: regionCenter.lng },
            radius: 50000,
          },
        });
        setApiSuggestions(res.suggestions || []);
      } catch (err: unknown) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setApiSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [placesLib, value, regionCenter.lat, regionCenter.lng, lastSelectedName]);

  const handleSelectCurated = useCallback(
    (hotelItem: CuratedHotelSuggestion) => {
      setDropdownOpen(false);
      setLastSelectedName(hotelItem.name);
      onChange(hotelItem.name);
      setDetectedZoneId(hotelItem.zoneId);
      if (hasOuterZoneTransfer && onAutoDetectTransferZone) {
        onAutoDetectTransferZone(hotelItem.zoneId);
      }
      resetSession();
    },
    [onChange, hasOuterZoneTransfer, onAutoDetectTransferZone, resetSession]
  );

  const handleSelectApiSuggestion = useCallback(
    async (suggestion: AutocompleteSuggestionLike) => {
      if (!placesLib || !suggestion.placePrediction) return;
      const fallbackLabel =
        suggestion.placePrediction.mainText?.text ||
        suggestion.placePrediction.text?.text ||
        value;
      setDropdownOpen(false);
      setIsLoading(true);

      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'addressComponents'],
        });

        const displayName = place.displayName || fallbackLabel;
        const formattedAddress = place.formattedAddress || '';
        const componentsText = (place.addressComponents || [])
          .map((c: PlaceAddressComponent) => `${c.longText || ''} ${c.shortText || ''}`)
          .join(' ');
        const combinedSearchText = `${displayName} ${formattedAddress} ${componentsText} ${fallbackLabel}`;
        const detectedZone = detectRedSeaTransferZone(combinedSearchText);

        setLastSelectedName(displayName);
        onChange(displayName);
        setDetectedZoneId(detectedZone);
        if (hasOuterZoneTransfer && onAutoDetectTransferZone) {
          onAutoDetectTransferZone(detectedZone);
        }

        resetSession();
      } catch (err: unknown) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        const detectedZone = detectRedSeaTransferZone(fallbackLabel);
        setLastSelectedName(fallbackLabel);
        onChange(fallbackLabel);
        setDetectedZoneId(detectedZone);
        if (hasOuterZoneTransfer && onAutoDetectTransferZone) {
          onAutoDetectTransferZone(detectedZone);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [placesLib, value, onChange, hasOuterZoneTransfer, onAutoDetectTransferZone, resetSession]
  );

  const activeZoneObj =
    OUTER_TRANSFER_ZONES.find((z) => z.id === (detectedZoneId || transferZoneId)) ||
    OUTER_TRANSFER_ZONES[0];

  const hasDropdownItems = apiSuggestions.length > 0 || filteredCuratedHotels.length > 0;

  return (
    <div ref={containerRef} className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#0F2233] flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
          <span>{label}</span>
        </span>
      </div>

      {/* Smart Hotel Autocomplete Input (No Map) */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute start-3 h-4 w-4 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onFocus={() => setDropdownOpen(true)}
            onChange={(e) => {
              const nextVal = e.target.value;
              onChange(nextVal);
              setDropdownOpen(true);
              if (hasOuterZoneTransfer && onAutoDetectTransferZone) {
                if (nextVal.trim().length > 2) {
                  const manualZone = detectRedSeaTransferZone(nextVal);
                  setDetectedZoneId(manualZone);
                  onAutoDetectTransferZone(manualZone);
                } else if (!nextVal.trim()) {
                  setDetectedZoneId(null);
                  onAutoDetectTransferZone('hurghada');
                }
              }
            }}
            className="min-h-[44px] w-full rounded-lg border border-[#CBD5E1] bg-white ps-9 pe-9 text-sm text-[#0F2233] placeholder:text-[#7B8E95] focus:border-[#EE5426] focus:outline-none"
          />
          {isLoading ? (
            <Loader2
              className="pointer-events-none absolute end-3 h-4 w-4 animate-spin text-[#EE5426]"
              aria-hidden="true"
            />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setDetectedZoneId(null);
                setLastSelectedName('');
                setApiSuggestions([]);
                if (hasOuterZoneTransfer && onAutoDetectTransferZone) {
                  onAutoDetectTransferZone('hurghada');
                }
                setDropdownOpen(true);
              }}
              aria-label="Clear hotel"
              className="absolute end-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F2233] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Instant Hotel Suggestions Dropdown */}
        {dropdownOpen && hasDropdownItems && (
          <ul
            role="listbox"
            className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#FED7AA] bg-white py-1 shadow-xl"
          >
            {/* Live Places API (New) Suggestions */}
            {apiSuggestions.map((s, idx) => {
              const pred = s.placePrediction;
              if (!pred) return null;
              const fullText = pred.text?.text || '';
              const mainText = pred.mainText?.text || fullText;
              const secondaryText = pred.secondaryText?.text || '';
              const previewZone = detectRedSeaTransferZone(fullText);
              const zoneObj = OUTER_TRANSFER_ZONES.find((z) => z.id === previewZone);
              const directionalFee = getZoneTransferFeePerPerson(
                previewZone,
                destination,
                hasOuterZoneTransfer
              );

              return (
                <li
                  key={`api-${pred.placeId || idx}`}
                  role="option"
                  aria-selected={false}
                  onClick={() => void handleSelectApiSuggestion(s)}
                  className="flex items-start justify-between gap-2 px-3 py-2 text-start hover:bg-[#FFF7ED] cursor-pointer transition-colors border-b border-[#F1F5F9] last:border-b-0"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin
                      className="h-4 w-4 text-[#EE5426] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#0F2233] truncate">
                        {mainText}
                      </div>
                      {secondaryText && (
                        <div className="text-[11px] text-[#64748B] truncate">{secondaryText}</div>
                      )}
                    </div>
                  </div>
                  {hasOuterZoneTransfer && zoneObj && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                        directionalFee === 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#FFF7ED] text-[#D9461B] border border-[#FED7AA]'
                      }`}
                    >
                      {directionalFee === 0
                        ? lang === 'ar'
                          ? 'مجاناً 0€'
                          : 'Free €0'
                        : `+€${directionalFee}/pp`}
                    </span>
                  )}
                </li>
              );
            })}

            {/* Curated Popular Red Sea & Egypt Hotels */}
            {filteredCuratedHotels.map((hotelItem) => {
              const zoneObj = OUTER_TRANSFER_ZONES.find((z) => z.id === hotelItem.zoneId);
              const directionalFee = getZoneTransferFeePerPerson(
                hotelItem.zoneId,
                destination,
                hasOuterZoneTransfer
              );
              return (
                <li
                  key={`curated-${hotelItem.name}`}
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSelectCurated(hotelItem)}
                  className="flex items-start justify-between gap-2 px-3 py-2 text-start hover:bg-[#FFF7ED] cursor-pointer transition-colors border-b border-[#F1F5F9] last:border-b-0"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <Building2
                      className="h-4 w-4 text-[#EE5426] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#0F2233] truncate">
                        {hotelItem.name}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate">{hotelItem.area}</div>
                    </div>
                  </div>
                  {hasOuterZoneTransfer && zoneObj && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                        directionalFee === 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#FFF7ED] text-[#D9461B] border border-[#FED7AA]'
                      }`}
                    >
                      {directionalFee === 0
                        ? lang === 'ar'
                          ? 'مجاناً 0€'
                          : 'Free €0'
                        : `+€${directionalFee}/pp`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Auto-Detected Transfer Zone Pill */}
      {detectedZoneId && hasOuterZoneTransfer && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] text-emerald-950">
          <span className="inline-flex items-center gap-1.5 font-medium min-w-0">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {lang === 'ar'
                ? 'تم تحديد منطقة الفندق تلقائياً:'
                : lang === 'de'
                ? 'Hotelzone automatisch erkannt:'
                : 'Hotel pickup zone auto-detected:'}{' '}
              <strong className="font-bold">
                {getZoneTransferLabel(
                  activeZoneObj.id,
                  destination,
                  lang,
                  hasOuterZoneTransfer
                )}
              </strong>
            </span>
          </span>
          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
