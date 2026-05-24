# Claude Code — `/brain-boost` Hub Implementation

Hand this prompt to Claude Code (`claude` CLI) inside the **`pbdesk-website-2026`** repo, working on the **`KenKen`** branch.

This handoff covers **the full `/brain-boost` hub page** — i.e. the part the spec explicitly defers ("`/brain-boost` is an empty placeholder for now"). We are now upgrading that placeholder into the full Brain Boost games-hub landing.

---

## Setup

```bash
git checkout KenKen
git pull
git checkout -b feat/brain-boost-hub
```

After each phase below, commit with the suggested message and run:
```bash
bun run lint
bun run build   # sanity check
```

Final pre-merge: `bun run format && bun run check`.

---

## Context for Claude Code

You are working on `pbdesk-website-2026` — Next.js 16 / React 19 / Tailwind 4 / Bun. Follow the rules in `CLAUDE.md` and `AGENTS.md` (Ultracite/Biome, Server Components by default, `data-theme="dark"` not `class`, Tailwind 4 inline `@theme`, no `tailwind.config.js`, React Compiler enabled).

**Source of truth — spec:** `docs/superpowers/specs/2026-05-23-kenken-design.md` (sections 2, 2.A, 10).

**Source of truth — visual design:** the three direction mocks live in the linked design project at `Brain Boost Hub.html` (three variants: V1 Editorial Hub, V2 Arcade Tiles, V3 Daily-First, each in light + dark). **Implement V1 (Editorial Hub)** as the primary direction — it mirrors the existing `bites` / `blog` pillar pattern and slots in cleanly. Hold V2 / V3 sections in reserve as opt-in extensions (noted in §5 below).

**Critical constraints from the spec:**

1. **Bespoke styling.** `/brain-boost` does **NOT** use `SectionLanding` / `SectionBanner`. Build new components under `src/components/brain-boost/hub/`.
2. **No `PillarKey` change.** `pillarAccents` and `PillarKey` are untouched. Brain Boost has a standalone Sunset Pulse accent (already present at `src/components/brain-boost/accent.ts`).
3. **Two words.** "Brain Boost" everywhere in UI / nav / footer / meta. URL slug stays `/brain-boost`.
4. **Banner asset.** Use `/pillers/brain-boost-banner.png` (already committed). It's a 1920×640 sunset-orange / rose hero image with a 3-D KenKen grid + puzzle piece + dice; do **not** reuse the bits/bites/blog banner pattern.

---

## Phase 1 — Wire Brain Boost into the site shell

**One commit.** Adds the nav entry, footer entry, sitemap entry. Lays the groundwork for the hub page.

### 1.1 Header — add Brain Boost to default nav

**File:** `src/components/layout/header/header.tsx`

Add `Brain Boost` to `DEFAULT_NAV_ITEMS` between `Blog` and `About`:

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

No other changes to the header — the existing `pathname.startsWith(item.href)` active-state logic will work for `/brain-boost` and its sub-routes.

### 1.2 Footer — add Brain Boost link

**File:** `src/components/layout/footer.tsx`

Find the "Explore" column (the one with Bits / Bites / Blog) and insert a `Brain Boost` `<Link href="/brain-boost">` entry, placed between `Blog` and `About Me`. Match the surrounding link styling exactly — do not introduce new classes.

### 1.3 Sitemap — index the hub page

**File:** `src/app/sitemap.ts`

Add to `STATIC_ROUTES`:

```ts
{ path: "/brain-boost", changeFrequency: "weekly", priority: 0.85 },
```

Place it after the existing pillar entries. Per the spec, `/brain-boost/kenken/play` and `/brain-boost/kenken/daily` stay **excluded** from the sitemap; `/brain-boost/kenken` (the info page) is handled by its own task (not this PR).

### 1.4 Commit

```bash
bun run lint
bun run build
git add -A
git commit -m "feat(nav): add Brain Boost to header, footer, and sitemap"
```

---

## Phase 2 — Implement the `/brain-boost` hub page

**One commit.** Replaces the placeholder at `src/app/(site)/brain-boost/page.tsx` with the full hub composition.

### 2.1 File layout

Create:

