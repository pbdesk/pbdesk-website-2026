/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import robots from "./robots";

describe("robots metadata route", () => {
  test("allows framework assets needed for crawler rendering", () => {
    const result = robots();
    const [rule] = Array.isArray(result.rules) ? result.rules : [result.rules];
    const disallow = Array.isArray(rule.disallow)
      ? rule.disallow
      : [rule.disallow];

    expect(disallow).not.toContain("/_next/");
    expect(disallow).toContain("/api/");
  });

  test("points crawlers at the production sitemap", () => {
    expect(robots()).toMatchObject({
      host: "https://www.pbdesk.com",
      sitemap: "https://www.pbdesk.com/sitemap.xml",
    });
  });
});
