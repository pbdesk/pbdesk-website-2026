# Brain Boost Hub — Storyblok CMS Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the `/brain-boost` hub page to Storyblok so editors can update all hub copy, game cards, and benefit tiles without a code deploy, while the existing TypeScript constants serve as a hardcoded fallback when Storyblok is unavailable.

**Architecture:** `loadBrainBoostHubStory()` mirrors `loadKenkenStory()` exactly — returns `null` when Storyblok is unconfigured or the story is missing. Both `adaptHubStory()` and `getHubFallback()` return the same `BrainBoostHubData` interface so `page.tsx` never knows which source it's using. Hub components gain optional props that override TypeScript constant defaults.

**Tech Stack:** Next.js 16 App Router, Storyblok Content Delivery API (native fetch client), bun:test, Ultracite/Biome linting, `@tabler/icons-react` v3.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `src/components/brain-boost/hub/meta.ts` | Export `BenefitIconKey`, `Benefit`, `BENEFITS` |
| Modify | `src/lib/storyblok/types.ts` | Add 5 hub Storyblok types |
| Modify | `src/lib/storyblok/client.ts` | Add `fetchBrainBoostHubStory()` |
| Modify | `src/lib/storyblok/landing.ts` | Add `loadBrainBoostHubStory()` |
| Modify | `src/lib/storyblok/adapters.ts` | Add `BrainBoostHubData`, `adaptHubStory()`, `getHubFallback()` |
| Modify | `src/lib/storyblok/adapters.test.ts` | Add tests for adapter + fallback |
| Modify | `src/components/brain-boost/hub/brain-boost-benefits.tsx` | Import from meta.ts; accept optional props |
| Modify | `src/components/brain-boost/hub/brain-boost-intro.tsx` | Accept optional props |
| Modify | `src/components/brain-boost/hub/brain-boost-featured-kenken.tsx` | Accept optional game prop |
| Modify | `src/components/brain-boost/hub/brain-boost-daily-strip.tsx` | Accept optional props |
| Modify | `src/components/brain-boost/hub/brain-boost-coming-soon.tsx` | Accept optional games prop |
| Modify | `src/app/(site)/brain-boost/page.tsx` | Fetch hub story, pass props |
| Create | `scripts/seed-brain-boost-hub.ts` | Seed 4 hub blok schemas + story |
| Modify | `package.json` | Add `seed:brain-boost-hub` script |

---

### Task 1: Export `BenefitIconKey`, `Benefit`, and `BENEFITS` from `meta.ts`

**Files:**
- Modify: `src/components/brain-boost/hub/meta.ts`

The adapter in Task 4 needs to import these. Moving them out of `brain-boost-benefits.tsx` also avoids ReactNode-in-data in the adapters layer — `ICON_MAP` stays in the component (Task 5), the data stays in `meta.ts`.

- [ ] **Step 1: Update `meta.ts`**

Replace the entire file content with:

```ts
export const BRAIN_BOOST_TITLE = "Brain Boost";
export const BRAIN_BOOST_TAGLINE = "Short games for long focus.";
export const BRAIN_BOOST_LEDE =
  "A new corner of PBDesk for short, focused puzzles that sharpen the mind between Bits and Bites. Twenty minutes of arithmetic logic, one solved grid at a time — the kind of quiet focus that resets a working day. KenKen is here today; more games are queued.";

export type BrainBoostMetaIcon = "Layers" | "Target" | "Sparkles" | "Calendar";

export interface BrainBoostMetaItem {
  icon: BrainBoostMetaIcon;
  label: string;
  value: string;
}

export const BRAIN_BOOST_META: readonly BrainBoostMetaItem[] = [
  { value: "1", label: "game live", icon: "Layers" },
  { value: "4", label: "difficulty tiers", icon: "Target" },
  { value: "~200", label: "hand-checked puzzles", icon: "Sparkles" },
  { value: "1", label: "new puzzle every day", icon: "Calendar" },
] as const;

export type BenefitIconKey = "Target" | "Brain" | "Clock" | "Flame";

export interface Benefit {
  body: string;
  icon: BenefitIconKey;
  title: string;
}

export const BENEFITS: readonly Benefit[] = [
  {
    icon: "Target",
    title: "Single-task focus",
    body: "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
  },
  {
    icon: "Brain",
    title: "Working-memory workout",
    body: 'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
  },
  {
    icon: "Clock",
    title: "Designed to be short",
    body: "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
  },
  {
    icon: "Flame",
    title: "Daily ritual, no streak shame",
    body: "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
  },
];
```

- [ ] **Step 2: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/brain-boost/hub/meta.ts
git commit -m "feat(brain-boost): export BenefitIconKey, Benefit, BENEFITS from meta.ts"
```

---

### Task 2: Add Storyblok hub types to `types.ts`

**Files:**
- Modify: `src/lib/storyblok/types.ts`

- [ ] **Step 1: Append 5 new interfaces + type aliases to `types.ts`**

Add the following after the `KenkenPageStoryContent` interface and before the export type aliases block at the bottom of the file:

```ts
export interface HubMetaItemBlok extends SbBlokBase {
  component: "hub_meta_item";
  icon: "Layers" | "Target" | "Sparkles" | "Calendar";
  label: string;
  value: string;
}

