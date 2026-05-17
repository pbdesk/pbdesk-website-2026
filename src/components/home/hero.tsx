import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SocialIcons } from "@/components/ui/social-icons";
import { cn } from "@/lib/utils";
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_HERO_PILLAR_LINKS,
  type HeroPillarLink,
  type HeroPillarTone,
} from "./hero-content";

interface HeroProps {
  ctaHref?: string;
  ctaLabel?: string;
  eyebrow?: ReactNode;
  headline?: ReactNode;
  kicker?: ReactNode;
  pillarLinks?: HeroPillarLink[];
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
  showPillarLinks?: boolean;
  showSocial?: boolean;
  subheadline?: ReactNode;
}

const pillarToneClasses: Record<HeroPillarTone, string> = {
  bits: "border-[var(--color-pillar-bits)]/25 text-[var(--color-pillar-bits)]",
  bites:
    "border-[var(--color-pillar-bites)]/25 text-[var(--color-pillar-bites)]",
  blog: "border-[var(--color-pillar-blog)]/25 text-[var(--color-pillar-blog)]",
};

export default function Hero({
  eyebrow,
  headline,
  kicker,
  subheadline,
  ctaLabel = DEFAULT_HERO_CONTENT.ctaLabel,
  ctaHref = DEFAULT_HERO_CONTENT.ctaHref,
  secondaryCtaLabel = DEFAULT_HERO_CONTENT.secondaryCtaLabel,
  secondaryCtaHref = DEFAULT_HERO_CONTENT.secondaryCtaHref,
  pillarLinks = DEFAULT_HERO_PILLAR_LINKS,
  showPillarLinks = true,
  showSocial = true,
}: HeroProps = {}) {
  return (
    <section className="hero-gradient-bg relative overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="wrapper relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <Chip className="mb-7" variant="brand">
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
              <span>{eyebrow ?? DEFAULT_HERO_CONTENT.eyebrow}</span>
            </Chip>

            <h1
              className="font-bold text-[var(--fg-primary)]"
              style={{
                fontSize: "clamp(56px, 8vw, 108px)",
                lineHeight: 0.95,
              }}
            >
              {headline ?? DEFAULT_HERO_CONTENT.headline}
            </h1>

            <p className="mt-5 font-semibold text-[var(--fg-brand)] text-xl sm:text-2xl">
              {kicker ?? DEFAULT_HERO_CONTENT.kicker}
            </p>
            <p
              className="mx-auto mt-6 max-w-2xl text-[var(--fg-secondary)] text-lg lg:mx-0"
              style={{ lineHeight: 1.7 }}
            >
              {subheadline ?? DEFAULT_HERO_CONTENT.subheadline}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button href={ctaHref} size="lg">
                {ctaLabel}
                <span aria-hidden="true">→</span>
              </Button>
              {secondaryCtaLabel ? (
                <Button href={secondaryCtaHref} size="lg" variant="ghost">
                  {secondaryCtaLabel}
                </Button>
              ) : null}
            </div>

            {showPillarLinks ? (
              <nav
                aria-label="Explore PBDesk pillars"
                className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                {pillarLinks.map((pillar) => (
                  <Link
                    className={cn(
                      "inline-flex h-10 items-center rounded-full border bg-[var(--bg-elevated)]/70 px-4 font-semibold text-sm shadow-[var(--shadow-sm)] backdrop-blur transition-transform hover:-translate-y-0.5",
                      pillarToneClasses[pillar.tone]
                    )}
                    href={pillar.href}
                    key={pillar.href}
                  >
                    {pillar.label}
                  </Link>
                ))}
              </nav>
            ) : null}

            {showSocial ? (
              <SocialIcons className="mt-10 justify-center lg:justify-start" />
            ) : null}
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[430px] lg:max-w-[520px]">
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/55 shadow-[var(--shadow-xl)] backdrop-blur"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgb(16_185_129_/_0.2),transparent_34%),radial-gradient(circle_at_75%_68%,rgb(245_158_11_/_0.18),transparent_32%),radial-gradient(circle_at_50%_50%,rgb(79_70_229_/_0.18),transparent_58%)]"
            />
            <Image
              alt="Portrait of Pinal Bhatt"
              className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
              height={491}
              priority
              src="/pb/pb-sq-no-bg.png"
              width={491}
            />
            <div className="absolute top-16 -left-2 z-20 rounded-full border border-[var(--color-pillar-bits)]/25 bg-[var(--bg-elevated)]/90 px-4 py-2 font-semibold text-[var(--color-pillar-bits)] text-sm shadow-[var(--shadow-md)] backdrop-blur">
              Code
            </div>
            <div className="absolute top-1/2 right-0 z-20 rounded-full border border-[var(--color-pillar-bites)]/25 bg-[var(--bg-elevated)]/90 px-4 py-2 font-semibold text-[var(--color-pillar-bites)] text-sm shadow-[var(--shadow-md)] backdrop-blur">
              Wellness
            </div>
            <div className="absolute bottom-12 left-10 z-20 rounded-full border border-[var(--color-pillar-blog)]/25 bg-[var(--bg-elevated)]/90 px-4 py-2 font-semibold text-[var(--color-pillar-blog)] text-sm shadow-[var(--shadow-md)] backdrop-blur">
              Reflections
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
