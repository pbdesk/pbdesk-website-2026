export const STORYBLOK_CACHE_TAG = "storyblok";

export function storyTag(fullSlug: string): string {
  return `storyblok:story:${fullSlug}`;
}
