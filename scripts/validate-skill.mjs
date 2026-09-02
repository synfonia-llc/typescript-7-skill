#!/usr/bin/env node
/**
 * Validate mechanical invariants of the TypeScript 7 skill. This script does
 * not grade prose quality; it catches regressions that are deterministic.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const positionalArguments = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const skillDirectory = resolve(positionalArguments[0] ?? join(scriptDirectory, ".."));
const jsonOutput = process.argv.includes("--json");
const issues = [];

function addIssue(code, filePath, source, index, message) {
  const line = source.slice(0, Math.max(0, index)).split(/\r?\n/).length;
  issues.push({
    code,
    file: relative(skillDirectory, filePath).replaceAll("\\", "/"),
    line,
    message,
  });
}

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(path));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") files.push(path);
  }
  return files;
}

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1] ?? null;
}

function descriptionFromFrontmatter(value) {
  if (value === null) return null;
  const lines = value.split(/\r?\n/);
  const start = lines.findIndex((line) => /^description\s*:/.test(line));
  if (start < 0) return null;
  const collected = [lines[start].replace(/^description\s*:\s*>?-?\s*/, "")];
  for (const line of lines.slice(start + 1)) {
    if (/^[A-Za-z0-9_-]+\s*:/.test(line)) break;
    collected.push(line.trim());
  }
  return collected.filter(Boolean).join(" ");
}

function checkRegex(filePath, source, code, pattern, message) {
  const match = pattern.exec(source);
  if (match !== null) addIssue(code, filePath, source, match.index, message);
}

const headingAnchorCache = new Map();

