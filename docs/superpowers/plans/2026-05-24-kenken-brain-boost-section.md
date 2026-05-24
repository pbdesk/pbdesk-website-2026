# Brain Boost Section (`/brain-boost` placeholder, `kenken_page` Storyblok page, nav/footer, sitemap) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Brain Boost section chrome around the KenKen game: an empty `/brain-boost` placeholder, the bespoke, fully CMS-editable `/brain-boost/kenken` info page (a `kenken_page` Storyblok content type with six body bloks, a server loader, blok registration, and a hardcoded fallback that renders with no Storyblok token), the "Brain Boost" header/footer nav entries, and the `/brain-boost/kenken` sitemap entry.

**Architecture:** `/brain-boost/kenken` follows the established `about_page`/`disclaimer_page` convention — a server component calls `loadKenkenStory()`; when a story with a `body` exists it renders through `<LivePage>` (so the visual editor stays keystroke-fresh), otherwise it renders a hardcoded `KenkenFallback` built from the same presentational section components. Each body section is its own blok so editors control order/content. Brain Boost uses the standalone Sunset Pulse accent (`BRAIN_BOOST_ACCENT`, created in Plan 2) — it does **not** touch `PillarKey`/`pillarAccents` or reuse `SectionLanding`/`SectionBanner`.

**Tech Stack:** Next.js 16 App Router (server pages), React 19, Storyblok (`@storyblok/react/rsc` SDK + native-fetch client in `lib/storyblok/client.ts`), `StoryblokRichText` for rich text, Tailwind CSS 4 with the project's `var(--...)` theme tokens, Bun (`bun:test`).

**Scope note:** This is plan 3 of 3 for the KenKen build (`docs/superpowers/specs/2026-05-23-kenken-design.md`). Plan 1 delivered the engine/generator/library/API; Plan 2 delivered the playable game and the `/brain-boost/kenken/play` + `/daily` routes and **created `src/components/brain-boost/accent.ts`**. This plan adds the surrounding section + content page. It assumes `BRAIN_BOOST_ACCENT` already exists.

