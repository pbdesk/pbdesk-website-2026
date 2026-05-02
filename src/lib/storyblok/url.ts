// Normalize Storyblok asset URLs. The Storyblok CDN returns protocol-relative
// URLs (`//a.storyblok.com/f/...`) which Next.js's <Image> rejects — they
// must be absolute (https://). This helper accepts undefined/null/empty
// strings and returns undefined so callers can early-return cleanly.

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
