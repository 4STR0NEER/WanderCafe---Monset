import { motion } from "motion/react";
import { Link } from "../lib/router";

// Landing-page taster, straight from the printed menus. The full menu lives on /order.
const DISHES = [
  { img: "breakfast", name: "Wander Signature Breakfast", price: 295, desc: "Fluffy eggs, toasted bread, crispy bacon, juicy sausage, tomato, beans, fresh fruit & creamy coleslaw." },
  { img: "waffle", name: "Waffle Hearts", price: 165, desc: "5 golden hearts with choco drizzle, a scoop of ice cream, granola & powdered sugar." },
  { img: "ramen", name: "Special Ramen", price: 159, desc: "Savory ramen in a rich broth topped with a boiled egg, a slice of spam, and herbs." },
  { img: "carbonara", name: "Creamy Carbonara", price: 229, desc: "Classic and creamy pasta with bacon, egg, and parmesan cheese." },
];

const COFFEE = [
  ["Espresso", 90], ["Americano", 105], ["Latte", 130], ["Spanish", 139],
  ["Vietnamese", 159], ["Caramel Macchiato", 159], ["Orange Americano", 155], ["Mango Latte", 165],
];

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

// The inky price blob from the pasta and bowls menus
export function Price({ value, label }) {
  return (
    <div
      className="grid size-16 place-items-center sm:size-20 bg-teal-deep text-center leading-none text-cream shadow-lg"
      style={{ borderRadius: "58% 42% 55% 45% / 48% 58% 42% 52%" }}
      aria-label={`${label}, ${value} pesos`}
    >
      <div>
        <div className="font-display text-xl font-semibold sm:text-2xl">{value}</div>
        <div className="mt-0.5 text-[0.6rem] font-bold tracking-widest">PHP</div>
      </div>
    </div>
  );
}

export default function Kitchen() {
  return (
    <section id="kitchen" className="scroll-mt-20 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.h2 {...reveal} className="font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-tight font-semibold">
          Simple ingredients. <span className="brush">Big comfort.</span>
        </motion.h2>

        <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
          {DISHES.map((d, i) => (
            <motion.article key={d.name} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }}>
              <div className="relative">
                <img
                  src={`/food/${d.img}.webp`}
                  alt={d.name}
                  loading="lazy"
                  className="aspect-square w-full rounded-full object-cover shadow-[0_24px_40px_-18px_rgb(74_52_40/0.45)]"
                />
                <div className="absolute -right-1 -bottom-2">
                  <Price value={d.price} label={d.name} />
                </div>
              </div>
              <h3 className="mt-6 font-display text-base font-semibold uppercase sm:text-xl">{d.name}</h3>
              <div className="mt-2 h-px w-16 bg-teal" />
              <p className="mt-3 text-sm leading-relaxed text-espresso/75">{d.desc}</p>
            </motion.article>
          ))}
        </div>

        {/* retro coffee card, after the "Wander Cafe" drinks menu */}
        <motion.div
          {...reveal}
          className="relative mt-24 overflow-hidden rounded-[2rem] border-2 border-teal-deep bg-cream p-8 sm:p-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-48 md:block"
            style={{ background: "repeating-linear-gradient(90deg, var(--color-tiffany) 0 22px, transparent 22px 44px)" }}
          />
          <div className="relative md:max-w-[calc(100%-13rem)]">
            <h3 className="font-display text-3xl font-semibold text-teal-deep italic">Coffee Drinks:</h3>
            <ul className="mt-6 grid gap-x-12 gap-y-3 sm:grid-cols-2">
              {COFFEE.map(([name, price]) => (
                <li key={name} className="flex items-baseline gap-3 font-display text-lg text-teal-deep">
                  <span>{name}</span>
                  <span className="flex-1 border-b-2 border-dotted border-teal-deep/40" />
                  <span className="tabular-nums">Php {price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-espresso/70">Plus signatures, fruit shakes and matcha.</p>
          </div>
        </motion.div>

        <motion.div {...reveal} className="mt-14 flex justify-center">
          <Link
            to="/order"
            className="rounded-full bg-teal-deep px-7 py-4 font-bold text-cream transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            See the full menu &amp; order ahead
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
