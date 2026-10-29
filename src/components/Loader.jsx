import { useLayoutEffect, useRef } from "react";
import { animate, createScope, createTimeline, stagger, svg, utils } from "animejs";
import { Mark } from "./Logo";

// Ring draws -> cup settles -> a paper plane loops out of the cup leaving a dotted trail
// -> the name arrives -> the cream sheet lifts off the page like a page being turned.
// onLift fires as the sheet starts lifting (page content can start its entrance underneath),
// onDone once it is gone.
export default function Loader({ onLift, onDone }) {
  const root = useRef(null);

  // layout effect so the hidden start states land before the first paint
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.style.overflow = "hidden";
    let finished = false;
    let alive = true; // StrictMode runs this twice; the first run's promises must not fire
    const finish = () => {
      if (finished) return;
      finished = true;
      html.style.overflow = "";
      onDone();
    };

    const scope = createScope({ root, mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" } }).add((self) => {
      if (self.matches.reduce) {
        document.fonts.ready.then(() => {
          if (!alive) return;
          onLift();
          animate(root.current, { opacity: 0, duration: 300, onComplete: finish });
        });
        return;
      }

      const el = root.current;
      const trail = el.querySelector(".wm-reveal");
      utils.set(".wm-cup", { opacity: 0, y: 8 });
      utils.set([".wm-plane", ".ld-text > *"], { opacity: 0 });

      const tl = createTimeline({ defaults: { ease: "out(4)" }, autoplay: false })
        .add(svg.createDrawable(".wm-ring"), { draw: ["0 0", "0 1"], duration: 800, ease: "inOut(3)" }, 0)
        .add(".wm-cup", { opacity: 1, y: 0, duration: 500 }, 350)
        .add(".wm-plane", { opacity: 1, duration: 150 }, 800)
        // the plane flies the trail while the mask reveals the dots behind it
        .add(".wm-plane", { ...svg.createMotionPath(trail), duration: 1100, ease: "inOut(2)" }, 800)
        .add(svg.createDrawable(trail), { draw: ["0 0", "0 1"], duration: 1100, ease: "inOut(2)" }, 800)
        .add(".ld-text > *", { opacity: 1, y: [10, 0], duration: 600, delay: stagger(90) }, 1500);

      // wait for fonts so the wordmark doesn't swap mid-reveal
      document.fonts.ready.then(() => {
        if (!alive) return;
        tl.play();
      });
      tl.add(el, { y: "-100%", duration: 900, ease: "inOut(4)", onBegin: () => alive && onLift() }, "+=350");
      tl.then(() => alive && finish());
    });

    return () => {
      alive = false;
      scope.revert();
      html.style.overflow = "";
    };
  }, [onLift, onDone]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-50 grid place-items-center bg-cream text-teal"
      aria-hidden="true"
      style={{ borderBottom: "3px dashed var(--color-tiffany)" }}
    >
      <div className="flex flex-col items-center">
        <Mark className="w-36 sm:w-44" />
        <div className="ld-text mt-6 flex flex-col items-center text-teal-deep">
          <div className="font-display text-5xl font-semibold tracking-[0.1em] sm:text-6xl">WANDER</div>
          <div className="mt-2 text-xs font-semibold tracking-[0.3em] uppercase">Cafe + B&amp;B</div>
          <div className="mt-1 font-script text-3xl text-teal">Find your pause.</div>
        </div>
      </div>
    </div>
  );
}
