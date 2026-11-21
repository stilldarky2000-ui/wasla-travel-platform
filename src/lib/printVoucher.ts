import QRCode from 'qrcode';
import { auth } from './firebase';
import { Lang } from '../data/i18n';
import { CurrencyCode, SITE_CONFIG, formatCurrencyPrice } from '../data/marketplaceData';
import {
  GuestLanguageCode,
  formatPickupSpotByLang,
  resolveGuestLanguageCode,
} from './whatsapp';

export interface PrintableVoucherData {
  bookingId: string;
  status: string;
  tripTitle: string;
  destination?: string;
  date: string;
  tripStartTime?: string;
  pickupTime?: string;
  pickupSpot?: string;
  hotel?: string;
  roomNumber?: string;
  guestName?: string;
  guestCountry?: string;
  guestLang?: Lang | string;
  guideLanguage?: string;
  adults?: number;
  children?: number;
  infants?: number;
  totalEur?: number;
  currency?: CurrencyCode;
  assignedDriverOrGuide?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
}

export function buildVoucherVerificationUrl(bookingId: string): string {
  const cleanId = String(bookingId || 'WT-VOUCHER').trim().toUpperCase();
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : `https://${SITE_CONFIG.domain || 'waslatravel.com'}`;
  return `${origin}/?track=${encodeURIComponent(cleanId)}`;
}

export async function generateVoucherQrDataUrl(bookingId: string): Promise<string> {
  let token = new URLSearchParams(window.location.hash.slice(1)).get('voucherToken') || '';
  if (auth.currentUser) {
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch('/api/vouchers/' + encodeURIComponent(bookingId) + '/link', {
      method: 'POST', headers: {Authorization: 'Bearer ' + idToken}
    });
    if (response.ok) token = (await response.json()).token || '';
  }
  const verifyUrl = buildVoucherVerificationUrl(bookingId) + (token ? '#voucherToken=' + encodeURIComponent(token) : '');
  try {
    return await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
      color: {
        dark: '#0F2233',
        light: '#FFFFFF',
      },
    });
  } catch {
    return '';
  }
}

interface VoucherLocaleCopy {
  dir: 'ltr' | 'rtl';
  headerBadge: string;
  voucherTitle: string;
  statusConfirmed: string;
  bookingRefLabel: string;
  qrScanLabel: string;
  excursionLabel: string;
  dateLabel: string;
  startTimeLabel: string;
  pickupTimeLabel: string;
  pickupTimeTba: string;
  meetingPointLabel: string;
  hotelRoomLabel: string;
  roomWord: string;
  leadGuestLabel: string;
  nationalityLabel: string;
  passengersLabel: string;
  adultWord: string;
  childWord: string;
  infantWord: string;
  guideDriverLabel: string;
  guideDriverDefault: string;
  guideLanguageLabel: string;
  totalAmountLabel: string;
  customQuoteLabel: string;
  paymentPolicyNote: string;
  boardingInstructionsTitle: string;
  boardingBullet1: string;
  boardingBullet2: string;
  boardingBullet3: string;
  supportFooterTitle: string;
  issuedAtLabel: string;
  toolbarBackBtn: string;
  toolbarPrintBtn: string;
  toolbarDownloadBtn: string;
  toolbarHint: string;
}

