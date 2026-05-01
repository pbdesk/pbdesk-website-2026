import type { Metadata } from "next";
import About from "@/components/home/about";
import CtaBanner from "@/components/home/cta-banner";
import Hero from "@/components/home/hero";
import MyPillers from "@/components/home/my-pillers";
import MyRealm from "@/components/home/my-realm";
import MyWellnessThreads from "@/components/home/my-wellness-threads";
import Pillars from "@/components/home/pillars";
import { Reveal } from "@/components/ui/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "PBDesk — Bits, Bites & Blog by Pinal Bhatt",
  description:
    "From the desk of Pinal Bhatt — a space where code meets wellness. Explore Bits (dev & AI), Bites (fitness & mindfulness), and the Blog (long-form reflections).",
  path: "/",
  keywords: [
    "Pinal Bhatt blog",
    "PBDesk Bits",
    "PBDesk Bites",
    "developer wellness",
    "code and mindfulness",
    "AI and wellness",
  ],
});

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
        <About />
      </Reveal>
      <Reveal>
        <MyRealm />
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
