import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

// A tiny router on the History API: three pages don't need a routing library.
// Every page change runs inside a View Transition (see index.css), so the old page fades out,
// the new one rises in, and a paper plane crosses the screen. Browsers without View Transitions
// (or reduced motion) just swap instantly.

const listeners = new Set();
const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = () => listeners.forEach((fn) => fn());

export const usePath = () => useSyncExternalStore(subscribe, () => location.pathname);

function transition(update) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return update();
  const html = document.documentElement;
  const vt = document.startViewTransition(() => {
    html.classList.add("vt-flying"); // the plane exists only in the "new" snapshot, so it flies in
    flushSync(update); // React must render the new page before the browser takes its snapshot
  });
  vt.finished.finally(() => html.classList.remove("vt-flying"));
}

export function navigate(to) {
  const url = new URL(to, location.href);
  if (url.pathname === location.pathname) {
    // same page: just glide to the section, no page transition
    if (url.hash) document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
    else scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  transition(() => {
    history.pushState(null, "", url);
    emit();
    const target = url.hash && document.querySelector(url.hash);
    if (target) target.scrollIntoView();
    else scrollTo(0, 0);
  });
}

addEventListener("popstate", () => transition(emit));

// <a> that navigates in-app; modified clicks (new tab etc.) still behave like normal links
export function Link({ to, onClick, ...props }) {
  return (
    <a
      href={to}
      aria-current={to === location.pathname ? "page" : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    />
  );
}
