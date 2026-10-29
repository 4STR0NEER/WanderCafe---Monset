import { Mark } from "./Logo";

// Small shared pieces used across pages.

// Motion props: fade up once when scrolled into view
export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

// The inky price blob from the pasta and bowls menus
export function Price({ value, label }) {
  return (
    <div
      className="grid size-16 place-items-center bg-teal-deep text-center leading-none text-cream shadow-lg sm:size-20"
      style={{ borderRadius: "58% 42% 55% 45% / 48% 58% 42% 52%" }}
      aria-label={`${label}, ${value} pesos`}
    >
      <div>
        <div className="font-display text-xl font-semibold sm:text-2xl">{value}</div>
        <div className="mt-0.5 text-[0.6rem] font-bold tracking-widest">PHP</div>
      </div>
    </div>
  );
}

const TONES = {
  teal: "from-teal to-teal-deep text-cream",
  tiffany: "from-tiffany to-teal text-teal-deep",
  parchment: "from-parchment to-cream text-teal-deep",
};

// A photo, or a designed stand-in until the real one exists: brand gradient, the badge,
// the caption, and a dashed frame so nobody mistakes it for the finished thing.
export function Photo({ photo, tone = "teal", small = false, className = "" }) {
  if (photo.src)
    return <img src={photo.src} alt={photo.label} loading="lazy" className={`object-cover ${className}`} />;
  return (
    <div
      role="img"
      aria-label={`${photo.label} (photo coming soon)`}
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${TONES[tone]} ${className}`}
    >
      <div className="absolute inset-3 rounded-[inherit] border-2 border-dashed border-current opacity-25" />
      <div className="relative flex flex-col items-center px-4 text-center">
        <Mark className={`${small ? "size-8" : "size-12"} opacity-70`} title="" />
        <span className={`mt-2 font-bold uppercase ${small ? "text-[0.6rem] tracking-[0.2em]" : "text-xs tracking-[0.25em]"}`}>{photo.label}</span>
        {!small && <span className="mt-1 font-script text-xl opacity-80">photo coming soon</span>}
      </div>
    </div>
  );
}

// Line icons drawn for this site (24px grid, stroke = currentColor)
const PATHS = {
  wifi: ["M2 8.8a15 15 0 0 1 20 0", "M5 12.6a10.5 10.5 0 0 1 14 0", "M8.5 16.2a5.5 5.5 0 0 1 7 0", "M12 20h.01"],
  snow: ["M12 2v20", "M2 12h20", "m4.9 4.9 14.2 14.2", "m19.1 4.9-14.2 14.2"],
  drop: ["M12 2.7S6 9 6 13a6 6 0 0 0 12 0c0-4-6-10.3-6-10.3Z"],
  coffee: ["M17 8h1a4 4 0 0 1 0 8h-1", "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z", "M6 2v2", "M10 2v2", "M14 2v2"],
  bed: ["M2 4v16", "M2 8h17a3 3 0 0 1 3 3v9", "M2 17h20", "M6 8v9"],
  parking: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", "M9 17V7h4a3 3 0 0 1 0 6H9"],
  laptop: ["M4 5h16v11H4Z", "M2 20h20"],
  waves: ["M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0", "M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0", "M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"],
  fish: ["M2 12c4-6 11-6 15 0-4 6-11 6-15 0Z", "M17 12l5-4v8Z", "M7 11h.01"],
  pin: ["M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13Z", "M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"],
  mountain: ["m3 20 6-11 4 6 2-3 6 8Z"],
  route: ["M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M6 15V9a3 3 0 0 1 3-3h7", "M18 9v6a3 3 0 0 1-3 3H8"],
};

export function Icon({ name, className = "size-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
