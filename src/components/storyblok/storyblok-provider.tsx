"use client";

// Initializes the Storyblok client SDK so `useStoryblokState` and friends can
// hydrate live updates inside the visual editor.
//
// Token is received as a prop (not read from process.env) so the value never
// gets inlined into the public client bundle. The site layout only renders
// this provider for draft sessions; public visitors never receive the prop
// or the token.

import { apiPlugin, storyblokInit } from "@storyblok/react";
import { type ReactNode, useState } from "react";

interface Props {
  accessToken: string;
  children: ReactNode;
  region?: string;
}

let isInitialized = false;

export default function StoryblokProvider({
  accessToken,
  children,
  region = "eu",
}: Props) {
  // useState's lazy initializer runs once per component instance. Combined
  // with the module-level guard, storyblokInit fires at most once per page
  // load even if the layout briefly remounts.
  useState(() => {
    if (isInitialized) {
      return;
    }
    storyblokInit({
      accessToken,
      apiOptions: { region },
      components: {},
      use: [apiPlugin],
    });
    isInitialized = true;
  });

  return <>{children}</>;
}