**Conventions to follow:**
- Storyblok page-content types live in `src/lib/storyblok/types.ts`; blok types for the renderer live in `src/components/storyblok/blocks/types.ts`.
- The generic body renderer `src/components/storyblok/blocks/page.tsx` dispatches each top-level blok by `component` name; new top-level bloks must be added to its `switch`.
- Server data loaders live in `src/lib/storyblok/landing.ts` and wrap fetchers in `src/lib/storyblok/client.ts` (which handles draft/published, cache tags, revalidation).
- Pages that may have no token render a **hardcoded fallback** (see `disclaimer/page.tsx`, `about/page.tsx`).
- Use `@/` alias in `src/components/**` and `src/app/**`. Use Next.js `<Image>` for raster images. Semantic HTML + ARIA per project standards. `rel="noopener"` on any `target="_blank"`.
- Styling mirrors existing pages: `wrapper` utility, `var(--fg-primary)`, `var(--bg-subtle)`, `var(--border-subtle)`, the `Button`/`Chip` UI primitives. Brain Boost sections use `BRAIN_BOOST_ACCENT` for accent color/gradient.
- After edits run `bun run format` (ultracite) before committing; the pre-commit hook also runs it.
- Storyblok loaders are not unit-tested in this project (they depend on env + network); verify those via `bun run build` + manual dev checks. Pure helpers get unit tests.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/storyblok/types.ts` (modify) | Add `KenkenPageStoryContent` + `KenkenPageStory`. |
| `src/components/storyblok/blocks/types.ts` (modify) | Add blok interfaces: `KenkenHeroBlok`, `KenkenProseBlok`, `KenkenStepsBlok`/`KenkenStepBlok`, `KenkenOperationsBlok`/`KenkenOperationBlok`, `KenkenLevelsBlok`/`KenkenLevelBlok`, `KenkenCtaBlok`. |
| `src/lib/storyblok/client.ts` (modify) | Add `fetchKenkenStory()`. |
| `src/lib/storyblok/landing.ts` (modify) | Add `loadKenkenStory()`. |
| `src/components/brain-boost/kenken/sections.tsx` | Presentational, prop-driven sections: `KenkenHero`, `KenkenProse`, `KenkenSteps`, `KenkenOperations`, `KenkenLevels`, `KenkenCta`. |
| `src/components/brain-boost/kenken/fallback-content.ts` | Canonical default copy (operations + levels from spec §3) and `KenkenFallback` data. |
| `src/components/brain-boost/kenken/fallback.tsx` | `KenkenFallback` component composing the sections with canonical copy. |
| `src/components/storyblok/blocks/kenken.tsx` | Blok wrappers (`KenkenHeroBlok` → `KenkenHero`, etc.) with `editable()`; one file exporting all six. |
| `src/components/storyblok/blocks/page.tsx` (modify) | Register the six `kenken_*` bloks in the dispatch `switch`. |
| `src/app/(site)/brain-boost/page.tsx` | Empty placeholder page. |
| `src/app/(site)/brain-boost/kenken/page.tsx` | Bespoke Storyblok page + hardcoded fallback. |
| `src/components/layout/header/header.tsx` (modify) | Add "Brain Boost" to `DEFAULT_NAV_ITEMS`. |
| `src/components/layout/footer.tsx` (modify) | Add "Brain Boost" to `DEFAULT_EXPLORE`. |
| `src/app/sitemap.ts` (modify) | Add `/brain-boost/kenken` to `STATIC_ROUTES`. |

> **Note:** Plan 2 already created `src/app/(site)/brain-boost/kenken/play/` and `/daily/`. This plan adds the sibling `src/app/(site)/brain-boost/page.tsx` and `src/app/(site)/brain-boost/kenken/page.tsx`.

---

## Task 1: Storyblok content + blok types

**Files:**
- Modify: `src/lib/storyblok/types.ts`
- Modify: `src/components/storyblok/blocks/types.ts`
- Test: `src/components/storyblok/blocks/kenken-types.test.ts`

`steps`, `operations`, and `levels` are modeled as arrays of **nested bloks** (rendered directly by their parent section, not the top-level dispatcher). Only the six section bloks are registered in `page.tsx`.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/storyblok/blocks/kenken-types.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import type {
  KenkenCtaBlok,
  KenkenHeroBlok,
  KenkenLevelsBlok,
  KenkenOperationsBlok,
  KenkenProseBlok,
  KenkenStepsBlok,
} from "./types";

describe("kenken blok types", () => {
  test("hero blok compiles with its fields", () => {
    const hero: KenkenHeroBlok = {
      _uid: "1",
      component: "kenken_hero",
      eyebrow: "Brain Boost",
      title: "KenKen",
      lede: "Arithmetic logic puzzles.",
      cta_play_label: "Play",
      cta_daily_label: "Daily",
    };
    expect(hero.component).toBe("kenken_hero");
  });

  test("composite bloks carry nested item arrays", () => {
    const steps: KenkenStepsBlok = {
      _uid: "2",
      component: "kenken_steps",
      heading: "How to play",
      steps: [{ _uid: "s1", component: "kenken_step", title: "Fill", text: "1..N" }],
    };
    const ops: KenkenOperationsBlok = {
      _uid: "3",
      component: "kenken_operations",
      heading: "Operations",
      operations: [
        { _uid: "o1", component: "kenken_operation", symbol: "+", name: "Add", description: "sum" },
      ],
    };
    const levels: KenkenLevelsBlok = {
      _uid: "4",
      component: "kenken_levels",
      heading: "Levels",
      levels: [
        {
          _uid: "l1",
          component: "kenken_level",
          name: "Easy",
          sizes: "3×3",
          operations: "+ − × ÷",
          description: "Gentle start",
        },
      ],
    };
    expect(steps.steps[0].title).toBe("Fill");
    expect(ops.operations[0].symbol).toBe("+");
    expect(levels.levels[0].name).toBe("Easy");
  });

  test("prose + cta bloks compile", () => {
    const prose: KenkenProseBlok = {
      _uid: "5",
      component: "kenken_prose",
      heading: "What is KenKen",
      richtext: { type: "doc", content: [] },
    };
    const cta: KenkenCtaBlok = {
      _uid: "6",
      component: "kenken_cta",
      heading: "Ready?",
      cta_play_label: "Play",
      cta_daily_label: "Daily",
    };
    expect(prose.component).toBe("kenken_prose");
    expect(cta.component).toBe("kenken_cta");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/components/storyblok/blocks/kenken-types.test.ts`
Expected: FAIL — the `Kenken*Blok` types don't exist yet.

- [ ] **Step 3: Add the page-content type to `src/lib/storyblok/types.ts`**

Append after the existing `PrivacyPolicyPageStoryContent` interface (before the `export type ... Story = ISbStoryData<...>` block), and add the matching story type alias with the others:

```ts
// add to the interface section
export interface KenkenPageStoryContent extends SbBlokBase {
  body?: SbBlokBase[];
  component: "kenken_page";
  seo_description?: string;
  seo_title?: string;
}
```

```ts
// add alongside the other `export type ...Story = ISbStoryData<...>` lines
export type KenkenPageStory = ISbStoryData<KenkenPageStoryContent>;
```

- [ ] **Step 4: Add the blok types to `src/components/storyblok/blocks/types.ts`**

Append at the end of the file (after the `ShareBarBlok` section). `RichtextDoc` and `SbBlokBase`/`SbLinkField` are already imported at the top of that file.

