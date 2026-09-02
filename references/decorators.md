# Decorators

## Scope

TC39 **standard** decorators as 7.0 type-checks them, plus `Symbol.metadata` from bundled `esnext.decorators`. Not Angular/Vue decorator frameworks. Not the old experimental `experimentalDecorators` + `emitDecoratorMetadata` design unless the project still has those flags on (legacy; see below).

## Contents

- [Task routes](#task-routes)
- [Standard decorator shape](#standard-decorator-shape)
- [What the lib actually types](#what-the-lib-actually-types)
- [Legacy experimentalDecorators](#legacy-experimentaldecorators)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN writing `@foo` on a class, method, field, getter, setter, or accessor — use the standard decorator signature from `lib.decorators` / `esnext.decorators`, not a guessed `Reflect.metadata` helper.
- USE WHEN `Symbol.metadata` appears — that is the standard metadata slot (`esnext`); confirm the **runtime** has it or a polyfill. Lib ≠ runtime ([lib-inventory.md](lib-inventory.md)).
- USE WHEN a project still sets `"experimentalDecorators": true` — that is the **old** transform. Do not mix standard and legacy decorator syntax in one file.

## Standard decorator shape

A decorator is a function. The checker types it using context objects (kind, name, addInitializer, access, metadata). Typical 7.0-legal method decorator:

```ts
function logged<T extends (this: unknown, ...args: never[]) => unknown>(
  value: T,
  context: ClassMethodDecoratorContext,
): T {
  void context.name;
  return value;
}

class Service {
  @logged
  run(): void {}
}
```

Write the generic so the decorated member keeps its signature. Do not return `any`. Class decorators receive the class and a `ClassDecoratorContext`. Field decorators may return an initializer function.

Evaluation order follows the spec (innermost first for wrappers; initializers run as specified). Do not depend on TypeScript 4 experimental order.

## What the lib actually types

Summarized from the pin’s bundled libs (do not paste the `.d.ts`):

- `lib.decorators.d.ts` — `DecoratorMetadata`, `DecoratorMetadataObject`, and the `*DecoratorContext` / `Class*DecoratorContext` types (`kind` discriminants: `"class" | "method" | "getter" | "setter" | "field" | "accessor"`), plus `addInitializer`, `access`, `private`, `static`.
- `lib.decorators.legacy.d.ts` — **legacy** `ClassDecorator`, `MethodDecorator`, `PropertyDecorator`, `ParameterDecorator` used with `experimentalDecorators`.
- `esnext.decorators` — `Symbol.metadata` on `SymbolConstructor` and the metadata bag on decorator contexts.

If `lib` does not include these (because `target`/`lib` is older and you did not add `decorators` / `esnext.decorators`), the names will not resolve. Add the lib **and** a runtime polyfill if you emit below the runtime that implements them.

## Legacy experimentalDecorators

`"experimentalDecorators": true` restores the pre-standard design (including **parameter** decorators, which standard decorators do not have). `emitDecoratorMetadata` emits `Reflect.metadata` calls; it needs `reflect-metadata` at runtime and is **not** the standard `Symbol.metadata` path.

7.0 still type-checks the legacy flags if you set them. New code: **standard** decorators. Agents must not invent parameter decorators on the standard path.

## The 5.x lie

“Decorators are `Reflect.metadata` plus `experimentalDecorators`.” That was the experimental era. 7.0’s default mental model is TC39 decorators. Match the project’s `experimentalDecorators` flag before copying either example.

## Foot

Pin: TypeScript **7.0.2**. Bundled `lib.decorators.d.ts`, `lib.decorators.legacy.d.ts`, `esnext.decorators` (summarized). See [sources.md](sources.md), [lib-inventory.md](lib-inventory.md).
