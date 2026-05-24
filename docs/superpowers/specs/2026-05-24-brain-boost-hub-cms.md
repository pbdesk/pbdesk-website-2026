# Brain Boost Hub — Storyblok CMS Integration Design

**Date:** 2026-05-24
**Status:** Approved
**Goal:** Make the `/brain-boost` hub page fully CMS-managed via Storyblok while keeping the Phase 2 bespoke components intact and guaranteeing a hardcoded fallback when Storyblok is unavailable.

---

## Context

Phase 2 built the `/brain-boost` hub as six bespoke Server Components reading from two TypeScript constant files (`meta.ts`, `games-registry.ts`). This design adds a Storyblok content type and seed script so editors can update all hub copy, game cards, and benefit tiles without a code deploy. The hardcoded constants are retained as fallback data.

---

## Architecture

```
Storyblok ──► loadBrainBoostHubStory() ──► adaptHubStory() ──► BrainBoostHubData
                     │ null                                              ▲
                     └────────────────── getHubFallback() ──────────────┘
                                          (meta.ts + games-registry.ts)

BrainBoostHubData ──► page.tsx ──► prop-driven hub components
```

`loadBrainBoostHubStory()` mirrors the existing `loadKenkenStory()` exactly: returns `null` if Storyblok is unconfigured or the story is missing. Both `adaptHubStory()` and `getHubFallback()` return the same `BrainBoostHubData` interface — `page.tsx` never knows which source it's using.

---

## Storyblok Schema

### Nestable bloks

**`hub_meta_item`**
| Field | Type | Notes |
|-------|------|-------|
| `value` | text | e.g. "1", "~200" |
| `label` | text | e.g. "game live" |
| `icon` | select | Layers, Target, Sparkles, Calendar |

**`hub_game`**
| Field | Type | Notes |
|-------|------|-------|
| `slug` | text | required, unique |
| `name` | text | required |
| `status` | select | live, coming-q3, coming-q4, exploring |
| `category` | text | e.g. "Arithmetic · Logic" |
| `description` | textarea | |
| `href` | text | optional; only live games have this |
| `cover_image` | text | optional; file path e.g. `/pillers/kenken-banner.png` |
| `glyph` | text | optional; short monogram for coming-soon cards |
| `tiers` | number | optional |
| `est_time` | text | optional; e.g. "10–25 min" |
| `operations` | text | optional; e.g. "+ − × ÷" |

**`hub_benefit`**
| Field | Type | Notes |
|-------|------|-------|
| `icon` | select | Target, Brain, Clock, Flame |
| `title` | text | required |
| `body` | textarea | required |

### Content type: `brain_boost_hub_page`

`is_root: true`, `is_nestable: false`. Story slug: `brain-boost/hub` (inside the existing `brain-boost/` folder).

| Field | Type |
|-------|------|
| `intro_title` | text |
| `intro_tagline` | text |
| `intro_lede` | textarea |
| `meta_items` | bloks → `hub_meta_item[]` |
| `games` | bloks → `hub_game[]` |
| `daily_heading` | text |
| `daily_body` | textarea |
| `daily_cta_play` | text |
| `benefits_heading` | text |
| `benefits` | bloks → `hub_benefit[]` |
| `seo_title` | text |
| `seo_description` | textarea |

The live featured game is derived at render time by filtering `games` where `status === "live"` — no separate featured-game field needed.

---

## Data Flow

### `BrainBoostHubData` interface (shared contract)

```ts
interface BrainBoostHubData {
  title: string;
  tagline: string;
  lede: string;
  metaItems: BrainBoostMetaItem[];   // reuses existing type from meta.ts
  games: BrainBoostGame[];           // reuses existing type from games-registry.ts
  dailyHeading: string;
  dailyBody: string;
  dailyCtaPlay: string;
  benefitsHeading: string;
  benefits: HubBenefit[];
  seoTitle: string;
  seoDescription: string;
}
```

### `adaptHubStory(story: BrainBoostHubPageStory): BrainBoostHubData`

Maps each Storyblok blok field to the corresponding TypeScript shape. `hub_game` bloks map 1:1 to `BrainBoostGame`; `hub_meta_item` bloks map to `BrainBoostMetaItem`; `hub_benefit` bloks map to `HubBenefit`.

### `getHubFallback(): BrainBoostHubData`

