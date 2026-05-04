import { Fragment, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SocialIcons } from "@/components/ui/social-icons";

interface AboutHeroProps {
  chipLabel?: ReactNode;
  description?: ReactNode;
  primaryCtaHref?: string;
  primaryCtaLabel?: ReactNode;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: ReactNode;
  showSocial?: boolean;
  titleLead?: ReactNode;
  titleName?: ReactNode;
  titleSubheadline?: string;
}

const NEWLINE_RE = /\r?\n/;

function withLineBreaks(value?: string): ReactNode {
  if (!value) {
    return null;
  }
  const lines = value.split(NEWLINE_RE);
  return lines.map((line, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: line list is fixed for a given input
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

export default function AboutHero({
  chipLabel = "About — the human behind the desk",
  titleLead = "Hi, I'm ",
  titleName = "Pinal Bhatt",
  titleSubheadline = "Engineer by craft,\nlearner by habit,\nhuman by nature.",
  description = "I love writing code, exploring the AI realm, and chasing the small habits that keep mind and body sharp. This page is the long-form version — who I am, what I write about, and the threads I weave through everyday life.",
  primaryCtaLabel = "Read the blog",
  primaryCtaHref = "/blog",
  secondaryCtaLabel = "Say hello",
  secondaryCtaHref = "#social-links",
  showSocial = true,
}: AboutHeroProps = {}) {
  return (
    <section className="hero-gradient-bg relative overflow-hidden py-24 sm:py-28">
      <div className="wrapper relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <Chip variant="brand">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: "var(--fg-brand)" }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: "var(--fg-brand)" }}
              />
            </span>
            <span>{chipLabel}</span>
          </Chip>

          <h1
            className="m-8 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            {titleLead}
            <span className="text-[var(--fg-brand)]">
              <em>{titleName}</em>
            </span>
            .<br />
            <span style={{ fontSize: "clamp(22px, 3vw, 40px)" }}>
              {withLineBreaks(titleSubheadline)}
            </span>
          </h1>

          {description ? (
            <p
              className="mx-auto mb-10 max-w-2xl text-[var(--fg-secondary)] text-lg"
              style={{ lineHeight: 1.7 }}
            >
              {description}
            </p>
          ) : null}

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {primaryCtaLabel ? (
              <Button href={primaryCtaHref ?? "#"}>
                {primaryCtaLabel}
                <span aria-hidden="true">→</span>
              </Button>
            ) : null}
            {secondaryCtaLabel ? (
              <Button href={secondaryCtaHref ?? "#"} variant="ghost">
                {secondaryCtaLabel}
              </Button>
            ) : null}
          </div>

          {showSocial ? <SocialIcons className="justify-center" /> : null}
        </div>
      </div>
    </section>
  );
}
