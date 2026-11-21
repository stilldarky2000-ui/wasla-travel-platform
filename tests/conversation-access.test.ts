import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { conversationToken, validConversationToken } from '../server/utils/conversationAccess';
const require = createRequire(import.meta.url);
const worker = require('../functions/lib/conversationMail.js');

test('conversation capability matches worker, expires, and cannot open another booking or voucher', t => {
  const previous = process.env.VOUCHER_LINK_SECRET;
  process.env.VOUCHER_LINK_SECRET = 's'.repeat(64);
  t.after(() => { if (previous === undefined) delete process.env.VOUCHER_LINK_SECRET; else process.env.VOUCHER_LINK_SECRET = previous; });
  const expiry = 1900000000000;
  const token = conversationToken('WT12345678', expiry);
  assert.equal(token, worker.conversationToken('WT12345678', expiry));
  assert.equal(validConversationToken('WT12345678', token, expiry - 1000), true);
  assert.equal(validConversationToken('WT87654321', token, expiry - 1000), false);
  assert.equal(validConversationToken('WT12345678', token, expiry), false);
  assert.equal(validConversationToken('WT12345678', token + 'x', expiry - 1000), false);
  delete process.env.VOUCHER_LINK_SECRET;
  assert.equal(validConversationToken('WT12345678', token, expiry - 1000), false);
});
