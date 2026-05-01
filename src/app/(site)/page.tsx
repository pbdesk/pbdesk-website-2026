import About from "@/components/home/about";
import CtaBanner from "@/components/home/cta-banner";
import Hero from "@/components/home/hero";
import MyRealm from "@/components/home/my-realm";
import MyWellnessThreads from "@/components/home/my-wellness-threads";
import Pillars from "@/components/home/pillars";

export default function Home() {
  return (
    <main>
      <Hero />
      <Pillars />
      <MyRealm />
      <About />
      <MyWellnessThreads />
      <CtaBanner />
    </main>
  );
}
