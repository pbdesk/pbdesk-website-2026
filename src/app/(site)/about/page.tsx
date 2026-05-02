import type { ISbStoryData } from "@storyblok/react";
import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import About from "@/components/home/about";
import MyPillers from "@/components/home/my-pillers";
import MyWellnessThreads from "@/components/home/my-wellness-threads";
import LivePage from "@/components/storyblok/live-page";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import {
  pageMetadata,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_URL,
  SOCIAL,
} from "@/lib/seo";
import { loadAboutStory } from "@/lib/storyblok/landing";

export const metadata: Metadata = pageMetadata({
  title: "About Pinal Bhatt — Engineer, AI tinkerer, wellness enthusiast",
  description:
    "Get to know the human behind PBDesk. Pinal Bhatt is a software engineer exploring AI, web development, and the daily wellness habits that fuel sustainable craft.",
  path: "/about",
  ogType: "profile",
  keywords: [
    "Pinal Bhatt",
    "about Pinal Bhatt",
    "software engineer",
    "AI engineer",
    "full stack developer",
    "wellness enthusiast",
  ],
});

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_AUTHOR,
  url: `${SITE_URL}/about`,
  jobTitle: "Software Engineer",
  worksFor: {
    "@type": "Organization",
    name: SITE_NAME,
  },
  description:
    "Software engineer, AI tinkerer, and wellness enthusiast writing at PBDesk.",
  sameAs: [SOCIAL.github, SOCIAL.linkedin, SOCIAL.x],
};

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

function AboutStory() {
  return (
    <section className="bg-[var(--bg-subtle)] py-20 sm:py-24">
      <div className="wrapper">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Eyebrow className="mb-3 block">My story</Eyebrow>
          <h2
            className="font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              textWrap: "balance",
            }}
          >
            Code, curiosity, and a healthy dose of balance.
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-14">
          <div className="flex flex-col gap-6">
            <p
              className="text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.8 }}
            >
              I love coding and enjoy creating great software solutions through
              the power of code. I genuinely enjoy the entire process of
              creating software, from brainstorming ideas to writing clean code
              and debugging until everything runs just right. Whether I&apos;m
              diving into backend, frontend, middleware, or experimenting with
              any new tech, I find a lot of joy in figuring things out and
              making things better.
            </p>
            <p
              className="text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.8 }}
            >
              One of the areas that really excites me is artificial
              intelligence. I love exploring how AI is changing the way we live
              and work, and I&apos;m always curious to see how I can apply it in
              the projects I build. I&apos;m also always on the lookout for new
              tools, trends, and tech that challenge me to grow and think
              differently. For me, learning is an ongoing journey — and
              that&apos;s one of the best parts of being in tech.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <p
              className="text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.8 }}
            >
              But as much as I love coding, I don&apos;t believe life should be
              all about work. I&apos;m a big believer in balance. Health and
              wellness are super important to me. I make time for physical and
              mental well-being, whether it&apos;s through regular exercise,
              mindfulness, or simply slowing down when needed. Staying healthy
              helps me stay sharp and present — both in my work and in life.
              Spending quality time with family and friends is something I truly
              value. At the end of the day, it&apos;s the people around us that
              bring the most meaning to our lives. I try to stay grounded, enjoy
              the little moments, and never take anything for granted. Work is
              important, but so is life — and I believe in showing up fully for
              both.
            </p>
          </div>
        </div>

        <figure className="mx-auto mt-14 max-w-3xl">
          <blockquote className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-8 py-10 text-center shadow-[var(--shadow-lg)] sm:px-12">
            <span
              aria-hidden="true"
              className="absolute -top-4 left-8 font-serif text-6xl text-[var(--fg-brand)] leading-none"
            >
              &ldquo;
            </span>
            <p
              className="font-semibold text-[var(--fg-primary)]"
              style={{
                fontSize: "clamp(20px, 2.4vw, 28px)",
                lineHeight: 1.4,
                letterSpacing: "-0.015em",
                textWrap: "balance",
              }}
            >
              <a
                className="text-[var(--fg-brand)] underline decoration-[var(--fg-brand)]/30 underline-offset-4 transition-colors hover:decoration-[var(--fg-brand)]"
                href="https://www.linkedin.com/pulse/best-gift-you-can-give-your-loved-ones-existing-good-health-bhatt-nkvde"
                rel="noopener"
                target="_blank"
              >
                The best gift you can give your loved ones is by existing in
                good health!
              </a>
            </p>
            <figcaption className="mt-5 font-mono font-semibold text-[11px] text-[var(--fg-muted)] uppercase tracking-widest">
              — That&apos;s why I say
            </figcaption>
          </blockquote>
        </figure>
      </div>
    </section>
  );
}

function AboutHero() {
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
            <span>About — the human behind the desk</span>
          </Chip>

          <h1
            className="m-8 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            Hi, I&apos;m{" "}
            <span className="text-[var(--fg-brand)]">
              <em>Pinal Bhatt</em>
            </span>
            .<br />
            <span style={{ fontSize: "clamp(22px, 3vw, 40px)" }}>
              Engineer by craft, <br />
              learner by habit,
              <br /> human by nature.
            </span>
          </h1>

          <p
            className="mx-auto mb-10 max-w-2xl text-[var(--fg-secondary)] text-lg"
            style={{ lineHeight: 1.7 }}
          >
            I love writing code, exploring the AI realm, and chasing the small
            habits that keep mind and body sharp. This page is the long-form
            version — who I am, what I write about, and the threads I weave
            through everyday life.
          </p>

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/blog">
              Read the blog
              <span aria-hidden="true">→</span>
            </Button>
            <Button href="#social-links" variant="ghost">
              Say hello
            </Button>
          </div>

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
        </div>
      </div>
    </section>
  );
}

export default async function AboutPage() {
  const story = await loadAboutStory();

  // When Storyblok's `about` story has body blocks, render those — the
  // hero remains the hardcoded section because it has SEO/CTA copy not
  // currently exposed in the about_page schema. Body blocks (about_section,
  // my_pillers, my_wellness_threads, richtext_section) come through the
  // generic <Page> dispatcher.
  if (story?.content?.body?.length) {
    return (
      <main>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          type="application/ld+json"
        />
        <Reveal>
          <AboutHero />
        </Reveal>
        <LivePage
          story={story as unknown as ISbStoryData<Record<string, unknown>>}
        />
      </main>
    );
  }

  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        type="application/ld+json"
      />
      <Reveal>
        <AboutHero />
      </Reveal>
      <Reveal>
        <About />
      </Reveal>
      <Reveal>
        <AboutStory />
      </Reveal>
      <Reveal>
        <MyPillers />
      </Reveal>
      <Reveal>
        <MyWellnessThreads />
      </Reveal>
    </main>
  );
}
