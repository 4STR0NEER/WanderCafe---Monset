import { useEffect, useId, useRef } from "react";
import { createScope, createTimeline, onScroll, svg } from "animejs";
import { Plane } from "./Logo";

// A paper plane flying a path and leaving a dotted trail behind it.
// mode "intro": flies once when `go` turns true, then drifts in place.
// mode "scroll": its progress is tied to scrolling past the drawing.
export default function Flight({ d, viewBox, mode = "intro", go = true, size = 2.4, className = "" }) {
  const root = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!go) return;
    const scope = createScope({ root, mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" } }).add((self) => {
      const el = root.current;
      const reveal = el.querySelector(".fl-reveal");
      const plane = el.querySelector(".fl-plane");
      const path = svg.createMotionPath(reveal);
      const draw = svg.createDrawable(reveal);

      const reduce = self.matches.reduce;
      const scroll = mode === "scroll" && !reduce;
      const tl = createTimeline({
        defaults: { ease: scroll ? "linear" : "inOut(2)", duration: scroll ? 1000 : 2200 },
        autoplay: reduce ? false : scroll ? onScroll({ target: el, enter: "end start", leave: "center center", sync: 0.25 }) : true,
        onComplete: () => mode === "intro" && el.classList.add("drift"),
      })
        .add(plane, { opacity: [0, 1], duration: 200 }, 0)
        .add(plane, { ...path }, 0)
        .add(draw, { draw: ["0 0", "0 1"] }, 0);
      // reduced motion: show the finished flight, no travel
      if (reduce) tl.seek(tl.duration);
      return () => tl.revert();
    });
    return () => scope.revert();
  }, [go, mode]);

  return (
    <svg ref={root} viewBox={viewBox} className={className} aria-hidden="true" fill="currentColor" overflow="visible">
      <mask id={id} maskUnits="userSpaceOnUse">
        <path className="fl-reveal" d={d} fill="none" stroke="#fff" strokeWidth="10" />
      </mask>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0.1 12"
        mask={`url(#${id})`}
      />
      {/* hidden until the timeline places it on the path */}
      <g className="fl-plane" opacity="0">
        <Plane transform={`scale(${size})`} />
      </g>
    </svg>
  );
}
