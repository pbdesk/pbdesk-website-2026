#!/usr/bin/env bun
// scripts/seed-kenken.ts
//
// Stand-alone, one-shot seeder for the /brain-boost/kenken story.
// Independent of scripts/seed-storyblok.ts and scripts/lib/storyblok-schemas.ts:
// all kenken_* component schemas, the brain-boost folder, and the canonical
// story body live in THIS file. Re-running seed-storyblok.ts will NOT push the
// kenken_* schemas; only `bun run seed:kenken` does.
//
// Usage:
//   STORYBLOK_MANAGEMENT_TOKEN=... STORYBLOK_SPACE_ID=... bun run seed:kenken
//
// Idempotent: safe to re-run after editing schemas or default content.

import {
  type SbComponent,
  type SbComponentField,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";

// ---------------------------------------------------------------------------
// Local schema-builder helpers (private equivalents of the file-private
// helpers in scripts/lib/storyblok-schemas.ts — duplicated intentionally to
// keep this script independent).
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Richtext helpers
// ---------------------------------------------------------------------------

interface RtTextNode {
  text: string;
  type: "text";
}
interface RtParagraphNode {
  content: RtTextNode[];
  type: "paragraph";
}
interface RtDoc {
  content: RtParagraphNode[];
  type: "doc";
}

function paragraph(text: string): RtParagraphNode {
  return { content: [{ text, type: "text" }], type: "paragraph" };
}

function richtext(...paragraphs: string[]): RtDoc {
  return { content: paragraphs.map(paragraph), type: "doc" };
}

// ---------------------------------------------------------------------------
// kenken_* component schemas
// ---------------------------------------------------------------------------

const KENKEN_COMPONENTS: SbComponent[] = [
  (() => {
    reset();
    return {
      display_name: "KenKen Hero",
      icon: "block-image",
      is_nestable: true,
      is_root: false,
      name: "kenken_hero",
      preview_field: "title",
      schema: f({
        cta_daily_label: field({ type: "text" }),
        cta_play_label: field({ type: "text" }),
        eyebrow: field({ type: "text" }),
        lede: field({ type: "textarea" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen Prose",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "kenken_prose",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        richtext: field({ type: "richtext" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen Step",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "kenken_step",
      preview_field: "title",
      schema: f({
        text: field({ required: true, type: "textarea" }),
        title: field({ required: true, type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen Steps",
      icon: "block-buildingblocks",
      is_nestable: true,
      is_root: false,
      name: "kenken_steps",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        steps: field({
          component_whitelist: ["kenken_step"],
          minimum: 1,
          restrict_components: true,
          type: "bloks",
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen Operation",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "kenken_operation",
      preview_field: "name",
      schema: f({
        description: field({ type: "textarea" }),
        name: field({ required: true, type: "text" }),
        symbol: field({ required: true, type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen Operations",
      icon: "block-buildingblocks",
      is_nestable: true,
      is_root: false,
      name: "kenken_operations",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        operations: field({
          component_whitelist: ["kenken_operation"],
          minimum: 1,
          restrict_components: true,
          type: "bloks",
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen Level",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "kenken_level",
      preview_field: "name",
      schema: f({
        description: field({ type: "textarea" }),
        name: field({ required: true, type: "text" }),
        operations: field({ type: "text" }),
        sizes: field({ type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen Levels",
      icon: "block-buildingblocks",
      is_nestable: true,
      is_root: false,
      name: "kenken_levels",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        levels: field({
          component_whitelist: ["kenken_level"],
          minimum: 1,
          restrict_components: true,
          type: "bloks",
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      display_name: "KenKen CTA",
      icon: "block-paragraph",
      is_nestable: true,
      is_root: false,
      name: "kenken_cta",
      preview_field: "heading",
      schema: f({
        cta_daily_label: field({ type: "text" }),
        cta_play_label: field({ type: "text" }),
        heading: field({ type: "text" }),
      }),
    };
  })(),
  // ----- KenKen Page (content type) -----
  (() => {
    reset();
    return {
      display_name: "KenKen Page",
      icon: "block-doc",
      is_nestable: false,
      is_root: true,
      name: "kenken_page",
      preview_field: "seo_title",
      schema: f({
        body: field({
          component_whitelist: [
            "kenken_hero",
            "kenken_prose",
            "kenken_steps",
            "kenken_operations",
            "kenken_levels",
            "kenken_cta",
          ],
          restrict_components: true,
          type: "bloks",
        }),
        seo_description: field({ type: "textarea" }),
        seo_title: field({ type: "text" }),
      }),
    };
  })(),
];

// ---------------------------------------------------------------------------
// Brain Boost folder
// ---------------------------------------------------------------------------

const BRAIN_BOOST_FOLDER = {
  default_root: "kenken_page",
  name: "Brain Boost",
  slug: "brain-boost",
} as const;

// ---------------------------------------------------------------------------
// Canonical default story body
// ---------------------------------------------------------------------------

const KENKEN_STORY_CONTENT: SbStoryContent = {
  body: [
    {
      component: "kenken_hero",
      cta_daily_label: "Today's daily",
      cta_play_label: "Play now",
      eyebrow: "Brain Boost",
      lede: "A bite-sized arithmetic logic puzzle. Fill the grid so every row and column holds each digit once, and each cage hits its target.",
      title: "KenKen",
    },
    {
      component: "kenken_prose",
      heading: "What is KenKen?",
      richtext: richtext(
        "KenKen is a grid-based logic puzzle. Fill an N×N grid with the digits 1 to N so that no digit repeats in any row or column. The grid is split into outlined groups called cages — each shows a target and an operation, and the digits in the cage must combine, using that operation, to produce the target."
      ),
    },
    {
      component: "kenken_steps",
      heading: "How to play",
      steps: [
        {
          component: "kenken_step",
          text: "Place the digits 1 to N so each appears exactly once in every row and every column.",
          title: "Fill rows and columns",
        },
        {
          component: "kenken_step",
          text: "An outlined cage shows a target and an operation. The digits inside must combine, using that operation, to make the target.",
          title: "Satisfy each cage",
        },
        {
          component: "kenken_step",
          text: "Jot candidate digits as notes, toggle rule-checking to spot duplicates, and reveal mistakes if you get stuck.",
          title: "Use notes and checks",
        },
      ],
    },
    {
      component: "kenken_operations",
      heading: "Operations",
      operations: [
        {
          component: "kenken_operation",
          description: "Cage digits add up to the target (any cage size).",
          name: "Addition",
          symbol: "+",
        },
        {
          component: "kenken_operation",
          description: "Two cells; the target is their absolute difference.",
          name: "Subtraction",
          symbol: "−",
        },
        {
          component: "kenken_operation",
          description: "Cage digits multiply to the target (any cage size).",
          name: "Multiplication",
          symbol: "×",
        },
        {
          component: "kenken_operation",
          description:
            "Two cells; the larger divided by the smaller equals the target (whole numbers only).",
          name: "Division",
          symbol: "÷",
        },
      ],
    },
    {
      component: "kenken_levels",
      heading: "Difficulty levels",
      levels: [
        {
          component: "kenken_level",
          description: "Gentle grids to learn the ropes.",
          name: "Easy",
          operations: "+ − ×  (÷ on 3×3)",
          sizes: "3×3, 4×4, 5×5",
        },
        {
          component: "kenken_level",
          description: "All four operations in play — the daily puzzle's tier.",
          name: "Intermediate",
          operations: "+ − × ÷",
          sizes: "4×4, 5×5",
        },
        {
          component: "kenken_level",
          description: "Bigger boards and tighter cages.",
          name: "Hard",
          operations: "+ − × ÷",
          sizes: "6×6, 7×7",
        },
        {
          component: "kenken_level",
          description: "A serious workout for puzzle veterans.",
          name: "Genius",
          operations: "+ − × ÷",
          sizes: "8×8, 9×9",
        },
      ],
    },
    {
      component: "kenken_cta",
      cta_daily_label: "Today's daily",
      cta_play_label: "Play KenKen",
      heading: "Ready to play?",
    },
  ],
  component: "kenken_page",
  seo_description:
    "How to play KenKen: rules, operations, and difficulty tiers. Then jump into the puzzle.",
  seo_title: "KenKen — how to play & rules — PBDesk",
};

const KENKEN_STORY_SLUG = "kenken";

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

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

  logStep("\n[1/3] Pushing kenken_* component schemas...");
  for (const component of KENKEN_COMPONENTS) {
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

  logStep("\n[3/3] Upserting brain-boost/kenken story...");
  const { record: storyRecord, created: storyCreated } = await sb.upsertStory({
    content: KENKEN_STORY_CONTENT,
    full_slug: `${BRAIN_BOOST_FOLDER.slug}/${KENKEN_STORY_SLUG}`,
    name: "KenKen",
    parent_id: folderRecord.id,
    slug: KENKEN_STORY_SLUG,
  });
  await sb.publishStory(storyRecord.id);
  logRow(
    `${storyCreated ? "+" : "·"} ${storyRecord.full_slug} (#${storyRecord.id}, published)`
  );

  process.stdout.write("\nDone.\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nseed-kenken failed: ${message}\n`);
  process.exit(1);
});
