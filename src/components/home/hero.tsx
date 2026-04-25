import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import Link from "next/link";

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
          <div
            className="mb-10 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium text-sm"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-elevated)",
              color: "var(--fg-secondary)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--fg-brand)" }}
            />
            <span>Bits &amp; Bites — Developer&apos;s Life</span>
          </div>

          {/* Headline */}
          <h1
            className="mb-8 font-bold"
            style={{
              fontSize: "clamp(44px, 6vw, 84px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--fg-primary)",
            }}
          >
            Learning Endeavor
            <br />
            <span style={{ color: "var(--fg-brand)" }}>Forever</span>
            <br />
            from my desk to yours.
          </h1>

          {/* Subheading */}
          <p
            className="mx-auto mb-12 max-w-2xl text-lg"
            style={{
              color: "var(--fg-secondary)",
              lineHeight: 1.65,
            }}
          >
            Hi, I&apos;m{" "}
            <strong style={{ color: "var(--fg-primary)" }}>Pinal Bhatt</strong>{" "}
            — software engineer, AI tinkerer, and wellness enthusiast. I write
            about code, tools, and the small habits that keep us building for
            the long run.
          </p>

          {/* CTAs */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-full px-7 font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              href="/blog"
              style={{
                background: "var(--fg-brand)",
                color: "white",
                boxShadow: "0 8px 20px rgb(79 70 229 / 0.3)",
              }}
            >
              Explore the Blog
              <span aria-hidden="true">→</span>
            </Link>
            <button
              className="inline-flex h-12 items-center gap-2.5 rounded-full px-6 font-semibold text-sm transition-colors"
              style={{ color: "var(--fg-primary)" }}
              type="button"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <IconPlayerPlayFilled
                  size={14}
                  style={{ color: "var(--fg-primary)" }}
                />
              </span>
              Watch Intro
            </button>
          </div>

          {/* Social row */}
          <div className="flex items-center justify-center gap-2">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                href={href}
                key={label}
                rel="noopener"
                style={{ color: "var(--fg-muted)" }}
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
