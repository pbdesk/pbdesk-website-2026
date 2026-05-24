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
      name: "hub_meta_item",
      display_name: "Hub Meta Item",
      is_root: false,
      is_nestable: true,
      icon: "block-text-img-left",
      preview_field: "label",
      schema: f({
        value: field({ type: "text", display_name: "Value", required: true }),
        label: field({ type: "text", display_name: "Label", required: true }),
        icon: field({
          type: "option",
          display_name: "Icon",
          required: true,
          options: [
            { value: "Layers", name: "Layers" },
            { value: "Target", name: "Target" },
            { value: "Sparkles", name: "Sparkles" },
            { value: "Calendar", name: "Calendar" },
          ],
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "hub_game",
      display_name: "Hub Game",
      is_root: false,
      is_nestable: true,
      icon: "block-table",
      preview_field: "name",
      schema: f({
        slug: field({ type: "text", display_name: "Slug", required: true }),
        name: field({ type: "text", display_name: "Name", required: true }),
        status: field({
          type: "option",
          display_name: "Status",
          required: true,
          options: [
            { value: "live", name: "Live" },
            { value: "coming-q3", name: "Coming Q3" },
            { value: "coming-q4", name: "Coming Q4" },
            { value: "exploring", name: "Exploring" },
          ],
        }),
        category: field({ type: "text", display_name: "Category" }),
        description: field({ type: "textarea", display_name: "Description" }),
        href: field({ type: "text", display_name: "Href (live games only)" }),
        cover_image: field({ type: "text", display_name: "Cover Image Path" }),
        glyph: field({ type: "text", display_name: "Glyph (coming-soon)" }),
        tiers: field({ type: "number", display_name: "Tiers" }),
        est_time: field({ type: "text", display_name: "Est. Time" }),
        operations: field({ type: "text", display_name: "Operations" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "hub_benefit",
      display_name: "Hub Benefit",
      is_root: false,
      is_nestable: true,
      icon: "block-stars",
      preview_field: "title",
      schema: f({
        icon: field({
          type: "option",
          display_name: "Icon",
          required: true,
          options: [
            { value: "Target", name: "Target" },
            { value: "Brain", name: "Brain" },
            { value: "Clock", name: "Clock" },
            { value: "Flame", name: "Flame" },
          ],
        }),
        title: field({ type: "text", display_name: "Title", required: true }),
        body: field({ type: "textarea", display_name: "Body", required: true }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "brain_boost_hub_page",
      display_name: "Brain Boost Hub Page",
      is_root: true,
      is_nestable: false,
      icon: "block-buildin",
      schema: f({
        intro_title: field({ type: "text", display_name: "Intro Title" }),
        intro_tagline: field({ type: "text", display_name: "Intro Tagline" }),
        intro_lede: field({ type: "textarea", display_name: "Intro Lede" }),
        meta_items: field({
          type: "bloks",
          display_name: "Meta Items",
          restrict_components: true,
          component_whitelist: ["hub_meta_item"],
        }),
        games: field({
          type: "bloks",
          display_name: "Games",
          restrict_components: true,
          component_whitelist: ["hub_game"],
        }),
        daily_heading: field({ type: "text", display_name: "Daily Heading" }),
        daily_body: field({ type: "textarea", display_name: "Daily Body" }),
        daily_cta_play: field({
          type: "text",
          display_name: "Daily CTA: Play",
        }),
        benefits_heading: field({
          type: "text",
          display_name: "Benefits Heading",
        }),
        benefits: field({
          type: "bloks",
          display_name: "Benefits",
          restrict_components: true,
          component_whitelist: ["hub_benefit"],
        }),
        seo_title: field({ type: "text", display_name: "SEO Title" }),
        seo_description: field({
          type: "textarea",
          display_name: "SEO Description",
        }),
      }),
    };
  })(),
];

const BRAIN_BOOST_FOLDER = { name: "Brain Boost", slug: "brain-boost" };

const HUB_STORY_CONTENT: SbStoryContent = {
  component: "brain_boost_hub_page",
  intro_title: "My Brain Boost",
  intro_tagline: "Short games for long focus.",
  intro_lede:
    "A new corner of PBDesk for short, focused puzzles that sharpen the mind between Bits and Bites. Twenty minutes of arithmetic logic, one solved grid at a time — the kind of quiet focus that resets a working day. KenKen is here today; more games are queued.",
  meta_items: [
    {
      component: "hub_meta_item",
      value: "1",
      label: "game live",
      icon: "Layers",
    },
    {
      component: "hub_meta_item",
      value: "4",
      label: "difficulty tiers",
      icon: "Target",
    },
    {
      component: "hub_meta_item",
      value: "~200",
      label: "hand-checked puzzles",
      icon: "Sparkles",
    },
    {
      component: "hub_meta_item",
      value: "1",
      label: "new puzzle every day",
      icon: "Calendar",
    },
  ],
  games: [
    {
      component: "hub_game",
      slug: "kenken",
      name: "KenKen",
      status: "live",
      category: "Arithmetic · Logic",
      description:
        "Fill an N×N grid so digits don't repeat in any row or column — the catch: outlined cages must hit their target with +, −, ×, or ÷. Pure logic, no guessing required.",
      href: "/brain-boost/kenken",
      cover_image: "/pillers/kenken-banner.png",
      tiers: 4,
      est_time: "10–25 min",
      operations: "+ − × ÷",
    },
    {
      component: "hub_game",
      slug: "sudoku",
      name: "Sudoku",
      status: "coming-q3",
      glyph: "SUD",
      category: "Logic",
      description:
        "Classic 9×9 with hand-picked difficulty curves and a no-mark-ups expert mode.",
    },
    {
      component: "hub_game",
      slug: "cryptic",
      name: "Cryptic Mini",
      status: "coming-q4",
      glyph: "CRY",
      category: "Words",
      description:
        "Five-clue cryptic crossword, finishable on a coffee break. Each solved clue links to its wordplay.",
    },
    {
      component: "hub_game",
      slug: "logic-grid",
      name: "Logic Grid",
      status: "exploring",
      glyph: "LOG",
      category: "Logic",
      description:
        "Five-by-five attribute deduction puzzles — the kind your physics teacher used to print and hand out.",
    },
  ],
  daily_heading: "Today's daily — Intermediate",
  daily_body:
    "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
  daily_cta_play: "Play today's",
  benefits_heading: "Why Brain Boost?",
  benefits: [
    {
      component: "hub_benefit",
      icon: "Target",
      title: "Single-task focus",
      body: "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
    },
    {
      component: "hub_benefit",
      icon: "Brain",
      title: "Working-memory workout",
      body: 'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
    },
    {
      component: "hub_benefit",
      icon: "Clock",
      title: "Designed to be short",
      body: "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
    },
    {
      component: "hub_benefit",
      icon: "Flame",
      title: "Daily ritual, no streak shame",
      body: "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
    },
  ],
  seo_title: "Brain Boost — Short games for long focus | PBDesk",
  seo_description:
    "Brain Boost is PBDesk's small puzzle corner — KenKen today, more queued. A fresh daily puzzle, four difficulty tiers, hand-checked games designed to fit a coffee break.",
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

  const sb = new StoryblokManagement({ token, spaceId, region });

  logStep("\n[1/3] Pushing hub component schemas...");
  for (const component of HUB_COMPONENTS) {
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
    name: "Brain Boost Hub",
    slug: "hub",
    full_slug: "brain-boost/hub",
    parent_id: folderRecord.id,
    content: HUB_STORY_CONTENT,
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
