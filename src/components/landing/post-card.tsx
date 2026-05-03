import { IconFolder } from "@tabler/icons-react";
import Image from "next/image";
import type { PillarKey } from "./section-banner";

export interface Post {
  category: string;
  coverImage?: string;
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
      {post.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            alt={post.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={post.coverImage}
          />
          {/* Category chip */}
          <a
            className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 font-semibold text-white text-xs backdrop-blur-md transition-opacity hover:opacity-80"
            href={`/categories/${encodeURIComponent(post.category)}`}
            style={{ letterSpacing: "0.05em" }}
          >
            <IconFolder size={12} stroke={2} />
            {post.category}
          </a>
        </div>
      ) : (
        <div
          className={`${post.gradient} relative flex items-center justify-center px-6 py-12`}
        >
          {/* Category chip */}
          <a
            className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-semibold text-white text-xs backdrop-blur-md transition-opacity hover:opacity-80"
            href={`/categories/${encodeURIComponent(post.category)}`}
            style={{ letterSpacing: "0.05em" }}
          >
            <IconFolder size={12} stroke={2} />
            {post.category}
          </a>
          <h3
            className="text-center font-bold text-white text-xl sm:text-2xl"
            style={{ lineHeight: 1.2, letterSpacing: "-0.01em" }}
          >
            {post.title}
          </h3>
        </div>
      )}

      {/* Body */}
      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {post.labels.map((label) => (
            <a
              className="rounded-full px-2.5 py-0.5 font-semibold text-xs transition-opacity hover:opacity-75"
              href={`/labels/${encodeURIComponent(label)}`}
              key={label}
              style={{
                backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                color: accentColor,
                letterSpacing: "0.03em",
              }}
            >
              #{label}
            </a>
          ))}
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
          {/* <span className="inline-flex items-center gap-1 text-[var(--fg-muted)] text-xs">
            <IconClock size={12} stroke={2} />
            {post.readTime}
          </span> */}
        </div>
      </div>
    </article>
  );
}
