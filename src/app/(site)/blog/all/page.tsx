import type { Metadata } from "next";
import AllPostsListing from "@/components/landing/all-posts-listing";
import type { Post } from "@/components/landing/post-card";
import { pillarAccents } from "@/lib/pillars";
import { pageMetadata } from "@/lib/seo";
import { loadPillarData } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  title: "All Blog posts — Browse every long-form essay",
  description:
    "The full archive of Blog posts — long-form reflections on software craft, AI, programming habits, and developer wellness. Filter by category and label.",
  path: "/blog/all",
});

const FALLBACK_DESCRIPTION =
  "Every Blog post in one place. Filter by category or label to dig into reflections on software, AI, programming habits, and the wellness practices behind them.";

const fallbackPosts: Post[] = [];

export default async function BlogAllPage() {
  const data = await loadPillarData("blog", {
    description: FALLBACK_DESCRIPTION,
    cadence: "weekly",
    fallbackPosts,
  });

  return (
    <AllPostsListing
      accentColor={pillarAccents.blog.primary}
      bannerDarkSrc={data.bannerDarkSrc}
      bannerLightSrc={data.bannerLightSrc}
      description={data.description}
      pillar="blog"
      posts={data.posts}
      title="Blog"
    />
  );
}
