import type { Post } from "@/components/landing/post-card";
import type { PillarKey, PostStory } from "./types";

export type PostWithSlug = Post & {
  publishedAt?: string;
  slug: string;
  pillar: PillarKey;
  updatedAt?: string;
};

const PROTOCOL_RELATIVE = /^\/\//;

function firstDateValue(
  ...values: (null | string | undefined)[]
): string | undefined {
  for (const value of values) {
    if (value?.trim()) {
      return value;
    }
  }

  return;
}

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
    publishedAt: firstDateValue(
      story.published_at,
      story.first_published_at,
      c.published_at
    ),
    updatedAt: firstDateValue(story.updated_at, c.updated_at),
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

export interface TaxonomyGroup {
  count: number;
  name: string;
  pillarCounts: Partial<Record<PillarKey, number>>;
  pillars: PillarKey[];
  posts: PostWithSlug[];
}

function buildPillarMeta(postList: PostWithSlug[]): {
  pillars: PillarKey[];
  pillarCounts: Partial<Record<PillarKey, number>>;
} {
  const counts: Partial<Record<PillarKey, number>> = {};
  for (const post of postList) {
    counts[post.pillar] = (counts[post.pillar] ?? 0) + 1;
  }
  return { pillars: Object.keys(counts) as PillarKey[], pillarCounts: counts };
}

/**
 * Group posts by category for the /categories index page.
 */
export function groupByCategory(posts: PostWithSlug[]): TaxonomyGroup[] {
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
      ...buildPillarMeta(postList),
      posts: postList,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Group posts by label for the /labels index page. Each post can appear in
 * multiple groups (one per label).
 */
export function groupByLabel(posts: PostWithSlug[]): TaxonomyGroup[] {
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
      ...buildPillarMeta(postList),
      posts: postList,
    }))
    .sort((a, b) => b.count - a.count);
}

import type { BrainBoostGame } from "@/components/brain-boost/hub/games-registry";
import { BRAIN_BOOST_GAMES } from "@/components/brain-boost/hub/games-registry";
import type {
  Benefit,
  BenefitIconKey,
  BrainBoostMetaItem,
} from "@/components/brain-boost/hub/meta";
import {
  BENEFITS,
  BRAIN_BOOST_LEDE,
  BRAIN_BOOST_META,
  BRAIN_BOOST_TAGLINE,
  BRAIN_BOOST_TITLE,
} from "@/components/brain-boost/hub/meta";
import type {
  BrainBoostHubPageStory,
  HubBenefitBlok,
  HubGameBlok,
  HubMetaItemBlok,
} from "./types";

export interface BrainBoostHubData {
  benefits: Benefit[];
  benefitsHeading: string;
  dailyBody: string;
  dailyCtaPlay: string;
  dailyHeading: string;
  games: BrainBoostGame[];
  lede: string;
  metaItems: BrainBoostMetaItem[];
  seoDescription: string;
  seoTitle: string;
  tagline: string;
  title: string;
}

function adaptMetaItem(blok: HubMetaItemBlok): BrainBoostMetaItem {
  return { value: blok.value, label: blok.label, icon: blok.icon };
}

function adaptGame(blok: HubGameBlok): BrainBoostGame {
  return {
    slug: blok.slug,
    name: blok.name,
    status: blok.status,
    category: blok.category,
    description: blok.description ?? "",
    href: blok.href,
    coverImage: blok.cover_image,
    glyph: blok.glyph,
    tiers: blok.tiers,
    estTime: blok.est_time,
    operations: blok.operations,
  };
}

function adaptBenefit(blok: HubBenefitBlok): Benefit {
  return {
    icon: blok.icon as BenefitIconKey,
    title: blok.title,
    body: blok.body,
  };
}

export function adaptHubStory(
  story: BrainBoostHubPageStory
): BrainBoostHubData {
  const c = story.content;
  return {
    title: c.intro_title ?? BRAIN_BOOST_TITLE,
    tagline: c.intro_tagline ?? BRAIN_BOOST_TAGLINE,
    lede: c.intro_lede ?? BRAIN_BOOST_LEDE,
    metaItems: (c.meta_items ?? []).map(adaptMetaItem),
    games: (c.games ?? []).map(adaptGame),
    dailyHeading: c.daily_heading ?? "Today's daily — Intermediate",
    dailyBody:
      c.daily_body ??
      "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
    dailyCtaPlay: c.daily_cta_play ?? "Play today's",
    benefitsHeading: c.benefits_heading ?? "Why Brain Boost?",
    benefits: (c.benefits ?? []).map(adaptBenefit),
    seoTitle: c.seo_title ?? "",
    seoDescription: c.seo_description ?? "",
  };
}

export function getHubFallback(): BrainBoostHubData {
  return {
    title: BRAIN_BOOST_TITLE,
    tagline: BRAIN_BOOST_TAGLINE,
    lede: BRAIN_BOOST_LEDE,
    metaItems: [...BRAIN_BOOST_META],
    games: [...BRAIN_BOOST_GAMES],
    dailyHeading: "Today's daily — Intermediate",
    dailyBody:
      "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
    dailyCtaPlay: "Play today's",
    benefitsHeading: "Why Brain Boost?",
    benefits: [...BENEFITS],
    seoTitle: "",
    seoDescription: "",
  };
}
