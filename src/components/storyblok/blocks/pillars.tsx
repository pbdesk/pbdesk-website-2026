import PillarsComponent from "@/components/home/pillars";
import { normalizeAssetUrl, resolveLinkHref } from "@/lib/storyblok/url";
import { editable } from "./editable";
import type { PillarsBlok } from "./types";

export default function Pillars({ blok }: { blok: PillarsBlok }) {
  const cards = blok.cards?.map((card) => ({
    avatar: normalizeAssetUrl(card.avatar?.filename) ?? "",
    cta: card.cta_label ?? "",
    description: card.description ?? "",
    gradient: card.gradient_class ?? "pillar-bits-gradient",
    href: resolveLinkHref(card.href),
    name: card.name,
    title: card.title,
  }));

  return (
    <div {...editable(blok)}>
      <PillarsComponent
        cards={cards}
        eyebrow={blok.eyebrow}
        heading={blok.heading}
      />
    </div>
  );
}
