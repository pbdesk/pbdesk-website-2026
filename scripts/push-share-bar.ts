#!/usr/bin/env bun
// scripts/push-share-bar.ts
//
// Apply all Storyblok schema changes for the social share bar feature in a
// single idempotent run. Pushes the new `share_bar` nestable block, replays
// the updated `post` schema (so the new `hide_share_bar` and
// `share_desktop_layout` fields land), and extends `component_whitelist`
// entries on landing/home/about page bodies plus post `related_sets` so
// editors can drop the block in those slots.
//
// Usage:
//   bun scripts/push-share-bar.ts
//
// Required env vars (already documented in .env.local.example):
//   STORYBLOK_MANAGEMENT_TOKEN
//   STORYBLOK_SPACE_ID
//   STORYBLOK_REGION (optional, defaults to "eu")
//
// Re-running the script is safe — `upsertComponent` PUT-replaces existing
// schemas with the canonical version from `scripts/lib/storyblok-schemas.ts`.

import {
  type SbComponent,
  type SbComponentField,
  StoryblokManagement,
} from "./lib/storyblok-management";
import { components } from "./lib/storyblok-schemas";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Add it to .env.local.`);
  }
  return value;
}

function findLocalSchema(name: string): SbComponent {
  const local = components.find((c) => c.name === name);
  if (!local) {
    throw new Error(
      `Component "${name}" not found in scripts/lib/storyblok-schemas.ts`
    );
  }
  return local;
}

async function pushOne(sb: StoryblokManagement, name: string): Promise<void> {
  const local = findLocalSchema(name);
  const { record, created } = await sb.upsertComponent(local);
  process.stdout.write(
    `${created ? "+" : "·"} ${local.name} (#${record.id})\n`
  );
}

async function ensureWhitelist(
  sb: StoryblokManagement,
  parentName: string,
  fieldName: string,
  childName: string
): Promise<void> {
  const all = await sb.listComponents();
  const parent = all.find((c) => c.name === parentName);
  if (!parent) {
    throw new Error(`Parent component "${parentName}" not found in space.`);
  }
  const schema: Record<string, SbComponentField> = parent.schema ?? {};
  const fieldSpec = schema[fieldName];
  if (!fieldSpec) {
    throw new Error(`Field "${fieldName}" not found on "${parentName}".`);
  }
  const current = fieldSpec.component_whitelist ?? [];
  if (current.includes(childName)) {
    process.stdout.write(
      `· ${parentName}.${fieldName} already allows ${childName}\n`
    );
    return;
  }
  const next: SbComponent = {
    ...parent,
    schema: {
      ...schema,
      [fieldName]: {
        ...fieldSpec,
        component_whitelist: [...current, childName],
        restrict_components: true,
      },
    },
  };
  const { record } = await sb.upsertComponent(next);
  process.stdout.write(
    `+ ${parentName}.${fieldName} now allows ${childName} (#${record.id})\n`
  );
}

async function main(): Promise<void> {
  const sb = new StoryblokManagement({
    token: requireEnv("STORYBLOK_MANAGEMENT_TOKEN"),
    spaceId: requireEnv("STORYBLOK_SPACE_ID"),
    region: process.env.STORYBLOK_REGION ?? "eu",
  });

  process.stdout.write("\n→ Pushing share_bar component schema\n");
  await pushOne(sb, "share_bar");

  process.stdout.write(
    "\n→ Replaying post schema (adds hide_share_bar + share_desktop_layout)\n"
  );
  await pushOne(sb, "post");

  process.stdout.write("\n→ Extending whitelists\n");
  const targets: { parent: string; field: string }[] = [
    { parent: "post", field: "related_sets" },
    { parent: "landing_page", field: "body" },
    { parent: "home_page", field: "body" },
    { parent: "about_page", field: "body" },
  ];
  for (const { parent, field } of targets) {
    await ensureWhitelist(sb, parent, field, "share_bar");
  }

  process.stdout.write("\n✓ Done.\n");
}

main().catch((error) => {
  process.stderr.write(`${(error as Error).message}\n`);
  process.exit(1);
});
