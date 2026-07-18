"use client";

import {
  IconApple,
  IconHeart,
  IconMoon,
  type IconProps,
  IconRun,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { useId, useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { getRevealStaggerDelay } from "@/lib/reveal-motion";

type PillarKey = "nutrition" | "exercise" | "sleep" | "emotion";
type IconKey = "apple" | "run" | "moon" | "heart";

const ICONS: Record<IconKey, ComponentType<IconProps>> = {
  apple: IconApple,
  heart: IconHeart,
  moon: IconMoon,
  run: IconRun,
};

const ICON_BY_PILLAR: Record<PillarKey, IconKey> = {
  emotion: "heart",
  exercise: "run",
  nutrition: "apple",
  sleep: "moon",
};

interface Thread {
  angle: number;
  body: string;
  color: string;
  icon: ComponentType<IconProps>;
  key: PillarKey;
  n: string;
  short: string;
  title: string;
}

interface ThreadInput {
  angle?: number;
  body: string;
  color?: string;
  icon?: IconKey;
  key: PillarKey;
  n?: string;
  short: string;
  title: string;
}

interface MyWellnessThreadsProps {
  eyebrow?: string;
  headline?: string;
  subheading?: string;
  threads?: ThreadInput[];
}

const DEFAULT_COLORS: Record<PillarKey, string> = {
  emotion: "#E11D48",
  exercise: "#F59E0B",
  nutrition: "#10B981",
  sleep: "#0EA5E9",
};

const DEFAULT_ANGLES: Record<PillarKey, number> = {
  emotion: 45,
  exercise: -45,
  nutrition: -135,
  sleep: 135,
};

function normalizeThreads(input?: ThreadInput[]): Thread[] {
  if (!input?.length) {
    return DEFAULT_THREADS;
  }
  return input.map((t, idx) => ({
    angle: t.angle ?? DEFAULT_ANGLES[t.key],
    body: t.body,
    color: t.color ?? DEFAULT_COLORS[t.key],
    icon: ICONS[t.icon ?? ICON_BY_PILLAR[t.key]] ?? IconApple,
    key: t.key,
    n: t.n ?? String(idx + 1).padStart(2, "0"),
    short: t.short,
    title: t.title,
  }));
}

const DEFAULT_THREADS: Thread[] = [
  {
    angle: -135,
    body: "Whole, natural, unprocessed foods rich in vitamins and minerals — fuel for immunity and repair.",
    color: "#10B981",
    icon: IconApple,
    key: "nutrition",
    n: "01",
    short: "Nutrition",
    title: "Cellular Nutrition",
  },
  {
    angle: -45,
    body: "Regular movement — walking, yoga, strength — to boost endorphins and keep body and mind sharp.",
    color: "#F59E0B",
    icon: IconRun,
    key: "exercise",
    n: "02",
    short: "Exercise",
    title: "Adequate Exercise",
  },
  {
    angle: 135,
    body: "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
    color: "#0EA5E9",
    icon: IconMoon,
    key: "sleep",
    n: "03",
    short: "Sleep",
    title: "Quality Sleep",
  },
  {
    angle: 45,
    body: "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, emotional detox.",
    color: "#E11D48",
    icon: IconHeart,
    key: "emotion",
    n: "04",
    short: "Emotion",
    title: "Emotional Wellness",
  },
];

const VB = 560;
const CENTER = VB / 2;
const RING_R = 200;
const NODE_R = 56;
const HUB_R = 78;

function pos(deg: number) {
  const r = (deg * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(r) * RING_R,
    y: CENTER + Math.sin(r) * RING_R,
  };
}

function WellnessArt({
  active,
  onHover,
  threads,
}: {
  active: PillarKey | null;
  onHover: (key: PillarKey | null) => void;
  threads: Thread[];
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      aria-label="My four wellness pillars"
      className="pillars-art block h-full w-full"
      role="img"
      viewBox={`0 0 ${VB} ${VB}`}
    >
      <defs>
        <radialGradient cx="50%" cy="50%" id={`hubGrad-${uid}`} r="50%">
          <stop
            offset="0%"
            stopColor="var(--color-brand-600)"
            stopOpacity="0.22"
          />
          <stop
            offset="60%"
            stopColor="var(--color-brand-600)"
            stopOpacity="0.05"
          />
          <stop
            offset="100%"
            stopColor="var(--color-brand-600)"
            stopOpacity="0"
          />
        </radialGradient>

        <radialGradient cx="50%" cy="50%" id={`bgGrad-${uid}`} r="50%">
          <stop
            offset="0%"
            stopColor="var(--color-brand-600)"
            stopOpacity="0.06"
          />
          <stop
            offset="70%"
            stopColor="var(--color-brand-600)"
            stopOpacity="0"
          />
        </radialGradient>

        {threads.map((p) => (
          <radialGradient
            cx="50%"
            cy="40%"
            id={`nodeGrad-${uid}-${p.key}`}
            key={p.key}
            r="60%"
          >
            <stop offset="0%" stopColor={p.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0.04" />
          </radialGradient>
        ))}
      </defs>

      <rect fill={`url(#bgGrad-${uid})`} height={VB} width={VB} x="0" y="0" />

      <circle className="orbit-ring" cx={CENTER} cy={CENTER} r={RING_R} />
      <circle
        className="orbit-ring"
        cx={CENTER}
        cy={CENTER}
        r={RING_R - 60}
        style={{ opacity: 0.4 }}
      />

      {[0, 90, 180, 270].map((a) => {
        const p = pos(a);
        return <circle className="pip" cx={p.x} cy={p.y} key={a} r="3" />;
      })}

      {threads.map((p) => {
        const np = pos(p.angle);
        const isActive = active === p.key;
        return (
          <line
            className="connector"
            key={`c-${p.key}`}
            style={
              isActive
                ? { opacity: 0.7, stroke: p.color, strokeWidth: 1.75 }
                : undefined
            }
            x1={CENTER}
            x2={np.x}
            y1={CENTER}
            y2={np.y}
          />
        );
      })}

      <g className="float-1">
        <circle
          className="satellite"
          cx={CENTER + RING_R - 18}
          cy={CENTER - 4}
          r="6"
        />
      </g>
      <g className="float-2">
        <circle
          className="satellite"
          cx={CENTER - RING_R + 18}
          cy={CENTER + 4}
          r="5"
        />
      </g>
      <g className="float-3">
        <circle
          className="satellite"
          cx={CENTER - 4}
          cy={CENTER - RING_R + 18}
          r="4"
        />
      </g>
      <g className="float-4">
        <circle
          className="satellite"
          cx={CENTER + 4}
          cy={CENTER + RING_R - 18}
          r="5"
        />
      </g>

      <circle
        className="hub-glow"
        cx={CENTER}
        cy={CENTER}
        fill={`url(#hubGrad-${uid})`}
        r={HUB_R + 30}
      />

      <g>
        <circle className="hub-inner" cx={CENTER} cy={CENTER} r={HUB_R} />
        <circle className="hub-circle" cx={CENTER} cy={CENTER} r={HUB_R - 6} />
        <text className="hub-sub" x={CENTER} y={CENTER - 14}>
          Wellness
        </text>
        <text className="hub-title" x={CENTER} y={CENTER + 8}>
          Live Well,
        </text>
        <text className="hub-title" x={CENTER} y={CENTER + 30}>
          Build Long.
        </text>
      </g>

      {threads.map((p) => {
        const np = pos(p.angle);
        const isActive = active === p.key;
        const Icon = p.icon;
        const handleEnter = () => onHover(p.key);
        const handleLeave = () => onHover(null);
        return (
          <g
            className="breath cursor-pointer"
            key={p.key}
            // biome-ignore lint/performance/noJsxPropsBind: per-item hover handlers; React Compiler memoizes them.
            onMouseEnter={handleEnter}
            // biome-ignore lint/performance/noJsxPropsBind: per-item hover handlers; React Compiler memoizes them.
            onMouseLeave={handleLeave}
            style={{
              animationDelay: `${(Number(p.n) - 1) * 1.2}s`,
            }}
          >
            {isActive && (
              <circle
                cx={np.x}
                cy={np.y}
                fill="none"
                r={NODE_R + 10}
                stroke={p.color}
                strokeDasharray="2 4"
                strokeOpacity="0.25"
                strokeWidth="1.5"
              />
            )}

            <circle
              className={`node-bg ${isActive ? "node-bg-active" : ""}`}
              cx={np.x}
              cy={np.y}
              r={NODE_R}
              style={{
                ["--pillar-color" as string]: p.color,
                stroke: isActive ? p.color : undefined,
                strokeWidth: isActive ? 1.75 : 1.25,
              }}
            />
            <circle
              cx={np.x}
              cy={np.y}
              fill={`url(#nodeGrad-${uid}-${p.key})`}
              r={NODE_R - 1}
            />

            <foreignObject height="28" width="28" x={np.x - 14} y={np.y - 22}>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  height: "100%",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Icon color={p.color} size={26} stroke={1.75} />
              </div>
            </foreignObject>

            <g
              transform={`translate(${np.x + NODE_R - 14}, ${np.y - NODE_R + 14})`}
            >
              <circle fill={p.color} r="11" />
              <text
                fill="white"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                x="0"
                y="3"
              >
                {p.n}
              </text>
            </g>

            <text className="node-label" x={np.x} y={np.y + 14}>
              {p.short}
            </text>
            <text className="node-sub" x={np.x} y={np.y + 28}>
              {p.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ThreadsList({
  active,
  setActive,
  threads,
}: {
  active: PillarKey | null;
  setActive: (key: PillarKey | null) => void;
  threads: Thread[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {threads.map((p, index) => {
        const Icon = p.icon;
        const isActive = active === p.key;
        const handleEnter = () => setActive(p.key);
        const handleLeave = () => setActive(null);
        return (
          <Reveal delay={getRevealStaggerDelay(index)} key={p.key}>
            <div
              className={`pillar-row ${isActive ? "pillar-row-active" : ""}`}
              // biome-ignore lint/performance/noJsxPropsBind: per-item hover handlers; React Compiler memoizes them.
              onMouseEnter={handleEnter}
              // biome-ignore lint/performance/noJsxPropsBind: per-item hover handlers; React Compiler memoizes them.
              onMouseLeave={handleLeave}
              style={{ ["--pillar-color" as string]: p.color }}
            >
              <span className="pillar-icon">
                <Icon size={26} stroke={1.75} />
              </span>
              <div className="min-w-0">
                <div className="mb-1.5 flex items-baseline gap-2.5">
                  <span className="font-mono font-semibold text-[11px] text-[var(--fg-muted)] tracking-wider">
                    THREAD / {p.n}
                  </span>
                </div>
                <h3 className="font-semibold text-[17px] text-[var(--fg-primary)] tracking-tight">
                  {p.title}
                </h3>
                <p
                  className="text-[14px] text-[var(--fg-secondary)]"
                  style={{ lineHeight: 1.6 }}
                >
                  {p.body}
                </p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

export default function MyWellnessThreads({
  eyebrow,
  headline,
  subheading,
  threads,
}: MyWellnessThreadsProps = {}) {
  const [active, setActive] = useState<PillarKey | null>(null);
  const threadList = normalizeThreads(threads);

  return (
    <section className="py-20 sm:py-24">
      <div className="wrapper">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow className="mb-3 block">
            {eyebrow ?? "My Wellness Threads"}
          </Eyebrow>
          <h2
            className="mb-4 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              textWrap: "balance",
            }}
          >
            {headline ?? "for happy & healthy life."}
          </h2>
          <p
            className="mx-auto max-w-[58ch] text-[var(--fg-secondary)] text-base"
            style={{ lineHeight: 1.7, textWrap: "pretty" }}
          >
            {subheading ?? "Four threads I keep weaving through everyday life."}
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(420px,1.05fr)_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            <WellnessArt
              active={active}
              onHover={setActive}
              threads={threadList}
            />
          </div>
          <ThreadsList
            active={active}
            setActive={setActive}
            threads={threadList}
          />
        </div>
      </div>
    </section>
  );
}
