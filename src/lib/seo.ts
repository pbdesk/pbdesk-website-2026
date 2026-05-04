import type { Metadata } from "next";

// On Vercel preview deploys, NEXT_PUBLIC_SITE_URL is intentionally unset so
// each unique preview URL resolves correctly. Vercel auto-injects
// NEXT_PUBLIC_VERCEL_URL (client-safe) and VERCEL_URL (server-only); we use
// either as the fallback host before defaulting to production.
const TRAILING_SLASH_RE = /\/$/;

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(TRAILING_SLASH_RE, "");
  }
  const vercelHost =
    process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost}`;
  }
  return "https://pbdesk.com";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "PBDesk";
export const SITE_AUTHOR = "Pinal Bhatt";
export const SITE_TAGLINE = "Bits, Bites & Blog — from the desk of Pinal Bhatt";
export const SITE_DEFAULT_TITLE = "PBDesk — Bits, Bites & Blog";
export const SITE_DEFAULT_DESCRIPTION =
  "From the desk of Pinal Bhatt — a space where code meets wellness. Bits (dev & AI), Bites (fitness & mindfulness), Blog (long-form reflections).";
export const DEFAULT_OG_IMAGE = "/pb/pb-sq-no-bg.png";

export const SOCIAL = {
  twitterHandle: "@pbdesk",
  github: "https://github.com/pinalbhatt",
  linkedin: "https://www.linkedin.com/in/pinalbhatt",
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
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          alt: `${title} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: SOCIAL.twitterHandle,
      site: SOCIAL.twitterHandle,
      images: [ogImage],
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
