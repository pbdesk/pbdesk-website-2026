#!/usr/bin/env bun
// Posts/scripts/create-post.ts
//
// Create an UNPUBLISHED `post` story in Storyblok from a local post folder.
//
// Usage:
//   bun run Posts/scripts/create-post.ts "Bits/ecc-plugin-supercharge-ai-agents"
//   bun run Posts/scripts/create-post.ts "Bits/ecc-plugin-supercharge-ai-agents" --dry-run
//
// The argument is a path relative to the `Posts/` folder. The folder must
// contain:
//   - post.md   : first H1 is the title; the rest becomes the richtext body
//   - meta.md   : excerpt, category, labels, and SEO bundle (section headers)
//   - banner.*  : cover image (png/jpg/jpeg/webp/avif/gif), uploaded as asset
//
// Behavior:
//   - uploads the banner to Storyblok assets (idempotent, SHA-1 cached)
//   - converts post.md body to Storyblok richtext
//   - extends the post-categories / post-labels datasources with new values
//   - creates the story at <pillar>/<slug> WITHOUT publishing (publish: 0)
//   - re-running updates the existing draft; it is never published
//
// Env (read from .env.local by Bun): STORYBLOK_MANAGEMENT_TOKEN,
// STORYBLOK_SPACE_ID, optional STORYBLOK_REGION.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Heading, Root, RootContent } from "mdast";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { AssetUploader } from "../../scripts/lib/asset-uploader";
import {
  type ConversionContext,
  mdastToStoryblokRichtext,
} from "../../scripts/lib/mdast-to-storyblok";
import { gradientForSlug } from "../../scripts/lib/mdx-importer";
import {
  type SbStoryContent,
  StoryblokManagement,
} from "../../scripts/lib/storyblok-management";

const POSTS_DIR = resolve(process.cwd(), "Posts");
const ASSET_FOLDER_NAME = "Posts";
const PILLARS = ["bits", "bites", "blog"] as const;
type Pillar = (typeof PILLARS)[number];

const BANNER_RE = /^banner\.(png|jpe?g|webp|avif|gif)$/i;
const HEADING_LEVEL_ONE = 1;
const WHITESPACE_RE = /\s+/;
const BULLET_RE = /^[-*]\s+/;
// Markdown horizontal rule: 3+ of the same -, *, or _. Used as a section
// separator in meta.md, so it must never leak into a section's body.
const HR_RE = /^\s*([-*_])\1{2,}\s*$/;
const SECTION_RE = /^##\s+(.+?)\s*$/;
const BOLD_LABEL_RE = /^\*\*(.+?):\*\*\s*(.*)$/;
const NON_ALNUM_RE = /[^a-z0-9]+/g;

