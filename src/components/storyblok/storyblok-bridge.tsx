"use client";

// Loads the Storyblok visual editor bridge and triggers a router refresh
// whenever the editor reports a content change.
//
// Self-gating: this component is mounted unconditionally in the site layout,
// but it only loads the bridge script when the page is running inside an
// iframe (i.e., the Storyblok visual editor). For regular visitors, the
// component is a no-op — no script is fetched, no listeners are registered.
//
// Why not gate on draftMode() instead?
//   The /api/draft handler sets the __prerender_bypass cookie with the
//   default SameSite=Lax, which the browser refuses to send on iframe
//   sub-requests originating from app.storyblok.com (a different origin).
//   That makes draftMode().isEnabled return false inside the iframe, even
//   though we ARE in the editor. Detecting the iframe directly bypasses
//   the cookie machinery entirely.
//
// Why router.refresh() instead of useStoryblokState():
//   useStoryblokState only re-renders the single component that calls it.
//   Our pages render the body server-side via the <Page> dispatcher, so we
//   need to re-run the entire server tree. router.refresh() does that.
//   Each Storyblok fetch in client.ts uses cv: Date.now() in draft mode to
//   bust the CDN cache.

import { loadStoryblokBridge } from "@storyblok/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const log = (...args: unknown[]): void => console.log("[sb-bridge]", ...args);

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
  // Storyblok appends _storyblok_tk[token]/_storyblok_release/etc to the
  // URL when loading the iframe. Honor any of these as a signal.
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
    const inIframe = isInsideIframe();
    const inPreview = isStoryblokPreview();
    if (!(inIframe || inPreview)) {
      // Regular visitor — skip script load entirely.
      return;
    }
    log(
      "mounted; iframe=",
      inIframe,
      "preview=",
      inPreview,
      "loading bridge script…"
    );
    let bridge: BridgeInstance | null = null;

    loadStoryblokBridge()
      .then(() => {
        const Bridge = (
          window as unknown as { StoryblokBridge?: BridgeConstructor }
        ).StoryblokBridge;
        if (!Bridge) {
          log(
            "bridge script loaded but window.StoryblokBridge is missing — abort"
          );
          return;
        }
        bridge = new Bridge({});
        bridge.on([...BRIDGE_EVENTS], (event) => {
          log("event", event?.action ?? "(no action)", event);
          router.refresh();
        });
        log("bridge connected; subscribed to", [...BRIDGE_EVENTS].join(", "));
      })
      .catch((err) => {
        log("loadStoryblokBridge() failed:", err);
      });

    return () => {
      bridge?.off?.();
    };
  }, [router]);

  return null;
}
