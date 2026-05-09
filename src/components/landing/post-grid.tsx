// Shared post-grid layout reused by:
//  - <SectionLanding>   (pillar pages: /bits, /bites, /blog)
//  - <TaxonomyListing>  (per-category, per-label pages)
// Renders a uniform responsive grid of PostCards.

import PostCard, { type Post } from "./post-card";

interface PostGridProps {
  accentColor: string;
  posts: Post[];
}

export default function PostGrid({ posts, accentColor }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <section className="pb-16">
        <div className="wrapper">
          <p className="text-center text-[var(--fg-secondary)]">
            No posts here yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16">
      <div className="wrapper">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              accentColor={accentColor}
              key={`${post.pillar ?? ""}/${post.slug ?? post.title}`}
              post={post}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
