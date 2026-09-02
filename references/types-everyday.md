# Everyday types

## Scope

Primitives, arrays, tuples, `any` / `unknown` / `never`, and type vs value. 7.0 uses the 6.0 checker with `strict` **on** by default. Not narrowing ([narrowing-and-control-flow.md](narrowing-and-control-flow.md)), not generics ([generics-inference-and-variance.md](generics-inference-and-variance.md)).

## Contents

- [Task routes](#task-routes)
- [What to emit](#what-to-emit)
- [any, unknown, never](#any-unknown-never)
- [Arrays and tuples](#arrays-and-tuples)
- [Type vs value](#type-vs-value)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN annotating a parameter, variable, or return with a primitive, array, or tuple — write the 7.0-legal shape below; do not reach for `any` to silence `strict`.
- USE WHEN a value is used as a type (`const n = 1; type T = n`) — that is illegal in `.ts` and, on 7.0, in JSDoc too. Write `typeof n`. [javascript-and-jsdoc.md](javascript-and-jsdoc.md).
- USE WHEN `null` or `undefined` is leaking into a `string` — `strictNullChecks` is on via default `strict`. Union it explicitly or narrow.

## What to emit

Write annotations the checker can enforce without widening to `any`:

```ts
const count: number = 1;
const label: string = "ok";
const flag: boolean = true;
const missing: undefined = undefined;
const empty: null = null;
const blob: bigint = 1n;
const key: symbol = Symbol("k");
```

Object literals get a **fresh** type and excess-property checking when assigned to a named type ([objects-and-interfaces.md](objects-and-interfaces.md)). Prefer `interface` / type alias for reused shapes.

`string | number` style unions: [unions-intersections-and-never.md](unions-intersections-and-never.md).

## any, unknown, never

- **`any`**: turns the checker off along that flow. Illegal as a habit under default `strict` work. Do not write `any` to “save time” on exported APIs.
- **`unknown`**: the safe top type. Narrow before use ([narrowing-and-control-flow.md](narrowing-and-control-flow.md)).
- **`never`**: a value that cannot happen. Use it for exhaustiveness (`default: const _x: never = x`). Assignability: `never` is a subtype of every type; nothing inhabited is a subtype of `never` except `never`.

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

## Arrays and tuples

```ts
const xs: number[] = [1, 2];
const ys: Array<string> = ["a"];
const pair: [string, number] = ["age", 7];
const rest: [string, ...number[]] = ["id", 1, 2];
```

`readonly number[]` / `readonly [string, number]` when the binding must not mutate. Tuple labels (`[x: number, y: number]`) are documentation for the checker and emit; they do not create values.

Optional tuple slots (`[string, number?]`) are not the same as rest. Prefer rest when length is open-ended.

## Type vs value

Every name lives in the **type** space, the **value** space, or both (`class`, `enum`, namespaces with values). `interface` and `type` aliases are type-only. `const` / `function` / `let` are values unless you write `typeof`.

```ts
const origin = { x: 0, y: 0 };
type Origin = typeof origin; // legal
// type Wrong = origin;      // illegal — value used as type
```

On 7.0 this same rule applies in JSDoc: write `@typedef {typeof origin}` not `@typedef {origin}`.

## The 5.x lie

“`strict` is off unless they set it.” On 7.0 `strict` defaults **true**. `string | null` is not `string`. Implicit `any` on parameters is an error. Write the types.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (`strict` default). See [sources.md](sources.md).
