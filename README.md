# Wander Cafe + B&B

Find your pause. Landing page, online ordering (paid in full) and B&B booking (50% deposit), paid through PayMongo.

| Page | What |
|---|---|
| `/` | Landing: the cafe and the B&B |
| `/order` | Full menu, cart, pickup / dine-in checkout |
| `/stay` | Room booking with deposit |
| `/staff` | Staff screen: orders to prepare, upcoming stays (password) |

Stack: Vite + React + Tailwind v4, anime.js / Motion for animation, Vercel functions in `api/`, Supabase (Postgres) for orders and bookings.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything degrades politely without keys
npm run dev
npm run check                # money, validation and webhook-signature checks
```

## Where things live

- `src/data/menu.js`: the menu, item options, opening hours (**placeholder hours**)
- `src/data/rooms.js`: rooms and rates (**placeholder rooms**), deposit rate
- `src/lib/order.js`, `src/lib/booking.js`: pricing and validation, shared by the page and the server
- `api/checkout.js`: creates the PayMongo Checkout Session, saves the order/booking as `pending`
- `api/paymongo-webhook.js`: the only place anything becomes `paid` (signature-checked)
- `supabase/schema.sql`: tables, plus the constraint that makes double-booking impossible

## Go live

1. **Supabase**: create a project, run `supabase/schema.sql` in the SQL Editor, copy the project URL and the `service_role` key into `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`.
2. **PayMongo keys**: Developers > API keys, `PAYMONGO_SECRET_KEY` (`sk_test_` first, `sk_live_` after activation).
3. **Webhook**: register `https://<your-domain>/api/paymongo-webhook` for `checkout_session.payment.paid`:
   ```bash
   curl https://api.paymongo.com/v1/webhooks -u sk_test_xxx: \
     -H "content-type: application/json" \
     -d '{"data":{"attributes":{"url":"https://<your-domain>/api/paymongo-webhook","events":["checkout_session.payment.paid"]}}}'
   ```
   Put the returned `secret_key` in `PAYMONGO_WEBHOOK_SECRET`. Test and live mode need separate webhooks.
4. **Staff**: set `STAFF_PASSWORD` to something long and random; share `/staff` with the team.
5. Add all of the above in Vercel > Settings > Environment Variables and redeploy.
6. Before launch: real rooms, rates, photos, opening hours, address and contact details.

## Known limits

- One shared staff password, no per-person logins or rate limiting.
- A booking holds its dates for 30 minutes while the guest is on the payment page. If they pay later and someone else took the dates meanwhile, the booking shows on `/staff` as a **conflict** to refund or rebook.
- The staff screen refreshes every 20 seconds (no live push).
