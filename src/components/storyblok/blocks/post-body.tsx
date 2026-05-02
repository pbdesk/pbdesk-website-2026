// Renders a post's intro_blocks (youtube_embed) followed by its richtext
// body. Uses StoryblokServerRichText from @storyblok/react/rsc for the
// richtext, with element-level styling against the project's design tokens
// (Tailwind Typography is not in use).

import { StoryblokServerRichText } from "@storyblok/react/rsc";
import type { SbBlokBase } from "@/lib/storyblok/types";
import YoutubeEmbed from "./youtube-embed";

interface YoutubeEmbedBlok extends SbBlokBase {
  caption?: string;
  component: "youtube_embed";
  youtube_id: string;
}

interface PostBodyProps {
  body?: unknown;
  introBlocks?: SbBlokBase[];
}

function isYoutubeEmbed(blok: SbBlokBase): blok is YoutubeEmbedBlok {
  return blok.component === "youtube_embed";
}

export default function PostBody({ body, introBlocks }: PostBodyProps) {
  return (
    <article className="post-prose">
      {introBlocks?.map((blok) => {
        if (isYoutubeEmbed(blok)) {
          return (
            <YoutubeEmbed
              caption={blok.caption}
              key={blok._uid}
              youtubeId={blok.youtube_id}
            />
          );
        }
        return null;
      })}
      {body ? (
        <StoryblokServerRichText
          doc={body as Parameters<typeof StoryblokServerRichText>[0]["doc"]}
        />
      ) : null}
    </article>
  );
}