```ts
// ---- KenKen page bloks ---------------------------------------------------

export interface KenkenHeroBlok extends SbBlokBase {
  component: "kenken_hero";
  cta_daily_label?: string;
  cta_play_label?: string;
  eyebrow?: string;
  lede?: string;
  title?: string;
}

export interface KenkenProseBlok extends SbBlokBase {
  component: "kenken_prose";
  heading?: string;
  richtext?: RichtextDoc;
}

export interface KenkenStepBlok extends SbBlokBase {
  component: "kenken_step";
  text?: string;
  title?: string;
}

export interface KenkenStepsBlok extends SbBlokBase {
  component: "kenken_steps";
  heading?: string;
  steps: KenkenStepBlok[];
}

export interface KenkenOperationBlok extends SbBlokBase {
  component: "kenken_operation";
  description?: string;
  name?: string;
  symbol?: string;
}

export interface KenkenOperationsBlok extends SbBlokBase {
  component: "kenken_operations";
  heading?: string;
  operations: KenkenOperationBlok[];
}

export interface KenkenLevelBlok extends SbBlokBase {
  component: "kenken_level";
  description?: string;
  name?: string;
  operations?: string;
  sizes?: string;
}

export interface KenkenLevelsBlok extends SbBlokBase {
  component: "kenken_levels";
  heading?: string;
  levels: KenkenLevelBlok[];
}

export interface KenkenCtaBlok extends SbBlokBase {
  component: "kenken_cta";
  cta_daily_label?: string;
  cta_play_label?: string;
  heading?: string;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test src/components/storyblok/blocks/kenken-types.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
bun run format
git add src/lib/storyblok/types.ts src/components/storyblok/blocks/types.ts src/components/storyblok/blocks/kenken-types.test.ts
git commit -m "feat(brain-boost): add kenken_page content + blok types"
```

---

## Task 2: Story fetcher + loader

**Files:**
- Modify: `src/lib/storyblok/client.ts`
- Modify: `src/lib/storyblok/landing.ts`

Mirror the `about`/`disclaimer` singletons. The story slug is `brain-boost/kenken`.

- [ ] **Step 1: Add the fetcher to `client.ts`**

Add `KenkenPageStory` to the type import block at the top of `client.ts`:

```ts
import type {
  AboutPageStory,
  DisclaimerPageStory,
  GlobalConfigStory,
  HomePageStory,
  KenkenPageStory,
  LandingPageStory,
  PillarKey,
  PostStory,
  PrivacyPolicyPageStory,
} from "./types";
```

Then add the fetcher near the other singleton fetchers (e.g. after `fetchPrivacyPolicyStory`):

```ts
export function fetchKenkenStory(): Promise<KenkenPageStory | null> {
  return fetchStoryRaw<KenkenPageStory>("brain-boost/kenken");
}
```

- [ ] **Step 2: Add the loader to `landing.ts`**

Add `fetchKenkenStory` to the imports from `./client` and `KenkenPageStory` to the imports from `./types`, then add:

```ts
/**
 * Fetch the `brain-boost/kenken` info page story. Returns null when
 * Storyblok isn't configured or the story doesn't exist — the page falls
 * back to its hardcoded canonical content in that case.
 */
export async function loadKenkenStory(): Promise<KenkenPageStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchKenkenStory();
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Verify it compiles**

Run: `bun run build`
Expected: build succeeds (no usage yet, but the new exports type-check).

- [ ] **Step 4: Commit**

```bash
bun run format
git add src/lib/storyblok/client.ts src/lib/storyblok/landing.ts
git commit -m "feat(brain-boost): add kenken story fetcher and loader"
```

---

## Task 3: Canonical fallback content

**Files:**
- Create: `src/components/brain-boost/kenken/fallback-content.ts`
- Test: `src/components/brain-boost/kenken/fallback-content.test.ts`

The canonical operation + level copy from spec §3. This is the single source of truth used by the hardcoded fallback (and the recommended Storyblok seed copy). Unit-tested for shape so the fallback never silently loses a level/operation.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/brain-boost/kenken/fallback-content.test.ts
/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import {
  FALLBACK_LEVELS,
  FALLBACK_OPERATIONS,
  FALLBACK_STEPS,
} from "./fallback-content";

describe("fallback content", () => {
  test("lists the four operations with display glyphs", () => {
    const symbols = FALLBACK_OPERATIONS.map((o) => o.symbol);
    expect(symbols).toEqual(["+", "−", "×", "÷"]);
  });

  test("lists all four difficulty tiers", () => {
    const names = FALLBACK_LEVELS.map((l) => l.name);
    expect(names).toEqual(["Easy", "Intermediate", "Hard", "Genius"]);
  });

  test("has at least three how-to steps", () => {
    expect(FALLBACK_STEPS.length).toBeGreaterThanOrEqual(3);
    for (const step of FALLBACK_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/components/brain-boost/kenken/fallback-content.test.ts`
Expected: FAIL — cannot find module `./fallback-content`.

- [ ] **Step 3: Write the implementation**

