// /categories/[category] and /labels/[label] listing layout.
// Smaller and more focused than <SectionLanding> — no pillar banner, no
// cadence chip, no filter row. Heading + intro + post grid + CTA.

import { IconLayersIntersect, IconTags } from "@tabler/icons-react";
import CtaBanner from "@/components/home/cta-banner";
import type { Post } from "./post-card";
import PostGrid from "./post-grid";

export type TaxonomyKind = "category" | "label";

interface TaxonomyListingProps {
  accentColor: string;
  description?: string;
  kind: TaxonomyKind;
  posts: Post[];
  term: string;
}

const ACCENT_BY_KIND: Record<TaxonomyKind, string> = {
  category: "#4f46e5",
  label: "#10b981",
};

const PARENT_BY_KIND: Record<TaxonomyKind, { label: string; href: string }> = {
  category: { label: "Categories", href: "/categories" },
  label: { label: "Labels", href: "/labels" },
};

export default function TaxonomyListing({
  term,
  posts,
  kind,
  accentColor,
  description,
}: TaxonomyListingProps) {
  const accent = accentColor || ACCENT_BY_KIND[kind];
  const parent = PARENT_BY_KIND[kind];
  const pillarCount = new Set(posts.map((p) => p.pillar ?? "")).size;

  return (
    <main>
      <section className="py-16">
        <div className="wrapper">
          <nav className="mb-5 flex items-center justify-center gap-2 text-[var(--fg-muted)] text-sm">
            <a className="text-[var(--fg-secondary)] hover:underline" href="/">
              PBDesk
            </a>
            <span>/</span>
            <a
              className="text-[var(--fg-secondary)] hover:underline"
              href={parent.href}
            >
              {parent.label}
            </a>
            <span>/</span>
            <span className="text-[var(--fg-primary)]">{term}</span>
          </nav>

          <h1
            className="mb-6 text-center font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(40px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {kind === "category" ? "Category" : "Label"}{" "}
            <span style={{ color: accent }}>#{term}</span>
          </h1>

          <p
            className="mx-auto max-w-2xl text-center text-[var(--fg-secondary)] text-base sm:text-lg"
            style={{ lineHeight: 1.7 }}
          >
            {description ??
              `${posts.length} ${posts.length === 1 ? "post" : "posts"} tagged with #${term} across ${pillarCount} ${pillarCount === 1 ? "pillar" : "pillars"}.`}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-[var(--border-subtle)] border-t pt-8">
            <MetaItem
              accentColor={accent}
              icon={<IconLayersIntersect size={18} stroke={1.75} />}
              label={posts.length === 1 ? "post" : "posts"}
              value={String(posts.length)}
            />
            <MetaItem
              accentColor={accent}
              icon={<IconTags size={18} stroke={1.75} />}
              label={pillarCount === 1 ? "pillar" : "pillars"}
              value={String(pillarCount)}
            />
          </div>
        </div>
      </section>

      <PostGrid accentColor={accent} posts={posts} />

      <CtaBanner />
    </main>
  );
}

interface MetaItemProps {
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetaItem({ icon, value, label, accentColor }: MetaItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: `${accentColor}1a`, color: accentColor }}
      >
        {icon}
      </span>
      <span className="text-[var(--fg-secondary)] text-sm">
        <strong className="text-[var(--fg-primary)]">{value}</strong> {label}
      </span>
    </div>
  );
}
