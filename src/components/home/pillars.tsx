import Link from "next/link";

const pillars = [
  {
    name: "Bits",
    title: "Bits — the tech side",
    href: "/bits",
    cta: "Visit My Bits",
    gradient: "pillar-bits-gradient",
    description:
      "Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
  },
  {
    name: "Bites",
    title: "Bites — the wellness side",
    href: "/bites",
    cta: "Visit My Bites",
    gradient: "pillar-bites-gradient",
    description:
      "A healthy, active life is the greatest gift we can give ourselves. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
  },
  {
    name: "Blog",
    title: "Blog — where they meet",
    href: "/blog",
    cta: "Visit My Blog",
    gradient: "pillar-blog-gradient",
    description:
      "Longer-form reflections on balancing tech life with physical wellness, plus friendships, family, and meaningful connections.",
  },
];

export default function Pillars() {
  return (
    <section className="py-20 sm:py-24">
      <div className="wrapper">
        <div className="mb-14 text-center">
          <p
            className="mb-3 font-semibold text-xs uppercase tracking-widest"
            style={{ color: "var(--fg-brand)" }}
          >
            What I write about
          </p>
          <h2
            className="font-bold"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "var(--fg-primary)",
            }}
          >
            Three lanes, one desk.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              href={pillar.href}
              key={pillar.name}
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                aria-hidden="true"
                className={`${pillar.gradient} h-44 w-full`}
              />
              <div className="flex flex-1 flex-col p-7">
                <h3
                  className="mb-3 font-bold text-xl"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="mb-6 flex-1 text-sm"
                  style={{
                    color: "var(--fg-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  {pillar.description}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 font-semibold text-sm"
                  style={{ color: "var(--fg-brand)" }}
                >
                  {pillar.cta} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
