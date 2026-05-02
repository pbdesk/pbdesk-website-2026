import type { ReactNode } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/header";
import StoryblokBridge from "@/components/storyblok/storyblok-bridge";
import { globalConfigToLayoutData } from "@/lib/storyblok/global-config";
import { loadGlobalConfig } from "@/lib/storyblok/landing";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const configStory = await loadGlobalConfig();
  const config = globalConfigToLayoutData(configStory);

  return (
    <div className="flex flex-1 flex-col">
      {/* Mounted unconditionally; the component self-gates to only run inside
          the Storyblok visual editor iframe. */}
      <StoryblokBridge />
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
}
