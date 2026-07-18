/** biome-ignore-all lint/suspicious/noUnnecessaryConditions: Biome cannot resolve the mdast node types from node_modules and wrongly marks every switch case as unreachable. */
// Convert a markdown AST (mdast) into Storyblok's ProseMirror-flavoured
// richtext JSON. Covers everything we expect to see in docs/resources/:
// paragraphs, headings (h1-h6), bold/italic, links, inline code, lists,
// blockquotes, code blocks, images, thematic breaks. Unknown nodes are
// reported via the `warnings` accumulator so the importer can surface them.

import type {
  Blockquote,
  Code,
  Emphasis,
  Heading,
  InlineCode,
  Link,
  List,
  ListItem,
  Image as MdastImage,
  Paragraph,
  Root,
  RootContent,
  Strong,
  Text,
  ThematicBreak,
} from "mdast";

export interface SbRichtextMark {
  attrs?: Record<string, unknown>;
  type: "bold" | "italic" | "link" | "code" | "strike" | "underline";
}

export interface SbRichtextNode {
  attrs?: Record<string, unknown>;
  content?: SbRichtextNode[];
  marks?: SbRichtextMark[];
  text?: string;
  type: string;
}

export interface SbRichtextDoc {
  content: SbRichtextNode[];
  type: "doc";
}

export interface ConversionWarning {
  detail?: string;
  kind: string;
}

export interface ConversionContext {
  // Map from local path (relative or absolute) -> a.storyblok.com URL
  imageMap: Map<string, string>;
  warnings: ConversionWarning[];
}

function asText(text: string, marks?: SbRichtextMark[]): SbRichtextNode {
  const node: SbRichtextNode = { text, type: "text" };
  if (marks?.length) {
    node.marks = marks;
  }
  return node;
}

function inlineNodes(
  nodes: RootContent[] | undefined,
  ctx: ConversionContext,
  marks: SbRichtextMark[] = []
): SbRichtextNode[] {
  if (!nodes) {
    return [];
  }
  const out: SbRichtextNode[] = [];
  for (const node of nodes) {
    out.push(...convertInline(node, ctx, marks));
  }
  return out;
}

function convertInline(
  node: RootContent,
  ctx: ConversionContext,
  marks: SbRichtextMark[]
): SbRichtextNode[] {
  switch (node.type) {
    case "text":
      return [asText((node as Text).value, marks.length ? marks : undefined)];
    case "strong":
      return inlineNodes((node as Strong).children as RootContent[], ctx, [
        ...marks,
        { type: "bold" },
      ]);
    case "emphasis":
      return inlineNodes((node as Emphasis).children as RootContent[], ctx, [
        ...marks,
        { type: "italic" },
      ]);
    case "inlineCode":
      return [asText((node as InlineCode).value, [...marks, { type: "code" }])];
    case "link": {
      const link = node as Link;
      const linkMark: SbRichtextMark = {
        attrs: {
          anchor: null,
          custom: {},
          href: link.url,
          linktype: link.url.startsWith("http") ? "url" : "story",
          target: link.url.startsWith("http") ? "_blank" : "_self",
          uuid: null,
        },
        type: "link",
      };
      return inlineNodes(link.children as RootContent[], ctx, [
        ...marks,
        linkMark,
      ]);
    }
    case "image": {
      const img = node as MdastImage;
      const resolved = ctx.imageMap.get(img.url) ?? img.url;
      return [
        {
          attrs: {
            alt: img.alt ?? "",
            src: resolved,
            title: img.title ?? null,
          },
          type: "image",
        },
      ];
    }
    case "break":
      return [{ type: "hard_break" }];
    default:
      ctx.warnings.push({
        detail: node.type,
        kind: "unknown_inline",
      });
      return [];
  }
}

function convertParagraph(
  node: Paragraph,
  ctx: ConversionContext
): SbRichtextNode {
  return {
    content: inlineNodes(node.children as RootContent[], ctx),
    type: "paragraph",
  };
}

function convertHeading(node: Heading, ctx: ConversionContext): SbRichtextNode {
  return {
    attrs: { level: node.depth },
    content: inlineNodes(node.children as RootContent[], ctx),
    type: "heading",
  };
}

function convertList(node: List, ctx: ConversionContext): SbRichtextNode {
  const isOrdered = node.ordered === true;
  return {
    attrs: isOrdered ? { order: node.start ?? 1 } : undefined,
    content: node.children.map((child) =>
      convertListItem(child as ListItem, ctx)
    ),
    type: isOrdered ? "ordered_list" : "bullet_list",
  };
}

function convertListItem(
  node: ListItem,
  ctx: ConversionContext
): SbRichtextNode {
  return {
    content: node.children.map((child) =>
      convertBlock(child as RootContent, ctx)
    ),
    type: "list_item",
  };
}

function convertBlockquote(
  node: Blockquote,
  ctx: ConversionContext
): SbRichtextNode {
  return {
    content: node.children.map((child) =>
      convertBlock(child as RootContent, ctx)
    ),
    type: "blockquote",
  };
}

function convertCode(node: Code): SbRichtextNode {
  return {
    attrs: { class: node.lang ? `language-${node.lang}` : undefined },
    content: [{ text: node.value, type: "text" }],
    type: "code_block",
  };
}

function convertImageBlock(
  node: MdastImage,
  ctx: ConversionContext
): SbRichtextNode {
  const resolved = ctx.imageMap.get(node.url) ?? node.url;
  return {
    content: [
      {
        attrs: {
          alt: node.alt ?? "",
          src: resolved,
          title: node.title ?? null,
        },
        type: "image",
      },
    ],
    type: "paragraph",
  };
}

function convertHorizontalRule(_node: ThematicBreak): SbRichtextNode {
  return { type: "horizontal_rule" };
}

function convertBlock(
  node: RootContent,
  ctx: ConversionContext
): SbRichtextNode {
  switch (node.type) {
    case "paragraph":
      return convertParagraph(node as Paragraph, ctx);
    case "heading":
      return convertHeading(node as Heading, ctx);
    case "list":
      return convertList(node as List, ctx);
    case "blockquote":
      return convertBlockquote(node as Blockquote, ctx);
    case "code":
      return convertCode(node as Code);
    case "image":
      return convertImageBlock(node as MdastImage, ctx);
    case "thematicBreak":
      return convertHorizontalRule(node as ThematicBreak);
    case "html":
      ctx.warnings.push({
        detail: (node as { value: string }).value.slice(0, 80),
        kind: "raw_html",
      });
      // Surface it as a paragraph so content isn't silently dropped
      return {
        content: [{ text: (node as { value: string }).value, type: "text" }],
        type: "paragraph",
      };
    default:
      ctx.warnings.push({ detail: node.type, kind: "unknown_block" });
      return { content: [], type: "paragraph" };
  }
}

export function mdastToStoryblokRichtext(
  root: Root,
  ctx: ConversionContext
): SbRichtextDoc {
  return {
    content: root.children.map((child) =>
      convertBlock(child as RootContent, ctx)
    ),
    type: "doc",
  };
}

// Walk a richtext doc and report any internal links so the importer can
// validate them against the actually-imported slug set.
export function collectInternalLinks(doc: SbRichtextDoc): string[] {
  const out: string[] = [];
  function walk(node: SbRichtextNode): void {
    if (node.marks) {
      for (const mark of node.marks) {
        const href = mark.attrs?.href;
        if (
          mark.type === "link" &&
          typeof href === "string" &&
          href.startsWith("/")
        ) {
          out.push(href);
        }
      }
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }
  for (const node of doc.content) {
    walk(node);
  }
  return out;
}
