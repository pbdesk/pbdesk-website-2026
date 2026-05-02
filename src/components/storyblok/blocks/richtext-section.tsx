import { StoryblokServerRichText } from "@storyblok/react/rsc";
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
            <StoryblokServerRichText
              doc={
                blok.content as Parameters<
                  typeof StoryblokServerRichText
                >[0]["doc"]
              }
            />
          ) : null}
        </article>
      </div>
    </section>
  );
}
