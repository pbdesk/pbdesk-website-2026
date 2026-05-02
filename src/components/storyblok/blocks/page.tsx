// Generic body[] renderer. Iterates a Storyblok blocks field and dispatches
// each blok to the matching wrapper component. Unknown components are
// silently skipped (visible in dev console as a warning).

import type { SbBlokBase } from "@/lib/storyblok/types";
import AboutSection from "./about-section";
import CtaBanner from "./cta-banner";
import Hero from "./hero";
import MyPillers from "./my-pillers";
import MyRealm from "./my-realm";
import MyWellnessThreads from "./my-wellness-threads";
import Pillars from "./pillars";
import RichtextSection from "./richtext-section";
import type {
  AboutSectionBlok,
  CtaBannerBlok,
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
