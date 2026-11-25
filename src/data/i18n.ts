import { EU_TRANSLATIONS, LANGUAGE_OPTIONS } from './euLocales';
import { GLOBAL_TRANSLATIONS } from './globalLocales';

export type Lang =
  | 'en'
  | 'ar'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'cs'
  | 'sv'
  | 'ro'
  | 'ru'
  | 'uk'
  | 'tr'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'no'
  | 'da'
  | 'fi'
  | 'hu'
  | 'el'
  | 'hi';

export { LANGUAGE_OPTIONS };
export type { LanguageOption, LanguageRegion } from './euLocales';

export interface Translations {
  brandName: string;
  navTopActivities: string;
  navHurghada: string;
  navCairoLuxor: string;
  navAllTrips: string;
  askWhatsapp: string;
  deskCount: string;

  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroLede: string;
  searchDestinationLabel: string;
  searchActivityLabel: string;
  searchDateLabel: string;
  searchAllDestinations: string;
  searchAllActivities: string;
  searchButton: string;

  sectionTopActivities: string;
  sectionTopActivitiesSub: string;
  viewTrip: string;
  fromPrice: string;
  perPerson: string;

  sectionAllActivities: string;
  sectionAllActivitiesSub: string;
  tripsCountSingle: string;
  tripsCountPlural: string;
  scrollToSectionHint: string;

  sectionHurghadaMarsa: string;
  sectionHurghadaMarsaSub: string;
  sectionCairoLuxor: string;
  sectionCairoLuxorSub: string;

  sectionAllTrips: string;
  sectionAllTripsSub: string;
  bookNow: string;
  bookNowMicrocopy?: string;
  familyFriendly: string;
  womenFriendly: string;
  minChildAge: string;
  kidsDiscount: string;
  allTripsListHeading: string;

  sectionMoments: string;
  sectionMomentsSub: string;
  momentViewTrip: string;
  momentPrev: string;
  momentNext: string;
  momentClose: string;

  sectionWhyBook: string;
  whyItems: {
    family: { title: string; desc: string };
    women: { title: string; desc: string };
    pay: { title: string; desc: string };
    cancel: { title: string; desc: string };
    whatsapp: { title: string; desc: string };
  };

  topLinksColumns: {
    attractions: string;
    destinations: string;
    thingsToDo: string;
    topTrips: string;
  };

  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterSub: string;
  newsletterPlaceholder: string;
  newsletterButton: string;
  newsletterSuccess: string;

  footerRights: string;
  footerWhatsapp: string;
  footerLanguages: string;

  modalClose: string;
  modalWhatStandsOut: string;
  modalIncluded: string;
  modalChildPolicy: string;
  modalWholeEuro: string;
  modalPerAdult: string;
  modalPayAfter: string;
  modalDateLabel: string;
  modalAdults: string;
  modalChildren: string;
  modalHotelLabel: string;
  modalHotelPlaceholder: string;
  modalNameLabel: string;
  modalContactLabel: string;
  modalWhatsappLabel: string;
  modalWhatsappPlaceholder: string;
  modalEmailLabel: string;
  modalEmailPlaceholder: string;
  modalPickupDispatchNote: string;
  modalNotesLabel: string;
  modalNotesPlaceholder: string;
  modalEstTotal: string;
  modalSubmitBooking: string;
  modalNoBotNote: string;
  modalValidationErr: string;
  modalConfirmedBadge: string;
  modalConfirmedTitle: string;
  modalBackToTrips: string;
  modalNewRequest: string;

  quickJumpHurghada: string;
  quickJumpMarsa: string;
  quickJumpLuxor: string;
  quickJumpCairo: string;
  quickJumpTransfers: string;
  quickJumpShopping: string;
  quickJumpGuides: string;
  quickJumpCityTour: string;
  quickJumpCustom: string;
  mobileBarExplore: string;
  mobileBarWhatsapp: string;
  footerPolicies: string;
  footerBlog: string;
  previewTouristBtn: string;
  modalOptionsLabel: string;
  optionsCountSuffix: string;
  openWhatsappNow: string;
  staffPortalLogin: string;

  footerAddonEyebrow: string;
  footerAddonTitle: string;
  footerPhotoTitle: string;
  footerPhotoDesc: string;
  footerGuideTitle: string;
  footerGuideDesc: string;
  footerAddonCta: string;

