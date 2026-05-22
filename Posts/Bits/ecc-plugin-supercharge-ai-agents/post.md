# ECC: The Plugin That Makes Your AI Coding Agent Actually Good

If you use Claude Code, Cursor, Codex, or any AI coding harness day-to-day, you've probably hit the ceiling: the agent is smart but forgets context, makes the same mistakes twice, and needs hand-holding on your project's conventions. That's what ECC was built to fix.

**ECC** (originally "Everything Claude Code") is an open-source agent harness performance system — 188K+ GitHub stars, Anthropic Hackathon winner, actively maintained.

## What It Does

ECC installs as a plugin and gives your AI agent a complete operating system:

**Skills** — 232 reusable workflow units covering TypeScript, Python, Go, Java, Kotlin, C++, Rust, and more. TDD, security review, documentation lookup, cost-aware LLM pipelines, even PM workflows.

**Agents** — 60 specialized subagents to delegate to: Planner, Architect, TDD Guide, Security Reviewer, E2E Runner, Refactor Cleaner, Chief of Staff.

**Memory + Hooks** — Lifecycle hooks that automatically save and restore context across sessions. Your agent picks up where it left off.

**Security (AgentShield)** — `/security-scan` runs 1,282 tests and 102 rules. Attack vectors, sandboxing, sanitization — all checked.

**Cross-Harness** — One config, works across Claude Code, Cursor, Codex, OpenCode, Gemini, Zed, and GitHub Copilot.

## How It Works

ECC hooks into your agent's session lifecycle. On start, it loads your project memory, active rules, and relevant skills into context. During a session, you invoke skills via slash commands — `/ecc:plan`, `/ecc:security-scan`, `/ecc:tdd`, and so on. On session end, hooks summarize what happened and persist learnings. Over time, the agent builds up a working model of your codebase and conventions — it stops being stateless.

## Where to Use It

It's most valuable when you're doing serious, repeated work in a codebase: kicking off a new feature, running a security audit before a release, doing a refactoring sprint, or coordinating across multiple services. If you only talk to your AI agent once in a while, ECC is overkill. If it's part of your daily workflow, it pays back fast.

## Get It

Two commands in Claude Code:

```bash
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc
```

Then copy the rules you need:

```bash
mkdir -p ~/.claude/rules/ecc
cp -R rules/common ~/.claude/rules/ecc/
cp -R rules/typescript ~/.claude/rules/ecc/
```

That's it — 60 agents and 232 skills, ready to go.

[GitHub →](https://github.com/affaan-m/ECC)
