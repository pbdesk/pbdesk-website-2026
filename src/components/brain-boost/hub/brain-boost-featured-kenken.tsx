import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { BRAIN_BOOST_GAMES, type BrainBoostGame } from "./games-registry";

interface BrainBoostFeaturedKenkenProps {
  game?: BrainBoostGame;
}

export default function BrainBoostFeaturedKenken({
  game,
}: BrainBoostFeaturedKenkenProps) {
  const kenken = game ?? BRAIN_BOOST_GAMES.find((g) => g.slug === "kenken");
  if (!kenken) {
    return null;
  }

  return (
    <section className="wrapper py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2
          className="font-extrabold"
          style={{
            fontSize: "clamp(28px, 3.4vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          The <span className="bb-gradient-text">first game</span> is KenKen
        </h2>
        <Link
          className="inline-flex items-center gap-1 text-sm hover:underline"
          href="/brain-boost"
          style={{ color: "var(--fg-secondary)" }}
        >
          All games <IconArrowRight size={14} />
        </Link>
      </div>

      <div
        className="grid grid-cols-1 overflow-hidden rounded-2xl border md:grid-cols-[1.2fr_1fr]"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Cover (left) */}
        <div
          className="relative flex min-h-[380px] items-center justify-center p-8"
          style={{
            background:
              "linear-gradient(135deg, #134e4a 0%, #0d9488 40%, #14b8a6 100%)",
          }}
        >
          <span className="bb-gradient-bg absolute top-5 left-5 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] text-white uppercase tracking-[0.12em]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-white"
            />
            Now playing
          </span>
          <Image
            alt="KenKen puzzle preview"
            className="h-auto w-full max-w-[460px] rounded-2xl"
            height={460}
            sizes="(max-width: 768px) 100vw, 460px"
            src="/pillers/kenken-banner.png"
            style={{ boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.4)" }}
            width={460}
          />
        </div>

        {/* Body (right) */}
        <div className="flex flex-col gap-5 p-8">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "#f97316" }}
          >
            {kenken.category}
          </span>
          <h3
            className="font-extrabold tracking-tight"
            style={{ fontSize: 40, lineHeight: 1.05 }}
          >
            {kenken.name}
          </h3>
          <p style={{ color: "var(--fg-secondary)", lineHeight: 1.7 }}>
            {kenken.description}
          </p>
          <div
            className="grid grid-cols-3 gap-4 border-y py-[18px]"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Stat label="Grid sizes" value="3×3 → 9×9" />
            <Stat label="Typical solve" value={kenken.estTime ?? "—"} />
            <Stat label="Operations" value={kenken.operations ?? "—"} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="bb-gradient-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm"
              href="/brain-boost/kenken/play"
            >
              <IconPlayerPlay size={14} /> Play KenKen
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium text-sm"
              href="/brain-boost/kenken"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--fg-primary)",
              }}
            >
              How to play
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <strong style={{ color: "var(--fg-primary)" }}>{value}</strong>
      <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
        {label}
      </span>
    </div>
  );
}
