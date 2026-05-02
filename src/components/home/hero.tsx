import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/pinalbhatt",
    icon: IconBrandGithubFilled,
    hoverClass: "hover:text-[#181717] dark:hover:text-white",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pinalbhatt",
    icon: IconBrandLinkedinFilled,
    hoverClass: "hover:text-[#0A66C2]",
  },
  {
    label: "X",
    href: "https://x.com/pbdesk",
    icon: IconBrandX,
    hoverClass: "hover:text-black dark:hover:text-white",
  },
];

interface HeroProps {
  ctaHref?: string;
  ctaLabel?: string;
  eyebrow?: ReactNode;
  headline?: ReactNode;
  showSocial?: boolean;
  subheadline?: ReactNode;
}

const DEFAULT_HEADLINE = (
  <>
    <span className="text-[var(--fg-brand)]"> Learnig </span>
    endeavor forever...
    <br />
    <span style={{ fontSize: "clamp(20px, 3vw, 40px)" }}>
      ...from the desk of{" "}
      <span className="text-[var(--fg-brand)]">
        <em>Pinal Bhatt</em>
      </span>
    </span>
  </>
);

export default function Hero({
  eyebrow,
  headline,
  subheadline,
  ctaLabel = "About Me",
  ctaHref = "/about",
  showSocial = true,
}: HeroProps = {}) {
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
            <span>{eyebrow ?? "Bits & Bites — Developer's Life"}</span>
          </Chip>

          <h1
            className="m-8 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(30px, 4vw, 50px)",
              lineHeight: 1.5,
              letterSpacing: "-0.03em",
            }}
          >
            {headline ?? DEFAULT_HEADLINE}
          </h1>

          {subheadline ? (
            <p
              className="mx-auto mb-12 max-w-2xl text-[var(--fg-secondary)] text-lg"
              style={{ lineHeight: 1.65 }}
            >
              {subheadline}
            </p>
          ) : null}

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={ctaHref}>
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Button>
          </div>

          {showSocial ? (
            <div className="flex items-center justify-center gap-2">
              {socials.map(({ label, href, icon: Icon, hoverClass }) => (
                <a
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${hoverClass}`}
                  href={href}
                  key={label}
                  rel="noopener"
                  target="_blank"
                >
                  <Icon size={18} />
                  <span className="sr-only">{label}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
