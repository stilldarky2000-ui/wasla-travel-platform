import { PlatformBooking } from '../data/platformData';

const SOUND_MUTED_KEY = 'wasla_booking_sound_muted';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function unlockBookingAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
  } catch {
    // Ignore audio context restrictions on mobile webviews
  }
}

export function isBookingSoundMuted(): boolean {
  try {
    return window.localStorage.getItem(SOUND_MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setBookingSoundMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(SOUND_MUTED_KEY, muted ? '1' : '0');
  } catch {
    // Ignore storage unavailability in private iframes
  }
}

/**
 * Plays a pleasant crystal 3-note chime (C5 -> E5 -> G5 -> C6) using Web Audio API.
 */
export function playNewBookingChime(force = false): void {
  try {
    if (!force && isBookingSoundMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, delay: 0, duration: 0.2 },
      { freq: 659.25, delay: 0.11, duration: 0.2 },
      { freq: 783.99, delay: 0.22, duration: 0.24 },
      { freq: 1046.5, delay: 0.34, duration: 0.42 },
    ];

    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.delay);

      gain.gain.setValueAtTime(0.0001, now + n.delay);
      gain.gain.exponentialRampToValueAtTime(0.14, now + n.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.delay + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.delay);
      osc.stop(now + n.delay + n.duration + 0.02);
    }
  } catch {
    // Ignore audio playback errors on restricted mobile browsers
  }
}

export function getNotificationSupportStatus(): 'unsupported' | 'granted' | 'denied' | 'default' {
  try {
    if (typeof window === 'undefined' || !('Notification' in window) || !window.Notification) {
      return 'unsupported';
    }
    return window.Notification.permission || 'unsupported';
  } catch {
    return 'unsupported';
  }
}

export async function requestDesktopAlertPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window) || !window.Notification) {
      return 'unsupported';
    }
    if (window.Notification.permission === 'granted') return 'granted';
    return await window.Notification.requestPermission();
  } catch {
    return 'unsupported';
  }
}

export function showDesktopBookingNotification(booking: PlatformBooking): void {
  try {
    if (typeof window === 'undefined' || !('Notification' in window) || !window.Notification) return;
    if (window.Notification.permission !== 'granted') return;

    const contactLine = [booking.guestWhatsapp, booking.guestEmail]
      .filter(Boolean)
      .join(' · ') || booking.guestContact;

    const notification = new window.Notification(`New Wasla Booking ${booking.id} · €${booking.grossEur}`, {
      body: `${booking.guestName} (${booking.adults}A${booking.children > 0 ? `+${booking.children}C` : ''}${(booking.infants ?? 0) > 0 ? `+${booking.infants}INF` : ''}) · ${booking.tripTitle} · ${booking.date}\n${contactLine}`,
      tag: `wasla-booking-${booking.id}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // Mobile Chrome throws TypeError on new Notification(); safely ignore
  }
}
