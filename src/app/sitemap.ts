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
  { changeFrequency: "weekly", path: "/", priority: 1 },
  { changeFrequency: "monthly", path: "/about", priority: 0.8 },
  { changeFrequency: "yearly", path: "/disclaimer", priority: 0.3 },
  { changeFrequency: "weekly", path: "/blog", priority: 0.9 },
  { changeFrequency: "weekly", path: "/bits", priority: 0.9 },
  { changeFrequency: "weekly", path: "/bites", priority: 0.9 },
  { changeFrequency: "weekly", path: "/categories", priority: 0.7 },
  { changeFrequency: "weekly", path: "/labels", priority: 0.7 },
  { changeFrequency: "weekly", path: "/brain-boost", priority: 0.9 },
  { changeFrequency: "monthly", path: "/brain-boost/kenken", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await loadAllPosts();

  const postRoutes: RouteEntry[] = posts.map((post) => ({
    changeFrequency: "monthly",
    lastModified: getPostLastModified(post),
    path: `/${post.pillar}/${post.slug}`,
    priority: 0.7,
  }));

  const categoryRoutes: RouteEntry[] = groupByCategory(posts).map((group) => ({
    changeFrequency: "weekly",
    lastModified: getLatestPostLastModified(group.posts),
    path: `/categories/${encodeURIComponent(group.name)}`,
    priority: 0.6,
  }));

  const labelRoutes: RouteEntry[] = groupByLabel(posts).map((group) => ({
    changeFrequency: "weekly",
    lastModified: getLatestPostLastModified(group.posts),
    path: `/labels/${encodeURIComponent(group.name)}`,
    priority: 0.5,
  }));

  const allRoutes: RouteEntry[] = [
    ...STATIC_ROUTES,
    ...postRoutes,
    ...categoryRoutes,
    ...labelRoutes,
  ];

  return allRoutes.map(buildSitemapEntry);
}
