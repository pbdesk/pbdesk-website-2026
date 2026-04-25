# Claude Code — Implementation Prompt

Hand this prompt to Claude Code (`claude` CLI) inside the `pbdesk-website-2026` repo. It includes the full audit context and a step-by-step execution plan.

---

## Setup (run once before starting)

```bash
git checkout main
git pull
git checkout -b feat/design-system-audit-fixes
```

After each "Sitting" below, commit the work with the suggested message and run:
```bash
bun x ultracite fix
bun run build   # sanity check
```

---

## Context for Claude Code

You are working on `pbdesk-website-2026` — a Next.js 16 / React 19 / Tailwind 4 / Bun blog site. A design-system audit was performed; the full report is in `AUDIT.md` (paste it into the repo root when you start, or read from there). Follow the rules in `CLAUDE.md` and `AGENTS.md` (Ultracite/Biome, Server Components by default, `data-theme="dark"` not `class`, Tailwind 4 inline `@theme`, no `tailwind.config.js`, React Compiler enabled).

**Brand color decision:** keep the current indigo `#4f46e5`. Do not change `--color-brand-*`.

**Goal:** apply the audit recommendations on this branch, in three commits. Each commit should pass `bun x ultracite fix` and `bun run build`.

---

## Sitting 1 — Bug fixes & cleanup

Single commit. Each task has the file, the issue, and the exact change.

### 1. Delete the unused header implementation
The real header is `src/components/layout/header/header.tsx` (uses inline `navItems`). The other files are dead code from a different template, with broken hrefs and Tailwind classes that don't resolve in this config.
```bash
rm src/components/layout/header/desktop-nav.tsx
rm src/components/layout/header/main-mobile-nav.tsx
rm src/components/layout/header/nav-items.ts
```

### 2. Fix dead `[data-theme="light"]` selectors in `src/app/globals.css`
You set `data-theme="dark"` on `<html>` only — `data-theme="light"` is never set, so its rules never apply. Make light the default and dark the override.

Find and update these three blocks (search for `[data-theme="light"]`):

