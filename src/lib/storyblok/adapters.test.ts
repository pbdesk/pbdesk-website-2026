/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import { postStoryToPost } from "./adapters";
import type { PostStory } from "./types";

describe("Storyblok post adapter", () => {
  test("maps published and updated dates for sitemap freshness", () => {
    const post = postStoryToPost({
      content: {
        _uid: "content",
        category: "Tool",
        component: "post",
        excerpt: "A short post.",
        gradient: "post-grad-indigo",
        labels: ["AI"],
        pillar: "bits",
        read_time: "2 min read",
        title: "A Storyblok Post",
      },
      published_at: "2026-05-01T10:30:00.000Z",
      slug: "a-storyblok-post",
      updated_at: "2026-05-10T09:15:00.000Z",
    } as PostStory);

    expect(post.publishedAt).toBe("2026-05-01T10:30:00.000Z");
    expect(post.updatedAt).toBe("2026-05-10T09:15:00.000Z");
  });
});

import {
  adaptHubStory,
  type BrainBoostHubData,
  getHubFallback,
} from "./adapters";
import type {
  BrainBoostHubPageStory,
  HubBenefitBlok,
  HubGameBlok,
  HubMetaItemBlok,
} from "./types";

function makeHubStory(
  overrides: Partial<BrainBoostHubPageStory["content"]> = {}
): BrainBoostHubPageStory {
  const metaItem: HubMetaItemBlok = {
    _uid: "m1",
    component: "hub_meta_item",
    value: "5",
    label: "games live",
    icon: "Layers",
  };
  const game: HubGameBlok = {
    _uid: "g1",
    component: "hub_game",
    slug: "sudoku",
    name: "Sudoku",
    status: "live",
    category: "Logic",
    description: "Classic 9×9.",
    href: "/brain-boost/sudoku",
  };
  const benefit: HubBenefitBlok = {
    _uid: "b1",
    component: "hub_benefit",
    icon: "Brain",
    title: "Focus",
    body: "Stay focused.",
  };
  return {
    content: {
      _uid: "content",
      component: "brain_boost_hub_page",
      intro_title: "My Brain Boost",
      intro_tagline: "Custom tagline",
      intro_lede: "Custom lede text.",
      meta_items: [metaItem],
      games: [game],
      daily_heading: "Today's KenKen",
      daily_body: "A fresh puzzle every day.",
      daily_cta_play: "Play now",
      benefits_heading: "Why play?",
      benefits: [benefit],
      seo_title: "Custom SEO title",
      seo_description: "Custom SEO desc.",
      ...overrides,
    },
    slug: "hub",
    full_slug: "brain-boost/hub",
  } as unknown as BrainBoostHubPageStory;
}

describe("adaptHubStory", () => {
  test("maps intro fields", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.title).toBe("My Brain Boost");
    expect(data.tagline).toBe("Custom tagline");
    expect(data.lede).toBe("Custom lede text.");
  });

  test("maps meta items", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.metaItems).toHaveLength(1);
    expect(data.metaItems[0].value).toBe("5");
    expect(data.metaItems[0].label).toBe("games live");
    expect(data.metaItems[0].icon).toBe("Layers");
  });

  test("maps games", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.games).toHaveLength(1);
    expect(data.games[0].slug).toBe("sudoku");
    expect(data.games[0].status).toBe("live");
    expect(data.games[0].href).toBe("/brain-boost/sudoku");
  });

  test("maps daily strip fields", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.dailyHeading).toBe("Today's KenKen");
    expect(data.dailyBody).toBe("A fresh puzzle every day.");
    expect(data.dailyCtaPlay).toBe("Play now");
  });

  test("maps benefits", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.benefits).toHaveLength(1);
    expect(data.benefits[0].icon).toBe("Brain");
    expect(data.benefits[0].title).toBe("Focus");
    expect(data.benefits[0].body).toBe("Stay focused.");
  });

  test("maps SEO fields", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.seoTitle).toBe("Custom SEO title");
    expect(data.seoDescription).toBe("Custom SEO desc.");
  });

  test("returns empty arrays when blok arrays are absent", () => {
    const data = adaptHubStory(
      makeHubStory({
        meta_items: undefined,
        games: undefined,
        benefits: undefined,
      })
    );
    expect(data.metaItems).toEqual([]);
    expect(data.games).toEqual([]);
    expect(data.benefits).toEqual([]);
  });
});

describe("getHubFallback", () => {
  test("returns a valid BrainBoostHubData shape", () => {
    const data: BrainBoostHubData = getHubFallback();
    expect(data.title).toBeTruthy();
    expect(data.lede).toBeTruthy();
    expect(data.metaItems.length).toBeGreaterThan(0);
    expect(data.games.length).toBeGreaterThan(0);
    expect(data.benefits.length).toBeGreaterThan(0);
  });

  test("fallback metaItems match BRAIN_BOOST_META", () => {
    const data = getHubFallback();
    expect(data.metaItems[0].icon).toBe("Layers");
    expect(data.metaItems[0].value).toBe("1");
  });

  test("fallback games include the live KenKen entry", () => {
    const data = getHubFallback();
    const kenken = data.games.find((g) => g.slug === "kenken");
    expect(kenken).toBeDefined();
    expect(kenken?.status).toBe("live");
  });
});
