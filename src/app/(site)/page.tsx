import type { ISbStoryData } from "@storyblok/react";
import type { Metadata } from "next";
import About from "@/components/home/about";
import Hero from "@/components/home/hero";
import MyPillers from "@/components/home/my-pillers";
import MyRealm from "@/components/home/my-realm";
import MyWellnessThreads from "@/components/home/my-wellness-threads";
import Pillars from "@/components/home/pillars";
import LivePage from "@/components/storyblok/live-page";
import { Reveal } from "@/components/ui/reveal";
import { pageMetadata } from "@/lib/seo";
import { loadHomeStory } from "@/lib/storyblok/landing";

export async function generateMetadata(): Promise<Metadata> {
  const story = await loadHomeStory();
  const c = story?.content;
  return pageMetadata({
    title: c?.title ?? "PBDesk — Bits, Bites & Blog by Pinal Bhatt",
    description:
      c?.description ??
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
}

export default async function Home() {
  const story = await loadHomeStory();

  // When Storyblok has the home story, render its body. Otherwise fall back
  // to the hardcoded section stack (preserves the current homepage layout
  // when env vars aren't set yet).
  if (story?.content?.body?.length) {
    return (
      <main>
        <LivePage
          story={story as unknown as ISbStoryData<Record<string, unknown>>}
        />
      </main>
    );
  }

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
    </main>
  );
}
