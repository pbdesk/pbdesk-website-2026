// Pillar / taxonomy page data loader. Fetches from Storyblok when env vars
// are present; gracefully returns null otherwise so the page can render
// hardcoded fallback content during development.
//
// `loadAllPosts` and `loadAllPostSlugs` are wrapped in React.cache so the
// taxonomy routes (which call them across generateStaticParams +
// generateMetadata + the page render) only fetch once per render pass.

import { cache } from "react";
import type { Post } from "@/components/landing/post-card";
import type { PostWithSlug } from "./adapters";
import { postStoryToPost } from "./adapters";
import {
  fetchAboutStory,
  fetchAllPosts,
  fetchDisclaimerStory,
  fetchGlobalConfig,
  fetchHomeStory,
  fetchLandingStory,
  fetchPostStory,
  fetchPrivacyPolicyStory,
  fetchStoriesByPillar,
} from "./client";
import type {
  AboutPageStory,
  DisclaimerPageStory,
  GlobalConfigStory,
  HomePageStory,
  LandingPageStory,
  PillarKey,
  PostStory,
  PrivacyPolicyPageStory,
} from "./types";

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
  // Either token is enough — the client picks the right one based on
  // whether the request is in draft mode.
  return Boolean(
    process.env.STORYBLOK_ACCESS_TOKEN || process.env.STORYBLOK_PREVIEW_TOKEN
  );
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

const fetchAllPostsCached = cache(async (): Promise<PostStory[]> => {
  if (!isStoryblokConfigured()) {
    return [];
  }
  try {
    const stories = await fetchAllPosts();
    return stories.filter((s) => !s.full_slug.endsWith("/index"));
  } catch {
    return [];
  }
});

/**
 * Load every post from Storyblok, mapped through the post adapter.
 * Used by /categories, /labels, and their per-term listing pages.
 * Cached at the React render level so generateStaticParams +
 * generateMetadata + the page handler share a single fetch.
 */
export async function loadAllPosts(): Promise<PostWithSlug[]> {
  const stories = await fetchAllPostsCached();
  return stories.map(postStoryToPost);
}

/**
 * Enumerate every imported post's `{ pillar, slug }` pair so the post
 * detail route can pre-generate static pages. Returns [] when Storyblok
 * isn't configured (build still succeeds; routes are dynamic at runtime).
 */
export async function loadAllPostSlugs(): Promise<
  { pillar: PillarKey; slug: string }[]
> {
  const stories = await fetchAllPostsCached();
  return stories.map((s) => ({ pillar: s.content.pillar, slug: s.slug }));
}

/**
 * Fetch a single post story by pillar + slug. Returns null if Storyblok
 * isn't configured, the fetch fails, or no story matches.
 */
export async function loadPostStory(
  pillar: PillarKey,
  slug: string
): Promise<PostStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchPostStory(pillar, slug);
  } catch {
    return null;
  }
}

/**
 * Fetch the `home` singleton story. Returns null when Storyblok isn't
 * configured or the story doesn't exist — homepage falls back to its
 * hardcoded section stack in that case.
 */
export async function loadHomeStory(): Promise<HomePageStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchHomeStory();
  } catch {
    return null;
  }
}

/**
 * Fetch the `_global/config` singleton — drives header nav, footer
 * columns, social links, and brand text. Returns null when Storyblok
 * isn't configured or the story doesn't exist (layout falls back to
 * hardcoded values).
 */
export async function loadGlobalConfig(): Promise<GlobalConfigStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchGlobalConfig();
  } catch {
    return null;
  }
}

/**
 * Fetch the `about` singleton story.
 */
export async function loadAboutStory(): Promise<AboutPageStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchAboutStory();
  } catch {
    return null;
  }
}

/**
 * Fetch the `disclaimer` singleton story.
 */
export async function loadDisclaimerStory(): Promise<DisclaimerPageStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchDisclaimerStory();
  } catch {
    return null;
  }
}

/**
 * Fetch the `privacy-policy` singleton story.
 */
export async function loadPrivacyPolicyStory(): Promise<PrivacyPolicyPageStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchPrivacyPolicyStory();
  } catch {
    return null;
  }
}
