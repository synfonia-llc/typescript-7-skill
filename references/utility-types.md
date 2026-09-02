# Utility types

## Scope

The **lib** utility types agents actually reach for (`Partial`, `Pick`, `Omit`, `Record`, `Awaited`, …). Summarized from bundled `lib.es5.d.ts` / `lib.esnext` — **not** a reprint. Custom mapped types: [type-manipulation.md](type-manipulation.md).

## Contents

- [Task routes](#task-routes)
- [Object shapers](#object-shapers)
- [Function and constructor](#function-and-constructor)
- [String and number helpers](#string-and-number-helpers)
- [Awaited and thenable](#awaited-and-thenable)
- [This-types](#this-types)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN you are about to write a mapped type that already exists in lib — use the alias; do not invent `Optional<T>`.
- USE WHEN `Omit` drops the wrong keys — `Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>`; it does not deep-omit.
- USE WHEN `Awaited<T>` on a union looks surprising — it distributes; `Awaited<Promise<U> | V>` is `Awaited<U> | Awaited<V>`.

## Object shapers

| Alias | Meaning (7.0-legal use) |
| --- | --- |
| `Partial<T>` | all properties optional |
| `Required<T>` | all properties required (`-?`) |
| `Readonly<T>` | all properties `readonly` |
| `Pick<T, K>` | subset of keys (`K extends keyof T`) |
| `Omit<T, K>` | `T` without keys `K` |
| `Record<K, T>` | keys `K` all of type `T` |
| `Exclude<T, U>` | union `T` minus members assignable to `U` |
| `Extract<T, U>` | union `T` kept if assignable to `U` |
| `NonNullable<T>` | exclude `null | undefined` |

```ts
type Patch = Partial<Pick<User, "name" | "email">>;
type Flags = Record<"admin" | "staff", boolean>;
```

These are **shallow**. `Partial<{ a: { b: number } }>` still requires `b` if `a` is present.

## Function and constructor

| Alias | Meaning |
| --- | --- |
| `Parameters<T>` | tuple of parameter types |
| `ReturnType<T>` | return type of a function type |
| `ConstructorParameters<T>` | tuple of constructor params |
| `InstanceType<T>` | instance of a construct signature |
| `ThisParameterType<T>` | `this` parameter type, or `unknown` |
| `OmitThisParameter<T>` | function type without `this` |

`T` must be a function / constructor type. `ReturnType<any>` is `any` — do not pass `any`.

## String and number helpers

| Alias | Meaning |
| --- | --- |
| `Uppercase<S>` / `Lowercase<S>` | intrinsic string types |
| `Capitalize<S>` / `Uncapitalize<S>` | first code point |
| `NoInfer<T>` | block inference from this position (5.4+) |

`Capitalize` / template `infer` follow **code points** on 7.0 ([template-literals-and-infer.md](template-literals-and-infer.md)).

## Awaited and thenable

`Awaited<T>` recursively unwraps `Promise` (and thenables) like `await`. Prefer it over hand-rolled `T extends Promise<infer U> ? U : T` when you mean “what `await` returns”.

## This-types

`ThisType<T>` is a marker used in object-literal `methods()` APIs so `this` inside the methods is `T`. It is not a runtime value. Combine with `ThisParameterType` when extracting methods.

## The 5.x lie

“`Omit` is deep and `Partial` too.” Both are one level. For nested patches, write the type or a small recursive alias you can name.

## Foot

Pin: TypeScript **7.0.2**. Bundled lib utility aliases (summarized, not copied). See [sources.md](sources.md), [lib-inventory.md](lib-inventory.md).
