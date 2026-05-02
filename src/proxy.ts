// Proxy (formerly middleware in Next 14/15): auto-enable preview mode
// when the request looks like a Storyblok visual-editor iframe load.
//
// Storyblok appends `_storyblok`, `_storyblok_release`, `_storyblok_lang`,
// `_storyblok_tk[…]`, etc. to the iframe URL. We use that as a signal:
//   - set an x-sb-preview REQUEST header so server components on the
//     CURRENT request can detect preview mode
//   - set the sb-preview RESPONSE cookie (SameSite=None; Secure) so
//     SUBSEQUENT in-iframe navigations carry the signal too
//
// This means the user doesn't have to configure the Storyblok preview URL
// to go through /api/draft — the iframe load is detected automatically.

import { type NextRequest, NextResponse } from "next/server";

const PREVIEW_COOKIE = "sb-preview";
const PREVIEW_HEADER = "x-sb-preview";

function isStoryblokIframe(request: NextRequest): boolean {
  for (const key of request.nextUrl.searchParams.keys()) {
    if (key.startsWith("_storyblok")) {
      return true;
    }
  }
  return false;
}

export function proxy(request: NextRequest) {
  if (!isStoryblokIframe(request)) {
    return NextResponse.next();
  }

  // Pass a header so the current request's server components see preview mode.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PREVIEW_HEADER, "1");
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Set a cookie so subsequent in-iframe navigations also see preview mode.
  response.cookies.set({
    name: PREVIEW_COOKIE,
    value: "1",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export const config = {
  // Skip API routes (they handle their own auth) and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon|certificates).*)"],
};
