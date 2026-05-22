import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import type { PostWithSlug } from "@/lib/storyblok/adapters";

export type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

export interface RouteEntry {
  changeFrequency: ChangeFrequency;
  lastModified?: Date;
  path: string;
  priority: number;
}

export function parseSitemapDate(value?: null | string): Date | undefined {
  if (!value?.trim()) {
    return;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function getPostLastModified(
  post: Pick<PostWithSlug, "publishedAt" | "updatedAt">
): Date | undefined {
  return parseSitemapDate(post.updatedAt) ?? parseSitemapDate(post.publishedAt);
}

export function getLatestPostLastModified(
  posts: Pick<PostWithSlug, "publishedAt" | "updatedAt">[]
): Date | undefined {
  let latest: Date | undefined;

  for (const post of posts) {
    const lastModified = getPostLastModified(post);
    if (!lastModified) {
      continue;
    }
    if (!latest || lastModified > latest) {
      latest = lastModified;
    }
  }

  return latest;
}

export function buildSitemapEntry({
  path,
  changeFrequency,
  priority,
  lastModified,
}: RouteEntry): MetadataRoute.Sitemap[number] {
  const entry: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  };

  if (lastModified) {
    entry.lastModified = lastModified;
  }

  return entry;
}
