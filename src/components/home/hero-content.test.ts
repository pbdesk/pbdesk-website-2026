/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_HERO_PILLAR_LINKS,
} from "./hero-content";

describe("homepage hero defaults", () => {
  test("uses the approved editorial copy", () => {
    expect(DEFAULT_HERO_CONTENT.eyebrow).toBe("Learning endeavor forever...");
    expect(DEFAULT_HERO_CONTENT.headline).toBe("PBDesk");
    expect(DEFAULT_HERO_CONTENT.kicker).toBe("From the desk of Pinal Bhatt");
    expect(DEFAULT_HERO_CONTENT.subheadline).toBe(
      "A personal space where code, AI, wellness, and mindful living meet."
    );
  });

  test("exposes the three PBDesk pillars as hero links", () => {
    expect(DEFAULT_HERO_PILLAR_LINKS).toEqual([
      { href: "/bits", label: "Bits", tone: "bits" },
      { href: "/bites", label: "Bites", tone: "bites" },
      { href: "/blog", label: "Blog", tone: "blog" },
    ]);
  });
});
