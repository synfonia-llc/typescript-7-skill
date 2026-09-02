# lib esnext

## Scope

Globals typed when `"lib"` includes `esnext` (or a named `esnext.*` slice) **beyond** es2025. Summarized from the pin VSIX — not copied `.d.ts`. `using` syntax: [using-and-disposables.md](using-and-disposables.md). Decorators metadata: [decorators.md](decorators.md).

## Contents

- [Task routes](#task-routes)
- [Slices](#slices)
- [Map getOrInsert](#map-getorinsert)
- [using and DisposableStack](#using-and-disposablestack)
- [Temporal](#temporal)
- [Array.fromAsync](#arrayfromasync)
- [Typed array base64/hex](#typed-array-base64hex)
- [Error.isError](#erroriserror)
- [Atomics.pause and shared memory](#atomicspause-and-shared-memory)
- [Date.toTemporalInstant](#datetotemporalinstant)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN calling `Map#getOrInsert`, `Temporal.*`, `DisposableStack`, `Array.fromAsync`, `Uint8Array.fromBase64`, `Error.isError`, or `Atomics.pause` — these are **esnext** at this pin, not default `es2025`.
- USE WHEN `target` is default but Temporal is “not found” — add `"lib": ["es2025", "esnext.temporal"]` (or `esnext`) **and** a runtime/polyfill.
- USE WHEN a polyfill’s `Temporal` types fight `lib.esnext.temporal` — do not mix; pick one type source.

## Slices

Pin `lib.esnext.d.ts` references: `es2025`, `esnext.intl`, `esnext.collection`, `esnext.decorators`, `esnext.disposable`, `esnext.array`, `esnext.error`, `esnext.sharedmemory`, `esnext.typedarrays`, `esnext.temporal`, `esnext.date`.

Prefer the **narrow** slice in `"lib"` over blanket `esnext` so you do not type APIs you will not ship.

## Map getOrInsert

esnext.collection (Stage 4 “upsert”, typed in 6.0):

- `map.getOrInsert(key, defaultValue)`
- `map.getOrInsertComputed(key, (key) => computed)`

Same on `WeakMap` where the lib says so. The computed callback runs **only** on miss. Do not precompute expensive defaults.

## using and DisposableStack

esnext.disposable: `Symbol.dispose` / `Symbol.asyncDispose`, `Disposable`, `AsyncDisposable`, `DisposableStack`, `AsyncDisposableStack`, `SuppressedError`. Language: [using-and-disposables.md](using-and-disposables.md).

## Temporal

esnext.temporal (Stage 4; 6.0 blog). Summarized surface agents actually call:

- `Temporal.Now.instant()`, `plainDateISO()`, …
- `Temporal.Instant`, `Duration`, `PlainDate`, `PlainTime`, `PlainDateTime`, `ZonedDateTime`, `PlainYearMonth`, `PlainMonthDay`, `TimeZone`, `Calendar` as the spec names them in lib
- Arithmetic: `add` / `subtract` / `until` / `since` / `round` on the types that have them

```ts
const yesterday = Temporal.Now.instant().subtract({ hours: 24 });
```

**Not** a `Date` replacement unless the runtime implements Temporal. Firefox shipped; others followed on their own clocks. Node must be new enough or polyfilled. `Date` still exists.

6.0 also adjusted DOM types around Temporal. Do not mix `date-fns` types with `Temporal.*` as if they were the same.

## Array.fromAsync

esnext.array: `Array.fromAsync(iterableOrAsyncIterable)` — collect an async iterable into `Promise<T[]>`.

## Typed array base64/hex

esnext.typedarrays (summarized): `Uint8Array` `toBase64` / `fromBase64` / `toHex` / `fromHex` (and siblings if the lib lists them). Binary plumbing. Not `Buffer` — that is `@types/node`.

## Error.isError

esnext.error: `Error.isError(x)` — true for platform `Error` objects (including cross-realm), unlike `instanceof Error` which fails across realms.

## Atomics.pause and shared memory

esnext.sharedmemory: `Atomics.pause` (hint to the engine in a spinloop). SharedArrayBuffer types remain in shared-memory libs. Do not use as a timer.

## Date.toTemporalInstant

esnext.date: `date.toTemporalInstant()` — bridge from `Date` into Temporal. Requires Temporal at runtime.

`Symbol.metadata` lives on `esnext.decorators` ([decorators.md](decorators.md)).

## The 5.x lie

“`esnext` is what I should always set so I get the newest JS.” It types APIs your **users** may not have. Default `target`/`lib` is **es2025**. Add esnext slices on purpose.

## Foot

Pin: TypeScript **7.0.2** VSIX `lib.esnext*.d.ts` (summarized). 6.0 blog (Temporal, getOrInsert). See [sources.md](sources.md), [lib-inventory.md](lib-inventory.md).
