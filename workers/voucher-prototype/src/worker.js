/**
 * Wasla Travel — voucher-link Worker prototype (STAGING TEST ONLY)
 *
 * Purpose: issue and verify signed, tamper-proof voucher links for bookings.
 * - Signing: HMAC-SHA256 via WebCrypto only. No dependencies, no database.
 * - Secret: read from the VOUCHER_SECRET Worker secret / env var.
 *   NEVER hardcode a real secret here.
 *
 * Token format:  base64url(payloadJSON) "." base64url(hmacSignature)
 * Payload:       { "ref": "<booking reference>", "iat": <unix>, "exp": <unix> }
 *
 * Routes:
 *   GET  /health            -> { ok: true }
 *   GET  /v/<token>         -> verify token; 200 voucher (HTML or JSON),
 *                              403 tampered/invalid, 410 expired
 *   POST /issue             -> prototype-only issuing endpoint.
 *                              Requires header: Authorization: Bearer <VOUCHER_SECRET>
 *                              Body JSON: { "bookingRef": "WSL-1234", "ttlSeconds": 86400 }
 *                              In production, issuing must only happen from a
 *                              trusted admin flow — never expose it publicly.
 */

const encoder = new TextEncoder();

function base64UrlEncode(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Constant-time comparison so signature checks don't leak timing hints. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(secret, data) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

/**
 * Issue a signed voucher token for a booking reference.
 * @param {string} secret
 * @param {string} bookingRef
 * @param {number} ttlSeconds  lifetime of the link, in seconds
 * @param {number} [nowSeconds] injectable clock for tests
 * @returns {Promise<string>} token
 */
export async function issueToken(secret, bookingRef, ttlSeconds, nowSeconds) {
  const now = typeof nowSeconds === "number" ? nowSeconds : Math.floor(Date.now() / 1000);
  const payload = { ref: String(bookingRef), iat: now, exp: now + ttlSeconds };
  const payloadPart = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(secret, payloadPart);
  return `${payloadPart}.${base64UrlEncode(signature)}`;
}

/**
 * Verify a voucher token.
 * @returns {Promise<{ok:true, payload:object} | {ok:false, reason:string}>}
 *   reason is one of: "malformed" | "bad-signature" | "expired"
 */
export async function verifyToken(secret, token, nowSeconds) {
  const now = typeof nowSeconds === "number" ? nowSeconds : Math.floor(Date.now() / 1000);
  if (typeof token !== "string") return { ok: false, reason: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" };

  let presentedSig;
  let payload;
  try {
    presentedSig = base64UrlDecode(parts[1]);
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const expectedSig = await sign(secret, parts[0]);
  if (!timingSafeEqual(presentedSig, expectedSig)) {
    return { ok: false, reason: "bad-signature" };
  }
  if (!payload || typeof payload.ref !== "string" || typeof payload.exp !== "number") {
    return { ok: false, reason: "malformed" };
  }
  if (payload.exp <= now) return { ok: false, reason: "expired" };
  return { ok: true, payload };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const secret = env && env.VOUCHER_SECRET;
    if (!secret) return jsonResponse(500, { error: "VOUCHER_SECRET is not configured" });

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return jsonResponse(200, { ok: true, service: "wasla-voucher-prototype" });
    }

    if (url.pathname === "/issue" && request.method === "POST") {
      // Prototype-only guard: issuing requires knowing the secret.
      const auth = request.headers.get("authorization") || "";
      if (auth !== `Bearer ${secret}`) return jsonResponse(403, { error: "forbidden" });
      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse(400, { error: "invalid JSON body" });
      }
      if (!body || typeof body.bookingRef !== "string" || !body.bookingRef.trim()) {
        return jsonResponse(400, { error: "bookingRef is required" });
      }
      const ttl = Number.isFinite(body.ttlSeconds) ? Math.min(Math.max(60, body.ttlSeconds), 60 * 60 * 24 * 30) : 60 * 60 * 24;
      const token = await issueToken(secret, body.bookingRef.trim(), ttl);
      return jsonResponse(200, { token, path: `/v/${token}` });
    }

    if (url.pathname.startsWith("/v/")) {
      const token = decodeURIComponent(url.pathname.slice(3));
      const result = await verifyToken(secret, token);
      if (!result.ok) {
        if (result.reason === "expired") return jsonResponse(410, { error: "voucher link expired" });
        return jsonResponse(403, { error: "invalid voucher link" });
      }
      const wantsJson = (request.headers.get("accept") || "").includes("application/json");
      if (wantsJson) {
        return jsonResponse(200, {
          valid: true,
          bookingRef: result.payload.ref,
          expiresAt: new Date(result.payload.exp * 1000).toISOString(),
        });
      }
      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Wasla Travel Voucher</title></head>
<body>
  <h1>Wasla Travel — Voucher</h1>
  <p>Booking reference: <strong>${escapeHtml(result.payload.ref)}</strong></p>
  <p>This voucher link is valid until ${escapeHtml(new Date(result.payload.exp * 1000).toISOString())}.</p>
  <p>Please show this page (or quote your booking reference) at pickup.</p>
</body></html>`;
      return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    }

    return jsonResponse(404, { error: "not found" });
  },
};