```ts
// src/components/brain-boost/kenken/fallback-content.ts
export interface OperationCopy {
  symbol: string;
  name: string;
  description: string;
}

export interface LevelCopy {
  name: string;
  sizes: string;
  operations: string;
  description: string;
}

export interface StepCopy {
  title: string;
  text: string;
}

export const FALLBACK_HERO = {
  eyebrow: "Brain Boost",
  title: "KenKen",
  lede: "A bite-sized arithmetic logic puzzle. Fill the grid so every row and column holds each digit once, and each cage hits its target.",
  ctaPlayLabel: "Play now",
  ctaDailyLabel: "Today's daily",
} as const;

export const FALLBACK_WHAT_IS =
  "KenKen is a grid-based logic puzzle. Fill an N×N grid with the digits 1 to N so that no digit repeats in any row or column. The grid is split into outlined groups called cages — each shows a target and an operation, and the digits in the cage must combine, using that operation, to produce the target.";

export const FALLBACK_STEPS: StepCopy[] = [
  {
    title: "Fill rows and columns",
    text: "Place the digits 1 to N so each appears exactly once in every row and every column.",
  },
  {
    title: "Satisfy each cage",
    text: "An outlined cage shows a target and an operation. The digits inside must combine, using that operation, to make the target.",
  },
  {
    title: "Use notes and checks",
    text: "Jot candidate digits as notes, toggle rule-checking to spot duplicates, and reveal mistakes if you get stuck.",
  },
];

export const FALLBACK_OPERATIONS: OperationCopy[] = [
  { symbol: "+", name: "Addition", description: "Cage digits add up to the target (any cage size)." },
  { symbol: "−", name: "Subtraction", description: "Two cells; the target is their absolute difference." },
  { symbol: "×", name: "Multiplication", description: "Cage digits multiply to the target (any cage size)." },
  { symbol: "÷", name: "Division", description: "Two cells; the larger divided by the smaller equals the target (whole numbers only)." },
];

export const FALLBACK_LEVELS: LevelCopy[] = [
  {
    name: "Easy",
    sizes: "3×3, 4×4, 5×5",
    operations: "+ − ×  (÷ on 3×3)",
    description: "Gentle grids to learn the ropes.",
  },
  {
    name: "Intermediate",
    sizes: "4×4, 5×5",
    operations: "+ − × ÷",
    description: "All four operations in play — the daily puzzle's tier.",
  },
  {
    name: "Hard",
    sizes: "6×6, 7×7",
    operations: "+ − × ÷",
    description: "Bigger boards and tighter cages.",
  },
  {
    name: "Genius",
    sizes: "8×8, 9×9",
    operations: "+ − × ÷",
    description: "A serious workout for puzzle veterans.",
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/components/brain-boost/kenken/fallback-content.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
bun run format
git add src/components/brain-boost/kenken/fallback-content.ts src/components/brain-boost/kenken/fallback-content.test.ts
git commit -m "feat(brain-boost): add canonical kenken fallback content"
```

---

## Task 4: Presentational section components

**Files:**
- Create: `src/components/brain-boost/kenken/sections.tsx`

Six prop-driven sections. They are consumed both by the hardcoded fallback (Task 5) and the blok wrappers (Task 6). CTAs always point at `/brain-boost/kenken/play` and `/brain-boost/kenken/daily` (targets fixed; labels are props per spec §2.B). No unit test (presentational).

- [ ] **Step 1: Write the components**

