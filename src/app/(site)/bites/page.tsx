import type { Metadata } from "next";
import type { Post } from "@/components/landing/post-card";
import SectionLanding from "@/components/landing/section-landing";
import { pillarAccents } from "@/lib/pillars";
import { pageMetadata, SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Bites — Wellness, fitness & mindfulness for a fuller life",
  description:
    "Bites of holistic wellness — nutrition, movement, sleep, mindfulness, and the small daily habits that compound into real vitality. From Pinal Bhatt at PBDesk.",
  path: "/bites",
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
});

const posts: Post[] = [
  {
    title: "Luke Coutinho",
    category: "Wellness",
    tags: ["Health"],
    description:
      "A holistic lifestyle coach whose integrative approach to nutrition, sleep, and movement reframes wellness as a daily practice.",
    readTime: "6 min read",
    gradient: "post-grad-emerald",
    featured: true,
  },
  {
    title: "My Wellness Guru — Saurabh Bothra",
    category: "Health",
    tags: ["Yoga"],
    description:
      "Saurabh Bothra, founder of Habuild.in, is a habit-building yoga trainer and wellness guru.",
    readTime: "5 min read",
    gradient: "post-grad-orange",
  },
  {
    title: "Whole Foods, Whole Life",
    category: "Wellness",
    tags: ["Nutrition"],
    description:
      "Whole, natural, unprocessed foods rich in essential nutrients fuel immunity, repair, and lasting energy.",
    readTime: "4 min read",
    gradient: "post-grad-emerald",
  },
  {
    title: "Move Daily, Move Well",
    category: "Fitness",
    tags: ["Movement"],
    description:
      "Regular movement — walking, yoga, strength — improves circulation and keeps body and mind sharp.",
    readTime: "4 min read",
    gradient: "post-grad-teal",
  },
  {
    title: "Sleep is the Best Medicine",
    category: "Health",
    tags: ["Sleep", "Recovery"],
    description:
      "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
    readTime: "5 min read",
    gradient: "post-grad-violet",
  },
  {
    title: "Mindfulness for Devs",
    category: "Wellness",
    tags: ["Mindfulness"],
    description:
      "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, and the occasional emotional detox.",
    readTime: "3 min read",
    gradient: "post-grad-amber",
  },
  {
    title: "Strength Training Basics",
    category: "Fitness",
    tags: ["Strength"],
    description:
      "A simple, sustainable approach to lifting that protects long-term mobility and joint health.",
    readTime: "5 min read",
    gradient: "post-grad-emerald",
  },
];

const bitesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `${SITE_NAME} Bites`,
  url: `${SITE_URL}/bites`,
  description:
    "Bites of holistic wellness — nutrition, movement, mindfulness, and sleep — from PBDesk.",
  inLanguage: "en",
  author: { "@type": "Person", name: SITE_AUTHOR, url: SITE_URL },
  hasPart: posts.map((post) => ({
    "@type": "CreativeWork",
    name: post.title,
    description: post.description,
    keywords: post.tags?.join(", "),
    genre: post.category,
  })),
};

export default function BitesPage() {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bitesJsonLd) }}
        type="application/ld+json"
      />
      <SectionLanding
        accentColor={pillarAccents.bites.primary}
        cadence="weekly"
        description="A healthy, active life is the greatest gift we can give ourselves—and our loved ones. In this space, I share thoughts, articles, and resources on fitness, mental well-being, and holistic health. From effective workout routines and nutrition tips to mindfulness practices and the science of longevity, I explore how small, consistent choices lead to lasting vitality. Whether it’s breaking sedentary habits, finding joy in movement, or balancing tech life with physical wellness, my goal is to inspire and empower. Because when we take care of our bodies and minds, we show up stronger—for life, work, and those who matter most."
        filters={[
          { label: "Wellness", count: 3 },
          { label: "Health", count: 2 },
          { label: "Fitness", count: 2 },
        ]}
        pillar="bites"
        posts={posts}
        title="Bites"
      />
    </>
  );
}
