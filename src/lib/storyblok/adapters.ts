import type { Post } from "@/components/landing/post-card";
import type { PillarKey, PostStory } from "./types";

export type PostWithSlug = Post & { slug: string; pillar: PillarKey };

const PROTOCOL_RELATIVE = /^\/\//;

export function postStoryToPost(story: PostStory): PostWithSlug {
  const c = story.content;
  return {
    title: c.title,
    description: c.excerpt,
    category: c.category,
    coverImage: c.cover_image?.filename
      ? c.cover_image.filename.replace(PROTOCOL_RELATIVE, "https://")
      : undefined,
    labels: c.labels ?? [],
    readTime: c.read_time,
    gradient: c.gradient,
    featured: c.featured ?? false,
    slug: story.slug,
    pillar: c.pillar,
  };
}

export function pickFeatured(posts: PostWithSlug[]): {
  featured?: PostWithSlug;
  rest: PostWithSlug[];
} {
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p !== featured);
  return { featured, rest };
}

export function deriveFilterChips(
  posts: PostWithSlug[]
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Group posts by category for the /categories index page.
 */
export function groupByCategory(
  posts: PostWithSlug[]
): { name: string; count: number; posts: PostWithSlug[] }[] {
  const map = new Map<string, PostWithSlug[]>();
  for (const post of posts) {
    const list = map.get(post.category) ?? [];
    list.push(post);
    map.set(post.category, list);
  }
  return Array.from(map.entries())
    .map(([name, postList]) => ({
      name,
      count: postList.length,
      posts: postList,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Group posts by label for the /labels index page. Each post can appear in
 * multiple groups (one per label).
 */
export function groupByLabel(
  posts: PostWithSlug[]
): { name: string; count: number; posts: PostWithSlug[] }[] {
  const map = new Map<string, PostWithSlug[]>();
  for (const post of posts) {
    for (const label of post.labels) {
      const list = map.get(label) ?? [];
      list.push(post);
      map.set(label, list);
    }
  }
  return Array.from(map.entries())
    .map(([name, postList]) => ({
      name,
      count: postList.length,
      posts: postList,
    }))
    .sort((a, b) => b.count - a.count);
}
