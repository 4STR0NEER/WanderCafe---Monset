import { randomBytes } from "node:crypto";
import { checkBooking, peso } from "../src/lib/booking.js";
import { checkOrder, fmtTime } from "../src/lib/order.js";
import { db, hasDb, holdCutoff, json } from "./_db.js";

// POST /api/checkout  (Vercel function; vite.config.js runs it under `npm run dev` too)
// Two kinds of payment, both on PayMongo's hosted page (GCash, Maya, card, QR Ph):
//   { type: "order", ... }  cafe order, paid in full     -> back to /order?order=paid
//   { ...booking }          B&B stay, 50% deposit       -> back to /stay?booking=paid
// The request is validated and priced here with the same code the page uses; the browser's
// numbers are never trusted. The order/booking is saved as "pending" first; the PayMongo webhook
// (api/paymongo-webhook.js) marks it paid. A pending booking holds its dates for HOLD_MINUTES, and
// the database itself refuses overlapping bookings (supabase/schema.sql).
export async function POST(request) {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) return json({ error: "Online payment isn't set up yet. Please message us instead." }, 503);

  const input = await request.json().catch(() => null);
  const site = process.env.SITE_URL || new URL(request.url).origin;
  // unguessable, since /api/status answers by ref
  const ref = (prefix) => `${prefix}-${Date.now().toString(36)}${randomBytes(4).toString("hex")}`.toUpperCase();
  const session = input?.type === "order" ? orderSession(input, site, ref("WDO")) : bookingSession(input, site, ref("WDR"));
  if (session.error) return json({ error: session.error }, 400);

  if (hasDb()) {
    const saved = await session.save();
    if (saved.error) return json({ error: saved.error }, saved.status);
  } else {
    console.warn("SUPABASE_* not set: this payment won't be recorded or protected against double-booking");
  }

  const r = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Basic " + Buffer.from(key + ":").toString("base64"),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          payment_method_types: ["gcash", "paymaya", "card", "qrph"],
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          ...session.attributes,
        },
      },
    }),
  });

  const body = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("PayMongo checkout failed", r.status, JSON.stringify(body.errors ?? body));
    // let the dates go again; the guest never reached the payment page
    if (hasDb()) await db(`${session.table}?ref=eq.${session.ref}`, { method: "PATCH", body: { status: "cancelled" } });
    return json({ error: "We couldn't open the payment page. Please try again in a moment." }, 502);
  }
  return json({ url: body.data.attributes.checkout_url, ref: session.ref });
}

function orderSession(input, site, ref) {
  const result = checkOrder(input);
  if (result.error) return result;
  const { lines, order: o, total } = result;
  const when = `${o.mode === "pickup" ? "Pickup" : "Dine-in"} ${o.date} ${fmtTime(o.time)}`;
  return {
    ref,
    table: "orders",
    save: async () => {
      const r = await db("orders", {
        method: "POST",
        body: {
          ref, total, mode: o.mode, ready_date: o.date, ready_time: o.time,
          name: o.name, email: o.email, phone: o.phone, notes: o.notes,
          items: lines.map((l) => ({ label: l.label, unit: l.unit, qty: l.qty })),
        },
      });
      return r.ok ? {} : { error: "We couldn't save your order. Please try again.", status: 500 };
    },
    attributes: {
      line_items: lines.map((l) => ({ name: l.label, amount: l.unit * 100, currency: "PHP", quantity: l.qty })),
      description: `${ref} · ${when} · ${o.name}${o.notes ? ` · Note: ${o.notes}` : ""}`,
      reference_number: ref,
      billing: { name: o.name, email: o.email, phone: o.phone },
      success_url: `${site}/order?order=paid&ref=${ref}`,
      cancel_url: `${site}/order?order=cancelled`,
      metadata: { type: "order", ref },
    },
  };
}

function bookingSession(input, site, ref) {
  const result = checkBooking(input);
  if (result.error) return result;
  const { room, booking: b, price } = result;
  const stay = `${b.checkIn} to ${b.checkOut} · ${price.nights} night${price.nights > 1 ? "s" : ""} · ${b.guests} guest${b.guests > 1 ? "s" : ""}`;
  return {
    ref,
    table: "bookings",
    save: async () => {
      // release holds whose guests walked away from the payment page
      await db(`bookings?status=eq.pending&created_at=lt.${holdCutoff()}`, { method: "PATCH", body: { status: "expired" } });
      const r = await db("bookings", {
        method: "POST",
        body: {
          ref, room_id: room.id, check_in: b.checkIn, check_out: b.checkOut, guests: b.guests,
          name: b.name, email: b.email, phone: b.phone, total: price.total, deposit: price.deposit,
        },
      });
      if (r.code === "23P01") return { error: `Sorry, ${room.name} was just booked for some of those nights. Please pick other dates.`, status: 409 };
      return r.ok ? {} : { error: "We couldn't save your booking. Please try again.", status: 500 };
    },
    attributes: {
      line_items: [{ name: `${room.name}: 50% deposit`, description: stay, amount: price.deposit, currency: "PHP", quantity: 1 }],
      description: `${ref} · ${b.name} · ${stay} · balance ${peso(price.balance)} at check-in`,
      reference_number: ref,
      billing: { name: b.name, email: b.email, phone: b.phone },
      success_url: `${site}/stay?booking=paid&ref=${ref}`,
      cancel_url: `${site}/stay?booking=cancelled`,
      metadata: { type: "booking", ref },
    },
  };
}
