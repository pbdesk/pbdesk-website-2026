import type { Metadata } from "next";

const PRODUCTION_SITE_URL = "https://www.pbdesk.com";
const PROTOCOL_RE = /^https?:\/\//;
const TRAILING_SLASHES_RE = /\/+$/;

interface SiteUrlEnv {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
}

function normalizeSiteUrl(value: string): string {
  const normalized = value.trim().replace(TRAILING_SLASHES_RE, "");
  return PROTOCOL_RE.test(normalized) ? normalized : `https://${normalized}`;
}

export function resolveSiteUrl(
  env: SiteUrlEnv = process.env as SiteUrlEnv
): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return normalizeSiteUrl(explicit);
  }

  const vercelHost = env.NEXT_PUBLIC_VERCEL_URL ?? env.VERCEL_URL;
  if (env.VERCEL_ENV === "preview" && vercelHost) {
    return normalizeSiteUrl(vercelHost);
  }

  return PRODUCTION_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "PBDesk";
export const SITE_AUTHOR = "Pinal Bhatt";
export const SITE_TAGLINE = "Bits, Bites & Blog — from the desk of Pinal Bhatt";
export const SITE_DEFAULT_TITLE = "PBDesk — Bits, Bites & Blog";
export const SITE_DEFAULT_DESCRIPTION =
  "From the desk of Pinal Bhatt — a space where code meets wellness. Bits (dev & AI), Bites (fitness & mindfulness), Blog (long-form reflections).";
export const DEFAULT_OG_IMAGE = "/og-image.png";
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;

export const SOCIAL = {
  github: "https://github.com/pinalbhatt",
  linkedin: "https://www.linkedin.com/in/pinalbhatt",
  twitterHandle: "@pbdesk",
  x: "https://x.com/pbdesk",
} as const;

export const SITE_KEYWORDS = [
  "PBDesk",
  "Pinal Bhatt",
  "software engineering",
  "developer blog",
  "AI",
  "artificial intelligence",
  "web development",
  "wellness",
  "fitness",
  "mindfulness",
  "developer life",
  "code and wellness",
];

interface PageMetaInput {
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  path: string;
  title: string;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const mergedKeywords = keywords
    ? Array.from(new Set([...SITE_KEYWORDS, ...keywords]))
    : SITE_KEYWORDS;

  return {
    alternates: {
      canonical: path,
    },
    description,
    keywords: mergedKeywords,
    openGraph: {
      description,
      images: [
        {
          alt: `${title} — ${SITE_NAME}`,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          url: ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
        },
      ],
      locale: "en_US",
      siteName: SITE_NAME,
      title,
      type: ogType,
      url,
    },
    title,
    twitter: {
      card: "summary_large_image",
      creator: SOCIAL.twitterHandle,
      description,
      images: [ogImage],
      site: SOCIAL.twitterHandle,
      title,
    },
  };
}

/**
 * Serialize a JSON-LD payload safely for inline `<script type="application/ld+json">`.
 * Escapes characters that could prematurely terminate the script tag or
 * break the JSON parser when the data comes from CMS-controlled fields
 * (post titles, excerpts, labels). Use everywhere we feed dangerouslySetInnerHTML
 * with structured data.
 */
// Built via RegExp constructor (not literal) because the formatter
// rewrites U+2028 / U+2029 codepoints into whitespace inside source.
const LINE_SEP_RE = /\u2028/g;
const PARA_SEP_RE = /\u2029/g;

export function jsonLdString(payload: unknown): string {
  return JSON.stringify(payload)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEP_RE, "\\u2028")
    .replace(PARA_SEP_RE, "\\u2029");
}
