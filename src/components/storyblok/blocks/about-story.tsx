import AboutStoryComponent from "@/components/about/about-story";
import { resolveLinkHref } from "@/lib/storyblok/url";
import { editable } from "./editable";
import { richtextToParagraphs } from "./richtext-inline";
import type { AboutStoryBlok } from "./types";

export default function AboutStory({ blok }: { blok: AboutStoryBlok }) {
  const left = richtextToParagraphs(blok.column_left);
  const right = richtextToParagraphs(blok.column_right);
  return (
    <div {...editable(blok)}>
      <AboutStoryComponent
        eyebrow={blok.eyebrow}
        heading={blok.heading}
        leftParagraphs={left.length ? left : undefined}
        quoteAttribution={blok.quote_attribution}
        quoteHref={
          blok.quote_link ? resolveLinkHref(blok.quote_link, "") : undefined
        }
        quoteText={blok.quote_text}
        rightParagraphs={right.length ? right : undefined}
      />
    </div>
  );
}
