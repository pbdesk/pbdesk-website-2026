"use client";

// Index page for /categories and /labels — one card per term.

import { IconArrowRight, IconLayersIntersect } from "@tabler/icons-react";
import { useState } from "react";
import MyPillers from "@/components/home/my-pillers";
import { pillarAccents } from "@/lib/pillars";
import type { PillarKey } from "@/lib/storyblok/types";

export type TaxonomyKind = "category" | "label";

interface TermData {
  count: number;
  name: string;
  pillarCounts?: Partial<Record<PillarKey, number>>;
  pillars?: PillarKey[];
}

interface TaxonomyIndexProps {
  description: string;
  hrefBase: string;
  kind: TaxonomyKind;
  terms: TermData[];
  title: string;
}

const ACCENT_BY_KIND: Record<TaxonomyKind, string> = {
  category: "#4f46e5",
  label: "#10b981",
};

const PILLARS: { key: PillarKey; label: string }[] = [
  { key: "bits", label: "Bits" },
  { key: "bites", label: "Bites" },
  { key: "blog", label: "Blog" },
];

export default function TaxonomyIndex({
  title,
  description,
  terms,
  hrefBase,
  kind,
}: TaxonomyIndexProps) {
  const accent = ACCENT_BY_KIND[kind];
  const [activePillar, setActivePillar] = useState<PillarKey | "all">("all");

  const availablePillars = PILLARS.filter((p) =>
    terms.some((t) => t.pillars?.includes(p.key))
  );

  const filteredTerms =
    activePillar === "all"
      ? terms
      : terms.filter((t) => t.pillars?.includes(activePillar));

  const displayCount = (term: TermData) =>
    activePillar === "all"
      ? term.count
      : (term.pillarCounts?.[activePillar] ?? 0);

  const emptyLabel = kind === "category" ? "categories" : "labels";

  return (
    <main>
      <section className="py-16">
        <div className="wrapper">
          <nav className="mb-5 flex items-center justify-center gap-2 text-[var(--fg-muted)] text-sm">
            <a className="text-[var(--fg-secondary)] hover:underline" href="/">
              PBDesk
            </a>
            <span>/</span>
            <span className="text-[var(--fg-primary)]">{title}</span>
          </nav>

          <h1
            className="mb-6 text-center font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(48px, 6vw, 80px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>

          <p
            className="mx-auto max-w-2xl text-center text-[var(--fg-secondary)] text-base sm:text-lg"
            style={{ lineHeight: 1.7 }}
          >
            {description}
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="wrapper">
          {availablePillars.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold text-sm transition-colors"
                onClick={() => setActivePillar("all")}
                style={{
                  background:
                    activePillar === "all" ? accent : "var(--bg-elevated)",
                  color:
                    activePillar === "all" ? "#fff" : "var(--fg-secondary)",
                  borderColor:
                    activePillar === "all" ? accent : "var(--border-subtle)",
                }}
                type="button"
              >
                All
                <span className="text-xs opacity-75">
                  {terms.reduce((sum, t) => sum + t.count, 0)}
                </span>
              </button>
              {availablePillars.map(({ key, label }) => {
                const color = pillarAccents[key].primary;
                const isActive = activePillar === key;
                const count = terms.reduce(
                  (sum, t) => sum + (t.pillarCounts?.[key] ?? 0),
                  0
                );
                return (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold text-sm transition-colors"
                    key={key}
                    onClick={() => setActivePillar(key)}
                    style={{
                      background: isActive ? color : "var(--bg-elevated)",
                      color: isActive ? "#fff" : "var(--fg-secondary)",
                      borderColor: isActive ? color : "var(--border-subtle)",
                    }}
                    type="button"
                  >
                    {label}
                    <span className="text-xs opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredTerms.length === 0 ? (
            <p className="text-center text-[var(--fg-secondary)]">
              No {emptyLabel} yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTerms.map((term) => {
                const count = displayCount(term);
                return (
                  <a
                    className="group flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    href={`${hrefBase}/${encodeURIComponent(term.name)}`}
                    key={term.name}
                  >
                    <div>
                      <div className="mb-1 font-semibold text-[var(--fg-primary)] text-lg">
                        {kind === "label" ? `#${term.name}` : term.name}
                      </div>
                      <div className="flex items-center gap-2 text-[var(--fg-muted)] text-sm">
                        <IconLayersIntersect size={14} stroke={1.75} />
                        <span>
                          {count} {count === 1 ? "post" : "posts"}
                        </span>
                      </div>
                    </div>
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                      style={{ background: `${accent}1a`, color: accent }}
                    >
                      <IconArrowRight size={16} stroke={2} />
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <MyPillers />
    </main>
  );
}
