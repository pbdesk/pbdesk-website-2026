import {
  IconBrain,
  IconClock,
  IconFlame,
  IconTarget,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";

interface Benefit {
  body: string;
  icon: ReactNode;
  title: string;
}

const BENEFITS: readonly Benefit[] = [
  {
    icon: <IconTarget size={20} />,
    title: "Single-task focus",
    body: "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
  },
  {
    icon: <IconBrain size={20} />,
    title: "Working-memory workout",
    body: 'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
  },
  {
    icon: <IconClock size={20} />,
    title: "Designed to be short",
    body: "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
  },
  {
    icon: <IconFlame size={20} />,
    title: "Daily ritual, no streak shame",
    body: "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
  },
];

export default function BrainBoostBenefits() {
  const tileBg = `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 12%, transparent)`;
  return (
    <section className="wrapper py-12">
      <h2
        className="mb-6 font-extrabold"
        style={{
          fontSize: "clamp(28px, 3.4vw, 40px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        Why <span className="bb-gradient-text">Brain Boost?</span>
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <article
            className="flex flex-col gap-3 rounded-2xl border p-6"
            key={b.title}
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <span
              aria-hidden="true"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: tileBg, color: BRAIN_BOOST_ACCENT.primary }}
            >
              {b.icon}
            </span>
            <h3
              className="font-bold"
              style={{ fontSize: 18, lineHeight: 1.25 }}
            >
              {b.title}
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--fg-secondary)", lineHeight: 1.65 }}
            >
              {b.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
