---
name: write-post
description: Write content for PBDesk.com - Bits (short tech posts), Bites (short health & wellness posts), or Blog posts (long-form). Produces the full deliverable bundle (titles, body, excerpt, category, tags, gradient, SEO) and saves it to the right folder under Posts/. Use when the user asks to write/draft a Bit, Bite, or blog post, or content for pbdesk.com.
---

# Write Post (PBDesk.com)

Write and prepare content for **PBDesk.com**. Three content types: **Bits** (short tech), **Bites** (short health & wellness), **Blog Posts** (long-form). Always read `Posts/AGENTS.md` first for the authoritative spec; this skill operationalizes it.

## Step 1: Clarify before writing

If any of these are unclear from the request, ask before drafting (counter-questions are encouraged when requirements are thin):

- **Post type** — Bit / Bite / Blog
- **Topic angle & target audience**
- **Code samples or personal anecdotes?** (yes/no)
- **Reference WeightWatchers / work context, or stay neutral?**

Don't ask if the request already answers these. Use `AskUserQuestion` for crisp choices.

## Step 2: Know the type spec

| | Bit | Bite | Blog |
|---|---|---|---|
| **Topic** | Tech, dev tools, AI, productivity, code how-tos | Health, wellness, nutrition, fitness, mindset, veg-friendly | Tech, wellness, or blended |
| **Length** | 200–400 words | 200–400 words | 400–600 words |
| **Folder** | `Posts/Bits/<slug>/` | `Posts/Bites/<slug>/` | `Posts/Blog/<slug>/` |
| **Categories** | Tech, AI, Dev Tools, Productivity | Wellness, Nutrition, Fitness, Mindset | Tech, Wellness, Lifestyle |

## Step 3: Tone & style (non-negotiable)

- Write like a smart friend talking to a human. Clear, concise, direct, natural, with empathy where warranted.
- **No em dashes. No buzzwords. No filler.** Don't pad to hit word count - if the idea is done, stop.
- Short paragraphs. Subheadings only when they help scanning.
- Avoid AI-sounding phrases ("In today's fast-paced world", "Let's dive in", "Buckle up", etc.).
- Code snippets: proper fenced code blocks with the language tag.

## Step 4: Produce the full deliverable bundle

Every post needs all of these:

1. **Suggested Titles** — 3–5 options (catchy, SEO-aware, human)
2. **Main Body** — within the type's word count
3. **Excerpt** — max of 40 words and 200 characters, hooks the reader and summarizes the value
4. **Category** — one primary (from the type's list)
5. **Labels / Tags** — 4–8 relevant tags
6. **Gradient Background** — one of: amber, violet, teal, orange, rose, red, emerald, blue, indigo; 
7. **Banner image** — see Step 5
8. **SEO Bundle**:
   - SEO Title (~60 chars, keyword-front-loaded)
   - Meta Description (~160 chars, includes primary keyword, ends with a soft hook)
   - Keywords (comma-separated, 6–10 items, mix of head + long-tail)
   - OG Image description (1200x630)

## Step 5: Banner image

- Match pbdesk.com theme: clean, modern, slightly minimal.
- Dimensions **1200x630** (doubles as OG image).
- Flat or subtle gradient background with one strong visual element.
- Pair the banner with the suggested gradient hex values so it's reproducible in CSS.
- Avoid stock-photo clichés and copying real artists' styles.
- If you can't generate the image, describe it precisely so it can be produced later, and note `banner.png` is pending.

## Step 6: Save the files

Slug format: lowercase, hyphen-separated, no stop words (e.g. `bun-vs-node-quick-benchmark`).

Create the post folder under the correct type folder and write:

- `post.md` — main written content (title + body)
- `meta.md` — titles, excerpt, category, tags, gradient hex, full SEO bundle
- `banner.png` (or `.jpg`) — generated banner, or note it's pending

Example: `Posts/Bits/bun-vs-node-quick-benchmark/post.md` + `meta.md` + `banner.png`.

## Output order (when presenting in chat)

1. Post Type
2. Suggested Titles
3. Main Body
4. Excerpt
5. Category
6. Labels / Tags
7. Gradient Background
8. SEO Bundle

Then confirm the files written and their paths.
