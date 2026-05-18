/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  DEFAULT_SMOOTH_SCROLL_DURATION_MS,
  easeInOutCubic,
  getScrollTargetTop,
} from "./smooth-scroll";

describe("smooth scroll helpers", () => {
  test("uses a one second default duration", () => {
    expect(DEFAULT_SMOOTH_SCROLL_DURATION_MS).toBe(1000);
  });

  test("calculates the absolute target scroll position", () => {
    expect(getScrollTargetTop(420, 180)).toBe(600);
  });

  test("eases from rest to destination", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });
});
