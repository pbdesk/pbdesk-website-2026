import {
  IconBolt,
  IconCode,
  IconHeart,
  IconLeaf,
  IconNotebook,
  IconPencil,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

type IconKey = "bolt" | "code" | "heart" | "leaf" | "notebook" | "pencil";

const ICONS: Record<IconKey, ComponentType<IconProps>> = {
  bolt: IconBolt,
  code: IconCode,
  heart: IconHeart,
  leaf: IconLeaf,
  notebook: IconNotebook,
  pencil: IconPencil,
};

interface RealmCard {
  description: string;
  title: string;
}

interface FeatureCard {
  description: string;
  icon: IconKey;
  title: string;
}

interface MyRealmProps {
  eyebrow?: string;
  features?: FeatureCard[];
  headline?: ReactNode;
  realms?: RealmCard[];
  subheading?: string;
  tags?: string[];
}

const DEFAULT_REALMS: RealmCard[] = [
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

const DEFAULT_FEATURES: FeatureCard[] = [
  {
    title: "Short-form Bits",
    description:
      "Quick takes you can read in the time it takes `npm install` to finish.",
    icon: "bolt",
  },
  {
    title: "Wellness for devs",
    description:
      "Small habits that protect your energy — for the long code review marathon.",
    icon: "heart",
  },
  {
    title: "Longer essays",
    description:
      "When a thought needs more than a tweet — full posts on the things I keep returning to.",
    icon: "pencil",
  },
];

const DEFAULT_TAGS = [
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

const DEFAULT_HEADLINE = (
  <>
    Health, family, wellness,
    <br />
    and technology.
  </>
);

export default function MyRealm({
  eyebrow,
  headline,
  subheading,
  realms,
  features,
  tags,
}: MyRealmProps = {}) {
  const realmList = realms ?? DEFAULT_REALMS;
  const featureList = features ?? DEFAULT_FEATURES;
  const tagList = tags ?? DEFAULT_TAGS;

  return (
    <section className="bg-[var(--bg-subtle)] py-20 sm:py-24">
      <div className="wrapper">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3 block">{eyebrow ?? "My realm"}</Eyebrow>
          <h2
            className="mb-5 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}
          >
            {headline ?? DEFAULT_HEADLINE}
          </h2>
          <p
            className="mx-auto max-w-2xl text-[var(--fg-secondary)] text-base"
            style={{ lineHeight: 1.7 }}
          >
            {subheading ??
              "The four threads I weave through everything I write. Never one without the others."}
          </p>
        </div>

        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {realmList.map((realm) => (
            <Card className="rounded-xl p-6 shadow-none" key={realm.title}>
              <h3 className="mb-3 font-semibold text-[var(--fg-primary)] text-base">
                {realm.title}
              </h3>
              <p
                className="text-[var(--fg-secondary)] text-sm"
                style={{ lineHeight: 1.65 }}
              >
                {realm.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((feature) => {
            const Icon = ICONS[feature.icon] ?? IconBolt;
            return (
              <Card className="rounded-xl p-7 shadow-none" key={feature.title}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-50)] text-[var(--fg-brand)]">
                  <Icon size={22} stroke={1.75} />
                </div>
                <h3 className="mb-3 font-semibold text-[var(--fg-primary)] text-lg">
                  {feature.title}
                </h3>
                <p
                  className="text-[var(--fg-secondary)] text-sm"
                  style={{ lineHeight: 1.65 }}
                >
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {tagList.map((tag) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2 font-medium text-[var(--fg-secondary)] text-sm"
              key={tag}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-brand)]" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