  modalHighlightsTitle: string;
  modalItineraryTitle?: string;
  modalDescriptionTitle: string;
  modalIncludesTitle: string;
  modalTipsTitle: string;
  modalSomethingToKnowTitle: string;
  modalNotSuitableTitle: string;
  modalMeetingPointTitle: string;
  modalOpenGoogleMaps: string;
  modalWhatToBringTitle: string;
  modalNotAllowedTitle: string;
  modalKnowBeforeYouGoTitle: string;
  modalSeeMore: string;
  modalSeeLess: string;
  modalTransferZoneLabel: string;
  modalTransferZoneNotice: string;
  modalTransferIncluded: string;
}

const BASE_I18N: Record<'en' | 'ar' | 'de', Translations> = {
  en: {
    brandName: 'Wasla Travel',
    navTopActivities: 'Top Trips',
    navHurghada: 'Hurghada',
    navCairoLuxor: 'Cairo & Luxor',
    navAllTrips: 'All Trips',
    askWhatsapp: 'Ask WhatsApp',
    deskCount: 'Desk',

    heroEyebrow: 'Hurghada · Marsa Alam · Cairo · Luxor',
    heroTitleLine1: 'Hurghada excursions in small groups,',
    heroTitleLine2: 'booked without the guesswork.',
    heroLede:
      'Boat trips, desert safaris and Luxor days with hand-picked local operators, confirmed personally by the owner. Nothing to pay today; you pay cash when we pick you up.',
    searchDestinationLabel: 'Destination',
    searchActivityLabel: 'Activity',
    searchDateLabel: 'Date',
    searchAllDestinations: 'All destinations',
    searchAllActivities: 'All activities',
    searchButton: 'Search',

    sectionTopActivities: 'Top activities',
    sectionTopActivitiesSub: 'Hand-picked small-group experiences across Hurghada, Marsa Alam, Luxor, and Cairo.',
    viewTrip: 'View trip',
    fromPrice: 'from',
    perPerson: 'per person',

    sectionAllActivities: 'All activities and adventures',
    sectionAllActivitiesSub: 'Choose an activity style to jump directly to the matching destination collection.',
    tripsCountSingle: 'trip',
    tripsCountPlural: 'trips',
    scrollToSectionHint: 'View section',

    sectionHurghadaMarsa: 'Hurghada and Marsa Alam',
    sectionHurghadaMarsaSub: 'Island sails, reef snorkelling, desert trails, coastal stables, city tours and transfers.',
    sectionCairoLuxor: 'Cairo and Luxor',
    sectionCairoLuxorSub: 'Small-van temple days, Giza Plateau tours, and reliable private transfers.',

    sectionAllTrips: 'All trips',
    sectionAllTripsSub: 'Browse every itinerary side by side and inspect images, ratings, and family options before booking.',
    bookNow: 'Reserve your spot',
    bookNowMicrocopy: 'Nothing to pay today. Cash on pickup.',
    familyFriendly: 'Family friendly',
    womenFriendly: 'Women friendly',
    minChildAge: 'Min child age',
    kidsDiscount: 'Kids discount',
    allTripsListHeading: 'Choose a trip',

    sectionMoments: 'Unforgettable moments',
    sectionMomentsSub: 'Real snapshots shared by travelers after their Red Sea and Nile days.',
    momentViewTrip: 'Open this trip',
    momentPrev: 'Previous moment',
    momentNext: 'Next moment',
    momentClose: 'Close popup',

    sectionWhyBook: 'Why book with us',
    whyItems: {
      family: {
        title: 'Family friendly',
        desc: 'Clear minimum child ages, calm boat stops, and family-paced guides.',
      },
      women: {
        title: 'Women friendly and supported',
        desc: 'Vetted operators, clear pickup tracking, and responsive daytime support.',
      },
      pay: {
        title: 'Pay in cash on pickup',
        desc: "Cash on pickup is the standard, if you'd rather pay in advance, just ask us and we'll send you a payment link.",
      },
      cancel: {
        title: 'Free cancellation up to 24 hours before the trip',
        desc: 'Cancellations within 24 hours of the start time are charged at the full trip price.',
      },
      whatsapp: {
        title: 'WhatsApp support',
        desc: 'Direct human answers on pickup windows, swim conditions, and ages.',
      },
    },

    topLinksColumns: {
      attractions: 'Top Attractions in Hurghada',
      destinations: 'Destinations',
      thingsToDo: 'Things to Do',
      topTrips: 'Top Trips',
    },

    newsletterEyebrow: 'Newsletter',
    newsletterTitle: 'Get the good trips first',
    newsletterSub: 'One short email when new seasonal trips open. No spam, unsubscribe any time.',
    newsletterPlaceholder: 'you@example.com',
    newsletterButton: 'Subscribe',
    newsletterSuccess: 'Subscribed, we saved your email for seasonal Hurghada updates.',

    footerRights: '© 2026 Wasla Travel · Hurghada, Egypt',
    footerWhatsapp: 'WhatsApp',
    footerLanguages: 'Language',

    modalClose: 'Close',
    modalWhatStandsOut: 'What stands out',
    modalIncluded: 'Included in whole euros',
    modalChildPolicy: 'Family & women support',
    modalWholeEuro: 'Whole-euro price',
    modalPerAdult: 'per adult',
    modalPayAfter: 'Pay in cash on pickup',
    modalDateLabel: 'Preferred trip date',
    modalAdults: 'Adults',
    modalChildren: 'Children',
    modalHotelLabel: 'Hotel or pickup location',
    modalHotelPlaceholder: 'e.g. Steigenberger Al Dau, Marsa Alam, Cairo Zamalek',
    modalNameLabel: 'Full name',
    modalContactLabel: 'WhatsApp number',
    modalWhatsappLabel: 'WhatsApp number',
    modalWhatsappPlaceholder: '+49 170 5542190',
    modalEmailLabel: 'Email address',
    modalEmailPlaceholder: 'you@example.com',
    modalPickupDispatchNote: 'Exact pickup time & driver details will be sent to both your Email and WhatsApp.',
    modalNotesLabel: 'Notes (children’s ages, preferences)',
    modalNotesPlaceholder: 'Optional, e.g. 7-year-old beginner swimmer',
    modalEstTotal: 'Estimated total',
    modalSubmitBooking: 'Confirm Booking Request',
    modalNoBotNote: 'Free cancellation up to 24 hours before the trip start time shown on your booking. Cancellations within 24 hours of the start time are charged at the full trip price. On the Marsa Alam trips, marine park permits are arranged in advance and are not refundable once issued. No instant bot charges.',
    modalValidationErr: 'Please enter your name, hotel location, WhatsApp number, and a valid email address.',
    modalConfirmedBadge: 'Request received',
    modalConfirmedTitle: 'Operator checking availability',
    modalBackToTrips: 'Back to trips',
    modalNewRequest: 'New request',

    quickJumpHurghada: 'Hurghada',
    quickJumpMarsa: 'Marsa Alam',
    quickJumpLuxor: 'Luxor',
    quickJumpCairo: 'Cairo',
    quickJumpTransfers: 'Transfers',
    quickJumpShopping: 'Shopping',
    quickJumpGuides: 'Private Guides',
    quickJumpCityTour: 'City Tour',
    quickJumpCustom: 'Custom Trip',
    mobileBarExplore: 'Explore trips',
    mobileBarWhatsapp: 'WhatsApp Desk',
    footerPolicies: 'Cancellation & Terms',
    footerBlog: 'Travel Blog',
    previewTouristBtn: 'Tourist View',
    modalOptionsLabel: 'Choose option',
    optionsCountSuffix: 'options',
    openWhatsappNow: 'Open WhatsApp with Booking Details',
    staffPortalLogin: 'Staff & Partner Sign-In',

    footerAddonEyebrow: 'Private Add-Ons · Hurghada, Luxor & Cairo',
    footerAddonTitle: 'Need a Private Egyptian Guide or Vacation Photographer?',
    footerPhotoTitle: 'Photography Sessions (Beach, Boat & Monuments)',
    footerPhotoDesc: 'Book a dedicated local photographer for Orange Bay sandbars, Sahl Hasheesh sunrise rides, desert dusk, or Luxor temples, clean edited digital gallery delivered within 48 hours.',
    footerGuideTitle: 'Private Licensed Egyptian Guide (All Languages)',
    footerGuideDesc: 'Hire a Ministry-licensed Egyptologist or Hurghada City Tour host privately in English, German, Arabic, French, Spanish, Dutch, Italian, Polish, or Russian, zero forced shopping stops.',
    footerAddonCta: 'Request Photography or Private Guide',

    modalHighlightsTitle: 'Highlights',
    modalItineraryTitle: 'Itinerary',
    modalDescriptionTitle: 'Full description',
    modalIncludesTitle: 'Includes',
    modalTipsTitle: 'Tips & Exclusions',
    modalSomethingToKnowTitle: 'Something you should know',
    modalNotSuitableTitle: 'Not suitable for',
    modalMeetingPointTitle: 'Meeting point',
    modalOpenGoogleMaps: 'Open in Google Maps',
    modalWhatToBringTitle: 'What to bring',
    modalNotAllowedTitle: 'Not allowed',
    modalKnowBeforeYouGoTitle: 'Know before you go',
    modalSeeMore: 'See more',
    modalSeeLess: 'See less',
    modalTransferZoneLabel: 'Hotel pickup zone (outside Hurghada extra fee)',
    modalTransferZoneNotice: 'Pick-up outside Hurghada city (El Gouna, Sahl Hasheesh, Makadi Bay +€10/pp · Soma Bay, Safaga +€15/pp) has a per-person transfer add-on.',
    modalTransferIncluded: 'Hurghada City (Pickup included · +€0)',
  },

  ar: {
    brandName: 'وصلة للسفريات والسياحة',
    navTopActivities: 'أفضل الرحلات',
    navHurghada: 'الغردقة',
    navCairoLuxor: 'القاهرة والأقصر',
    navAllTrips: 'كل الرحلات',
    askWhatsapp: 'تواصل واتساب',
    deskCount: 'الطلبات',

    heroEyebrow: 'الغردقة · مرسى علم · القاهرة · الأقصر',
    heroTitleLine1: 'رحلات الغردقة بمجموعات صغيرة،',
    heroTitleLine2: 'محجوزة بدون أي حيرة.',
    heroLede:
      'رحلات بحرية وسفاري صحراوية وأيام في الأقصر مع مشغلين محليين مختارين بعناية، بيأكدها المالك بنفسه. لا دفع اليوم، والدفع كاش عند الاستلام.',
    searchDestinationLabel: 'الوجهة',
    searchActivityLabel: 'النشاط',
    searchDateLabel: 'التاريخ',
    searchAllDestinations: 'كل الوجهات',
    searchAllActivities: 'كل الأنشطة',
    searchButton: 'بحث',

    sectionTopActivities: 'أفضل الأنشطة',
    sectionTopActivitiesSub: 'تجارب مختارة بمجموعات صغيرة في الغردقة ومرسى علم والأقصر والقاهرة.',
    viewTrip: 'عرض الرحلة',
    fromPrice: 'ابتداءً من',
    perPerson: 'للفرد',

    sectionAllActivities: 'كل الأنشطة والمغامرات',
    sectionAllActivitiesSub: 'اختر نوع النشاط للانتقال مباشرة إلى قسم الوجهة المناسبة.',
    tripsCountSingle: 'رحلة',
    tripsCountPlural: 'رحلات',
    scrollToSectionHint: 'انتقل للقسم',

    sectionHurghadaMarsa: 'الغردقة ومرسى علم',
    sectionHurghadaMarsaSub: 'جزر البحر الأحمر، الغطس السطحي، رحلات الصحراء، الخيل، جولات المدينة والتوصيل.',
    sectionCairoLuxor: 'القاهرة والأقصر',
    sectionCairoLuxorSub: 'جولات المعابد والأهرامات بسيارات مريحة وتوصيلات خاصة موثوقة.',

    sectionAllTrips: 'كل الرحلات',
    sectionAllTripsSub: 'استعرض جميع البرامج جنباً إلى جنب وشاهد الصور والتقييمات وخيارات العائلة قبل الحجز.',
    bookNow: 'احجز مكانك',
    bookNowMicrocopy: 'لا دفع اليوم. الدفع كاش عند الاستلام.',
    familyFriendly: 'مناسب للعائلات',
    womenFriendly: 'مناسب ومدعوم للنساء',
    minChildAge: 'أدنى عمر للأطفال',
    kidsDiscount: 'خصم الأطفال',
    allTripsListHeading: 'اختر رحلة',

    sectionMoments: 'لحظات لا تُنسى',
    sectionMomentsSub: 'لقطات حقيقية شاركها المسافرون بعد أيامهم في البحر الأحمر والنيل.',
    momentViewTrip: 'عرض هذه الرحلة',
    momentPrev: 'اللحظة السابقة',
    momentNext: 'اللحظة التالية',
    momentClose: 'إغلاق',

    sectionWhyBook: 'لماذا تحجز معنا',
    whyItems: {
      family: {
        title: 'مناسب للعائلات',
        desc: 'أعمار واضحة للأطفال، توقفات بحرية هادئة، ومرشدون بصبر واهتمام.',
      },
      women: {
        title: 'مناسب ومدعوم للنساء',
        desc: 'مشغلون معتمدون، متابعة دقيقة للتوصيل، ودعم سريع طوال اليوم.',
      },
      pay: {
        title: 'الدفع نقداً عند الاستلام',
        desc: 'الدفع نقداً عند الاستلام هو المعتاد، وإذا كنت تفضل الدفع مسبقاً، فقط اطلب منا وسنرسل لك رابط دفع.',
      },
      cancel: {
        title: 'إلغاء مجاني حتى 24 ساعة قبل الرحلة',
        desc: 'الإلغاء خلال آخر 24 ساعة قبل البداية يُحسب بسعر الرحلة الكامل.',
      },
      whatsapp: {
        title: 'دعم مباشر عبر واتساب',
        desc: 'إجابات بشرية فورية حول مواعيد التوصيل وحالة البحر وأعمار الأطفال.',
      },
    },

    topLinksColumns: {
      attractions: 'أشهر معالم الغردقة',
      destinations: 'الوجهات',
      thingsToDo: 'أنشطة للقيام بها',
      topTrips: 'أفضل الرحلات',
    },

    newsletterEyebrow: 'النشرة البريدية',
    newsletterTitle: 'احصل على أفضل الرحلات أولاً',
    newsletterSub: 'رسالة قصيرة عند فتح رحلات جديدة وعروض موسمية. بدون إزعاج.',
    newsletterPlaceholder: 'you@example.com',
    newsletterButton: 'اشتراك',
    newsletterSuccess: 'تم الاشتراك، حفظنا بريدك للتحديثات الموسمية في الغردقة.',

    footerRights: '© 2026 وصلة للسفريات والسياحة · الغردقة، مصر',
    footerWhatsapp: 'واتساب',
    footerLanguages: 'اللغة',

    modalClose: 'إغلاق',
    modalWhatStandsOut: 'أبرز المميزات',
    modalIncluded: 'يشمله السعر باليورو',
    modalChildPolicy: 'دعم العائلات والنساء',
    modalWholeEuro: 'السعر باليورو الصحيح',
    modalPerAdult: 'للبالغ',
    modalPayAfter: 'الدفع نقداً عند الاستلام',
    modalDateLabel: 'تاريخ الرحلة المفضل',
    modalAdults: 'البالغون',
    modalChildren: 'الأطفال',
    modalHotelLabel: 'اسم الفندق أو منطقة التوصيل',
    modalHotelPlaceholder: 'مثال: شتايجنبرجر الغردقة، مرسى علم، الزمالك',
    modalNameLabel: 'الاسم الكامل',
    modalContactLabel: 'رقم الواتساب',
    modalWhatsappLabel: 'رقم الواتساب',
    modalWhatsappPlaceholder: '+20 112 ... أو +49 ...',
    modalEmailLabel: 'البريد الإلكتروني',
    modalEmailPlaceholder: 'you@example.com',
    modalPickupDispatchNote: 'سيصلك موعد التحرك الدقيق وبيانات السائق على بريدك الإلكتروني والواتساب معاً.',
    modalNotesLabel: 'ملاحظات (أعمار الأطفال، تفضيلات)',
    modalNotesPlaceholder: 'اختياري، مثال: طفل بعمر 7 سنوات',
    modalEstTotal: 'الإجمالي التقديري',
    modalSubmitBooking: 'إرسال طلب الحجز',
    modalNoBotNote: 'إلغاء مجاني حتى 24 ساعة قبل موعد بداية الرحلة المكتوب في حجزك. الإلغاء خلال آخر 24 ساعة قبل البداية يُحسب بسعر الرحلة الكامل. في رحلات مرسى علم، تصاريح المحمية البحرية تُجهَّز مقدمًا ولا تُسترد بعد إصدارها. لا يتم خصم أي مبلغ قبل التأكيد.',
    modalValidationErr: 'يرجى إدخال الاسم واسم الفندق ورقم الواتساب والبريد الإلكتروني.',
    modalConfirmedBadge: 'تم استلام الطلب',
    modalConfirmedTitle: 'المشغل يراجع التوافر الآن',
    modalBackToTrips: 'العودة للرحلات',
    modalNewRequest: 'طلب جديد',

    quickJumpHurghada: 'الغردقة',
    quickJumpMarsa: 'مرسى علم',
    quickJumpLuxor: 'الأقصر',
    quickJumpCairo: 'القاهرة',
    quickJumpTransfers: 'التوصيلات',
    quickJumpShopping: 'جولات التسوق',
    quickJumpGuides: 'مرشدون مصريون',
    quickJumpCityTour: 'جولة المدينة',
    quickJumpCustom: 'رحلة مخصصة',
    mobileBarExplore: 'استكشف الرحلات',
    mobileBarWhatsapp: 'تواصل واتساب',
    footerPolicies: 'سياسة الإلغاء والشروط',
    footerBlog: 'مدونة السفر',
    previewTouristBtn: 'معاينة كسائح',
    modalOptionsLabel: 'اختر أوبشن الرحلة',
    optionsCountSuffix: 'خيارات',
    openWhatsappNow: 'فتح واتساب بتفاصيل الحجز الآن',
    staffPortalLogin: 'دخول الإدارة والموردين',

    footerAddonEyebrow: 'خدمات خاصة إضافية · الغردقة والأقصر والقاهرة',
    footerAddonTitle: 'هل تحتاج إلى مرشد سياحي خاص أو جلسة تصوير احترافية؟',
    footerPhotoTitle: 'خدمات التصوير الاحترافية (البحر، الصحراء، المعابد)',
    footerPhotoDesc: 'احجز مصوراً محترفاً لمرافقتك في رحلة أورانج باي أو ركوب الخيل عند الشروق أو سفاري الغروب أو آثار الأقصر، صور عالية الجودة تصلك خلال 48 ساعة.',
    footerGuideTitle: 'مرشد سياحي مصري خاص (Private Guide) بجميع اللغات',
    footerGuideDesc: 'مرشد سياحي مصري مرخص من وزارة السياحة يرافقك وحدك أو مع عائلتك باللغة التي تختارها في المتاحف والمعابد أو جولات المدينة (City Tour) بدون أي توقفات تسوق إجبارية.',
    footerAddonCta: 'اطلب جلسة تصوير أو مرشد خاص',

    modalHighlightsTitle: 'أبرز المميزات (Highlights)',
    modalItineraryTitle: 'مسار الرحلة (Itinerary)',
    modalDescriptionTitle: 'نبذة عن الرحلة (Description)',
    modalIncludesTitle: 'يشمل البرنامج (Includes)',
    modalTipsTitle: 'تنبيهات وغير مشمول بالسعر (Tips)',
    modalSomethingToKnowTitle: 'معلومات مهمة قبل الرحلة (Something you should know)',
    modalNotSuitableTitle: 'غير مناسب لـ',
    modalMeetingPointTitle: 'نقطة التجمع',
    modalOpenGoogleMaps: 'فتح على خرائط جوجل (Google Maps)',
    modalWhatToBringTitle: 'ماذا تحضر معك',
    modalNotAllowedTitle: 'غير مسموح به',
    modalKnowBeforeYouGoTitle: 'تعرف قبل الانطلاق',
    modalSeeMore: 'عرض المزيد',
    modalSeeLess: 'عرض أقل',
    modalTransferZoneLabel: 'منطقة الفندق (رسوم التوصيل الإضافية خارج الغردقة)',
    modalTransferZoneNotice: 'التوصيل خارج مدينة الغردقة (الجونة، سهل حشيش، مكادي +10€ للفرد · سوما باي، سفاجا +15€ للفرد) يضاف كرسوم توصيل واضحة.',
    modalTransferIncluded: 'مدينة الغردقة (التوصيل مشمول بالسعر · +0€)',
  },

  de: {
    brandName: 'Wasla Travel',
    navTopActivities: 'Top-Touren',
    navHurghada: 'Hurghada',
    navCairoLuxor: 'Kairo & Luxor',
    navAllTrips: 'Alle Touren',
    askWhatsapp: 'WhatsApp',
    deskCount: 'Anfragen',

    heroEyebrow: 'Hurghada · Marsa Alam · Kairo · Luxor',
    heroTitleLine1: 'Hurghada Ausflüge in kleinen Gruppen,',
    heroTitleLine2: 'gebucht ohne Rätselraten.',
    heroLede:
      'Bootstouren, Wüstensafaris und Luxor-Tage mit handverlesenen lokalen Veranstaltern, vom Inhaber persönlich bestätigt. Heute zahlen Sie nichts; die Barzahlung erfolgt bei der Abholung.',
    searchDestinationLabel: 'Reiseziel',
    searchActivityLabel: 'Aktivität',
    searchDateLabel: 'Datum',
    searchAllDestinations: 'Alle Ziele',
    searchAllActivities: 'Alle Aktivitäten',
    searchButton: 'Suchen',

    sectionTopActivities: 'Top-Aktivitäten',
    sectionTopActivitiesSub: 'Ausgewählte Kleingruppen-Touren in Hurghada, Marsa Alam, Luxor und Kairo.',
    viewTrip: 'Tour ansehen',
    fromPrice: 'ab',
    perPerson: 'pro Person',

    sectionAllActivities: 'Alle Aktivitäten und Abenteuer',
    sectionAllActivitiesSub: 'Wählen Sie eine Kategorie, um direkt zur passenden Zielregion zu springen.',
    tripsCountSingle: 'Tour',
    tripsCountPlural: 'Touren',
    scrollToSectionHint: 'Zur Region',

    sectionHurghadaMarsa: 'Hurghada und Marsa Alam',
    sectionHurghadaMarsaSub: 'Inselboote, Riffschnorcheln, Wüstentrails, Reiten, Stadttouren und Transfers.',
    sectionCairoLuxor: 'Kairo und Luxor',
    sectionCairoLuxorSub: 'Tempel- und Pyramidentage im Kleinbus sowie zuverlässige Privattransfers.',

    sectionAllTrips: 'Alle Touren',
    sectionAllTripsSub: 'Vergleichen Sie alle Touren direkt nebeneinander inklusive Bildern, Bewertungen und Familieninfos.',
    bookNow: 'Platz reservieren',
    bookNowMicrocopy: 'Heute nichts zu bezahlen. Barzahlung bei Abholung.',
    familyFriendly: 'Familienfreundlich',
    womenFriendly: 'Frauenfreundlich',
    minChildAge: 'Mindestalter',
    kidsDiscount: 'Kinderrabatt',
    allTripsListHeading: 'Tour auswählen',

    sectionMoments: 'Unvergessliche Momente',
    sectionMomentsSub: 'Echte Reiseeindrücke unserer Gäste vom Roten Meer und vom Nil.',
    momentViewTrip: 'Diese Tour öffnen',
    momentPrev: 'Vorheriger Moment',
    momentNext: 'Nächster Moment',
    momentClose: 'Schließen',

    sectionWhyBook: 'Warum mit uns buchen',
    whyItems: {
      family: {
        title: 'Familienfreundlich',
        desc: 'Klare Altersangaben für Kinder, ruhige Buchten und geduldige Guides.',
      },
      women: {
        title: 'Frauenfreundlich & unterstützt',
        desc: 'Geprüfte lokale Partner, verlässliche Abholung und direkter Tagessupport.',
      },
      pay: {
        title: 'Barzahlung bei Abholung',
        desc: 'Barzahlung bei Abholung ist der Standard, wenn Sie lieber vorab zahlen möchten, fragen Sie uns einfach und wir senden Ihnen einen Zahlungslink.',
      },
      cancel: {
        title: 'Kostenlose Stornierung bis 24 Stunden vor der Tour',
        desc: 'Bei einer Stornierung innerhalb von 24 Stunden vor der Startzeit wird der volle Tourpreis berechnet.',
      },
      whatsapp: {
        title: 'WhatsApp-Support',
        desc: 'Schnelle menschliche Antworten zu Abholzeiten, Seegang und Kindertarifen.',
      },
    },

    topLinksColumns: {
      attractions: 'Top-Attraktionen in Hurghada',
      destinations: 'Reiseziele',
      thingsToDo: 'Aktivitäten',
      topTrips: 'Beliebte Touren',
    },

    newsletterEyebrow: 'Newsletter',
    newsletterTitle: 'Gute Touren zuerst entdecken',
    newsletterSub: 'Eine kurze Mail bei neuen Saisontouren. Kein Spam, jederzeit abbestellbar.',
    newsletterPlaceholder: 'sie@beispiel.de',
    newsletterButton: 'Abonnieren',
    newsletterSuccess: 'Angemeldet, Ihre E-Mail ist für Saison-Updates gespeichert.',

    footerRights: '© 2026 Wasla Travel · Hurghada, Ägypten',
    footerWhatsapp: 'WhatsApp',
    footerLanguages: 'Sprache',

    modalClose: 'Schließen',
    modalWhatStandsOut: 'Das zeichnet die Tour aus',
    modalIncluded: 'Im Preis enthalten',
    modalChildPolicy: 'Familien- & Frauenhinweis',
    modalWholeEuro: 'Glatter Euro-Preis',
    modalPerAdult: 'pro Erwachsenem',
    modalPayAfter: 'Barzahlung bei Abholung',
    modalDateLabel: 'Wunschdatum',
    modalAdults: 'Erwachsene',
    modalChildren: 'Kinder',
    modalHotelLabel: 'Hotel oder Abholort',
    modalHotelPlaceholder: 'z.B. Steigenberger Al Dau, Marsa Alam',
    modalNameLabel: 'Vollständiger Name',
    modalContactLabel: 'WhatsApp-Nummer',
    modalWhatsappLabel: 'WhatsApp-Nummer',
    modalWhatsappPlaceholder: '+49 170 5542190',
    modalEmailLabel: 'E-Mail-Adresse',
    modalEmailPlaceholder: 'sie@beispiel.de',
    modalPickupDispatchNote: 'Genaue Abholzeit & Fahrerdaten erreichen Sie per E-Mail und WhatsApp.',
    modalNotesLabel: 'Hinweise (Kinderalter, Wünsche)',
    modalNotesPlaceholder: 'Optional, z.B. 7-jähriges Kind',
    modalEstTotal: 'Geschätzter Gesamtpreis',
    modalSubmitBooking: 'Buchungsanfrage senden',
    modalNoBotNote: 'Kostenlose Stornierung bis 24 Stunden vor der auf Ihrer Buchung angegebenen Startzeit der Tour. Bei einer Stornierung innerhalb von 24 Stunden vor der Startzeit wird der volle Tourpreis berechnet. Bei den Touren nach Marsa Alam gilt: Genehmigungen für den Meerespark werden im Voraus beschafft und sind nach Ausstellung nicht erstattungsfähig. Keine Sofortabbuchung.',
    modalValidationErr: 'Bitte geben Sie Namen, Hotel, WhatsApp-Nummer und eine gültige E-Mail an.',
    modalConfirmedBadge: 'Anfrage eingegangen',
    modalConfirmedTitle: 'Anbieter prüft Verfügbarkeit',
    modalBackToTrips: 'Zurück zu den Touren',
    modalNewRequest: 'Neue Anfrage',

    quickJumpHurghada: 'Hurghada',
    quickJumpMarsa: 'Marsa Alam',
    quickJumpLuxor: 'Luxor',
    quickJumpCairo: 'Kairo',
    quickJumpTransfers: 'Transfers',
    quickJumpShopping: 'Shopping',
    quickJumpGuides: 'Reiseleiter',
    quickJumpCityTour: 'Stadtrundfahrt',
    quickJumpCustom: 'Individuelle Tour',
    mobileBarExplore: 'Touren ansehen',
    mobileBarWhatsapp: 'WhatsApp',
    footerPolicies: 'Stornierung & AGB',
    footerBlog: 'Reiseblog',
    previewTouristBtn: 'Touristenansicht',
    modalOptionsLabel: 'Option wählen',
    optionsCountSuffix: 'Optionen',
    openWhatsappNow: 'WhatsApp mit Buchungsdetails öffnen',
    staffPortalLogin: 'Partner- & Team-Login',

    footerAddonEyebrow: 'Private Extras · Hurghada, Luxor & Kairo',
    footerAddonTitle: 'Privater ägyptischer Guide oder Urlaubsfotograf gewünscht?',
    footerPhotoTitle: 'Professionelle Fotoshootings (Strand, Boot & Tempel)',
    footerPhotoDesc: 'Buchen Sie einen lokalen Fotografen für Orange Bay, Sonnenaufgangs-Reiten in Sahl Hasheesh, die Wüste oder Tempel in Luxor, fertige Galerie innerhalb von 48 Stunden.',
    footerGuideTitle: 'Privater lizenzierter Reiseleiter (Alle Sprachen)',
    footerGuideDesc: 'Staatlich geprüfter Ägyptologe oder Stadtführer ganz privat für Sie in Deutsch, Englisch, Französisch, Arabisch oder Spanisch, ohne erzwungene Verkaufsstopps.',
    footerAddonCta: 'Fotoshooting oder Privatguide anfragen',

    modalHighlightsTitle: 'Highlights',
    modalItineraryTitle: 'Reiseverlauf',
    modalDescriptionTitle: 'Beschreibung',
    modalIncludesTitle: 'Inbegriffen',
    modalTipsTitle: 'Hinweise & Nicht inbegriffen',
    modalSomethingToKnowTitle: 'Wichtige Informationen',
    modalNotSuitableTitle: 'Nicht geeignet für',
    modalMeetingPointTitle: 'Treffpunkt',
    modalOpenGoogleMaps: 'In Google Maps öffnen',
    modalWhatToBringTitle: 'Bitte mitbringen',
    modalNotAllowedTitle: 'Nicht erlaubt',
    modalKnowBeforeYouGoTitle: 'Vor dem Start beachten',
    modalSeeMore: 'Mehr anzeigen',
    modalSeeLess: 'Weniger anzeigen',
    modalTransferZoneLabel: 'Hotelzone (Transferzuschlag außerhalb Hurghadas)',
    modalTransferZoneNotice: 'Abholung außerhalb von Hurghada-Stadt (El Gouna, Sahl Hasheesh, Makadi Bay +10 €/Pers. · Soma Bay, Safaga +15 €/Pers.) wird pro Person berechnet.',
    modalTransferIncluded: 'Hurghada Stadt (Abholung inklusive · +0 €)',
  },
};

export const I18N: Record<Lang, Translations> = {
  ...BASE_I18N,
  ...EU_TRANSLATIONS,
  ...GLOBAL_TRANSLATIONS,
};
