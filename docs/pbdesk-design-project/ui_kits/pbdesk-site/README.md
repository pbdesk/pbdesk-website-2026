# PBDesk Site — UI Kit

A hi-fi reference homepage for **pbdesk.com 2026**, styled after the [AI Starter Kit template](https://demo.aistarterkit.nextjstemplates.com/) with PBDesk's content (Bits / Bites / Blog / About).

## Files

| File | What |
|---|---|
| `index.html` | Entry point — loads React 18 + Babel + components |
| `App.jsx` | All sections: Nav, Hero, Brands, Lanes, Features, Marquee, About, Pillars, Featured, Newsletter, Footer, Tweaks |
| `styles.css` | Component styles (uses tokens from `colors_and_type.css`) |

## Sections (in order)

1. **Sticky Nav** — logo, section links, theme toggle, "Say Hello" CTA
2. **Hero** — eyebrow chip, centered H1 with gradient accent word, lede, CTAs, app-chrome mock visual with decorative blobs
3. **Brands strip** — tech stack Pinal uses (text-based, replace with SVGs if provided)
4. **Content Lanes** — Bits / Bites / Blog, three big cards with gradient thumbs
5. **Features / My Realm** — 6-tile capability grid on subtle bg
6. **Skills Marquee** — infinite scrolling chip row (tech + life)
7. **About Me** — "Welcome to my desk", portrait with floating chips, social links
8. **Wellness Pillars** — 4 numbered pillars (Nutrition / Exercise / Sleep / Emotional)
9. **Featured posts** — tabbed Bits/Bites/Blog, 3 cards each, real content pulled from pbdesk.com
10. **Newsletter** — gradient card with inline email form
11. **Footer** — brand col + 3 link cols + bottom bar

## Tweaks

Toggle the Tweaks toolbar to expose:
- Dark / light mode
- Brand accent (violet / indigo / emerald / rose)
- Decorative hero blobs on/off

## Notes on fidelity

- **Layout & sections** come from AIStarterKit: sticky nav, centered hero, brand strip, feature grid, tabbed showcase, testimonial/pricing blocks adapted into "lanes" and "pillars", newsletter capsule, multi-col footer.
- **Content** is pulled directly from pbdesk.com — headings, pillar copy, featured post titles & deks, social links.
- **Colors** center on **violet-600** (matches the avatar's purple shirt); neutrals are zinc; accents via sky.
- **Icons** are inline Lucide-style SVGs rendered inline in React (no external icon-font dependency).
- Everything renders in both light and dark mode via `.dark` class on `<html>`.
