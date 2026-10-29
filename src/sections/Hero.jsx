import { motion } from "motion/react";
import Flight from "../components/Flight";
import { Photo } from "../components/ui";
import { Link } from "../lib/router";
import { LOCATION, PHOTOS } from "../data/place";

const ease = [0.23, 1, 0.32, 1];
const up = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease, delay },
});

// Skims in under the buttons, loops once in the gap between text and photos, lands top right.
const ROUTE = "M-80 690 C 260 720 500 650 580 540 C 650 440 600 330 545 380 C 490 430 600 500 660 360 C 720 220 940 110 1150 95";

export default function Hero({ ready }) {
  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-8 md:pt-36 md:pb-24">
      <Flight d={ROUTE} viewBox="0 0 1200 700" go={ready} className="pointer-events-none absolute inset-0 h-full w-full text-teal" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.05fr_1fr]">
        {ready && (
          <div>
            <motion.p {...up(0.1)} className="text-xs font-bold tracking-[0.3em] text-teal-deep uppercase">
              Cafe + B&amp;B · {LOCATION.area}
            </motion.p>
            <motion.h1 {...up(0.2)} className="mt-4 font-display text-[clamp(3rem,8vw,6.2rem)] leading-[0.95] font-semibold text-espresso">
              Find your <span className="font-script text-[1.2em] font-normal text-teal">pause.</span>
            </motion.h1>
            <motion.p {...up(0.35)} className="mt-6 max-w-md text-lg text-espresso/80">
              A little cafe with rooms, just up the road from White Beach. Stay the night, wake up to breakfast,
              and let the day go slow.
            </motion.p>
            <motion.div {...up(0.5)} className="mt-9 flex flex-wrap gap-3">
              <Link to="/stay" className="rounded-full bg-teal-deep px-6 py-3.5 font-bold text-cream transition-transform duration-150 ease-out active:scale-[0.97]">
                Book a stay
              </Link>
              <Link
                to="/order"
                className="rounded-full border-2 border-teal-deep px-6 py-3 font-bold text-teal-deep transition-[background-color,transform] duration-150 ease-out hover:bg-tiffany/40 active:scale-[0.97]"
              >
                Order ahead
              </Link>
            </motion.div>
          </div>
        )}

        {/* the place, not the plates: cafe + room + a quiet morning */}
        <div className="relative mx-auto aspect-[5/6] w-full max-w-[28rem]">
          {ready && (
            <>
              <Frame d={0.3} className="top-0 right-0 h-[70%] w-[68%] rounded-t-full rounded-b-[2rem]">
                <Photo photo={PHOTOS.cafe} tone="teal" className="h-full w-full rounded-t-full rounded-b-[2rem]" />
              </Frame>
              <Frame d={0.45} className="bottom-0 left-0 h-[52%] w-[54%] rounded-[2rem]">
                <Photo photo={PHOTOS.room} tone="tiffany" className="h-full w-full rounded-[2rem]" />
              </Frame>
              <Frame d={0.6} className="right-[6%] bottom-[4%] size-[30%] rounded-full">
                <Photo photo={PHOTOS.morning} tone="parchment" small className="h-full w-full rounded-full" />
              </Frame>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Frame({ d, className, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease, delay: d }}
      className={`absolute shadow-[0_28px_50px_-22px_rgb(74_52_40/0.5)] ${className}`}
    >
      {children}
    </motion.div>
  );
}
