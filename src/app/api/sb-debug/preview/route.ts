// Debug endpoint: returns the server-side view of draft / preview state.
// Hit this from the iframe DevTools console to confirm the preview signals
// are reaching the server:
//   await fetch("/api/sb-debug/preview", { credentials: "include" }).then(r => r.json())

import { cookies, draftMode, headers } from "next/headers";
import { NextResponse } from "next/server";

const PREVIEW_COOKIE = "sb-preview";
const PREVIEW_HEADER = "x-sb-preview";

export async function GET() {
  const [{ isEnabled }, cookieStore, headersList] = await Promise.all([
    draftMode(),
    cookies(),
    headers(),
  ]);

  const previewCookie = cookieStore.get(PREVIEW_COOKIE);
  const bypassCookie = cookieStore.get("__prerender_bypass");
  const previewHeader = headersList.get(PREVIEW_HEADER);
  const referer = headersList.get("referer");

  const allCookies: Record<string, string> = {};
  for (const c of cookieStore.getAll()) {
    allCookies[c.name] =
      c.value.length > 32 ? `${c.value.slice(0, 32)}…` : c.value;
  }

  return NextResponse.json({
    draftMode_isEnabled: isEnabled,
    sb_preview_cookie: previewCookie?.value ?? null,
    prerender_bypass_cookie: bypassCookie ? "present (Lax)" : null,
    sb_preview_header: previewHeader ?? null,
    isDraft_resolved:
      isEnabled || Boolean(previewCookie) || previewHeader === "1",
    referer,
    allCookies,
    env: {
      hasAccessToken: Boolean(process.env.STORYBLOK_ACCESS_TOKEN),
      hasPreviewToken: Boolean(process.env.STORYBLOK_PREVIEW_TOKEN),
      hasPreviewSecret: Boolean(process.env.STORYBLOK_PREVIEW_SECRET),
      region: process.env.STORYBLOK_REGION ?? "(unset)",
    },
  });
}
