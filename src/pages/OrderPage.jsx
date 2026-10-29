import { useState } from "react";
import { motion } from "motion/react";
import { AddButton, CartDrawer, CartPill, ItemPicker } from "../components/Cart";
import Flight from "../components/Flight";
import { Price, reveal } from "../components/ui";
import { DRINKS, FOOD } from "../data/menu";

const STEPS = [
  ["Pick from the menu", "Breakfast, bowls, pasta, coffee. Add it to your order."],
  ["Pay ahead", "GCash, Maya or card, through PayMongo. Paid in full, no cash at the counter."],
  ["Walk in, it's ready", "Choose a pickup or dine-in time and we'll have it waiting."],
];

const ROUTE = "M20 150 C 140 40 260 40 380 100 C 520 170 600 170 700 100 C 800 30 900 40 990 70";

// /order: the full menu with a cart. Tap + to add, the pill at the bottom opens the cart.
export default function OrderPage() {
  const [picking, setPicking] = useState(null); // item whose options are being chosen
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <section className="px-4 pt-28 sm:px-8 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[0.3em] text-teal-deep uppercase">The Cafe</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-tight font-semibold">
            Order ahead, <span className="brush">skip the wait.</span>
          </h1>
          <Flight d={ROUTE} viewBox="0 0 1000 200" size={2} className="mt-8 hidden w-full text-teal md:block" />
          <ol className="mt-10 grid gap-8 md:mt-0 md:grid-cols-3">
            {STEPS.map(([title, body], i) => (
              <li key={title}>
                <span className="font-display text-4xl font-semibold text-tiffany">0{i + 1}</span>
                <h2 className="mt-1 font-display text-xl font-semibold">{title}</h2>
                <p className="mt-1.5 text-espresso/75">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* category chips: native anchors, smooth-scrolled by CSS */}
      <nav
        aria-label="Menu categories"
        className="sticky top-16 z-30 mt-14 border-y border-espresso/10 bg-cream/90 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-8">
          {[...FOOD, { id: "drinks", name: "Drinks" }].map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="shrink-0 rounded-full border border-teal-deep/30 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-teal-deep transition-colors duration-150 hover:bg-tiffany/40"
            >
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-24 px-4 py-20 sm:px-8">
        {FOOD.map((c) => (
          <motion.section key={c.id} id={c.id} {...reveal} className="scroll-mt-36">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight font-semibold uppercase">
                  <span className="brush">{c.name}</span>
                </h2>
                {c.note && <p className="mt-3 text-espresso/70">({c.note})</p>}
                <ul className="mt-8 grid gap-x-12 gap-y-7 lg:grid-cols-2">
                  {c.items.map((it) => (
                    <li key={it.id}>
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-display text-lg font-semibold uppercase">{it.name}</h3>
                        <span className="flex-1 border-b-2 border-dotted border-espresso/25" />
                        <span className="font-display text-lg font-semibold text-teal-deep tabular-nums">₱{it.price}</span>
                        <AddButton item={it} onPick={setPicking} />
                      </div>
                      {it.desc && <p className="mt-1 max-w-prose text-sm leading-relaxed text-espresso/70">{it.desc}</p>}
                    </li>
                  ))}
                </ul>
              </div>
              {c.img && (
                <div className="relative mx-auto w-48 md:w-60">
                  <img
                    src={`/food/${c.img}.webp`}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-full object-cover shadow-[0_24px_40px_-18px_rgb(74_52_40/0.45)]"
                  />
                  {c.items.length === 1 && (
                    <div className="absolute -right-2 -bottom-2">
                      <Price value={c.items[0].price} label={c.items[0].name} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.section>
        ))}

        {/* drinks in the retro "Wander Cafe" card */}
        <motion.section
          id="drinks"
          {...reveal}
          className="relative scroll-mt-36 overflow-hidden rounded-[2rem] border-2 border-teal-deep p-8 sm:p-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-32 xl:block"
            style={{ background: "repeating-linear-gradient(90deg, var(--color-tiffany) 0 18px, transparent 18px 36px)" }}
          />
          <div className="relative grid gap-12 md:grid-cols-3 xl:mr-36">
            {DRINKS.map((g) => (
              <div key={g.id}>
                <h2 className="font-display text-2xl font-semibold text-teal-deep italic">{g.name}:</h2>
                <ul className="mt-5 space-y-2.5">
                  {g.items.map((d) => (
                    <li key={d.id} className="flex items-baseline gap-2 font-display text-teal-deep">
                      <span>{d.name}</span>
                      <span className="flex-1 border-b-2 border-dotted border-teal-deep/30" />
                      <span className="tabular-nums">₱{d.price}</span>
                      <AddButton item={d} onPick={setPicking} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <CartPill onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ItemPicker item={picking} onClose={() => setPicking(null)} />
    </>
  );
}
