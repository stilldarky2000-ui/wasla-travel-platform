import { Lang } from '../data/i18n';

export function normalizeWhatsAppDigits(raw: string): string {
  return raw.replace(/\D/g, '') || '201129155520';
}

export function formatWhatsAppDisplay(raw: string): string {
  const digits = normalizeWhatsAppDigits(raw);
  if (digits === '201129155520') return '+20 112 915 5520';
  return raw.startsWith('+') ? raw : `+${digits}`;
}

export interface WhatsAppBookingPayload {
  id: string;
  tripTitle: string;
  date: string;
  tripStartTime?: string;
  adults: number;
  children: number;
  infants?: number;
  totalEur: number;
  hotel: string;
  roomNumber?: string;
  guestName: string;
  guestCountry?: string;
  whatsapp?: string;
  email?: string;
  contact: string;
  notes?: string;
}

export function buildBookingWhatsAppUrl(
  whatsappNumber: string,
  booking: WhatsAppBookingPayload,
  lang: Lang
): string {
  const digits = normalizeWhatsAppDigits(whatsappNumber);
  const waDisplay = booking.whatsapp || booking.contact;
  const emailDisplay = booking.email || '';
  const rawNationality = booking.guestCountry?.trim() || '';
  const nationalityDisplay = rawNationality.toLowerCase() === 'guest' ? '' : rawNationality;
  const infantsCount = booking.infants ?? 0;
  const totalHeadcount = booking.adults + booking.children + infantsCount;
  const startTimeDisplay = booking.tripStartTime?.trim() || '';
  const roomDisplay = booking.roomNumber?.trim() || '';
  const hotelLine = roomDisplay ? `${booking.hotel} (Room ${roomDisplay})` : booking.hotel;
  const isCustomQuote = !Number.isFinite(booking.totalEur) || booking.totalEur <= 0;

  const lines =
    lang === 'ar'
      ? [
          `مرحباً وصلة ترافل، أرغب بتأكيد تيكت حجزي (${booking.id}):`,
          `• الرحلة / الأوبشن: ${booking.tripTitle}`,
          `• التاريخ: ${booking.date}`,
          startTimeDisplay ? `• توقيت بداية الرحلة: ${startTimeDisplay}` : '',
          `• الفندق / التوصيل: ${hotelLine}`,
          `• الأفراد: ${booking.adults} بالغ${booking.children > 0 ? ` + ${booking.children} طفل` : ''}${infantsCount > 0 ? ` + ${infantsCount} رضيع INF (مجاناً)` : ''} (إجمالي الكشف: ${totalHeadcount} فرد)`,
          isCustomQuote
            ? `• السعر: عرض سعر مخصص (يرسله فريق العمليات قبل التأكيد)`
            : `• الإجمالي التقديري: €${booking.totalEur} (الدفع كاش عند الاستلام أو عبر رابط الدفع الرسمي بعد التأكيد)`,
          `• الاسم: ${booking.guestName}`,
          nationalityDisplay ? `• الجنسية: ${nationalityDisplay}` : '',
          `• رقم الواتساب: ${waDisplay}`,
          emailDisplay ? `• البريد الإلكتروني (لإرسال البيك أب): ${emailDisplay}` : '',
          booking.notes ? `• ملاحظات: ${booking.notes}` : '',
        ]
      : lang === 'de'
      ? [
          `Hallo Wasla Travel, hier ist mein Buchungsticket (${booking.id}):`,
          `• Tour / Option: ${booking.tripTitle}`,
          `• Datum: ${booking.date}`,
          startTimeDisplay ? `• Tour-Startzeit: ${startTimeDisplay}` : '',
          `• Hotel / Abholort: ${hotelLine}`,
          `• Personen: ${booking.adults} Erw.${booking.children > 0 ? ` + ${booking.children} Kind(er)` : ''}${infantsCount > 0 ? ` + ${infantsCount} Kleinkind/INF (Kostenlos)` : ''} (Gesamt: ${totalHeadcount} Pers.)`,
          isCustomQuote
            ? `• Preis: Individuelles Angebot (vom Operations-Team vor Bestätigung)`
            : `• Gesamtpreis: €${booking.totalEur} (Bar bei Abholung oder offizieller Zahlungslink nach Bestätigung)`,
          `• Name: ${booking.guestName}`,
          nationalityDisplay ? `• Nationalität: ${nationalityDisplay}` : '',
          `• WhatsApp: ${waDisplay}`,
          emailDisplay ? `• E-Mail (für Abholinfos): ${emailDisplay}` : '',
          booking.notes ? `• Hinweise: ${booking.notes}` : '',
        ]
      : [
          `Hello Wasla Travel, I would like to confirm my booking ticket (${booking.id}):`,
          `• Trip / Option: ${booking.tripTitle}`,
          `• Date: ${booking.date}`,
          startTimeDisplay ? `• Trip Start Time: ${startTimeDisplay}` : '',
          `• Hotel / Pickup: ${hotelLine}`,
          `• Guests: ${booking.adults} Adult(s)${booking.children > 0 ? ` + ${booking.children} Child(ren)` : ''}${infantsCount > 0 ? ` + ${infantsCount} Infant/INF (Free)` : ''} (Total headcount: ${totalHeadcount})`,
          isCustomQuote
            ? `• Price: Custom quote (sent by Operations before confirmation)`
            : `• Estimated Total: €${booking.totalEur} (Cash on pickup or official payment link after confirmation)`,
          `• Guest Name: ${booking.guestName}`,
          nationalityDisplay ? `• Nationality: ${nationalityDisplay}` : '',
          `• WhatsApp: ${waDisplay}`,
          emailDisplay ? `• Email (for pickup details): ${emailDisplay}` : '',
          booking.notes ? `• Notes: ${booking.notes}` : '',
        ];

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`;
}

export type GuestLanguageCode = 'en' | 'de' | 'ar' | 'fr' | 'it' | 'es' | 'nl' | 'pl' | 'ru';

export function resolveGuestLanguageCode(
  guestLanguage?: string,
  notes?: string,
  fallbackLang?: Lang
): GuestLanguageCode {
  const noteMatch = String(notes || '').match(
    /(?:Guide & Email Language|Guide Language)\s*:\s*([^·\n]+)/i
  );
  const raw = (guestLanguage || noteMatch?.[1] || fallbackLang || 'en').trim().toLowerCase();
  if (/^(de|german|deutsch|ألمان)/i.test(raw)) return 'de';
  if (/^(ar|arabic|عرب)/i.test(raw)) return 'ar';
  if (/^(fr|french|français|فرنس)/i.test(raw)) return 'fr';
  if (/^(it|italian|italiano|إيطال)/i.test(raw)) return 'it';
  if (/^(es|spanish|español|إسبان)/i.test(raw)) return 'es';
  if (/^(nl|dutch|nederlands|هولند)/i.test(raw)) return 'nl';
  if (/^(pl|polish|polski|بولند)/i.test(raw)) return 'pl';
  if (/^(ru|russian|русский|روس)/i.test(raw)) return 'ru';
  return 'en';
}

export function formatPickupSpotByLang(
  pickupSpot: string | undefined,
  langCode: GuestLanguageCode
): string {
  const isOutside = pickupSpot === 'Outside Main Gate';
  switch (langCode) {
    case 'de':
      return isOutside ? 'Vor dem Hotel-Haupteingang' : 'In der Hotelrezeption / Lobby';
    case 'ar':
      return isOutside ? 'أمام البوابة الرئيسية للفندق' : 'داخل استقبال الفندق';
    case 'fr':
      return isOutside
        ? 'Devant l’entrée principale de l’hôtel'
        : 'À la réception / hall de l’hôtel';
    case 'it':
      return isOutside
        ? 'Davanti all’ingresso principale dell’hotel'
        : 'Alla reception / hall dell’hotel';
    case 'es':
      return isOutside
        ? 'Frente a la entrada principal del hotel'
        : 'En la recepción / vestíbulo del hotel';
    case 'nl':
      return isOutside ? 'Bij de hoofdingang van het hotel' : 'Bij de receptie / lobby van het hotel';
    case 'pl':
      return isOutside ? 'Przed głównym wejściem do hotelu' : 'W recepcji / lobby hotelu';
    case 'ru':
      return isOutside ? 'У главного входа в отель' : 'На ресепшене / в лобби отеля';
    default:
      return isOutside ? 'Outside Hotel Main Gate' : 'Inside Hotel Reception / Lobby';
  }
}

interface PickupMessageCopy {
  emailSubjectPrefix: string;
  dear: string;
  emailIntro: string;
  waHello: (name: string, id: string) => string;
  refLabel: string;
  tripLabel: string;
  dateLabel: string;
  startTimeLabel: string;
  pickupTimeLabel: string;
  tbdText: string;
  meetingPointLabel: string;
  hotelLabel: string;
  roomWord: string;
  nationalityLabel: string;
  guestsLabel: string;
  adultsWord: string;
  childrenWord: string;
  infantsWord: string;
  priceLabel: string;
  driverLabel: string;
  driverFallback: string;
  notesLabel: string;
  emailOutro: string;
  waOutro: string;
  regards: string;
  deskName: string;
}

const PICKUP_MESSAGE_COPY: Record<GuestLanguageCode, PickupMessageCopy> = {
  en: {
    emailSubjectPrefix: 'Wasla Travel Pickup Confirmation',
    dear: 'Dear',
    emailIntro:
      'Thank you for booking with Wasla Travel (waslatravel.com). Here are your confirmed booking & pickup details:',
    waHello: (name, id) => `Hello ${name}, your Wasla Travel pickup is ready (${id})!`,
    refLabel: 'Booking Reference',
    tripLabel: 'Trip / Service',
    dateLabel: 'Date',
    startTimeLabel: 'Trip Start Time',
    pickupTimeLabel: 'Hotel Pickup Time',
    tbdText: 'TBD (Confirmed evening prior)',
    meetingPointLabel: 'Meeting Point',
    hotelLabel: 'Hotel / Pickup Location',
    roomWord: 'Room',
    nationalityLabel: 'Nationality',
    guestsLabel: 'Guests',
    adultsWord: 'Adult(s)',
    childrenWord: 'Child(ren)',
    infantsWord: 'Infant(s) (Free)',
    priceLabel: 'Total Guest Price',
    driverLabel: 'Assigned Driver / Guide',
    driverFallback: 'Will greet you at the pickup point',
    notesLabel: 'Notes',
    emailOutro:
      'If you need any adjustments, reply to this email or message us anytime on WhatsApp.',
    waOutro: 'Need help? Reply here anytime.',
    regards: 'Best regards,',
    deskName: 'Wasla Travel Operations Desk',
  },
  de: {
    emailSubjectPrefix: 'Wasla Travel Abholbestätigung',
    dear: 'Hallo',
    emailIntro:
      'Vielen Dank für Ihre Buchung bei Wasla Travel (waslatravel.com). Hier sind Ihre bestätigten Buchungs- und Abholdetails:',
    waHello: (name, id) => `Hallo ${name}, Ihre Wasla Travel Abholung ist bereit (${id})!`,
    refLabel: 'Buchungsnummer',
    tripLabel: 'Ausflug / Service',
    dateLabel: 'Datum',
    startTimeLabel: 'Startzeit',
    pickupTimeLabel: 'Hotel-Abholzeit',
    tbdText: 'Wird am Vorabend bestätigt',
    meetingPointLabel: 'Treffpunkt',
    hotelLabel: 'Hotel / Abholort',
    roomWord: 'Zimmer',
    nationalityLabel: 'Nationalität',
    guestsLabel: 'Teilnehmer',
    adultsWord: 'Erwachsene',
    childrenWord: 'Kinder',
    infantsWord: 'Kleinkinder (Kostenlos)',
    priceLabel: 'Gesamtbetrag',
    driverLabel: 'Fahrer / Guide',
    driverFallback: 'Empfängt Sie direkt am Treffpunkt',
    notesLabel: 'Hinweise',
    emailOutro:
      'Falls Sie Änderungen wünschen, antworten Sie einfach auf diese E-Mail oder schreiben Sie uns auf WhatsApp.',
    waOutro: 'Fragen? Antworten Sie uns jederzeit hier.',
    regards: 'Mit freundlichen Grüßen,',
    deskName: 'Wasla Travel Team',
  },
  ar: {
    emailSubjectPrefix: 'تأكيد موعد البيك أب من وصلة ترافيل',
    dear: 'مرحباً',
    emailIntro:
      'شكراً لحجزك مع وصلة ترافيل (waslatravel.com). إليك تفاصيل حجزك وموعد الاستلام المؤكد:',
    waHello: (name, id) => `أهلاً ${name}، تفاصيل البيك أب لحجزك في وصلة ترافيل جاهزة (${id})!`,
    refLabel: 'رقم الحجز المرجعي',
    tripLabel: 'الرحلة / الخدمة',
    dateLabel: 'التاريخ',
    startTimeLabel: 'توقيت بداية الرحلة',
    pickupTimeLabel: 'موعد الاستلام من الفندق',
    tbdText: 'يتم تأكيده مساء اليوم السابق',
    meetingPointLabel: 'نقطة الالتقاء',
    hotelLabel: 'الفندق / مكان الاستلام',
    roomWord: 'غرفة',
    nationalityLabel: 'الجنسية',
    guestsLabel: 'عدد الأفراد',
    adultsWord: 'بالغين',
    childrenWord: 'أطفال',
    infantsWord: 'رضّع (مجاناً)',
    priceLabel: 'الإجمالي',
    driverLabel: 'السائق / المرشد',
    driverFallback: 'سيكون بانتظارك في نقطة الالتقاء',
    notesLabel: 'ملاحظات',
    emailOutro:
      'لأي تعديل أو استفسار، يمكنك الرد على هذا البريد الإلكتروني أو مراسلتنا في أي وقت عبر واتساب.',
    waOutro: 'هل تحتاج أي مساعدة؟ راسلنا هنا في أي وقت.',
    regards: 'مع أطيب التحيات،',
    deskName: 'فريق عمليات وصلة ترافيل',
  },
  fr: {
    emailSubjectPrefix: 'Confirmation de prise en charge Wasla Travel',
    dear: 'Bonjour',
    emailIntro:
      'Merci d’avoir réservé avec Wasla Travel (waslatravel.com). Voici vos détails de réservation et de prise en charge :',
    waHello: (name, id) => `Bonjour ${name}, votre prise en charge Wasla Travel est prête (${id}) !`,
    refLabel: 'Référence',
    tripLabel: 'Excursion / Service',
    dateLabel: 'Date',
    startTimeLabel: 'Heure de départ',
    pickupTimeLabel: 'Prise en charge hôtel',
    tbdText: 'Confirmée la veille au soir',
    meetingPointLabel: 'Point de rendez-vous',
    hotelLabel: 'Hôtel / Lieu',
    roomWord: 'Chambre',
    nationalityLabel: 'Nationalité',
    guestsLabel: 'Participants',
    adultsWord: 'Adulte(s)',
    childrenWord: 'Enfant(s)',
    infantsWord: 'Bébé(s) (Gratuit)',
    priceLabel: 'Prix total',
    driverLabel: 'Chauffeur / Guide',
    driverFallback: 'Vous accueillera au point de rendez-vous',
    notesLabel: 'Remarques',
    emailOutro:
      'Pour toute modification, répondez à cet e-mail ou contactez-nous à tout moment sur WhatsApp.',
    waOutro: 'Besoin d’aide ? Répondez ici à tout moment.',
    regards: 'Cordialement,',
    deskName: 'Équipe Wasla Travel',
  },
  it: {
    emailSubjectPrefix: 'Conferma prelievo Wasla Travel',
    dear: 'Ciao',
    emailIntro:
      'Grazie per aver prenotato con Wasla Travel (waslatravel.com). Ecco i dettagli confermati della tua prenotazione:',
    waHello: (name, id) => `Ciao ${name}, il tuo prelievo Wasla Travel è pronto (${id})!`,
    refLabel: 'Codice prenotazione',
    tripLabel: 'Escursione / Servizio',
    dateLabel: 'Data',
    startTimeLabel: 'Orario di inizio',
    pickupTimeLabel: 'Orario prelievo hotel',
    tbdText: 'Confermato la sera prima',
    meetingPointLabel: 'Punto di incontro',
    hotelLabel: 'Hotel / Luogo',
    roomWord: 'Camera',
    nationalityLabel: 'Nazionalità',
    guestsLabel: 'Ospiti',
    adultsWord: 'Adulti',
    childrenWord: 'Bambini',
    infantsWord: 'Neonati (Gratis)',
    priceLabel: 'Prezzo totale',
    driverLabel: 'Autista / Guida',
    driverFallback: 'Ti accoglierà al punto di incontro',
    notesLabel: 'Note',
    emailOutro:
      'Per qualsiasi modifica, rispondi a questa email o scrivici in qualsiasi momento su WhatsApp.',
    waOutro: 'Hai bisogno di aiuto? Rispondi qui in qualsiasi momento.',
    regards: 'Cordiali saluti,',
    deskName: 'Team Operativo Wasla Travel',
  },
  es: {
    emailSubjectPrefix: 'Confirmación de recogida Wasla Travel',
    dear: 'Hola',
    emailIntro:
      'Gracias por reservar con Wasla Travel (waslatravel.com). Aquí tienes los detalles confirmados de tu reserva y recogida:',
    waHello: (name, id) => `¡Hola ${name}, tu recogida con Wasla Travel está lista (${id})!`,
    refLabel: 'Referencia',
    tripLabel: 'Excursión / Servicio',
    dateLabel: 'Fecha',
    startTimeLabel: 'Hora de inicio',
    pickupTimeLabel: 'Hora de recogida en hotel',
    tbdText: 'Confirmada la tarde anterior',
    meetingPointLabel: 'Punto de encuentro',
    hotelLabel: 'Hotel / Lugar',
    roomWord: 'Hab.',
    nationalityLabel: 'Nacionalidad',
    guestsLabel: 'Participantes',
    adultsWord: 'Adulto(s)',
    childrenWord: 'Niño(s)',
    infantsWord: 'Bebé(s) (Gratis)',
    priceLabel: 'Precio total',
    driverLabel: 'Conductor / Guía',
    driverFallback: 'Te recibirá en el punto de encuentro',
    notesLabel: 'Notas',
    emailOutro:
      'Si necesitas algún cambio, responde a este correo o escríbenos en cualquier momento por WhatsApp.',
    waOutro: '¿Necesitas ayuda? Responde aquí en cualquier momento.',
    regards: 'Saludos cordiales,',
    deskName: 'Equipo de Operaciones Wasla Travel',
  },
  nl: {
    emailSubjectPrefix: 'Wasla Travel ophaalbevestiging',
    dear: 'Hallo',
    emailIntro:
      'Bedankt voor uw boeking bij Wasla Travel (waslatravel.com). Hier zijn uw bevestigde boekings- en ophaalgegevens:',
    waHello: (name, id) => `Hallo ${name}, uw Wasla Travel ophaaltijd staat klaar (${id})!`,
    refLabel: 'Boekingsnummer',
    tripLabel: 'Excursie / Service',
    dateLabel: 'Datum',
    startTimeLabel: 'Starttijd',
    pickupTimeLabel: 'Ophaaltijd hotel',
    tbdText: 'Wordt de avond ervoor bevestigd',
    meetingPointLabel: 'Ontmoetingspunt',
    hotelLabel: 'Hotel / Locatie',
    roomWord: 'Kamer',
    nationalityLabel: 'Nationaliteit',
    guestsLabel: 'Gasten',
    adultsWord: 'Volwassenen',
    childrenWord: 'Kinderen',
    infantsWord: 'Baby’s (Gratis)',
    priceLabel: 'Totaalprijs',
    driverLabel: 'Chauffeur / Gids',
    driverFallback: 'Wacht op u bij het ontmoetingspunt',
    notesLabel: 'Opmerkingen',
    emailOutro:
      'Wilt u iets aanpassen? Reageer op deze e-mail of stuur ons op elk moment een bericht via WhatsApp.',
    waOutro: 'Hulp nodig? Antwoord hier op elk moment.',
    regards: 'Met vriendelijke groet,',
    deskName: 'Wasla Travel Operations Desk',
  },
  pl: {
    emailSubjectPrefix: 'Potwierdzenie odbioru Wasla Travel',
    dear: 'Cześć',
    emailIntro:
      'Dziękujemy za rezerwację w Wasla Travel (waslatravel.com). Oto potwierdzone szczegóły Twojej rezerwacji i odbioru:',
    waHello: (name, id) => `Cześć ${name}, Twój odbiór z Wasla Travel jest gotowy (${id})!`,
    refLabel: 'Numer rezerwacji',
    tripLabel: 'Wycieczka / Usługa',
    dateLabel: 'Data',
    startTimeLabel: 'Godzina rozpoczęcia',
    pickupTimeLabel: 'Godzina odbioru z hotelu',
    tbdText: 'Potwierdzana wieczorem dzień wcześniej',
    meetingPointLabel: 'Miejsce spotkania',
    hotelLabel: 'Hotel / Miejsce odbioru',
    roomWord: 'Pokój',
    nationalityLabel: 'Narodowość',
    guestsLabel: 'Uczestnicy',
    adultsWord: 'Dorośli',
    childrenWord: 'Dzieci',
    infantsWord: 'Niemowlęta (Bezpłatnie)',
    priceLabel: 'Cena całkowita',
    driverLabel: 'Kierowca / Przewodnik',
    driverFallback: 'Będzie czekać w miejscu spotkania',
    notesLabel: 'Uwagi',
    emailOutro:
      'Jeśli potrzebujesz zmian, odpowiedz na tę wiadomość e-mail lub napisz do nas na WhatsApp.',
    waOutro: 'Potrzebujesz pomocy? Odpowiedz tutaj w dowolnym momencie.',
    regards: 'Pozdrawiamy,',
    deskName: 'Zespół Wasla Travel',
  },
  ru: {
    emailSubjectPrefix: 'Подтверждение трансфера Wasla Travel',
    dear: 'Здравствуйте',
    emailIntro:
      'Благодарим за бронирование в Wasla Travel (waslatravel.com). Ниже указаны подтверждённые детали вашей экскурсии и трансфера:',
    waHello: (name, id) => `Здравствуйте, ${name}! Ваш трансфер Wasla Travel готов (${id}).`,
    refLabel: 'Номер брони',
    tripLabel: 'Экскурсия / Услуга',
    dateLabel: 'Дата',
    startTimeLabel: 'Начало экскурсии',
    pickupTimeLabel: 'Время трансфера из отеля',
    tbdText: 'Уточняется вечером накануне',
    meetingPointLabel: 'Место встречи',
    hotelLabel: 'Отель / Место посадки',
    roomWord: 'Номер',
    nationalityLabel: 'Гражданство',
    guestsLabel: 'Гости',
    adultsWord: 'Взрослые',
    childrenWord: 'Дети',
    infantsWord: 'Младенцы (Бесплатно)',
    priceLabel: 'Итоговая стоимость',
    driverLabel: 'Водитель / Гид',
    driverFallback: 'Встретит вас в месте посадки',
    notesLabel: 'Примечания',
    emailOutro:
      'Если потребуются изменения, ответьте на это письмо или напишите нам в WhatsApp.',
    waOutro: 'Нужна помощь? Напишите нам здесь в любое время.',
    regards: 'С уважением,',
    deskName: 'Команда Wasla Travel',
  },
};

export function buildLocalizedPickupConfirmationEmail(params: {
  bookingId: string;
  guestName: string;
  tripTitle: string;
  date: string;
  tripStartTime?: string;
  pickupTime?: string;
  pickupSpot?: string;
  hotel: string;
  roomNumber?: string;
  guestCountry?: string;
  adults?: number;
  children?: number;
  infants?: number;
  grossEur?: number;
  paymentStatus?: string;
  driverOrGuide?: string;
  notes?: string;
  guestLang?: Lang;
  guestLanguage?: string;
  whatsappDisplay?: string;
  supportEmail?: string;
}): { subject: string; body: string; langCode: GuestLanguageCode } {
  const langCode = resolveGuestLanguageCode(params.guestLanguage, params.notes, params.guestLang);
  const c = PICKUP_MESSAGE_COPY[langCode];
  const spotText = formatPickupSpotByLang(params.pickupSpot, langCode);
  const hotelLine = params.roomNumber?.trim()
    ? `${params.hotel} (${c.roomWord} ${params.roomNumber.trim()})`
    : params.hotel;
  const pickupDisplay =
    !params.pickupTime || params.pickupTime === 'TBD' ? c.tbdText : params.pickupTime;
  const supportEmail = params.supportEmail?.trim() || 'booking@waslatravel.com';
  const waDisplay = params.whatsappDisplay?.trim() || '+20 112 915 5520';

  const cleanedNotes = String(params.notes || '')
    .split('·')
    .map((part) => part.trim())
    .filter(
      (part) =>
        part &&
        !/^(?:Guide & Email Language|Guide Language|WhatsApp Opt-in)\s*:/i.test(part)
    )
    .join(' · ');

  const adults = params.adults ?? 0;
  const children = params.children ?? 0;
  const infants = params.infants ?? 0;
  const guestsLine =
    adults > 0
      ? `${adults} ${c.adultsWord}${children > 0 ? ` + ${children} ${c.childrenWord}` : ''}${
          infants > 0 ? ` + ${infants} ${c.infantsWord}` : ''
        }`
      : '';

  const subject = `${c.emailSubjectPrefix} — ${params.bookingId} (${params.date})`;
  const body = [
    `${c.dear} ${params.guestName},`,
    ``,
    c.emailIntro,
    ``,
    `• ${c.refLabel}: ${params.bookingId}`,
    `• ${c.tripLabel}: ${params.tripTitle}`,
    `• ${c.dateLabel}: ${params.date}`,
    params.tripStartTime?.trim() ? `• ${c.startTimeLabel}: ${params.tripStartTime.trim()}` : undefined,
    `• ${c.pickupTimeLabel}: ${pickupDisplay}`,
    `• ${c.meetingPointLabel}: ${spotText}`,
    `• ${c.hotelLabel}: ${hotelLine}`,
    params.guestCountry?.trim() ? `• ${c.nationalityLabel}: ${params.guestCountry.trim()}` : undefined,
    guestsLine ? `• ${c.guestsLabel}: ${guestsLine}` : undefined,
    typeof params.grossEur === 'number' && params.grossEur > 0
      ? `• ${c.priceLabel}: €${params.grossEur}${
          params.paymentStatus ? ` (${params.paymentStatus})` : ''
        }`
      : undefined,
    `• ${c.driverLabel}: ${params.driverOrGuide?.trim() || c.driverFallback}`,
    cleanedNotes ? `• ${c.notesLabel}: ${cleanedNotes}` : undefined,
    ``,
    c.emailOutro,
    ``,
    c.regards,
    c.deskName,
    `WhatsApp: ${waDisplay} | ${supportEmail}`,
  ]
    .filter((line) => line !== undefined)
    .join('\n');

  return { subject, body, langCode };
}

export function buildGuestPickupWhatsAppUrl(params: {
  guestWhatsapp?: string;
  guestContact: string;
  bookingId: string;
  guestName: string;
  tripTitle: string;
  date: string;
  tripStartTime?: string;
  pickupTime: string;
  pickupSpot?: string;
  hotel: string;
  roomNumber?: string;
  driverOrGuide?: string;
  guestLang?: Lang;
  guestLanguage?: string;
  notes?: string;
}): string | null {
  const candidate = (params.guestWhatsapp || params.guestContact || '').trim();
  const digits = candidate.replace(/\D/g, '');
  if (digits.length < 7) return null;

  const langCode = resolveGuestLanguageCode(params.guestLanguage, params.notes, params.guestLang);
  const c = PICKUP_MESSAGE_COPY[langCode];
  const spotText = formatPickupSpotByLang(params.pickupSpot, langCode);
  const hotelLine = params.roomNumber?.trim()
    ? `${params.hotel} (${c.roomWord} ${params.roomNumber.trim()})`
    : params.hotel;
  const pickupDisplay =
    !params.pickupTime || params.pickupTime === 'TBD' ? c.tbdText : params.pickupTime;

  const text = [
    c.waHello(params.guestName, params.bookingId),
    `• ${c.tripLabel}: ${params.tripTitle}`,
    `• ${c.dateLabel}: ${params.date}`,
    params.tripStartTime?.trim() ? `• ${c.startTimeLabel}: ${params.tripStartTime.trim()}` : '',
    `• ${c.pickupTimeLabel}: ${pickupDisplay}`,
    `• ${c.meetingPointLabel}: ${spotText}`,
    `• ${c.hotelLabel}: ${hotelLine}`,
    `• ${c.driverLabel}: ${params.driverOrGuide || c.driverFallback}`,
    c.waOutro,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function buildGuestPickupMailtoUrl(params: {
  guestEmail?: string;
  guestContact: string;
  bookingId: string;
  guestName: string;
  tripTitle: string;
  date: string;
  tripStartTime?: string;
  pickupTime: string;
  pickupSpot?: string;
  hotel: string;
  roomNumber?: string;
  driverOrGuide?: string;
  guestLang?: Lang;
  guestLanguage?: string;
  notes?: string;
}): string | null {
  const emailMatch = (params.guestEmail || params.guestContact || '').match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );
  if (!emailMatch) return null;
  const email = emailMatch[0];
  const { subject, body } = buildLocalizedPickupConfirmationEmail({
    bookingId: params.bookingId,
    guestName: params.guestName,
    tripTitle: params.tripTitle,
    date: params.date,
    tripStartTime: params.tripStartTime,
    pickupTime: params.pickupTime,
    pickupSpot: params.pickupSpot,
    hotel: params.hotel,
    roomNumber: params.roomNumber,
    driverOrGuide: params.driverOrGuide,
    guestLang: params.guestLang,
    guestLanguage: params.guestLanguage,
    notes: params.notes,
  });

  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
