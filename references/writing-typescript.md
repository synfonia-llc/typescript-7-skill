# Writing TypeScript that typechecks on 7.0

## Scope

The standing loop for emitting `.ts` / `.tsx` / `.d.ts` under TypeScript 7.0.2. Not a catalog of types (open the language page for the construct). Not a migration checklist (see [migrating-to-7.md](migrating-to-7.md)).

## Contents

- [Task routes](#task-routes)
- [What “typechecks on 7.0” means](#what-typechecks-on-70-means)
- [The write loop](#the-write-loop)
- [Defaults that change what you may write](#defaults-that-change-what-you-may-write)
- [The 5.x lie](#the-5x-lie)
- [Sibling pages](#sibling-pages)
- [Foot](#foot)

## Task routes

- USE WHEN starting any new TypeScript file or edit in a 7.x project — run the probe, then this loop, then one language page.
- USE WHEN the model wants to “just write the function” without checking `tsc` — stop; 7.0 defaults make 5.x-shaped source illegal.
- USE WHEN unsure whether a problem is language or config — run `tsc`; if the diagnostic names a compiler option, go to [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md), else open the language page for the construct.
- USE WHEN `tsc` is already red — skip this page and open [diagnosing-failures.md](diagnosing-failures.md).

## What “typechecks on 7.0” means

A file typechecks on 7.0 when the **project’s** `tsc` (native Go, reports `Version 7.x.x`) accepts it under the **effective** tsconfig (`tsc --showConfig`), not under 5.x memory.

7.0 is a Go port of the **6.0 checker**. The type system is 6.0’s. The surprises are:

- New **defaults** (`strict`, `module`, `target`, `types: []`, `rootDir`, …).
- **Hard errors** for flags and syntax 6.0 only deprecated.
- **JSDoc / `.js`** analysis aligned with `.ts` ([javascript-and-jsdoc.md](javascript-and-jsdoc.md)).
- Template-literal `infer` splits by **Unicode code point** ([template-literals-and-infer.md](template-literals-and-infer.md)).
- **No** `import "typescript"` compiler API ([no-compiler-api.md](no-compiler-api.md)).

Lib names are types, not a runtime guarantee ([lib-inventory.md](lib-inventory.md)).

## The write loop

1. **Probe.** From the TypeScript project directory, run `node <skill-root>/scripts/probe.mjs --json`. Do not read the script. Continue on `ready`; on any compiler/sidecar mismatch or missing-install status, fix the declared install ([install-and-dual-stack.md](install-and-dual-stack.md)) before writing code.
2. **Pick one construct.** Open the single language page that names the thing you are about to write (function, module, class, JSDoc, …). Do not load the whole `references/` tree.
3. **Emit 7.0-legal source.** Prefer explicit types on exported surfaces. Under `verbatimModuleSyntax`, mark type-only imports with `import type` / `import { type … }`. Under `nodenext`, write ESM specifiers the way Node resolves them (usually the emitted `.js` extension). See [modules-imports-and-exports.md](modules-imports-and-exports.md).
4. **Run `tsc`.** Same binary the probe used. Fix from the diagnostic, not from a guessed tsconfig knob.
5. **If still red.** Open [diagnosing-failures.md](diagnosing-failures.md). Do not enable or disable the TypeScript 7 language server as a typecheck fix.

## Defaults that change what you may write

Unless `tsc --showConfig` says otherwise, assume:

- `strict` is **true** — `null` is not assignable to `T`; `this` is not `any`; functions used with `this` need a `this` parameter.
- `module` is **esnext** — `require` / `module.exports` in a `.ts` file is the wrong module shape unless you set `module` explicitly.
- `target` is **es2025** (floating current-year ES) — `tsc` will not downlevel to ES5. `target: es5` is a hard error.
- `types` is **[]** — `@types/node` is **not** auto-included. `process` is an error until `"types": ["node"]`.
- `rootDir` is the **tsconfig directory** — files under `src/` emit to `dist/src/` unless `"rootDir": "./src"`.
- `noUncheckedSideEffectImports` is **true** — `import "./side-effect"` must resolve.
- `esModuleInterop` / `allowSyntheticDefaultImports` cannot be **false**; `alwaysStrict` cannot be **false**.
- Import assertions using `assert { type: "json" }` are illegal — write import attributes with `with { type: "json" }`.
- `module` as a **namespace** keyword is illegal.

Full list: [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md).

## The 5.x lie

“I know TypeScript, so I can write `export default function (x) { return x }` and `import fs from "fs"` and ship it.” On 7.0 with default `strict` and modern `module` settings, that source is often a diagnostic. Treat 5.x habits as **suspect until `tsc` agrees**.

## Sibling pages

Language index lives in `SKILL.md`. Config: [compiler-options.md](compiler-options.md). CLI: [cli-watch-and-parallelism.md](cli-watch-and-parallelism.md).

## Foot

Pin: TypeScript **7.0.2** (VSIX `TypeScriptTeam.native-preview` `0.20260708.2`). 7.0 blog (defaults, no API). See [sources.md](sources.md).
