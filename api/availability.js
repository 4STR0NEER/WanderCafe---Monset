import { todayPH } from "../src/lib/booking.js";
import { db, hasDb, holdCutoff, json } from "./_db.js";

// GET /api/availability: nights already taken, per room, so the booking form can warn early.
// Only dates leave the server, never who booked them.
export async function GET() {
  if (!hasDb()) return json({ taken: [] });
  const live = `or=(status.in.(paid,checked_in),and(status.eq.pending,created_at.gte.${holdCutoff()}))`;
  const r = await db(`bookings?select=room_id,check_in,check_out&check_out=gt.${todayPH()}&${live}&order=check_in`);
  return json({ taken: r.ok ? r.data : [] });
}
