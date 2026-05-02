import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";

interface PillarCard {
  avatar: string;
  cta: string;
  description: string;
  gradient: string;
  href: string;
  name: string;
  title: string;
}

interface PillarsProps {
  cards?: PillarCard[];
  eyebrow?: string;
  heading?: string;
}

const DEFAULT_CARDS: PillarCard[] = [
  {
    name: "Bits",
    title: "Bits — the tech side",
    href: "/bits",
    cta: "Visit My Bits",
    gradient: "pillar-bits-gradient",
    avatar: "/pillers/bits-avatar.svg",
    description:
      "Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
  },
  {
    name: "Bites",
    title: "Bites — the wellness side",
    href: "/bites",
    cta: "Visit My Bites",
    gradient: "pillar-bites-gradient",
    avatar: "/pillers/bites-avatar.svg",
    description:
      "A healthy, active life is the greatest gift we can give ourselves and our loved ones. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
  },
  {
    name: "Blog",
    title: "Blog — where they meet",
    href: "/blog",
    cta: "Visit My Blog",
    gradient: "pillar-blog-gradient",
    avatar: "/pillers/blog-avatar.svg",
    description:
      "Reflections on balancing tech life with physical and mental wellness, plus friendships, family, meaningful connections and emotions.",
  },
];

export default function Pillars({
  eyebrow,
  heading,
  cards,
}: PillarsProps = {}) {
  const pillars = cards ?? DEFAULT_CARDS;

  return (
    <section className="py-20 sm:py-24">
      <div className="wrapper">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3 block">
            {eyebrow ?? "What I write about"}
          </Eyebrow>
          <h2
            className="font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}
          >
            {heading ?? "Three lanes, one desk."}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              href={pillar.href}
              key={pillar.name}
            >
              <div
                aria-hidden="true"
                className={`${pillar.gradient} relative flex h-44 w-full items-center justify-center`}
              >
                <Image
                  alt=""
                  className="h-28 w-28 object-contain transition-transform duration-200 hover:rotate-[-5deg]"
                  height={120}
                  src={pillar.avatar}
                  width={120}
                />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="mb-3 font-bold text-[var(--fg-primary)] text-xl">
                  {pillar.title}
                </h3>
                <p
                  className="mb-6 flex-1 text-[var(--fg-secondary)] text-sm"
                  style={{ lineHeight: 1.65 }}
                >
                  {pillar.description}
                </p>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--fg-brand)] text-sm">
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
