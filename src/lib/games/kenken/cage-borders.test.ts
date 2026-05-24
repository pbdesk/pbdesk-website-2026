/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { buildCellCageMap, computeCageBorders } from "./cage-borders";
import type { Cage } from "./types";

const cages: Cage[] = [
  {
    cells: [
      [0, 0],
      [0, 1],
    ],
    op: "+",
    target: 3,
  },
  { cells: [[0, 2]], op: "=", target: 2 },
  {
    cells: [
      [1, 0],
      [2, 0],
    ],
    op: "-",
    target: 1,
  },
  {
    cells: [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ],
    op: "*",
    target: 24,
  },
];

describe("buildCellCageMap", () => {
  test("maps each cell to its cage index", () => {
    const map = buildCellCageMap(3, cages);
    expect(map[0][0]).toBe(0);
    expect(map[0][1]).toBe(0);
    expect(map[0][2]).toBe(1);
    expect(map[1][0]).toBe(2);
    expect(map[2][2]).toBe(3);
  });
});

describe("computeCageBorders", () => {
  const borders = computeCageBorders(3, cages);

  test("grid boundary edges are always thick", () => {
    expect(borders[0][0].top).toBe("thick");
    expect(borders[0][0].left).toBe("thick");
    expect(borders[2][2].bottom).toBe("thick");
    expect(borders[2][2].right).toBe("thick");
  });

  test("edge between two cells in the SAME cage is thin", () => {
    expect(borders[0][0].right).toBe("thin");
    expect(borders[0][1].left).toBe("thin");
  });

  test("edge between cells in DIFFERENT cages is thick", () => {
    expect(borders[0][1].right).toBe("thick");
    expect(borders[0][2].left).toBe("thick");
    expect(borders[1][1].left).toBe("thick");
  });
});
