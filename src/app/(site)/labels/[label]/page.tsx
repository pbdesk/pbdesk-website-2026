import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TaxonomyListing from "@/components/landing/taxonomy-listing";
import { pageMetadata } from "@/lib/seo";
import { groupByLabel } from "@/lib/storyblok/adapters";
import { loadAllPosts } from "@/lib/storyblok/landing";

interface RouteParams {
  label: string;
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const posts = await loadAllPosts();
  // Return raw values — Next encodes route params when generating paths.
  // Returning encoded values here would result in double-encoded URLs.
  return groupByLabel(posts).map(({ name }) => ({ label: name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { label } = await params;
  return pageMetadata({
    title: `#${label} — Label on PBDesk`,
    description: `Every PBDesk post tagged with #${label} across Bits, Bites, and Blog.`,
    path: `/labels/${encodeURIComponent(label)}`,
  });
}

export default async function LabelPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { label } = await params;
  const posts = await loadAllPosts();
  const match = groupByLabel(posts).find(
    (group) => group.name.toLowerCase() === label.toLowerCase()
  );
  if (!match) {
    notFound();
  }

  return (
    <TaxonomyListing
      accentColor=""
      kind="label"
      posts={match.posts}
      term={match.name}
    />
  );
}
