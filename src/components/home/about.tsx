import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandX,
} from "@tabler/icons-react";
import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";

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

export default function About() {
  return (
    <section className="py-20 sm:py-28">
      <div className="wrapper">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow className="mb-4 block">About me</Eyebrow>
            <h2
              className="mb-6 font-bold text-[var(--fg-primary)]"
              style={{
                fontSize: "clamp(36px, 4.5vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              Welcome to my desk!
            </h2>

            <p
              className="mb-5 text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.75 }}
            >
              Hello! I&apos;m{" "}
              <strong className="text-[var(--fg-primary)]">Pinal Bhatt</strong>{" "}
              —I&apos;m Human & I&apos;m Software Engineer, and I love writing
              code! Though enjoying adrenaline rush from the new AI realm. Yes,
              I&apos;m always on the learning ramp.
            </p>
            <p
              className="mb-8 text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.75 }}
            >
              When I&apos;m not at the desk, I&apos;m probably stretching,
              reading, or arguing with my family about who gets the couch and
              what to watch on TV.
            </p>
            <p
              className="mb-8 text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.75 }}
            >
              This site is a space where I share insights, tutorials, articles,
              and resources on topics such as AI, programming, microservices,
              cloud computing, serverless architectures, & other technologies
              and topics like JavaScript, Node.js, TypeScript, Vue, Angular,
              React, Astro, Postgres, Mongo, Kafka and many more
            </p>

            <p
              className="mb-8 text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.75 }}
            >
              You&apos;ll also find a few personal reflections, tips on healthy
              living—because I believe good health fuels great work—and the
              occasional offbeat thought. After all,{" "}
              <b>
                <em>health is wealth!</em>
              </b>
            </p>
            <div
              className="flex items-center justify-start gap-2"
              id="social-links"
            >
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
                alt="Pinal Bhatt"
                className="h-full w-full object-cover"
                height={320}
                src="/pb/pb1.jpg"
                width={320}
              />
            </div>

            {/* Floating "Writing code" chip */}
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
                Pinal
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
