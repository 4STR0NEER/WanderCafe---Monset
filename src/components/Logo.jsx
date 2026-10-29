import { useId } from "react";

// The flight the plane takes out of the cup: a little loop, then off toward the rim.
export const TRAIL = "M58 60 C57 46 38 47 40 35 C42 22 64 24 61 36 C58 48 77 43 83 29";
// where the trail ends, and the plane's heading there (tangent of the last curve)
export const PLANE_AT = "translate(83 29) rotate(-64)";

// Paper airplane, nose at (0,0) pointing along +x. Two folds, the lower one in shadow.
export function Plane(props) {
  return (
    <g {...props}>
      <path d="M0 0 L-20 -8 L-13 1 Z" />
      <path d="M0 0 L-13 1 L-16 9 Z" opacity=".55" />
    </g>
  );
}

// The badge: a cup on its saucer, and a paper plane looping out of it instead of steam.
// Class names are hooks for the loader animation; the static render is already complete.
export function Mark({ className = "", title = "Wander" }) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={title} fill="currentColor">
      <mask id={id} maskUnits="userSpaceOnUse">
        <path className="wm-reveal" d={TRAIL} fill="none" stroke="#fff" strokeWidth="5" />
      </mask>
      <circle className="wm-ring" cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <g className="wm-cup">
        <path d="M34 63 H82 V66 C82 81 72 89 58 89 C44 89 34 81 34 66 Z" />
        <path d="M81 69 C92 67 94 83 80 82" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 94 C40 101 76 101 90 94" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <path
        className="wm-trail"
        d={TRAIL}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="0.1 5"
        mask={`url(#${id})`}
      />
      {/* outer g takes the flight transform, inner g the size, so animating one keeps the other */}
      <g className="wm-plane" transform={PLANE_AT}>
        <Plane transform="scale(1.45)" />
      </g>
    </svg>
  );
}

// Horizontal lockup, same structure as the original sign: badge, WANDER, Cafe + B&B, the script line.
export function Wordmark({ className = "", tagline = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Mark className="h-full w-auto shrink-0" />
      <div className="leading-none">
        <div className="wm-word font-display text-[1.6em] font-semibold tracking-[0.08em]">WANDER</div>
        <div className="wm-sub mt-1 flex items-center gap-2 text-[0.55em] font-semibold tracking-[0.2em] uppercase">
          <span className="h-px w-4 bg-current" />
          Cafe + B&amp;B
          <span className="h-px w-4 bg-current" />
        </div>
        {tagline && <div className="wm-tag mt-1 font-script text-[0.9em]">Find your pause.</div>}
      </div>
    </div>
  );
}
