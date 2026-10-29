// Supabase, spoken to directly over its REST API (PostgREST) with the service key: no SDK needed.
// Files starting with "_" are helpers, not endpoints, on Vercel. Schema: supabase/schema.sql.
// Tables have row-level security on and no policies, so only this server key can read or write them.

export const hasDb = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

// db("orders?ref=eq.X", { method: "PATCH", body: {...} }) -> { ok, status, data, code }
export async function db(path, { method = "GET", body } = {}) {
  const key = process.env.SUPABASE_SERVICE_KEY;
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: body && JSON.stringify(body),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) console.error("supabase", method, path.split("?")[0], r.status, data?.code, data?.message);
  return { ok: r.ok, status: r.status, data, code: data?.code };
}

export const json = (data, status = 200) => Response.json(data, { status });

// how long an unpaid booking holds its dates while the guest is on the payment page
export const HOLD_MINUTES = 30;
export const holdCutoff = () => new Date(Date.now() - HOLD_MINUTES * 60e3).toISOString();
