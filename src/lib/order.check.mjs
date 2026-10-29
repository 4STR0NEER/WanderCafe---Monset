// Run with `npm run check`. Fails loudly if order pricing or validation breaks.
import assert from "node:assert/strict";
import { checkOrder, describeLine, fmtTime, timeSlots } from "./order.js";

// 9:00 AM in Manila
const now = Date.parse("2026-11-02T01:00:00Z");

assert.deepEqual(describeLine({ itemId: "ramen", choices: ["Spicy", "Add cheese slice"] }).unit, 140);
assert.equal(describeLine({ itemId: "ramen", choices: ["Mild", "No cheese"] }).label, "Ramen (Mild)");
assert.equal(describeLine({ itemId: "signature-breakfast", choices: ["Juice"] }).unit, 345);
assert.equal(describeLine({ itemId: "coffee-latte", choices: [] }).unit, 130);
assert.equal(describeLine({ itemId: "ramen", choices: ["Spicy"] }), null); // missing a group
assert.equal(describeLine({ itemId: "ramen", choices: ["Hot", "No cheese"] }), null); // unknown choice
assert.equal(describeLine({ itemId: "nope" }), null);

const today = timeSlots(0, now);
assert.equal(today[0], "09:30"); // 9:00 + 20 min lead, next 15-min slot
assert.equal(today.at(-1), "19:45");
assert.equal(timeSlots(1, now)[0], "07:00");
assert.equal(fmtTime("13:05"), "1:05 PM");
assert.equal(fmtTime("00:30"), "12:30 AM");

const ok = {
  lines: [
    { itemId: "ramen", choices: ["Spicy", "Add cheese slice"], qty: 2 },
    { itemId: "coffee-latte", choices: [], qty: 1 },
  ],
  mode: "pickup", day: 0, time: "10:00", name: "Ana Cruz", email: "ana@x.ph", phone: "0917 123 4567",
};
const r = checkOrder(ok, now);
assert.equal(r.total, (140 * 2 + 130) * 100);
assert.equal(r.order.date, "2026-11-02");
assert.match(checkOrder({ ...ok, lines: [] }, now).error, /empty/);
assert.match(checkOrder({ ...ok, time: "09:15" }, now).error, /time/);
assert.match(checkOrder({ ...ok, lines: [{ itemId: "ramen", choices: ["Spicy", "No cheese"], qty: 0 }] }, now).error, /Up to/);
assert.match(checkOrder({ ...ok, lines: [{ itemId: "ramen", choices: [], qty: 1 }] }, now).error, /menu/);
assert.match(checkOrder({ ...ok, mode: "delivery" }, now).error, /pickup/);
// a price sent by the browser is ignored; the menu price is charged
assert.equal(checkOrder({ ...ok, lines: [{ itemId: "coffee-latte", choices: [], price: 1, qty: 1 }] }, now).total, 13000);
console.log("order checks passed");
