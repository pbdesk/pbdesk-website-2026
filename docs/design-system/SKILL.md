---
name: pbdesk-design
description: Use this skill to generate well-branded interfaces and assets for PBDesk (Pinal Bhatt's personal site — Bits & Bites, Developer's Life), either for production or throwaway prototypes. Contains colors, type, fonts, assets, and a UI kit styled after the AIStarterKit template with dark/light mode.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view, linking `colors_and_type.css`. If working on production code (the `pbdesk-website-2026` Next.js repo), you can copy assets and read the rules in README.md to become an expert in designing with this brand.

Key files:
- `README.md` — full brand guide (voice, colors, iconography, visual foundations)
- `colors_and_type.css` — drop-in CSS tokens for light + dark mode
- `assets/pb-logo.png` — the waving purple-shirt avatar (only real brand mark)
- `ui_kits/pbdesk-site/` — reference homepage + components (`App.jsx`, `styles.css`)
- `preview/` — atomic component cards

If the user invokes this skill without other guidance, ask what they want to build (a new page? a slide? a blog post template?), ask a couple of clarifying questions, then act as an expert designer who outputs HTML artifacts or production code depending on the need.
