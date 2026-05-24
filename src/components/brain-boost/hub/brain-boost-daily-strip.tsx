import { IconCalendar, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";

interface BrainBoostDailyStripProps {
  body?: string;
  ctaPlay?: string;
  heading?: string;
}

export default function BrainBoostDailyStrip({
  body = "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
  ctaPlay = "Play today's",
  heading = "Today's daily — Intermediate",
}: BrainBoostDailyStripProps) {
  return (
    <section className="wrapper py-6">
      <div className="bb-gradient-bg relative grid items-center gap-6 overflow-hidden rounded-2xl p-9 text-white md:grid-cols-[1fr_auto] md:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 80% 30%, rgb(255 255 255 / 0.18), transparent 50%)",
          }}
        />
        <div className="relative">
          <h3
            className="font-extrabold"
            style={{ fontSize: 28, lineHeight: 1.15 }}
          >
            {heading}
          </h3>
          <p
            className="mt-2 max-w-2xl text-sm sm:text-base"
            style={{ color: "rgb(255 255 255 / 0.85)", lineHeight: 1.6 }}
          >
            {body}
          </p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-sm"
            href="/brain-boost/kenken/daily"
            style={{ color: "#9a3412" }}
          >
            <IconPlayerPlay size={14} /> {ctaPlay}
          </Link>
          {/* TODO archive route — Phase 2 of the spec (date-seeded daily + archive) */}
          <button
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border px-5 py-2.5 font-medium text-sm text-white opacity-60"
            disabled
            style={{
              background: "rgb(255 255 255 / 0.12)",
              borderColor: "rgb(255 255 255 / 0.4)",
            }}
            type="button"
          >
            <IconCalendar size={14} /> Archive
          </button>
        </div>
      </div>
    </section>
  );
}
