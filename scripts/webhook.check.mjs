// Run with `npm run check`. The webhook must accept PayMongo's signature and reject everything else.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verify } from "../api/paymongo-webhook.js";

const secret = "whsk_test";
const now = 1_800_000_000_000;
const t = now / 1000;
const raw = JSON.stringify({ data: { attributes: { livemode: false, type: "checkout_session.payment.paid" } } });
const sign = (body, ts = t, key = secret) => createHmac("sha256", key).update(`${ts}.${body}`).digest("hex");

assert.ok(verify(raw, `t=${t},te=${sign(raw)},li=`, secret, now));
assert.equal(verify(raw, `t=${t},te=${sign(raw, t, "wrong")},li=`, secret, now), null); // wrong key
assert.equal(verify(raw + " ", `t=${t},te=${sign(raw)},li=`, secret, now), null); // body tampered
assert.equal(verify(raw, `t=${t - 600},te=${sign(raw, t - 600)},li=`, secret, now), null); // replayed
assert.equal(verify(raw, `t=${t},te=,li=${sign(raw)}`, secret, now), null); // live sig on a test event
assert.equal(verify(raw, null, secret, now), null);
console.log("webhook checks passed");
