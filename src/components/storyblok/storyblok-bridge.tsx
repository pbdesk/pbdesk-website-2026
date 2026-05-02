"use client";

// Loads the Storyblok visual editor bridge and triggers a router refresh
// whenever the editor reports a content change. Mounted in (site)/layout.tsx
// only when draftMode is on, so it never runs for normal visitors.
//
// Why router.refresh() instead of useStoryblokState():
//   useStoryblokState only re-renders the *single component that calls it*
//   with the new story shape. Our pages render the body server-side via the
//   <Page> dispatcher, with each block rendered as a server component. To
//   re-render with new content we need to re-run the server component tree,
//   and router.refresh() does exactly that — Next.js re-fetches the route
//   with draftMode still active and our cv-busted Storyblok requests pull
//   the latest draft.

import { loadStoryblokBridge } from "@storyblok/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface BridgeInstance {
  off?: (handler?: () => void) => void;
  on: (events: string[], handler: () => void) => void;
}

interface BridgeConstructor {
  new (options?: Record<string, unknown>): BridgeInstance;
}

const BRIDGE_EVENTS = ["input", "change", "published", "unpublished"] as const;

export default function StoryblokBridge() {
  const router = useRouter();

  useEffect(() => {
    let bridge: BridgeInstance | null = null;

    loadStoryblokBridge()
      .then(() => {
        const Bridge = (
          window as unknown as { StoryblokBridge?: BridgeConstructor }
        ).StoryblokBridge;
        if (!Bridge) {
          return;
        }
        bridge = new Bridge({});
        bridge.on([...BRIDGE_EVENTS], () => {
          router.refresh();
        });
      })
      .catch(() => {
        // Bridge failed to load — silently ignore.
      });

    return () => {
      bridge?.off?.();
    };
  }, [router]);

  return null;
}
