import { getStoryblokApi } from "@storyblok/react/rsc";
import { unstable_noStore as noStore } from "next/cache";
import { cookies, draftMode, headers } from "next/headers";
import "./init";
import { STORYBLOK_CACHE_TAG, storyTag } from "./tags";
import type {
  AboutPageStory,
  DisclaimerPageStory,
  GlobalConfigStory,
  HomePageStory,
  LandingPageStory,
  PillarKey,
  PostStory,
} from "./types";

interface FetchStoryOptions {
  resolveLinks?: "url" | "story";
  resolveRelations?: string[];
}

// Names kept in sync with src/middleware.ts and src/app/api/draft/route.ts
// (duplicated here to keep the client lib free of server-route imports).
const PREVIEW_COOKIE = "sb-preview";
const PREVIEW_HEADER = "x-sb-preview";

async function isDraft(): Promise<boolean> {
  // Three signals, any one of them enables draft fetching:
  //   1. Next's built-in draftMode (top-level navigation through /api/draft)
  //   2. Our SameSite=None sb-preview cookie (works in the Storyblok iframe
  //      across navigations, set by /api/draft and by middleware)
  //   3. The x-sb-preview request header (set by middleware on the *current*
  //      request when the URL contains _storyblok* query params — this
  //      handles the very first iframe load before any cookie is set)
  const [{ isEnabled }, cookieStore, headersList] = await Promise.all([
    draftMode(),
    cookies(),
    headers(),
  ]);
  if (isEnabled) {
    return true;
  }
  if (cookieStore.get(PREVIEW_COOKIE)) {
    return true;
  }
  return headersList.get(PREVIEW_HEADER) === "1";
}

async function fetchStoryRaw<TStory>(
  slug: string,
  options: FetchStoryOptions = {}
): Promise<TStory | null> {
  const draft = await isDraft();
  if (draft) {
    // Opt this whole request out of Next's data cache so router.refresh()
    // always pulls fresh draft content. Without this, the underlying fetch
    // can be served from the Server Component data cache even though our
    // route is dynamic.
    noStore();
  }
  const api = getStoryblokApi();
  try {
    const { data } = await api.get(`cdn/stories/${slug}`, {
      version: draft ? "draft" : "published",
      resolve_links: options.resolveLinks ?? "url",
      resolve_relations: options.resolveRelations?.join(",") ?? undefined,
      cv: draft ? Date.now() : undefined,
      token: draft
        ? process.env.STORYBLOK_PREVIEW_TOKEN
        : process.env.STORYBLOK_ACCESS_TOKEN,
    });
    return data?.story as TStory;
  } catch {
    return null;
  }
}

async function fetchStoriesRaw<TStory>(params: {
  startsWith?: string;
  contentType?: string;
  perPage?: number;
  page?: number;
  sortBy?: string;
}): Promise<TStory[]> {
  const draft = await isDraft();
  const api = getStoryblokApi();
  const { data } = await api.get("cdn/stories", {
    version: draft ? "draft" : "published",
    starts_with: params.startsWith,
    content_type: params.contentType,
    per_page: params.perPage ?? 100,
    page: params.page ?? 1,
    sort_by: params.sortBy,
    cv: draft ? Date.now() : undefined,
    token: draft
      ? process.env.STORYBLOK_PREVIEW_TOKEN
      : process.env.STORYBLOK_ACCESS_TOKEN,
  });
  return (data?.stories ?? []) as TStory[];
}

export function fetchHomeStory(): Promise<HomePageStory | null> {
  return fetchStoryRaw<HomePageStory>("home");
}

export function fetchAboutStory(): Promise<AboutPageStory | null> {
  return fetchStoryRaw<AboutPageStory>("about");
}

export function fetchDisclaimerStory(): Promise<DisclaimerPageStory | null> {
  return fetchStoryRaw<DisclaimerPageStory>("disclaimer");
}

export function fetchGlobalConfig(): Promise<GlobalConfigStory | null> {
  return fetchStoryRaw<GlobalConfigStory>("_global/config");
}

export function fetchLandingStory(
  pillar: PillarKey
): Promise<LandingPageStory | null> {
  return fetchStoryRaw<LandingPageStory>(`${pillar}/index`);
}

export function fetchPostStory(
  pillar: PillarKey,
  slug: string
): Promise<PostStory | null> {
  return fetchStoryRaw<PostStory>(`${pillar}/${slug}`);
}

export async function fetchStoriesByPillar(
  pillar: PillarKey
): Promise<PostStory[]> {
  const stories = await fetchStoriesRaw<PostStory>({
    startsWith: `${pillar}/`,
    contentType: "post",
    perPage: 100,
    sortBy: "content.published_at:desc",
  });
  return stories.filter((s) => !s.full_slug.endsWith("/index"));
}

export async function fetchAllPosts(): Promise<PostStory[]> {
  const stories = await fetchStoriesRaw<PostStory>({
    contentType: "post",
    perPage: 100,
    sortBy: "content.published_at:desc",
  });
  return stories;
}

export const storyblokCacheTags = {
  all: STORYBLOK_CACHE_TAG,
  story: storyTag,
};
