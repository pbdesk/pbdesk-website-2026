# Graphify: Turn Your Codebase Into a Knowledge Graph

Ever spent an afternoon grepping through files just to figure out how one service talks to another? Graphify fixes that. It's an open-source tool that turns your code, docs, schemas, and even diagrams into a queryable knowledge graph your AI coding assistant can actually navigate.

## What it is

Graphify is a skill for AI coding assistants like Claude Code, Cursor, Codex, and Gemini CLI. Point it at a folder and it builds an interactive map of how everything connects: functions, modules, database tables, and documentation, all in one place. It's MIT licensed and maintained by Safi Shamsi.

## The problem it solves

RAG-style code search finds files that look similar. It doesn't understand structure. Graphify maps the actual relationships, so you can ask "what breaks if I change this function" and get a real answer instead of a pile of fuzzy matches. No more manual file archaeology.

## How it works

Code is parsed locally with tree-sitter, so your source never leaves your machine. Docs, PDFs, and images go to whichever LLM you've configured for semantic analysis. Graphify then clusters everything with Leiden community detection, ranks the important nodes, and tags each relationship as EXTRACTED, INFERRED, or AMBIGUOUS so you know how much to trust it.

You get three outputs: an interactive `graph.html`, a `GRAPH_REPORT.md` with highlights, and a `graph.json` you can query.

## Setup

You need Python 3.10+ and pip (or pipx/uv).

```bash
pip install graphifyy
graphify install
```

Then run it from inside your IDE:

```bash
/graphify .
```

## Keeping it updated

Re-extract only the files that changed:

```bash
graphify --update
```

Want it automatic? Install the git hook so the graph rebuilds on every commit. It's AST-only, so there's no API cost:

```bash
graphify hook install
```

Commit the `graphify-out/` folder to version control and your whole team inherits the same graph. One map, always current.
