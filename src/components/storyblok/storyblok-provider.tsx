"use client";

import { apiPlugin, storyblokInit } from "@storyblok/react";
import type { ReactNode } from "react";

const region = process.env.NEXT_PUBLIC_STORYBLOK_REGION ?? "eu";
const accessToken = process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN;

storyblokInit({
  accessToken,
  use: [apiPlugin],
  apiOptions: {
    region,
  },
  components: {},
});

export default function StoryblokProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
