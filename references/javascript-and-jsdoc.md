# JavaScript and JSDoc

## Scope

How TypeScript 7 (Corsa) type-checks `.js` / JSDoc. Grounded in [typescript-go CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md). 7.0 **rewrote** JS analysis to match `.ts`. Closure-era patterns are gone. Not a TS primer ([types-everyday.md](types-everyday.md)).

## Contents

- [Task routes](#task-routes)
- [The rule](#the-rule)
- [Removed JSDoc types and tags](#removed-jsdoc-types-and-tags)
- [Constructor functions and expandos](#constructor-functions-and-expandos)
- [CommonJS](#commonjs)
- [Other checker deltas](#other-checker-deltas)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN `checkJs` / `allowJs` / a `.js` file is in the program — write JSDoc that would be legal as TypeScript types; do not use Closure syntax.
- USE WHEN `@enum`, `@class`, standalone `?`, postfix `!`, or `function(string): void` appears — rewrite per the tables below.
- USE WHEN `function C() { this.x = 1; C.prototype.m = … }` fails — write `class`. Constructor functions are unsupported.
- USE WHEN mixing `module.exports =` with `module.exports.foo =` — pick one style.

## The rule

JavaScript support exposes **TypeScript features** with JSDoc syntax. If it would be illegal in `.ts`, it is illegal in `.js` on 7.0.

`@ts-check` in a file, or `"checkJs": true` in tsconfig, turns checks on. `allowJs` includes `.js` without requiring checks.

Declaration emit from `.js` was rewritten; matching Strada `.d.ts` text is a **non-goal**. Incorrect semantics are still bugs — file them upstream. Presence of errors (including `@ts-ignore`) makes `.d.ts` even less comparable.

## Removed JSDoc types and tags

| Old | 7.0-legal substitute |
| --- | --- |
| standalone `?` (unknown type) | `any` (or better: a real type) |
| `Module:file~id` namepath | `import("file").id` |
| `@class` / `@constructor` on a function | `class` declaration |
| `@enum {number}` on an object | `@typedef` plus `Record<string, E>` (or write `.ts`) |
| `/** @typedef {T} */ TypeName` beside an identifier | `/** @typedef {T} TypeName */` on the **tag** |
| `function(string): void` | `(s: string) => void` |
| automatic `typeof` insertion (`@type {valueName}`) | `@type {typeof valueName}` |
| postfix `!` non-null | just `T` (narrow instead) |
| `@typedef {1} NS.T` nested names | put aliases in a `.d.ts` |

`@class` / `@constructor` / `@enum` / `@author` parse as **generic tags**, not specialized AST. `@author Finn <finn@treehouse.com>` still documents; `@treehouse` can parse as a new tag — keep the email form simple.

`@param` applies to **at most one** function. On a `var f = …, g = …` pair it types only the first; `noImplicitAny` then fires on `g`.

`@typedef` / `@callback` inside a class body are **hoisted outside** the class (possible name conflicts).

`@overload` on arrows / function expressions is **ignored**. Write a call-signature object `@type` ([functions-and-call-signatures.md](functions-and-call-signatures.md)).

`asserts` on an arrow must be on the **variable’s** type, not the arrow.

## Constructor functions and expandos

**Unsupported:**

```js
function C() {
  this.property = 1;
}
C.prototype.method = function () {};
```

**Write:**

```js
class C {
  constructor() {
    this.property = 1;
  }
  method() {}
}
```

Also gone / tightened (CHANGES.md):

- Nested undeclared expandos (`N.X.Y = {}` without assigning `N.X`)
- `this` aliases (`var that = this; that.x = 1`) as a way to create fields
- Identifier-only `this.x;` in a constructor as a field declaration — write a class field or assign
- `void 0` assignment is a real property (`undefined`), not a special ignore
- Fallback `f.x = f.x || init` as a typed initializer pattern — use `if (!f.x) f.x = init`

Ordinary expandos on functions (`function f() {} f.called = false`) remain, with those restrictions.

## CommonJS

- Do not mix `module.exports = …` with `module.exports.x = …` in one file. Choose reassignment **or** property assigns.
- Empty `module.exports = {}` is not ignored as a “just in case”.
- Top-level `this.p = 1` is not an alias for `module.exports`. Write `exports.p = 1`.
- `var readFile = require('fs').readFile` — prefer `var { readFile } = require('fs')`.
- `var mod = module.exports; mod.x = 1` — write `module.exports.x = 1`.
- Nested undeclared `exports.N.X.p = 1` — assign intermediates, same as expandos.
- Control-flow assigns to `exports.platform` **union** the types (most dual-branch cases still agree).

## Other checker deltas

- **Values are not types.** `@typedef {FORWARD | BACKWARD}` where those are consts → `@typedef {typeof FORWARD | typeof BACKWARD}`.
- `arguments` in a function body does **not** imply `...args: any[]`. Write rest parameters.
- `{...number}` is an array type synonym; it does **not** mark a parameter as rest unless the parameter is `...ns`.
- Postfix `=` optional (`number=`) no longer adds `| undefined` when `strictNullChecks` is off (Strada bugfix). It still marks `@param` optional.
- With `"strict": false`, omitting arguments of type `undefined` / `unknown` / `any` is **now an error**. `void` parameters may still be omitted.
- Conflicting declarations error at **all** contributing sites (even when `skipLibCheck` hid some on 6.0).
- Scanner positions are **UTF-8** offsets, not UTF-16 (tools/API; agents reading error spans).

## The 5.x lie

“JSDoc is a sloppy dialect with `?` and `@class`.” On 7.0 it is TypeScript in comment form. If the annotations fight you, rename the file to `.ts`.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (“JavaScript Differences”). typescript-go CHANGES.md (tables above). See [sources.md](sources.md).
