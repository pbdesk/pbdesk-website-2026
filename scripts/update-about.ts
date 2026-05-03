#!/usr/bin/env bun
// scripts/update-about.ts
//
// Idempotent, additive update for the /about story:
//   1. Pushes the `about_hero` and `about_story` component schemas.
//   2. Extends the `about_page.body` whitelist to allow the two new blocks
//      (preserving every existing entry).
//   3. Inserts an `about_hero` block at the top of the story body and an
//      `about_story` block right after the first `about_section` (or at
//      the end if no `about_section` exists) — but ONLY when those blocks
//      are not already present.
//   4. Publishes when the story has no pending unpublished changes;
//      otherwise leaves the new blocks in draft and prints a warning so
//      the editor can review and publish manually.
//
// Existing content is never altered or removed:
//   - All other body blocks keep their position, _uid, and field values.
//   - All other top-level story content fields (title, headline, bio,
//     portrait, seo_*, etc.) are preserved verbatim.
//   - Re-running the script is a no-op once both blocks are present.
//
// Required env vars (same as scripts/update-disclaimer.ts):
//   - STORYBLOK_MANAGEMENT_TOKEN
//   - STORYBLOK_SPACE_ID
//   - STORYBLOK_REGION (optional — defaults to "eu")
//
// Usage:
//   bun scripts/update-about.ts
//   # or via package.json:
//   bun run update:about

