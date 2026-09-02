# Install and dual-stack

## Scope

How to get `tsc` 7.0.2, how to keep `tsc6` + the Strada API for tools, nightlies. Not tsconfig flag lists ([tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md)).

## Contents

- [Task routes](#task-routes)
- [GA install](#ga-install)
- [Dual-stack (tsc + tsc6)](#dual-stack-tsc--tsc6)
- [Nightlies](#nightlies)
- [CI](#ci)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN adding the skill's pinned TypeScript 7 to a repo — install exact `typescript@7.0.2` unless a tool still `import`s `"typescript"`, then dual-stack.
- USE WHEN eslint / ts-morph / a webpack loader breaks after the upgrade — alias `typescript` to 6 and `@typescript/native` to 7. Do not polyfill a 7 API.
- USE WHEN someone installs `@typescript/native-preview` on purpose for GA — that was the preview channel. GA is the `typescript` package; nightlies are `typescript@next`.

## GA install

```sh
npm install -D --save-exact typescript@7.0.2
node <skill-root>/scripts/probe.mjs --json
<compilerPath-from-probe> --version
```

That is the native `tsc`. Run the skill `scripts/probe.mjs` from the project directory after install.

The 7.0.2 package root export is `lib/version.cjs`, not the Strada compiler. Tools that `import "typescript"` still need the 6.0 alias below.

## Dual-stack (tsc + tsc6)

7.0 has **no** stable `import "typescript"` API. Microsoft’s documented alias:

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@7.0.2",
    "typescript": "npm:@typescript/typescript6@6.0.2"
  }
}
```

Equivalent exact install:

```sh
npm install -D --save-exact "@typescript/native@npm:typescript@7.0.2" "typescript@npm:@typescript/typescript6@6.0.2"
```

- `tsc` — 7.0 native (from `@typescript/native` when both exist; **verify with `--version`**, do not assume npm alias order).
- `tsc6` — 6.0 JS compiler from `@typescript/typescript6`.
- `import "typescript"` — Strada 6.0 API.

Re-run the probe after installation. For a declared dual stack, `ready` means
both executables were found and reported the pinned major/version; the JSON
returns `compilerPath` for native 7 and `stradaCompilerPath` for Strada 6.

If the probe still sees a 6.x `tsc` after dual-stack installation, the install is
inconsistent. Repair the lockfile or installed dependencies and re-probe; do
not ask a registry runner for another `tsc` or guess a package-internal path.

## Nightlies

```sh
npm install -D typescript@next
```

Preview-era `@typescript/native-preview` + `tsgo` are **not** the GA path. Use them only when the user asked for a nightly of the Go compiler and understands they are not 7.0.2.

## CI

Typecheck with **7** through a verified project script, or invoke the
`compilerPath` from a `ready` probe directly with `--pretty false`. If eslint
must run, keep the Strada alias and run eslint against 6. Do not use the
`stradaCompilerPath` as the merge-gate typecheck unless the user is staying on
6.

`--checkers` default is 4. On small CI machines use `--checkers 1` or `--singleThreaded` ([cli-watch-and-parallelism.md](cli-watch-and-parallelism.md)).

## The 5.x lie

“`npm i -D typescript@latest` always gives a JS `tsc` I can `import`.” On 7, `tsc` is native and the importable API is **missing** unless you dual-stack.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (“Running Side-by-Side with TypeScript 6.0”, nightlies). See [sources.md](sources.md), [no-compiler-api.md](no-compiler-api.md).
