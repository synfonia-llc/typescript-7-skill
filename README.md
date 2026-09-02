# TypeScript 7 Agent Skill

An Agent Skill that teaches **TypeScript 7 as an agent must write it**.

Pinned to:

- VS Code / Cursor extension `TypeScriptTeam.native-preview` **0.20260708.2** (win32-x64 pin; the language facts apply on every OS)
- Bundled compiler **7.0.2**
- Official TypeScript 7.0 and 6.0 announcements
- [microsoft/typescript-go CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md) for JavaScript / JSDoc deltas

TypeScript 7.0 (8 July 2026) is a native **Go** port of the **6.0 checker**. The type system is 6.0’s, with `stableTypeOrdering` on and no `ignoreDeprecations`. What changed for agents is the **defaults**, the **hard errors**, a handful of **language deltas** (Unicode `infer`, JSDoc rewritten to match `.ts`), a new **`tsc`**, and **no stable compiler API in 7.0**.

## What this is

- A router (`SKILL.md`) plus deep reference pages, one hop deep.
- A **language** skill first. Agents open one page for the construct they are writing.
- A **migration** skill second. 5.x/6.0 tsconfig that relied on old defaults or deprecated flags will not compile.
- A thin **compiler** layer so agents can run `tsc`, read diagnostics, and not invent flags.
- A deterministic, local-only **probe script** agents run
  (`scripts/probe.mjs`) against the project’s declared `tsc`.

## What this is not

- Not a beginner TypeScript handbook. Models already know 5.x; this skill corrects what that knowledge gets wrong on 7.0.
- Not a trigger for ordinary TypeScript 5/6 edits. It activates only when the
  repository or user has put TypeScript 7 in scope.
- Not a dump of Microsoft’s handbook or `lib/*.d.ts` sources (copyright). APIs are summarized.
- Not a React / Vue / Svelte / Angular / webpack / eslint-authoring skill. Tools that `import "typescript"` need the TypeScript 6 sidecar while the project remains on the 7.0 pin; that fact is one page, not a framework course.

## Install as an Agent Skill

The installed directory must contain `SKILL.md`. Copy/clone it, or junction an
editable source checkout into the host's skill directory. On Windows, a Codex
user installation can remain linked to this repository:

```powershell
New-Item -ItemType Junction `
  -Path "$env:USERPROFILE\.codex\skills\typescript-7" `
  -Target "C:\dev\skills\typescript-7-skill"
```

Typical locations:

| Host | Typical path |
| --- | --- |
| Codex (user) | `~/.codex/skills/typescript-7/` |
| Cursor (project) | `.cursor/skills/typescript-7/` or `skills/typescript-7/` |
| Cursor (user) | `~/.cursor/skills/typescript-7/` |
| Claude Code / Agent Skills | `~/.claude/skills/typescript-7/` or the project `.agents/skills/` tree |

Leave `disable-model-invocation` unset so the skill can auto-trigger when the
project explicitly targets TypeScript 7 or the task names its native toolchain.
The frontmatter deliberately excludes ordinary TypeScript 5/6 work.

Do not install into `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

## How an agent should use it

1. Confirm that TypeScript 7 is in scope from the request or repository.
2. Run `node <skill-root>/scripts/probe.mjs --json` with cwd set to that
   project. The probe never searches a registry.
3. Continue only on `ready`. A `not-targeting-typescript-7` or `uninitialized`
   result is a boundary, not permission to migrate or initialize the project.
4. Open **one** reference linked from `SKILL.md`, do the work, and verify with
   the same local compiler. If it remains red, open
   [references/diagnosing-failures.md](references/diagnosing-failures.md).

## Layout

```
typescript-7/
  SKILL.md                 # agent router (always loaded when the skill fires)
  README.md                # humans / GitHub
  LICENSE                  # MIT for original prose
  scripts/probe.mjs        # local-only compiler/scope probe
  scripts/probe.test.mjs   # executable probe contract
  scripts/validate-skill.mjs       # deterministic structural/fact guardrails
  scripts/validate-skill.test.mjs  # executable validator contract
  evals/activation-cases.json      # retrieval + behavior forward cases
  references/              # one page per job; unread files cost nothing
```

## Validate changes

From this repository:

```text
node --test scripts/probe.test.mjs scripts/validate-skill.test.mjs
node scripts/validate-skill.mjs
```

The validator checks frontmatter boundaries, direct reference routing, relative
links, exact knowledge pins, safe compiler invocation guidance, terminology,
and a small set of high-risk runtime facts. It is intentionally mechanical; it
does not pretend to grade prose quality or replace compiler/release-note
verification.

## License

Original skill prose and scripts: **MIT**. Microsoft TypeScript `lib/*.d.ts` files, blogs, and the VSIX remain under their own licenses (Apache-2.0 for the compiler libs). This skill does **not** vendor those sources.

## Pin and sources

See [references/sources.md](references/sources.md).
