import Image from "next/image";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SocialIcons } from "@/components/ui/social-icons";

interface AboutProps {
  bio?: ReactNode;
  chipLabel?: string;
  eyebrow?: string;
  headline?: string;
  portraitAlt?: string;
  portraitSrc?: string;
  showSocial?: boolean;
}

const DEFAULT_BIO = (
  <>
    <p
      className="mb-5 text-[var(--fg-secondary)] text-base"
      style={{ lineHeight: 1.75 }}
    >
      Hello! I&apos;m{" "}
      <strong className="text-[var(--fg-primary)]">Pinal Bhatt</strong>{" "}
      —I&apos;m Human & I&apos;m Software Engineer, and I love writing code!
      Though enjoying adrenaline rush from the new AI realm. Yes, I&apos;m
      always on the learning ramp.
    </p>
    <p
      className="mb-8 text-[var(--fg-secondary)] text-base"
      style={{ lineHeight: 1.75 }}
    >
      When I&apos;m not at the desk, I&apos;m probably stretching, reading, or
      arguing with my family about who gets the couch and what to watch on TV.
    </p>
    <p
      className="mb-8 text-[var(--fg-secondary)] text-base"
      style={{ lineHeight: 1.75 }}
    >
      This site is a space where I share insights, tutorials, articles, and
      resources on topics such as AI, programming, microservices, cloud
      computing, serverless architectures, & other technologies and topics like
      JavaScript, Node.js, TypeScript, Vue, Angular, React, Astro, Postgres,
      Mongo, Kafka and many more
    </p>
    <p
      className="mb-8 text-[var(--fg-secondary)] text-base"
      style={{ lineHeight: 1.75 }}
    >
      You&apos;ll also find a few personal reflections, tips on healthy living—
      because I believe good health fuels great work—and the occasional offbeat
      thought. After all,{" "}
      <b>
        <em>health is wealth!</em>
      </b>
    </p>
  </>
);

export default function About({
  eyebrow,
  headline,
  bio,
  portraitSrc = "/pb/pb1.jpg",
  portraitAlt = "Pinal Bhatt",
  chipLabel = "Pinal",
  showSocial = true,
}: AboutProps = {}) {
  return (
    <section className="py-20 sm:py-28">
      <div className="wrapper">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow className="mb-4 block">{eyebrow ?? "About me"}</Eyebrow>
            <h2
              className="mb-6 font-bold text-[var(--fg-primary)]"
              style={{
                fontSize: "clamp(36px, 4.5vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              {headline ?? "Welcome to my desk!"}
            </h2>

            {bio ?? DEFAULT_BIO}

            {showSocial ? (
              <SocialIcons className="justify-start" id="social-links" />
            ) : null}
          </div>

          <div className="group relative">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-1/2 w-4/5 -translate-x-1/2 rotate-6 rounded-3xl bg-gradient-to-tr from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/5 transition-transform duration-500 ease-out group-hover:rotate-3"
            />
            <div
              aria-hidden="true"
              className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-[var(--color-brand-500)]/20 blur-2xl"
            />
            <div className="relative mx-auto aspect-square w-4/5 -rotate-[5deg] overflow-hidden rounded-3xl shadow-[var(--shadow-lg)] transition-transform duration-500 ease-out will-change-transform group-hover:rotate-0 group-hover:scale-[1.03]">
              <Image
                alt={portraitAlt}
                className="h-full w-full object-cover"
                height={320}
                src={portraitSrc}
                width={320}
              />
            </div>

            <div className="absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white px-4 py-2 shadow-[var(--shadow-lg)] transition-transform duration-500 ease-out group-hover:-translate-y-1 dark:bg-zinc-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--fg-brand)]">
                <span
                  aria-label="blue heart"
                  className="heart-pulse text-base"
                  role="img"
                >
                  💙
                </span>
              </span>
              <span className="font-semibold text-[var(--fg-primary)] text-sm">
                {chipLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
