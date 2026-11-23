import { ConversationWorkspace } from '../conversations/ConversationPanel';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '../../lib/apiAuth';
import { optimizeImageToWebP } from '../../lib/imageOptimization';
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  Globe,
  ImagePlus,
  Inbox,
  LayoutGrid,
  Lightbulb,
  Loader2,
  Mail,
  Megaphone,
  MessageCircle,
  Mic,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { I18N } from '../../data/i18n';
import {
  ActivityCategoryId,
  DestinationRegion,
  SITE_CONFIG,
  Trip,
} from '../../data/marketplaceData';
import {
  AccessRequestRecord,
  BookingStatus,
  ChatThread,
  ComplaintCase,
  PaymentStatus,
  PickupSpot,
  PlatformBooking,
  PlatformEmailLog,
  StaffRoleRecord,
  SupplierProfile,
  TripReviewRecord,
  getBookingUrgency,
  getPendingAttentionInfo,
  sortBookingsNewestFirst,
} from '../../data/platformData';
import { detectGuestCountry } from '../../lib/nationalityDetect';
import { AdminUserRecord, PublicStorefrontSettings } from '../../hooks/useWaslaFirebase';
import {
  buildGuestPickupMailtoUrl,
  buildGuestPickupWhatsAppUrl,
  buildLocalizedPickupConfirmationEmail,
  formatWhatsAppDisplay,
  normalizeWhatsAppDigits,
} from '../../lib/whatsapp';
import { TripDetailModal } from '../TripDetailModal';
import { OwnerHeroStudio } from './OwnerHeroStudio';
import { OwnerTripEditorModal } from './OwnerTripEditorModal';
import { OwnerBookingTrendsChart } from './OwnerBookingTrendsChart';
import { CURATED_EGYPT_HOTELS } from '../WaslaHotelMapPicker';

interface OwnerControlProps {
  trips: Trip[];
  bookings: PlatformBooking[];
  suppliers: SupplierProfile[];
  chats: ChatThread[];
  complaints: ComplaintCase[];
  emailLogs: PlatformEmailLog[];
  newsletterEmails: string[];
  commissionRate: number;
  airTicketsEnabled: boolean;
  pendingAccessRequests?: AccessRequestRecord[];
  staffRoles?: StaffRoleRecord[];
  adminUsers?: AdminUserRecord[];
  isPrimaryOwner?: boolean;
  tripReviews?: TripReviewRecord[];
  publicSettings?: PublicStorefrontSettings;
  onLogDispatchEmail?: (
    to: string,
    subject: string,
    type: PlatformEmailLog['type']
  ) => void;
  onApproveAccessRequest?: (req: AccessRequestRecord) => Promise<void> | void;
  onGrantCoOwner?: (target: {
    uid: string;
    email: string;
    displayName?: string;
  }) => Promise<void> | void;
  onRevokeAccess?: (uid: string) => Promise<void> | void;
  onCreateTrip?: (trip: Trip) => Promise<void> | void;
  onUpdateTrip?: (trip: Trip) => Promise<void> | void;
  onDeleteTrip?: (tripId: string) => Promise<void> | void;
  onUpdateTripApproval?: (
    tripId: string,
    status: 'Approved' | 'Pending' | 'Paused' | 'Rejected'
  ) => void;
  onUpdateTripReviewApproval?: (
    reviewId: string,
    status: 'Approved' | 'Pending' | 'Rejected'
  ) => void;
  onSavePublicSettings?: (patch: Partial<PublicStorefrontSettings>) => Promise<void> | void;
  onChangeCommissionRate?: (rate: number) => void;
  onToggleAirTickets: () => void;
  onUpdateBooking?: (id: string, patch: Partial<PlatformBooking>) => void;
  onSendChatMessage?: (threadId: string, text: string) => void;
  onCreateChat?: (chat: ChatThread) => void;
  onUpdateSupplierStatus: (id: string, status: SupplierProfile['status']) => void;
}

type OwnerTab = 'overview' | 'catalog' | 'copilot' | 'ads' | 'design';
type CatalogSubTab = 'trips' | 'suppliers' | 'reviews' | 'team';
type AdPlatform =
  | 'Facebook & Instagram Ad'
  | 'Instagram Reels / TikTok Script'
  | 'Google Search Ad'
  | 'Blogger SEO Post'
  | 'WhatsApp Broadcast';

interface GeneratedAdResult {
  hook: string;
  headline: string;
  primaryText: string;
  cta: string;
  targetingTip: string;
  hashtags: string[];
}

interface ExecutiveBriefingResult {
  executiveSummary: string;
  criticalAlerts: Array<{
    title: string;
    severity: string;
    detail: string;
    action: string;
  }>;
  growthOpportunities: Array<{
    title: string;
    estimatedImpact: string;
    detail: string;
    action: string;
  }>;
  marketingPlan: Array<{
    channel: string;
    focusTripOrAngle: string;
    weeklyAction: string;
    expectedReturn: string;
  }>;
}

interface CopilotMessage {
  id: string;
  role: 'owner' | 'assistant';
  text: string;
}

