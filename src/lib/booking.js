import { DEPOSIT_RATE, ROOMS } from "../data/rooms.js";

// Shared by the booking form (to show the price) and api/checkout.js (to charge it).
// The server never trusts a price from the browser; it recomputes it with this.

export const MAX_NIGHTS = 30;
const DAY = 864e5;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

// today's date in Manila (UTC+8) as yyyy-mm-dd, so "today" matches the guest's and the cafe's calendar
export const todayPH = (now = Date.now()) => new Date(now + 8 * 36e5).toISOString().slice(0, 10);

export const addDays = (iso, n) => new Date(Date.parse(iso) + n * DAY).toISOString().slice(0, 10);

export function nightsBetween(checkIn, checkOut) {
  if (!ISO.test(checkIn) || !ISO.test(checkOut)) return 0;
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / DAY);
}

// Amounts in centavos, the unit PayMongo charges in. Deposit rounds up to the next whole peso.
export function quote(room, nights) {
  const total = room.rate * nights * 100;
  const deposit = Math.ceil((total * DEPOSIT_RATE) / 100) * 100;
  return { nights, total, deposit, balance: total - deposit };
}

export const peso = (centavos) =>
  "₱" + (centavos / 100).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// Validates a booking request. Returns { error } or { room, booking, price }.
export function checkBooking(input, now = Date.now()) {
  const b = input ?? {};
  const room = ROOMS.find((r) => r.id === b.roomId);
  if (!room) return { error: "Please choose a room." };

  const nights = nightsBetween(b.checkIn, b.checkOut);
  if (b.checkIn < todayPH(now)) return { error: "Check-in can't be in the past." };
  if (nights < 1) return { error: "Check-out must be after check-in." };
  if (nights > MAX_NIGHTS) return { error: `Stays are up to ${MAX_NIGHTS} nights online. Message us for longer.` };

  const guests = Number(b.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > room.maxGuests)
    return { error: `${room.name} sleeps up to ${room.maxGuests}.` };

  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  if (name.length < 2 || name.length > 80) return { error: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { error: "Please enter a valid email." };
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return { error: "Please enter a valid mobile number." };

  return {
    room,
    booking: { roomId: room.id, checkIn: b.checkIn, checkOut: b.checkOut, guests, name, email, phone },
    price: quote(room, nights),
  };
}
