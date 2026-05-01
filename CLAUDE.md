# CLAUDE.md

This file gives Claude Code the project-specific rules for working in this repository.

## First Rules

- This project uses Bun, not Node package-manager commands. Use `bun run` and `bun x`.
- This project uses Next.js 16 with breaking changes from older Next.js versions. Before changing framework-specific code, read the relevant guide under `node_modules/next/dist/docs/`.
- Follow `AGENTS.md` for the full Ultracite/Biome code standards. Do not duplicate or weaken those rules here.
- Preserve existing user changes. Check `git status --short` before larger edits and do not revert unrelated work.

## Commands

```bash
bun run dev            # Start local dev server at http://localhost:3000
bun run build          # Create a production build
bun run start          # Start the production server
bun run check          # Run Ultracite checks
bun run fix            # Auto-fix Ultracite/Biome issues
bun x ultracite check  # Equivalent direct check command
bun x ultracite fix    # Equivalent direct fix command; run before committing
```

Pre-commit hooks use Lefthook and run `bun x ultracite fix` on staged files. Do not skip hooks.

## Architecture

- Runtime/package manager: Bun.
- Framework: Next.js 16 App Router with React 19.
- Styling: Tailwind CSS 4 via `@tailwindcss/postcss`.
- Path alias: `@/*` resolves to `src/*`.
- React Compiler is enabled. Avoid manual `useMemo` or `useCallback` unless there is a measured reason.
- Server Components are the default. Add `"use client"` only for hooks, browser APIs, event handlers, or other client-only behavior.

## Source Layout

- `src/app/layout.tsx`: root layout, metadata, providers, global page shell.
- `src/app/(site)/`: public site route group.
- `src/app/(site)/layout.tsx`: public route wrapper with header and footer.
- `src/app/globals.css`: Tailwind import, theme tokens, custom utilities, global styles.
- `src/components/layout/`: header, theme toggle, and footer.
- `src/components/home/`: home page sections.
- `src/components/landing/`: listing and landing page components.
- `src/components/ui/`: shared presentational primitives.
- `src/icons/icons.tsx`: project icon wrappers around `@tabler/icons-react`.
- `src/lib/`: shared utilities, SEO helpers, providers, and content data.
- `public/`: static assets.

## Styling Conventions

- Tailwind theme variables live in `src/app/globals.css`; there is no `tailwind.config.js`.
- Dark mode is controlled with the `data-theme="dark"` attribute.
- Prefer existing UI primitives and utilities such as `cn`, shared buttons, chips, cards, and reveal components.
- Use semantic HTML and accessible labels. Use Next.js `<Image>` for images.
- Keep styles consistent with the current site language before introducing new visual patterns.

## Code Standards

- Run `bun run fix` after meaningful code edits, then `bun run check` when practical.
- Use TypeScript narrowing instead of assertions when possible.
- Prefer `unknown` over `any`.
- Prefer `for...of` loops over `.forEach()` and indexed loops.
- Keep functions focused; extract complex conditions into named booleans.
- Remove `console.log`, `debugger`, and `alert` from production code.
- Add `rel="noopener"` on links with `target="_blank"`.
- Avoid `dangerouslySetInnerHTML` unless the need is explicit and sanitized.

## Next.js Notes

Use local docs as the source of truth for current APIs:

- App Router docs: `node_modules/next/dist/docs/01-app/`
- Architecture docs: `node_modules/next/dist/docs/03-architecture/`
- Supported browser and accessibility docs: `node_modules/next/dist/docs/03-architecture/`

When touching metadata, routing, layouts, dynamic rendering, caching, images, or server actions, consult the matching local docs first.

## Verification

For most changes:

```bash
bun run fix
bun run check
```

For framework, routing, or rendering changes, also run:

```bash
bun run build
```

If verification cannot be run, explain why and list the remaining risk.
