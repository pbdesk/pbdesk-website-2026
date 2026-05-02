import PillarsComponent from "@/components/home/pillars";
import { normalizeAssetUrl } from "@/lib/storyblok/url";
import { editable } from "./editable";
import type { PillarsBlok } from "./types";

export default function Pillars({ blok }: { blok: PillarsBlok }) {
  const cards = blok.cards?.map((card) => ({
    name: card.name,
    title: card.title,
    description: card.description ?? "",
    cta: card.cta_label ?? "",
    href: card.href?.url ?? card.href?.cached_url ?? "#",
    gradient: card.gradient_class ?? "pillar-bits-gradient",
    avatar: normalizeAssetUrl(card.avatar?.filename) ?? "",
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
