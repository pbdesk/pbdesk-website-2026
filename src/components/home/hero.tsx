import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/pinalbhatt",
    icon: IconBrandGithubFilled,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pinalbhatt",
    icon: IconBrandLinkedinFilled,
  },
  { label: "X", href: "https://x.com/pbdesk", icon: IconBrandX },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <span aria-hidden="true" className="hero-blob-left" />
      <span aria-hidden="true" className="hero-blob-right" />

      <div className="wrapper relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow pill */}
          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-1.5 font-medium text-[var(--fg-secondary)] text-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--fg-brand)]" />
            <span>Bits &amp; Bites — Developer&apos;s Life</span>
          </div>

          {/* Headline */}
          <h1
            className="mb-8 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(44px, 6vw, 84px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Learning Endeavor
            <br />
            <span className="text-[var(--fg-brand)]">Forever</span>
            <br />
            from my desk to yours.
          </h1>

          {/* Subheading */}
          <p
            className="mx-auto mb-12 max-w-2xl text-[var(--fg-secondary)] text-lg"
            style={{ lineHeight: 1.65 }}
          >
            Hi, I&apos;m{" "}
            <strong className="text-[var(--fg-primary)]">Pinal Bhatt</strong> —
            software engineer, AI tinkerer, and wellness enthusiast. I write
            about code, tools, and the small habits that keep us building for
            the long run.
          </p>

          {/* CTAs */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/blog">
              Explore the Blog
              <span aria-hidden="true">→</span>
            </Button>
          </div>

          {/* Social row */}
          <div className="flex items-center justify-center gap-2">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
        </div>
      </div>
    </section>
  );
}
