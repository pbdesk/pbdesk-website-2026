import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TaxonomyListing from "@/components/landing/taxonomy-listing";
import { pageMetadata } from "@/lib/seo";
import { groupByCategory } from "@/lib/storyblok/adapters";
import { loadAllPosts } from "@/lib/storyblok/landing";

interface RouteParams {
  category: string;
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const posts = await loadAllPosts();
  return groupByCategory(posts).map(({ name }) => ({
    category: encodeURIComponent(name),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  return pageMetadata({
    title: `${decoded} — Category on PBDesk`,
    description: `Every PBDesk post in the ${decoded} category — across Bits, Bites, and Blog.`,
    path: `/categories/${encodeURIComponent(decoded)}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const posts = await loadAllPosts();
  const match = groupByCategory(posts).find(
    (group) => group.name.toLowerCase() === decoded.toLowerCase()
  );
  if (!match) {
    notFound();
  }

  return (
    <TaxonomyListing
      accentColor=""
      kind="category"
      posts={match.posts}
      term={match.name}
    />
  );
}
