# Brain Boost Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/brain-boost` from the empty placeholder into the full V1 "Editorial Hub" landing (hero banner → centered intro → featured KenKen card → sunset daily strip → coming-soon dashed grid → benefits strip), then add a one-shot Storyblok seed script that creates the `kenken_*` components + `brain-boost/kenken` story used by the bespoke `/brain-boost/kenken` info page.

**Architecture:** Bespoke Server Components under `src/components/brain-boost/hub/`. **No** reuse of `SectionLanding` / `SectionBanner`. **No** `PillarKey` / `pillarAccents` change — the only accent is the existing standalone `BRAIN_BOOST_ACCENT` constant (Sunset Pulse `#f97316 → #ec4899`). The Storyblok script extends the existing schemas-and-content infrastructure in `scripts/lib/`, mirroring `update-about.ts` / `update-disclaimer.ts`.

**Tech Stack:** Next.js 16 App Router (Server Components by default, React Compiler on), Tailwind 4 (`@theme` inline, no `tailwind.config.js`), `next/image`, `@tabler/icons-react`, design-system tokens from `globals.css`, Bun, Ultracite/Biome. Storyblok script: existing `StoryblokManagement` wrapper in `scripts/lib/storyblok-management.ts`.

---

## Pre-flight state

Discovered while drafting the plan; the executor should re-verify before starting:

- **Branch:** currently on `KenKen`; working tree is clean apart from the untracked `docs/brain-boost-handoff/` directory.
- **Phase 1 already partially done** on `KenKen` (commits `21553c2` and `17ca18c`):
  - `src/components/layout/header/header.tsx:30` — "Brain Boost" already in `DEFAULT_NAV_ITEMS` between Blog and About. **No change needed.**
  - `src/components/layout/footer.tsx:28` — "Brain Boost" already in `DEFAULT_EXPLORE` between Blog and About Me. **No change needed.**
  - `src/app/sitemap.ts:20` — `/brain-boost/kenken` is listed; **`/brain-boost` itself is NOT yet there**. The handoff §1.3 says it must be added; this is the one Phase 1 gap. The two interactive routes (`/play`, `/daily`) are correctly absent.
- **Placeholder page lives at** `src/app/(site)/brain-boost/page.tsx` (sunset-gradient hero with a single button). Phase 2 replaces it wholesale.
- **Banner assets** `public/pillers/brain-boost-banner.png` and `public/pillers/kenken-banner.png` are committed and ready.
- **Sunset Pulse accent** `BRAIN_BOOST_ACCENT` already exists at `src/components/brain-boost/accent.ts:3`.
- **Pillars are intact** — `PillarKey` / `pillarAccents` will not be touched by this plan.
- **Storyblok kenken bloks:** the TypeScript types (`KenkenHeroBlok`, etc.) and the renderer components (`KenkenHeroBlock`, etc., in `src/components/storyblok/blocks/kenken.tsx`) are already in the repo and registered in the `<PageBody>` switch at `src/components/storyblok/blocks/page.tsx:110`. The fallback content (`src/components/brain-boost/kenken/fallback-content.ts`) and `loadKenkenStory()` (`src/lib/storyblok/landing.ts:252`) already exist. **What's missing** is the Storyblok-cloud schema (the components in the space) and the seed story — that is exactly what Phase 4's script will create.

### Decisions (locked in by the user, 2026-05-24)

