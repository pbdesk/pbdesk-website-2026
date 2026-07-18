import type { Metadata } from "next";
import AllPostsListing from "@/components/landing/all-posts-listing";
import type { Post } from "@/components/landing/post-card";
import { pillarAccents } from "@/lib/pillars";
import { pageMetadata } from "@/lib/seo";
import { loadPillarData } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  description:
    "The full archive of Bites — wellness, fitness, mindfulness, nutrition, and recovery notes. Filter by category and label to find what fits.",
  path: "/bites/all",
  title: "All Bites — Browse every Bites post",
});

const FALLBACK_DESCRIPTION =
  "Every Bites post in one place. Filter by category or label to focus on movement, nutrition, sleep, mindfulness, and the small daily habits that compound.";

const fallbackPosts: Post[] = [];

export default async function BitesAllPage() {
  const data = await loadPillarData("bites", {
    cadence: "weekly",
    description: FALLBACK_DESCRIPTION,
    fallbackPosts,
  });

  return (
    <AllPostsListing
      accentColor={pillarAccents.bites.primary}
      bannerDarkSrc={data.bannerDarkSrc}
      bannerLightSrc={data.bannerLightSrc}
      description={data.description}
      pillar="bites"
      posts={data.posts}
      title="Bites"
    />
  );
}
