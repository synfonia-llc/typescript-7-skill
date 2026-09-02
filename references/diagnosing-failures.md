# Diagnosing TypeScript 7 failures

## Scope

Symptom → decision → page. Use when `tsc` is red, emit looks wrong, a tool cannot load `typescript`, or the editor disagrees with the CLI. Do not start here to learn a construct; start at [writing-typescript.md](writing-typescript.md).

## Contents

- [Task routes](#task-routes)
- [Read the diagnostic, then this index](#read-the-diagnostic-then-this-index)
- [Symptom index](#symptom-index)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN `tsc` printed an error and you cannot name the construct that caused it — pick the matching symptom below; do not open a random language page.
- USE WHEN the editor squiggles disagree with CLI `tsc` — treat CLI as typecheck truth; editor is [editor-lsp-and-vsix.md](editor-lsp-and-vsix.md).
- USE WHEN a tool crashes with `Cannot find module 'typescript'` or a missing `ts.SyntaxKind` — [no-compiler-api.md](no-compiler-api.md), then dual-stack in [install-and-dual-stack.md](install-and-dual-stack.md).

## Read the diagnostic, then this index

1. Re-run the **project** `tsc` (probe first if you have not).
2. Copy the **error code and text**. Do not “fix” from a blog-memory of TS 4.
3. Match a symptom below. Open **one** target page.
4. If nothing matches: invoke the probe's `compilerPath` with `--showConfig`, then [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md).

## Symptom index

- USE WHEN `Cannot find name 'process'` / `describe` / `expect` / `Bun` — `types` defaults to `[]`. Set `"types": ["node"]` (and `jest` / `mocha` / `bun`). Not a missing `@types` install until `package.json` actually lacks it. [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md).
- USE WHEN emit is `dist/src/index.js` instead of `dist/index.js` — `rootDir` defaulted to the tsconfig directory. Set `"rootDir": "./src"`. [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md).
- USE WHEN tsconfig errors mention `es5`, `baseUrl`, `outFile`, `moduleResolution: node`, `amd`, `ignoreDeprecations`, or `esModuleInterop: false` — 7.0 hard-removed 6.0 deprecations. [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md), [migrating-to-7.md](migrating-to-7.md).
- USE WHEN `import … assert` or dynamic `import(url, { assert: … })` fails — write `with`. [modules-imports-and-exports.md](modules-imports-and-exports.md).
- USE WHEN `import type` / value-import mixing errors, or `verbatimModuleSyntax` / `isolatedModules` complaints — [modules-imports-and-exports.md](modules-imports-and-exports.md), [compiler-options.md](compiler-options.md).
- USE WHEN Node cannot resolve a specifier that `tsc` emitted, or `nodenext` wants a `.js` extension — [modules-imports-and-exports.md](modules-imports-and-exports.md).
- USE WHEN a type-level `Length<"😀">` or `HeadTail<"😀abc">` utility changed result — Unicode code-point `infer`. [template-literals-and-infer.md](template-literals-and-infer.md).
- USE WHEN JSDoc `?`, `@enum`, `@class`, Closure `function(string): void`, postfix `!`, or `/** @type {SomeValue} */` fails — 7.0 JS matches `.ts`. [javascript-and-jsdoc.md](javascript-and-jsdoc.md).
- USE WHEN `function C() { this.x = 1; }` / `C.prototype.m = …` no longer typechecks — constructor functions are gone. Write `class`. [javascript-and-jsdoc.md](javascript-and-jsdoc.md).
- USE WHEN `import * as ts from "typescript"` / `ts.createProgram` / `ts-morph` / typescript-eslint parser dies after a 7 install — there is no 7.0 compiler API. [no-compiler-api.md](no-compiler-api.md).
- USE WHEN Temporal / `Iterator.prototype.map` / `using` / `Float16Array` typechecks but throws at runtime — lib ≠ runtime. [lib-inventory.md](lib-inventory.md), then [lib-es2025.md](lib-es2025.md) or [lib-esnext.md](lib-esnext.md).
- USE WHEN `optionally?: string` is not assignable to `{ optionally: string | undefined }` — `exactOptionalPropertyTypes`. [objects-and-interfaces.md](objects-and-interfaces.md).
- USE WHEN exported functions need explicit return types under `isolatedDeclarations` — [declaration-files.md](declaration-files.md).
- USE WHEN method-syntax callbacks infer `unknown` depending on property order — 6.0 this-less inference; still write explicit parameter types if inference fails. [functions-and-call-signatures.md](functions-and-call-signatures.md).
- USE WHEN `tsc` is 7 but editor errors look like 5.x, or plugins vanished — TS 7 LS does not load tsserver plugins; untrusted workspaces unsupported. [editor-lsp-and-vsix.md](editor-lsp-and-vsix.md).
- USE WHEN CI is slow or RAM spikes with `--build` — `--checkers` default 4; `--builders` multiplies it. [cli-watch-and-parallelism.md](cli-watch-and-parallelism.md).
- USE WHEN two checkers disagree across machines — rare order dependence; pin `--checkers` and know `stableTypeOrdering` is on and **cannot** be turned off. [cli-watch-and-parallelism.md](cli-watch-and-parallelism.md).
- USE WHEN `tsc` refuses file paths because a tsconfig is in cwd — pass `--ignoreConfig` or use the tsconfig. [cli-watch-and-parallelism.md](cli-watch-and-parallelism.md).
- USE WHEN declaration emit unions flip order vs 6.0 — expected under `stableTypeOrdering`; not a logic change. [start-here-and-versioning.md](start-here-and-versioning.md).

## The 5.x lie

“This error means I should `skipLibCheck` / `strict: false` / disable the language server.” Those knobs hide the diagnosis. Read the code and the effective tsconfig first.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (defaults, JSDoc, Unicode infer). CHANGES.md (JS). See [sources.md](sources.md).
