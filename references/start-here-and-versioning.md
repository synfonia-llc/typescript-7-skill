# Start here: what TypeScript 7 is

## Scope

What “TypeScript 7” names, which binary you are running, and how 5.x / 6.0 / 7.0 relate. Not install commands ([install-and-dual-stack.md](install-and-dual-stack.md)). Not language constructs.

## Contents

- [Task routes](#task-routes)
- [The product](#the-product)
- [Which binary](#which-binary)
- [What 7.0 did not change](#what-70-did-not-change)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN the user says “TypeScript 7”, `tsgo`, `native-preview`, Corsa, or Strada — 7.0 is native Go `tsc`; `tsgo` is the **preview** name; Strada is the JS 6.0 compiler + API.
- USE WHEN `tsc --version` and `package.json` disagree — believe the binary the probe ran; fix the install.
- USE WHEN comparing 6.0 vs 7.0 `.d.ts` union order — `stableTypeOrdering` is on and cannot be turned off. [unions-intersections-and-never.md](unions-intersections-and-never.md).

## The product

TypeScript 7.0 GA (2026-07-08) is a **faithful Go port** of the 6.0 type-checker and emit, plus a native **LSP** (not tsserver). Microsoft’s published full-build speedups vs 6.0 are typically **8–12×** (VS Code tree ~11.9× at default `--checkers 4`). Memory is usually slightly down.

Names:

| Name | Means |
| --- | --- |
| **Corsa** | Internal name for the Go port |
| **Strada** | The JS implementation (6.0 line) and its `import "typescript"` API |
| **tsgo** | Preview executable; GA ships `tsc` |
| **native-preview** | Preview npm package / extension publisher id. This skill's exact GA pin is `typescript@7.0.2` |
| **Later native API** | Announced as new and different; not present in 7.0 and outside this skill's pin |

This skill’s pin: bundled **7.0.2**, extension `TypeScriptTeam.native-preview` **0.20260708.2**. [sources.md](sources.md).

Compatibility sentence from the 7.0 blog: code that compiles on 6.0 with `stableTypeOrdering` and **without** `ignoreDeprecations` should compile on 7.0, aside from documented language deltas (Unicode `infer`, JSDoc).

## Which binary

```text
<compilerPath-from-probe> --version        # must print Version 7.x.x
<stradaCompilerPath-from-probe> --version  # 6.x, only if dual-stacked
```

`import * as ts from "typescript"` loads **Strada**, even in a repo whose `tsc` is 7, if `package.json` aliased `typescript` to `@typescript/typescript6`. That is intentional for eslint. Do not treat that import as the native compiler. [no-compiler-api.md](no-compiler-api.md).

Editor LS is a **separate** process from CLI `tsc`. [editor-lsp-and-vsix.md](editor-lsp-and-vsix.md).

## What 7.0 did not change

It is not a new type system. Generics, narrowing, and mapped types are 6.0’s. What is new for agents: defaults, hard-removed flags, JSDoc rewrite, Unicode `infer`, CLI parallelism, LSP, **no API**.

## The 5.x lie

“Major 7 means new language features like 4.0 did.” 7.0 is a **port**. The language surprises are 6.0’s defaults plus a few Corsa deltas.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (port, benchmarks, compatibility sentence). See [sources.md](sources.md).
