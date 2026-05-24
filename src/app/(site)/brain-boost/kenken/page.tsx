// src/app/(site)/brain-boost/kenken/page.tsx
import type { ISbStoryData } from "@storyblok/react";
import type { Metadata } from "next";
import KenkenFallback from "@/components/brain-boost/kenken/fallback";
import LivePage from "@/components/storyblok/live-page";
import { jsonLdString, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { loadKenkenStory } from "@/lib/storyblok/landing";

export async function generateMetadata(): Promise<Metadata> {
  const story = await loadKenkenStory();
  const c = story?.content;
  return pageMetadata({
    title: c?.seo_title ?? `KenKen — how to play & rules — ${SITE_NAME}`,
    description:
      c?.seo_description ??
      "Learn KenKen: what it is, how to play, the operations, and the difficulty levels. Then play online — free, no sign-up.",
    path: "/brain-boost/kenken",
    keywords: ["KenKen", "how to play KenKen", "KenKen rules", "math puzzle"],
  });
}

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "KenKen",
  url: `${SITE_URL}/brain-boost/kenken`,
  genre: "Logic puzzle",
  applicationCategory: "Game",
  description:
    "KenKen is an arithmetic logic puzzle played on an N×N grid divided into cages with arithmetic targets.",
};

export default async function KenkenInfoPage() {
  const story = await loadKenkenStory();
  const hasBody = Boolean(story?.content?.body?.length);

  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD payload
        dangerouslySetInnerHTML={{ __html: jsonLdString(gameJsonLd) }}
        type="application/ld+json"
      />
      {hasBody && story ? (
        <LivePage
          story={story as unknown as ISbStoryData<Record<string, unknown>>}
        />
      ) : (
        <KenkenFallback />
      )}
    </main>
  );
}
