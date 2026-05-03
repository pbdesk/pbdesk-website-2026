import type { SbComponent, SbComponentField } from "./storyblok-management";

// ============================================================================
// Datasources
// ============================================================================

export const datasources = [
  {
    slug: "pillars",
    name: "Pillars",
    entries: [
      { name: "Bits", value: "bits" },
      { name: "Bites", value: "bites" },
      { name: "Blog", value: "blog" },
    ],
  },
  {
    slug: "pillar-gradients",
    name: "Pillar Gradients",
    entries: [
      { name: "Bits gradient", value: "pillar-bits-gradient" },
      { name: "Bites gradient", value: "pillar-bites-gradient" },
      { name: "Blog gradient", value: "pillar-blog-gradient" },
    ],
  },
  {
    slug: "gradients",
    name: "Post Gradients",
    entries: [
      { name: "Indigo", value: "post-grad-indigo" },
      { name: "Blue", value: "post-grad-blue" },
      { name: "Emerald", value: "post-grad-emerald" },
      { name: "Red", value: "post-grad-red" },
      { name: "Rose", value: "post-grad-rose" },
      { name: "Orange", value: "post-grad-orange" },
      { name: "Teal", value: "post-grad-teal" },
      { name: "Violet", value: "post-grad-violet" },
      { name: "Amber", value: "post-grad-amber" },
    ],
  },
  {
    slug: "post-categories",
    name: "Post Categories",
    entries: [
      { name: "Tool", value: "Tool" },
      { name: "AI", value: "AI" },
      { name: "Tutorial", value: "Tutorial" },
      { name: "Util", value: "Util" },
      { name: "Framework", value: "Framework" },
      { name: "Wellness", value: "Wellness" },
      { name: "Health", value: "Health" },
      { name: "Fitness", value: "Fitness" },
      { name: "Reflections", value: "Reflections" },
      { name: "Article", value: "Article" },
      { name: "Programming", value: "Programming" },
    ],
  },
  {
    slug: "post-labels",
    name: "Post Labels",
    // Empty initially; PR 3 importer extends this from docs/resources/.
    entries: [],
  },
  {
    slug: "tech-tags",
    name: "Tech Tags",
    entries: [
      { name: "JavaScript", value: "JavaScript" },
      { name: "TypeScript", value: "TypeScript" },
      { name: "Node.js", value: "Node.js" },
      { name: "React", value: "React" },
      { name: "Astro", value: "Astro" },
      { name: "Next.js", value: "Next.js" },
      { name: "AI", value: "AI" },
      { name: "OpenAI", value: "OpenAI" },
      { name: "Postgres", value: "Postgres" },
      { name: "MongoDB", value: "MongoDB" },
    ],
  },
  {
    slug: "social-icons",
    name: "Social Icons",
    entries: [
      { name: "GitHub", value: "github" },
      { name: "LinkedIn", value: "linkedin" },
      { name: "X", value: "x" },
    ],
  },
  {
    slug: "wellness-thread-keys",
    name: "Wellness Thread Keys",
    entries: [
      { name: "Nutrition", value: "nutrition" },
      { name: "Exercise", value: "exercise" },
      { name: "Sleep", value: "sleep" },
      { name: "Emotion", value: "emotion" },
    ],
  },
  {
    slug: "wellness-thread-icons",
    name: "Wellness Thread Icons",
    entries: [
      { name: "Apple (nutrition)", value: "apple" },
      { name: "Run (exercise)", value: "run" },
      { name: "Moon (sleep)", value: "moon" },
      { name: "Heart (emotion)", value: "heart" },
    ],
  },
] as const;

// ============================================================================
// Helper to keep field definitions terse
// ============================================================================

let fieldPos = 0;
function reset(): void {
  fieldPos = 0;
}
function f<T extends SbComponent["schema"] extends infer S ? S : never>(
  fields: T
): T {
  return fields;
}
function field<T extends Omit<SbComponentField, "pos">>(
  spec: T
): T & { pos: number } {
  fieldPos += 1;
  return { ...spec, pos: fieldPos };
}

// ============================================================================
// Nestable blocks
// ============================================================================

