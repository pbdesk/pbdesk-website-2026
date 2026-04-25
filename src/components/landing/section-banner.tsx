import type { ReactNode } from "react";

interface SectionBannerProps {
  accentColor: string;
  accentColor2: string;
  bannerLabel: string;
  bigIcon: ReactNode;
  pill: string;
  pillIcon?: ReactNode;
  subtitle: string;
  tileGradient: string;
  title: string;
}

export default function SectionBanner({
  title,
  subtitle,
  pill,
  pillIcon,
  bannerLabel,
  accentColor,
  accentColor2,
  bigIcon,
  tileGradient,
}: SectionBannerProps) {
  return (
    <div className="wrapper py-8">
      <div className="section-banner-bg relative overflow-hidden rounded-3xl px-8 py-14 sm:px-14 sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Left: title + subtitle + bar + pill */}
          <div>
            <h1
              className="font-bold"
              style={{
                fontSize: "clamp(72px, 10vw, 144px)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                color: "var(--fg-primary)",
              }}
            >
              {title}
            </h1>
            <p
              className="mt-4 text-lg sm:text-xl"
              style={{
                color: "var(--fg-secondary)",
                letterSpacing: "0.02em",
              }}
            >
              {subtitle}
            </p>

            {/* Progress bar */}
            <div className="mt-6 flex items-center gap-2">
              <span
                className="block h-1.5 w-32 rounded-full"
                style={{ background: accentColor }}
              />
              <span
                className="block h-1.5 w-10 rounded-full"
                style={{ background: accentColor2 }}
              />
            </div>

            {/* Pill */}
            <div className="mt-8">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-sm"
                style={{
                  background: "var(--bg-elevated)",
                  color: accentColor,
                  border: `1px solid ${accentColor}33`,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {pillIcon}
                {pill}
              </span>
            </div>
          </div>

          {/* Right: big icon tile */}
          <div className="relative flex items-center justify-center">
            <div
              className={`${tileGradient} relative flex h-44 w-44 items-center justify-center rounded-3xl sm:h-56 sm:w-56`}
              style={{ boxShadow: "var(--shadow-xl)" }}
            >
              <div className="text-white">{bigIcon}</div>
            </div>

            {/* Tag */}
            <span
              className="absolute top-1/2 right-0 hidden -translate-y-1/2 rounded-full border bg-white px-3 py-1 font-semibold text-xs lg:inline-flex dark:bg-zinc-900"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--fg-primary)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {bannerLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
