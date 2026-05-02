import AboutComponent from "@/components/home/about";
import { normalizeAssetUrl } from "@/lib/storyblok/url";
import { editable } from "./editable";
import { richtextToInline } from "./richtext-inline";
import type { AboutSectionBlok } from "./types";

export default function AboutSection({ blok }: { blok: AboutSectionBlok }) {
  const portrait = normalizeAssetUrl(blok.portrait?.filename);
  return (
    <div {...editable(blok)}>
      <AboutComponent
        bio={richtextToInline(blok.bio)}
        chipLabel={blok.chip_label}
        eyebrow={blok.eyebrow}
        headline={blok.headline}
        portraitAlt={blok.portrait?.alt ?? "Pinal Bhatt"}
        portraitSrc={portrait ?? "/pb/pb1.jpg"}
        showSocial={blok.show_social ?? true}
      />
    </div>
  );
}
