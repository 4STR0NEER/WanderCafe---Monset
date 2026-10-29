import { useSyncExternalStore } from "react";
import { describeLine, lineKey, MAX_QTY } from "./order.js";

// The cart: a tiny store any component can read with useCart(). It's saved in this browser
// (localStorage), so it survives a refresh or a trip to another page. Lines that no longer match
// the menu are dropped when it loads.
const KEY = "wander-cart";
const listeners = new Set();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) ?? [];
    return saved.filter((l) => describeLine(l));
  } catch {
    return [];
  }
}

let lines = load();

function save(next) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode etc.: the cart still works for this visit
  }
  listeners.forEach((fn) => fn());
}

export const useCart = () =>
  useSyncExternalStore(
    (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    () => lines
  );

export function addToCart(itemId, choices, qty = 1) {
  const key = lineKey(itemId, choices);
  const found = lines.find((l) => l.key === key);
  save(
    found
      ? lines.map((l) => (l === found ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
      : [...lines, { key, itemId, choices, qty }]
  );
}

export const setQty = (key, qty) =>
  save(qty < 1 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)));

export const clearCart = () => save([]);

// total in centavos and item count, for the cart pill and drawer
export function cartSummary(list) {
  let total = 0;
  let count = 0;
  for (const l of list) {
    total += describeLine(l).unit * l.qty * 100;
    count += l.qty;
  }
  return { total, count };
}
