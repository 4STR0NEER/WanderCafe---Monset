import { createHash, timingSafeEqual } from "node:crypto";
import { todayPH } from "../src/lib/booking.js";
import { db, hasDb, json } from "./_db.js";

// /api/staff: the staff screen's data. Every call needs `Authorization: Bearer <STAFF_PASSWORD>`.
// ponytail: one shared password, no per-person accounts or rate limiting; use a long random one,
// and move to Supabase Auth if staff ever need separate logins.

// which status staff may set, and the statuses it may come from
const FLOW = {
  orders: { preparing: ["paid"], ready: ["preparing"], completed: ["ready"] },
  bookings: { checked_in: ["paid"], cancelled: ["conflict"] }, // conflict -> cancelled once refunded
};

function authorized(request) {
  const pw = process.env.STAFF_PASSWORD;
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const h = (s) => createHash("sha256").update(s).digest(); // equal-length buffers for timingSafeEqual
  return !!pw && timingSafeEqual(h(given), h(pw));
}

function guard(request) {
  if (!hasDb() || !process.env.STAFF_PASSWORD) return json({ error: "The staff screen isn't set up yet." }, 503);
  if (!authorized(request)) return json({ error: "Wrong password." }, 401);
}

export async function GET(request) {
  const denied = guard(request);
  if (denied) return denied;
  const today = todayPH();
  const [orders, bookings] = await Promise.all([
    db(`orders?status=in.(paid,preparing,ready)&ready_date=gte.${today}&order=ready_date,ready_time`),
    db(`bookings?status=in.(paid,checked_in,conflict)&check_out=gte.${today}&order=check_in`),
  ]);
  if (!orders.ok || !bookings.ok) return json({ error: "Couldn't load. Try again." }, 500);
  return json({ orders: orders.data, bookings: bookings.data, today });
}

export async function PATCH(request) {
  const denied = guard(request);
  if (denied) return denied;
  const { table, id, status } = (await request.json().catch(() => null)) ?? {};
  const from = FLOW[table]?.[status];
  if (!from || !Number.isInteger(id)) return json({ error: "Not allowed." }, 400);
  const r = await db(`${table}?id=eq.${id}&status=in.(${from.join(",")})`, { method: "PATCH", body: { status } });
  if (!r.ok) return json({ error: "Couldn't update. Try again." }, 500);
  if (!r.data.length) return json({ error: "Someone else already updated this." }, 409);
  return json({ row: r.data[0] });
}
