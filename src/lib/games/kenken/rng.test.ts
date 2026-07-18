/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { mulberry32, randInt, shuffle } from "./rng";

describe("rng", () => {
  test("mulberry32 is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  test("mulberry32 produces values in [0, 1)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 100; i += 1) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test("randInt returns values in [0, maxExclusive)", () => {
    const r = mulberry32(1);
    for (let i = 0; i < 100; i += 1) {
      const v = randInt(r, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  test("shuffle is a permutation and deterministic for a seed", () => {
    const input = [1, 2, 3, 4, 5];
    const out1 = shuffle(mulberry32(99), input);
    const out2 = shuffle(mulberry32(99), input);
    expect(out1).toEqual(out2);
    expect([...out1].sort((x, y) => x - y)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]); // does not mutate input
  });
});
