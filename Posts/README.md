# Posts — Content Workspace

This folder is the local content workspace for **PBDesk.com**. Everything here feeds the site through Storyblok CMS.

Three pillars live here:

| Folder | Pillar | Topic | Length |
|--------|--------|-------|--------|
| `Bits/` | **Bits** | Tech, dev tools, AI, productivity, code how-tos | 200–400 words |
| `Bites/` | **Bites** | Health, wellness, nutrition, fitness, mindset | 200–400 words |
| `Blog/` | **Blog** | Long-form — tech, wellness, or blended | 400–600 words |

Each post lives in its own folder named after its slug:

```
Posts/
  Bits/<slug>/
    post.md      ← # Title + body (markdown)
    meta.md      ← titles, excerpt, category, tags, gradient, SEO
    banner.png   ← 1200×630 cover image
  Bites/<slug>/
    ...
  Blog/<slug>/
    ...
  scripts/
    create-post.ts   ← push local post → Storyblok (unpublished draft)
    post-from-sb.ts  ← pull Storyblok story → local post folder
```

---

## Writing posts with the `write-post` skill

The fastest way to produce a post is the built-in Claude skill. Open Claude Code and type what you want — the skill handles format, file layout, and SEO automatically.

### How to trigger it

Just describe the post naturally. The skill activates whenever you ask to write a Bit, Bite, or Blog post:

```
Write a Bit about using Bun's test runner instead of Jest.
Draft a Bite on building a habit of drinking more water.
Write a Blog post comparing burnout recovery strategies for developers.
```

Claude will ask a few clarifying questions if the request is thin, then produce the full bundle and save files to the right folder.

---

### Bits examples (Tech)

```
Write a Bit about TypeScript's `satisfies` operator — when to use it and why.
```
→ Saves to `Posts/Bits/typescript-satisfies-operator/`

```
Draft a short Bit on how Tailwind CSS 4 removes the config file.
Include a before/after code snippet.
```
→ Saves to `Posts/Bits/tailwind-css-4-no-config/`

```
Write a Bit on Claude Code hooks — what they are and a practical example.
```
→ Saves to `Posts/Bits/claude-code-hooks-practical-guide/`

```
Bit: how to use Bun's built-in SQLite driver without any extra packages.
```
→ Saves to `Posts/Bits/bun-sqlite-no-dependencies/`

---

### Bites examples (Health & Wellness)

```
Write a Bite about the 80/20 rule applied to eating habits — vegetarian angle.
```
→ Saves to `Posts/Bites/80-20-eating-habits-vegetarian/`

```
Draft a Bite on the science of a 10-minute walk after meals.
Keep it practical, no jargon.
```
→ Saves to `Posts/Bites/10-minute-walk-after-meals/`

```
Bite: simple ways to reduce screen fatigue without a full digital detox.
```
→ Saves to `Posts/Bites/reduce-screen-fatigue-simple-tips/`

```
Write a Bite about magnesium — why developers are likely deficient and how to fix it.
```
→ Saves to `Posts/Bites/magnesium-deficiency-developers/`

---

### Blog examples (Long-form)

```
Write a Blog post on building a sustainable morning routine as a remote engineer.
Mix productivity and wellness.
```
→ Saves to `Posts/Blog/sustainable-morning-routine-remote-engineers/`

```
Blog: a deep dive into the AI tools that actually stuck in my workflow this year.
Personal angle, no fluff.
```
→ Saves to `Posts/Blog/ai-tools-that-stuck-workflow-2025/`

```
Write a long-form post on why most developer health advice doesn't work,
and what actually does. Reference WeightWatchers context where relevant.
```
→ Saves to `Posts/Blog/developer-health-advice-that-works/`

---

### What the skill produces

For every post the skill writes and saves:

- **`post.md`** — `# Title` followed by the full body in markdown
- **`meta.md`** — suggested titles, excerpt, category, labels/tags, gradient color, SEO bundle (title · meta description · keywords · OG image description)
- **`banner.png`** — generated banner (1200×630), or a precise description if generation isn't available

---

## Scripts

These scripts sync content between your local `Posts/` folder and Storyblok. Both read credentials from `.env.local`.

Required env vars:
```
STORYBLOK_MANAGEMENT_TOKEN=...
STORYBLOK_SPACE_ID=...
STORYBLOK_REGION=eu   # optional, defaults to "eu"
```

---

### `create-post.ts` — push local post to Storyblok

Reads a local post folder and creates (or updates) an **unpublished draft** story in Storyblok. Re-running is safe — it upserts the existing draft, never publishes.

```bash
# Dry run — validates files and prints a summary, no Storyblok writes
bun run Posts/scripts/create-post.ts "Bits/bun-all-in-one-js-runtime" --dry-run

# Push to Storyblok (creates or updates draft)
bun run Posts/scripts/create-post.ts "Bits/bun-all-in-one-js-runtime"
bun run Posts/scripts/create-post.ts "Bites/10-minute-walk-after-meals"
bun run Posts/scripts/create-post.ts "Blog/sustainable-morning-routine-remote-engineers"
```

**What it does:**

1. Reads `post.md` (extracts H1 as title, converts body to Storyblok richtext)
2. Reads `meta.md` (excerpt, category, labels, SEO bundle)
3. Uploads `banner.*` to the Storyblok asset library (idempotent — SHA-1 cached, no re-uploads)
4. Extends `post-categories` and `post-labels` datasources with any new values
5. Creates or updates the draft story at `<pillar>/<slug>` — **never publishes**

**Folder requirements:**

```
Posts/Bits/my-slug/
  post.md    ← must start with # Title (H1)
  meta.md    ← must have ## Excerpt, ## Category, ## Labels / Tags sections
  banner.*   ← png / jpg / jpeg / webp / avif / gif (optional but recommended)
```

---

### `post-from-sb.ts` — pull Storyblok story to local folder

The inverse of `create-post.ts`. Downloads a draft story from Storyblok and writes the local `post.md`, `meta.md`, and `banner.*` files. Use this to sync edits made in the Storyblok visual editor back to disk.

```bash
# Pull a story by its full slug (pillar/slug, lowercase)
bun run Posts/scripts/post-from-sb.ts "bits/bun-all-in-one-js-runtime"
bun run Posts/scripts/post-from-sb.ts "bites/10-minute-walk-after-meals"
bun run Posts/scripts/post-from-sb.ts "blog/sustainable-morning-routine-remote-engineers"
```

**What it does:**

1. Fetches the draft story from Storyblok by `<pillar>/<slug>`
2. Converts Storyblok richtext back to markdown
3. Writes `post.md` and `meta.md` to `Posts/<Pillar>/<slug>/`
4. Downloads the cover image as `banner.<ext>` if one is set

The output folder matches `create-post.ts`'s expected layout, so you can pull, edit locally, and push again cleanly.

---

## Typical workflow

```
1. Ask Claude to write a post  →  files appear in Posts/<Pillar>/<slug>/
2. Review and tweak post.md and meta.md
3. bun run Posts/scripts/create-post.ts "Bits/<slug>" --dry-run   ← check
4. bun run Posts/scripts/create-post.ts "Bits/<slug>"              ← push draft
5. Open Storyblok, review the draft, publish when ready
```

To edit a post that already exists in Storyblok:

```
1. bun run Posts/scripts/post-from-sb.ts "bits/<slug>"   ← pull
2. Edit locally
3. bun run Posts/scripts/create-post.ts "Bits/<slug>"    ← push updated draft
```
