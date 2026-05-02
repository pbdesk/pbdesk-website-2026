// Debug endpoint: returns the server-side view of draft / preview state.
// Hit this from the iframe DevTools console to confirm the cookies are
// reaching the server:
//   await fetch("/api/_debug/preview", { credentials: "include" }).then(r => r.json())

import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";

const PREVIEW_COOKIE = "sb-preview";

export async function GET() {
  const [{ isEnabled }, cookieStore] = await Promise.all([
    draftMode(),
    cookies(),
  ]);

  const previewCookie = cookieStore.get(PREVIEW_COOKIE);
  const bypassCookie = cookieStore.get("__prerender_bypass");
  const allCookies: Record<string, string> = {};
  for (const c of cookieStore.getAll()) {
    allCookies[c.name] =
      c.value.length > 32 ? `${c.value.slice(0, 32)}…` : c.value;
  }

  return NextResponse.json({
    draftMode_isEnabled: isEnabled,
    sb_preview_cookie: previewCookie?.value ?? null,
    prerender_bypass_cookie: bypassCookie ? "present (Lax)" : null,
    isDraft_resolved: isEnabled || Boolean(previewCookie),
    allCookies,
    env: {
      hasAccessToken: Boolean(process.env.STORYBLOK_ACCESS_TOKEN),
      hasPreviewToken: Boolean(process.env.STORYBLOK_PREVIEW_TOKEN),
      hasPreviewSecret: Boolean(process.env.STORYBLOK_PREVIEW_SECRET),
      region: process.env.STORYBLOK_REGION ?? "(unset)",
    },
  });
}
