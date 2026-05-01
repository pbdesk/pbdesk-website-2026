import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

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
          <Chip variant="brand">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--fg-brand)" }}
            />
            <span>Bits &amp; Bites — Developer&apos;s Life</span>
          </Chip>

          {/* Headline */}
          <h1
            className="m-8 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(30px, 4vw, 50px)",
              lineHeight: 1.5,
              letterSpacing: "-0.03em",
            }}
          >
            <span className="text-[var(--fg-brand)]"> Learnig </span>
            endeavor forever...
            <br />
            <span
              style={{
                fontSize: "clamp(20px, 3vw, 40px)",
              }}
            >
              ...from the desk of{" "}
              <span className="text-[var(--fg-brand)]">
                <em>Pinal Bhatt</em>
              </span>
            </span>
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
