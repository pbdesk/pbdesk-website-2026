import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";

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
              Welcome to my desk.
            </h2>

            <p
              className="mb-5 text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.75 }}
            >
              Hello! I&apos;m{" "}
              <strong className="text-[var(--fg-primary)]">Pinal Bhatt</strong>{" "}
              — a human first, and a software engineer who genuinely loves
              writing code. Lately I&apos;m enjoying the adrenaline rush from
              the new AI realm. Yes, I&apos;m always on the learning ramp.
            </p>
            <p
              className="mb-8 text-[var(--fg-secondary)] text-base"
              style={{ lineHeight: 1.75 }}
            >
              When I&apos;m not at the desk, I&apos;m probably stretching,
              reading, or arguing with my dog about who gets the couch.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-pink-200 to-purple-100">
              <Image
                alt="Pinal Bhatt"
                className="h-full w-full object-cover"
                height={600}
                src="/pb/pb1.jpg"
                width={600}
              />
            </div>

            {/* Floating "Writing code" chip */}
            <div className="absolute -right-4 -bottom-4 flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white px-4 py-2 shadow-[var(--shadow-lg)] dark:bg-zinc-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--fg-brand)]">
                <span className="font-mono font-semibold text-xs">
                  &lt;/&gt;
                </span>
              </span>
              <span className="font-semibold text-[var(--fg-primary)] text-sm">
                Writing code
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
