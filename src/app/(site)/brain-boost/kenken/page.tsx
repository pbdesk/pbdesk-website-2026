// src/app/(site)/brain-boost/kenken/page.tsx
import type { ISbStoryData } from "@storyblok/react";
import type { Metadata } from "next";
import KenkenFallback from "@/components/brain-boost/kenken/fallback";
import LivePage from "@/components/storyblok/live-page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { jsonLdString, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { loadKenkenStory } from "@/lib/storyblok/landing";

export async function generateMetadata(): Promise<Metadata> {
  const story = await loadKenkenStory();
  const c = story?.content;
  return pageMetadata({
    description:
      c?.seo_description ??
      "Learn KenKen: what it is, how to play, the operations, and the difficulty levels. Then play online — free, no sign-up.",
    keywords: ["KenKen", "how to play KenKen", "KenKen rules", "math puzzle"],
    path: "/brain-boost/kenken",
    title: c?.seo_title ?? `KenKen — how to play & rules — ${SITE_NAME}`,
  });
}

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  applicationCategory: "Game",
  description:
    "KenKen is an arithmetic logic puzzle played on an N×N grid divided into cages with arithmetic targets.",
  genre: "Logic puzzle",
  name: "KenKen",
  url: `${SITE_URL}/brain-boost/kenken`,
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
      <div className="wrapper pt-6">
        <Breadcrumb
          align="start"
          items={[
            { href: "/brain-boost", label: "Brain Boost" },
            { label: "KenKen" },
          ]}
        />
      </div>
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
