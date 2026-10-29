import Hero from "../sections/Hero";
import Spaces from "../sections/Spaces";
import Amenities from "../sections/Amenities";
import Location from "../sections/Location";

// /: the landing page. The place itself: the cafe and the B&B, what's included, where it is.
// The food lives on /order.
export default function Home({ ready }) {
  return (
    <>
      <Hero ready={ready} />
      <Spaces />
      <Amenities />
      <Location />
    </>
  );
}
