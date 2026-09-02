# Narrowing and control flow

## Scope

How 7.0 (6.0 checker, `strict` on) **narrows** unions as you write `if`, `switch`, `typeof`, `in`, equality, and predicates. Not how to *declare* unions ([unions-intersections-and-never.md](unions-intersections-and-never.md)).

## Contents

- [Task routes](#task-routes)
- [What narrowing is](#what-narrowing-is)
- [Forms that survive 7.0](#forms-that-survive-70)
- [Predicates and assertion functions](#predicates-and-assertion-functions)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN a union is still wide inside a branch you thought you narrowed — rewrite the guard so it is a recognized narrowing form; do not cast.
- USE WHEN writing `if (x)` on an object that may be `null` — truthiness narrows `null`/`undefined` away; it also collapses `0`, `""`, and `NaN`. Prefer `!= null` for nullish-only.
- USE WHEN JSDoc `@type` assertions appear to “un-narrow” — on 7.0 a `@type` assertion **prevents** narrowing, matching `.ts` assertions. [javascript-and-jsdoc.md](javascript-and-jsdoc.md).

## What narrowing is

Control-flow analysis refines a binding’s type along a path. It is not mutation of the value. Aliasing can **invalidate** narrowing: assigning a union into `let` and then mutating a property through another name will often **reset** the original binding. Prefer `const` plus discriminant fields.

## Forms that survive 7.0

```ts
function plen(x: string | string[] | null): number {
  if (x == null) return 0;
  if (typeof x === "string") return x.length;
  if (Array.isArray(x)) return x.length;
  const _n: never = x;
  return _n;
}

function hasName(x: object): x is { name: string } {
  return "name" in x && typeof (x as { name: unknown }).name === "string";
}
```

Recognized guards:

- `typeof x === "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"`
- `x instanceof C` (values with a prototype)
- `"k" in x` (narrows to types that declare `k`, or excludes them in the else)
- Equality / `switch` on a **discriminant** literal field
- Truthiness (see caveat above)
- Assignment narrowing (`let x: string | number; x = 1; /* number */`)

`typeof null === "object"` in JavaScript. After `typeof x === "object"`, still exclude `null` (`x !== null`) under `strictNullChecks`.

## Predicates and assertion functions

```ts
function isString(x: unknown): x is string {
  return typeof x === "string";
}

function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new TypeError("string");
}
```

The predicate return type (`x is T`) is the narrowing. A boolean return without `is` does **not** narrow the argument at the call site.

Arrow functions: in **JSDoc**, `asserts` must sit on the declaring variable’s type, not on the arrow body — same rule as `.ts` (no `asserts` on arrow syntax). See CHANGES.md / [javascript-and-jsdoc.md](javascript-and-jsdoc.md).

## The 5.x lie

“Cast it (`as T`) and move on.” Under default `strict`, a lying cast is how agents ship `undefined.length`. Narrow, then call.

## Foot

Pin: TypeScript **7.0.2**. 6.0 checker. CHANGES.md (`@type` assertions vs narrowing in JS). See [sources.md](sources.md).
