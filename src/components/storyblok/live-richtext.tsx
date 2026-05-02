"use client";

// Client-side richtext renderer that updates live as the user types in the
// Storyblok visual editor — without waiting for the autosave-to-CDN cycle.
//
// How it works:
//   - useStoryblokState() subscribes to bridge `input` events for the
//     given story id. The hook returns the latest in-editor state of the
//     story on every keystroke.
//   - We pluck the richtext field out of that live state by name and
//     render via StoryblokRichText (client variant). No server round-trip.
//
// The server still does the initial render (via StoryblokServerRichText
// in the page); this component takes over on hydration so subsequent edits
// don't have to wait for autosave + router.refresh().

import {
  type ISbStoryData,
  StoryblokRichText,
  useStoryblokState,
} from "@storyblok/react";
import type { ReactNode } from "react";

interface LiveRichTextProps {
  className?: string;
  fallback?: ReactNode;
  /** Top-level key in `story.content` that holds the richtext doc. */
  fieldName: string;
  /** Story passed from the server. Used as the initial state before the bridge fires. */
  story: ISbStoryData<Record<string, unknown>>;
}

export default function LiveRichText({
  story,
  fieldName,
  className,
  fallback,
}: LiveRichTextProps) {
  const liveStory = useStoryblokState(story);
  const source = liveStory ?? story;
  const doc = source.content?.[fieldName];

  return (
    <article className={className ?? "post-prose mx-auto max-w-3xl"}>
      {doc ? (
        <StoryblokRichText
          doc={doc as Parameters<typeof StoryblokRichText>[0]["doc"]}
        />
      ) : (
        fallback
      )}
    </article>
  );
}
