#!/usr/bin/env bun
// scripts/update-home-hero.ts
//
// Idempotent update for the homepage hero:
//   1. Pushes the updated `hero` component schema.
//   2. Updates the first `hero` block in the `home` story body, or inserts one
//      at the top when the home story does not have a hero block yet.
//   3. Preserves every other home story field and body block.
//
// Required env vars:
//   - STORYBLOK_MANAGEMENT_TOKEN
//   - STORYBLOK_SPACE_ID
//   - STORYBLOK_REGION (optional, defaults to "eu")
//
// Usage:
//   bun scripts/update-home-hero.ts

import { randomUUID } from "node:crypto";
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_HERO_PILLAR_LINKS,
} from "../src/components/home/hero-content";
import {
  type SbComponent,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";
import { components } from "./lib/storyblok-schemas";

const STORY_SLUG = "home";
const HOME_PAGE_COMPONENT = "home_page";
const HERO_COMPONENT = "hero";

interface RichtextDoc {
  content: RichtextNode[];
  type: "doc";
}

interface RichtextNode {
  content?: RichtextNode[];
  text?: string;
  type: string;
}

interface HomeHeroUpdateResult {
  body: SbStoryContent[];
  changes: string[];
}

function uid(): string {
  return randomUUID();
}

function paragraph(text: string): RichtextNode {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function richtext(...paragraphs: string[]): RichtextDoc {
  return { type: "doc", content: paragraphs.map(paragraph) };
}

function findLocalComponent(name: string): SbComponent {
  const found = components.find((component) => component.name === name);
  if (!found) {
    throw new Error(
      `Component "${name}" not found in scripts/lib/storyblok-schemas.ts`
    );
  }
  return found;
}

export const homeHeroComponentSchema = findLocalComponent(HERO_COMPONENT);

export function buildHomeHeroBlok(existingUid?: string): SbStoryContent {
  return {
    _uid: existingUid ?? uid(),
    component: HERO_COMPONENT,
    eyebrow: DEFAULT_HERO_CONTENT.eyebrow,
    headline: richtext(DEFAULT_HERO_CONTENT.headline),
    kicker: DEFAULT_HERO_CONTENT.kicker,
    subheadline: richtext(DEFAULT_HERO_CONTENT.subheadline),
    cta_label: DEFAULT_HERO_CONTENT.ctaLabel,
    cta_href: { url: DEFAULT_HERO_CONTENT.ctaHref, linktype: "url" },
    secondary_cta_label: DEFAULT_HERO_CONTENT.secondaryCtaLabel,
    secondary_cta_href: {
      url: DEFAULT_HERO_CONTENT.secondaryCtaHref,
      linktype: "url",
    },
    show_pillar_links: DEFAULT_HERO_PILLAR_LINKS.length > 0,
    show_social: true,
  };
}

function updateHomeBody(currentBody: SbStoryContent[]): HomeHeroUpdateResult {
  const changes: string[] = [];
  const heroIndex = currentBody.findIndex(
    (blok) => blok.component === HERO_COMPONENT
  );

  if (heroIndex < 0) {
    changes.push("inserted hero at position 0");
    return {
      body: [buildHomeHeroBlok(), ...currentBody],
      changes,
    };
  }

  const existingHero = currentBody[heroIndex];
  const existingUid =
    typeof existingHero._uid === "string" && existingHero._uid.length > 0
      ? existingHero._uid
      : undefined;
  const nextHero = {
    ...existingHero,
    ...buildHomeHeroBlok(existingUid),
  };
  const nextBody = [...currentBody];
  nextBody[heroIndex] = nextHero;
  changes.push(`updated hero at position ${heroIndex}`);

  return { body: nextBody, changes };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required. Add it to .env.local or export it before running.`
    );
  }
  return value;
}

function logStep(label: string): void {
  process.stdout.write(`${label}\n`);
}

function logRow(line: string): void {
  process.stdout.write(`  ${line}\n`);
}

function logWarn(line: string): void {
  process.stdout.write(`  ! ${line}\n`);
}

async function main(): Promise<void> {
  const token = requireEnv("STORYBLOK_MANAGEMENT_TOKEN");
  const spaceId = requireEnv("STORYBLOK_SPACE_ID");
  const region = process.env.STORYBLOK_REGION ?? "eu";
  const sb = new StoryblokManagement({ token, spaceId, region });

  logStep("\n[1/3] Pushing updated hero component schema...");
  const { record, created } = await sb.upsertComponent(homeHeroComponentSchema);
  logRow(`${created ? "+" : "."} hero (#${record.id})`);

  logStep("\n[2/3] Reading current home story...");
  const found = await sb.findStoryBySlug(STORY_SLUG);
  if (!found) {
    throw new Error(
      'Story "/home" not found. Run `bun scripts/seed-storyblok.ts` first.'
    );
  }

  const story = await sb.getStory(found.id);
  const existingContent = (story.content ?? {
    component: HOME_PAGE_COMPONENT,
  }) as SbStoryContent;
  const existingBody = Array.isArray(existingContent.body)
    ? (existingContent.body as SbStoryContent[])
    : [];
  const hasUnpublishedChanges = Boolean(
    (story as unknown as { unpublished_changes?: boolean }).unpublished_changes
  );

  logRow(`current body has ${existingBody.length} block(s)`);
  const { body, changes } = updateHomeBody(existingBody);

  logStep("\n[3/3] Updating home story hero...");
  for (const change of changes) {
    logRow(change);
  }

  const nextContent: SbStoryContent = {
    ...existingContent,
    component: existingContent.component ?? HOME_PAGE_COMPONENT,
    body,
  };

  const { record: updatedStory } = await sb.upsertStory({
    name: story.name,
    slug: story.slug,
    full_slug: story.full_slug,
    path: story.path,
    content: nextContent,
  });
  logRow(`saved draft (#${updatedStory.id})`);

  if (hasUnpublishedChanges) {
    logWarn(
      "Home story already had unpublished changes, so this script left the update in draft."
    );
    logWarn("Review and publish manually in Storyblok.");
  } else {
    await sb.publishStory(updatedStory.id);
    logRow("published");
  }

  process.stdout.write("\nDone.\n");
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`\nUpdate failed: ${message}\n`);
    process.exit(1);
  });
}
