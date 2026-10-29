import { motion } from "motion/react";
import { reveal } from "../components/ui";
import BookingForm from "../components/BookingForm";
import { DEPOSIT_RATE } from "../data/rooms";

const STEPS = ["Pick your room and dates", `Pay a ${DEPOSIT_RATE * 100}% deposit online`, "Settle the rest at check-in"];

// /stay: the B&B booking page
export default function StayPage() {
  return (
    <section className="min-h-svh bg-teal-deep px-4 pt-28 pb-24 text-cream sm:px-8 md:pt-36">
      <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[0.8fr_1fr]">
        <div className="lg:sticky lg:top-28">
          <p className="text-xs font-bold tracking-[0.3em] text-tiffany uppercase">The B&amp;B</p>
          <h1
            style={{ viewTransitionName: "stay-title" }}
            className="mt-4 w-fit font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-tight font-semibold"
          >
            Stay a while.
          </h1>
          <p className="mt-5 max-w-md text-lg text-cream/85">
            Wander is a cafe and a bed &amp; breakfast. Book your room here and settle the deposit before you
            arrive, so all that&rsquo;s left is the pause.
          </p>
          <ol className="mt-8 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-tiffany font-bold text-tiffany">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <motion.div {...reveal}>
          <BookingForm />
        </motion.div>
      </div>
    </section>
  );
}
