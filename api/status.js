import { db, hasDb, json } from "./_db.js";

// GET /api/status?ref=WDO-...: lets the "thank you" message confirm the webhook has recorded the
// payment. Refs carry 8 random hex characters, and only the status word is returned.
export async function GET(request) {
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!hasDb()) return json({ status: "unknown" });
  if (!/^WD[OR]-[A-Z0-9]{10,}$/.test(ref)) return json({ error: "Bad ref" }, 400);
  const table = ref.startsWith("WDO") ? "orders" : "bookings";
  const r = await db(`${table}?ref=eq.${ref}&select=status`);
  if (!r.ok) return json({ status: "unknown" });
  return json({ status: r.data[0]?.status ?? "missing" });
}