**Block A — `.tab-img-bg::after`:**
```css
/* REPLACE: */
[data-theme="light"] .tab-img-bg::after {
  position: absolute;
  /* … */
}
[data-theme="dark"] .tab-img-bg::after {
  background: linear-gradient(180deg, rgb(11 15 23 / 0) 0%, var(--bg-page) 93.51%);
}

/* WITH: */
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

**Block B — `.widget-bg`:**
```css
/* REPLACE the [data-theme="light"] .widget-bg block with: */
.widget-bg {
  background-image: linear-gradient(180deg, #eff6ff 0%, #dbeafe 50%, #e0f2fe 100%);
}
[data-theme="dark"] .widget-bg {
  background: rgb(255 255 255 / 0.1);
}
```

**Block C — `.white-gradient`:**
```css
/* REPLACE the [data-theme="light"] .white-gradient block with: */
.white-gradient {
  background-image: linear-gradient(180deg, rgb(255 255 255 / 0) 0%, var(--bg-page) 44.75%);
}
[data-theme="dark"] .white-gradient {
  background-image: linear-gradient(180deg, rgb(11 15 23 / 0) 0%, var(--bg-page) 44.75%);
}
```

### 3. Add JetBrains Mono via `next/font` so `--font-mono` actually resolves to a mono font

**`src/app/layout.tsx`:**
```ts
import { JetBrains_Mono, Onest } from "next/font/google";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// Update the <body> className:
<body className={`flex min-h-screen flex-col ${onest.variable} ${jetbrainsMono.variable}`}>
```

**`src/app/globals.css`** — update `--font-mono` (it currently starts with `var(--font-onest)`):
```css
--font-mono:
  var(--font-jetbrains-mono), ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
```

### 4. Make `next-themes` attribute explicit

**`src/app/layout.tsx`:**
```tsx
<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
```

### 5. Add focus-visible outlines

**`src/app/globals.css`** — add inside the existing `@layer base` block:
```css
@layer base {
  /* keep existing rules */
  *:focus-visible {
    outline: 2px solid var(--ring-color);
    outline-offset: 2px;
    border-radius: 4px;
  }
}
```

### 6. Fix Hero "Watch Intro" button (no action, no aria)

**`src/components/home/hero.tsx`** — either remove the `<button>Watch Intro</button>` block entirely (recommended for now) or convert it to a proper disabled state with `aria-disabled="true"` and visual styling. Recommended: delete the entire `<button>` block since there's no video to play yet.

### 7. Add `aria-label` to the search input

**`src/components/landing/section-landing.tsx`** — find the `<input … type="search">` and add:
```tsx
<input
  aria-label="Search posts"
  className="w-full bg-transparent text-sm focus:outline-none"
  placeholder="Search posts..."
  // …
/>
```

### 8. Cleanup `src/lib/utils.ts`

Remove these three lines and the commented `getMostRecentUserMessage` block (search for them):
```ts
// import type { UIMessage } from 'ai';
```
And remove `getScrollBarWidth` if no caller exists (`grep -r getScrollBarWidth src/` → if no results, delete).

### 9. Remove redundant background on `(site)/layout.tsx`

`html, body` already paints `var(--bg-page)`. The wrapper `<div className="bg-[var(--bg-page)]">` in `src/app/(site)/layout.tsx` can drop that class.

### Commit
```bash
git add -A
bun x ultracite fix
git add -A
git commit -m "fix(design-system): cleanup, mono font, dark-mode selectors, a11y baseline"
```

---

## Sitting 2 — Token consolidation (no visual change)

### 1. Centralize pillar accent colors as theme tokens

**`src/app/globals.css`** — inside the existing `@theme inline { … }` block, find the `/* Pillar colors */` section. Replace with:
```css
  /* Pillar accent colors — used by SectionLanding pages */
  --color-pillar-bits: #4f46e5;
  --color-pillar-bites: #10b981;
  --color-pillar-blog: #7c3aed;

  /* Legacy / surface tints — keep for any references */
  --color-bits: #3b82f6;
  --color-bits-dark: #1d4ed8;
  --color-bits-accent: #0ea5e9;
  --color-bites: #34d399;
  --color-bites-dark: #059669;
  --color-blog: #8b5cf6;
  --color-blog-dark: #2563eb;
```

### 2. Use the new tokens in pages

**`src/app/(site)/bits/page.tsx`** — change `accentColor="#4f46e5"` to `accentColor="var(--color-pillar-bits)"` *— wait, this won't work in `${accentColor}1a` template strings*. Keep them as hex literals in JSX but pull from a single source:

Create `src/lib/pillars.ts`:
```ts
export const pillarAccents = {
  bits:  { primary: "#4f46e5", secondary: "#0ea5e9" },
  bites: { primary: "#10b981", secondary: "#3b82f6" },
  blog:  { primary: "#7c3aed", secondary: "#10b981" },
} as const;
```

Then in each page:
```ts
import { pillarAccents } from "@/lib/pillars";

// …
<SectionLanding
  accentColor={pillarAccents.bits.primary}
  accentColor2={pillarAccents.bits.secondary}
  // …
/>
```

### 3. Fix nav links in header (already done if Sitting 1 ran — verify hrefs in `header.tsx` are `/`, `/bits`, `/bites`, `/blog`, `/about`)

### Commit
```bash
git add -A
bun x ultracite fix
git add -A
git commit -m "refactor(design-system): centralize pillar accent tokens"
```

---

## Sitting 3 — Component primitives (the big refactor)

This is the highest-leverage change. Goal: extract `Button`, `Card`, `Chip`, `Eyebrow` to `src/components/ui/` and replace inline `style={{}}` with Tailwind utilities across all components.

### 1. Create the primitives

**`src/components/ui/button.tsx`:**
```tsx
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--fg-brand)] text-white hover:-translate-y-0.5 shadow-[0_8px_20px_rgb(79_70_229_/_0.3)]",
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

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

