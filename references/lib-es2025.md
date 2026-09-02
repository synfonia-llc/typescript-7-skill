# lib es2025

## Scope

Globals typed when `"lib"` includes `es2025` (the 7.0 default `target`). Summarized from the pin VSIX slices — **not** copied `.d.ts`. Runtime may lag. Deeper `esnext`: [lib-esnext.md](lib-esnext.md).

## Contents

- [Task routes](#task-routes)
- [What es2025 adds over es2024](#what-es2025-adds-over-es2024)
- [Iterator helpers](#iterator-helpers)
- [Promise.try](#promisetry)
- [Float16Array](#float16array)
- [Set algebra](#set-algebra)
- [RegExp.escape](#regexpescape)
- [Intl.DurationFormat](#intldurationformat)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN calling `Iterator.from`, iterator `.map` / `.filter` / `.take`, `Promise.try`, `Float16Array`, `Set#union`, `RegExp.escape`, or `Intl.DurationFormat` — these are **es2025** types. Confirm the runtime.
- USE WHEN `target` is default `es2025` but you still lack Temporal / `using` — those are **esnext**, not es2025. [lib-esnext.md](lib-esnext.md).
- USE WHEN 6.0 blog said a name “moved from esnext into es2025” — treat it as es2025 on 7.0.

## What es2025 adds over es2024

6.0 added `"es2025"` for `target` and `lib`. There is no new JS **syntax** year here; it is **built-in API types**. Slices in the pin aggregator: `es2025.collection`, `es2025.float16`, `es2025.intl`, `es2025.iterator`, `es2025.promise`, `es2025.regexp` (plus `es2024`).

## Iterator helpers

On `Iterator` / `IteratorConstructor` (es2025.iterator), summarized:

- `Iterator.from(source)`
- Instance: `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every`, `find`

These are **iterator helpers**, not `Array.prototype`. `array.values().map(...)` typechecks if `Iterator` is in lib; `[].map` is still the array method.

Node 22 ships iterator helpers through V8 12.4. Other runtimes and older Node
majors may not; confirm the project's minimum runtime instead of inferring
support from the TypeScript lib alone.

## Promise.try

`Promise.try(fn)` (es2025.promise): run `fn` and wrap throw/return in a Promise (sync throw becomes rejection). Prefer it over `new Promise((resolve, reject) => { try { resolve(fn()); } catch (e) { reject(e); } })` **when the runtime has it**.

## Float16Array

`Float16Array` plus DataView float16 getters/setters (es2025.float16). Binary/ML code. Confirm engine support; this is not “number is 16-bit in TS”.

## Set algebra

On `Set` (es2025.collection), summarized:

- `union`, `intersection`, `difference`, `symmetricDifference` — return a new Set
- `isSubsetOf`, `isSupersetOf`, `isDisjointFrom` — boolean

Do not mutate-in-place expecting these names; they are the standard immutable algebra methods.

## RegExp.escape

`RegExp.escape(s)` (es2025.regexp): escape a string so it matches literally inside a `RegExp`. Stage 4; typed in 6.0/7.0 es2025.

```ts
function matchWord(word: string, text: string): RegExpMatchArray | null {
  return text.match(new RegExp(`\\b${RegExp.escape(word)}\\b`, "g"));
}
```

## Intl.DurationFormat

`Intl.DurationFormat` (es2025.intl): format duration records (hours/minutes/seconds, …) per locale. Options live on the lib interface; do not invent a third-party helper if the runtime has this.

## The 5.x lie

“Default target is ES5 / ES2017, so I must downlevel iterators.” Default `target` is **es2025**. `target: es5` is a hard error. Downlevel with a bundler if you still ship ancient browsers.

## Foot

Pin: TypeScript **7.0.2** VSIX `lib.es2025*.d.ts` (summarized). 6.0 blog (`es2025` option, `RegExp.escape`, Iterator/Set/Promise.try moved from esnext). See [sources.md](sources.md), [lib-inventory.md](lib-inventory.md).
