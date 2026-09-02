# Compiler options that change legal source

## Scope

Flags that change **what source is legal** on 7.0, not a reprint of every tsconfig key. Inventing flags is forbidden: invoke the probe's `compilerPath` with `--help`. 7.0-new CLI flags: [cli-watch-and-parallelism.md](cli-watch-and-parallelism.md). Defaults/removals: [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md).

## Contents

- [Task routes](#task-routes)
- [How to choose](#how-to-choose)
- [strict family](#strict-family)
- [Module flags](#module-flags)
- [isolatedDeclarations, isolatedModules, verbatimModuleSyntax](#isolateddeclarations-isolatedmodules-verbatimmodulesyntax)
- [exactOptionalPropertyTypes and indexed access](#exactoptionalpropertytypes-and-indexed-access)
- [lib, target, types, jsx](#lib-target-types-jsx)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN setting or explaining a compiler option that affects emit or assignability — read the section; if the flag is not named here, run `tsc --help` / `--showConfig`.
- USE WHEN `nodenext` vs `bundler` is the question — [modules-imports-and-exports.md](modules-imports-and-exports.md) for what to **type**; this page for the flags.
- USE WHEN enabling `isolatedDeclarations` for a library — [declaration-files.md](declaration-files.md).

## How to choose

1. `<compilerPath-from-probe> --showConfig` — the **effective** config, not the file you think you edited.
2. Change one flag, re-run `tsc`.
3. Do not copy a 5.x “strictest tsconfig” gist that sets `moduleResolution: node` or `target: es5`.

## strict family

Default `strict: true` turns on the bundle: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict` (and 7.0 **forbids** `alwaysStrict: false`).

You may set a member to `false` explicitly. Agents should not.

Related, not in the `strict` bundle but they change legal source:

- `noUncheckedIndexedAccess` — `T[K]` includes `undefined`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `exactOptionalPropertyTypes` — [objects-and-interfaces.md](objects-and-interfaces.md)

## Module flags

| Flag | 7.0-legal values / notes |
| --- | --- |
| `module` | Default `esnext`. **Illegal:** `amd`, `umd`, `systemjs`, `none`. Prefer `nodenext` or `preserve` for apps. |
| `moduleResolution` | **Illegal:** `node`, `node10`, `classic`. Use `nodenext` or `bundler`. |
| `verbatimModuleSyntax` | Type-only imports must be `import type`. [modules-imports-and-exports.md](modules-imports-and-exports.md) |
| `esModuleInterop` | Cannot be `false` |
| `allowSyntheticDefaultImports` | Cannot be `false` |
| `resolvePackageJsonExports` / `Imports` | Honor `package.json` maps (on under `nodenext`) |
| `customConditions` | Extra `exports` conditions |
| `noUncheckedSideEffectImports` | Default **true** — side-effect imports must resolve |
| `rewriteRelativeImportExtensions` | Rewrite `.ts` specifiers on emit when you wrote them (verify with `--help` on the installed binary) |

`baseUrl` is removed. `paths` are relative to the tsconfig directory.

## isolatedDeclarations, isolatedModules, verbatimModuleSyntax

- `isolatedModules` — every file must be a module the transpiler can handle alone (no const-enum tricks across files).
- `verbatimModuleSyntax` — import elision is honest; write `import type`.
- `isolatedDeclarations` — exported types must be explicit so `.d.ts` emit is per-file. Needed for fast `--build` declaration emit (7.0 blog).

## exactOptionalPropertyTypes and indexed access

`exactOptionalPropertyTypes`: missing key ≠ `undefined` value. [objects-and-interfaces.md](objects-and-interfaces.md).

`noUncheckedIndexedAccess`: `obj[k]` is `T | undefined`.

## lib, target, types, jsx

- `target` default **es2025** (floating). **Illegal:** `es5`.
- `lib` defaults from `target`. Adding `dom` in a Node app will type `document` without providing it at runtime. [lib-inventory.md](lib-inventory.md)
- `types` default **[]**. List `"node"` etc.
- `libReplacement` default **false** (do not swap `lib` via `node_modules/@typescript/lib-*` unless you mean to).
- `jsx` / `jsxImportSource` — [jsx-syntax.md](jsx-syntax.md)

`skipLibCheck` still skips type-checking `.d.ts` bodies. 7.0 reports declaration **conflicts** at all contributing **non-`.d.ts`** sites even when 6.0 hid some (CHANGES.md). It is not a fix for your source.

## The 5.x lie

“I remember the flag name, I’ll type it.” Run `--help`. Only `--checkers`, `--builders`, and `--singleThreaded` are documented here as 7.0-new CLI.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (defaults, removed flags). Run `tsc --help` live. See [sources.md](sources.md).
