import { createHmac, timingSafeEqual } from "node:crypto";
import { db, hasDb, json } from "./_db.js";

// POST /api/paymongo-webhook: PayMongo calls this when a checkout is paid.
// Register it once (README > Go live) for the event `checkout_session.payment.paid`, and put the
// webhook's secret key in PAYMONGO_WEBHOOK_SECRET. Only signed calls are believed: this is the one
// place an order or booking becomes "paid".
export async function POST(request) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret || !hasDb()) return json({ error: "Webhook not configured" }, 503);

  const raw = await request.text(); // the signature covers the exact bytes, so read before parsing
  const event = verify(raw, request.headers.get("paymongo-signature"), secret);
  if (!event) return json({ error: "Bad signature" }, 401);

  const attrs = event.data?.attributes;
  if (attrs?.type !== "checkout_session.payment.paid") return json({ ok: true, ignored: attrs?.type });

  const session = attrs.data?.attributes ?? {};
  const ref = session.reference_number;
  const kind = session.metadata?.type;
  const table = kind === "order" ? "orders" : kind === "booking" ? "bookings" : null;
  if (!table || !/^WD[OR]-[A-Z0-9]+$/.test(ref ?? "")) return json({ ok: true, ignored: "not ours" });
  const paid = { status: "paid", payment_id: session.payments?.[0]?.id ?? null };

  // pending (or a booking whose hold lapsed) -> paid. Already-paid rows are left alone, so retries are harmless.
  const r = await db(`${table}?ref=eq.${ref}&status=in.(pending,expired,cancelled)`, { method: "PATCH", body: paid });
  if (r.code === "23P01") {
    // paid after the 30-min hold, and someone else booked those nights meanwhile: flag it for a refund
    await db(`bookings?ref=eq.${ref}`, { method: "PATCH", body: { ...paid, status: "conflict" } });
  } else if (!r.ok) {
    return json({ error: "Could not record payment" }, 500); // non-2xx: PayMongo retries later
  }
  return json({ ok: true });
}

// Paymongo-Signature: t=<unix seconds>,te=<test-mode hmac>,li=<live-mode hmac>
// hmac = HMAC-SHA256(secret, `${t}.${raw body}`). Anything older than 5 minutes is refused (replays).
export function verify(raw, header, secret, now = Date.now()) {
  const parts = Object.fromEntries((header ?? "").split(",").map((p) => p.split("=")));
  if (!parts.t || Math.abs(now / 1000 - Number(parts.t)) > 300) return null;
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return null;
  }
  const given = event.data?.attributes?.livemode ? parts.li : parts.te;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
  if (!given || given.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected)) ? event : null;
}
