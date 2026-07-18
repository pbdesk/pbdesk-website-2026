import type { ISbStoryData } from "@storyblok/react";
import type { Metadata } from "next";
import AboutHero from "@/components/about/about-hero";
import AboutStory from "@/components/about/about-story";
import LivePage from "@/components/storyblok/live-page";
import { Reveal } from "@/components/ui/reveal";
import {
  jsonLdString,
  pageMetadata,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_URL,
  SOCIAL,
} from "@/lib/seo";
import { loadAboutStory } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  description:
    "Get to know the human behind PBDesk. Pinal Bhatt is a software engineer exploring AI, web development, and the daily wellness habits that fuel sustainable craft.",
  keywords: [
    "Pinal Bhatt",
    "about Pinal Bhatt",
    "software engineer",
    "AI engineer",
    "full stack developer",
    "wellness enthusiast",
  ],
  ogType: "profile",
  path: "/about",
  title: "About Pinal Bhatt — Engineer, AI tinkerer, wellness enthusiast",
});

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  description:
    "Software engineer, AI tinkerer, and wellness enthusiast writing at PBDesk.",
  jobTitle: "Software Engineer",
  name: SITE_AUTHOR,
  sameAs: [SOCIAL.github, SOCIAL.linkedin, SOCIAL.x],
  url: `${SITE_URL}/about`,
  worksFor: {
    "@type": "Organization",
    name: SITE_NAME,
  },
};

export default async function AboutPage() {
  const story = await loadAboutStory();
  const hasBody = Boolean(story?.content?.body?.length);

  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: jsonLdString(personJsonLd) }}
        type="application/ld+json"
      />
      {hasBody && story ? (
        <LivePage
          story={story as unknown as ISbStoryData<Record<string, unknown>>}
        />
      ) : (
        <>
          <Reveal>
            <AboutHero />
          </Reveal>
          <Reveal>
            <AboutStory />
          </Reveal>
        </>
      )}
    </main>
  );
}
