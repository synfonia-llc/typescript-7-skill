# Generics, inference, and variance

## Scope

Type parameters, constraints, inference, `infer` in conditionals (link-out), and variance (`in` / `out` / `in out`). Template-literal `infer`: [template-literals-and-infer.md](template-literals-and-infer.md). Mapped/conditional forms: [type-manipulation.md](type-manipulation.md).

## Contents

- [Task routes](#task-routes)
- [Write a generic](#write-a-generic)
- [Inference](#inference)
- [Variance](#variance)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN a function or type should work for more than one type without `any` — introduce a type parameter with a constraint, not `any`.
- USE WHEN inference picks `unknown` or the wrong member of a union — pass an explicit type argument, or annotate the variable you pass in. 7.0’s `stableTypeOrdering` can surface inference that previously depended on union order.
- USE WHEN writing a generic interface/type that is only produced or only consumed — mark `out` (covariant) or `in` (contravariant) so misuse is an error.

## Write a generic

```ts
function identity<T>(value: T): T {
  return value;
}

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

interface Box<T> {
  value: T;
}
```

Constraints (`extends`) are **requirements**, not casts. Default type parameters (`<T = string>`) fire when inference has nothing to chew on.

Prefer the type parameter on the **function**, not `Box<any>`.

## Inference

The checker infers type arguments from arguments (and contextual return types). It **skips** contextually sensitive functions until other arguments speak, then fills in ([functions-and-call-signatures.md](functions-and-call-signatures.md) this-less methods).

When 6.0 vs 7.0 inference diverges, the 6.0 blog’s advice holds: it is almost always an order-dependent inference that `stableTypeOrdering` made honest. Fix:

```ts
someFn<ExplicitType>(arg);
const arg: ExplicitType = { /* … */ };
someFn(arg);
```

Do not turn `strict` off.

`const` type parameters (`<const T extends string[]>`) infer literal tuples instead of `string[]`. Use them for key lists and builder APIs.

```ts
function keys<const T extends readonly string[]>(...xs: T): T {
  return xs;
}
const k = keys("a", "b"); // readonly ["a", "b"]
```

## Variance

- **Covariant (`out T`)**: a `Producer<Dog>` may be used as `Producer<Animal>` if `Dog extends Animal`. Use on types that **only appear in outputs** (return types, readable properties).
- **Contravariant (`in T`)**: a `Consumer<Animal>` may be used as `Consumer<Dog>`. Use on types that **only appear in inputs** (parameters, writable slots).
- **Invariant (`in out T`)** (default for mutable containers): `Box<Dog>` is not a `Box<Animal>`.

```ts
interface Publisher<out T> {
  get(): T;
}

interface Subscriber<in T> {
  next(value: T): void;
}
```

Marking variance is optional documentation the checker verifies. If the mark disagrees with usage, that is an error — fix the mark or the members.

Arrays are covariant in TypeScript for historical reasons. Do not mutate a `Animal[]` that is actually `Dog[]` through an alias. Prefer `readonly T[]` for covariant reads.

## The 5.x lie

“If inference fails, use `any` or a double assertion.” On 7.0, write the type argument. `stableTypeOrdering` made lucky 5.x inference less lucky, not less correct.

## Foot

Pin: TypeScript **7.0.2**. 6.0 blog (`stableTypeOrdering`, this-less inference). See [sources.md](sources.md).
