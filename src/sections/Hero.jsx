import { motion } from "motion/react";
import Flight from "../components/Flight";
import { Link } from "../lib/router";
import { Price } from "./Kitchen";

const ease = [0.23, 1, 0.32, 1];
const up = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease, delay },
});

// Skims in under the buttons, loops once in the gap between text and plates, lands top right.
const ROUTE = "M-80 690 C 260 720 500 650 580 540 C 650 440 600 330 545 380 C 490 430 600 500 660 360 C 720 220 940 110 1150 95";

export default function Hero({ ready }) {
  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-8 md:pt-36 md:pb-20">
      <Flight
        d={ROUTE}
        viewBox="0 0 1200 700"
        go={ready}
        className="pointer-events-none absolute inset-0 h-full w-full text-teal"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.05fr_1fr]">
        {ready && (
          <div>
            <motion.p {...up(0.1)} className="text-xs font-bold tracking-[0.3em] text-teal-deep uppercase">
              Cafe + B&amp;B
            </motion.p>
            <motion.h1
              {...up(0.2)}
              className="mt-4 font-display text-[clamp(3rem,8vw,6.2rem)] leading-[0.95] font-semibold text-espresso"
            >
              Find your <span className="font-script text-[1.2em] font-normal text-teal">pause.</span>
            </motion.h1>
            <motion.p {...up(0.35)} className="mt-6 max-w-md text-lg text-espresso/80">
              Good food. Slow moments. Better together. Order ahead and pay before you arrive, or book a stay
              with us.
            </motion.p>
            <motion.div {...up(0.5)} className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/order"
                className="rounded-full bg-teal-deep px-6 py-3.5 font-bold text-cream transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                Order ahead
              </Link>
              <Link
                to="/stay"
                className="rounded-full border-2 border-teal-deep px-6 py-3 font-bold text-teal-deep transition-[background-color,transform] duration-150 ease-out hover:bg-tiffany/40 active:scale-[0.97]"
              >
                Book a stay
              </Link>
            </motion.div>
          </div>
        )}

        {/* plates arranged like the printed menus: round, cut-out, soft shadow */}
        <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
          {ready && (
            <>
              <Plate src="/food/breakfast.webp" alt="Wander Signature Breakfast" className="top-[6%] right-0 w-[72%]" d={0.3} />
              <Plate src="/food/ramen.webp" alt="Special Ramen" className="top-0 left-0 w-[40%]" d={0.45} />
              <Plate src="/food/halohalo.webp" alt="Halo halo" className="bottom-0 left-[6%] w-[44%]" d={0.6} />
              <motion.div {...up(0.9)} className="absolute right-[8%] bottom-[8%]">
                <Price value={295} label="Signature breakfast" />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Plate({ src, alt, className, d }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease, delay: d }}
      className={`absolute aspect-square rounded-full object-cover shadow-[0_24px_40px_-18px_rgb(74_52_40/0.45)] ${className}`}
    />
  );
}