```
src/components/brain-boost/hub/
  brain-boost-hero.tsx            # banner image, fades into the page
  brain-boost-intro.tsx           # centered breadcrumb + h1 + lede + meta row
  brain-boost-featured-kenken.tsx # the big 2-column featured-game card
  brain-boost-daily-strip.tsx     # full-width Sunset-Pulse gradient CTA strip
  brain-boost-coming-soon.tsx     # 3-card grid of queued games
  brain-boost-benefits.tsx        # 4-card "why Brain Boost?" strip
  games-registry.ts               # typed list of games (live + coming)
  meta.ts                         # canonical copy (lede, etc.) reused by metadata
```

All sub-components are **Server Components** unless they need client interactivity (none of these do in Phase 2).

### 2.2 Games registry — `games-registry.ts`

```ts
import type { ComponentType } from "react";

export type GameStatus = "live" | "coming-q3" | "coming-q4" | "exploring";

export interface BrainBoostGame {
  slug: string;            // "kenken"
  name: string;            // "KenKen"
  status: GameStatus;
  category: string;        // "Arithmetic · Logic"
  description: string;
  href?: string;           // present for live games
  coverImage?: string;     // e.g. "/pillers/kenken-banner.png" for live
  glyph?: string;          // 3-letter mono glyph for coming-soon cards ("SUD")
  tiers?: number;
  estTime?: string;        // "10–25 min"
  operations?: string;     // "+ − × ÷"
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
  { slug: "sudoku",  name: "Sudoku",        status: "coming-q3", glyph: "SUD",
    category: "Logic",   description: "Classic 9×9 with hand-picked difficulty curves and a no-mark-ups expert mode." },
  { slug: "cryptic", name: "Cryptic Mini",  status: "coming-q4", glyph: "CRY",
    category: "Words",   description: "Five-clue cryptic crossword, finishable on a coffee break. Each solved clue links to its wordplay." },
  { slug: "logic-grid", name: "Logic Grid", status: "exploring", glyph: "LOG",
    category: "Logic",   description: "Five-by-five attribute deduction puzzles — the kind your physics teacher used to print and hand out." },
];

export const STATUS_LABEL: Record<GameStatus, string> = {
  "live": "Now playing",
  "coming-q3": "Coming · Q3",
  "coming-q4": "Coming · Q4",
  "exploring": "Exploring",
};
```

### 2.3 Canonical copy — `meta.ts`

```ts
export const BRAIN_BOOST_TITLE = "Brain Boost";
export const BRAIN_BOOST_TAGLINE = "Short games for long focus.";
export const BRAIN_BOOST_LEDE =
  "A new corner of PBDesk for short, focused puzzles that sharpen the mind between Bits and Bites. Twenty minutes of arithmetic logic, one solved grid at a time — the kind of quiet focus that resets a working day. KenKen is here today; more games are queued.";

export const BRAIN_BOOST_META = [
  { value: "1",    label: "game live",        icon: "Layers" },
  { value: "4",    label: "difficulty tiers", icon: "Target" },
  { value: "~200", label: "hand-checked puzzles", icon: "Sparkles" },
  { value: "1",    label: "new puzzle every day", icon: "Calendar" },
] as const;
```

### 2.4 The page — `src/app/(site)/brain-boost/page.tsx`

Replace whatever is there with:

