import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { groupByCategory, groupByLabel } from "@/lib/storyblok/adapters";
import { loadAllPosts } from "@/lib/storyblok/landing";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

interface RouteEntry {
  changeFrequency: ChangeFrequency;
  lastModified?: Date;
  path: string;
  priority: number;
}

const STATIC_ROUTES: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/bits", changeFrequency: "weekly", priority: 0.9 },
  { path: "/bites", changeFrequency: "weekly", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/labels", changeFrequency: "weekly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await loadAllPosts();

  const postRoutes: RouteEntry[] = posts.map((post) => ({
    path: `/${post.pillar}/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: now,
  }));

  const categoryRoutes: RouteEntry[] = groupByCategory(posts).map((group) => ({
    path: `/categories/${encodeURIComponent(group.name)}`,
    changeFrequency: "weekly",
    priority: 0.6,
    lastModified: now,
  }));

  const labelRoutes: RouteEntry[] = groupByLabel(posts).map((group) => ({
    path: `/labels/${encodeURIComponent(group.name)}`,
    changeFrequency: "weekly",
    priority: 0.5,
    lastModified: now,
  }));

  const allRoutes: RouteEntry[] = [
    ...STATIC_ROUTES,
    ...postRoutes,
    ...categoryRoutes,
    ...labelRoutes,
  ];

  return allRoutes.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ?? now,
    changeFrequency,
    priority,
  }));
}
