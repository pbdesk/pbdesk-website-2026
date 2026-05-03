#!/usr/bin/env bun
// scripts/push-component.ts
//
// Push a single component schema (and optionally extend a parent's
// component_whitelist) to the live Storyblok space, without re-seeding
// stories or other components.
//
// Usage:
//   bun scripts/push-component.ts <component-name> [parent-name:field ...]
//
// Examples:
//   # Push the curated_post_set block and whitelist it on home_page.body
//   # and landing_page.body:
//   bun scripts/push-component.ts curated_post_set home_page:body landing_page:body
//
//   # Push a block without touching any whitelists:
//   bun scripts/push-component.ts curated_post_set
//
// Idempotent. Existing component schemas are PUT-replaced with whatever's
// in `scripts/lib/storyblok-schemas.ts`. Whitelists are extended in place
// (existing entries are preserved).

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

function parseTarget(spec: string): { component: string; field: string } {
  const [component, field] = spec.split(":");
  if (!(component && field)) {
    throw new Error(
      `Invalid whitelist target "${spec}". Expected "<component>:<field>".`
    );
  }
  return { component, field };
}

async function pushOne(sb: StoryblokManagement, name: string): Promise<void> {
  const local = components.find((c) => c.name === name);
  if (!local) {
    throw new Error(
      `Component "${name}" not found in scripts/lib/storyblok-schemas.ts`
    );
  }
  const { record, created } = await sb.upsertComponent(local);
  process.stdout.write(
    `${created ? "+" : "·"} ${local.name} (#${record.id})\n`
  );
}

async function extendWhitelist(
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
  const field = schema[fieldName];
  if (!field) {
    throw new Error(`Field "${fieldName}" not found on "${parentName}".`);
  }
  const current = field.component_whitelist ?? [];
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
        ...field,
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
  const args = process.argv.slice(2);
  const [name, ...whitelistTargets] = args;
  if (!name) {
    process.stderr.write(
      "Usage: bun scripts/push-component.ts <component-name> [parent:field ...]\n"
    );
    process.exit(1);
  }
  const sb = new StoryblokManagement({
    token: requireEnv("STORYBLOK_MANAGEMENT_TOKEN"),
    spaceId: requireEnv("STORYBLOK_SPACE_ID"),
    region: process.env.STORYBLOK_REGION ?? "eu",
  });

  await pushOne(sb, name);
  for (const target of whitelistTargets) {
    const { component, field } = parseTarget(target);
    await extendWhitelist(sb, component, field, name);
  }
}

main().catch((error) => {
  process.stderr.write(`${(error as Error).message}\n`);
  process.exit(1);
});
