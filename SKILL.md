---
name: typescript-7
description: "Use when a repository explicitly targets TypeScript 7 / TS7, the user requests a TypeScript 7 migration, or a task concerns native tsc/LSP, TypeScript 7 diagnostics or defaults, tsgo, native-preview, Corsa, Strada, the missing TypeScript 7.0 compiler API, or tools that import \"typescript\" in a TypeScript 7 project. Not for ordinary TypeScript 5/6 work or migrations the user did not request."
license: MIT
compatibility: Requires Node.js to run scripts/probe.mjs against a project-local TypeScript compiler. Works with Agent Skills hosts including Cursor, Claude Code, Codex, GitHub Copilot, and Gemini CLI.
icon: code
color: blue
metadata:
  author: Synfonia LLC
  pin: typescript@7.0.2
  homepage: https://synfonia.io
  keywords: TypeScript 7, TS7, tsgo, Corsa, Strada, native-preview, createProgram, Agent Skills
---

# TypeScript 7

Apply TypeScript 7 guidance only after establishing that TypeScript 7 is in
scope. This skill's knowledge pin is **TypeScript 7.0.2** and VS Code/Cursor
extension **TypeScriptTeam.native-preview 0.20260708.2**. TypeScript 7.0 is the
native Go port of the TypeScript 6.0 checker; it is not a new type system.

## Establish scope first

From the project directory, run:

```text
node <this-skill-root>/scripts/probe.mjs --json
```

Do not read the probe source merely to use it. Interpret its result literally:

- `ready` — use the routed TypeScript 7 guidance below.
- `version-difference`, `sidecar-version-difference`,
  `sidecar-layout-unverified`, or `compiler-layout-unsupported` — stop
  applying pin-specific advice; inspect the installed version's help/release
  notes, the consumer's supported compiler range/import path, or the
  repository's trusted local compiler script before proceeding.
- `invalid-package-json` — repair the package manifest before making any
  compiler, source, or configuration change.
- `declared-not-installed`, `compiler-unusable`, `compiler-mismatch`, or any
  `sidecar-unusable`, `sidecar-mismatch`, or `declared-sidecar-*` status —
  repair or install the already-declared dependency before changing source,
  tsconfig, or API-based tooling.
- `uninitialized` or `not-targeting-typescript-7` — do **not** initialize,
  install, or migrate anything unless the user explicitly authorized that
  change.

The probe resolves only the project-local compiler. It never asks a package
manager or registry to find a package named `tsc`.

## Non-negotiable rules

- Treat the verified project-local `tsc` as the compile and declaration-emit
  authority. Invoke the absolute `compilerPath` returned by a `ready` probe
  directly for ad hoc CLI inspection. Use an existing package script only
  after confirming it reaches that compiler. Do not put a package-name runner
  back between the agent and the already-resolved executable.
- TypeScript 7.0 has no stable programmatic `import "typescript"` API. Tools
  that need that API use the TypeScript 6.0 Strada sidecar; do not invent a
  native API. See [no-compiler-api.md](references/no-compiler-api.md).
- TypeScript 7.0 enforces the TypeScript 6.0 defaults and removals. It cannot
  escape them with `ignoreDeprecations: "6.0"`. See
  [tsconfig-defaults-and-breaks.md](references/tsconfig-defaults-and-breaks.md).
- A bundled `lib` declaration proves a type exists, not that the runtime
  implements it. Check the project's minimum runtime feature by feature. Node
  22 already includes iterator helpers, `Array.fromAsync`, and Set methods; it
  does not thereby implement every ES2025 or ESNext API. See
  [lib-inventory.md](references/lib-inventory.md).
- Editor language-server state is independent of CLI correctness. Never fix a
  red CLI typecheck by toggling the editor server. See
  [editor-lsp-and-vsix.md](references/editor-lsp-and-vsix.md).
- Open the one reference that owns the current job. Do not load the entire
  reference tree.

