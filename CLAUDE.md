# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev            # Start dev server at http://localhost:3000
bun run build          # Production build
bun run start          # Start production server
bun x ultracite fix    # Auto-fix formatting/lint issues (run before committing)
bun x ultracite check  # Check for issues without fixing
```

Pre-commit hooks (lefthook) automatically run `bun x ultracite fix` on staged files — do not skip hooks.

## Architecture

**Runtime:** Bun (not Node). Use `bun run` / `bun x` for all commands.

**Framework:** Next.js 16 App Router with React 19. This version has breaking changes from older Next.js — check `node_modules/next/dist/docs/` before writing Next.js-specific code.

**Source layout:**
- `src/app/(site)/` — route group for all public pages; `layout.tsx` wraps with Header + Footer
- `src/app/layout.tsx` — root layout: metadata, ThemeProvider, Toaster
- `src/components/layout/` — Header (client, sticky, mobile-responsive) and Footer (server)
- `src/lib/providers/` — client-side providers (Toaster via Sonner)
- `src/lib/utils.ts` — shared utilities (`cn` for class merging, `errorHandler`, etc.)
- `src/icons/icons.tsx` — custom icon components wrapping @tabler/icons-react

**Styling:** Tailwind CSS 4 via `@tailwindcss/postcss`. Theme variables are defined inline in `src/app/globals.css` (no `tailwind.config.js`). Custom `@utility` rules for `.wrapper`, `.hero-glow-bg`, etc. Dark mode uses `data-theme="dark"` attribute, not Tailwind's `class` strategy.

**Component model:** Server Components by default. Mark client boundaries with `"use client"` only when needed (hooks, browser APIs, interactivity). React Compiler is enabled — no manual `useMemo`/`useCallback` needed.

**Path alias:** `@/*` resolves to `src/*`.

**Code standards:** See `AGENTS.md` for the full Ultracite/Biome ruleset (type safety, React 19 patterns, accessibility, security).
