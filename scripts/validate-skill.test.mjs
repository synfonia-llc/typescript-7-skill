import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const validatorPath = join(scriptDirectory, "validate-skill.mjs");
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function createValidSkill() {
  const directory = mkdtempSync(join(tmpdir(), "typescript-7-skill-validation-"));
  temporaryDirectories.push(directory);
  mkdirSync(join(directory, "references"));

  writeFileSync(
    join(directory, "SKILL.md"),
    `---
name: typescript-7
description: >-
  Use when a project targets or is explicitly migrating to TypeScript 7, or a
  task concerns native tsc, tsgo, Strada, or TypeScript 7 diagnostics. Not for
  ordinary TypeScript 5/6 edits or migrations the user did not request.
---

# TypeScript 7

- USE WHEN TypeScript 7 is in scope — run \`scripts/probe.mjs\`.
- USE WHEN installing the compiler — read [install](references/install.md).
`,
    "utf8",
  );

  writeFileSync(
    join(directory, "references", "install.md"),
    `# Install

Use exact aliases:

\`"@typescript/native": "npm:typescript@7.0.2"\`

\`"typescript": "npm:@typescript/typescript6@6.0.2"\`

Node 22 includes iterator helpers; verify every other library feature against
the project's minimum runtime. Import assertions use \`assert { ... }\` in old
source and import attributes use \`with { ... }\` in TypeScript 7.
`,
    "utf8",
  );

  mkdirSync(join(directory, "scripts"));
  writeFileSync(
    join(directory, "scripts", "probe.mjs"),
    `// local-only probe
const KNOWLEDGE_PIN = "7.0.2";
const STRADA_PIN = "6.0.2";
`,
    "utf8",
  );
  return directory;
}

function runValidator(skillDirectory) {
  const result = spawnSync(
    process.execPath,
    [validatorPath, "--json", skillDirectory],
    { encoding: "utf8", timeout: 5_000 },
  );

  let payload;
  try {
    payload = JSON.parse(result.stdout.trim());
  } catch {
    payload = undefined;
  }

  return { payload, status: result.status, stderr: result.stderr, stdout: result.stdout };
}

function rewrite(filePath, transform) {
  const current = readFileSync(filePath, "utf8");
  writeFileSync(filePath, transform(current), "utf8");
}

test("accepts a precise TypeScript 7 skill with valid direct references", () => {
  const skill = createValidSkill();

  const result = runValidator(skill);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.payload, { issues: [], ok: true });
});

test("rejects a broken relative Markdown link", () => {
  const skill = createValidSkill();
  rewrite(join(skill, "SKILL.md"), (text) => `${text}\n[missing](references/missing.md)\n`);

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "broken-relative-link"));
});

test("rejects a broken local Markdown heading fragment", () => {
  const skill = createValidSkill();
  rewrite(
    join(skill, "SKILL.md"),
    (text) => `${text}\n[bad heading](references/install.md#missing-heading)\n`,
  );

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "broken-markdown-anchor"));
});

test("rejects package runners for tsc after the probe has resolved the binary", () => {
  for (const command of [
    "npx tsc --version",
    'npm exec --offline --call "tsc --version"',
    "pnpm dlx tsc --version",
    "pnpm exec tsc --version",
    "yarn dlx tsc --version",
    "yarn exec tsc --version",
    "bunx tsc --version",
    "bun x tsc --version",
  ]) {
    const skill = createValidSkill();
    rewrite(join(skill, "references", "install.md"), (text) => `${text}\nRun \`${command}\`.\n`);

    const result = runValidator(skill);

    assert.equal(result.status, 1, `${command}: ${result.stdout}\n${result.stderr}`);
    assert.ok(
      result.payload?.issues.some((issue) => issue.code === "unsafe-package-runner-tsc"),
      command,
    );
  }
});

test("rejects shell-true execution in the path-sensitive compiler probe", () => {
  const skill = createValidSkill();
  rewrite(
    join(skill, "scripts", "probe.mjs"),
    (text) => `${text}\nspawnSync(compilerPath, [], { shell: true });\n`,
  );

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "probe-shell-execution"));
});

test("rejects knowledge pins that drift across skill files", () => {
  const skill = createValidSkill();
  rewrite(
    join(skill, "SKILL.md"),
    (text) => `${text}\nThis page incorrectly claims knowledge pin 7.0.3.\n`,
  );

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "inconsistent-knowledge-pin"));
});

test("rejects floating compiler aliases in a skill pinned to 7.0.2", () => {
  const skill = createValidSkill();
  rewrite(
    join(skill, "references", "install.md"),
    (text) => text.replace("npm:typescript@7.0.2", "npm:typescript@^7.0.2"),
  );

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "floating-knowledge-pin"));
});

test("rejects every semver range operator around a claimed exact knowledge pin", () => {
  for (const operator of ["~", ">=", "<=", ">", "<"]) {
    const skill = createValidSkill();
    rewrite(
      join(skill, "references", "install.md"),
      (text) => text.replace("npm:typescript@7.0.2", `npm:typescript@${operator}7.0.2`),
    );

    const result = runValidator(skill);

    assert.equal(result.status, 1, `${operator}: ${result.stdout}\n${result.stderr}`);
    assert.ok(
      result.payload?.issues.some((issue) => issue.code === "floating-knowledge-pin"),
      operator,
    );
  }
});

test("rejects calling import assertions asserts", () => {
  const skill = createValidSkill();
  rewrite(
    join(skill, "references", "install.md"),
    (text) => `${text}\nThe \`asserts\` syntax on imports is removed.\n`,
  );

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "import-assertion-terminology"));
});

test("rejects the false claim that Node 22 lacks iterator helpers", () => {
  const skill = createValidSkill();
  rewrite(
    join(skill, "references", "install.md"),
    (text) => `${text}\nNode 22 does not implement Iterator helpers.\n`,
  );

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "node22-iterator-helpers"));
});

test("rejects a trigger that hijacks ordinary TypeScript work", () => {
  const skill = createValidSkill();
  rewrite(
    join(skill, "SKILL.md"),
    (text) => text.replace(
      /Use when a project targets[\s\S]*?user did not request\./,
      "Use when writing or editing TypeScript.",
    ),
  );

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "overbroad-trigger"));
});

test("rejects a malformed activation evaluation corpus", () => {
  const skill = createValidSkill();
  mkdirSync(join(skill, "evals"));
  writeFileSync(join(skill, "evals", "activation-cases.json"), "{ nope", "utf8");

  const result = runValidator(skill);

  assert.equal(result.status, 1);
  assert.ok(result.payload?.issues.some((issue) => issue.code === "invalid-eval-corpus"));
});
