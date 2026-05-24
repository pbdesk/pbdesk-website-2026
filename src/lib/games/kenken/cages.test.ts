/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { assignCage, partitionCages } from "./cages";
import { mulberry32 } from "./rng";
import type { Cell } from "./types";

function flat([r, c]: Cell): string {
  return `${r},${c}`;
}

function isContiguous(cells: Cell[]): boolean {
  const set = new Set(cells.map(flat));
  const seen = new Set<string>();
  const stack: Cell[] = [cells[0]];
  while (stack.length > 0) {
    const [r, c] = stack.pop() as Cell;
    const key = `${r},${c}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nKey = `${r + dr},${c + dc}`;
      if (set.has(nKey)) {
        stack.push([r + dr, c + dc]);
      }
    }
  }
  return seen.size === cells.length;
}

describe("partitionCages", () => {
  for (const size of [3, 4, 5, 6, 7, 9]) {
    test(`covers every cell exactly once for ${size}x${size}`, () => {
      const cages = partitionCages(size, 4, mulberry32(size + 5));
      const counts = new Map<string, number>();
      for (const cage of cages) {
        for (const cell of cage) {
          counts.set(flat(cell), (counts.get(flat(cell)) ?? 0) + 1);
        }
      }
      expect(counts.size).toBe(size * size);
      for (const n of counts.values()) {
        expect(n).toBe(1);
      }
    });

    test(`every cage is contiguous and within size bounds for ${size}x${size}`, () => {
      const maxCageSize = 4;
      const cages = partitionCages(size, maxCageSize, mulberry32(size + 5));
      for (const cage of cages) {
        expect(cage.length).toBeGreaterThanOrEqual(1);
        expect(cage.length).toBeLessThanOrEqual(maxCageSize);
        expect(isContiguous(cage)).toBe(true);
      }
    });
  }
});

describe("assignCage", () => {
  const solution = [
    [1, 2, 3],
    [2, 3, 1],
    [3, 1, 2],
  ];

  test("single-cell cage becomes an '=' freebie", () => {
    const cage = assignCage(
      [[0, 0]],
      solution,
      ["+", "-", "*", "/"],
      mulberry32(1)
    );
    expect(cage.op).toBe("=");
    expect(cage.target).toBe(1);
  });

  test("subtraction target is the absolute difference", () => {
    // cells (0,0)=1 and (1,0)=2 -> only allow subtraction
    const cage = assignCage(
      [
        [0, 0],
        [1, 0],
      ],
      solution,
      ["-"],
      mulberry32(1)
    );
    expect(cage.op).toBe("-");
    expect(cage.target).toBe(1);
  });

  test("division only chosen when it divides evenly; target is larger/smaller", () => {
    // cells (0,1)=2 and (1,1)=3 do NOT divide evenly -> division must not be picked
    const nonDiv = assignCage(
      [
        [0, 1],
        [1, 1],
      ],
      solution,
      ["/"],
      mulberry32(1)
    );
    expect(nonDiv.op).not.toBe("/");
    // cells (0,0)=1 and (1,0)=2 divide evenly -> division allowed, target 2
    const div = assignCage(
      [
        [0, 0],
        [1, 0],
      ],
      solution,
      ["/"],
      mulberry32(1)
    );
    expect(div.op).toBe("/");
    expect(div.target).toBe(2);
  });

  test("multi-cell (>=3) cage uses + or * with correct target", () => {
    const cells: Cell[] = [
      [0, 0],
      [0, 1],
      [0, 2],
    ]; // values 1,2,3
    const sumCage = assignCage(cells, solution, ["+"], mulberry32(1));
    expect(sumCage.op).toBe("+");
    expect(sumCage.target).toBe(6);
    const prodCage = assignCage(cells, solution, ["*"], mulberry32(1));
    expect(prodCage.op).toBe("*");
    expect(prodCage.target).toBe(6);
  });
});
