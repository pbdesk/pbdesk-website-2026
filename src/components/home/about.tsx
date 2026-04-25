import Image from "next/image";

export default function About() {
  return (
    <section className="py-20 sm:py-28">
      <div className="wrapper">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p
              className="mb-4 font-semibold text-xs uppercase tracking-widest"
              style={{ color: "var(--fg-brand)" }}
            >
              About me
            </p>
            <h2
              className="mb-6 font-bold"
              style={{
                fontSize: "clamp(36px, 4.5vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "var(--fg-primary)",
              }}
            >
              Welcome to my desk.
            </h2>

            <p
              className="mb-5 text-base"
              style={{
                color: "var(--fg-secondary)",
                lineHeight: 1.75,
              }}
            >
              Hello! I&apos;m{" "}
              <strong style={{ color: "var(--fg-primary)" }}>
                Pinal Bhatt
              </strong>{" "}
              — a human first, and a software engineer who genuinely loves
              writing code. Lately I&apos;m enjoying the adrenaline rush from
              the new AI realm. Yes, I&apos;m always on the learning ramp.
            </p>
            <p
              className="mb-8 text-base"
              style={{
                color: "var(--fg-secondary)",
                lineHeight: 1.75,
              }}
            >
              When I&apos;m not at the desk, I&apos;m probably stretching,
              reading, or arguing with my dog about who gets the couch.
            </p>
          </div>

          <div className="relative">
            <div
              className="aspect-square overflow-hidden rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #fbcfe8 0%, #f3e8ff 100%)",
              }}
            >
              <Image
                alt="Pinal Bhatt"
                className="h-full w-full object-cover"
                height={600}
                src="/pb/pb1.jpg"
                width={600}
              />
            </div>

            {/* Floating "Writing code" chip */}
            <div
              className="absolute -right-4 -bottom-4 flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-lg dark:bg-zinc-900"
              style={{
                borderColor: "var(--border-subtle)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  background: "var(--color-brand-100)",
                  color: "var(--fg-brand)",
                }}
              >
                <span className="font-mono font-semibold text-xs">
                  &lt;/&gt;
                </span>
              </span>
              <span
                className="font-semibold text-sm"
                style={{ color: "var(--fg-primary)" }}
              >
                Writing code
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
