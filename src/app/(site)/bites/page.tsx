import type { Metadata } from "next";
import type { Post } from "@/components/landing/post-card";
import SectionLanding from "@/components/landing/section-landing";
import { pillarAccents } from "@/lib/pillars";
import {
  jsonLdString,
  pageMetadata,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { loadPillarData } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  description:
    "Bites of holistic wellness — nutrition, movement, sleep, mindfulness, and the small daily habits that compound into real vitality. From Pinal Bhatt at PBDesk.",
  keywords: [
    "wellness",
    "fitness",
    "mindfulness",
    "nutrition",
    "yoga",
    "sleep",
    "strength training",
    "holistic health",
    "developer wellness",
    "PBDesk Bites",
  ],
  path: "/bites",
  title: "Bites — Wellness, fitness & mindfulness for a fuller life",
});

const FALLBACK_DESCRIPTION =
  "A healthy, active life is the greatest gift we can give ourselves—and our loved ones. In this space, I share thoughts, articles, and resources on fitness, mental well-being, and holistic health. From effective workout routines and nutrition tips to mindfulness practices and the science of longevity, I explore how small, consistent choices lead to lasting vitality. Whether it’s breaking sedentary habits, finding joy in movement, or balancing tech life with physical wellness, my goal is to inspire and empower. Because when we take care of our bodies and minds, we show up stronger—for life, work, and those who matter most.";

const fallbackPosts: Post[] = [
  {
    category: "Wellness",
    description:
      "A holistic lifestyle coach whose integrative approach to nutrition, sleep, and movement reframes wellness as a daily practice.",
    featured: true,
    gradient: "post-grad-emerald",
    labels: ["Health"],
    readTime: "6 min read",
    title: "Luke Coutinho",
  },
  {
    category: "Health",
    description:
      "Saurabh Bothra, founder of Habuild.in, is a habit-building yoga trainer and wellness guru.",
    gradient: "post-grad-orange",
    labels: ["Yoga"],
    readTime: "5 min read",
    title: "My Wellness Guru — Saurabh Bothra",
  },
  {
    category: "Wellness",
    description:
      "Whole, natural, unprocessed foods rich in essential nutrients fuel immunity, repair, and lasting energy.",
    gradient: "post-grad-emerald",
    labels: ["Nutrition"],
    readTime: "4 min read",
    title: "Whole Foods, Whole Life",
  },
  {
    category: "Fitness",
    description:
      "Regular movement — walking, yoga, strength — improves circulation and keeps body and mind sharp.",
    gradient: "post-grad-teal",
    labels: ["Movement"],
    readTime: "4 min read",
    title: "Move Daily, Move Well",
  },
  {
    category: "Health",
    description:
      "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
    gradient: "post-grad-violet",
    labels: ["Sleep", "Recovery"],
    readTime: "5 min read",
    title: "Sleep is the Best Medicine",
  },
  {
    category: "Wellness",
    description:
      "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, and the occasional emotional detox.",
    gradient: "post-grad-amber",
    labels: ["Mindfulness"],
    readTime: "3 min read",
    title: "Mindfulness for Devs",
  },
  {
    category: "Fitness",
    description:
      "A simple, sustainable approach to lifting that protects long-term mobility and joint health.",
    gradient: "post-grad-emerald",
    labels: ["Strength"],
    readTime: "5 min read",
    title: "Strength Training Basics",
  },
];

export default async function BitesPage() {
  const data = await loadPillarData("bites", {
    cadence: "weekly",
    description: FALLBACK_DESCRIPTION,
    fallbackPosts,
  });
  const { posts } = data;

  const bitesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    author: { "@type": "Person", name: SITE_AUTHOR, url: SITE_URL },
    description:
      "Bites of holistic wellness — nutrition, movement, mindfulness, and sleep — from PBDesk.",
    hasPart: posts.map((post) => ({
      "@type": "CreativeWork",
      description: post.description,
      genre: post.category,
      keywords: post.labels?.join(", "),
      name: post.title,
    })),
    inLanguage: "en",
    name: `${SITE_NAME} Bites`,
    url: `${SITE_URL}/bites`,
  };

  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: jsonLdString(bitesJsonLd) }}
        type="application/ld+json"
      />
      <SectionLanding
        accentColor={pillarAccents.bites.primary}
        bannerDarkSrc={data.bannerDarkSrc}
        bannerLightSrc={data.bannerLightSrc}
        description={data.description}
        pillar="bites"
        posts={posts}
        story={data.story}
        title="Bites"
      />
    </>
  );
}
