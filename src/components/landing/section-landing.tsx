import {
  IconArrowRight,
  IconFolders,
  IconHome,
  IconNews,
  IconTags,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Post } from "./post-card";
import PostGrid from "./post-grid";
import SectionBanner, { type PillarKey } from "./section-banner";

export interface SectionLandingProps {
  accentColor: string;
  description: ReactNode;
  pillar: PillarKey;
  posts: Post[];
  title: string;
}

export default function SectionLanding({
  title,
  description,
  accentColor,
  posts,
  pillar,
}: SectionLandingProps) {
  const totalPosts = posts.length;
  const categoryCount = new Set(posts.map((p) => p.category)).size;
  const labelCount = new Set(posts.flatMap((p) => p.labels)).size;

  return (
    <main>
      <SectionBanner pillar={pillar} title={title} />

      {/* Breadcrumb + intro */}
      <section className="py-12">
        <div className="wrapper">
          <nav className="mb-5 flex items-center justify-center gap-2 text-[var(--fg-muted)] text-sm">
            <span className="text-[var(--fg-secondary)]">
              <a
                className="text-[var(--fg-secondary)] hover:underline"
                href="/"
              >
                <IconHome size={16} stroke={1.5} />
              </a>
            </span>
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

          <MetaRow
            accentColor={accentColor}
            categoryCount={categoryCount}
            labelCount={labelCount}
            pillar={pillar}
            title={title}
            totalPosts={totalPosts}
            wrapperClassName="mt-12"
          />
        </div>
      </section>

      {/* Filters + search */}
      <section className="pb-10">
        <div className="wrapper">
          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <h3
              className="mb-8 text-center font-bold text-[var(--fg-primary)]"
              style={{
                fontSize: "clamp(40px, 4vw, 60px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Featured <span style={{ color: accentColor }}>{title}</span>
            </h3>
            <hr />

            {/* <div className="flex flex-wrap items-center gap-2">
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
            </div> */}
          </div>
        </div>
      </section>

      <PostGrid accentColor={accentColor} posts={posts} />

      <MetaRow
        accentColor={accentColor}
        categoryCount={categoryCount}
        labelCount={labelCount}
        pillar={pillar}
        title={title}
        totalPosts={totalPosts}
        wrapperClassName="my-12"
      />
    </main>
  );
}

function MetaRow({
  accentColor,
  categoryCount,
  labelCount,
  pillar,
  title,
  totalPosts,
  wrapperClassName,
}: {
  accentColor: string;
  categoryCount: number;
  labelCount: number;
  pillar: PillarKey;
  title: string;
  totalPosts: number;
  wrapperClassName?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-[var(--border-subtle)] border-t pt-10 ${wrapperClassName ?? ""}`}
    >
      <MetaItem
        accentColor={accentColor}
        href={`/${pillar}/all`}
        icon={<IconNews size={18} stroke={1.75} />}
        label="posts"
        value={String(totalPosts)}
      />
      <MetaItem
        accentColor={accentColor}
        href="/categories"
        icon={<IconFolders size={18} stroke={1.75} />}
        label="categories"
        value={String(categoryCount)}
      />
      <MetaItem
        accentColor={accentColor}
        href="/labels"
        icon={<IconTags size={18} stroke={1.75} />}
        label="labels"
        value={String(labelCount)}
      />
      <Link
        className="inline-flex items-center gap-2 rounded-full border px-5 py-2 font-semibold text-sm transition-all [color:var(--accent)] hover:bg-[var(--accent)] hover:text-white"
        href={`/${pillar}/all`}
        style={
          {
            "--accent": accentColor,
            borderColor: accentColor,
          } as React.CSSProperties
        }
      >
        View all {title}
        <IconArrowRight size={16} stroke={2} />
      </Link>
    </div>
  );
}

function MetaItem({
  icon,
  value,
  label,
  accentColor,
  href,
  reverse,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  accentColor: string;
  href?: string;
  reverse?: boolean;
}) {
  const content = (
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

  if (href) {
    return (
      <Link className="underline-offset-4 hover:underline" href={href}>
        {content}
      </Link>
    );
  }

  return content;
}
