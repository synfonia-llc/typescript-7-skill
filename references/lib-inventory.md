# Lib inventory

## Scope

What `lib` / `target` / `types` mean on 7.0.2, the bundled lib **names** from the pin VSIX (~108 `lib/*.d.ts` files), and the rule **lib is types, not runtime**. ES2025/ESNext APIs: [lib-es2025.md](lib-es2025.md), [lib-esnext.md](lib-esnext.md). Older ES libs are **indexed here only**.

Do **not** copy or vendor Microsoft `.d.ts` bodies.

## Contents

- [Task routes](#task-routes)
- [lib vs target vs types vs runtime](#lib-vs-target-vs-types-vs-runtime)
- [How libs compose](#how-libs-compose)
- [DOM](#dom)
- [Bundled names (pin VSIX)](#bundled-names-pin-vsix)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN `document` types in a Node app, or `process` is missing in a Node app — `lib` vs `types` are different knobs. `dom` is a **lib**; `@types/node` is a **types** package (`"types": ["node"]`).
- USE WHEN choosing `es2025` vs `esnext` — `target` default is current-year ES (`es2025` at this pin). `esnext` is a moving slice **ahead** of that (Temporal, `using`, `getOrInsert`, …).
- USE WHEN a global typechecks and then throws in Node 22 — the name came from lib. Confirm the runtime or polyfill.
- USE WHEN looking up `Array.at` / `Object.hasOwn` — those live in older ES libs; this skill does not reprint them. Use MDN + the installed lib. This page only lists **names**.

## lib vs target vs types vs runtime

| Knob | Meaning |
| --- | --- |
| `target` | Emit language level + **default** `lib` set. 7.0 default: current-year ES (`es2025` here). `es5` **removed**. |
| `lib` | Which **global type** files to load (`es2025`, `dom`, `esnext.temporal`, …). Overrides the default implied by `target` if you set it. |
| `types` | Which **`@types/*` packages** to include as globals. Default **`[]`**. Does not load `lib.es*.d.ts`. |
| Runtime | Node, browsers, workers. **Not** implied by lib. |

`libReplacement` defaults **false**: TypeScript will not look in `node_modules` for replacement `@typescript/lib-*` packages unless you turn it on.

The npm `typescript@7.0.2` tarball may **not** list 108 loose `lib/*.d.ts` files (native binaries carry them). The **pin VSIX** does. Agents refer to libs by **option name** (`"lib": ["es2025", "dom"]`), never by copying files into the repo.

## How libs compose

Aggregator files triple-slash the slices. From the pin:

**`es2025`** references: `es2024`, `es2025.collection`, `es2025.float16`, `es2025.intl`, `es2025.iterator`, `es2025.promise`, `es2025.regexp`.

**`esnext`** references: `es2025`, `esnext.intl`, `esnext.collection`, `esnext.decorators`, `esnext.disposable`, `esnext.array`, `esnext.error`, `esnext.sharedmemory`, `esnext.typedarrays`, `esnext.temporal`, `esnext.date`.

Setting `"lib": ["esnext"]` **includes** ES2025. Setting `"lib": ["es2025"]` does **not** include Temporal / `using` / `Map.getOrInsert`.

`es2025.full` / `esnext.full` also pull DOM + scripthost (browser-shaped). Do not use `*.full` in Node services.

## DOM

TypeScript 6.0 folded `dom.iterable` and `dom.asynciterable` **into** `lib.dom.d.ts`. Those slice files still exist as **empty** stubs so old `"lib": ["dom", "dom.iterable"]` keeps working. New code: `"lib": ["dom"]` is enough for `for...of` on `NodeList`.

`dom` in a Node tsconfig will type `window` / `document` without providing them. Do not add `dom` “to be safe”.

## Bundled names (pin VSIX)

The pin VSIX `extension/lib/` contains about **108** files. Option names (drop `lib.` prefix and `.d.ts`):

**Meta / host:** `d.ts` aggregator (`lib.d.ts`), `decorators`, `decorators.legacy`, `dom`, `dom.iterable`, `dom.asynciterable`, `webworker`, `webworker.iterable`, `webworker.asynciterable`, `webworker.importscripts`, `scripthost`.

**ES aggregators:** `es5`, `es6`, `es2015`, `es2016`, `es2017`, `es2018`, `es2019`, `es2020`, `es2021`, `es2022`, `es2023`, `es2024`, `es2025`, `esnext`, and the matching `*.full` variants.

**ES slices** (non-exhaustive of every year; agents need the **new** ones):  
`es2015.*` (core, collection, generator, iterable, promise, proxy, reflect, symbol, symbol.wellknown), `es2016.array.include`, `es2016.intl`, `es2017.arraybuffer`, `es2017.date`, `es2017.intl`, `es2017.object`, `es2017.sharedmemory`, `es2017.string`, `es2017.typedarrays`, `es2018.asyncgenerator`, `es2018.asynciterable`, `es2018.intl`, `es2018.promise`, `es2018.regexp`, `es2019.array`, `es2019.intl`, `es2019.object`, `es2019.string`, `es2019.symbol`, `es2020.bigint`, `es2020.date`, `es2020.intl`, `es2020.number`, `es2020.promise`, `es2020.sharedmemory`, `es2020.string`, `es2020.symbol.wellknown`, `es2021.intl`, `es2021.promise`, `es2021.string`, `es2021.weakref`, `es2022.array`, `es2022.error`, `es2022.intl`, `es2022.object`, `es2022.regexp`, `es2022.string`, `es2023.array`, `es2023.collection`, `es2023.intl`, `es2024.arraybuffer`, `es2024.collection`, `es2024.object`, `es2024.promise`, `es2024.regexp`, `es2024.sharedmemory`, `es2024.string`, `es2025.collection`, `es2025.float16`, `es2025.intl`, `es2025.iterator`, `es2025.promise`, `es2025.regexp`, `esnext.array`, `esnext.collection`, `esnext.date`, `esnext.decorators`, `esnext.disposable`, `esnext.error`, `esnext.intl`, `esnext.sharedmemory`, `esnext.temporal`, `esnext.typedarrays`.

If a name is missing from this list but present in the installed VSIX / binary, **believe the install**. Run `tsc --showConfig` to see effective `lib`.

Older ES features (`Array.at`, `Object.hasOwn`, `Promise.withResolvers`, …) are in those yearly slices. This skill does not document them; models already know them.

## The 5.x lie

“`lib` is what Node implements.” `lib` is a type environment. Node 22 is not Temporal. Browsers are not `node:fs`.

## Foot

Pin: TypeScript **7.0.2**, VSIX bundled `extension/lib/*.d.ts` (~108 files, summarized names only). 6.0 blog (`es2025` lib, DOM iterable fold, Temporal in esnext). See [sources.md](sources.md).