interface LinkButtonProps extends BaseProps { href: string; }
interface NativeButtonProps extends BaseProps, Omit<ComponentProps<"button">, keyof BaseProps> { href?: never; }

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all",
    variants[variant], sizes[size], className,
  );
  if ("href" in props && props.href) {
    return <Link className={cls} href={props.href}>{children}</Link>;
  }
  const { href: _, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as NativeButtonProps;
  return <button className={cls} type="button" {...rest}>{children}</button>;
}
```

**`src/components/ui/card.tsx`:**
```tsx
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-[var(--shadow-sm)]",
        className,
      )}
      {...rest}
    />
  );
}
```

**`src/components/ui/eyebrow.tsx`:**
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-semibold text-xs uppercase tracking-widest text-[var(--fg-brand)]", className)}>
      {children}
    </span>
  );
}
```

**`src/components/ui/chip.tsx`:**
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  children, active, className,
}: {
  children: ReactNode; active?: boolean; className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium text-sm",
        active
          ? "bg-[var(--fg-brand)] text-white border-transparent"
          : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--fg-secondary)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
```

### 2. Refactor consumers

Replace inline-style patterns with the primitives + Tailwind arbitrary values. **Files to touch:**
- `src/components/home/hero.tsx` — Button (primary), Eyebrow chip, replace `style={{ color: "var(--fg-brand)" }}` etc.
- `src/components/home/cta-banner.tsx` — Button.
- `src/components/home/pillars.tsx` — Card, Eyebrow.
- `src/components/home/my-realm.tsx` — Card, Eyebrow, Chip.
- `src/components/home/about.tsx` — Eyebrow.
- `src/components/landing/post-card.tsx` — Card.
- `src/components/landing/featured-post.tsx` — Card.
- `src/components/landing/section-banner.tsx` — Eyebrow/Chip.
- `src/components/landing/section-landing.tsx` — replace `FilterChip` inline component with imported `Chip`.

For every `style={{ background: "var(--…)" }}` pattern, the equivalent Tailwind class is `bg-[var(--…)]`. Same for `color` → `text-[var(--…)]`, `borderColor` → `border-[var(--…)]`. Pull these out file-by-file. Run `bun x ultracite fix` after each file.

### 3. Standardize headings via the existing `.h1`/`.h2`/`.h3` utilities

Where components have:
```tsx
<h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.1, letterSpacing: "-0.025em" }} className="font-bold">
```
Replace with:
```tsx
<h2 className="h2">
```
The `.h2` utility in `globals.css` already encodes the same values.

### 4. Wire up the search input (optional — defer if scope creep)

Convert `SectionLanding` to a Client Component (`"use client"` at top) and add `useState` for the filter + search query. Filter `posts` before rendering. ~30 LOC.

### Commit
```bash
git add -A
bun x ultracite fix
git add -A
git commit -m "refactor(ui): extract Button/Card/Chip/Eyebrow primitives, replace inline styles with utilities"
```

---

## Open the PR

```bash
git push -u origin feat/design-system-audit-fixes
gh pr create --title "Design system audit fixes (P0 + P1)" --body-file PR_BODY.md
```

Suggested `PR_BODY.md`:
```markdown
Applies recommendations from `AUDIT.md` (the full audit lives at the repo root).

## Commits in this PR

1. **fix(design-system):** dead-code cleanup (unused header impl), JetBrains Mono now actually loads, `[data-theme="light"]` selectors fixed, focus rings, a11y labels, `next-themes` attribute made explicit.
2. **refactor(design-system):** centralized pillar accent tokens via `src/lib/pillars.ts`.
3. **refactor(ui):** extracted `Button`, `Card`, `Chip`, `Eyebrow` primitives to `src/components/ui/`. Replaced inline `style={{}}` with Tailwind arbitrary-value utilities across all consumer components.

## What's NOT in this PR (deferred)

- Brand color change — kept current indigo `#4f46e5`.
- Hero "app-window" visual port from the design-system UI kit.
- Filter chip + search input behavior wiring.
- Marquee animation on tag chips.

## Verification

- `bun run build` clean.
- `bun x ultracite fix` clean.
- Manual sweep: home, /bits, /bites, /blog, light + dark mode.
```

---

*End of handoff.*
