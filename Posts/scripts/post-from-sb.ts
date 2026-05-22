#!/usr/bin/env bun
// Posts/scripts/post-from-sb.ts
//
// Pull a `post` story DOWN from Storyblok into a local post folder. This is
// the inverse of create-post.ts: it reads the draft content for a slug and
// writes post.md, meta.md, and banner.<ext> so the pair round-trips.
//
// Usage:
//   bun run Posts/scripts/post-from-sb.ts "bits/grid-garden"
//
// Output (slug is the last path segment; folder name matches it so
// create-post.ts can re-import it):
//   Posts/Bits/grid-garden/post.md     # "# <title>" + body as markdown
//   Posts/Bits/grid-garden/meta.md     # excerpt, category, labels, SEO
//   Posts/Bits/grid-garden/banner.<ext># downloaded cover image
//
// Env (read from .env.local by Bun): STORYBLOK_MANAGEMENT_TOKEN,
// STORYBLOK_SPACE_ID, optional STORYBLOK_REGION.

import { mkdirSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import type {
  SbRichtextDoc,
  SbRichtextMark,
  SbRichtextNode,
} from "../../scripts/lib/mdast-to-storyblok";
import { StoryblokManagement } from "../../scripts/lib/storyblok-management";

const POSTS_DIR = resolve(process.cwd(), "Posts");
const PILLAR_FOLDER = {
  bits: "Bits",
  bites: "Bites",
  blog: "Blog",
} as const;
type Pillar = keyof typeof PILLAR_FOLDER;

const PROTOCOL_RELATIVE_RE = /^\/\//;
const LANGUAGE_CLASS_PREFIX = "language-";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required. Add it to .env.local or export it before running.`
    );
  }
  return value;
}

function attrString(
  node: SbRichtextNode,
  key: string,
  fallback = ""
): string {
  const value = node.attrs?.[key];
  return typeof value === "string" ? value : fallback;
}

// ---------------------------------------------------------------------------
// Richtext (ProseMirror-flavoured) -> Markdown. Mirrors mdast-to-storyblok.ts.
// ---------------------------------------------------------------------------

function applyMarks(text: string, marks?: SbRichtextMark[]): string {
  if (!marks?.length) {
    return text;
  }
  let result = text;
  const has = (type: SbRichtextMark["type"]): boolean =>
    marks.some((mark) => mark.type === type);
  // Innermost to outermost so the link wraps the styled text.
  if (has("code")) {
    result = `\`${result}\``;
  }
  if (has("italic")) {
    result = `*${result}*`;
  }
  if (has("bold")) {
    result = `**${result}**`;
  }
  if (has("strike")) {
    result = `~~${result}~~`;
  }
  const link = marks.find((mark) => mark.type === "link");
  if (link) {
    const href =
      (link.attrs?.href as string | undefined) ??
      (link.attrs?.url as string | undefined) ??
      "";
    result = `[${result}](${href})`;
  }
  return result;
}

function inlineToMarkdown(nodes: SbRichtextNode[] | undefined): string {
  if (!nodes) {
    return "";
  }
  let out = "";
  for (const node of nodes) {
    out += inlineNodeToMarkdown(node);
  }
  return out;
}

function inlineNodeToMarkdown(node: SbRichtextNode): string {
  switch (node.type) {
    case "text":
      return applyMarks(node.text ?? "", node.marks);
    case "hard_break":
      return "  \n";
    case "image":
      return `![${attrString(node, "alt")}](${attrString(node, "src")})`;
    default:
      return inlineToMarkdown(node.content);
  }
}

function listToMarkdown(
  node: SbRichtextNode,
  ordered: boolean,
  depth: number
): string {
  const items = node.content ?? [];
  return items
    .map((item, index) => listItemToMarkdown(item, ordered, index + 1, depth))
    .join("\n");
}

function listItemToMarkdown(
  item: SbRichtextNode,
  ordered: boolean,
  index: number,
  depth: number
): string {
  const indent = "  ".repeat(depth);
  const marker = ordered ? `${index}.` : "-";
  const parts: string[] = [];
  for (const child of item.content ?? []) {
    if (child.type === "bullet_list" || child.type === "ordered_list") {
      parts.push(
        listToMarkdown(child, child.type === "ordered_list", depth + 1)
      );
    } else {
      parts.push(blockToMarkdown(child, depth));
    }
  }
  const [first, ...rest] = parts;
  let line = `${indent}${marker} ${first ?? ""}`;
  if (rest.length) {
    line += `\n${rest.join("\n")}`;
  }
  return line;
}

function blockquoteToMarkdown(node: SbRichtextNode, depth: number): string {
  const inner = (node.content ?? [])
    .map((child) => blockToMarkdown(child, depth))
    .join("\n\n");
  return inner
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n");
}

