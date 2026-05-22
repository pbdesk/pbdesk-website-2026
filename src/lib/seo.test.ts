/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import { resolveSiteUrl } from "./seo";

describe("site URL resolution", () => {
  test("uses the public production domain on Vercel production deploys", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_VERCEL_URL: "pbdesk-website-2026-preview.vercel.app",
        VERCEL_ENV: "production",
        VERCEL_URL: "pbdesk-website-2026-preview.vercel.app",
      })
    ).toBe("https://www.pbdesk.com");
  });

  test("keeps preview deploy URLs for Vercel preview deploys", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_VERCEL_URL: "pbdesk-website-2026-preview.vercel.app",
        VERCEL_ENV: "preview",
      })
    ).toBe("https://pbdesk-website-2026-preview.vercel.app");
  });

  test("normalizes an explicit public site URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://www.pbdesk.com/",
        VERCEL_ENV: "production",
      })
    ).toBe("https://www.pbdesk.com");
  });
});