const VOUCHER_COPY: Record<GuestLanguageCode, VoucherLocaleCopy> = {
  en: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · HURGHADA & RED SEA EXCURSIONS',
    voucherTitle: 'OFFICIAL DIGITAL BOARDING VOUCHER',
    statusConfirmed: 'CONFIRMED · READY FOR BOARDING',
    bookingRefLabel: 'Booking Reference',
    qrScanLabel: 'SCAN QR TO VERIFY',
    excursionLabel: 'Confirmed Excursion',
    dateLabel: 'Excursion Date',
    startTimeLabel: 'Trip Start Time',
    pickupTimeLabel: 'Hotel Pickup Time',
    pickupTimeTba: 'Confirmed via Email / WhatsApp',
    meetingPointLabel: 'Pickup Meeting Point',
    hotelRoomLabel: 'Hotel & Room Number',
    roomWord: 'Room',
    leadGuestLabel: 'Lead Passenger',
    nationalityLabel: 'Nationality',
    passengersLabel: 'Passenger Manifest',
    adultWord: 'Adult(s)',
    childWord: 'Child(ren)',
    infantWord: 'Infant(s)',
    guideDriverLabel: 'Assigned Driver / Guide',
    guideDriverDefault: 'Wasla Travel Representative (holds sign with your name & booking ID)',
    guideLanguageLabel: 'Guide Language',
    totalAmountLabel: 'Total Excursion Price',
    customQuoteLabel: 'Confirmed Quote',
    paymentPolicyNote:
      'Payable in EUR, USD, or EGP cash on pickup (or settled via official link). Free cancellation up to 24h before pickup.',
    boardingInstructionsTitle: 'Boarding & Pickup Instructions',
    boardingBullet1:
      'Please be ready at the designated meeting point 5–10 minutes before your confirmed hotel pickup time.',
    boardingBullet2:
      'Present this Digital Boarding Voucher & QR code (on your phone or printed) to your driver or tour representative.',
    boardingBullet3:
      'No extra hidden fees — hotel transfer and excursion entry as specified in your booking are included.',
    supportFooterTitle: '24/7 Operations & Dispatch Desk',
    issuedAtLabel: 'Issued by Wasla Travel Reservation System',
    toolbarBackBtn: '← Back to Booking',
    toolbarPrintBtn: 'Print / Save PDF (1 Page)',
    toolbarDownloadBtn: 'Download Voucher Image',
    toolbarHint: 'Official 1-Page Boarding Ticket with Verification QR · Save to phone or print',
  },
  de: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · HURGHADA & ROTES MEER AUSFLÜGE',
    voucherTitle: 'OFFIZIELLER DIGITALER BOARDING-VOUCHER',
    statusConfirmed: 'BESTÄTIGT · BEREIT ZUR ABHOLUNG',
    bookingRefLabel: 'Buchungsreferenz',
    qrScanLabel: 'QR-CODE ZUR PRÜFUNG',
    excursionLabel: 'Bestätigter Ausflug',
    dateLabel: 'Ausflugsdatum',
    startTimeLabel: 'Tour-Startzeit',
    pickupTimeLabel: 'Hotel-Abholzeit',
    pickupTimeTba: 'Bestätigt per E-Mail / WhatsApp',
    meetingPointLabel: 'Treffpunkt bei Abholung',
    hotelRoomLabel: 'Hotel & Zimmernummer',
    roomWord: 'Zimmer',
    leadGuestLabel: 'Hauptreisender',
    nationalityLabel: 'Nationalität',
    passengersLabel: 'Teilnehmer',
    adultWord: 'Erwachsene(r)',
    childWord: 'Kind(er)',
    infantWord: 'Kleinkind(er)',
    guideDriverLabel: 'Zugewiesener Fahrer / Guide',
    guideDriverDefault: 'Wasla Travel Reiseleiter (mit Ihrem Namen & Buchungscode)',
    guideLanguageLabel: 'Guide-Sprache',
    totalAmountLabel: 'Gesamtpreis',
    customQuoteLabel: 'Bestätigtes Angebot',
    paymentPolicyNote:
      'Zahlbar in EUR, USD oder EGP in bar bei Abholung (oder über offiziellen Zahlungslink). Kostenlose Stornierung bis 24h vor Abholung.',
    boardingInstructionsTitle: 'Abhol- & Boarding-Hinweise',
    boardingBullet1:
      'Bitte seien Sie 5–10 Minuten vor Ihrer bestätigten Abholzeit am angegebenen Treffpunkt bereit.',
    boardingBullet2:
      'Zeigen Sie diesen digitalen Boarding-Voucher mit QR-Code (auf dem Smartphone oder ausgedruckt) Ihrem Fahrer vor.',
    boardingBullet3:
      'Keine versteckten Gebühren — Hoteltransfer und Ausflugsleistungen gemäß Buchung sind enthalten.',
    supportFooterTitle: '24/7 Einsatzleitung & Gästeservice',
    issuedAtLabel: 'Ausgestellt vom Wasla Travel Reservierungssystem',
    toolbarBackBtn: '← Zurück zur Buchung',
    toolbarPrintBtn: 'Drucken / Als PDF speichern (1 Seite)',
    toolbarDownloadBtn: 'Ticket als Bild speichern',
    toolbarHint: 'Offizielles 1-Seiten-Ticket mit QR-Code · Auf Smartphone speichern oder drucken',
  },
  ar: {
    dir: 'rtl',
    headerBadge: 'وصلة ترافيل · رحلات الغردقة والبحر الأحمر',
    voucherTitle: 'تذكرة صعود رقمية رسمية معتمدة',
    statusConfirmed: 'حجز مؤكد · جاهز للتحرك',
    bookingRefLabel: 'رقم مرجع الحجز',
    qrScanLabel: 'امسح الكود للتحقق',
    excursionLabel: 'الرحلة المؤكدة',
    dateLabel: 'تاريخ الرحلة',
    startTimeLabel: 'توقيت بداية الرحلة',
    pickupTimeLabel: 'موعد التحرك من الفندق',
    pickupTimeTba: 'مؤكد عبر الإيميل / واتساب',
    meetingPointLabel: 'نقطة الالتقاء بالاستقبال',
    hotelRoomLabel: 'الفندق ورقم الغرفة',
    roomWord: 'غرفة',
    leadGuestLabel: 'اسم الضيف الرئيسي',
    nationalityLabel: 'الجنسية',
    passengersLabel: 'عدد المسافرين',
    adultWord: 'بالغ',
    childWord: 'طفل',
    infantWord: 'رضيع',
    guideDriverLabel: 'السائق / المرشد المخصص',
    guideDriverDefault: 'مندوب وصلة ترافيل (سيكون بانتظارك بلافتة تحمل اسمك ورقم حجزك)',
    guideLanguageLabel: 'لغة المرشد',
    totalAmountLabel: 'إجمالي سعر الرحلة',
    customQuoteLabel: 'عرض سعر معتمد',
    paymentPolicyNote:
      'يُقبل السداد نقداً عند الاستلام باليورو أو الدولار أو الجنيه المصري (أو عبر رابط الدفع الرسمي). إلغاء مجاني حتى 24 ساعة قبل التحرك.',
    boardingInstructionsTitle: 'تعليمات الاستلام والصعود للرحلة',
    boardingBullet1:
      'يرجى التواجد في نقطة الالتقاء المحددة قبل موعد التحرك من الفندق بـ 5 إلى 10 دقائق.',
    boardingBullet2:
      'يرجى إبراز هذه التذكرة الرقمية وكود الـ QR (من الهاتف أو مطبوعة) للسائق أو مندوب الرحلة عند الاستلام.',
    boardingBullet3:
      'لا توجد أي رسوم خفية — الانتقالات من وإلى الفندق وكافة تفاصيل البرنامج المشمولة بالحجز مؤكدة بالكامل.',
    supportFooterTitle: 'خدمة العملاء والتشغيل على مدار الساعة 24/7',
    issuedAtLabel: 'صدرت رسمياً من نظام حجوزات وصلة ترافيل',
    toolbarBackBtn: '← رجوع للحجز',
    toolbarPrintBtn: 'طباعة / حفظ PDF (صفحة واحدة)',
    toolbarDownloadBtn: 'تحميل التذكرة كصورة على الموبايل',
    toolbarHint: 'تذكرة رسمية من صفحة واحدة فقط (1/1) مزودة بكود QR للتحقق الفوري',
  },
  fr: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · EXCURSIONS HURGHADA & MER ROUGE',
    voucherTitle: 'BON D’EMBARQUEMENT NUMÉRIQUE OFFICIEL',
    statusConfirmed: 'CONFIRMÉ · PRÊT POUR LE DÉPART',
    bookingRefLabel: 'Référence de réservation',
    qrScanLabel: 'SCANNER POUR VÉRIFIER',
    excursionLabel: 'Excursion confirmée',
    dateLabel: 'Date de l’excursion',
    startTimeLabel: 'Heure de départ',
    pickupTimeLabel: 'Heure de prise en charge',
    pickupTimeTba: 'Confirmée par e-mail / WhatsApp',
    meetingPointLabel: 'Point de rencontre',
    hotelRoomLabel: 'Hôtel et numéro de chambre',
    roomWord: 'Chambre',
    leadGuestLabel: 'Passager principal',
    nationalityLabel: 'Nationalité',
    passengersLabel: 'Passagers',
    adultWord: 'Adulte(s)',
    childWord: 'Enfant(s)',
    infantWord: 'Bébé(s)',
    guideDriverLabel: 'Chauffeur / Guide assigné',
    guideDriverDefault: 'Représentant Wasla Travel (avec pancarte à votre nom et référence)',
    guideLanguageLabel: 'Langue du guide',
    totalAmountLabel: 'Prix total',
    customQuoteLabel: 'Devis confirmé',
    paymentPolicyNote:
      'Payable en espèces (EUR, USD ou EGP) lors de la prise en charge. Annulation gratuite jusqu’à 24h avant le départ.',
    boardingInstructionsTitle: 'Instructions de prise en charge',
    boardingBullet1:
      'Veuillez être prêt au point de rencontre 5 à 10 minutes avant l’heure de prise en charge.',
    boardingBullet2:
      'Présentez ce bon d’embarquement numérique avec code QR (sur téléphone ou imprimé) à votre chauffeur.',
    boardingBullet3:
      'Aucun frais caché — le transfert hôtel et les prestations réservées sont inclus.',
    supportFooterTitle: 'Assistance et opérations 24h/24 et 7j/7',
    issuedAtLabel: 'Émis par le système de réservation Wasla Travel',
    toolbarBackBtn: '← Retour à la réservation',
    toolbarPrintBtn: 'Imprimer / Enregistrer PDF (1 Page)',
    toolbarDownloadBtn: 'Télécharger le billet (Image)',
    toolbarHint: 'Billet officiel d’une seule page avec code QR · Enregistrer ou imprimer',
  },
  it: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · ESCURSIONI HURGHADA & MAR ROSSO',
    voucherTitle: 'VOUCHER D’IMBARCO DIGITALE UFFICIALE',
    statusConfirmed: 'CONFERMATO · PRONTO PER LA PARTENZA',
    bookingRefLabel: 'Riferimento prenotazione',
    qrScanLabel: 'SCANSIONA QR PER VERIFICA',
    excursionLabel: 'Escursione confermata',
    dateLabel: 'Data dell’escursione',
    startTimeLabel: 'Orario di inizio',
    pickupTimeLabel: 'Orario di prelievo in hotel',
    pickupTimeTba: 'Confermato via e-mail / WhatsApp',
    meetingPointLabel: 'Punto d’incontro',
    hotelRoomLabel: 'Hotel e numero di camera',
    roomWord: 'Camera',
    leadGuestLabel: 'Ospite principale',
    nationalityLabel: 'Nazionalità',
    passengersLabel: 'Passeggeri',
    adultWord: 'Adulto/i',
    childWord: 'Bambino/i',
    infantWord: 'Neonato/i',
    guideDriverLabel: 'Autista / Guida assegnata',
    guideDriverDefault: 'Rappresentante Wasla Travel (con cartello con il tuo nome e codice)',
    guideLanguageLabel: 'Lingua della guida',
    totalAmountLabel: 'Prezzo totale',
    customQuoteLabel: 'Preventivo confermato',
    paymentPolicyNote:
      'Pagabile in contanti in EUR, USD o EGP al momento del prelievo. Cancellazione gratuita fino a 24 ore prima.',
    boardingInstructionsTitle: 'Istruzioni per il prelievo',
    boardingBullet1:
      'Presentarsi al punto d’incontro 5–10 minuti prima dell’orario di prelievo confermato.',
    boardingBullet2:
      'Mostra questo voucher digitale con codice QR (su smartphone o stampato) all’autista o alla guida.',
    boardingBullet3:
      'Nessun costo nascosto — trasferimento hotel ed escursione inclusi come da prenotazione.',
    supportFooterTitle: 'Assistenza operativa 24/7',
    issuedAtLabel: 'Emesso dal sistema di prenotazione Wasla Travel',
    toolbarBackBtn: '← Torna alla prenotazione',
    toolbarPrintBtn: 'Stampa / Salva PDF (1 Pagina)',
    toolbarDownloadBtn: 'Scarica Voucher (Immagine)',
    toolbarHint: 'Voucher ufficiale da 1 pagina con codice QR · Salva sul telefono o stampa',
  },
  es: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · EXCURSIONES HURGHADA Y MAR ROJO',
    voucherTitle: 'BONO DE EMBARQUE DIGITAL OFICIAL',
    statusConfirmed: 'CONFIRMADO · LISTO PARA SALIDA',
    bookingRefLabel: 'Referencia de reserva',
    qrScanLabel: 'ESCANEAR QR PARA VERIFICAR',
    excursionLabel: 'Excursión confirmada',
    dateLabel: 'Fecha de la excursión',
    startTimeLabel: 'Hora de inicio',
    pickupTimeLabel: 'Hora de recogida en el hotel',
    pickupTimeTba: 'Confirmada por correo / WhatsApp',
    meetingPointLabel: 'Punto de encuentro',
    hotelRoomLabel: 'Hotel y número de habitación',
    roomWord: 'Habitación',
    leadGuestLabel: 'Pasajero principal',
    nationalityLabel: 'Nacionalidad',
    passengersLabel: 'Pasajeros',
    adultWord: 'Adulto(s)',
    childWord: 'Niño(s)',
    infantWord: 'Bebé(s)',
    guideDriverLabel: 'Conductor / Guía asignado',
    guideDriverDefault: 'Representante de Wasla Travel (con cartel con su nombre y código)',
    guideLanguageLabel: 'Idioma del guía',
    totalAmountLabel: 'Precio total',
    customQuoteLabel: 'Presupuesto confirmado',
    paymentPolicyNote:
      'Pagadero en efectivo en EUR, USD o EGP al momento de la recogida. Cancelación gratuita hasta 24h antes.',
    boardingInstructionsTitle: 'Instrucciones de recogida y embarque',
    boardingBullet1:
      'Esté listo en el punto de encuentro 5–10 minutos antes de su hora de recogida confirmada.',
    boardingBullet2:
      'Presente este bono digital con código QR (en su teléfono o impreso) a su conductor o representante.',
    boardingBullet3:
      'Sin cargos ocultos — traslado del hotel y servicios reservados incluidos.',
    supportFooterTitle: 'Centro de Operaciones y Asistencia 24/7',
    issuedAtLabel: 'Emitido por el sistema de reservas de Wasla Travel',
    toolbarBackBtn: '← Volver a la reserva',
    toolbarPrintBtn: 'Imprimir / Guardar PDF (1 Página)',
    toolbarDownloadBtn: 'Descargar Bono (Imagen)',
    toolbarHint: 'Bono oficial de 1 página con código QR · Guardar en el móvil o imprimir',
  },
  nl: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · HURGHADA & RODE ZEE EXCURSIES',
    voucherTitle: 'OFFICIËLE DIGITALE BOARDING VOUCHER',
    statusConfirmed: 'BEVESTIGD · KLAAR VOOR VERTREK',
    bookingRefLabel: 'Boekingsreferentie',
    qrScanLabel: 'SCAN QR VOOR CONTROLE',
    excursionLabel: 'Bevestigde excursie',
    dateLabel: 'Excursiedatum',
    startTimeLabel: 'Starttijd',
    pickupTimeLabel: 'Ophaaltijd bij hotel',
    pickupTimeTba: 'Bevestigd per e-mail / WhatsApp',
    meetingPointLabel: 'Verzamelpunt',
    hotelRoomLabel: 'Hotel & kamernummer',
    roomWord: 'Kamer',
    leadGuestLabel: 'Hoofdreiziger',
    nationalityLabel: 'Nationaliteit',
    passengersLabel: 'Deelnemers',
    adultWord: 'Volwassene(n)',
    childWord: 'Kind(eren)',
    infantWord: 'Baby(’s)',
    guideDriverLabel: 'Toegewezen chauffeur / gids',
    guideDriverDefault: 'Wasla Travel vertegenwoordiger (met bordje met uw naam en code)',
    guideLanguageLabel: 'Taal van de gids',
    totalAmountLabel: 'Totaalprijs',
    customQuoteLabel: 'Bevestigde offerte',
    paymentPolicyNote:
      'Contant betaalbaar in EUR, USD of EGP bij het ophalen. Gratis annuleren tot 24 uur voor vertrek.',
    boardingInstructionsTitle: 'Ophaal- & Boardinginstructies',
    boardingBullet1:
      'Zorg dat u 5–10 minuten voor uw bevestigde ophaaltijd klaarstaat op het verzamelpunt.',
    boardingBullet2:
      'Toon deze digitale voucher met QR-code (op uw telefoon of geprint) aan uw chauffeur.',
    boardingBullet3:
      'Geen verborgen kosten — hoteltransfer en geboekte onderdelen zijn inbegrepen.',
    supportFooterTitle: '24/7 Operaties & Klantenservice',
    issuedAtLabel: 'Uitgegeven door het Wasla Travel reserveringssysteem',
    toolbarBackBtn: '← Terug naar boeking',
    toolbarPrintBtn: 'Afdrukken / Opslaan als PDF (1 Pagina)',
    toolbarDownloadBtn: 'Voucher downloaden (Afbeelding)',
    toolbarHint: 'Officiële 1-pagina voucher met QR-code · Opslaan op telefoon of printen',
  },
  pl: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · WYCIECZKI HURGHADA I MORZE CZERWONE',
    voucherTitle: 'OFICJALNY CYFROWY VOUCHER POKŁADOWY',
    statusConfirmed: 'POTWIERDZONO · GOTOWY DO WYJAZDU',
    bookingRefLabel: 'Numer rezerwacji',
    qrScanLabel: 'ZESKANUJ KOD QR',
    excursionLabel: 'Potwierdzona wycieczka',
    dateLabel: 'Data wycieczki',
    startTimeLabel: 'Godzina rozpoczęcia',
    pickupTimeLabel: 'Godzina odbioru z hotelu',
    pickupTimeTba: 'Potwierdzona przez e-mail / WhatsApp',
    meetingPointLabel: 'Miejsce zbiórki',
    hotelRoomLabel: 'Hotel i numer pokoju',
    roomWord: 'Pokój',
    leadGuestLabel: 'Główny uczestnik',
    nationalityLabel: 'Narodowość',
    passengersLabel: 'Uczestnicy',
    adultWord: 'Dorosły(ch)',
    childWord: 'Dziecko/dzieci',
    infantWord: 'Niemowlę(ta)',
    guideDriverLabel: 'Przypisany kierowca / przewodnik',
    guideDriverDefault: 'Przedstawiciel Wasla Travel (z tabliczką z Twoim imieniem i numerem)',
    guideLanguageLabel: 'Język przewodnika',
    totalAmountLabel: 'Cena całkowita',
    customQuoteLabel: 'Potwierdzona wycena',
    paymentPolicyNote:
      'Płatne gotówką w EUR, USD lub EGP przy odbiorze. Bezpłatna anulacja do 24h przed odbiorem.',
    boardingInstructionsTitle: 'Instrukcje odbioru z hotelu',
    boardingBullet1:
      'Prosimy o gotowość w miejscu zbiórki 5–10 minut przed potwierdzoną godziną odbioru.',
    boardingBullet2:
      'Okaż ten cyfrowy voucher z kodem QR (na telefonie lub wydrukowany) kierowcy lub przewodnikowi.',
    boardingBullet3:
      'Brak ukrytych opłat — transfer hotelowy oraz zarezerwowane świadczenia są w cenie.',
    supportFooterTitle: 'Całodobowe Biuro Operacyjne 24/7',
    issuedAtLabel: 'Wydano przez system rezerwacji Wasla Travel',
    toolbarBackBtn: '← Powrót do rezerwacji',
    toolbarPrintBtn: 'Drukuj / Zapisz PDF (1 Strona)',
    toolbarDownloadBtn: 'Pobierz Voucher (Obraz)',
    toolbarHint: 'Oficjalny 1-stronicowy voucher z kodem QR · Zapisz w telefonie lub wydrukuj',
  },
  ru: {
    dir: 'ltr',
    headerBadge: 'WASLA TRAVEL · ЭКСКУРСИИ В ХУРГАДЕ И НА КРАСНОМ МОРЕ',
    voucherTitle: 'ОФИЦИАЛЬНЫЙ ЭЛЕКТРОННЫЙ ПОСАДОЧНЫЙ ВАУЧЕР',
    statusConfirmed: 'ПОДТВЕРЖДЕНО · ГОТОВ К ВЫЕЗДУ',
    bookingRefLabel: 'Номер бронирования',
    qrScanLabel: 'QR-КОД ДЛЯ ПРОВЕРКИ',
    excursionLabel: 'Подтверждённая экскурсия',
    dateLabel: 'Дата экскурсии',
    startTimeLabel: 'Время начала',
    pickupTimeLabel: 'Время трансфера из отеля',
    pickupTimeTba: 'Подтверждено по Email / WhatsApp',
    meetingPointLabel: 'Место встречи',
    hotelRoomLabel: 'Отель и номер комнаты',
    roomWord: 'Комната',
    leadGuestLabel: 'Основной гость',
    nationalityLabel: 'Гражданство',
    passengersLabel: 'Состав группы',
    adultWord: 'Взрослых',
    childWord: 'Детей',
    infantWord: 'Младенцев',
    guideDriverLabel: 'Водитель / Гид',
    guideDriverDefault: 'Представитель Wasla Travel (с табличкой с вашим именем и номером брони)',
    guideLanguageLabel: 'Язык гида',
    totalAmountLabel: 'Итоговая стоимость',
    customQuoteLabel: 'Индивидуальный расчёт',
    paymentPolicyNote:
      'Оплата наличными в EUR, USD или EGP при посадке. Бесплатная отмена за 24 часа до выезда.',
    boardingInstructionsTitle: 'Инструкции по посадке и трансферу',
    boardingBullet1:
      'Пожалуйста, будьте в указанном месте встречи за 5–10 минут до назначенного времени трансфера.',
    boardingBullet2:
      'Предъявите этот электронный ваучер с QR-кодом (на экране телефона или в распечатанном виде) водителю или гиду.',
    boardingBullet3:
      'Никаких скрытых доплат — трансфер из отеля и программа по бронированию полностью включены.',
    supportFooterTitle: 'Круглосуточная служба поддержки 24/7',
    issuedAtLabel: 'Выдано системой бронирования Wasla Travel',
    toolbarBackBtn: '← Назад к бронированию',
    toolbarPrintBtn: 'Печать / Сохранить PDF (1 стр.)',
    toolbarDownloadBtn: 'Скачать ваучер (Изображение)',
    toolbarHint: 'Официальный посадочный талон с QR-кодом на 1 странице',
  },
};

