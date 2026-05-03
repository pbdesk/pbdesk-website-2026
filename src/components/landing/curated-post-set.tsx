// Curated post set: three Posts surfaced as PostCard tiles under a shared
// eyebrow + title, followed by two CTAs that link to the selected Pillar's
// landing page and its "/all" archive. The Pillar drives the accent color
// (title, button background, button border) but is not rendered as its own
// card.

import Link from "next/link";
import type { CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { pillarAccents } from "@/lib/pillars";
import { postStoryToPost } from "@/lib/storyblok/adapters";
import type {
  LandingPageStory,
  PillarKey,
  PostStory,
} from "@/lib/storyblok/types";
import PostCard from "./post-card";

interface CuratedPostSetProps {
  eyebrow?: string;
  pillar: LandingPageStory | null;
  posts: PostStory[];
  title: string;
}

const PILLAR_LABELS: Record<PillarKey, string> = {
  bits: "Bits",
  bites: "Bites",
  blog: "Blog",
};

export default function CuratedPostSet({
  eyebrow,
  title,
  pillar,
  posts,
}: CuratedPostSetProps) {
  if (posts.length === 0) {
    return null;
  }

  const pillarKey = pillar?.content.pillar ?? posts[0]?.content.pillar;
  const accentColor = pillarKey
    ? pillarAccents[pillarKey].primary
    : "var(--fg-brand)";
  const pillarSlug = pillar?.full_slug ?? (pillarKey ? pillarKey : null);
  const pillarLabel = pillarKey ? PILLAR_LABELS[pillarKey] : null;

  const cards = posts.map(postStoryToPost);

  return (
    <section
      className="py-16 sm:py-20"
      style={{ "--accent": accentColor } as CSSProperties}
    >
      <div className="wrapper">
        <Reveal>
          <div className="mb-10 text-center">
            {eyebrow ? (
              <Eyebrow className="mb-3 block">{eyebrow}</Eyebrow>
            ) : null}
            <h2
              className="font-bold text-[var(--accent)]"
              style={{
                fontSize: "clamp(28px, 3.4vw, 44px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {title}
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <PostCard
              accentColor={accentColor}
              key={`${card.pillar}/${card.slug}`}
              post={card}
            />
          ))}
        </div>

        {pillarSlug && pillarLabel ? (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 font-semibold text-sm text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--accent)_30%,transparent)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              href={`/${pillarSlug}`}
            >
              Visit My {pillarLabel} <span aria-hidden="true">→</span>
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--accent)] bg-transparent px-7 font-semibold text-[var(--accent)] text-sm transition-all hover:bg-[var(--accent)] hover:text-white"
              href={`/${pillarSlug}/all`}
            >
              Browse All {pillarLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