1. **Branch:** `feat/brain-boost-hub` off `KenKen`. Phase 2/3/4 commits go on the new branch; PR target is `KenKen`. (Phase 1's nav/footer entries already on `KenKen` are reused as base.) Phase 0 below creates the branch.
2. **Sitemap priority:** `0.9` for `/brain-boost` — pillar parity with `/bits`, `/bites`, `/blog`. Task 1.1 reflects this.
3. **Phase-4 script shape:** **stand-alone**. The seed script must not modify any existing file under `scripts/lib/` — no edits to `storyblok-schemas.ts`, `storyblok-content.ts`, or `storyblok-management.ts`. The script defines its own kenken schemas, folder, and story content locally, and only imports the *type interfaces* + `StoryblokManagement` *class* from `scripts/lib/storyblok-management.ts` (pure utility, not "components"). Net new files only: `scripts/seed-kenken.ts` and a one-line addition to `package.json`'s `scripts` block.

---

## File structure

**Phase 1 (1 file changed):**
- Modify: `src/app/sitemap.ts:11-21` — add `/brain-boost` entry.

**Phase 2 (10 files: 9 new + 1 replaced + 1 globals.css modified):**

```
src/components/brain-boost/hub/                 [new directory]
  meta.ts                          # title/tagline/lede + meta-row stats data
  games-registry.ts                # typed BrainBoostGame list + STATUS_LABEL map
  brain-boost-hero.tsx             # banner image + bottom-fade overlay
  brain-boost-intro.tsx            # breadcrumb + h1 + lede + 4 meta items
  brain-boost-featured-kenken.tsx  # 2-col card: teal cover (left) + body (right)
  brain-boost-daily-strip.tsx      # full-bleed sunset CTA strip
  brain-boost-coming-soon.tsx      # 3-card dashed grid (status chip + glyph)
  brain-boost-benefits.tsx         # 4-card "Why Brain Boost?" strip

src/app/globals.css                # add the three .bb-gradient-* helpers
src/app/(site)/brain-boost/page.tsx [REPLACE existing 49-line placeholder]
```

Server Components throughout (no client-side interactivity needed in this phase).

**Phase 4 (Storyblok script — stand-alone, option (b) per decision):**

```
scripts/seed-kenken.ts             # NEW, fully self-contained: schemas + folder + story content + runner
package.json                       # add "seed:kenken" npm script (one-line edit)
```

**No edits** to `scripts/lib/storyblok-schemas.ts`, `scripts/lib/storyblok-content.ts`, or `scripts/lib/storyblok-management.ts`. The script imports type interfaces (`SbComponent`, `SbComponentField`, `SbStoryContent`) and the `StoryblokManagement` class from `scripts/lib/storyblok-management.ts` (pure utility — not "components").

---

## Phase 0 — Branch setup

### Task 0.1: Create `feat/brain-boost-hub` off `KenKen`

- [ ] **Step 1: Confirm clean tree on `KenKen`**

Run: `git status --short`
Expected: empty, or only `?? docs/brain-boost-handoff/` (the handoff dir is untracked and is fine to carry across the branch).

- [ ] **Step 2: Create and switch to the branch**

Run: `git checkout -b feat/brain-boost-hub`
Expected: `Switched to a new branch 'feat/brain-boost-hub'`.

All Phase 1/2/3/4 commits go on this branch. The PR target is `KenKen`.

---

## Phase 1 — Sitemap entry for `/brain-boost`

The header and footer entries are already on `KenKen`. The only remaining Phase 1 work is the sitemap.

### Task 1.1: Add `/brain-boost` to the static sitemap

**Files:**
- Modify: `src/app/sitemap.ts:11-21`

- [ ] **Step 1: Edit `STATIC_ROUTES`**

Open `src/app/sitemap.ts`. Insert the `/brain-boost` entry **before** the existing `/brain-boost/kenken` entry so the hub appears before its child in source order:

```ts
const STATIC_ROUTES: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/bits", changeFrequency: "weekly", priority: 0.9 },
  { path: "/bites", changeFrequency: "weekly", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/labels", changeFrequency: "weekly", priority: 0.7 },
  { path: "/brain-boost", changeFrequency: "weekly", priority: 0.9 },
  { path: "/brain-boost/kenken", changeFrequency: "monthly", priority: 0.7 },
];
```

- [ ] **Step 2: Verify the sitemap renders the entry**

Run: `bun run build`
Expected: build succeeds. Then in another shell start the prod server and curl:
```bash
bun run start &  # in another shell
sleep 5
curl -s http://localhost:3000/sitemap.xml | grep -c '<loc>https\?://[^<]*/brain-boost</loc>'
```
Expected: `1` (and no count for `/brain-boost/play` or `/brain-boost/daily`).

If you don't want to start the prod server, this is also covered by Phase 3's full sweep.

- [ ] **Step 3: Lint**

Run: `bun run lint`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(sitemap): index /brain-boost hub page"
```

---

## Phase 2 — Build the `/brain-boost` hub page

Builds the V1 Editorial Hub composition. Visual ground truth: `docs/brain-boost-handoff/design/Brain Boost Hub.html` (open in a browser — V1 artboards `v1-light` and `v1-dark`). Section copy/structure ground truth: `docs/brain-boost-handoff/design/brain-boost-variants.jsx` (`VariantEditorial` function).

**Testing strategy for Phase 2.** The hub is composed of presentational Server Components with no interactivity, no data fetching, and no derived logic. The only piece with branching/derivation worth a unit test is `games-registry.ts` (filter "live" vs others, status-label coverage). Each section component is a thin render of static copy from `meta.ts` + `games-registry.ts` — verification is via `bun run build` (catches type/jsx errors) and the Phase 3 manual visual sweep in light + dark. **Do not** add snapshot tests; they're noise here.

### Task 2.1: globals.css helpers

**Files:**
- Modify: `src/app/globals.css` — append a new block at the end.

- [ ] **Step 1: Append the three Brain Boost helpers**

Open `src/app/globals.css` and append at the bottom of the file:

```css
/* ===============================================
   Brain Boost — section utilities (Sunset Pulse accent)
   =============================================== */
.bb-gradient-text {
  background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.bb-gradient-bg {
  background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
}
.bb-gradient-btn {
  color: #fff;
  background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
  box-shadow: 0 10px 24px -10px rgb(249 115 22 / 0.55);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms;
}
.bb-gradient-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px -10px rgb(249 115 22 / 0.7);
}
```

Literal hex is fine here — the rest of `globals.css` uses literal hex (TS-side code paths go through `BRAIN_BOOST_ACCENT`).

- [ ] **Step 2: Verify lint passes**

Run: `bun run lint`
Expected: pass.

### Task 2.2: `meta.ts` — canonical copy

**Files:**
- Create: `src/components/brain-boost/hub/meta.ts`

- [ ] **Step 1: Write the file**

```ts
// src/components/brain-boost/hub/meta.ts
// Canonical copy and meta-row data for the /brain-boost hub.
// Reused by metadata (page.tsx) and by BrainBoostIntro.

export const BRAIN_BOOST_TITLE = "Brain Boost";
export const BRAIN_BOOST_TAGLINE = "Short games for long focus.";
export const BRAIN_BOOST_LEDE =
  "A new corner of PBDesk for short, focused puzzles that sharpen the mind between Bits and Bites. Twenty minutes of arithmetic logic, one solved grid at a time — the kind of quiet focus that resets a working day. KenKen is here today; more games are queued.";

export type BrainBoostMetaIcon = "Layers" | "Target" | "Sparkles" | "Calendar";

export interface BrainBoostMetaItem {
  value: string;
  label: string;
  icon: BrainBoostMetaIcon;
}

export const BRAIN_BOOST_META: readonly BrainBoostMetaItem[] = [
  { value: "1", label: "game live", icon: "Layers" },
  { value: "4", label: "difficulty tiers", icon: "Target" },
  { value: "~200", label: "hand-checked puzzles", icon: "Sparkles" },
  { value: "1", label: "new puzzle every day", icon: "Calendar" },
] as const;
```

- [ ] **Step 2: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.3: `games-registry.ts` — typed games list (TDD)

**Files:**
- Create: `src/components/brain-boost/hub/games-registry.ts`
- Test: `src/components/brain-boost/hub/games-registry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/brain-boost/hub/games-registry.test.ts
import { describe, expect, it } from "bun:test";
import {
  BRAIN_BOOST_GAMES,
  type GameStatus,
  STATUS_LABEL,
} from "./games-registry";

describe("BRAIN_BOOST_GAMES", () => {
  it("includes a single live game and it is KenKen", () => {
    const live = BRAIN_BOOST_GAMES.filter((g) => g.status === "live");
    expect(live).toHaveLength(1);
    expect(live[0].slug).toBe("kenken");
    expect(live[0].href).toBe("/brain-boost/kenken");
    expect(live[0].coverImage).toBe("/pillers/kenken-banner.png");
  });

  it("provides at least three non-live entries for the coming-soon grid", () => {
    const coming = BRAIN_BOOST_GAMES.filter((g) => g.status !== "live");
    expect(coming.length).toBeGreaterThanOrEqual(3);
    for (const game of coming) {
      expect(game.glyph).toBeDefined();
      expect((game.glyph ?? "").length).toBeGreaterThan(0);
    }
  });

  it("has every game slug unique", () => {
    const slugs = BRAIN_BOOST_GAMES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("maps every GameStatus value via STATUS_LABEL", () => {
    const statuses: GameStatus[] = [
      "live",
      "coming-q3",
      "coming-q4",
      "exploring",
    ];
    for (const s of statuses) {
      expect(STATUS_LABEL[s]).toBeDefined();
      expect(STATUS_LABEL[s].length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test (expect FAIL)**

Run: `bun test src/components/brain-boost/hub/games-registry.test.ts`
Expected: FAIL — `Cannot find module './games-registry'`.

- [ ] **Step 3: Implement `games-registry.ts`**

```ts
// src/components/brain-boost/hub/games-registry.ts
// Typed registry of games surfaced on the /brain-boost hub.
// `live` games render the featured card; everything else feeds the
// "Coming next" dashed grid.

export type GameStatus = "live" | "coming-q3" | "coming-q4" | "exploring";

export interface BrainBoostGame {
  slug: string;
  name: string;
  status: GameStatus;
  category: string;
  description: string;
  href?: string;
  coverImage?: string;
  glyph?: string;
  tiers?: number;
  estTime?: string;
  operations?: string;
}

export const BRAIN_BOOST_GAMES: BrainBoostGame[] = [
  {
    slug: "kenken",
    name: "KenKen",
    status: "live",
    category: "Arithmetic · Logic",
    description:
      "Fill an N×N grid so digits don't repeat in any row or column — the catch: outlined cages must hit their target with +, −, ×, or ÷. Pure logic, no guessing required.",
    href: "/brain-boost/kenken",
    coverImage: "/pillers/kenken-banner.png",
    tiers: 4,
    estTime: "10–25 min",
    operations: "+ − × ÷",
  },
  {
    slug: "sudoku",
    name: "Sudoku",
    status: "coming-q3",
    glyph: "SUD",
    category: "Logic",
    description:
      "Classic 9×9 with hand-picked difficulty curves and a no-mark-ups expert mode.",
  },
  {
    slug: "cryptic",
    name: "Cryptic Mini",
    status: "coming-q4",
    glyph: "CRY",
    category: "Words",
    description:
      "Five-clue cryptic crossword, finishable on a coffee break. Each solved clue links to its wordplay.",
  },
  {
    slug: "logic-grid",
    name: "Logic Grid",
    status: "exploring",
    glyph: "LOG",
    category: "Logic",
    description:
      "Five-by-five attribute deduction puzzles — the kind your physics teacher used to print and hand out.",
  },
];

export const STATUS_LABEL: Record<GameStatus, string> = {
  live: "Now playing",
  "coming-q3": "Coming · Q3",
  "coming-q4": "Coming · Q4",
  exploring: "Exploring",
};
```

- [ ] **Step 4: Run test (expect PASS)**

Run: `bun test src/components/brain-boost/hub/games-registry.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.4: `brain-boost-hero.tsx` — banner + bottom-fade overlay

**Files:**
- Create: `src/components/brain-boost/hub/brain-boost-hero.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/brain-boost/hub/brain-boost-hero.tsx
import Image from "next/image";

export default function BrainBoostHero() {
  return (
    <div className="relative">
      <Image
        alt="Brain Boost — puzzles for focus and mental fitness"
        className="block h-auto w-full"
        height={640}
        priority
        sizes="100vw"
        src="/pillers/brain-boost-banner.png"
        width={1920}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[30%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, var(--bg-page) 100%)",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.5: `brain-boost-intro.tsx` — breadcrumb + h1 + lede + meta row

**Files:**
- Create: `src/components/brain-boost/hub/brain-boost-intro.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/brain-boost/hub/brain-boost-intro.tsx
import {
  IconCalendar,
  IconLayers,
  IconSparkles,
  IconTarget,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";
import {
  BRAIN_BOOST_LEDE,
  BRAIN_BOOST_META,
  type BrainBoostMetaIcon,
} from "./meta";

const ICON_MAP: Record<BrainBoostMetaIcon, ReactNode> = {
  Layers: <IconLayers size={18} />,
  Target: <IconTarget size={18} />,
  Sparkles: <IconSparkles size={18} />,
  Calendar: <IconCalendar size={18} />,
};

export default function BrainBoostIntro() {
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
        {BRAIN_BOOST_LEDE}
      </p>

      <div
        className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t pt-8"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {BRAIN_BOOST_META.map((item) => (
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

- [ ] **Step 2: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.6: `brain-boost-featured-kenken.tsx` — 2-col featured card

**Files:**
- Create: `src/components/brain-boost/hub/brain-boost-featured-kenken.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/brain-boost/hub/brain-boost-featured-kenken.tsx
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { BRAIN_BOOST_GAMES } from "./games-registry";

export default function BrainBoostFeaturedKenken() {
  const kenken = BRAIN_BOOST_GAMES.find((g) => g.slug === "kenken");
  if (!kenken) {
    return null;
  }

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
          The <span className="bb-gradient-text">first game</span> is KenKen
        </h2>
        <Link
          className="inline-flex items-center gap-1 text-sm hover:underline"
          href="/brain-boost"
          style={{ color: "var(--fg-secondary)" }}
        >
          All games <IconArrowRight size={14} />
        </Link>
      </div>

      <div
        className="grid grid-cols-1 overflow-hidden rounded-2xl border md:grid-cols-[1.2fr_1fr]"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Cover (left) */}
        <div
          className="relative flex min-h-[380px] items-center justify-center p-8"
          style={{
            background:
              "linear-gradient(135deg, #134e4a 0%, #0d9488 40%, #14b8a6 100%)",
          }}
        >
          <span className="bb-gradient-bg absolute top-5 left-5 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] text-white uppercase tracking-[0.12em]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-white"
            />
            Now playing
          </span>
          <Image
            alt="KenKen puzzle preview"
            className="h-auto w-full max-w-[460px] rounded-2xl"
            height={460}
            sizes="(max-width: 768px) 100vw, 460px"
            src="/pillers/kenken-banner.png"
            style={{ boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.4)" }}
            width={460}
          />
        </div>

        {/* Body (right) */}
        <div className="flex flex-col gap-5 p-8">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "#f97316" }}
          >
            {kenken.category}
          </span>
          <h3
            className="font-extrabold tracking-tight"
            style={{ fontSize: 40, lineHeight: 1.05 }}
          >
            {kenken.name}
          </h3>
          <p style={{ color: "var(--fg-secondary)", lineHeight: 1.7 }}>
            {kenken.description}
          </p>
          <div
            className="grid grid-cols-3 gap-4 border-y py-[18px]"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Stat label="Grid sizes" value="3×3 → 9×9" />
            <Stat label="Typical solve" value={kenken.estTime ?? "—"} />
            <Stat label="Operations" value={kenken.operations ?? "—"} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="bb-gradient-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm"
              href="/brain-boost/kenken/play"
            >
              <IconPlayerPlay size={14} /> Play KenKen
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium text-sm"
              href="/brain-boost/kenken"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--fg-primary)",
              }}
            >
              How to play
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <strong style={{ color: "var(--fg-primary)" }}>{value}</strong>
      <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.7: `brain-boost-daily-strip.tsx` — sunset CTA strip

**Files:**
- Create: `src/components/brain-boost/hub/brain-boost-daily-strip.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/brain-boost/hub/brain-boost-daily-strip.tsx
import { IconCalendar, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";

export default function BrainBoostDailyStrip() {
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
            Today's daily — Intermediate
          </h3>
          <p
            className="mt-2 max-w-2xl text-sm sm:text-base"
            style={{ color: "rgb(255 255 255 / 0.85)", lineHeight: 1.6 }}
          >
            A fresh hand-checked KenKen, the same all day. Refresh keeps your
            progress; come back tomorrow for a new one.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-sm"
            href="/brain-boost/kenken/daily"
            style={{ color: "#9a3412" }}
          >
            <IconPlayerPlay size={14} /> Play today's
          </Link>
          {/* TODO archive route — Phase 2 of the spec (date-seeded daily + archive) */}
          <a
            aria-disabled="true"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium text-sm text-white"
            href="#"
            style={{
              background: "rgb(255 255 255 / 0.12)",
              borderColor: "rgb(255 255 255 / 0.4)",
            }}
          >
            <IconCalendar size={14} /> Archive
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.8: `brain-boost-coming-soon.tsx` — dashed 3-card grid

**Files:**
- Create: `src/components/brain-boost/hub/brain-boost-coming-soon.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/brain-boost/hub/brain-boost-coming-soon.tsx
import { BRAIN_BOOST_GAMES, STATUS_LABEL } from "./games-registry";

export default function BrainBoostComingSoon() {
  const coming = BRAIN_BOOST_GAMES.filter((g) => g.status !== "live");
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
            <h4
              className="font-bold"
              style={{ fontSize: 20, lineHeight: 1.2 }}
            >
              {game.name}
            </h4>
            <p
              className="text-[13px]"
              style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}
            >
              {game.description}
            </p>
            <span
              aria-hidden="true"
              className="bb-gradient-text mt-auto font-mono text-[36px] font-bold"
              style={{ opacity: 0.7 }}
            >
              {game.glyph}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.9: `brain-boost-benefits.tsx` — 4-card "Why Brain Boost?" strip

**Files:**
- Create: `src/components/brain-boost/hub/brain-boost-benefits.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/brain-boost/hub/brain-boost-benefits.tsx
import {
  IconBrain,
  IconClock,
  IconFlame,
  IconTarget,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { BRAIN_BOOST_ACCENT } from "@/components/brain-boost/accent";

interface Benefit {
  icon: ReactNode;
  title: string;
  body: string;
}

const BENEFITS: readonly Benefit[] = [
  {
    icon: <IconTarget size={20} />,
    title: "Single-task focus",
    body:
      "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week.",
  },
  {
    icon: <IconBrain size={20} />,
    title: "Working-memory workout",
    body:
      'Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point.',
  },
  {
    icon: <IconClock size={20} />,
    title: "Designed to be short",
    body:
      "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes.",
  },
  {
    icon: <IconFlame size={20} />,
    title: "Daily ritual, no streak shame",
    body:
      "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can.",
  },
];

export default function BrainBoostBenefits() {
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
        Why <span className="bb-gradient-text">Brain Boost?</span>
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
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
              {b.icon}
            </span>
            <h4
              className="font-bold"
              style={{ fontSize: 18, lineHeight: 1.25 }}
            >
              {b.title}
            </h4>
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

- [ ] **Step 2: Lint pass**

Run: `bun run lint`
Expected: pass.

### Task 2.10: Replace `src/app/(site)/brain-boost/page.tsx`

**Files:**
- Modify (replace whole file): `src/app/(site)/brain-boost/page.tsx`

- [ ] **Step 1: Verify the SEO helpers we'll import**

Run: `grep -nE "^export.*\\b(pageMetadata|jsonLdString|SITE_NAME|SITE_AUTHOR|SITE_URL)\\b" src/lib/seo.ts`
Expected: each name appears on an `export` line. If `jsonLdString` does **not** exist, use `JSON.stringify(jsonLd)` inline below and drop that import. **Do not invent new helpers.**

- [ ] **Step 2: Replace contents**

```tsx
// src/app/(site)/brain-boost/page.tsx
import type { Metadata } from "next";
import BrainBoostBenefits from "@/components/brain-boost/hub/brain-boost-benefits";
import BrainBoostComingSoon from "@/components/brain-boost/hub/brain-boost-coming-soon";
import BrainBoostDailyStrip from "@/components/brain-boost/hub/brain-boost-daily-strip";
import BrainBoostFeaturedKenken from "@/components/brain-boost/hub/brain-boost-featured-kenken";
import BrainBoostHero from "@/components/brain-boost/hub/brain-boost-hero";
import BrainBoostIntro from "@/components/brain-boost/hub/brain-boost-intro";
import { BRAIN_BOOST_LEDE } from "@/components/brain-boost/hub/meta";
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

export default function BrainBoostHubPage() {
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
        <BrainBoostIntro />
        <BrainBoostFeaturedKenken />
        <BrainBoostDailyStrip />
        <BrainBoostComingSoon />
        <BrainBoostBenefits />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Build**

Run: `bun run build`
Expected: success. If a `@tabler/icons-react` import fails, sanity-check the name with `grep -n "^export" node_modules/@tabler/icons-react/dist/esm/icons/Icon*.mjs | grep -i <suspected>` — every name used in this plan exists in v3.x but versions drift.

- [ ] **Step 4: Lint pass**

Run: `bun run lint`
Expected: pass.

- [ ] **Step 5: Commit Phase 2**

```bash
git add src/app/globals.css \
        src/components/brain-boost/hub/ \
        src/app/\(site\)/brain-boost/page.tsx
git commit -m "feat(brain-boost): build /brain-boost hub page (V1 editorial direction)"
```

---

## Phase 3 — Verification

### Task 3.1: Full check

- [ ] **Step 1: Format**

Run: `bun run format`
Expected: returns 0; any in-place fixes are applied. Stage them if any (`git status`).

- [ ] **Step 2: Full check pipeline**

Run: `bun run check`
Expected: clean + lint + build + audit all pass. This is slow (reinstalls deps); reserve for final pass.

- [ ] **Step 3: Unit tests for the new typed module**

Run: `bun test src/components/brain-boost/hub/`
Expected: PASS (the 4 cases from Task 2.3).

### Task 3.2: Manual visual sweep

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Note: dev server uses HTTPS at `https://localhost:3000`. Open the URL in a browser. Verify the theme toggle works (the `data-theme="dark"` attribute swaps).

- [ ] **Step 2: Walk the routes — light theme**

Visit each:
- `/` — homepage still renders; nav shows 6 items including Brain Boost.
- `/brain-boost` — full hub renders in this order: banner → "My Brain Boost" h1 → featured KenKen card → sunset daily strip → 3 coming-soon dashed cards → 4 benefits.
- `/bits`, `/bites`, `/blog` — unchanged (regression check; visually identical to before).
- `/brain-boost/kenken` — the existing info page should still render (Phase 4's seed script only adds Storyblok data; the local fallback already works without a Storyblok token).

- [ ] **Step 3: Walk the same routes — dark theme**

Toggle theme; revisit each. Confirm:
- Sunset gradient text/buttons still legible on dark backgrounds.
- Dashed borders on coming-soon cards visible against `var(--bg-subtle)` in dark.
- Banner's bottom-fade overlay still blends into the dark `var(--bg-page)`.

- [ ] **Step 4: Mobile viewport (≤ 640px)**

Resize the browser (or use DevTools device emulator). Confirm:
- Featured KenKen card collapses to a single column (cover above body).
- 4-card benefits strip collapses to 1–2 cols.
- 3-card coming-soon collapses similarly.
- Meta row in intro wraps cleanly.

- [ ] **Step 5: Interaction sweep**

- Hover the "Play KenKen" primary button → gentle lift + glow (the `.bb-gradient-btn` hover rule).
- Keyboard-tab into "Play KenKen" → focus ring visible (the global `*:focus-visible` rule applies).
- Click "Play KenKen" → routes to `/brain-boost/kenken/play`.
- Click "How to play" → routes to `/brain-boost/kenken`.
- Click "Play today's" → routes to `/brain-boost/kenken/daily`.
- Click "Archive" → does nothing (it's `href="#"` + `aria-disabled`). Acceptable for now.

- [ ] **Step 6: Sitemap**

Open `https://localhost:3000/sitemap.xml` and `Cmd-F` for `/brain-boost`:
- `/brain-boost` present (one entry).
- `/brain-boost/kenken` present (one entry).
- `/brain-boost/kenken/play` and `/brain-boost/kenken/daily` **absent**.

- [ ] **Step 7: Acceptance checklist**

Copy the checklist from the handoff §Acceptance and tick each item. Halt if any fails.

---

## Phase 4 — Stand-alone Storyblok seed script for `kenken_*` components

**Why this is separate from Phase 2.** The `/brain-boost` hub is bespoke, not CMS-driven — it does not touch Storyblok. But the spec §2.B requires `/brain-boost/kenken` (the info page) to be CMS-managed, and the renderer (`KenkenHeroBlock`, etc.) is already in the repo. What's missing is the **Storyblok-cloud schema** for those bloks and a seed story. This phase adds a one-shot script (and a `package.json` entry) so any developer can run `bun run seed:kenken` to provision a Storyblok space.

**Independence guarantee.** Per decision (b), the script must **not** modify any existing file under `scripts/lib/`. The only existing files imported are types and the `StoryblokManagement` class from `scripts/lib/storyblok-management.ts` (pure transport/API utility, not a "component"). The script defines its own `field()`/`reset()` helpers locally because the equivalents in `scripts/lib/storyblok-schemas.ts` are file-private. New files: `scripts/seed-kenken.ts`. Modified: `package.json` (one new entry in `scripts`).

**Storyblok side effects — what re-running affects, what it doesn't.** The wrapper's behavior (verified in `scripts/lib/storyblok-management.ts:217–396`):

- `upsertComponent` matches by `name` and PUTs an update if found, POSTs if not. **Only the 10 kenken_* components are touched.** Existing components like `hero`, `pillars`, `about_page`, `post`, `landing_page`, `home_page`, `disclaimer_page`, etc. are **untouched** (they are not in the local `KENKEN_COMPONENTS` array).
- `upsertFolder` matches by full slug. If `brain-boost/` already exists, the wrapper returns it **as-is** (no update). Other folders (`bits`, `bites`, `blog`, `_global`) are **untouched**.
- `upsertStory` matches by `full_slug` (`brain-boost/kenken`). If the story exists, the wrapper **PUTs a merged body** — so any editor edits to that story will be overwritten by the canonical seed body on every re-run. Then `publishStory` republishes it. **Only this one story is touched**; every other story in the space is **untouched**.

**Bottom line.** Safe to run repeatedly. The only repeat-risk is clobbering manual editor changes to the `brain-boost/kenken` story itself — same trade-off as `seed-storyblok.ts`. No other stories, components, datasources, assets, or folders are affected.

This phase ships in the **same PR** as Phases 1–3 (per decision #3).

### Task 4.1 (removed)

Folded into Task 4.2 — the stand-alone script holds its own schema definitions.

### Task 4.2: Write the stand-alone `scripts/seed-kenken.ts`

**Files:**
- Create: `scripts/seed-kenken.ts`
- Modify: `package.json` — add one entry to `scripts`.
- **Do not touch:** `scripts/lib/storyblok-schemas.ts`, `scripts/lib/storyblok-content.ts`, `scripts/lib/storyblok-management.ts`.

- [ ] **Step 1: Verify the management wrapper's exported surface**

Run:
```bash
grep -nE "^export" scripts/lib/storyblok-management.ts | head -15
grep -nE "^\s*(async\s+)?(upsert|publish|uploadAsset)[A-Za-z]+\(" scripts/lib/storyblok-management.ts
```
Expected: confirms `SbComponent`, `SbComponentField`, `SbStoryContent`, `SbStoryInput`, and class `StoryblokManagement` are exported; methods `upsertComponent`, `upsertFolder`, `upsertStory`, `publishStory` exist. If any name differs from what the script in Step 2 imports/calls, adjust the script to match — **do not** add new exports or methods to the wrapper.

- [ ] **Step 2: Implement the stand-alone script**

```ts
#!/usr/bin/env bun
// scripts/seed-kenken.ts
//
// Stand-alone, one-shot seeder for the /brain-boost/kenken story.
// Independent of scripts/seed-storyblok.ts and scripts/lib/storyblok-schemas.ts:
// all kenken_* component schemas, the brain-boost folder, and the canonical
// story body live in THIS file. Re-running seed-storyblok.ts will NOT push the
// kenken_* schemas; only `bun run seed:kenken` does.
//
// Usage:
//   STORYBLOK_MANAGEMENT_TOKEN=... STORYBLOK_SPACE_ID=... bun run seed:kenken
//
// Idempotent: safe to re-run after editing schemas or default content.

import {
  type SbComponent,
  type SbComponentField,
  type SbStoryContent,
  StoryblokManagement,
} from "./lib/storyblok-management";

// ---------------------------------------------------------------------------
// Local schema-builder helpers (private equivalents of the file-private
// helpers in scripts/lib/storyblok-schemas.ts — duplicated intentionally to
// keep this script independent).
// ---------------------------------------------------------------------------

let pos = 0;
function reset(): void {
  pos = 0;
}
function field<T extends Omit<SbComponentField, "pos">>(input: T): T & { pos: number } {
  pos += 1;
  return { ...input, pos } as T & { pos: number };
}
function f<T extends Record<string, SbComponentField>>(schema: T): T {
  return schema;
}

// ---------------------------------------------------------------------------
// Richtext helpers — mirror scripts/update-about.ts and scripts/lib/storyblok-content.ts:
//   paragraph("foo") → { type: "paragraph", content: [{ type: "text", text: "foo" }] }
//   richtext("p1", "p2") → { type: "doc", content: [paragraph("p1"), paragraph("p2")] }
// ---------------------------------------------------------------------------

interface RtTextNode {
  type: "text";
  text: string;
}
interface RtParagraphNode {
  type: "paragraph";
  content: RtTextNode[];
}
interface RtDoc {
  type: "doc";
  content: RtParagraphNode[];
}

function paragraph(text: string): RtParagraphNode {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function richtext(...paragraphs: string[]): RtDoc {
  return { type: "doc", content: paragraphs.map(paragraph) };
}

// ---------------------------------------------------------------------------
// kenken_* component schemas (8 nestable bloks + 1 content type).
// ---------------------------------------------------------------------------

const KENKEN_COMPONENTS: SbComponent[] = [
  (() => {
    reset();
    return {
      name: "kenken_hero",
      display_name: "KenKen Hero",
      is_root: false,
      is_nestable: true,
      icon: "block-image",
      preview_field: "title",
      schema: f({
        eyebrow: field({ type: "text" }),
        title: field({ type: "text", required: true }),
        lede: field({ type: "textarea" }),
        cta_play_label: field({ type: "text" }),
        cta_daily_label: field({ type: "text" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_prose",
      display_name: "KenKen Prose",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        richtext: field({ type: "richtext" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_step",
      display_name: "KenKen Step",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "title",
      schema: f({
        title: field({ type: "text", required: true }),
        text: field({ type: "textarea", required: true }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_steps",
      display_name: "KenKen Steps",
      is_root: false,
      is_nestable: true,
      icon: "block-buildingblocks",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        steps: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["kenken_step"],
          minimum: 1,
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_operation",
      display_name: "KenKen Operation",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "name",
      schema: f({
        symbol: field({ type: "text", required: true }),
        name: field({ type: "text", required: true }),
        description: field({ type: "textarea" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_operations",
      display_name: "KenKen Operations",
      is_root: false,
      is_nestable: true,
      icon: "block-buildingblocks",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        operations: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["kenken_operation"],
          minimum: 1,
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_level",
      display_name: "KenKen Level",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "name",
      schema: f({
        name: field({ type: "text", required: true }),
        sizes: field({ type: "text" }),
        operations: field({ type: "text" }),
        description: field({ type: "textarea" }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_levels",
      display_name: "KenKen Levels",
      is_root: false,
      is_nestable: true,
      icon: "block-buildingblocks",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        levels: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: ["kenken_level"],
          minimum: 1,
        }),
      }),
    };
  })(),
  (() => {
    reset();
    return {
      name: "kenken_cta",
      display_name: "KenKen CTA",
      is_root: false,
      is_nestable: true,
      icon: "block-paragraph",
      preview_field: "heading",
      schema: f({
        heading: field({ type: "text" }),
        cta_play_label: field({ type: "text" }),
        cta_daily_label: field({ type: "text" }),
      }),
    };
  })(),
  // ----- KenKen Page (content type) -----
  (() => {
    reset();
    return {
      name: "kenken_page",
      display_name: "KenKen Page",
      is_root: true,
      is_nestable: false,
      icon: "block-doc",
      preview_field: "seo_title",
      schema: f({
        body: field({
          type: "bloks",
          restrict_components: true,
          component_whitelist: [
            "kenken_hero",
            "kenken_prose",
            "kenken_steps",
            "kenken_operations",
            "kenken_levels",
            "kenken_cta",
          ],
        }),
        seo_title: field({ type: "text" }),
        seo_description: field({ type: "textarea" }),
      }),
    };
  })(),
];

// ---------------------------------------------------------------------------
// Brain Boost folder definition (local — does NOT touch the shared `folders`
// array in scripts/lib/storyblok-schemas.ts).
// ---------------------------------------------------------------------------

const BRAIN_BOOST_FOLDER = {
  slug: "brain-boost",
  name: "Brain Boost",
  default_root: "kenken_page",
} as const;

// ---------------------------------------------------------------------------
// Canonical default story body. Mirrors the in-repo fallback at
// src/components/brain-boost/kenken/fallback-content.ts field-for-field
// (FALLBACK_HERO, FALLBACK_WHAT_IS, FALLBACK_STEPS, FALLBACK_OPERATIONS,
// FALLBACK_LEVELS). Keep these two in sync if either changes.
// ---------------------------------------------------------------------------

const KENKEN_STORY_CONTENT: SbStoryContent = {
  component: "kenken_page",
  seo_title: "KenKen — how to play & rules — PBDesk",
  seo_description:
    "How to play KenKen: rules, operations, and difficulty tiers. Then jump into the puzzle.",
  body: [
    {
      component: "kenken_hero",
      eyebrow: "Brain Boost",
      title: "KenKen",
      lede:
        "A bite-sized arithmetic logic puzzle. Fill the grid so every row and column holds each digit once, and each cage hits its target.",
      cta_play_label: "Play now",
      cta_daily_label: "Today's daily",
    },
    {
      component: "kenken_prose",
      heading: "What is KenKen?",
      richtext: richtext(
        "KenKen is a grid-based logic puzzle. Fill an N×N grid with the digits 1 to N so that no digit repeats in any row or column. The grid is split into outlined groups called cages — each shows a target and an operation, and the digits in the cage must combine, using that operation, to produce the target."
      ),
    },
    {
      component: "kenken_steps",
      heading: "How to play",
      steps: [
        {
          component: "kenken_step",
          title: "Fill rows and columns",
          text:
            "Place the digits 1 to N so each appears exactly once in every row and every column.",
        },
        {
          component: "kenken_step",
          title: "Satisfy each cage",
          text:
            "An outlined cage shows a target and an operation. The digits inside must combine, using that operation, to make the target.",
        },
        {
          component: "kenken_step",
          title: "Use notes and checks",
          text:
            "Jot candidate digits as notes, toggle rule-checking to spot duplicates, and reveal mistakes if you get stuck.",
        },
      ],
    },
    {
      component: "kenken_operations",
      heading: "Operations",
      operations: [
        {
          component: "kenken_operation",
          symbol: "+",
          name: "Addition",
          description: "Cage digits add up to the target (any cage size).",
        },
        {
          component: "kenken_operation",
          symbol: "−",
          name: "Subtraction",
          description: "Two cells; the target is their absolute difference.",
        },
        {
          component: "kenken_operation",
          symbol: "×",
          name: "Multiplication",
          description: "Cage digits multiply to the target (any cage size).",
        },
        {
          component: "kenken_operation",
          symbol: "÷",
          name: "Division",
          description:
            "Two cells; the larger divided by the smaller equals the target (whole numbers only).",
        },
      ],
    },
    {
      component: "kenken_levels",
      heading: "Difficulty levels",
      levels: [
        {
          component: "kenken_level",
          name: "Easy",
          sizes: "3×3, 4×4, 5×5",
          operations: "+ − ×  (÷ on 3×3)",
          description: "Gentle grids to learn the ropes.",
        },
        {
          component: "kenken_level",
          name: "Intermediate",
          sizes: "4×4, 5×5",
          operations: "+ − × ÷",
          description:
            "All four operations in play — the daily puzzle's tier.",
        },
        {
          component: "kenken_level",
          name: "Hard",
          sizes: "6×6, 7×7",
          operations: "+ − × ÷",
          description: "Bigger boards and tighter cages.",
        },
        {
          component: "kenken_level",
          name: "Genius",
          sizes: "8×8, 9×9",
          operations: "+ − × ÷",
          description: "A serious workout for puzzle veterans.",
        },
      ],
    },
    {
      component: "kenken_cta",
      heading: "Ready to play?",
      cta_play_label: "Play KenKen",
      cta_daily_label: "Today's daily",
    },
  ],
};

const KENKEN_STORY_SLUG = "kenken";

// ---------------------------------------------------------------------------
// Runner.
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

  logStep("\n[1/3] Pushing kenken_* component schemas...");
  for (const component of KENKEN_COMPONENTS) {
    const { record, created } = await sb.upsertComponent(component);
    logRow(`${created ? "+" : "·"} ${component.name} (#${record.id})`);
  }

  logStep("\n[2/3] Ensuring brain-boost folder...");
  const { record: folderRecord, created: folderCreated } =
    await sb.upsertFolder(BRAIN_BOOST_FOLDER);
  logRow(
    `${folderCreated ? "+" : "·"} ${BRAIN_BOOST_FOLDER.slug}/ (#${folderRecord.id})`
  );

  logStep("\n[3/3] Upserting brain-boost/kenken story...");
  const { record: storyRecord, created: storyCreated } = await sb.upsertStory({
    name: "KenKen",
    slug: KENKEN_STORY_SLUG,
    full_slug: `${BRAIN_BOOST_FOLDER.slug}/${KENKEN_STORY_SLUG}`,
    parent_id: folderRecord.id,
    content: KENKEN_STORY_CONTENT,
  });
  await sb.publishStory(storyRecord.id);
  logRow(
    `${storyCreated ? "+" : "·"} ${storyRecord.full_slug} (#${storyRecord.id}, published)`
  );

  process.stdout.write("\nDone.\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nseed-kenken failed: ${message}\n`);
  process.exit(1);
});
```

**Sanity-check before saving:**

- `SbComponentField`'s `type` union must include every string the schema definitions above use (`"text"`, `"textarea"`, `"richtext"`, `"bloks"`). Verify with `grep -nA 5 "type SbFieldType\\|SbComponentField" scripts/lib/storyblok-management.ts`. If `SbComponentField` is structurally typed with `type: string`, no action needed.
- `upsertComponent`, `upsertFolder`, `upsertStory`, `publishStory` are called with the same shape used by `scripts/seed-storyblok.ts` lines 80–263 — copy that call shape if any signature differs.
- The local `field<T>()` generic shape mirrors what the wrapper expects; if TypeScript complains about variance, fall back to plain object literals (no `field()` wrapper) — the script still pushes correctly because Storyblok ignores `pos` when not strictly required for the order you want.

- [ ] **Step 3: Add the `seed:kenken` package script**

Open `package.json` and add to the `scripts` block (anywhere — alphabetical or near other `seed:*` if present):

```json
"seed:kenken": "bun scripts/seed-kenken.ts",
```

- [ ] **Step 4: Lint pass**

Run: `bun run lint`
Expected: pass.

- [ ] **Step 5: Dry-run smoke check (no real Storyblok call)**

Run: `bun run seed:kenken`
Expected: exits non-zero with `seed-kenken failed: STORYBLOK_MANAGEMENT_TOKEN is required (export or .env.local).` — proves the script loaded, imports resolved, env-var guard fires. If you see a TS type error or a missing-method error from `StoryblokManagement`, fix it before running for real.

- [ ] **Step 6 (optional, ONLY with explicit user approval): live seed**

Run:
```bash
STORYBLOK_MANAGEMENT_TOKEN=... STORYBLOK_SPACE_ID=... bun run seed:kenken
```
Expected output:
```
[1/3] Pushing kenken_* component schemas...
  + kenken_hero (#...)
  + kenken_prose (#...)
  ... (9 lines total)
[2/3] Ensuring brain-boost folder...
  + brain-boost/ (#...)
[3/3] Upserting brain-boost/kenken story...
  + brain-boost/kenken (#..., published)
Done.
```

**Do not run live without explicit user approval** — this mutates production CMS state.

- [ ] **Step 7: Confirm `scripts/lib/` is untouched (independence check)**

Run:
```bash
git diff --stat scripts/lib/
```
Expected: empty output. If anything in `scripts/lib/` changed, revert it — option (b) requires the script to be fully stand-alone.

- [ ] **Step 8: Commit Phase 4**

```bash
git add scripts/seed-kenken.ts package.json
git commit -m "feat(scripts): add stand-alone seed-kenken to push kenken bloks + story"
```

---

## Phase 5 — Push & open the PR

Single PR with all four phases (per decision #3). Target branch: `KenKen`.

### Task 5.1: Push the branch and open the PR

- [ ] **Step 1: Confirm clean tree**

Run: `git status --short`
Expected: empty (or only `?? docs/brain-boost-handoff/`).

- [ ] **Step 2: Inspect the PR's commit range**

Run: `git log --oneline KenKen..HEAD`
Expected: three commits — sitemap (Phase 1), hub page (Phase 2), seed script (Phase 4). Phase 3 has no commits (verification only).

- [ ] **Step 3: Push**

Run: `git push -u origin feat/brain-boost-hub`

- [ ] **Step 4: Open the PR**

```bash
gh pr create --base KenKen \
  --title "feat(brain-boost): /brain-boost hub page + Storyblok kenken seed" \
  --body "$(cat <<'EOF'
Implements the full `/brain-boost` hub page (V1 Editorial Hub) and adds a stand-alone Storyblok seed script for the `kenken_*` bloks + `brain-boost/kenken` story.

Per spec (`docs/superpowers/specs/2026-05-23-kenken-design.md`) and handoff (`docs/brain-boost-handoff/BRAIN_BOOST_HUB_HANDOFF.md`):

- **Bespoke styling** — no `SectionLanding` / `SectionBanner` reuse.
- **No `PillarKey` change** — Sunset Pulse accent stays the existing standalone `BRAIN_BOOST_ACCENT` constant.
- **"Brain Boost" (two words)** in nav, footer, hub copy, metadata.
- **Stand-alone seed script** — no edits to `scripts/lib/` (verified via `git diff --stat scripts/lib/`).

## Commits in this PR

1. **feat(sitemap):** index `/brain-boost` (priority 0.9, pillar parity).
2. **feat(brain-boost):** build the V1 hub page — hero banner, centered intro + meta row, featured KenKen card, sunset daily strip, coming-soon dashed grid, benefits strip. New components under `src/components/brain-boost/hub/`.
3. **feat(scripts):** stand-alone `seed-kenken` script — pushes the 10 `kenken_*` components, ensures the `brain-boost` folder, upserts + publishes `brain-boost/kenken`. Idempotent; touches only those items in Storyblok.

## Out of scope (deferred)

- KenKen game logic, `/api/kenken/puzzle`, puzzle library — separate handoffs.
- V2 (Arcade Tiles) and V3 (Daily-First) hub variants.
- Archive route + "Vote on what's next" — placeholder `#` hrefs with TODO comments.
- `pillarAccents` / `PillarKey` — verified untouched.

## Verification

- `bun run check` clean.
- `bun test src/components/brain-boost/hub/` — 4 cases pass.
- Manual sweep: `/`, `/brain-boost`, `/bits`, `/bites`, `/blog`, `/brain-boost/kenken` — light + dark, mobile + desktop.
- Sitemap: `/brain-boost` + `/brain-boost/kenken` present; `/play` and `/daily` absent.
- `bun run seed:kenken` dry-run errors with the env-var guard — proves the script loads.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Confirm**

Returns a PR URL. Open it, double-check the rendered description, request review.

---

## Out of scope (do not touch in this PR)

These are explicit non-goals from the handoff and the spec; mention them in the PR body so reviewers know they're deferred, not forgotten:

- KenKen game logic (`/play`, `/daily`), puzzle library, `/api/kenken/puzzle` route handler.
- Variants V2 (Arcade Tiles) and V3 (Daily-First) from the design canvas.
- Archive route + "Vote on what's next" wiring — placeholder `#` hrefs with a TODO comment.
- `PillarKey` / `pillarAccents` — must remain unchanged. Spot-check before opening the PR:
  ```bash
  git diff KenKen -- src/lib/pillars.ts src/components/landing/section-landing.tsx
  ```
  Expected: no output (no changes to those files).

---

## Self-review

**Spec coverage (handoff Acceptance checklist):**

- [x] `/brain-boost` loads as a full hub page → Task 2.10 replaces the placeholder.
- [x] Header "Brain Boost" between Blog and About → already on `KenKen` (Pre-flight).
- [x] Footer "Brain Boost" in Explore column → already on `KenKen` (Pre-flight).
- [x] `/brain-boost` in `sitemap.xml`; `/brain-boost/kenken/play`+`daily` excluded → Task 1.1 adds `/brain-boost`; `/play` and `/daily` were never added and Phase 1 does not add them.
- [x] Sunset Pulse accent only; no `pillarAccents` change → Tasks 2.4–2.9 read `BRAIN_BOOST_ACCENT`; the plan explicitly forbids touching `pillarAccents` and the Out-of-scope section spot-checks it with `git diff`.
- [x] "Brain Boost" (two words) everywhere → repeated verbatim in `meta.ts`, page metadata, JSON-LD, sections.
- [x] Featured KenKen primary → `/brain-boost/kenken/play`, secondary → `/brain-boost/kenken` → Task 2.6 wires both.
- [x] Daily strip primary → `/brain-boost/kenken/daily` → Task 2.7.
- [x] Coming-soon cards have no play links → Task 2.8 renders cards as `<article>`, not links.
- [x] `next/image` for both banners → Tasks 2.4 and 2.6 both use `<Image>`.
- [x] `bun run check` clean → Task 3.1.
- [x] Storyblok seed script for `kenken_*` components and `brain-boost/kenken` story → Phase 4.

**Placeholder scan:**

- One genuine `{/* TODO */}` lives in Task 2.7 (Archive button — spec-deferred) and Task 2.8 (Vote on what's next — spec-deferred). Both are intentional and match the handoff's "Out of scope" list.
- Task 4.2 carries a written warning that the prose blok must be filled in or stripped before commit — *not* shipped as a `TODO` or `undefined` in the actual seed content.

**Type consistency:** all icon names (`IconLayers`, `IconTarget`, `IconSparkles`, `IconCalendar`, `IconPlayerPlay`, `IconArrowRight`, `IconBrain`, `IconClock`, `IconFlame`) are valid `@tabler/icons-react` v3 exports. `BRAIN_BOOST_ACCENT.primary` is referenced consistently. `STATUS_LABEL[game.status]` returns a string for every `GameStatus` (test in Task 2.3 covers this).

---

## Execution handoff

**Plan complete. Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task (or per phase), review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Decisions (branch, sitemap priority, Phase-4 shape) are locked in — see "Decisions" section at the top.