export interface HubGameBlok extends SbBlokBase {
  category: string;
  component: "hub_game";
  cover_image?: string;
  description?: string;
  est_time?: string;
  glyph?: string;
  href?: string;
  name: string;
  operations?: string;
  slug: string;
  status: "live" | "coming-q3" | "coming-q4" | "exploring";
  tiers?: number;
}

export interface HubBenefitBlok extends SbBlokBase {
  body: string;
  component: "hub_benefit";
  icon: "Target" | "Brain" | "Clock" | "Flame";
  title: string;
}

export interface BrainBoostHubPageStoryContent extends SbBlokBase {
  benefits?: HubBenefitBlok[];
  benefits_heading?: string;
  component: "brain_boost_hub_page";
  daily_body?: string;
  daily_cta_play?: string;
  daily_heading?: string;
  games?: HubGameBlok[];
  intro_lede?: string;
  intro_tagline?: string;
  intro_title?: string;
  meta_items?: HubMetaItemBlok[];
  seo_description?: string;
  seo_title?: string;
}
```

Then add to the export type aliases block at the bottom:

```ts
export type BrainBoostHubPageStory = ISbStoryData<BrainBoostHubPageStoryContent>;
```

- [ ] **Step 2: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/storyblok/types.ts
git commit -m "feat(storyblok): add hub blok types and BrainBoostHubPageStory"
```

---

### Task 3: Add fetch and load functions for the hub story

**Files:**
- Modify: `src/lib/storyblok/client.ts`
- Modify: `src/lib/storyblok/landing.ts`

- [ ] **Step 1: Add `fetchBrainBoostHubStory()` to `client.ts`**

In `src/lib/storyblok/client.ts`, add to the import block:

```ts
import type {
  // ... existing imports ...
  BrainBoostHubPageStory,
} from "./types";
```

Then add after `fetchKenkenStory()`:

```ts
export function fetchBrainBoostHubStory(): Promise<BrainBoostHubPageStory | null> {
  return fetchStoryRaw<BrainBoostHubPageStory>("brain-boost/hub");
}
```

- [ ] **Step 2: Add `loadBrainBoostHubStory()` to `landing.ts`**

In `src/lib/storyblok/landing.ts`, add to the import block:

```ts
import {
  // ... existing imports ...
  fetchBrainBoostHubStory,
} from "./client";
import type {
  // ... existing imports ...
  BrainBoostHubPageStory,
} from "./types";
```

Then add after `loadKenkenStory()`:

```ts
/**
 * Fetch the `brain-boost/hub` singleton story. Returns null when Storyblok
 * isn't configured or the story doesn't exist — the hub page falls back to
 * its hardcoded TypeScript constants in that case.
 */
export async function loadBrainBoostHubStory(): Promise<BrainBoostHubPageStory | null> {
  if (!isStoryblokConfigured()) {
    return null;
  }
  try {
    return await fetchBrainBoostHubStory();
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/storyblok/client.ts src/lib/storyblok/landing.ts
git commit -m "feat(storyblok): add fetchBrainBoostHubStory and loadBrainBoostHubStory"
```

---

### Task 4: Add `BrainBoostHubData`, `adaptHubStory()`, `getHubFallback()` with tests (TDD)

**Files:**
- Modify: `src/lib/storyblok/adapters.ts`
- Modify: `src/lib/storyblok/adapters.test.ts`

- [ ] **Step 1: Write failing tests in `adapters.test.ts`**

Append to `src/lib/storyblok/adapters.test.ts`:

