import test from 'node:test';
import assert from 'node:assert/strict';
import { readConversationResponse } from '../src/lib/conversationApi';
test('a static HTML fallback produces an actionable error, never a JSON parser error', async () => {
  await assert.rejects(readConversationResponse(new Response('<!doctype html><html>App</html>', { headers: { 'Content-Type': 'text/html' } }), true), error => {
    assert.match((error as Error).message, /\/api/);
    assert.doesNotMatch((error as Error).message, /Unexpected token|doctype/);
    return true;
  });
  assert.deepEqual(await readConversationResponse(new Response('{"items":[]}', { headers: { 'Content-Type': 'application/json' } })), { items: [] });
  await assert.rejects(readConversationResponse(new Response('not json', { headers: { 'Content-Type': 'application/json' } })), /backend deployment/);
});