```tsx
// src/components/brain-boost/kenken/sections.tsx
import { StoryblokRichText } from "@storyblok/react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { Button } from "@/components/ui/button";
import type {
  LevelCopy,
  OperationCopy,
  StepCopy,
} from "./fallback-content";

const PLAY_HREF = "/brain-boost/kenken/play";
const DAILY_HREF = "/brain-boost/kenken/daily";

export function KenkenHero({
  eyebrow,
  title,
  lede,
  ctaPlayLabel,
  ctaDailyLabel,
}: {
  eyebrow?: string;
  title?: string;
  lede?: string;
  ctaPlayLabel?: string;
  ctaDailyLabel?: string;
}) {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: BRAIN_BOOST_ACCENT.gradient }}
    >
      <div className="wrapper relative z-10 text-center text-white">
        {eyebrow ? (
          <span
            className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm text-white"
            style={{ background: "rgb(255 255 255 / 0.18)" }}
          >
            {eyebrow}
          </span>
        ) : null}
        <h1
          className="mt-6 mb-4 font-bold"
          style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        {lede ? (
          <p className="mx-auto mb-8 max-w-2xl text-lg" style={{ lineHeight: 1.6 }}>
            {lede}
          </p>
        ) : null}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {ctaPlayLabel ? <Button href={PLAY_HREF}>{ctaPlayLabel}</Button> : null}
          {ctaDailyLabel ? (
            <Button href={DAILY_HREF} variant="ghost">
              {ctaDailyLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function KenkenProse({
  heading,
  richtext,
  fallbackText,
}: {
  heading?: string;
  richtext?: Parameters<typeof StoryblokRichText>[0]["doc"];
  fallbackText?: string;
}) {
  return (
    <section className="py-12 sm:py-16">
      <div className="wrapper">
        <div className="mx-auto max-w-3xl">
          {heading ? (
            <h2
              className="mb-4 font-bold text-2xl"
              style={{ color: "var(--fg-primary)" }}
            >
              {heading}
            </h2>
          ) : null}
          <div className="post-prose">
            {richtext ? (
              <StoryblokRichText doc={richtext} />
            ) : (
              <p style={{ color: "var(--fg-secondary)", lineHeight: 1.7 }}>
                {fallbackText}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function KenkenSteps({
  heading,
  steps,
}: {
  heading?: string;
  steps: StepCopy[];
}) {
  return (
    <section className="bg-[var(--bg-subtle)] py-12 sm:py-16">
      <div className="wrapper mx-auto max-w-3xl">
        {heading ? (
          <h2 className="mb-6 font-bold text-2xl" style={{ color: "var(--fg-primary)" }}>
            {heading}
          </h2>
        ) : null}
        <ol className="flex flex-col gap-5">
          {steps.map((step, i) => (
            <li className="flex gap-4" key={step.title}>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-sm text-white"
                style={{ background: BRAIN_BOOST_ACCENT.primary }}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--fg-primary)" }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--fg-secondary)", lineHeight: 1.6 }}>
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function KenkenOperations({
  heading,
  operations,
}: {
  heading?: string;
  operations: OperationCopy[];
}) {
  return (
    <section className="py-12 sm:py-16">
      <div className="wrapper mx-auto max-w-4xl">
        {heading ? (
          <h2 className="mb-6 font-bold text-2xl" style={{ color: "var(--fg-primary)" }}>
            {heading}
          </h2>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {operations.map((op) => (
            <div
              className="rounded-2xl border p-5"
              key={op.name}
              style={{ borderColor: "var(--border-strong)", background: "var(--bg-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white text-xl"
                  style={{ background: BRAIN_BOOST_ACCENT.primary }}
                >
                  {op.symbol}
                </span>
                <h3 className="font-semibold" style={{ color: "var(--fg-primary)" }}>
                  {op.name}
                </h3>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--fg-secondary)", lineHeight: 1.6 }}>
                {op.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KenkenLevels({
  heading,
  levels,
}: {
  heading?: string;
  levels: LevelCopy[];
}) {
  return (
    <section className="bg-[var(--bg-subtle)] py-12 sm:py-16">
      <div className="wrapper mx-auto max-w-4xl">
        {heading ? (
          <h2 className="mb-6 font-bold text-2xl" style={{ color: "var(--fg-primary)" }}>
            {heading}
          </h2>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {levels.map((level) => (
            <div
              className="rounded-2xl border p-5"
              key={level.name}
              style={{ borderColor: "var(--border-strong)", background: "var(--bg-page)" }}
            >
              <h3 className="font-semibold text-lg" style={{ color: "var(--fg-primary)" }}>
                {level.name}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--fg-secondary)" }}>
                {level.sizes} · {level.operations}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}>
                {level.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KenkenCta({
  heading,
  ctaPlayLabel,
  ctaDailyLabel,
}: {
  heading?: string;
  ctaPlayLabel?: string;
  ctaDailyLabel?: string;
}) {
  return (
    <section className="py-16 text-center">
      <div className="wrapper">
        {heading ? (
          <h2 className="mb-6 font-bold text-2xl" style={{ color: "var(--fg-primary)" }}>
            {heading}
          </h2>
        ) : null}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {ctaPlayLabel ? <Button href={PLAY_HREF}>{ctaPlayLabel}</Button> : null}
          {ctaDailyLabel ? (
            <Button href={DAILY_HREF} variant="secondary">
              {ctaDailyLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
bun run format
git add src/components/brain-boost/kenken/sections.tsx
git commit -m "feat(brain-boost): add presentational kenken sections"
```

---

## Task 5: Hardcoded fallback composition

**Files:**
- Create: `src/components/brain-boost/kenken/fallback.tsx`

Composes the sections with canonical copy in the spec's default order: hero → "What is KenKen" prose → how-to steps → operations → levels → closing CTA. No unit test (presentational).

- [ ] **Step 1: Write the fallback**

```tsx
// src/components/brain-boost/kenken/fallback.tsx
import {
  FALLBACK_HERO,
  FALLBACK_LEVELS,
  FALLBACK_OPERATIONS,
  FALLBACK_STEPS,
  FALLBACK_WHAT_IS,
} from "./fallback-content";
import {
  KenkenCta,
  KenkenHero,
  KenkenLevels,
  KenkenOperations,
  KenkenProse,
  KenkenSteps,
} from "./sections";

export default function KenkenFallback() {
  return (
    <>
      <KenkenHero
        ctaDailyLabel={FALLBACK_HERO.ctaDailyLabel}
        ctaPlayLabel={FALLBACK_HERO.ctaPlayLabel}
        eyebrow={FALLBACK_HERO.eyebrow}
        lede={FALLBACK_HERO.lede}
        title={FALLBACK_HERO.title}
      />
      <KenkenProse fallbackText={FALLBACK_WHAT_IS} heading="What is KenKen?" />
      <KenkenSteps heading="How to play" steps={FALLBACK_STEPS} />
      <KenkenOperations heading="Operations" operations={FALLBACK_OPERATIONS} />
      <KenkenLevels heading="Difficulty levels" levels={FALLBACK_LEVELS} />
      <KenkenCta
        ctaDailyLabel="Today's daily"
        ctaPlayLabel="Play now"
        heading="Ready to solve?"
      />
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
bun run format
git add src/components/brain-boost/kenken/fallback.tsx
git commit -m "feat(brain-boost): add hardcoded kenken fallback composition"
```

