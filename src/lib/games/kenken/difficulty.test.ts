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

  test("easy 4x4 and 5x5 variants exclude division", () => {
    const easyBig = TIERS.easy.variants.filter((v) => v.size > 3);
    expect(easyBig.length).toBe(2);
    for (const v of easyBig) {
      expect(v.ops).not.toContain("/");
    }
  });

  test("easy 3x3 includes all four operations", () => {
    const v3 = TIERS.easy.variants.find((v) => v.size === 3);
    expect(v3?.ops).toEqual(["+", "-", "*", "/"]);
  });

  test("intermediate, hard, genius use all four operations", () => {
    for (const tier of ["intermediate", "hard", "genius"] as const) {
      for (const v of TIERS[tier].variants) {
        expect(v.ops).toEqual(["+", "-", "*", "/"]);
      }
    }
  });

  test("tier sizes match the spec", () => {
    expect(TIERS.easy.variants.map((v) => v.size).sort()).toEqual([3, 4, 5]);
    expect(TIERS.intermediate.variants.map((v) => v.size).sort()).toEqual([
      4, 5,
    ]);
    expect(TIERS.hard.variants.map((v) => v.size).sort()).toEqual([6, 7]);
    expect(TIERS.genius.variants.map((v) => v.size).sort()).toEqual([8, 9]);
  });
});
