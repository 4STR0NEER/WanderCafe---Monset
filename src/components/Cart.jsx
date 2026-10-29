import { useEffect, useRef, useState } from "react";
import { addToCart, cartSummary, setQty, useCart } from "../lib/cart";
import { peso } from "../lib/booking";
import { defaultChoices, describeLine, fmtTime, MAX_QTY, timeSlots } from "../lib/order";
import PayButton, { field, label, startCheckout } from "./PayButton";
import { Plane } from "./Logo";

// ---- adding things --------------------------------------------------------------------------

// "+" on a menu row. Items with options open the picker; plain items go straight in.
export function AddButton({ item, onPick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        if (item.options) return onPick(item);
        addToCart(item.id, []);
        flyToCart(e.currentTarget);
      }}
      aria-label={`Add ${item.name}`}
      className="grid size-9 shrink-0 place-items-center self-center rounded-full bg-teal-deep text-xl leading-none text-cream transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
    >
      +
    </button>
  );
}

// Choose options and quantity, then add. A native <dialog>: Esc, focus and the backdrop come free.
export function ItemPicker({ item, onClose }) {
  const ref = useRef(null);
  const [choices, setChoices] = useState([]);
  const [qty, setQ] = useState(1);

  useEffect(() => {
    if (!item) return;
    setChoices(defaultChoices(item));
    setQ(1);
    ref.current.showModal();
  }, [item]);

  const line = item && choices.length === (item.options?.length ?? 0) ? describeLine({ itemId: item.id, choices }) : null;

  return (
    <dialog ref={ref} onClose={onClose} className="pop m-auto w-[min(28rem,calc(100%-2rem))] rounded-[2rem] bg-cream p-0 text-espresso shadow-2xl backdrop:bg-espresso/40">
      {item && (
        <form
          method="dialog"
          className="p-6 sm:p-8"
          onSubmit={() => {
            addToCart(item.id, choices, qty);
            // fly from the dialog's button once the dialog has closed
            const from = ref.current.querySelector("[data-add]").getBoundingClientRect();
            requestAnimationFrame(() => flyToCart(from));
          }}
        >
          <h2 className="pr-8 font-display text-2xl font-semibold uppercase">{item.name}</h2>
          {item.desc && <p className="mt-2 text-sm text-espresso/70">{item.desc}</p>}
          {item.options.map((g, gi) => (
            <fieldset key={g.name} className="mt-5">
              <legend className={label}>{g.name}</legend>
              <div className="flex flex-wrap gap-2">
                {g.choices.map((c) => (
                  <label
                    key={c.label}
                    className="cursor-pointer rounded-full border-2 border-espresso/15 px-4 py-2 text-sm font-semibold transition-colors duration-150 has-checked:border-teal-deep has-checked:bg-teal-deep has-checked:text-cream has-focus-visible:ring-2 has-focus-visible:ring-teal"
                  >
                    <input
                      type="radio"
                      name={g.name}
                      className="sr-only"
                      checked={choices[gi] === c.label}
                      onChange={() => setChoices((cs) => cs.map((x, i) => (i === gi ? c.label : x)))}
                    />
                    {c.label}
                    {c.price ? <span className="opacity-75"> +{c.price}</span> : null}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="mt-7 flex items-center gap-4">
            <Stepper value={qty} onChange={setQ} name={item.name} min={1} />
            <button
              data-add
              className="flex-1 rounded-full bg-teal-deep px-5 py-3.5 font-bold text-cream transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              Add · {line ? peso(line.unit * qty * 100) : ""}
            </button>
          </div>
          <button type="button" onClick={() => ref.current.close()} aria-label="Close" className="absolute top-5 right-5 rounded-full p-1 text-2xl leading-none text-espresso/50 hover:text-espresso">
            ×
          </button>
        </form>
      )}
    </dialog>
  );
}

function Stepper({ value, onChange, name, min = 0 }) {
  const btn = "grid size-9 place-items-center rounded-full border-2 border-espresso/15 text-lg leading-none transition-colors duration-150 hover:border-teal disabled:opacity-40";
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`One less ${name}`}>−</button>
      <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={`One more ${name}`}>+</button>
    </div>
  );
}

// A little paper plane flies from what you tapped to the cart pill, then the pill gives a nod.
// Native Web Animations along a sampled curve; skipped for reduced motion.
export function flyToCart(from) {
  const to = document.getElementById("cart-pill");
  if (!to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect ? from.getBoundingClientRect() : from;
  const b = to.getBoundingClientRect();
  const p0 = [a.left + a.width / 2, a.top + a.height / 2];
  const p2 = [b.left + b.width / 2, b.top + b.height / 2];
  const p1 = [(p0[0] + p2[0]) / 2 + 80, Math.min(p0[1], p2[1]) - 140]; // arc up and over
  const at = (t, i) => (1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i];
  const dir = (t, i) => 2 * (1 - t) * (p1[i] - p0[i]) + 2 * t * (p2[i] - p1[i]);

  const el = document.createElement("div");
  el.style.cssText = "position:fixed;left:0;top:0;width:28px;height:24px;margin:-12px 0 0 -14px;z-index:70;pointer-events:none;color:var(--color-teal)";
  el.innerHTML = '<svg viewBox="-22 -10 24 20" fill="currentColor" width="28" height="24"><path d="M0 0L-20-8-13 1Z"/><path d="M0 0-13 1-16 9Z" opacity=".55"/></svg>';
  document.body.append(el);

  const frames = Array.from({ length: 13 }, (_, k) => {
    const t = k / 12;
    const angle = (Math.atan2(dir(t, 1), dir(t, 0)) * 180) / Math.PI;
    return {
      transform: `translate(${at(t, 0)}px, ${at(t, 1)}px) rotate(${angle}deg) scale(${1 - 0.4 * t})`,
      opacity: t === 0 ? 0 : t === 1 ? 0 : 1,
    };
  });
  el.animate(frames, { duration: 750, easing: "cubic-bezier(0.45, 0, 0.25, 1)" }).finished.then(() => {
    el.remove();
    to.animate([{ scale: 1 }, { scale: 1.08 }, { scale: 1 }], { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  });
}

// ---- the cart ---------------------------------------------------------------------------------

// Floating pill at the bottom of /order; opens the drawer.
export function CartPill({ onOpen }) {
  const lines = useCart();
  const { total, count } = cartSummary(lines);
  return (
    <button
      id="cart-pill"
      type="button"
      onClick={onOpen}
      aria-label={`Your order: ${count} item${count === 1 ? "" : "s"}, ${peso(total)}. Open cart`}
      className={`fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-full bg-espresso py-3 pr-3 pl-5 text-cream shadow-2xl transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${count ? "" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <svg viewBox="-22 -10 24 20" aria-hidden="true" fill="currentColor" className="size-5 text-tiffany"><Plane /></svg>
      <span className="font-semibold whitespace-nowrap">
        Your order · {count} item{count === 1 ? "" : "s"}
      </span>
      <span className="rounded-full bg-cream px-4 py-1.5 font-bold text-espresso tabular-nums">{peso(total)}</span>
    </button>
  );
}

// Right-hand sheet with the lines, pickup/dine-in time, contact details and the pay button.
export function CartDrawer({ open, onClose }) {
  const ref = useRef(null);
  const lines = useCart();
  const { total, count } = cartSummary(lines);

  const firstDay = timeSlots(0).length ? 0 : 1; // after closing time, default to tomorrow
  const [form, setForm] = useState(() => ({ mode: "pickup", day: firstDay, time: timeSlots(firstDay)[0], name: "", email: "", phone: "", notes: "" }));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const slots = timeSlots(form.day);
  const set = (patch) => (setError(""), setForm((f) => ({ ...f, ...patch })));

  useEffect(() => {
    if (open) ref.current.showModal();
    else ref.current.close();
  }, [open]);

  // the cart emptied while open (last item removed): close
  useEffect(() => {
    if (open && !count) onClose();
  }, [open, count, onClose]);

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await startCheckout({ type: "order", lines: lines.map(({ itemId, choices, qty }) => ({ itemId, choices, qty })), ...form });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Your order"
      className="sheet m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-cream p-0 text-espresso shadow-2xl backdrop:bg-espresso/40"
    >
      <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-espresso/10 bg-cream px-6 py-5">
          <h2 className="font-display text-2xl font-semibold">Your order</h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="rounded-full p-1 text-2xl leading-none text-espresso/50 hover:text-espresso">×</button>
        </header>

        <ul className="divide-y divide-dashed divide-espresso/20 px-6">
          {lines.map((l) => {
            const d = describeLine(l);
            return (
              <li key={l.key} className="flex items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{d.label}</p>
                  <p className="text-sm text-espresso/60">{peso(d.unit * 100)} each</p>
                </div>
                <Stepper value={l.qty} onChange={(q) => setQty(l.key, q)} name={d.item.name} />
                <span className="w-16 text-right font-semibold tabular-nums">{peso(d.unit * l.qty * 100)}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 space-y-5 border-t border-espresso/10 bg-parchment/40 px-6 py-6">
          <div className="grid grid-cols-2 gap-2 rounded-full bg-espresso/5 p-1">
            {[["pickup", "Pickup"], ["dine-in", "Dine-in"]].map(([v, t]) => (
              <button
                key={v}
                type="button"
                aria-pressed={form.mode === v}
                onClick={() => set({ mode: v })}
                className="rounded-full py-2 text-sm font-bold transition-colors duration-150 aria-pressed:bg-teal-deep aria-pressed:text-cream"
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="day" className={label}>Day</label>
              <select id="day" className={field} value={form.day} onChange={(e) => { const day = Number(e.target.value); set({ day, time: timeSlots(day)[0] }); }}>
                {timeSlots(0).length > 0 && <option value={0}>Today</option>}
                <option value={1}>Tomorrow</option>
              </select>
            </div>
            <div>
              <label htmlFor="time" className={label}>{form.mode === "pickup" ? "Pickup at" : "Table at"}</label>
              <select id="time" className={field} value={form.time} onChange={(e) => set({ time: e.target.value })}>
                {slots.map((s) => <option key={s} value={s}>{fmtTime(s)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="o-name" className={label}>Name</label>
            <input id="o-name" autoComplete="name" className={field} value={form.name} onChange={(e) => set({ name: e.target.value })} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="o-email" className={label}>Email</label>
              <input id="o-email" type="email" autoComplete="email" className={field} value={form.email} onChange={(e) => set({ email: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="o-phone" className={label}>Mobile</label>
              <input id="o-phone" type="tel" autoComplete="tel" placeholder="0917 123 4567" className={field} value={form.phone} onChange={(e) => set({ phone: e.target.value })} required />
            </div>
          </div>
          <div>
            <label htmlFor="o-notes" className={label}>Notes (optional)</label>
            <input id="o-notes" maxLength={200} placeholder="Less ice, no onions…" className={field} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>

        <footer className="sticky bottom-0 mt-auto border-t border-espresso/10 bg-cream px-6 pt-4 pb-6">
          <div className="mb-3 flex justify-between text-lg font-bold text-teal-deep">
            <span>Total</span>
            <span className="tabular-nums">{peso(total)}</span>
          </div>
          <p role="alert" className="mb-2 min-h-5 text-sm font-semibold text-[#a3402a]">{error}</p>
          <PayButton sending={sending}>Pay {peso(total)}</PayButton>
        </footer>
      </form>
    </dialog>
  );
}
