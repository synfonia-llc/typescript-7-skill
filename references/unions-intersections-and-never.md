# Unions, intersections, and never

## Scope

Union and intersection types, discriminants, and exhaustiveness with `never`. Not narrowing mechanics ([narrowing-and-control-flow.md](narrowing-and-control-flow.md)). Not conditional types ([type-manipulation.md](type-manipulation.md)).

## Contents

- [Task routes](#task-routes)
- [Unions](#unions)
- [Discriminants](#discriminants)
- [Intersections](#intersections)
- [never and exhaustiveness](#never-and-exhaustiveness)
- [Union display order](#union-display-order)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN a value is one of several shapes — write a discriminated union; do not write a boolean soup of optional fields.
- USE WHEN a `switch` should fail compile if a new variant is added — assign the remainder to `never`.
- USE WHEN declaration emit or hover text shows `500 | 100` instead of `100 | 500` vs 6.0 — `stableTypeOrdering` is on and **cannot** be turned off. Harmless unless you snapshot `.d.ts` text.

## Unions

```ts
type Id = string | number;
type Result = { ok: true; value: string } | { ok: false; error: string };
```

A union is a value that is **one** of the members. Access only members common to **all** constituents until you narrow. Optional fields on one side are not present on the other; `in` / discriminant checks first.

`string | never` collapses to `string`. `string | unknown` is `unknown` (unknown absorbs). Prefer `unknown` over `any` for “I have not narrowed yet”.

## Discriminants

Pick a **literal** field:

```ts
type Ev =
  | { kind: "click"; x: number; y: number }
  | { kind: "key"; key: string };

function handle(e: Ev): string {
  switch (e.kind) {
    case "click":
      return `${e.x},${e.y}`;
    case "key":
      return e.key;
    default: {
      const _x: never = e;
      return _x;
    }
  }
}
```

Boolean flags (`isClick: boolean`) are weaker than `"click" | "key"`. Do not encode two variants as `value?: A; other?: B`.

## Intersections

```ts
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;
```

Intersections **must** satisfy every member. `string & number` is `never`. Intersecting a union distributes (`(A | B) & C` → `(A & C) | (B & C)`).

Do not use intersections to “add fields to a union of objects” when a new variant is what you mean — extend the union.

## never and exhaustiveness

`never` is the empty set. After narrowing away every variant, the remainder is `never`. Assigning that remainder to `const _x: never` fails if you missed a case.

Functions that always throw or infinite-loop return `never` ([types-everyday.md](types-everyday.md)).

## Union display order

5.x/6.0 without `stableTypeOrdering` sorted unions by **encounter order**, so adding an unrelated `const x = 500` could flip `100 | 500` to `500 | 100` in `.d.ts`. 7.0 always content-sorts. Do not treat order flips as behavioral regressions. Do treat a **new type error** after the flip as an inference that previously lucked into order — add a type argument ([generics-inference-and-variance.md](generics-inference-and-variance.md)).

## The 5.x lie

“A bunch of optional fields is a union.” It is an intersection-shaped blob that allows illegal combinations. Write `|`.

## Foot

Pin: TypeScript **7.0.2**. 6.0/7.0 blogs (`stableTypeOrdering`). See [sources.md](sources.md).