Reads `BRAIN_BOOST_TITLE`, `BRAIN_BOOST_LEDE`, `BRAIN_BOOST_META` from `meta.ts` and `BRAIN_BOOST_GAMES` from `games-registry.ts`. The `BENEFITS` constant and `Benefit` interface must be **exported** from `brain-boost-benefits.tsx` (currently file-private) so `getHubFallback()` can import them. `HubBenefit` is an alias for the existing `Benefit` shape: `{ icon: ReactNode; title: string; body: string }` — but since `icon` is a `ReactNode`, the adapter maps the Storyblok icon select string to the correct `@tabler/icons-react` element using the same icon map already in `brain-boost-benefits.tsx`. Returns the same `BrainBoostHubData` shape.

---

## File Changes

### New files

| File | Purpose |
|------|---------|
| `scripts/seed-brain-boost-hub.ts` | Stand-alone seeder: 4 new blok schemas + `brain-boost/hub` story. Same pattern as `seed-kenken.ts`. Does NOT touch `scripts/lib/`. |

### Modified files

| File | Change |
|------|--------|
| `package.json` | Add `"seed:brain-boost-hub": "bun scripts/seed-brain-boost-hub.ts"` |
| `src/lib/storyblok/types.ts` | Add `HubMetaItemBlok`, `HubGameBlok`, `HubBenefitBlok`, `BrainBoostHubPageStoryContent`, `BrainBoostHubPageStory` |
| `src/lib/storyblok/landing.ts` | Add `loadBrainBoostHubStory()` (mirrors `loadKenkenStory()`) |
| `src/lib/storyblok/adapters.ts` | Add `adaptHubStory()`, `getHubFallback()`, `BrainBoostHubData` interface |
| `src/components/brain-boost/hub/brain-boost-intro.tsx` | Accept optional `title?`, `lede?`, `metaItems?` props; default to constants |
| `src/components/brain-boost/hub/brain-boost-featured-kenken.tsx` | Accept optional `game?` prop; default to `BRAIN_BOOST_GAMES.find(live)` |
| `src/components/brain-boost/hub/brain-boost-daily-strip.tsx` | Accept optional `heading?`, `body?`, `ctaPlay?` props; default to hardcoded strings |
| `src/components/brain-boost/hub/brain-boost-coming-soon.tsx` | Accept optional `games?` prop; default to `BRAIN_BOOST_GAMES` |
| `src/components/brain-boost/hub/brain-boost-benefits.tsx` | Export `BENEFITS` constant and `Benefit` interface (currently file-private); accept optional `heading?`, `benefits?` props; default to `BENEFITS` |
| `src/app/(site)/brain-boost/page.tsx` | Fetch hub story, call `adaptHubStory()` or `getHubFallback()`, pass `BrainBoostHubData` props to components |

### Not changing

- `meta.ts`, `games-registry.ts` — become fallback-only; no deletions
- `scripts/seed-kenken.ts`, `scripts/lib/` — untouched
- `brain-boost-hero.tsx` — banner image is a static asset, no CMS field needed
- `games-registry.test.ts` — existing 4 tests keep passing (components default to constants)

---

## Seed Script Behaviour

`seed-brain-boost-hub.ts` is idempotent (uses `upsertComponent`, `upsertFolder`, `upsertStory`). On re-run:
- 4 hub blok schemas updated in place (no other components touched)
- `brain-boost/` folder left as-is (already exists from `seed-kenken.ts`)
- `brain-boost/hub` story upserted and published
- `brain-boost/kenken` story and all kenken bloks — untouched

---

## Testing Strategy

- Existing `games-registry.test.ts` (4 cases) — must still pass unchanged
- New unit tests for `adaptHubStory()` and `getHubFallback()` in `src/lib/storyblok/adapters.test.ts` — verify both return a valid `BrainBoostHubData` with expected field values
- Build verification: `bun run build` must pass
- Dry-run smoke check: `bun run seed:brain-boost-hub` without env vars exits with env-var guard error

---

## Out of Scope

- Game detail pages (`/brain-boost/kenken`, `/brain-boost/sudoku` etc.) — separate feature
- Visual editor live preview for the hub page — follow-up
- Reordering hub sections from Storyblok — layout is fixed; section order stays in code
- `pillarAccents` / `PillarKey` — not touched
