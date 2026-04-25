# PBDesk 2026 — Design System

**PBDesk** is the personal brand + blog of **Pinal Bhatt** — software engineer, AI tinkerer, and wellness enthusiast. The tagline is **"Bits & Bites — Developer's Life"** and the site is split across four content pillars:

- **Bits** — AI, programming, tools, dev-life insights
- **Bites** — wellness, fitness, nutrition, mindfulness
- **Blog** — longer-form reflections bridging both worlds
- **About Me** — who Pinal is

## This project

Moving **pbdesk.com** (currently Astro) onto the new Next.js 16 / Tailwind 4 / React 19 stack in the `pbdesk-website-2026` repo, **styled after** [demo.aistarterkit.nextjstemplates.com](https://demo.aistarterkit.nextjstemplates.com/) with full **dark/light mode** support. Content is lifted from pbdesk.com; visual language is lifted from the AI Starter Kit template.

## Sources

- **Current site** → https://www.pbdesk.com/ (Astro)
- **Target shell** → `pbdesk/pbdesk-website-2026` (Next.js 16, React 19, Tailwind 4, Biome/Ultracite, Bun) — currently only the create-next-app scaffold
- **Visual reference** → https://demo.aistarterkit.nextjstemplates.com/
- **Brand asset** → `assets/pb-logo.png` (the waving purple-shirt avatar) — the only real brand mark; everything else in the current site is article imagery

## Index

| File / folder | What it is |
|---|---|
| `colors_and_type.css` | Color + type tokens (light & dark), semantic CSS vars |
| `fonts/` | Web fonts (Inter, JetBrains Mono via Google Fonts) |
| `assets/` | Logo and favicons |
| `preview/` | Design-system cards (populates the Design System tab) |
| `ui_kits/pbdesk-site/` | UI kit for the marketing/blog site |
| `SKILL.md` | Agent skill entry point |

## Content fundamentals

**Voice.** First-person, warm, slightly enthusiastic. Pinal writes *as* himself: "Hello! I'm Pinal Bhatt, I'm Human & I'm Software Engineer, and I love writing code!" Uses exclamation marks generously but not obnoxiously. Comfortable mixing tech talk with lifestyle ("health is wealth!").

**Casing.** Title Case for section headers ("My Realm", "My Wellness Pillars", "Featured Bits"). Sentence case in body. Brand name is **PBDesk** (one word, camel-ish) — usually with a small trailing dot in the logo ("PBDesk.").

**I vs you.** Heavy first-person *I* in the about/hero ("from the desk of Pinal Bhatt"). Switches to *we* for aspirational closers ("Let's build, grow, and thrive together."). Rarely uses *you* directly.

**Tone.** Optimistic, curious, invitational. Not corporate. Not snarky. Threads tech + wellness as equally valuable ("when we take care of our bodies and minds, we show up stronger").

**Emoji.** Sparingly in tweet embeds; not used in core site copy. Safe to keep off the brand.

**Example lines to match:**
- "Bits & Bites — Developer's Life"
- "Learning Endeavor Forever… from the desk of Pinal Bhatt."
- "Welcome to my desk!!!"
- "Let's build, learn, and innovate together!"

## Visual foundations

**Colors.** Take two palettes from the AIStarterKit template and merge with Pinal's signature **purple** (from the avatar's shirt) as the brand accent. Neutrals skew cool-gray, not warm. Full dark-mode counterparts for every token.

- **Brand / primary:** violet-600 (`#7C3AED`) — echoes the avatar's shirt
- **Accent:** sky-blue (`#0EA5E9`) for link/underline motifs
- **Neutrals:** zinc scale for UI, near-black for dark mode surface (`#0B0F17`)
- **Semantic:** emerald / amber / rose (lifted from AIStarterKit badge conventions)

**Type.** **Inter** for UI + body; **JetBrains Mono** for code. Tight tracking (-0.02em) on display sizes. Font-feature `ss01, cv11` for Inter. Display weights go to 700; body 400/500.

