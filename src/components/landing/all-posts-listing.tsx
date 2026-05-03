"use client";

// Full archive of posts under a single pillar with chip-based filters
// (category + label) and 20-per-page pagination. State lives in the
// client; data is fetched server-side and handed in via props.

import {
  IconChevronLeft,
  IconChevronRight,
  IconHome,
} from "@tabler/icons-react";
import { useState } from "react";
import CtaBanner from "@/components/home/cta-banner";
import PostCard, { type Post } from "./post-card";
import SectionBanner, { type PillarKey } from "./section-banner";

const POSTS_PER_PAGE = 20;

interface AllPostsListingProps {
  accentColor: string;
  description: string;
  pillar: PillarKey;
  posts: Post[];
  title: string;
}

interface ChipCount {
  count: number;
  name: string;
}

function countOccurrences(values: string[]): ChipCount[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default function AllPostsListing({
  accentColor,
  description,
  pillar,
  posts,
  title,
}: AllPostsListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const categories = countOccurrences(posts.map((p) => p.category));
  const labels = countOccurrences(posts.flatMap((p) => p.labels));

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }
    if (selectedLabel && !post.labels.includes(selectedLabel)) {
      return false;
    }
    return true;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  );
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  function handleCategoryChange(name: string | null) {
    setSelectedCategory(name);
    setPage(1);
  }

  function handleLabelChange(name: string | null) {
    setSelectedLabel(name);
    setPage(1);
  }

  return (
    <main>
      <SectionBanner pillar={pillar} title={title} />

      <section className="py-12">
        <div className="wrapper">
          <nav className="mb-5 flex items-center justify-center gap-2 text-[var(--fg-muted)] text-sm">
            <a className="text-[var(--fg-secondary)] hover:underline" href="/">
              <IconHome size={16} stroke={1.5} />
            </a>
            <span>/</span>
            <a
              className="text-[var(--fg-secondary)] hover:underline"
              href={`/${pillar}`}
            >
              {title}
            </a>
            <span>/</span>
            <span className="text-[var(--fg-primary)]">All</span>
          </nav>

          <h1
            className="mb-6 text-center font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(40px, 5vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            All <span style={{ color: accentColor }}>{title}</span>
          </h1>

          <p
            className="mx-auto max-w-3xl text-center text-[var(--fg-secondary)] text-base sm:text-lg"
            style={{ lineHeight: 1.7 }}
          >
            {description}
          </p>
        </div>
      </section>

      <section className="pb-6">
        <div className="wrapper space-y-5">
          <ChipRow
            accentColor={accentColor}
            chips={categories}
            label="Categories"
            onSelect={handleCategoryChange}
            selected={selectedCategory}
            totalCount={posts.length}
          />
          <ChipRow
            accentColor={accentColor}
            chips={labels}
            hashed
            label="Labels"
            onSelect={handleLabelChange}
            selected={selectedLabel}
            totalCount={posts.length}
          />
        </div>
      </section>

      <section className="pb-10">
        <div className="wrapper">
          <p className="text-center text-[var(--fg-muted)] text-sm">
            Showing {filteredPosts.length === 0 ? 0 : startIndex + 1}–
            {startIndex + visiblePosts.length} of {filteredPosts.length}{" "}
            {filteredPosts.length === 1 ? "post" : "posts"}
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="wrapper">
          {visiblePosts.length === 0 ? (
            <p className="text-center text-[var(--fg-secondary)]">
              No posts match the current filters.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post) => (
                <PostCard
                  accentColor={accentColor}
                  key={`${post.pillar ?? pillar}/${post.slug ?? post.title}`}
                  post={post}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {totalPages > 1 ? (
        <Pagination
          accentColor={accentColor}
          onPageChange={setPage}
          page={safePage}
          totalPages={totalPages}
        />
      ) : null}

      <CtaBanner />
    </main>
  );
}

interface ChipRowProps {
  accentColor: string;
  chips: ChipCount[];
  hashed?: boolean;
  label: string;
  onSelect: (name: string | null) => void;
  selected: string | null;
  totalCount: number;
}

function ChipRow({
  accentColor,
  chips,
  hashed,
  label,
  onSelect,
  selected,
  totalCount,
}: ChipRowProps) {
  if (chips.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
      <span className="shrink-0 pt-1.5 font-semibold text-[var(--fg-muted)] text-xs uppercase tracking-wider sm:w-24">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          accentColor={accentColor}
          active={selected === null}
          count={totalCount}
          label="All"
          onClick={() => onSelect(null)}
        />
        {chips.map((chip) => (
          <FilterChip
            accentColor={accentColor}
            active={selected === chip.name}
            count={chip.count}
            key={chip.name}
            label={hashed ? `#${chip.name}` : chip.name}
            onClick={() => onSelect(chip.name)}
          />
        ))}
      </div>
    </div>
  );
}

interface FilterChipProps {
  accentColor: string;
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}

function FilterChip({
  accentColor,
  active,
  count,
  label,
  onClick,
}: FilterChipProps) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold text-sm transition-colors"
      onClick={onClick}
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

interface PaginationProps {
  accentColor: string;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
}

function Pagination({
  accentColor,
  onPageChange,
  page,
  totalPages,
}: PaginationProps) {
  const pageNumbers = buildPageNumbers(page, totalPages);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <section className="pb-16">
      <div className="wrapper">
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <PageButton
            accentColor={accentColor}
            ariaLabel="Previous page"
            disabled={!canGoPrev}
            onClick={() => onPageChange(page - 1)}
          >
            <IconChevronLeft size={16} stroke={2} />
          </PageButton>

          {pageNumbers.map((entry, index) =>
            entry === "ellipsis" ? (
              <span
                className="px-2 text-[var(--fg-muted)] text-sm"
                // biome-ignore lint/suspicious/noArrayIndexKey: ellipses are positional and stable.
                key={`ellipsis-${index}`}
              >
                …
              </span>
            ) : (
              <PageButton
                accentColor={accentColor}
                active={entry === page}
                ariaLabel={`Page ${entry}`}
                key={entry}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </PageButton>
            )
          )}

          <PageButton
            accentColor={accentColor}
            ariaLabel="Next page"
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
          >
            <IconChevronRight size={16} stroke={2} />
          </PageButton>
        </nav>
      </div>
    </section>
  );
}

interface PageButtonProps {
  accentColor: string;
  active?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

function PageButton({
  accentColor,
  active,
  ariaLabel,
  children,
  disabled,
  onClick,
}: PageButtonProps) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      style={{
        background: active ? accentColor : "var(--bg-elevated)",
        color: active ? "#fff" : "var(--fg-secondary)",
        borderColor: active ? accentColor : "var(--border-subtle)",
      }}
      type="button"
    >
      {children}
    </button>
  );
}

function buildPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) {
    pages.push("ellipsis");
  }
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }
  if (end < total - 1) {
    pages.push("ellipsis");
  }
  pages.push(total);
  return pages;
}
