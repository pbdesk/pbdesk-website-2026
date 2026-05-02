import { IconClock } from "@tabler/icons-react";
import type { PillarKey } from "./section-banner";

export interface Post {
  category: string;
  description: string;
  featured?: boolean;
  gradient: string;
  labels: string[];
  pillar?: PillarKey;
  readTime: string;
  slug?: string;
  title: string;
}

interface PostCardProps {
  accentColor: string;
  post: Post;
}

function postHref(post: Post): string {
  // Detail pages land in PR 5; until then, fall back to "/" so cards
  // remain clickable and lint stays happy.
  if (post.pillar && post.slug) {
    return `/${post.pillar}/${post.slug}`;
  }
  return "/";
}

export default function PostCard({ post, accentColor }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Banner */}
      <div
        className={`${post.gradient} relative flex items-center justify-center px-6 py-12`}
      >
        {/* Category chip in top left */}
        <span
          className="absolute top-4 left-4 rounded-full bg-white/15 px-3 py-1 font-semibold text-white text-xs backdrop-blur-md"
          style={{ letterSpacing: "0.05em" }}
        >
          {post.category}
        </span>
        <h3
          className="text-center font-bold text-white text-xl sm:text-2xl"
          style={{ lineHeight: 1.2, letterSpacing: "-0.01em" }}
        >
          {post.title}
        </h3>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span
            className="font-semibold uppercase"
            style={{ color: accentColor, letterSpacing: "0.05em" }}
          >
            {post.category}
          </span>
          <span className="text-[var(--fg-muted)]">·</span>
          <span className="text-[var(--fg-muted)]">
            {post.labels.map((t) => `#${t}`).join(" ")}
          </span>
        </div>
        <h4
          className="mb-3 font-bold text-[var(--fg-primary)] text-lg"
          style={{ lineHeight: 1.25, letterSpacing: "-0.01em" }}
        >
          {post.title}
        </h4>
        <p
          className="mb-5 text-[var(--fg-secondary)] text-sm"
          style={{ lineHeight: 1.6 }}
        >
          {post.description}
        </p>
        <div className="flex items-center justify-between">
          <a
            className="inline-flex items-center gap-1 font-semibold text-sm transition-colors hover:underline"
            href={postHref(post)}
            style={{ color: accentColor }}
          >
            Read More <span aria-hidden="true">→</span>
          </a>
          <span className="inline-flex items-center gap-1 text-[var(--fg-muted)] text-xs">
            <IconClock size={12} stroke={2} />
            {post.readTime}
          </span>
        </div>
      </div>
    </article>
  );
}
