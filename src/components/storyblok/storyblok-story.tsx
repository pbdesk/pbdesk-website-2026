"use client";

import { useStoryblokState } from "@storyblok/react";
import type { ISbStoryData } from "@storyblok/react/rsc";
import type { ReactNode } from "react";

export default function StoryblokStory<TContent>({
  story,
  children,
}: {
  story: ISbStoryData<TContent> | null;
  children: (story: ISbStoryData<TContent> | null) => ReactNode;
}) {
  const liveStory = useStoryblokState(story);
  return <>{children(liveStory)}</>;
}
