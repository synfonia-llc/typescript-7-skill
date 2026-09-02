# Sources and pin

## Scope

Authority for every page in this skill: which TypeScript 7 we mean, which documents we read, and what to do when the installed `tsc` disagrees. Not a language tutorial.

## Contents

- [Task routes](#task-routes)
- [Pin](#pin)
- [Primary sources](#primary-sources)
- [What we refuse to copy](#what-we-refuse-to-copy)
- [Live verification](#live-verification)
- [Foot](#foot)

## Task routes

- USE WHEN citing this skill’s version, the VSIX, or a Microsoft blog — quote the pin below, then the live `tsc --version`.
- USE WHEN the installed compiler is not 7.0.2 — follow the live callout protocol in `SKILL.md`; do not silently apply 5.x advice.
- USE WHEN a page is silent on a CLI flag — invoke the probe's exact `compilerPath` with `--help` or `--showConfig`. Do not invent flags.
- USE WHEN a page is silent on JSDoc or `.js` checking — read typescript-go `CHANGES.md`, then [javascript-and-jsdoc.md](javascript-and-jsdoc.md).

## Pin

| Field | Value |
| --- | --- |
| Product | TypeScript 7.0 GA |
| GA date | 2026-07-08 |
| Bundled compiler | **7.0.2** |
| Extension | `TypeScriptTeam.native-preview` **0.20260708.2** |
| Extension display name | TypeScript 7 |
| VS Code engine (extension) | `^1.126.0` |
| Checker | Native Go port of the **6.0** checker (`microsoft/typescript-go`) |
| Preview executable name | `tsgo` (retired for GA; the binary is `tsc`) |
| Old JS compiler + API | Strada / TypeScript 6 (`@typescript/typescript6`, `tsc6`) |
| Stable programmatic API | **None in 7.0.** Later releases require live verification. |

7.0 type-checks like 6.0 with `stableTypeOrdering` on and **without** `ignoreDeprecations`.

## Primary sources

Read at author time. Prefer the installed binary when they disagree.

1. [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) — native `tsc`, LSP, `--checkers` / `--builders` / `--singleThreaded`, no API, 6.0 defaults as hard errors, Unicode template `infer`, JSDoc rewrite, dual-stack aliases.
2. [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) — default changes, deprecations 7.0 removes, `types: []`, `rootDir`, `#/` subpath imports, this-less function inference, Temporal / `getOrInsert` / `RegExp.escape` types, `dom.iterable` folded into `dom`.
3. [typescript-go CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md) — intentional Strada vs Corsa (Go) differences, especially JavaScript, JSDoc, expandos, CommonJS, scanner UTF-8 offsets.
4. The pin VSIX: `typescriptteam.native-preview-0.20260708.2-win32-x64` — extension `package.json`, `package.nls.json`, `readme.md`, bundled `lib/*.d.ts` **names and summarized APIs only**.
5. [typescript-go `_extension/package.json`](https://github.com/microsoft/typescript-go/blob/main/_extension/package.json) — live command and setting names; the pin VSIX wins when they differ.
6. Official handbook — **gap-fill only**, rewritten in this skill’s voice. Never pasted.
7. [Node.js 22 release announcement](https://nodejs.org/en/blog/announcements/v22-release-announce) — V8 12.4 runtime support for `Array.fromAsync`, Set methods, and iterator helpers.

## What we refuse to copy

- Microsoft `lib/*.d.ts` file bodies (Apache-2.0; still not vendored here).
- Verbatim TypeScript Handbook chapters.
- Invented 7.0 compiler API shapes.
- CLI flags other than ordinary `tsc` plus the three 7.0-new ones, unless `tsc --help` on the installed binary shows them.

## Live verification

From the TypeScript project directory:

```text
node <skill-root>/scripts/probe.mjs --json
<compilerPath-from-probe> --version
<compilerPath-from-probe> --showConfig
<compilerPath-from-probe> --help
```

Editor: read the installed `TypeScriptTeam.native-preview` extension `package.json`.

## Foot

Pin: TypeScript **7.0.2** (VSIX `TypeScriptTeam.native-preview` `0.20260708.2`).
