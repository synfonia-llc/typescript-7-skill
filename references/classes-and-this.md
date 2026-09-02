# Classes and this

## Scope

Classes, `this` types, parameter properties, definite assignment, heritage. Decorators: [decorators.md](decorators.md). `using` on class instances: [using-and-disposables.md](using-and-disposables.md). JS constructor functions: **gone** — [javascript-and-jsdoc.md](javascript-and-jsdoc.md).

## Contents

- [Task routes](#task-routes)
- [7.0-legal class shape](#70-legal-class-shape)
- [this and polymorphic this](#this-and-polymorphic-this)
- [Parameter properties and definite assignment](#parameter-properties-and-definite-assignment)
- [Heritage and override](#heritage-and-override)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN writing a class in `.ts` or replacing a JS constructor function — write `class`; do not typecheck `function C() { this.x = 1 }` / `C.prototype`.
- USE WHEN `this` in a method is `any` or lost in a callback — default `noImplicitThis` / `strictBindCallApply`; write a `this` parameter or an arrow field.
- USE WHEN `exactOptionalPropertyTypes` / `strictPropertyInitialization` flags a field — initialize, use `!` only when construction actually assigns, or type `T | undefined`.

## 7.0-legal class shape

```ts
class Counter {
  #hidden = 0;
  constructor(public start: number) {}
  increment(): this {
    this.#hidden += 1;
    return this;
  }
  get value(): number {
    return this.start + this.#hidden;
  }
}
```

Visibility: `public` (default), `protected`, `private` (compile-time only). Hard privacy: `#fields`. Prefer `#` when privacy must survive emit.

Static blocks and static fields are legal. `implements` checks the instance side; it does not emit runtime relationship.

## this and polymorphic this

Method `this` is the instance type. Returning `this` (the type) preserves subclasses under chaining.

Extracting a method unbinds it:

```ts
const c = new Counter(0);
const inc = c.increment;
// inc(); // this is wrong unless you bind
const bound = () => c.increment();
```

For objects passed as `{ increment() { … } }`, 6.0/7.0 this-less inference applies when `this` is unused ([functions-and-call-signatures.md](functions-and-call-signatures.md)).

## Parameter properties and definite assignment

`constructor(private readonly id: string) {}` declares and assigns `id`. Use it for boring DI-style fields. Do not mix with heavy logic in the constructor if `isolatedDeclarations` needs a trivial constructor ([declaration-files.md](declaration-files.md)).

`strictPropertyInitialization` (in default `strict`): every field must be assigned in the constructor or have an initializer. `field!: Type` asserts assignment later (e.g. a framework `init()`). Agents overuse `!`. Prefer `Type | undefined` or construct fully.

JSDoc `this.id;` **without an initializer** no longer creates a property on 7.0. Write a class field.

## Heritage and override

```ts
class Animal {
  move(): void {}
}
class Dog extends Animal {
  override move(): void {}
  bark(): void {}
}
```

`override` is required if `noImplicitOverride` is on (not default; still write it). The constructor must call `super()` before using `this`.

Abstract classes and methods are erased. Do not use `abstract` as a runtime brand.

## The 5.x lie

“JS constructor functions plus prototype assign are how you write classes in JSDoc.” 7.0 removed that analysis. Write `class`.

## Foot

Pin: TypeScript **7.0.2**. CHANGES.md (constructor functions, this-property JSDoc). See [sources.md](sources.md).