**Spacing.** 4-px grid. Section vertical padding `py-20` to `py-32`. Max content width `max-w-6xl` (72rem). Generous whitespace — AIStarterKit breathes.

**Backgrounds.** Mostly flat `bg-white` / `bg-zinc-950`. Hero uses **floating SVG shape decorations** at the edges (faint, low-contrast). Never full-bleed photography in the chrome. Optional subtle radial gradient behind the hero headline in dark mode (violet glow at 5% opacity).

**Animation.** Soft fade-in-up on scroll (200ms, `cubic-bezier(0.16, 1, 0.3, 1)`). Hover transitions 150ms. No bounces, no parallax. Marquee for the logo/tech-stack strip, infinite linear scroll.

**Hover states.** Buttons lift brightness ~8% and shadow grows subtly. Links go from zinc-900 → violet-600 on hover with an animated underline sliding in from the left. Cards lift `translateY(-2px)` + shadow steps up one level.

**Press states.** Buttons shrink to `scale(0.98)` with a 100ms transition. Shadow collapses.

**Borders.** 1px, `zinc-200` light / `zinc-800` dark. Never colored borders except for focus rings (`ring-2 ring-violet-500/40`).

**Shadows.** Elevation scale: `sm` (tiny), `md` (card resting), `lg` (card hover / dropdowns), `xl` (modals). Light mode uses `0 1px 3px rgb(0 0 0 / 0.06)` style soft drops. Dark mode swaps to rim-light (`inset 0 1px 0 rgb(255 255 255 / 0.05)`).

**Capsules vs protection gradients.** Buttons and chips are **pill-shaped** (radius-full) — matches AIStarterKit. Cards are `rounded-2xl` (16px). Images inside cards `rounded-xl`. No protection gradients over images.

**Layout rules.** Sticky top nav, 72px tall, blurred backdrop (`backdrop-blur bg-white/80`). Footer fixed-width columns, 4 columns → 1 column on mobile. Hero always asymmetric (headline left, decorative shapes right) — never centered-all.

**Transparency & blur.** Nav uses `backdrop-blur-md`. Glass cards: avoided. Overlays on modals use `bg-black/40`.

**Imagery vibe.** Warm, realistic, mixed (photos + article thumbnails). Avatar is emoji-style 3D. No grain, no B&W filters.

**Corner radii.** Buttons → `9999px` (pill). Cards → `16px`. Inputs → `10px`. Images in cards → `12px`. Icons → none (SVG).

**Card anatomy.** White (or `zinc-900` dark) surface · 1px border · `rounded-2xl` · 24px interior padding · optional image at top (16:9) with inset rounded corners · category chip + title + dek + "Read more →" link row.

## Iconography

**System:** **Lucide** (CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.js`) — matches the stroke weight and rounded-line feel of the AIStarterKit icons. Template itself ships custom SVGs (pencil, bulb, robot, chat, crown, lightning-bolt); we substitute with Lucide equivalents (`pen-tool`, `lightbulb`, `bot`, `message-circle`, `crown`, `zap`) — **flagged substitution, ask Pinal if he wants to commission matching custom SVGs later.**

- **No emoji** in the UI chrome. (Emoji appear only inside embedded tweets.)
- **No unicode glyphs** as icons (arrows etc. use Lucide `arrow-right` / `arrow-up-right`).
- **Stroke weight:** 1.5–2px, rounded line caps, rounded joins.
- **Default size:** 20px inline, 24px in cards, 40px in feature tiles.
- **Color:** inherits `currentColor`. Feature tiles use a 48×48 rounded square with a 10% violet tint behind a violet icon.

## Caveats / open items

- **Fonts** are Google Fonts (Inter + JetBrains Mono) for now — flagged substitution for the template's custom font if Pinal wants exact parity.
- **AIStarterKit illustrations** (hero decorative shapes, benefit tile illustrations) are not redistributable; substituted with original Lucide-based icons + simple SVG blobs. Flagged.
- Photography placeholders use the existing pbdesk.com article thumbnails in situ — for production, Pinal should supply high-res originals.
