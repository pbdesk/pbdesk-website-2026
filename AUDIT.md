# PBDesk Website 2026 — Design System Audit

**Repo:** `pbdesk/pbdesk-website-2026` @ `main` (commit `f0115d4ec`)
**Auditor:** Claude (against `PBDesk 2026 Design System` skill)
**Date:** April 25, 2026
**Scope:** `src/app/globals.css`, `src/app/layout.tsx`, `src/app/(site)/{layout,page,bits,bites,blog}.tsx`, `src/components/{home,landing,layout}/**`, `src/lib/utils.ts`

---

## TL;DR — verdict per area

| Area | Status | Severity |
|---|---|---|
| Token foundation (colors, type, spacing, radii, shadows) | ✅ Solid | — |
| Brand color identity | ⚠️ Drifted (indigo `#4f46e5` vs design-system blue `#2563EB`) | **Medium** — pick one |
| Typography (Onest + JetBrains Mono) | ⚠️ Mono falls back to sans | **Low** |
| Component consistency (buttons, cards, chips) | ⚠️ No shared primitives — duplicated inline styles everywhere | **High** |
| Hero composition | ⚠️ Missing the "app-window" visual panel from UI kit | **Medium** |
| Pillar pages (bits/bites/blog) | ✅ Functional, well-structured | **Low** — minor polish |
| Header | 🚨 **Two header implementations**, only one used; nav-items.ts has wrong hrefs | **High** — bug |
| Footer | ✅ Clean | — |
| Dark mode | ✅ Tokenized correctly, with one bug in `tab-img-bg` selector | **Low** |
| Accessibility | ⚠️ Missing focus rings, search input has no label, hero `<button>` has no action | **Medium** |
| Code style (Ultracite/Biome) | ⚠️ Heavy use of inline `style={{}}` for tokens — should be Tailwind classes | **Medium** |

**Bottom line:** the foundation is good and the site is shippable as-is. The biggest gaps are (1) **two competing header implementations** (real bug), (2) **brand color identity is unresolved** (indigo in code, blue in design-system CSS, violet in skill guide — pick one), and (3) **token-via-inline-style** instead of Tailwind utilities, which makes the codebase harder to maintain than it needs to be.

The recommendations below are grouped by priority. Each finding has the file, the issue, and a concrete recommended diff.

---

## P0 — Bugs to fix before any visual work

### B1. Two header implementations exist; one is wired up incorrectly

**Files:** `src/components/layout/header/{header.tsx,desktop-nav.tsx,main-mobile-nav.tsx,nav-items.ts}`

**The problem:**
- `header.tsx` is the **real** header — used by `(site)/layout.tsx`. It has its own inline `navItems` array, mobile menu, socials, theme toggle. Works.
- `desktop-nav.tsx` and `main-mobile-nav.tsx` are a **second, unused** header implementation pulled from a different template. They reference:
  - `@/icons/icons` exports `ChevronDownIcon`, `ChevronDown2Icon`, `CloseIcon`, `MenuIcon` — those exist (good).
  - `@/lib/utils` `cn` — exists (good).
  - But they import `navItems` from `nav-items.ts`, where the hrefs are **broken** (see below).
- `nav-items.ts` has the wrong hrefs. Bits links to `/text-generator`, Bites links to `/pricing`, About links to `/contact`. These look like leftovers from the AI Starter Kit template and would 404 if anything actually rendered them.

**Why it matters:** dead code, confusing for future contributors, and `nav-items.ts` is a footgun if anyone wires up `desktop-nav.tsx`.

**Recommended fix — pick one:**

**Option A (recommended): delete the unused files.** The inline nav inside `header.tsx` is fine for a site this size.
```bash
rm src/components/layout/header/desktop-nav.tsx
rm src/components/layout/header/main-mobile-nav.tsx
rm src/components/layout/header/nav-items.ts
```

**Option B:** keep `nav-items.ts` as the single source of truth, fix the hrefs, and refactor `header.tsx` to consume it.

```ts
// src/components/layout/header/nav-items.ts
export const navItems: NavItem[] = [
  { type: "link", href: "/", label: "Home" },
  { type: "link", href: "/bits", label: "Bits" },
  { type: "link", href: "/bites", label: "Bites" },
  { type: "link", href: "/blog", label: "Blog" },
  { type: "link", href: "/about", label: "About" },
];

type NavItem =
  | { type: "link"; href: string; label: string }
  | { type: "dropdown"; label: string; items: { href: string; label: string }[] };
```