function escapeHtml(raw: string | undefined | null): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface NormalizedVoucherFields {
  targetLang: GuestLanguageCode;
  copy: VoucherLocaleCopy;
  bookingId: string;
  tripTitle: string;
  dateDisplay: string;
  pickupTimeDisplay: string;
  startTimeDisplay: string;
  guestNameDisplay: string;
  nationalityDisplay: string;
  hotelDisplay: string;
  meetingPointDisplay: string;
  paxSummary: string;
  driverDisplay: string;
  formattedTotal: string;
  issueDate: string;
}

function normalizeVoucherFields(
  data: PrintableVoucherData,
  fallbackUiLang: Lang = 'en'
): NormalizedVoucherFields {
  const targetLang = resolveGuestLanguageCode(
    data.guideLanguage || (typeof data.guestLang === 'string' ? data.guestLang : undefined),
    data.notes,
    fallbackUiLang
  );
  const copy = VOUCHER_COPY[targetLang] || VOUCHER_COPY.en;

  const adults = typeof data.adults === 'number' && data.adults > 0 ? data.adults : 1;
  const children = typeof data.children === 'number' && data.children > 0 ? data.children : 0;
  const infants = typeof data.infants === 'number' && data.infants > 0 ? data.infants : 0;

  const paxParts: string[] = [`${adults} ${copy.adultWord}`];
  if (children > 0) paxParts.push(`${children} ${copy.childWord}`);
  if (infants > 0) paxParts.push(`${infants} ${copy.infantWord}`);
  const paxSummary = paxParts.join(' · ');

  const totalEur = typeof data.totalEur === 'number' ? data.totalEur : 0;
  const currency: CurrencyCode = data.currency || 'EUR';
  const formattedTotal =
    totalEur > 0
      ? formatCurrencyPrice(totalEur, currency, currency !== 'EUR')
      : copy.customQuoteLabel;

  const hotelDisplay = data.hotel
    ? `${data.hotel}${data.roomNumber ? ` (${copy.roomWord} ${data.roomNumber})` : ''}`
    : 'Hurghada Red Sea Resort';

  const meetingPointDisplay = formatPickupSpotByLang(data.pickupSpot, targetLang);
  const pickupTimeDisplay = data.pickupTime?.trim() ? data.pickupTime.trim() : copy.pickupTimeTba;
  const startTimeDisplay = data.tripStartTime?.trim() ? data.tripStartTime.trim() : '08:30 AM';
  const driverDisplay = data.assignedDriverOrGuide?.trim()
    ? data.assignedDriverOrGuide.trim()
    : copy.guideDriverDefault;
  const issueDate = new Date().toISOString().slice(0, 10);

  return {
    targetLang,
    copy,
    bookingId: data.bookingId || 'WT-VOUCHER',
    tripTitle: data.tripTitle || 'Wasla Travel Excursion',
    dateDisplay: data.date || issueDate,
    pickupTimeDisplay,
    startTimeDisplay,
    guestNameDisplay: data.guestName || 'Valued Guest',
    nationalityDisplay: data.guestCountry || 'International',
    hotelDisplay,
    meetingPointDisplay,
    paxSummary,
    driverDisplay,
    formattedTotal,
    issueDate,
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function downloadWaslaVoucherImage(
  data: PrintableVoucherData,
  fallbackUiLang: Lang = 'en'
): Promise<void> {
  if (typeof document === 'undefined') return;
  const f = normalizeVoucherFields(data, fallbackUiLang);
  const { copy } = f;
  const qrDataUrl = await generateVoucherQrDataUrl(f.bookingId);
  const qrImg = await loadImageElement(qrDataUrl);

  const canvas = document.createElement('canvas');
  const W = 1240;
  const H = 1754;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Outer page white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Main Voucher Card Frame
  const pad = 48;
  const cardW = W - pad * 2;
  const cardH = H - pad * 2;

  // Header Navy Bar
  ctx.fillStyle = '#0F2233';
  drawRoundedRect(ctx, pad, pad, cardW, 200, 24);
  ctx.fill();

  // Terracotta accent stripe under header
  ctx.fillStyle = '#EE5426';
  ctx.fillRect(pad, pad + 192, cardW, 10);

  // Orange W Logo Badge
  ctx.fillStyle = '#EE5426';
  drawRoundedRect(ctx, pad + 32, pad + 48, 84, 84, 20);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 44px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('W', pad + 74, pad + 106);

  // Header Brand Text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FDBA74';
  ctx.font = '700 18px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.headerBadge, pad + 136, pad + 78);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 28px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.voucherTitle, pad + 136, pad + 120);

  // QR Code Box on Far Right of Header
  const qrBoxSize = 148;
  const qrBoxX = pad + cardW - qrBoxSize - 24;
  const qrBoxY = pad + 22;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14);
  ctx.fill();
  if (qrImg) {
    ctx.drawImage(qrImg, qrBoxX + 10, qrBoxY + 6, qrBoxSize - 20, qrBoxSize - 28);
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F2233';
  ctx.font = '800 11px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.qrScanLabel, qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize - 7);

  // Booking Reference Pill Box next to QR Box
  const refBoxW = 290;
  const refBoxX = qrBoxX - refBoxW - 14;
  ctx.fillStyle = '#19354F';
  drawRoundedRect(ctx, refBoxX, pad + 22, refBoxW, 148, 14);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '700 15px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.bookingRefLabel.toUpperCase(), refBoxX + refBoxW / 2, pad + 54);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 30px "IBM Plex Mono", monospace';
  ctx.fillText(f.bookingId, refBoxX + refBoxW / 2, pad + 96);

  // Green Confirmed Pill inside Ref Box
  ctx.fillStyle = '#15803D';
  drawRoundedRect(ctx, refBoxX + 16, pad + 114, refBoxW - 32, 36, 10);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 13.5px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(`✓ ${copy.statusConfirmed}`, refBoxX + refBoxW / 2, pad + 137);

  // Excursion Hero Strip
  let curY = pad + 202;
  ctx.fillStyle = '#FAF4ED';
  ctx.fillRect(pad, curY, cardW, 124);
  ctx.strokeStyle = '#C8C2B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, curY + 124);
  ctx.lineTo(pad + cardW, curY + 124);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#EE5426';
  ctx.font = '800 18px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.excursionLabel.toUpperCase(), pad + 36, curY + 40);

  ctx.fillStyle = '#0F2233';
  ctx.font = '800 31px "Plus Jakarta Sans", "Cairo", sans-serif';
  const titleLines = wrapCanvasText(ctx, f.tripTitle, cardW - 72);
  ctx.fillText(titleLines[0] || '', pad + 36, curY + 86);

  // 3-Column Timing Highlight Bar
  curY += 124;
  ctx.fillStyle = '#F0FDF4';
  ctx.fillRect(pad, curY, cardW, 148);

  const col3W = (cardW - 72 - 32) / 3;
  const highlights = [
    { label: copy.dateLabel, value: f.dateDisplay, accent: false },
    { label: copy.pickupTimeLabel, value: f.pickupTimeDisplay, accent: true },
    { label: copy.startTimeLabel, value: f.startTimeDisplay, accent: false },
  ];

  highlights.forEach((h, idx) => {
    const bx = pad + 36 + idx * (col3W + 16);
    const by = curY + 21;
    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, bx, by, col3W, 106, 14);
    ctx.fill();
    ctx.strokeStyle = '#BBF7D0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '700 16px "Plus Jakarta Sans", "Cairo", sans-serif';
    ctx.fillText(h.label.toUpperCase(), bx + 20, by + 36);

    ctx.fillStyle = h.accent ? '#15803D' : '#0F2233';
    ctx.font = '800 25px "Plus Jakarta Sans", "Cairo", sans-serif';
    const valLines = wrapCanvasText(ctx, h.value, col3W - 40);
    ctx.fillText(valLines[0] || '', bx + 20, by + 78);
  });

  // 2-Column Manifest Details Grid (6 cells)
  curY += 172;
  const col2W = (cardW - 72 - 24) / 2;
  const details = [
    { label: copy.leadGuestLabel, value: f.guestNameDisplay },
    { label: copy.nationalityLabel, value: f.nationalityDisplay },
    { label: copy.hotelRoomLabel, value: f.hotelDisplay },
    { label: copy.meetingPointLabel, value: f.meetingPointDisplay },
    { label: copy.passengersLabel, value: f.paxSummary },
    { label: copy.guideDriverLabel, value: f.driverDisplay },
  ];

  details.forEach((d, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const bx = pad + 36 + col * (col2W + 24);
    const by = curY + row * 140;

    ctx.fillStyle = '#F8FAFC';
    drawRoundedRect(ctx, bx, by, col2W, 120, 14);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '700 16px "Plus Jakarta Sans", "Cairo", sans-serif';
    ctx.fillText(d.label.toUpperCase(), bx + 22, by + 36);

    ctx.fillStyle = '#0F2233';
    ctx.font = '700 22px "Plus Jakarta Sans", "Cairo", sans-serif';
    const lines = wrapCanvasText(ctx, d.value, col2W - 44);
    ctx.fillText(lines[0] || '', bx + 22, by + 72);
    if (lines[1]) {
      ctx.font = '600 18px "Plus Jakarta Sans", "Cairo", sans-serif';
      ctx.fillText(lines[1], bx + 22, by + 100);
    }
  });

  // Total Price & Payment Policy Box
  curY += 3 * 140 + 16;
  ctx.fillStyle = '#F0FDF4';
  drawRoundedRect(ctx, pad + 36, curY, cardW - 72, 148, 16);
  ctx.fill();
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#166534';
  ctx.font = '800 18px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.totalAmountLabel.toUpperCase(), pad + 64, curY + 42);

  ctx.fillStyle = '#14532D';
  ctx.font = '600 19px "Plus Jakarta Sans", "Cairo", sans-serif';
  const noteLines = wrapCanvasText(ctx, copy.paymentPolicyNote, cardW - 360);
  noteLines.slice(0, 2).forEach((ln, i) => {
    ctx.fillText(ln, pad + 64, curY + 78 + i * 28);
  });

  ctx.textAlign = 'right';
  ctx.fillStyle = '#15803D';
  ctx.font = '800 44px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(f.formattedTotal, pad + cardW - 64, curY + 92);

  // Boarding Instructions Box
  curY += 172;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, pad + 36, curY, cardW - 72, 224, 16);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0F2233';
  ctx.font = '800 20px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.boardingInstructionsTitle.toUpperCase(), pad + 64, curY + 40);

  ctx.fillStyle = '#334155';
  ctx.font = '600 19px "Plus Jakarta Sans", "Cairo", sans-serif';
  const bullets = [copy.boardingBullet1, copy.boardingBullet2, copy.boardingBullet3];
  let bY = curY + 76;
  bullets.forEach((b) => {
    const bLines = wrapCanvasText(ctx, `• ${b}`, cardW - 128);
    bLines.slice(0, 2).forEach((ln) => {
      ctx.fillText(ln, pad + 64, bY);
      bY += 27;
    });
    bY += 6;
  });

  // Footer Bar
  const footerH = 128;
  const footerY = pad + cardH - footerH;
  ctx.fillStyle = '#0F2233';
  ctx.fillRect(pad, footerY, cardW, footerH);

  ctx.fillStyle = '#FDBA74';
  ctx.font = '800 20px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(copy.supportFooterTitle, pad + 36, footerY + 48);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(
    `WhatsApp: +20 112 915 5520  ·  Email: booking@waslatravel.com  ·  ${SITE_CONFIG.domain || 'waslatravel.com'}`,
    pad + 36,
    footerY + 86
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 17px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillText(`Ref: ${f.bookingId} · ${f.issueDate}`, pad + cardW - 36, footerY + 68);

  // Outer Border around Entire Card
  ctx.strokeStyle = '#0F2233';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, pad, pad, cardW, cardH, 24);
  ctx.stroke();

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Wasla-Travel-Voucher-${f.bookingId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function closeWaslaBoardingVoucher(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('wasla-printing-voucher');
  document.body.classList.remove('wasla-printing-voucher');
}

export function printWaslaBoardingVoucher(
  data: PrintableVoucherData,
  fallbackUiLang: Lang = 'en'
): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  void (async () => {
    const f = normalizeVoucherFields(data, fallbackUiLang);
    const { copy } = f;
    const qrDataUrl = await generateVoucherQrDataUrl(f.bookingId);

    let printRoot = document.getElementById('wasla-print-voucher-root');
    if (!printRoot) {
      printRoot = document.createElement('div');
      printRoot.id = 'wasla-print-voucher-root';
      document.body.appendChild(printRoot);
    }

    printRoot.setAttribute('dir', copy.dir);
    printRoot.innerHTML = `
      <div class="wasla-voucher-screen-toolbar" dir="${copy.dir}">
        <div class="wasla-voucher-toolbar-inner">
          <button type="button" id="wasla-voucher-back-btn" class="wasla-voucher-btn-back">
            ${escapeHtml(copy.toolbarBackBtn)}
          </button>
          <div class="wasla-voucher-toolbar-actions">
            <button type="button" id="wasla-voucher-download-btn" class="wasla-voucher-btn-download">
              ⬇ ${escapeHtml(copy.toolbarDownloadBtn)}
            </button>
            <button type="button" id="wasla-voucher-print-btn" class="wasla-voucher-btn-print">
              🖨 ${escapeHtml(copy.toolbarPrintBtn)}
            </button>
          </div>
        </div>
        <div class="wasla-voucher-toolbar-hint">${escapeHtml(copy.toolbarHint)}</div>
      </div>

      <div class="wasla-voucher-sheet" dir="${copy.dir}" style="background:#FFFFFF;color:#0F2233;border:2px solid #0F2233;border-radius:14px;overflow:hidden;">
        <!-- Top Brand Banner with Reference & Verification QR Code -->
        <div class="wasla-voucher-header" style="background:#0F2233;color:#FFFFFF;padding:16px 20px;border-bottom:4px solid #EE5426;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
          <div class="wasla-voucher-brand-row" style="display:flex;align-items:center;gap:12px;">
            <div class="wasla-voucher-logo-badge" style="width:44px;height:44px;border-radius:10px;background:#EE5426;color:#FFFFFF;font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">W</div>
            <div class="wasla-voucher-brand-texts">
              <div class="wasla-voucher-kicker" style="font-size:10px;font-weight:700;letter-spacing:0.08em;color:#FDBA74;text-transform:uppercase;">${escapeHtml(copy.headerBadge)}</div>
              <div class="wasla-voucher-main-title" style="font-size:16px;font-weight:800;color:#FFFFFF;margin-top:2px;">${escapeHtml(copy.voucherTitle)}</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            <div class="wasla-voucher-ref-box" style="text-align:end;background:#19354F;border:1px solid #334155;border-radius:10px;padding:8px 14px;flex-shrink:0;">
              <div class="wasla-voucher-ref-label" style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#CBD5E1;">${escapeHtml(copy.bookingRefLabel)}</div>
              <div class="wasla-voucher-ref-code" style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:800;color:#FFFFFF;letter-spacing:0.03em;">${escapeHtml(f.bookingId)}</div>
              <div class="wasla-voucher-status-pill" style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:6px;background:#15803D;color:#FFFFFF;font-size:9.5px;font-weight:800;letter-spacing:0.04em;">✓ ${escapeHtml(copy.statusConfirmed)}</div>
            </div>
            ${
              qrDataUrl
                ? `<div style="background:#FFFFFF;border:1.5px solid #EE5426;border-radius:10px;padding:5px 7px;text-align:center;flex-shrink:0;">
                    <img src="${qrDataUrl}" alt="Voucher Verification QR" style="width:68px;height:68px;display:block;margin:0 auto;" />
                    <div style="font-size:7.5px;font-weight:800;color:#0F2233;letter-spacing:0.04em;margin-top:2px;text-transform:uppercase;">${escapeHtml(copy.qrScanLabel)}</div>
                  </div>`
                : ''
            }
          </div>
        </div>

        <!-- Excursion Hero Strip -->
        <div class="wasla-voucher-trip-banner" style="background:#FAF4ED;border-bottom:1px solid #C8C2B8;padding:12px 20px;">
          <div class="wasla-voucher-trip-label" style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#EE5426;">${escapeHtml(copy.excursionLabel)}</div>
          <div class="wasla-voucher-trip-title" style="font-size:17px;font-weight:800;color:#0F2233;margin-top:2px;">${escapeHtml(f.tripTitle)}</div>
        </div>

        <!-- Key Timing & Pickup Highlight Bar -->
        <div class="wasla-voucher-highlight-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px 20px;background:#F0FDF4;border-bottom:1px solid #BBF7D0;">
          <div class="wasla-voucher-highlight-cell" style="background:#FFFFFF;border:1px solid #BBF7D0;border-radius:8px;padding:8px 12px;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.dateLabel)}</div>
            <div class="wasla-voucher-field-value-lg" style="font-size:14px;font-weight:800;color:#0F2233;margin-top:2px;">${escapeHtml(f.dateDisplay)}</div>
          </div>
          <div class="wasla-voucher-highlight-cell" style="background:#FFFFFF;border:1px solid #BBF7D0;border-radius:8px;padding:8px 12px;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.pickupTimeLabel)}</div>
            <div class="wasla-voucher-field-value-accent" style="font-size:14px;font-weight:800;color:#15803D;margin-top:2px;">${escapeHtml(f.pickupTimeDisplay)}</div>
          </div>
          <div class="wasla-voucher-highlight-cell" style="background:#FFFFFF;border:1px solid #BBF7D0;border-radius:8px;padding:8px 12px;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.startTimeLabel)}</div>
            <div class="wasla-voucher-field-value-lg" style="font-size:14px;font-weight:800;color:#0F2233;margin-top:2px;">${escapeHtml(f.startTimeDisplay)}</div>
          </div>
        </div>

        <!-- Detailed 2-Column Manifest Grid -->
        <div class="wasla-voucher-details-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px 20px;background:#FFFFFF;">
          <div class="wasla-voucher-detail-item" style="border:1px solid #CBD5E1;border-radius:8px;padding:9px 12px;background:#F8FAFC;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.leadGuestLabel)}</div>
            <div class="wasla-voucher-field-value" style="font-size:12.5px;font-weight:700;color:#0F2233;margin-top:3px;">${escapeHtml(f.guestNameDisplay)}</div>
          </div>
          <div class="wasla-voucher-detail-item" style="border:1px solid #CBD5E1;border-radius:8px;padding:9px 12px;background:#F8FAFC;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.nationalityLabel)}</div>
            <div class="wasla-voucher-field-value" style="font-size:12.5px;font-weight:700;color:#0F2233;margin-top:3px;">${escapeHtml(f.nationalityDisplay)}</div>
          </div>
          <div class="wasla-voucher-detail-item" style="border:1px solid #CBD5E1;border-radius:8px;padding:9px 12px;background:#F8FAFC;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.hotelRoomLabel)}</div>
            <div class="wasla-voucher-field-value" style="font-size:12.5px;font-weight:700;color:#0F2233;margin-top:3px;">${escapeHtml(f.hotelDisplay)}</div>
          </div>
          <div class="wasla-voucher-detail-item" style="border:1px solid #CBD5E1;border-radius:8px;padding:9px 12px;background:#F8FAFC;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.meetingPointLabel)}</div>
            <div class="wasla-voucher-field-value" style="font-size:12.5px;font-weight:700;color:#0F2233;margin-top:3px;">${escapeHtml(f.meetingPointDisplay)}</div>
          </div>
          <div class="wasla-voucher-detail-item" style="border:1px solid #CBD5E1;border-radius:8px;padding:9px 12px;background:#F8FAFC;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.passengersLabel)}</div>
            <div class="wasla-voucher-field-value" style="font-size:12.5px;font-weight:700;color:#0F2233;margin-top:3px;">${escapeHtml(f.paxSummary)}</div>
          </div>
          <div class="wasla-voucher-detail-item" style="border:1px solid #CBD5E1;border-radius:8px;padding:9px 12px;background:#F8FAFC;">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748B;">${escapeHtml(copy.guideDriverLabel)}</div>
            <div class="wasla-voucher-field-value" style="font-size:12.5px;font-weight:700;color:#0F2233;margin-top:3px;">${escapeHtml(f.driverDisplay)}</div>
          </div>
        </div>

        <!-- Price & Payment Summary Bar -->
        <div class="wasla-voucher-price-bar" style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 20px 12px 20px;padding:11px 14px;border:1.5px solid #16A34A;border-radius:10px;background:#F0FDF4;">
          <div class="wasla-voucher-price-left">
            <div class="wasla-voucher-field-label" style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#166534;">${escapeHtml(copy.totalAmountLabel)}</div>
            <div class="wasla-voucher-price-note" style="font-size:10.5px;font-weight:600;color:#14532D;margin-top:2px;line-height:1.35;">${escapeHtml(copy.paymentPolicyNote)}</div>
          </div>
          <div class="wasla-voucher-price-amount" style="font-size:20px;font-weight:800;color:#15803D;white-space:nowrap;flex-shrink:0;">${escapeHtml(f.formattedTotal)}</div>
        </div>

        <!-- Boarding Instructions -->
        <div class="wasla-voucher-instructions" style="margin:0 20px 14px 20px;padding:10px 14px;border:1px solid #CBD5E1;border-radius:10px;background:#FFFFFF;">
          <div class="wasla-voucher-instructions-title" style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#0F2233;margin-bottom:5px;">${escapeHtml(copy.boardingInstructionsTitle)}</div>
          <ul class="wasla-voucher-instructions-list" style="margin:0;padding-inline-start:16px;font-size:11px;color:#334155;line-height:1.45;">
            <li>${escapeHtml(copy.boardingBullet1)}</li>
            <li>${escapeHtml(copy.boardingBullet2)}</li>
            <li>${escapeHtml(copy.boardingBullet3)}</li>
          </ul>
        </div>

        <!-- Official Support Footer -->
        <div class="wasla-voucher-footer" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 20px;background:#0F2233;color:#FFFFFF;font-size:10.5px;flex-wrap:wrap;">
          <div>
            <div class="wasla-voucher-footer-title" style="font-weight:800;color:#FDBA74;font-size:10.5px;">${escapeHtml(copy.supportFooterTitle)}</div>
            <div class="wasla-voucher-footer-contacts" style="color:#E2E8F0;margin-top:2px;">
              WhatsApp: <strong style="color:#FFFFFF;">+20 112 915 5520</strong> · Email: <strong style="color:#FFFFFF;">booking@waslatravel.com</strong> · <strong style="color:#FFFFFF;">${escapeHtml(SITE_CONFIG.domain || 'waslatravel.com')}</strong>
            </div>
          </div>
          <div class="wasla-voucher-footer-stamp" style="text-align:end;color:#CBD5E1;font-size:9.5px;">
            <div>${escapeHtml(copy.issuedAtLabel)}</div>
            <div>Ref: <strong style="color:#FFFFFF;">${escapeHtml(f.bookingId)}</strong> · ${escapeHtml(f.issueDate)}</div>
          </div>
        </div>
      </div>
    `;

    // Activate dedicated 1-page voucher mode on both screen and print
    document.documentElement.classList.add('wasla-printing-voucher');
    document.body.classList.add('wasla-printing-voucher');
    window.scrollTo(0, 0);

    const backBtn = document.getElementById('wasla-voucher-back-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        closeWaslaBoardingVoucher();
      };
    }

    const downloadBtn = document.getElementById('wasla-voucher-download-btn');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        void downloadWaslaVoucherImage(data, fallbackUiLang);
      };
    }

    const printBtn = document.getElementById('wasla-voucher-print-btn');
    if (printBtn) {
      printBtn.onclick = () => {
        window.print();
      };
    }

    // Trigger print dialog after 1-page layout and QR image are painted on screen
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.print();
      }, 150);
    });
  })();
}
