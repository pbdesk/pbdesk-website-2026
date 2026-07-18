#!/usr/bin/env bun
// scripts/seed-brain-boost-hub.ts
//
// Stand-alone seeder for the /brain-boost/hub story.
// Pushes 4 hub blok schemas (hub_meta_item, hub_game, hub_benefit,
// brain_boost_hub_page) and upserts brain-boost/hub story.
// Does NOT touch kenken_* schemas or the brain-boost/kenken story.
//
// Usage:
//   STORYBLOK_MANAGEMENT_TOKEN=... STORYBLOK_SPACE_ID=... bun run seed:brain-boost-hub
//
// Idempotent: safe to re-run.

import {
  type SbComponent,
  type SbComponentField,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";

let pos = 0;
function reset(): void {
  pos = 0;
}
function field<T extends Omit<SbComponentField, "pos">>(
  input: T
): T & { pos: number } {
  pos += 1;
  return { ...input, pos } as T & { pos: number };
}
function f<T extends Record<string, SbComponentField>>(schema: T): T {
  return schema;
}

const HUB_COMPONENTS: SbComponent[] = [
  (() => {
    reset();
    return {
      display_name: "Hub Meta Item",
      icon: "block-text-img-left",
      is_nestable: true,
      is_root: false,
      name: "hub_meta_item",
      preview_field: "label",
      schema: f({
        icon: field({
          display_name: "Icon",
          options: [
            { name: "Layers", value: "Layers" },
            { name: "Target", value: "Target" },
            { name: "Sparkles", value: "Sparkles" },
            { name: "Calendar", value: "Calendar" },
          ],
          required: true,
          type: "option",
        }),
        label: field({ display_name: "Label", required: true, type: "text" }),
        value: field({ display_name: "Value", required: true, type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "Hub Game",
      icon: "block-table",
      is_nestable: true,
      is_root: false,
      name: "hub_game",
      preview_field: "name",
      schema: f({
        category: field({ display_name: "Category", type: "text" }),
        cover_image: field({ display_name: "Cover Image Path", type: "text" }),
        description: field({ display_name: "Description", type: "textarea" }),
        est_time: field({ display_name: "Est. Time", type: "text" }),
        glyph: field({ display_name: "Glyph (coming-soon)", type: "text" }),
        href: field({ display_name: "Href (live games only)", type: "text" }),
        name: field({ display_name: "Name", required: true, type: "text" }),
        operations: field({ display_name: "Operations", type: "text" }),
        slug: field({ display_name: "Slug", required: true, type: "text" }),
        status: field({
          display_name: "Status",
          options: [
            { name: "Live", value: "live" },
            { name: "Coming Q3", value: "coming-q3" },
            { name: "Coming Q4", value: "coming-q4" },
            { name: "Exploring", value: "exploring" },
          ],
          required: true,
          type: "option",
        }),
        tiers: field({ display_name: "Tiers", type: "number" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "Hub Benefit",
      icon: "block-stars",
      is_nestable: true,
      is_root: false,
      name: "hub_benefit",
      preview_field: "title",
      schema: f({
        body: field({ display_name: "Body", required: true, type: "textarea" }),
        icon: field({
          display_name: "Icon",
          options: [
            { name: "Target", value: "Target" },
            { name: "Brain", value: "Brain" },
            { name: "Clock", value: "Clock" },
            { name: "Flame", value: "Flame" },
          ],
          required: true,
          type: "option",
        }),
        title: field({ display_name: "Title", required: true, type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "Brain Boost Hub Page",
      icon: "block-buildin",
      is_nestable: false,
      is_root: true,
      name: "brain_boost_hub_page",
      schema: f({
        benefits: field({
          component_whitelist: ["hub_benefit"],
          display_name: "Benefits",
          restrict_components: true,
          type: "bloks",
        }),
        benefits_heading: field({
          display_name: "Benefits Heading",
          type: "text",
        }),
        daily_body: field({ display_name: "Daily Body", type: "textarea" }),
        daily_cta_play: field({
          display_name: "Daily CTA: Play",
          type: "text",
        }),
        daily_heading: field({ display_name: "Daily Heading", type: "text" }),
        games: field({
          component_whitelist: ["hub_game"],
          display_name: "Games",
          restrict_components: true,
          type: "bloks",
        }),
        intro_lede: field({ display_name: "Intro Lede", type: "textarea" }),
        intro_tagline: field({ display_name: "Intro Tagline", type: "text" }),
        intro_title: field({ display_name: "Intro Title", type: "text" }),
        meta_items: field({
          component_whitelist: ["hub_meta_item"],
          display_name: "Meta Items",
          restrict_components: true,
          type: "bloks",
        }),
        seo_description: field({
          display_name: "SEO Description",
          type: "textarea",
        }),
        seo_title: field({ display_name: "SEO Title", type: "text" }),
      }),
    };
  })(),
];

const BRAIN_BOOST_FOLDER = { name: "Brain Boost", slug: "brain-boost" };

const HUB_STORY_CONTENT: SbStoryContent = {
  benefits: [
    {
      body: "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
      component: "hub_benefit",
      icon: "Target",
      title: "Single-task focus",
    },
    {
      body: 'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
      component: "hub_benefit",
      icon: "Brain",
      title: "Working-memory workout",
    },
    {
      body: "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
      component: "hub_benefit",
      icon: "Clock",
      title: "Designed to be short",
    },
    {
      body: "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
      component: "hub_benefit",
      icon: "Flame",
      title: "Daily ritual, no streak shame",
    },
  ],
  benefits_heading: "Why Brain Boost?",
  component: "brain_boost_hub_page",
  daily_body:
    "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
  daily_cta_play: "Play today's",
  daily_heading: "Today's daily — Intermediate",
  games: [
    {
      category: "Arithmetic · Logic",
      component: "hub_game",
      cover_image: "/pillers/kenken-banner.png",
      description:
        "Fill an N×N grid so digits don't repeat in any row or column — the catch: outlined cages must hit their target with +, −, ×, or ÷. Pure logic, no guessing required.",
      est_time: "10–25 min",
      href: "/brain-boost/kenken",
      name: "KenKen",
      operations: "+ − × ÷",
      slug: "kenken",
      status: "live",
      tiers: 4,
    },
    {
      category: "Logic",
      component: "hub_game",
      description:
        "Classic 9×9 with hand-picked difficulty curves and a no-mark-ups expert mode.",
      glyph: "SUD",
      name: "Sudoku",
      slug: "sudoku",
      status: "coming-q3",
    },
    {
      category: "Words",
      component: "hub_game",
      description:
        "Five-clue cryptic crossword, finishable on a coffee break. Each solved clue links to its wordplay.",
      glyph: "CRY",
      name: "Cryptic Mini",
      slug: "cryptic",
      status: "coming-q4",
    },
    {
      category: "Logic",
      component: "hub_game",
      description:
        "Five-by-five attribute deduction puzzles — the kind your physics teacher used to print and hand out.",
      glyph: "LOG",
      name: "Logic Grid",
      slug: "logic-grid",
      status: "exploring",
    },
  ],
  intro_lede:
    "A new corner of PBDesk for short, focused puzzles that sharpen the mind between Bits and Bites. Twenty minutes of arithmetic logic, one solved grid at a time — the kind of quiet focus that resets a working day. KenKen is here today; more games are queued.",
  intro_tagline: "Short games for long focus.",
  intro_title: "My Brain Boost",
  meta_items: [
    {
      component: "hub_meta_item",
      icon: "Layers",
      label: "game live",
      value: "1",
    },
    {
      component: "hub_meta_item",
      icon: "Target",
      label: "difficulty tiers",
      value: "4",
    },
    {
      component: "hub_meta_item",
      icon: "Sparkles",
      label: "hand-checked puzzles",
      value: "~200",
    },
    {
      component: "hub_meta_item",
      icon: "Calendar",
      label: "new puzzle every day",
      value: "1",
    },
  ],
  seo_description:
    "Brain Boost is PBDesk's small puzzle corner — KenKen today, more queued. A fresh daily puzzle, four difficulty tiers, hand-checked games designed to fit a coffee break.",
  seo_title: "Brain Boost — Short games for long focus | PBDesk",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required (export or .env.local).`);
  }
  return value;
}

function logStep(label: string): void {
  process.stdout.write(`${label}\n`);
}

function logRow(line: string): void {
  process.stdout.write(`  ${line}\n`);
}

async function main(): Promise<void> {
  const token = requireEnv("STORYBLOK_MANAGEMENT_TOKEN");
  const spaceId = requireEnv("STORYBLOK_SPACE_ID");
  const region = process.env.STORYBLOK_REGION ?? "eu";

  const sb = new StoryblokManagement({ region, spaceId, token });

  logStep("\n[1/3] Pushing hub component schemas...");
  for (const component of HUB_COMPONENTS) {
    // biome-ignore lint/performance/noAwaitInLoops: sequential Storyblok Management API calls; rate-limited and order matters.
    const { record, created } = await sb.upsertComponent(component);
    logRow(`${created ? "+" : "·"} ${component.name} (#${record.id})`);
  }

  logStep("\n[2/3] Ensuring brain-boost folder...");
  const { record: folderRecord, created: folderCreated } =
    await sb.upsertFolder(BRAIN_BOOST_FOLDER);
  logRow(
    `${folderCreated ? "+" : "·"} ${BRAIN_BOOST_FOLDER.slug}/ (#${folderRecord.id})`
  );

  logStep("\n[3/3] Upserting brain-boost/hub story...");
  const { record: storyRecord, created: storyCreated } = await sb.upsertStory({
    content: HUB_STORY_CONTENT,
    full_slug: "brain-boost/hub",
    name: "Brain Boost Hub",
    parent_id: folderRecord.id,
    slug: "hub",
  });
  await sb.publishStory(storyRecord.id);
  logRow(
    `${storyCreated ? "+" : "·"} ${storyRecord.full_slug} (#${storyRecord.id}, published)`
  );

  process.stdout.write("\nDone.\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nseed-brain-boost-hub failed: ${message}\n`);
  process.exit(1);
});