If you go with Option B, also delete `desktop-nav.tsx` and `main-mobile-nav.tsx` — they have an unfinished `dark:bg-dark-secondary` / `dark:bg-dark-primary` design from a different theme that won't resolve in this Tailwind config.

---

### B2. `tab-img-bg::after` light-mode selector is dead code

**File:** `src/app/globals.css` (lines ~388–410)

**The problem:**
```css
[data-theme="light"] .tab-img-bg::after { ... }
```
You only set `[data-theme="dark"]` on `<html>`; you never set `[data-theme="light"]`. The light variant of this overlay never applies.

**Recommended fix:** make the light variant the default, and the dark variant the override.
```css
.tab-img-bg::after {
  position: absolute;
  top: 0; left: 0; z-index: 10;
  width: 100%; height: 100%;
  content: "";
  background: linear-gradient(180deg, rgb(255 255 255 / 0) 0%, var(--bg-page) 93.51%);
  border-radius: 32px;
}

[data-theme="dark"] .tab-img-bg::after {
  background: linear-gradient(180deg, rgb(11 15 23 / 0) 0%, var(--bg-page) 93.51%);
}
```

The same pattern affects `.white-gradient` and `.widget-bg` (lines ~480–510) — same fix.

---

### B3. `--font-mono` resolves to Onest, not JetBrains Mono

**File:** `src/app/globals.css` (lines ~83–89)

**The problem:**
```css
--font-mono:
  var(--font-onest), ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
```
`--font-onest` is a sans variable font; using it as the mono fallback means any `.mono` text on a system without JetBrains Mono installed falls through to Onest. The design system **explicitly** specifies JetBrains Mono for code (`colors_and_type.css` imports it from Google Fonts).

**Recommended fix:** import JetBrains Mono via `next/font` (same pattern as Onest), then drop `var(--font-onest)` from `--font-mono`.

```ts
// src/app/layout.tsx
import { JetBrains_Mono, Onest } from "next/font/google";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

// in <body>:
<body className={`flex min-h-screen flex-col ${onest.variable} ${jetbrainsMono.variable}`}>
```

```css
/* globals.css */
--font-mono:
  var(--font-jetbrains-mono), ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
```

---

## P1 — Brand identity decision (one ask, then a cascade of follow-ups)

### D1. Brand color is unresolved

You have **three** brand-color directions floating around:

| Source | Brand 600 | Notes |
|---|---|---|
| `globals.css` (current code) | **`#4f46e5` indigo** | What ships today |
| Design system `colors_and_type.css` | **`#2563EB` blue** | What the design tokens file says |
| Skill guide markdown | **`#7C3AED` violet** | The narrative — "echoes the avatar's purple shirt" |

These are not interchangeable. The whole gradient palette (newsletter, pillar-bits, post-grad-indigo, etc.) tilts toward whichever you pick. **You need to pick one before any of the other recommendations make sense.**

**My recommendation:** keep the **current indigo `#4f46e5`** in code. Reasons:
1. It's already shipped consistently across 13KB of CSS gradients and components.
2. Indigo splits the difference between "blue" (modern tech/AI vibe per AIStarterKit reference) and "violet" (the avatar shirt). It's a defensible compromise.
3. Changing it ripples into ~20 places in `globals.css` (newsletter, pillar gradients, post-grad-indigo, etc.).

**If you disagree** and want blue or violet, the change set is:
- `globals.css`: `--color-brand-*` scale, `--fg-brand` (light + dark), `--border-brand`, `--ring-color`, `.button-bg`, `.gradient-btn`, `.hero-glow-bg`, `.gradient-bg-two`, `.newsletter-gradient`, `.pillar-bits-gradient`, `.hero-blob-left`, `.gradient-border::before`
- All `bits/page.tsx` `accentColor` props
- `home/about.tsx` "writing code" chip background

I can produce that diff if you want — just tell me which color.

### D2. Update the design-system files to match the chosen direction

Once you pick: **the design-system project's `colors_and_type.css` should be updated to match** so future audits don't keep flagging this. (I can't write to that project, but I'd recommend opening a follow-up to align the source-of-truth file.)

---

## P1 — Component primitives are missing

### C1. No shared `Button`, `Card`, `Chip`, `Container` primitives

**Files:** every component in `src/components/`

