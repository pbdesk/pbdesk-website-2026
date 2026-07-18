/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import { buildSitemapEntry, getPostLastModified } from "./sitemap";
import type { PostWithSlug } from "./storyblok/adapters";

describe("sitemap helpers", () => {
  test("uses a post updated date before its published date", () => {
    const lastModified = getPostLastModified({
      publishedAt: "2026-05-01T10:30:00.000Z",
      updatedAt: "2026-05-10T09:15:00.000Z",
    } as PostWithSlug);

    expect(lastModified?.toISOString()).toBe("2026-05-10T09:15:00.000Z");
  });

  test("omits lastModified when a route has no content date", () => {
    expect(
      buildSitemapEntry({
        changeFrequency: "weekly",
        path: "/about",
        priority: 0.8,
      })
    ).toEqual({
      changeFrequency: "weekly",
      priority: 0.8,
      url: "https://www.pbdesk.com/about",
    });
  });
});
