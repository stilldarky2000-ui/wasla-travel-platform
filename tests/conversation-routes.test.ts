import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import express from 'express';
import { createRequire } from 'node:module';
import { installConversationRoutes } from '../server/conversationRoutes';
import { conversationToken } from '../server/utils/conversationAccess';
import { initializeApp as clientApp, deleteApp as deleteClient } from 'firebase/app';
import { getFirestore as clientStore, connectFirestoreEmulator, doc, getDoc, setDoc } from 'firebase/firestore';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8091') throw new Error('Local emulator required');
const admin = initializeApp({ projectId: 'demo-wasla-outbox' }, 'conversation-tests');
const db = getFirestore(admin);
const app = express(); app.use(express.json());
installConversationRoutes(app, 'demo-wasla-outbox', '(default)', (req, res, next) => {
  if (req.get('Authorization') !== 'Bearer staff-test') { res.sendStatus(403); return; }
  (req as any).authUser = { uid: 'operator-1', email: 'operator@example.test' }; next();
}, (_req, _res, next) => next());
const server = app.listen(0, '127.0.0.1');
await new Promise<void>(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${(server.address() as any).port}`;
process.env.VOUCHER_LINK_SECRET = 't'.repeat(64);
test.after(async () => { await new Promise<void>(resolve => server.close(() => resolve())); await db.terminate(); await deleteApp(admin); });
const id = 'WTCHATTEST';
const token = conversationToken(id);
const staffHeaders = { Authorization: 'Bearer staff-test', 'Content-Type': 'application/json' };
const guestHeaders = { 'X-Conversation-Token': token, 'Content-Type': 'application/json' };
test('real REST writes preserve concurrent messages, enforce privacy and idempotency, and paginate beyond 50', async () => {
  await db.recursiveDelete(db.doc(`conversations/${id}`));
  await db.doc(`bookings/${id}`).set({ guestName: 'Guest', guestEmail: 'guest@example.test', tripTitle: 'Sea trip', hotel: 'Hotel', status: 'Pending', guestLang: 'en', notes: 'PRIVATE NOTES' });
  assert.equal((await fetch(`${origin}/api/guest/conversations/${id}`)).status, 403);
  assert.equal((await fetch(`${origin}/api/staff/conversations/${id}`)).status, 403);
  assert.equal((await fetch(`${origin}/api/guest/conversations/WTOTHER`, { headers: guestHeaders })).status, 403);
  const send = async (text: string, internal = false, guest = false, messageId = crypto.randomUUID()) => {
    const response = await fetch(`${origin}/api/${guest ? 'guest' : 'staff'}/conversations/${id}/messages`, { method: 'POST', headers: guest ? guestHeaders : staffHeaders, body: JSON.stringify({ text, internal, messageId }) });
    assert.equal(response.status, 200, await response.text()); return messageId;
  };
  const stableId = await send('Guest hello', false, true);
  await send('Guest hello', false, true, stableId);
  await send('Team secret', true);
  await Promise.all(Array.from({ length: 55 }, (_, n) => send(`Public response ${n}`)));
  assert.equal((await db.collection(`conversations/${id}/messages`).get()).size, 56);
  const guest = await (await fetch(`${origin}/api/guest/conversations/${id}`, { headers: guestHeaders })).json();
  assert.equal(guest.items.length, 50); assert.ok(guest.nextPageToken);
  assert.equal(guest.notes, undefined); assert.equal(guest.booking.notes, undefined);
  assert.equal(JSON.stringify(guest).includes('operator@example.test'), false);
  assert.equal(JSON.stringify(guest).includes('Team secret'), false);
  const next = await (await fetch(`${origin}/api/guest/conversations/${id}?pageToken=${encodeURIComponent(guest.nextPageToken)}`, { headers: guestHeaders })).json();
  assert.equal(next.items.length, 6);
  assert.equal(new Set([...guest.items, ...next.items].map(m => m.id)).size, 56);
  const staff = await (await fetch(`${origin}/api/staff/conversations/${id}`, { headers: staffHeaders })).json();
  assert.equal(staff.notes[0].text, 'Team secret'); assert.equal(staff.notes[0].authorName, 'operator@example.test');
  const claimed = await fetch(`${origin}/api/staff/conversations/${id}`, { method: 'PATCH', headers: staffHeaders, body: JSON.stringify({ status: 'waiting_guest', claim: true }) });
  assert.equal(claimed.status, 200);
  assert.equal((await db.doc(`conversations/${id}`).get()).data().assigneeId, 'operator-1');
  const inboxResponse = await fetch(`${origin}/api/staff/conversations`, { headers: staffHeaders });
  assert.equal(inboxResponse.status, 200);
  assert.ok((await inboxResponse.json()).items.some((item: { id: string }) => item.id === id));
  const client = clientApp({ projectId: 'demo-wasla-outbox', apiKey: 'demo-key' }, 'conversation-client');
  const untrusted = clientStore(client); connectFirestoreEmulator(untrusted, '127.0.0.1', 8091);
  try {
    await assert.rejects(getDoc(doc(untrusted, `conversations/${id}/notes/private`)), (e: any) => e.code === 'permission-denied');
    await assert.rejects(setDoc(doc(untrusted, `conversations/${id}/messages/forged`), { sender: 'operator', text: 'forged' }), (e: any) => e.code === 'permission-denied');
  } finally { await deleteClient(client); }
});
