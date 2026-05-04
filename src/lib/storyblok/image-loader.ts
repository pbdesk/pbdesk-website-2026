"use client";

// Routes <Image> requests for Storyblok-hosted assets through Storyblok's own
// image service (`/m/{w}x0/filters:quality(q):format(webp)`) so they bypass
// Vercel's image optimizer entirely. Non-Storyblok URLs (e.g. /public/* assets)
// are returned unchanged.
//
// Why: on Vercel Hobby the image optimizer has a monthly source-image quota.
// Storyblok already serves resized + WebP variants from its CDN, so routing
// content images through Vercel adds latency and burns quota for no quality
// gain.

interface ImageLoaderProps {
  quality?: number;
  src: string;
  width: number;
}

const STORYBLOK_HOST = "a.storyblok.com";
const DEFAULT_QUALITY = 75;

export default function storyblokImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const isStoryblokAsset =
    src.includes(`${STORYBLOK_HOST}/f/`) || src.startsWith("/f/");
  if (!isStoryblokAsset) {
    return src;
  }

  const absolute = src.startsWith("http")
    ? src
    : `https://${STORYBLOK_HOST}${src}`;
  const q = quality ?? DEFAULT_QUALITY;
  return `${absolute}/m/${width}x0/filters:quality(${q}):format(webp)`;
}
