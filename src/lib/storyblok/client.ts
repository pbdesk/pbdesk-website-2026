// Storyblok Content Delivery API client.
//
// Uses native fetch (not the SDK's axios-backed client) so we can pass
// Next's `next: { tags }` option. The /api/revalidate webhook calls
// revalidateTag against the same tag names, which is how published edits
// flush the route cache without a redeploy.
//
// Draft requests bypass the cache entirely (`cache: "no-store"` + a cv
// busting param) so the visual editor sees keystroke-fresh content.

import { unstable_noStore as noStore } from "next/cache";
import { cookies, draftMode, headers } from "next/headers";
import "./init";
import { STORY_RELATION_PATHS } from "./relations";
import { STORYBLOK_CACHE_TAG, storyTag } from "./tags";
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

interface FetchStoryOptions {
  resolveLinks?: "url" | "story";
  resolveRelations?: string[];
}

// Names duplicated here (vs imported from src/proxy.ts and the route
// handler) to keep this lib free of server-route imports.
const PREVIEW_COOKIE = "sb-preview";
const PREVIEW_HEADER = "x-sb-preview";

const API_HOSTS: Record<string, string> = {
  eu: "api.storyblok.com",
  us: "api-us.storyblok.com",
  ca: "api-ca.storyblok.com",
  ap: "api-ap.storyblok.com",
  cn: "app.storyblokchina.cn",
};

function getApiHost(): string {
  const region = process.env.STORYBLOK_REGION ?? "eu";
  return API_HOSTS[region] ?? API_HOSTS.eu;
}

// Wrapper that swallows Next's `DYNAMIC_SERVER_USAGE` error. cookies(),
// headers(), and draftMode() throw that error when called from a static
// rendering context (generateStaticParams, generateMetadata for SSG routes,
// or the page body during build-time pre-rendering). For those contexts
// we want "not a draft session" — i.e. the published path — so swallowing
// the error and treating it as null is the correct fallback.
async function safeReadDynamic<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}

async function isDraft(): Promise<boolean> {
  // Cheap signals first. The sb-preview cookie + x-sb-preview header are
  // set by src/proxy.ts on visual editor iframe loads — checking them first
  // means anonymous traffic never reaches draftMode().
  const cookieStore = await safeReadDynamic(cookies);
  if (cookieStore?.get(PREVIEW_COOKIE)?.value === "1") {
    return true;
  }
  const headersList = await safeReadDynamic(headers);
  if (headersList?.get(PREVIEW_HEADER) === "1") {
    return true;
  }
  // Fall back to Next's draftMode for top-level navigation through /api/draft.
  const draft = await safeReadDynamic(draftMode);
  return draft?.isEnabled ?? false;
}

interface FetchOptions {
  draft: boolean;
  query: Record<string, string | undefined>;
  tags: string[];
}