```ts
import {
  adaptHubStory,
  getHubFallback,
  type BrainBoostHubData,
} from "./adapters";
import type {
  BrainBoostHubPageStory,
  HubBenefitBlok,
  HubGameBlok,
  HubMetaItemBlok,
} from "./types";

function makeHubStory(
  overrides: Partial<BrainBoostHubPageStory["content"]> = {}
): BrainBoostHubPageStory {
  const metaItem: HubMetaItemBlok = {
    _uid: "m1",
    component: "hub_meta_item",
    value: "5",
    label: "games live",
    icon: "Layers",
  };
  const game: HubGameBlok = {
    _uid: "g1",
    component: "hub_game",
    slug: "sudoku",
    name: "Sudoku",
    status: "live",
    category: "Logic",
    description: "Classic 9×9.",
    href: "/brain-boost/sudoku",
  };
  const benefit: HubBenefitBlok = {
    _uid: "b1",
    component: "hub_benefit",
    icon: "Brain",
    title: "Focus",
    body: "Stay focused.",
  };
  return {
    _uid: "story",
    component: "brain_boost_hub_page",
    intro_title: "My Brain Boost",
    intro_tagline: "Custom tagline",
    intro_lede: "Custom lede text.",
    meta_items: [metaItem],
    games: [game],
    daily_heading: "Today's KenKen",
    daily_body: "A fresh puzzle every day.",
    daily_cta_play: "Play now",
    benefits_heading: "Why play?",
    benefits: [benefit],
    seo_title: "Custom SEO title",
    seo_description: "Custom SEO desc.",
    ...overrides,
  } as unknown as BrainBoostHubPageStory;
}

describe("adaptHubStory", () => {
  test("maps intro fields", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.title).toBe("My Brain Boost");
    expect(data.tagline).toBe("Custom tagline");
    expect(data.lede).toBe("Custom lede text.");
  });

  test("maps meta items", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.metaItems).toHaveLength(1);
    expect(data.metaItems[0].value).toBe("5");
    expect(data.metaItems[0].label).toBe("games live");
    expect(data.metaItems[0].icon).toBe("Layers");
  });

  test("maps games", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.games).toHaveLength(1);
    expect(data.games[0].slug).toBe("sudoku");
    expect(data.games[0].status).toBe("live");
    expect(data.games[0].href).toBe("/brain-boost/sudoku");
  });

  test("maps daily strip fields", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.dailyHeading).toBe("Today's KenKen");
    expect(data.dailyBody).toBe("A fresh puzzle every day.");
    expect(data.dailyCtaPlay).toBe("Play now");
  });

  test("maps benefits", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.benefits).toHaveLength(1);
    expect(data.benefits[0].icon).toBe("Brain");
    expect(data.benefits[0].title).toBe("Focus");
    expect(data.benefits[0].body).toBe("Stay focused.");
  });

  test("maps SEO fields", () => {
    const data = adaptHubStory(makeHubStory());
    expect(data.seoTitle).toBe("Custom SEO title");
    expect(data.seoDescription).toBe("Custom SEO desc.");
  });

  test("returns empty arrays when blok arrays are absent", () => {
    const data = adaptHubStory(
      makeHubStory({ meta_items: undefined, games: undefined, benefits: undefined })
    );
    expect(data.metaItems).toEqual([]);
    expect(data.games).toEqual([]);
    expect(data.benefits).toEqual([]);
  });
});

describe("getHubFallback", () => {
  test("returns a valid BrainBoostHubData shape", () => {
    const data: BrainBoostHubData = getHubFallback();
    expect(data.title).toBeTruthy();
    expect(data.lede).toBeTruthy();
    expect(data.metaItems.length).toBeGreaterThan(0);
    expect(data.games.length).toBeGreaterThan(0);
    expect(data.benefits.length).toBeGreaterThan(0);
  });

  test("fallback metaItems match BRAIN_BOOST_META", () => {
    const data = getHubFallback();
    expect(data.metaItems[0].icon).toBe("Layers");
    expect(data.metaItems[0].value).toBe("1");
  });

  test("fallback games include the live KenKen entry", () => {
    const data = getHubFallback();
    const kenken = data.games.find((g) => g.slug === "kenken");
    expect(kenken).toBeDefined();
    expect(kenken?.status).toBe("live");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun test src/lib/storyblok/adapters.test.ts
```

Expected: FAIL — `adaptHubStory`, `getHubFallback`, `BrainBoostHubData` not found.

- [ ] **Step 3: Implement in `adapters.ts`**

Append to `src/lib/storyblok/adapters.ts`:

```ts
import type {
  Benefit,
  BenefitIconKey,
  BrainBoostMetaItem,
} from "@/components/brain-boost/hub/meta";
import {
  BENEFITS,
  BRAIN_BOOST_LEDE,
  BRAIN_BOOST_META,
  BRAIN_BOOST_TAGLINE,
  BRAIN_BOOST_TITLE,
} from "@/components/brain-boost/hub/meta";
import type { BrainBoostGame } from "@/components/brain-boost/hub/games-registry";
import { BRAIN_BOOST_GAMES } from "@/components/brain-boost/hub/games-registry";
import type {
  BrainBoostHubPageStory,
  HubBenefitBlok,
  HubGameBlok,
  HubMetaItemBlok,
} from "./types";

export interface BrainBoostHubData {
  benefits: Benefit[];
  benefitsHeading: string;
  dailyBody: string;
  dailyCtaPlay: string;
  dailyHeading: string;
  games: BrainBoostGame[];
  lede: string;
  metaItems: BrainBoostMetaItem[];
  seoDescription: string;
  seoTitle: string;
  tagline: string;
  title: string;
}

function adaptMetaItem(blok: HubMetaItemBlok): BrainBoostMetaItem {
  return { value: blok.value, label: blok.label, icon: blok.icon };
}

function adaptGame(blok: HubGameBlok): BrainBoostGame {
  return {
    slug: blok.slug,
    name: blok.name,
    status: blok.status,
    category: blok.category,
    description: blok.description ?? "",
    href: blok.href,
    coverImage: blok.cover_image,
    glyph: blok.glyph,
    tiers: blok.tiers,
    estTime: blok.est_time,
    operations: blok.operations,
  };
}

function adaptBenefit(blok: HubBenefitBlok): Benefit {
  return { icon: blok.icon as BenefitIconKey, title: blok.title, body: blok.body };
}

export function adaptHubStory(story: BrainBoostHubPageStory): BrainBoostHubData {
  const c = story.content ?? (story as unknown as BrainBoostHubPageStory["content"]);
  // story.content is the typed content when fetched via loadBrainBoostHubStory;
  // in tests the whole object is passed directly as the story shape.
  const content = (story as { content?: typeof c }).content ?? c;
  return {
    title: content.intro_title ?? BRAIN_BOOST_TITLE,
    tagline: content.intro_tagline ?? BRAIN_BOOST_TAGLINE,
    lede: content.intro_lede ?? BRAIN_BOOST_LEDE,
    metaItems: (content.meta_items ?? []).map(adaptMetaItem),
    games: (content.games ?? []).map(adaptGame),
    dailyHeading: content.daily_heading ?? "Today's daily — Intermediate",
    dailyBody:
      content.daily_body ??
      "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
    dailyCtaPlay: content.daily_cta_play ?? "Play today's",
    benefitsHeading: content.benefits_heading ?? "Why Brain Boost?",
    benefits: (content.benefits ?? []).map(adaptBenefit),
    seoTitle: content.seo_title ?? "",
    seoDescription: content.seo_description ?? "",
  };
}

export function getHubFallback(): BrainBoostHubData {
  return {
    title: BRAIN_BOOST_TITLE,
    tagline: BRAIN_BOOST_TAGLINE,
    lede: BRAIN_BOOST_LEDE,
    metaItems: [...BRAIN_BOOST_META],
    games: [...BRAIN_BOOST_GAMES],
    dailyHeading: "Today's daily — Intermediate",
    dailyBody:
      "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
    dailyCtaPlay: "Play today's",
    benefitsHeading: "Why Brain Boost?",
    benefits: [...BENEFITS],
    seoTitle: "",
    seoDescription: "",
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun test src/lib/storyblok/adapters.test.ts
```

