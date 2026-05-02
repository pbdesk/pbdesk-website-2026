import type { ISbStoryData } from "@storyblok/react";
import type { Metadata } from "next";
import LiveRichText from "@/components/storyblok/live-richtext";
import { Chip } from "@/components/ui/chip";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { loadPrivacyPolicyStory } from "@/lib/storyblok/landing";

const FALLBACK_BODY = [
  "PBDesk is a personal site that does not require accounts, payments, or sensitive personal information to read. Standard server logs (IP, user-agent, request URL) are processed by our hosting provider for security and uptime.",
  "The Site uses minimal cookies and browser storage: a strictly-necessary cookie set only when you preview content through the Storyblok visual editor, and a local-storage entry that remembers your light/dark theme preference on your device.",
  "We do not run third-party analytics, advertising, or behavioural-tracking scripts. If that ever changes, this page will be updated, and where required we will request your consent before any non-essential cookies are set.",
  "You can manage cookies and storage at any time through your browser settings, and you can exercise the privacy rights granted to you under applicable law (GDPR, UK GDPR, CCPA, and similar regimes).",
];

export async function generateMetadata(): Promise<Metadata> {
  const story = await loadPrivacyPolicyStory();
  const c = story?.content;
  return pageMetadata({
    title: c?.seo_title ?? `Privacy Policy & Cookie Notice — ${SITE_NAME}`,
    description:
      c?.seo_description ??
      "How PBDesk collects, uses, and protects information; what cookies and similar technologies are used; and the privacy choices available to readers.",
    path: "/privacy-policy",
  });
}

export default async function PrivacyPolicyPage() {
  const story = await loadPrivacyPolicyStory();
  const c = story?.content;
  const lastUpdated = c?.last_updated;
  const title = c?.title ?? "Privacy Policy & Cookie Notice";
  const eyebrow = c?.eyebrow;
  const lede = c?.lede;

  return (
    <main>
      <section className="hero-gradient-bg relative overflow-hidden py-20 sm:py-24">
        <div className="wrapper relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <nav className="mb-5 flex items-center justify-center gap-2 text-[var(--fg-muted)] text-sm">
              <a
                className="text-[var(--fg-secondary)] hover:underline"
                href="/"
              >
                PBDesk
              </a>
              <span>/</span>
              <span className="text-[var(--fg-primary)]">{title}</span>
            </nav>

            {eyebrow ? (
              <div className="mb-5 flex justify-center">
                <Chip variant="brand">
                  <span>{eyebrow}</span>
                </Chip>
              </div>
            ) : null}

            <h1
              className="mb-6 font-bold text-[var(--fg-primary)]"
              style={{
                fontSize: "clamp(40px, 5vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                textWrap: "balance",
              }}
            >
              {title}
            </h1>

            {lede ? (
              <p
                className="mx-auto mb-6 max-w-2xl text-[var(--fg-secondary)] text-lg"
                style={{ lineHeight: 1.7 }}
              >
                {lede}
              </p>
            ) : null}

            {lastUpdated ? (
              <p className="text-[var(--fg-muted)] text-sm">
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
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-subtle)] py-16 sm:py-20">
        <div className="wrapper">
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