**The problem:** the same patterns are inlined repeatedly:
- The pill button (`rounded-full`, `h-12`, `px-7`, brand bg) — re-implemented in `hero.tsx`, `cta-banner.tsx`, `section-banner.tsx`, `featured-post.tsx`, `post-card.tsx` (as `.btn` style), and as the `FilterChip` in `section-landing.tsx`.
- The card surface (`rounded-2xl`, `bg-elevated`, `border-subtle`, `shadow-sm`) — re-implemented in `pillars.tsx`, `my-realm.tsx`, `post-card.tsx`, `featured-post.tsx`.
- The category/eyebrow chip — duplicated in `hero.tsx`, `pillars.tsx`, `my-realm.tsx`, `about.tsx`.

This violates the "lift component primitives out of the UI kit" pattern that the design system prescribes (see `ui_kits/pbdesk-site/styles.css` — it has a single `.btn` / `.btn-primary` / `.feature-card` / `.chip` system that's much DRYer than what's in the React code).

**Recommended fix:** add `src/components/ui/` with the four primitives. A starting point:

```tsx
// src/components/ui/button.tsx
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--fg-brand)] text-white shadow-[0_8px_20px_rgb(79_70_229_/_0.3)] hover:-translate-y-0.5 hover:shadow-lg",
  secondary:
    "border border-[var(--fg-brand)] text-[var(--fg-brand)] hover:bg-[var(--fg-brand)] hover:text-white",
  ghost:
    "border border-[var(--border-strong)] text-[var(--fg-primary)] hover:bg-[var(--bg-subtle)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-7 text-sm",
  lg: "h-14 px-8 text-base",
};

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
  ...rest
}: ButtonProps & Omit<ComponentProps<"button">, keyof ButtonProps>) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all",
    variants[variant],
    sizes[size],
    className
  );
  if (href) {
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} type="button" {...rest}>
      {children}
    </button>
  );
}
```

```tsx
// src/components/ui/card.tsx
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...rest
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-[var(--shadow-sm)]",
        className
      )}
      {...rest}
    />
  );
}
```

```tsx
// src/components/ui/eyebrow.tsx
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-semibold text-xs uppercase tracking-widest text-[var(--fg-brand)]">
      {children}
    </p>
  );
}
```

```tsx
// src/components/ui/chip.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  children,
  active,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium text-sm",
        active
          ? "bg-[var(--fg-brand)] text-white border-transparent"
          : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--fg-secondary)]",
        className
      )}
    >
      {children}
    </span>
  );
}
```

Then refactor `hero.tsx`, `cta-banner.tsx`, etc. to consume them. Estimated diff: ~150 lines deleted across 6 files, ~80 lines added in 4 new files. Net win on maintainability.

---

### C2. Hero is missing the design-system "app-window" visual

**File:** `src/components/home/hero.tsx`
**Reference:** `ui_kits/pbdesk-site/styles.css` lines ~205–305 (`.hero-visual`, `.hero-visual-chrome`, `.hv-sidebar`, etc.)

**The problem:** the design system's hero has a **macOS-window mockup** below the CTAs showing a faux blog-reader app (sidebar with category list, content area with a card and progress bar). This is the visual signature that makes the hero feel like a real product page rather than a generic blog hero. The current hero ends at the social row and goes straight into the Pillars section.

**Recommended fix:** add a `<HeroVisual />` sub-component below the social row. Two sub-options:

**Quick (1h):** copy-port the CSS-only version from the UI kit `styles.css` directly into `globals.css`, render the markup in `hero.tsx`. Pure decoration, no logic.

**Better (2h):** build a real "preview your reading experience" component — sidebar with the four pillars, a featured post card from real `posts` data. Doubles as a teaser for the `Bits/Bites/Blog` pages.

I'd recommend the quick version first — it gets visual parity, and if it lands well you can promote it to a real component.

If skipping: the current hero is fine. Just be aware it's noticeably less complete than the reference.

---

### C3. `Pillars` has 3 items, design system has 4

**File:** `src/components/home/pillars.tsx`
**Reference:** `colors_and_type.css` defines `--color-bites`, `--color-bits`, `--color-blog`, plus `ui_kits` shows a 4-column grid.

**Observation:** the code's "Three lanes, one desk." has 3 cards (Bits / Bites / Blog). The skill guide describes 4 pillars but those are the 4 *content categories within Bites* (Nutrition, Movement, Sleep, Mindfulness) — and those *do* render in `my-realm.tsx`. So the count is actually correct; the heading just clashes with the UI kit's 4-column `.pillars` grid.

