import type express from 'express';
import crypto from 'node:crypto';
import { readBooking, guestVoucher } from './utils/bookingStore';
import { conversationToken, validConversationToken } from './utils/conversationAccess';
import { voucherToken } from './utils/voucherAccess';
import { conversationStore, encodeFields } from './utils/conversationStore';

export function installConversationRoutes(app: express.Express, project: string, database: string, staff: express.RequestHandler, limiter: express.RequestHandler) {
  const store = conversationStore(project, database);
  const validId = (id: string) => /^[A-Z0-9_-]{3,64}$/.test(id);
  const wrap = (handler: express.RequestHandler): express.RequestHandler => async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    try { await handler(req, res, next); }
    catch { res.status(503).json({ error: 'Conversation service unavailable. Your draft is safe; please retry.' }); }
  };
  const guest: express.RequestHandler = (req, res, next) => {
    const id = String(req.params.id || '').toUpperCase();
    if (!validId(id) || !validConversationToken(id, String(req.get('X-Conversation-Token') || ''))) {
      res.status(403).json({ error: 'Use your private conversation link. It may have expired; contact support for a new link.' }); return;
    }
    next();
  };
  app.get('/api/staff/conversations', staff, limiter, wrap(async (req, res) => {
    res.json(await store.list('conversations', String(req.query.pageToken || '')));
  }));
  app.post('/api/staff/conversations/:id/link', staff, limiter, wrap(async (req, res) => {
    const id = String(req.params.id).toUpperCase();
    if (!validId(id) || !await readBooking(project, database, id)) { res.sendStatus(404); return; }
    res.json({ path: `/?conversation=${encodeURIComponent(id)}#conversationToken=${conversationToken(id)}` });
  }));
  for (const audience of ['guest', 'staff'] as const) {
    const guard = audience === 'staff' ? staff : guest;
    app.get(`/api/${audience}/conversations/:id`, guard, limiter, wrap(async (req, res) => {
      const id = String(req.params.id).toUpperCase();
      if (!validId(id)) { res.sendStatus(400); return; }
      const booking = await readBooking(project, database, id);
      if (!booking) { res.sendStatus(404); return; }
      const messages = await store.list(`conversations/${id}/messages`, String(req.query.pageToken || ''));
      const notes = audience === 'staff' ? await store.list(`conversations/${id}/notes`, String(req.query.notesPageToken || '')) : undefined;
      const thread = await store.get(`conversations/${id}`);
      const publicMessages = audience === 'staff' ? messages : { ...messages, items: messages.items.map((m: any) => ({ id:m.id, text:m.text, sender:m.sender, createdAt:m.createdAt, authorName:m.sender === 'operator' ? 'Wasla Operations' : String(booking.guestName || 'Guest') })) };
      const voucherPath = ['Confirmed', 'Driver assigned', 'Completed'].includes(String(booking.status)) ? `/?track=${encodeURIComponent(id)}#voucherToken=${voucherToken(id)}` : undefined;
      res.json({ booking: guestVoucher(booking), voucherPath, thread: audience === 'staff' ? thread : { status:thread?.status || 'needs_reply' }, ...publicMessages, ...(notes ? { notes: notes.items, notesPageToken: notes.nextPageToken } : {}) });
    }));
    app.post(`/api/${audience}/conversations/:id/messages`, guard, limiter, wrap(async (req, res) => {
      const id = String(req.params.id).toUpperCase();
      const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      const messageId = String(req.body?.messageId || '');
      if (!validId(id) || !text || text.length > 4000 || !/^[a-f0-9-]{36}$/.test(messageId)) { res.status(400).json({ error: 'Message must contain 1–4000 characters and a valid request ID.' }); return; }
      const booking = await readBooking(project, database, id);
      if (!booking) { res.sendStatus(404); return; }
      const user = (req as any).authUser;
      const internal = audience === 'staff' && req.body?.internal === true;
      const authorId = audience === 'staff' ? user.uid : `guest:${id}`;
      const authorName = audience === 'staff' ? user.email : String(booking.guestName || 'Guest');
      const message = { text, authorId, authorName, sender: audience === 'staff' ? 'operator' : 'customer', internal };
      const path = `conversations/${id}/${internal ? 'notes' : 'messages'}/${messageId}`;
      const existing = await store.get(path);
      if (existing) {
        if (existing.authorId !== authorId || existing.text !== text) { res.sendStatus(409); return; }
        res.json({ saved: true, messageId }); return;
      }
      const summary = { bookingRef: id, customerName: String(booking.guestName || 'Guest'), tripTitle: String(booking.tripTitle || ''), ...(!internal ? { lastText: text.slice(0, 160), status: audience === 'guest' ? 'needs_reply' : 'waiting_guest' } : {}) };
      const writes = [
        { update: { name: `${store.root}/${path}`, fields: encodeFields(message) }, currentDocument: { exists: false }, updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }] },
        { update: { name: `${store.root}/conversations/${id}`, fields: encodeFields(summary) }, updateMask: { fieldPaths: Object.keys(summary) }, updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] },
      ];
      try { await store.commit(writes); }
      catch (error: any) {
        if (error.status !== 409) throw error;
        const saved = await store.get(path);
        if (!saved || saved.authorId !== authorId || saved.text !== text) throw error;
      }
      res.json({ saved: true, messageId });
    }));
  }
  app.patch('/api/staff/conversations/:id', staff, limiter, wrap(async (req, res) => {
    const id = String(req.params.id).toUpperCase();
    if (!validId(id) || !await readBooking(project, database, id)) { res.sendStatus(404); return; }
    const user = (req as any).authUser;
    const status = req.body?.status;
    if (!['needs_reply', 'waiting_guest', 'closed'].includes(status)) { res.sendStatus(400); return; }
    const patch = { status, ...(req.body?.claim === true ? { assigneeId: user.uid, assigneeName: user.email } : {}) };
    const eventId = crypto.randomUUID();
    await store.commit([
      { update: { name: `${store.root}/conversations/${id}`, fields: encodeFields(patch) }, updateMask: { fieldPaths: Object.keys(patch) }, updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] },
      { update: { name: `${store.root}/conversations/${id}/notes/${eventId}`, fields: encodeFields({ text: `Status: ${status}${req.body?.claim ? ' · Assigned to ' + user.email : ''}`, authorId: user.uid, authorName: user.email, sender: 'operator', internal: true }) }, currentDocument: { exists: false }, updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }] },
    ]);
    res.json({ saved: true });
  }));
}