const nestableBlocks: SbComponent[] = [
  // ----- Hero -----
  (() => {
    reset();
    return {
      name: "hero",
      display_name: "Hero",
      is_root: false,
      is_nestable: true,
      icon: "block-image",
      preview_field: "headline",
      schema: f({
        eyebrow: field({ type: "text" }),
        headline: field({ type: "richtext" }),
        subheadline: field({ type: "richtext" }),
        cta_label: field({ type: "text" }),
        cta_href: field({ type: "multilink" }),
        show_social: field({ type: "boolean", default_value: true }),
      }),
    };
  })(),

  // ----- Pillars (heading + cards) -----
  (() => {
    reset();
    return {
      name: "pillars",
      display_name: "Pillars",
      is_root: false,
      is_nestable: true,
      icon: "block-buildingblocks",
      preview_field: "heading",
      schema: f({
        eyebrow: field({ type: "text" }),
        heading: field({ type: "text" }),
        cards: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["pillar_card"],
          minimum: 1,
          maximum: 6,
        }),
      }),
    };
  })(),

  // ----- Pillar Card -----
  (() => {
    reset();
    return {
      name: "pillar_card",
      display_name: "Pillar Card",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "name",
      schema: f({
        name: field({ type: "text", required: true }),
        title: field({ type: "text", required: true }),
        description: field({ type: "textarea" }),
        cta_label: field({ type: "text" }),
        href: field({ type: "multilink" }),
        gradient_class: field({
          type: "option",
          source: "internal",
          datasource_slug: "pillar-gradients",
        }),
        avatar: field({ type: "asset", filetypes: ["images"] }),
      }),
    };
  })(),

  // ----- About Section -----
  (() => {
    reset();
    return {
      name: "about_section",
      display_name: "About Section",
      is_root: false,
      is_nestable: true,
      icon: "user",
      preview_field: "headline",
      schema: f({
        eyebrow: field({ type: "text" }),
        headline: field({ type: "text" }),
        bio: field({ type: "richtext" }),
        portrait: field({ type: "asset", filetypes: ["images"] }),
        chip_label: field({ type: "text" }),
        show_social: field({ type: "boolean", default_value: true }),
      }),
    };
  })(),

  // ----- My Realm -----
  (() => {
    reset();
    return {
      name: "my_realm",
      display_name: "My Realm",
      is_root: false,
      is_nestable: true,
      icon: "block-grid",
      preview_field: "headline",
      schema: f({
        eyebrow: field({ type: "text" }),
        headline: field({ type: "richtext" }),
        subheading: field({ type: "textarea" }),
        realms: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["realm_card"],
        }),
        features: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["feature_card"],
        }),
        tags: field({
          type: "options",
          source: "internal",
          datasource_slug: "tech-tags",
        }),
      }),
    };
  })(),

  // ----- Realm Card -----
  (() => {
    reset();
    return {
      name: "realm_card",
      display_name: "Realm Card",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        description: field({ type: "textarea" }),
      }),
    };
  })(),

  // ----- Feature Card -----
  (() => {
    reset();
    return {
      name: "feature_card",
      display_name: "Feature Card",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        description: field({ type: "textarea" }),
        icon: field({
          type: "option",
          options: [
            { name: "Bolt", value: "bolt" },
            { name: "Heart", value: "heart" },
            { name: "Pencil", value: "pencil" },
            { name: "Code", value: "code" },
            { name: "Leaf", value: "leaf" },
            { name: "Notebook", value: "notebook" },
          ],
        }),
      }),
    };
  })(),

  // ----- My Wellness Threads -----
  (() => {
    reset();
    return {
      name: "my_wellness_threads",
      display_name: "My Wellness Threads",
      is_root: false,
      is_nestable: true,
      icon: "heart",
      preview_field: "headline",
      schema: f({
        eyebrow: field({ type: "text" }),
        headline: field({ type: "richtext" }),
        subheading: field({ type: "textarea" }),
        threads: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["wellness_thread_item"],
          minimum: 4,
          maximum: 4,
        }),
      }),
    };
  })(),

  // ----- Wellness Thread Item -----
  (() => {
    reset();
    return {
      name: "wellness_thread_item",
      display_name: "Wellness Thread Item",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "title",
      schema: f({
        key: field({
          type: "option",
          source: "internal",
          datasource_slug: "wellness-thread-keys",
        }),
        index: field({ type: "text" }),
        title: field({ type: "text", required: true }),
        short_label: field({ type: "text" }),
        body: field({ type: "textarea" }),
        icon: field({
          type: "option",
          source: "internal",
          datasource_slug: "wellness-thread-icons",
        }),
        color: field({ type: "text" }),
        angle: field({ type: "number" }),
      }),
    };
  })(),

  // ----- My Pillers (orbital diagram, now editable) -----
  (() => {
    reset();
    return {
      name: "my_pillers",
      display_name: "My Pillers (orbital)",
      is_root: false,
      is_nestable: true,
      icon: "block-grid",
      preview_field: "heading",
      schema: f({
        eyebrow: field({ type: "text" }),
        heading: field({ type: "text" }),
        pillars: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["piller_orbit_item"],
          minimum: 3,
          maximum: 3,
        }),
      }),
    };
  })(),

  // ----- Piller Orbit Item -----
  (() => {
    reset();
    return {
      name: "piller_orbit_item",
      display_name: "Piller Orbit Item",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "label",
      schema: f({
        key: field({
          type: "option",
          source: "internal",
          datasource_slug: "pillars",
        }),
        index: field({ type: "text" }),
        label: field({ type: "text", required: true }),
        title: field({ type: "text" }),
        body: field({ type: "textarea" }),
        cta_label: field({ type: "text" }),
        href: field({ type: "multilink" }),
        color: field({ type: "text" }),
        angle: field({ type: "number" }),
      }),
    };
  })(),

  // ----- CTA Banner -----
  (() => {
    reset();
    return {
      name: "cta_banner",
      display_name: "CTA Banner",
      is_root: false,
      is_nestable: true,
      icon: "block-banner",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text", required: true }),
        description: field({ type: "textarea" }),
        placeholder: field({ type: "text" }),
        submit_label: field({ type: "text" }),
        submit_action: field({ type: "multilink" }),
      }),
    };
  })(),

  // ----- Richtext Section -----
  (() => {
    reset();
    return {
      name: "richtext_section",
      display_name: "Richtext Section",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      schema: f({
        content: field({ type: "richtext" }),
      }),
    };
  })(),

  // ----- Curated Post Set -----
  // Editor picks one Pillar (landing_page) and exactly three Posts; the
  // renderer surfaces them as four PostCard tiles under a shared eyebrow
  // and title. Designed for cross-promotion sections on home/landing pages.
  (() => {
    reset();
    return {
      name: "curated_post_set",
      display_name: "Curated Post Set",
      is_root: false,
      is_nestable: true,
      icon: "block-grid",
      preview_field: "title",
      schema: f({
        eyebrow: field({ type: "text" }),
        title: field({ type: "text", required: true }),
        pillar: field({
          type: "option",
          source: "internal_stories",
          filter_content_type: ["landing_page"],
          required: true,
        }),
        posts: field({
          type: "options",
          source: "internal_stories",
          filter_content_type: ["post"],
          minimum: 3,
          maximum: 3,
          required: true,
        }),
      }),
    };
  })(),

  // ----- Featured Post Block -----
  (() => {
    reset();
    return {
      name: "featured_post_block",
      display_name: "Featured Post Block",
      is_root: false,
      is_nestable: true,
      icon: "block-doc",
      preview_field: "mode",
      schema: f({
        mode: field({
          type: "option",
          options: [
            { name: "Auto by pillar", value: "auto_by_pillar" },
            { name: "Manual selection", value: "manual" },
          ],
          default_value: "auto_by_pillar",
        }),
        posts: field({
          type: "options",
          source: "internal_stories",
          filter_content_type: ["post"],
        }),
        limit: field({ type: "number", default_value: 1 }),
      }),
    };
  })(),

  // ----- Post Grid Block -----
  (() => {
    reset();
    return {
      name: "post_grid_block",
      display_name: "Post Grid Block",
      is_root: false,
      is_nestable: true,
      icon: "block-grid",
      preview_field: "mode",
      schema: f({
        mode: field({
          type: "option",
          options: [
            { name: "Auto by pillar", value: "auto_by_pillar" },
            { name: "Manual selection", value: "manual" },
          ],
          default_value: "auto_by_pillar",
        }),
        posts: field({
          type: "options",
          source: "internal_stories",
          filter_content_type: ["post"],
        }),
        limit: field({ type: "number", default_value: 12 }),
      }),
    };
  })(),

  // ----- YouTube Embed -----
  (() => {
    reset();
    return {
      name: "youtube_embed",
      display_name: "YouTube Embed",
      is_root: false,
      is_nestable: true,
      icon: "block-video",
      preview_field: "youtube_id",
      schema: f({
        youtube_id: field({ type: "text", required: true }),
        caption: field({ type: "text" }),
      }),
    };
  })(),

  // ----- Atoms: nav_item, social_link, filter_chip, seo -----
  (() => {
    reset();
    return {
      name: "nav_item",
      display_name: "Nav Item",
      is_root: false,
      is_nestable: true,
      icon: "block-link",
      preview_field: "label",
      schema: f({
        label: field({ type: "text", required: true }),
        href: field({ type: "multilink", required: true }),
        target_blank: field({ type: "boolean", default_value: false }),
      }),
    };
  })(),

  (() => {
    reset();
    return {
      name: "social_link",
      display_name: "Social Link",
      is_root: false,
      is_nestable: true,
      icon: "block-link",
      preview_field: "label",
      schema: f({
        label: field({ type: "text", required: true }),
        href: field({ type: "multilink", required: true }),
        icon: field({
          type: "option",
          source: "internal",
          datasource_slug: "social-icons",
        }),
      }),
    };
  })(),

  (() => {
    reset();
    return {
      name: "filter_chip",
      display_name: "Filter Chip",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "label",
      schema: f({
        label: field({ type: "text", required: true }),
        count: field({ type: "number" }),
      }),
    };
  })(),

  (() => {
    reset();
    return {
      name: "seo",
      display_name: "SEO Overrides",
      is_root: false,
      is_nestable: true,
      icon: "block-search",
      preview_field: "title",
      schema: f({
        title: field({ type: "text" }),
        description: field({ type: "textarea" }),
        og_image: field({ type: "asset", filetypes: ["images"] }),
        keywords: field({ type: "textarea" }),
      }),
    };
  })(),
];

