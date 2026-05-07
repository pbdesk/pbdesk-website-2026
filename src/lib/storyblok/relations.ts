// Block-field paths whose values are story UUID(s) that should arrive as
// fully-resolved story objects in the content tree. Used both by the server
// fetcher (to inline-resolve via the CDA `resolve_relations` param) and by
// the client-side bridge (so live editor updates also resolve). Kept in
// this small module — separate from `client.ts` — so it can be imported
// from "use client" components without dragging in `next/headers`.
//
// Keep in sync with the Storyblok schema (`scripts/lib/storyblok-schemas.ts`)
// and any new blocks that reference `internal_stories`.

export const STORY_RELATION_PATHS = [
  "curated_post_set.pillar",
  "curated_post_set.posts",
  "post.related",
];
