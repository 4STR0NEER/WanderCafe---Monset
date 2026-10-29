import { useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import Loader from "./components/Loader";
import { Mark, Plane, Wordmark } from "./components/Logo";
import PaymentResult from "./components/PaymentResult";
import { cartSummary, useCart } from "./lib/cart";
import { Link, usePath } from "./lib/router";
import Home from "./pages/Home";
import OrderPage from "./pages/OrderPage";
import StayPage from "./pages/StayPage";
import StaffPage from "./pages/StaffPage";

const PAGES = { "/": Home, "/order": OrderPage, "/stay": StayPage, "/staff": StaffPage };

export default function App() {
  const path = usePath();
  const Page = PAGES[path] ?? Home;

  // the loader only greets visitors who arrive on the landing page
  const [loading, setLoading] = useState(() => location.pathname === "/");
  const [ready, setReady] = useState(!loading); // true once the loader starts lifting
  const lift = useCallback(() => setReady(true), []);
  const done = useCallback(() => setLoading(false), []);

  return (
    <MotionConfig reducedMotion="user">
      {loading && <Loader onLift={lift} onDone={done} />}
      <Nav path={path} />
      {/* view-transition-name "page" (index.css): this is the part that fades between pages */}
      <div className="vt-page">
        <main key={path}>
          <Page ready={ready} />
        </main>
        <Footer />
      </div>
      <PaymentResult />
      {/* only rendered into the "new" snapshot of a page change, where it flies across (index.css) */}
      <svg className="vt-plane" viewBox="-22 -10 24 20" aria-hidden="true" fill="currentColor">
        <Plane />
      </svg>
    </MotionConfig>
  );
}

const navLink = "hidden transition-colors duration-150 hover:text-teal aria-[current=page]:text-teal sm:block";

function Nav({ path }) {
  const { count } = cartSummary(useCart());
  return (
    <header className="vt-header fixed inset-x-0 top-0 z-40 border-b border-espresso/10 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link to="/" aria-label="Wander, home" className="h-10 text-teal-deep">
          <Wordmark tagline={false} className="h-full text-base" />
        </Link>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link to="/order" className={navLink}>
            Menu &amp; order
            {count > 0 && (
              <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-tiffany px-1.5 text-xs text-espresso tabular-nums">
                {count}
              </span>
            )}
          </Link>
          <Link to="/stay" className={navLink}>Stay</Link>
          {path === "/stay" ? (
            <Link to="/order" className="rounded-full bg-teal-deep px-4 py-2 text-cream transition-transform duration-150 active:scale-[0.97]">
              Order ahead
            </Link>
          ) : (
            <Link to="/stay" className="rounded-full bg-teal-deep px-4 py-2 text-cream transition-transform duration-150 active:scale-[0.97]">
              Book a stay
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-espresso px-4 py-16 text-cream sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="h-24 text-tiffany">
          <Wordmark className="h-full text-2xl" />
        </div>
        <div className="space-y-4 text-sm text-cream/75 md:text-right">
          <div className="flex gap-5 font-semibold text-cream md:justify-end">
            <Link to="/order" className="hover:text-tiffany">Menu &amp; order</Link>
            <Link to="/stay" className="hover:text-tiffany">Book a stay</Link>
          </div>
          <p className="font-display text-lg text-cream">Good food. Slow moments. Better together.</p>
          <p className="tracking-[0.2em] uppercase">Made with care · Served with heart · Made for you</p>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl items-center gap-3 border-t border-cream/15 pt-6 text-xs text-cream/50">
        <Mark className="size-5" title="" />© {new Date().getFullYear()} Wander Cafe + B&amp;B
      </div>
    </footer>
  );
}
