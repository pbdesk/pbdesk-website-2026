/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import {
  FALLBACK_LEVELS,
  FALLBACK_OPERATIONS,
  FALLBACK_STEPS,
} from "./fallback-content";

describe("fallback content", () => {
  test("lists the four operations with display glyphs", () => {
    const symbols = FALLBACK_OPERATIONS.map((o) => o.symbol);
    expect(symbols).toEqual(["+", "−", "×", "÷"]);
  });

  test("lists all four difficulty tiers", () => {
    const names = FALLBACK_LEVELS.map((l) => l.name);
    expect(names).toEqual(["Easy", "Intermediate", "Hard", "Genius"]);
  });

  test("has at least three how-to steps", () => {
    expect(FALLBACK_STEPS.length).toBeGreaterThanOrEqual(3);
    for (const step of FALLBACK_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
    }
  });
});
