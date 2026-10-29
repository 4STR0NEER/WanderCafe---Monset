import { DRINKS, FOOD, HOURS } from "../data/menu.js";
import { addDays, todayPH } from "./booking.js";

// Shared by the cart (to show prices) and api/checkout.js (to charge them).
// A cart line is { itemId, choices: [label per option group], qty }; prices always come from menu.js.

const ITEMS = new Map([...FOOD, ...DRINKS].flatMap((c) => c.items.map((i) => [i.id, i])));
export const findItem = (id) => ITEMS.get(id);

export const MAX_QTY = 20;
const MAX_LINES = 30;

export const lineKey = (itemId, choices) => [itemId, ...choices].join("|");
export const defaultChoices = (item) => (item.options ?? []).map((g) => g.choices[0].label);

// Price and receipt label for one line, or null if it no longer matches the menu.
export function describeLine({ itemId, choices = [] }) {
  const item = ITEMS.get(itemId);
  const groups = item?.options ?? [];
  if (!item || choices.length !== groups.length) return null;
  let unit = item.price;
  const shown = [];
  for (const [i, g] of groups.entries()) {
    const c = g.choices.find((c) => c.label === choices[i]);
    if (!c) return null;
    unit += c.price ?? 0;
    if (!c.label.startsWith("No ")) shown.push(c.label);
  }
  return { item, unit, label: shown.length ? `${item.name} (${shown.join(", ")})` : item.name };
}

// minutes past midnight in Manila
const minutesPH = (now) => {
  const d = new Date(now + 8 * 36e5);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};
const toMin = (hhmm) => +hhmm.slice(0, 2) * 60 + +hhmm.slice(3);
const toHHMM = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// Pickup / dine-in times for today (day 0) or tomorrow (day 1), every 15 min while open,
// at least `leadMinutes` from now so the kitchen has time.
export function timeSlots(day, now = Date.now()) {
  const earliest = day === 0 ? minutesPH(now) + HOURS.leadMinutes : 0;
  const out = [];
  for (let m = toMin(HOURS.open); m <= toMin(HOURS.close) - HOURS.stepMinutes; m += HOURS.stepMinutes)
    if (m >= earliest) out.push(toHHMM(m));
  return out;
}

export const fmtTime = (hhmm) => {
  const m = toMin(hhmm);
  const h = Math.floor(m / 60) % 12 || 12;
  return `${h}:${String(m % 60).padStart(2, "0")} ${m < 720 ? "AM" : "PM"}`;
};

// Validates an order request. Returns { error } or { lines, order, total } (total in centavos).
export function checkOrder(input, now = Date.now()) {
  const o = input ?? {};
  if (!Array.isArray(o.lines) || o.lines.length === 0) return { error: "Your order is empty." };
  if (o.lines.length > MAX_LINES) return { error: "That's a big order! Please message us for catering." };

  const lines = [];
  for (const l of o.lines) {
    const d = describeLine({ itemId: l?.itemId, choices: Array.isArray(l?.choices) ? l.choices : [] });
    if (!d) return { error: "Part of your order isn't on the menu anymore. Please remove it and try again." };
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY) return { error: `Up to ${MAX_QTY} of each item.` };
    lines.push({ ...d, qty: l.qty });
  }

  if (o.mode !== "pickup" && o.mode !== "dine-in") return { error: "Choose pickup or dine-in." };
  if (o.day !== 0 && o.day !== 1) return { error: "Choose today or tomorrow." };
  if (!timeSlots(o.day, now).includes(o.time)) return { error: "That time isn't available anymore. Please pick another." };

  const name = String(o.name ?? "").trim();
  const email = String(o.email ?? "").trim();
  const phone = String(o.phone ?? "").trim();
  const notes = String(o.notes ?? "").trim();
  if (name.length < 2 || name.length > 80) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { error: "Please enter a valid email." };
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return { error: "Please enter a valid mobile number." };
  if (notes.length > 200) return { error: "Keep notes under 200 characters." };

  const total = lines.reduce((sum, l) => sum + l.unit * l.qty, 0) * 100;
  const date = addDays(todayPH(now), o.day);
  return { lines, order: { mode: o.mode, date, time: o.time, name, email, phone, notes }, total };
}
