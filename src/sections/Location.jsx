import { motion } from "motion/react";
import { Icon, reveal } from "../components/ui";
import { kmFrom, LOCATION, SPOTS } from "../data/place";

// Google's keyless embed: no API key, no script, just an iframe at the pin.
const EMBED = `https://maps.google.com/maps?q=${LOCATION.lat},${LOCATION.lng}&z=14&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;
const spotUrl = (s) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;

export default function Location() {
  return (
    <section id="location" className="scroll-mt-16 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div {...reveal}>
          <p className="text-xs font-bold tracking-[0.3em] text-teal-deep uppercase">Find us</p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-tight font-semibold">
            Wander off, <span className="brush">then wander back.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <motion.div {...reveal}>
            <div className="overflow-hidden rounded-[2rem] border-2 border-teal-deep/20 bg-parchment shadow-[0_28px_50px_-30px_rgb(74_52_40/0.5)]">
              <iframe
                title={`Map: Wander Cafe + B&B, ${LOCATION.area}`}
                src={EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-[4/3] w-full border-0 lg:aspect-auto lg:h-[30rem]"
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="flex items-center gap-2 font-semibold">
                <Icon name="pin" className="size-5 text-teal" /> {LOCATION.area}
              </p>
              <div className="flex gap-3">
                <a href={DIRECTIONS} target="_blank" rel="noreferrer" className="rounded-full bg-teal-deep px-5 py-2.5 text-sm font-bold text-cream transition-transform duration-150 active:scale-[0.97]">
                  Get directions
                </a>
                <a href={LOCATION.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border-2 border-teal-deep px-5 py-2 text-sm font-bold text-teal-deep transition-colors duration-150 hover:bg-tiffany/40">
                  Open in Maps
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div {...reveal}>
            <h3 className="font-display text-2xl font-semibold">Nearby spots</h3>
            <ul className="mt-5 divide-y divide-dashed divide-espresso/20">
              {[...SPOTS].sort((a, b) => kmFrom(LOCATION, a) - kmFrom(LOCATION, b)).map((s) => (
                <li key={s.name}>
                  <a
                    href={spotUrl(s)}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-4 py-4 transition-colors duration-150 hover:text-teal-deep"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tiffany/35 text-teal-deep">
                      <Icon name={s.icon} className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="block text-sm text-espresso/65">{s.note}</span>
                    </span>
                    <span className="shrink-0 pt-0.5 text-sm font-bold text-teal-deep tabular-nums">
                      {kmFrom(LOCATION, s).toFixed(1)} km
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-espresso/50">Distances as the crow flies; by road they're longer.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
