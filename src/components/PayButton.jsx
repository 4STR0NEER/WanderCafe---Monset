import { Plane } from "./Logo";

// Full-width pay button; its paper plane takes off while we open PayMongo.
export default function PayButton({ sending, children }) {
  return (
    <>
      <button
        type="submit"
        disabled={sending}
        className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-teal-deep px-6 py-4 font-bold text-cream transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-wait"
      >
        {sending ? "Opening secure payment…" : children}
        <svg
          viewBox="-22 -10 24 20"
          aria-hidden="true"
          fill="currentColor"
          className={`size-5 transition-[translate,opacity] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${sending ? "translate-x-40 -translate-y-8 opacity-0" : ""}`}
        >
          <Plane />
        </svg>
      </button>
      <p className="mt-3 text-center text-xs text-espresso/60">GCash, Maya, card or QR Ph · secured by PayMongo</p>
    </>
  );
}

// shared form styles for the booking form and the cart
export const field =
  "w-full rounded-xl border border-espresso/20 bg-white/70 px-3.5 py-2.5 text-espresso outline-none transition-[border-color,box-shadow] duration-150 focus:border-teal focus:ring-2 focus:ring-tiffany/60";
export const label = "mb-1.5 block text-xs font-bold tracking-wider text-espresso/70 uppercase";

// POST to /api/checkout and go to PayMongo. Throws with a message the guest can read.
export async function startCheckout(payload) {
  const r = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.url) throw new Error(data.error || "Something went wrong. Please try again.");
  window.location.assign(data.url);
}