---

## Task 6: Blok wrappers + registration

**Files:**
- Create: `src/components/storyblok/blocks/kenken.tsx`
- Modify: `src/components/storyblok/blocks/page.tsx`

Blok wrappers adapt CMS blok data to the presentational sections and attach `editable()` so they're clickable in the visual editor. Then register the six top-level `kenken_*` bloks in the `Page` dispatcher. No unit test (presentational).

- [ ] **Step 1: Write the blok wrappers**

```tsx
// src/components/storyblok/blocks/kenken.tsx
import {
  KenkenCta,
  KenkenHero,
  KenkenLevels,
  KenkenOperations,
  KenkenProse,
  KenkenSteps,
} from "@/components/brain-boost/kenken/sections";
import { editable } from "./editable";
import type {
  KenkenCtaBlok,
  KenkenHeroBlok,
  KenkenLevelsBlok,
  KenkenOperationsBlok,
  KenkenProseBlok,
  KenkenStepsBlok,
} from "./types";

export function KenkenHeroBlock({ blok }: { blok: KenkenHeroBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenHero
        ctaDailyLabel={blok.cta_daily_label}
        ctaPlayLabel={blok.cta_play_label}
        eyebrow={blok.eyebrow}
        lede={blok.lede}
        title={blok.title}
      />
    </div>
  );
}

export function KenkenProseBlock({ blok }: { blok: KenkenProseBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenProse
        heading={blok.heading}
        richtext={
          blok.richtext as Parameters<typeof KenkenProse>[0]["richtext"]
        }
      />
    </div>
  );
}

export function KenkenStepsBlock({ blok }: { blok: KenkenStepsBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenSteps
        heading={blok.heading}
        steps={(blok.steps ?? []).map((s) => ({
          title: s.title ?? "",
          text: s.text ?? "",
        }))}
      />
    </div>
  );
}

export function KenkenOperationsBlock({
  blok,
}: {
  blok: KenkenOperationsBlok;
}) {
  return (
    <div {...editable(blok)}>
      <KenkenOperations
        heading={blok.heading}
        operations={(blok.operations ?? []).map((o) => ({
          symbol: o.symbol ?? "",
          name: o.name ?? "",
          description: o.description ?? "",
        }))}
      />
    </div>
  );
}

export function KenkenLevelsBlock({ blok }: { blok: KenkenLevelsBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenLevels
        heading={blok.heading}
        levels={(blok.levels ?? []).map((l) => ({
          name: l.name ?? "",
          sizes: l.sizes ?? "",
          operations: l.operations ?? "",
          description: l.description ?? "",
        }))}
      />
    </div>
  );
}

export function KenkenCtaBlock({ blok }: { blok: KenkenCtaBlok }) {
  return (
    <div {...editable(blok)}>
      <KenkenCta
        ctaDailyLabel={blok.cta_daily_label}
        ctaPlayLabel={blok.cta_play_label}
        heading={blok.heading}
      />
    </div>
  );
}
```

- [ ] **Step 2: Register the bloks in `page.tsx`**

Add the imports near the other blok-component imports:

```ts
import {
  KenkenCtaBlock,
  KenkenHeroBlock,
  KenkenLevelsBlock,
  KenkenOperationsBlock,
  KenkenProseBlock,
  KenkenStepsBlock,
} from "./kenken";
```

Add to the type import block from `./types`:

```ts
  KenkenCtaBlok,
  KenkenHeroBlok,
  KenkenLevelsBlok,
  KenkenOperationsBlok,
  KenkenProseBlok,
  KenkenStepsBlok,
```

Add these `case`s to the `switch (blok.component)` (before `default`):

```tsx
          case "kenken_hero":
            return (
              <KenkenHeroBlock blok={blok as KenkenHeroBlok} key={blok._uid} />
            );
          case "kenken_prose":
            return (
              <KenkenProseBlock blok={blok as KenkenProseBlok} key={blok._uid} />
            );
          case "kenken_steps":
            return (
              <KenkenStepsBlock blok={blok as KenkenStepsBlok} key={blok._uid} />
            );
          case "kenken_operations":
            return (
              <KenkenOperationsBlock
                blok={blok as KenkenOperationsBlok}
                key={blok._uid}
              />
            );
          case "kenken_levels":
            return (
              <KenkenLevelsBlock
                blok={blok as KenkenLevelsBlok}
                key={blok._uid}
              />
            );
          case "kenken_cta":
            return (
              <KenkenCtaBlock blok={blok as KenkenCtaBlok} key={blok._uid} />
            );
```

