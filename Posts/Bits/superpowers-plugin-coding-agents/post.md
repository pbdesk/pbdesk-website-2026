# Superpowers: The Plugin That Makes Your Coding Agent Actually Think

Your AI coding agent is fast. That's also its problem. It jumps straight into writing code before it fully understands what you actually want. Then you spend the next hour debugging the wrong thing.

[Superpowers](https://github.com/obra/superpowers) fixes that.

It's an open-source plugin that installs a structured software development methodology into your coding agent. Think of it as adding discipline to your AI: a layer that forces it to slow down, understand the problem, plan properly, and verify its work before declaring done.

192k GitHub stars. This one's real.

## How it works

The moment you describe a task, Superpowers intercepts. Instead of generating code, your agent starts asking clarifying questions — Socratic style — until it can write a clean design document. You review it. You approve it. Then, and only then, does it build an implementation plan.

Each plan item is small (2-5 minutes of work), has exact file paths, and includes verification steps. From there, subagents execute individual tasks, each with a two-stage code review built in. The whole thing follows strict TDD: write a failing test, watch it fail, write the minimum code to pass, commit.

It won't say "done" until it's actually done.

## Skills inside the box

Superpowers ships as a set of composable skills your agent picks up automatically:

- **brainstorming** — design refinement before any code touches disk
- **writing-plans** — detailed, bite-sized implementation plans
- **test-driven-development** — RED/GREEN/REFACTOR, enforced
- **systematic-debugging** — 4-phase root cause process (no more guessing)
- **subagent-driven-development** — parallel execution with spec + quality review
- **using-git-worktrees** — each feature on its own isolated branch
- **requesting-code-review / receiving-code-review** — structured review workflow
- **finishing-a-development-branch** — clean merge/PR/discard decision flow

You don't trigger these manually. The agent knows when to use them.

## How to install it

**Claude Code**
```bash
/plugin install superpowers@claude-plugins-official
```

**Codex CLI**
```
/plugins → search "superpowers" → Install Plugin
```

**Cursor**
```
/add-plugin superpowers
```
Or search "superpowers" in Cursor's plugin marketplace.

---

Once installed, your agent already has Superpowers. No extra prompting needed. It just works differently — and better.