```tsx
import type { Metadata } from "next";
import BrainBoostHero from "@/components/brain-boost/hub/brain-boost-hero";
import BrainBoostIntro from "@/components/brain-boost/hub/brain-boost-intro";
import BrainBoostFeaturedKenken from "@/components/brain-boost/hub/brain-boost-featured-kenken";
import BrainBoostDailyStrip from "@/components/brain-boost/hub/brain-boost-daily-strip";
import BrainBoostComingSoon from "@/components/brain-boost/hub/brain-boost-coming-soon";
import BrainBoostBenefits from "@/components/brain-boost/hub/brain-boost-benefits";
import { BRAIN_BOOST_LEDE } from "@/components/brain-boost/hub/meta";
import { jsonLdString, pageMetadata, SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Brain Boost — Short games for long focus",
  description:
    "Brain Boost is PBDesk's small puzzle corner — KenKen today, more queued. A fresh daily puzzle, four difficulty tiers, hand-checked games designed to fit a coffee break.",
  path: "/brain-boost",
  keywords: ["puzzles", "kenken", "brain training", "focus", "logic puzzles", "PBDesk"],
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

### 2.5 Section-by-section build

**Match the V1 Editorial Hub mock at `Brain Boost Hub.html`.** Layout, copy, spacing, and accent usage below describe the same composition in code terms; treat the mock as the visual ground truth and these notes as the structural requirements.

For every section, use **existing design-system tokens** (`var(--bg-page)`, `var(--fg-primary)`, `var(--border-subtle)`, etc.). The Sunset Pulse accent is read from `BRAIN_BOOST_ACCENT` in `src/components/brain-boost/accent.ts` — import it where needed, **never inline the hex values.**

For shared shapes (eyebrow chip, gradient button, accent gradient text), add three small Brain-Boost-scoped helpers to `globals.css` under a new comment block:

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

Keep the gradient values literal in CSS (matches the rest of the file's hard-coded hex usage); the TypeScript code path goes through `BRAIN_BOOST_ACCENT`.

#### Hero — `brain-boost-hero.tsx`
- `next/image` of `/pillers/brain-boost-banner.png` at `width=1920 height=640 priority`.
- `className="block h-auto w-full"`; render a thin `linear-gradient(180deg, transparent, var(--bg-page))` overlay over the bottom 30% so the banner fades into the page.
- No text overlay — the banner image already carries the "Brain Boosters" wordmark.

#### Intro — `brain-boost-intro.tsx`
- Centered, inside `.wrapper`, with `py-12`.
- Breadcrumb: `PBDesk / Brain Boost` (current crumb bold, `text-[var(--fg-primary)]`).
- `h1` — `clamp(48px, 6vw, 80px)`, `font-weight: 800`, `letter-spacing: -0.03em`, `line-height: 1.05`. Copy: `My <span class="bb-gradient-text">Brain Boost</span>`.
- Lede paragraph: `BRAIN_BOOST_LEDE`, `max-w-3xl`, centered, `text-[var(--fg-secondary)]`, `text-base sm:text-lg`, `line-height: 1.7`.
- Meta row below: 4 stat items from `BRAIN_BOOST_META`, separated by a `border-t border-[var(--border-subtle)]`. Each item is `[icon-tile (36×36, sunset-tinted) ][ <strong>{value}</strong> {label} ]`. Tile background: `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 12%, transparent)`; tile color: `BRAIN_BOOST_ACCENT.primary`.

#### Featured KenKen — `brain-boost-featured-kenken.tsx`
- Section header row: `<h2>The <span class="bb-gradient-text">first game</span> is KenKen</h2>` on the left; `<Link href="/brain-boost">All games →</Link>` ghost button on the right.
- Card — 2-column grid (`1.2fr 1fr`), `rounded-2xl`, `border border-[var(--border-subtle)]`, `bg-[var(--bg-elevated)]`, `shadow-[var(--shadow-lg)]`, `overflow-hidden`.
- **Left column (cover):**
  - Background gradient `linear-gradient(135deg, #134e4a 0%, #0d9488 40%, #14b8a6 100%)` (matches the kenken-banner artwork's teal palette).
  - `min-height: 380px`, padded 32px, content centered.
  - "Now playing" chip pinned top-left: pill, `.bb-gradient-bg`, white text, uppercase mono `text-[11px] tracking-[0.12em]`.
  - `next/image` of `/pillers/kenken-banner.png`, max-width 460, `rounded-2xl`, drop shadow `0 30px 60px -20px rgb(0 0 0 / 0.4)`.
- **Right column (body):**
  - Category eyebrow (mono uppercase, sunset orange): `Arithmetic · Logic`.
  - `h3` 40px / 800 / `tracking-tight`: `KenKen`.
  - Description paragraph: the long KenKen description from the games registry.
  - Stats row — 3 columns separated by `border-y border-[var(--border-subtle)]`, 18px padding: `3×3 → 9×9 / Grid sizes`, `~10–25 min / Typical solve`, `+ − × ÷ / Operations`.
  - CTA row: `Link` to `/brain-boost/kenken/play` (primary, `.bb-gradient-btn`, "▶ Play KenKen") + `Link` to `/brain-boost/kenken` (secondary outline, "How to play").

#### Daily strip — `brain-boost-daily-strip.tsx`
- Full-bleed card inside `.wrapper`, `rounded-2xl`, `.bb-gradient-bg` background, white text.
- Decorative radial highlight: `::before` with `radial-gradient(circle at 80% 30%, rgb(255 255 255 / 0.18), transparent 50%)`.
- Two-column grid (1fr auto), 36px / 40px padding:
  - **Left:** `h3` 28px / 800 — "Today's daily — Intermediate". Sub line: "A fresh hand-checked KenKen, the same all day. Refresh keeps your progress; come back tomorrow for a new one."
  - **Right:** two pill buttons — solid white "▶ Play today's" → `/brain-boost/kenken/daily`, frosted "📅 Archive" (placeholder href `#`, mark `aria-disabled` and add a `// TODO archive route — Phase 2 of the spec` comment).

#### Coming soon — `brain-boost-coming-soon.tsx`
- Section header: `<h2><span class="bb-gradient-text">Coming next</span></h2>` on the left; right side mono micro-text `Vote on what's next →` (link to a placeholder href; mark with the same TODO comment).
- 3-column grid of `BRAIN_BOOST_GAMES.filter(g => g.status !== "live")`.
- Each card: `rounded-2xl`, `1px dashed var(--border-strong)`, `bg-[var(--bg-subtle)]`, padding 28px, `min-height: 220px`, flex-column with `gap: 14px`.
- Status chip top-left: `STATUS_LABEL[status]`, mono uppercase 10px, `bg-[var(--bg-elevated)]`, `border-[var(--border-subtle)]`.
- `h4` 20px / 700: game name.
- Description paragraph 13px / `text-[var(--fg-muted)]`.
- Glyph at the bottom: 36px mono, `.bb-gradient-text` with `opacity: 0.7`. Uses `game.glyph`.

#### Benefits — `brain-boost-benefits.tsx`
- Section header: `<h2>Why <span class="bb-gradient-text">Brain Boost?</span></h2>`.
- 4-column grid (collapses on mobile per Tailwind responsive utilities — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Each card: `rounded-2xl`, `border border-[var(--border-subtle)]`, `bg-[var(--bg-elevated)]`, padding 24px.
- Icon tile (44×44, `rounded-xl`): `color-mix(in srgb, ${BRAIN_BOOST_ACCENT.primary} 12%, transparent)` background; `BRAIN_BOOST_ACCENT.primary` foreground.
- Use **`@tabler/icons-react`** (already a dep): `IconTarget`, `IconBrain`, `IconClock`, `IconFlame`.
- Copy (exactly):
  1. **Single-task focus** — "Puzzles are one-pointed by design. Twenty minutes of nothing-but-this is a small luxury during a working week."
  2. **Working-memory workout** — "Mental arithmetic + spatial reasoning, in low-stakes reps. The "I can almost see it" feeling is the point."
  3. **Designed to be short** — "Every puzzle has a finish line within 30 minutes. No sprawling boards, no endless modes."
  4. **Daily ritual, no streak shame** — "A new puzzle every day, but we won't shake a finger at you if you miss one. Show up when you can."

### 2.6 Commit

```bash
bun run lint
bun run build
git add -A
git commit -m "feat(brain-boost): build /brain-boost hub page (V1 editorial direction)"
```

---

## Phase 3 — Verify

Run the full check:

```bash
bun run format
bun run check     # clean + lint + build + audit (this is slow — final-verification only)
```

Manual sweep — visit each in **light AND dark**:

- `/` — homepage still renders; nav now shows 6 items including Brain Boost.
- `/brain-boost` — full hub renders. Banner at top, "My Brain Boost" h1, KenKen featured card, sunset daily strip, 3 coming-soon dashed cards, 4 benefits.
- `/bits`, `/bites`, `/blog` — unchanged (regression check; `pillarAccents` / `PillarKey` MUST be untouched).
- Mobile viewport (≤ 640px) — confirm grids reflow: featured KenKen stacks (cover above body), 4-column meta row collapses, 3-card coming-soon and 4-card benefits collapse to 1–2 columns gracefully.
- Hover the primary `bb-gradient-btn` — gentle lift + glow.
- Focus the "Play KenKen" button via keyboard — focus ring visible (the project-wide `*:focus-visible` rule covers this).

---

## Acceptance checklist (from the spec, §14 — adapted for hub scope)

- [ ] `/brain-boost` loads as a full hub page (no crash, no placeholder).
- [ ] Header includes "Brain Boost" between Blog and About; active-state underlines on `/brain-boost` and any `/brain-boost/*` route.
- [ ] Footer includes a "Brain Boost" link in the Explore column.
- [ ] `/brain-boost` appears in `sitemap.xml`; `/brain-boost/kenken/play` and `/brain-boost/kenken/daily` do **not**.
- [ ] The Sunset Pulse accent (`#f97316 → #ec4899`) is the only accent in use on the hub — `pillarAccents` / `PillarKey` are unchanged (grep should still show 3 pillar entries).
- [ ] All copy uses "Brain Boost" (two words). URL slug stays `/brain-boost`.
- [ ] Featured KenKen card links to `/brain-boost/kenken/play` (primary) and `/brain-boost/kenken` (secondary).
- [ ] Daily strip's "Play today's" links to `/brain-boost/kenken/daily`.
- [ ] Coming-soon cards do not have play links (status chips only).
- [ ] `next/image` is used for both banners (no raw `<img>`).
- [ ] Light + dark both pass a visual sweep.
- [ ] `bun run check` clean.

---

## Out of scope (deferred — do not implement in this PR)

These are **explicitly out of scope** for this PR. They are part of the KenKen game implementation or future phases per `docs/superpowers/specs/2026-05-23-kenken-design.md`:

- `/brain-boost/kenken`, `/brain-boost/kenken/play`, `/brain-boost/kenken/daily` — the KenKen game itself + its bespoke Storyblok info page (covered by separate handoffs).
- Puzzle generator script and committed puzzle libraries (`src/lib/games/kenken/puzzles/*.json`).
- `GET /api/kenken/puzzle` route handler.
- Storyblok `kenken_page` content type + bloks.
- The "Vote on what's next" CTA in the coming-soon section — placeholder `#` href in this PR, mark with a `// TODO` for a future phase.
- The "Archive" CTA on the daily strip — placeholder `#`, marked TODO. Date-seeded daily archive is Phase 2 of the spec.
- Variants V2 (Arcade Tiles) and V3 (Daily-First) from the design canvas — kept in reserve.

If V2 or V3 sections are wanted later (e.g. the V3 daily-puzzle hero with a live KenKen-grid mock, or the V2 game-tile grid), they can be added as additional section components without disturbing the V1 composition — they are independent of the page shell.

---

## Open the PR

```bash
git push -u origin feat/brain-boost-hub
gh pr create --title "feat(brain-boost): /brain-boost hub page" --body-file PR_BODY.md --base KenKen
```

Suggested `PR_BODY.md`:

```markdown
Implements the full `/brain-boost` hub page — upgrading the empty placeholder from the spec to the V1 Editorial Hub direction (see linked design mock).

Per spec (`docs/superpowers/specs/2026-05-23-kenken-design.md`):
- **Bespoke styling** — no `SectionLanding` / `SectionBanner` reuse.
- **No `PillarKey` change** — Sunset Pulse accent is the existing standalone `BRAIN_BOOST_ACCENT` constant.
- **"Brain Boost" (two words)** in nav, footer, hub copy, metadata.

## Commits in this PR

1. **feat(nav):** add Brain Boost to header default nav, footer Explore column, and sitemap.
2. **feat(brain-boost):** build the hub page — hero banner, intro + meta, featured KenKen card, daily strip, coming-soon games grid, benefits strip. New components under `src/components/brain-boost/hub/`.

## What's NOT in this PR (deferred per spec / separate handoffs)

- KenKen game (`/play`, `/daily`), info page (`/brain-boost/kenken`), puzzle library, API route, Storyblok bloks.
- Archive route and "Vote on what's next" wiring — placeholder `#` hrefs with `TODO` comments.

## Verification

- `bun run check` clean.
- Manual sweep: home, /bits, /bites, /blog, /brain-boost — light + dark.
- Mobile viewport reflow verified.
```

---

*End of handoff.*
