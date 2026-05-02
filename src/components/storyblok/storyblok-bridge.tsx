"use client";

// Loads the Storyblok visual editor bridge and triggers a router refresh
// whenever the editor reports a content change.
//
// Self-gating: this component is mounted unconditionally in the site layout,
// but it only loads the bridge script when the page is running inside an
// iframe (i.e., the Storyblok visual editor) or carries _storyblok* preview
// params. For regular visitors, it's a no-op — no script is fetched, no
// listeners are registered.
//
// Why not gate on draftMode() instead?
//   The /api/draft handler sets the __prerender_bypass cookie with the
//   default SameSite=Lax, which the browser refuses to send on iframe
//   sub-requests originating from app.storyblok.com (a different origin).
//   That makes draftMode().isEnabled return false inside the iframe, even
//   though we ARE in the editor. Detecting the iframe directly bypasses
//   the cookie machinery entirely.
//
// router.refresh() is used in addition to per-component <LivePage> /
// <LiveRichText> wrappers so non-block-driven UI (header, footer, etc.)
// also reflects published changes promptly.

import { loadStoryblokBridge } from "@storyblok/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface BridgeEvent {
  action?: string;
  story?: { id: number };
}

interface BridgeInstance {
  off?: (handler?: (event: BridgeEvent) => void) => void;
  on: (events: string[], handler: (event: BridgeEvent) => void) => void;
}

interface BridgeConstructor {
  new (options?: Record<string, unknown>): BridgeInstance;
}

const BRIDGE_EVENTS = ["input", "change", "published", "unpublished"] as const;

function isInsideIframe(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.parent !== window;
  } catch {
    // Cross-origin access can throw — that itself is a signal we're in an iframe.
    return true;
  }
}

function isStoryblokPreview(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  for (const key of params.keys()) {
    if (key.startsWith("_storyblok")) {
      return true;
    }
  }
  return false;
}

export default function StoryblokBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!(isInsideIframe() || isStoryblokPreview())) {
      return;
    }
    let bridge: BridgeInstance | null = null;

    loadStoryblokBridge().then(() => {
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
    });

    return () => {
      bridge?.off?.();
    };
  }, [router]);

  return null;
}