**Recommended fix:** none. This is intentional. The UI kit's 4-pillar grid is for the "My Wellness Pillars" sub-section. Leaving as-is.

---

### C4. `MyRealm` mixes two unrelated widget types in one section

**File:** `src/components/home/my-realm.tsx`

**The problem:** this single component renders (a) 4 wellness pillar cards, (b) 3 site feature cards (Short-form Bits, Wellness for devs, Longer essays), and (c) a tag chip strip — all under one "My realm" heading. It's a lot of vertical territory and the three groups don't share a narrative.

**Recommended fix:** split into two sections with their own headings.

```tsx
// (site)/page.tsx — proposed
<Hero />
<Pillars />               // "Three lanes, one desk." — the Bits/Bites/Blog cards
<WellnessPillars />       // 4 cards: Nutrition / Movement / Sleep / Mindfulness, eyebrow "My realm"
<WhatYouFindHere />       // 3 feature cards, eyebrow "What you'll find here"
<TechMarquee />           // The tags as an animated marquee like the UI kit (currently static)
<About />
<CtaBanner />
```

The UI kit (`styles.css` `.marquee`) actually animates the tag strip — currently static in the React code.

Lower-priority polish — fine to defer.

---

### C5. `SectionBanner` title size is too large on mobile

**File:** `src/components/landing/section-banner.tsx` (line ~36)

```tsx
fontSize: "clamp(72px, 10vw, 144px)"
```

72px minimum at 320px viewport = ugly overflow on the word "Bites". The UI kit uses ~56px on small screens.

**Recommended fix:**
```tsx
fontSize: "clamp(56px, 10vw, 144px)"
```

---

### C6. Footer brand-mark inverts colors compared to header

**Files:** `src/components/layout/{header/header.tsx,footer.tsx}`

**The problem:** in the header, the `<span className="pb-mark">` shows brand color, "Desk" shows `var(--fg-primary)` — correct, matches the brand. In the footer, the same pattern is used — also correct.

**Wait, this one is actually fine.** Cancelling this finding. Listed it because I expected drift; verified there isn't any.

---

## P1 — Pages

### Pa1. Home page (`(site)/page.tsx`)

**State:** ✅ Functional. Composition is sensible: Hero → Pillars → MyRealm → About → CtaBanner.

**Recommendations:**
1. After the Hero, before Pillars, consider adding the **"As featured on / built with" tech-strip** from the UI kit (`.brands-grid`). Right now the page goes from headline → big colored cards which is a bit abrupt.
2. The `MyRealm` split (C4 above) would tighten this page significantly.

### Pa2. Bits / Bites / Blog (all use `SectionLanding`)

**State:** ✅ Solid. Same component, three configurations. Filters, search input, featured + secondary, then a 3-col grid. Good design pattern.

**Findings:**