async function storyblokFetch<TResult>(
  path: string,
  { query, tags, draft }: FetchOptions
): Promise<TResult | null> {
  const url = new URL(`https://${getApiHost()}/v2/${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }
  url.searchParams.set("version", draft ? "draft" : "published");
  url.searchParams.set(
    "token",
    (draft
      ? process.env.STORYBLOK_PREVIEW_TOKEN
      : process.env.STORYBLOK_ACCESS_TOKEN) ?? ""
  );
  if (draft) {
    url.searchParams.set("cv", String(Date.now()));
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    ...(draft ? { cache: "no-store" } : { next: { tags, revalidate: 3600 } }),
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as TResult;
}

// Walk the content tree and replace UUID strings/arrays at every configured
// `${component}.${field}` path with the matching resolved story from `rels`.
// Mirrors the inline-injection that storyblok-js-client does internally so
// downstream block components receive full story objects rather than UUIDs.
type RelByUuid = Map<string, { uuid: string }>;

function resolveBlokField(
  blok: Record<string, unknown>,
  key: string,
  byUuid: RelByUuid
): void {
  const value = blok[key];
  if (typeof value === "string") {
    const resolved = byUuid.get(value);
    if (resolved) {
      blok[key] = resolved;
    }
    return;
  }
  if (Array.isArray(value)) {
    blok[key] = value
      .map((uuid) =>
        typeof uuid === "string" ? (byUuid.get(uuid) ?? uuid) : uuid
      )
      .filter((entry) => typeof entry !== "string");
  }
}

function resolveBlokRelations(
  blok: Record<string, unknown> & { component?: string },
  pathSet: Set<string>,
  byUuid: RelByUuid
): void {
  if (typeof blok.component !== "string") {
    return;
  }
  for (const key of Object.keys(blok)) {
    if (pathSet.has(`${blok.component}.${key}`)) {
      resolveBlokField(blok, key, byUuid);
    }
  }
}

function walkContent(
  node: unknown,
  pathSet: Set<string>,
  byUuid: RelByUuid
): void {
  if (!node) {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      walkContent(item, pathSet, byUuid);
    }
    return;
  }
  if (typeof node !== "object") {
    return;
  }
  const blok = node as Record<string, unknown> & { component?: string };
  resolveBlokRelations(blok, pathSet, byUuid);
  for (const value of Object.values(blok)) {
    walkContent(value, pathSet, byUuid);
  }
}

function inlineRelations(
  story: { content?: Record<string, unknown> } | undefined,
  rels: { uuid: string }[],
  paths: string[]
): void {
  if (!(story?.content && rels.length && paths.length)) {
    return;
  }
  const byUuid: RelByUuid = new Map(rels.map((r) => [r.uuid, r]));
  walkContent(story.content, new Set(paths), byUuid);
}

async function fetchStoryRaw<TStory>(
  slug: string,
  options: FetchStoryOptions = {}
): Promise<TStory | null> {
  const draft = await isDraft();
  if (draft) {
    // Belt-and-braces: ensure no enclosing cache scope serves stale data
    // for editor traffic, even if cache: "no-store" is somehow honored.
    noStore();
  }
  try {
    const data = await storyblokFetch<{
      rels?: { uuid: string }[];
      story?: TStory;
    }>(`cdn/stories/${slug}`, {
      draft,
      tags: [STORYBLOK_CACHE_TAG, storyTag(slug)],
      query: {
        resolve_links: options.resolveLinks ?? "url",
        resolve_relations: options.resolveRelations?.join(","),
      },
    });
    if (!data?.story) {
      return null;
    }
    if (options.resolveRelations?.length && data.rels?.length) {
      inlineRelations(
        data.story as { content?: Record<string, unknown> },
        data.rels,
        options.resolveRelations
      );
    }
    return data.story;
  } catch {
    return null;
  }
}

async function fetchStoriesRaw<TStory>(params: {
  startsWith?: string;
  contentType?: string;
  perPage?: number;
  sortBy?: string;
}): Promise<TStory[]> {
  const draft = await isDraft();
  if (draft) {
    noStore();
  }
  // Storyblok caps `per_page` at 100. Loop until a page returns fewer
  // items than `perPage`, which signals the end of the result set. Hard
  // cap at 50 pages (5000 stories) as a safety net.
  const perPage = Math.min(params.perPage ?? 100, 100);
  const all: TStory[] = [];
  for (let page = 1; page <= 50; page += 1) {
    let chunk: TStory[];
    try {
      const data = await storyblokFetch<{ stories?: TStory[] }>("cdn/stories", {
        draft,
        tags: [STORYBLOK_CACHE_TAG],
        query: {
          starts_with: params.startsWith,
          content_type: params.contentType,
          per_page: String(perPage),
          page: String(page),
          sort_by: params.sortBy,
        },
      });
      chunk = data?.stories ?? [];
    } catch {
      break;
    }
    all.push(...chunk);
    if (chunk.length < perPage) {
      break;
    }
  }
  return all;
}

export function fetchHomeStory(): Promise<HomePageStory | null> {
  return fetchStoryRaw<HomePageStory>("home", {
    resolveRelations: STORY_RELATION_PATHS,
  });
}

export function fetchAboutStory(): Promise<AboutPageStory | null> {
  return fetchStoryRaw<AboutPageStory>("about");
}

export function fetchDisclaimerStory(): Promise<DisclaimerPageStory | null> {
  return fetchStoryRaw<DisclaimerPageStory>("disclaimer");
}

export function fetchPrivacyPolicyStory(): Promise<PrivacyPolicyPageStory | null> {
  return fetchStoryRaw<PrivacyPolicyPageStory>("privacy-policy");
}

export function fetchGlobalConfig(): Promise<GlobalConfigStory | null> {
  return fetchStoryRaw<GlobalConfigStory>("_global/config");
}

export function fetchLandingStory(
  pillar: PillarKey
): Promise<LandingPageStory | null> {
  // Pillar landing stories are folder startpages (is_startpage: true), so
  // their full_slug is just the folder name (e.g. "bits"), not "bits/index".
  return fetchStoryRaw<LandingPageStory>(pillar, {
    resolveRelations: STORY_RELATION_PATHS,
  });
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

export function fetchAllPosts(): Promise<PostStory[]> {
  return fetchStoriesRaw<PostStory>({
    contentType: "post",
    perPage: 100,
    sortBy: "content.published_at:desc",
  });
}
