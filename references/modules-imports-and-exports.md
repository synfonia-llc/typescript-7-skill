# Modules, imports, and exports

## Scope

The **language** of modules as 7.0 will type-check it: `import` / `export`, type vs value, import attributes (`with`), `#/` subpath imports, and what `nodenext` / `bundler` / `verbatimModuleSyntax` **force you to write**. Not a bundler course. Not package-manager work.

## Contents

- [Task routes](#task-routes)
- [Type vs value imports](#type-vs-value-imports)
- [with, not assert](#with-not-assert)
- [nodenext vs bundler — what you type](#nodenext-vs-bundler--what-you-type)
- [verbatimModuleSyntax](#verbatimmodulesyntax)
- [Subpath imports starting with #/](#subpath-imports-starting-with-)
- [Removed module shapes](#removed-module-shapes)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN writing `import` / `export` in `.ts` — follow the project’s effective `module` + `moduleResolution` from `tsc --showConfig`.
- USE WHEN `verbatimModuleSyntax` or `isolatedModules` errors on a type imported as a value — use `import type`.
- USE WHEN Node ESM resolution fails at runtime but `tsc` passed — you likely omitted the `.js` specifier `nodenext` requires.
- USE WHEN `import x assert { type: "json" }` fails — write `with`. 7.0 hard-errors `asserts` on static and dynamic import.
- USE WHEN `baseUrl` or `moduleResolution: node` appears in tsconfig — those flags are **removed**. [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md).

## Type vs value imports

```ts
import type { User } from "./user.ts";
import { type User as UserT, loadUser } from "./user.ts";
export type { User };
export { loadUser };
```

`import type` is erased. A value import of an interface is an error under `verbatimModuleSyntax` / `isolatedModules`. `export type { Foo as default }` is the type-only default.

`import("pkg").Type` in type position does not load a value.

## with, not assert

```ts
import data from "./data.json" with { type: "json" };
const mod = await import("./data.json", { with: { type: "json" } });
```

`assert { type: "json" }` and `import(url, { assert: … })` are **illegal** on 7.0 (6.0 deprecated both). Aligns with ECMAScript import attributes.

## nodenext vs bundler — what you type

Default `module` is **esnext**. `moduleResolution: node` / `node10` / `classic` are **gone**. Remaining practical pairings:

| You ship | Write | Specifiers |
| --- | --- | --- |
| Node (or Bun-as-Node) ESM | `"module": "nodenext"` (or `node16` if still offered — prefer `nodenext`) | Include the **emitted** extension: `from "./foo.js"` even if the source is `foo.ts`. Honor `package.json` `"type"` and `"exports"`. |
| Bundler (Vite, webpack, etc.) | `"module": "preserve"` or `"esnext"` + `"moduleResolution": "bundler"` | Often extensionless `from "./foo"`; follow the bundler. `tsc` is not the runtime. |
| Dual CJS/ESM package | `nodenext` + `exports` map | Do not guess `require` from an ESM file. |

`moduleResolution: bundler` **may** pair with `module: commonjs` (6.0 lifted the old ban) as a migration step. Prefer `preserve`+`bundler` or `nodenext` as the destination.

`esModuleInterop` cannot be `false`. Default imports from CJS `module.exports =` work; do not write `allowSyntheticDefaultImports: false`.

## verbatimModuleSyntax

When on, **every** import that is only used as a type must be `import type` / `import { type X }`. Values that are types-and-values (`class`, `enum`) may import as values. This is the shape agents should emit even if the flag is off — it survives `isolatedDeclarations` and bundlers.

## Subpath imports starting with `#/`

Node allows `package.json` `"imports"` keys that start with `#/`:

```json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

```ts
import { util } from "#/util.js";
```

TypeScript 6.0+ types this under `nodenext` and `bundler`. Do not invent `baseUrl` to fake it — `baseUrl` is removed; `paths` are relative to the tsconfig directory.

## Removed module shapes

Do not write or configure: `module: amd | umd | systemjs | none`, `outFile`, namespaces via the `module` **keyword**. `namespace` (the keyword `namespace`) still exists for declaration merging in `.d.ts`; do not use it in new app code.

CommonJS **in `.js` files** still parses, with 7.0 restrictions (no mixing `module.exports =` with `module.exports.x`; no `this` as `module.exports` alias). See [javascript-and-jsdoc.md](javascript-and-jsdoc.md).

## The 5.x lie

“`from "./foo"` without an extension is always fine, and `assert` is the JSON import.” On `nodenext` you write `.js`. On 7.0 you write `with`.

## Foot

Pin: TypeScript **7.0.2**. 6.0 blog (`#/` imports, bundler+commonjs). 7.0 blog (removed `assert`, `baseUrl`, `moduleResolution: node`). See [sources.md](sources.md).
