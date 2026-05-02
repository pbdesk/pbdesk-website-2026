// Walk docs/resources/<slug>/index.mdx, parse frontmatter + body, and
// return normalized post records ready for the Storyblok importer.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import matter from "gray-matter";
import type { Root } from "mdast";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

export type Pillar = "bits" | "bites" | "blog";

export interface MdxFrontmatter {
  category: string;
  description: string;
  draft?: boolean;
  image?: string;
  labels?: string[];
  pubDate?: string;
  related?: string[];
  title: string;
  type: string;
  updatedDate?: string;
  url?: string;
  youtubeId?: string;
}

export interface ParsedMdxPost {
  /** mdast tree of the body, parsed with remark + remark-gfm */
  ast: Root;
  /** Raw markdown body (post-frontmatter) */
  body: string;
  /** Absolute path of cover image, if frontmatter `image` is set */
  coverImagePath?: string;
  /** Absolute paths of every image referenced in the body (relative paths resolved) */
  embeddedImagePaths: string[];
  /** Path to `index.mdx` */
  filePath: string;
  /** Folder containing `index.mdx`, used to resolve relative asset paths */
  folder: string;
  /** Frontmatter (typed but raw — labels keeps underscored modifiers) */
  frontmatter: MdxFrontmatter;
  /** Lowercased trimmed `type` frontmatter; bits/bites/blog */
  pillar: Pillar;
  /** Folder name; the slug used for the Storyblok story */
  slug: string;
  /** Word count (used to compute read_time) */
  wordCount: number;
}

export interface PostValidationError {
  reason: string;
  slug: string;
}

const PILLAR_ALIAS: Record<string, Pillar> = {
  bits: "bits",
  bites: "bites",
  blog: "blog",
};

function normalizePillar(raw: string): Pillar | null {
  const trimmed = raw.replaceAll('"', "").trim().toLowerCase();
  return PILLAR_ALIAS[trimmed] ?? null;
}

const CODE_BLOCK_RE = /```[\s\S]*?```/g;
const INLINE_CODE_RE = /`[^`]*`/g;
const WHITESPACE_RE = /\s+/;
const WORD_CHAR_RE = /\w/;
const HTTP_URL_RE = /^https?:\/\//;

function countWords(markdown: string): number {
  // Strip code blocks and inline code, then split by whitespace
  const stripped = markdown
    .replaceAll(CODE_BLOCK_RE, "")
    .replaceAll(INLINE_CODE_RE, "");
  const words = stripped
    .split(WHITESPACE_RE)
    .filter((w) => WORD_CHAR_RE.test(w));
  return words.length;
}

function resolveImagePath(folder: string, src: string): string | null {
  if (HTTP_URL_RE.test(src)) {
    return null; // external image, don't try to resolve
  }
  const absolute = resolve(folder, src);
  if (!existsSync(absolute)) {
    return null;
  }
  return absolute;
}

function collectEmbeddedImages(ast: Root, folder: string): string[] {
  const paths = new Set<string>();
  visit(ast, "image", (node) => {
    const resolved = resolveImagePath(folder, node.url);
    if (resolved) {
      paths.add(resolved);
    }
  });
  return Array.from(paths);
}

function parseMdx(filePath: string): ParsedMdxPost | PostValidationError {
  const raw = readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const frontmatter = parsed.data as Partial<MdxFrontmatter>;
  const folder = dirname(filePath);
  const slug = folder.split("/").pop() ?? "";

  if (!frontmatter.type) {
    return { slug, reason: "missing frontmatter `type`" };
  }
  const pillar = normalizePillar(frontmatter.type);
  if (!pillar) {
    return {
      slug,
      reason: `unknown pillar type: ${frontmatter.type}`,
    };
  }
  if (!frontmatter.title) {
    return { slug, reason: "missing frontmatter `title`" };
  }
  if (!frontmatter.description) {
    return { slug, reason: "missing frontmatter `description`" };
  }
  if (!frontmatter.category) {
    return { slug, reason: "missing frontmatter `category`" };
  }

  const ast = remark().use(remarkParse).use(remarkGfm).parse(parsed.content);

  const coverImagePath = frontmatter.image
    ? (resolveImagePath(folder, frontmatter.image) ?? undefined)
    : undefined;

  const embeddedImagePaths = collectEmbeddedImages(ast, folder);
  const wordCount = countWords(parsed.content);

  return {
    slug,
    pillar,
    filePath,
    folder,
    frontmatter: {
      type: frontmatter.type,
      title: frontmatter.title,
      description: frontmatter.description,
      image: frontmatter.image,
      url: frontmatter.url,
      youtubeId: frontmatter.youtubeId,
      category: frontmatter.category,
      labels: frontmatter.labels ?? [],
      draft: frontmatter.draft ?? false,
      pubDate: frontmatter.pubDate,
      updatedDate: frontmatter.updatedDate,
      related: frontmatter.related ?? [],
    },
    body: parsed.content,
    ast,
    embeddedImagePaths,
    coverImagePath,
    wordCount,
  };
}

export interface DiscoverResult {
  errors: PostValidationError[];
  posts: ParsedMdxPost[];
}

export function discoverPosts(resourcesDir: string): DiscoverResult {
  const posts: ParsedMdxPost[] = [];
  const errors: PostValidationError[] = [];

  const entries = readdirSync(resourcesDir);
  for (const name of entries) {
    const folderPath = join(resourcesDir, name);
    const stat = statSync(folderPath);
    if (!stat.isDirectory()) {
      continue;
    }
    const indexPath = join(folderPath, "index.mdx");
    if (!existsSync(indexPath)) {
      errors.push({ slug: name, reason: "no index.mdx in folder" });
      continue;
    }
    const result = parseMdx(indexPath);
    if ("reason" in result) {
      errors.push(result);
    } else if (result.frontmatter.draft) {
      // intentionally skipped, not an error
    } else {
      posts.push(result);
    }
  }

  return { posts, errors };
}

export function readTimeFromWordCount(words: number, wpm = 200): string {
  const minutes = Math.max(1, Math.round(words / wpm));
  return `${minutes} min read`;
}

export function isUnderscoredLabel(label: string): boolean {
  return label.startsWith("_");
}

export function splitLabels(labels: string[] | undefined): {
  modifiers: string[];
  real: string[];
} {
  const modifiers: string[] = [];
  const real: string[] = [];
  for (const label of labels ?? []) {
    if (isUnderscoredLabel(label)) {
      modifiers.push(label);
    } else {
      real.push(label);
    }
  }
  return { modifiers, real };
}

// Deterministic gradient assignment from slug — keeps the seed stable.
const GRADIENTS = [
  "post-grad-indigo",
  "post-grad-blue",
  "post-grad-emerald",
  "post-grad-red",
  "post-grad-rose",
  "post-grad-orange",
  "post-grad-teal",
  "post-grad-violet",
  "post-grad-amber",
] as const;

export function gradientForSlug(slug: string): string {
  // Simple deterministic hash; Math.trunc keeps it a 32-bit-ish integer
  // without using bitwise operators (Biome rule).
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = Math.trunc(h * 31 + slug.charCodeAt(i)) % 2_147_483_647;
  }
  const idx = Math.abs(h) % GRADIENTS.length;
  return GRADIENTS[idx];
}
