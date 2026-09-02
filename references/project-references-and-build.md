# Project references and build

## Scope

How 7.0 type-checks a **graph** of tsconfigs (`references`, `--build`). Language of exports: [declaration-files.md](declaration-files.md). Parallelism knobs: [cli-watch-and-parallelism.md](cli-watch-and-parallelism.md).

## Contents

- [Task routes](#task-routes)
- [Solution vs project](#solution-vs-project)
- [What each project must emit](#what-each-project-must-emit)
- [7.0 parallelism](#70-parallelism)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN a monorepo has multiple tsconfigs that import each other — wire `references` and build with `tsc -b`, not a single glob of all packages.
- USE WHEN package A cannot see package B’s types — B must emit `.d.ts` (`composite` / `declaration`) and A must `reference` B or depend on B’s published types.
- USE WHEN `--build` is slow or huge — `--builders` + `--checkers` multiply; `isolatedDeclarations` unblocks declaration emit.

## Solution vs project

A **project** is one `tsconfig.json` with `include`/`files` and `compilerOptions`. A **solution** is a tsconfig that only lists `"references": [{ "path": "./packages/foo" }]` and often `"files": []`.

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/cli" }
  ]
}
```

Referenced projects must enable **composite** (implies `declaration`). `tsc -b` at the solution root builds in DAG order.

Path mappings (`paths`) do **not** replace references. `paths` are a specifier rewrite; references are the build graph. 7.0 still needs both if you use path aliases — and `baseUrl` is **gone**, so `paths` are relative to that tsconfig.

## What each project must emit

Downstream projects consume **declaration files**, not each other’s `.ts`, unless you use `disableSourceOfProjectReferenceRedirect` (usually leave the redirect **on** in the editor so you navigate to source).

`isolatedDeclarations` makes `.d.ts` emit a **syntactic** per-file job, which is what lets `--build` overlap work (7.0 blog). If you turn it on, annotate exports ([declaration-files.md](declaration-files.md)).

`rootDir` defaulting to the tsconfig directory will rewrite emit layout **per package**. Set `rootDir`/`outDir` in each package explicitly.

`types: []` is per project. A package that uses Node must list `"types": ["node"]` even if the solution root did.

## 7.0 parallelism

`tsc -b --builders N --checkers M`:

- `--builders` — parallel **projects**
- `--checkers` — parallel **files** inside a project (default 4)

Pin both in CI. `--singleThreaded` for tiny runners.

Results should not change with `--builders`. `--checkers` can theoretically surface rare order bugs; pin it if CI is flaky.

## The 5.x lie

“One root tsconfig with `"include": ["packages/*/src"]` is a monorepo.” That is one giant program. 7.0 is fast enough that it may *work*, and still be the wrong cache/incremental story. Use references when packages have boundaries.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (`--builders`, `isolatedDeclarations`). See [sources.md](sources.md).
