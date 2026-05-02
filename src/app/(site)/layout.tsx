import { draftMode } from "next/headers";
import type { ReactNode } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/header";
import StoryblokProvider from "@/components/storyblok/storyblok-provider";
import { globalConfigToLayoutData } from "@/lib/storyblok/global-config";
import { loadGlobalConfig } from "@/lib/storyblok/landing";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [{ isEnabled: isDraft }, configStory] = await Promise.all([
    draftMode(),
    loadGlobalConfig(),
  ]);
  const config = globalConfigToLayoutData(configStory);

  const inner = (
    <div className="flex flex-1 flex-col">
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

  if (isDraft) {
    return <StoryblokProvider>{inner}</StoryblokProvider>;
  }
  return inner;
}
