import type { SbComponent, SbComponentField } from "./storyblok-management";

// ============================================================================
// Datasources
// ============================================================================

export const datasources = [
  {
    entries: [
      { name: "Bits", value: "bits" },
      { name: "Bites", value: "bites" },
      { name: "Blog", value: "blog" },
    ],
    name: "Pillars",
    slug: "pillars",
  },
  {
    entries: [
      { name: "Bits gradient", value: "pillar-bits-gradient" },
      { name: "Bites gradient", value: "pillar-bites-gradient" },
      { name: "Blog gradient", value: "pillar-blog-gradient" },
    ],
    name: "Pillar Gradients",
    slug: "pillar-gradients",
  },
  {
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
    name: "Post Gradients",
    slug: "gradients",
  },
  {
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
    name: "Post Categories",
    slug: "post-categories",
  },
  {
    // Empty initially; PR 3 importer extends this from docs/resources/.
    entries: [],
    name: "Post Labels",
    slug: "post-labels",
  },
  {
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
    name: "Tech Tags",
    slug: "tech-tags",
  },
  {
    entries: [
      { name: "GitHub", value: "github" },
      { name: "LinkedIn", value: "linkedin" },
      { name: "X", value: "x" },
    ],
    name: "Social Icons",
    slug: "social-icons",
  },
  {
    entries: [
      { name: "Nutrition", value: "nutrition" },
      { name: "Exercise", value: "exercise" },
      { name: "Sleep", value: "sleep" },
      { name: "Emotion", value: "emotion" },
    ],
    name: "Wellness Thread Keys",
    slug: "wellness-thread-keys",
  },
  {
    entries: [
      { name: "Apple (nutrition)", value: "apple" },
      { name: "Run (exercise)", value: "run" },
      { name: "Moon (sleep)", value: "moon" },
      { name: "Heart (emotion)", value: "heart" },
    ],
    name: "Wellness Thread Icons",
    slug: "wellness-thread-icons",
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
      display_name: "Hero",
      icon: "block-image",
      is_nestable: true,
      is_root: false,
      name: "hero",
      preview_field: "headline",
      schema: f({
        cta_href: field({ type: "multilink" }),
        cta_label: field({ type: "text" }),
        eyebrow: field({ type: "text" }),
        headline: field({ type: "richtext" }),
        kicker: field({ type: "text" }),
        secondary_cta_href: field({ type: "multilink" }),
        secondary_cta_label: field({ type: "text" }),
        show_pillar_links: field({ default_value: true, type: "boolean" }),
        show_social: field({ default_value: true, type: "boolean" }),
        subheadline: field({ type: "richtext" }),
      }),
    };
  })(),

  // ----- Pillars (heading + cards) -----
  (() => {
    reset();
    return {
      display_name: "Pillars",
      icon: "block-buildingblocks",
      is_nestable: true,
      is_root: false,
      name: "pillars",
      preview_field: "heading",
      schema: f({
        cards: field({
          component_whitelist: ["pillar_card"],
          maximum: 6,
          minimum: 1,
          restrict_components: true,
          type: "bloks",
        }),
        eyebrow: field({ type: "text" }),
        heading: field({ type: "text" }),
      }),
    };
  })(),

  // ----- Pillar Card -----
  (() => {
    reset();
    return {
      display_name: "Pillar Card",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "pillar_card",
      preview_field: "name",
      schema: f({
        avatar: field({ filetypes: ["images"], type: "asset" }),
        cta_label: field({ type: "text" }),
        description: field({ type: "textarea" }),
        gradient_class: field({
          datasource_slug: "pillar-gradients",
          source: "internal",
          type: "option",
        }),
        href: field({ type: "multilink" }),
        name: field({ required: true, type: "text" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- About Section -----
  (() => {
    reset();
    return {
      display_name: "About Section",
      icon: "user",
      is_nestable: true,
      is_root: false,
      name: "about_section",
      preview_field: "headline",
      schema: f({
        bio: field({ type: "richtext" }),
        chip_label: field({ type: "text" }),
        eyebrow: field({ type: "text" }),
        headline: field({ type: "text" }),
        portrait: field({ filetypes: ["images"], type: "asset" }),
        show_social: field({ default_value: true, type: "boolean" }),
      }),
    };
  })(),

  // ----- About Hero -----
  (() => {
    reset();
    return {
      display_name: "About Hero",
      icon: "user",
      is_nestable: true,
      is_root: false,
      name: "about_hero",
      preview_field: "title_name",
      schema: f({
        chip_label: field({ type: "text" }),
        description: field({ type: "textarea" }),
        primary_cta_href: field({ type: "multilink" }),
        primary_cta_label: field({ type: "text" }),
        secondary_cta_href: field({
          description:
            'Supports anchors like "#social-links" via a URL link type.',
          type: "multilink",
        }),
        secondary_cta_label: field({ type: "text" }),
        show_social: field({ default_value: true, type: "boolean" }),
        title_lead: field({
          description: 'Text before the highlighted name (e.g. "Hi, I\'m ").',
          type: "text",
        }),
        title_name: field({
          description: "Highlighted name shown in brand color, italic.",
          type: "text",
        }),
        title_subheadline: field({
          description:
            "Smaller secondary line rendered inside the H1. Newlines become line breaks.",
          type: "textarea",
        }),
      }),
    };
  })(),

  // ----- About Story -----
  (() => {
    reset();
    return {
      display_name: "About Story",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "about_story",
      preview_field: "heading",
      schema: f({
        column_left: field({
          description: "Left column paragraphs.",
          type: "richtext",
        }),
        column_right: field({
          description: "Right column paragraphs.",
          type: "richtext",
        }),
        eyebrow: field({ type: "text" }),
        heading: field({ type: "text" }),
        quote_attribution: field({
          description: 'Caption under the quote (e.g. "— That\'s why I say").',
          type: "text",
        }),
        quote_link: field({
          description: "Optional link wrapping the quote text.",
          type: "multilink",
        }),
        quote_text: field({ type: "text" }),
      }),
    };
  })(),

  // ----- My Realm -----
  (() => {
    reset();
    return {
      display_name: "My Realm",
      icon: "block-grid",
      is_nestable: true,
      is_root: false,
      name: "my_realm",
      preview_field: "headline",
      schema: f({
        eyebrow: field({ type: "text" }),
        features: field({
          component_whitelist: ["feature_card"],
          restrict_components: true,
          type: "bloks",
        }),
        headline: field({ type: "richtext" }),
        realms: field({
          component_whitelist: ["realm_card"],
          restrict_components: true,
          type: "bloks",
        }),
        subheading: field({ type: "textarea" }),
        tags: field({
          datasource_slug: "tech-tags",
          source: "internal",
          type: "options",
        }),
      }),
    };
  })(),

  // ----- Realm Card -----
  (() => {
    reset();
    return {
      display_name: "Realm Card",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "realm_card",
      preview_field: "title",
      schema: f({
        description: field({ type: "textarea" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Feature Card -----
  (() => {
    reset();
    return {
      display_name: "Feature Card",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "feature_card",
      preview_field: "title",
      schema: f({
        description: field({ type: "textarea" }),
        icon: field({
          options: [
            { name: "Bolt", value: "bolt" },
            { name: "Heart", value: "heart" },
            { name: "Pencil", value: "pencil" },
            { name: "Code", value: "code" },
            { name: "Leaf", value: "leaf" },
            { name: "Notebook", value: "notebook" },
          ],
          type: "option",
        }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- My Wellness Threads -----
  (() => {
    reset();
    return {
      display_name: "My Wellness Threads",
      icon: "heart",
      is_nestable: true,
      is_root: false,
      name: "my_wellness_threads",
      preview_field: "headline",
      schema: f({
        eyebrow: field({ type: "text" }),
        headline: field({ type: "richtext" }),
        subheading: field({ type: "textarea" }),
        threads: field({
          component_whitelist: ["wellness_thread_item"],
          maximum: 4,
          minimum: 4,
          restrict_components: true,
          type: "bloks",
        }),
      }),
    };
  })(),

  // ----- Wellness Thread Item -----
  (() => {
    reset();
    return {
      display_name: "Wellness Thread Item",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "wellness_thread_item",
      preview_field: "title",
      schema: f({
        angle: field({ type: "number" }),
        body: field({ type: "textarea" }),
        color: field({ type: "text" }),
        icon: field({
          datasource_slug: "wellness-thread-icons",
          source: "internal",
          type: "option",
        }),
        index: field({ type: "text" }),
        key: field({
          datasource_slug: "wellness-thread-keys",
          source: "internal",
          type: "option",
        }),
        short_label: field({ type: "text" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- My Pillers (orbital diagram, now editable) -----
  (() => {
    reset();
    return {
      display_name: "My Pillers (orbital)",
      icon: "block-grid",
      is_nestable: true,
      is_root: false,
      name: "my_pillers",
      preview_field: "heading",
      schema: f({
        eyebrow: field({ type: "text" }),
        heading: field({ type: "text" }),
        pillars: field({
          component_whitelist: ["piller_orbit_item"],
          maximum: 3,
          minimum: 3,
          restrict_components: true,
          type: "bloks",
        }),
      }),
    };
  })(),

  // ----- Piller Orbit Item -----
  (() => {
    reset();
    return {
      display_name: "Piller Orbit Item",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "piller_orbit_item",
      preview_field: "label",
      schema: f({
        angle: field({ type: "number" }),
        body: field({ type: "textarea" }),
        color: field({ type: "text" }),
        cta_label: field({ type: "text" }),
        href: field({ type: "multilink" }),
        index: field({ type: "text" }),
        key: field({
          datasource_slug: "pillars",
          source: "internal",
          type: "option",
        }),
        label: field({ required: true, type: "text" }),
        title: field({ type: "text" }),
      }),
    };
  })(),

  // ----- CTA Banner -----
  (() => {
    reset();
    return {
      display_name: "CTA Banner",
      icon: "block-banner",
      is_nestable: true,
      is_root: false,
      name: "cta_banner",
      preview_field: "heading",
      schema: f({
        description: field({ type: "textarea" }),
        heading: field({ required: true, type: "text" }),
        placeholder: field({ type: "text" }),
        submit_action: field({ type: "multilink" }),
        submit_label: field({ type: "text" }),
      }),
    };
  })(),

  // ----- Richtext Section -----
  (() => {
    reset();
    return {
      display_name: "Richtext Section",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "richtext_section",
      schema: f({
        content: field({ type: "richtext" }),
      }),
    };
  })(),

  // ----- Share Bar -----
  // Editor-droppable social share block. The component reads URL/title from
  // the surrounding ShareProvider context unless explicitly overridden.
  (() => {
    reset();
    return {
      display_name: "Share Bar",
      icon: "block-share",
      is_nestable: true,
      is_root: false,
      name: "share_bar",
      preview_field: "heading",
      schema: f({
        desktop_layout: field({
          default_value: "inline",
          exclude_empty_option: true,
          options: [
            { name: "Inline horizontal", value: "inline" },
            { name: "Floating left sidebar", value: "sidebar" },
            { name: "Both", value: "both" },
          ],
          type: "option",
        }),
        heading: field({ default_value: "Share this post", type: "text" }),
        networks: field({
          description: "Leave empty to show all networks in the default order.",
          options: [
            { name: "Facebook", value: "facebook" },
            { name: "LinkedIn", value: "linkedin" },
            { name: "Pinterest", value: "pinterest" },
            { name: "Pocket", value: "pocket" },
            { name: "Telegram", value: "telegram" },
            { name: "Twitter (X)", value: "twitter" },
            { name: "WhatsApp", value: "whatsapp" },
            { name: "Email", value: "email" },
          ],
          type: "options",
        }),
        show_copy_link: field({ default_value: true, type: "boolean" }),
        title_override: field({
          description:
            "Optional. Defaults to the current page title when used inside a post or landing page.",
          type: "text",
        }),
        url_override: field({
          description:
            "Optional. Defaults to the current page URL when used inside a post or landing page.",
          type: "text",
        }),
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
      display_name: "Curated Post Set",
      icon: "block-grid",
      is_nestable: true,
      is_root: false,
      name: "curated_post_set",
      preview_field: "title",
      schema: f({
        eyebrow: field({ type: "text" }),
        pillar: field({
          filter_content_type: ["landing_page"],
          required: true,
          source: "internal_stories",
          type: "option",
        }),
        posts: field({
          filter_content_type: ["post"],
          maximum: 3,
          minimum: 3,
          required: true,
          source: "internal_stories",
          type: "options",
        }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Featured Post Block -----
  (() => {
    reset();
    return {
      display_name: "Featured Post Block",
      icon: "block-doc",
      is_nestable: true,
      is_root: false,
      name: "featured_post_block",
      preview_field: "mode",
      schema: f({
        limit: field({ default_value: 1, type: "number" }),
        mode: field({
          default_value: "auto_by_pillar",
          options: [
            { name: "Auto by pillar", value: "auto_by_pillar" },
            { name: "Manual selection", value: "manual" },
          ],
          type: "option",
        }),
        posts: field({
          filter_content_type: ["post"],
          source: "internal_stories",
          type: "options",
        }),
      }),
    };
  })(),

  // ----- Post Grid Block -----
  (() => {
    reset();
    return {
      display_name: "Post Grid Block",
      icon: "block-grid",
      is_nestable: true,
      is_root: false,
      name: "post_grid_block",
      preview_field: "mode",
      schema: f({
        limit: field({ default_value: 12, type: "number" }),
        mode: field({
          default_value: "auto_by_pillar",
          options: [
            { name: "Auto by pillar", value: "auto_by_pillar" },
            { name: "Manual selection", value: "manual" },
          ],
          type: "option",
        }),
        posts: field({
          filter_content_type: ["post"],
          source: "internal_stories",
          type: "options",
        }),
      }),
    };
  })(),

  // ----- YouTube Embed -----
  (() => {
    reset();
    return {
      display_name: "YouTube Embed",
      icon: "block-video",
      is_nestable: true,
      is_root: false,
      name: "youtube_embed",
      preview_field: "youtube_id",
      schema: f({
        caption: field({ type: "text" }),
        youtube_id: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Atoms: nav_item, social_link, filter_chip, seo -----
  (() => {
    reset();
    return {
      display_name: "Nav Item",
      icon: "block-link",
      is_nestable: true,
      is_root: false,
      name: "nav_item",
      preview_field: "label",
      schema: f({
        href: field({ required: true, type: "multilink" }),
        label: field({ required: true, type: "text" }),
        target_blank: field({ default_value: false, type: "boolean" }),
      }),
    };
  })(),

  (() => {
    reset();
    return {
      display_name: "Social Link",
      icon: "block-link",
      is_nestable: true,
      is_root: false,
      name: "social_link",
      preview_field: "label",
      schema: f({
        href: field({ required: true, type: "multilink" }),
        icon: field({
          datasource_slug: "social-icons",
          source: "internal",
          type: "option",
        }),
        label: field({ required: true, type: "text" }),
      }),
    };
  })(),

  (() => {
    reset();
    return {
      display_name: "Filter Chip",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "filter_chip",
      preview_field: "label",
      schema: f({
        count: field({ type: "number" }),
        label: field({ required: true, type: "text" }),
      }),
    };
  })(),

  (() => {
    reset();
    return {
      display_name: "SEO Overrides",
      icon: "block-search",
      is_nestable: true,
      is_root: false,
      name: "seo",
      preview_field: "title",
      schema: f({
        description: field({ type: "textarea" }),
        keywords: field({ type: "textarea" }),
        og_image: field({ filetypes: ["images"], type: "asset" }),
        title: field({ type: "text" }),
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
      display_name: "Home Page",
      icon: "block-doc",
      is_nestable: false,
      is_root: true,
      name: "home_page",
      preview_field: "title",
      schema: f({
        body: field({
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
            "share_bar",
          ],
          restrict_components: true,
          type: "bloks",
        }),
        description: field({ type: "textarea" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Landing Page -----
  (() => {
    reset();
    return {
      display_name: "Landing Page",
      icon: "block-pages",
      is_nestable: false,
      is_root: true,
      name: "landing_page",
      preview_field: "title",
      schema: f({
        accent_primary: field({ type: "text" }),
        accent_secondary: field({ type: "text" }),
        body: field({
          component_whitelist: [
            "richtext_section",
            "featured_post_block",
            "post_grid_block",
            "curated_post_set",
            "cta_banner",
            "share_bar",
          ],
          restrict_components: true,
          type: "bloks",
        }),
        cadence: field({ default_value: "weekly", type: "text" }),
        description: field({ type: "textarea" }),
        filters: field({
          component_whitelist: ["filter_chip"],
          restrict_components: true,
          type: "bloks",
        }),
        pillar: field({
          datasource_slug: "pillars",
          required: true,
          source: "internal",
          type: "option",
        }),
        seo_description: field({ type: "textarea" }),
        seo_title: field({ type: "text" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Post -----
  (() => {
    reset();
    return {
      display_name: "Post",
      icon: "block-doc",
      is_nestable: false,
      is_root: true,
      name: "post",
      preview_field: "title",
      schema: f({
        author: field({ default_value: "Pinal Bhatt", type: "text" }),
        body: field({ type: "richtext" }),
        category: field({
          datasource_slug: "post-categories",
          required: true,
          source: "internal",
          type: "option",
        }),
        cover_image: field({ filetypes: ["images"], type: "asset" }),
        excerpt: field({ required: true, type: "textarea" }),
        external_url: field({ type: "multilink" }),
        featured: field({ default_value: false, type: "boolean" }),
        gradient: field({
          datasource_slug: "gradients",
          source: "internal",
          type: "option",
        }),
        hide_share_bar: field({
          default_value: false,
          description: "Hide the default social share bar on this post.",
          type: "boolean",
        }),
        intro_blocks: field({
          component_whitelist: ["youtube_embed"],
          maximum: 1,
          restrict_components: true,
          type: "bloks",
        }),
        labels: field({
          datasource_slug: "post-labels",
          required: true,
          source: "internal",
          type: "options",
        }),
        pillar: field({
          datasource_slug: "pillars",
          required: true,
          source: "internal",
          type: "option",
        }),
        published_at: field({ type: "datetime" }),
        read_time: field({ type: "text" }),
        related: field({
          filter_content_type: ["post"],
          source: "internal_stories",
          type: "options",
        }),
        related_sets: field({
          component_whitelist: ["curated_post_set", "share_bar"],
          maximum: 4,
          restrict_components: true,
          type: "bloks",
        }),
        seo: field({
          component_whitelist: ["seo"],
          maximum: 1,
          restrict_components: true,
          type: "bloks",
        }),
        share_desktop_layout: field({
          default_value: "both",
          description:
            "Mobile is always horizontal; this only affects desktop layout.",
          exclude_empty_option: true,
          options: [
            { name: "Inline horizontal", value: "inline" },
            { name: "Floating left sidebar", value: "sidebar" },
            { name: "Both (sidebar on desktop + inline)", value: "both" },
          ],
          type: "option",
        }),
        title: field({ required: true, type: "text" }),
        updated_at: field({ type: "datetime" }),
      }),
    };
  })(),

  // ----- About Page -----
  (() => {
    reset();
    return {
      display_name: "About Page",
      icon: "user",
      is_nestable: false,
      is_root: true,
      name: "about_page",
      preview_field: "title",
      schema: f({
        bio: field({ type: "richtext" }),
        body: field({
          component_whitelist: [
            "about_hero",
            "about_section",
            "about_story",
            "my_pillers",
            "my_wellness_threads",
            "richtext_section",
            "share_bar",
          ],
          restrict_components: true,
          type: "bloks",
        }),
        headline: field({ type: "text" }),
        intro_chip_label: field({ type: "text" }),
        portrait: field({ filetypes: ["images"], type: "asset" }),
        seo_description: field({ type: "textarea" }),
        seo_title: field({ type: "text" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Disclaimer Page -----
  (() => {
    reset();
    return {
      display_name: "Disclaimer Page",
      icon: "block-doc",
      is_nestable: false,
      is_root: true,
      name: "disclaimer_page",
      preview_field: "title",
      schema: f({
        body: field({ type: "richtext" }),
        eyebrow: field({
          description:
            'Small uppercase label shown above the H1 (e.g. "Legal").',
          type: "text",
        }),
        last_updated: field({ type: "datetime" }),
        lede: field({
          description: "Intro paragraph rendered under the H1 in the hero.",
          type: "textarea",
        }),
        seo_description: field({ type: "textarea" }),
        seo_title: field({ type: "text" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Privacy Policy Page -----
  (() => {
    reset();
    return {
      display_name: "Privacy Policy Page",
      icon: "block-doc",
      is_nestable: false,
      is_root: true,
      name: "privacy_policy_page",
      preview_field: "title",
      schema: f({
        body: field({ type: "richtext" }),
        eyebrow: field({
          description:
            'Small uppercase label shown above the H1 (e.g. "Privacy").',
          type: "text",
        }),
        last_updated: field({ type: "datetime" }),
        lede: field({
          description: "Intro paragraph rendered under the H1 in the hero.",
          type: "textarea",
        }),
        seo_description: field({ type: "textarea" }),
        seo_title: field({ type: "text" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),

  // ----- Global Config -----
  (() => {
    reset();
    return {
      display_name: "Global Config",
      icon: "settings",
      is_nestable: false,
      is_root: true,
      name: "global_config",
      preview_field: "brand_tagline",
      schema: f({
        brand_tagline: field({ type: "text" }),
        cta_default: field({
          component_whitelist: ["cta_banner"],
          maximum: 1,
          restrict_components: true,
          type: "bloks",
        }),
        footer_about: field({ type: "textarea" }),
        footer_explore: field({
          component_whitelist: ["nav_item"],
          restrict_components: true,
          type: "bloks",
        }),
        footer_more: field({
          component_whitelist: ["nav_item"],
          restrict_components: true,
          type: "bloks",
        }),
        footer_topics: field({
          component_whitelist: ["nav_item"],
          restrict_components: true,
          type: "bloks",
        }),
        nav_items: field({
          component_whitelist: ["nav_item"],
          restrict_components: true,
          type: "bloks",
        }),
        social_links: field({
          component_whitelist: ["social_link"],
          restrict_components: true,
          type: "bloks",
        }),
      }),
    };
  })(),
];

export const components: SbComponent[] = [...nestableBlocks, ...contentTypes];

export const folders = [
  { default_root: "post", name: "Bits", slug: "bits" },
  { default_root: "post", name: "Bites", slug: "bites" },
  { default_root: "post", name: "Blog", slug: "blog" },
  { default_root: "global_config", name: "Global", slug: "_global" },
];
