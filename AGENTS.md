# AGENTS.md

This repository **is** the TypeScript 7 Agent Skill. It is not an application to migrate onto TypeScript 7.

Canonical skill entry: [SKILL.md](SKILL.md) (folder name when installed must be `typescript-7`). Human landing page: [README.md](README.md). Knowledge pin: **TypeScript 7.0.2**.

## What to do here

- Editing the skill: change [SKILL.md](SKILL.md), `references/`, or `scripts/`, then validate.
- Using the skill in some other project: install the **whole** checkout (not `SKILL.md` alone) into that host’s skills path. See [README.md](README.md).
- Ordinary TypeScript 5/6 application work does **not** belong in this repo and must not activate a 7.0 migration.

## Commands

```text
node --test scripts/probe.test.mjs scripts/validate-skill.test.mjs
node scripts/validate-skill.mjs
```

The probe (`scripts/probe.mjs`) is for a **consumer** TypeScript project directory. Do not run it against this skill repo expecting `ready`.

## Rules

- Treat the verified project-local `tsc` as compile authority in consumer repos. Invoke the probe’s `compilerPath` directly. Do not put a package-name runner back between the agent and that executable.
- TypeScript 7.0 has no stable `import "typescript"` API (`createProgram`, `transpileModule`). Dual-stack Strada 6.0.2 for tools that still import the compiler.
- Do not vendor Microsoft `lib/*.d.ts`, handbook chapters, or VSIX blobs.
- Keep knowledge-pin versions exact: `typescript@7.0.2` and `@typescript/typescript6@6.0.2`. No `^` / `~` on those pins.
- Open one reference from `SKILL.md` per job. Do not load the whole `references/` tree.

## Layout agents should not invent

- Do **not** nest a second copy of this skill at `.agents/skills/typescript-7/` inside this repo. The root **is** the skill; a nested copy named `typescript-7` duplicates the skill id and, if junctioned to `.`, recurses.
- Consuming repos install this checkout to **their** `.agents/skills/typescript-7/`, `~/.cursor/skills/typescript-7/`, `~/.claude/skills/typescript-7/`, or `~/.codex/skills/typescript-7/`.