- [ ] **Step 3: Verify it compiles**

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
bun run format
git add src/components/storyblok/blocks/kenken.tsx src/components/storyblok/blocks/page.tsx
git commit -m "feat(brain-boost): add kenken blok wrappers and register them"
```

---

## Task 7: `/brain-boost/kenken` page (Storyblok + fallback)

**Files:**
- Create: `src/app/(site)/brain-boost/kenken/page.tsx`

Server component mirroring `about/page.tsx`: load the story; if it has a `body`, render `<LivePage>` (live editor support); otherwise render `KenkenFallback`. Metadata derives from `seo_title`/`seo_description` with sensible defaults; include `Game` JSON-LD. No unit test (page); build + manual.

- [ ] **Step 1: Write the page**

```tsx
// src/app/(site)/brain-boost/kenken/page.tsx
import type { ISbStoryData } from "@storyblok/react";
import type { Metadata } from "next";
import KenkenFallback from "@/components/brain-boost/kenken/fallback";
import LivePage from "@/components/storyblok/live-page";
import { jsonLdString, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { loadKenkenStory } from "@/lib/storyblok/landing";

export async function generateMetadata(): Promise<Metadata> {
  const story = await loadKenkenStory();
  const c = story?.content;
  return pageMetadata({
    title: c?.seo_title ?? `KenKen — how to play & rules — ${SITE_NAME}`,
    description:
      c?.seo_description ??
      "Learn KenKen: what it is, how to play, the operations, and the difficulty levels. Then play online — free, no sign-up.",
    path: "/brain-boost/kenken",
    keywords: ["KenKen", "how to play KenKen", "KenKen rules", "math puzzle"],
  });
}

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "KenKen",
  url: `${SITE_URL}/brain-boost/kenken`,
  genre: "Logic puzzle",
  applicationCategory: "Game",
  description:
    "KenKen is an arithmetic logic puzzle played on an N×N grid divided into cages with arithmetic targets.",
};

export default async function KenkenInfoPage() {
  const story = await loadKenkenStory();
  const hasBody = Boolean(story?.content?.body?.length);

  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD payload
        dangerouslySetInnerHTML={{ __html: jsonLdString(gameJsonLd) }}
        type="application/ld+json"
      />
      {hasBody && story ? (
        <LivePage
          story={story as unknown as ISbStoryData<Record<string, unknown>>}
        />
      ) : (
        <KenkenFallback />
      )}
    </main>
  );
}
```

- [ ] **Step 2: Build + manual verification**

Run: `bun run build`
Expected: build succeeds; `/brain-boost/kenken` appears in the route list.

Then `bun run dev` and confirm (with **no** Storyblok token, the fallback path):
- `/brain-boost/kenken` renders the full page: hero (Sunset Pulse gradient), "What is KenKen?", how-to steps, operations, levels, closing CTA.
- The Play and Daily CTAs link to `/brain-boost/kenken/play` and `/brain-boost/kenken/daily`.
- No crash, no console errors.

- [ ] **Step 3: Commit**

```bash
bun run format
git add "src/app/(site)/brain-boost/kenken/page.tsx"
git commit -m "feat(brain-boost): add /brain-boost/kenken info page with fallback"
```

---

## Task 8: `/brain-boost` placeholder page

**Files:**
- Create: `src/app/(site)/brain-boost/page.tsx`

Minimal placeholder (heading + link to KenKen) per spec — the full hub is deferred. Excluded from the sitemap. No unit test; build + manual.

- [ ] **Step 1: Write the page**

```tsx
// src/app/(site)/brain-boost/page.tsx
import type { Metadata } from "next";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import { Button } from "@/components/ui/button";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Brain Boost — puzzles & brain games — ${SITE_NAME}`,
  description:
    "Brain Boost is the PBDesk games corner. First up: KenKen, an arithmetic logic puzzle. More games coming soon.",
  path: "/brain-boost",
});

export default function BrainBoostPage() {
  return (
    <main>
      <section
        className="relative overflow-hidden py-24 sm:py-28"
        style={{ background: BRAIN_BOOST_ACCENT.gradient }}
      >
        <div className="wrapper relative z-10 text-center text-white">
          <span
            className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm text-white"
            style={{ background: "rgb(255 255 255 / 0.18)" }}
          >
            Brain Boost
          </span>
          <h1
            className="mt-6 mb-4 font-bold"
            style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.03em" }}
          >
            Brain Boost
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg" style={{ lineHeight: 1.6 }}>
            A corner for puzzles and brain games. First up: KenKen. More to come.
          </p>
          <Button href="/brain-boost/kenken">Explore KenKen</Button>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Build + manual verification**

Run: `bun run build`
Expected: build succeeds; `/brain-boost` appears in the route list. In `bun run dev`, `/brain-boost` renders the placeholder and links to `/brain-boost/kenken`.

- [ ] **Step 3: Commit**

```bash
bun run format
git add "src/app/(site)/brain-boost/page.tsx"
git commit -m "feat(brain-boost): add /brain-boost placeholder page"
```

---

## Task 9: Nav + footer "Brain Boost" entries

**Files:**
- Modify: `src/components/layout/header/header.tsx`
- Modify: `src/components/layout/footer.tsx`

Add "Brain Boost" to the hardcoded default nav lists (CMS-driven nav, when present, is the editor's responsibility). No unit test; build + manual.

- [ ] **Step 1: Add to the header default nav**

In `header.tsx`, update `DEFAULT_NAV_ITEMS` to include Brain Boost (placed after Blog):

```ts
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Bits", href: "/bits" },
  { label: "Bites", href: "/bites" },
  { label: "Blog", href: "/blog" },
  { label: "Brain Boost", href: "/brain-boost" },
  { label: "About", href: "/about" },
];
```

- [ ] **Step 2: Add to the footer Explore column**

In `footer.tsx`, update `DEFAULT_EXPLORE` to include Brain Boost (before "About Me"):

```ts
const DEFAULT_EXPLORE: NavItem[] = [
  { label: "Bits", href: "/bits" },
  { label: "Bites", href: "/bites" },
  { label: "Blog", href: "/blog" },
  { label: "Brain Boost", href: "/brain-boost" },
  { label: "About Me", href: "/about" },
];
```

- [ ] **Step 3: Build + manual verification**

Run: `bun run build`
Expected: build succeeds. In `bun run dev`, the header (desktop + mobile menu) and the footer Explore column show "Brain Boost" linking to `/brain-boost`, with the active underline working on `/brain-boost*` routes.

- [ ] **Step 4: Commit**

```bash
bun run format
git add src/components/layout/header/header.tsx src/components/layout/footer.tsx
git commit -m "feat(brain-boost): add Brain Boost to header and footer nav"
```

---

## Task 10: Sitemap entry

**Files:**
- Modify: `src/app/sitemap.ts`

Add `/brain-boost/kenken` (the canonical, indexable entry point). `/brain-boost`, `/play`, and `/daily` stay **excluded** per spec §2.

- [ ] **Step 1: Add the static route**

In `sitemap.ts`, add to `STATIC_ROUTES` (after the `/labels` entry):

```ts
  { path: "/brain-boost/kenken", changeFrequency: "monthly", priority: 0.7 },
