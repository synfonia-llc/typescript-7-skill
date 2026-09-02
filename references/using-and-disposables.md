# using and disposables

## Scope

`using` / `await using`, `Symbol.dispose` / `Symbol.asyncDispose`, and the `DisposableStack` / `AsyncDisposableStack` types from bundled `esnext.disposable`. Runtime support is **not** implied ([lib-inventory.md](lib-inventory.md)).

## Contents

- [Task routes](#task-routes)
- [The language](#the-language)
- [What the lib types](#what-the-lib-types)
- [Emit and downlevel](#emit-and-downlevel)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN a resource must be disposed on all paths (file, lock, span) — write `using` if the runtime implements `Symbol.dispose`; otherwise dispose in `finally`.
- USE WHEN types mention `Disposable` / `AsyncDisposable` but Node throws — lib is ahead of the runtime. Polyfill or don’t emit `using`.
- USE WHEN stacking several disposables — `DisposableStack` / `AsyncDisposableStack` from `esnext.disposable`.

## The language

```ts
function withHandle(handle: { [Symbol.dispose](): void }): void {
  using _h = handle;
  void _h;
}

async function withAsync(h: { [Symbol.asyncDispose](): Promise<void> }): Promise<void> {
  await using _h = h;
  void _h;
}
```

`using x = expr` declares a const-like binding and calls `[Symbol.dispose]()` when the block exits (including `throw`). `await using` calls `[Symbol.asyncDispose]()` (or dispose, then await). Nullish `expr` is skipped.

`using` is **block-scoped**. Do not use it at module top level unless you mean “dispose at module teardown” and the runtime supports that.

A class can implement:

```ts
class File implements Disposable {
  [Symbol.dispose](): void {}
}
```

## What the lib types

Summarized from `lib.esnext.disposable.d.ts` (do not paste):

- `Symbol.dispose` / `Symbol.asyncDispose` on `SymbolConstructor`
- `Disposable`, `AsyncDisposable`
- `DisposableStack` with `use`, `adopt`, `defer`, `move`, `dispose`, `disposed`
- `AsyncDisposableStack` with async equivalents
- `SuppressedError` for errors during dispose that mask an earlier error

These sit behind `esnext` / `esnext.disposable`. Default `target` `es2025` does **not** include them unless `lib` adds `esnext` or `esnext.disposable`.

## Emit and downlevel

7.0’s default `target` is current-year ES (`es2025` at this pin). `using` may remain `using` in emit at that target. If you lower `target` below a runtime that understands `using`, `tsc` downlevels to `try`/`finally` **only if that emit path exists for your target** — verify with `--showConfig` and a look at emit. If the runtime lacks `Symbol.dispose`, downlevel syntax will still **call** that symbol. Ship a polyfill or do not use `using`.

`target: es5` is **removed**; you cannot downlevel `using` to ES5 with `tsc`.

## The 5.x lie

“If it typechecks, Node will dispose it.” Types for `using` shipped while runtimes were still catching up. Check the runtime (or polyfill) before writing `using` in production.

## Foot

Pin: TypeScript **7.0.2**. Bundled `esnext.disposable` (summarized). 7.0 blog (`target` default, no ES5). See [sources.md](sources.md), [lib-esnext.md](lib-esnext.md).
