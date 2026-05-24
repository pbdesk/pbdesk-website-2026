/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { cageLabel, cageLabelCell, operationSymbol } from "./display";
import type { Cage } from "./types";

describe("operationSymbol", () => {
  test("maps ASCII operators to display glyphs", () => {
    expect(operationSymbol("+")).toBe("+");
    expect(operationSymbol("-")).toBe("−"); // minus sign −
    expect(operationSymbol("*")).toBe("×"); // times ×
    expect(operationSymbol("/")).toBe("÷"); // division ÷
  });

  test("single-cell '=' has no operator glyph", () => {
    expect(operationSymbol("=")).toBe("");
  });
});

describe("cageLabel", () => {
  test("multi-cell cage shows target + operator", () => {
    const cage: Cage = {
      cells: [
        [0, 0],
        [0, 1],
      ],
      op: "*",
      target: 12,
    };
    expect(cageLabel(cage)).toBe("12×");
  });

  test("single-cell cage shows just the number", () => {
    const cage: Cage = { cells: [[0, 0]], op: "=", target: 3 };
    expect(cageLabel(cage)).toBe("3");
  });
});

describe("cageLabelCell", () => {
  test("returns the top-left-most cell (min row, then min col)", () => {
    const cage: Cage = {
      cells: [
        [1, 2],
        [0, 2],
        [0, 1],
      ],
      op: "+",
      target: 6,
    };
    expect(cageLabelCell(cage)).toEqual([0, 1]);
  });
});
