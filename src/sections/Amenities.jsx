import { motion } from "motion/react";
import { Icon, reveal } from "../components/ui";
import { AMENITIES } from "../data/place";

export default function Amenities() {
  return (
    <section id="amenities" className="scroll-mt-16 bg-teal-deep px-4 py-24 text-cream sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div {...reveal} className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-tiffany uppercase">Amenities</p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-tight font-semibold">
              The little things, covered.
            </h2>
          </div>
          <p className="max-w-xs text-cream/70">Everything you need for a slow stay, with the cafe right there for your first coffee.</p>
        </motion.div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-[2rem] bg-cream/15 sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES.map((a, i) => (
            <motion.li
              key={a.name}
              {...reveal}
              transition={{ ...reveal.transition, delay: (i % 4) * 0.05 }}
              className="bg-teal-deep p-7"
            >
              <span className="grid size-12 place-items-center rounded-full bg-tiffany/15 text-tiffany">
                <Icon name={a.icon} />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{a.name}</h3>
              <p className="mt-1 text-sm text-cream/70">{a.note}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
