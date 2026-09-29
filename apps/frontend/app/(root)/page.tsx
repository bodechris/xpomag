import { HomeHero } from "../../components/home-hero";
import { HomeShowcase } from "../../components/home-showcase";

export default function Home() {
  return (
    <main className="xp-home">
      <HomeHero />
      <HomeShowcase />
    </main>
  );
}