export const OwnerControl: React.FC<OwnerControlProps> = ({
  trips,
  bookings,
  suppliers,
  chats,
  complaints,
  emailLogs,
  newsletterEmails,
  commissionRate,
  airTicketsEnabled,
  pendingAccessRequests = [],
  staffRoles = [],
  adminUsers = [],
  isPrimaryOwner = false,
  tripReviews = [],
  publicSettings,
  onLogDispatchEmail,
  onApproveAccessRequest,
  onGrantCoOwner,
  onRevokeAccess,
  onCreateTrip,
  onUpdateTrip,
  onDeleteTrip,
  onUpdateTripApproval,
  onUpdateTripReviewApproval,
  onSavePublicSettings,
  onChangeCommissionRate,
  onToggleAirTickets,
  onUpdateBooking,
  onSendChatMessage,
  onCreateChat,
  onUpdateSupplierStatus,
}) => {
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');
  const [catalogSubTab, setCatalogSubTab] = useState<CatalogSubTab>('trips');
  const [tripStatusFilter, setTripStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Paused' | 'Rejected'>('all');
  const [overviewBookingFilter, setOverviewBookingFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Completed'>('all');
  const [editorState, setEditorState] = useState<{ open: boolean; mode: 'create' | 'edit'; trip: Trip | null }>({
    open: false,
    mode: 'create',
    trip: null,
  });
  const [previewTripModal, setPreviewTripModal] = useState<Trip | null>(null);
  const [confirmDeleteTripId, setConfirmDeleteTripId] = useState<string | null>(null);

  // Executive Workspace & Copilot language state
  const [copilotLang, setCopilotLang] = useState<'ar' | 'en'>('ar');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<ExecutiveBriefingResult | null>(null);
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [transcribingVoice, setTranscribingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const liveTranscriptRef = useRef<string>('');
  const voiceDispatchedRef = useRef<boolean>(false);
  const voiceCancelledRef = useRef<boolean>(false);
  const voiceAbortRef = useRef<AbortController | null>(null);
  const chatThreadRef = useRef<HTMLDivElement | null>(null);
  const replyThreadRef = useRef<HTMLDivElement | null>(null);
  const speechRecRef = useRef<{ stop?: () => void; abort?: () => void } | null>(null);
  const voiceActionModeRef = useRef<'copilot' | 'reply'>('copilot');

  // Unified Conversations & Messaging Hub state (WhatsApp, Bookings Dispatch, Emails & Subscribers)
  const [inboxSubView, setInboxSubView] = useState<'inbox' | 'radar'>('inbox');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'whatsapp' | 'email'>('all');
  const [inboxSearch, setInboxSearch] = useState('');
  const [selectedInboxKey, setSelectedInboxKey] = useState<string | null>(null);
  const [composerMode, setComposerMode] = useState<'reply' | 'copilot'>('reply');
  const [conversationReplyDraft, setConversationReplyDraft] = useState('');
  const [draftingAiReply, setDraftingAiReply] = useState(false);
  const [lastSentWaLink, setLastSentWaLink] = useState<string | null>(null);
  const [conversationFeedback, setConversationFeedback] = useState<string | null>(null);
  const [ownerExpandedTranslations, setOwnerExpandedTranslations] = useState<Record<string, boolean>>({});
  const [ownerTranslatedMsgs, setOwnerTranslatedMsgs] = useState<Record<string, string>>({});
  const [ownerTranslatingIds, setOwnerTranslatingIds] = useState<Record<string, boolean>>({});
  const [ownerTranslationErrors, setOwnerTranslationErrors] = useState<Record<string, string>>({});

  // AI Ad Studio state
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [adPlatform, setAdPlatform] = useState<AdPlatform>('Facebook & Instagram Ad');
  const [audienceLang, setAudienceLang] = useState<'en' | 'de' | 'ar'>('en');
  const [adGoal, setAdGoal] = useState<string>('Direct Bookings (ROI)');
  const [offerNote, setOfferNote] = useState<string>(
    'Free hotel pickup · Pay on arrival · Local direct rate (no hotel rep markup)'
  );
  const [generatingAd, setGeneratingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAdResult | null>(null);
  const [copiedAd, setCopiedAd] = useState(false);

  // Public marketing, WhatsApp & Email settings synced with Firestore
  const [metaPixelId, setMetaPixelId] = useState(publicSettings?.metaPixelId || '');
  const [ga4Id, setGa4Id] = useState(publicSettings?.ga4Id || '');
  const [whatsappInput, setWhatsappInput] = useState(
    publicSettings?.whatsappDisplay || SITE_CONFIG.whatsappDisplay
  );
  const [emailInput, setEmailInput] = useState(
    publicSettings?.email || SITE_CONFIG.email
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Automatic Owner Booking Alert Channel Status (Email + WhatsApp server delivery)
  const [alertChannelStatus, setAlertChannelStatus] = useState<{
    emailConfigured: boolean;
    emailProvider: string;
    whatsappConfigured: boolean;
    whatsappProvider: string;
    webhookConfigured: boolean;
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    ownerEmailTarget?: string;
    whatsappHasToken?: boolean;
    whatsappHasPhoneId?: boolean;
  } | null>(null);
  const [testingOwnerAlerts, setTestingOwnerAlerts] = useState(false);
  const [testAlertResult, setTestAlertResult] = useState<{
    emailSent: boolean;
    emailTo: string;
    emailProvider: string;
    emailError?: string;
    whatsappSent: boolean;
    whatsappTo: string;
    whatsappProvider: string;
    whatsappError?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    authFetch('/api/notifications/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setAlertChannelStatus(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSendTestOwnerAlert = async () => {
    if (testingOwnerAlerts) return;
    setTestingOwnerAlerts(true);
    setTestAlertResult(null);
    const targetEmail =
      alertChannelStatus?.ownerEmailTarget || publicSettings?.email || SITE_CONFIG.email;
    const targetWaDigits = normalizeWhatsAppDigits(
      publicSettings?.whatsappNumber || SITE_CONFIG.whatsappNumber
    );
    try {
      const res = await authFetch('/api/notifications/new-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `WT-TEST-${Math.floor(1000 + Math.random() * 8999)}`,
          tripTitle: 'Orange Bay & Giftun Reef Small-Group Boat Day',
          destination: 'Hurghada',
          category: 'sea',
          date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          tripStartTime: '08:30 AM',
          guestName: 'Test Owner Notification',
          guestCountry: 'Germany',
          guestWhatsapp: targetWaDigits ? `+${targetWaDigits}` : '+201129155520',
          guestEmail: targetEmail,
          hotel: 'Steigenberger ALDAU Beach Hotel',
          roomNumber: '412',
          adults: 2,
          children: 0,
          infants: 0,
          grossEur: 90,
          supplierName: 'Captain Karim Marine',
          paymentStatus: 'Cash on pickup',
          notes: 'Live delivery verification from Owner Command Center',
          isTest: true,
        }),
      });
      const rawText = await res.text();
      let data: {
        error?: string;
        email?: { sent?: boolean; to?: string; provider?: string; error?: string };
        whatsapp?: { sent?: boolean; to?: string; provider?: string; error?: string };
      } | null = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!data) {
        const cleanSnippet = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
        const httpErr = `Server HTTP ${res.status}${cleanSnippet ? `: ${cleanSnippet}` : ' (non-JSON response)'}`;
        setTestAlertResult({
          emailSent: false,
          emailTo: targetEmail,
          emailProvider: alertChannelStatus?.emailProvider || 'none',
          emailError: httpErr,
          whatsappSent: false,
          whatsappTo: targetWaDigits,
          whatsappProvider: alertChannelStatus?.whatsappProvider || 'none',
          whatsappError: httpErr,
        });
        return;
      }

      if (!res.ok && data.error && !data.email) {
        setTestAlertResult({
          emailSent: false,
          emailTo: targetEmail,
          emailProvider: alertChannelStatus?.emailProvider || 'none',
          emailError: data.error,
          whatsappSent: false,
          whatsappTo: targetWaDigits,
          whatsappProvider: alertChannelStatus?.whatsappProvider || 'none',
          whatsappError: data.error,
        });
        return;
      }

      setTestAlertResult({
        emailSent: Boolean(data?.email?.sent),
        emailTo: data?.email?.to || targetEmail,
        emailProvider: data?.email?.provider || 'none',
        emailError: data?.email?.error,
        whatsappSent: Boolean(data?.whatsapp?.sent),
        whatsappTo: data?.whatsapp?.to || targetWaDigits,
        whatsappProvider: data?.whatsapp?.provider || 'none',
        whatsappError: data?.whatsapp?.error,
      });
    } catch (err) {
      const networkErr =
        err instanceof Error && err.message
          ? `Network error: ${err.message}`
          : 'Could not reach server notification endpoint.';
      setTestAlertResult({
        emailSent: false,
        emailTo: targetEmail,
        emailProvider: alertChannelStatus?.emailProvider || 'none',
        emailError: networkErr,
        whatsappSent: false,
        whatsappTo: targetWaDigits,
        whatsappProvider: alertChannelStatus?.whatsappProvider || 'none',
        whatsappError: networkErr,
      });
    } finally {
      setTestingOwnerAlerts(false);
    }
  };

  // Interactive Booking Ticket & Edit Modal state
  const [bookingModalDraft, setBookingModalDraft] = useState<PlatformBooking | null>(null);
  const [bookingModalMode, setBookingModalMode] = useState<'ticket' | 'edit'>('ticket');
  const [pickupClock, setPickupClock] = useState('08:30');
  const [pickupPeriod, setPickupPeriod] = useState<'AM' | 'PM'>('AM');
  const [bookingModalSaved, setBookingModalSaved] = useState(false);
  const [ownerConfirmCancelStep, setOwnerConfirmCancelStep] = useState(false);

  // In-App Email Viewer & Composer Modal state
  const [emailModal, setEmailModal] = useState<{
    id?: string;
    to: string;
    subject: string;
    type: PlatformEmailLog['type'];
    sentAt: string;
    status: string;
    body: string;
    relatedBooking?: PlatformBooking;
  } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailLoggedBanner, setEmailLoggedBanner] = useState(false);
  const [uploadingOwnerLocImg, setUploadingOwnerLocImg] = useState(false);
  const ownerLocImgInputRef = useRef<HTMLInputElement | null>(null);
  const [reviewLightboxPhoto, setReviewLightboxPhoto] = useState<string | null>(null);

  const compressOwnerBookingImage = (file: File): Promise<string> =>
    optimizeImageToWebP(file, 'booking');

  const parsePickupParts = (raw: string): { clock: string; period: 'AM' | 'PM' } => {
    const cleaned = (raw || '').trim().toUpperCase();
    const match = cleaned.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
    if (!match) return { clock: '08:30', period: 'AM' };
    let h = Number(match[1]);
    const m = match[2];
    let period: 'AM' | 'PM' = (match[3] as 'AM' | 'PM' | undefined) || (h >= 12 ? 'PM' : 'AM');
    if (!match[3]) {
      if (h === 0) {
        h = 12;
        period = 'AM';
      } else if (h > 12) {
        h -= 12;
        period = 'PM';
      }
    } else if (h === 0) {
      h = 12;
    } else if (h > 12) {
      h -= 12;
    }
    return { clock: `${String(h).padStart(2, '0')}:${m}`, period };
  };

  const openOwnerBookingModal = (bk: PlatformBooking, mode: 'ticket' | 'edit' = 'ticket') => {
    const parts = parsePickupParts(bk.pickupTime);
    setPickupClock(parts.clock);
    setPickupPeriod(parts.period);
    setBookingModalSaved(false);
    setOwnerConfirmCancelStep(false);
    setBookingModalMode(mode);
    setBookingModalDraft({
      ...bk,
      guestCountry: bk.guestCountry || 'Guest',
      pickupSpot: bk.pickupSpot || 'Inside Reception',
      roomNumber: bk.roomNumber || '',
      locationImageUrl: bk.locationImageUrl || '',
      guestWhatsapp:
        bk.guestWhatsapp ||
        (bk.guestContact && !bk.guestContact.includes('@') ? bk.guestContact : ''),
      guestEmail:
        bk.guestEmail ||
        (bk.guestContact && bk.guestContact.includes('@') ? bk.guestContact : ''),
    });
  };

  const handleSaveOwnerBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalDraft || !onUpdateBooking) return;
    const formattedPickup = `${(pickupClock || '08:30').trim()} ${pickupPeriod}`;
    const cleanWa = (bookingModalDraft.guestWhatsapp || '').trim();
    const cleanEmail = (bookingModalDraft.guestEmail || '').trim();
    const primaryContact = cleanWa || cleanEmail || bookingModalDraft.guestContact || 'N/A';

    const updated: PlatformBooking = {
      ...bookingModalDraft,
      tripTitle: bookingModalDraft.tripTitle.trim() || 'Custom Excursion',
      guestName: bookingModalDraft.guestName.trim() || 'Guest',
      guestCountry: detectGuestCountry({
        whatsapp: cleanWa,
        notes: bookingModalDraft.notes,
        existingCountry: bookingModalDraft.guestCountry,
      }),
      hotel: bookingModalDraft.hotel.trim() || 'Hurghada Hotel',
      roomNumber: (bookingModalDraft.roomNumber || '').trim(),
      locationImageUrl: (bookingModalDraft.locationImageUrl || '').trim(),
      pickupTime: formattedPickup,
      pickupSpot: bookingModalDraft.pickupSpot || 'Inside Reception',
      guestWhatsapp: cleanWa,
      guestEmail: cleanEmail,
      guestContact: primaryContact,
      adults: Math.max(1, Math.round(Number(bookingModalDraft.adults) || 1)),
      children: Math.max(0, Math.round(Number(bookingModalDraft.children) || 0)),
      infants: Math.max(0, Math.round(Number(bookingModalDraft.infants) || 0)),
      grossEur: Math.max(0, Math.round(Number(bookingModalDraft.grossEur) || 0)),
    };

    onUpdateBooking(updated.id, {
      tripTitle: updated.tripTitle,
      category: updated.category,
      destination: updated.destination,
      date: updated.date,
      tripStartTime: updated.tripStartTime?.trim() || undefined,
      pickupTime: updated.pickupTime,
      pickupSpot: updated.pickupSpot,
      guestName: updated.guestName,
      guestCountry: updated.guestCountry,
      guestWhatsapp: updated.guestWhatsapp,
      guestEmail: updated.guestEmail,
      guestContact: updated.guestContact,
      hotel: updated.hotel,
      roomNumber: updated.roomNumber,
      locationImageUrl: updated.locationImageUrl,
      adults: updated.adults,
      children: updated.children,
      infants: updated.infants,
      grossEur: updated.grossEur,
      supplierName: updated.supplierName,
      assignedDriverOrGuide: updated.assignedDriverOrGuide,
      paymentStatus: updated.paymentStatus,
      status: updated.status,
      notes: updated.notes,
    });
    setBookingModalDraft(updated);
    setBookingModalMode('ticket');
    setBookingModalSaved(true);
    window.setTimeout(() => setBookingModalSaved(false), 2600);
  };

  const buildBookingEmailPayload = (bk: PlatformBooking) =>
    buildLocalizedPickupConfirmationEmail({
      bookingId: bk.id,
      guestName: bk.guestName,
      tripTitle: bk.tripTitle,
      date: bk.date,
      tripStartTime: bk.tripStartTime,
      pickupTime: bk.pickupTime,
      pickupSpot: bk.pickupSpot,
      hotel: bk.hotel,
      roomNumber: bk.roomNumber,
      guestCountry: bk.guestCountry,
      adults: bk.adults,
      children: bk.children,
      infants: bk.infants,
      grossEur: bk.grossEur,
      paymentStatus: bk.paymentStatus,
      driverOrGuide: bk.assignedDriverOrGuide,
      notes: bk.notes,
      guestLang: bk.guestLang,
      whatsappDisplay: publicSettings?.whatsappDisplay || SITE_CONFIG.whatsappDisplay,
      supportEmail: publicSettings?.email || SITE_CONFIG.email,
    });

  const buildBookingEmailBody = (bk: PlatformBooking): string =>
    buildBookingEmailPayload(bk).body;

  const openEmailForBooking = (bk: PlatformBooking) => {
    setEmailCopied(false);
    setEmailLoggedBanner(false);
    const recipient = bk.guestEmail || (bk.guestContact.includes('@') ? bk.guestContact : '');
    const localizedEmail = buildBookingEmailPayload(bk);
    setEmailModal({
      to: recipient || 'No email on booking, add email in booking details',
      subject: localizedEmail.subject,
      type: 'Booking Confirmation',
      sentAt: 'Ready to send',
      status: 'Preview',
      body: localizedEmail.body,
      relatedBooking: bk,
    });
  };

  const openSentEmailLogModal = (log: PlatformEmailLog) => {
    setEmailCopied(false);
    setEmailLoggedBanner(false);
    const refMatch = log.subject.match(/WT-\d+/i);
    const matchedBk =
      (refMatch && bookings.find((b) => b.id.toLowerCase() === refMatch[0].toLowerCase())) ||
      bookings.find(
        (b) =>
          (b.guestEmail && b.guestEmail.toLowerCase() === log.to.toLowerCase()) ||
          b.guestContact.toLowerCase() === log.to.toLowerCase()
      );

    let reconstructedBody = '';
    if (matchedBk) {
      if (log.type === 'Payment Link') {
        reconstructedBody = [
          `Dear ${matchedBk.guestName},`,
          ``,
          `Your Wasla Travel excursion reservation (${matchedBk.id}) is confirmed and your payment link is ready:`,
          ``,
          `• Trip / Service: ${matchedBk.tripTitle}`,
          `• Date: ${matchedBk.date}${matchedBk.tripStartTime ? ` · Trip Start: ${matchedBk.tripStartTime}` : ''}`,
          `• Hotel Pickup: ${matchedBk.pickupTime || 'TBD'}`,
          `• Hotel: ${matchedBk.hotel}`,
          `• Total Guest Price: €${matchedBk.grossEur}`,
          `• Current Payment Status: ${matchedBk.paymentStatus}`,
          ``,
          `Please complete your payment online or pay cash upon pickup as agreed with Operations.`,
          ``,
          `Best regards,`,
          `Wasla Travel Operations Desk`,
          `WhatsApp: ${publicSettings?.whatsappDisplay || SITE_CONFIG.whatsappDisplay} | ${SITE_CONFIG.email}`,
        ].join('\n');
      } else {
        reconstructedBody = buildBookingEmailBody(matchedBk);
      }
    } else if (log.type === 'Supplier Dispatch') {
      reconstructedBody = [
        `Hello Partner Team,`,
        ``,
        `Wasla Travel Dispatch Summary (${log.subject}):`,
        `• Recipient: ${log.to}`,
        `• Sent Time: ${log.sentAt}`,
        ``,
        `Please ensure the driver/guide meets the guests on time with clear Wasla Travel signage and updates Operations once pickup is completed.`,
        ``,
        `Wasla Travel Dispatch · ${SITE_CONFIG.email}`,
      ].join('\n');
    } else if (log.type === 'Newsletter') {
      reconstructedBody = [
        `Welcome to Wasla Travel (${SITE_CONFIG.domain})!`,
        ``,
        `Thank you for subscribing with ${log.to}. We share curated Red Sea small-group boat days, Luxor & Cairo private tours, and transparent whole-euro offers.`,
        ``,
        `Questions? Message us anytime on WhatsApp ${publicSettings?.whatsappDisplay || SITE_CONFIG.whatsappDisplay}.`,
      ].join('\n');
    } else {
      reconstructedBody = [
        `To: ${log.to}`,
        `Subject: ${log.subject}`,
        `Type: ${log.type} · Sent: ${log.sentAt}`,
        ``,
        `Dear Guest,`,
        ``,
        `Thank you for choosing Wasla Travel (waslatravel.com). This message confirms your booking receipt and marina/pickup details.`,
        ``,
        `Best regards,`,
        `Wasla Travel Operations Desk · ${SITE_CONFIG.email}`,
      ].join('\n');
    }

    setEmailModal({
      id: log.id,
      to: log.to,
      subject: log.subject,
      type: log.type,
      sentAt: log.sentAt,
      status: log.status,
      body: reconstructedBody,
      relatedBooking: matchedBk,
    });
  };

  const handleToggleOwnerMsgTranslation = async (
    msgId: string,
    text: string,
    sourceLang?: string
  ) => {
    const isOpen = !!ownerExpandedTranslations[msgId];
    if (isOpen) {
      setOwnerExpandedTranslations((prev) => ({ ...prev, [msgId]: false }));
      return;
    }
    setOwnerExpandedTranslations((prev) => ({ ...prev, [msgId]: true }));
    if (ownerTranslatedMsgs[msgId]) return;

    setOwnerTranslatingIds((prev) => ({ ...prev, [msgId]: true }));
    setOwnerTranslationErrors((prev) => {
      const next = { ...prev };
      delete next[msgId];
      return next;
    });
    try {
      const res = await authFetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: sourceLang || 'auto',
          targetLang: 'ar',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.translation) {
        setOwnerTranslationErrors((prev) => ({
          ...prev,
          [msgId]: data.error || 'تعذر ترجمة الرسالة.',
        }));
      } else {
        setOwnerTranslatedMsgs((prev) => ({
          ...prev,
          [msgId]: data.translation,
        }));
      }
    } catch {
      setOwnerTranslationErrors((prev) => ({
        ...prev,
        [msgId]: 'تعذر الاتصال بالسيرفر للترجمة.',
      }));
    } finally {
      setOwnerTranslatingIds((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  useEffect(() => {
    if (!publicSettings) return;
    setMetaPixelId(publicSettings.metaPixelId || '');
    setGa4Id(publicSettings.ga4Id || '');
    setWhatsappInput(publicSettings.whatsappDisplay || SITE_CONFIG.whatsappDisplay);
    setEmailInput(publicSettings.email || SITE_CONFIG.email);
  }, [publicSettings]);

  useEffect(() => {
    if (!selectedTripId && trips.length > 0) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  const pendingRequests = useMemo(
    () => pendingAccessRequests.filter((r) => r.status === 'Pending'),
    [pendingAccessRequests]
  );

  const sortedModerationTrips = useMemo(() => {
    const rank = (status?: Trip['approvalStatus']) =>
      status === 'Pending' ? 0 : status === 'Paused' ? 1 : status === 'Rejected' ? 2 : 3;
    return [...trips].sort((a, b) => rank(a.approvalStatus) - rank(b.approvalStatus));
  }, [trips]);

  const pendingTripsCount = useMemo(
    () => trips.filter((t) => t.approvalStatus === 'Pending').length,
    [trips]
  );

  const sortedReviews = useMemo(() => {
    const rank = (status: TripReviewRecord['approvalStatus']) =>
      status === 'Pending' ? 0 : status === 'Approved' ? 1 : 2;
    return [...tripReviews].sort((a, b) => rank(a.approvalStatus) - rank(b.approvalStatus));
  }, [tripReviews]);

  const pendingReviewsCount = useMemo(
    () => tripReviews.filter((r) => r.approvalStatus === 'Pending').length,
    [tripReviews]
  );

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSavePublicSettings) return;
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      const digits = normalizeWhatsAppDigits(whatsappInput || SITE_CONFIG.whatsappNumber);
      await onSavePublicSettings({
        whatsappNumber: digits,
        whatsappDisplay: formatWhatsAppDisplay(digits),
        email: (emailInput || SITE_CONFIG.email).trim(),
        metaPixelId: metaPixelId.trim(),
        ga4Id: ga4Id.trim(),
      });
      setSettingsSaved(true);
      window.setTimeout(() => setSettingsSaved(false), 2500);
    } finally {
      setSavingSettings(false);
    }
  };

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || trips[0],
    [trips, selectedTripId]
  );

  const unitEconomics = useMemo(() => {
    if (!selectedTrip) return { commissionPerGuest: 0, coupleCommission: 0, maxSafeCpa: 0 };
    const commissionPerGuest = Math.round(selectedTrip.price * (commissionRate / 100));
    const coupleCommission = Math.round(selectedTrip.price * 2 * (commissionRate / 100));
    const maxSafeCpa = Math.max(2, Math.round(coupleCommission * 0.35));
    return { commissionPerGuest, coupleCommission, maxSafeCpa };
  }, [selectedTrip, commissionRate]);

  const utmLink = useMemo(() => {
    if (!selectedTrip) return `https://${SITE_CONFIG.domain}`;
    const sourceSlug =
      adPlatform === 'Facebook & Instagram Ad' || adPlatform === 'Instagram Reels / TikTok Script'
        ? 'meta'
        : adPlatform === 'Google Search Ad'
        ? 'google'
        : adPlatform === 'Blogger SEO Post'
        ? 'blogger'
        : 'whatsapp';
    const params = new URLSearchParams({
      destination: selectedTrip.destination,
      activity: selectedTrip.category,
      utm_source: sourceSlug,
      utm_medium: 'campaign',
      utm_campaign: selectedTrip.id,
    });
    return `https://${SITE_CONFIG.domain}/?${params.toString()}#all-trips`;
  }, [selectedTrip, adPlatform]);

  const financials = useMemo(() => {
    const activeBookings = bookings.filter(
      (b) => b.status !== 'Refunded' && b.status !== 'Cancelled' && b.status !== 'No show'
    );
    const gross = activeBookings.reduce((sum, b) => sum + b.grossEur, 0);
    const commission = Math.round(gross * (commissionRate / 100));
    const supplierNet = gross - commission;
    const refunded = bookings
      .filter((b) => b.status === 'Refunded' || b.status === 'Cancelled' || b.status === 'No show')
      .reduce((sum, b) => sum + b.grossEur, 0);
    return { gross, commission, supplierNet, refunded, activeCount: activeBookings.length };
  }, [bookings, commissionRate]);

  // Live automated company radar computed across all departments
  const companyRadar = useMemo(() => {
    const unassignedBookings = bookings.filter(
      (b) =>
        b.status !== 'Refunded' &&
        b.status !== 'Cancelled' &&
        b.status !== 'No show' &&
        !b.assignedDriverOrGuide.trim()
    );
    const pendingBookings = bookings.filter((b) => b.status === 'Pending');
    const openComplaints = complaints.filter(
      (c) => c.status !== 'Resolved' && c.status !== 'Refunded'
    );
    const pendingSuppliers = suppliers.filter((s) => s.status === 'Pending');
    const unansweredChats = chats.filter((c) => c.unread);
    const topMarginTrips = [...trips].sort((a, b) => b.price - a.price).slice(0, 3);

    const urgentCount =
      unassignedBookings.length +
      openComplaints.length +
      pendingSuppliers.length +
      unansweredChats.length +
      pendingReviewsCount;

    return {
      unassignedBookings,
      pendingBookings,
      openComplaints,
      pendingSuppliers,
      unansweredChats,
      topMarginTrips,
      urgentCount,
    };
  }, [bookings, complaints, suppliers, chats, trips, pendingReviewsCount]);

  interface UnifiedInboxEntry {
    key: string;
    kind: 'whatsapp' | 'email' | 'newsletter';
    title: string;
    subtitle: string;
    preview: string;
    timestampLabel: string;
    unread: boolean;
    urgentLevel: 'today' | 'tomorrow' | 'normal' | null;
    chatThread?: ChatThread;
    booking?: PlatformBooking;
    emailLog?: PlatformEmailLog;
    subscriberEmail?: string;
  }

  const unifiedInboxEntries = useMemo<UnifiedInboxEntry[]>(() => {
    const items: UnifiedInboxEntry[] = [];
    const matchedBookingIds = new Set<string>();

    // 1. Live customer chat & WhatsApp threads (with linked booking ticket info)
    const orderedChats = [...chats].sort((a, b) => Number(b.unread) - Number(a.unread));
    for (const ch of orderedChats) {
      const matchedBk = bookings.find(
        (b) => b.id.toLowerCase() === ch.bookingRef.toLowerCase()
      );
      if (matchedBk) matchedBookingIds.add(matchedBk.id);
      const lastMsg = ch.messages[ch.messages.length - 1];
      const urgency = matchedBk ? getBookingUrgency(matchedBk).level : null;
      items.push({
        key: `chat:${ch.id}`,
        kind: 'whatsapp',
        title: ch.customerName,
        subtitle: `${ch.bookingRef} · ${ch.tripTitle}`,
        preview: lastMsg ? lastMsg.text : ch.pickupInfo,
        timestampLabel: lastMsg?.timestamp || 'Today',
        unread: ch.unread,
        urgentLevel: urgency,
        chatThread: ch,
        booking: matchedBk,
      });
    }

    // 2. Bookings newest-first dispatch threads not yet linked to a ChatThread
    for (const bk of sortBookingsNewestFirst(bookings)) {
      if (matchedBookingIds.has(bk.id)) continue;
      const urgency = getBookingUrgency(bk).level;
      const createdClock = bk.createdAtMs
        ? new Date(bk.createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : bk.date;
      items.push({
        key: `bk:${bk.id}`,
        kind: 'whatsapp',
        title: bk.guestName,
        subtitle: `${bk.id} · ${bk.tripTitle}`,
        preview: `${bk.date}${bk.tripStartTime ? ` · Start: ${bk.tripStartTime}` : ''}${bk.pickupTime ? ` · Pickup: ${bk.pickupTime}` : ''} · ${bk.hotel}`,
        timestampLabel: createdClock,
        unread: bk.status === 'Pending',
        urgentLevel: urgency,
        booking: bk,
      });
    }

    // 3. Sent emails log (matched to booking when possible so full styled email renders)
    for (const log of emailLogs) {
      const refMatch = log.subject.match(/WT-\d+/i);
      const matchedBk =
        (refMatch && bookings.find((b) => b.id.toLowerCase() === refMatch[0].toLowerCase())) ||
        bookings.find(
          (b) =>
            (b.guestEmail && b.guestEmail.toLowerCase() === log.to.toLowerCase()) ||
            b.guestContact.toLowerCase() === log.to.toLowerCase()
        );
      items.push({
        key: `em:${log.id}`,
        kind: 'email',
        title: log.subject,
        subtitle: `${log.type} · To: ${log.to}`,
        preview: `From: ${SITE_CONFIG.email} · ${log.status}`,
        timestampLabel: log.sentAt,
        unread: false,
        urgentLevel: null,
        emailLog: log,
        booking: matchedBk,
      });
    }

    // 4. Newsletter subscribers
    for (const subEmail of newsletterEmails) {
      items.push({
        key: `sub:${subEmail}`,
        kind: 'newsletter',
        title: subEmail,
        subtitle: `Newsletter Subscriber · ${SITE_CONFIG.domain}`,
        preview: 'Subscribed to Red Sea small-group tours & whole-euro offers',
        timestampLabel: 'Subscribed',
        unread: false,
        urgentLevel: null,
        subscriberEmail: subEmail,
      });
    }

    return items;
  }, [chats, bookings, emailLogs, newsletterEmails]);

  const filteredInboxEntries = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    return unifiedInboxEntries.filter((item) => {
      if (inboxFilter === 'whatsapp' && item.kind !== 'whatsapp') return false;
      if (inboxFilter === 'email' && item.kind !== 'email' && item.kind !== 'newsletter') return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q)
      );
    });
  }, [unifiedInboxEntries, inboxFilter, inboxSearch]);

  const selectedInboxItem = useMemo(() => {
    if (selectedInboxKey === 'copilot') return null;
    if (selectedInboxKey) {
      const exact = unifiedInboxEntries.find((item) => item.key === selectedInboxKey);
      if (exact) return exact;
    }
    return filteredInboxEntries[0] || unifiedInboxEntries[0] || null;
  }, [selectedInboxKey, unifiedInboxEntries, filteredInboxEntries]);

  useEffect(() => {
    if (replyThreadRef.current) {
      replyThreadRef.current.scrollTop = replyThreadRef.current.scrollHeight;
    }
  }, [selectedInboxItem?.key, selectedInboxItem?.chatThread?.messages.length]);

  const getWhatsAppReplyDigits = (item: UnifiedInboxEntry | null): string => {
    if (!item) return '';
    const bk = item.booking;
    if (!bk) return '';
    return normalizeWhatsAppDigits(bk.guestWhatsapp || bk.guestContact || '');
  };

  const handleDraftReplyWithCopilot = async () => {
    if (!selectedInboxItem || draftingAiReply) return;
    setDraftingAiReply(true);
    setVoiceError(null);
    setConversationFeedback(null);
    try {
      const targetLang =
        selectedInboxItem.booking?.guestLang ||
        selectedInboxItem.chatThread?.customerLang ||
        'en';
      const contextSummary =
        selectedInboxItem.kind === 'whatsapp'
          ? [
              `Customer: ${selectedInboxItem.title}`,
              `Trip: ${selectedInboxItem.booking?.tripTitle || selectedInboxItem.chatThread?.tripTitle || 'Excursion'}`,
              `Date: ${selectedInboxItem.booking?.date || 'TBD'} · Trip Start: ${selectedInboxItem.booking?.tripStartTime || 'Scheduled'} · Hotel Pickup: ${selectedInboxItem.booking?.pickupTime || 'TBD'}`,
              `Hotel: ${selectedInboxItem.booking?.hotel || selectedInboxItem.chatThread?.pickupInfo || ''}`,
              `Recent Messages:\n${(selectedInboxItem.chatThread?.messages || [])
                .slice(-4)
                .map((m) => `[${m.timestamp}] ${m.sender}: ${m.text}`)
                .join('\n')}`,
            ].join('\n')
          : [
              `Email Type: ${selectedInboxItem.emailLog?.type || 'Newsletter'}`,
              `To: ${selectedInboxItem.emailLog?.to || selectedInboxItem.subscriberEmail || ''}`,
              `Subject: ${selectedInboxItem.title}`,
              selectedInboxItem.booking
                ? `Booking Ref: ${selectedInboxItem.booking.id}, Trip: ${selectedInboxItem.booking.tripTitle}, Date: ${selectedInboxItem.booking.date}, Trip Start: ${selectedInboxItem.booking.tripStartTime || 'Scheduled'}, Pickup: ${selectedInboxItem.booking.pickupTime || 'TBD'}, Hotel: ${selectedInboxItem.booking.hotel}`
                : '',
            ].join('\n');

      const prompt = `Draft ONLY a warm, concise, ready-to-send customer reply (no intro, no quotes) in language "${targetLang}" for Wasla Travel Operations based on:\n${contextSummary}`;
      const res = await authFetch('/api/owner/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          language: copilotLang,
          question: prompt,
          snapshot: companySnapshot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply?.trim()) {
        setConversationReplyDraft(data.reply.trim());
        setComposerMode('reply');
      } else {
        setVoiceError(data.error || 'Could not draft reply right now.');
      }
    } catch {
      setVoiceError('Network error while asking AI Copilot to draft reply.');
    } finally {
      setDraftingAiReply(false);
    }
  };

  const handleSendConversationReply = () => {
    if (!selectedInboxItem) return;
    const text = conversationReplyDraft.trim();
    if (!text) return;

    const nowClock = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (selectedInboxItem.kind === 'whatsapp') {
      const bookingId = selectedInboxItem.booking?.id || selectedInboxItem.chatThread?.bookingRef;
      if (!bookingId) { setConversationFeedback(copilotLang === 'ar' ? 'اربط المحادثة بحجز أولاً؛ لم يتم إرسال شيء.' : 'Link this record to a booking first. Nothing was sent.'); return; }
      window.dispatchEvent(new CustomEvent('wasla:open-conversation', { detail: { bookingId, text: conversationReplyDraft } }));
      setConversationFeedback(copilotLang === 'ar' ? 'راجع المسودة وأرسلها من صندوق محادثات الحجوزات أعلاه.' : 'Review and send your draft in Booking conversations above.');
      return;
    }

    const recipient =
      selectedInboxItem.emailLog?.to || selectedInboxItem.subscriberEmail || '';
    const replySubject = selectedInboxItem.emailLog
      ? `Re: ${selectedInboxItem.emailLog.subject}`
      : `Wasla Travel Red Sea Offer, ${SITE_CONFIG.domain}`;
    if (recipient && onLogDispatchEmail) {
      onLogDispatchEmail(
        recipient,
        replySubject,
        selectedInboxItem.emailLog?.type || 'Newsletter'
      );
    }
    setConversationFeedback(
      copilotLang === 'ar'
        ? `تم تسجيل متابعة الإيميل إلى ${recipient}، اضغط فتح تطبيق الإيميل للإرسال`
        : `Follow-up logged for ${recipient}, tap Open Mail App to send`
    );
    window.setTimeout(() => setConversationFeedback(null), 4500);
  };

  // Smart priority ranking for Owner tabs & executive focus items
  const smartTabIntel = useMemo(() => {
    const todayTomorrowUrgent = bookings.filter((b) => {
      if (b.status === 'Refunded' || b.status === 'Cancelled' || b.status === 'No show') {
        return false;
      }
      const lvl = getBookingUrgency(b).level;
      return lvl === 'today' || lvl === 'tomorrow';
    }).length;

    const unassignedCount = companyRadar.unassignedBookings.length;
    const pendingSuppliersCount = companyRadar.pendingSuppliers.length;
    const pendingRequestsCount = pendingRequests.length;
    const complaintsCount = companyRadar.openComplaints.length;
    const unreadChatsCount = companyRadar.unansweredChats.length;
    const topTrip = companyRadar.topMarginTrips[0];
    const topCommission = topTrip ? Math.round(topTrip.price * (commissionRate / 100)) : 0;
    const missingTracking = !publicSettings?.metaPixelId && !publicSettings?.ga4Id;
    const needsHeroSetup = !publicSettings?.heroImageUrl && !publicSettings?.heroCaptionEn;

    const overviewAttention =
      unassignedCount +
      pendingSuppliersCount +
      pendingTripsCount +
      pendingReviewsCount +
      pendingRequestsCount;

    const copilotAttention = complaintsCount + unreadChatsCount;

    const overviewSubtitle =
      unassignedCount > 0 && todayTomorrowUrgent > 0
        ? `${unassignedCount} بدون سائق · ${todayTomorrowUrgent} اليوم/غداً`
        : unassignedCount > 0
        ? `${unassignedCount} حجوزات بدون سائق/مرشد`
        : pendingRequestsCount > 0
        ? `${pendingRequestsCount} طلب انضمام ينتظر موافقتك`
        : pendingSuppliersCount > 0
        ? `${pendingSuppliersCount} مورد ينتظر الاعتماد`
        : pendingTripsCount > 0
        ? `${pendingTripsCount} رحلة تنتظر الاعتماد`
        : pendingReviewsCount > 0
        ? `${pendingReviewsCount} تقييم ينتظر الموافقة`
        : todayTomorrowUrgent > 0
        ? `${todayTomorrowUrgent} رحلات عاجلة اليوم/غداً`
        : `€${financials.commission} أرباح · التشغيل مستقر`;

    const copilotSubtitle =
      complaintsCount > 0
        ? `${complaintsCount} شكوى مفتوحة · ${companyRadar.urgentCount} تنبيه`
        : unreadChatsCount > 0
        ? `${unreadChatsCount} رسالة عميل غير مقروءة`
        : companyRadar.urgentCount > 0
        ? `${companyRadar.urgentCount} أولويات جاهزة للتحليل`
        : 'الرادار هادئ · اسأل أو اطلب خطة';

    const adsSubtitle = missingTracking
      ? `أضف Pixel/GA4 · أعلى ربح +€${topCommission}/فرد`
      : topTrip
      ? `رشّح: ${topTrip.destination} (+€${topCommission}/فرد)`
      : 'اصنع إعلان عالي العائد';

    const designSubtitle = needsHeroSetup
      ? 'خصّص صورة وعنوان الواجهة الرئيسية'
      : 'الواجهة الرئيسية والهوية مفعّلة';

    let recommendedTab: OwnerTab = 'overview';
    if (complaintsCount > 0 && overviewAttention === 0) {
      recommendedTab = 'copilot';
    } else if (overviewAttention > 0 || todayTomorrowUrgent > 0) {
      recommendedTab = 'overview';
    } else if (copilotAttention > 0) {
      recommendedTab = 'copilot';
    } else if (topCommission > 0) {
      recommendedTab = 'ads';
    }

    const overduePendingCount = bookings.filter((b) => getPendingAttentionInfo(b).needsAttention).length;

    const focusItems: Array<{
      id: string;
      tab: OwnerTab;
      catalogSubTab?: CatalogSubTab;
      label: string;
      severity: 'high' | 'medium' | 'growth';
    }> = [];

    if (overduePendingCount > 0) {
      focusItems.push({
        id: 'focus-overdue',
        tab: 'overview',
        label:
          copilotLang === 'ar'
            ? `${overduePendingCount} حجز معلّق لأكثر من 4 ساعات`
            : `${overduePendingCount} booking(s) pending > 4h`,
        severity: 'high',
      });
    }
    if (unassignedCount > 0) {
      focusItems.push({
        id: 'focus-dispatch',
        tab: 'copilot',
        label:
          copilotLang === 'ar'
            ? `تعيين سائق/مرشد لـ ${unassignedCount} حجز`
            : `Assign driver/guide for ${unassignedCount} booking(s)`,
        severity: 'high',
      });
    }
    if (complaintsCount > 0) {
      focusItems.push({
        id: 'focus-complaints',
        tab: 'copilot',
        label:
          copilotLang === 'ar'
            ? `متابعة ${complaintsCount} شكوى مفتوحة`
            : `Resolve ${complaintsCount} open complaint(s)`,
        severity: 'high',
      });
    }
    if (pendingRequestsCount > 0) {
      focusItems.push({
        id: 'focus-access',
        tab: 'catalog',
        catalogSubTab: 'team',
        label:
          copilotLang === 'ar'
            ? `مراجعة ${pendingRequestsCount} طلب صلاحية فريق/مورد`
            : `Review ${pendingRequestsCount} access request(s)`,
        severity: 'high',
      });
    }
    if (pendingSuppliersCount > 0) {
      focusItems.push({
        id: 'focus-suppliers',
        tab: 'catalog',
        catalogSubTab: 'suppliers',
        label:
          copilotLang === 'ar'
            ? `اعتماد ${pendingSuppliersCount} مورد جديد`
            : `Approve ${pendingSuppliersCount} supplier(s)`,
        severity: 'medium',
      });
    }
    if (pendingTripsCount > 0) {
      focusItems.push({
        id: 'focus-trips',
        tab: 'catalog',
        catalogSubTab: 'trips',
        label:
          copilotLang === 'ar'
            ? `مراجعة ${pendingTripsCount} رحلة بانتظار النشر`
            : `Approve ${pendingTripsCount} pending trip(s)`,
        severity: 'medium',
      });
    }
    if (pendingReviewsCount > 0) {
      focusItems.push({
        id: 'focus-reviews',
        tab: 'catalog',
        catalogSubTab: 'reviews',
        label:
          copilotLang === 'ar'
            ? `اعتماد ${pendingReviewsCount} تقييم عميل`
            : `Approve ${pendingReviewsCount} guest review(s)`,
        severity: 'medium',
      });
    }
    if (focusItems.length < 3 && topTrip) {
      focusItems.push({
        id: 'focus-ads',
        tab: 'ads',
        label:
          copilotLang === 'ar'
            ? `فرصة نمو: حملة ${topTrip.name.en} (+€${topCommission}/فرد)`
            : `Growth opportunity: Promote ${topTrip.name.en} (+€${topCommission}/guest)`,
        severity: 'growth',
      });
    }

    const catalogPendingCount =
      pendingTripsCount + pendingReviewsCount + pendingSuppliersCount + pendingRequestsCount;

    return {
      recommendedTab,
      overviewCount: overviewAttention + (todayTomorrowUrgent > 0 ? todayTomorrowUrgent : 0),
      catalogPendingCount,
      overduePendingCount,
      copilotCount: companyRadar.urgentCount,
      overviewSubtitle,
      copilotSubtitle,
      adsSubtitle,
      designSubtitle,
      focusItems: focusItems.slice(0, 4),
    };
  }, [
    bookings,
    companyRadar,
    pendingRequests.length,
    pendingTripsCount,
    pendingReviewsCount,
    commissionRate,
    financials.commission,
    publicSettings,
    copilotLang,
  ]);

  const jumpToPriority = (tab: OwnerTab, subTab?: CatalogSubTab) => {
    setActiveTab(tab);
    if (subTab) {
      setCatalogSubTab(subTab);
    }
    if (tab === 'overview') {
      setOverviewBookingFilter('Pending');
    }
  };

  const recentOverviewBookings = useMemo(() => {
    const sorted = sortBookingsNewestFirst(bookings);
    if (overviewBookingFilter === 'all') return sorted.slice(0, 8);
    return sorted.filter((b) => b.status === overviewBookingFilter).slice(0, 8);
  }, [bookings, overviewBookingFilter]);

  const filteredCatalogTrips = useMemo(() => {
    if (tripStatusFilter === 'all') return sortedModerationTrips;
    return sortedModerationTrips.filter((t) => (t.approvalStatus || 'Approved') === tripStatusFilter);
  }, [sortedModerationTrips, tripStatusFilter]);

  const companySnapshot = useMemo(
    () => ({
      brand: SITE_CONFIG.domain,
      commissionRatePercent: commissionRate,
      financials,
      totalTripsLive: trips.length,
      newsletterSubscribers: newsletterEmails.length,
      airTicketsRoadmapEnabled: airTicketsEnabled,
      pendingBookings: companyRadar.pendingBookings.map((b) => ({
        id: b.id,
        trip: b.tripTitle,
        destination: b.destination,
        date: b.date,
        grossEur: b.grossEur,
        driverAssigned: Boolean(b.assignedDriverOrGuide),
      })),
      unassignedPickupsCount: companyRadar.unassignedBookings.length,
      openComplaints: companyRadar.openComplaints.map((c) => ({
        id: c.id,
        bookingRef: c.bookingRef,
        issueType: c.issueType,
        severity: c.severity,
        summary: c.summary,
        status: c.status,
        refundRequestedEur: c.refundRequestedEur,
      })),
      suppliers: suppliers.map((s) => ({
        name: s.name,
        city: s.city,
        specialty: s.specialty,
        status: s.status,
      })),
      unansweredCustomerChats: companyRadar.unansweredChats.map((c) => ({
        customerName: c.customerName,
        tripTitle: c.tripTitle,
        lang: c.customerLang,
      })),
      highestTicketTrips: companyRadar.topMarginTrips.map((t) => ({
        title: t.name.en,
        destination: t.destination,
        category: t.category,
        priceEur: t.price,
        ownerCommissionPerGuestEur: Math.round(t.price * (commissionRate / 100)),
      })),
    }),
    [
      commissionRate,
      financials,
      trips,
      newsletterEmails.length,
      airTicketsEnabled,
      companyRadar,
      suppliers,
    ]
  );

  const handleRunBriefing = async () => {
    setBriefingLoading(true);
    setBriefingError(null);
    try {
      const res = await authFetch('/api/owner/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'briefing',
          language: copilotLang,
          snapshot: companySnapshot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBriefingError(data.error || 'Could not generate executive briefing.');
      } else {
        setBriefing(data);
      }
    } catch {
      setBriefingError('Network error while connecting to AI Executive Copilot.');
    } finally {
      setBriefingLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      if (vadIntervalRef.current) window.clearInterval(vadIntervalRef.current);
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      speechRecRef.current?.abort?.();
      voiceAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [copilotMessages, chatLoading, isRecordingVoice, transcribingVoice]);

  const handleAskCopilot = async (customPrompt?: string) => {
    const q = (customPrompt ?? copilotQuestion).trim();
    if (!q) return;
    setCopilotQuestion('');

    const userMsg: CopilotMessage = { id: `u-${Date.now()}`, role: 'owner', text: q };
    setCopilotMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);
    setBriefingError(null);
    setVoiceError(null);

    voiceAbortRef.current?.abort();
    const controller = new AbortController();
    voiceAbortRef.current = controller;

    try {
      const res = await authFetch('/api/owner/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          mode: 'chat',
          language: copilotLang,
          question: q,
          snapshot: companySnapshot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || 'Copilot could not answer right now.';
        setBriefingError(errMsg);
        setCopilotMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'assistant', text: `⚠️ ${errMsg}` },
        ]);
      } else {
        const replyText = (data.reply || '').trim();
        const msgId = `a-${Date.now()}`;
        setCopilotMessages((prev) => [
          ...prev,
          { id: msgId, role: 'assistant', text: replyText },
        ]);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const netErr =
        copilotLang === 'ar'
          ? 'تعذر الاتصال بالمساعد الذكي حالياً، حاول مرة أخرى.'
          : 'Network error while contacting AI Executive Copilot.';
      setBriefingError(netErr);
      setCopilotMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', text: `⚠️ ${netErr}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || '');
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = () => reject(new Error('Failed to read recorded audio.'));
      reader.readAsDataURL(blob);
    });

  const cleanupVoiceTimersAndAudio = () => {
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (vadIntervalRef.current) {
      window.clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const cancelVoiceRecording = () => {
    voiceCancelledRef.current = true;
    voiceDispatchedRef.current = true;
    liveTranscriptRef.current = '';
    cleanupVoiceTimersAndAudio();
    voiceAbortRef.current?.abort();
    try {
      speechRecRef.current?.abort?.();
    } catch {
      // Ignore abort errors
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsRecordingVoice(false);
    setTranscribingVoice(false);
    setChatLoading(false);
  };

  const stopVoiceRecording = () => {
    cleanupVoiceTimersAndAudio();
    try {
      if (speechRecRef.current?.stop) {
        speechRecRef.current.stop();
      }
    } catch {
      // Ignore if already stopped
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    } else if (liveTranscriptRef.current.trim() && !voiceDispatchedRef.current) {
      voiceDispatchedRef.current = true;
      const spoken = liveTranscriptRef.current.trim();
      liveTranscriptRef.current = '';
      setIsRecordingVoice(false);
      void handleAskCopilot(spoken);
      return;
    }
    setIsRecordingVoice(false);
  };

  const startVoiceRecording = async (targetMode: 'copilot' | 'reply' = 'copilot') => {
    if (isRecordingVoice) {
      stopVoiceRecording();
      return;
    }
    if (transcribingVoice) {
      cancelVoiceRecording();
      return;
    }
    voiceActionModeRef.current = targetMode;
    setVoiceError(null);
    setBriefingError(null);
    liveTranscriptRef.current = '';
    voiceDispatchedRef.current = false;
    voiceCancelledRef.current = false;

    const hasMediaRecorder =
      typeof window !== 'undefined' &&
      'MediaRecorder' in window &&
      Boolean(navigator.mediaDevices?.getUserMedia);

    if (hasMediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        audioChunksRef.current = [];

        // NOTE: Do NOT start browser SpeechRecognition simultaneously with getUserMedia!
        // On Samsung / Android phones, opening SpeechRecognition while getUserMedia holds the mic
        // locks the hardware audio stream, freezes live transcription, and delays stopping.

        // Attach Web Audio API silence detector (with mobile AudioContext.resume()) so recording auto-sends
        try {
          const AudioContextCtor =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioContextCtor) {
            const audioCtx = new AudioContextCtor();
            audioCtxRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume().catch(() => {});
            }
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.fftSize);
            let speechDetected = false;
            const startedAt = Date.now();
            let lastSpeechAt = startedAt;

            vadIntervalRef.current = window.setInterval(() => {
              if (audioCtx.state === 'suspended') {
                void audioCtx.resume().catch(() => {});
              }
              analyser.getByteTimeDomainData(dataArray);
              let sumSquares = 0;
              let maxDelta = 0;
              for (let i = 0; i < dataArray.length; i++) {
                const delta = Math.abs(dataArray[i] - 128);
                if (delta > maxDelta) maxDelta = delta;
                const norm = (dataArray[i] - 128) / 128;
                sumSquares += norm * norm;
              }
              const rms = Math.sqrt(sumSquares / dataArray.length);
              if (rms > 0.016 || maxDelta > 6) {
                speechDetected = true;
                lastSpeechAt = Date.now();
              } else if (
                speechDetected &&
                Date.now() - startedAt > 950 &&
                Date.now() - lastSpeechAt > 1350
              ) {
                stopVoiceRecording();
              }
            }, 120);
          }
        } catch {
          // Ignore VAD setup errors
        }

        const preferredMime = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/ogg;codecs=opus',
          'audio/aac',
        ].find((m) => {
          try {
            return MediaRecorder.isTypeSupported(m);
          } catch {
            return false;
          }
        });
        const recorder = preferredMime
          ? new MediaRecorder(stream, { mimeType: preferredMime })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            audioChunksRef.current.push(ev.data);
          }
        };

        recorder.onstop = async () => {
          cleanupVoiceTimersAndAudio();
          stream.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
          setIsRecordingVoice(false);

          if (voiceCancelledRef.current || voiceDispatchedRef.current) {
            return;
          }

          const actualMime = recorder.mimeType || preferredMime || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, {
            type: actualMime,
          });
          if (audioBlob.size < 120) {
            setVoiceError(
              copilotLang === 'ar'
                ? 'التسجيل قصير جداً، اضغط على المايك وتحدث ثم اضغط إرسال.'
                : 'Recording was too short, tap the mic, speak your question, and tap Send.'
            );
            return;
          }

          setTranscribingVoice(true);
          voiceAbortRef.current?.abort();
          const controller = new AbortController();
          voiceAbortRef.current = controller;

          try {
            const audioBase64 = await blobToBase64(audioBlob);
            const activeVoiceMode = voiceActionModeRef.current;
            const res = await authFetch('/api/owner/copilot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                mode: activeVoiceMode === 'reply' ? 'transcribe' : 'voice-chat',
                audioBase64,
                mimeType: actualMime,
                language: copilotLang,
                snapshot: companySnapshot,
              }),
            });
            const data = await res.json();
            if (voiceCancelledRef.current) return;
            if (!res.ok) {
              setVoiceError(data.error || 'Could not process voice message.');
            } else if (data.hasSpeech !== false && data.transcript?.trim()) {
              const finalSpoken = data.transcript.trim();
              voiceDispatchedRef.current = true;
              if (activeVoiceMode === 'reply') {
                setConversationReplyDraft((prev) =>
                  prev.trim() ? `${prev.trim()} ${finalSpoken}` : finalSpoken
                );
                setTranscribingVoice(false);
                return;
              }
              const replyText = (data.reply || '').trim();
              setCopilotQuestion('');
              const now = Date.now();
              setCopilotMessages((prev) => [
                ...prev,
                { id: `u-${now}`, role: 'owner', text: finalSpoken },
                ...(replyText
                  ? [{ id: `a-${now + 1}`, role: 'assistant' as const, text: replyText }]
                  : []),
              ]);
              setTranscribingVoice(false);
              if (!replyText) {
                await handleAskCopilot(finalSpoken);
              }
              return;
            } else {
              setVoiceError(
                copilotLang === 'ar'
                  ? 'لم نسمع كلاماً واضحاً، حاول التحدث بالقرب من المايك ثم اضغط إرسال.'
                  : 'No clear speech detected, please speak closer to the mic and tap Send.'
              );
            }
          } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              return;
            }
            setVoiceError(
              copilotLang === 'ar'
                ? 'تعذر إرسال التسجيل الصوتي للخادم، حاول مرة أخرى.'
                : 'Failed to process voice recording.'
            );
          } finally {
            setTranscribingVoice(false);
          }
        };

        // Pass 200ms timeslice so chunks are flushed continuously on Samsung/Android & Desktop
        recorder.start(200);
        setRecordingSeconds(0);
        setIsRecordingVoice(true);
        recordTimerRef.current = window.setInterval(() => {
          setRecordingSeconds((sec) => {
            if (sec >= 44) {
              stopVoiceRecording();
              return 45;
            }
            return sec + 1;
          });
        }, 1000);
        return;
      } catch {
        setVoiceError(
          copilotLang === 'ar'
            ? 'يرجى السماح بصلاحية الميكروفون من المتصفح للتحدث بالصوت.'
            : 'Please allow microphone access in your browser to use voice chat.'
        );
        return;
      }
    }

    setVoiceError(
      copilotLang === 'ar'
        ? 'المتصفح الحالي لا يدعم تسجيل الميكروفون داخل هذه النافذة.'
        : 'Microphone recording is not supported in this browser.'
    );
  };

  const handleGenerateAd = async () => {
    if (!selectedTrip) return;
    setGeneratingAd(true);
    setAdError(null);
    setCopiedAd(false);

    try {
      const res = await authFetch('/api/ads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle: selectedTrip.name.en,
          destination: selectedTrip.destination,
          price: selectedTrip.price,
          duration: selectedTrip.duration.en,
          highlights: selectedTrip.highlights.map((h) => h.en),
          platform: adPlatform,
          audienceLanguage: audienceLang,
          goal: adGoal,
          offerNote,
          commissionPerBooking: unitEconomics.commissionPerGuest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdError(data.error || 'Could not generate ad copy right now.');
      } else {
        setGeneratedAd(data);
      }
    } catch {
      setAdError('Network error while generating ad copy.');
    } finally {
      setGeneratingAd(false);
    }
  };

  const handleCopyAd = async () => {
    if (!generatedAd) return;
    const fullText = [
      generatedAd.hook,
      '',
      generatedAd.headline,
      '',
      generatedAd.primaryText,
      '',
      `${generatedAd.cta} -> ${utmLink}`,
      '',
      generatedAd.hashtags.join(' '),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAd(true);
      window.setTimeout(() => setCopiedAd(false), 2200);
    } catch {
      // Clipboard fallback not needed; copy stays safe
    }
  };

  const isAr = copilotLang === 'ar';
  const liveWhatsappDisplay = publicSettings?.whatsappDisplay || SITE_CONFIG.whatsappDisplay;
  const liveWhatsappDigits = normalizeWhatsAppDigits(publicSettings?.whatsappNumber || SITE_CONFIG.whatsappNumber);
  const liveContactEmail = publicSettings?.email || SITE_CONFIG.email;
  const liveTripsCount = trips.filter((t) => !t.approvalStatus || t.approvalStatus === 'Approved').length;
  const activeSuppliersCount = suppliers.filter((s) => s.status === 'Active').length;
  const pendingSuppliersCount = suppliers.filter((s) => s.status === 'Pending').length;

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#FAF4ED]/55 text-[#0F2233]">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-6 space-y-6">
        {/* Clean Executive Header + 5-Workspace Navigation */}
        <header className="card-wasla p-0 overflow-hidden">
          <div
            className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C8C2B8]/50"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] tabular-nums">
                <span className="font-semibold text-[#0F2233]">{SITE_CONFIG.domain}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {isAr
                    ? `${liveTripsCount} رحلة مفعّلة · عمولة ${commissionRate}%`
                    : `${liveTripsCount} live trips · ${commissionRate}% margin`}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {smartTabIntel.focusItems.filter((f) => f.severity !== 'growth').length > 0
                    ? isAr
                      ? `${smartTabIntel.focusItems.filter((f) => f.severity !== 'growth').length} مهام تتطلب متابعة`
                      : `${smartTabIntel.focusItems.filter((f) => f.severity !== 'growth').length} action(s) needed`
                    : isAr
                    ? 'التشغيل مستقر'
                    : 'Operations steady'}
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#0F2233]">
                {isAr ? 'لوحة تحكم المالك والإدارة' : 'Owner Command Center'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Global Owner Workspace Language Switch */}
              <div
                className="inline-flex items-center rounded-lg border border-[#C8C2B8]/60 bg-[#FAF4ED] p-0.5 text-xs font-semibold"
                role="group"
                aria-label="Workspace language"
              >
                <button
                  type="button"
                  onClick={() => setCopilotLang('ar')}
                  className={`rounded-md px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isAr ? 'bg-white text-[#0F2233] shadow-xs' : 'text-[#64748B] hover:text-[#0F2233]'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setCopilotLang('en')}
                  className={`rounded-md px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    !isAr ? 'bg-white text-[#0F2233] shadow-xs' : 'text-[#64748B] hover:text-[#0F2233]'
                  }`}
                >
                  English
                </button>
              </div>

              {onCreateTrip && (
                <button
                  type="button"
                  onClick={() => setEditorState({ open: true, mode: 'create', trip: null })}
                  className="btn-wasla-primary min-h-[38px] gap-1.5 rounded-lg px-4 py-2 text-xs whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'إنشاء رحلة جديدة' : 'New Trip'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 5 Purpose-Built Workspace Tabs */}
          <nav
            aria-label="Owner workspaces"
            className="px-4 sm:px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#F8FAFC]/70"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {[
              {
                id: 'overview' as OwnerTab,
                icon: LayoutGrid,
                label: isAr ? 'الملخص التنفيذي' : 'Overview',
                count: smartTabIntel.overduePendingCount,
                urgent: smartTabIntel.overduePendingCount > 0,
              },
              {
                id: 'catalog' as OwnerTab,
                icon: Users,
                label: isAr ? 'الرحلات والموردين' : 'Catalog & Partners',
                count: smartTabIntel.catalogPendingCount,
                urgent: smartTabIntel.catalogPendingCount > 0,
              },
              {
                id: 'copilot' as OwnerTab,
                icon: Inbox,
                label: isAr ? 'المراسلات والتواصل' : 'Inbox & Support',
                count: smartTabIntel.copilotCount,
                urgent: smartTabIntel.copilotCount > 0,
              },
              {
                id: 'ads' as OwnerTab,
                icon: Megaphone,
                label: isAr ? 'النمو والإعلانات' : 'Growth & Ads',
                count: 0,
                urgent: false,
              },
              {
                id: 'design' as OwnerTab,
                icon: SlidersHorizontal,
                label: isAr ? 'الواجهة وقنوات التواصل' : 'Storefront & Channels',
                count: 0,
                urgent: false,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0F2233] text-white shadow-xs'
                      : 'text-[#475569] hover:bg-white hover:text-[#0F2233]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.urgent
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#E2E8F0] text-[#334155]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact Actionable Priority Bar (Only when items need attention) */}
          {smartTabIntel.focusItems.length > 0 && (
            <div
              className="px-5 py-2.5 border-t border-[#E2E8F0] bg-white flex flex-wrap items-center gap-2 text-xs"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <span className="font-semibold text-[#475569] shrink-0">
                {isAr ? 'أولويات الآن:' : 'Action queue:'}
              </span>
              {smartTabIntel.focusItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpToPriority(item.tab, item.catalogSubTab)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    item.severity === 'high'
                      ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2]'
                      : item.severity === 'medium'
                      ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#EE5426] hover:text-[#EE5426]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">{isAr ? '←' : '→'}</span>
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ============================================================ */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                    */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
            {/* 4-Column Uniform Financial & Supply KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-wasla p-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                  <span>{isAr ? 'إجمالي مبيعات العملاء' : 'Guest Sales Volume'}</span>
                  <DollarSign className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                </div>
                <div className="font-mono text-2xl font-semibold text-[#0F2233] tabular-nums">
                  €{financials.gross}
                </div>
                <div className="text-xs text-[#64748B] tabular-nums">
                  {isAr
                    ? `${financials.activeCount} حجز نشط · سعر البيع للعميل`
                    : `${financials.activeCount} active bookings · gross selling price`}
                </div>
              </div>

              <div className="card-wasla p-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                  <span>{isAr ? 'صافي أرباح المنصة' : 'Platform Revenue Earned'}</span>
                  <TrendingUp className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                </div>
                <div className="font-mono text-2xl font-semibold text-[#EE5426] tabular-nums">
                  €{financials.commission}
                </div>
                <div className="text-xs text-[#64748B] tabular-nums">
                  {isAr
                    ? `بهامش عمولة ${commissionRate}%`
                    : `At ${commissionRate}% platform margin`}
                </div>
              </div>

              <div className="card-wasla p-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                  <span>{isAr ? 'مستحقات الموردين' : 'Supplier Payouts Owed'}</span>
                  <Users className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
                </div>
                <div className="font-mono text-2xl font-semibold text-[#0F2233] tabular-nums">
                  €{financials.supplierNet}
                </div>
                <div className="text-xs text-[#64748B] tabular-nums">
                  {isAr
                    ? `المستردات: €${financials.refunded}`
                    : `Refunded: €${financials.refunded}`}
                </div>
              </div>

              <div className="card-wasla p-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                  <span>{isAr ? 'الرحلات والموردين النشطين' : 'Live Marketplace Supply'}</span>
                  <ShieldCheck className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                </div>
                <div className="font-mono text-2xl font-semibold text-[#0F2233] tabular-nums">
                  {activeSuppliersCount} / {suppliers.length}
                </div>
                <div className="text-xs text-[#64748B] tabular-nums">
                  {isAr
                    ? `${liveTripsCount} رحلة مفعّلة · ${smartTabIntel.catalogPendingCount} بانتظار الاعتماد`
                    : `${liveTripsCount} live trips · ${smartTabIntel.catalogPendingCount} pending approval`}
                </div>
              </div>
            </div>

            {/* 30-Day Booking & Revenue Trends Data Visualization */}
            <div dir="ltr">
              <OwnerBookingTrendsChart
                bookings={bookings}
                commissionRate={commissionRate}
              />
            </div>

            {/* Live Bookings & Payment Status Ledger */}
            <section className="card-wasla p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-semibold text-[#0F2233]">
                    {isAr ? 'أحدث الحجوزات وحالة الدفع (كاش / رابط دفع)' : 'Recent Bookings & Payment Status'}
                  </h2>
                  <p className="text-xs text-[#64748B] tabular-nums">
                    {isAr
                      ? `عرض أحدث ${recentOverviewBookings.length} من إجمالي ${bookings.length} حجز · اضغط على أي حجز لإدارة التذكرة والتوصيل`
                      : `Showing latest ${recentOverviewBookings.length} of ${bookings.length} bookings · click any row to inspect ticket or dispatch`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5 text-xs font-semibold">
                    {(
                      [
                        { id: 'all', label: isAr ? 'الكل' : 'All' },
                        { id: 'Pending', label: isAr ? 'معلّق' : 'Pending' },
                        { id: 'Confirmed', label: isAr ? 'مؤكد' : 'Confirmed' },
                        { id: 'Completed', label: isAr ? 'مكتمل' : 'Completed' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setOverviewBookingFilter(f.id)}
                        className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap ${
                          overviewBookingFilter === f.id
                            ? 'bg-white text-[#0F2233] shadow-xs'
                            : 'text-[#64748B] hover:text-[#0F2233]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('copilot')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#EE5426] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    <span>{isAr ? 'فتح مركز المراسلات' : 'Open Inbox'}</span>
                    <span aria-hidden="true">{isAr ? '←' : '→'}</span>
                  </button>
                </div>
              </div>

              {recentOverviewBookings.length === 0 ? (
                <div className="px-5 py-10 text-center space-y-2">
                  <p className="text-sm font-medium text-[#0F2233]">
                    {isAr ? 'لا توجد حجوزات مطابقة لهذا الفلتر حالياً.' : 'No bookings match this filter right now.'}
                  </p>
                  {overviewBookingFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setOverviewBookingFilter('all')}
                      className="text-xs font-semibold text-[#EE5426] hover:underline cursor-pointer"
                    >
                      {isAr ? 'عرض جميع الحجوزات' : 'Show all bookings'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                        <th className="py-2.5 px-4 text-start">{isAr ? 'المرجع والتاريخ' : 'Ref & Date'}</th>
                        <th className="py-2.5 px-4 text-start">{isAr ? 'العميل والفندق' : 'Guest & Hotel'}</th>
                        <th className="py-2.5 px-4 text-start">{isAr ? 'الرحلة والمورد' : 'Trip & Supplier'}</th>
                        <th className="py-2.5 px-4 text-end">{isAr ? 'القيمة' : 'Gross'}</th>
                        <th className="py-2.5 px-4 text-start">{isAr ? 'الدفع' : 'Payment'}</th>
                        <th className="py-2.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                        <th className="py-2.5 px-4 text-end">{isAr ? 'إجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {recentOverviewBookings.map((bk) => {
                        const attention = getPendingAttentionInfo(bk);
                        return (
                          <tr
                            key={bk.id}
                            className={`transition-colors ${
                              attention.needsAttention
                                ? 'bg-[#FFFBEB]/80 hover:bg-[#FEF3C7]/60'
                                : 'bg-white hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-mono font-semibold text-[#0F2233] tabular-nums">{bk.id}</div>
                              <div className="text-[11px] text-[#64748B] tabular-nums">{bk.date}</div>
                            </td>
                            <td className="py-3 px-4 max-w-[200px]">
                              <div className="font-semibold text-[#0F2233] truncate">{bk.guestName}</div>
                              <div className="text-[11px] text-[#64748B] truncate">{bk.hotel}</div>
                            </td>
                            <td className="py-3 px-4 max-w-[240px]">
                              <div className="font-medium text-[#0F2233] truncate">{bk.tripTitle}</div>
                              <div className="text-[11px] text-[#64748B] truncate">{bk.supplierName}</div>
                            </td>
                            <td className="py-3 px-4 text-end font-mono font-semibold text-[#0F2233] tabular-nums whitespace-nowrap">
                              €{bk.grossEur}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-[#475569] font-medium">
                              {bk.paymentStatus}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`font-semibold ${
                                    bk.status === 'Confirmed' || bk.status === 'Completed'
                                      ? 'text-[#15803D]'
                                      : bk.status === 'Pending'
                                      ? 'text-[#B45309]'
                                      : 'text-[#B91C1C]'
                                  }`}
                                >
                                  {bk.status}
                                </span>
                                {attention.needsAttention && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] tabular-nums">
                                    <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                                    <span>
                                      {isAr
                                        ? `يحتاج متابعة (${attention.elapsedLabel})`
                                        : `Attention (${attention.elapsedLabel})`}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-end whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openOwnerBookingModal(bk, 'ticket')}
                                  className="rounded-md border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F2233] hover:border-[#EE5426] hover:text-[#EE5426] transition-colors cursor-pointer"
                                >
                                  {isAr ? 'التذكرة' : 'Ticket'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openOwnerBookingModal(bk, 'edit')}
                                  className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#475569] hover:text-[#0F2233] transition-colors cursor-pointer"
                                >
                                  {isAr ? 'تعديل' : 'Edit'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Official Support Channels & Escalation Summary Strip */}
            <section className="card-wasla p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-[#0F2233]">
                  {isAr ? 'قنوات التواصل الرسمية ومركز الدعم' : 'Official Contact Channels & Support Desk'}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475569] tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                    <span dir="ltr" className="font-mono font-medium text-[#0F2233]">
                      {liveWhatsappDisplay}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                    <span className="font-mono font-medium text-[#0F2233]">{liveContactEmail}</span>
                  </span>
                  <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                  <span>
                    {isAr
                      ? `${chats.length} محادثة · ${emailLogs.length} إيميل · ${newsletterEmails.length} مشترك`
                      : `${chats.length} chat(s) · ${emailLogs.length} email(s) · ${newsletterEmails.length} subscriber(s)`}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('copilot')}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#0F2233] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#19354F] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isAr ? 'فتح مركز المراسلات' : 'Open Inbox & Support'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('design')}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F2233] hover:border-[#EE5426] hover:text-[#EE5426] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isAr ? 'تعديل قنوات التواصل والعمولة' : 'Edit Contact Channels'}</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CATALOG, SUPPLIERS, REVIEWS & TEAM ACCESS             */}
        {/* ============================================================ */}
        {activeTab === 'catalog' && (
          <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Sub-Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1">
                {(
                  [
                    {
                      id: 'trips' as CatalogSubTab,
                      label: isAr ? `الرحلات (${trips.length})` : `Trips (${trips.length})`,
                      pending: pendingTripsCount,
                    },
                    {
                      id: 'suppliers' as CatalogSubTab,
                      label: isAr ? `الموردين والمستحقات (${suppliers.length})` : `Suppliers (${suppliers.length})`,
                      pending: pendingSuppliersCount,
                    },
                    {
                      id: 'reviews' as CatalogSubTab,
                      label: isAr ? `تقييمات العملاء (${tripReviews.length})` : `Reviews (${tripReviews.length})`,
                      pending: pendingReviewsCount,
                    },
                    {
                      id: 'team' as CatalogSubTab,
                      label: isAr
                        ? `الفريق والصلاحيات (${pendingRequests.length + staffRoles.length + adminUsers.length})`
                        : `Team & Access (${pendingRequests.length + staffRoles.length + adminUsers.length})`,
                      pending: pendingRequests.length,
                    },
                  ]
                ).map((sub) => {
                  const active = catalogSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setCatalogSubTab(sub.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#EE5426] text-white'
                          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F2233]'
                      }`}
                    >
                      <span>{sub.label}</span>
                      {sub.pending > 0 && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                            active ? 'bg-white/20 text-white' : 'bg-[#FEF3C7] text-[#B45309]'
                          }`}
                        >
                          {sub.pending}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {catalogSubTab === 'trips' && onCreateTrip && (
                <button
                  type="button"
                  onClick={() => setEditorState({ open: true, mode: 'create', trip: null })}
                  className="btn-wasla-primary self-start sm:self-auto min-h-[38px] gap-1.5 rounded-lg px-4 py-2 text-xs cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'إنشاء رحلة جديدة' : 'Create New Trip'}</span>
                </button>
              )}
            </div>

            {/* SUB-TAB A: TRIPS CATALOG MANAGER */}
            {catalogSubTab === 'trips' && (
              <div id="owner-trips-queue" className="card-wasla p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#0F2233]">
                      {isAr ? 'إدارة كتالوج الرحلات' : 'Owner Trip Catalog Manager'}
                    </h2>
                    <p className="text-xs text-[#64748B] tabular-nums">
                      {isAr
                        ? `${liveTripsCount} رحلة منشورة · ${pendingTripsCount} بانتظار الاعتماد · تحكم كامل بالمعاينة والتعديل والإيقاف والحذف`
                        : `${liveTripsCount} live · ${pendingTripsCount} pending approval · preview, edit, pause or remove any listing`}
                    </p>
                  </div>

                  <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5 text-xs font-semibold">
                    {(
                      [
                        { id: 'all', label: isAr ? 'الكل' : 'All' },
                        { id: 'Pending', label: isAr ? 'معلّق' : 'Pending' },
                        { id: 'Approved', label: isAr ? 'منشور' : 'Approved' },
                        { id: 'Paused', label: isAr ? 'متوقف' : 'Paused' },
                        { id: 'Rejected', label: isAr ? 'مرفوض' : 'Rejected' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setTripStatusFilter(st.id)}
                        className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap ${
                          tripStatusFilter === st.id
                            ? 'bg-white text-[#0F2233] shadow-xs'
                            : 'text-[#64748B] hover:text-[#0F2233]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredCatalogTrips.length === 0 ? (
                  <div className="px-5 py-10 text-center text-xs text-[#64748B]">
                    {isAr ? 'لا توجد رحلات في هذا التصنيف حالياً.' : 'No trips in this status.'}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E2E8F0]">
                    {filteredCatalogTrips.map((trip) => {
                      const status = trip.approvalStatus || 'Approved';
                      const isConfirmingDelete = confirmDeleteTripId === trip.id;
                      return (
                        <div
                          key={trip.id}
                          className={`px-5 py-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs ${
                            status === 'Pending' ? 'bg-[#FFFBEB]/60' : 'bg-white hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  status === 'Approved'
                                    ? 'text-[#15803D]'
                                    : status === 'Pending'
                                    ? 'text-[#B45309]'
                                    : status === 'Paused'
                                    ? 'text-[#64748B]'
                                    : 'text-[#B91C1C]'
                                }`}
                              >
                                {status}
                              </span>
                              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                              <span className="font-semibold text-[#0F2233]">{trip.name.en}</span>
                              <span className="text-[#64748B] tabular-nums">
                                · {trip.destination} · From €{trip.price}
                                {trip.options && trip.options.length > 0 ? ` (${trip.options.length} options)` : ''}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#64748B] flex flex-wrap gap-x-3 gap-y-0.5">
                              <span>{isAr ? 'المورد:' : 'Supplier:'} {trip.supplierName}</span>
                              <span dir="rtl">{trip.name.ar}</span>
                              <span>DE: {trip.name.de}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewTripModal(trip)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F2233] hover:bg-[#F8FAFC] cursor-pointer"
                              title="Preview customer booking page"
                            >
                              <Eye className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                              <span>{isAr ? 'معاينة' : 'Preview'}</span>
                            </button>

                            {onUpdateTrip && (
                              <button
                                type="button"
                                onClick={() => setEditorState({ open: true, mode: 'edit', trip })}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F2233] hover:bg-[#F8FAFC] cursor-pointer"
                                title="Edit all details & prices"
                              >
                                <Pencil className="h-3.5 w-3.5 text-[#EE5426]" aria-hidden="true" />
                                <span>{isAr ? 'تعديل' : 'Edit'}</span>
                              </button>
                            )}

                            {onUpdateTripApproval && status !== 'Approved' && (
                              <button
                                type="button"
                                onClick={() => onUpdateTripApproval(trip.id, 'Approved')}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803D] cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{isAr ? 'نشر الآن' : 'Approve Live'}</span>
                              </button>
                            )}

                            {onUpdateTripApproval && status !== 'Paused' && (
                              <button
                                type="button"
                                onClick={() => onUpdateTripApproval(trip.id, 'Paused')}
                                className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F2233] cursor-pointer"
                              >
                                {isAr ? 'إيقاف مؤقت' : 'Pause'}
                              </button>
                            )}

                            {onUpdateTripApproval && status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => onUpdateTripApproval(trip.id, 'Rejected')}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{isAr ? 'رفض' : 'Reject'}</span>
                              </button>
                            )}

                            {onDeleteTrip && (
                              isConfirmingDelete ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void onDeleteTrip(trip.id);
                                      setConfirmDeleteTripId(null);
                                    }}
                                    className="rounded-lg bg-[#B91C1C] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#991B1B] cursor-pointer"
                                  >
                                    {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteTripId(null)}
                                    className="rounded-lg border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs font-semibold text-[#475569] cursor-pointer"
                                  >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteTripId(trip.id)}
                                  className="inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white p-1.5 text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                                  title="Delete trip"
                                  aria-label={`Delete ${trip.name.en}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB B: SUPPLIERS & PAYOUT LEDGER */}
            {catalogSubTab === 'suppliers' && (
              <div id="owner-suppliers-queue" className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-[#0F2233]">
                      {isAr ? 'الموردين وحساب المستحقات المالية' : 'Suppliers, Approvals & Payout Ledger'}
                    </h2>
                    <p className="text-xs text-[#64748B] tabular-nums">
                      {isAr
                        ? `${suppliers.length} مورد · ${pendingSuppliersCount} بانتظار الاعتماد · صافي المستحقات محسوبة بعد عمولة ${commissionRate}%`
                        : `${suppliers.length} supplier(s) · ${pendingSuppliersCount} pending approval · net owed calculated after ${commissionRate}% margin`}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                        <th className="py-3 px-4 text-start">{isAr ? 'المورد' : 'Supplier'}</th>
                        <th className="py-3 px-4 text-start">{isAr ? 'المدينة والتخصص' : 'City & Specialty'}</th>
                        <th className="py-3 px-4 text-end">{isAr ? 'الرحلات' : 'Trips'}</th>
                        <th className="py-3 px-4 text-end">{isAr ? 'مبيعات العملاء' : 'Guest Sales'}</th>
                        <th className="py-3 px-4 text-end">{isAr ? 'صافي المستحق' : 'Net Owed'}</th>
                        <th className="py-3 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {suppliers.map((sup) => {
                        const supTrips = trips.filter((t) => t.supplierName === sup.name).length;
                        const supGross = bookings
                          .filter((b) => b.supplierName === sup.name && b.status !== 'Refunded')
                          .reduce((s, b) => s + b.grossEur, 0);
                        const supNet = supGross - Math.round(supGross * (commissionRate / 100));
                        return (
                          <tr key={sup.id} className="bg-white hover:bg-[#F8FAFC]">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#0F2233]">{sup.name}</div>
                              <div className="text-[11px] text-[#64748B]">{sup.email}</div>
                            </td>
                            <td className="py-3 px-4 max-w-[260px]">
                              <div className="font-medium text-[#0F2233]">{sup.city}</div>
                              <div className="text-[11px] text-[#64748B] truncate">{sup.specialty}</div>
                            </td>
                            <td className="py-3 px-4 text-end font-mono tabular-nums">{supTrips}</td>
                            <td className="py-3 px-4 text-end font-mono tabular-nums">€{supGross}</td>
                            <td className="py-3 px-4 text-end font-mono font-semibold text-[#EE5426] tabular-nums">
                              €{supNet}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={sup.status}
                                onChange={(e) =>
                                  onUpdateSupplierStatus(sup.id, e.target.value as SupplierProfile['status'])
                                }
                                className={`rounded-md border px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                                  sup.status === 'Active'
                                    ? 'border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]'
                                    : sup.status === 'Pending'
                                    ? 'border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]'
                                    : 'border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]'
                                }`}
                              >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Paused">Paused</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB C: GUEST REVIEWS APPROVAL QUEUE */}
            {catalogSubTab === 'reviews' && (
              <div id="owner-reviews-queue" className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-[#0F2233]">
                      {isAr ? 'مراجعة واعتماد تقييمات المسافرين' : 'Customer Trip Reviews & Approval Queue'}
                    </h2>
                    <p className="text-xs text-[#64748B] tabular-nums">
                      {pendingReviewsCount > 0
                        ? isAr
                          ? `${pendingReviewsCount} تقييم بانتظار موافقتك قبل النشر`
                          : `${pendingReviewsCount} guest review(s) waiting for your approval`
                        : isAr
                        ? `${tripReviews.filter((r) => r.approvalStatus === 'Approved').length} تقييم منشور`
                        : `${tripReviews.filter((r) => r.approvalStatus === 'Approved').length} published reviews`}
                    </p>
                  </div>
                </div>

                {sortedReviews.length === 0 ? (
                  <div className="px-5 py-10 text-center text-xs text-[#64748B]">
                    {isAr
                      ? 'لا توجد تقييمات مسجلة بعد. ستظهر تقييمات ما بعد الرحلة هنا للموافقة عليها.'
                      : 'No guest reviews recorded yet. Verified post-trip reviews appear here for approval.'}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E2E8F0]">
                    {sortedReviews.map((rev) => {
                      const linkedBooking = rev.bookingId
                        ? bookings.find((b) => b.id === rev.bookingId)
                        : undefined;
                      const isVerifiedBooking = linkedBooking
                        ? linkedBooking.status === 'Completed'
                        : Boolean(rev.verifiedBooking);

                      return (
                        <div
                          key={rev.id}
                          className={`px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs ${
                            rev.approvalStatus === 'Pending' ? 'bg-[#FFFBEB]/60' : 'bg-white hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  rev.approvalStatus === 'Approved'
                                    ? 'text-[#15803D]'
                                    : rev.approvalStatus === 'Pending'
                                    ? 'text-[#B45309]'
                                    : 'text-[#B91C1C]'
                                }`}
                              >
                                {rev.approvalStatus}
                              </span>
                              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  isVerifiedBooking ? 'text-[#047857]' : 'text-[#64748B]'
                                }`}
                              >
                                {isVerifiedBooking && <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                                <span>
                                  {isVerifiedBooking
                                    ? 'Verified booking'
                                    : linkedBooking
                                    ? `Booking ${linkedBooking.status}`
                                    : 'Unlinked'}
                                </span>
                              </span>
                              {rev.bookingId && (
                                <>
                                  <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                                  <span className="font-mono text-[11px] font-semibold text-[#EE5426]">
                                    {rev.bookingId}
                                  </span>
                                </>
                              )}
                              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                              <span className="font-semibold text-[#0F2233]">{rev.tripTitle}</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#0F2233] tabular-nums">
                                <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                                {rev.rating}/5
                              </span>
                              <span className="text-[#64748B] tabular-nums">
                                · {rev.guestName}
                                {rev.guestCountry ? ` (${rev.guestCountry})` : ''} · {rev.visitDate}
                              </span>
                            </div>
                            <p className="text-xs text-[#334155] leading-relaxed">{rev.comment}</p>
                            {rev.photoUrl && (
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => setReviewLightboxPhoto(rev.photoUrl || null)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1.5 hover:border-[#EE5426] cursor-pointer"
                                >
                                  <img
                                    src={rev.photoUrl}
                                    alt={`Guest upload by ${rev.guestName}`}
                                    className="h-12 w-16 rounded object-cover"
                                  />
                                  <span className="pe-2 text-[11px] font-semibold text-[#0F2233]">
                                    {isAr ? 'معاينة صورة المسافر' : 'Inspect Guest Photo'}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>

                          {onUpdateTripReviewApproval && (
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              {rev.approvalStatus !== 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateTripReviewApproval(rev.id, 'Approved')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803D] cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>{isAr ? 'اعتماد ونشر' : 'Approve Live'}</span>
                                </button>
                              )}
                              {rev.approvalStatus !== 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateTripReviewApproval(rev.id, 'Pending')}
                                  className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F2233] cursor-pointer"
                                >
                                  {isAr ? 'تعليق' : 'Set Pending'}
                                </button>
                              )}
                              {rev.approvalStatus !== 'Rejected' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateTripReviewApproval(rev.id, 'Rejected')}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>{isAr ? 'رفض' : 'Reject'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB D: TEAM, CO-OWNERS & ACCESS REQUESTS */}
            {catalogSubTab === 'team' && (
              <div className="space-y-5">
                <div id="owner-access-requests" className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                      <h2 className="text-sm font-semibold text-[#0F2233]">
                        {isAr
                          ? `طلبات انضمام الفريق والموردين (${pendingRequests.length})`
                          : `Staff & Partner Access Requests (${pendingRequests.length})`}
                      </h2>
                    </div>
                    <span className="text-xs text-[#64748B]">
                      {isAr ? 'موثّق عبر Google Sign-In · بانتظار موافقة المالك' : 'Verified via Google Sign-In · Waiting Owner approval'}
                    </span>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <p className="text-xs text-[#64748B] py-3">
                      {isAr ? 'لا توجد طلبات صلاحية معلّقة حالياً.' : 'No pending access requests right now.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {pendingRequests.map((req) => (
                        <div
                          key={req.uid}
                          className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-semibold text-[#0F2233] truncate">
                              {req.companyName || req.displayName} ({req.requestedRole})
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate">
                              {req.email} {req.city ? `· ${req.city}` : ''}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {onApproveAccessRequest && (
                              <button
                                type="button"
                                onClick={() => onApproveAccessRequest(req)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803D] cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Approve ({req.requestedRole})</span>
                              </button>
                            )}
                            {isPrimaryOwner && onGrantCoOwner && (
                              <button
                                type="button"
                                onClick={() =>
                                  void onGrantCoOwner({
                                    uid: req.uid,
                                    email: req.email,
                                    displayName: req.companyName || req.displayName,
                                  })
                                }
                                className="btn-wasla-primary gap-1 rounded-lg px-3 py-1.5 text-xs cursor-pointer"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Grant Co-Owner</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isPrimaryOwner && (
                  <div className="card-wasla p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#0F2233]" aria-hidden="true" />
                        <h2 className="text-sm font-semibold text-[#0F2233]">
                          {isAr ? 'الشركاء الإداريين وصلاحيات الفريق النشطة' : 'Active Co-Owners & Team Roles'}
                        </h2>
                      </div>
                      <span className="text-[11px] text-[#64748B]">
                        {isAr ? 'يمكن إلغاء أي صلاحية في أي وقت' : 'Revoke or upgrade any member anytime'}
                      </span>
                    </div>

                    {adminUsers.length === 0 && staffRoles.length === 0 ? (
                      <p className="text-xs text-[#64748B] py-2">
                        {isAr ? 'لا يوجد أعضاء فريق مضافون حالياً.' : 'No additional team members assigned yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {(() => {
                          const adminSet = new Set(adminUsers.map((a) => a.uid));
                          const roleMap = new Map(staffRoles.map((r) => [r.uid, r]));
                          const combinedUids = Array.from(new Set([...adminSet, ...roleMap.keys()]));
                          return combinedUids.map((uid) => {
                            const isCoOwner = adminSet.has(uid);
                            const roleInfo = roleMap.get(uid);
                            const adminInfo = adminUsers.find((a) => a.uid === uid);
                            const email = roleInfo?.email || adminInfo?.email || uid;
                            const label = roleInfo?.displayName || email;
                            return (
                              <div
                                key={uid}
                                className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[#0F2233] truncate">{label}</span>
                                    <span className="text-[11px] font-semibold text-[#EE5426] whitespace-nowrap">
                                      · {isCoOwner ? 'Co-Owner' : roleInfo?.role || 'staff'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#64748B] truncate">{email}</div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {!isCoOwner && onGrantCoOwner && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void onGrantCoOwner({ uid, email, displayName: label })
                                      }
                                      className="rounded-md border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F2233] hover:border-[#EE5426] hover:text-[#EE5426] cursor-pointer"
                                    >
                                      Make Co-Owner
                                    </button>
                                  )}
                                  {onRevokeAccess && (
                                    <button
                                      type="button"
                                      onClick={() => void onRevokeAccess(uid)}
                                      className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: GROWTH & AD CAMPAIGN STUDIO                           */}
        {/* ============================================================ */}
        {activeTab === 'ads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Ad Campaign Configurator + Unit Economics */}
            <div className="lg:col-span-5 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                  <h2 className="text-base font-semibold text-[#0F2233]">
                    {isAr ? 'منشئ الحملات الإعلانية المربحة' : 'Profitable Ad Campaign Builder'}
                  </h2>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {isAr
                    ? 'اختر رحلة وحدد القناة واللغة لتوليد نص إعلاني جاهز مع رابط تتبّع UTM وحد أقصى آمن لتكلفة الحجز.'
                    : 'Select a trip, channel, and target language to draft conversion-focused ad copy with tracked UTM links and safe CPA targets.'}
                </p>
              </div>

              <label className="block space-y-1 text-xs font-medium text-[#0F2233]">
                <span>1. Select Trip to Promote</span>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                >
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.name.en}, €{trip.price} ({trip.destination})
                    </option>
                  ))}
                </select>
              </label>

              {selectedTrip && (
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center font-mono tabular-nums">
                  <div>
                    <div className="font-sans text-[11px] text-[#64748B]">1 Guest Fee</div>
                    <div className="text-sm font-semibold text-[#EE5426]">
                      €{unitEconomics.commissionPerGuest}
                    </div>
                  </div>
                  <div>
                    <div className="font-sans text-[11px] text-[#64748B]">2 Guests Profit</div>
                    <div className="text-sm font-semibold text-[#15803D]">
                      €{unitEconomics.coupleCommission}
                    </div>
                  </div>
                  <div>
                    <div className="font-sans text-[11px] text-[#64748B]">Max Safe CPA</div>
                    <div className="text-sm font-semibold text-[#0F2233]">
                      ≤ €{unitEconomics.maxSafeCpa}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1 text-xs font-medium text-[#0F2233]">
                  <span>2. Channel / Format</span>
                  <select
                    value={adPlatform}
                    onChange={(e) => setAdPlatform(e.target.value as AdPlatform)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                  >
                    <option value="Facebook & Instagram Ad">Facebook &amp; Instagram Ad</option>
                    <option value="Instagram Reels / TikTok Script">Instagram Reels / TikTok Script</option>
                    <option value="Google Search Ad">Google Search Ad</option>
                    <option value="Blogger SEO Post">Blogger SEO Post</option>
                    <option value="WhatsApp Broadcast">WhatsApp Broadcast</option>
                  </select>
                </label>

                <label className="block space-y-1 text-xs font-medium text-[#0F2233]">
                  <span>3. Tourist Language</span>
                  <select
                    value={audienceLang}
                    onChange={(e) => setAudienceLang(e.target.value as 'en' | 'de' | 'ar')}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                  >
                    <option value="en">English (UK / International)</option>
                    <option value="de">Deutsch (German / DACH)</option>
                    <option value="ar">العربية (Egypt &amp; Gulf)</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1 text-xs font-medium text-[#0F2233]">
                <span>4. Campaign Goal</span>
                <select
                  value={adGoal}
                  onChange={(e) => setAdGoal(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                >
                  <option value="Direct Bookings (ROI)">Direct Bookings on {SITE_CONFIG.domain} (ROI)</option>
                  <option value="WhatsApp Inquiries">
                    WhatsApp Instant Leads ({liveWhatsappDisplay})
                  </option>
                  <option value="High-Margin Private / VIP">High-Margin Private Tours &amp; VIP Guides</option>
                </select>
              </label>

              <label className="block space-y-1 text-xs font-medium text-[#0F2233]">
                <span>5. Offer / Trust Angle</span>
                <input
                  type="text"
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                />
              </label>

              <button
                type="button"
                onClick={handleGenerateAd}
                disabled={generatingAd || !selectedTrip}
                className="btn-wasla-primary w-full min-h-[42px] rounded-lg px-4 py-2 text-xs cursor-pointer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{generatingAd ? 'Writing campaign draft...' : 'Generate Campaign Draft'}</span>
              </button>

              {adError && (
                <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#B91C1C]">
                  {adError}
                </p>
              )}
            </div>

            {/* Right: Generated Ad Output + Auto UTM Link + Targeting Advice */}
            <div className="card-wasla lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between gap-5">
              {!generatedAd ? (
                <div className="my-auto py-12 text-center space-y-3 max-w-md mx-auto">
                  <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#EE5426]">
                    <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-[#0F2233]">
                    {isAr ? 'جاهز لإنشاء حملة إعلانية بعائد محسوب' : 'Ready to draft campaigns that convert'}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {isAr
                      ? 'اختر رحلة ذات هامش ربح مرتفع وحدد لغة الجمهور المستهدف للحصول على نص إعلاني جاهز مع رابط تتبع تلقائي وتوصية استهداف.'
                      : `Select a high-margin trip on the left, pick your target language, and generate ready-to-run ad copy with a tracked ${SITE_CONFIG.domain} link and safe CPA ceiling.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div>
                      <div className="text-[11px] font-semibold text-[#EE5426]">{adPlatform}</div>
                      <h3 className="text-base font-semibold text-[#0F2233]">{generatedAd.headline}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAd}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                    >
                      {copiedAd ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#15803D]" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy Ad + Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                      <div className="text-[11px] font-semibold text-[#64748B]">Scroll-Stopping Hook</div>
                      <p className="font-semibold text-[#0F2233]">{generatedAd.hook}</p>
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-3.5 space-y-1.5">
                      <div className="text-[11px] font-semibold text-[#64748B]">Primary Ad Copy</div>
                      <p className="text-xs sm:text-sm text-[#0F2233] whitespace-pre-line leading-relaxed">
                        {generatedAd.primaryText}
                      </p>
                      <div className="pt-2 text-xs font-semibold text-[#EE5426]">
                        CTA: {generatedAd.cta}
                      </div>
                      {generatedAd.hashtags.length > 0 && (
                        <div className="pt-1 text-xs text-[#64748B]">
                          {generatedAd.hashtags.join(' ')}
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                      <div className="text-[11px] font-semibold text-[#EE5426] tabular-nums">
                        Targeting &amp; Margin Advice (Keep CPA ≤ €{unitEconomics.maxSafeCpa})
                      </div>
                      <p className="text-xs text-[#0F2233] leading-relaxed">{generatedAd.targetingTip}</p>
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs space-y-1">
                      <div className="text-[11px] font-semibold text-[#64748B]">
                        Tracked Landing URL ({SITE_CONFIG.domain})
                      </div>
                      <div className="font-mono text-[11px] text-[#EE5426] break-all">{utmLink}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
                <span>
                  {publicSettings?.metaPixelId || publicSettings?.ga4Id
                    ? `Tracking active: ${[
                        publicSettings?.metaPixelId ? 'Meta Pixel' : '',
                        publicSettings?.ga4Id ? 'GA4' : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}`
                    : 'No Pixel / GA4 connected yet'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('design')}
                  className="font-semibold text-[#EE5426] hover:underline cursor-pointer"
                >
                  {isAr ? 'إعدادات التتبع والقنوات ←' : 'Configure Pixel & Channels →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: STOREFRONT DESIGN, OFFICIAL CONTACT CHANNELS & RULES  */}
        {/* ============================================================ */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Consolidated Official Contact Channels, Commission & Analytics Settings */}
            <form
              onSubmit={handleSaveSettings}
              className="card-wasla p-5 sm:p-6 space-y-5"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                    <h2 className="text-base font-semibold text-[#0F2233]">
                      {isAr
                        ? 'قنوات التواصل الرسمية وإعدادات المنصة المباشرة'
                        : 'Official Contact Channels & Platform Settings'}
                    </h2>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {isAr
                      ? 'أي تحديث هنا يظهر فوراً في قسم «تواصل معنا» بالواجهة الرئيسية، الفوتر، وتأكيدات الحجوزات.'
                      : 'Updates sync live to the Storefront Contact Desk, Footer, and booking confirmation links.'}
                  </p>
                </div>

                <a
                  href={`https://wa.me/${liveWhatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isAr ? 'اختبار رابط الواتساب الحالي' : 'Test Live WhatsApp'}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <label className="block space-y-1.5">
                  <span className="font-semibold text-[#0F2233]">
                    {isAr ? 'رقم واتساب التشغيل الرسمي' : 'Official WhatsApp Desk'}
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="+20 112 915 5520"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none font-mono tabular-nums"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-[#0F2233]">
                    {isAr ? 'البريد الإلكتروني الرسمي للدعم' : 'Official Support Email'}
                  </span>
                  <input
                    type="email"
                    dir="ltr"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={SITE_CONFIG.email}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-[#0F2233]">
                    {isAr ? 'معرّف Meta Pixel (اختياري)' : 'Meta Pixel ID (optional)'}
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    placeholder="e.g. 123456789012345"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none font-mono tabular-nums"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-[#0F2233]">
                    {isAr ? 'معرّف Google Analytics 4' : 'GA4 Measurement ID'}
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    value={ga4Id}
                    onChange={(e) => setGa4Id(e.target.value)}
                    placeholder="e.g. G-XXXXXXXXXX"
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#EE5426] focus:outline-none font-mono"
                  />
                </label>
              </div>

              {/* Commercial Controls: Platform Commission Rate & Air Tickets Roadmap */}
              <div className="pt-4 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {onChangeCommissionRate && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#0F2233]">
                        {isAr ? 'نسبة عمولة المنصة (%)' : 'Platform Commission Margin (%)'}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {isAr ? 'تُستخدم في حساب أرباح المنصة ومستحقات الموردين' : 'Used for platform profit & supplier payout math'}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      {[10, 15, 20, 25].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => onChangeCommissionRate(rate)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                            commissionRate === rate
                              ? 'border-[#EE5426] bg-[#EE5426] text-white'
                              : 'border-[#CBD5E1] bg-white text-[#475569] hover:border-[#0F2233]'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#0F2233]">
                      {isAr ? 'إظهار خدمة حجز تذاكر الطيران بالواجهة' : 'Storefront Air Tickets Add-on'}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {airTicketsEnabled
                        ? isAr
                          ? 'مفعّل حالياً في شريط الواجهة الرئيسية'
                          : 'Currently visible on the storefront hero strip'
                        : isAr
                        ? 'مخفي حالياً عن الواجهة الرئيسية'
                        : 'Currently hidden from the storefront'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleAirTickets}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      airTicketsEnabled
                        ? 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                        : 'border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F2233]'
                    }`}
                  >
                    {airTicketsEnabled
                      ? isAr
                        ? 'مفعّل'
                        : 'Enabled'
                      : isAr
                      ? 'متوقف'
                      : 'Disabled'}
                  </button>
                </div>
              </div>

              {onSavePublicSettings && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs font-medium text-[#15803D]">
                    {settingsSaved
                      ? isAr
                        ? 'تم حفظ قنوات التواصل وإعدادات التتبع مباشرة.'
                        : 'Contact channels and tracking settings saved live.'
                      : ''}
                  </span>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="btn-wasla-primary min-h-[40px] rounded-lg px-5 py-2 text-xs cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {savingSettings
                        ? isAr
                          ? 'جاري الحفظ...'
                          : 'Saving...'
                        : isAr
                        ? 'حفظ القنوات والإعدادات'
                        : 'Save Contact & Tracking'}
                    </span>
                  </button>
                </div>
              )}
            </form>

            {/* Automatic Owner New-Booking Alerts (Official Email + WhatsApp Push) */}
            <section
              className="rounded-xl border border-[#CBD5E1] bg-white p-5 sm:p-6 space-y-4 shadow-xs"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                    <h2 className="text-base font-bold text-[#0F2233]">
                      {isAr
                        ? 'إشعارات الحجز التلقائية (إيميل للعميل + إيميل وواتساب للمالك)'
                        : 'Automatic Booking Notifications (Guest Email + Owner Email & WhatsApp)'}
                    </h2>
                  </div>
                  <p className="text-xs text-[#475569]">
                    {isAr
                      ? 'فور ضغط العميل على تأكيد الحجز، يقوم السيرفر تلقائياً بإرسال إيميل تأكيد للعميل + إيميل تنبيه كامل للمالك + رسالة واتساب فورية للمالك.'
                      : 'The moment a guest confirms a booking, the server automatically sends a confirmation email to the guest, a full booking alert email to you, and an instant WhatsApp push alert to your phone.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSendTestOwnerAlert()}
                  disabled={testingOwnerAlerts}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#0F2233] px-4 py-2 text-xs font-bold text-white hover:bg-[#19354F] disabled:opacity-60 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {testingOwnerAlerts
                      ? isAr
                        ? 'جاري إرسال التجربة...'
                        : 'Sending Test...'
                      : isAr
                      ? 'إرسال تنبيه تجريبي (واتساب + إيميل)'
                      : 'Send Test Alert (WhatsApp + Email)'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Official Email Delivery Card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#0F2233]">
                      <Mail className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                      <span>
                        {isAr ? 'إيميلات التأكيد التلقائية (العميل + المالك)' : 'Automated Booking Emails (Guest + Owner)'}
                      </span>
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10.5px] font-extrabold ${
                        alertChannelStatus?.emailConfigured
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      {alertChannelStatus?.emailConfigured
                        ? isAr
                          ? `مفعّل (${alertChannelStatus.emailProvider.toUpperCase()})`
                          : `Active (${alertChannelStatus.emailProvider.toUpperCase()})`
                        : isAr
                        ? 'بانتظار إعداد SMTP أو Resend في Secrets'
                        : 'Configure SMTP / Resend in Secrets'}
                    </span>
                  </div>
                  <div className="font-mono font-semibold text-[#0F2233] break-all" dir="ltr">
                    {alertChannelStatus?.ownerEmailTarget || liveContactEmail}
                  </div>
                  {alertChannelStatus?.smtpHost && (
                    <div className="font-mono text-[10.5px] text-[#64748B] break-all" dir="ltr">
                      SMTP: {alertChannelStatus.smtpHost}:{alertChannelStatus.smtpPort} (
                      {alertChannelStatus.smtpSecure ? 'SSL' : 'STARTTLS'}) ·{' '}
                      {alertChannelStatus.smtpUser}
                    </div>
                  )}
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    {alertChannelStatus?.emailConfigured
                      ? isAr
                        ? 'يُرسل تلقائياً إيميل تأكيد للعميل وإيميل حجز كامل إلى بريد المالك فور تأكيد أي حجز.'
                        : 'Automatically emails a branded booking confirmation to the guest and a full dispatch alert to your owner inbox on every booking.'
                      : isAr
                      ? 'لتفعيل الإرسال الفعلي للعميل والمالك، أضف SMTP_HOST و SMTP_USER و SMTP_PASS (أو RESEND_API_KEY) في AI Studio Settings → Secrets.'
                      : 'To activate real email delivery to both the guest and owner, add SMTP_HOST, SMTP_USER, and SMTP_PASS (or RESEND_API_KEY) in AI Studio Settings > Secrets.'}
                  </p>
                </div>

                {/* Owner WhatsApp Push Alert Card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#0F2233]">
                      <MessageCircle className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
                      <span>
                        {isAr ? 'تنبيه واتساب الفوري للمالك' : 'Instant Owner WhatsApp Push Alert'}
                      </span>
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10.5px] font-extrabold ${
                        alertChannelStatus?.whatsappConfigured
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      {alertChannelStatus?.whatsappConfigured
                        ? isAr
                          ? `مفعّل (${alertChannelStatus.whatsappProvider})`
                          : `Active (${alertChannelStatus.whatsappProvider})`
                        : isAr
                        ? 'بانتظار مفتاح واتساب في Secrets'
                        : 'Configure WhatsApp in Secrets'}
                    </span>
                  </div>
                  <div className="font-mono font-semibold text-[#0F2233]" dir="ltr">
                    {liveWhatsappDisplay}
                  </div>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    {alertChannelStatus?.whatsappConfigured
                      ? isAr
                        ? 'يتم إرسال رسالة واتساب تلقائية لك فور تسجيل أي حجز جديد على الموقع.'
                        : 'An automated WhatsApp message is pushed to you the moment any new customer booking is submitted.'
                      : alertChannelStatus?.whatsappHasPhoneId && !alertChannelStatus?.whatsappHasToken
                      ? isAr
                        ? 'تم التعرّف على معرّف رقم الواتساب (whatsapp_phone_id) ✅، تبقى إضافة مفتاح التوكن WHATSAPP_CLOUD_TOKEN (أو whatsapp_token) من Meta Developer في Secrets.'
                        : 'Phone Number ID detected ✅, add WHATSAPP_CLOUD_TOKEN (or whatsapp_token) from Meta Developer in Secrets to activate.'
                      : alertChannelStatus?.whatsappHasToken && !alertChannelStatus?.whatsappHasPhoneId
                      ? isAr
                        ? 'تم التعرّف على مفتاح التوكن ✅، تبقى إضافة WHATSAPP_PHONE_NUMBER_ID (أو whatsapp_phone_id) في Secrets.'
                        : 'WhatsApp token detected ✅, add WHATSAPP_PHONE_NUMBER_ID (or whatsapp_phone_id) in Secrets to activate.'
                      : isAr
                      ? 'لتفعيل تنبيه الواتساب التلقائي، أضف أحد الخيارات في Secrets: (CallMeBot مجاني عبر CALLMEBOT_API_KEY، أو Meta WhatsApp Cloud عبر WHATSAPP_CLOUD_TOKEN + whatsapp_phone_id، أو Twilio).'
                      : 'To activate instant WhatsApp alerts, add ONE option in AI Studio Secrets: free personal alerts via CALLMEBOT_API_KEY, official Meta Cloud API (WHATSAPP_CLOUD_TOKEN + whatsapp_phone_id), or Twilio WhatsApp.'}
                  </p>
                </div>
              </div>

              {testAlertResult && (
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-3.5 text-xs space-y-1.5">
                  <div className="font-bold text-[#0F2233]">
                    {isAr ? 'نتيجة الإرسال التجريبي:' : 'Test Delivery Result:'}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`font-semibold ${
                        testAlertResult.emailSent ? 'text-[#15803D]' : 'text-[#B45309]'
                      }`}
                    >
                      {isAr ? 'الإيميل الرسمي:' : 'Official Email:'}{' '}
                      {testAlertResult.emailSent
                        ? isAr
                          ? `تم الإرسال بنجاح إلى ${testAlertResult.emailTo} (${testAlertResult.emailProvider})`
                          : `Delivered to ${testAlertResult.emailTo} (${testAlertResult.emailProvider})`
                        : testAlertResult.emailError ||
                          (isAr
                            ? 'لم يتم ضبط بيانات SMTP/Resend في Secrets بعد'
                            : 'SMTP/Resend secrets not set yet')}
                    </span>
                    <span className="text-[#CBD5E1]">|</span>
                    <span
                      className={`font-semibold ${
                        testAlertResult.whatsappSent ? 'text-[#15803D]' : 'text-[#B45309]'
                      }`}
                    >
                      {isAr ? 'واتساب المالك:' : 'Owner WhatsApp:'}{' '}
                      {testAlertResult.whatsappSent
                        ? isAr
                          ? `تم الإرسال بنجاح (${testAlertResult.whatsappProvider})`
                          : `Delivered (${testAlertResult.whatsappProvider})`
                        : testAlertResult.whatsappError ||
                          (isAr
                            ? 'لم يتم ضبط مفتاح WhatsApp في Secrets بعد'
                            : 'WhatsApp provider secret not set yet')}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Hero & Visual Identity Studio */}
            <OwnerHeroStudio
              trips={trips}
              publicSettings={publicSettings}
              onSavePublicSettings={onSavePublicSettings}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: UNIFIED INBOX, CONTACT DISPATCH & AI COPILOT          */}
        {/* ============================================================ */}
        {activeTab === 'copilot' && <ConversationWorkspace bookings={bookings} ar={isAr} />}
        {activeTab === 'copilot' && (
          <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Clean Flat Conversations Hub Header + Sub-View Switcher (Inbox vs AI Radar) */}
            <div className="card-wasla p-4 sm:p-5 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#EE5426]">
                    <Inbox className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {isAr
                        ? 'مركز المراسلات والتواصل الموحد (واتساب · حجوزات · إيميلات)'
                        : 'Unified Inbox & Customer Communication Hub'}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#0F2233]">
                    {isAr
                      ? 'متابعة محادثات العملاء والإيميلات والرد السريع أو تفعيل رادار التشغيل'
                      : 'Manage WhatsApp dispatches, guest emails, and executive operational radar'}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* View Toggle: Inbox vs AI Radar & Briefing */}
                  <div className="inline-flex rounded-lg border border-[#C8C2B8]/60 bg-[#FAF4ED] p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setInboxSubView('inbox')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 cursor-pointer whitespace-nowrap ${
                        inboxSubView === 'inbox' ? 'bg-[#0F2233] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F2233]'
                      }`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? 'صندوق المراسلات' : 'Inbox & Emails'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInboxSubView('radar')}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 cursor-pointer whitespace-nowrap ${
                        inboxSubView === 'radar' ? 'bg-[#EE5426] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F2233]'
                      }`}
                    >
                      <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? 'الرادار التنفيذي والخطة' : 'Executive Radar & Plan'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {inboxSubView === 'radar' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#C8C2B8]/60 pt-3">
                    <span className="text-xs font-medium text-[#0F2233]">
                      {copilotLang === 'ar'
                        ? 'مؤشرات الشركة الحية وتقرير المساعد التنفيذي'
                        : 'Live Company Telemetry & AI Executive Briefing'}
                    </span>
                    <button
                      type="button"
                      onClick={handleRunBriefing}
                      disabled={briefingLoading}
                      className="btn-wasla-primary min-h-[38px] rounded-lg px-4 py-1.5 text-xs cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {briefingLoading
                          ? copilotLang === 'ar'
                            ? 'جاري تحليل الشركة...'
                            : 'Analyzing company...'
                          : copilotLang === 'ar'
                          ? 'تحليل الشركة + خطة تسويق وتنبيهات الآن'
                          : 'Run Full Company AI Briefing'}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs tabular-nums">
                    <div className="rounded-lg border border-[#FDE68A] bg-[#FEFCE8] p-3 space-y-1">
                      <div className="text-[#B45309] font-semibold">
                        {copilotLang === 'ar' ? 'حجوزات بدون سائق/مرشد' : 'Unassigned Pickups'}
                      </div>
                      <div className="text-xl font-semibold text-[#0F2233]">
                        {companyRadar.unassignedBookings.length}
                      </div>
                      <div className="text-[11px] text-[#475569]">
                        {copilotLang === 'ar'
                          ? `${companyRadar.pendingBookings.length} حجز بانتظار التأكيد`
                          : `${companyRadar.pendingBookings.length} pending bookings`}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 space-y-1">
                      <div className="text-[#B91C1C] font-semibold">
                        {copilotLang === 'ar' ? 'شكاوى وطلبات استرداد' : 'Open Complaints / Refunds'}
                      </div>
                      <div className="text-xl font-semibold text-[#0F2233]">
                        {companyRadar.openComplaints.length}
                      </div>
                      <div className="text-[11px] text-[#475569]">
                        {copilotLang === 'ar' ? 'محتاجة متابعة جودة عاجلة' : 'Require quality resolution'}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-3 space-y-1">
                      <div className="text-[#D9461B] font-semibold">
                        {copilotLang === 'ar' ? 'موردين بانتظار الموافقة' : 'Pending Supplier Approvals'}
                      </div>
                      <div className="text-xl font-semibold text-[#0F2233]">
                        {companyRadar.pendingSuppliers.length}
                      </div>
                      <div className="text-[11px] text-[#475569]">
                        {copilotLang === 'ar'
                          ? `${companyRadar.unansweredChats.length} رسائل عملاء غير مقروءة`
                          : `${companyRadar.unansweredChats.length} unread customer chats`}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-3 space-y-1">
                      <div className="text-[#047857] font-semibold">
                        {copilotLang === 'ar' ? 'أعلى رحلة ربحاً بالعمولة' : 'Highest-Margin Trip'}
                      </div>
                      <div className="text-xl font-semibold text-[#0F2233]">
                        €
                        {companyRadar.topMarginTrips[0]
                          ? Math.round(companyRadar.topMarginTrips[0].price * (commissionRate / 100))
                          : 0}
                        <span className="text-xs font-normal text-[#475569]">
                          /{copilotLang === 'ar' ? 'فرد' : 'guest'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#475569] truncate">
                        {companyRadar.topMarginTrips[0]?.name.en || '—'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(briefingError || voiceError) && (
                <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#B91C1C]">
                  {voiceError || briefingError}
                </p>
              )}
            </div>

            {inboxSubView === 'radar' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Cols: Executive AI Briefing Output */}
                <div className="lg:col-span-7 space-y-5">
                  {!briefing ? (
                    <div className="card-wasla bg-[#FAF4ED] p-8 text-center space-y-3">
                      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#EE5426] shadow-xs">
                        <Target className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-semibold text-[#0F2233]">
                        {copilotLang === 'ar'
                          ? 'اضغط "تحليل الشركة + خطة تسويق وتنبيهات الآن" لتشغيل المساعد'
                          : 'Click "Run Full Company AI Briefing" to analyze your live business'}
                      </h3>
                      <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                        {copilotLang === 'ar'
                          ? 'سيقرأ المساعد أرقام الحجوزات، الشكاوى، الموردين، وأعلى الرحلات عمولة، ويمكنك العودة للمراسلات في أي وقت.'
                          : 'Your AI Chief of Staff scans live bookings, complaints, pending suppliers, and highest-margin tours.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/95 p-5 space-y-2 shadow-xs">
                        <div className="text-xs font-semibold text-[#D9461B]">
                          {copilotLang === 'ar' ? 'ملخص الموقف التنفيذي' : 'Executive Summary'}
                        </div>
                        <p className="text-sm text-[#0F2233] leading-relaxed">{briefing.executiveSummary}</p>
                      </div>

                      <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB]/95 p-5 space-y-3 shadow-xs">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#92400E]">
                          <AlertTriangle className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
                          <span>
                            {copilotLang === 'ar' ? 'تنبيهات وحاجات مهمة محتاجة تدخلك' : 'Critical Alerts'}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {briefing.criticalAlerts.map((alert, idx) => (
                            <div
                              key={idx}
                              className={`rounded-lg border p-3.5 space-y-1 text-xs ${
                                alert.severity.toLowerCase() === 'high'
                                  ? 'border-[#FECACA] bg-[#FEF2F2]'
                                  : 'border-[#FDE68A] bg-white/80'
                              }`}
                            >
                              <div className="font-semibold text-[#0F2233]">{alert.title}</div>
                              <p className="text-[#475569] leading-relaxed">{alert.detail}</p>
                              <div className="font-semibold text-[#D9461B] pt-0.5">
                                {copilotLang === 'ar' ? 'الإجراء المطلوب: ' : 'Action: '}
                                {alert.action}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/95 p-5 space-y-3 shadow-xs">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#065F46]">
                          <Lightbulb className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                          <span>
                            {copilotLang === 'ar' ? 'فرص متاحة لزيادة المكسب' : 'Growth Opportunities'}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {briefing.growthOpportunities.map((opp, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-[#A7F3D0] bg-white/80 p-3.5 space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[#0F2233]">{opp.title}</span>
                                <span className="font-semibold text-[#15803D]">{opp.estimatedImpact}</span>
                              </div>
                              <p className="text-[#475569] leading-relaxed">{opp.detail}</p>
                              <div className="font-semibold text-[#D9461B] pt-0.5">{opp.action}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card-wasla bg-[#FAF4ED] p-5 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F2233]">
                          <TrendingUp className="h-4 w-4 text-[#EE5426]" aria-hidden="true" />
                          <span>
                            {copilotLang === 'ar'
                              ? 'خطة التسويق العملية للأسبوع القادم'
                              : 'Weekly Marketing Plan'}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {briefing.marketingPlan.map((step, idx) => (
                            <div key={idx} className="rounded-lg border border-[#C8C2B8]/60 bg-white/90 p-3.5 text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[#EE5426]">{step.channel}</span>
                                <span className="font-medium text-[#10B981]">{step.expectedReturn}</span>
                              </div>
                              <div className="font-semibold text-[#0F2233]">{step.focusTripOrAngle}</div>
                              <p className="text-[#64748B] leading-relaxed">{step.weeklyAction}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right 5 Cols: AI Copilot Chat Stream */}
                <div className="lg:col-span-5 rounded-xl border border-[#99F6E4] bg-[#F0FDFA]/95 p-5 flex flex-col justify-between gap-4 min-h-[540px] shadow-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {(copilotLang === 'ar'
                      ? [
                          'اعملي خطة تسويق بـ 50 يورو للأسبوع ده',
                          'إيه أهم مشكلة أو حجز محتاج قرار مني دلوقتي؟',
                          'إزاي أزود أرباحي من رحلات الأقصر والانتقالات؟',
                        ]
                      : [
                          'Build a €50 weekly marketing plan for Hurghada & Luxor',
                          'What urgent operational issue needs my decision today?',
                          'How can I increase margin on private guides & transfers?',
                        ]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => void handleAskCopilot(preset)}
                        disabled={chatLoading}
                        className="rounded-lg border border-[#CCFBF1] bg-white/85 px-2.5 py-1.5 text-[11px] font-medium text-[#0F2233] hover:border-[#0D9488] hover:bg-white transition-colors text-start cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div
                    ref={chatThreadRef}
                    className="flex-1 space-y-2.5 overflow-y-auto max-h-[340px] py-2 scroll-smooth"
                  >
                    {copilotMessages.length === 0 && !chatLoading ? (
                      <div className="rounded-lg border border-dashed border-[#5EEAD4] bg-white/75 p-4 text-xs text-[#334155] leading-relaxed">
                        {copilotLang === 'ar'
                          ? 'اضغط على زر المايك بالأسفل واتكلم بصوتك أو اكتب سؤالك، والمساعد هيرد عليك كتابياً فوراً.'
                          : 'Tap the microphone button below to speak or type your question, your AI Chief of Staff replies immediately.'}
                      </div>
                    ) : (
                      <>
                        {copilotMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                              msg.role === 'owner'
                                ? 'bg-[#0F766E] text-white ms-8'
                                : 'border border-[#CCFBF1] bg-white/90 text-[#0F2233] me-4'
                            }`}
                          >
                            <div>{msg.text}</div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="rounded-xl border border-[#CCFBF1] bg-white/90 px-3.5 py-2.5 text-xs text-[#0F766E] me-4 inline-flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden="true" />
                            <span>{copilotLang === 'ar' ? 'جاري كتابة الرد...' : 'Writing reply...'}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (isRecordingVoice) {
                        stopVoiceRecording();
                        return;
                      }
                      void handleAskCopilot();
                    }}
                    className="flex items-center gap-2 border-t border-[#CCFBF1] pt-3"
                  >
                    <button
                      type="button"
                      onClick={() => void startVoiceRecording('copilot')}
                      disabled={chatLoading}
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-all cursor-pointer ${
                        isRecordingVoice
                          ? 'bg-[#DC2626] hover:bg-[#B91C1C] ring-2 ring-[#FCA5A5]'
                          : transcribingVoice
                          ? 'bg-[#D97706] hover:bg-[#B45309]'
                          : 'bg-[#0F2233] hover:bg-[#19354F] disabled:opacity-60'
                      }`}
                    >
                      {transcribingVoice ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : isRecordingVoice ? (
                        <Square className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
                      ) : (
                        <Mic className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={copilotQuestion}
                      onChange={(e) => setCopilotQuestion(e.target.value)}
                      placeholder={
                        copilotLang === 'ar'
                          ? 'تكلم بالمايك أو اكتب سؤالك لـ AI Copilot...'
                          : 'Speak via mic or ask AI Copilot...'
                      }
                      className="min-h-[40px] flex-1 rounded-lg border border-[#99F6E4] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#0D9488] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !copilotQuestion.trim()}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0F766E] px-3.5 text-xs font-semibold text-white hover:bg-[#115E59] disabled:opacity-60 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{chatLoading ? '...' : copilotLang === 'ar' ? 'إرسال' : 'Send'}</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Unified Conversations Inbox + Large Mint-Green Viewer & Reply Panel */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left 5 Cols: Merged WhatsApp/Pickup Dispatch + Emails & Subscribers List */}
                <div className="lg:col-span-5 rounded-xl border border-[#CBD5E1] bg-white/95 p-4 flex flex-col gap-3 shadow-xs min-h-[600px] max-h-[720px]">
                  {/* Filter Pills & AI Copilot Shortcut */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setInboxFilter('all')}
                        className={`rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors ${
                          inboxFilter === 'all'
                            ? 'bg-[#0F2233] text-white'
                            : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F2233]'
                        }`}
                      >
                        {copilotLang === 'ar' ? 'الكل' : 'All'} ({unifiedInboxEntries.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInboxFilter('whatsapp')}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors ${
                          inboxFilter === 'whatsapp'
                            ? 'bg-[#15803D] text-white'
                            : 'bg-[#F0FDF4] text-[#15803D] hover:bg-[#DCFCE7]'
                        }`}
                      >
                        <MessageCircle className="h-3 w-3" aria-hidden="true" />
                        <span>
                          {copilotLang === 'ar' ? 'واتساب وشات' : 'WhatsApp & Chats'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInboxFilter('email')}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors ${
                          inboxFilter === 'email'
                            ? 'bg-[#BE123C] text-white'
                            : 'bg-[#FFF1F2] text-[#9F1239] hover:bg-[#FFE4E6]'
                        }`}
                      >
                        <Mail className="h-3 w-3" aria-hidden="true" />
                        <span>
                          {copilotLang === 'ar' ? 'إيميلات ومشتركين' : 'Emails & Subs'}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInboxKey('copilot');
                        setComposerMode('copilot');
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer ${
                        selectedInboxKey === 'copilot'
                          ? 'border-[#0F2233] bg-[#0F2233] text-white'
                          : 'border-[#C8C2B8] bg-[#FAF4ED] text-[#0F2233] hover:bg-[#C8C2B8]/25'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      <span>AI Copilot</span>
                    </button>
                  </div>

                  {/* Quick Search */}
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute top-1/2 start-3 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={inboxSearch}
                      onChange={(e) => setInboxSearch(e.target.value)}
                      placeholder={
                        copilotLang === 'ar'
                          ? 'ابحث باسم العميل، رقم الحجز WT، أو الإيميل...'
                          : 'Search guest, WT booking ref, or email...'
                      }
                      className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] ps-8 pe-3 py-2 text-xs text-[#0F2233] focus:border-[#0D9488] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Unified Scrollable Inbox Items */}
                  <div className="flex-1 overflow-y-auto space-y-2 pe-1">
                    {filteredInboxEntries.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[#CBD5E1] p-6 text-center text-xs text-[#64748B]">
                        {copilotLang === 'ar'
                          ? 'لا توجد مراسلات مطابقة لهذا البحث.'
                          : 'No matching conversations or emails.'}
                      </div>
                    ) : (
                      filteredInboxEntries.map((item) => {
                        const isSelected = selectedInboxItem?.key === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setSelectedInboxKey(item.key);
                              setComposerMode('reply');
                              setLastSentWaLink(null);
                              setConversationFeedback(null);
                            }}
                            className={`w-full text-start rounded-xl border p-3 text-xs space-y-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#0D9488] bg-[#F0FDFA] ring-1 ring-[#0D9488]/40'
                                : item.kind === 'whatsapp'
                                ? 'border-[#E2E8F0] bg-white hover:border-[#16A34A]/50 hover:bg-[#F8FAFC]'
                                : 'border-[#FFE4E6] bg-[#FFFDFD] hover:border-[#FB7185] hover:bg-[#FFF1F2]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {item.kind === 'whatsapp' ? (
                                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
                                    <MessageCircle className="h-3 w-3" aria-hidden="true" />
                                  </span>
                                ) : (
                                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFE4E6] text-[#BE123C]">
                                    <Mail className="h-3 w-3" aria-hidden="true" />
                                  </span>
                                )}
                                <span className="font-semibold text-[#0F2233] truncate">
                                  {item.title}
                                </span>
                                {item.unread && (
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#EE5426]" />
                                )}
                              </div>
                              <span className="shrink-0 text-[10.5px] font-medium text-[#64748B] tabular-nums">
                                {item.timestampLabel}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="truncate font-medium text-[#334155]">
                                {item.subtitle}
                              </span>
                              {item.urgentLevel === 'today' ? (
                                <span className="shrink-0 font-bold text-[#B91C1C]">عاجل · اليوم</span>
                              ) : item.urgentLevel === 'tomorrow' ? (
                                <span className="shrink-0 font-bold text-[#D9461B]">عاجل · غداً</span>
                              ) : item.kind === 'email' ? (
                                <span className="shrink-0 font-semibold text-[#BE123C]">Email</span>
                              ) : item.kind === 'newsletter' ? (
                                <span className="shrink-0 font-semibold text-[#EE5426]">Subscriber</span>
                              ) : null}
                            </div>

                            <div className="text-[11px] text-[#64748B] truncate">{item.preview}</div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right 7 Cols: Large Mint-Green Viewing Workspace + Bottom Reply & Copilot Panel */}
                <div className="lg:col-span-7 rounded-xl border border-[#99F6E4] bg-[#F0FDFA]/95 p-4 sm:p-5 flex flex-col justify-between gap-3.5 min-h-[600px] max-h-[720px] shadow-xs">
                  {/* Top Active Channel Context Bar */}
                  {selectedInboxItem ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CCFBF1] pb-3">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold ${
                              selectedInboxItem.kind === 'whatsapp'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : selectedInboxItem.kind === 'email'
                                ? 'bg-[#FFE4E6] text-[#9F1239]'
                                : 'bg-[#FAF4ED] text-[#0F2233] border border-[#C8C2B8]/60'
                            }`}
                          >
                            {selectedInboxItem.kind === 'whatsapp'
                              ? 'WhatsApp & Guest Chat'
                              : selectedInboxItem.kind === 'email'
                              ? selectedInboxItem.emailLog?.type || 'Sent Email'
                              : 'Newsletter Subscriber'}
                          </span>
                          <h3 className="text-sm font-semibold text-[#0F2233] truncate">
                            {selectedInboxItem.title}
                          </h3>
                          {selectedInboxItem.booking?.guestCountry && (
                            <span className="text-[11px] font-medium text-[#475569]">
                              · {selectedInboxItem.booking.guestCountry}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#0F766E] truncate">
                          {selectedInboxItem.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {selectedInboxItem.booking && (
                          <button
                            type="button"
                            onClick={() => openOwnerBookingModal(selectedInboxItem.booking!, 'ticket')}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#0D9488]/40 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0F766E] hover:bg-[#CCFBF1] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{copilotLang === 'ar' ? 'تيكت الحجز' : 'View Ticket'}</span>
                          </button>
                        )}
                        {selectedInboxItem.kind === 'whatsapp' && selectedInboxItem.booking && (() => {
                          const directWa = buildGuestPickupWhatsAppUrl({
                            guestWhatsapp: selectedInboxItem.booking.guestWhatsapp,
                            guestContact: selectedInboxItem.booking.guestContact,
                            bookingId: selectedInboxItem.booking.id,
                            guestName: selectedInboxItem.booking.guestName,
                            tripTitle: selectedInboxItem.booking.tripTitle,
                            date: selectedInboxItem.booking.date,
                            tripStartTime: selectedInboxItem.booking.tripStartTime,
                            pickupTime: selectedInboxItem.booking.pickupTime,
                            pickupSpot: selectedInboxItem.booking.pickupSpot,
                            hotel: selectedInboxItem.booking.hotel,
                            roomNumber: selectedInboxItem.booking.roomNumber,
                            driverOrGuide: selectedInboxItem.booking.assignedDriverOrGuide,
                            guestLang: selectedInboxItem.booking.guestLang,
                            notes: selectedInboxItem.booking.notes,
                          });
                          return directWa ? (
                            <a
                              href={directWa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#15803D]"
                            >
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                              <span>WhatsApp</span>
                            </a>
                          ) : null;
                        })()}
                        {(selectedInboxItem.kind === 'email' || selectedInboxItem.kind === 'newsletter') && (
                          <a
                            href={`mailto:${encodeURIComponent(
                              selectedInboxItem.emailLog?.to || selectedInboxItem.subscriberEmail || ''
                            )}?subject=${encodeURIComponent(
                              selectedInboxItem.emailLog
                                ? `Re: ${selectedInboxItem.emailLog.subject}`
                                : `Wasla Travel Red Sea Offers`
                            )}${
                              conversationReplyDraft.trim()
                                ? `&body=${encodeURIComponent(conversationReplyDraft.trim())}`
                                : ''
                            }`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#BE123C] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#9F1239]"
                          >
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{copilotLang === 'ar' ? 'فتح تطبيق الإيميل' : 'Open Mail App'}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CCFBF1] pb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#0F2233]">
                        <Bot className="h-4 w-4" aria-hidden="true" />
                        <span>
                          {copilotLang === 'ar'
                            ? 'مساعد AI Copilot التنفيذي، اسأل أي سؤال عن الشركة أو المراسلات'
                            : 'AI Copilot Executive Assistant'}
                        </span>
                      </div>
                      {unifiedInboxEntries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInboxKey(unifiedInboxEntries[0].key);
                            setComposerMode('reply');
                          }}
                          className="rounded-lg border border-[#0D9488]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F766E] hover:bg-[#CCFBF1] cursor-pointer"
                        >
                          {copilotLang === 'ar' ? 'العودة لأحدث مراسلة' : 'Back to Latest Message'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Large Green Viewing Area: Original Styled Email OR Chronological WhatsApp Thread OR Copilot Stream */}
                  <div
                    ref={composerMode === 'copilot' || !selectedInboxItem ? chatThreadRef : replyThreadRef}
                    className="flex-1 overflow-y-auto space-y-3 pe-1 scroll-smooth"
                  >
                    {composerMode === 'copilot' || !selectedInboxItem ? (
                      copilotMessages.length === 0 && !chatLoading ? (
                        <div className="space-y-3">
                          <div className="rounded-xl border border-dashed border-[#5EEAD4] bg-white/85 p-4 text-xs text-[#334155] leading-relaxed">
                            {copilotLang === 'ar'
                              ? 'أهلاً بك في AI Copilot! تكلم بالمايك أو اكتب سؤالك بالأسفل، أو اختر أي مراسلة من القائمة على اليمين لقراءة الإيميل الأصلي أو الرد على الواتساب.'
                              : 'Ask AI Copilot anything via mic or text below, or pick any WhatsApp chat or sent email on the left.'}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(copilotLang === 'ar'
                              ? [
                                  'إيه أهم حجز أو رسالة عميل محتاجة تدخل سريع دلوقتي؟',
                                  'اكتب لي رسالة ترحيب احترافية للعملاء الجدد على واتساب',
                                  'ملخص سريع لحالة الحجوزات والشكاوى النهاردة',
                                ]
                              : [
                                  'Which booking or customer chat needs urgent action right now?',
                                  'Write a warm WhatsApp pickup message template',
                                  'Give me a quick status summary for today',
                                ]
                            ).map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => void handleAskCopilot(preset)}
                                disabled={chatLoading}
                                className="rounded-lg border border-[#CCFBF1] bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-[#0F2233] hover:border-[#0D9488] cursor-pointer text-start"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          {copilotMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                                msg.role === 'owner'
                                  ? 'bg-[#0F766E] text-white ms-8'
                                  : 'border border-[#CCFBF1] bg-white/95 text-[#0F2233] me-4'
                              }`}
                            >
                              {msg.text}
                            </div>
                          ))}
                          {chatLoading && (
                            <div className="rounded-xl border border-[#CCFBF1] bg-white/90 px-3.5 py-2.5 text-xs text-[#0F766E] me-4 inline-flex items-center gap-2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden="true" />
                              <span>{copilotLang === 'ar' ? 'جاري الرد...' : 'Writing reply...'}</span>
                            </div>
                          )}
                        </>
                      )
                    ) : selectedInboxItem.kind === 'email' || selectedInboxItem.kind === 'newsletter' ? (
                      /* AUTHENTIC ORIGINAL SENT EMAIL VISUAL RENDERER */
                      (() => {
                        const bk = selectedInboxItem.booking;
                        const log = selectedInboxItem.emailLog;
                        const recipientEmail = log?.to || selectedInboxItem.subscriberEmail || SITE_CONFIG.email;
                        const emailType = log?.type || 'Newsletter';
                        const subjectLine =
                          log?.subject || `Welcome to Wasla Travel Red Sea Insider, ${SITE_CONFIG.domain}`;
                        const sentTime = log?.sentAt || 'Active Subscriber';
                        const guestDisplay = bk?.guestName || recipientEmail.split('@')[0] || 'Valued Guest';
                        const waHelpUrl = `https://wa.me/${normalizeWhatsAppDigits(
                          publicSettings?.whatsappNumber || SITE_CONFIG.whatsappNumber
                        )}`;
                        return (
                          <div
                            dir="ltr"
                            className="rounded-xl border border-[#CBD5E1] bg-white shadow-sm overflow-hidden text-left"
                          >
                            {/* Real Email Header Envelope */}
                            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[11.5px] space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold text-[#0F2233]">
                                  From:{' '}
                                  <span className="font-normal text-[#334155]">
                                    Wasla Travel Operations &lt;{SITE_CONFIG.email}&gt;
                                  </span>
                                </span>
                                <span className="inline-flex items-center gap-1 rounded bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#15803D]">
                                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                  <span>{log?.status || 'Delivered'} · {sentTime}</span>
                                </span>
                              </div>
                              <div className="text-[#475569]">
                                <span className="font-semibold text-[#0F2233]">To:</span> {recipientEmail}
                              </div>
                              <div className="text-[#0F2233] font-semibold">
                                Subject: <span className="font-medium">{subjectLine}</span>
                              </div>
                            </div>

                            {/* Branded HTML Email Layout As Delivered */}
                            <div className="bg-gradient-to-r from-[#0F2233] to-[#19354F] px-5 py-4 text-white flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <div className="text-base font-bold tracking-tight">
                                  WASLA TRAVEL <span className="text-[#FB923C]">· وصلة ترافيل</span>
                                </div>
                                <div className="text-[11px] text-slate-300">
                                  Curated Red Sea, Luxor &amp; Cairo Experiences · {SITE_CONFIG.domain}
                                </div>
                              </div>
                              <span className="rounded-md bg-[#EE5426] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white">
                                {emailType}
                              </span>
                            </div>
                            <div className="h-1 bg-[#EE5426]" />

                            <div className="p-5 space-y-4 text-xs text-[#0F2233] leading-relaxed">
                              <h4 className="text-base font-bold text-[#0F2233]">
                                {emailType === 'Payment Link'
                                  ? 'Your Secure Excursion Payment Link Is Ready'
                                  : emailType === 'Supplier Dispatch'
                                  ? 'Partner Pickup & Dispatch Order'
                                  : emailType === 'Newsletter'
                                  ? 'Welcome to Wasla Travel Insider Picks'
                                  : 'Your Excursion & Pickup Is Confirmed'}
                              </h4>

                              <p>
                                Dear <span className="font-semibold text-[#0F2233]">{guestDisplay}</span>,
                              </p>

                              <p>
                                {emailType === 'Payment Link'
                                  ? `Thank you for reserving with Wasla Travel. Below are your verified excursion details and balance summary (${bk?.id || 'Booking'}).`
                                  : emailType === 'Supplier Dispatch'
                                  ? `Please find the confirmed guest pickup assignment below. Ensure our driver/guide arrives 10 minutes prior to pickup with clear Wasla Travel signage.`
                                  : emailType === 'Newsletter'
                                  ? `Thank you for subscribing with ${recipientEmail}. Expect handpicked small-group Red Sea boat days, private Egyptologist Luxor & Cairo tours, and direct transparent Euro rates with zero hidden fees.`
                                  : `Thank you for booking with Wasla Travel! Your pickup and reservation have been logged by our Hurghada Operations Desk. Please review your official excursion ticket details below:`}
                              </p>

                              {bk && (
                                <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
                                  <div className="bg-[#FFF7ED] border-b border-[#FED7AA] px-3.5 py-2 flex items-center justify-between">
                                    <span className="font-mono font-bold text-[#D9461B]">
                                      BOOKING REF: {bk.id}
                                    </span>
                                    <span className="font-semibold text-[#0F2233]">{bk.status}</span>
                                  </div>
                                  <table className="w-full text-[11.5px] border-collapse">
                                    <tbody className="divide-y divide-[#E2E8F0]">
                                      <tr className="bg-white">
                                        <td className="px-3.5 py-2 font-semibold text-[#64748B] w-[36%]">Excursion</td>
                                        <td className="px-3.5 py-2 font-semibold text-[#0F2233]">{bk.tripTitle}</td>
                                      </tr>
                                      <tr className="bg-[#F8FAFC]">
                                        <td className="px-3.5 py-2 font-semibold text-[#64748B]">Date &amp; Trip Start</td>
                                        <td className="px-3.5 py-2 font-semibold text-[#0F2233]">
                                          {bk.date}
                                          {bk.tripStartTime ? ` · ${bk.tripStartTime}` : ''}
                                        </td>
                                      </tr>
                                      <tr className="bg-white">
                                        <td className="px-3.5 py-2 font-semibold text-[#64748B]">Hotel Pickup Time</td>
                                        <td className="px-3.5 py-2 font-semibold text-[#EE5426]">
                                          {bk.pickupTime && bk.pickupTime !== 'TBD'
                                            ? bk.pickupTime
                                            : 'TBD (Confirmed via WA)'}
                                        </td>
                                      </tr>
                                      <tr className="bg-white">
                                        <td className="px-3.5 py-2 font-semibold text-[#64748B]">Hotel &amp; Meeting Point</td>
                                        <td className="px-3.5 py-2 text-[#0F2233]">
                                          {bk.hotel}
                                          {bk.roomNumber ? ` · Room ${bk.roomNumber}` : ''} ·{' '}
                                          <span className="font-medium text-[#EE5426]">
                                            {bk.pickupSpot || 'Inside Reception'}
                                          </span>
                                        </td>
                                      </tr>
                                      <tr className="bg-[#F8FAFC]">
                                        <td className="px-3.5 py-2 font-semibold text-[#64748B]">Guests &amp; Nationality</td>
                                        <td className="px-3.5 py-2 text-[#0F2233]">
                                          {bk.adults} Adult(s)
                                          {bk.children > 0 ? ` + ${bk.children} Child(ren)` : ''}
                                          {(bk.infants ?? 0) > 0 ? ` + ${bk.infants} Infant(s)` : ''}
                                          {bk.guestCountry ? ` · ${bk.guestCountry}` : ''}
                                        </td>
                                      </tr>
                                      <tr className="bg-white">
                                        <td className="px-3.5 py-2 font-semibold text-[#64748B]">Driver / Guide</td>
                                        <td className="px-3.5 py-2 text-[#0F2233]">
                                          {bk.assignedDriverOrGuide || 'Assigned prior to pickup'}
                                        </td>
                                      </tr>
                                      <tr className="bg-[#F8FAFC]">
                                        <td className="px-3.5 py-2 font-semibold text-[#64748B]">Total Guest Price</td>
                                        <td className="px-3.5 py-2 font-mono font-bold text-[#15803D]">
                                          €{bk.grossEur} ({bk.paymentStatus})
                                        </td>
                                      </tr>
                                      {bk.notes && (
                                        <tr className="bg-white">
                                          <td className="px-3.5 py-2 font-semibold text-[#64748B]">Special Notes</td>
                                          <td className="px-3.5 py-2 text-[#334155]">{bk.notes}</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              <div className="pt-1">
                                <a
                                  href={waHelpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-wasla-primary gap-1.5 rounded-lg px-4 py-2 text-xs"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>
                                    WhatsApp Operations ({publicSettings?.whatsappDisplay || SITE_CONFIG.whatsappDisplay})
                                  </span>
                                </a>
                              </div>

                              <div className="border-t border-[#E2E8F0] pt-3 text-[11px] text-[#64748B] space-y-0.5">
                                <div className="font-semibold text-[#0F2233]">
                                  Wasla Travel Operations Desk · Hurghada &amp; Red Sea
                                </div>
                                <div>
                                  {SITE_CONFIG.domain} · {SITE_CONFIG.email} · Free 24h cancellation guarantee
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* CHRONOLOGICAL TIMESTAMPED WHATSAPP / CUSTOMER CONVERSATION */
                      (() => {
                        const bk = selectedInboxItem.booking;
                        const ch = selectedInboxItem.chatThread;
                        const messages = ch
                          ? ch.messages
                          : bk
                          ? [
                              {
                                id: `bk-sys-${bk.id}`,
                                sender: 'customer' as const,
                                text: `طلب حجز جديد ${bk.id} · ${bk.tripTitle}\nالتاريخ: ${bk.date}${bk.tripStartTime ? ` · بداية الرحلة: ${bk.tripStartTime}` : ''}${bk.pickupTime ? ` · البيك أب: ${bk.pickupTime}` : ''}\nالفندق: ${bk.hotel}${bk.roomNumber ? ` (غرفة ${bk.roomNumber})` : ''} · ${bk.pickupSpot || 'Inside Reception'}\nعدد الأفراد: ${bk.adults} بالغ${bk.children > 0 ? ` + ${bk.children} طفل` : ''}${(bk.infants ?? 0) > 0 ? ` + ${bk.infants} رضيع` : ''}${bk.guestCountry ? ` · الجنسية: ${bk.guestCountry}` : ''}\nالإجمالي: €${bk.grossEur} (${bk.paymentStatus})${bk.notes ? `\nملاحظات العميل: ${bk.notes}` : ''}`,
                                timestamp: bk.createdAtMs
                                  ? new Date(bk.createdAtMs).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : bk.date,
                              },
                              ...(bk.assignedDriverOrGuide
                                ? [
                                    {
                                      id: `bk-drv-${bk.id}`,
                                      sender: 'operator' as const,
                                      text: `تم تعيين السائق/المرشد: ${bk.assignedDriverOrGuide} · موعد التحرك: ${bk.pickupTime || 'حسب التوقيت المؤكد'}.`,
                                      timestamp: bk.pickupTime || bk.date,
                                    },
                                  ]
                                : []),
                            ]
                          : [];

                        return (
                          <div className="space-y-3">
                            {/* Quick Booking Context Strip */}
                            {bk && (
                              <div className="rounded-lg border border-[#CCFBF1] bg-white/85 px-3 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[#0F2233]">
                                  <strong className="font-mono text-[#0F766E]">{bk.id}</strong> · {bk.date}{' '}
                                  {bk.tripStartTime ? `· Start: ${bk.tripStartTime} ` : ''}
                                  {bk.pickupTime ? `(Pickup: ${bk.pickupTime})` : ''} · {bk.hotel}
                                </span>
                                <span className="font-semibold text-[#15803D] tabular-nums">
                                  €{bk.grossEur} · {bk.assignedDriverOrGuide || 'بدون سائق بعد'}
                                </span>
                              </div>
                            )}

                            {/* Chronological Timestamped Bubbles */}
                            {messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${
                                  msg.sender === 'operator' ? 'items-end' : 'items-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                                    msg.sender === 'operator'
                                      ? 'bg-[#0F766E] text-white rounded-be-xs'
                                      : 'border border-[#CCFBF1] bg-white text-[#0F2233] rounded-bs-xs'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-80 font-semibold">
                                    <span>
                                      {msg.sender === 'operator'
                                        ? copilotLang === 'ar'
                                          ? 'وصلة ترافيل (أنت)'
                                          : 'Wasla Ops (You)'
                                        : selectedInboxItem.title}
                                    </span>
                                    <span className="tabular-nums font-mono">{msg.timestamp}</span>
                                  </div>
                                  <div dir="auto">{msg.text}</div>
                                  {msg.sender !== 'operator' && (
                                    <div className="mt-1.5 border-t border-[#E2E8F0] pt-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleToggleOwnerMsgTranslation(
                                            msg.id,
                                            msg.text,
                                            selectedInboxItem.chatThread?.customerLang ||
                                              selectedInboxItem.booking?.guestLang ||
                                              'auto'
                                          )
                                        }
                                        aria-expanded={!!ownerExpandedTranslations[msg.id]}
                                        className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[10.5px] font-semibold text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F2233] cursor-pointer"
                                      >
                                        <ChevronDown
                                          className={`h-3 w-3 transition-transform ${
                                            ownerExpandedTranslations[msg.id]
                                              ? 'rotate-180 text-[#0F766E]'
                                              : ''
                                          }`}
                                          aria-hidden="true"
                                        />
                                        <span>ترجمة</span>
                                      </button>

                                      {ownerExpandedTranslations[msg.id] && (
                                        <div
                                          dir="rtl"
                                          className="mt-1 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] px-2.5 py-1.5 text-[11.5px] leading-relaxed text-[#0F2233]"
                                        >
                                          {ownerTranslatingIds[msg.id] ? (
                                            <span className="inline-flex items-center gap-1 text-[#64748B] text-[10.5px]">
                                              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                              <span>جاري الترجمة…</span>
                                            </span>
                                          ) : ownerTranslationErrors[msg.id] ? (
                                            <span className="text-[#B91C1C] text-[10.5px] font-medium">
                                              {ownerTranslationErrors[msg.id]}
                                            </span>
                                          ) : (
                                            <p className="whitespace-pre-wrap">{ownerTranslatedMsgs[msg.id]}</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Feedback / Quick WhatsApp Launch Banner after Saving Reply */}
                  {(conversationFeedback || lastSentWaLink) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#86EFAC] bg-[#DCFCE7] px-3 py-2 text-xs font-semibold text-[#166534]">
                      <span>{conversationFeedback}</span>
                      {lastSentWaLink && (
                        <a
                          href={lastSentWaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-[#16A34A] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#15803D]"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span>{copilotLang === 'ar' ? 'إرسال النص في واتساب ↗' : 'Send Text on WhatsApp ↗'}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Recording / Transcribing Indicator */}
                  {(isRecordingVoice || transcribingVoice) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#B91C1C]">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626] animate-pulse" />
                        {transcribingVoice
                          ? copilotLang === 'ar'
                            ? 'جاري تحويل صوتك لنص...'
                            : 'Transcribing voice...'
                          : copilotLang === 'ar'
                          ? `جاري التسجيل (${recordingSeconds}ث)، تكلم ثم اضغط إرسال`
                          : `Listening (${recordingSeconds}s)...`}
                      </span>
                      <div className="inline-flex items-center gap-1.5">
                        {isRecordingVoice && (
                          <button
                            type="button"
                            onClick={stopVoiceRecording}
                            className="rounded bg-[#16A34A] hover:bg-[#15803D] px-2.5 py-1 text-[11px] font-semibold text-white cursor-pointer"
                          >
                            {copilotLang === 'ar' ? 'إنهاء وإدراج' : 'Done'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={cancelVoiceRecording}
                          className="rounded border border-[#FCA5A5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                        >
                          {copilotLang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Unified Reply + AI Copilot Composer Bar */}
                  <div className="border-t border-[#CCFBF1] pt-3 space-y-2">
                    {selectedInboxItem && (
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="inline-flex rounded-lg border border-[#99F6E4] bg-white/80 p-0.5 font-semibold">
                          <button
                            type="button"
                            onClick={() => setComposerMode('reply')}
                            className={`rounded-md px-2.5 py-1 cursor-pointer ${
                              composerMode === 'reply' ? 'bg-[#0F766E] text-white' : 'text-[#475569]'
                            }`}
                          >
                            {copilotLang === 'ar' ? 'الرد في المراسلة' : 'Reply to Guest'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setComposerMode('copilot')}
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 cursor-pointer ${
                              composerMode === 'copilot' ? 'bg-[#0F2233] text-white' : 'text-[#475569]'
                            }`}
                          >
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            <span>AI Copilot</span>
                          </button>
                        </div>

                        {composerMode === 'reply' && (
                          <button
                            type="button"
                            onClick={() => void handleDraftReplyWithCopilot()}
                            disabled={draftingAiReply}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#C8C2B8] bg-[#FAF4ED] px-2.5 py-1 font-semibold text-[#0F2233] hover:bg-[#C8C2B8]/30 disabled:opacity-60 cursor-pointer"
                          >
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            <span>
                              {draftingAiReply
                                ? copilotLang === 'ar'
                                  ? 'جاري صياغة الرد...'
                                  : 'Drafting...'
                                : copilotLang === 'ar'
                                ? 'صياغة رد ذكي بلغة العميل'
                                : 'AI Draft Reply'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (isRecordingVoice) {
                          stopVoiceRecording();
                          return;
                        }
                        if (composerMode === 'copilot' || !selectedInboxItem) {
                          void handleAskCopilot();
                        } else {
                          handleSendConversationReply();
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void startVoiceRecording(
                            composerMode === 'copilot' || !selectedInboxItem ? 'copilot' : 'reply'
                          )
                        }
                        disabled={chatLoading}
                        aria-label="Voice input"
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-all cursor-pointer ${
                          isRecordingVoice
                            ? 'bg-[#DC2626] hover:bg-[#B91C1C] ring-2 ring-[#FCA5A5]'
                            : transcribingVoice
                            ? 'bg-[#D97706] hover:bg-[#B45309]'
                            : 'bg-[#0F2233] hover:bg-[#19354F] disabled:opacity-60'
                        }`}
                      >
                        {transcribingVoice ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : isRecordingVoice ? (
                          <Square className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
                        ) : (
                          <Mic className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>

                      <input
                        type="text"
                        dir="auto"
                        value={
                          composerMode === 'copilot' || !selectedInboxItem
                            ? copilotQuestion
                            : conversationReplyDraft
                        }
                        onChange={(e) => {
                          if (composerMode === 'copilot' || !selectedInboxItem) {
                            setCopilotQuestion(e.target.value);
                          } else {
                            setConversationReplyDraft(e.target.value);
                          }
                        }}
                        placeholder={
                          composerMode === 'copilot' || !selectedInboxItem
                            ? copilotLang === 'ar'
                              ? 'تكلم بالمايك أو اكتب سؤالك لـ AI Copilot...'
                              : 'Speak via mic or ask AI Copilot...'
                            : selectedInboxItem.kind === 'whatsapp'
                            ? copilotLang === 'ar'
                              ? `اكتب أو أملِ ردك للعميل ${selectedInboxItem.title}...`
                              : `Write or dictate reply to ${selectedInboxItem.title}...`
                            : copilotLang === 'ar'
                            ? 'اكتب رد أو متابعة لهذا الإيميل...'
                            : 'Write a follow-up reply for this email...'
                        }
                        className="min-h-[40px] flex-1 rounded-lg border border-[#99F6E4] bg-white px-3 py-2 text-xs text-[#0F2233] focus:border-[#0D9488] focus:outline-none"
                      />

                      <button
                        type="submit"
                        disabled={
                          composerMode === 'copilot' || !selectedInboxItem
                            ? chatLoading || !copilotQuestion.trim()
                            : !conversationReplyDraft.trim()
                        }
                        className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer ${
                          composerMode === 'copilot' || !selectedInboxItem
                            ? 'bg-[#0F2233] hover:bg-[#19354F]'
                            : 'bg-[#0F766E] hover:bg-[#115E59]'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {composerMode === 'copilot' || !selectedInboxItem
                            ? copilotLang === 'ar'
                              ? 'إرسال'
                              : 'Ask'
                            : copilotLang === 'ar'
                            ? 'إرسال الرد'
                            : 'Send Reply'}
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editorState.open && (
        <OwnerTripEditorModal
          initialTrip={editorState.trip}
          mode={editorState.mode}
          allTrips={trips}
          suppliers={suppliers}
          onClose={() => setEditorState({ open: false, mode: 'create', trip: null })}
          onSaveTrip={async (savedTrip, saveMode) => {
            if (saveMode === 'create' && onCreateTrip) {
              await onCreateTrip(savedTrip);
            } else if (saveMode === 'edit' && onUpdateTrip) {
              await onUpdateTrip(savedTrip);
            }
          }}
        />
      )}

      <TripDetailModal
        trip={previewTripModal}
        previewMode
        lang="en"
        t={I18N.en}
        onClose={() => setPreviewTripModal(null)}
        onSubmitBooking={() => {}}
      />

      {/* Owner Booking View / Edit & Pickup Dispatch Modal */}
      {bookingModalDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/60 p-4 backdrop-blur-[2px]"
          onClick={() => setBookingModalDraft(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Booking ${bookingModalDraft.id}`}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white/95 px-6 py-4 backdrop-blur-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0D9488]">
                  <span>
                    {bookingModalMode === 'ticket'
                      ? `تيكت حجز العميل · Customer Ticket · ${bookingModalDraft.id}`
                      : `لوحة تعديل التيكت · Edit Booking · ${bookingModalDraft.id}`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      getBookingUrgency(bookingModalDraft).isUrgent
                        ? 'text-[#B91C1C] font-bold'
                        : 'text-[#475569]'
                    }
                  >
                    {getBookingUrgency(bookingModalDraft).label}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[#0F2233]">
                  {bookingModalDraft.guestName}, {bookingModalDraft.tripTitle}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {bookingModalMode === 'ticket' ? (
                  <button
                    type="button"
                    onClick={() => setBookingModalMode('edit')}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#0D9488] bg-[#F0FDFA] px-3.5 text-xs font-semibold text-[#0F766E] hover:bg-[#CCFBF1] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isAr ? 'تعديل البيانات' : 'Edit Details'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBookingModalMode('ticket')}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-semibold text-[#0F2233] hover:bg-[#E2E8F0] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
                    <span>{isAr ? 'العودة للتذكرة' : 'Back to Ticket'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setBookingModalDraft(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F2233] hover:bg-[#F1F5F9] cursor-pointer"
                  aria-label="Close booking details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {bookingModalMode === 'ticket' ? (
              <div className="p-6 space-y-5">
                {bookingModalSaved && (
                  <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2.5 text-xs font-semibold text-[#15803D] flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {isAr
                        ? 'تم حفظ التعديلات وتحديث التذكرة بنجاح.'
                        : 'Changes saved and booking ticket updated.'}
                    </span>
                  </div>
                )}

                {/* Visual Booking Ticket Card */}
                <div className="overflow-hidden rounded-2xl border-2 border-[#0D9488]/40 bg-white shadow-lg">
                  {/* Ticket Header Bar */}
                  <div className="bg-gradient-to-r from-[#0F2233] via-[#134E4A] to-[#0F2233] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#5EEAD4]">
                        {isAr ? 'تذكرة حجز وصلة ترافيل الرسمية' : 'WASLA TRAVEL OFFICIAL BOOKING TICKET'}
                      </span>
                      <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                        {bookingModalDraft.tripTitle}
                      </div>
                      <div className="text-xs text-[#CCFBF1]">
                        {bookingModalDraft.destination} · {bookingModalDraft.category} ·{' '}
                        {isAr ? 'المورد:' : 'Supplier:'} {bookingModalDraft.supplierName}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-lg bg-[#EE5426] px-3 py-1 font-mono text-xs font-bold text-white">
                        {bookingModalDraft.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="rounded bg-white/15 px-2 py-0.5 font-semibold text-white">
                          {bookingModalDraft.status}
                        </span>
                        <span className="rounded bg-[#10B981]/25 px-2 py-0.5 font-semibold text-[#A7F3D0]">
                          {bookingModalDraft.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Specifications Body */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          {isAr ? 'اسم العميل' : 'Guest Name'}
                        </span>
                        <strong className="mt-1 block text-sm font-bold text-[#0F2233]">
                          {bookingModalDraft.guestName}
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/70 p-3">
                        <span className="block text-[11px] font-semibold text-[#9A3412]">
                          {isAr ? 'الجنسية' : 'Nationality'}
                        </span>
                        <strong className="mt-1 block text-sm font-bold text-[#EE5426]">
                          {bookingModalDraft.guestCountry || 'Guest'}
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3">
                        <span className="block text-[11px] font-semibold text-[#15803D]">
                          {isAr ? 'إجمالي السعر' : 'Total Price'}
                        </span>
                        <strong className="mt-1 block font-mono text-base font-extrabold text-[#15803D] tabular-nums">
                          €{bookingModalDraft.grossEur}
                        </strong>
                      </div>
                    </div>

                    {/* Perforated Divider */}
                    <div className="relative flex items-center py-1">
                      <div className="h-4 w-4 -ms-8 rounded-full bg-[#0F2233]/10 border border-[#CBD5E1]" />
                      <div className="flex-1 border-t-2 border-dashed border-[#CBD5E1]" />
                      <div className="h-4 w-4 -me-8 rounded-full bg-[#0F2233]/10 border border-[#CBD5E1]" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA]/70 p-3.5 space-y-1.5">
                        <span className="block text-[11px] font-semibold text-[#0F766E]">
                          {isAr ? 'التاريخ ومواعيد الرحلة والبيك أب' : 'Date, Trip Start & Pickup'}
                        </span>
                        <div className="text-xs font-medium text-[#334155] tabular-nums space-y-0.5">
                          <div>
                            {isAr ? 'التاريخ:' : 'Date:'}{' '}
                            <strong className="font-mono text-[#0F2233]">{bookingModalDraft.date}</strong>
                          </div>
                          {bookingModalDraft.tripStartTime && (
                            <div>
                              {isAr ? 'توقيت بداية الرحلة:' : 'Trip Start:'}{' '}
                              <strong className="text-[#EE5426]">
                                {bookingModalDraft.tripStartTime}
                              </strong>
                            </div>
                          )}
                          <div>
                            {isAr ? 'موعد الاستلام:' : 'Hotel Pickup:'}{' '}
                            <strong className="font-mono text-[#0F2233]">
                              {bookingModalDraft.pickupTime || 'TBD'}
                            </strong>
                          </div>
                        </div>
                        <span className="block text-[11px] font-semibold text-[#0D9488]">
                          {bookingModalDraft.pickupSpot === 'Outside Main Gate'
                            ? isAr
                              ? 'أمام البوابة الرئيسية للفندق'
                              : 'Outside Hotel Main Gate'
                            : isAr
                            ? 'داخل استقبال الفندق'
                            : 'Inside Hotel Reception'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA]/70 p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#0F766E]">
                          {isAr ? 'الفندق ورقم الغرفة' : 'Hotel & Room'}
                        </span>
                        <strong className="block text-sm font-bold text-[#0F2233]">
                          {bookingModalDraft.hotel}
                        </strong>
                        <span className="block text-[11px] font-semibold text-[#475569]">
                          {bookingModalDraft.roomNumber
                            ? isAr
                              ? `رقم الغرفة: ${bookingModalDraft.roomNumber}`
                              : `Room No: ${bookingModalDraft.roomNumber}`
                            : isAr
                            ? 'لم يُضف رقم الغرفة بعد'
                            : 'Room number not added yet'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          {isAr ? 'عدد الأفراد' : 'Guests Manifest'}
                        </span>
                        <strong className="block text-sm font-bold text-[#0F2233] tabular-nums">
                          {bookingModalDraft.adults} {isAr ? 'بالغين' : 'Adults'}
                          {bookingModalDraft.children > 0
                            ? ` + ${bookingModalDraft.children} ${isAr ? 'أطفال' : 'Children'}`
                            : ''}
                          {(bookingModalDraft.infants ?? 0) > 0
                            ? ` + ${bookingModalDraft.infants} ${isAr ? 'رضّع' : 'Infants (INF)'}`
                            : ''}
                        </strong>
                        <span className="block text-[11px] font-medium text-[#EE5426]">
                          {isAr
                            ? `إجمالي الكشف: ${
                                bookingModalDraft.adults +
                                bookingModalDraft.children +
                                (bookingModalDraft.infants ?? 0)
                              } فرد`
                            : `Total headcount: ${
                                bookingModalDraft.adults +
                                bookingModalDraft.children +
                                (bookingModalDraft.infants ?? 0)
                              }`}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          {isAr ? 'بيانات التواصل' : 'Guest Contact'}
                        </span>
                        <strong className="block font-mono text-xs font-bold text-[#0F2233] tabular-nums">
                          WA: {bookingModalDraft.guestWhatsapp || bookingModalDraft.guestContact || '—'}
                        </strong>
                        <span className="block text-xs font-medium text-[#334155] break-all">
                          Email: {bookingModalDraft.guestEmail || '—'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          {isAr ? 'المورد والسائق / المرشد' : 'Supplier & Driver / Guide'}
                        </span>
                        <strong className="block text-xs sm:text-sm font-bold text-[#0F2233]">
                          {bookingModalDraft.supplierName}
                        </strong>
                        <span className="block text-xs font-medium text-[#0D9488]">
                          {isAr ? 'السائق / المرشد:' : 'Driver / Guide:'}{' '}
                          {bookingModalDraft.assignedDriverOrGuide ||
                            (isAr ? 'لم يتم التعيين بعد' : 'Not assigned yet')}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
                        <span className="block text-[11px] font-semibold text-[#64748B]">
                          {isAr ? 'ملاحظات الحجز' : 'Booking Notes'}
                        </span>
                        <p className="text-xs font-medium text-[#334155] leading-relaxed">
                          {bookingModalDraft.notes ||
                            (isAr ? 'لا توجد ملاحظات إضافية.' : 'No additional booking notes.')}
                        </p>
                      </div>
                    </div>

                    {bookingModalDraft.locationImageUrl && (
                      <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 space-y-1.5">
                        <span className="block text-xs font-semibold text-[#0F2233]">
                          {isAr
                            ? 'صورة بوابة الفندق أو بطاقة الغرفة'
                            : 'Attached Hotel Gate / Room Card Photo'}
                        </span>
                        <img
                          src={bookingModalDraft.locationImageUrl}
                          alt="Hotel gate or room card"
                          className="max-h-48 w-auto rounded-lg object-contain mx-auto border border-[#E2E8F0] bg-white p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Actions Bar on the Ticket (Send WA, Send Email, Quick Confirm, or Open Edit) */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const livePickup = `${(pickupClock || '08:30').trim()} ${pickupPeriod}`;
                      const liveWaUrl = buildGuestPickupWhatsAppUrl({
                        guestWhatsapp: bookingModalDraft.guestWhatsapp,
                        guestContact: bookingModalDraft.guestContact,
                        bookingId: bookingModalDraft.id,
                        guestName: bookingModalDraft.guestName,
                        tripTitle: bookingModalDraft.tripTitle,
                        date: bookingModalDraft.date,
                        tripStartTime: bookingModalDraft.tripStartTime,
                        pickupTime: bookingModalDraft.pickupTime || livePickup,
                        pickupSpot: bookingModalDraft.pickupSpot,
                        hotel: bookingModalDraft.hotel,
                        roomNumber: bookingModalDraft.roomNumber,
                        driverOrGuide: bookingModalDraft.assignedDriverOrGuide,
                        guestLang: bookingModalDraft.guestLang,
                        notes: bookingModalDraft.notes,
                      });
                      return (
                        <>
                          {liveWaUrl && (
                            <a
                              href={liveWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="wasla-wa-glare inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white"
                            >
                              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{isAr ? 'إرسال عبر واتساب' : 'Send WhatsApp'}</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              openEmailForBooking({
                                ...bookingModalDraft,
                                pickupTime: bookingModalDraft.pickupTime || livePickup,
                              })
                            }
                            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#D9461B] hover:bg-[#FFEDD5] cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isAr ? 'إرسال إيميل' : 'Send Email'}</span>
                          </button>
                          {onUpdateBooking && bookingModalDraft.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateBooking(bookingModalDraft.id, { status: 'Confirmed' });
                                setBookingModalDraft((prev) =>
                                  prev ? { ...prev, status: 'Confirmed' } : prev
                                );
                                setBookingModalSaved(true);
                                window.setTimeout(() => setBookingModalSaved(false), 2600);
                              }}
                              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0D9488] px-3.5 text-xs font-semibold text-white hover:bg-[#0F766E] cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{isAr ? 'تأكيد الحجز سريعاً' : 'Quick Confirm'}</span>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingModalMode('edit')}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0F2233] px-4 text-xs font-semibold text-white hover:bg-[#19354F] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? 'تعديل التذكرة' : 'Edit Ticket'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingModalDraft(null)}
                      className="min-h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#475569] hover:text-[#0F2233] cursor-pointer"
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSaveOwnerBooking} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">
                    {isAr ? 'اسم العميل' : 'Guest Name'}
                  </span>
                  <input
                    type="text"
                    required
                    dir="auto"
                    value={bookingModalDraft.guestName}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, guestName: e.target.value } : prev
                      )
                    }
                    className="min-h-[42px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm text-[#0F2233]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">
                    {isAr ? 'الجنسية' : 'Nationality'}
                  </span>
                  <input
                    type="text"
                    dir="auto"
                    value={bookingModalDraft.guestCountry || ''}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, guestCountry: e.target.value } : prev
                      )
                    }
                    placeholder="e.g. German, British, Egyptian..."
                    className="min-h-[42px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm text-[#0F2233]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">
                    {isAr ? 'اسم الرحلة / الخدمة' : 'Trip / Service Title'}
                  </span>
                  <input
                    type="text"
                    required
                    dir="auto"
                    value={bookingModalDraft.tripTitle}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, tripTitle: e.target.value } : prev
                      )
                    }
                    className="min-h-[42px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm text-[#0F2233]"
                  />
                </label>
              </div>

              {/* Pickup Time (AM/PM) + Spot (Reception / Main Gate) */}
              <div className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-4 space-y-3">
                <div className="text-xs font-semibold text-[#115E59]">
                  {isAr ? 'توقيت الرحلة وموعد ومكان الاستلام' : 'Trip Start Time & Pickup Schedule'}
                </div>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[#334155]">
                    {isAr ? 'توقيت بداية الرحلة (أو موعد الطيران)' : 'Trip Start Time (or Flight Time)'}
                  </span>
                  <input
                    type="text"
                    value={bookingModalDraft.tripStartTime || ''}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, tripStartTime: e.target.value } : prev
                      )
                    }
                    placeholder="e.g. 09:00 AM · 02:30 PM (Sunset) · According to flight time"
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#EE5426]"
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#334155]">
                      {isAr ? 'التاريخ' : 'Date'}
                    </span>
                    <input
                      type="date"
                      value={bookingModalDraft.date}
                      onChange={(e) =>
                        setBookingModalDraft((prev) =>
                          prev ? { ...prev, date: e.target.value } : prev
                        )
                      }
                      className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs tabular-nums"
                    />
                  </label>

                  <div className="space-y-1">
                    <span className="block text-xs font-medium text-[#334155]">
                      {isAr ? 'موعد الاستلام (AM / PM)' : 'Pickup Time (AM / PM)'}
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={pickupClock}
                        onChange={(e) => setPickupClock(e.target.value)}
                        placeholder="08:30"
                        className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-mono tabular-nums"
                      />
                      <div className="inline-flex rounded-lg border border-[#CBD5E1] bg-white p-0.5 shrink-0">
                        {(['AM', 'PM'] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setPickupPeriod(period)}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                              pickupPeriod === period
                                ? 'bg-[#0D9488] text-white'
                                : 'text-[#475569]'
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <span className="block text-xs font-medium text-[#334155]">
                      {isAr ? 'نقطة الالتقاء بالفندق' : 'Hotel Meeting Point'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          {
                            val: 'Inside Reception',
                            label: isAr ? 'داخل استقبال الفندق' : 'Inside Hotel Reception',
                          },
                          {
                            val: 'Outside Main Gate',
                            label: isAr ? 'أمام البوابة الرئيسية' : 'Outside Main Gate',
                          },
                        ] as { val: PickupSpot; label: string }[]
                      ).map((spot) => (
                        <button
                          key={spot.val}
                          type="button"
                          onClick={() =>
                            setBookingModalDraft((prev) =>
                              prev ? { ...prev, pickupSpot: spot.val } : prev
                            )
                          }
                          className={`min-h-[40px] rounded-lg border px-2.5 text-xs font-semibold cursor-pointer ${
                            (bookingModalDraft.pickupSpot || 'Inside Reception') === spot.val
                              ? 'border-[#0D9488] bg-[#0D9488] text-white'
                              : 'border-[#CBD5E1] bg-white text-[#0F2233]'
                          }`}
                        >
                          {spot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <label className="sm:col-span-8 flex flex-col justify-end space-y-1.5">
                    <span className="block truncate whitespace-nowrap text-xs font-medium text-[#334155]">
                      Hotel / Address
                    </span>
                    <input
                      type="text"
                      dir="auto"
                      list="owner-egypt-hotels-list"
                      value={bookingModalDraft.hotel}
                      onChange={(e) =>
                        setBookingModalDraft((prev) =>
                          prev ? { ...prev, hotel: e.target.value } : prev
                        )
                      }
                      placeholder="Type hotel name…"
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm"
                    />
                    <datalist id="owner-egypt-hotels-list">
                      {CURATED_EGYPT_HOTELS.map((h) => (
                        <option key={h.name} value={h.name}>
                          {h.area}
                        </option>
                      ))}
                    </datalist>
                  </label>

                  <label className="sm:col-span-4 flex flex-col justify-end space-y-1.5">
                    <span className="block truncate whitespace-nowrap text-xs font-medium text-[#334155]">
                      Room No.
                    </span>
                    <input
                      type="text"
                      value={bookingModalDraft.roomNumber || ''}
                      onChange={(e) =>
                        setBookingModalDraft((prev) =>
                          prev ? { ...prev, roomNumber: e.target.value } : prev
                        )
                      }
                      placeholder="e.g. 412"
                      className="h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm tabular-nums"
                    />
                  </label>
                </div>
              </div>

              {/* Guest WhatsApp + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">
                    Guest WhatsApp
                  </span>
                  <input
                    type="text"
                    value={bookingModalDraft.guestWhatsapp || ''}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, guestWhatsapp: e.target.value } : prev
                      )
                    }
                    placeholder="+49 170 5542190"
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-mono tabular-nums"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#0F2233]">Guest Email</span>
                  <input
                    type="email"
                    value={bookingModalDraft.guestEmail || ''}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, guestEmail: e.target.value } : prev
                      )
                    }
                    placeholder="guest@example.com"
                    className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] px-3 text-sm"
                  />
                </label>
              </div>

              {/* Financials, Supplier, Driver & Status, Cleanly Aligned */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-start">
                <label className="block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Adults</span>
                  <input
                    type="number"
                    min={1}
                    value={bookingModalDraft.adults}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, adults: Number(e.target.value) } : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] px-2.5 text-xs tabular-nums"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Children</span>
                  <input
                    type="number"
                    min={0}
                    value={bookingModalDraft.children}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, children: Number(e.target.value) } : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] px-2.5 text-xs tabular-nums"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Infants (INF)</span>
                  <input
                    type="number"
                    min={0}
                    value={bookingModalDraft.infants ?? 0}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, infants: Number(e.target.value) } : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] px-2.5 text-xs tabular-nums"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">
                    Guest Selling Price (€)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={bookingModalDraft.grossEur}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, grossEur: Number(e.target.value) } : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] px-2.5 text-xs font-mono font-semibold tabular-nums"
                  />
                </label>

                <label className="sm:col-span-2 block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Supplier</span>
                  <select
                    value={bookingModalDraft.supplierName}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, supplierName: e.target.value } : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Destination</span>
                  <select
                    value={bookingModalDraft.destination}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev
                          ? { ...prev, destination: e.target.value as DestinationRegion }
                          : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs"
                  >
                    <option value="Hurghada">Hurghada</option>
                    <option value="Marsa Alam">Marsa Alam</option>
                    <option value="Luxor">Luxor</option>
                    <option value="Cairo">Cairo</option>
                  </select>
                </label>

                <label className="col-span-2 block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Driver / Guide</span>
                  <input
                    type="text"
                    value={bookingModalDraft.assignedDriverOrGuide}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, assignedDriverOrGuide: e.target.value } : prev
                      )
                    }
                    placeholder="Driver or guide name…"
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] px-2.5 text-xs"
                  />
                </label>

                <label className="col-span-2 block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Payment Status</span>
                  <select
                    value={bookingModalDraft.paymentStatus}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev
                          ? { ...prev, paymentStatus: e.target.value as PaymentStatus }
                          : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs"
                  >
                    <option value="Awaiting link">Awaiting link</option>
                    <option value="Link sent">Link sent</option>
                    <option value="Paid online">Paid online</option>
                    <option value="Cash on pickup">Cash on pickup</option>
                  </select>
                </label>

                <label className="col-span-2 block space-y-1">
                  <span className="block text-xs font-semibold text-[#0F2233] truncate">Booking Status</span>
                  <select
                    value={bookingModalDraft.status}
                    onChange={(e) =>
                      setBookingModalDraft((prev) =>
                        prev ? { ...prev, status: e.target.value as BookingStatus } : prev
                      )
                    }
                    className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Driver assigned">Driver assigned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No show">No show</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </label>
              </div>

              {/* Hotel / Pickup Location Screenshot Attachment */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#0F2233]">
                      {isAr ? 'صورة بوابة الفندق أو بطاقة الغرفة' : 'Hotel Gate / Room Card Photo'}
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {isAr
                        ? 'أرفق صورة بوابة الفندق أو كارت الغرفة لتسهيل وصول السائق.'
                        : 'Attach a hotel gate photo or room card for the driver.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={ownerLocImgInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingOwnerLocImg(true);
                        try {
                          const dataUrl = await compressOwnerBookingImage(file);
                          if (dataUrl) {
                            setBookingModalDraft((prev) =>
                              prev ? { ...prev, locationImageUrl: dataUrl } : prev
                            );
                          }
                        } finally {
                          setUploadingOwnerLocImg(false);
                          if (ownerLocImgInputRef.current) ownerLocImgInputRef.current.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => ownerLocImgInputRef.current?.click()}
                      disabled={uploadingOwnerLocImg}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0F2233] hover:border-[#0D9488] hover:text-[#0D9488] cursor-pointer"
                    >
                      <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {uploadingOwnerLocImg
                          ? isAr
                            ? 'جاري الرفع…'
                            : 'Uploading…'
                          : isAr
                          ? 'رفع صورة'
                          : 'Upload Photo'}
                      </span>
                    </button>
                    {bookingModalDraft.locationImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setBookingModalDraft((prev) =>
                            prev ? { ...prev, locationImageUrl: '' } : prev
                          )
                        }
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {bookingModalDraft.locationImageUrl && (
                  <div className="wasla-img-glare overflow-hidden rounded-lg border border-[#CBD5E1] bg-white p-2">
                    <img
                      src={bookingModalDraft.locationImageUrl}
                      alt="Hotel or pickup location screenshot"
                      className="max-h-52 w-auto rounded object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F2233]">Notes</span>
                <textarea
                  rows={2}
                  dir="auto"
                  value={bookingModalDraft.notes}
                  onChange={(e) =>
                    setBookingModalDraft((prev) =>
                      prev ? { ...prev, notes: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs"
                />
              </label>

              {/* Pickup Dispatch Actions, Cancel / No Show + Save */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const livePickup = `${(pickupClock || '08:30').trim()} ${pickupPeriod}`;
                    const liveWaUrl = buildGuestPickupWhatsAppUrl({
                      guestWhatsapp: bookingModalDraft.guestWhatsapp,
                      guestContact: bookingModalDraft.guestContact,
                      bookingId: bookingModalDraft.id,
                      guestName: bookingModalDraft.guestName,
                      tripTitle: bookingModalDraft.tripTitle,
                      date: bookingModalDraft.date,
                      tripStartTime: bookingModalDraft.tripStartTime,
                      pickupTime: livePickup,
                      pickupSpot: bookingModalDraft.pickupSpot,
                      hotel: bookingModalDraft.hotel,
                      roomNumber: bookingModalDraft.roomNumber,
                      driverOrGuide: bookingModalDraft.assignedDriverOrGuide,
                      guestLang: bookingModalDraft.guestLang,
                      notes: bookingModalDraft.notes,
                    });
                    return (
                      <>
                        {liveWaUrl && (
                          <a
                            href={liveWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wasla-wa-glare inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white"
                          >
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isAr ? 'إرسال البيك أب عبر واتساب' : 'Send Pickup via WhatsApp'}</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            openEmailForBooking({
                              ...bookingModalDraft,
                              pickupTime: livePickup,
                            })
                          }
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-4 text-xs font-semibold text-[#D9461B] hover:bg-[#FFEDD5] cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{isAr ? 'معاينة وإرسال إيميل البيك أب' : 'Preview & Send Pickup Email'}</span>
                        </button>
                        {onUpdateBooking && (
                          <>
                            {!ownerConfirmCancelStep ? (
                              <button
                                type="button"
                                onClick={() => setOwnerConfirmCancelStep(true)}
                                className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{isAr ? 'إلغاء الحجز' : 'Cancel Booking'}</span>
                              </button>
                            ) : (
                              <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-[#EF4444] bg-[#FEF2F2] px-3 py-1.5">
                                <span className="text-[11px] font-bold text-[#991B1B]">
                                  {isAr
                                    ? 'تأكيد الإلغاء (خطوة 2/2): هل أنت متأكد؟'
                                    : 'Confirm cancellation (step 2/2): Are you sure?'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateBooking(bookingModalDraft.id, { status: 'Cancelled' });
                                    setBookingModalDraft((prev) =>
                                      prev ? { ...prev, status: 'Cancelled' } : prev
                                    );
                                    setOwnerConfirmCancelStep(false);
                                    setBookingModalSaved(true);
                                    window.setTimeout(() => setBookingModalSaved(false), 2600);
                                  }}
                                  className="inline-flex min-h-[28px] items-center gap-1 rounded-md bg-[#DC2626] px-2.5 text-[11px] font-semibold text-white hover:bg-[#B91C1C] cursor-pointer"
                                >
                                  <XCircle className="h-3 w-3" aria-hidden="true" />
                                  <span>{isAr ? 'تأكيد الإلغاء نهائياً' : 'Confirm Cancel'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOwnerConfirmCancelStep(false)}
                                  className="inline-flex min-h-[28px] items-center rounded-md border border-[#CBD5E1] bg-white px-2.5 text-[11px] font-semibold text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
                                >
                                  {isAr ? 'تراجع' : 'Back'}
                                </button>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateBooking(bookingModalDraft.id, { status: 'No show' });
                                setBookingModalDraft((prev) =>
                                  prev ? { ...prev, status: 'No show' } : prev
                                );
                                setBookingModalSaved(true);
                                window.setTimeout(() => setBookingModalSaved(false), 2600);
                              }}
                              className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 text-xs font-semibold text-[#B45309] hover:bg-[#FEF3C7] cursor-pointer"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>No Show</span>
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2.5">
                  {bookingModalSaved && (
                    <span className="text-xs font-semibold text-[#15803D]">
                      Saved changes!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setBookingModalMode('ticket')}
                    className="min-h-[40px] rounded-lg border border-[#CBD5E1] px-4 text-xs font-semibold text-[#475569] hover:text-[#0F2233] cursor-pointer"
                  >
                    ← Back to Ticket
                  </button>
                  <button
                    type="submit"
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0F2233] px-5 text-xs font-semibold text-white hover:bg-[#19354F] cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Save &amp; View Ticket</span>
                  </button>
                </div>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* In-App Email Viewer & Composer Modal */}
      {emailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/60 p-4 backdrop-blur-[2px]"
          onClick={() => setEmailModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={emailModal.subject}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-[#FFF1F2]/90 px-6 py-4 backdrop-blur-sm">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#9F1239]">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{emailModal.type}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{emailModal.sentAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{emailModal.status}</span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-[#0F2233]">
                  {emailModal.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEmailModal(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECDD3] bg-white text-[#0F2233] hover:bg-[#FFF1F2] cursor-pointer"
                aria-label="Close email viewer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Email Headers */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2">
                  <span className="sm:col-span-2 font-semibold text-[#64748B]">From:</span>
                  <span className="sm:col-span-10 font-medium text-[#0F2233]">
                    {publicSettings?.email || SITE_CONFIG.email}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-center">
                  <span className="sm:col-span-2 font-semibold text-[#64748B]">To:</span>
                  <input
                    type="text"
                    value={emailModal.to}
                    onChange={(e) =>
                      setEmailModal((prev) => (prev ? { ...prev, to: e.target.value } : prev))
                    }
                    className="sm:col-span-10 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm text-[#0F2233]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-center">
                  <span className="sm:col-span-2 font-semibold text-[#64748B]">Subject:</span>
                  <input
                    type="text"
                    dir="auto"
                    value={emailModal.subject}
                    onChange={(e) =>
                      setEmailModal((prev) =>
                        prev ? { ...prev, subject: e.target.value } : prev
                      )
                    }
                    className="sm:col-span-10 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-medium text-[#0F2233]"
                  />
                </div>
              </div>

              {/* Full Readable / Editable Email Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#475569]">
                    Email Message Content (Readable &amp; Editable Inside App)
                  </span>
                  {emailModal.relatedBooking && (
                    <button
                      type="button"
                      onClick={() => {
                        const bk = emailModal.relatedBooking!;
                        setEmailModal(null);
                        openOwnerBookingModal(bk);
                      }}
                      className="text-xs font-semibold text-[#EE5426] hover:underline underline-offset-2 cursor-pointer"
                    >
                      Open Booking {emailModal.relatedBooking.id} →
                    </button>
                  )}
                </div>
                <textarea
                  rows={11}
                  dir="auto"
                  value={emailModal.body}
                  onChange={(e) =>
                    setEmailModal((prev) => (prev ? { ...prev, body: e.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-[14.5px] leading-relaxed text-[#0F2233]"
                />
              </div>

              {emailLoggedBanner && (
                <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2 text-xs font-semibold text-[#15803D]">
                  Email recorded in Emails &amp; Subscribers log.
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#E2E8F0] pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `To: ${emailModal.to}\nSubject: ${emailModal.subject}\n\n${emailModal.body}`
                      );
                      setEmailCopied(true);
                      window.setTimeout(() => setEmailCopied(false), 2000);
                    }}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#0F2233] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    {emailCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#15803D]" aria-hidden="true" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>

                  {onLogDispatchEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!emailModal.to.includes('@')) return;
                        onLogDispatchEmail(
                          emailModal.to.trim(),
                          emailModal.subject.trim(),
                          emailModal.type
                        );
                        setEmailLoggedBanner(true);
                      }}
                      disabled={!emailModal.to.includes('@')}
                      className="btn-wasla-primary min-h-[40px] gap-1.5 rounded-lg px-4 py-2 text-xs cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Log / Mark Sent Here</span>
                    </button>
                  )}

                  {emailModal.to.includes('@') && (
                    <a
                      href={`mailto:${encodeURIComponent(emailModal.to)}?subject=${encodeURIComponent(
                        emailModal.subject
                      )}&body=${encodeURIComponent(emailModal.body)}`}
                      onClick={() => {
                        if (onLogDispatchEmail) {
                          onLogDispatchEmail(
                            emailModal.to.trim(),
                            emailModal.subject.trim(),
                            emailModal.type
                          );
                        }
                      }}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs font-semibold text-[#475569] hover:text-[#0F2233]"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Open External App</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEmailModal(null)}
                  className="min-h-[40px] rounded-lg border border-[#CBD5E1] px-4 text-xs font-semibold text-[#0F2233] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewLightboxPhoto && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setReviewLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setReviewLightboxPhoto(null)}
            aria-label="Close photo"
            className="absolute top-4 end-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={reviewLightboxPhoto}
            alt="Guest review upload"
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