interface MetaInfo {
  category: string;
  excerpt: string;
  keywords?: string;
  labels: string[];
  seoDescription?: string;
  seoTitle?: string;
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

function uid(): string {
  return crypto.randomUUID();
}

// Storyblok datetime fields use "YYYY-MM-DD HH:mm" (space-separated, local).
function todayDateTime(): string {
  const now = new Date();
  const pad = (value: number): string => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function normalizeKey(raw: string): string {
  return raw.toLowerCase().replaceAll(NON_ALNUM_RE, " ").trim();
}

// Concatenate the visible text of a heading's inline children.
function headingText(node: Heading): string {
  let out = "";
  function walk(child: { type: string; value?: string; children?: unknown[] }): void {
    if (typeof child.value === "string") {
      out += child.value;
      return;
    }
    if (Array.isArray(child.children)) {
      for (const grandchild of child.children) {
        walk(grandchild as { type: string; value?: string; children?: unknown[] });
      }
    }
  }
  walk(node as unknown as { type: string; children?: unknown[] });
  return out.trim();
}

// Pull the first H1 out of the AST (mutating it) and return its text. The
// title lives in its own story field, so leaving it in the body would
// duplicate it on the rendered page.
function extractTitle(ast: Root): string | null {
  const index = ast.children.findIndex(
    (node) => node.type === "heading" && node.depth === HEADING_LEVEL_ONE
  );
  if (index === -1) {
    return null;
  }
  const title = headingText(ast.children[index] as Heading);
  ast.children.splice(index, 1);
  return title || null;
}

// Split a markdown doc into a map of normalized "## section" header -> body.
function splitSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  let current: string | null = null;
  let buffer: string[] = [];
  const flush = (): void => {
    if (current) {
      sections.set(current, buffer.join("\n").trim());
    }
    buffer = [];
  };
  for (const line of markdown.split("\n")) {
    const match = line.match(SECTION_RE);
    if (match) {
      flush();
      current = normalizeKey(match[1]);
    } else if (current && !HR_RE.test(line)) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function firstNonEmptyLine(text: string): string {
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return "";
}

function parseLabels(section: string): string[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => BULLET_RE.test(line))
    .map((line) => line.replace(BULLET_RE, "").trim())
    .filter(Boolean);
}

// Parse a "**Label:**" delimited block into a key->value map.
function parseBoldLabeled(section: string): Map<string, string> {
  const fields = new Map<string, string>();
  let key: string | null = null;
  let buffer: string[] = [];
  const flush = (): void => {
    if (key) {
      fields.set(key, buffer.join("\n").trim());
    }
    buffer = [];
  };
  for (const line of section.split("\n")) {
    const match = line.match(BOLD_LABEL_RE);
    if (match) {
      flush();
      key = normalizeKey(match[1]);
      if (match[2].trim()) {
        buffer.push(match[2].trim());
      }
    } else if (key) {
      buffer.push(line);
    }
  }
  flush();
  return fields;
}

function getSection(
  sections: Map<string, string>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = sections.get(key);
    if (value) {
      return value;
    }
  }
  return undefined;
}

function parseMeta(markdown: string): MetaInfo {
  const sections = splitSections(markdown);

  const excerptRaw = getSection(sections, "excerpt");
  if (!excerptRaw) {
    throw new Error("meta.md is missing an `## Excerpt` section.");
  }
  const excerpt = excerptRaw.split(WHITESPACE_RE).join(" ").trim();

  const categoryRaw = getSection(sections, "category");
  if (!categoryRaw) {
    throw new Error("meta.md is missing a `## Category` section.");
  }
  const category = firstNonEmptyLine(categoryRaw);

  const labelsRaw = getSection(
    sections,
    "labels tags",
    "labels",
    "tags",
    "labels and tags"
  );
  const labels = labelsRaw ? parseLabels(labelsRaw) : [];
  if (labels.length === 0) {
    throw new Error("meta.md `## Labels / Tags` produced no labels.");
  }

  const seoSection = getSection(sections, "seo bundle", "seo");
  const seo = seoSection ? parseBoldLabeled(seoSection) : new Map();

  return {
    excerpt,
    category,
    labels,
    seoTitle: seo.get("seo title") || undefined,
    seoDescription: seo.get("meta description") || undefined,
    keywords: seo.get("keywords") || undefined,
  };
}

function findBanner(folder: string): string | null {
  const match = readdirSync(folder).find((name) => BANNER_RE.test(name));
  return match ? join(folder, match) : null;
}

interface SourcePost {
  ast: Root;
  banner: string | null;
  meta: MetaInfo;
  pillar: Pillar;
  slug: string;
  title: string;
}

function loadSourcePost(relativePath: string): SourcePost {
  const cleaned = relativePath.replace(/^\/+|\/+$/g, "");
  const segments = cleaned.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error(
      `Expected a path like "Bits/<slug>", received "${relativePath}".`
    );
  }
  const pillar = segments[0].toLowerCase() as Pillar;
  if (!PILLARS.includes(pillar)) {
    throw new Error(
      `Unknown pillar "${segments[0]}". Expected one of: ${PILLARS.join(", ")}.`
    );
  }
  const slug = segments.at(-1) as string;
  const folder = resolve(POSTS_DIR, ...segments);
  if (!existsSync(folder)) {
    throw new Error(`Folder not found: ${folder}`);
  }

  const postPath = join(folder, "post.md");
  const metaPath = join(folder, "meta.md");
  if (!existsSync(postPath)) {
    throw new Error(`Missing post.md in ${folder}`);
  }
  if (!existsSync(metaPath)) {
    throw new Error(`Missing meta.md in ${folder}`);
  }

  const postRaw = readFileSync(postPath, "utf8");
  const ast = remark().use(remarkParse).use(remarkGfm).parse(postRaw) as Root;
  const title = extractTitle(ast);
  if (!title) {
    throw new Error("post.md must start with an H1 (`# Title`).");
  }

  const meta = parseMeta(readFileSync(metaPath, "utf8"));
  const banner = findBanner(folder);

  return { pillar, slug, title, ast, meta, banner };
}

async function ensureDatasourceEntries(
  sb: StoryblokManagement,
  datasourceSlug: string,
  values: string[]
): Promise<number> {
  const datasources = await sb.listDatasources();
  const target = datasources.find((d) => d.slug === datasourceSlug);
  if (!target) {
    throw new Error(
      `Datasource "${datasourceSlug}" not found. Run the seed script first.`
    );
  }
  const existing = new Set(
    (await sb.listDatasourceEntries(target.id)).map((entry) => entry.value)
  );
  let added = 0;
  for (const value of values) {
    if (existing.has(value)) {
      continue;
    }
    await sb.upsertDatasourceEntry(target.id, { name: value, value });
    added += 1;
  }
  return added;
}