function markdownHeadingAnchors(filePath) {
  const cached = headingAnchorCache.get(filePath);
  if (cached !== undefined) return cached;
  const source = readFileSync(filePath, "utf8");
  const anchors = new Set();
  const occurrences = new Map();
  for (const match of source.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const base = match[1]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]*>/g, "")
      .replace(/[`*_~]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s/g, "-");
    if (base.length === 0) continue;
    const occurrence = occurrences.get(base) ?? 0;
    anchors.add(occurrence === 0 ? base : `${base}-${occurrence}`);
    occurrences.set(base, occurrence + 1);
  }
  headingAnchorCache.set(filePath, anchors);
  return anchors;
}

const skillPath = join(skillDirectory, "SKILL.md");
if (!existsSync(skillPath)) {
  issues.push({
    code: "missing-skill-entrypoint",
    file: "SKILL.md",
    line: 1,
    message: "SKILL.md is required.",
  });
} else {
  const source = readFileSync(skillPath, "utf8");
  const metadata = frontmatter(source);
  if (metadata === null) {
    addIssue("invalid-frontmatter", skillPath, source, 0, "SKILL.md needs a closed YAML frontmatter block.");
  } else {
    if (!/^name:\s*typescript-7\s*$/m.test(metadata)) {
      addIssue("invalid-skill-name", skillPath, source, 0, "The skill name must be typescript-7.");
    }
    const description = descriptionFromFrontmatter(metadata) ?? "";
    if (!/TypeScript 7/i.test(description) || !/Not for/i.test(description) || !/TypeScript 5\/6/i.test(description)) {
      addIssue(
        "missing-trigger-boundary",
        skillPath,
        source,
        source.indexOf("description:"),
        "The description must trigger on TypeScript 7 and exclude ordinary TypeScript 5/6 work.",
      );
    }
    if (/Use when writing or editing TypeScript\b/i.test(description)) {
      addIssue(
        "overbroad-trigger",
        skillPath,
        source,
        source.indexOf("description:"),
        "Do not activate this skill for every TypeScript edit.",
      );
    }
  }
}

const inspectedMarkdown = [
  ...(existsSync(skillPath) ? [skillPath] : []),
  ...(existsSync(join(skillDirectory, "README.md")) ? [join(skillDirectory, "README.md")] : []),
  ...markdownFiles(join(skillDirectory, "references")),
];

const routedReferences = new Set();
for (const filePath of inspectedMarkdown) {
  const source = readFileSync(filePath, "utf8");

  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:https?:|mailto:)/i.test(rawTarget)) continue;
    const fragmentOffset = rawTarget.indexOf("#");
    const pathPart = fragmentOffset < 0 ? rawTarget : rawTarget.slice(0, fragmentOffset);
    const fragmentPart = fragmentOffset < 0 ? "" : rawTarget.slice(fragmentOffset + 1);
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathPart);
    } catch {
      decodedPath = pathPart;
    }
    const target = decodedPath.length === 0
      ? filePath
      : resolve(dirname(filePath), decodedPath);
    if (!existsSync(target)) {
      addIssue(
        "broken-relative-link",
        filePath,
        source,
        match.index,
        `Relative link does not exist: ${rawTarget}`,
      );
    } else if (fragmentPart.length > 0 && extname(target).toLowerCase() === ".md") {
      let decodedFragment;
      try {
        decodedFragment = decodeURIComponent(fragmentPart).toLowerCase();
      } catch {
        decodedFragment = fragmentPart.toLowerCase();
      }
      if (!markdownHeadingAnchors(target).has(decodedFragment)) {
        addIssue(
          "broken-markdown-anchor",
          filePath,
          source,
          match.index,
          `Markdown heading fragment does not exist: ${rawTarget}`,
        );
      }
    }
    if (filePath === skillPath && target.startsWith(resolve(skillDirectory, "references"))) {
      routedReferences.add(target);
    }
  }

  checkRegex(
    filePath,
    source,
    "unsafe-package-runner-tsc",
    /\b(?:npx|bunx|npm\s+(?:exec|x)|pnpm\s+(?:dlx|exec)|yarn\s+(?:dlx|exec)|bun\s+x)\b[^\r\n]{0,160}\btsc6?\b/i,
    "Invoke the compilerPath returned by the local probe; package runners add resolution overhead and can select the unrelated tsc package.",
  );
  checkRegex(
    filePath,
    source,
    "floating-knowledge-pin",
    /(?:npm:typescript|@typescript\/typescript6|\btypescript)@(?:\^|~|>=|<=|>|<)\s*(?:7\.0\.2|6\.0\.2)\b/i,
    "Examples for the pinned environment must use exact 7.0.2/6.0.2 versions.",
  );
  checkRegex(
    filePath,
    source,
    "import-assertion-terminology",
    /\basserts\b[^\r\n]{0,50}\bimports?\b/i,
    "The removed import syntax is assert { ... }; asserts is the assertion-function keyword.",
  );
  checkRegex(
    filePath,
    source,
    "node22-iterator-helpers",
    /Node 22[^\r\n]*(?:does not|doesn't|lacks)[^\r\n]*Iterator helpers/i,
    "Node 22 shipped iterator helpers; verify other lib features individually.",
  );
}

const referenceDirectory = join(skillDirectory, "references");
if (existsSync(referenceDirectory) && existsSync(skillPath)) {
  for (const entry of readdirSync(referenceDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== ".md") continue;
    const path = resolve(referenceDirectory, entry.name);
    if (!routedReferences.has(path)) {
      issues.push({
        code: "unrouted-reference",
        file: `references/${entry.name}`,
        line: 1,
        message: "Every reference must be linked directly from SKILL.md.",
      });
    }
  }
}

const probePath = join(skillDirectory, "scripts", "probe.mjs");
if (existsSync(probePath) && statSync(probePath).isFile()) {
  const source = readFileSync(probePath, "utf8");
  checkRegex(
    probePath,
    source,
    "probe-registry-fallback",
    /\b(?:npx|bunx|npm\s+(?:exec|x)|pnpm\s+(?:dlx|exec)|yarn\s+(?:dlx|exec)|bun\s+x)\b/i,
    "The compiler probe must resolve only a project-local binary.",
  );
  checkRegex(
    probePath,
    source,
    "probe-shell-execution",
    /\bshell\s*:\s*true\b/i,
    "The path-sensitive compiler probe must not concatenate a project-derived path into a shell command.",
  );

  const knowledgePin = source.match(/\bconst\s+KNOWLEDGE_PIN\s*=\s*["']([^"']+)["']/)?.[1];
  const stradaPin = source.match(/\bconst\s+STRADA_PIN\s*=\s*["']([^"']+)["']/)?.[1];
  if (knowledgePin === undefined || stradaPin === undefined) {
    addIssue(
      "missing-canonical-pin",
      probePath,
      source,
      0,
      "The probe must declare canonical KNOWLEDGE_PIN and STRADA_PIN constants.",
    );
  } else {
    const pinFiles = [
      ...inspectedMarkdown,
      join(skillDirectory, "evals", "activation-cases.json"),
    ].filter((filePath) => existsSync(filePath) && statSync(filePath).isFile());
    for (const filePath of pinFiles) {
      const pinSource = readFileSync(filePath, "utf8");
      for (const match of pinSource.matchAll(/\b7\.0\.\d+\b/g)) {
        if (match[0] !== knowledgePin) {
          addIssue(
            "inconsistent-knowledge-pin",
            filePath,
            pinSource,
            match.index,
            `TypeScript 7 knowledge pin ${match[0]} disagrees with probe pin ${knowledgePin}.`,
          );
        }
      }
      for (const match of pinSource.matchAll(/\b6\.0\.\d+\b/g)) {
        if (match[0] !== stradaPin) {
          addIssue(
            "inconsistent-strada-pin",
            filePath,
            pinSource,
            match.index,
            `TypeScript 6 sidecar pin ${match[0]} disagrees with probe pin ${stradaPin}.`,
          );
        }
      }
    }
  }
}

const evaluationPath = join(skillDirectory, "evals", "activation-cases.json");
if (existsSync(evaluationPath) && statSync(evaluationPath).isFile()) {
  const source = readFileSync(evaluationPath, "utf8");
  let corpus;
  try {
    corpus = JSON.parse(source);
  } catch (error) {
    addIssue(
      "invalid-eval-corpus",
      evaluationPath,
      source,
      0,
      `activation-cases.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (corpus !== undefined) {
    const cases = Array.isArray(corpus?.cases) ? corpus.cases : null;
    if (corpus?.schemaVersion !== 1 || corpus?.knowledgePin !== "7.0.2" || cases === null || cases.length === 0) {
      addIssue(
        "invalid-eval-corpus",
        evaluationPath,
        source,
        0,
        "The activation corpus requires schemaVersion 1, knowledgePin 7.0.2, and at least one case.",
      );
    } else {
      const identifiers = new Set();
      let hasActivationCase = false;
      let hasNonActivationCase = false;
      for (const evaluation of cases) {
        const arraysAreValid = [
          evaluation?.expectedRoutes,
          evaluation?.requiredBehaviors,
          evaluation?.forbiddenBehaviors,
        ].every((value) => Array.isArray(value) && value.every((entry) => typeof entry === "string"));
        const identifierIsValid =
          typeof evaluation?.id === "string" &&
          evaluation.id.length > 0 &&
          !identifiers.has(evaluation.id);
        if (
          !identifierIsValid ||
          typeof evaluation?.prompt !== "string" ||
          evaluation.prompt.length === 0 ||
          typeof evaluation?.shouldActivate !== "boolean" ||
          !arraysAreValid
        ) {
          addIssue(
            "invalid-eval-case",
            evaluationPath,
            source,
            0,
            "Every activation case needs a unique id, prompt, boolean shouldActivate, and three string-array expectation fields.",
          );
          continue;
        }
        identifiers.add(evaluation.id);
        hasActivationCase ||= evaluation.shouldActivate;
        hasNonActivationCase ||= !evaluation.shouldActivate;
        for (const route of evaluation.expectedRoutes) {
          if (!/^references\/[A-Za-z0-9._-]+\.md$/.test(route) || !existsSync(join(skillDirectory, route))) {
            addIssue(
              "invalid-eval-route",
              evaluationPath,
              source,
              0,
              `Evaluation route does not name an existing bundled reference: ${route}`,
            );
          }
        }
      }
      if (!hasActivationCase || !hasNonActivationCase) {
        addIssue(
          "incomplete-eval-boundary",
          evaluationPath,
          source,
          0,
          "The activation corpus must contain both activation and intentional non-activation cases.",
        );
      }
    }
  }
}

issues.sort((left, right) =>
  left.file.localeCompare(right.file) ||
  left.line - right.line ||
  left.code.localeCompare(right.code),
);

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify({ issues, ok: issues.length === 0 })}\n`);
} else if (issues.length === 0) {
  process.stdout.write("TypeScript 7 skill validation passed.\n");
} else {
  for (const issue of issues) {
    process.stderr.write(`${issue.file}:${issue.line} [${issue.code}] ${issue.message}\n`);
  }
}

process.exitCode = issues.length === 0 ? 0 : 1;
