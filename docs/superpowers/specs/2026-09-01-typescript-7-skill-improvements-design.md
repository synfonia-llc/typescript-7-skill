# TypeScript 7 Skill Improvements Design

## Goal

Make `typescript-7` a precise, low-context agent interface for TypeScript 7.0.2 work: it must activate for real TypeScript 7 tasks, stay out of intentional TypeScript 5/6 work, direct agents to the correct native/compatibility toolchain, and prove the installed compiler without invoking an unrelated registry package.

## Design decisions

### Trigger surface

The frontmatter description will describe only when the skill should activate. It will cover projects that already target TypeScript 7, explicit migrations to TypeScript 7, native `tsc`/LSP diagnostics, the Strada compatibility boundary, and TypeScript 7-specific language or configuration behavior. It will explicitly exclude ordinary TypeScript 5/6 edits and migrations the user did not request.

### Resident body

`SKILL.md` will retain only standing rules and routing. It will:

- require a local compiler probe only when TypeScript 7 is actually in scope;
- forbid silently upgrading an intentional TypeScript 5/6 project;
- make native TypeScript 7 the authoritative compiler and declaration emitter;
- reserve TypeScript 6.0.2 for tools that require the JavaScript compiler API;
- distinguish TypeScript library declarations from minimum-runtime support feature by feature;
- route one task to one directly linked reference, with symptom routes for common misdiagnoses.

Comprehensive references remain bundled because unread files do not consume agent context. Generic TypeScript material will not be the default route when existing model knowledge and the project compiler are sufficient.

### Deterministic probe

`scripts/probe.mjs` will inspect only the current project and project-local installations. It will not allow `npx` to search the registry for a command named `tsc`. It will classify at least:

- uninitialized directory;
- intentional TypeScript 5/6 project;
- TypeScript 7 declared but not installed;
- direct TypeScript 7 installation;
- supported TypeScript 7 plus TypeScript 6 dual-stack installation;
- declared/runtime compiler mismatch;
- TypeScript 7 minor-version difference from the skill's 7.0.2 knowledge pin.

Diagnostics will identify the observed state and next safe action. A machine-readable mode will support deterministic tests without making normal output hostile to humans or agents.

### Accuracy corrections

The skill will use exact `7.0.2` and `6.0.2` examples when promising a pinned environment, call import-attribute syntax `assert` rather than `asserts`, and remove the false claim that Node 22 lacks iterator helpers. Runtime guidance will require verification against the declared minimum Node version rather than treating a TypeScript `lib` as runtime evidence.

### Maintenance validation

A dependency-free validation script will check the mechanical invariants that prose cannot enforce reliably: valid skill frontmatter, internal Markdown-link resolution, directly routed references, pin consistency, and absence of known dangerous command/wording regressions. It will not attempt to grade writing quality.

## Verification

Verification will include:

- RED/GREEN tests for each probe state and diagnostic contract;
- RED/GREEN tests for the maintenance validator;
- the standard Codex skill validator through the installed junction;
- internal-link and reference-routing checks;
- direct execution through both the source path and junction path;
- realistic agent-facing prompts covering correct activation, intentional non-activation, the missing TypeScript 7 API, Node 22 runtime claims, and an uninitialized project;
- final review for context weight, contradictions, stale pins, and unsafe registry fallback.

## Boundaries

- Keep `C:\dev\skills\typescript-7-skill` as the only editable source; the existing Codex path remains a junction.
- Do not use `skill-foundry` or `skill-workbench`.
- Do not turn the skill into a React/framework/ESLint-rule-authoring guide.
- Do not invent a TypeScript 7.0 stable programmatic API.
- Do not migrate a TypeScript 5/6 project without explicit user authorization.

