// Shared post-grid layout reused by:
//  - <SectionLanding>   (pillar pages: /bits, /bites, /blog)
//  - <TaxonomyListing>  (per-category, per-label pages)
// Renders the featured + secondary cards on top, then a 3-column grid.

import FeaturedPost from "./featured-post";
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

  const featured = posts[0];
  const secondary = posts[1];
  const rest = posts.slice(2);

  return (
    <>
      <section className="pb-10">
        <div className="wrapper">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {featured ? (
              <FeaturedPost accentColor={accentColor} post={featured} />
            ) : null}
            {secondary ? (
              <PostCard accentColor={accentColor} post={secondary} />
            ) : null}
          </div>
        </div>
      </section>

      {rest.length > 0 ? (
        <section className="pb-16">
          <div className="wrapper">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard
                  accentColor={accentColor}
                  key={`${post.pillar ?? ""}/${post.slug ?? post.title}`}
                  post={post}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
