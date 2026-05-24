// src/components/games/kenken/timer.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { formatDuration } from "./timer";

describe("formatDuration", () => {
  test("formats seconds as M:SS", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(600)).toBe("10:00");
  });
});