Expected: all tests PASS (10 new + existing tests).

- [ ] **Step 5: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/storyblok/adapters.ts src/lib/storyblok/adapters.test.ts
git commit -m "feat(storyblok): add BrainBoostHubData, adaptHubStory, getHubFallback with tests"
```

---

### Task 5: Update `brain-boost-benefits.tsx` — import from `meta.ts`, accept optional props

**Files:**
- Modify: `src/components/brain-boost/hub/brain-boost-benefits.tsx`

The component's `BENEFITS` constant and `Benefit` type now live in `meta.ts`. The `icon` field is now a `BenefitIconKey` string, so `ICON_MAP` maps it to the JSX element locally.

- [ ] **Step 1: Replace the entire file**

```tsx
import {
  IconBrain,
  IconClock,
  IconFlame,
  IconTarget,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import {
  BENEFITS,
  type BenefitIconKey,
  type Benefit,
} from "./meta";

const ICON_MAP: Record<BenefitIconKey, ReactNode> = {
  Target: <IconTarget size={20} />,
  Brain: <IconBrain size={20} />,
  Clock: <IconClock size={20} />,
  Flame: <IconFlame size={20} />,
};

interface BrainBoostBenefitsProps {
  benefits?: readonly Benefit[];
  heading?: string;
}

export default function BrainBoostBenefits({
  benefits = BENEFITS,
  heading = "Why Brain Boost?",
}: BrainBoostBenefitsProps) {
  const tileBg = `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 12%, transparent)`;
  return (
    <section className="wrapper py-12">
      <h2
        className="mb-6 font-extrabold"
        style={{
          fontSize: "clamp(28px, 3.4vw, 40px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        <span className="bb-gradient-text">{heading}</span>
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <article
            className="flex flex-col gap-3 rounded-2xl border p-6"
            key={b.title}
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <span
              aria-hidden="true"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: tileBg, color: BRAIN_BOOST_ACCENT.primary }}
            >
              {ICON_MAP[b.icon]}
            </span>
            <h3
              className="font-bold"
              style={{ fontSize: 18, lineHeight: 1.25 }}
            >
              {b.title}
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--fg-secondary)", lineHeight: 1.65 }}
            >
              {b.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/brain-boost/hub/brain-boost-benefits.tsx
git commit -m "feat(brain-boost): make BrainBoostBenefits prop-driven, import data from meta.ts"
```

---

### Task 6: Add optional props to the four remaining hub components

**Files:**
- Modify: `src/components/brain-boost/hub/brain-boost-intro.tsx`
- Modify: `src/components/brain-boost/hub/brain-boost-featured-kenken.tsx`
- Modify: `src/components/brain-boost/hub/brain-boost-daily-strip.tsx`
- Modify: `src/components/brain-boost/hub/brain-boost-coming-soon.tsx`

#### 6a — `brain-boost-intro.tsx`

- [ ] **Step 1: Replace the component signature and body**

The component currently reads `BRAIN_BOOST_LEDE` and `BRAIN_BOOST_META` directly. Add optional props that override those defaults:

```tsx
import {
  IconCalendar,
  IconSparkles,
  IconStack,
  IconTarget,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import {
  BRAIN_BOOST_LEDE,
  BRAIN_BOOST_META,
  type BrainBoostMetaIcon,
  type BrainBoostMetaItem,
} from "./meta";

const ICON_MAP: Record<BrainBoostMetaIcon, ReactNode> = {
  Layers: <IconStack size={18} />,
  Target: <IconTarget size={18} />,
  Sparkles: <IconSparkles size={18} />,
  Calendar: <IconCalendar size={18} />,
};

interface BrainBoostIntroProps {
  lede?: string;
  metaItems?: readonly BrainBoostMetaItem[];
}

export default function BrainBoostIntro({
  lede = BRAIN_BOOST_LEDE,
  metaItems = BRAIN_BOOST_META,
}: BrainBoostIntroProps) {
  const tileBg = `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 12%, transparent)`;
  return (
    <section className="wrapper py-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center justify-center gap-2 text-sm"
        style={{ color: "var(--fg-muted)" }}
      >
        <Link className="hover:underline" href="/">
          PBDesk
        </Link>
        <span aria-hidden="true">/</span>
        <span
          aria-current="page"
          style={{ color: "var(--fg-primary)", fontWeight: 600 }}
        >
          Brain Boost
        </span>
      </nav>

      <h1
        className="text-center font-extrabold"
        style={{
          fontSize: "clamp(48px, 6vw, 80px)",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        My <span className="bb-gradient-text">Brain Boost</span>
      </h1>

      <p
        className="mx-auto mt-6 max-w-3xl text-center text-base sm:text-lg"
        style={{ color: "var(--fg-secondary)", lineHeight: 1.7 }}
      >
        {lede}
      </p>

      <div
        className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t pt-8"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {metaItems.map((item) => (
          <span
            className="flex items-center gap-3 text-sm"
            key={item.label}
            style={{ color: "var(--fg-secondary)" }}
          >
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: tileBg, color: BRAIN_BOOST_ACCENT.primary }}
            >
              {ICON_MAP[item.icon]}
            </span>
            <span>
              <strong style={{ color: "var(--fg-primary)" }}>
                {item.value}
              </strong>{" "}
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
```

#### 6b — `brain-boost-featured-kenken.tsx`

- [ ] **Step 2: Add optional `game` prop**

The component renders the live game card. When `game` is provided (from CMS), use it; otherwise fall back to `BRAIN_BOOST_GAMES.find(kenken)`.

Add the import and update the function signature at the top of the file:

```tsx
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { BrainBoostGame } from "./games-registry";
import { BRAIN_BOOST_GAMES } from "./games-registry";

interface BrainBoostFeaturedKenkenProps {
  game?: BrainBoostGame;
}

export default function BrainBoostFeaturedKenken({
  game,
}: BrainBoostFeaturedKenkenProps) {
  const kenken = game ?? BRAIN_BOOST_GAMES.find((g) => g.slug === "kenken");
  if (!kenken) {
    return null;
  }
  // ... rest of the JSX unchanged ...
```

The JSX body (everything after `if (!kenken)`) remains identical to the current file. Only the import block, interface, and function signature change.

#### 6c — `brain-boost-daily-strip.tsx`

- [ ] **Step 3: Add optional heading/body/ctaPlay props**

Replace the component with:

```tsx
import { IconCalendar, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";

interface BrainBoostDailyStripProps {
  body?: string;
  ctaPlay?: string;
  heading?: string;
}

export default function BrainBoostDailyStrip({
  body = "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
  ctaPlay = "Play today's",
  heading = "Today's daily — Intermediate",
}: BrainBoostDailyStripProps) {
  return (
    <section className="wrapper py-6">
      <div className="bb-gradient-bg relative grid items-center gap-6 overflow-hidden rounded-2xl p-9 text-white md:grid-cols-[1fr_auto] md:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 80% 30%, rgb(255 255 255 / 0.18), transparent 50%)",
          }}
        />
        <div className="relative">
          <h3
            className="font-extrabold"
            style={{ fontSize: 28, lineHeight: 1.15 }}
          >
            {heading}
          </h3>
          <p
            className="mt-2 max-w-2xl text-sm sm:text-base"
            style={{ color: "rgb(255 255 255 / 0.85)", lineHeight: 1.6 }}
          >
            {body}
          </p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-sm"
            href="/brain-boost/kenken/daily"
            style={{ color: "#9a3412" }}
          >
            <IconPlayerPlay size={14} /> {ctaPlay}
          </Link>
          {/* TODO archive route — Phase 2 of the spec (date-seeded daily + archive) */}
          <button
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border px-5 py-2.5 font-medium text-sm text-white opacity-60"
            disabled
            style={{
              background: "rgb(255 255 255 / 0.12)",
              borderColor: "rgb(255 255 255 / 0.4)",
            }}
            type="button"
          >
            <IconCalendar size={14} /> Archive
          </button>
        </div>
      </div>
    </section>
  );
}
```

#### 6d — `brain-boost-coming-soon.tsx`

- [ ] **Step 4: Add optional `games` prop**

```tsx
import type { BrainBoostGame } from "./games-registry";
import { BRAIN_BOOST_GAMES, STATUS_LABEL } from "./games-registry";

interface BrainBoostComingSoonProps {
  games?: BrainBoostGame[];
}

export default function BrainBoostComingSoon({
  games = BRAIN_BOOST_GAMES,
}: BrainBoostComingSoonProps) {
  const coming = games.filter((g) => g.status !== "live");
  return (
    <section className="wrapper py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2
          className="font-extrabold"
          style={{
            fontSize: "clamp(28px, 3.4vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          <span className="bb-gradient-text">Coming next</span>
        </h2>
        {/* TODO voting route — Phase 2+ */}
        <span
          className="font-mono text-xs uppercase tracking-[0.08em]"
          style={{ color: "var(--fg-muted)" }}
        >
          Vote on what's next →
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {coming.map((game) => (
          <article
            className="flex min-h-[220px] flex-col gap-[14px] rounded-2xl p-7"
            key={game.slug}
            style={{
              background: "var(--bg-subtle)",
              border: "1px dashed var(--border-strong)",
            }}
          >
            <span
              className="inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em]"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--fg-secondary)",
              }}
            >
              {STATUS_LABEL[game.status]}
            </span>
            <h3 className="font-bold" style={{ fontSize: 20, lineHeight: 1.2 }}>
              {game.name}
            </h3>
            <p
              className="text-[13px]"
              style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}
            >
              {game.description}
            </p>
            {game.glyph ? (
              <span
                aria-hidden="true"
                className="bb-gradient-text mt-auto font-bold font-mono text-[36px]"
                style={{ opacity: 0.7 }}
              >
                {game.glyph}
              </span>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 6: Run existing tests to confirm no regressions**

```bash
bun test
```

Expected: all tests PASS (games-registry.test.ts + adapters.test.ts).

- [ ] **Step 7: Commit**

```bash
git add \
  src/components/brain-boost/hub/brain-boost-intro.tsx \
  src/components/brain-boost/hub/brain-boost-featured-kenken.tsx \
  src/components/brain-boost/hub/brain-boost-daily-strip.tsx \
  src/components/brain-boost/hub/brain-boost-coming-soon.tsx
git commit -m "feat(brain-boost): add optional CMS-override props to hub components"
```

---

### Task 7: Update `page.tsx` to fetch hub story and pass props

**Files:**
- Modify: `src/app/(site)/brain-boost/page.tsx`

- [ ] **Step 1: Replace the page file**

```tsx
import type { Metadata } from "next";
import BrainBoostBenefits from "@/components/brain-boost/hub/brain-boost-benefits";
import BrainBoostComingSoon from "@/components/brain-boost/hub/brain-boost-coming-soon";
import BrainBoostDailyStrip from "@/components/brain-boost/hub/brain-boost-daily-strip";
import BrainBoostFeaturedKenken from "@/components/brain-boost/hub/brain-boost-featured-kenken";
import BrainBoostHero from "@/components/brain-boost/hub/brain-boost-hero";
import BrainBoostIntro from "@/components/brain-boost/hub/brain-boost-intro";
import { BRAIN_BOOST_LEDE } from "@/components/brain-boost/hub/meta";
import {
  adaptHubStory,
  getHubFallback,
} from "@/lib/storyblok/adapters";
import { loadBrainBoostHubStory } from "@/lib/storyblok/landing";
import {
  jsonLdString,
  pageMetadata,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Brain Boost — Short games for long focus",
  description:
    "Brain Boost is PBDesk's small puzzle corner — KenKen today, more queued. A fresh daily puzzle, four difficulty tiers, hand-checked games designed to fit a coffee break.",
  path: "/brain-boost",
  keywords: [
    "puzzles",
    "kenken",
    "brain training",
    "focus",
    "logic puzzles",
    "PBDesk",
  ],
});

export default async function BrainBoostHubPage() {
  const story = await loadBrainBoostHubStory();
  const hub = story ? adaptHubStory(story) : getHubFallback();

  const liveGame = hub.games.find((g) => g.status === "live");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} Brain Boost`,
    url: `${SITE_URL}/brain-boost`,
    description: BRAIN_BOOST_LEDE,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE_AUTHOR, url: SITE_URL },
  };
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        type="application/ld+json"
      />
      <main>
        <BrainBoostHero />
        <BrainBoostIntro lede={hub.lede} metaItems={hub.metaItems} />
        <BrainBoostFeaturedKenken game={liveGame} />
        <BrainBoostDailyStrip
          heading={hub.dailyHeading}
          body={hub.dailyBody}
          ctaPlay={hub.dailyCtaPlay}
        />
        <BrainBoostComingSoon games={hub.games} />
        <BrainBoostBenefits
          heading={hub.benefitsHeading}
          benefits={hub.benefits}
        />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 3: Run full build**

```bash
bun run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/brain-boost/page.tsx"
git commit -m "feat(brain-boost): wire hub page to Storyblok CMS with TypeScript fallback"
```

---

### Task 8: Create `seed-brain-boost-hub.ts` and add npm script

**Files:**
- Create: `scripts/seed-brain-boost-hub.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/seed-brain-boost-hub.ts`**

```ts
#!/usr/bin/env bun
// scripts/seed-brain-boost-hub.ts
//
// Stand-alone seeder for the /brain-boost/hub story.
// Pushes 4 hub blok schemas (hub_meta_item, hub_game, hub_benefit,
// brain_boost_hub_page) and upserts brain-boost/hub story.
// Does NOT touch kenken_* schemas or the brain-boost/kenken story.
//
// Usage:
//   STORYBLOK_MANAGEMENT_TOKEN=... STORYBLOK_SPACE_ID=... bun run seed:brain-boost-hub
//
// Idempotent: safe to re-run.

import {
  type SbComponent,
  type SbComponentField,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";

let pos = 0;
function reset(): void {
  pos = 0;
}
function field<T extends Omit<SbComponentField, "pos">>(
  input: T
): T & { pos: number } {
  pos += 1;
  return { ...input, pos } as T & { pos: number };
}
function f<T extends Record<string, SbComponentField>>(schema: T): T {
  return schema;
}

// ---------------------------------------------------------------------------
// hub_* component schemas
// ---------------------------------------------------------------------------

const HUB_COMPONENTS: SbComponent[] = [
  (() => {
    reset();
    return {
      name: "hub_meta_item",
      display_name: "Hub Meta Item",
      is_root: false,
      is_nestable: true,
      icon: "block-text-img-left",
      preview_field: "label",
      schema: f({
        value: field({ type: "text", display_name: "Value", required: true }),
        label: field({ type: "text", display_name: "Label", required: true }),
        icon: field({
          type: "option",
          display_name: "Icon",
          required: true,
          options: [
            { value: "Layers", name: "Layers" },
            { value: "Target", name: "Target" },
            { value: "Sparkles", name: "Sparkles" },
            { value: "Calendar", name: "Calendar" },
          ],
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "hub_game",
      display_name: "Hub Game",
      is_root: false,
      is_nestable: true,
      icon: "block-table",
      preview_field: "name",
      schema: f({
        slug: field({ type: "text", display_name: "Slug", required: true }),
        name: field({ type: "text", display_name: "Name", required: true }),
        status: field({
          type: "option",
          display_name: "Status",
          required: true,
          options: [
            { value: "live", name: "Live" },
            { value: "coming-q3", name: "Coming Q3" },
            { value: "coming-q4", name: "Coming Q4" },
            { value: "exploring", name: "Exploring" },
          ],
        }),
        category: field({ type: "text", display_name: "Category" }),
        description: field({ type: "textarea", display_name: "Description" }),
        href: field({ type: "text", display_name: "Href (live games only)" }),
        cover_image: field({ type: "text", display_name: "Cover Image Path" }),
        glyph: field({ type: "text", display_name: "Glyph (coming-soon)" }),
        tiers: field({ type: "number", display_name: "Tiers" }),
        est_time: field({ type: "text", display_name: "Est. Time" }),
        operations: field({ type: "text", display_name: "Operations" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "hub_benefit",
      display_name: "Hub Benefit",
      is_root: false,
      is_nestable: true,
      icon: "block-stars",
      preview_field: "title",
      schema: f({
        icon: field({
          type: "option",
          display_name: "Icon",
          required: true,
          options: [
            { value: "Target", name: "Target" },
            { value: "Brain", name: "Brain" },
            { value: "Clock", name: "Clock" },
            { value: "Flame", name: "Flame" },
          ],
        }),
        title: field({ type: "text", display_name: "Title", required: true }),
        body: field({ type: "textarea", display_name: "Body", required: true }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "brain_boost_hub_page",
      display_name: "Brain Boost Hub Page",
      is_root: true,
      is_nestable: false,
      icon: "block-buildin",
      schema: f({
        intro_title: field({ type: "text", display_name: "Intro Title" }),
        intro_tagline: field({ type: "text", display_name: "Intro Tagline" }),
        intro_lede: field({ type: "textarea", display_name: "Intro Lede" }),
        meta_items: field({
          type: "bloks",
          display_name: "Meta Items",
          restrict_components: true,
          component_whitelist: ["hub_meta_item"],
        }),
        games: field({
          type: "bloks",
          display_name: "Games",
          restrict_components: true,
          component_whitelist: ["hub_game"],
        }),
        daily_heading: field({ type: "text", display_name: "Daily Heading" }),
        daily_body: field({ type: "textarea", display_name: "Daily Body" }),
        daily_cta_play: field({ type: "text", display_name: "Daily CTA: Play" }),
        benefits_heading: field({
          type: "text",
          display_name: "Benefits Heading",
        }),
        benefits: field({
          type: "bloks",
          display_name: "Benefits",
          restrict_components: true,
          component_whitelist: ["hub_benefit"],
        }),
        seo_title: field({ type: "text", display_name: "SEO Title" }),
        seo_description: field({
          type: "textarea",
          display_name: "SEO Description",
        }),
      }),
    };
  })(),
];

// ---------------------------------------------------------------------------
// Seed story content
// ---------------------------------------------------------------------------

const BRAIN_BOOST_FOLDER = { name: "Brain Boost", slug: "brain-boost" };

const HUB_STORY_CONTENT: SbStoryContent = {
  component: "brain_boost_hub_page",
  intro_title: "My Brain Boost",
  intro_tagline: "Short games for long focus.",
  intro_lede:
    "A new corner of PBDesk for short, focused puzzles that sharpen the mind between Bits and Bites. Twenty minutes of arithmetic logic, one solved grid at a time — the kind of quiet focus that resets a working day. KenKen is here today; more games are queued.",
  meta_items: [
    {
      component: "hub_meta_item",
      value: "1",
      label: "game live",
      icon: "Layers",
    },
    {
      component: "hub_meta_item",
      value: "4",
      label: "difficulty tiers",
      icon: "Target",
    },
    {
      component: "hub_meta_item",
      value: "~200",
      label: "hand-checked puzzles",
      icon: "Sparkles",
    },
    {
      component: "hub_meta_item",
      value: "1",
      label: "new puzzle every day",
      icon: "Calendar",
    },
  ],
  games: [
    {
      component: "hub_game",
      slug: "kenken",
      name: "KenKen",
      status: "live",
      category: "Arithmetic · Logic",
      description:
        "Fill an N×N grid so digits don't repeat in any row or column — the catch: outlined cages must hit their target with +, −, ×, or ÷. Pure logic, no guessing required.",
      href: "/brain-boost/kenken",
      cover_image: "/pillers/kenken-banner.png",
      tiers: 4,
      est_time: "10–25 min",
      operations: "+ − × ÷",
    },
    {
      component: "hub_game",
      slug: "sudoku",
      name: "Sudoku",
      status: "coming-q3",
      glyph: "SUD",
      category: "Logic",
      description:
        "Classic 9×9 with hand-picked difficulty curves and a no-mark-ups expert mode.",
    },
    {
      component: "hub_game",
      slug: "cryptic",
      name: "Cryptic Mini",
      status: "coming-q4",
      glyph: "CRY",
      category: "Words",
      description:
        "Five-clue cryptic crossword, finishable on a coffee break. Each solved clue links to its wordplay.",
    },
    {
      component: "hub_game",
      slug: "logic-grid",
      name: "Logic Grid",
      status: "exploring",
      glyph: "LOG",
      category: "Logic",
      description:
        "Five-by-five attribute deduction puzzles — the kind your physics teacher used to print and hand out.",
    },
  ],
  daily_heading: "Today's daily — Intermediate",
  daily_body:
    "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one.",
  daily_cta_play: "Play today's",
  benefits_heading: "Why Brain Boost?",
  benefits: [
    {
      component: "hub_benefit",
      icon: "Target",
      title: "Single-task focus",
      body: "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
    },
    {
      component: "hub_benefit",
      icon: "Brain",
      title: "Working-memory workout",
      body: 'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
    },
    {
      component: "hub_benefit",
      icon: "Clock",
      title: "Designed to be short",
      body: "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
    },
    {
      component: "hub_benefit",
      icon: "Flame",
      title: "Daily ritual, no streak shame",
      body: "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
    },
  ],
  seo_title: "Brain Boost — Short games for long focus | PBDesk",
  seo_description:
    "Brain Boost is PBDesk's small puzzle corner — KenKen today, more queued. A fresh daily puzzle, four difficulty tiers, hand-checked games designed to fit a coffee break.",
};

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required (export or .env.local).`);
  }
  return value;
}

function logStep(label: string): void {
  process.stdout.write(`${label}\n`);
}

function logRow(line: string): void {
  process.stdout.write(`  ${line}\n`);
}

async function main(): Promise<void> {
  const token = requireEnv("STORYBLOK_MANAGEMENT_TOKEN");
  const spaceId = requireEnv("STORYBLOK_SPACE_ID");
  const region = process.env.STORYBLOK_REGION ?? "eu";

  const sb = new StoryblokManagement({ token, spaceId, region });

  logStep("\n[1/3] Pushing hub component schemas...");
  for (const component of HUB_COMPONENTS) {
    const { record, created } = await sb.upsertComponent(component);
    logRow(`${created ? "+" : "·"} ${component.name} (#${record.id})`);
  }

  logStep("\n[2/3] Ensuring brain-boost folder...");
  const { record: folderRecord, created: folderCreated } =
    await sb.upsertFolder(BRAIN_BOOST_FOLDER);
  logRow(
    `${folderCreated ? "+" : "·"} ${BRAIN_BOOST_FOLDER.slug}/ (#${folderRecord.id})`
  );

  logStep("\n[3/3] Upserting brain-boost/hub story...");
  const { record: storyRecord, created: storyCreated } = await sb.upsertStory({
    name: "Brain Boost Hub",
    slug: "hub",
    full_slug: "brain-boost/hub",
    parent_id: folderRecord.id,
    content: HUB_STORY_CONTENT,
  });
  await sb.publishStory(storyRecord.id);
  logRow(
    `${storyCreated ? "+" : "·"} ${storyRecord.full_slug} (#${storyRecord.id}, published)`
  );

  process.stdout.write("\nDone.\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nseed-brain-boost-hub failed: ${message}\n`);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script to `package.json`**

Find `"seed:kenken"` in `package.json` and add after it:

```json
"seed:brain-boost-hub": "bun scripts/seed-brain-boost-hub.ts"
```

- [ ] **Step 3: Smoke-test the env-var guard**

```bash
bun run seed:brain-boost-hub
```

Expected: exits with `STORYBLOK_MANAGEMENT_TOKEN is required (export or .env.local).`

- [ ] **Step 4: Run format + lint**

```bash
bun run format && bun run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-brain-boost-hub.ts package.json
git commit -m "feat(seed): add seed-brain-boost-hub script for 4 hub blok schemas + story"
```

---

### Task 9: Verification

**Files:** none (verification only)

- [ ] **Step 1: Run full test suite**

```bash
bun test
```

Expected: all tests PASS (existing `games-registry.test.ts` 4 cases + `adapters.test.ts` 10+ cases).

- [ ] **Step 2: Run full build**

```bash
bun run build
```

Expected: clean build, zero TypeScript or lint errors.

- [ ] **Step 3: Confirm dry-run guard**

```bash
bun run seed:brain-boost-hub
```

Expected: prints `STORYBLOK_MANAGEMENT_TOKEN is required` and exits non-zero.

- [ ] **Step 4: Final commit (if any stray files)**

```bash
git status
```

If clean: nothing to do. If there are stray `bun run format` outputs:

```bash
git add -p
git commit -m "chore: post-verification formatting"
```
