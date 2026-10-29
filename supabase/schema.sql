-- Wander Cafe + B&B: run once in Supabase > SQL Editor.
-- Money is stored in centavos (integers), like PayMongo.

create extension if not exists btree_gist;

create table bookings (
  id          bigint generated always as identity primary key,
  ref         text not null unique,                 -- WDR-..., also PayMongo's reference_number
  room_id     text not null,                        -- id from src/data/rooms.js
  check_in    date not null,
  check_out   date not null check (check_out > check_in),
  guests      int  not null check (guests > 0),
  name        text not null,
  email       text not null,
  phone       text not null,
  total       int  not null,
  deposit     int  not null,
  -- pending:    on the payment page, holding the dates for 30 min
  -- paid:       deposit received (set by the PayMongo webhook)
  -- conflict:   paid after the hold lapsed and someone else took the dates -> refund
  status      text not null default 'pending'
              check (status in ('pending', 'paid', 'checked_in', 'expired', 'conflict', 'cancelled')),
  payment_id  text,
  created_at  timestamptz not null default now(),
  -- the double-booking guard: no two live bookings of one room may overlap (check-out day is free)
  constraint no_double_booking exclude using gist (
    room_id with =,
    daterange(check_in, check_out) with &&
  ) where (status in ('pending', 'paid', 'checked_in'))
);

create table orders (
  id          bigint generated always as identity primary key,
  ref         text not null unique,                 -- WDO-...
  items       jsonb not null,                       -- [{ label, unit, qty }]
  total       int  not null,
  mode        text not null check (mode in ('pickup', 'dine-in')),
  ready_date  date not null,
  ready_time  text not null,                        -- "10:30"
  name        text not null,
  email       text not null,
  phone       text not null,
  notes       text not null default '',
  status      text not null default 'pending'
              check (status in ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_id  text,
  created_at  timestamptz not null default now()
);

create index on orders (ready_date, status);
create index on bookings (check_out, status);

-- Only the server's service key may touch these (RLS on, no policies).
alter table bookings enable row level security;
alter table orders enable row level security;
