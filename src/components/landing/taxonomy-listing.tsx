"use client";

// /categories/[category] and /labels/[label] listing layout.
// Heading + intro + pillar filter chips + post grid + CTA.

// import { IconLayersIntersect, IconTags } from "@tabler/icons-react";
import { useState } from "react";
import MyPillers from "@/components/home/my-pillers";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Chip } from "@/components/ui/chip";
import { pillarAccents } from "@/lib/pillars";
import type { PillarKey } from "@/lib/storyblok/types";
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

const PILLARS: { key: PillarKey; label: string }[] = [
  { key: "bits", label: "Bits" },
  { key: "bites", label: "Bites" },
  { key: "blog", label: "Blog" },
];

export default function TaxonomyListing({
  term,
  posts,
  kind,
  accentColor,
  description,
}: TaxonomyListingProps) {
  const accent = accentColor || ACCENT_BY_KIND[kind];
  const parent = PARENT_BY_KIND[kind];
  const [activePillar, setActivePillar] = useState<PillarKey | "all">("all");

  const availablePillars = PILLARS.filter((p) =>
    posts.some((post) => post.pillar === p.key)
  );

  const filteredPosts =
    activePillar === "all"
      ? posts
      : posts.filter((post) => post.pillar === activePillar);

  // const pillarCount = new Set(filteredPosts.map((p) => p.pillar ?? "")).size;

  return (
    <main>
      <section className="py-16">
        <div className="wrapper">
          <Breadcrumb
            items={[
              { label: parent.label, href: parent.href },
              { label: term },
            ]}
          />

          <h1
            className="mb-6 text-center font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(40px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {kind === "category" ? "Category" : "Label"}{" "}
            <span style={{ color: accent }}>
              {kind === "label" ? "#" : ""}
              {term}
            </span>
          </h1>

          <p
            className="mx-auto max-w-2xl text-center text-[var(--fg-secondary)] text-base sm:text-lg"
            style={{ lineHeight: 1.7 }}
          >
            {description ?? (
              <>
                {posts.length} {posts.length === 1 ? "post" : "posts"} tagged
                with{" "}
                <Chip className="align-middle text-sm" variant="brand">
                  {kind === "label" ? "#" : ""}
                  {term}
                </Chip>{" "}
                {kind}
                {/* across {new Set(posts.map((p) => p.pillar ?? "")).size}{" "}
                {new Set(posts.map((p) => p.pillar ?? "")).size === 1
                  ? "pillar"
                  : "pillars"} */}
                .
              </>
            )}
          </p>

          {/* <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-[var(--border-subtle)] border-t pt-8">
            <MetaItem
              accentColor={accent}
              icon={<IconLayersIntersect size={18} stroke={1.75} />}
              label={filteredPosts.length === 1 ? "post" : "posts"}
              value={String(filteredPosts.length)}
            />
            <MetaItem
              accentColor={accent}
              icon={<IconTags size={18} stroke={1.75} />}
              label={pillarCount === 1 ? "pillar" : "pillars"}
              value={String(pillarCount)}
            />
          </div> */}
        </div>
      </section>

      {availablePillars.length > 1 && (
        <section className="pb-6">
          <div className="wrapper flex flex-wrap items-center justify-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold text-sm transition-colors"
              onClick={() => setActivePillar("all")}
              style={{
                background:
                  activePillar === "all" ? accent : "var(--bg-elevated)",
                color: activePillar === "all" ? "#fff" : "var(--fg-secondary)",
                borderColor:
                  activePillar === "all" ? accent : "var(--border-subtle)",
              }}
              type="button"
            >
              All
              <span className="text-xs opacity-75">{posts.length}</span>
            </button>
            {availablePillars.map(({ key, label }) => {
              const color = pillarAccents[key].primary;
              const isActive = activePillar === key;
              const count = posts.filter((p) => p.pillar === key).length;
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
        </section>
      )}

      <PostGrid accentColor={accent} posts={filteredPosts} />

      <MyPillers />
    </main>
  );
}

// interface MetaItemProps {
//   accentColor: string;
//   icon: React.ReactNode;
//   label: string;
//   value: string;
// }

// function MetaItem({ icon, value, label, accentColor }: MetaItemProps) {
//   return (
//     <div className="flex items-center gap-3">
//       <span
//         className="flex h-9 w-9 items-center justify-center rounded-lg"
//         style={{ background: `${accentColor}1a`, color: accentColor }}
//       >
//         {icon}
//       </span>
//       <span className="text-[var(--fg-secondary)] text-sm">
//         <strong className="text-[var(--fg-primary)]">{value}</strong> {label}
//       </span>
//     </div>
//   );
// }
