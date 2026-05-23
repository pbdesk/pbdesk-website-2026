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
