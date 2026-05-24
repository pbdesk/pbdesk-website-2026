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
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function richtext(...paragraphs: string[]): RtDoc {
  return { type: "doc", content: paragraphs.map(paragraph) };
}

// ---------------------------------------------------------------------------
// kenken_* component schemas
// ---------------------------------------------------------------------------

const KENKEN_COMPONENTS: SbComponent[] = [
  (() => {
    reset();
    return {
      name: "kenken_hero",
      display_name: "KenKen Hero",
      is_root: false,
      is_nestable: true,
      icon: "block-image",
      preview_field: "title",
      schema: f({
        eyebrow: field({ type: "text" }),
        title: field({ type: "text", required: true }),
        lede: field({ type: "textarea" }),
        cta_play_label: field({ type: "text" }),
        cta_daily_label: field({ type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_prose",
      display_name: "KenKen Prose",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
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
      name: "kenken_step",
      display_name: "KenKen Step",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        text: field({ type: "textarea", required: true }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_steps",
      display_name: "KenKen Steps",
      is_root: false,
      is_nestable: true,
      icon: "block-buildingblocks",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        steps: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["kenken_step"],
          minimum: 1,
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_operation",
      display_name: "KenKen Operation",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "name",
      schema: f({
        symbol: field({ type: "text", required: true }),
        name: field({ type: "text", required: true }),
        description: field({ type: "textarea" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_operations",
      display_name: "KenKen Operations",
      is_root: false,
      is_nestable: true,
      icon: "block-buildingblocks",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        operations: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["kenken_operation"],
          minimum: 1,
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_level",
      display_name: "KenKen Level",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "name",
      schema: f({
        name: field({ type: "text", required: true }),
        sizes: field({ type: "text" }),
        operations: field({ type: "text" }),
        description: field({ type: "textarea" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_levels",
      display_name: "KenKen Levels",
      is_root: false,
      is_nestable: true,
      icon: "block-buildingblocks",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        levels: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["kenken_level"],
          minimum: 1,
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_cta",
      display_name: "KenKen CTA",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        cta_play_label: field({ type: "text" }),
        cta_daily_label: field({ type: "text" }),
      }),
    };
  })(),
  // ----- KenKen Page (content type) -----
  (() => {
    reset();
    return {
      name: "kenken_page",
      display_name: "KenKen Page",
      is_root: true,
      is_nestable: false,
      icon: "block-doc",
      preview_field: "seo_title",
      schema: f({
        body: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: [
            "kenken_hero",
            "kenken_prose",
            "kenken_steps",
            "kenken_operations",
            "kenken_levels",
            "kenken_cta",
          ],
        }),
        seo_title: field({ type: "text" }),
        seo_description: field({ type: "textarea" }),
      }),
    };
  })(),
];

// ---------------------------------------------------------------------------
// Brain Boost folder
// ---------------------------------------------------------------------------

const BRAIN_BOOST_FOLDER = {
  slug: "brain-boost",
  name: "Brain Boost",
  default_root: "kenken_page",
} as const;

// ---------------------------------------------------------------------------
// Canonical default story body
// ---------------------------------------------------------------------------

const KENKEN_STORY_CONTENT: SbStoryContent = {
  component: "kenken_page",
  seo_title: "KenKen — how to play & rules — PBDesk",
  seo_description:
    "How to play KenKen: rules, operations, and difficulty tiers. Then jump into the puzzle.",
  body: [
    {
      component: "kenken_hero",
      eyebrow: "Brain Boost",
      title: "KenKen",
      lede: "A bite-sized arithmetic logic puzzle. Fill the grid so every row and column holds each digit once, and each cage hits its target.",
      cta_play_label: "Play now",
      cta_daily_label: "Today's daily",
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
          title: "Fill rows and columns",
          text: "Place the digits 1 to N so each appears exactly once in every row and every column.",
        },
        {
          component: "kenken_step",
          title: "Satisfy each cage",
          text: "An outlined cage shows a target and an operation. The digits inside must combine, using that operation, to make the target.",
        },
        {
          component: "kenken_step",
          title: "Use notes and checks",
          text: "Jot candidate digits as notes, toggle rule-checking to spot duplicates, and reveal mistakes if you get stuck.",
        },
      ],
    },
    {
      component: "kenken_operations",
      heading: "Operations",
      operations: [
        {
          component: "kenken_operation",
          symbol: "+",
          name: "Addition",
          description: "Cage digits add up to the target (any cage size).",
        },
        {
          component: "kenken_operation",
          symbol: "−",
          name: "Subtraction",
          description: "Two cells; the target is their absolute difference.",
        },
        {
          component: "kenken_operation",
          symbol: "×",
          name: "Multiplication",
          description: "Cage digits multiply to the target (any cage size).",
        },
        {
          component: "kenken_operation",
          symbol: "÷",
          name: "Division",
          description:
            "Two cells; the larger divided by the smaller equals the target (whole numbers only).",
        },
      ],
    },
    {
      component: "kenken_levels",
      heading: "Difficulty levels",
      levels: [
        {
          component: "kenken_level",
          name: "Easy",
          sizes: "3×3, 4×4, 5×5",
          operations: "+ − ×  (÷ on 3×3)",
          description: "Gentle grids to learn the ropes.",
        },
        {
          component: "kenken_level",
          name: "Intermediate",
          sizes: "4×4, 5×5",
          operations: "+ − × ÷",
          description: "All four operations in play — the daily puzzle's tier.",
        },
        {
          component: "kenken_level",
          name: "Hard",
          sizes: "6×6, 7×7",
          operations: "+ − × ÷",
          description: "Bigger boards and tighter cages.",
        },
        {
          component: "kenken_level",
          name: "Genius",
          sizes: "8×8, 9×9",
          operations: "+ − × ÷",
          description: "A serious workout for puzzle veterans.",
        },
      ],
    },
    {
      component: "kenken_cta",
      heading: "Ready to play?",
      cta_play_label: "Play KenKen",
      cta_daily_label: "Today's daily",
    },
  ],
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

  const sb = new StoryblokManagement({ token, spaceId, region });

  logStep("\n[1/3] Pushing kenken_* component schemas...");
  for (const component of KENKEN_COMPONENTS) {
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
    name: "KenKen",
    slug: KENKEN_STORY_SLUG,
    full_slug: `${BRAIN_BOOST_FOLDER.slug}/${KENKEN_STORY_SLUG}`,
    parent_id: folderRecord.id,
    content: KENKEN_STORY_CONTENT,
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
