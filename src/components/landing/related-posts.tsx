import { Reveal } from "@/components/ui/reveal";
import { postStoryToPost } from "@/lib/storyblok/adapters";
import type { PostStory } from "@/lib/storyblok/types";
import PostCard from "./post-card";

interface RelatedPostsProps {
  posts: PostStory[];
  title?: string;
}

export default function RelatedPosts({
  posts,
  title = "Related Posts",
}: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  const cards = posts.map(postStoryToPost);

  return (
    <section className="border-[var(--border-subtle)] border-t py-16 sm:py-20">
      <div className="wrapper">
        <Reveal>
          <h2
            className="mb-10 text-center font-bold text-[var(--fg-primary)]"
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <PostCard
              accentColor="var(--fg-brand)"
              key={`${card.pillar}/${card.slug}`}
              post={card}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
