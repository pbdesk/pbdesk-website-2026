"use client";

import {
  IconCode,
  IconLeaf,
  IconNotebook,
  type IconProps,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { useId, useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { getRevealStaggerDelay } from "@/lib/reveal-motion";

type PillarKey = "bits" | "bites" | "blog";

interface Pillar {
  angle: number;
  body: string;
  color: string;
  cta: string;
  href: string;
  icon: ComponentType<IconProps>;
  key: PillarKey;
  n: string;
  short: string;
  title: string;
}

interface PillarInput {
  angle?: number;
  body: string;
  color?: string;
  cta?: string;
  href?: string;
  key: PillarKey;
  n?: string;
  short?: string;
  title: string;
}

interface MyPillersProps {
  eyebrow?: string;
  heading?: string;
  pillars?: PillarInput[];
  subheading?: string;
}

const ICON_BY_PILLAR: Record<PillarKey, ComponentType<IconProps>> = {
  bites: IconLeaf,
  bits: IconCode,
  blog: IconNotebook,
};

const DEFAULT_COLORS: Record<PillarKey, string> = {
  bites: "#10B981",
  bits: "#4F46E5",
  blog: "#7C3AED",
};

const DEFAULT_ANGLES: Record<PillarKey, number> = {
  bites: 30,
  bits: -90,
  blog: 150,
};

const DEFAULT_HREFS: Record<PillarKey, string> = {
  bites: "/bites",
  bits: "/bits",
  blog: "/blog",
};

const DEFAULT_PILLARS: Pillar[] = [
  {
    angle: -90,
    body: "Insights on AI, programming, and software development — frameworks, dev tools, productivity hacks, and the occasional deep dive.",
    color: "#4F46E5",
    cta: "Visit My Bits",
    href: "/bits",
    icon: IconCode,
    key: "bits",
    n: "01",
    short: "Bits",
    title: "Bits — the tech side",
  },
  {
    angle: 30,
    body: "A healthy, active life is the greatest gift we can give ourselves. Fitness, nutrition, mindfulness — small choices, lasting vitality.",
    color: "#10B981",
    cta: "Visit My Bites",
    href: "/bites",
    icon: IconLeaf,
    key: "bites",
    n: "02",
    short: "Bites",
    title: "Bites — the wellness side",
  },
  {
    angle: 150,
    body: "Longer-form reflections on balancing tech life with physical wellness, plus friendships, family, and meaningful connections.",
    color: "#7C3AED",
    cta: "Visit My Blog",
    href: "/blog",
    icon: IconNotebook,
    key: "blog",
    n: "03",
    short: "Blog",
    title: "Blog — where they meet",
  },
];

function normalizePillars(input?: PillarInput[]): Pillar[] {
  if (!input?.length) {
    return DEFAULT_PILLARS;
  }
  return input.map((p, idx) => ({
    angle: p.angle ?? DEFAULT_ANGLES[p.key],
    body: p.body,
    color: p.color ?? DEFAULT_COLORS[p.key],
    cta: p.cta ?? `Visit My ${p.key.charAt(0).toUpperCase() + p.key.slice(1)}`,
    href: p.href ?? DEFAULT_HREFS[p.key],
    icon: ICON_BY_PILLAR[p.key],
    key: p.key,
    n: p.n ?? String(idx + 1).padStart(2, "0"),
    short: p.short ?? p.key.charAt(0).toUpperCase() + p.key.slice(1),
    title: p.title,
  }));
}

const VB = 560;
const CENTER = VB / 2;
const RING_R = 200;
const NODE_R = 60;
const HUB_R = 78;

function pos(deg: number) {
  const r = (deg * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(r) * RING_R,
    y: CENTER + Math.sin(r) * RING_R,
  };
}

function PillarsArt({
  active,
  onHover,
  pillars,
}: {
  active: PillarKey | null;
  onHover: (key: PillarKey | null) => void;
  pillars: Pillar[];
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      aria-label="My three pillars: Bits, Bites, Blog"
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

        {pillars.map((p) => (
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

      {pillars.map((p) => {
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
          Three Lanes,
        </text>
        <text className="hub-title" x={CENTER} y={CENTER + 8}>
          One Desk.
        </text>
        <text className="hub-title" x={CENTER} y={CENTER + 30}>
          PB.
        </text>
      </g>

      {pillars.map((p) => {
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

function PillarsList({
  active,
  setActive,
  pillars,
}: {
  active: PillarKey | null;
  setActive: (key: PillarKey | null) => void;
  pillars: Pillar[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {pillars.map((p, index) => {
        const Icon = p.icon;
        const isActive = active === p.key;
        const handleEnter = () => setActive(p.key);
        const handleLeave = () => setActive(null);
        return (
          <Reveal delay={getRevealStaggerDelay(index)} key={p.key}>
            <Link
              className={`pillar-row ${isActive ? "pillar-row-active" : ""}`}
              href={p.href}
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
                    PILLAR / {p.n}
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
                <span
                  className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[13px]"
                  style={{ color: p.color }}
                >
                  {p.cta} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

export default function MyPillers({
  eyebrow,
  heading,
  subheading,
  pillars,
}: MyPillersProps = {}) {
  const [active, setActive] = useState<PillarKey | null>(null);
  const pillarList = normalizePillars(pillars);

  return (
    <section className="py-20 sm:py-24">
      <div className="wrapper">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow className="mb-3 block">
            {eyebrow ?? "What I write about"}
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
            {heading ?? "Three lanes, one desk."}
          </h2>
          <p
            className="mx-auto max-w-[58ch] text-[var(--fg-secondary)] text-base"
            style={{ lineHeight: 1.7, textWrap: "pretty" }}
          >
            {subheading ??
              "Bits, Bites, and the Blog where they meet — three orbits around the same desk."}
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(420px,1.05fr)_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            <PillarsArt
              active={active}
              onHover={setActive}
              pillars={pillarList}
            />
          </div>
          <PillarsList
            active={active}
            pillars={pillarList}
            setActive={setActive}
          />
        </div>
      </div>
    </section>
  );
}
