// Automatic guest country / nationality detection:
// 1. Recognizes explicit country/nationality words in written text while preserving the exact written script (e.g. "China" -> "China", "أوزبكستان" -> "أوزبكستان").
// 2. Detects from international WhatsApp dialing prefix (+86 -> China, +998 -> Uzbekistan, +49 -> Germany, etc.).
// 3. Falls back quietly to browser IANA timezone when no international dial code is provided.

const COUNTRY_NAME_TOKENS: string[] = [
  // East & Central Asia
  'China', 'Chinese', 'الصين', 'صيني', 'صينية',
  'Uzbekistan', 'Uzbek', 'أوزبكستان', 'اوزبكستان', 'أوزبكي', 'اوزبكي',
  'Kazakhstan', 'Kazakh', 'كازاخستان', 'كازاخي',
  'Kyrgyzstan', 'قيرغيزستان', 'قرغيزستان',
  'Tajikistan', 'طاجيكستان',
  'Turkmenistan', 'تركمانستان',
  'Azerbaijan', 'أذربيجان', 'اذربيجان',
  'Georgia', 'جورجيا',
  'Armenia', 'أرمينيا', 'ارمينيا',
  'Japan', 'Japanese', 'اليابان', 'ياباني',
  'South Korea', 'Korea', 'Korean', 'كوريا', 'كوري',
  'India', 'Indian', 'الهند', 'هندي',
  'Pakistan', 'Pakistani', 'باكستان', 'باكستاني',
  'Indonesia', 'إندونيسيا', 'اندونيسيا',
  'Malaysia', 'ماليزيا',
  'Singapore', 'سنغافورة',
  'Thailand', 'تايلاند',
  'Taiwan', 'تايوان',
  'Hong Kong', 'هونج كونج',
  // Europe
  'Germany', 'German', 'Deutschland', 'ألمانيا', 'المانيا', 'ألماني', 'الماني',
  'United Kingdom', 'Britain', 'British', 'England', 'English', 'Scotland', 'UK', 'بريطانيا', 'بريطاني', 'إنجلترا', 'انجلترا', 'إنجليزي',
  'France', 'French', 'فرنسا', 'فرنسي',
  'Italy', 'Italian', 'Italia', 'إيطاليا', 'ايطاليا', 'إيطالي', 'ايطالي',
  'Spain', 'Spanish', 'España', 'إسبانيا', 'اسبانيا', 'إسباني', 'اسباني',
  'Netherlands', 'Holland', 'Dutch', 'هولندا', 'هولندي',
  'Poland', 'Polish', 'Polska', 'بولندا', 'بولندي',
  'Austria', 'Austrian', 'Österreich', 'النمسا', 'نمساوي',
  'Switzerland', 'Swiss', 'Schweiz', 'Suisse', 'سويسرا', 'سويسري',
  'Belgium', 'Belgian', 'België', 'بلجيكا', 'بلجيكي',
  'Czechia', 'Czech Republic', 'Czech', 'Česko', 'التشيك', 'تشيكي',
  'Slovakia', 'Slovak', 'سلوفاكيا',
  'Sweden', 'Swedish', 'Sverige', 'السويد', 'سويدي',
  'Denmark', 'Danish', 'Danmark', 'الدنمارك', 'دنماركي',
  'Norway', 'Norwegian', 'Norge', 'النرويج', 'نرويجي',
  'Finland', 'Finnish', 'Suomi', 'فنلندا', 'فنلندي',
  'Romania', 'Romanian', 'România', 'رومانيا', 'روماني',
  'Hungary', 'Hungarian', 'المجر', 'هنغاريا', 'مجري',
  'Portugal', 'Portuguese', 'البرتغال', 'برتغالي',
  'Greece', 'Greek', 'اليونان', 'يوناني',
  'Ireland', 'Irish', 'أيرلندا', 'ايرلندا',
  'Bulgaria', 'Bulgarian', 'بلغاريا',
  'Serbia', 'Serbian', 'صربيا',
  'Croatia', 'Croatian', 'كرواتيا',
  'Russia', 'Russian', 'روسيا', 'روسي',
  'Ukraine', 'Ukrainian', 'أوكرانيا', 'اوكرانيا', 'أوكراني',
  'Belarus', 'بيلاروسيا',
  'Moldova', 'مولدوفا',
  'Estonia', 'إستونيا', 'استونيا',
  'Latvia', 'لاتفيا',
  'Lithuania', 'ليتوانيا',
  'Turkey', 'Türkiye', 'Turkish', 'تركيا', 'تركي',
  // Middle East & Africa
  'Egypt', 'Egyptian', 'مصر', 'مصري', 'مصرية',
  'Saudi Arabia', 'Saudi', 'السعودية', 'سعودي',
  'UAE', 'Emirates', 'Emirati', 'Dubai', 'Abu Dhabi', 'الإمارات', 'الامارات', 'إماراتي', 'اماراتي', 'دبي',
  'Kuwait', 'Kuwaiti', 'الكويت', 'كويتي',
  'Qatar', 'Qatari', 'قطر', 'قطري',
  'Bahrain', 'Bahraini', 'البحرين', 'بحريني',
  'Oman', 'Omani', 'عمان', 'عماني',
  'Jordan', 'Jordanian', 'الأردن', 'الاردن', 'أردني',
  'Lebanon', 'Lebanese', 'لبنان', 'لبناني',
  'Palestine', 'Palestinian', 'فلسطين', 'فلسطيني',
  'Iraq', 'Iraqi', 'العراق', 'عراقي',
  'Morocco', 'Moroccan', 'المغرب', 'مغربي',
  'Tunisia', 'Tunisian', 'تونس', 'تونسي',
  'Algeria', 'Algerian', 'الجزائر', 'جزائري',
  'Libya', 'Libyan', 'ليبيا', 'ليبي',
  'Sudan', 'Sudanese', 'السودان', 'سوداني',
  'South Africa', 'جنوب أفريقيا', 'جنوب افريقيا',
  // Americas & Oceania
  'USA', 'America', 'American', 'United States', 'أمريكا', 'امريكا', 'أمريكي', 'امريكي',
  'Canada', 'Canadian', 'كندا', 'كندي',
  'Australia', 'Australian', 'أستراليا', 'استراليا', 'أسترالي',
  'New Zealand', 'نيوزيلندا',
  'Brazil', 'Brazilian', 'البرازيل', 'برازيلي',
  'Argentina', 'Argentine', 'الأرجنتين', 'الارجنتين',
  'Mexico', 'Mexican', 'المكسيك', 'مكسيكي',
];

