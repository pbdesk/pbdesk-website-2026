import {
  IconBrain,
  IconClock,
  IconFlame,
  IconTarget,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { BENEFITS, type Benefit, type BenefitIconKey } from "./meta";

const ICON_MAP: Record<BenefitIconKey, ReactNode> = {
  Target: <IconTarget size={20} />,
  Brain: <IconBrain size={20} />,
  Clock: <IconClock size={20} />,
  Flame: <IconFlame size={20} />,
};

interface BrainBoostBenefitsProps {
  benefits?: readonly Benefit[];
  heading?: string;
}

export default function BrainBoostBenefits({
  benefits = BENEFITS,
  heading = "Why Brain Boost?",
}: BrainBoostBenefitsProps) {
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
        <span className="bb-gradient-text">{heading}</span>
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
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
              {ICON_MAP[b.icon]}
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
