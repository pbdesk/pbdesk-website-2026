import type { MetadataRoute } from "next";
import {
  buildSitemapEntry,
  getLatestPostLastModified,
  getPostLastModified,
  type RouteEntry,
} from "@/lib/sitemap";
import { groupByCategory, groupByLabel } from "@/lib/storyblok/adapters";
import { loadAllPosts } from "@/lib/storyblok/landing";

const STATIC_ROUTES: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/bits", changeFrequency: "weekly", priority: 0.9 },
  { path: "/bites", changeFrequency: "weekly", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/labels", changeFrequency: "weekly", priority: 0.7 },
  { path: "/brain-boost", changeFrequency: "weekly", priority: 0.9 },
  { path: "/brain-boost/kenken", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await loadAllPosts();

  const postRoutes: RouteEntry[] = posts.map((post) => ({
    path: `/${post.pillar}/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: getPostLastModified(post),
  }));

  const categoryRoutes: RouteEntry[] = groupByCategory(posts).map((group) => ({
    path: `/categories/${encodeURIComponent(group.name)}`,
    changeFrequency: "weekly",
    priority: 0.6,
    lastModified: getLatestPostLastModified(group.posts),
  }));

  const labelRoutes: RouteEntry[] = groupByLabel(posts).map((group) => ({
    path: `/labels/${encodeURIComponent(group.name)}`,
    changeFrequency: "weekly",
    priority: 0.5,
    lastModified: getLatestPostLastModified(group.posts),
  }));

  const allRoutes: RouteEntry[] = [
    ...STATIC_ROUTES,
    ...postRoutes,
    ...categoryRoutes,
    ...labelRoutes,
  ];

  return allRoutes.map(buildSitemapEntry);
}
