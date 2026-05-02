import HeroComponent from "@/components/home/hero";
import { editable } from "./editable";
import { richtextToInline } from "./richtext-inline";
import type { HeroBlok } from "./types";

export default function Hero({ blok }: { blok: HeroBlok }) {
  return (
    <div {...editable(blok)}>
      <HeroComponent
        ctaHref={blok.cta_href?.url ?? blok.cta_href?.cached_url ?? "/about"}
        ctaLabel={blok.cta_label}
        eyebrow={blok.eyebrow}
        headline={richtextToInline(blok.headline)}
        showSocial={blok.show_social ?? true}
        subheadline={richtextToInline(blok.subheadline)}
      />
    </div>
  );
}
