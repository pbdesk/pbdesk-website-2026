import { IconClock } from "@tabler/icons-react";
import type { Post } from "./post-card";

interface FeaturedPostProps {
  accentColor: string;
  post: Post;
}

export default function FeaturedPost({ post, accentColor }: FeaturedPostProps) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl border"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className={`${post.gradient} relative flex flex-1 items-center justify-center px-8 py-24 sm:py-32`}
      >
        <span
          className="absolute top-5 left-5 rounded-full bg-white/15 px-3 py-1 font-semibold text-white text-xs backdrop-blur-md"
          style={{ letterSpacing: "0.05em" }}
        >
          {post.category}
        </span>
        <h2
          className="text-center font-bold text-3xl text-white sm:text-4xl"
          style={{ lineHeight: 1.1, letterSpacing: "-0.02em" }}
        >
          {post.title}
        </h2>
      </div>
      <div className="p-7">
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span
            className="font-semibold uppercase"
            style={{ color: accentColor, letterSpacing: "0.05em" }}
          >
            {post.category}
          </span>
          <span style={{ color: "var(--fg-muted)" }}>·</span>
          <span style={{ color: "var(--fg-muted)" }}>
            {post.tags.map((t) => `#${t}`).join(" ")}
          </span>
        </div>
        <h3
          className="mb-3 font-bold text-2xl"
          style={{
            color: "var(--fg-primary)",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {post.title}
        </h3>
        <p
          className="mb-5 text-base"
          style={{ color: "var(--fg-secondary)", lineHeight: 1.65 }}
        >
          {post.description}
        </p>
        <div className="flex items-center justify-between">
          <a
            className="inline-flex items-center gap-1 font-semibold text-sm transition-colors hover:underline"
            href="/"
            style={{ color: accentColor }}
          >
            Read More <span aria-hidden="true">→</span>
          </a>
          <span
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            <IconClock size={12} stroke={2} />
            {post.readTime}
          </span>
        </div>
      </div>
    </article>
  );
}
