import {
  IconFolders,
  IconNews,
  IconSearch,
  IconTags,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import CtaBanner from "@/components/home/cta-banner";
import type { Post } from "./post-card";
import PostGrid from "./post-grid";
import SectionBanner, { type PillarKey } from "./section-banner";

export interface SectionLandingProps {
  accentColor: string;
  description: ReactNode;
  /**
   * Optional editorial override for the filter chip list.
   * When omitted, chips are auto-derived from `posts`.
   */
  filters?: { label: string; count: number }[];
  pillar: PillarKey;
  posts: Post[];
  title: string;
}

function deriveFilters(posts: Post[]): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default function SectionLanding({
  title,
  description,
  accentColor,
  filters,
  posts,
  pillar,
}: SectionLandingProps) {
  const totalPosts = posts.length;
  const categoryCount = new Set(posts.map((p) => p.category)).size;
  const labelCount = new Set(posts.flatMap((p) => p.labels)).size;
  const filterChips = filters ?? deriveFilters(posts);

  return (
    <main>
      <SectionBanner pillar={pillar} title={title} />

      {/* Breadcrumb + intro */}
      <section className="py-12">
        <div className="wrapper">
          <nav className="mb-5 flex items-center justify-center gap-2 text-[var(--fg-muted)] text-sm">
            <span className="text-[var(--fg-secondary)]">PBDesk</span>
            <span>/</span>
            <span className="text-[var(--fg-primary)]">{title}</span>
          </nav>

          <h2
            className="mb-8 text-center font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(48px, 6vw, 80px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            My <span style={{ color: accentColor }}>{title}</span>
          </h2>

          <p
            className="mx-auto max-w-3xl text-center text-[var(--fg-secondary)] text-base sm:text-lg"
            style={{ lineHeight: 1.7 }}
          >
            {description}
          </p>

          {/* Meta row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-[var(--border-subtle)] border-t pt-10">
            <MetaItem
              accentColor={accentColor}
              icon={<IconNews size={18} stroke={1.75} />}
              label="posts"
              value={String(totalPosts)}
            />
            <MetaItem
              accentColor={accentColor}
              icon={<IconFolders size={18} stroke={1.75} />}
              label="categories"
              value={String(categoryCount)}
            />
            <MetaItem
              accentColor={accentColor}
              icon={<IconTags size={18} stroke={1.75} />}
              label="labels"
              value={String(labelCount)}
            />
          </div>
        </div>
      </section>

      {/* Filters + search */}
      <section className="pb-10">
        <div className="wrapper">
          <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                accentColor={accentColor}
                active
                count={totalPosts}
                label="All"
              />
              {filterChips.map((f) => (
                <FilterChip
                  accentColor={accentColor}
                  count={f.count}
                  key={f.label}
                  label={f.label}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2 sm:w-72">
              <IconSearch
                className="text-[var(--fg-muted)]"
                size={16}
                stroke={2}
              />
              <input
                aria-label="Search posts"
                className="w-full bg-transparent text-[var(--fg-primary)] text-sm focus:outline-none"
                placeholder="Search posts..."
                type="search"
              />
            </div>
          </div>
        </div>
      </section>

      <PostGrid accentColor={accentColor} posts={posts} />

      <CtaBanner />
    </main>
  );
}

function MetaItem({
  icon,
  value,
  label,
  accentColor,
  reverse,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  accentColor: string;
  reverse?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: `${accentColor}1a`, color: accentColor }}
      >
        {icon}
      </span>
      <span className="text-[var(--fg-secondary)] text-sm">
        {reverse ? (
          <>
            {value}{" "}
            <strong className="text-[var(--fg-primary)]">{label}</strong>
          </>
        ) : (
          <>
            <strong className="text-[var(--fg-primary)]">{value}</strong>{" "}
            {label}
          </>
        )}
      </span>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  accentColor,
}: {
  label: string;
  count: number;
  active?: boolean;
  accentColor: string;
}) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold text-sm transition-colors"
      style={{
        background: active ? accentColor : "var(--bg-elevated)",
        color: active ? "#fff" : "var(--fg-secondary)",
        borderColor: active ? accentColor : "var(--border-subtle)",
      }}
      type="button"
    >
      {label}
      <span className="text-xs opacity-75">{count}</span>
    </button>
  );
}
