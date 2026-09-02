---
name: typescript-7
description: >-
  TypeScript 7 (native Go compiler, bundled 7.0.2) language and thin toolchain
  for agents: write .ts/.tsx/.d.ts that typechecks under 7.0 defaults; migrate
  5.x/6.0 tsconfig (hard errors, no ignoreDeprecations); run tsc
  (--checkers/--builders/--singleThreaded); dual-stack tsc vs tsc6 when tools
  import the Strada API; JSDoc rewritten to match .ts; Unicode template-literal
  infer; lib.es2025/esnext vs runtime. Use when writing or editing TypeScript,
  running tsc, editing tsconfig, fixing tsc diagnostics, migrating TypeScript
  5 or 6 to 7, checking JS with JSDoc, or when the user mentions TypeScript 7,
  tsgo, native-preview, Strada, or typescript@7.
---

# TypeScript 7

Use TypeScript 7 from evidence, not 5.x memory. This skill is pinned to:

- VS Code / Cursor extension **TypeScriptTeam.native-preview 0.20260708.2**
- `bundledTypeScriptVersion` **7.0.2**
- Official 7.0 GA notes (native `tsc`, LSP, no stable API) and 6.0 notes (defaults 7.0 hard-errors)
- [microsoft/typescript-go CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md) for JS/JSDoc deltas

7.0 is a **Go port of the 6.0 checker**, not a new type system. Language pages document the **6/7 type system** plus **7.0-only** language, toolchain, and bundled libs. Open **one** reference for the current job.

This skill teaches the **language as an agent must produce it**. The compiler is only the judge of that language. It does not teach React, Vue, Svelte, Angular, webpack, or eslint rule authoring.

Provenance: [sources.md](references/sources.md).

## Standing guardrails

- USE WHEN beginning any TypeScript task: **run** `node <this-skill-root>/scripts/probe.mjs` with cwd set to the TypeScript project. Do not read the script source. If the project claims 7 and the binary is 5.x/6.x, stop and fix the install before editing tsconfig.
- USE WHEN `import * as ts from "typescript"` (or `from "typescript"`) appears: that is the **Strada** (JS) API. 7.0 does not ship a stable replacement. Dual-install 6.0 for tools that still import it, or wait for 7.1. See [no-compiler-api.md](references/no-compiler-api.md).
- USE WHEN writing tsconfig: 7.0 **cannot** `ignoreDeprecations: "6.0"`. Removed flags are hard errors. See [tsconfig-defaults-and-breaks.md](references/tsconfig-defaults-and-breaks.md).
- USE WHEN `dist/` contains `src/` (`dist/src/index.js`): `rootDir` now defaults to the tsconfig directory. Set `"rootDir": "./src"`.
- USE WHEN `process`, `describe`, or Node builtins are “not found”: `types` now defaults to `[]`. List `"types": ["node"]` (and jest/mocha/bun as needed).
- USE WHEN a name exists in lib but crashes at runtime: lib is a **type** environment. Node 22 does not implement Temporal, Iterator helpers, `using`, Float16, etc. unless the runtime or a polyfill does. See [lib-inventory.md](references/lib-inventory.md).
- USE WHEN inventing a compiler flag: run `npx tsc --help`. Only `--checkers`, `--builders`, and `--singleThreaded` are documented here as 7.0-new.
- USE WHEN fixing a red `tsc` by toggling the TypeScript 7 language server: that is the wrong lever. Fix the source or tsconfig. Editor settings live in [editor-lsp-and-vsix.md](references/editor-lsp-and-vsix.md).

## Contents

