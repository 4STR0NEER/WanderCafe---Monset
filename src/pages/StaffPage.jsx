import { useCallback, useEffect, useState } from "react";
import { ROOMS } from "../data/rooms";
import { peso } from "../lib/booking";
import { fmtTime } from "../lib/order";
import { field, label } from "../components/PayButton";

// /staff: paid orders to prepare and upcoming stays. Not linked anywhere; protected by STAFF_PASSWORD
// (kept in this tab's sessionStorage only). Refreshes every 20 seconds.
const KEY = "wander-staff";
const read = () => {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

const COLUMNS = [
  { status: "paid", title: "New", next: "preparing", action: "Start preparing" },
  { status: "preparing", title: "Preparing", next: "ready", action: "Mark ready" },
  { status: "ready", title: "Ready", next: "completed", action: "Picked up / served" },
];

export default function StaffPage() {
  const [pw, setPw] = useState(read);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("orders");

  const call = useCallback(
    async (method, body) => {
      const r = await fetch("/api/staff", {
        method,
        headers: { authorization: `Bearer ${pw}`, "content-type": "application/json" },
        body: body && JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) {
        try {
          sessionStorage.removeItem(KEY);
        } catch {}
        setPw("");
      }
      if (!r.ok) throw new Error(d.error || "Something went wrong.");
      return d;
    },
    [pw]
  );

  const load = useCallback(() => call("GET").then(setData, (e) => setError(e.message)), [call]);

  useEffect(() => {
    if (!pw) return;
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [pw, load]);

  async function move(table, id, status) {
    setError("");
    try {
      await call("PATCH", { table, id, status });
    } catch (e) {
      setError(e.message);
    }
    load();
  }

  if (!pw)
    return (
      <section className="grid min-h-svh place-items-center px-4 pt-16">
        <form
          className="w-full max-w-sm rounded-[2rem] bg-white/60 p-8 shadow-xl"
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("pw");
            try {
              sessionStorage.setItem(KEY, value);
            } catch {}
            setError("");
            setPw(value);
          }}
        >
          <h1 className="font-display text-3xl font-semibold">Staff</h1>
          <label htmlFor="pw" className={`${label} mt-6`}>Password</label>
          <input id="pw" name="pw" type="password" autoComplete="current-password" className={field} required />
          <p role="alert" className="mt-3 min-h-5 text-sm font-semibold text-[#a3402a]">{error}</p>
          <button className="mt-2 w-full rounded-full bg-teal-deep py-3.5 font-bold text-cream">Open</button>
        </form>
      </section>
    );

  const orders = data?.orders ?? [];
  const bookings = data?.bookings ?? [];
  return (
    <section className="min-h-svh px-4 pt-24 pb-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold">Today at Wander</h1>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-espresso/5 p-1 text-sm font-bold">
            {[["orders", `Orders (${orders.length})`], ["stays", `Stays (${bookings.length})`]].map(([v, t]) => (
              <button key={v} aria-pressed={tab === v} onClick={() => setTab(v)} className="rounded-full px-5 py-2 aria-pressed:bg-teal-deep aria-pressed:text-cream">
                {t}
              </button>
            ))}
          </div>
        </div>
        <p role="alert" className="mt-3 min-h-5 text-sm font-semibold text-[#a3402a]">{error}</p>
        {!data && !error && <p className="mt-6 text-espresso/60">Loading…</p>}

        {data && tab === "orders" && (
          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            {COLUMNS.map((col) => {
              const list = orders.filter((o) => o.status === col.status);
              return (
                <div key={col.status} className="rounded-3xl bg-parchment/50 p-4">
                  <h2 className="px-1 font-bold tracking-wider text-espresso/70 uppercase">
                    {col.title} · {list.length}
                  </h2>
                  <ul className="mt-3 space-y-3">
                    {list.map((o) => (
                      <li key={o.id} className="rounded-2xl bg-cream p-4 shadow-sm">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-xl font-semibold">
                            {o.ready_date !== data.today && "Tomorrow "}
                            {fmtTime(o.ready_time)}
                          </span>
                          <span className="rounded-full bg-tiffany/40 px-2.5 py-0.5 text-xs font-bold uppercase">{o.mode}</span>
                        </div>
                        <p className="mt-1 text-sm text-espresso/70">
                          {o.name} · <a href={`tel:${o.phone}`} className="underline">{o.phone}</a>
                        </p>
                        <ul className="mt-3 space-y-1 text-sm">
                          {o.items.map((it, i) => (
                            <li key={i}>
                              <b>{it.qty}×</b> {it.label}
                            </li>
                          ))}
                        </ul>
                        {o.notes && <p className="mt-2 rounded-xl bg-parchment/60 px-3 py-2 text-sm">Note: {o.notes}</p>}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs text-espresso/50">{o.ref} · {peso(o.total)} paid</span>
                          <button onClick={() => move("orders", o.id, col.next)} className="rounded-full bg-teal-deep px-4 py-2 text-sm font-bold text-cream active:scale-[0.97]">
                            {col.action}
                          </button>
                        </div>
                      </li>
                    ))}
                    {!list.length && <li className="px-1 py-4 text-sm text-espresso/50">Nothing here.</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {data && tab === "stays" && (
          <ul className="mt-4 space-y-3">
            {bookings.map((b) => {
              const room = ROOMS.find((r) => r.id === b.room_id)?.name ?? b.room_id;
              const conflict = b.status === "conflict";
              return (
                <li key={b.id} className={`flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl p-5 ${conflict ? "bg-[#f6ddd5]" : "bg-parchment/50"}`}>
                  <div className="min-w-48">
                    <p className="font-display text-xl font-semibold">{b.check_in} → {b.check_out}</p>
                    <p className="text-sm text-espresso/70">{room} · {b.guests} guest{b.guests > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-espresso/70">
                      <a href={`tel:${b.phone}`} className="underline">{b.phone}</a> · {b.email}
                    </p>
                  </div>
                  <div className="text-sm">
                    {conflict ? (
                      <p className="font-bold text-[#a3402a]">Paid after the dates were taken. Refund or rebook.</p>
                    ) : (
                      <p>
                        Balance due <b>{peso(b.total - b.deposit)}</b>
                      </p>
                    )}
                    <p className="text-xs text-espresso/50">{b.ref}</p>
                  </div>
                  {b.status === "paid" && (
                    <button onClick={() => move("bookings", b.id, "checked_in")} className="rounded-full bg-teal-deep px-4 py-2 text-sm font-bold text-cream">
                      Checked in
                    </button>
                  )}
                  {b.status === "checked_in" && <span className="text-sm font-bold text-teal-deep">Checked in ✓</span>}
                  {conflict && (
                    <button onClick={() => move("bookings", b.id, "cancelled")} className="rounded-full border-2 border-[#a3402a] px-4 py-2 text-sm font-bold text-[#a3402a]">
                      Refunded, remove
                    </button>
                  )}
                </li>
              );
            })}
            {!bookings.length && <li className="py-6 text-espresso/50">No upcoming stays.</li>}
          </ul>
        )}
      </div>
    </section>
  );
}
