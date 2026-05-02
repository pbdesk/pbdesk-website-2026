"use client";

// Client-side wrapper that re-renders a `body: blocks` field as the user
// types in the Storyblok visual editor — without waiting for the
// autosave-to-CDN cycle.
//
// How it works:
//   - useStoryblokState() subscribes to bridge `input` events for the
//     given story id. The hook returns the latest in-editor state of the
//     story on every keystroke.
//   - We pluck the `body` (or named) blocks field out of that live state
//     and dispatch through the same generic <Page> renderer used for the
//     initial server render.
//
// Server still does the initial paint via <Page> in the page module; this
// component takes over on hydration so subsequent edits are instant.

import type { ISbStoryData } from "@storyblok/react";
import { useStoryblokState } from "@storyblok/react";
import Page from "@/components/storyblok/blocks/page";
import type { SbBlokBase } from "@/lib/storyblok/types";

interface LivePageProps {
  /** Top-level key in `story.content` that holds the blocks array. Defaults to "body". */
  fieldName?: string;
  /** Story passed from the server. Used as the initial state before the bridge fires. */
  story: ISbStoryData<Record<string, unknown>>;
}

export default function LivePage({ story, fieldName = "body" }: LivePageProps) {
  const liveStory = useStoryblokState(story);
  const source = liveStory ?? story;
  const body = source.content?.[fieldName] as SbBlokBase[] | undefined;
  return <Page body={body} />;
}
