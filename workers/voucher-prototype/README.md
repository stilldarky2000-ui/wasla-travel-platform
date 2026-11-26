# Wasla voucher-link Worker — prototype

**What this is, in plain words**

When a Wasla booking is confirmed, the customer gets a voucher (their proof
of booking). This little program — a Cloudflare Worker — creates a special
link for that voucher and checks the link when the customer opens it.

The link carries a secret "signature" (made with HMAC-SHA256). If anyone
changes anything in the link — for example the booking reference — the
signature no longer matches and the link is rejected. If the link is older
than its expiry, it is rejected too. Nobody can forge a voucher link without
knowing the secret.

**What it does NOT do**

- No database. It never touches Firestore or any other data store.
- No billing. It is designed to run inside Cloudflare Workers' free plan.
- It is not connected to the live site or to waslatravel.com. Prototype only.

**How it would be used (later, if the test passes)**

1. A booking is confirmed the normal way (today: manually, over WhatsApp).
2. The Worker issues a signed link for that booking reference, e.g.
   `https://<worker-address>/v/<token>`.
3. The link is sent to the customer (e.g. in the WhatsApp confirmation).
4. When opened, the Worker checks the signature and expiry, then shows the
   voucher with the booking reference.

**Routes**

| Route | What happens |
|---|---|
| `GET /health` | Simple "I'm alive" check. |
| `GET /v/<token>` | Verifies the token. Valid → voucher page (or JSON if the request asks for JSON). Tampered → 403. Expired → 410. |
| `POST /issue` | Prototype-only way to create a token. Requires the secret in an `Authorization: Bearer …` header. In real use, issuing must happen only from a trusted admin flow — this endpoint must not be exposed publicly as-is. |

**The secret**

The signing secret lives in a Worker secret named `VOUCHER_SECRET`
(`wrangler secret put VOUCHER_SECRET`). It is never written in the code.
The test file contains a clearly-marked throwaway secret for local tests
only — it must never be used in a real deployment.

**Run the local tests**

From the repo root:

```
node --test workers/voucher-prototype/test/voucher.test.mjs
```

**Deploy to staging (workers.dev only)**

Only when logged in to the Wasla Cloudflare account, and never with a
custom domain:

```
cd workers/voucher-prototype
wrangler secret put VOUCHER_SECRET
wrangler deploy
```

`wrangler.toml` deliberately has no routes, so deploying can only ever
publish to the `*.workers.dev` subdomain.

**Fallback**

If this prototype does not fit the free plan comfortably, nothing breaks:
vouchers keep being sent manually over WhatsApp, as today.
