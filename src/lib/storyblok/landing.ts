// Pillar / taxonomy page data loader. Fetches from Storyblok when env vars
// are present; gracefully returns null otherwise so the page can render
// hardcoded fallback content during development.

import type { Post } from "@/components/landing/post-card";
import type { PostWithSlug } from "./adapters";
import { postStoryToPost } from "./adapters";
import {
  fetchAllPosts,
  fetchLandingStory,
  fetchStoriesByPillar,
} from "./client";
import type { LandingPageStory, PillarKey } from "./types";

interface PillarPageData {
  cadence: string;
  description: string;
  /** True when content came from Storyblok; false when fallback was used. */
  fromStoryblok: boolean;
  /**
   * Posts ready for rendering. May be `PostWithSlug[]` (from Storyblok) or
   * `Post[]` (from the page's hardcoded fallback). Either is fine for the
   * presentation components — slug/pillar are optional on `Post`.
   */
  posts: Post[];
  story: LandingPageStory | null;
}

function isStoryblokConfigured(): boolean {
  return Boolean(process.env.STORYBLOK_ACCESS_TOKEN);
}

interface FallbackContent {
  cadence: string;
  description: string;
  fallbackPosts: Post[];
}

export async function loadPillarData(
  pillar: PillarKey,
  fallback: FallbackContent
): Promise<PillarPageData> {
  if (!isStoryblokConfigured()) {
    return {
      description: fallback.description,
      cadence: fallback.cadence,
      posts: fallback.fallbackPosts,
      fromStoryblok: false,
      story: null,
    };
  }

  try {
    const [story, postStories] = await Promise.all([
      fetchLandingStory(pillar),
      fetchStoriesByPillar(pillar),
    ]);
    if (!story) {
      return {
        description: fallback.description,
        cadence: fallback.cadence,
        posts: fallback.fallbackPosts,
        fromStoryblok: false,
        story: null,
      };
    }
    const posts = postStories.map(postStoryToPost);
    return {
      description: story.content.description ?? fallback.description,
      cadence: story.content.cadence ?? fallback.cadence,
      posts,
      fromStoryblok: true,
      story,
    };
  } catch {
    return {
      description: fallback.description,
      cadence: fallback.cadence,
      posts: fallback.fallbackPosts,
      fromStoryblok: false,
      story: null,
    };
  }
}

/**
 * Load every post from Storyblok, mapped through the post adapter.
 * Used by /categories, /labels, and their per-term listing pages.
 * Returns an empty array when Storyblok isn't configured or the fetch fails,
 * so taxonomy pages don't crash the build during local dev.
 */
export async function loadAllPosts(): Promise<PostWithSlug[]> {
  if (!isStoryblokConfigured()) {
    return [];
  }
  try {
    const stories = await fetchAllPosts();
    return stories
      .filter((s) => !s.full_slug.endsWith("/index"))
      .map(postStoryToPost);
  } catch {
    return [];
  }
}
