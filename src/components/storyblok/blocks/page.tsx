"use client";

// Generic body[] renderer. Iterates a Storyblok blocks field and dispatches
// each blok to the matching wrapper component. Unknown components are
// silently skipped (visible in dev console as a warning).
//
// "use client" so the same dispatcher works in both rendering contexts:
//   - Server: pages still call <Page body={story.content.body} /> directly
//     and Next.js renders the initial HTML.
//   - Client: <LivePage> wraps this with useStoryblokState() and re-renders
//     it on every editor keystroke for true WYSIWYG live edit.

import type { SbBlokBase } from "@/lib/storyblok/types";
import AboutSection from "./about-section";
import CtaBanner from "./cta-banner";
import CuratedPostSetBlock from "./curated-post-set";
import Hero from "./hero";
import MyPillers from "./my-pillers";
import MyRealm from "./my-realm";
import MyWellnessThreads from "./my-wellness-threads";
import Pillars from "./pillars";
import RichtextSection from "./richtext-section";
import type {
  AboutSectionBlok,
  CtaBannerBlok,
  CuratedPostSetBlok,
  HeroBlok,
  MyPillersBlok,
  MyRealmBlok,
  MyWellnessThreadsBlok,
  PillarsBlok,
  RichtextSectionBlok,
} from "./types";

interface PageProps {
  body?: SbBlokBase[];
}

export default function Page({ body }: PageProps) {
  if (!body?.length) {
    return null;
  }
  return (
    <>
      {body.map((blok) => {
        switch (blok.component) {
          case "hero":
            return <Hero blok={blok as HeroBlok} key={blok._uid} />;
          case "pillars":
            return <Pillars blok={blok as PillarsBlok} key={blok._uid} />;
          case "about_section":
            return (
              <AboutSection blok={blok as AboutSectionBlok} key={blok._uid} />
            );
          case "my_realm":
            return <MyRealm blok={blok as MyRealmBlok} key={blok._uid} />;
          case "my_wellness_threads":
            return (
              <MyWellnessThreads
                blok={blok as MyWellnessThreadsBlok}
                key={blok._uid}
              />
            );
          case "my_pillers":
            return <MyPillers blok={blok as MyPillersBlok} key={blok._uid} />;
          case "curated_post_set":
            return (
              <CuratedPostSetBlock
                blok={blok as CuratedPostSetBlok}
                key={blok._uid}
              />
            );
          case "cta_banner":
            return <CtaBanner blok={blok as CtaBannerBlok} key={blok._uid} />;
          case "richtext_section":
            return (
              <RichtextSection
                blok={blok as RichtextSectionBlok}
                key={blok._uid}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
