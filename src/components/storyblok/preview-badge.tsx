// Server-rendered diagnostic badge for the visual editor preview.
// Mounted in the site layout. Visibly indicates the draft / preview state
// the server sees on every request, which is exactly the signal that
// drives whether storyblok fetches return draft or published content.

import { cookies, draftMode, headers } from "next/headers";

const PREVIEW_COOKIE = "sb-preview";
const PREVIEW_HEADER = "x-sb-preview";

export default async function PreviewBadge() {
  const [{ isEnabled: nextDraft }, cookieStore, headersList] =
    await Promise.all([draftMode(), cookies(), headers()]);
  const sbPreviewCookie = cookieStore.get(PREVIEW_COOKIE);
  const sbPreviewHeader = headersList.get(PREVIEW_HEADER) === "1";
  const isDraft = nextDraft || Boolean(sbPreviewCookie) || sbPreviewHeader;

  // Only render when we're in some kind of preview mode. Regular visitors
  // never see this.
  if (!isDraft) {
    return null;
  }

  let reason: string;
  if (nextDraft) {
    reason = "draftMode (Next __prerender_bypass)";
  } else if (sbPreviewCookie) {
    reason = "sb-preview cookie";
  } else {
    reason = "x-sb-preview header (middleware)";
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 2_147_483_647,
        background: "#10b981",
        color: "white",
        padding: "6px 10px",
        borderRadius: 8,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        fontWeight: 600,
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
        pointerEvents: "none",
      }}
    >
      PREVIEW MODE · {reason}
    </div>
  );
}
