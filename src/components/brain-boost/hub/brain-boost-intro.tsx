import {
  IconCalendar,
  IconSparkles,
  IconStack,
  IconTarget,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import {
  BRAIN_BOOST_LEDE,
  BRAIN_BOOST_META,
  type BrainBoostMetaIcon,
} from "./meta";

const ICON_MAP: Record<BrainBoostMetaIcon, ReactNode> = {
  Layers: <IconStack size={18} />,
  Target: <IconTarget size={18} />,
  Sparkles: <IconSparkles size={18} />,
  Calendar: <IconCalendar size={18} />,
};

export default function BrainBoostIntro() {
  const tileBg = `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 12%, transparent)`;
  return (
    <section className="wrapper py-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center justify-center gap-2 text-sm"
        style={{ color: "var(--fg-muted)" }}
      >
        <Link className="hover:underline" href="/">
          PBDesk
        </Link>
        <span aria-hidden="true">/</span>
        <span
          aria-current="page"
          style={{ color: "var(--fg-primary)", fontWeight: 600 }}
        >
          Brain Boost
        </span>
      </nav>

      <h1
        className="text-center font-extrabold"
        style={{
          fontSize: "clamp(48px, 6vw, 80px)",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        My <span className="bb-gradient-text">Brain Boost</span>
      </h1>

      <p
        className="mx-auto mt-6 max-w-3xl text-center text-base sm:text-lg"
        style={{ color: "var(--fg-secondary)", lineHeight: 1.7 }}
      >
        {BRAIN_BOOST_LEDE}
      </p>

      <div
        className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t pt-8"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {BRAIN_BOOST_META.map((item) => (
          <span
            className="flex items-center gap-3 text-sm"
            key={item.label}
            style={{ color: "var(--fg-secondary)" }}
          >
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: tileBg, color: BRAIN_BOOST_ACCENT.primary }}
            >
              {ICON_MAP[item.icon]}
            </span>
            <span>
              <strong style={{ color: "var(--fg-primary)" }}>
                {item.value}
              </strong>{" "}
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
