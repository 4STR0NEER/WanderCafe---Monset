import { motion } from "motion/react";
import { Photo, reveal } from "../components/ui";
import { Link } from "../lib/router";
import { PHOTOS } from "../data/place";
import { ROOMS, DEPOSIT_RATE } from "../data/rooms";
import { peso } from "../lib/booking";

// The two halves of Wander, side by side, then a look around.
export default function Spaces() {
  const from = Math.min(...ROOMS.map((r) => r.rate));
  return (
    <section id="spaces" className="scroll-mt-16 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.h2 {...reveal} className="max-w-3xl font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-tight font-semibold">
          A cafe to linger in, <span className="brush">a room to rest in.</span>
        </motion.h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <Feature
            eyebrow="The Cafe"
            title="Pull up a chair."
            body="Coffee, all-day breakfast, Filipino comfort plates and halo-halo. Order ahead online and it's ready when you walk in."
            photo={<Photo photo={PHOTOS.seating} tone="tiffany" className="aspect-[4/3] w-full rounded-[2rem]" />}
            cta={["/order", "See the menu & order"]}
          />
          <Feature
            eyebrow="The B&B"
            title="Stay a while."
            titleName="stay-title" // glides into the /stay heading
            body={`Rooms with breakfast at the cafe, from ${peso(from * 100)} a night. Book online with a ${DEPOSIT_RATE * 100}% deposit and settle the rest at check-in.`}
            photo={<Photo photo={PHOTOS.room} tone="teal" className="aspect-[4/3] w-full rounded-[2rem]" />}
            cta={["/stay", "Check dates & book"]}
            offset
          />
        </div>

        {/* a look around: placeholders until the owner's photos arrive */}
        <motion.div {...reveal} className="mt-24 grid auto-rows-[9rem] grid-cols-2 gap-4 sm:auto-rows-[11rem] md:grid-cols-4">
          <Photo photo={PHOTOS.counter} tone="teal" className="row-span-2 rounded-[1.5rem]" />
          <Photo photo={PHOTOS.breakfast} tone="parchment" className="rounded-[1.5rem] md:col-span-2" />
          <Photo photo={PHOTOS.outside} tone="tiffany" className="row-span-2 rounded-[1.5rem]" />
          <Photo photo={PHOTOS.bathroom} tone="parchment" className="rounded-[1.5rem]" />
          <Photo photo={PHOTOS.morning} tone="tiffany" className="col-span-2 rounded-[1.5rem] md:col-span-1" />
        </motion.div>
      </div>
    </section>
  );
}

function Feature({ eyebrow, title, titleName, body, photo, cta, offset }) {
  return (
    <motion.article {...reveal} className={offset ? "lg:mt-24" : ""}>
      {photo}
      <p className="mt-8 text-xs font-bold tracking-[0.3em] text-teal-deep uppercase">{eyebrow}</p>
      <h3 style={titleName && { viewTransitionName: titleName }} className="mt-2 w-fit font-display text-4xl font-semibold">
        {title}
      </h3>
      <p className="mt-4 max-w-md text-lg text-espresso/75">{body}</p>
      <Link
        to={cta[0]}
        className="mt-6 inline-flex items-center gap-2 font-bold text-teal-deep underline decoration-tiffany decoration-4 underline-offset-8 transition-[text-decoration-color] duration-150 hover:decoration-teal"
      >
        {cta[1]} <span aria-hidden="true">→</span>
      </Link>
    </motion.article>
  );
}
