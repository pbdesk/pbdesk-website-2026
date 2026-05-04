import { cookies, draftMode } from "next/headers";
import type { ReactNode } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/header";
import StoryblokBridge from "@/components/storyblok/storyblok-bridge";
import StoryblokProvider from "@/components/storyblok/storyblok-provider";
import { globalConfigToLayoutData } from "@/lib/storyblok/global-config";
import { loadGlobalConfig } from "@/lib/storyblok/landing";

// Same iframe-friendly cookie set by /api/draft. Reading it here mirrors the
// detection in src/lib/storyblok/client.ts so the visual editor iframe is
// recognised as a draft session even when Next's draftMode() returns false
// (which happens because __prerender_bypass uses SameSite=Lax and isn't sent
// on cross-origin sub-requests from app.storyblok.com).
const PREVIEW_COOKIE = "sb-preview";
const STORYBLOK_REGION = process.env.STORYBLOK_REGION ?? "eu";

// cookies() and draftMode() throw DYNAMIC_SERVER_USAGE in static rendering
// contexts (build-time pre-render of routes nested under this layout).
// Treat that as "not a draft session" — the published path — and fall
// through silently.
async function safeReadDynamic<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}

async function isDraftSession(): Promise<boolean> {
  const cookieStore = await safeReadDynamic(cookies);
  if (cookieStore?.get(PREVIEW_COOKIE)?.value === "1") {
    return true;
  }
  const draft = await safeReadDynamic(draftMode);
  return draft?.isEnabled ?? false;
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [isDraft, configStory] = await Promise.all([
    isDraftSession(),
    loadGlobalConfig(),
  ]);
  const config = globalConfigToLayoutData(configStory);

  const layout = (
    <div className="flex flex-1 flex-col">
      {/* Bridge self-gates by iframe detection, but we only ship its chunk to
          draft sessions so public visitors don't pay for unused JS. */}
      {isDraft ? <StoryblokBridge /> : null}
      <Header
        brandTagline={config?.brandTagline}
        navItems={config?.navItems}
        socials={config?.socials}
      />
      <div className="isolate flex flex-1 flex-col">{children}</div>
      <Footer
        brandTagline={config?.brandTagline}
        exploreItems={config?.footerExplore}
        footerAbout={config?.footerAbout}
        moreItems={config?.footerMore}
        socials={config?.footerSocials}
        topicsItems={config?.footerTopics}
      />
    </div>
  );

  if (!isDraft) {
    return layout;
  }

  // Draft session: pass the preview token via RSC props so it reaches the
  // editor's browser without ever being inlined into a public bundle.
  const previewToken = process.env.STORYBLOK_PREVIEW_TOKEN;
  if (!previewToken) {
    return layout;
  }
  return (
    <StoryblokProvider accessToken={previewToken} region={STORYBLOK_REGION}>
      {layout}
    </StoryblokProvider>
  );
}
