import { createBookingReference } from './lib/bookingReference';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  Compass,
  Eye,
  Headphones,
  Heart,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Plane,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Store,
  Ticket,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Carousel } from './components/Carousel';
import { ContactSupportSection } from './components/ContactSupportSection';
import { CustomTripModal, CustomTripSubmission } from './components/CustomTripModal';
import { FavoritesModal } from './components/FavoritesModal';
import { HowItWorksSection } from './components/HowItWorksSection';
import { LanguageSelector } from './components/LanguageSelector';
import { LegalPoliciesModal, LegalPolicyTab } from './components/LegalPoliciesModal';
import { MomentsModal } from './components/MomentsModal';
import { MomentsReviewCarousel } from './components/MomentsReviewCarousel';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { PortalAuthModal } from './components/PortalAuthModal';

import { SmartImage } from './components/SmartImage';
import { StorefrontFaq } from './components/StorefrontFaq';
import { ThemeSwitch } from './components/ThemeSwitch';
import { TrackBookingModal } from './components/TrackBookingModal';
import { TripCard } from './components/TripCard';
import { BookingRequest, TripDetailModal } from './components/TripDetailModal';
import { TripExplorer } from './components/TripExplorer';
import { PostTripReviewModal } from './components/TripReview';
import { WaslaLogo } from './components/brand/WaslaLogo';
import { WaslaMapsProvider } from './components/WaslaHotelMapPicker';
import { WhatsAppInquiryModal } from './components/WhatsAppInquiryModal';
import {
  PrivateMaintenanceGate,
  isPrivateGateUnlocked,
  lockPrivateGate,
} from './components/PrivateMaintenanceGate';

import { OperationsDesk } from './components/portals/OperationsDesk';
import { OwnerControl } from './components/portals/OwnerControl';
import { SupplierPortal } from './components/portals/SupplierPortal';
import { I18N, Lang } from './data/i18n';
import { ensureLocalePack } from './data/localePacks';
import {
  ActivityCategoryId,
  CATEGORIES,
  CATEGORY_FALLBACK_IMAGE,
  CurrencyCode,
  DestinationRegion,
  MOMENTS,
  MomentItem,
  SITE_CONFIG,
  TOP_LINK_COLUMNS,
  TRIPS,
  Trip,
  doesTripRunInDateRange,
  normalizeSearchDateRange,
  resolveBundledMediaUrl,
  tText,
} from './data/marketplaceData';
import {
  ComplaintCase,
  PlatformBooking,
} from './data/platformData';
import {
  extractSafeBookingRefs,
  persistStorefrontBookingHandoff,
  resolveBookingReviewTarget,
  sanitizeBookingId,
} from './hooks/useBookingReviewVerification';
import { useScrollReveal } from './hooks/useScrollReveal';
import { EffectiveRole, useWaslaFirebase } from './hooks/useWaslaFirebase';
import {
  getNotificationSupportStatus,
  requestDesktopAlertPermission,
  unlockBookingAudio,
} from './lib/alerts';

type WorkspaceRole = 'storefront' | 'operations' | 'supplier' | 'owner';

