# Objects and interfaces

## Scope

Object type literals, interfaces, excess-property checks, index signatures, optional fields, and `exactOptionalPropertyTypes`. Not classes ([classes-and-this.md](classes-and-this.md)). Not mapped types ([type-manipulation.md](type-manipulation.md)).

## Contents

- [Task routes](#task-routes)
- [Interface vs type alias](#interface-vs-type-alias)
- [Excess-property checking](#excess-property-checking)
- [Optional fields and exactOptionalPropertyTypes](#optional-fields-and-exactoptionalpropertytypes)
- [Index signatures](#index-signatures)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN declaring a reused object shape — prefer `interface` for extendable objects; `type` for unions/tuples/mapped types.
- USE WHEN an extra field on an object literal is an error but the same object is fine through a variable — excess-property checking; that is intended.
- USE WHEN `optionally?: string` will not assign to `{ optionally: string | undefined }` — `exactOptionalPropertyTypes` is on in this project; see below.
- USE WHEN `noPropertyAccessFromIndexSignature` or string index types surprise you — index signatures mean **every** string key is in the type; prefer named fields or a `Map`.

## Interface vs type alias

```ts
interface Point {
  readonly x: number;
  y: number;
}

interface NamedPoint extends Point {
  name: string;
}

type Pair = { left: Point; right: Point };
```

Interfaces merge by the same name (declaration merging). Type aliases do not. Do not merge unless you mean to. For a closed union of shapes, use a discriminated union ([unions-intersections-and-never.md](unions-intersections-and-never.md)), not an interface.

## Excess-property checking

Fresh object literals assigned to a non-index type may not carry unknown keys:

```ts
const p: Point = { x: 1, y: 2, z: 3 };
//                             ~~ excess
const q = { x: 1, y: 2, z: 3 };
const r: Point = q; // allowed — q is not fresh
```

This is a lint-shaped type error for **typos**, not a runtime strip. To allow extras, add an index signature or a wider type.

## Optional fields and exactOptionalPropertyTypes

```ts
interface Opts {
  color?: string;
}

function paint(o: Opts): void {
  const c: string | undefined = o.color;
  void c;
}
```

Without `exactOptionalPropertyTypes`, `{ color?: string }` is treated almost like `{ color?: string | undefined }`, and you may explicitly assign `undefined`.

**With** `exactOptionalPropertyTypes` (a flag that changes legal source — [compiler-options.md](compiler-options.md)):

- A missing key is allowed.
- `color: undefined` is **not** assignable to `color?: string`.
- Reading `o.color` is still `string | undefined` because the key may be absent.

7.0-legal habit: if `undefined` is a real stored value, write `color?: string | undefined` or `color: string | undefined` and mean it. If absence is the only empty state, keep `color?: string` and do not pass `undefined`.

## Index signatures

```ts
interface Dict {
  [key: string]: number;
  length: number; // ok — number assignable to number
  // name: string; // error — string not assignable to number
}
```

String index signatures also apply to number keys (they are coerced to string). Prefer `Record<K, V>` ([utility-types.md](utility-types.md)) or `Map` when the key set is not “all strings”.

`noUncheckedIndexedAccess` (often on via `strict`-adjacent configs people enable) makes `dict[k]` a `T | undefined`. Write a guard.

## The 5.x lie

“Optional means I can pass `undefined`.” That was the sloppy default. If `exactOptionalPropertyTypes` is on — or you want 7.0-era hygiene — missing ≠ `undefined`.

## Foot

Pin: TypeScript **7.0.2**. Flag: `exactOptionalPropertyTypes` in [compiler-options.md](compiler-options.md). See [sources.md](sources.md).
