import { motion } from "motion/react";
import { Link } from "../lib/router";
import { reveal } from "./Kitchen";

// Landing-page teaser for the B&B; booking itself lives on /stay.
export default function Stay() {
  return (
    <section id="stay" className="scroll-mt-16 bg-teal-deep px-4 py-24 text-cream sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
        <motion.div {...reveal}>
          <p className="text-xs font-bold tracking-[0.3em] text-tiffany uppercase">The B&amp;B</p>
          {/* same view-transition name as the /stay heading, so it glides between pages */}
          <h2
            style={{ viewTransitionName: "stay-title" }}
            className="mt-4 w-fit font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight font-semibold"
          >
            Stay a while.
          </h2>
          <p className="mt-5 max-w-md text-lg text-cream/85">
            Wander is a cafe and a bed &amp; breakfast. Book your room online and settle the deposit before you
            arrive, so all that&rsquo;s left is the pause.
          </p>
          <Link
            to="/stay"
            className="mt-10 inline-block rounded-full bg-cream px-7 py-4 font-bold text-teal-deep transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Check dates &amp; book
          </Link>
        </motion.div>
        <motion.div
          {...reveal}
          className="grid aspect-[4/3] place-items-center rounded-[2rem] border-2 border-dashed border-tiffany/70 p-8 text-center text-cream/70"
        >
          Room photos go here
        </motion.div>
      </div>
    </section>
  );
}
