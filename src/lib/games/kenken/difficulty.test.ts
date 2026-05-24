/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { DIFFICULTIES, isDifficulty, TIERS } from "./difficulty";

describe("difficulty config", () => {
  test("DIFFICULTIES lists all four tiers", () => {
    expect(DIFFICULTIES).toEqual(["easy", "intermediate", "hard", "genius"]);
  });

  test("isDifficulty narrows valid/invalid values", () => {
    expect(isDifficulty("easy")).toBe(true);
    expect(isDifficulty("genius")).toBe(true);
    expect(isDifficulty("medium")).toBe(false);
    expect(isDifficulty(null)).toBe(false);
  });

  test("easy 3x3 includes all four operations; 4x4/5x5 exclude division", () => {
    const v3 = TIERS.easy.variants.find((v) => v.size === 3);
    expect(v3?.ops).toEqual(["+", "-", "*", "/"]);

    for (const size of [4, 5]) {
      const v = TIERS.easy.variants.find((x) => x.size === size);
      expect(v?.ops).toEqual(["+", "-", "*"]);
    }
  });

  test("intermediate 4x4 and 5x5 include all four operations", () => {
    for (const v of TIERS.intermediate.variants) {
      expect(v.ops).toEqual(["+", "-", "*", "/"]);
    }
  });

  test("hard 6x6 and 7x7 exclude division", () => {
    for (const v of TIERS.hard.variants) {
      expect(v.ops).toEqual(["+", "-", "*"]);
    }
  });

  test("genius 6x6/7x7 use all ops; 8x8/9x9 exclude division", () => {
    for (const size of [6, 7]) {
      const v = TIERS.genius.variants.find((x) => x.size === size);
      expect(v?.ops).toEqual(["+", "-", "*", "/"]);
    }
    for (const size of [8, 9]) {
      const v = TIERS.genius.variants.find((x) => x.size === size);
      expect(v?.ops).toEqual(["+", "-", "*"]);
    }
  });

  test("tier sizes match the spec", () => {
    expect(TIERS.easy.variants.map((v) => v.size).sort()).toEqual([3, 4, 5]);
    expect(TIERS.intermediate.variants.map((v) => v.size).sort()).toEqual([
      4, 5,
    ]);
    expect(TIERS.hard.variants.map((v) => v.size).sort()).toEqual([6, 7]);
    expect(TIERS.genius.variants.map((v) => v.size).sort()).toEqual([
      6, 7, 8, 9,
    ]);
  });
});
