import { IconHeartbeat, IconLeaf } from "@tabler/icons-react";
import type { Post } from "@/components/landing/post-card";
import SectionLanding from "@/components/landing/section-landing";
import { pillarAccents } from "@/lib/pillars";

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

export default function BitesPage() {
  return (
    <SectionLanding
      accentColor={pillarAccents.bites.primary}
      accentColor2={pillarAccents.bites.secondary}
      bannerLabel="Movement"
      bigIcon={<IconLeaf size={88} stroke={1.5} />}
      cadence="weekly"
      description="A healthy, active life is the greatest gift we can give ourselves — and our loved ones. Here I share thoughts, articles, and resources on fitness, mental well-being, and holistic health. From effective workout routines and nutrition tips to mindfulness practices and the science of sleep, I explore how small, consistent choices lead to lasting vitality. Because when we take care of our bodies and minds, we show up stronger."
      filters={[
        { label: "Wellness", count: 3 },
        { label: "Health", count: 2 },
        { label: "Fitness", count: 2 },
      ]}
      pill="Mindfulness"
      pillIcon={<IconHeartbeat size={14} stroke={2} />}
      posts={posts}
      subtitle="Wellness · Fitness · Mind · Food"
      tileGradient="post-grad-emerald"
      title="Bites"
    />
  );
}
