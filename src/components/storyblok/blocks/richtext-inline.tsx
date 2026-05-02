// Render a Storyblok richtext doc as inline React nodes for places that
// need a ReactNode rather than a full <article> block (e.g. Hero headline,
// MyRealm headline). Keeps marks (bold, italic, code) and hard breaks.

import { Fragment, type ReactNode } from "react";
import type { RichtextDoc as TypedRichtextDoc } from "./types";

interface RichtextNode {
  attrs?: Record<string, unknown>;
  content?: RichtextNode[];
  marks?: { attrs?: Record<string, unknown>; type: string }[];
  text?: string;
  type: string;
}

// Loose alias used internally; we accept the typed version from types.ts and
// cast through `unknown` once at the public-API boundary.
interface RichtextDoc {
  content?: RichtextNode[];
  type: "doc";
}

function asLooseDoc(doc?: TypedRichtextDoc): RichtextDoc | undefined {
  return doc as unknown as RichtextDoc | undefined;
}

// Allow only safe URL schemes — guards against `javascript:` / `data:`
// hrefs an editor could store in Storyblok richtext links.
const SAFE_SCHEME_RE = /^(https?:|mailto:|tel:)/i;
const HTTP_SCHEME_RE = /^https?:/i;

function safeHref(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) {
    return "#";
  }
  const trimmed = raw.trim();
  // Same-origin relative paths and fragments are always safe.
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("?")
  ) {
    return trimmed;
  }
  // For absolute URLs, only allow http/https/mailto/tel.
  if (SAFE_SCHEME_RE.test(trimmed)) {
    return trimmed;
  }
  return "#";
}

function applyMarks(text: ReactNode, marks?: RichtextNode["marks"]): ReactNode {
  if (!marks?.length) {
    return text;
  }
  let out: ReactNode = text;
  for (const mark of marks) {
    if (mark.type === "bold") {
      out = <strong>{out}</strong>;
    } else if (mark.type === "italic") {
      out = <em>{out}</em>;
    } else if (mark.type === "code") {
      out = <code>{out}</code>;
    } else if (mark.type === "link") {
      const href = safeHref(mark.attrs?.href);
      const isExternal = HTTP_SCHEME_RE.test(href);
      out = (
        <a
          href={href}
          rel={isExternal ? "noopener noreferrer" : undefined}
          target={isExternal ? "_blank" : undefined}
        >
          {out}
        </a>
      );
    }
  }
  return out;
}

function renderNode(node: RichtextNode, key: number): ReactNode {
  if (node.type === "text") {
    return (
      <Fragment key={key}>{applyMarks(node.text ?? "", node.marks)}</Fragment>
    );
  }
  if (node.type === "hard_break") {
    return <br key={key} />;
  }
  if (node.type === "paragraph") {
    return <p key={key}>{node.content?.map((c, i) => renderNode(c, i))}</p>;
  }
  // For any other block type, just unwrap children inline
  return (
    <Fragment key={key}>
      {node.content?.map((c, i) => renderNode(c, i))}
    </Fragment>
  );
}

/**
 * Render a richtext doc as inline ReactNodes (no wrapping `<article>`).
 * Returns null if no content.
 */
export function richtextToInline(input?: TypedRichtextDoc): ReactNode {
  const doc = asLooseDoc(input);
  if (!doc?.content?.length) {
    return null;
  }
  // Flatten paragraphs into inline runs with <br/> separators so a
  // multi-paragraph richtext fits inside a single heading or paragraph.
  const nodes: ReactNode[] = [];
  let counter = 0;
  const blocks = doc.content;
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (block.type === "paragraph") {
      for (const c of block.content ?? []) {
        counter += 1;
        nodes.push(renderNode(c, counter));
      }
      if (i < blocks.length - 1) {
        counter += 1;
        nodes.push(<br key={`br-${counter}`} />);
      }
    } else {
      counter += 1;
      nodes.push(renderNode(block, counter));
    }
  }
  return <>{nodes}</>;
}

/** Extract the first paragraph as plain text — useful for `string` props. */
export function richtextToString(input?: TypedRichtextDoc): string | undefined {
  const doc = asLooseDoc(input);
  if (!doc?.content?.length) {
    return;
  }
  let buf = "";
  function walk(node: RichtextNode): void {
    if (node.type === "text") {
      buf += node.text ?? "";
    }
    if (node.content) {
      for (const c of node.content) {
        walk(c);
      }
    }
  }
  for (const block of doc.content) {
    walk(block);
    buf += " ";
  }
  return buf.trim() || undefined;
}
