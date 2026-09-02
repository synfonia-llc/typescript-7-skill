# Declaration files

## Scope

Writing `.d.ts`, `declare`, and the **language** cost of `isolatedDeclarations` / `declaration`. Not project-references wiring ([project-references-and-build.md](project-references-and-build.md)).

## Contents

- [Task routes](#task-routes)
- [When you write .d.ts by hand](#when-you-write-dts-by-hand)
- [isolatedDeclarations](#isolateddeclarations)
- [Ambient modules and global](#ambient-modules-and-global)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN publishing a library or enabling `"declaration": true` — every **exported** binding must have a type TypeScript can write into `.d.ts` without running the checker across other files if `isolatedDeclarations` is on.
- USE WHEN `isolatedDeclarations` errors “inferred type cannot be named” / “requires an explicit type” — annotate the export; do not disable the flag to hide it.
- USE WHEN wrapping a JS package — write a module `.d.ts` (`export …`) not a global unless the package *is* a global.

## When you write .d.ts by hand

`.d.ts` is TypeScript with all values erased. You may write `declare function`, `declare class`, `export interface`, `export type`, `declare const`. You may not write function bodies (except in `declare`d classes, empty or `declare` members).

```ts
export interface User {
  id: string;
}
export function loadUser(id: string): Promise<User>;
```

`export =` is the CJS export shape. `export default` is ESM. Match the package’s actual runtime. `esModuleInterop` cannot be false, so `import Def from "cjs-pkg"` is how callers spell `export =` packages.

Do not put implementation leftover `import "./side-effect.js"` in a hand-written `.d.ts` unless the types *need* that module.

`.d.ts` emit from `.js` **changed** in 7.0 (non-goal to match Strada text). [javascript-and-jsdoc.md](javascript-and-jsdoc.md).

## isolatedDeclarations

When `"isolatedDeclarations": true`, declaration emit must work **per-file** from syntax, which is how 7.0’s parallel emit wants to scale (7.0 blog: `--isolatedDeclarations` unblocks parallel declaration emit with `--build`).

7.0-legal exported surface:

```ts
export function parse(input: string): number {
  return Number(input);
}

export const VERSION: string = "7.0.2";

export class Box<T> {
  constructor(public value: T) {}
}
```

Illegal under the flag: exported `const` / function whose type is **only** inferred, complex `as const` objects without an explicit type, `export default` of an unannotated function expression.

Fix: write the type on the **export**. Do not add `any`.

`declarationMap` / `composite` still require `declaration: true`. Project references typically set both ([project-references-and-build.md](project-references-and-build.md)).

## Ambient modules and global

```ts
declare module "untyped-pkg" {
  export function ping(): void;
}

declare global {
  interface Window {
    __PLICIT__?: boolean;
  }
}
export {};
```

`export {}` makes the file a module so `declare global` is augmentation, not a script. Without it, top-level `declare` leaks into the global checker environment — a common agent bug, worse now that `types` defaults to `[]` and people dump one `globals.d.ts` in `include`.

## The 5.x lie

“`declaration: true` will infer everything I export.” With `isolatedDeclarations` (and even without, for unnameable inferred types), **you** write the exported types. That is the price of parallel emit.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (parallel emit, `isolatedDeclarations`). CHANGES.md (JS declaration emit). See [sources.md](sources.md).
