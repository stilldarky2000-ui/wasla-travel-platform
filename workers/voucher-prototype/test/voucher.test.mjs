/**
 * Local tests for the Wasla voucher-link Worker prototype.
 *
 * LOCAL TEST SECRET — this value is a throwaway used ONLY by these local
 * tests. It is not a real secret and must never be used in any deployment.
 *
 * Run from the repo root:
 *   node --test workers/voucher-prototype/test/voucher.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { issueToken, verifyToken } from "../src/worker.js";

const TEST_SECRET = "LOCAL-TEST-SECRET-DO-NOT-USE-IN-PRODUCTION";
const NOW = 1_800_000_000; // fixed clock so tests are deterministic

test("1) freshly issued token verifies OK and returns the right booking reference", async () => {
  const token = await issueToken(TEST_SECRET, "WSL-TEST-001", 3600, NOW);
  const result = await verifyToken(TEST_SECRET, token, NOW + 10);
  assert.equal(result.ok, true);
  assert.equal(result.payload.ref, "WSL-TEST-001");
});

test("2) token with the booking reference changed is rejected", async () => {
  const token = await issueToken(TEST_SECRET, "WSL-TEST-001", 3600, NOW);
  const [payloadPart, signaturePart] = token.split(".");
  // Attacker decodes the payload, changes the booking reference, re-encodes
  // it, and keeps the original signature (they don't know the secret).
  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  payload.ref = "WSL-TEST-999";
  const forgedPayloadPart = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const forged = `${forgedPayloadPart}.${signaturePart}`;
  const result = await verifyToken(TEST_SECRET, forged, NOW + 10);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "bad-signature");
});

test("3) token with a corrupted signature is rejected", async () => {
  const token = await issueToken(TEST_SECRET, "WSL-TEST-001", 3600, NOW);
  const [payloadPart, signaturePart] = token.split(".");
  const sigBytes = Buffer.from(signaturePart, "base64url");
  sigBytes[0] = sigBytes[0] ^ 0xff; // flip every bit of the first byte
  const corrupted = `${payloadPart}.${sigBytes.toString("base64url")}`;
  const result = await verifyToken(TEST_SECRET, corrupted, NOW + 10);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "bad-signature");
});

test("4) expired token is rejected", async () => {
  const token = await issueToken(TEST_SECRET, "WSL-TEST-001", 60, NOW); // 60s lifetime
  const result = await verifyToken(TEST_SECRET, token, NOW + 61); // after expiry
  assert.equal(result.ok, false);
  assert.equal(result.reason, "expired");
});

test("5) fetch handler: valid link returns the voucher, tampered link returns 403", async () => {
  const env = { VOUCHER_SECRET: TEST_SECRET };
  const token = await issueToken(TEST_SECRET, "WSL-TEST-001", 3600);

  const okRes = await worker.fetch(new Request(`https://prototype.workers.dev/v/${token}`), env);
  assert.equal(okRes.status, 200);
  const html = await okRes.text();
  assert.ok(html.includes("WSL-TEST-001"));

  const badRes = await worker.fetch(new Request(`https://prototype.workers.dev/v/${token}x`), env);
  assert.equal(badRes.status, 403);
});

test("6) lightness benchmark: repeated verifications are fast (WebCrypto HMAC only)", async () => {
  const token = await issueToken(TEST_SECRET, "WSL-TEST-001", 3600, NOW);
  const iterations = 1000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const result = await verifyToken(TEST_SECRET, token, NOW + 10);
    assert.equal(result.ok, true);
  }
  const elapsedMs = performance.now() - start;
  const perCallMs = elapsedMs / iterations;
  console.log(`[bench] ${iterations} verifications in ${elapsedMs.toFixed(1)} ms (${perCallMs.toFixed(3)} ms each, local Node)`);
  // Generous local ceiling: the real check is Cloudflare's 10 ms CPU limit,
  // and this loop includes Node/test overhead, so we only fail if it is
  // wildly slow (>5 ms per verification on average locally).
  assert.ok(perCallMs < 5, `verification too slow locally: ${perCallMs} ms each`);
});
