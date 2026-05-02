// Thin typed wrapper around `storyblokEditable` from @storyblok/react/rsc.
// The SDK expects `SbBlokData` (with an index signature); our typed bloks
// extend `SbBlokBase` which doesn't have one. Casting in one place keeps
// the wrappers tidy.

import { storyblokEditable as sbStoryblokEditable } from "@storyblok/react/rsc";
import type { SbBlokBase } from "@/lib/storyblok/types";

type Editable = Parameters<typeof sbStoryblokEditable>[0];

export function editable(blok: SbBlokBase): Record<string, unknown> {
  return sbStoryblokEditable(blok as unknown as Editable) as Record<
    string,
    unknown
  >;
}
