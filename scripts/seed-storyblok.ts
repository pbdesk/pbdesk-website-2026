#!/usr/bin/env bun
// scripts/seed-storyblok.ts
// One-shot seed for an empty Storyblok space:
//   - pushes every component schema (content types + nestable blocks)
//   - pushes datasources + entries
//   - creates pillar folders + global folder
//   - uploads brand assets from /public to Storyblok
//   - creates + publishes singleton stories: home, about, disclaimer,
//     _global/config, bits/index, bites/index, blog/index
//
// Idempotent: re-run after editing schemas/content; existing records are updated.

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  aboutContent,
  bitesLandingContent,
  bitsLandingContent,
  blogLandingContent,
  brandAssets,
  disclaimerContent,
  globalConfigContent,
  homeContent,
  privacyPolicyContent,
  swapAssetPlaceholders,
} from "./lib/storyblok-content";
import {
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";
import { components, datasources, folders } from "./lib/storyblok-schemas";

interface SeedReport {
  assets: { filename: string; id: number; pretty_url: string }[];
  components: { name: string; created: boolean; id: number }[];
  datasources: {
    slug: string;
    created: boolean;
    id: number;
    entries: number;
  }[];
  folders: { slug: string; created: boolean; id: number }[];
  stories: { slug: string; created: boolean; id: number }[];
}

interface SeedStory {
  content: SbStoryContent;
  is_startpage?: boolean;
  name: string;
  parent_id?: number;
  // Storyblok "Real path" override — used so the visual editor opens the
  // correct route (e.g. `/` for home, not `/home`).
  path?: string;
  slug: string;
}

interface AssetEntry {
  filename: string;
  id: number;
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

async function pushComponents(
  sb: StoryblokManagement,
  report: SeedReport
): Promise<void> {
  logStep("\n[1/5] Pushing component schemas...");
  for (const component of components) {
    const { record, created } = await sb.upsertComponent(component);
    report.components.push({ name: component.name, created, id: record.id });
    logRow(`${created ? "+" : "·"} ${component.name} (#${record.id})`);
  }
}

async function pushDatasources(
  sb: StoryblokManagement,
  report: SeedReport
): Promise<void> {
  logStep("\n[2/5] Pushing datasources + entries...");
  for (const ds of datasources) {
    const { record, created } = await sb.upsertDatasource({
      slug: ds.slug,
      name: ds.name,
    });
    let entriesPushed = 0;
    for (const entry of ds.entries) {
      await sb.upsertDatasourceEntry(record.id, {
        name: entry.name,
        value: entry.value,
      });
      entriesPushed += 1;
    }
    report.datasources.push({
      slug: ds.slug,
      created,
      id: record.id,
      entries: entriesPushed,
    });
    logRow(
      `${created ? "+" : "·"} ${ds.slug} (#${record.id}, ${entriesPushed} entries)`
    );
  }
}

async function pushFolders(
  sb: StoryblokManagement,
  report: SeedReport
): Promise<Map<string, number>> {
  logStep("\n[3/5] Creating folders...");
  const folderIds = new Map<string, number>();
  for (const folder of folders) {
    const { record, created } = await sb.upsertFolder(folder);
    folderIds.set(folder.slug, record.id);
    report.folders.push({ slug: folder.slug, created, id: record.id });
    logRow(`${created ? "+" : "·"} ${folder.slug}/ (#${record.id})`);
  }
  return folderIds;
}

async function uploadBrandAssets(
  sb: StoryblokManagement,
  report: SeedReport
): Promise<Map<string, AssetEntry>> {
  logStep("\n[4/5] Uploading brand assets...");
  const assetMap = new Map<string, AssetEntry>();
  for (const asset of brandAssets) {
    const fullPath = resolve(process.cwd(), asset.localPath);
    if (!existsSync(fullPath)) {
      logRow(`! ${asset.localPath} (missing — skipped)`);
      continue;
    }
    const uploaded = await sb.uploadAsset(fullPath);
    const cdnFilename = uploaded.pretty_url ?? uploaded.filename;
    assetMap.set(asset.placeholderKey, {
      filename: cdnFilename,
      id: uploaded.id,
    });
    report.assets.push({
      filename: cdnFilename,
      id: uploaded.id,
      pretty_url: cdnFilename,
    });
    logRow(`+ ${asset.placeholderKey} → ${cdnFilename}`);
  }
  return assetMap;
}

function buildSeedStories(
  folderIds: Map<string, number>,
  assetMap: Map<string, AssetEntry>
): SeedStory[] {
  const globalFolderId = folderIds.get("_global");
  if (!globalFolderId) {
    throw new Error("Global folder was not created");
  }
  return [
    {
      name: "Home",
      slug: "home",
      content: swapAssetPlaceholders(homeContent, assetMap),
      // Visual editor should open `/`, not `/home`.
      path: "/",
    },
    {
      name: "About",
      slug: "about",
      content: swapAssetPlaceholders(aboutContent, assetMap),
    },
    {
      name: "Disclaimer",
      slug: "disclaimer",
      content: swapAssetPlaceholders(disclaimerContent, assetMap),
    },
    {
      name: "Privacy Policy",
      slug: "privacy-policy",
      content: swapAssetPlaceholders(privacyPolicyContent, assetMap),
    },
    {
      name: "Config",
      slug: "config",
      content: swapAssetPlaceholders(globalConfigContent, assetMap),
      parent_id: globalFolderId,
    },
    {
      name: "Bits — index",
      slug: "index",
      content: bitsLandingContent,
      parent_id: folderIds.get("bits"),
      // Marks this as the folder's start page so the visual editor opens
      // `/bits` instead of `/bits/index`.
      is_startpage: true,
    },
    {
      name: "Bites — index",
      slug: "index",
      content: bitesLandingContent,
      parent_id: folderIds.get("bites"),
      is_startpage: true,
    },
    {
      name: "Blog — index",
      slug: "index",
      content: blogLandingContent,
      parent_id: folderIds.get("blog"),
      is_startpage: true,
    },
  ];
}

function fullSlugFor(story: SeedStory, folderIds: Map<string, number>): string {
  if (!story.parent_id) {
    return story.slug;
  }
  const parentEntry = [...folderIds.entries()].find(
    ([, id]) => id === story.parent_id
  );
  const parentSlug = parentEntry?.[0] ?? "";
  return `${parentSlug}/${story.slug}`;
}

async function publishSeedStories(
  sb: StoryblokManagement,
  report: SeedReport,
  folderIds: Map<string, number>,
  assetMap: Map<string, AssetEntry>
): Promise<void> {
  logStep("\n[5/5] Creating + publishing singleton stories...");
  const seedStories = buildSeedStories(folderIds, assetMap);
  for (const story of seedStories) {
    const { record, created } = await sb.upsertStory({
      name: story.name,
      slug: story.slug,
      full_slug: fullSlugFor(story, folderIds),
      parent_id: story.parent_id,
      content: story.content,
      is_startpage: story.is_startpage,
      path: story.path,
    });
    await sb.publishStory(record.id);
    report.stories.push({ slug: record.full_slug, created, id: record.id });
    logRow(
      `${created ? "+" : "·"} ${record.full_slug} (#${record.id}, published)`
    );
  }
}

function printReport(report: SeedReport): void {
  process.stdout.write("\n## Seed report\n\n");
  process.stdout.write(`- Components: ${report.components.length} pushed\n`);
  const totalEntries = report.datasources.reduce(
    (sum, d) => sum + d.entries,
    0
  );
  process.stdout.write(
    `- Datasources: ${report.datasources.length} (${totalEntries} entries total)\n`
  );
  process.stdout.write(`- Folders: ${report.folders.length}\n`);
  process.stdout.write(`- Assets: ${report.assets.length} uploaded\n`);
  process.stdout.write(`- Stories: ${report.stories.length} (all published)\n`);
  process.stdout.write("\nDone.\n");
}

async function main(): Promise<void> {
  const token = requireEnv("STORYBLOK_MANAGEMENT_TOKEN");
  const spaceId = requireEnv("STORYBLOK_SPACE_ID");
  const region = process.env.STORYBLOK_REGION ?? "eu";

  const sb = new StoryblokManagement({ token, spaceId, region });

  const report: SeedReport = {
    components: [],
    datasources: [],
    folders: [],
    assets: [],
    stories: [],
  };

  await pushComponents(sb, report);
  await pushDatasources(sb, report);
  const folderIds = await pushFolders(sb, report);
  const assetMap = await uploadBrandAssets(sb, report);
  await publishSeedStories(sb, report, folderIds, assetMap);
  printReport(report);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nSeed failed: ${message}\n`);
  process.exit(1);
});
