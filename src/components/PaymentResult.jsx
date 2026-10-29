import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mark } from "./Logo";
import { clearCart } from "../lib/cart";

const MESSAGES = {
  "booking:paid": ["You're booked. See you soon!", "Deposit received{ref}. Your receipt is on its way by email; the balance is settled at check-in."],
  "booking:cancelled": ["Payment cancelled", "No charge was made and your room isn't booked yet. You can try again anytime."],
  "order:paid": ["Order placed. Thank you!", "Payment received{ref}. We'll have it ready at the time you picked; your receipt is on its way by email."],
  "order:cancelled": ["Payment cancelled", "No charge was made. Your order is still in the cart whenever you're ready."],
  confirming: ["Confirming your payment…", "Just a moment while PayMongo lets us know."],
  conflict: ["We need to sort out your dates", "Your deposit arrived{ref}, but those nights were taken while you were paying. We'll contact you to rebook or refund in full."],
  waiting: ["Payment still confirming", "PayMongo hasn't confirmed it yet{ref}. Your receipt email is the proof of payment; message us if it doesn't arrive."],
};

// PayMongo sends guests back to /stay?booking=paid|cancelled or /order?order=paid|cancelled (&ref=...).
// A "paid" return is only trusted once /api/status says the webhook recorded it.
export default function PaymentResult() {
  const [query] = useState(() => {
    const p = new URLSearchParams(location.search);
    const kind = p.has("order") ? "order" : "booking";
    return { key: `${kind}:${p.get(kind)}`, ref: p.get("ref") };
  });
  const known = !!MESSAGES[query.key];
  const [shown, setShown] = useState(query.key.endsWith(":paid") && query.ref ? "confirming" : query.key);
  const [open, setOpen] = useState(known);

  useEffect(() => {
    if (query.key === "order:paid") clearCart(); // they left PayMongo through the success door
    if (shown !== "confirming") return;
    let tries = 0;
    let timer;
    const poll = async () => {
      const { status } = await fetch(`/api/status?ref=${encodeURIComponent(query.ref)}`)
        .then((r) => r.json())
        .catch(() => ({ status: "unknown" }));
      if (status === "pending" || status === "missing") {
        // the webhook usually lands within seconds; give it ~12s
        if (++tries >= 6) return setShown("waiting");
        timer = setTimeout(poll, 2000);
        return;
      }
      if (status === "conflict") return setShown("conflict");
      if (status === "cancelled" || status === "expired") return setShown("waiting");
      setShown(query.key); // paid (or further along), or "unknown" when no database is set up
    };
    poll();
    return () => clearTimeout(timer);
  }, [query, shown]);

  const close = () => {
    setOpen(false);
    history.replaceState(null, "", location.pathname + location.hash);
  };

  if (!known) return null;
  const ref = query.ref ? ` (ref ${query.ref})` : "";
  const [title, body] = MESSAGES[shown].map((m) => m.replace("{ref}", ref));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-start gap-4 rounded-3xl bg-cream p-5 text-espresso shadow-2xl ring-1 ring-espresso/10"
        >
          <Mark className={`size-14 shrink-0 text-teal ${shown === "confirming" ? "animate-pulse" : ""}`} />
          <div className="flex-1">
            <p className="font-display text-xl font-semibold">{title}</p>
            <p className="mt-1 text-sm text-espresso/75">{body}</p>
          </div>
          <button onClick={close} aria-label="Close" className="-m-1 rounded-full p-1 text-xl leading-none text-espresso/50 hover:text-espresso">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
