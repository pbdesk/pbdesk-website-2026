import type { Metadata } from "next";
import AllPostsListing from "@/components/landing/all-posts-listing";
import type { Post } from "@/components/landing/post-card";
import { pillarAccents } from "@/lib/pillars";
import { pageMetadata } from "@/lib/seo";
import { loadPillarData } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  title: "All Bits — Browse every Bits post",
  description:
    "The full archive of Bits — AI tools, dev tools, browsers, VS Code extensions, and the frameworks shaping modern web development. Filter by category and label.",
  path: "/bits/all",
});

const FALLBACK_DESCRIPTION =
  "Every Bits post in one place. Filter by category or label to narrow in on AI agents, developer tools, browsers, frameworks, and more.";

const fallbackPosts: Post[] = [];

export default async function BitsAllPage() {
  const data = await loadPillarData("bits", {
    description: FALLBACK_DESCRIPTION,
    cadence: "weekly",
    fallbackPosts,
  });

  return (
    <AllPostsListing
      accentColor={pillarAccents.bits.primary}
      description={data.description}
      pillar="bits"
      posts={data.posts}
      title="Bits"
    />
  );
}