// Sort longest first so multi-word names like "Saudi Arabia" or "South Korea" match before single words
const SORTED_TOKENS = [...COUNTRY_NAME_TOKENS].sort((a, b) => b.length - a.length);

// Ordered longest prefix first for unambiguous international dial-code lookup
const DIAL_CODE_PREFIXES: Array<[string, string]> = [
  ['998', 'Uzbekistan'],
  ['996', 'Kyrgyzstan'],
  ['995', 'Georgia'],
  ['994', 'Azerbaijan'],
  ['993', 'Turkmenistan'],
  ['992', 'Tajikistan'],
  ['974', 'Qatar'],
  ['973', 'Bahrain'],
  ['972', 'Israel'],
  ['971', 'UAE'],
  ['970', 'Palestine'],
  ['968', 'Oman'],
  ['966', 'Saudi Arabia'],
  ['965', 'Kuwait'],
  ['964', 'Iraq'],
  ['962', 'Jordan'],
  ['961', 'Lebanon'],
  ['886', 'Taiwan'],
  ['852', 'Hong Kong'],
  ['421', 'Slovakia'],
  ['420', 'Czechia'],
  ['385', 'Croatia'],
  ['381', 'Serbia'],
  ['380', 'Ukraine'],
  ['375', 'Belarus'],
  ['374', 'Armenia'],
  ['373', 'Moldova'],
  ['372', 'Estonia'],
  ['371', 'Latvia'],
  ['370', 'Lithuania'],
  ['359', 'Bulgaria'],
  ['358', 'Finland'],
  ['353', 'Ireland'],
  ['351', 'Portugal'],
  ['249', 'Sudan'],
  ['218', 'Libya'],
  ['216', 'Tunisia'],
  ['213', 'Algeria'],
  ['212', 'Morocco'],
  ['98', 'Iran'],
  ['92', 'Pakistan'],
  ['91', 'India'],
  ['90', 'Turkey'],
  ['86', 'China'],
  ['82', 'South Korea'],
  ['81', 'Japan'],
  ['66', 'Thailand'],
  ['65', 'Singapore'],
  ['64', 'New Zealand'],
  ['62', 'Indonesia'],
  ['61', 'Australia'],
  ['60', 'Malaysia'],
  ['55', 'Brazil'],
  ['54', 'Argentina'],
  ['52', 'Mexico'],
  ['49', 'Germany'],
  ['48', 'Poland'],
  ['47', 'Norway'],
  ['46', 'Sweden'],
  ['45', 'Denmark'],
  ['44', 'United Kingdom'],
  ['43', 'Austria'],
  ['41', 'Switzerland'],
  ['40', 'Romania'],
  ['39', 'Italy'],
  ['36', 'Hungary'],
  ['34', 'Spain'],
  ['33', 'France'],
  ['32', 'Belgium'],
  ['31', 'Netherlands'],
  ['30', 'Greece'],
  ['27', 'South Africa'],
  ['20', 'Egypt'],
  ['77', 'Kazakhstan'],
  ['76', 'Kazakhstan'],
  ['7', 'Russia'],
  ['1', 'USA / Canada'],
];

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Africa/Cairo': 'Egypt',
  'Asia/Shanghai': 'China',
  'Asia/Urumqi': 'China',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Taipei': 'Taiwan',
  'Asia/Tashkent': 'Uzbekistan',
  'Asia/Samarkand': 'Uzbekistan',
  'Asia/Almaty': 'Kazakhstan',
  'Asia/Astana': 'Kazakhstan',
  'Asia/Bishkek': 'Kyrgyzstan',
  'Asia/Dushanbe': 'Tajikistan',
  'Asia/Ashgabat': 'Turkmenistan',
  'Asia/Baku': 'Azerbaijan',
  'Asia/Tbilisi': 'Georgia',
  'Asia/Yerevan': 'Armenia',
  'Asia/Dubai': 'UAE',
  'Asia/Riyadh': 'Saudi Arabia',
  'Asia/Kuwait': 'Kuwait',
  'Asia/Qatar': 'Qatar',
  'Asia/Bahrain': 'Bahrain',
  'Asia/Muscat': 'Oman',
  'Asia/Amman': 'Jordan',
  'Asia/Beirut': 'Lebanon',
  'Asia/Tokyo': 'Japan',
  'Asia/Seoul': 'South Korea',
  'Asia/Kolkata': 'India',
  'Asia/Karachi': 'Pakistan',
  'Europe/Berlin': 'Germany',
  'Europe/London': 'United Kingdom',
  'Europe/Paris': 'France',
  'Europe/Rome': 'Italy',
  'Europe/Madrid': 'Spain',
  'Europe/Amsterdam': 'Netherlands',
  'Europe/Warsaw': 'Poland',
  'Europe/Vienna': 'Austria',
  'Europe/Zurich': 'Switzerland',
  'Europe/Brussels': 'Belgium',
  'Europe/Prague': 'Czechia',
  'Europe/Stockholm': 'Sweden',
  'Europe/Copenhagen': 'Denmark',
  'Europe/Oslo': 'Norway',
  'Europe/Helsinki': 'Finland',
  'Europe/Bucharest': 'Romania',
  'Europe/Budapest': 'Hungary',
  'Europe/Lisbon': 'Portugal',
  'Europe/Athens': 'Greece',
  'Europe/Dublin': 'Ireland',
  'Europe/Sofia': 'Bulgaria',
  'Europe/Istanbul': 'Turkey',
  'Europe/Moscow': 'Russia',
  'Europe/Kiev': 'Ukraine',
  'Europe/Kyiv': 'Ukraine',
  'Europe/Minsk': 'Belarus',
  'America/New_York': 'USA',
  'America/Chicago': 'USA',
  'America/Los_Angeles': 'USA',
  'America/Toronto': 'Canada',
  'Australia/Sydney': 'Australia',
  'Australia/Melbourne': 'Australia',
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatMatchedToken(rawMatch: string, canonical: string): string {
  const trimmed = rawMatch.trim();
  // Preserve Arabic / non-Latin scripts exactly as typed (e.g., "أوزبكستان" -> "أوزبكستان")
  if (/[^\u0000-\u007F]/.test(trimmed)) {
    return trimmed;
  }
  // Keep uppercase acronyms like UK, USA, UAE intact
  if (/^(uk|usa|uae)$/i.test(canonical)) {
    return canonical.toUpperCase();
  }
  // Title-case Latin tokens while preserving written spelling (e.g., "china" -> "China", "China" -> "China")
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function detectCountryFromText(text?: string): string {
  const source = (text || '').trim();
  if (!source) return '';

  for (const token of SORTED_TOKENS) {
    const isAscii = /^[\u0000-\u007F]+$/.test(token);
    const pattern = isAscii
      ? new RegExp(`\\b${escapeRegExp(token)}\\b`, 'i')
      : new RegExp(`(?:^|[\\s،,.؛:!?()\\[\\]"'/\\-])${escapeRegExp(token)}(?=$|[\\s،,.؛:!?()\\[\\]"'/\\-])`);
    const match = source.match(pattern);
    if (match) {
      const cleaned = match[0].replace(/^[\s،,.؛:!?()[\]"'/-]+/, '');
      return formatMatchedToken(cleaned || token, token);
    }
  }
  return '';
}

export function detectCountryFromPhone(phone?: string): string {
  const raw = (phone || '').trim();
  if (!raw) return '';

  // Must start with '+' or '00' to safely treat leading digits as an international country code
  const hasIntlPrefix = raw.startsWith('+') || raw.startsWith('00');
  if (!hasIntlPrefix) return '';

  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('00')) {
    digits = digits.replace(/^00+/, '');
  }
  if (!digits) return '';

  for (const [prefix, country] of DIAL_CODE_PREFIXES) {
    if (digits.startsWith(prefix)) {
      return country;
    }
  }
  return '';
}

export function detectCountryFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz];
    }
  } catch {
    // Ignore unsupported Intl environments
  }
  return '';
}

export function detectGuestCountry(params: {
  whatsapp?: string;
  notes?: string;
  existingCountry?: string;
}): string {
  const explicit = (params.existingCountry || '').trim();
  if (explicit && explicit.toLowerCase() !== 'guest') {
    return explicit;
  }

  const fromNotes = detectCountryFromText(params.notes);
  if (fromNotes) return fromNotes;

  const fromPhone = detectCountryFromPhone(params.whatsapp);
  if (fromPhone) return fromPhone;

  const fromTz = detectCountryFromTimezone();
  if (fromTz) return fromTz;

  return 'Guest';
}
