# PBDesk 2026

Next.js 16 + React 19 + Tailwind 4 + Bun. See [CLAUDE.md](./CLAUDE.md) and [AGENTS.md](./AGENTS.md) for the full conventions.

## Getting started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common commands

```bash
bun run dev      # Local dev server
bun run build    # Production build
bun run start    # Run production server
bun run check    # Ultracite/Biome lint check
bun run fix      # Ultracite/Biome auto-fix (run before committing)
```

Pre-commit hooks (Lefthook) auto-run `bun x ultracite fix` on staged files. Do not skip hooks.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in the Storyblok values. Variables starting with `NEXT_PUBLIC_` are exposed to the browser; everything else is server-only.

| Variable | Purpose |
|---|---|
| `STORYBLOK_REGION` | `eu` or `us` — must match your space's region. |
| `STORYBLOK_ACCESS_TOKEN` | Public preview token used for published content fetches. |
| `STORYBLOK_PREVIEW_TOKEN` | Token used in draft mode (often same as access token). |
| `STORYBLOK_PREVIEW_SECRET` | Random string protecting `/api/draft`. |
| `STORYBLOK_WEBHOOK_SECRET` | Shared with the Storyblok webhook; verifies `/api/revalidate` HMAC. |
| `STORYBLOK_MANAGEMENT_TOKEN` | Personal Access Token; **only** used by `scripts/seed-storyblok.ts` and `scripts/import-resources.ts`. |
| `STORYBLOK_SPACE_ID` | Numeric space ID; only for migration scripts. |
| `NEXT_PUBLIC_STORYBLOK_REGION` | Browser-side region for the visual editor bridge. |
| `NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN` | Browser-side preview token for the bridge (loaded only inside draft mode). |

## Storyblok routes

- `GET /api/draft?secret=<STORYBLOK_PREVIEW_SECRET>&slug=/path` — enables draft mode and redirects to the slug.
- `GET /api/draft-disable` — disables draft mode.
- `POST /api/revalidate` — webhook endpoint for Storyblok; verifies `webhook-signature` HMAC-SHA1 against `STORYBLOK_WEBHOOK_SECRET` and calls `revalidateTag`.

## Visual editor (local dev)

The Storyblok visual editor loads your dev server in an iframe under `https://app.storyblok.com`. To make this work over `http://localhost:3000`, either:

- Run `bun run dev --experimental-https` (Next.js generates a self-signed cert), or
- Toggle "Allow http://localhost" in your Storyblok space settings.

## Architecture overview

- App Router under `src/app/`; public routes inside the `(site)` route group.
- Server Components by default; mark client boundaries with `"use client"` only where needed.
- Tailwind tokens live in `src/app/globals.css` (no `tailwind.config.js`).
- Path alias: `@/*` → `src/*`.
- React Compiler is enabled — avoid manual `useMemo` / `useCallback`.
