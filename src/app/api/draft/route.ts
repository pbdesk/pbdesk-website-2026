import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Name of the iframe-friendly preview cookie. Distinct from Next's
// __prerender_bypass cookie (which defaults to SameSite=Lax and therefore
// gets dropped on iframe sub-requests originating from app.storyblok.com).
export const PREVIEW_COOKIE = "sb-preview";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug = request.nextUrl.searchParams.get("slug") ?? "/";

  const expectedSecret = process.env.STORYBLOK_PREVIEW_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return new Response("Invalid token", { status: 401 });
  }

  // Enable Next's built-in draft mode (works for top-level navigation).
  const draft = await draftMode();
  draft.enable();

  const safeSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const redirectUrl = new URL(safeSlug, request.nextUrl.origin);

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
