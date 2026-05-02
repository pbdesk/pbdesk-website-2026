import type { Post } from "@/components/landing/post-card";
import type { PillarKey, PostStory } from "./types";

export type PostWithSlug = Post & { slug: string; pillar: PillarKey };

export function postStoryToPost(story: PostStory): PostWithSlug {
  const c = story.content;
  return {
    title: c.title,
    description: c.excerpt,
    category: c.category,
    tags: c.labels ?? [],
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
