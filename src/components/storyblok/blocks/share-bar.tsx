"use client";

import { ShareBar } from "@/components/share/share-bar";
import { useShareContext } from "@/components/share/share-context";
import { editable } from "./editable";
import type { ShareBarBlok } from "./types";

export default function ShareBarBlock({ blok }: { blok: ShareBarBlok }) {
  const ctx = useShareContext();
  const url = blok.url_override || ctx?.url || "";
  const title = blok.title_override || ctx?.title || "";

  if (!(url && title)) {
    return null;
  }

  const layout = blok.desktop_layout ?? "inline";
  const showSidebar = layout === "sidebar" || layout === "both";
  const showInline = true; // mobile always gets inline; on desktop only when layout !== "sidebar"

  const networks =
    blok.networks && blok.networks.length > 0 ? blok.networks : undefined;
  const heading = blok.heading || "Share";
  const showCopyLink = blok.show_copy_link !== false;

  return (
    <section className="wrapper py-10" {...editable(blok)}>
      {showSidebar ? (
        <ShareBar
          description={ctx?.description}
          heading={heading}
          media={ctx?.media}
          networks={networks}
          showCopyLink={showCopyLink}
          title={title}
          url={url}
          variant="sidebar"
        />
      ) : null}
      {showInline ? (
        <ShareBar
          className={layout === "sidebar" ? "lg:hidden" : undefined}
          description={ctx?.description}
          heading={heading}
          media={ctx?.media}
          networks={networks}
          showCopyLink={showCopyLink}
          title={title}
          url={url}
          variant="inline"
        />
      ) : null}
    </section>
  );
}
