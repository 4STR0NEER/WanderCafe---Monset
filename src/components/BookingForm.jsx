import { useEffect, useState } from "react";
import { ROOMS, DEPOSIT_RATE } from "../data/rooms";
import { addDays, checkBooking, nightsBetween, peso, quote, todayPH } from "../lib/booking";
import PayButton, { field, label, startCheckout } from "./PayButton";

const CLASH = "Those dates overlap a booking for this room. Please pick other dates.";
const day = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" });

// Pick a room and dates, see the price, pay the deposit on PayMongo's page.
// Validation and pricing come from lib/booking.js, the same code the server charges with.
export default function BookingForm() {
  const today = todayPH();
  const [form, setForm] = useState({
    roomId: ROOMS[0].id,
    checkIn: addDays(today, 1),
    checkOut: addDays(today, 2),
    guests: 1,
    name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // nights already taken (from the database), to warn before the guest reaches payment.
  // The server re-checks; this is only an early heads-up.
  const [taken, setTaken] = useState([]);
  useEffect(() => {
    fetch("/api/availability")
      .then((r) => (r.ok ? r.json() : { taken: [] }))
      .then((d) => setTaken(d.taken ?? []))
      .catch(() => {});
  }, []);
  const roomTaken = taken.filter((t) => t.room_id === form.roomId);
  const clash = roomTaken.some((t) => form.checkIn < t.check_out && t.check_in < form.checkOut);

  const room = ROOMS.find((r) => r.id === form.roomId);
  const nights = nightsBetween(form.checkIn, form.checkOut);
  const price = nights > 0 ? quote(room, nights) : null;

  const set = (patch) => {
    setError("");
    setForm((f) => {
      const next = { ...f, ...patch };
      // keep check-out after check-in, and guests within the room's limit
      if (nightsBetween(next.checkIn, next.checkOut) < 1) next.checkOut = addDays(next.checkIn, 1);
      const max = ROOMS.find((r) => r.id === next.roomId).maxGuests;
      if (next.guests > max) next.guests = max;
      return next;
    });
  };

  async function submit(e) {
    e.preventDefault();
    const check = checkBooking(form);
    if (check.error) return setError(check.error);
    if (clash) return setError(CLASH);
    setSending(true);
    try {
      await startCheckout(form); // off to PayMongo; the plane has already flown
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-[2rem] bg-cream p-6 text-espresso shadow-2xl sm:p-8">
      <fieldset>
        <legend className={label}>Room</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROOMS.map((r) => (
            <label
              key={r.id}
              className="relative cursor-pointer rounded-2xl border-2 border-espresso/15 p-4 transition-colors duration-150 has-checked:border-teal has-checked:bg-tiffany/25 has-focus-visible:ring-2 has-focus-visible:ring-teal"
            >
              <input
                type="radio"
                name="room"
                value={r.id}
                checked={form.roomId === r.id}
                onChange={() => set({ roomId: r.id })}
                className="sr-only"
              />
              {r.sample && (
                <span className="absolute top-3 right-3 rounded-full bg-parchment px-2 py-0.5 text-[0.6rem] font-bold tracking-wider uppercase">
                  Sample
                </span>
              )}
              <span className="block font-display text-lg font-semibold">{r.name}</span>
              <span className="block text-sm text-espresso/70">
                {r.bed} · sleeps {r.maxGuests}
              </span>
              <span className="mt-2 block font-semibold text-teal-deep">
                {peso(r.rate * 100)}
                <span className="text-sm font-normal text-espresso/60"> / night</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_0.7fr]">
        <div>
          <label htmlFor="in" className={label}>Check-in</label>
          <input id="in" type="date" min={today} value={form.checkIn} onChange={(e) => set({ checkIn: e.target.value })} className={field} required />
        </div>
        <div>
          <label htmlFor="out" className={label}>Check-out</label>
          <input id="out" type="date" min={addDays(form.checkIn, 1)} value={form.checkOut} onChange={(e) => set({ checkOut: e.target.value })} className={field} required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="guests" className={label}>Guests</label>
          <select id="guests" value={form.guests} onChange={(e) => set({ guests: Number(e.target.value) })} className={field}>
            {Array.from({ length: room.maxGuests }, (_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {roomTaken.length > 0 && (
        <p className={`mt-3 text-sm ${clash ? "font-semibold text-[#a3402a]" : "text-espresso/60"}`}>
          {clash ? CLASH : "Already booked:"}{" "}
          {roomTaken.map((t) => `${day(t.check_in)} → ${day(t.check_out)}`).join(" · ")}
          {!clash && " (check-out days are free)"}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={label}>Full name</label>
          <input id="name" autoComplete="name" value={form.name} onChange={(e) => set({ name: e.target.value })} className={field} required />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={field} required />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Mobile</label>
          <input id="phone" type="tel" autoComplete="tel" placeholder="0917 123 4567" value={form.phone} onChange={(e) => set({ phone: e.target.value })} className={field} required />
        </div>
      </div>

      {price && (
        <dl className="mt-6 space-y-1.5 border-t border-dashed border-espresso/25 pt-5 text-sm">
          <Row k={`${peso(room.rate * 100)} × ${nights} night${nights > 1 ? "s" : ""}`} v={peso(price.total)} />
          <Row k="Balance at check-in" v={peso(price.balance)} muted />
          <Row k={`Pay now (${DEPOSIT_RATE * 100}% deposit)`} v={peso(price.deposit)} strong />
        </dl>
      )}

      <p role="alert" className="mt-4 min-h-5 text-sm font-semibold text-[#a3402a]">{error}</p>

      <div className="mt-2">
        <PayButton sending={sending}>{price ? `Pay ${peso(price.deposit)} deposit` : "Pay deposit"}</PayButton>
      </div>
    </form>
  );
}

function Row({ k, v, muted, strong }) {
  return (
    <div className={`flex justify-between ${muted ? "text-espresso/60" : ""} ${strong ? "pt-1 text-base font-bold text-teal-deep" : ""}`}>
      <dt>{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
