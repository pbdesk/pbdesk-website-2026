import type { ISbStoryData } from "@storyblok/react";
import type { Metadata } from "next";
import LiveRichText from "@/components/storyblok/live-richtext";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { loadDisclaimerStory } from "@/lib/storyblok/landing";

const FALLBACK_BODY = [
  "The views expressed on PBDesk are personal and do not necessarily reflect the views of any employer, client, or affiliated organization.",
  "Articles share opinions, experiments, and references at the time of writing. Technology moves fast — examples may become outdated, and the code or tools mentioned may change behavior over time. Please verify against current documentation before relying on anything here in production.",
  "Wellness content reflects my personal practice and is not medical advice. Please consult a qualified healthcare professional for guidance specific to your situation.",
  "External links open in new tabs and lead to third-party sites that are not under my control. I am not responsible for their content or practices.",
];

export async function generateMetadata(): Promise<Metadata> {
  const story = await loadDisclaimerStory();
  const c = story?.content;
  return pageMetadata({
    title: c?.seo_title ?? `Disclaimer — ${SITE_NAME}`,
    description:
      c?.seo_description ??
      "Editorial, technical, and wellness disclaimer for content published on PBDesk.",
    path: "/disclaimer",
  });
}

export default async function DisclaimerPage() {
  const story = await loadDisclaimerStory();
  const c = story?.content;
  const lastUpdated = c?.last_updated;
  const title = c?.title ?? "Disclaimer";

  return (
    <main>
      <section className="py-16 sm:py-20">
        <div className="wrapper">
          <nav className="mb-5 flex items-center justify-center gap-2 text-[var(--fg-muted)] text-sm">
            <a className="text-[var(--fg-secondary)] hover:underline" href="/">
              PBDesk
            </a>
            <span>/</span>
            <span className="text-[var(--fg-primary)]">{title}</span>
          </nav>

          <h1
            className="mb-6 text-center font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(40px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>

          {lastUpdated ? (
            <p className="mb-10 text-center text-[var(--fg-muted)] text-sm">
              Last updated{" "}
              <time dateTime={lastUpdated}>
                {new Date(lastUpdated).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </p>
          ) : null}

          {story ? (
            <LiveRichText
              fallback={FALLBACK_BODY.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
              fieldName="body"
              story={story as unknown as ISbStoryData<Record<string, unknown>>}
            />
          ) : (
            <article className="post-prose mx-auto max-w-3xl">
              {FALLBACK_BODY.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
