# tsconfig defaults and hard breaks

## Scope

6.0 default changes that 7.0 **enforces**, and flags/syntax 7.0 **hard-errors**. Full option semantics: [compiler-options.md](compiler-options.md). Migration order: [migrating-to-7.md](migrating-to-7.md).

## Contents

- [Task routes](#task-routes)
- [New defaults](#new-defaults)
- [Hard errors (removed 6.0 deprecations)](#hard-errors-removed-60-deprecations)
- [Surprising pair: types and rootDir](#surprising-pair-types-and-rootdir)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN a 5.x tsconfig fails on 7.0 — apply this list; do not set `ignoreDeprecations: "6.0"` (not an escape hatch).
- USE WHEN `process` is not found — `"types": ["node"]`.
- USE WHEN emit is `dist/src/…` — `"rootDir": "./src"`.
- USE WHEN `tsc` rejects `baseUrl`, `es5`, `node10`, `outFile`, `assert`, or `module` as namespace — they are gone.

## New defaults

From the 7.0 blog (6.0 defaults, now the 7.0 baseline):

| Option | 7.0 default |
| --- | --- |
| `strict` | `true` |
| `module` | `esnext` |
| `target` | current stable ES immediately preceding `esnext` (**`es2025`** at this pin; it **floats**) |
| `noUncheckedSideEffectImports` | `true` |
| `libReplacement` | `false` |
| `stableTypeOrdering` | `true`, **cannot be turned off** |
| `rootDir` | `./` (the tsconfig directory) |
| `types` | `[]` (restore 5.x crawl with `["*"]` only as a bridge) |

`moduleResolution` for new `module: esnext` work is **not** `node10`. Use `nodenext` or `bundler`. 6.0 also allows `bundler` + `module: commonjs` as a migration pairing.

## Hard errors (removed 6.0 deprecations)

These are **not** warnings:

- `target: es5`
- `downlevelIteration`
- `moduleResolution: node` / `node10` / `classic`
- `module: amd | umd | systemjs | none`
- `baseUrl` — rewrite `paths` relative to the tsconfig directory
- `outFile`
- `esModuleInterop: false` / `allowSyntheticDefaultImports: false`
- `alwaysStrict: false`
- `module` **keyword** as a namespace declaration
- import assertions using `assert { ... }` (static and dynamic) — use import attributes with `with`
- `/// <reference no-default-lib="true" />` under `skipDefaultLibCheck` (7.0 blog: no-default-lib directives no longer respected under that flag)
- CLI file paths when cwd contains a `tsconfig.json`, unless `--ignoreConfig`

`ignoreDeprecations: "6.0"` does **not** bring them back.

## Surprising pair: types and rootDir

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["./src"]
}
```

- **`types: []`** means *no* automatic `@types` globals. Node’s `process`, Jest’s `describe`, Bun’s `Bun` will not exist until listed (or imported as a module).
- **`rootDir: "./"`** means a file `src/index.ts` emits to `outDir/src/index.js`. Set `rootDir` to the source root you actually want mirrored.

## The 5.x lie

“I’ll set `ignoreDeprecations` and deal with it later.” Later is 7.0, and the flag does nothing useful. Fix the config on 6.0 or as the first 7.0 commit.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (“Updates Since 5.x, and New Behaviors from 6.0”). 6.0 blog (rationale). See [sources.md](sources.md).