function codeBlockToMarkdown(node: SbRichtextNode): string {
  const cls = attrString(node, "class");
  const lang = cls.startsWith(LANGUAGE_CLASS_PREFIX)
    ? cls.slice(LANGUAGE_CLASS_PREFIX.length)
    : "";
  const text = (node.content ?? []).map((child) => child.text ?? "").join("");
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

function blockToMarkdown(node: SbRichtextNode, depth: number): string {
  switch (node.type) {
    case "paragraph":
      return inlineToMarkdown(node.content);
    case "heading":
      return `${"#".repeat((node.attrs?.level as number) ?? 1)} ${inlineToMarkdown(node.content)}`;
    case "bullet_list":
      return listToMarkdown(node, false, depth);
    case "ordered_list":
      return listToMarkdown(node, true, depth);
    case "blockquote":
      return blockquoteToMarkdown(node, depth);
    case "code_block":
      return codeBlockToMarkdown(node);
    case "horizontal_rule":
      return "---";
    case "image":
      return `![${attrString(node, "alt")}](${attrString(node, "src")})`;
    default:
      return inlineToMarkdown(node.content);
  }
}

function richtextToMarkdown(doc: SbRichtextDoc | undefined): string {
  if (!doc?.content?.length) {
    return "";
  }
  return doc.content
    .map((block) => blockToMarkdown(block, 0))
    .join("\n\n")
    .trim();
}

// ---------------------------------------------------------------------------
// Content extraction + file builders
// ---------------------------------------------------------------------------

interface SeoInfo {
  description: string;
  keywords: string;
  title: string;
}

interface PostData {
  body: SbRichtextDoc | undefined;
  category: string;
  coverUrl: string | null;
  excerpt: string;
  gradient: string;
  labels: string[];
  seo: SeoInfo;
  title: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function extractPost(content: Record<string, unknown>): PostData {
  const labels = Array.isArray(content.labels)
    ? content.labels.filter((l): l is string => typeof l === "string")
    : [];

  const cover = asRecord(content.cover_image);
  const coverUrl = str(cover.filename) || null;

  const seoArr = Array.isArray(content.seo) ? content.seo : [];
  const seoBlok = asRecord(seoArr[0]);

  return {
    title: str(content.title),
    excerpt: str(content.excerpt),
    category: str(content.category),
    labels,
    gradient: str(content.gradient),
    coverUrl,
    body: content.body as SbRichtextDoc | undefined,
    seo: {
      title: str(seoBlok.title),
      description: str(seoBlok.description),
      keywords: str(seoBlok.keywords),
    },
  };
}

function buildPostMd(post: PostData): string {
  const body = richtextToMarkdown(post.body);
  return `# ${post.title}\n\n${body}\n`;
}

function buildMetaMd(post: PostData): string {
  const lines: string[] = [`# Meta — ${post.title}`, ""];
  const section = (heading: string, body: string[]): void => {
    lines.push(`## ${heading}`, "", ...body, "", "---", "");
  };

  section("Excerpt", [post.excerpt]);
  section("Category", [post.category]);
  section(
    "Labels / Tags",
    post.labels.map((label) => `- ${label}`)
  );
  if (post.gradient) {
    section("Gradient Background", [post.gradient]);
  }

  lines.push(
    "## SEO Bundle",
    "",
    "**SEO Title:**",
    post.seo.title,
    "",
    "**Meta Description:**",
    post.seo.description,
    "",
    "**Keywords:**",
    post.seo.keywords
  );

  return `${lines.join("\n").trimEnd()}\n`;
}

async function downloadBanner(
  url: string,
  destFolder: string
): Promise<string> {
  const normalized = url.replace(PROTOCOL_RELATIVE_RE, "https://");
  const res = await fetch(normalized);
  if (!res.ok) {
    throw new Error(`Failed to download banner: ${res.status} ${normalized}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = extname(new URL(normalized).pathname) || ".png";
  const dest = join(destFolder, `banner${ext}`);
  writeFileSync(dest, buffer);
  return dest;
}

function write(line: string): void {
  process.stdout.write(`${line}\n`);
}

function parseTarget(raw: string): { fullSlug: string; pillar: Pillar; slug: string } {
  const cleaned = raw.replace(/^\/+|\/+$/g, "");
  const segments = cleaned.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error(
      `Expected a slug like "bits/<slug>", received "${raw}".`
    );
  }
  const pillar = segments[0].toLowerCase() as Pillar;
  if (!(pillar in PILLAR_FOLDER)) {
    throw new Error(
      `Unknown pillar "${segments[0]}". Expected one of: ${Object.keys(PILLAR_FOLDER).join(", ")}.`
    );
  }
  const slug = segments.at(-1) as string;
  return { pillar, slug, fullSlug: `${pillar}/${slug}` };
}

async function main(): Promise<void> {
  const target = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!target) {
    throw new Error(
      'Pass a story slug, e.g. bun run Posts/scripts/post-from-sb.ts "bits/grid-garden"'
    );
  }

  const { pillar, slug, fullSlug } = parseTarget(target);
  const region = process.env.STORYBLOK_REGION ?? "eu";
  const sb = new StoryblokManagement({
    token: requireEnv("STORYBLOK_MANAGEMENT_TOKEN"),
    spaceId: requireEnv("STORYBLOK_SPACE_ID"),
    region,
  });

  const found = await sb.findStoryBySlug(fullSlug);
  if (!found) {
    throw new Error(`Story not found in Storyblok: ${fullSlug}`);
  }
  const story = await sb.getStory(found.id);
  const content = asRecord(story.content);
  if (content.component !== "post") {
    throw new Error(
      `Story ${fullSlug} is a "${str(content.component)}", not a post.`
    );
  }

  const post = extractPost(content);
  const destFolder = resolve(POSTS_DIR, PILLAR_FOLDER[pillar], slug);
  mkdirSync(destFolder, { recursive: true });

  writeFileSync(join(destFolder, "post.md"), buildPostMd(post));
  writeFileSync(join(destFolder, "meta.md"), buildMetaMd(post));

  let bannerPath: string | null = null;
  if (post.coverUrl) {
    bannerPath = await downloadBanner(post.coverUrl, destFolder);
  }

  write("");
  write(`Pulled:   ${fullSlug} (story #${found.id})`);
  write(`Title:    ${post.title}`);
  write(`Folder:   ${destFolder}`);
  write("Wrote:    post.md, meta.md");
  write(`Banner:   ${bannerPath ?? "(no cover image on story)"}`);
  write("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nFailed: ${message}\n`);
  process.exit(1);
});