// ============================================================================
// Content types (root stories)
// ============================================================================

const contentTypes: SbComponent[] = [
  // ----- Home Page -----
  (() => {
    reset();
    return {
      name: "home_page",
      display_name: "Home Page",
      is_root: true,
      is_nestable: false,
      icon: "block-doc",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        description: field({ type: "textarea" }),
        body: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: [
            "hero",
            "pillars",
            "about_section",
            "my_realm",
            "my_wellness_threads",
            "my_pillers",
            "curated_post_set",
            "cta_banner",
            "richtext_section",
          ],
        }),
      }),
    };
  })(),

  // ----- Landing Page -----
  (() => {
    reset();
    return {
      name: "landing_page",
      display_name: "Landing Page",
      is_root: true,
      is_nestable: false,
      icon: "block-pages",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        pillar: field({
          type: "option",
          source: "internal",
          datasource_slug: "pillars",
          required: true,
        }),
        description: field({ type: "textarea" }),
        cadence: field({ type: "text", default_value: "weekly" }),
        accent_primary: field({ type: "text" }),
        accent_secondary: field({ type: "text" }),
        filters: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["filter_chip"],
        }),
        body: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: [
            "richtext_section",
            "featured_post_block",
            "post_grid_block",
            "curated_post_set",
            "cta_banner",
          ],
        }),
        seo_title: field({ type: "text" }),
        seo_description: field({ type: "textarea" }),
      }),
    };
  })(),

  // ----- Post -----
  (() => {
    reset();
    return {
      name: "post",
      display_name: "Post",
      is_root: true,
      is_nestable: false,
      icon: "block-doc",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        excerpt: field({ type: "textarea", required: true }),
        category: field({
          type: "option",
          source: "internal",
          datasource_slug: "post-categories",
          required: true,
        }),
        labels: field({
          type: "options",
          source: "internal",
          datasource_slug: "post-labels",
          required: true,
        }),
        pillar: field({
          type: "option",
          source: "internal",
          datasource_slug: "pillars",
          required: true,
        }),
        gradient: field({
          type: "option",
          source: "internal",
          datasource_slug: "gradients",
        }),
        read_time: field({ type: "text" }),
        featured: field({ type: "boolean", default_value: false }),
        cover_image: field({ type: "asset", filetypes: ["images"] }),
        external_url: field({ type: "multilink" }),
        intro_blocks: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["youtube_embed"],
          maximum: 1,
        }),
        body: field({ type: "richtext" }),
        published_at: field({ type: "datetime" }),
        updated_at: field({ type: "datetime" }),
        author: field({ type: "text", default_value: "Pinal Bhatt" }),
        related: field({
          type: "options",
          source: "internal_stories",
          filter_content_type: ["post"],
        }),
        seo: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["seo"],
          maximum: 1,
        }),
      }),
    };
  })(),

  // ----- About Page -----
  (() => {
    reset();
    return {
      name: "about_page",
      display_name: "About Page",
      is_root: true,
      is_nestable: false,
      icon: "user",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        headline: field({ type: "text" }),
        intro_chip_label: field({ type: "text" }),
        bio: field({ type: "richtext" }),
        portrait: field({ type: "asset", filetypes: ["images"] }),
        body: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: [
            "about_section",
            "my_pillers",
            "my_wellness_threads",
            "richtext_section",
          ],
        }),
        seo_title: field({ type: "text" }),
        seo_description: field({ type: "textarea" }),
      }),
    };
  })(),

  // ----- Disclaimer Page -----
  (() => {
    reset();
    return {
      name: "disclaimer_page",
      display_name: "Disclaimer Page",
      is_root: true,
      is_nestable: false,
      icon: "block-doc",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        eyebrow: field({
          type: "text",
          description:
            'Small uppercase label shown above the H1 (e.g. "Legal").',
        }),
        lede: field({
          type: "textarea",
          description: "Intro paragraph rendered under the H1 in the hero.",
        }),
        body: field({ type: "richtext" }),
        last_updated: field({ type: "datetime" }),
        seo_title: field({ type: "text" }),
        seo_description: field({ type: "textarea" }),
      }),
    };
  })(),

  // ----- Privacy Policy Page -----
  (() => {
    reset();
    return {
      name: "privacy_policy_page",
      display_name: "Privacy Policy Page",
      is_root: true,
      is_nestable: false,
      icon: "block-doc",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        eyebrow: field({
          type: "text",
          description:
            'Small uppercase label shown above the H1 (e.g. "Privacy").',
        }),
        lede: field({
          type: "textarea",
          description: "Intro paragraph rendered under the H1 in the hero.",
        }),
        body: field({ type: "richtext" }),
        last_updated: field({ type: "datetime" }),
        seo_title: field({ type: "text" }),
        seo_description: field({ type: "textarea" }),
      }),
    };
  })(),

  // ----- Global Config -----
  (() => {
    reset();
    return {
      name: "global_config",
      display_name: "Global Config",
      is_root: true,
      is_nestable: false,
      icon: "settings",
      preview_field: "brand_tagline",
      schema: f({
        nav_items: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["nav_item"],
        }),
        footer_explore: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["nav_item"],
        }),
        footer_topics: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["nav_item"],
        }),
        footer_more: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["nav_item"],
        }),
        social_links: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["social_link"],
        }),
        brand_tagline: field({ type: "text" }),
        footer_about: field({ type: "textarea" }),
        cta_default: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["cta_banner"],
          maximum: 1,
        }),
      }),
    };
  })(),
];

export const components: SbComponent[] = [...nestableBlocks, ...contentTypes];

export const folders = [
  { slug: "bits", name: "Bits", default_root: "post" },
  { slug: "bites", name: "Bites", default_root: "post" },
  { slug: "blog", name: "Blog", default_root: "post" },
  { slug: "_global", name: "Global", default_root: "global_config" },
];
