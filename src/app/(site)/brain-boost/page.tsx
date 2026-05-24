import type { Metadata } from "next";
import BrainBoostBenefits from "@/components/brain-boost/hub/brain-boost-benefits";
import BrainBoostComingSoon from "@/components/brain-boost/hub/brain-boost-coming-soon";
import BrainBoostDailyStrip from "@/components/brain-boost/hub/brain-boost-daily-strip";
import BrainBoostFeaturedKenken from "@/components/brain-boost/hub/brain-boost-featured-kenken";
import BrainBoostHero from "@/components/brain-boost/hub/brain-boost-hero";
import BrainBoostIntro from "@/components/brain-boost/hub/brain-boost-intro";
import { BRAIN_BOOST_LEDE } from "@/components/brain-boost/hub/meta";
import {
  jsonLdString,
  pageMetadata,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { adaptHubStory, getHubFallback } from "@/lib/storyblok/adapters";
import { loadBrainBoostHubStory } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  title: "Brain Boost — Short games for long focus",
  description:
    "Brain Boost is PBDesk's small puzzle corner — KenKen today, more queued. A fresh daily puzzle, four difficulty tiers, hand-checked games designed to fit a coffee break.",
  path: "/brain-boost",
  keywords: [
    "puzzles",
    "kenken",
    "brain training",
    "focus",
    "logic puzzles",
    "PBDesk",
  ],
});

export default async function BrainBoostHubPage() {
  const story = await loadBrainBoostHubStory();
  const hub = story ? adaptHubStory(story) : getHubFallback();

  const liveGame = hub.games.find((g) => g.status === "live");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} Brain Boost`,
    url: `${SITE_URL}/brain-boost`,
    description: BRAIN_BOOST_LEDE,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE_AUTHOR, url: SITE_URL },
  };
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        type="application/ld+json"
      />
      <main>
        <BrainBoostHero />
        <BrainBoostIntro lede={hub.lede} metaItems={hub.metaItems} />
        <BrainBoostFeaturedKenken game={liveGame} />
        <BrainBoostDailyStrip
          body={hub.dailyBody}
          ctaPlay={hub.dailyCtaPlay}
          heading={hub.dailyHeading}
        />
        <BrainBoostComingSoon games={hub.games} />
        <BrainBoostBenefits
          benefits={hub.benefits}
          heading={hub.benefitsHeading}
        />
      </main>
    </>
  );
}
