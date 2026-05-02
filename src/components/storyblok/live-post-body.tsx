"use client";

// Client-side wrapper that re-renders a post's `intro_blocks` + `body`
// richtext as the user types in the Storyblok visual editor.
//
// Mirrors <LivePage> / <LiveRichText> but specialized for the post detail
// shape: intro_blocks come first (e.g. youtube_embed) followed by the
// richtext body. Both update on bridge events without a server round-trip.

import type { ISbStoryData } from "@storyblok/react";
import { useStoryblokState } from "@storyblok/react";
import PostBody from "@/components/storyblok/blocks/post-body";
import type { SbBlokBase } from "@/lib/storyblok/types";

interface LivePostBodyProps {
  story: ISbStoryData<Record<string, unknown>>;
}

export default function LivePostBody({ story }: LivePostBodyProps) {
  const liveStory = useStoryblokState(story);
  const source = liveStory ?? story;
  const content = source.content ?? {};
  const introBlocks = (content.intro_blocks ?? []) as SbBlokBase[];
  const body = content.body;
  return <PostBody body={body} introBlocks={introBlocks} />;
}
