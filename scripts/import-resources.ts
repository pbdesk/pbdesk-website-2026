#!/usr/bin/env bun
// scripts/import-resources.ts
// Imports posts from docs/resources/<slug>/index.mdx into Storyblok.
//
// For each post:
//   - parse frontmatter + body (gray-matter + remark + remark-gfm)
//   - skip when draft: true
//   - validate: requires category + ≥1 non-underscored label
//   - derive pillar from `type` frontmatter (Bits/Bites/Blog → bits/bites/blog)
//   - upload cover image and embedded images to Storyblok assets (idempotent)
//   - convert markdown body to Storyblok richtext, rewriting image URLs
//   - prepend a `youtube_embed` intro_block when frontmatter has youtubeId
//   - extend post-categories / post-labels datasources with new values
//   - create + publish the `post` story at <pillar>/<slug>
//
// Pass `--dry-run` to validate everything (and report unmapped pillar values
// or unknown categories) without writing to Storyblok.
//
// Idempotent: re-running updates existing stories; asset uploads are cached
// by SHA-1 of file content under .storyblok-assets/cache.json.

import { resolve } from "node:path";
import { AssetUploader } from "./lib/asset-uploader";
import {
  type ConversionContext,
  type ConversionWarning,
  collectInternalLinks,
  mdastToStoryblokRichtext,
  type SbRichtextDoc,
} from "./lib/mdast-to-storyblok";
import {
  discoverPosts,
  gradientForSlug,
  type ParsedMdxPost,
  readTimeFromWordCount,
  splitLabels,
} from "./lib/mdx-importer";
import {
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";

const RESOURCES_DIR = resolve(process.cwd(), "docs/resources");

interface ImportFlags {
  dryRun: boolean;
}

interface ImportSummary {
  brokenLinks: { slug: string; href: string }[];
  byPillar: Record<string, number>;
  imported: number;
  newLabels: Set<string>;
  skipped: number;
  total: number;
  unknownCategories: Set<string>;
  warnings: { slug: string; warnings: ConversionWarning[] }[];
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

function parseFlags(argv: string[]): ImportFlags {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

function uid(): string {
  return crypto.randomUUID();
}

function buildIntroBlocks(post: ParsedMdxPost): SbStoryContent[] {
  const blocks: SbStoryContent[] = [];
  if (post.frontmatter.youtubeId) {
    blocks.push({
      _uid: uid(),
      component: "youtube_embed",
      youtube_id: post.frontmatter.youtubeId,
      caption: "",
    });
  }
  return blocks;
}

function buildPostContent(
  post: ParsedMdxPost,
  body: SbRichtextDoc,
  coverAsset: { id: number; filename: string } | undefined,
  realLabels: string[],
  isFeatured: boolean
): SbStoryContent {
  const cover = coverAsset
    ? {
        id: coverAsset.id,
        filename: coverAsset.filename,
        alt: post.frontmatter.title,
      }
    : undefined;

  const externalUrl = post.frontmatter.url
    ? { url: post.frontmatter.url, linktype: "url" }
    : undefined;

  return {
    component: "post",
    title: post.frontmatter.title,
    excerpt: post.frontmatter.description,
    category: post.frontmatter.category,
    labels: realLabels,
    pillar: post.pillar,
    gradient: gradientForSlug(post.slug),
    read_time: readTimeFromWordCount(post.wordCount),
    featured: isFeatured,
    cover_image: cover,
    external_url: externalUrl,
    intro_blocks: buildIntroBlocks(post),
    body,
    published_at: post.frontmatter.pubDate ?? null,
    updated_at:
      post.frontmatter.updatedDate ?? post.frontmatter.pubDate ?? null,
    author: "Pinal Bhatt",
    related: post.frontmatter.related ?? [],
    seo: [],
  };
}

function logSection(label: string): void {
  process.stdout.write(`\n${label}\n`);
}

function logRow(line: string): void {
  process.stdout.write(`  ${line}\n`);
}

async function ensureDatasourceEntries(
  sb: StoryblokManagement,
  datasourceSlug: string,
  values: { name: string; value: string }[]
): Promise<number> {
  const datasources = await sb.listDatasources();
  const target = datasources.find((d) => d.slug === datasourceSlug);
  if (!target) {
    throw new Error(
      `Datasource "${datasourceSlug}" not found. Run \`bun run seed:storyblok\` first.`
    );
  }
  const existingEntries = await sb.listDatasourceEntries(target.id);
  const existingValues = new Set(existingEntries.map((e) => e.value));
  let added = 0;
  for (const entry of values) {
    if (existingValues.has(entry.value)) {
      continue;
    }
    await sb.upsertDatasourceEntry(target.id, entry);
    added += 1;
  }
  return added;
}

async function findPillarFolderId(
  sb: StoryblokManagement,
  pillar: string
): Promise<number> {
  const folder = await sb.findFolderByFullSlug(pillar);
  if (!folder) {
    throw new Error(
      `Folder "${pillar}/" not found. Run \`bun run seed:storyblok\` first.`
    );
  }
  return folder.id;
}

async function uploadImagesForPost(
  uploader: AssetUploader,
  post: ParsedMdxPost
): Promise<{
  cover?: { id: number; filename: string };
  imageMap: Map<string, string>;
}> {
  const imageMap = new Map<string, string>();
  let cover: { id: number; filename: string } | undefined;

  if (post.coverImagePath) {
    const uploaded = await uploader.upload(post.coverImagePath);
    cover = { id: uploaded.id, filename: uploaded.filename };
    if (post.frontmatter.image) {
      imageMap.set(post.frontmatter.image, uploaded.filename);
    }
  }

  for (const absolutePath of post.embeddedImagePaths) {
    const uploaded = await uploader.upload(absolutePath);
    // The mdast image src is the original markdown reference, e.g.
    // "../my-wellness-gurus/saurabh1.jpg". Map by both the original src
    // and the absolute path so the converter can find it either way.
    imageMap.set(absolutePath, uploaded.filename);
  }

  return { cover, imageMap };
}

const FILENAME_FROM_PATH_RE = /^.*\//;
const TRAILING_SLASHES_RE = /\/+$/;
const LEADING_SLASHES_RE = /^\/+/;

async function importOnePost(
  sb: StoryblokManagement,
  uploader: AssetUploader,
  pillarFolderIds: Map<string, number>,
  post: ParsedMdxPost,
  flags: ImportFlags,
  summary: ImportSummary
): Promise<void> {
  const { modifiers, real } = splitLabels(post.frontmatter.labels);
  if (real.length === 0) {
    throw new Error(
      `Post "${post.slug}" has no non-underscored labels (only modifiers: ${modifiers.join(", ")})`
    );
  }
  const isFeatured = modifiers.includes("_Featured");

  // Track new categories/labels for datasource extension
  summary.unknownCategories.add(post.frontmatter.category);
  for (const label of real) {
    summary.newLabels.add(label);
  }

  if (flags.dryRun) {
    summary.byPillar[post.pillar] = (summary.byPillar[post.pillar] ?? 0) + 1;
    summary.imported += 1;
    logRow(
      `· ${post.pillar}/${post.slug} (cat:${post.frontmatter.category}, labels:${real.length}, images:${post.embeddedImagePaths.length}, ${isFeatured ? "FEATURED" : "not featured"})`
    );
    return;
  }

  // Live run: upload images, build richtext, upsert story
  const { cover, imageMap } = await uploadImagesForPost(uploader, post);

  // The mdast converter looks up image.url against ctx.imageMap. The
  // mdast `image.url` is the raw markdown src (relative), but our map is
  // keyed by absolute path. Re-key by both for safety.
  const ctxMap = new Map<string, string>();
  for (const [absPath, cdn] of imageMap) {
    ctxMap.set(absPath, cdn);
  }
  // Re-walk the AST nodes to add their raw urls -> cdn
  // (Doing this here keeps mdast-to-storyblok independent of the importer.)
  const { visit } = await import("unist-util-visit");
  visit(post.ast, "image", (node) => {
    const absPath = post.embeddedImagePaths.find((p) =>
      p.endsWith(node.url.replace(FILENAME_FROM_PATH_RE, ""))
    );
    if (absPath) {
      const cdn = imageMap.get(absPath);
      if (cdn) {
        ctxMap.set(node.url, cdn);
      }
    }
  });

  const conversionContext: ConversionContext = {
    imageMap: ctxMap,
    warnings: [],
  };
  const richtextBody = mdastToStoryblokRichtext(post.ast, conversionContext);

  if (conversionContext.warnings.length) {
    summary.warnings.push({
      slug: post.slug,
      warnings: conversionContext.warnings,
    });
  }

  const internalLinks = collectInternalLinks(richtextBody);
  for (const href of internalLinks) {
    summary.brokenLinks.push({ slug: post.slug, href });
  }

  const content = buildPostContent(post, richtextBody, cover, real, isFeatured);
  const parentId = pillarFolderIds.get(post.pillar);
  if (!parentId) {
    throw new Error(`Folder for pillar "${post.pillar}" not found`);
  }
  const fullSlug = `${post.pillar}/${post.slug}`;
  const { record, created } = await sb.upsertStory({
    name: post.frontmatter.title,
    slug: post.slug,
    full_slug: fullSlug,
    parent_id: parentId,
    content,
  });
  await sb.publishStory(record.id);

  summary.byPillar[post.pillar] = (summary.byPillar[post.pillar] ?? 0) + 1;
  summary.imported += 1;
  logRow(
    `${created ? "+" : "·"} ${fullSlug} (#${record.id}, ${post.embeddedImagePaths.length} imgs, ${isFeatured ? "FEATURED" : "—"})`
  );
}

function validateInternalLinks(
  links: { slug: string; href: string }[],
  importedSlugs: Set<string>
): {
  ok: { slug: string; href: string }[];
  broken: { slug: string; href: string }[];
} {
  const ok: { slug: string; href: string }[] = [];
  const broken: { slug: string; href: string }[] = [];
  for (const link of links) {
    // Strip leading/trailing slashes; expect /<pillar>/<slug>/
    const cleaned = link.href
      .replace(TRAILING_SLASHES_RE, "")
      .replace(LEADING_SLASHES_RE, "");
    const parts = cleaned.split("/");
    if (parts.length !== 2) {
      // Not a post URL — could be /about, /categories, etc.
      ok.push(link);
      continue;
    }
    const fullSlug = parts.join("/");
    if (importedSlugs.has(fullSlug)) {
      ok.push(link);
    } else {
      broken.push(link);
    }
  }
  return { ok, broken };
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));

  if (!flags.dryRun) {
    requireEnv("STORYBLOK_MANAGEMENT_TOKEN");
    requireEnv("STORYBLOK_SPACE_ID");
  }
  const region = process.env.STORYBLOK_REGION ?? "eu";

  // 1. Discover ---------------------------------------------------------------
  logSection("[1/5] Discovering posts in docs/resources/...");
  const { posts, errors } = discoverPosts(RESOURCES_DIR);
  for (const err of errors) {
    process.stderr.write(`  ! ${err.slug}: ${err.reason}\n`);
  }
  if (errors.length) {
    throw new Error(
      `Found ${errors.length} invalid post(s). Fix the source MDX before continuing.`
    );
  }
  logRow(`Found ${posts.length} non-draft posts.`);

  // 2. Validate labels -------------------------------------------------------
  logSection(
    "[2/5] Validating labels (every post needs ≥1 non-underscored label)..."
  );
  const labelErrors: string[] = [];
  for (const post of posts) {
    const { real } = splitLabels(post.frontmatter.labels);
    if (real.length === 0) {
      labelErrors.push(post.slug);
    }
  }
  if (labelErrors.length) {
    throw new Error(
      `Posts with no non-underscored labels: ${labelErrors.join(", ")}. Fix the source MDX before continuing.`
    );
  }
  logRow("All posts have at least one real label.");

  const summary: ImportSummary = {
    total: posts.length,
    imported: 0,
    skipped: 0,
    byPillar: {},
    unknownCategories: new Set(),
    newLabels: new Set(),
    brokenLinks: [],
    warnings: [],
  };

  if (flags.dryRun) {
    logSection("[3/5] DRY RUN — listing planned actions...");
    for (const post of posts) {
      // Surface every category/label so the operator can compare against
      // the existing post-categories / post-labels datasource entries.
      summary.unknownCategories.add(post.frontmatter.category);
      const { real } = splitLabels(post.frontmatter.labels);
      for (const label of real) {
        summary.newLabels.add(label);
      }
      summary.byPillar[post.pillar] = (summary.byPillar[post.pillar] ?? 0) + 1;
      summary.imported += 1;
      logRow(
        `· ${post.pillar}/${post.slug} (cat:${post.frontmatter.category}, labels:${real.length}, images:${post.embeddedImagePaths.length})`
      );
    }
    printSummary(summary, flags);
    return;
  }

  // 3. Open Storyblok client ------------------------------------------------
  const sb = new StoryblokManagement({
    token: requireEnv("STORYBLOK_MANAGEMENT_TOKEN"),
    spaceId: requireEnv("STORYBLOK_SPACE_ID"),
    region,
  });
  const uploader = new AssetUploader(sb);

  // Find pillar folders -----------------------------------------------------
  logSection("[3/5] Resolving pillar folder IDs...");
  const pillarFolderIds = new Map<string, number>();
  for (const pillar of ["bits", "bites", "blog"] as const) {
    const id = await findPillarFolderId(sb, pillar);
    pillarFolderIds.set(pillar, id);
    logRow(`${pillar}/ → #${id}`);
  }

  // Extend datasources with new categories + labels -------------------------
  logSection("[4/5] Extending post-categories and post-labels datasources...");
  const allCategories = new Set<string>();
  const allLabels = new Set<string>();
  for (const post of posts) {
    allCategories.add(post.frontmatter.category);
    const { real } = splitLabels(post.frontmatter.labels);
    for (const label of real) {
      allLabels.add(label);
    }
  }
  const addedCats = await ensureDatasourceEntries(
    sb,
    "post-categories",
    Array.from(allCategories).map((value) => ({ name: value, value }))
  );
  const addedLabels = await ensureDatasourceEntries(
    sb,
    "post-labels",
    Array.from(allLabels).map((value) => ({ name: value, value }))
  );
  logRow(`+${addedCats} new categories, +${addedLabels} new labels`);

  // 5. Import each post -----------------------------------------------------
  logSection("[5/5] Importing posts...");
  for (const post of posts) {
    await importOnePost(sb, uploader, pillarFolderIds, post, flags, summary);
  }

  // Validate cross-links
  const importedSlugs = new Set(posts.map((p) => `${p.pillar}/${p.slug}`));
  const { broken } = validateInternalLinks(summary.brokenLinks, importedSlugs);
  summary.brokenLinks = broken;

  printSummary(summary, flags);
}

function printSummary(summary: ImportSummary, flags: ImportFlags): void {
  process.stdout.write("\n## Import report\n\n");
  if (flags.dryRun) {
    process.stdout.write("**Mode:** dry-run (no Storyblok writes)\n\n");
  }
  process.stdout.write(`- Total posts: ${summary.total}\n`);
  process.stdout.write(`- Imported: ${summary.imported}\n`);
  process.stdout.write("- By pillar:\n");
  for (const [pillar, count] of Object.entries(summary.byPillar)) {
    process.stdout.write(`  - ${pillar}: ${count}\n`);
  }
  process.stdout.write(
    `- Unique categories encountered: ${summary.unknownCategories.size}\n`
  );
  process.stdout.write(
    `- Unique non-underscored labels encountered: ${summary.newLabels.size}\n`
  );
  if (summary.brokenLinks.length) {
    process.stdout.write(
      `- Broken internal links: ${summary.brokenLinks.length}\n`
    );
    for (const link of summary.brokenLinks.slice(0, 10)) {
      process.stdout.write(`  - ${link.slug}: ${link.href}\n`);
    }
  } else {
    process.stdout.write("- Broken internal links: 0\n");
  }
  if (summary.warnings.length) {
    process.stdout.write(
      `- Posts with conversion warnings: ${summary.warnings.length}\n`
    );
    for (const w of summary.warnings.slice(0, 5)) {
      process.stdout.write(
        `  - ${w.slug}: ${w.warnings.map((x) => x.kind).join(", ")}\n`
      );
    }
  }
  process.stdout.write("\nDone.\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nImport failed: ${message}\n`);
  process.exit(1);
});
