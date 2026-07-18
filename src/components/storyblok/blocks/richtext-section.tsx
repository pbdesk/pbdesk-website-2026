import { StoryblokRichText } from "@storyblok/react";
import { editable } from "./editable";
import type { RichtextSectionBlok } from "./types";

export default function RichtextSection({
  blok,
}: {
  blok: RichtextSectionBlok;
}) {
  return (
    <section className="py-12 sm:py-16" {...editable(blok)}>
      <div className="wrapper">
        <article className="post-prose mx-auto max-w-3xl">
          {blok.content ? (
            <StoryblokRichText
              document={
                blok.content as Parameters<
                  typeof StoryblokRichText
                >[0]["document"]
              }
            />
          ) : null}
        </article>
      </div>
    </section>
  );
}
