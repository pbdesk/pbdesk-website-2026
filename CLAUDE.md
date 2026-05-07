# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## First Rules

- This project uses Bun, not Node. Always use `bun run` and `bun x` (never `npm` or `yarn`).
- Next.js 16 has breaking changes from older versions. Read `node_modules/next/dist/docs/` for current APIs before editing framework code.
- Follow `AGENTS.md` for Ultracite/Biome code standards; do not duplicate or override those rules.
- Preserve unrelated user changes: check `git status --short` before larger edits.

## Commands

```bash
bun run dev                # Start dev server (https://localhost:3000, HTTPS enabled)
bun run build              # Production build (full verification)
bun run start              # Start production server locally
bun run lint               # Ultracite checks (fail-safe)
bun run format             # Auto-fix Ultracite/Biome issues
bun run check              # Full checks: clean, lint, build
bun x ultracite fix        # Equivalent to bun run format
bun x ultracite check      # Equivalent to bun run lint
```

Pre-commit hooks (Lefthook) run `bun x ultracite fix` on staged files. Do not skip hooks.

## Architecture: Storyblok CMS + Next.js Static/Dynamic Rendering

This is a content-driven site (personal portfolio) powered by **Storyblok** (headless CMS). Understanding the data flow and caching strategy is critical for autonomous work.

### Content Layer (`src/lib/storyblok/`)

- **`client.ts`**: Native fetch-based Storyblok API client (not the SDK). Handles draft mode detection, cache tag strategy, and relation resolution.
  - `isDraft()`: Detects draft sessions via cookie, header, or Next.js `draftMode`. Used to select published vs draft content.
  - `storyblokFetch()`: Wraps API calls with **cache tags** for published content (1-hour revalidate), or **no-store** for draft (cache-busting `cv` param).
  - `safeReadDynamic()`: Swallows `DYNAMIC_SERVER_USAGE` errors from `cookies()`, `headers()`, `draftMode()` in static contexts (build-time SSG). Returns null if called during pre-rendering.
  - Relation resolution: UUID strings in Storyblok components are replaced with full story objects via `resolveBlokRelations()`.

- **`types.ts`**: TypeScript definitions for all story shapes (HomePageStory, PostStory, LandingPageStory, etc.).

- **`landing.ts`**: Aggregates post and taxonomy data. `loadAllPosts()` and `groupByCategory()/groupByLabel()` are used in static routes (sitemap, open-graph).

- **`adapters.ts`**: Transforms raw Storyblok content into component props (e.g., story → button text, image, link).

- **`init.ts`**: Initializes the Storyblok SDK (for visual editor support).

### Rendering Strategy

- **Published content**: Build-time static generation (SSG) with ISR. Routes revalidate on-demand via `/api/revalidate` webhook when editors publish in Storyblok.
- **Draft content**: Dynamic rendering (`cache: "no-store"` + cache-busting). Visual editor iframe sees keystroke-fresh edits.
- **Visual editor**: Runs in iframe at `app.storyblok.com`. Proxy (`src/proxy.ts`) detects editor requests via `_storyblok*` query params + Sec-Fetch-Dest header, sets cookies/headers so `isDraft()` returns true.

### Critical Pattern: `safeReadDynamic()`

This wrapper **swallows errors** from dynamic API calls (cookies, headers, draftMode) when invoked during build-time pre-rendering. Example:

```typescript
const cookieStore = await safeReadDynamic(cookies);  // null during build
if (cookieStore?.get("sb-preview")?.value === "1") return true;
```

**Why**: During `next build`, these functions throw `DYNAMIC_SERVER_USAGE` error if called from static contexts. The fallback (null → "not a draft") is correct—published routes don't need draft content.

## Source Layout

- `src/app/`: Next.js App Router.
  - `layout.tsx`: Root layout with providers (theme, Storyblok).
  - `(site)/`: Public route group.
  - `(site)/layout.tsx`: Global site chrome (header, footer).
  - `robots.ts`, `sitemap.ts`: SEO metadata (use `loadAllPosts()` for dynamic routes).
- `src/components/`: React components.
  - `storyblok/`: Storyblok provider + visual editor bridge.
  - `layout/`: Header, theme toggle, footer.
  - `home/`, `landing/`: Page-specific sections.
  - `ui/`: Presentational primitives (button, card, chip, reveal).
- `src/lib/`:
  - `storyblok/`: CMS client, types, adapters, landing data.
  - `utils.ts`: Helpers (e.g., `cn` for classname merging).
  - `seo.ts`: SEO metadata generators.
  - `pillars.ts`: Home page pillar data.
- `src/icons/icons.tsx`: Icon wrappers around `@tabler/icons-react`.
- `src/proxy.ts`: Middleware for visual editor iframe detection.
- `public/`: Static assets.

## Styling

- Tailwind CSS 4 via `@tailwindcss/postcss` (no `tailwind.config.js`).
- Theme variables in `src/app/globals.css`.
- Dark mode: `data-theme="dark"` attribute on root.
- Prefer existing primitives: `cn`, buttons, chips, cards, reveal components.
- Use semantic HTML and ARIA. Use Next.js `<Image>` for all images.

## Code Standards

- Run `bun run format` after edits, then `bun run check` before committing.
- Use TypeScript narrowing, not assertions.
- Prefer `unknown` over `any`.
- Prefer `for...of` loops, optional chaining, nullish coalescing.
- Extract complex conditions into named booleans.
- Remove `console.log`, `debugger`, `alert` from production.
- Add `rel="noopener"` on `target="_blank"` links.
- Avoid `dangerouslySetInnerHTML` unless necessary and sanitized.

## Verification Workflow

**For all changes:**
```bash
bun run format     # Fix issues in-place
bun run check      # Lint + build (full CI simulation)
```

**Failure modes:**
- `bun run lint` fails: Ultracite found style/logical issues. Run `bun run format` to auto-fix, or fix manually.
- `bun run build` fails: Framework or TypeScript errors. Check error message; may require reading Next.js docs.
- If verification cannot run, explain why and list risks.

## When to Read Next.js Local Docs

- `node_modules/next/dist/docs/01-app/`: App Router routing, layouts, dynamic segments, generateStaticParams, generateMetadata.
- `node_modules/next/dist/docs/03-architecture/`: Rendering (SSG, ISR, dynamic), caching, revalidation, data fetching.

**Consult before touching**: metadata, routing, layouts, dynamic rendering, caching, images, server actions.

## Common Pitfalls for Agents

1. **Calling `draftMode()` in static contexts**: Use `safeReadDynamic(draftMode)` instead.
2. **Forgetting cache tags**: Published content routes use `next: { tags, revalidate: 3600 }`. ISR webhook triggers `revalidateTag()`.
3. **Hard-coding Storyblok API details**: Use `storyblokFetch()` wrapper; it handles tokens, draft vs published, cache strategy.
4. **Skipping pre-commit hooks**: Don't use `--no-verify`. Let Lefthook run `ultracite fix`.
5. **Editing Next.js docs paths without reading current API**: Next.js 16 may have changed APIs you learned from older versions.
