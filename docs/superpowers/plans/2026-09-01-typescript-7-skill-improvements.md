# TypeScript 7 Skill Improvements Implementation Plan

> **For agentic workers:** Execute the tasks in order. Use test-driven development for executable behavior and preserve `C:\dev\skills\typescript-7-skill` as the source behind the installed junction.

**Goal:** Deliver a precise, technically current, locally verifiable TypeScript 7.0.2 skill that improves agent behavior without hijacking TypeScript 5/6 work.

**Architecture:** Keep the resident trigger and body subtractive, retain detailed references on demand, and move compiler discovery plus maintenance invariants into dependency-free Node.js scripts. The compiler probe reports project state without registry acquisition; tests create isolated temporary projects and fake local compiler executables.

**Tech Stack:** Markdown Agent Skills, Node.js 22+ ESM scripts, `node:test`, PowerShell verification, Codex skill validator.

---

### Task 1: Freeze the current failure cases

**Files:**
- Create: `scripts/probe.test.mjs`
- Create: `scripts/validate-skill.test.mjs`

- [ ] Write isolated tests proving an uninitialized directory never causes registry lookup and is classified as uninitialized.
- [ ] Write tests for intentional TypeScript 5/6, direct TypeScript 7, TypeScript 7 declared-but-missing, dual-stack, and mismatched local compiler states.
- [ ] Write validator tests for a valid minimal skill, broken internal link, mismatched pin, unsafe raw `npx tsc`, and overbroad TypeScript trigger wording.
- [ ] Run both test files and record the expected RED failures because the new contracts are not implemented.

### Task 2: Implement the project-local compiler probe

**Files:**
- Modify: `scripts/probe.mjs`
- Test: `scripts/probe.test.mjs`

- [ ] Implement upward project-root/package discovery without network access.
- [ ] Resolve and execute only a project-local `tsc` binary.
- [ ] Parse direct and npm-alias dependency declarations without treating intentional TypeScript 5/6 as a migration error.
- [ ] Emit stable human-readable diagnostics and a `--json` result.
- [ ] Run the focused probe tests to GREEN.
- [ ] Exercise the probe in `C:\dev\edgar-xbrl-ts` and confirm it reports uninitialized without mentioning `tsc@2.0.4`.

### Task 3: Implement deterministic skill validation

**Files:**
- Create: `scripts/validate-skill.mjs`
- Test: `scripts/validate-skill.test.mjs`

- [ ] Parse the skill frontmatter and require the canonical name plus a discriminating TypeScript 7 trigger boundary.
- [ ] Resolve every relative Markdown link and require every directly routed reference to exist.
- [ ] Enforce the 7.0.2/6.0.2 pin policy in install examples.
- [ ] Reject known regressions: registry-searching compiler commands in pre-install/probe instructions, `asserts` used to name import assertions, and the false Node 22 iterator-helper claim.
- [ ] Run the validator tests to GREEN.

### Task 4: Refactor the trigger and resident instructions

**Files:**
- Modify: `SKILL.md`
- Modify: `README.md`

- [ ] Replace the workflow-summary description with trigger conditions and a TypeScript 5/6 boundary clause.
- [ ] Recast standing rules as atomic imperatives.
- [ ] Route by task and by visible symptom while preserving direct links from `SKILL.md`.
- [ ] Require the probe only when TypeScript 7 is in scope and define safe handling for uninitialized/older projects.
- [ ] Keep TypeScript 7 native CLI authoritative and TypeScript 6 API compatibility narrow.
- [ ] Align the human README without duplicating the complete reference corpus.

### Task 5: Correct technical references

**Files:**
- Modify: `references/writing-typescript.md`
- Modify: `references/install-and-dual-stack.md`
- Modify: `references/cli-watch-and-parallelism.md`
- Modify: `references/compiler-options.md`
- Modify: `references/diagnosing-failures.md`
- Modify: `references/editor-lsp-and-vsix.md`
- Modify: `references/lib-inventory.md`
- Modify: `references/lib-es2025.md`
- Modify: `references/migrating-to-7.md`
- Modify: `references/modules-imports-and-exports.md`
- Modify: `references/sources.md`
- Modify: `references/start-here-and-versioning.md`
- Modify: any additional reference surfaced by exact searches

- [ ] Replace ambiguous/raw compiler invocation advice with verified project-local or post-install commands.
- [ ] Use exact version pins for the pinned 7.0.2/6.0.2 path and clearly label `next` as drifting.
- [ ] Correct Node 22 iterator-helper and other runtime/lib wording.
- [ ] Correct import assertion terminology from `asserts` to `assert` without changing assertion-function guidance.
- [ ] Preserve the no-TypeScript-7.0-stable-API boundary and unstable-export warning.
- [ ] Re-run focused tests and the maintenance validator.

### Task 6: Verify the installed skill behavior

**Files:**
- Modify only if verification reveals a specific defect.

- [ ] Run the Codex `quick_validate.py` validator in UTF-8 mode through `C:\Users\Brian\.codex\skills\typescript-7`.
- [ ] Run all Node script tests and the maintenance validator through both source and junction paths.
- [ ] Check every internal Markdown link and directly routed reference.
- [ ] Run realistic activation/non-activation and toolchain reasoning probes with independent agents where available.
- [ ] Inspect the complete Git diff for accidental tutorial expansion, stale claims, or unrelated edits.
- [ ] Confirm the junction still targets the source repository and the working tree contains only intentional changes.

