# Migrating to TypeScript 7

## Scope

Moving a 5.x or 6.0 project onto TypeScript 7.0.2. Dual-stack only when a tool still `import`s `"typescript"`. Not a language tutorial (see [writing-typescript.md](writing-typescript.md)). Not framework setup.

## Contents

- [Task routes](#task-routes)
- [The one-sentence map](#the-one-sentence-map)
- [Order of work](#order-of-work)
- [5.x → 6.0 map (what 7.0 will hard-error)](#5x--60-map-what-70-will-hard-error)
- [Dual-stack](#dual-stack)
- [The 5.x lie](#the-5x-lie)
- [Sibling pages](#sibling-pages)
- [Foot](#foot)

## Task routes

- USE WHEN `package.json` still has `typescript` 5.x or 6.x and the user asked for 7 — start here, not by rewriting application types.
- USE WHEN `ignoreDeprecations: "6.0"` is in tsconfig — delete it; 7.0 does not honor it. Fix the named deprecations.
- USE WHEN eslint, ts-morph, webpack loaders, or a framework checker crash after installing 7 — dual-stack; do not invent a 7.0 API. See [no-compiler-api.md](no-compiler-api.md).
- USE WHEN CLI `tsc` is 7 but the editor is still 5/6, or the reverse — [editor-lsp-and-vsix.md](editor-lsp-and-vsix.md) and [install-and-dual-stack.md](install-and-dual-stack.md).
- USE WHEN source already typechecks on 6.0 with `stableTypeOrdering` and without `ignoreDeprecations` — install 7 and re-run `tsc`; remaining breaks are the 7.0-only language deltas (Unicode `infer`, JSDoc).

## The one-sentence map

**6.0 warned. 7.0 refuses.** Adopt 6.0’s defaults and delete deprecated flags *as if* you were still on 6.0, then install 7. Jumping 5.x → 7.0 skips the deprecation messages and presents hard errors.

## Order of work

1. **Probe** the current tree (`scripts/probe.mjs`, cwd = project). Record the old version.
2. **If still on 5.x:** treat the 6.0 default/deprecation list as the checklist ([tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md)). Do not set `ignoreDeprecations` as a destination state.
3. **tsconfig first, application types second.** Most 5→7 pain is `types: []`, `rootDir`, `strict`, `module`/`moduleResolution`, and removed flags — not generic syntax.
4. **Install 7** per [install-and-dual-stack.md](install-and-dual-stack.md). Re-probe. Confirm `Version 7.`.
5. **Run `tsc`.** Remaining errors:
   - Config / paths → this page’s sibling compiler docs.
   - JSDoc / `.js` → [javascript-and-jsdoc.md](javascript-and-jsdoc.md).
   - Template `infer` / emoji / `Length<>` utilities → [template-literals-and-infer.md](template-literals-and-infer.md).
   - `import "typescript"` → dual-stack, [no-compiler-api.md](no-compiler-api.md).
6. **Do not** “fix” a type error by disabling the TypeScript 7 language server. CLI `tsc` is the source of truth for typecheck.

Microsoft’s own note: code that compiles cleanly on 6.0 with `stableTypeOrdering` and without `ignoreDeprecations` should compile on 7.0, aside from the documented 7.0 language deltas.

## 5.x → 6.0 map (what 7.0 will hard-error)

Set these **explicitly** if you need the old behavior; 7.0 will not imply them.

| 5.x habit | 7.0 reality |
| --- | --- |
| `strict` off by default | `strict: true` |
| `module` commonjs-ish | `module` defaults to `esnext` |
| `target` es5 | `target` is current-year ES (`es2025` at this pin). `target: es5` is **removed** |
| `@types/*` auto-included | `types: []`. List `"node"` etc. Restore 5.x crawl with `"types": ["*"]` only as a temporary bridge |
| `rootDir` inferred | `rootDir` is the tsconfig directory (`./`) |
| `moduleResolution: node` / `node10` / `classic` | **Removed.** Use `nodenext` or `bundler` |
| `baseUrl` | **Removed.** Make `paths` relative to the project |
| `outFile`, `module: amd\|umd\|systemjs\|none` | **Removed** |
| `esModuleInterop: false`, `alwaysStrict: false` | **Illegal** |
| `import … assert { … }` | Write `with` |
| `namespace` via `module` keyword | Illegal |
| `ignoreDeprecations: "6.0"` | **No-op / error** on 7 — it is not an escape hatch |

`downlevelIteration` is gone with ES5. Downlevel with a bundler, not with `tsc`.

## Dual-stack

7.0 does **not** ship a stable programmatic API. Tools that `import "typescript"` want Strada (6.0).

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@7.0.2",
    "typescript": "npm:@typescript/typescript6@6.0.2"
  }
}
```

Then `tsc` is 7 and `tsc6` is 6. Use 7 for typecheck/CI. Leave `typescript` as 6 so eslint and friends resolve the API they still call.

Nightlies: `typescript@next` on the **`typescript`** package. `@typescript/native-preview` / `tsgo` are the preview-era names, not the GA install path.

## The 5.x lie

“Set `ignoreDeprecations: "6.0"` and upgrade the major.” That flag exists to **buy time on 6.0**. On 7.0 the deprecated options are gone. Fix the config.

## Sibling pages

Install: [install-and-dual-stack.md](install-and-dual-stack.md). Breaks: [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md). API: [no-compiler-api.md](no-compiler-api.md). Symptoms: [diagnosing-failures.md](diagnosing-failures.md).

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (“Running Side-by-Side with TypeScript 6.0”, defaults list). 6.0 blog (deprecations). See [sources.md](sources.md).
