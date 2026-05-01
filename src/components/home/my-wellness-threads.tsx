"use client";

import { IconApple, IconHeart, IconMoon, IconRun } from "@tabler/icons-react";
import { useId, useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";

type PillarKey = "nutrition" | "exercise" | "sleep" | "emotion";

interface Thread {
  angle: number;
  body: string;
  color: string;
  icon: typeof IconApple;
  key: PillarKey;
  n: string;
  short: string;
  title: string;
}

const Threads: Thread[] = [
  {
    n: "01",
    key: "nutrition",
    title: "Cellular Nutrition",
    short: "Nutrition",
    body: "Whole, natural, unprocessed foods rich in vitamins and minerals — fuel for immunity and repair.",
    icon: IconApple,
    color: "#10B981",
    angle: -135,
  },
  {
    n: "02",
    key: "exercise",
    title: "Adequate Exercise",
    short: "Exercise",
    body: "Regular movement — walking, yoga, strength — to boost endorphins and keep body and mind sharp.",
    icon: IconRun,
    color: "#F59E0B",
    angle: -45,
  },
  {
    n: "03",
    key: "sleep",
    title: "Quality Sleep",
    short: "Sleep",
    body: "Restorative sleep lets the body repair, balance hormones, and strengthen immunity. Quality over quantity.",
    icon: IconMoon,
    color: "#0EA5E9",
    angle: 135,
  },
  {
    n: "04",
    key: "emotion",
    title: "Emotional Wellness",
    short: "Emotion",
    body: "Manage stress, let go of negativity, cultivate balance. Mindfulness, gratitude, emotional detox.",
    icon: IconHeart,
    color: "#E11D48",
    angle: 45,
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
}: {
  active: PillarKey | null;
  onHover: (key: PillarKey | null) => void;
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

        {Threads.map((p) => (
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

      {Threads.map((p) => {
        const np = pos(p.angle);
        const isActive = active === p.key;
        return (
          <line
            className="connector"
            key={`c-${p.key}`}
            style={
              isActive
                ? { stroke: p.color, opacity: 0.7, strokeWidth: 1.75 }
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

      {Threads.map((p) => {
        const np = pos(p.angle);
        const isActive = active === p.key;
        const Icon = p.icon;
        return (
          <g
            className="breath cursor-pointer"
            key={p.key}
            onMouseEnter={() => onHover(p.key)}
            onMouseLeave={() => onHover(null)}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
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
}: {
  active: PillarKey | null;
  setActive: (key: PillarKey | null) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {Threads.map((p) => {
        const Icon = p.icon;
        const isActive = active === p.key;
        return (
          <div
            className={`pillar-row ${isActive ? "pillar-row-active" : ""}`}
            key={p.key}
            onMouseEnter={() => setActive(p.key)}
            onMouseLeave={() => setActive(null)}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MyWellnessThreads() {
  const [active, setActive] = useState<PillarKey | null>(null);

  return (
    <section className="py-20 sm:py-24">
      <div className="wrapper">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow className="mb-3 block">My Wellness Threads</Eyebrow>
          <h2
            className="mb-4 font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              textWrap: "balance",
            }}
          >
            for happy &amp; healthy life.
          </h2>
          <p
            className="mx-auto max-w-[58ch] text-[var(--fg-secondary)] text-base"
            style={{ lineHeight: 1.7, textWrap: "pretty" }}
          >
            Four threads I keep weaving through everyday life.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(420px,1.05fr)_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            <WellnessArt active={active} onHover={setActive} />
          </div>
          <ThreadsList active={active} setActive={setActive} />
        </div>
      </div>
    </section>
  );
}
