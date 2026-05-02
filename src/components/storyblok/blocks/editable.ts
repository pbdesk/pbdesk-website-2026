// Thin typed wrapper around `storyblokEditable`. We import from the main
// `@storyblok/react` entry (not /rsc) because the same blocks are now
// rendered both server-side AND client-side (under <LivePage> for live
// in-iframe editing). storyblokEditable is a pure function — same impl
// in both entries — so this works in either rendering context.

import { storyblokEditable as sbStoryblokEditable } from "@storyblok/react";
import type { SbBlokBase } from "@/lib/storyblok/types";

type Editable = Parameters<typeof sbStoryblokEditable>[0];

export function editable(blok: SbBlokBase): Record<string, unknown> {
  return sbStoryblokEditable(blok as unknown as Editable) as Record<
    string,
    unknown
  >;
}