import { randomUUID } from "node:crypto";
import {
  type SbComponent,
  type SbComponentField,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";
import { components as localComponents } from "./lib/storyblok-schemas";

const STORY_SLUG = "about";
const ABOUT_PAGE_COMPONENT = "about_page";
const ABOUT_HERO_COMPONENT = "about_hero";
const ABOUT_STORY_COMPONENT = "about_story";
const ABOUT_SECTION_COMPONENT = "about_section";

// ============================================================================
// Default content for the two new blocks — mirrors the prior hardcoded JSX
// in src/app/(site)/about/page.tsx so the live site looks unchanged.
// ============================================================================

interface RtNode {
  attrs?: Record<string, unknown>;
  content?: RtNode[];
  marks?: { attrs?: Record<string, unknown>; type: string }[];
  text?: string;
  type: string;
}

interface RtDoc {
  content: RtNode[];
  type: "doc";
}

function paragraph(text: string): RtNode {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function richtext(...paragraphs: string[]): RtDoc {
  return { type: "doc", content: paragraphs.map(paragraph) };
}

function uid(): string {
  return randomUUID();
}

function buildAboutHeroBlok(): SbStoryContent {
  return {
    _uid: uid(),
    component: ABOUT_HERO_COMPONENT,
    chip_label: "About — the human behind the desk",
    title_lead: "Hi, I'm ",
    title_name: "Pinal Bhatt",
    title_subheadline:
      "Engineer by craft,\nlearner by habit,\nhuman by nature.",
    description:
      "I love writing code, exploring the AI realm, and chasing the small habits that keep mind and body sharp. This page is the long-form version — who I am, what I write about, and the threads I weave through everyday life.",
    primary_cta_label: "Read the blog",
    primary_cta_href: { url: "/blog", linktype: "url" },
    secondary_cta_label: "Say hello",
    secondary_cta_href: { url: "#social-links", linktype: "url" },
    show_social: true,
  };
}

function buildAboutStoryBlok(): SbStoryContent {
  return {
    _uid: uid(),
    component: ABOUT_STORY_COMPONENT,
    eyebrow: "My story",
    heading: "Code, curiosity, and a healthy dose of balance.",
    column_left: richtext(
      "I love coding and enjoy creating great software solutions through the power of code. I genuinely enjoy the entire process of creating software, from brainstorming ideas to writing clean code and debugging until everything runs just right. Whether I'm diving into backend, frontend, middleware, or experimenting with any new tech, I find a lot of joy in figuring things out and making things better.",
      "One of the areas that really excites me is artificial intelligence. I love exploring how AI is changing the way we live and work, and I'm always curious to see how I can apply it in the projects I build. I'm also always on the lookout for new tools, trends, and tech that challenge me to grow and think differently. For me, learning is an ongoing journey — and that's one of the best parts of being in tech."
    ),
    column_right: richtext(
      "But as much as I love coding, I don't believe life should be all about work. I'm a big believer in balance. Health and wellness are super important to me. I make time for physical and mental well-being, whether it's through regular exercise, mindfulness, or simply slowing down when needed. Staying healthy helps me stay sharp and present — both in my work and in life. Spending quality time with family and friends is something I truly value. At the end of the day, it's the people around us that bring the most meaning to our lives. I try to stay grounded, enjoy the little moments, and never take anything for granted. Work is important, but so is life — and I believe in showing up fully for both."
    ),
    quote_text:
      "The best gift you can give your loved ones is by existing in good health!",
    quote_link: {
      url: "https://www.linkedin.com/pulse/best-gift-you-can-give-your-loved-ones-existing-good-health-bhatt-nkvde",
      linktype: "url",
    },
    quote_attribution: "— That's why I say",
  };
}

// ============================================================================
// Schema + whitelist helpers
// ============================================================================

function findLocalComponent(name: string): SbComponent {
  const found = localComponents.find((c) => c.name === name);
  if (!found) {
    throw new Error(
      `Component "${name}" not found in scripts/lib/storyblok-schemas.ts`
    );
  }
  return found;
}

async function pushSchema(
  sb: StoryblokManagement,
  name: string
): Promise<void> {
  const local = findLocalComponent(name);
  const { record, created } = await sb.upsertComponent(local);
  logRow(
    `${created ? "+" : "·"} ${name} (#${record.id}) — ${created ? "created" : "updated"}`
  );
}

async function extendAboutPageWhitelist(
  sb: StoryblokManagement,
  childNames: string[]
): Promise<void> {
  const all = await sb.listComponents();
  const parent = all.find((c) => c.name === ABOUT_PAGE_COMPONENT);
  if (!parent) {
    throw new Error(`"${ABOUT_PAGE_COMPONENT}" component not found in space.`);
  }
  const schema: Record<string, SbComponentField> = parent.schema ?? {};
  const bodyField = schema.body;
  if (!bodyField) {
    throw new Error(`"${ABOUT_PAGE_COMPONENT}.body" field not found.`);
  }
  const current = bodyField.component_whitelist ?? [];
  const missing = childNames.filter((n) => !current.includes(n));
  if (missing.length === 0) {
    logRow(
      `· ${ABOUT_PAGE_COMPONENT}.body already allows ${childNames.join(", ")}`
    );
    return;
  }
  const next: SbComponent = {
    ...parent,
    schema: {
      ...schema,
      body: {
        ...bodyField,
        component_whitelist: [...current, ...missing],
        restrict_components: true,
      },
    },
  };
  const { record } = await sb.upsertComponent(next);
  logRow(
    `+ ${ABOUT_PAGE_COMPONENT}.body now allows ${missing.join(", ")} (#${record.id})`
  );
}

// ============================================================================
// Body insertion logic — additive only
// ============================================================================

interface BodyUpdateResult {
  body: SbStoryContent[];
  changes: string[];
}

function updateBody(currentBody: SbStoryContent[]): BodyUpdateResult {
  const changes: string[] = [];
  let body = [...currentBody];

  const hasAboutHero = body.some((b) => b.component === ABOUT_HERO_COMPONENT);
  if (!hasAboutHero) {
    body = [buildAboutHeroBlok(), ...body];
    changes.push(`inserted ${ABOUT_HERO_COMPONENT} at position 0`);
  }

  const hasAboutStory = body.some((b) => b.component === ABOUT_STORY_COMPONENT);
  if (!hasAboutStory) {
    const aboutSectionIdx = body.findIndex(
      (b) => b.component === ABOUT_SECTION_COMPONENT
    );
    const insertAt = aboutSectionIdx >= 0 ? aboutSectionIdx + 1 : body.length;
    body = [
      ...body.slice(0, insertAt),
      buildAboutStoryBlok(),
      ...body.slice(insertAt),
    ];
    changes.push(
      aboutSectionIdx >= 0
        ? `inserted ${ABOUT_STORY_COMPONENT} after ${ABOUT_SECTION_COMPONENT} (position ${insertAt})`
        : `inserted ${ABOUT_STORY_COMPONENT} at end (position ${insertAt})`
    );
  }

  return { body, changes };
}

// ============================================================================
// Logging
// ============================================================================

function logStep(label: string): void {
  process.stdout.write(`${label}\n`);
}

function logRow(line: string): void {
  process.stdout.write(`  ${line}\n`);
}

function logWarn(line: string): void {
  process.stdout.write(`  ⚠ ${line}\n`);
}

// ============================================================================
// Runner
// ============================================================================

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required. Add it to .env.local or export it before running.`
    );
  }
  return value;
}

async function main(): Promise<void> {
  const token = requireEnv("STORYBLOK_MANAGEMENT_TOKEN");
  const spaceId = requireEnv("STORYBLOK_SPACE_ID");
  const region = process.env.STORYBLOK_REGION ?? "eu";

  const sb = new StoryblokManagement({ token, spaceId, region });

  logStep("\n[1/4] Pushing about_hero + about_story component schemas...");
  await pushSchema(sb, ABOUT_HERO_COMPONENT);
  await pushSchema(sb, ABOUT_STORY_COMPONENT);

  logStep(
    "\n[2/4] Ensuring about_page.body whitelist allows the new blocks..."
  );
  await extendAboutPageWhitelist(sb, [
    ABOUT_HERO_COMPONENT,
    ABOUT_STORY_COMPONENT,
  ]);

  logStep("\n[3/4] Reading current /about story...");
  const found = await sb.findStoryBySlug(STORY_SLUG);
  if (!found) {
    throw new Error(
      `Story "/${STORY_SLUG}" not found. Run \`bun scripts/seed-storyblok.ts\` first.`
    );
  }
  const story = await sb.getStory(found.id);
  const existingContent = (story.content ?? {
    component: ABOUT_PAGE_COMPONENT,
  }) as SbStoryContent;
  const existingBody = Array.isArray(existingContent.body)
    ? (existingContent.body as SbStoryContent[])
    : [];

  // `unpublished_changes` is exposed by Storyblok MAPI but not declared on
  // SbStoryRecord — read it via a narrow cast.
  const hasUnpublishedChanges = Boolean(
    (story as unknown as { unpublished_changes?: boolean }).unpublished_changes
  );

  logRow(`current body has ${existingBody.length} block(s)`);
  for (const blok of existingBody) {
    logRow(`  · ${blok.component}`);
  }

  const { body: newBody, changes } = updateBody(existingBody);

  if (changes.length === 0) {
    logStep("\n[4/4] No changes needed — both blocks already present. Done.");
    return;
  }

  logStep("\n[4/4] Updating /about story (additive only)...");
  for (const change of changes) {
    logRow(change);
  }

  // Build new content preserving every existing top-level field.
  const newContent: SbStoryContent = {
    ...existingContent,
    component: existingContent.component ?? ABOUT_PAGE_COMPONENT,
    body: newBody,
  };

  const { record } = await sb.upsertStory({
    name: story.name,
    slug: story.slug,
    full_slug: story.full_slug,
    content: newContent,
  });
  logRow(`saved draft (#${record.id})`);

  if (hasUnpublishedChanges) {
    logWarn(
      "Story had pending unpublished changes before this run — leaving the new blocks in draft."
    );
    logWarn(
      "Review the draft in Storyblok and publish manually to push everything live."
    );
  } else {
    await sb.publishStory(record.id);
    logRow("✓ published");
  }

  process.stdout.write("\nDone.\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nUpdate failed: ${message}\n`);
  process.exit(1);
});
