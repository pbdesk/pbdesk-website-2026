// Renders a post's intro_blocks (youtube_embed) followed by its richtext
// body. Uses the main `@storyblok/react` StoryblokRichText (works in both
// server and client trees) so the same block can be rendered server-side
// for SEO/SSR and inside <LivePage> for live editor updates. Element-level
// styling lives in the .post-prose class (Tailwind Typography not in use).

import { StoryblokRichText } from "@storyblok/react";
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
        <StoryblokRichText
          doc={body as Parameters<typeof StoryblokRichText>[0]["doc"]}
        />
      ) : null}
    </article>
  );
}
