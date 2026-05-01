import About from "@/components/home/about";
import CtaBanner from "@/components/home/cta-banner";
import Hero from "@/components/home/hero";
import MyPillers from "@/components/home/my-pillers";
import MyRealm from "@/components/home/my-realm";
import MyWellnessThreads from "@/components/home/my-wellness-threads";
import Pillars from "@/components/home/pillars";
import { Reveal } from "@/components/ui/reveal";

export default function Home() {
  return (
    <main>
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <Pillars />
      </Reveal>
      <Reveal>
        <MyRealm />
      </Reveal>
      <Reveal>
        <About />
      </Reveal>
      <Reveal>
        <MyWellnessThreads />
      </Reveal>
      <Reveal>
        <MyPillers />
      </Reveal>
      <Reveal>
        <CtaBanner />
      </Reveal>
    </main>
  );
}