// Full Storyblok asset-field shape. Providing only {id, filename} leaves the
// asset detached in the editor UI, so include the empty companion fields and
// the `fieldtype` discriminator Storyblok stores natively.
interface AssetRef {
  alt: string;
  copyright: string;
  fieldtype: "asset";
  filename: string;
  focus: string;
  id: number;
  is_external_url: boolean;
  name: string;
  title: string;
}

function toAssetRef(
  id: number,
  filename: string,
  alt: string
): AssetRef {
  return {
    id,
    filename,
    alt,
    name: "",
    title: "",
    focus: "",
    copyright: "",
    fieldtype: "asset",
    is_external_url: false,
  };
}

function buildContent(
  source: SourcePost,
  banner: AssetRef | undefined
): { content: SbStoryContent; warnings: { kind: string }[] } {
  const ctx: ConversionContext = { imageMap: new Map(), warnings: [] };
  const body = mdastToStoryblokRichtext(source.ast, ctx);

  const seoBlok: SbStoryContent = {
    _uid: uid(),
    component: "seo",
    title: source.meta.seoTitle ?? "",
    description: source.meta.seoDescription ?? "",
    keywords: source.meta.keywords ?? "",
  };
  if (banner) {
    seoBlok.og_image = banner;
  }

  const content: SbStoryContent = {
    component: "post",
    title: source.title,
    excerpt: source.meta.excerpt,
    category: source.meta.category,
    labels: source.meta.labels,
    pillar: source.pillar,
    gradient: gradientForSlug(source.slug),
    read_time: "",
    featured: false,
    cover_image: banner,
    body,
    published_at: todayDateTime(),
    author: "Pinal Bhatt",
    related: [],
    seo: [seoBlok],
  };
  return { content, warnings: ctx.warnings };
}

function write(line: string): void {
  process.stdout.write(`${line}\n`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const target = args.find((arg) => !arg.startsWith("--"));
  if (!target) {
    throw new Error(
      'Pass a post path, e.g. bun run Posts/scripts/create-post.ts "Bits/my-slug"'
    );
  }

  const source = loadSourcePost(target);
  write("");
  write(`Post:     ${source.pillar}/${source.slug}`);
  write(`Title:    ${source.title}`);
  write(`Category: ${source.meta.category}`);
  write(`Excerpt:  ${source.meta.excerpt}`);
  write(`Labels:   ${source.meta.labels.join(", ")}`);
  write(`Gradient: ${gradientForSlug(source.slug)}`);
  write(`Banner:   ${source.banner ?? "(none found)"}`);
  write(`SEO:      ${source.meta.seoTitle ?? "(no seo title)"}`);

  if (dryRun) {
    write("\nDRY RUN — no Storyblok writes performed.\n");
    return;
  }

  const region = process.env.STORYBLOK_REGION ?? "eu";
  const sb = new StoryblokManagement({
    token: requireEnv("STORYBLOK_MANAGEMENT_TOKEN"),
    spaceId: requireEnv("STORYBLOK_SPACE_ID"),
    region,
  });

  const folder = await sb.findFolderByFullSlug(source.pillar);
  if (!folder) {
    throw new Error(
      `Pillar folder "${source.pillar}/" not found in Storyblok. Run the seed script first.`
    );
  }

  let banner: AssetRef | undefined;
  if (source.banner) {
    const assetFolder = await sb.findOrCreateAssetFolder(ASSET_FOLDER_NAME);
    const uploader = new AssetUploader(sb);
    const uploaded = await uploader.upload(source.banner, assetFolder.id);
    banner = toAssetRef(uploaded.id, uploaded.filename, source.title);
    write(
      `\nBanner ${uploaded.fromCache ? "cached" : "uploaded"} to "${ASSET_FOLDER_NAME}/": ${uploaded.filename}`
    );
  }

  const addedCats = await ensureDatasourceEntries(sb, "post-categories", [
    source.meta.category,
  ]);
  const addedLabels = await ensureDatasourceEntries(
    sb,
    "post-labels",
    source.meta.labels
  );
  write(`Datasources: +${addedCats} category, +${addedLabels} labels`);

  const { content, warnings } = buildContent(source, banner);

  const fullSlug = `${source.pillar}/${source.slug}`;
  const { record, created } = await sb.upsertStory({
    name: source.title,
    slug: source.slug,
    full_slug: fullSlug,
    parent_id: folder.id,
    content,
  });

  write(
    `\n${created ? "Created" : "Updated"} draft story #${record.id} at ${fullSlug} (unpublished).`
  );
  if (warnings.length) {
    write(
      `Conversion warnings (${warnings.length}): ${warnings.map((w) => w.kind).join(", ")}`
    );
  }
  write("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nFailed: ${message}\n`);
  process.exit(1);
});
