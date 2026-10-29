// Run with `npm run check`. Fails loudly if the booking money math or validation breaks.
import assert from "node:assert/strict";
import { checkBooking, nightsBetween, quote, todayPH } from "./booking.js";

const now = Date.parse("2026-11-01T20:00:00Z"); // already Nov 2 in Manila
assert.equal(todayPH(now), "2026-11-02");
assert.equal(nightsBetween("2026-11-02", "2026-11-05"), 3);
assert.equal(nightsBetween("2026-11-05", "2026-11-02"), -3);
assert.equal(nightsBetween("bad", "2026-11-05"), 0);

// 3 nights at 1,800 = 5,400 -> 2,700 deposit, 2,700 balance (centavos)
assert.deepEqual(quote({ rate: 1800 }, 3), { nights: 3, total: 540000, deposit: 270000, balance: 270000 });
// odd totals round the deposit up to a whole peso
assert.deepEqual(quote({ rate: 1801 }, 1), { nights: 1, total: 180100, deposit: 90100, balance: 90000 });

const ok = { roomId: "room-a", checkIn: "2026-11-02", checkOut: "2026-11-04", guests: 2, name: "Ana Cruz", email: "ana@x.ph", phone: "0917 123 4567" };
assert.equal(checkBooking(ok, now).price.deposit, 180000);
assert.match(checkBooking({ ...ok, roomId: "nope" }, now).error, /room/);
assert.match(checkBooking({ ...ok, checkIn: "2026-11-01" }, now).error, /past/);
assert.match(checkBooking({ ...ok, checkOut: "2026-11-02" }, now).error, /after/);
assert.match(checkBooking({ ...ok, guests: 3 }, now).error, /up to 2/);
assert.match(checkBooking({ ...ok, email: "nope" }, now).error, /email/);
assert.match(checkBooking({ ...ok, checkOut: "2026-12-20" }, now).error, /30 nights/);
console.log("booking checks passed");