1. **Filter chips are non-functional.** They're styled buttons with no `onClick`, no state. If the user clicks "AI" on Bits, nothing happens. This is fine if you're explicit about it ("coming soon"), but it's a UX expectation gap. Either:
   - Wire them up to a `useState`-driven filter (the code's cognitively-complex enough that this would benefit from being a client component — currently the page is a server component, which conflicts with interactivity).
   - Or make them visually less interactive (e.g., display-only category labels above the grid) until you wire the filter logic.

2. **Search input is non-functional and missing a label.** Add `aria-label="Search posts"` at minimum.

3. **`PostCard.title` is rendered twice** — once inside the colored gradient banner, once below in the body. This is intentional in the UI kit reference (the banner is "thumbnail art with title overlay"), but on hover the duplication feels redundant. Consider hiding the body `<h4>` if a real thumbnail image is added.

4. **`accentColor` prop is hard-coded per page.** That's fine, but it duplicates colors that should be design tokens:
   - Bits: `#4f46e5` (matches `--color-brand-600` ✓)
   - Bites: `#10b981` (matches `--color-success` ✓)
   - Blog: `#7c3aed` (no token — invent `--color-blog-accent` and centralize)

   Recommended addition to `globals.css`:
   ```css
   @theme inline {
     --color-pillar-bits: #4f46e5;
     --color-pillar-bites: #10b981;
     --color-pillar-blog: #7c3aed;
   }
   ```
   You already have `--color-bits`, `--color-bites`, `--color-blog` defined but they don't match the page accents. Reconcile.

5. **Bits cadence is "weekly" but the post count is static.** Once you have a CMS (or MDX), this should derive from real content.

---

## P2 — Accessibility

### A1. No visible focus rings anywhere

**Scope:** all interactive elements — buttons, links, theme toggle, mobile menu trigger, filter chips, search input.

**The problem:** Tailwind 4 strips default focus rings. None of the components add `focus-visible:ring-2 focus-visible:ring-[var(--ring-color)]`. Keyboard users have no indication of focus.

**Recommended fix:** add a base layer rule in `globals.css`:
```css
@layer base {
  *:focus-visible {
    outline: 2px solid var(--ring-color);
    outline-offset: 2px;
    border-radius: 4px;
  }
}
```

This honors your existing `--ring-color` token and works site-wide.

### A2. Hero "Watch Intro" button has no action and no `aria-label`

**File:** `src/components/home/hero.tsx`

```tsx
<button type="button">...Watch Intro</button>
```

It looks clickable, behaves as a button, does nothing. Either remove it, link it to a real video, or add `aria-disabled="true"` and visual styling to communicate "coming soon."

### A3. Eyebrow `<p>` should be `<span>` or wrapped in heading

**Files:** `home/pillars.tsx`, `home/my-realm.tsx`, `home/about.tsx`

Eyebrows render as `<p>` but they're really a heading kicker. Either:
- Make them `<span>` so screen readers don't treat them as a paragraph break before the real `<h2>`.
- Or make them part of the heading: `<h2><span class="eyebrow">My realm</span><br/>Health, family, ...</h2>`.

The `<span>` route is simpler. Use the existing `.eyebrow` utility class instead of repeated inline `style={{}}`.

### A4. Search input is unlabeled

**File:** `src/components/landing/section-landing.tsx`
```tsx
<input className="..." placeholder="Search posts..." type="search" />
```
No label, no `aria-label`. Add `aria-label="Search posts"`.

---

## P2 — Code style (Ultracite/Biome compliance)

### S1. Heavy use of inline `style={{}}` for design tokens

**Scope:** every component — `hero.tsx`, `pillars.tsx`, `my-realm.tsx`, `about.tsx`, `cta-banner.tsx`, `section-banner.tsx`, `post-card.tsx`, `featured-post.tsx`, `footer.tsx`, `header.tsx`.

**The problem:** dozens of repetitions of:
```tsx
style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--fg-secondary)" }}
```
Tailwind 4 supports arbitrary values for CSS variables: `bg-[var(--bg-elevated)]`, `border-[var(--border-subtle)]`, `text-[var(--fg-secondary)]`. Using utility classes instead of inline style:
- Lets the React Compiler optimize properly (inline objects break memoization).
- Matches the codebase's stated style (Tailwind 4, no `tailwind.config.js`).
- Is much more readable.

**Recommended pattern:**
```tsx
// Before
<div
  className="rounded-2xl border p-7"
  style={{
    background: "var(--bg-elevated)",
    borderColor: "var(--border-subtle)",
    color: "var(--fg-secondary)",
  }}
>

// After
<div className="rounded-2xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--fg-secondary)] p-7">
```

Even better: define semantic Tailwind classes once, e.g., `.surface-elevated`, `.text-secondary`, `.border-default` in your `@theme inline` block, and use them everywhere.

This is a sweep-the-codebase change. I'd do it together with the C1 primitives extraction so you're touching each component once.

### S2. `font-bold` + `font-semibold` are inconsistently chosen for h2/h3

**Files:** various.

The skill guide says "Display weights go to 700; body 400/500." Currently:
- Hero h1 → 700 (clamp 44–84px) ✓
- Section h2 → 700 in `home/pillars.tsx`, `home/my-realm.tsx` ✓
- `h3.font-bold` in `pillars.tsx` (xl size) — should probably be 600/`semibold` per the design system's `h3` rule (line ~167 of `globals.css`).
- `h3.font-bold` in `my-realm.tsx` (lg + base sizes) — same.
- `h3.font-semibold` in `my-realm.tsx` (different card type) — correct.

**Recommended fix:** standardize via the `.h3` / `.h4` utility classes already defined in `globals.css`. Or build a `<Heading level={3}>` component that picks the right weight automatically.

### S3. `desktop-nav.tsx` references undefined Tailwind classes

**File:** `src/components/layout/header/desktop-nav.tsx`

Uses `bg-dark-secondary`, `text-primary-500`, `border-gray-800`, `shadow-theme-lg` — none of these are defined in your `globals.css` `@theme inline` block. They'd render as broken classes if this file were ever imported. (Currently it isn't, so it's just dead code — see B1.) Delete the file.

---

## P2 — Misc

### M1. `cn` import comments still in `lib/utils.ts`

```ts
// import type { UIMessage } from 'ai';
```
and a commented-out `getMostRecentUserMessage` block. Cleanup. Three lines of delete.

### M2. `getScrollBarWidth()` is unused

```ts
export function getScrollBarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}
```
No callers in the codebase. Either delete or document where it's intended to be used (likely modal scroll-lock when you add modals).

### M3. `(site)/layout.tsx` uses `bg-[var(--bg-page)]` once but the CSS already paints body

`html, body` already get `background: var(--bg-page)` in `globals.css`. The `<div className="bg-[var(--bg-page)]">` wrapper is redundant. Three-character delete.

### M4. Newsletter form has no validation, no submit handling

**File:** `src/components/home/cta-banner.tsx`

`onSubmit={(e) => e.preventDefault()}` and that's it. Fine for now, but flag a TODO so you don't ship a "subscribe" button that does literally nothing in production. At minimum:
- Add `required type="email"` to the input.
- Add a `name="email"` so the form is at least submittable to a Formspree/Buttondown endpoint later.

### M5. `(site)/blog/page.tsx` uses `IconBook2` and `IconNotebook` — pillIcon is the right one for the eyebrow tile

Just a verification: `IconBook2` is the big tile icon, `IconNotebook` is the small chip icon. Reads well. ✓

### M6. `next-themes` `<ThemeProvider>` defaults to `class` strategy

**File:** `src/app/layout.tsx`

Your CSS uses `[data-theme="dark"]` (per `CLAUDE.md`'s "Dark mode uses `data-theme="dark"` attribute, not Tailwind's `class` strategy"). But:
```tsx
<ThemeProvider disableTransitionOnChange>
```
You're not passing `attribute="data-theme"`. Default `next-themes` attribute is `data-theme` (since v0.4) — so this *probably* works, but it's fragile. **Make it explicit:**

```tsx
<ThemeProvider attribute="data-theme" disableTransitionOnChange>
```

I'd also recommend `defaultTheme="system"` and `enableSystem` if you want OS-pref to win on first load (typical preference).

---

## Recommended fix order

If I were you, I'd do this in three sittings:

**Sitting 1 — Bugs (1–2h):**
- B1: delete `desktop-nav.tsx`, `main-mobile-nav.tsx`, `nav-items.ts` (or fix the hrefs and consolidate).
- B2: fix `[data-theme="light"]` selectors → make light the default.
- B3: import JetBrains Mono via `next/font`.
- M6: make `attribute="data-theme"` explicit on `ThemeProvider`.
- A1: add `*:focus-visible` outline rule.
- A2, A4: fix the unlabeled / non-functional buttons.
- M1, M2, M3: cleanup.

**Sitting 2 — Decision + cascade (30m + 1h):**
- D1: pick a brand color (indigo/blue/violet). I recommend keeping indigo. Then sweep `globals.css` if you change.
- Pa2.4: centralize pillar accent colors as theme tokens.

**Sitting 3 — Refactor (3–4h):**
- C1: extract `Button`, `Card`, `Chip`, `Eyebrow` primitives to `src/components/ui/`.
- S1: replace inline `style={{}}` with Tailwind arbitrary values across all components.
- S2: standardize heading weights via `.h2`, `.h3`, `.h4` utility classes.
- C2 (optional): port the hero "app-window" visual from the UI kit.
- C4 (optional): split MyRealm into two sections.

---

## What I did NOT change

For transparency — files I read but did **not** flag any issues against:
- `src/lib/providers/toaster.tsx` — clean.
- `src/components/landing/featured-post.tsx` — duplicates code with `post-card.tsx`, but that's covered by C1 (component extraction). No standalone bug.
- `src/icons/icons.tsx` — too large to read in full; trusted the imports resolve.

## What I did NOT touch

Per your instruction to not overwrite settings:
- `package.json`, `tsconfig.json`, `biome.json`, `next.config.ts`, `postcss.config.mjs`, `bunfig.toml`, `lefthook.yml`, `.mise.toml` — untouched.
- `AGENTS.md`, `CLAUDE.md`, `README.md`, `.github/`, `.claude/`, `.cursor/`, `.vscode/` — untouched.

The only config-adjacent recommendation in this audit is **"add `jetbrains_mono` from `next/font/google` in `layout.tsx`"** — it doesn't add a dependency (Google Fonts is already used for Onest), it's a one-line import.

---

*End of audit.*
