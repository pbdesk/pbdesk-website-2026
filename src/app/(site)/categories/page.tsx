import type { Metadata } from "next";
import TaxonomyIndex from "@/components/landing/taxonomy-index";
import { pageMetadata } from "@/lib/seo";
import { groupByCategory } from "@/lib/storyblok/adapters";
import { loadAllPosts } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  title: "Categories — Browse PBDesk by topic",
  description:
    "Every PBDesk post grouped by category — Tool, AI, Tutorial, Wellness, Fitness, and more. Pick a topic to dive in.",
  path: "/categories",
});

export default async function CategoriesIndexPage() {
  const posts = await loadAllPosts();
  const groups = groupByCategory(posts).map(
    ({ name, count, pillars, pillarCounts }) => ({
      name,
      count,
      pillars,
      pillarCounts,
    })
  );

  return (
    <TaxonomyIndex
      description="Posts grouped by category across all three pillars — Bits, Bites, and Blog. Pick one to explore everything tagged with that topic."
      hrefBase="/categories"
      kind="category"
      terms={groups}
      title="Categories"
    />
  );
}
