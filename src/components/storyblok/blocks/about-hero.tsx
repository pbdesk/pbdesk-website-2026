import AboutHeroComponent from "@/components/about/about-hero";
import { resolveLinkHref } from "@/lib/storyblok/url";
import { editable } from "./editable";
import type { AboutHeroBlok } from "./types";

export default function AboutHero({ blok }: { blok: AboutHeroBlok }) {
  return (
    <div {...editable(blok)}>
      <AboutHeroComponent
        chipLabel={blok.chip_label}
        description={blok.description}
        primaryCtaHref={resolveLinkHref(blok.primary_cta_href, "/blog")}
        primaryCtaLabel={blok.primary_cta_label}
        secondaryCtaHref={resolveLinkHref(
          blok.secondary_cta_href,
          "#social-links"
        )}
        secondaryCtaLabel={blok.secondary_cta_label}
        showSocial={blok.show_social ?? true}
        titleLead={blok.title_lead}
        titleName={blok.title_name}
        titleSubheadline={blok.title_subheadline}
      />
    </div>
  );
}