export default function App() {
  const [isSiteUnlocked, setIsSiteUnlocked] = useState<boolean>(() => isPrivateGateUnlocked());
  const [workspace, setWorkspace] = useState<WorkspaceRole>('storefront');
  const [lang, setLang] = useState<Lang>('en');
  const [, setLocalePackVersion] = useState(0);

  useEffect(() => {
    let active = true;
    ensureLocalePack(lang).then((loaded) => {
      if (active && loaded) setLocalePackVersion((v) => v + 1);
    });
    return () => {
      active = false;
    };
  }, [lang]);
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('wasla_currency_v1');
        if (saved === 'EUR' || saved === 'USD' || saved === 'EGP') {
          return saved;
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return 'EUR';
  });
  const [themeMap, setThemeMap] = useState<Record<WorkspaceRole, boolean>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedMap = window.localStorage.getItem('wasla_theme_map_v1');
        if (savedMap) {
          const parsed = JSON.parse(savedMap);
          return {
            storefront: Boolean(parsed.storefront),
            operations: Boolean(parsed.operations),
            supplier: Boolean(parsed.supplier),
            owner: Boolean(parsed.owner),
          };
        }
        const legacyDark = window.localStorage.getItem('wasla_theme') === 'dark';
        return {
          storefront: legacyDark,
          operations: legacyDark,
          supplier: legacyDark,
          owner: legacyDark,
        };
      }
    } catch {
      // Ignore storage read errors
    }
    return {
      storefront: false,
      operations: false,
      supplier: false,
      owner: false,
    };
  });

  const darkMode = themeMap[workspace];
  const isRtl = workspace === 'storefront' && lang === 'ar';
  const t = I18N[lang];

  // Master switch: changes all 4 workspaces (Storefront, Operations Desk, Supplier Portal, Owner Control) at once
  const toggleAllWorkspacesTheme = () => {
    setThemeMap((prev) => {
      const next = !prev[workspace];
      return {
        storefront: next,
        operations: next,
        supplier: next,
        owner: next,
      };
    });
  };

  // Individual portal switch (used by Operations Desk staff or Supplier Portal partner)
  const toggleWorkspaceTheme = (target: WorkspaceRole) => {
    setThemeMap((prev) => ({
      ...prev,
      [target]: !prev[target],
    }));
  };

  useEffect(() => {
    try {
      window.localStorage.setItem('wasla_theme_map_v1', JSON.stringify(themeMap));
      window.localStorage.setItem('wasla_theme', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage failures on restricted mobile browsers
    }
    if (darkMode) {
      document.documentElement.setAttribute('data-wasla-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-wasla-theme');
      document.documentElement.classList.remove('dark');
    }
  }, [themeMap, darkMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem('wasla_currency_v1', currency);
    } catch {
      // Ignore storage failures on restricted mobile browsers
    }
  }, [currency]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentUrl = `${window.location.origin}${window.location.pathname}`;
    const absoluteShareImage = `${window.location.origin}/og-cover.jpg`;
    document.documentElement.lang = lang;

    const canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalEl) canonicalEl.href = currentUrl;

    const ogUrlEl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrlEl) ogUrlEl.content = currentUrl;

    const ogImageEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (ogImageEl) ogImageEl.content = absoluteShareImage;

    const twitterImageEl = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
    if (twitterImageEl) twitterImageEl.content = absoluteShareImage;
  }, [lang]);

  const {
    user,
    authError,
    effectiveRole,
    isPrimaryOwner,
    assignedSupplierName,
    ownAccessRequest,
    publicSettings,
    commissionRate,
    trips,
    tripsLoading,
    bookings,
    suppliers,
    chats,
    complaints,
    emailLogs,
    tripReviews,
    bookingStatusById,
    accessRequests,
    staffRoles,
    adminUsers,
    subscribedEmails,
    latestNewBooking,
    soundMuted,
    signInWithGoogle,
    signOutUser,
    submitAccessRequest,
    approveAccessRequest,
    grantFullOwnerAccess,
    revokePortalAccess,
    createBookingInDb,
    createChatInDb,
    subscribeNewsletterInDb,
    addSupplierTripInDb,
    updateTripApprovalInDb,
    updateTripInDb,
    deleteTripInDb,
    updateTripReviewApprovalInDb,
    updateBookingInDb,
    logDispatchEmailInDb,
    sendChatMessageInDb,
    updateComplaintInDb,
    updateSupplierStatusInDb,
    updatePublicSettingsInDb,
    updateCommissionRateInDb,
    dismissNewBookingAlert,
    toggleSoundMuted,
    testBookingAlert,
  } = useWaslaFirebase();

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const tomorrowIso = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);

  // Storefront UI state
  const [searchDestination, setSearchDestination] = useState<DestinationRegion | 'all'>('all');
  const [searchActivity, setSearchActivity] = useState<ActivityCategoryId | 'all'>('all');
  // Single optional trip date ('' = "Any date", no date filtering)
  const [searchTripDate, setSearchTripDate] = useState('');
  const [selectedExplorerTripId, setSelectedExplorerTripId] = useState<string>(TRIPS[0].id);
  const [activeDetailTrip, setActiveDetailTrip] = useState<Trip | null>(null);
  const [favoriteTripIds, setFavoriteTripIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('wasla_favorite_trips_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.filter((id): id is string => typeof id === 'string');
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [customTripOpen, setCustomTripOpen] = useState(false);
  const [customInitialServices, setCustomInitialServices] = useState<string[] | undefined>(undefined);
  const [activeMomentIndex, setActiveMomentIndex] = useState<number | null>(null);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [customerRequests, setCustomerRequests] = useState<BookingRequest[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('wasla_customer_bookings_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed as BookingRequest[];
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('wasla_customer_bookings_v1', JSON.stringify(customerRequests));
    } catch {
      // Ignore storage write errors
    }
  }, [customerRequests]);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConfirmed, setNewsletterConfirmed] = useState(false);
  const [lastSubscribedEmail, setLastSubscribedEmail] = useState('');
  const [heroScrollY, setHeroScrollY] = useState(0);
  const [touristPreviewOnly, setTouristPreviewOnly] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [policiesTab, setPoliciesTab] = useState<LegalPolicyTab>('terms');
  const [trackBookingOpen, setTrackBookingOpen] = useState(false);
  const [initialTrackBookingId, setInitialTrackBookingId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalAuthOpen, setPortalAuthOpen] = useState(false);
  const [directReviewContext, setDirectReviewContext] = useState<{
    trip: Trip;
    bookingId: string;
  } | null>(null);
  const [notifPerm, setNotifPerm] = useState(getNotificationSupportStatus());
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const openPolicies = useCallback((tab: LegalPolicyTab = 'terms') => {
    setPoliciesTab(tab);
    setPoliciesOpen(true);
  }, []);

  const openTripDetail = useCallback((tripToOpen: Trip) => {
    setActiveDetailTrip(tripToOpen);
    if (typeof window !== 'undefined') {
      const nextUrl = new URL(window.location.href);
      if (nextUrl.searchParams.get('trip') !== tripToOpen.id) {
        nextUrl.searchParams.set('trip', tripToOpen.id);
        const qs = nextUrl.searchParams.toString();
        window.history.pushState(
          { waslaTripId: tripToOpen.id },
          '',
          `${nextUrl.pathname}${qs ? `?${qs}` : ''}`
        );
      }
    }
  }, []);

  const closeTripDetail = useCallback(() => {
    setActiveDetailTrip(null);
    if (typeof window !== 'undefined') {
      const nextUrl = new URL(window.location.href);
      if (nextUrl.searchParams.has('trip')) {
        nextUrl.searchParams.delete('trip');
        const qs = nextUrl.searchParams.toString();
        window.history.replaceState(
          null,
          '',
          `${nextUrl.pathname}${qs ? `?${qs}` : ''}${nextUrl.hash}`
        );
      }
    }
  }, []);

  // Sync browser Back/Forward navigation with active trip detail view
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tripId = params.get('trip');
      if (!tripId) {
        setActiveDetailTrip(null);
      } else {
        const catalog = trips.length > 0 ? trips : TRIPS;
        const found = catalog.find((tr) => tr.id === tripId);
        if (found) setActiveDetailTrip(found);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [trips]);

  // Dynamic document title & TouristTrip JSON-LD when inspecting an excursion
  useEffect(() => {
    const baseTitle = 'Wasla Travel — Hurghada Travel Marketplace';
    const existingScript = document.getElementById('wasla-trip-jsonld');
    if (!activeDetailTrip) {
      document.title = baseTitle;
      if (existingScript) existingScript.remove();
      return;
    }

    const localizedTitle = tText(activeDetailTrip.name, lang);
    document.title = `${localizedTitle} — Wasla Travel`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: activeDetailTrip.name.en || localizedTitle,
      description: activeDetailTrip.shortDescription.en,
      touristType: activeDetailTrip.familyFriendly ? ['Families', 'Travelers'] : ['Travelers'],
      provider: {
        '@type': 'TravelAgency',
        name: 'Wasla Travel',
        url: 'https://waslatravel.com/',
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: activeDetailTrip.price,
        availability: 'https://schema.org/InStock',
        url: `https://waslatravel.com/?trip=${encodeURIComponent(activeDetailTrip.id)}`,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: activeDetailTrip.rating,
        reviewCount: Math.max(1, activeDetailTrip.reviewCount),
      },
    };

    const scriptEl =
      existingScript ||
      (() => {
        const el = document.createElement('script');
        el.id = 'wasla-trip-jsonld';
        el.setAttribute('type', 'application/ld+json');
        document.head.appendChild(el);
        return el;
      })();
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      const cleanupEl = document.getElementById('wasla-trip-jsonld');
      if (cleanupEl) cleanupEl.remove();
    };
  }, [activeDetailTrip, lang]);

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    const unlockOnce = () => {
      unlockBookingAudio();
    };
    window.addEventListener('pointerdown', unlockOnce, { once: true });
    return () => window.removeEventListener('pointerdown', unlockOnce);
  }, []);


  const storefrontBookingRefs = useMemo(
    () => extractSafeBookingRefs(customerRequests),
    [customerRequests]
  );

  const handleOpenVerifiedReview = useCallback((reviewTrip: Trip, rawBookingId?: string) => {
    const cleanId = sanitizeBookingId(rawBookingId);
    setDirectReviewContext({ trip: reviewTrip, bookingId: cleanId });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('destination') as DestinationRegion | null;
    const act = params.get('activity') as ActivityCategoryId | null;
    const startParam = params.get('startDate');
    const endParam = params.get('endDate');
    const dateParam = params.get('date');
    const tripParam = params.get('trip');
    const reviewParam = sanitizeBookingId(params.get('review') || params.get('bookingId'));
    const trackParam = sanitizeBookingId(
      params.get('track') || params.get('voucher') || params.get('booking')
    );

    if (params.get('portal') === '1' || window.location.hash === '#portal') {
      setPortalAuthOpen(true);
    }

    if (trackParam) {
      setInitialTrackBookingId(trackParam);
      setTrackBookingOpen(true);
    }

    const catalog = liveTrips.length > 0 ? liveTrips : TRIPS;

    if (tripParam) {
      const sharedTrip =
        catalog.find((tr) => tr.id === tripParam) || TRIPS.find((tr) => tr.id === tripParam);
      if (sharedTrip) {
        setSelectedExplorerTripId(sharedTrip.id);
        if (reviewParam) {
          handleOpenVerifiedReview(sharedTrip, reviewParam);
        } else {
          setActiveDetailTrip(sharedTrip);
        }
      }
    } else if (reviewParam) {
      void resolveBookingReviewTarget(reviewParam, catalog, bookingStatusById).then((resolved) => {
        if (cancelled || !resolved) return;
        setSelectedExplorerTripId(resolved.trip.id);
        handleOpenVerifiedReview(resolved.trip, resolved.bookingId);
      });
    }

    if (dest && ['Hurghada', 'Marsa Alam', 'Luxor', 'Cairo'].includes(dest)) {
      setSearchDestination(dest);
    }
    if (
      act &&
      ['sea', 'desert', 'historical', 'horse', 'city', 'shopping', 'guides', 'transfers'].includes(act)
    ) {
      setSearchActivity(act);
    }
    // Single trip date: prefer the `date` param; legacy `startDate`/`endDate`
    // params collapse to their first valid day so old shared links still work.
    let resolvedDate = '';
    const singleDateParam = dateParam || startParam || endParam;
    if (singleDateParam) {
      const norm = normalizeSearchDateRange(singleDateParam, singleDateParam);
      if (norm.startDate) {
        resolvedDate = norm.startDate;
        setSearchTripDate(norm.startDate);
      }
    }
    if (dest || act || resolvedDate) {
      const match = TRIPS.find(
        (tr) =>
          (!dest || tr.destination === dest) &&
          (!act || tr.category === act) &&
          (!resolvedDate || doesTripRunInDateRange(tr, resolvedDate, resolvedDate))
      );
      if (match) setSelectedExplorerTripId(match.id);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Enforce strict RBAC boundaries on active workspace
  useEffect(() => {
    if (effectiveRole === 'none' && workspace !== 'storefront') {
      setWorkspace('storefront');
    } else if (effectiveRole === 'operations' && (workspace === 'owner' || workspace === 'supplier')) {
      setWorkspace('operations');
    } else if (effectiveRole === 'supplier' && (workspace === 'owner' || workspace === 'operations')) {
      setWorkspace('supplier');
    }
  }, [effectiveRole, workspace]);

  // Inject public analytics tags if configured by Owner
  useEffect(() => {
    const pixel = (publicSettings.metaPixelId || '').trim();
    if (/^\d{5,20}$/.test(pixel) && !document.getElementById('wasla-meta-pixel')) {
      const script = document.createElement('script');
      script.id = 'wasla-meta-pixel';
      script.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`;
      document.head.appendChild(script);
    }

    const ga = (publicSettings.ga4Id || '').trim();
    if (/^G-[A-Z0-9]{4,20}$/i.test(ga) && !document.getElementById('wasla-ga4-loader')) {
      const loader = document.createElement('script');
      loader.id = 'wasla-ga4-loader';
      loader.async = true;
      loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
      document.head.appendChild(loader);

      const inline = document.createElement('script');
      inline.id = 'wasla-ga4-init';
      inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`;
      document.head.appendChild(inline);
    }
  }, [publicSettings.metaPixelId, publicSettings.ga4Id]);

  useEffect(() => {
    const activeDir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = workspace === 'storefront' ? lang : 'en';
    document.documentElement.dir = activeDir;
    document.body.dir = activeDir;
    try {
      window.localStorage.setItem('wasla_active_lang', lang);
    } catch {
      // Ignore storage failures
    }
  }, [lang, isRtl, workspace]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const onScroll = () => setHeroScrollY(Math.min(window.scrollY, 500));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pausedSupplierNames = useMemo(
    () => new Set(suppliers.filter((s) => s.status === 'Paused').map((s) => s.name)),
    [suppliers]
  );

  const liveTrips = useMemo(
    () =>
      trips.filter(
        (tr) =>
          !pausedSupplierNames.has(tr.supplierName) &&
          (!tr.approvalStatus || tr.approvalStatus === 'Approved')
      ),
    [trips, pausedSupplierNames]
  );

  const mergedMoments = useMemo<MomentItem[]>(() => {
    const approved = tripReviews.filter((r) => r.approvalStatus === 'Approved');
    const reviewToMoment = (rev: (typeof approved)[number], hasGuestPhoto: boolean): MomentItem => {
      const matchedTrip = liveTrips.find((tr) => tr.id === rev.tripId) || TRIPS.find((tr) => tr.id === rev.tripId) || TRIPS[0];
      const localizedComment = {
        en: rev.comment,
        ar: rev.comment,
        de: rev.comment,
      };
      const localizedCountry = {
        en: rev.guestCountry || '',
        ar: rev.guestCountry || '',
        de: rev.guestCountry || '',
      };
      return {
        id: rev.id,
        image: hasGuestPhoto && rev.photoUrl ? rev.photoUrl : matchedTrip.images[0] || '',
        fallbackTripImage: matchedTrip.images[0] || '',
        guestName: rev.guestName,
        country: localizedCountry,
        rating: rev.rating || 5,
        comment: localizedComment,
        tripId: rev.tripId,
        bookingId: rev.bookingId,
        verifiedBooking: Boolean(rev.verifiedBooking),
        hasGuestPhoto,
        visitDate: rev.visitDate,
        guestLang: rev.lang,
        tripTitleOverride: rev.tripTitle,
      };
    };

    const withGuestPhotos = approved
      .filter((r) => Boolean(r.photoUrl && r.photoUrl.trim().length > 0))
      .sort((a, b) => (b.visitDate || '').localeCompare(a.visitDate || ''))
      .map((r) => reviewToMoment(r, true));

    const uploadedKeys = new Set(
      withGuestPhotos.map((m) => `${m.tripId}::${m.guestName.trim().split(/\s+/)[0]?.toLowerCase() || ''}`)
    );

    const curatedMoments = MOMENTS.filter(
      (m) => !uploadedKeys.has(`${m.tripId}::${m.guestName.trim().split(/\s+/)[0]?.toLowerCase() || ''}`)
    ).map((m) => {
      const matchingReview = approved.find(
        (r) =>
          r.tripId === m.tripId &&
          r.guestName.trim().split(/\s+/)[0]?.toLowerCase() ===
            m.guestName.trim().split(/\s+/)[0]?.toLowerCase()
      );
      return {
        ...m,
        bookingId: matchingReview?.bookingId ?? m.bookingId,
        verifiedBooking: matchingReview ? Boolean(matchingReview.verifiedBooking) : Boolean(m.verifiedBooking),
        hasGuestPhoto: true,
      };
    });

    const existingKeys = new Set([
      ...uploadedKeys,
      ...curatedMoments.map((m) => `${m.tripId}::${m.guestName.trim().split(/\s+/)[0]?.toLowerCase() || ''}`),
    ]);

    const textOnlyReviews = approved
      .filter((r) => !r.photoUrl || r.photoUrl.trim().length === 0)
      .filter((r) => {
        const key = `${r.tripId}::${r.guestName.trim().split(/\s+/)[0]?.toLowerCase() || ''}`;
        return !existingKeys.has(key);
      })
      .sort((a, b) => (b.visitDate || '').localeCompare(a.visitDate || ''))
      .map((r) => reviewToMoment(r, false));

    return [...withGuestPhotos, ...curatedMoments, ...textOnlyReviews];
  }, [tripReviews, liveTrips]);

  const favoriteTrips = useMemo(
    () =>
      favoriteTripIds
        .map((id) => liveTrips.find((tr) => tr.id === id) || trips.find((tr) => tr.id === id))
        .filter((tr): tr is Trip => Boolean(tr)),
    [favoriteTripIds, liveTrips, trips]
  );

  useEffect(() => {
    try {
      window.localStorage.setItem('wasla_favorite_trips_v1', JSON.stringify(favoriteTripIds));
    } catch {
      // Ignore storage errors
    }
  }, [favoriteTripIds]);

  const handleToggleFavoriteTrip = (trip: Trip) => {
    setFavoriteTripIds((prev) => {
      if (prev.includes(trip.id)) {
        return prev.filter((id) => id !== trip.id);
      }
      return [...prev, trip.id];
    });
  };

  useScrollReveal(`${lang}-${workspace}-${liveTrips.length}`);

  const hurghadaMarsaTrips = useMemo(
    () =>
      liveTrips.filter((trip) => trip.destination === 'Hurghada' || trip.destination === 'Marsa Alam'),
    [liveTrips]
  );

  const cairoLuxorTrips = useMemo(
    () => liveTrips.filter((trip) => trip.destination === 'Cairo' || trip.destination === 'Luxor'),
    [liveTrips]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<ActivityCategoryId, number> = {
      sea: 0,
      desert: 0,
      historical: 0,
      horse: 0,
      city: 0,
      shopping: 0,
      guides: 0,
      transfers: 0,
    };
    liveTrips.forEach((trip) => {
      counts[trip.category] += 1;
    });
    return counts;
  }, [liveTrips]);

  const getCategoryLabel = (catId: ActivityCategoryId): string => {
    const found = CATEGORIES.find((c) => c.id === catId);
    return found ? tText(found.name, lang) : catId;
  };

  const smoothScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // The single trip date is fed to the existing range helpers as a one-day
  // range: '' yields an empty range (no date filtering), a set date yields
  // start === end === that date (trips running on that exact day only).
  const normalizedDateRange = useMemo(
    () => normalizeSearchDateRange(searchTripDate, searchTripDate),
    [searchTripDate]
  );

  // Weekday caption for the chosen trip date, e.g. "Sat, 29 Nov"
  const tripDateCaption = useMemo(() => {
    if (!searchTripDate) return '';
    const d = new Date(`${searchTripDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    const locale = lang === 'ar' ? 'ar-EG' : lang === 'de' ? 'de-DE' : 'en-GB';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d);
  }, [searchTripDate, lang]);

  const heroFilteredTrips = useMemo(
    () =>
      liveTrips.filter((trip) => {
        const destOk = searchDestination === 'all' || trip.destination === searchDestination;
        const actOk = searchActivity === 'all' || trip.category === searchActivity;
        const dateOk = doesTripRunInDateRange(
          trip,
          normalizedDateRange.startDate,
          normalizedDateRange.endDate
        );
        return destOk && actOk && dateOk;
      }),
    [liveTrips, searchDestination, searchActivity, normalizedDateRange]
  );

  const hasCustomSearchFilters =
    searchDestination !== 'all' ||
    searchActivity !== 'all' ||
    normalizedDateRange.startDate !== '' ||
    heroFilteredTrips.length !== liveTrips.length;

  useEffect(() => {
    if (
      heroFilteredTrips.length > 0 &&
      !heroFilteredTrips.some((tr) => tr.id === selectedExplorerTripId)
    ) {
      setSelectedExplorerTripId(heroFilteredTrips[0].id);
    }
  }, [heroFilteredTrips, selectedExplorerTripId]);

  const resetHeroFilters = useCallback(() => {
    setSearchDestination('all');
    setSearchActivity('all');
    setSearchTripDate('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('destination');
      url.searchParams.delete('activity');
      url.searchParams.delete('date');
      url.searchParams.delete('startDate');
      url.searchParams.delete('endDate');
      const qs = url.searchParams.toString();
      window.history.replaceState(null, '', `${url.pathname}${qs ? `?${qs}` : ''}${url.hash}`);
    }
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchDestination !== 'all') params.set('destination', searchDestination);
    else params.delete('destination');
    if (searchActivity !== 'all') params.set('activity', searchActivity);
    else params.delete('activity');
    params.delete('startDate');
    params.delete('endDate');
    if (searchTripDate) params.set('date', searchTripDate);
    else params.delete('date');
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}#all-trips` : '#all-trips');

    const fallbackMatch =
      heroFilteredTrips[0] ||
      liveTrips.find((trip) => trip.destination === searchDestination || trip.category === searchActivity);

    if (fallbackMatch) setSelectedExplorerTripId(fallbackMatch.id);
    smoothScrollTo('all-trips');
  };

  const handleCustomerBooking = async (req: BookingRequest) => {
    const tripObj = trips.find((tr) => tr.id === req.tripId);

    const newBooking: PlatformBooking = {
      id: req.id,
      tripId: req.tripId,
      tripTitle: req.tripTitle,
      category: tripObj?.category ?? 'sea',
      destination: tripObj?.destination ?? 'Hurghada',
      date: req.date,
      tripStartTime: req.tripStartTime,
      pickupTime: 'TBD',
      pickupSpot: 'Inside Reception',
      guestName: req.guestName,
      guestCountry: req.guestCountry?.trim() || 'Guest',
      guestWhatsapp: req.whatsapp,
      guestEmail: req.email,
      guestContact: req.contact,
      guestLang: req.guestLang || lang,
      hotel: req.hotel,
      roomNumber: req.roomNumber,
      adults: req.adults,
      children: req.children,
      infants: req.infants ?? 0,
      grossEur: req.totalEur,
      supplierName: req.supplierName,
      assignedDriverOrGuide: '',
      paymentStatus: 'Awaiting link',
      status: 'Pending',
      notes: req.notes,
      locationImageUrl: req.locationImageUrl,
    };

    await createBookingInDb(newBooking);
    setCustomerRequests((prev) => [req, ...prev]);
    persistStorefrontBookingHandoff({
      bookingId: req.id,
      tripId: req.tripId,
      tripDate: req.date,
    });

  };

  const handleCustomTripSubmit = async (sub: CustomTripSubmission): Promise<string> => {
    const newId = createBookingReference();
    const customTitle = `Custom (${sub.destination}): ${sub.services.join(', ')} [${sub.guideLanguage} Guide]`;
    const mappedCustomLang: Lang =
      sub.guideLanguage === 'German' ? 'de' : sub.guideLanguage === 'Arabic' ? 'ar' : 'en';
    const newBooking: PlatformBooking = {
      id: newId,
      tripId: 'custom-itinerary',
      tripTitle: customTitle,
      category: 'custom',
      destination: sub.destination,
      date: sub.date,
      tripStartTime: 'Custom schedule',
      pickupTime: 'TBD',
      pickupSpot: 'Inside Reception',
      guestName: sub.guestName,
      guestCountry: sub.guestCountry?.trim() || 'Custom Inquiry',
      guestWhatsapp: sub.guestWhatsapp,
      guestEmail: sub.guestEmail,
      guestContact: sub.guestContact,
      guestLang: mappedCustomLang,
      hotel: `${sub.destination} Custom Pickup`,
      adults: sub.adults,
      children: sub.children,
      infants: sub.infants ?? 0,
      grossEur: 0,
      supplierName: 'Wasla Custom Desk',
      assignedDriverOrGuide: '',
      paymentStatus: 'Awaiting link',
      status: 'Pending',
      notes: `Guide & Email Language: ${sub.guideLanguage} · ${sub.notes}`.trim(),
    };
    await createBookingInDb(newBooking);
    setCustomerRequests((prev) => [
      {
        id: newId,
        tripId: 'custom-itinerary',
        tripTitle: customTitle,
        supplierName: 'Wasla Custom Desk',
        destination: sub.destination,
        date: sub.date,
        tripStartTime: 'Custom schedule',
        adults: sub.adults,
        children: sub.children,
        infants: sub.infants ?? 0,
        totalEur: 0,
        hotel: `${sub.destination} Custom Pickup`,
        guestName: sub.guestName,
        guestCountry: sub.guestCountry?.trim() || 'Custom Inquiry',
        whatsapp: sub.guestWhatsapp,
        email: sub.guestEmail,
        contact: sub.guestContact,
        notes: newBooking.notes || '',
        createdAt: 'Just now',
      },
      ...prev,
    ]);
    void createChatInDb({
      id: `chat-${Date.now()}`,
      bookingRef: newId,
      customerName: sub.guestName,
      customerLang: lang,
      tripTitle: newBooking.tripTitle,
      pickupInfo: `${sub.destination} · ${sub.date} · ${sub.guideLanguage} guide`,
      unread: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          text: `Custom trip request (${sub.services.join(', ')}) for ${sub.adults} adults${
            sub.children ? `, ${sub.children} children` : ''
          }${sub.infants ? `, ${sub.infants} infants (INF)` : ''}. ${sub.notes}`,
          timestamp: 'Just now',
        },
      ],
    });
    return newId;
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newsletterEmail.trim();
    if (!cleaned || !cleaned.includes('@')) return;
    void subscribeNewsletterInDb(cleaned, lang);
    setLastSubscribedEmail(cleaned);
    setNewsletterConfirmed(true);
    setNewsletterEmail('');
  };

  const handleUpdateBooking = (id: string, patch: Partial<PlatformBooking>) => {
    void updateBookingInDb(id, patch);
  };

  const handleSendChatMessage = (threadId: string, text: string) => {
    void sendChatMessageInDb(threadId, text);
  };

  const handleUpdateComplaint = (id: string, patch: Partial<ComplaintCase>) => {
    void updateComplaintInDb(id, patch);
    if (patch.status === 'Refunded') {
      const target = complaints.find((c) => c.id === id);
      if (target && bookings.some((b) => b.id === target.bookingRef)) {
        void updateBookingInDb(target.bookingRef, { status: 'Refunded' });
      }
    }
  };

  const handleAddSupplierTrip = async (newTrip: Trip) => {
    await addSupplierTripInDb(newTrip);
  };

  const handleEnterPortal = (role: EffectiveRole) => {
    setPortalAuthOpen(false);
    setTouristPreviewOnly(false);
    if (role === 'owner') setWorkspace('owner');
    else if (role === 'operations') setWorkspace('operations');
    else if (role === 'supplier') setWorkspace('supplier');
  };

  const pendingOpsCount = bookings.filter((b) => b.status === 'Pending').length;

  const renderAnimatedBrand = (variant: 'header' | 'footer' = 'header') => {
    if (variant === 'footer') {
      return (
        <span dir="ltr" className="inline-flex items-center select-none">
          <WaslaLogo variant="full" theme="dark" className="h-10 sm:h-12 w-auto" />
        </span>
      );
    }

    return (
      <span dir="ltr" className="inline-flex items-center select-none">
        <WaslaLogo
          variant="full"
          theme={darkMode ? 'dark' : 'light'}
          className="h-8 sm:h-11 w-auto"
        />
      </span>
    );
  };

  const heroFocalStyle = {
    '--hfx': `${publicSettings.heroFocalXDesktop ?? 50}%`,
    '--hfy': `${publicSettings.heroFocalYDesktop ?? 50}%`,
    '--hfxm': `${publicSettings.heroFocalXMobile ?? 50}%`,
    '--hfym': `${publicSettings.heroFocalYMobile ?? 50}%`,
  } as React.CSSProperties;
  const customHeroCaption =
    lang === 'ar'
      ? publicSettings.heroCaptionAr
      : lang === 'de'
      ? publicSettings.heroCaptionDe
      : publicSettings.heroCaptionEn;
  const customHeroSubtitle =
    lang === 'ar'
      ? publicSettings.heroSubAr
      : lang === 'de'
      ? publicSettings.heroSubDe
      : publicSettings.heroSubEn;

  if (!isSiteUnlocked) {
    return <PrivateMaintenanceGate onUnlock={() => setIsSiteUnlocked(true)} />;
  }

  return (
    <WaslaMapsProvider lang={lang}>
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen overflow-x-hidden transition-colors duration-200 ${
        darkMode
          ? 'wasla-storefront-root bg-[#0F2233] text-slate-100'
          : 'wasla-storefront-root bg-[#FFFFFF] text-[#0F2233]'
      }`}
    >
      {/* Discreet Owner Private Gate Control Banner */}
      <div
        dir="rtl"
        className="sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-[#EE5426]/40 bg-[#0F2233] px-4 py-2 text-xs text-slate-200 shadow-md"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">🔒 وضع الإغلاق مفعّل للجمهور (Passcode: 4004)</span>
          <span className="hidden sm:inline text-slate-400">— أنت تتصفح حالياً بصلاحية الإدارة</span>
        </div>
        <button
          type="button"
          onClick={() => {
            lockPrivateGate();
            setIsSiteUnlocked(false);
          }}
          className="btn-wasla-primary gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>قفل الموقع مجدداً</span>
        </button>
      </div>
      {quotaExceeded && (
        <div
          role="alert"
          className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
        >
          <span>
            <strong>Maps Demo Key quota reached.</strong> Some Google Maps features on this page have stopped working. To restore full functionality, switch to a Google Cloud API key—see{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-amber-950"
            >
              Troubleshooting quota exceeded errors
            </a>
            .
          </span>
          <button
            onClick={() => setQuotaExceeded(false)}
            aria-label="Dismiss"
            className="text-amber-700 hover:text-amber-950 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real-time New Booking Audio + Visual Alert Banner (Staff & Owner Only) */}
      {effectiveRole !== 'none' && latestNewBooking && (
        <div
          dir="ltr"
          role="status"
          aria-live="polite"
          className="card-wasla fixed top-14 end-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border-[#EE5426] p-4 shadow-2xl space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EE5426]">
              <Bell className="h-4 w-4 animate-bounce" aria-hidden="true" />
              <span>New Booking Received · {latestNewBooking.id}</span>
            </span>
            <button
              type="button"
              onClick={dismissNewBookingAlert}
              className="rounded p-1 text-[#64748B] hover:text-[#0F2233] cursor-pointer"
              aria-label="Dismiss booking alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm font-semibold text-[#0F2233]">
            {latestNewBooking.guestName} · €{latestNewBooking.grossEur}
          </div>
          <div className="text-xs text-[#64748B] line-clamp-1">
            {latestNewBooking.tripTitle} ({latestNewBooking.date})
          </div>
          <div className="text-[11px] text-[#64748B] truncate">
            {[latestNewBooking.guestWhatsapp, latestNewBooking.guestEmail]
              .filter(Boolean)
              .join(' · ') || latestNewBooking.guestContact}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(effectiveRole === 'owner' || effectiveRole === 'operations') && (
              <button
                type="button"
                onClick={() => {
                  setWorkspace('operations');
                  setTouristPreviewOnly(false);
                  dismissNewBookingAlert();
                }}
                className="btn-wasla-primary flex-1 rounded-full px-3 py-1.5 text-xs cursor-pointer"
              >
                Open Reservations &amp; Dispatch
              </button>
            )}
            {(() => {
              const guestDigits = (latestNewBooking.guestWhatsapp || latestNewBooking.guestContact || '').replace(/\D/g, '');
              if (guestDigits.length < 7) return null;
              return (
                <a
                  href={`https://wa.me/${guestDigits}?text=${encodeURIComponent(
                    `Hello ${latestNewBooking.guestName}, we received your booking ${latestNewBooking.id} for ${latestNewBooking.tripTitle} on ${latestNewBooking.date}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#15803D]"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>WA Guest</span>
                </a>
              );
            })()}
            <button
              type="button"
              onClick={toggleSoundMuted}
              className="rounded-lg border border-[#C8C2B8] px-2.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F2233] cursor-pointer"
            >
              {soundMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>
      )}

      {/* Authenticated Staff & Partner Role Bar (completely hidden from public tourists) */}
      {effectiveRole !== 'none' && !touristPreviewOnly && (
        <div className="bg-[#FAF4ED] text-[#0F2233] border-b border-[#C8C2B8]/70" dir="ltr">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#475569]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#EE5426]">Wasla Team Bar</span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{user?.email || publicSettings.domain}</span>
              </div>
              <span className="text-[11px] text-[#475569] sm:hidden">Swipe tabs →</span>
            </div>

            <div
              className="no-scrollbar carousel-track flex w-full sm:w-auto items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0"
              role="tablist"
              aria-label="Switch platform view"
            >
              <button
                type="button"
                role="tab"
                aria-selected={workspace === 'storefront'}
                onClick={() => setWorkspace('storefront')}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  workspace === 'storefront'
                    ? 'btn-wasla-primary rounded-full px-3.5 py-1.5 text-xs'
                    : 'text-[#475569] hover:bg-[#C8C2B8]/30 hover:text-[#0F2233]'
                }`}
              >
                <Store className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Customer Storefront</span>
              </button>

              {(effectiveRole === 'owner' || effectiveRole === 'operations') && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={workspace === 'operations'}
                  onClick={() => setWorkspace('operations')}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
                    workspace === 'operations'
                      ? 'btn-wasla-primary rounded-full px-3.5 py-1.5 text-xs'
                      : 'text-[#475569] hover:bg-[#C8C2B8]/30 hover:text-[#0F2233]'
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reservations &amp; Dispatch ({pendingOpsCount})</span>
                </button>
              )}

              {(effectiveRole === 'owner' || effectiveRole === 'supplier') && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={workspace === 'supplier'}
                  onClick={() => setWorkspace('supplier')}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    workspace === 'supplier'
                      ? 'btn-wasla-primary rounded-full px-3.5 py-1.5 text-xs'
                      : 'text-[#475569] hover:bg-[#C8C2B8]/30 hover:text-[#0F2233]'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Supplier Portal</span>
                </button>
              )}

              {effectiveRole === 'owner' && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={workspace === 'owner'}
                  onClick={() => setWorkspace('owner')}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    workspace === 'owner'
                      ? 'btn-wasla-primary rounded-full px-3.5 py-1.5 text-xs'
                      : 'text-[#475569] hover:bg-[#C8C2B8]/30 hover:text-[#0F2233]'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Owner Control</span>
                </button>
              )}

              {/* Theme & App install inside Staff Role Bar only when not showing Storefront header */}
              {workspace !== 'storefront' && (
                <>
                  <ThemeSwitch
                    darkMode={darkMode}
                    onToggle={toggleAllWorkspacesTheme}
                    size="sm"
                    badgeLabel="All Pages"
                  />
                  <PWAInstallButton lang="en" darkMode={false} compact />
                </>
              )}

              <button
                type="button"
                onClick={toggleSoundMuted}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#C8C2B8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F2233] hover:bg-[#FAF4ED] whitespace-nowrap cursor-pointer"
                title="Toggle sound alerts for new bookings"
              >
                {soundMuted ? (
                  <VolumeX className="h-3.5 w-3.5 text-[#EF4444]" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                )}
              </button>

              {notifPerm === 'default' && (
                <button
                  type="button"
                  onClick={async () => {
                    const res = await requestDesktopAlertPermission();
                    setNotifPerm(res);
                  }}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#EE5426]/30 bg-[#FAF4ED] px-2.5 py-1.5 text-xs font-semibold text-[#EE5426] hover:bg-[#EE5426]/10 whitespace-nowrap cursor-pointer"
                  title="Allow desktop popup notifications"
                >
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Alerts</span>
                </button>
              )}

              {(workspace === 'owner' || workspace === 'operations') && (
                <button
                  type="button"
                  onClick={testBookingAlert}
                  className="shrink-0 inline-flex items-center rounded-lg border border-[#C8C2B8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F2233] hover:bg-[#FAF4ED] whitespace-nowrap cursor-pointer"
                  title="Test booking alert sound & notification"
                >
                  Test Alert
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setWorkspace('storefront');
                  setTouristPreviewOnly(true);
                }}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#C8C2B8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F2233] hover:bg-[#FAF4ED] whitespace-nowrap cursor-pointer"
                title="Hide role bar to preview live tourist site"
              >
                <Eye className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                <span>{t.previewTouristBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  void signOutUser();
                  setWorkspace('storefront');
                }}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#C8C2B8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F2233] hover:bg-[#FAF4ED] whitespace-nowrap cursor-pointer"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {workspace === 'operations' && (effectiveRole === 'owner' || effectiveRole === 'operations') && (
        <OperationsDesk
          bookings={bookings}
          trips={trips}
          suppliers={suppliers}
          chats={chats}
          complaints={complaints}
          emailLogs={emailLogs}
          commissionRate={commissionRate}
          whatsappNumber={publicSettings.whatsappNumber}
          whatsappDisplay={publicSettings.whatsappDisplay}
          contactEmail={publicSettings.email}
          darkMode={themeMap.operations}
          onToggleDarkMode={() => toggleWorkspaceTheme('operations')}
          soundMuted={soundMuted}
          onToggleSound={toggleSoundMuted}
          onTestAlert={testBookingAlert}
          onLogDispatchEmail={(to, subject, type, extra) =>
            void logDispatchEmailInDb(to, subject, type, extra)
          }
          onCreateBooking={(b) => createBookingInDb(b, { suppressSelfAlert: true })}
          onUpdateBooking={handleUpdateBooking}
          onSendChatMessage={handleSendChatMessage}
          onCreateChat={(chat) => void createChatInDb(chat)}
          onUpdateComplaint={handleUpdateComplaint}
        />
      )}

      {workspace === 'supplier' && (effectiveRole === 'owner' || effectiveRole === 'supplier') && (
        <SupplierPortal
          trips={trips}
          bookings={bookings}
          suppliers={suppliers}
          commissionRate={commissionRate}
          lockedSupplierName={effectiveRole === 'supplier' ? assignedSupplierName : ''}
          isOwnerUser={effectiveRole === 'owner'}
          darkMode={themeMap.supplier}
          onToggleDarkMode={() => toggleWorkspaceTheme('supplier')}
          onAddTrip={handleAddSupplierTrip}
          onUpdateTrip={updateTripInDb}
          onUpdateBooking={handleUpdateBooking}
        />
      )}

      {workspace === 'owner' && effectiveRole === 'owner' && (
        <OwnerControl
          trips={trips}
          bookings={bookings}
          suppliers={suppliers}
          chats={chats}
          complaints={complaints}
          emailLogs={emailLogs}
          newsletterEmails={subscribedEmails}
          commissionRate={commissionRate}
          airTicketsEnabled={publicSettings.airTicketsEnabled}
          pendingAccessRequests={accessRequests}
          staffRoles={staffRoles}
          adminUsers={adminUsers}
          isPrimaryOwner={isPrimaryOwner}
          tripReviews={tripReviews}
          publicSettings={publicSettings}
          onLogDispatchEmail={(to, subject, type) => void logDispatchEmailInDb(to, subject, type)}
          onApproveAccessRequest={approveAccessRequest}
          onGrantCoOwner={grantFullOwnerAccess}
          onRevokeAccess={revokePortalAccess}
          onCreateTrip={addSupplierTripInDb}
          onUpdateTrip={updateTripInDb}
          onDeleteTrip={deleteTripInDb}
          onUpdateTripApproval={updateTripApprovalInDb}
          onUpdateTripReviewApproval={updateTripReviewApprovalInDb}
          onSavePublicSettings={updatePublicSettingsInDb}
          onChangeCommissionRate={(rate) => void updateCommissionRateInDb(rate)}
          onToggleAirTickets={() =>
            void updatePublicSettingsInDb({ airTicketsEnabled: !publicSettings.airTicketsEnabled })
          }
          onUpdateBooking={handleUpdateBooking}
          onSendChatMessage={handleSendChatMessage}
          onCreateChat={(chat) => void createChatInDb(chat)}
          onUpdateSupplierStatus={(id, status) => void updateSupplierStatusInDb(id, status)}
        />
      )}

      {workspace === 'storefront' && (
        <>
          {/* Strict 3-Zone Header */}
          <header
            className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-200 ${
              darkMode
                ? 'border-[#334155] bg-[#0F2233]/95 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)]'
                : 'border-[#C8C2B8]/50 bg-[#FFFFFF]/95 shadow-[0_1px_12px_-4px_rgba(15,34,51,0.06)]'
            }`}
          >
            <div className="mx-auto flex h-16 sm:h-[70px] max-w-[1200px] items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6">
              <a
                href="#top"
                aria-label="Wasla Travel — وصلة ترافيل"
                className="whitespace-nowrap shrink-0"
              >
                {renderAnimatedBrand('header')}
              </a>

              <nav
                className={`hidden lg:flex items-center gap-5 xl:gap-7 text-[14px] font-semibold tracking-[-0.01em] transition-colors ${
                  darkMode ? 'text-slate-100' : 'text-[#0F2233]'
                }`}
                aria-label="Primary"
              >
                {[
                  { href: '#hurghada-marsa-alam', label: t.navHurghada },
                  { href: '#cairo-luxor', label: t.navCairoLuxor },
                  { href: '#all-trips', label: t.navAllTrips },
                  { href: '#contact', label: tText({ en: 'Contact Us', ar: 'تواصل معنا', de: 'Kontakt' }, lang) },
                ].map((navLink) => (
                  <a
                    key={navLink.href}
                    href={navLink.href}
                    className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-200 hover:after:scale-x-100 ${
                      darkMode
                        ? 'hover:text-[#EE5426] after:bg-[#EE5426]'
                        : 'hover:text-[#EE5426] after:bg-[#EE5426]'
                    }`}
                  >
                    {navLink.label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {/* Consolidated Language + Currency Selector (e.g. EN · EUR) */}
                <LanguageSelector
                  lang={lang}
                  onChange={setLang}
                  variant="header"
                  currency={currency}
                  onChangeCurrency={setCurrency}
                />

                {/* Track My Booking Quick Button (Desktop) */}
                <button
                  type="button"
                  onClick={() => setTrackBookingOpen(true)}
                  className={`hidden md:inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    darkMode
                      ? 'text-slate-200 hover:bg-white/10 hover:text-white'
                      : 'text-[#334155] hover:bg-[#FAF4ED] hover:text-[#0F2233]'
                  }`}
                >
                  <Ticket className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                  <span>
                    {tText({ en: 'Track Booking', ar: 'تتبّع حجزك', de: 'Buchung prüfen' }, lang)}
                  </span>
                </button>

                {/* Storefront Light-Dark Switch */}
                <ThemeSwitch
                  darkMode={darkMode}
                  onToggle={toggleAllWorkspacesTheme}
                  lang={lang}
                  size="sm"
                />

                {/* Subtle Icon-Only PWA Install Trigger */}
                <PWAInstallButton lang={lang} darkMode={darkMode} iconOnly />

                {/* Brand-consistent Primary Header CTA */}
                <button
                  type="button"
                  onClick={() => setWhatsappOpen(true)}
                  className="btn-wasla-primary min-h-[36px] sm:min-h-[40px] gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-1.5 text-[13px] tracking-[-0.01em] whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {customerRequests.length > 0
                      ? `${t.deskCount} (${customerRequests.length})`
                      : tText({ en: 'Contact Desk', ar: 'تواصل معنا', de: 'Kontakt' }, lang)}
                  </span>
                </button>

                {/* Mobile Navigation Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  aria-expanded={mobileMenuOpen}
                  aria-label={tText({ en: 'Menu', ar: 'القائمة', de: 'Menü' }, lang)}
                  className={`lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                    darkMode
                      ? 'border-[#334155] bg-[#19354F] text-slate-100'
                      : 'border-[#C8C2B8]/60 bg-white text-[#0F2233]'
                  }`}
                >
                  {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div
                className={`lg:hidden border-t px-4 py-4 space-y-4 ${
                  darkMode
                    ? 'border-[#334155] bg-[#0F2233] text-slate-100'
                    : 'border-[#C8C2B8]/50 bg-white text-[#0F2233]'
                }`}
              >
                <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
                  {[
                    { href: '#hurghada-marsa-alam', label: t.navHurghada },
                    { href: '#cairo-luxor', label: t.navCairoLuxor },
                    { href: '#all-trips', label: t.navAllTrips },
                    { href: '#how-it-works', label: tText({ en: 'How It Works', ar: 'كيف نحجز', de: 'So funktioniert’s' }, lang) },
                    { href: '#faq', label: tText({ en: 'FAQ', ar: 'الأسئلة الشائعة', de: 'FAQ' }, lang) },
                    { href: '#contact', label: tText({ en: 'Contact Us', ar: 'تواصل معنا', de: 'Kontakt' }, lang) },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                        darkMode
                          ? 'border-[#334155] bg-[#19354F]/60 hover:border-[#EE5426]'
                          : 'border-[#C8C2B8]/50 bg-[#FAF4ED] hover:border-[#EE5426]'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setTrackBookingOpen(true);
                    }}
                    className="rounded-xl border border-[#EE5426]/30 bg-[#FAF4ED] px-3 py-2.5 text-start text-xs font-semibold text-[#EE5426] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Ticket className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {tText({ en: 'Track Booking', ar: 'تتبّع حجزك', de: 'Buchung prüfen' }, lang)}
                    </span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0]/40 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCustomInitialServices(undefined);
                        setCustomTripOpen(true);
                      }}
                      className="rounded-full border border-[#EE5426] px-3 py-1.5 text-xs font-semibold text-[#EE5426] cursor-pointer"
                    >
                      {t.quickJumpCustom}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openPolicies('terms');
                      }}
                      className="rounded-full border border-[#CBD5E1] px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {t.footerPolicies}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setPortalAuthOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#EE5426] cursor-pointer"
                  >
                    <Lock className="h-3 w-3" />
                    <span>{t.staffPortalLogin}</span>
                  </button>
                </div>
              </div>
            )}
          </header>

          <main id="top" className="overflow-x-clip">
            {/* 1. HERO */}
            <section className="wasla-hero-glare relative overflow-hidden bg-[#F8FAFC]" aria-labelledby="hero-title">
              {/* Image zone: photo + neutral scrim + eyebrow/headline only */}
              <div className="relative overflow-hidden text-white">
                <div
                  className="absolute inset-0 will-change-transform"
                  style={{ transform: `translate3d(0, ${heroScrollY * 0.16}px, 0) scale(1.06)` }}
                >
                  <img
                    src={
                      publicSettings.heroImageUrl
                        ? resolveBundledMediaUrl(publicSettings.heroImageUrl)
                        : SITE_CONFIG.heroBackground
                    }
                    alt="Red Sea coastline in Hurghada"
                    onError={(e) => {
                      if (e.currentTarget.src !== SITE_CONFIG.heroBackground) {
                        e.currentTarget.src = SITE_CONFIG.heroBackground;
                      }
                    }}
                    className="wasla-hero-img h-full w-full object-cover"
                    style={heroFocalStyle}
                  />
                </div>
                <div className="absolute inset-0 wasla-hero-scrim" />

                <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-20 pb-10 lg:pb-28 space-y-8">
                  <div className="hero-enter">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/85">{t.heroEyebrow}</p>
                  </div>

                  <div className="max-w-[640px] space-y-4 hero-enter">
                    <h1
                      id="hero-title"
                      className="font-hero-standard text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.05] font-bold tracking-[-0.02em] text-white text-balance"
                    >
                      {customHeroCaption ? (
                        customHeroCaption
                      ) : (
                        <>
                          {t.heroTitleLine1}
                          <br />
                          <span className="text-[#F97316]">{t.heroTitleLine2}</span>
                        </>
                      )}
                    </h1>
                    <p className="font-hero-standard text-[15px] sm:text-base leading-relaxed text-white/90">
                      {customHeroSubtitle || t.heroLede}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form zone: below the image on mobile, overlapping it on desktop */}
              <div className="relative z-20 mx-auto max-w-[1200px] px-4 sm:px-6 pt-4 lg:pt-0 pb-0 lg:-mt-16">
                <form
                  onSubmit={handleHeroSearch}
                  role="search"
                  className="wasla-led-ring hero-enter-delayed max-w-5xl rounded-2xl bg-white p-2.5 text-[#0F2233]"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_112px] lg:grid-cols-[1.05fr_1.25fr_1fr_168px] gap-2.5 items-center">
                    <label className="block px-2 py-2 col-span-2 lg:col-span-1">
                      <span className="block text-[11px] font-semibold text-[#64748B]">
                        {t.searchDestinationLabel}
                      </span>
                      <div className="relative mt-0.5">
                        <select
                          value={searchDestination}
                          onChange={(e) => setSearchDestination(e.target.value as DestinationRegion | 'all')}
                          className="w-full appearance-none bg-transparent pe-6 text-[15px] font-semibold text-[#0F2233] focus:outline-none cursor-pointer"
                        >
                          <option value="all">{t.searchAllDestinations}</option>
                          <option value="Hurghada">Hurghada</option>
                          <option value="Marsa Alam">Marsa Alam</option>
                          <option value="Luxor">Luxor</option>
                          <option value="Cairo">Cairo</option>
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] stroke-[1.75]"
                          aria-hidden="true"
                        />
                      </div>
                    </label>

                    <label className="block px-2 py-2 col-span-2 lg:col-span-1 border-t border-[#E7E0D2] lg:border-t-0 lg:border-s">
                      <span className="block text-[11px] font-semibold text-[#64748B]">
                        {t.searchActivityLabel}
                      </span>
                      <div className="relative mt-0.5">
                        <select
                          value={searchActivity}
                          onChange={(e) => setSearchActivity(e.target.value as ActivityCategoryId | 'all')}
                          className="w-full appearance-none bg-transparent pe-6 text-[15px] font-semibold text-[#0F2233] focus:outline-none cursor-pointer"
                        >
                          <option value="all">{t.searchAllActivities}</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {tText(cat.name, lang)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] stroke-[1.75]"
                          aria-hidden="true"
                        />
                      </div>
                    </label>

                    <label className="block px-2 py-2 border-t border-[#E7E0D2] lg:border-t-0 lg:border-s">
                      <span className="block text-[11px] font-semibold text-[#64748B]">
                        {tText({ en: 'Trip date', ar: 'تاريخ الرحلة', de: 'Reisedatum' }, lang)}
                      </span>
                      <div className="relative mt-0.5">
                        <input
                          type="date"
                          value={searchTripDate}
                          min={todayIso}
                          aria-label={tText({ en: 'Trip date', ar: 'تاريخ الرحلة', de: 'Reisedatum' }, lang)}
                          onChange={(e) => setSearchTripDate(e.target.value)}
                          className={`w-full bg-transparent pe-6 text-[15px] font-semibold focus:outline-none tabular-nums [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                            searchTripDate ? 'text-[#0F2233]' : 'text-transparent'
                          }`}
                        />
                        {!searchTripDate && (
                          <span className="pointer-events-none absolute start-0 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#64748B]">
                            {tText({ en: 'Any date', ar: 'أي تاريخ', de: 'Beliebiges Datum' }, lang)}
                          </span>
                        )}
                        {searchTripDate ? (
                          <button
                            type="button"
                            aria-label={tText(
                              { en: 'Clear date', ar: 'مسح التاريخ', de: 'Datum löschen' },
                              lang
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchTripDate('');
                            }}
                            className="absolute end-0 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F2233] cursor-pointer"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <CalendarDays
                            className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] stroke-[1.75]"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      {searchTripDate && tripDateCaption && (
                        <span className="mt-0.5 block text-[11px] font-semibold text-[#EE5426]">
                          {tripDateCaption}
                        </span>
                      )}
                    </label>

                    <div>
                      <button
                        type="submit"
                        className="btn-wasla-primary min-h-[50px] lg:min-h-[52px] w-full rounded-xl px-2 lg:px-4 text-[15px] font-bold whitespace-nowrap cursor-pointer"
                      >
                        <Search className="hidden h-4 w-4 lg:block" aria-hidden="true" />
                        <span>
                          {tText(
                            { en: 'Search trips', ar: 'بحث الرحلات', de: 'Trips suchen' },
                            lang
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Unboxed Hero Trust & Payment Transparency Strip */}
                <div className="flex flex-wrap items-center gap-x-7 gap-y-2 pt-4 pb-5 lg:pt-5 lg:pb-6 text-[12.5px] lg:text-[13.5px] font-medium leading-[1.4] tracking-[0.01em] text-[#334155]">
                  {[
                    {
                      en: 'Vetted local operators',
                      ar: 'مشغّلون محليون معتمدون',
                      de: 'Geprüfte lokale Anbieter',
                    },
                    {
                      en: 'No hidden markups',
                      ar: 'أسعار شفافة بدون عمولات خفية',
                      de: 'Keine versteckten Aufschläge',
                    },
                    {
                      en: 'Free 24h cancellation',
                      ar: 'إلغاء مجاني قبل 24 ساعة',
                      de: '24 Std. kostenlos stornierbar',
                    },
                    {
                      en: 'Pay cash on pickup',
                      ar: 'كاش عند الاستلام',
                      de: 'Bar vor Ort',
                    },
                  ].map((item) => (
                    <span key={item.en} className="inline-flex items-center gap-1.5">
                      <Check
                        className="h-[13px] w-[13px] lg:h-3.5 lg:w-3.5 shrink-0 text-[#EE5426]"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      {tText(item, lang)}
                    </span>
                  ))}
                  {currency !== 'EUR' && (
                    <span className="text-[#B45309]">
                      {tText(
                        {
                          en: 'EUR (€) base currency · converted amounts are approximate',
                          ar: 'اليورو (€) عملة أساسية والأسعار المحوّلة تقديرية',
                          de: 'Basiswährung EUR (€) · Richtwerte',
                        },
                        lang
                      )}
                    </span>
                  )}
                </div>

                {publicSettings.airTicketsEnabled && (
                  <div className="mb-5 lg:mb-6 inline-flex items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-medium text-[#334155]">
                    <Plane className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                    <span>
                      {tText(
                        {
                          en: 'Domestic Flight Assistance (Hurghada · Cairo · Luxor) available on request',
                          ar: 'خدمة حجز الطيران الداخلي (الغردقة · القاهرة · الأقصر) متاحة عند الطلب',
                          de: 'Inlandsflug-Service (Hurghada · Kairo · Luxor) auf Anfrage verfügbar',
                        },
                        lang
                      )}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Destination & Service Filter Strip (Visually separated Destinations vs Trip Types) */}
            <nav
              aria-label="Quick destinations and services"
              className="border-b border-[#C8C2B8]/60 bg-[#FAF4ED] [border-top:1px_solid_#EDE8DD]"
            >
              <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-3">
                <div className="no-scrollbar carousel-track flex items-center gap-2 overflow-x-auto snap-x snap-proximity py-0.5">
                  {favoriteTripIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFavoritesModalOpen(true)}
                      className="snap-start shrink-0 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#E11D48] bg-[#E11D48] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                    >
                      <Heart className="h-3.5 w-3.5 fill-white text-white" aria-hidden="true" />
                      <span>
                        {tText({ en: 'Favorites', ar: 'المفضلة', de: 'Favoriten' }, lang)} ({favoriteTripIds.length})
                      </span>
                    </button>
                  )}

                  {/* Group 1: Destinations */}
                  <div className="flex items-center gap-2 shrink-0">
                    {[
                      { label: t.quickJumpHurghada, dest: 'Hurghada' as DestinationRegion },
                      { label: t.quickJumpMarsa, dest: 'Marsa Alam' as DestinationRegion },
                      { label: t.quickJumpLuxor, dest: 'Luxor' as DestinationRegion },
                      { label: t.quickJumpCairo, dest: 'Cairo' as DestinationRegion },
                    ].map((item) => {
                      const active = searchDestination === item.dest;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setSearchDestination(item.dest);
                            setSearchActivity('all');
                            const match = liveTrips.find((tr) => tr.destination === item.dest);
                            if (match) setSelectedExplorerTripId(match.id);
                            smoothScrollTo('all-trips');
                          }}
                          className={`snap-start shrink-0 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold active:scale-95 transition-all whitespace-nowrap cursor-pointer ${
                            active
                              ? 'border-[#0F2233] bg-[#0F2233] text-white'
                              : 'border-[#E2E8F0] bg-white text-[#0F2233] hover:border-[#0F2233]/40 hover:bg-white'
                          }`}
                        >
                          <MapPin
                            className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[#FDBA74]' : 'text-[#EE5426]'}`}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#C8C2B8] shrink-0" />

                  {/* Group 2: Trip Types */}
                  <div className="flex items-center gap-2 shrink-0">
                    {[
                      { label: t.quickJumpTransfers, cat: 'transfers' as ActivityCategoryId, icon: Car },
                      { label: t.quickJumpCityTour, cat: 'city' as ActivityCategoryId, icon: Compass },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = searchActivity === item.cat;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setSearchDestination('all');
                            setSearchActivity(item.cat);
                            const match = liveTrips.find((tr) => tr.category === item.cat);
                            if (match) setSelectedExplorerTripId(match.id);
                            smoothScrollTo('all-trips');
                          }}
                          className={`snap-start shrink-0 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold active:scale-95 transition-all whitespace-nowrap cursor-pointer ${
                            active
                              ? 'border-[#0F2233] bg-[#0F2233] text-white'
                              : 'border-[#C8C2B8]/60 bg-white text-[#0F2233] hover:border-[#0F2233]/40'
                          }`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[#FDBA74]' : 'text-[#EE5426]'}`}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setCustomInitialServices(undefined);
                        setCustomTripOpen(true);
                      }}
                      className="btn-wasla-primary snap-start shrink-0 min-h-[36px] gap-1.5 rounded-lg px-4 py-1.5 text-xs whitespace-nowrap cursor-pointer"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{t.quickJumpCustom}</span>
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 space-y-16 sm:space-y-20 py-12 sm:py-16">
              {/* 1. HURGHADA AND MARSA ALAM (Primary Red Sea Catalog) */}
              <section id="hurghada-marsa-alam" className="scroll-mt-20">
                <Carousel
                  variant="cards"
                  isRtl={isRtl}
                  ariaLabel={t.sectionHurghadaMarsa}
                  isLoading={tripsLoading}
                  headerTitle={
                    <h2 className="font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight text-[#0F2233]">
                      {t.sectionHurghadaMarsa}
                    </h2>
                  }
                  headerSubtitle={
                    <p className="text-[15px] leading-relaxed text-[#52525B]">{t.sectionHurghadaMarsaSub}</p>
                  }
                >
                  {hurghadaMarsaTrips.map((trip, idx) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      lang={lang}
                      t={t}
                      currency={currency}
                      onSelect={openTripDetail}
                      isFavorite={favoriteTripIds.includes(trip.id)}
                      onToggleFavorite={handleToggleFavoriteTrip}
                      revealIndex={idx}
                    />
                  ))}
                </Carousel>
              </section>

              {/* 2. CAIRO AND LUXOR (Iconic Heritage Day Trips) */}
              <section id="cairo-luxor" className="scroll-mt-20">
                <Carousel
                  variant="cards"
                  isRtl={isRtl}
                  ariaLabel={t.sectionCairoLuxor}
                  isLoading={tripsLoading}
                  headerTitle={
                    <h2 className="font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight text-[#0F2233]">
                      {t.sectionCairoLuxor}
                    </h2>
                  }
                  headerSubtitle={
                    <p className="text-[15px] leading-relaxed text-[#64748B]">{t.sectionCairoLuxorSub}</p>
                  }
                >
                  {cairoLuxorTrips.map((trip, idx) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      lang={lang}
                      t={t}
                      currency={currency}
                      onSelect={openTripDetail}
                      isFavorite={favoriteTripIds.includes(trip.id)}
                      onToggleFavorite={handleToggleFavoriteTrip}
                      revealIndex={idx}
                    />
                  ))}
                </Carousel>
              </section>

              {/* 3. BROWSE BY ACTIVITY STYLE */}
              <section id="activities" className="scroll-mt-20" aria-labelledby="all-activities-heading">
                <Carousel
                  variant="cards"
                  isRtl={isRtl}
                  ariaLabel={t.sectionAllActivities}
                  headerTitle={
                    <h2
                      id="all-activities-heading"
                      className="font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight text-[#0F2233]"
                    >
                      {t.sectionAllActivities}
                    </h2>
                  }
                  headerSubtitle={
                    <p className="text-[15px] leading-relaxed text-[#52525B]">{t.sectionAllActivitiesSub}</p>
                  }
                >
                  {CATEGORIES.map((cat, idx) => {
                    const count = categoryCounts[cat.id];
                    const catTitle = tText(cat.name, lang);
                    const isCatActive = searchActivity === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        data-wasla-revealed="1"
                        style={{ '--reveal-delay': `${Math.min(idx, 4) * 70}ms` } as React.CSSProperties}
                        onClick={() => {
                          setSearchDestination('all');
                          setSearchActivity(cat.id);
                          const match = liveTrips.find((tr) => tr.category === cat.id);
                          if (match) setSelectedExplorerTripId(match.id);
                          smoothScrollTo('all-trips');
                        }}
                        className={`reveal-item is-revealed snap-start shrink-0 basis-[78%] sm:basis-[calc((100%-20px)/2)] lg:basis-[calc((100%-60px)/4)] group relative h-[280px] sm:h-[300px] rounded-xl overflow-hidden border text-start cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${
                          isCatActive
                            ? 'border-[#EE5426] ring-2 ring-[#EE5426]/40'
                            : 'border-[#E2E8F0]'
                        }`}
                      >
                        <SmartImage
                          src={cat.image}
                          fallbackSrc={CATEGORY_FALLBACK_IMAGE[cat.id]}
                          alt={catTitle}
                          loading="eager"
                          className="h-full w-full group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                          placeholderLabel={catTitle}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F2233]/86 via-[#0F2233]/22 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-1">
                          <span className="inline-block opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 text-[11px] font-medium text-[#FDBA74]">
                            {t.scrollToSectionHint} →
                          </span>
                          <h3 className="font-display text-xl font-semibold text-white">{catTitle}</h3>
                          <p className="text-xs font-medium text-white/80 tabular-nums">
                            {count} {count === 1 ? t.tripsCountSingle : t.tripsCountPlural}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </Carousel>
              </section>

              {/* 4. ALL TRIPS EXPLORER */}
              <section id="all-trips" className="space-y-5 scroll-mt-20">
                <div className="reveal-item flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="space-y-1.5">
                    <h2 className="font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight text-[#0F2233]">
                      {t.sectionAllTrips}
                    </h2>
                    <p className="text-[15px] leading-relaxed text-[#64748B]">{t.sectionAllTripsSub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomInitialServices(undefined);
                      setCustomTripOpen(true);
                    }}
                    className="self-start sm:self-auto text-sm font-semibold text-[#EE5426] hover:underline underline-offset-4 cursor-pointer"
                  >
                    {tText(
                      {
                        en: 'Need a customized itinerary or guide? →',
                        ar: 'هل تحتاج برنامجاً مخصصاً أو مرشداً خاصاً؟ ←',
                        de: 'Individuelle Route oder Guide gewünscht? →',
                      },
                      lang
                    )}
                  </button>
                </div>

                {hasCustomSearchFilters && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EE5426]/25 bg-[#FAF4ED] px-4 py-2.5 text-xs text-[#0F2233]">
                    <div className="flex flex-wrap items-center gap-2 tabular-nums">
                      <CalendarDays className="h-4 w-4 text-[#EE5426] shrink-0" aria-hidden="true" />
                      <span className="font-semibold">
                        {heroFilteredTrips.length} / {liveTrips.length}{' '}
                        {heroFilteredTrips.length === 1 ? t.tripsCountSingle : t.tripsCountPlural}
                      </span>
                      {normalizedDateRange.startDate && normalizedDateRange.endDate && (
                        <>
                          <span aria-hidden="true" className="text-[#94A3B8]">·</span>
                          <span className="font-medium text-[#475569]">
                            {normalizedDateRange.startDate === normalizedDateRange.endDate
                              ? normalizedDateRange.startDate
                              : `${normalizedDateRange.startDate} → ${normalizedDateRange.endDate}`}
                          </span>
                        </>
                      )}
                      {searchDestination !== 'all' && (
                        <>
                          <span aria-hidden="true" className="text-[#94A3B8]">·</span>
                          <span className="font-semibold text-[#EE5426]">{searchDestination}</span>
                        </>
                      )}
                      {searchActivity !== 'all' && (
                        <>
                          <span aria-hidden="true" className="text-[#94A3B8]">·</span>
                          <span className="font-semibold text-[#EE5426]">{getCategoryLabel(searchActivity)}</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={resetHeroFilters}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#EE5426] hover:underline underline-offset-4 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {tText(
                          { en: 'Reset filters', ar: 'إعادة ضبط الفلاتر', de: 'Filter zurücksetzen' },
                          lang
                        )}
                      </span>
                    </button>
                  </div>
                )}

                <div className="reveal-item">
                  <TripExplorer
                    trips={heroFilteredTrips}
                    selectedTripId={selectedExplorerTripId}
                    onSelectTripId={setSelectedExplorerTripId}
                    onBookTrip={openTripDetail}
                    lang={lang}
                    t={t}
                    isRtl={isRtl}
                    currency={currency}
                    isLoading={tripsLoading}
                    favoriteTripIds={favoriteTripIds}
                    onToggleFavorite={handleToggleFavoriteTrip}
                    activeDateRange={normalizedDateRange}
                    onResetFilters={resetHeroFilters}
                  />
                </div>
              </section>

              {/* 5. HOW BOOKING WORKS, WASLA STANDARDS & BESPOKE SERVICES */}
              <HowItWorksSection
                lang={lang}
                t={t}
                onOpenCustomTrip={(services) => {
                  setCustomInitialServices(services);
                  setCustomTripOpen(true);
                }}
                onOpenPolicies={() => openPolicies('payment')}
              />

              {/* 6. VERIFIED TRAVELER MOMENTS & REVIEWS */}
              <section id="moments" className="scroll-mt-20">
                <MomentsReviewCarousel
                  moments={mergedMoments}
                  trips={liveTrips}
                  fallbackTrip={TRIPS[0]}
                  lang={lang}
                  t={t}
                  isRtl={isRtl}
                  isModalOpen={activeMomentIndex !== null}
                  onOpenMoment={(idx) => setActiveMomentIndex(idx)}
                  onSelectTrip={openTripDetail}
                />
              </section>

              {/* 7. FREQUENTLY ASKED QUESTIONS */}
              <StorefrontFaq lang={lang} />

              {/* 8. DIRECT CONTACT & LOCAL HURGHADA SUPPORT DESK */}
              <ContactSupportSection
                lang={lang}
                isRtl={isRtl}
                whatsappNumber={publicSettings.whatsappNumber}
                contactEmail={publicSettings.email}
              />

              {/* 9. QUIET PRE-FOOTER: NEWSLETTER & QUICK EXPLORE DIRECTORY */}
              <div className="space-y-10 border-t border-[#C8C2B8]/50 pt-10">
                <section className="reveal-item">
                  <div className="card-wasla bg-[#FAF4ED] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EE5426]">
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.newsletterEyebrow}</span>
                      </div>
                      <h2 className="font-display text-2xl font-semibold text-[#0F2233]">{t.newsletterTitle}</h2>
                      <p className="text-sm text-[#64748B]">{t.newsletterSub}</p>
                    </div>

                    {newsletterConfirmed ? (
                      <div className="rounded-xl border border-[#EE5426]/25 bg-white px-4 py-3 text-sm font-medium text-[#0F2233]">
                        {t.newsletterSuccess}{' '}
                        <span className="tabular-nums text-[#64748B]">
                          ({lastSubscribedEmail || subscribedEmails[subscribedEmails.length - 1]})
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <input
                          type="email"
                          required
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder={t.newsletterPlaceholder}
                          className="input-wasla min-h-[44px] w-full sm:w-64 text-sm"
                          aria-label={t.newsletterTitle}
                        />
                        <button
                          type="submit"
                          className="btn-wasla-primary min-h-[44px] px-6 py-2.5 text-sm whitespace-nowrap cursor-pointer"
                        >
                          {t.newsletterButton}
                        </button>
                      </form>
                    )}
                  </div>
                </section>

                <section aria-label="Quick destination links">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {TOP_LINK_COLUMNS.map((col, idx) => (
                      <div
                        key={col.key}
                        style={{ '--reveal-delay': `${idx * 60}ms` } as React.CSSProperties}
                        className="reveal-item space-y-3"
                      >
                        <h3 className="text-sm font-bold text-[#0F2233]">{t.topLinksColumns[col.key]}</h3>
                        <ul className="space-y-2">
                          {col.links.map((entry, lIdx) => (
                            <li key={lIdx}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (entry.tripId) {
                                    setSelectedExplorerTripId(entry.tripId);
                                    smoothScrollTo('all-trips');
                                  } else if (entry.sectionId) {
                                    smoothScrollTo(entry.sectionId);
                                  }
                                }}
                                className="text-start text-sm text-[#475569] hover:text-[#EE5426] hover:underline underline-offset-4 transition-colors cursor-pointer"
                              >
                                {tText(entry.label, lang)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </main>

          {/* 10B. DEEP RED SEA NAVY FOOTER */}
          <footer className="wasla-footer-glare border-t border-white/10 text-white">
            <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 pt-12 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Brand & Direct Contact */}
                <div className="md:col-span-5 space-y-3.5">
                  <div className="inline-block font-display text-2xl font-bold text-white">
                    {renderAnimatedBrand('footer')}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300 max-w-sm">
                    {t.heroEyebrow} ·{' '}
                    <a
                      href={`mailto:${publicSettings.email}`}
                      className="font-semibold text-[#FDBA74] hover:text-white underline-offset-4 hover:underline transition-colors"
                    >
                      {publicSettings.email}
                    </a>
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setWhatsappOpen(true)}
                      className="wasla-wa-glare inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      <span>{t.askWhatsapp}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrackBookingOpen(true)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/20 bg-white/8 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/15 hover:border-white/35 transition-colors cursor-pointer"
                    >
                      <Ticket className="h-4 w-4 text-[#FDBA74]" aria-hidden="true" />
                      <span>
                        {tText({ en: 'Track Booking', ar: 'تتبّع حجزك', de: 'Buchung prüfen' }, lang)}
                      </span>
                    </button>
                    <a
                      href={`mailto:${publicSettings.email}`}
                      aria-label={publicSettings.email}
                      title={publicSettings.email}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/8 text-white hover:bg-white/15 hover:border-white/35 transition-colors"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Navigation & Support Links */}
                <div className="md:col-span-4 grid grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                      {t.navAllTrips}
                    </p>
                    <ul className="space-y-2 font-semibold">
                      <li>
                        <a href="#hurghada-marsa-alam" className="text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors">
                          {t.navHurghada}
                        </a>
                      </li>
                      <li>
                        <a href="#cairo-luxor" className="text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors">
                          {t.navCairoLuxor}
                        </a>
                      </li>
                      <li>
                        <a href="#activities" className="text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors">
                          {tText({ en: 'Browse by Activity', ar: 'الأنشطة والرحلات', de: 'Aktivitäten' }, lang)}
                        </a>
                      </li>
                      <li>
                        <a href="#all-trips" className="text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors">
                          {t.navAllTrips}
                        </a>
                      </li>
                      <li>
                        <a href="#how-it-works" className="text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors">
                          {tText({ en: 'How Booking Works', ar: 'كيف تعمل الحجوزات', de: 'So funktioniert’s' }, lang)}
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                      {t.footerWhatsapp}
                    </p>
                    <ul className="space-y-2 font-semibold">
                      <li>
                        <a href="#contact" className="text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors">
                          {tText({ en: 'Contact & Support Desk', ar: 'تواصل معنا والدعم', de: 'Kontakt & Support' }, lang)}
                        </a>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => setTrackBookingOpen(true)}
                          className="text-start text-white/90 hover:text-white hover:underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          {tText({ en: 'Track My Booking', ar: 'تتبّع حالة حجزك', de: 'Buchung verfolgen' }, lang)}
                        </button>
                      </li>
                      <li>
                        <a href="#faq" className="text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors">
                          {tText({ en: 'FAQ', ar: 'الأسئلة الشائعة', de: 'FAQ' }, lang)}
                        </a>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => openPolicies('terms')}
                          className="text-start text-white/90 hover:text-white hover:underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          {t.footerPolicies}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => openPolicies('payment')}
                          className="text-start text-white/90 hover:text-white hover:underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          {tText({ en: 'Payment & Transfers', ar: 'الدفع والتوصيل', de: 'Zahlung & Transfer' }, lang)}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => openPolicies('privacy')}
                          className="text-start text-white/90 hover:text-white hover:underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          {tText({ en: 'Privacy & GDPR', ar: 'سياسة الخصوصية (GDPR)', de: 'Datenschutz (DSGVO)' }, lang)}
                        </button>
                      </li>
                      <li className="pt-1">
                        {effectiveRole !== 'none' && touristPreviewOnly ? (
                          <button
                            type="button"
                            onClick={() => setTouristPreviewOnly(false)}
                            className="inline-flex min-h-[36px] items-center rounded-lg border border-white bg-white px-3 py-1.5 text-[11px] font-bold text-[#0F2233] hover:bg-[#FAF4ED] cursor-pointer shadow-xs transition-colors"
                          >
                            Team Portals
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPortalAuthOpen(true)}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/15 hover:border-white/35 cursor-pointer transition-colors"
                          >
                            <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span>{t.staffPortalLogin}</span>
                          </button>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Modern Global Language Switcher */}
                <div className="md:col-span-3 space-y-2.5">
                  <LanguageSelector lang={lang} onChange={setLang} variant="footer" />
                </div>
              </div>

              {/* Bottom Hairline Bar */}
              <div className="mt-8 pt-5 border-t border-white/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-medium text-slate-300">
                <span>{t.footerRights}</span>
                <span className="font-mono text-slate-400">{publicSettings.domain}</span>
              </div>
            </div>
          </footer>

          {/* Desktop Floating WhatsApp FAB */}
          <button
            type="button"
            onClick={() => setWhatsappOpen(true)}
            className="wasla-wa-glare whatsapp-pulse hidden md:inline-flex fixed bottom-5 end-5 z-40 h-12 w-12 items-center justify-center rounded-full text-white cursor-pointer"
            aria-label={t.askWhatsapp}
            title={t.askWhatsapp}
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Legal, Payment & GDPR Policies Center */}
          <LegalPoliciesModal
            open={policiesOpen}
            initialTab={policiesTab}
            lang={lang}
            isRtl={isRtl}
            whatsappNumber={publicSettings.whatsappNumber}
            contactEmail={publicSettings.email}
            onClose={() => setPoliciesOpen(false)}
          />

          {/* Dedicated Track My Booking Modal */}
          <TrackBookingModal
            open={trackBookingOpen}
            lang={lang}
            isRtl={isRtl}
            currency={currency}
            whatsappNumber={publicSettings.whatsappNumber}
            contactEmail={publicSettings.email}
            initialBookingId={initialTrackBookingId}
            bookingRequests={customerRequests}
            platformBookings={bookings}
            trips={liveTrips}
            onOpenPostTripReview={(reviewTrip, bookingId) => {
              setTrackBookingOpen(false);
              setInitialTrackBookingId('');
              handleOpenVerifiedReview(reviewTrip, bookingId);
            }}
            onClose={() => {
              setTrackBookingOpen(false);
              setInitialTrackBookingId('');
              if (typeof window !== 'undefined') {
                const nextUrl = new URL(window.location.href);
                if (
                  nextUrl.searchParams.has('track') ||
                  nextUrl.searchParams.has('voucher') ||
                  nextUrl.searchParams.has('booking')
                ) {
                  nextUrl.searchParams.delete('track');
                  nextUrl.searchParams.delete('voucher');
                  nextUrl.searchParams.delete('booking');
                  const qs = nextUrl.searchParams.toString();
                  window.history.replaceState(
                    null,
                    '',
                    `${nextUrl.pathname}${qs ? `?${qs}` : ''}${nextUrl.hash}`
                  );
                }
              }
            }}
          />

          {/* Floating Saved Favorites Dock (Desktop only to prevent mobile bottom bar stacking) */}
          {favoriteTrips.length > 0 && (
            <div className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl rounded-2xl border border-[#EE5426]/40 bg-[#0F2233]/95 backdrop-blur-md px-3.5 py-2.5 text-white shadow-[0_20px_50px_rgba(15,34,51,0.45)] items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex -space-x-2 rtl:space-x-reverse shrink-0">
                  {favoriteTrips.slice(0, 4).map((tr) => (
                    <div
                      key={tr.id}
                      className="relative h-9 w-9 rounded-lg overflow-hidden border-2 border-[#0F2233] bg-[#19354F] shrink-0"
                      title={tText(tr.name, lang)}
                    >
                      <SmartImage
                        src={tr.images[0]}
                        alt={tText(tr.name, lang)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white whitespace-nowrap">
                    <Heart className="h-3.5 w-3.5 fill-[#EE5426] text-[#EE5426] shrink-0" />
                    <span>
                      {tText({ en: 'Saved Favorites', ar: 'المفضلة', de: 'Favoriten' }, lang)} ({favoriteTrips.length})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    {favoriteTrips.map((tr) => tText(tr.name, lang)).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFavoriteTripIds([])}
                  className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white hover:border-white/30 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {tText({ en: 'Clear', ar: 'مسح', de: 'Leeren' }, lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setFavoritesModalOpen(true)}
                  className="btn-wasla-primary gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  <Heart className="h-3.5 w-3.5 fill-white text-white" />
                  <span>
                    {tText({ en: 'View', ar: 'عرض المفضلة', de: 'Favoriten' }, lang)} ({favoriteTrips.length})
                  </span>
                </button>
              </div>
            </div>
          )}

          <FavoritesModal
            open={favoritesModalOpen && favoriteTrips.length > 0}
            trips={favoriteTrips}
            lang={lang}
            t={t}
            currency={currency}
            isRtl={isRtl}
            onClose={() => setFavoritesModalOpen(false)}
            onToggleFavorite={handleToggleFavoriteTrip}
            onClearAll={() => {
              setFavoriteTripIds([]);
              setFavoritesModalOpen(false);
            }}
            onSelectTripForBooking={(trip) => {
              setFavoritesModalOpen(false);
              openTripDetail(trip);
            }}
          />

          <TripDetailModal
            trip={activeDetailTrip}
            initialDate={normalizedDateRange.startDate || tomorrowIso}
            whatsappNumber={publicSettings.whatsappNumber}
            contactEmail={publicSettings.email}
            lang={lang}
            t={t}
            currency={currency}
            isFavorite={activeDetailTrip ? favoriteTripIds.includes(activeDetailTrip.id) : false}
            bookingStatusById={bookingStatusById}
            storefrontBookingRefs={storefrontBookingRefs}
            relatedTrips={
              activeDetailTrip
                ? liveTrips
                    .filter((tr) => tr.id !== activeDetailTrip.id)
                    .sort((a, b) => {
                      const aScore =
                        (a.destination === activeDetailTrip.destination ? 2 : 0) +
                        (a.category === activeDetailTrip.category ? 1 : 0);
                      const bScore =
                        (b.destination === activeDetailTrip.destination ? 2 : 0) +
                        (b.category === activeDetailTrip.category ? 1 : 0);
                      return bScore - aScore;
                    })
                    .slice(0, 3)
                : []
            }
            onSelectRelatedTrip={openTripDetail}
            onToggleFavorite={handleToggleFavoriteTrip}
            onOpenPostTripReview={handleOpenVerifiedReview}
            onClose={closeTripDetail}
            onSubmitBooking={handleCustomerBooking}
          />

          {directReviewContext && (
            <PostTripReviewModal
              open={true}
              trip={directReviewContext.trip}
              lang={lang}
              initialBookingId={directReviewContext.bookingId}
              bookingStatusById={bookingStatusById}
              onClose={() => {
                setDirectReviewContext(null);
                if (typeof window !== 'undefined') {
                  const nextUrl = new URL(window.location.href);
                  if (nextUrl.searchParams.has('review') || nextUrl.searchParams.has('bookingId')) {
                    nextUrl.searchParams.delete('review');
                    nextUrl.searchParams.delete('bookingId');
                    const qs = nextUrl.searchParams.toString();
                    window.history.replaceState(
                      null,
                      '',
                      `${nextUrl.pathname}${qs ? `?${qs}` : ''}${nextUrl.hash}`
                    );
                  }
                }
              }}
            />
          )}

          <CustomTripModal
            open={customTripOpen}
            lang={lang}
            whatsappNumber={publicSettings.whatsappNumber}
            initialServices={customInitialServices}
            onClose={() => setCustomTripOpen(false)}
            onSubmit={handleCustomTripSubmit}
          />

          <MomentsModal
            moments={mergedMoments}
            activeIndex={activeMomentIndex}
            trips={liveTrips}
            lang={lang}
            t={t}
            isRtl={isRtl}
            onChangeIndex={setActiveMomentIndex}
            onClose={() => setActiveMomentIndex(null)}
            onSelectTrip={openTripDetail}
          />

          <WhatsAppInquiryModal
            open={whatsappOpen}
            lang={lang}
            isRtl={isRtl}
            activeTripName={tText(
              (liveTrips.find((tr) => tr.id === selectedExplorerTripId) || liveTrips[0] || TRIPS[0]).name,
              lang
            )}
            whatsappNumber={publicSettings.whatsappNumber}
            bookingRequests={customerRequests}
            trips={liveTrips}
            onOpenPostTripReview={(reviewTrip, bookingId) => {
              setWhatsappOpen(false);
              handleOpenVerifiedReview(reviewTrip, bookingId);
            }}
            onOpenTrackBooking={() => {
              setWhatsappOpen(false);
              setTrackBookingOpen(true);
            }}
            onClose={() => setWhatsappOpen(false)}
          />
        </>
      )}

      <PortalAuthModal
        open={portalAuthOpen}
        user={user}
        effectiveRole={effectiveRole}
        authError={authError}
        ownAccessRequest={ownAccessRequest}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
        onSubmitAccessRequest={submitAccessRequest}
        onEnterPortal={handleEnterPortal}
        onClose={() => setPortalAuthOpen(false)}
      />
      <OfflineIndicator lang={lang} />
    </div>
    </WaslaMapsProvider>
  );
}


