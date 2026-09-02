# Type manipulation

## Scope

`keyof`, `typeof`, indexed access, mapped types, conditional types, and `infer` **outside** template literals. Unicode template `infer`: [template-literals-and-infer.md](template-literals-and-infer.md). Utility aliases: [utility-types.md](utility-types.md).

## Contents

- [Task routes](#task-routes)
- [keyof and typeof](#keyof-and-typeof)
- [Indexed access](#indexed-access)
- [Mapped types](#mapped-types)
- [Conditional types and infer](#conditional-types-and-infer)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN deriving a type from a value or from another type rather than duplicating fields — `typeof` / `keyof` / indexed access / mapped types.
- USE WHEN you need `T[K]` for a union of keys — that distributes; `T[K1 | K2]` is `T[K1] | T[K2]`.
- USE WHEN a conditional type should peel a wrapper (`Promise`, array, function return) — `infer` in the `extends` clause, not a runtime check.

## keyof and typeof

```ts
const config = { host: "localhost", port: 443 } as const;
type Config = typeof config;
type ConfigKey = keyof Config; // "host" | "port"
```

`keyof T` is `string | number | symbol` for an open index signature, and a literal union for named keys. `typeof` in **type position** is the type of a value; in **value position** it is JavaScript’s `typeof`.

`keyof` a union is the **intersection** of keys (keys common to every member). `keyof` an intersection is the **union** of keys.

## Indexed access

```ts
type Port = Config["port"]; // 443
type HostOrPort = Config["host" | "port"];
type Values = Config[keyof Config];
```

`T[number]` on an array/tuple is the element type. Write `T[K]` only when `K extends keyof T`.

## Mapped types

```ts
type ReadonlyPoint = { readonly [K in "x" | "y"]: number };
type Optional<T> = { [K in keyof T]?: T[K] };
type Rekey<T> = { [K in keyof T as `field_${string & K}`]: T[K] };
```

Modifiers: `readonly`, `-readonly`, `?`, `-?`. Homomorphic mapped types (`{ [K in keyof T]: … }`) copy modifiers from `T` unless you change them. `as` clauses **filter** keys when the remapped name is `never`.

Do not nest three mapped types to avoid writing a function. If you cannot name what the type *computes*, the agent is over-abstracting — write the interface.

## Conditional types and infer

```ts
type Flatten<T> = T extends (infer U)[] ? U : T;
type Awaited0<T> = T extends Promise<infer U> ? U : T;

type IsString<T> = T extends string ? true : false;
```

Naked type parameters **distribute** over unions: `Flatten<string | number[]>` → `string | number`. Wrap in a tuple to opt out: `[T] extends [X] ? …`.

`infer` binds a new type parameter in the true branch only. Multiple `infer`s in one pattern are allowed; they must be consistent.

Prefer `extends` constraints on generic functions for *call-site* checks; prefer conditional types when the *output type* must branch.

## The 5.x lie

“A 40-line conditional type is cleaner than a function.” Agents over-produce type-level programs that 7.0 still cannot debug well. If `tsc` errors inside the conditional, rewrite to a simpler `keyof` / indexed access or a runtime function with a simple signature.

## Foot

Pin: TypeScript **7.0.2**. 6.0 checker. See [sources.md](sources.md).
