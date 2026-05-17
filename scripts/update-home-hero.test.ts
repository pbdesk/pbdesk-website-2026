/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import { buildHomeHeroBlok, homeHeroComponentSchema } from "./update-home-hero";

describe("home hero Storyblok updater", () => {
  test("adds the new editable hero fields to the component schema", () => {
    expect(homeHeroComponentSchema.schema?.secondary_cta_label?.type).toBe(
      "text"
    );
    expect(homeHeroComponentSchema.schema?.secondary_cta_href?.type).toBe(
      "multilink"
    );
    expect(homeHeroComponentSchema.schema?.show_pillar_links?.type).toBe(
      "boolean"
    );
  });

  test("builds the approved home hero content", () => {
    const blok = buildHomeHeroBlok();

    expect(blok.component).toBe("hero");
    expect(blok.eyebrow).toBe("Learning endeavor forever...");
    expect(blok.cta_label).toBe("Explore PBDesk");
    expect(blok.secondary_cta_label).toBe("About Pinal");
    expect(blok.show_pillar_links).toBe(true);
  });
});
