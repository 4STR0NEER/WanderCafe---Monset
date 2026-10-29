import Hero from "../sections/Hero";
import Kitchen from "../sections/Kitchen";
import Halo from "../sections/Halo";
import Stay from "../sections/Stay";

// /: the landing page, just the two halves of Wander, the cafe and the B&B
export default function Home({ ready }) {
  return (
    <>
      <Hero ready={ready} />
      <Kitchen />
      <Halo />
      <Stay />
    </>
  );
}