## Route the current job

### Start, write, migrate, or diagnose

- Write or edit `.ts`, `.tsx`, or `.d.ts` in a verified 7.x project:
  [writing-typescript.md](references/writing-typescript.md).
- Migrate a project to 7.0 when the user requested it:
  [migrating-to-7.md](references/migrating-to-7.md).
- Diagnose compiler, emit, tool-loading, or editor disagreement:
  [diagnosing-failures.md](references/diagnosing-failures.md).

### Language

- Everyday values, primitives, arrays, tuples, `any`, `unknown`, and `never`:
  [types-everyday.md](references/types-everyday.md).
- Narrowing and control flow:
  [narrowing-and-control-flow.md](references/narrowing-and-control-flow.md).
- Functions, overloads, rest parameters, and `this`:
  [functions-and-call-signatures.md](references/functions-and-call-signatures.md).
- Object types, interfaces, optional properties, and index signatures:
  [objects-and-interfaces.md](references/objects-and-interfaces.md).
- Unions, intersections, discriminants, and exhaustiveness:
  [unions-intersections-and-never.md](references/unions-intersections-and-never.md).
- Generics, constraints, inference, and variance:
  [generics-inference-and-variance.md](references/generics-inference-and-variance.md).
- `keyof`, indexed access, mapped types, and conditional types:
  [type-manipulation.md](references/type-manipulation.md).
- Template-literal types and the TypeScript 7 Unicode `infer` change:
  [template-literals-and-infer.md](references/template-literals-and-infer.md).
- Classes and `this`:
  [classes-and-this.md](references/classes-and-this.md).
- TC39 decorators and `Symbol.metadata`:
  [decorators.md](references/decorators.md).
- Modules, type-only imports, import attributes, and resolution modes:
  [modules-imports-and-exports.md](references/modules-imports-and-exports.md).
- JSX/TSX syntax and `compilerOptions.jsx`:
  [jsx-syntax.md](references/jsx-syntax.md).
- `using`, `await using`, and disposables:
  [using-and-disposables.md](references/using-and-disposables.md).
- Checked JavaScript and JSDoc:
  [javascript-and-jsdoc.md](references/javascript-and-jsdoc.md).
- Declaration files and `isolatedDeclarations`:
  [declaration-files.md](references/declaration-files.md).
- Standard utility types:
  [utility-types.md](references/utility-types.md).

### Compiler and editor

- Product names, version relationships, and binary identity:
  [start-here-and-versioning.md](references/start-here-and-versioning.md).
- Exact installation, dual-stack aliases, CI, and nightlies:
  [install-and-dual-stack.md](references/install-and-dual-stack.md).
- Source-affecting compiler options:
  [compiler-options.md](references/compiler-options.md).
- CLI, build, watch, and native parallelism:
  [cli-watch-and-parallelism.md](references/cli-watch-and-parallelism.md).
- Project references and solution builds:
  [project-references-and-build.md](references/project-references-and-build.md).

### Bundled libraries and runtime boundaries

- `lib`, `target`, `types`, DOM/Node separation, and bundled lib names:
  [lib-inventory.md](references/lib-inventory.md).
- ES2025 library surfaces:
  [lib-es2025.md](references/lib-es2025.md).
- ESNext library surfaces:
  [lib-esnext.md](references/lib-esnext.md).

### Provenance

- Knowledge pin, primary sources, live verification, and license boundaries:
  [sources.md](references/sources.md).

## When local evidence differs

If the installed compiler differs from 7.0.2 or a routed page is silent:

1. State the exact version difference.
2. Use the installed compiler's `--help` or `--showConfig`; do not invent flags.
3. Consult the official TypeScript release note or typescript-go `CHANGES.md`
   for the affected behavior.
4. Keep TypeScript 6 advice isolated to the Strada sidecar. Never silently
   substitute it for TypeScript 7 behavior.
5. Verify runtime support separately from TypeScript's bundled declarations.
