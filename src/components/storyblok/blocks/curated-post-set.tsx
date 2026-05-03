// Storyblok wrapper for the `curated_post_set` block. The CDA returns
// `pillar` + `posts` as story UUIDs by default; the storyblok client
// (and bridge) is configured with resolveRelations for these paths so the
// fields arrive as fully-inflated stories. We still guard against the
// pre-resolution shape (raw UUID strings) so the renderer degrades cleanly
// rather than crashing if relations are misconfigured.

import CuratedPostSet from "@/components/landing/curated-post-set";
import type { LandingPageStory, PostStory } from "@/lib/storyblok/types";
import { editable } from "./editable";
import type { CuratedPostSetBlok } from "./types";

function isStoryRef<T extends { content: unknown; uuid: string }>(
  value: unknown
): value is T {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    "uuid" in value
  );
}

export default function CuratedPostSetBlock({
  blok,
}: {
  blok: CuratedPostSetBlok;
}) {
  const pillar = isStoryRef<LandingPageStory>(blok.pillar) ? blok.pillar : null;
  const posts = (blok.posts ?? []).filter(isStoryRef<PostStory>);

  return (
    <div {...editable(blok)}>
      <CuratedPostSet
        eyebrow={blok.eyebrow}
        pillar={pillar}
        posts={posts}
        title={blok.title}
      />
    </div>
  );
}
