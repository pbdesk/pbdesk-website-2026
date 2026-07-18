import type { Metadata } from "next";
import TaxonomyIndex from "@/components/landing/taxonomy-index";
import { pageMetadata } from "@/lib/seo";
import { groupByLabel } from "@/lib/storyblok/adapters";
import { loadAllPosts } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  description:
    "Every PBDesk post grouped by label — Browser, AIAgent, VSCode, Yoga, Mindfulness, and more. Pick a tag to see related posts.",
  path: "/labels",
  title: "Labels — Browse PBDesk by tag",
});

export default async function LabelsIndexPage() {
  const posts = await loadAllPosts();
  const groups = groupByLabel(posts).map(
    ({ name, count, pillars, pillarCounts }) => ({
      count,
      name,
      pillarCounts,
      pillars,
    })
  );

  return (
    <TaxonomyIndex
      description="Posts grouped by label across all three pillars. Labels are the fine-grained tags applied to each post — pick one to see everything matching."
      hrefBase="/labels"
      kind="label"
      terms={groups}
      title="Labels"
    />
  );
}
