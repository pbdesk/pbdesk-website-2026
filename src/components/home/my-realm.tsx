import { IconBolt, IconHeart, IconPencil } from "@tabler/icons-react";

const realms = [
  {
    title: "Nutrition",
    description:
      "Whole, natural, unprocessed foods rich in essential nutrients, vitamins, and minerals — fuel for immunity and repair.",
  },
  {
    title: "Movement",
    description:
      "Regular movement — walking, yoga, strength — to improve circulation, boost endorphins, and keep body and mind sharp.",
  },
  {
    title: "Sleep & Recovery",
    description:
      "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
  },
  {
    title: "Mindfulness",
    description:
      "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, and the occasional emotional detox.",
  },
];

const features = [
  {
    title: "Short-form Bits",
    description:
      "Quick takes you can read in the time it takes `npm install` to finish.",
    icon: IconBolt,
  },
  {
    title: "Wellness for devs",
    description:
      "Small habits that protect your energy — for the long code review marathon.",
    icon: IconHeart,
  },
  {
    title: "Longer essays",
    description:
      "When a thought needs more than a tweet — full posts on the things I keep returning to.",
    icon: IconPencil,
  },
];

const tags = [
  "JavaScript",
  "TypeScript",
  "Node.js",
  "React",
  "Astro",
  "Next.js",
  "AI",
  "OpenAI",
  "Postgres",
  "MongoDB",
];

export default function MyRealm() {
  return (
    <section
      className="py-20 sm:py-24"
      style={{ background: "var(--bg-subtle)" }}
    >
      <div className="wrapper">
        <div className="mb-14 text-center">
          <p
            className="mb-3 font-semibold text-xs uppercase tracking-widest"
            style={{ color: "var(--fg-brand)" }}
          >
            My realm
          </p>
          <h2
            className="mb-5 font-bold"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "var(--fg-primary)",
            }}
          >
            Health, family, wellness,
            <br />
            and technology.
          </h2>
          <p
            className="mx-auto max-w-2xl text-base"
            style={{ color: "var(--fg-secondary)", lineHeight: 1.7 }}
          >
            The four threads I weave through everything I write. Never one
            without the others.
          </p>
        </div>

        {/* 4 realm cards */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {realms.map((realm) => (
            <div
              className="rounded-xl border p-6"
              key={realm.title}
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <h3
                className="mb-3 font-semibold text-base"
                style={{ color: "var(--fg-primary)" }}
              >
                {realm.title}
              </h3>
              <p
                className="text-sm"
                style={{
                  color: "var(--fg-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {realm.description}
              </p>
            </div>
          ))}
        </div>

        {/* 3 feature cards */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                className="rounded-xl border p-7"
                key={feature.title}
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--color-brand-50)",
                    color: "var(--fg-brand)",
                  }}
                >
                  <Icon size={22} stroke={1.75} />
                </div>
                <h3
                  className="mb-3 font-semibold text-lg"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--fg-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tag chip strip */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {tags.map((tag) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-medium text-sm"
              key={tag}
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--fg-secondary)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--fg-brand)" }}
              />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
