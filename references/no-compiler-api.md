# No compiler API in 7.0

## Scope

TypeScript 7.0 **does not** ship a stable programmatic API. `import "typescript"` is Strada (6.0 JS). Do not write transformers, checkers, or eslint parsers against native 7. One short note on ecosystem tools — not a Vue/webpack skill.

## Contents

- [Task routes](#task-routes)
- [What 7.0 ships](#what-70-ships)
- [What import "typescript" is](#what-import-typescript-is)
- [What to do](#what-to-do)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN you see `import ts from "typescript"`, `ts.createProgram`, `ts.transpileModule`, `ts-morph`, `typescript-eslint` parser, or a webpack `ts-loader` that instantiates the compiler — that is the **6.0 API**. 7.0 native `tsc` cannot replace it yet.
- USE WHEN tempted to “just call the Go compiler from JS” via an unofficial binding — stop. Wait for 7.1 or dual-stack.
- USE WHEN a framework template checker (Vue Volar, Svelte, Astro, MDX, Angular) needs the language service as a library — keep **editor** on 6.0 (disable TS 7 LS); CLI `tsc` 7 may still check `.ts`. [editor-lsp-and-vsix.md](editor-lsp-and-vsix.md).

## What 7.0 ships

- Native **`tsc`** (parse, check, emit, `--build`, `--watch`)
- Native **LSP** for editors
- **No stable** equivalent of Strada’s `import "typescript"` (`createProgram`, `transform`, …)

The npm `typescript@7.0.2` `package.json` exports **`typescript/unstable/*`** (`./unstable/sync`, `./unstable/async`, `./unstable/ast`, …) and the root `"."` export is `lib/version.cjs` (version bits), **not** the old compiler. Those `unstable/*` paths are **not** the 7.1 stable API and **not** a drop-in for `ts-morph` / typescript-eslint. Do not build product code on them. Do not invent wrappers and call them “the 7.0 API”.

7.1 is the announced home of a **new and different** stable API. Do not guess its shape.

## What import "typescript" is

On 7.0.2, the package root export `"."` is `lib/version.cjs` — version metadata — **not** `createProgram`. The Strada API lives on **TypeScript 6** (`typescript@6` or `npm:@typescript/typescript6`). Dual-stack aliases exist so the name `typescript` keeps resolving to 6 while `tsc` is 7. [install-and-dual-stack.md](install-and-dual-stack.md).

If `package.json` has **only** `typescript@7`, `import "typescript"` does not give you the old compiler. Treat that as “this tool cannot run on 7.0” and dual-stack, or wait for 7.1.

## What to do

1. Typecheck / CI: native `tsc` 7.
2. Tools that embed the compiler: TypeScript **6** (`tsc6` + `import "typescript"`).
3. Do not write new `ts.TransformerFactory` code and claim it runs on 7.
4. Do not tell the user 7.0 “has the compiler API in Go” as something they can `require`.

## The 5.x lie

“Every `typescript` major is `import ts from "typescript"` plus `tsc`.” 7.0 split those. Until 7.1, two stacks.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (“does not ship with an API”, dual-stack aliases, framework LS plugins). See [sources.md](sources.md).
