# TypeScript 7 Agent Skill

An Agent Skill that teaches **TypeScript 7 as an agent must write it**.

Pinned to:

- VS Code / Cursor extension `TypeScriptTeam.native-preview` **0.20260708.2** (win32-x64 pin; the language facts apply on every OS)
- Bundled compiler **7.0.2**
- Official TypeScript 7.0 and 6.0 announcements
- [microsoft/typescript-go CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md) for JavaScript / JSDoc deltas

TypeScript 7.0 (8 July 2026) is a native **Go** port of the **6.0 checker**. The type system is 6.0’s, with `stableTypeOrdering` on and no `ignoreDeprecations`. What changed for agents is the **defaults**, the **hard errors**, a handful of **language deltas** (Unicode `infer`, JSDoc rewritten to match `.ts`), a new **`tsc`**, and **no stable compiler API until 7.1**.

## What this is

- A router (`SKILL.md`) plus deep reference pages, one hop deep.
- A **language** skill first. Agents open one page for the construct they are writing.
- A **migration** skill second. 5.x/6.0 tsconfig that relied on old defaults or deprecated flags will not compile.
- A thin **compiler** layer so agents can run `tsc`, read diagnostics, and not invent flags.
- A **probe script** agents **run** (`scripts/probe.mjs`) against the project’s `tsc`.

## What this is not

- Not a beginner TypeScript handbook. Models already know 5.x; this skill corrects what that knowledge gets wrong on 7.0.
- Not a dump of Microsoft’s handbook or `lib/*.d.ts` sources (copyright). APIs are summarized.
- Not a React / Vue / Svelte / Angular / webpack / eslint-authoring skill. Tools that `import "typescript"` still need TypeScript 6 until 7.1; that fact is one page, not a framework course.

## Install as an Agent Skill

Copy or clone this directory into the host’s skills location:

| Host | Typical path |
| --- | --- |
| Cursor (project) | `.cursor/skills/typescript-7/` or `skills/typescript-7/` |
| Cursor (user) | `~/.cursor/skills/typescript-7/` |
| Claude Code / Agent Skills | `~/.claude/skills/typescript-7/` or the project `.agents/skills/` tree |

The directory must contain `SKILL.md`. Leave `disable-model-invocation` **unset** so the skill can auto-trigger from writing TypeScript, not only from the string “TypeScript 7”.

Do not install into `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

## How an agent should use it

1. Run `node <skill-root>/scripts/probe.mjs` with cwd = the TypeScript project. Do not read the script.
2. Open **one** reference linked from `SKILL.md`.
3. Write or migrate under 7.0 defaults.
4. Re-run `tsc`. If it is still red, open [references/diagnosing-failures.md](references/diagnosing-failures.md), not a second language page.

## Layout

```
typescript-7/
  SKILL.md                 # agent router (always loaded when the skill fires)
  README.md                # humans / GitHub
  LICENSE                  # MIT for original prose
  scripts/probe.mjs        # run against the project tsc
  references/              # one page per job; unread files cost nothing
```

## License

Original skill prose and scripts: **MIT**. Microsoft TypeScript `lib/*.d.ts` files, blogs, and the VSIX remain under their own licenses (Apache-2.0 for the compiler libs). This skill does **not** vendor those sources.

## Pin and sources

See [references/sources.md](references/sources.md).
