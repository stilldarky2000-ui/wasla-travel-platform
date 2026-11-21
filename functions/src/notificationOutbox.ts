import { createHash, randomUUID } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import type { BookingNotificationPayload, BookingNotificationRecipients } from './bookingNotifications';
export type Channel = 'email' | 'guestEmail' | 'whatsapp' | 'webhook';
export interface JobInput { payload: BookingNotificationPayload; recipients: BookingNotificationRecipients; }
interface Job extends JobInput { status: string; channels?: Channel[]; delivered: Partial<Record<Channel, boolean>>; attempts: number; nextAttemptAtMs: number; lease?: string; }
const LEASE_MS = 300000;
export const backoffMs = (attempt: number) => Math.min(3600000, 30000 * 2 ** Math.min(10, Math.max(0, attempt - 1)));
export function notificationJobId(eventId: string): string { return createHash('sha256').update(eventId).digest('hex'); }
export async function enqueue(db: Firestore, eventId: string, input: JobInput): Promise<string> {
 const id = notificationJobId(eventId);
 const ref = db.collection('notification_outbox').doc(id);
 // Provider payloads contain optional undefined properties; Firestore doesn't accept these.
 const clean = JSON.parse(JSON.stringify(input)) as JobInput;
 await db.runTransaction(async tx => {
   if ((await tx.get(ref)).exists) return;
   tx.create(ref, {...clean,status:'pending',delivered:{},attempts:0,nextAttemptAtMs:Date.now(),createdAtMs:Date.now()});
 });
 return id;
}
export interface WorkerOptions {
 channels: (payload: BookingNotificationPayload) => Channel[];
 send: (job: JobInput, channel: Channel, key: string) => Promise<boolean>;
 now?: () => number;
 eligible?: (job: JobInput) => Promise<boolean>;
}
export async function processJob(db: Firestore, id: string, options: WorkerOptions): Promise<string> {
 const now = options.now || Date.now;
 const ref = db.collection('notification_outbox').doc(id);
 const lease = randomUUID();
 const job = await db.runTransaction(async tx => {
   const snap = await tx.get(ref);
   if (!snap.exists) return null;
   const current = snap.data() as Job;
   if (current.status === 'delivered' || current.nextAttemptAtMs > now()) return null;
   const channels = current.channels?.length ? current.channels : options.channels(current.payload);
   tx.update(ref,{status:'processing',lease,nextAttemptAtMs:now()+LEASE_MS,channels,attempts:current.attempts+1});
   return {...current,channels,attempts:current.attempts+1};
 });
 if (!job) return 'skipped';
 const checkpoint = async (patch: Record<string, unknown>) => {
   await db.runTransaction(async tx => {
     const snap = await tx.get(ref);
     if (snap.data()?.lease !== lease) throw new Error('Notification lease lost');
     tx.update(ref,patch);
   });
 };
 try {
   if (options.eligible && !await options.eligible(job)) {
     await checkpoint({status:'superseded',nextAttemptAtMs:Number.MAX_SAFE_INTEGER,lease:''});
     return 'superseded';
   }
   if (!job.channels.length) throw new Error('No notification channel configured');
   for (const channel of job.channels) {
     if (job.delivered[channel]) continue;
     if (options.eligible && !await options.eligible(job)) {
       await checkpoint({status:"superseded",nextAttemptAtMs:Number.MAX_SAFE_INTEGER,lease:""});
       return "superseded";
     }
     // Fencing before every external effect. An expired worker must not start another send.
     await checkpoint({nextAttemptAtMs:now()+LEASE_MS});
     const sent = await options.send(job, channel, id + ':' + channel);
     if (sent) {
       await checkpoint({['delivered.'+channel]:true});
       job.delivered[channel] = true;
     }
   }
   if (!job.channels.every(channel => job.delivered[channel])) throw new Error('Notification delivery incomplete');
   await checkpoint({status:'delivered',nextAttemptAtMs:Number.MAX_SAFE_INTEGER,completedAtMs:now(),lease:''});
   return 'delivered';
 } catch {
   // Do not persist provider errors: they may contain credentials, message contents or PII.
   await checkpoint({status:'retry',nextAttemptAtMs:now()+backoffMs(job.attempts),lease:'',lastFailureAtMs:now()});
   return 'retry';
 }
}
