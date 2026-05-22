## PBDesk.com - Bits, Bites & Blog Posts WriteUps & Content Creation

# AGENTS.md — PBDesk.com Content Workspace

Instructions for AI agents and LLMs working in this folder. Read this file before producing any content.

---

## 1. Project Purpose

This workspace is used to write and prepare content for **PBDesk.com** (https://www.pbdesk.com).

Three types of content are produced here:

1. **Bits** — short tech posts
2. **Bites** — short health & wellness posts
3. **Blog Posts** — longer-form posts (tech, health & wellness, or a mix of Bits + Bites)

All output must match the tone and theme of pbdesk.com. Keep writing clear, concise, direct, and human. No fluff, no buzzwords, no em dashes.

---

## 2. Content Types

### 2.1 Bits Posts (Tech)

- **Topic scope:** Technology, dev tools, engineering tips, AI, productivity tooling, code snippets, quick how-tos.
- **Location:** all resources created, per request should be withing subfolder at `Posts/Bits` folder
- **Length:** 200–400 words.
- **Deliverables for every Bit:**
  - **Titles:** Suggest 3–5 title options (catchy, SEO-aware, human).
  - **Excerpt:**  max of 40 words and 200 characters. Hook the reader; summarize the value.
  - **Category:** Suggest one primary category (e.g., Tech, AI, Dev Tools, Productivity).
  - **Labels/Tags:** Suggest 4–8 relevant tags.
  - **Banner image:** Generate a banner that matches the pbdesk.com theme.
  - **Gradient background:** Suggest a gradient color combination (one of amber, violet, teal, orange, rose, red, emerald, blue, indigo, or hex codes + direction).
  - **SEO bundle:**
    - SEO Title (around 60 chars)
    - Meta Description (around 160 chars)
    - Keywords (comma-separated, 6–10 items)
    - OG Image suggestion (size 1200x630, description of visual)

### 2.2 Bites Posts (Health & Wellness)

- **Topic scope:** Health, wellness, nutrition, fitness, mental wellbeing, healthy habits, vegetarian-friendly tips.
- **Location:** all resources created, per request should be withing subfolder at `Posts/Bites` folder
- **Length:** 200–400 words.
- **Deliverables for every Bite:**
  - **Titles:** Suggest 3–5 title options.
  - **Excerpt:**  max of 40 words and 200 characters.
  - **Category:** Suggest one primary category (e.g., Wellness, Nutrition, Fitness, Mindset).
  - **Labels/Tags:** Suggest 4–8 relevant tags.
  - **Banner image:** Generate a banner that matches the pbdesk.com theme.
  - **Gradient background:** Suggest a gradient color combination (one of amber, violet, teal, orange, rose, red, emerald, blue, indigo, or hex codes + direction).
  - **SEO bundle:**
    - SEO Title (around 60 chars)
    - Meta Description (around 160 chars)
    - Keywords (comma-separated, 6–10 items)
    - OG Image suggestion (1200x630, description of visual)

### 2.3 Blog Posts (Long-form)

- **Topic scope:** Tech, health & wellness, or a blended Bits + Bites mix.
- **Location:** all resources created, per request should be withing subfolder at `Posts/Blog` folder
- **Length:** 400–600 words.
- **Deliverables for every Blog Post:**
  - **Titles:** Suggest 3–5 title options.
  - **Excerpt:**  max of 40 words and 200 characters.
  - **Category:** Suggest one primary category (Tech, Wellness, or Lifestyle).
  - **Labels/Tags:** Suggest 4–8 relevant tags.
  - **Banner image:** Generate a banner that matches the pbdesk.com theme.
  - **Gradient background:** Suggest a gradient color combination (one of amber, violet, teal, orange, rose, red, emerald, blue, indigo, or hex codes + direction).
  - **SEO bundle:**
    - SEO Title (around 60 chars)
    - Meta Description (around 160 chars)
    - Keywords (comma-separated, 6–10 items)
    - OG Image suggestion (1200x630, description of visual)

---

## 3. Required Output Structure

For every post produced, return content in this order:

1. **Post Type** — Bit / Bite / Blog
2. **Suggested Titles** (3–5 options)
3. **Main Body** — within the word count for that post type
4. **Excerpt** —  max of 40 words and 200 characters
5. **Category**
6. **Labels / Tags**
8. **Gradient Background** — Suggest a gradient color combination for the banner background (one of amber, violet, teal, orange, rose, red, emerald, blue, indigo)  or hex codes + direction (e.g., `linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)`)
9. **SEO Bundle**
   - SEO Title
   - Meta Description
   - Keywords
   - OG Image description (1200x630)

---

## 4. Tone & Style Rules

- Write like a smart friend talking to another human.
- Clear, concise, direct, natural — with empathy where the topic warrants it.
- No em dashes. No buzzwords. No filler.
- Don't pad to hit word count. If the idea is done, stop.
- Use short paragraphs. Use subheadings only when they actually help scanning.
- Avoid AI-sounding phrases ("In today's fast-paced world", "Let's dive in", "Buckle up", etc.).
- Code snippets in Bits/Blog posts: use proper fenced code blocks with the language tag.

---

## 5. Banner Image Guidelines

- Match the pbdesk.com visual theme (clean, modern, slightly minimal).
- Recommended dimensions: **1200x630** (works as banner + OG image).
- Prefer flat or subtle gradient backgrounds with one strong visual element.
- Always pair the banner with the suggested gradient hex values so it can be reproduced in CSS if needed.
- Avoid stock-photo clichés. Avoid copying real artists' styles.

---

## 6. SEO Guidance

- **SEO Title:** punchy, keyword-front-loaded, around 60 chars.
- **Meta Description:** around 160 chars, includes primary keyword, ends with a soft hook or value statement.
- **Keywords:** mix of head terms and long-tail phrases relevant to the post.
- **OG Image:** ideally the banner itself; if a separate one is needed, describe its composition.

---

## 7. File Output Conventions

- Save each post as its own folder under `Posts/` using the slug as the folder name.
- Inside the post folder:
  - `post.md` — the main written content
  - `meta.md` — titles, excerpt, category, tags, SEO bundle, gradient hex
  - `banner.png` (or `.jpg`) — the generated banner image
- Slug format: lowercase, hyphen-separated, no stop words (e.g., `bun-vs-node-quick-benchmark`).

---

## 8. Ask Before Assuming

If any of the following is unclear, ask the user before writing:

- Which post type (Bit / Bite / Blog)
- The topic angle or target audience
- Whether to include code samples or personal anecdotes
- Whether the post should reference WeightWatchers, work context, or stay neutral

Counter-questions are encouraged whenever requirements are thin.
