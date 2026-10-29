import { motion } from "motion/react";
import { Price, reveal } from "./Kitchen";

export default function Halo() {
  return (
    <section className="bg-parchment/70 px-4 py-24 sm:px-8">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[0.8fr_1fr]">
        <motion.div {...reveal} className="relative mx-auto w-64 sm:w-72">
          <img
            src="/food/halohalo.webp"
            alt="Halo halo with ube ice cream, corn flakes, saba and gulaman"
            loading="lazy"
            className="w-full aspect-[4/5] rounded-[10rem] object-cover shadow-[0_30px_50px_-24px_rgb(74_52_40/0.55)]"
          />
          <div className="absolute -right-6 bottom-10">
            <Price value={120} label="Halo halo" />
          </div>
        </motion.div>
        <motion.div {...reveal}>
          <p className="font-script text-3xl text-teal">cool, creamy, colorful</p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-none font-semibold">
            Our classic <span className="brush">Halo Halo</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-espresso/80">
            A Filipino favorite. Made even better. Ube ice cream, corn flakes, saba &amp; fruits, gulaman, ube
            halaya, milk &amp; ice to bring it all together.
          </p>
          <p className="mt-6 font-script text-3xl text-espresso">One spoonful and you&rsquo;re home.</p>
        </motion.div>
      </div>
    </section>
  );
}
