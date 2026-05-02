// Index page for /categories and /labels — one card per term.

import { IconArrowRight, IconLayersIntersect } from "@tabler/icons-react";
import CtaBanner from "@/components/home/cta-banner";

export type TaxonomyKind = "category" | "label";

interface TaxonomyIndexProps {
  description: string;
  hrefBase: string;
  kind: TaxonomyKind;
  terms: { name: string; count: number }[];
  title: string;
}

const ACCENT_BY_KIND: Record<TaxonomyKind, string> = {
  category: "#4f46e5",
  label: "#10b981",
};

export default function TaxonomyIndex({
  title,
  description,
  terms,
  hrefBase,
  kind,
}: TaxonomyIndexProps) {
  const accent = ACCENT_BY_KIND[kind];

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
          {terms.length === 0 ? (
            <p className="text-center text-[var(--fg-secondary)]">
              No {kind === "category" ? "categories" : "labels"} yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {terms.map((term) => (
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
                        {term.count} {term.count === 1 ? "post" : "posts"}
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
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBanner />
    </main>
  );
}
