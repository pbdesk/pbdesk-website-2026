import { draftMode } from "next/headers";
import type { ReactNode } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/header";
import StoryblokProvider from "@/components/storyblok/storyblok-provider";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { isEnabled: isDraft } = await draftMode();

  const inner = (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="isolate flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );

  if (isDraft) {
    return <StoryblokProvider>{inner}</StoryblokProvider>;
  }
  return inner;
}
