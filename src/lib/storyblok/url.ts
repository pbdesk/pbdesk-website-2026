// Normalize Storyblok asset URLs. The Storyblok CDN returns protocol-relative
// URLs (`//a.storyblok.com/f/...`) which Next.js's <Image> rejects — they
// must be absolute (https://). This helper accepts undefined/null/empty
// strings and returns undefined so callers can early-return cleanly.

import type { SbLinkField } from "./types";

export function normalizeAssetUrl(
  url: string | null | undefined
): string | undefined {
  if (!url) {
    return;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

/**
 * Resolve a Storyblok multilink field to an href string.
 *
 * Storyblok populates different fields based on `linktype`:
 *   - "url"    → `url` holds the editor-typed value (relative or absolute)
 *   - "story"  → `cached_url` holds the story's full_slug (no leading slash);
 *                `url` is "".
 *   - "email"  → `email` holds the address; needs "mailto:" prefix.
 *   - "asset"  → `url` holds the asset URL.
 *
 * The naive `url ?? cached_url` shortcut returns the empty string when an
 * editor switches a link from a URL to an internal story (`??` only falls
 * through on null/undefined, not ""). This resolver picks the right field
 * based on linktype and ensures internal story slugs carry a leading slash.
 */
export function resolveLinkHref(
  link: SbLinkField | undefined,
  fallback = "#"
): string {
  if (!link) {
    return fallback;
  }
  if (link.linktype === "email" && link.email) {
    return `mailto:${link.email}`;
  }
  if (link.linktype === "story") {
    const slug = link.cached_url ?? "";
    if (!slug) {
      return fallback;
    }
    const withSlash = slug.startsWith("/") ? slug : `/${slug}`;
    return link.anchor ? `${withSlash}#${link.anchor}` : withSlash;
  }
  // linktype: "url" or "asset" (or undefined). Prefer a non-empty `url`,
  // then fall back to a non-empty `cached_url`.
  if (link.url && link.url.length > 0) {
    return link.url;
  }
  if (link.cached_url && link.cached_url.length > 0) {
    return link.cached_url;
  }
  return fallback;
}