- [Standing guardrails](#standing-guardrails)
- [Jobs](#jobs)
- [Language](#language)
- [Compiler (thin)](#compiler-thin)
- [Lib](#lib)
- [Live callout protocol](#live-callout-protocol)

## Jobs

- USE WHEN writing or editing `.ts` / `.tsx` / `.d.ts` that must typecheck on 7.0: [writing-typescript.md](references/writing-typescript.md).
- USE WHEN moving a 5.x or 6.0 project onto 7.0, or when `ignoreDeprecations` appears: [migrating-to-7.md](references/migrating-to-7.md).
- USE WHEN `tsc` is red, emit paths look wrong, eslint cannot load `typescript`, or the editor disagrees with CLI: [diagnosing-failures.md](references/diagnosing-failures.md).

## Language

- USE WHEN choosing primitives, arrays, tuples, `any` / `unknown` / `never`, or type vs value: [types-everyday.md](references/types-everyday.md).
- USE WHEN narrowing with `typeof`, `in`, equality, truthiness, or user-defined type predicates: [narrowing-and-control-flow.md](references/narrowing-and-control-flow.md).
- USE WHEN writing functions, overloads, rest parameters, or `this`; or when method-syntax inference looks order-dependent: [functions-and-call-signatures.md](references/functions-and-call-signatures.md).
- USE WHEN writing object types, interfaces, excess-property checks, index signatures, or `exactOptionalPropertyTypes`: [objects-and-interfaces.md](references/objects-and-interfaces.md).
- USE WHEN writing unions, intersections, discriminants, or `never` exhaustiveness: [unions-intersections-and-never.md](references/unions-intersections-and-never.md).
- USE WHEN writing generics, constraints, inference, or variance: [generics-inference-and-variance.md](references/generics-inference-and-variance.md).
- USE WHEN writing `keyof`, `typeof`, indexed access, mapped types, or conditional types: [type-manipulation.md](references/type-manipulation.md).
- USE WHEN splitting template-literal types, branding strings, or seeing emoji/surrogate `infer` change: [template-literals-and-infer.md](references/template-literals-and-infer.md).
- USE WHEN writing classes, `this`, parameter properties, or definite assignment: [classes-and-this.md](references/classes-and-this.md).
- USE WHEN writing TC39 decorators or `Symbol.metadata`: [decorators.md](references/decorators.md).
- USE WHEN writing `import` / `export`, `type` vs value, `with` import attributes, `#/` subpaths, `nodenext` / `bundler`, or `verbatimModuleSyntax`: [modules-imports-and-exports.md](references/modules-imports-and-exports.md).
- USE WHEN writing TSX / JSX *syntax* or choosing `compilerOptions.jsx` (not React component patterns): [jsx-syntax.md](references/jsx-syntax.md).
- USE WHEN writing `using` / `await using` or `DisposableStack`: [using-and-disposables.md](references/using-and-disposables.md).
- USE WHEN type-checking `.js` / JSDoc / `checkJs`, `@typedef`, expandos, or constructor functions: [javascript-and-jsdoc.md](references/javascript-and-jsdoc.md).
- USE WHEN writing `.d.ts` or when `isolatedDeclarations` rejects inferred exports: [declaration-files.md](references/declaration-files.md).
- USE WHEN reaching for `Partial`, `Pick`, `Omit`, `Record`, `Awaited`, or other lib utility types: [utility-types.md](references/utility-types.md).

## Compiler (thin)

- USE WHEN deciding what “TypeScript 7” is, how it relates to 6.0/5.x, or which binary you are running: [start-here-and-versioning.md](references/start-here-and-versioning.md).
- USE WHEN installing `typescript@7`, aliasing `@typescript/typescript6`, CI `tsc` vs `tsc6`, or nightlies: [install-and-dual-stack.md](references/install-and-dual-stack.md).
- USE WHEN a 5.x/6.0 tsconfig fails on 7.0, or when setting `strict` / `module` / `target` / `types` / `rootDir`: [tsconfig-defaults-and-breaks.md](references/tsconfig-defaults-and-breaks.md).
- USE WHEN choosing a `compilerOptions` flag that changes what source is legal (`nodenext`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `isolatedDeclarations`, `strict` family): [compiler-options.md](references/compiler-options.md).
- USE WHEN running `tsc`, `--build`, `--watch`, `--checkers`, `--builders`, or `--singleThreaded`: [cli-watch-and-parallelism.md](references/cli-watch-and-parallelism.md).
- USE WHEN enabling/disabling the TypeScript 7 language server, `js/ts.*` settings, or workspace `tsdk`: [editor-lsp-and-vsix.md](references/editor-lsp-and-vsix.md).
- USE WHEN using project references, solution-style tsconfig, or declaration emit across packages: [project-references-and-build.md](references/project-references-and-build.md).
- USE WHEN a tool, transformer, eslint parser, or `ts-morph` script imports `"typescript"`: [no-compiler-api.md](references/no-compiler-api.md).

## Lib

- USE WHEN choosing `lib` vs `target`, listing bundled `.d.ts` names, or deciding DOM vs Node: [lib-inventory.md](references/lib-inventory.md).
- USE WHEN using Iterator helpers, `Promise.try`, `Float16Array`, Set algebra, `RegExp.escape`, or `Intl.DurationFormat`: [lib-es2025.md](references/lib-es2025.md).
- USE WHEN using `using` / `DisposableStack`, `Temporal`, `Map.getOrInsert`, `Atomics.pause`, `Array.fromAsync`, `Uint8Array.toBase64`, or `Error.isError`: [lib-esnext.md](references/lib-esnext.md).
- USE WHEN citing this skill’s pin, the VSIX, or Microsoft blogs: [sources.md](references/sources.md).

## Live callout protocol

When a local page is silent or the installed `tsc` differs from 7.0.2:

1. Run `scripts/probe.mjs` (cwd = the project). Record `tsc --version` and the `typescript` field in `package.json`.
2. Open the owning reference below (do not load every page).
3. Run `npx tsc --help` or `npx tsc --showConfig` rather than inventing flags.
4. For editor behavior, read the installed extension’s `package.json` / `package.nls.json`.
5. For JS/JSDoc deltas, read [microsoft/typescript-go CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md).
6. For language-server gaps, check [microsoft/typescript-go issues](https://github.com/microsoft/typescript-go/issues).
7. State the version difference. Do not silently fall back to 5.x advice, invent a 7.0 compiler API, or claim a lib type exists at runtime.
