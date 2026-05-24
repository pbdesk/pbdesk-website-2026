# Brain Boost — handoff bundle

Drop this into the `pbdesk-website-2026` repo on the `KenKen` branch.

## Contents

```
BRAIN_BOOST_HUB_HANDOFF.md    ← the prompt for Claude Code (the main thing)
design/                       ← visual ground-truth mock
  Brain Boost Hub.html          ← open in a browser to see the 3 directions
  brain-boost.css               ← tokens + styles used by the mock
  brain-boost-chrome.jsx        ← shared Nav / Footer / icons
  brain-boost-variants.jsx      ← V1 Editorial · V2 Arcade · V3 Daily-First
  design-canvas.jsx             ← Figma-ish canvas wrapper
  public/pillers/
    brain-boost-banner.png      ← hero banner asset (1920×640)
    kenken-banner.png           ← KenKen card cover asset
```

## Place it in the repo

From the repo root:

```bash
git checkout KenKen
git pull
unzip /path/to/brain-boost-handoff.zip -d .

# move the handoff doc to the repo root, the mock to docs/design/
mv brain-boost-handoff/BRAIN_BOOST_HUB_HANDOFF.md ./
mkdir -p docs/design
mv brain-boost-handoff/design/* docs/design/
rm -rf brain-boost-handoff

git add BRAIN_BOOST_HUB_HANDOFF.md docs/design
git commit -m "docs: brain-boost hub handoff + design mock"
```

> The banner PNGs in `design/public/pillers/` are **only** for the mock to render
> standalone. The repo already has the production copies at
> `public/pillers/brain-boost-banner.png` and `public/pillers/kenken-banner.png` —
> the handoff doc tells Claude Code to use those existing paths.

## Hand off to Claude Code

In the repo root:

```bash
claude
```

Paste this prompt:

> Read `BRAIN_BOOST_HUB_HANDOFF.md` at the repo root and execute it end-to-end. The visual ground truth is `docs/design/Brain Boost Hub.html` (V1 — Editorial Hub artboard); open it in a browser if you need to check spacing or hierarchy. Work through Phase 1, then Phase 2, then Phase 3 verification. Stop and ask before deviating from the spec (`docs/superpowers/specs/2026-05-23-kenken-design.md`) — especially around `PillarKey` / `pillarAccents` which must stay untouched.

Claude Code will create the feature branch, do the three commits the handoff describes, and run `bun run check` at the end. The handoff has a PR body template ready to paste.
