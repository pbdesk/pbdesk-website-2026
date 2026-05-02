import { timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Name of the iframe-friendly preview cookie. Distinct from Next's
// __prerender_bypass cookie (which defaults to SameSite=Lax and therefore
// gets dropped on iframe sub-requests originating from app.storyblok.com).
export const PREVIEW_COOKIE = "sb-preview";

// Match leading "//" or "/\" — these are off-origin in URL parsing.
const OFF_ORIGIN_PREFIX = /^\/[/\\]/;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Validates that `slug` resolves to a same-origin path. Rejects:
 *   - protocol-relative URLs ("//evil.com/foo")
 *   - absolute URLs ("https://evil.com/foo")
 *   - anything whose resolved origin doesn't match the request origin
 */
function safeRedirectPath(slug: string, origin: string): string | null {
  const normalized = slug.startsWith("/") ? slug : `/${slug}`;
  // Reject "//host" / "/\host" and similar — these resolve off-origin.
  if (OFF_ORIGIN_PREFIX.test(normalized)) {
    return null;
  }
  try {
    const candidate = new URL(normalized, origin);
    if (candidate.origin !== origin) {
      return null;
    }
    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug = request.nextUrl.searchParams.get("slug") ?? "/";

  const expectedSecret = process.env.STORYBLOK_PREVIEW_SECRET;
  if (!(expectedSecret && secret && safeEqual(secret, expectedSecret))) {
    return new Response("Invalid token", { status: 401 });
  }

  const safePath = safeRedirectPath(slug, request.nextUrl.origin);
  if (safePath === null) {
    return new Response("Invalid slug", { status: 400 });
  }

  // Enable Next's built-in draft mode (works for top-level navigation).
  const draft = await draftMode();
  draft.enable();

  const redirectUrl = new URL(safePath, request.nextUrl.origin);

  // Also set our own iframe-friendly cookie so the Storyblok visual-editor
  // iframe (loaded from app.storyblok.com) can carry the preview signal
  // across sub-requests. SameSite=None requires Secure, which our HTTPS dev
  // server (--experimental-https) and production deploys satisfy.
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set({
    name: PREVIEW_COOKIE,
    value: "1",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    // 8 hours — preview sessions don't need to last forever.
    maxAge: 60 * 60 * 8,
  });
  return response;
}
