import HeroComponent from "@/components/home/hero";
import { resolveLinkHref } from "@/lib/storyblok/url";
import { editable } from "./editable";
import { richtextToInline } from "./richtext-inline";
import type { HeroBlok } from "./types";

export default function Hero({ blok }: { blok: HeroBlok }) {
  return (
    <div {...editable(blok)}>
      <HeroComponent
        ctaHref={resolveLinkHref(blok.cta_href, "#pillars")}
        ctaLabel={blok.cta_label}
        eyebrow={blok.eyebrow}
        headline={richtextToInline(blok.headline)}
        kicker={blok.kicker}
        secondaryCtaHref={resolveLinkHref(blok.secondary_cta_href, "/about")}
        secondaryCtaLabel={blok.secondary_cta_label}
        showPillarLinks={blok.show_pillar_links ?? true}
        showSocial={blok.show_social ?? true}
        subheadline={richtextToInline(blok.subheadline)}
      />
    </div>
  );
}
