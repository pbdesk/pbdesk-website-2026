/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  DEFAULT_REVEAL_STAGGER_MS,
  DEFAULT_REVEAL_VARIANT,
  getRevealStaggerDelay,
  getRevealVariant,
  MAX_REVEAL_STAGGER_MS,
} from "./reveal-motion";

describe("reveal motion helpers", () => {
  test("uses a deterministic fade-up default", () => {
    expect(DEFAULT_REVEAL_VARIANT).toBe("up");
    expect(getRevealVariant()).toBe("up");
  });

  test("preserves an explicit reveal variant", () => {
    expect(getRevealVariant("fade")).toBe("fade");
  });

  test("stagger delays increase in small capped steps", () => {
    expect(DEFAULT_REVEAL_STAGGER_MS).toBe(90);
    expect(getRevealStaggerDelay(0)).toBe(0);
    expect(getRevealStaggerDelay(1)).toBe(90);
    expect(getRevealStaggerDelay(3)).toBe(270);
    expect(getRevealStaggerDelay(99)).toBe(MAX_REVEAL_STAGGER_MS);
  });

  test("normalizes negative and fractional indexes", () => {
    expect(getRevealStaggerDelay(-1)).toBe(0);
    expect(getRevealStaggerDelay(2.8)).toBe(180);
  });
});