```

- [ ] **Step 2: Verify the sitemap + tests**

Run: `bun test src/lib/sitemap.test.ts src/app/robots.test.ts`
Expected: PASS (these test helpers/structure, not the exact route list; adding a static route should not break them — if a test asserts an exact route count, update it to include the new entry).

Run: `bun run build`
Expected: build succeeds. Optionally in `bun run dev`, `GET /sitemap.xml` includes `/brain-boost/kenken` and excludes `/brain-boost`, `/brain-boost/kenken/play`, `/brain-boost/kenken/daily`.

- [ ] **Step 3: Commit**

```bash
bun run format
git add src/app/sitemap.ts
git commit -m "feat(brain-boost): add /brain-boost/kenken to sitemap"
```

---

## Final verification

- [ ] **Run the full test suite:** `bun test` — all pass.
- [ ] **Run the full check (final/pre-merge):** `bun run check` — clean + lint + build + audit pass.
- [ ] **Manual end-to-end (dev server, no token + then with token if available):**
  - Header/footer show "Brain Boost"; `/brain-boost` placeholder links to KenKen.
  - `/brain-boost/kenken` renders the full fallback (hero, what-is, steps, operations, levels, CTA) with Sunset Pulse accent and working Play/Daily links.
  - With a Storyblok token + a published `kenken_page` story, the page renders the CMS body and the visual editor highlights each blok; publishing revalidates the live page.
  - Sitemap includes `/brain-boost/kenken`, excludes the placeholder + app routes.

---

## Spec coverage check (this plan)

Covers from `2026-05-23-kenken-design.md`: §2 routing — `/brain-boost` placeholder + `/brain-boost/kenken` Storyblok page (Tasks 7,8); §2.B `kenken_page` content type + six body bloks + `loadKenkenStory` (via `storyblokFetch` cache-tag/webhook revalidation) + blok registration + hardcoded fallback + SEO/JSON-LD (Tasks 1,2,4,5,6,7); §3 canonical operation/level copy in the fallback (Task 3); §12 nav/footer "Brain Boost" entries + sitemap addition + `PillarKey`/`pillarAccents` left untouched (Tasks 9,10); standalone Sunset Pulse accent reused from Plan 2 (Tasks 4,8).

**Already delivered:** Plan 1 (engine/generator/library/API); Plan 2 (game engine/state/persistence/client, interactive UI, `/play` + `/daily`, `BRAIN_BOOST_ACCENT`).

**Out of scope (future phases per spec §10):** date-seeded shared daily + archive (Phase 2); progression/level-unlock ladder (Phase 3).
