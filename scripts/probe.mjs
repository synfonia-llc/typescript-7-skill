#!/usr/bin/env node
/**
 * Execute this script from a TypeScript project. Do not load its source merely
 * to use it. The probe resolves only a project-local compiler and never asks a
 * package manager to search a registry for `tsc`.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const KNOWLEDGE_PIN = "7.0.2";
const STRADA_PIN = "6.0.2";
const COMPILER_PATH_ENVIRONMENT_KEY = "TYPESCRIPT_7_SKILL_COMPILER_PATH";
const requestDirectory = resolve(process.cwd());
const jsonOutput = process.argv.includes("--json");

function findProjectDirectory(startDirectory) {
  let directory = startDirectory;
  let nearestPackageDirectory = null;
  while (true) {
    const packagePath = join(directory, "package.json");
    if (existsSync(packagePath)) {
      nearestPackageDirectory ??= directory;
      const parsed = readPackageJson(packagePath);
      if (parsed.error !== undefined && directory === nearestPackageDirectory) {
        return directory;
      }
      if (parsed.value !== undefined) {
        const dependencies = dependencyMap(parsed.value);
        if (["typescript", "@typescript/native", "@typescript/typescript6"].some(
          (name) => Object.hasOwn(dependencies, name),
        )) {
          return directory === nearestPackageDirectory ||
            workspaceRootOwns(directory, nearestPackageDirectory)
            ? directory
            : nearestPackageDirectory;
        }
      }
    }
    const parent = dirname(directory);
    if (parent === directory) return nearestPackageDirectory;
    directory = parent;
  }
}

const projectDirectory = findProjectDirectory(requestDirectory) ?? requestDirectory;

function emit(payload, exitCode = 0) {
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  } else {
    const lines = [
      `TypeScript 7 probe: ${payload.status}`,
      `project: ${payload.projectDirectory ?? projectDirectory}`,
    ];
    if (payload.mode !== undefined) lines.push(`mode: ${payload.mode}`);
    if (payload.compilerVersion !== undefined && payload.compilerVersion !== null) {
      lines.push(`compiler: ${payload.compilerVersion}`);
    }
    if (payload.compilerPath !== undefined && payload.compilerPath !== null) {
      lines.push(`compiler path: ${payload.compilerPath}`);
    }
    if (payload.stradaCompilerVersion !== undefined && payload.stradaCompilerVersion !== null) {
      lines.push(`strada compiler: ${payload.stradaCompilerVersion}`);
    }
    if (payload.stradaCompilerPath !== undefined && payload.stradaCompilerPath !== null) {
      lines.push(`strada compiler path: ${payload.stradaCompilerPath}`);
    }
    if (payload.message !== undefined) lines.push(`next: ${payload.message}`);
    process.stdout.write(`${lines.join("\n")}\n`);
  }
  process.exitCode = exitCode;
}

function readPackageJson(path) {
  try {
    const value = JSON.parse(readFileSync(path, "utf8"));
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { error: "package.json must contain a JSON object at its root" };
    }
    return { value };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function dependencyMap(packageJson) {
  return Object.assign(
    {},
    packageJson.peerDependencies,
    packageJson.optionalDependencies,
    packageJson.dependencies,
    packageJson.devDependencies,
  );
}

function versionFromSpecifier(specifier) {
  if (typeof specifier !== "string") return null;
  const match = specifier.match(/(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\s*$/);
  return match?.[1] ?? null;
}

function rangeFromSpecifier(specifier) {
  if (typeof specifier !== "string") return null;
  let range = specifier.trim();
  if (range.startsWith("workspace:")) range = range.slice("workspace:".length).trim();
  const alias = range.match(/^npm:(?:@[^/]+\/[^@]+|[^@]+)@(.+)$/);
  if (alias?.[1] !== undefined) range = alias[1].trim();
  return range;
}

function parsedVersion(version) {
  if (typeof version !== "string") return null;
  const match = version.match(
    /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/,
  );
  if (match === null) return null;
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    prerelease: match[4] ?? null,
  };
}

function compareVersions(leftVersion, rightVersion) {
  const left = parsedVersion(leftVersion);
  const right = parsedVersion(rightVersion);
  if (left === null || right === null) return null;
  for (const part of ["major", "minor", "patch"]) {
    if (left[part] !== right[part]) return left[part] < right[part] ? -1 : 1;
  }
  if (left.prerelease === right.prerelease) return 0;
  if (left.prerelease === null) return 1;
  if (right.prerelease === null) return -1;
  return left.prerelease.localeCompare(right.prerelease, "en", { numeric: true });
}

function declarationAcceptsVersion(specifier, installedVersion) {
  const range = rangeFromSpecifier(specifier);
  if (range === null) return null;
  const match = range.match(
    /^(\^|~|>=|<=|>|<|=)?\s*(v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/,
  );
  if (match === null) return null;
  const operator = match[1] ?? "=";
  const baseVersion = match[2];
  const comparison = compareVersions(installedVersion, baseVersion);
  const base = parsedVersion(baseVersion);
  if (comparison === null || base === null) return null;

  if (operator === "=") return comparison === 0;
  if (operator === ">") return comparison > 0;
  if (operator === ">=") return comparison >= 0;
  if (operator === "<") return comparison < 0;
  if (operator === "<=") return comparison <= 0;

  let upperBound;
  if (operator === "~") {
    upperBound = `${base.major}.${base.minor + 1}.0`;
  } else if (base.major > 0) {
    upperBound = `${base.major + 1}.0.0`;
  } else if (base.minor > 0) {
    upperBound = `0.${base.minor + 1}.0`;
  } else {
    upperBound = `0.0.${base.patch + 1}`;
  }
  const upperComparison = compareVersions(installedVersion, upperBound);
  return comparison >= 0 && upperComparison !== null && upperComparison < 0;
}

function major(version) {
  if (version === null) return null;
  const value = Number.parseInt(version.split(".", 1)[0] ?? "", 10);
  return Number.isNaN(value) ? null : value;
}

function workspacePatterns(packageJson) {
  if (Array.isArray(packageJson.workspaces)) return packageJson.workspaces;
  if (
    packageJson.workspaces !== null &&
    typeof packageJson.workspaces === "object" &&
    Array.isArray(packageJson.workspaces.packages)
  ) {
    return packageJson.workspaces.packages;
  }
  return [];
}

function workspacePatternMatches(relativeProjectPath, pattern) {
  if (typeof pattern !== "string" || pattern.length === 0) return false;
  let normalizedPattern = pattern.replaceAll("\\", "/").replace(/^\.\//, "");
  const negated = normalizedPattern.startsWith("!");
  if (negated) normalizedPattern = normalizedPattern.slice(1);
  let expression = "^";
  for (let index = 0; index < normalizedPattern.length; index += 1) {
    const character = normalizedPattern[index];
    if (character === "*" && normalizedPattern[index + 1] === "*") {
      expression += ".*";
      index += 1;
    } else if (character === "*") {
      expression += "[^/]*";
    } else if (character === "?") {
      expression += "[^/]";
    } else {
      expression += character.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
    }
  }
  expression += "$";
  return new RegExp(expression).test(relativeProjectPath) ? !negated : false;
}

function workspaceRootOwns(directory, candidateDirectory) {
  if (directory === candidateDirectory) return true;
  const relativeProjectPath = relative(directory, candidateDirectory).replaceAll("\\", "/");
  if (relativeProjectPath === ".." || relativeProjectPath.startsWith("../")) return false;
  if (["pnpm-workspace.yaml", "lerna.json", "rush.json"].some(
    (name) => existsSync(join(directory, name)),
  )) {
    return true;
  }
  const packagePath = join(directory, "package.json");
  if (!existsSync(packagePath)) return false;
  const parsed = readPackageJson(packagePath);
  if (parsed.value === undefined) return false;
  let included = false;
  for (const pattern of workspacePatterns(parsed.value)) {
    const normalized = typeof pattern === "string" ? pattern.replace(/^!/, "") : pattern;
    if (!workspacePatternMatches(relativeProjectPath, normalized)) continue;
    included = typeof pattern === "string" && pattern.startsWith("!") ? false : true;
  }
  return included;
}

function workspaceRootOwnsProject(directory) {
  return workspaceRootOwns(directory, projectDirectory);
}

function localCompilerPath(binaryName = "tsc") {
  const executable = process.platform === "win32" ? `${binaryName}.cmd` : binaryName;
  let directory = projectDirectory;
  while (true) {
    if (workspaceRootOwnsProject(directory)) {
      const candidate = join(directory, "node_modules", ".bin", executable);
      if (existsSync(candidate)) return candidate;
    }
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return join(projectDirectory, "node_modules", ".bin", executable);
}

function localPnpManifest() {
  let directory = projectDirectory;
  while (true) {
    if (workspaceRootOwnsProject(directory)) {
      for (const name of [".pnp.cjs", ".pnp.js"]) {
        const candidate = join(directory, name);
        if (existsSync(candidate)) return candidate;
      }
    }
    const parent = dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

function executeCompilerVersion(compilerPath) {
  const windows = process.platform === "win32";
  const executable = windows ? (process.env.ComSpec ?? "cmd.exe") : compilerPath;
  const arguments_ = windows
    ? ["/d", "/s", "/v:off", "/c", `""%${COMPILER_PATH_ENVIRONMENT_KEY}%" --version"`]
    : ["--version"];
  const result = spawnSync(executable, arguments_, {
    cwd: projectDirectory,
    encoding: "utf8",
    env: windows
      ? { ...process.env, [COMPILER_PATH_ENVIRONMENT_KEY]: compilerPath }
      : process.env,
    shell: false,
    timeout: 5_000,
    windowsHide: true,
    windowsVerbatimArguments: windows,
  });

  if (result.error !== undefined) {
    return { error: result.error.message };
  }
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.status !== 0) {
    return { error: output || `tsc exited with status ${result.status}` };
  }
  const match = output.match(/\bVersion\s+(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/i);
  if (match?.[1] === undefined) {
    return { error: `unexpected tsc --version output: ${JSON.stringify(output)}` };
  }
  return { version: match[1] };
}

const packagePath = join(projectDirectory, "package.json");
if (!existsSync(packagePath)) {
  emit({
    projectDirectory,
    status: "uninitialized",
    typescript7InScope: false,
    message: "No package.json is present. Do not infer a TypeScript migration; initialize the project only when the task authorizes it.",
  });
} else {
  const parsed = readPackageJson(packagePath);
  if (parsed.error !== undefined) {
    emit({
      projectDirectory,
      status: "invalid-package-json",
      typescript7InScope: false,
      message: `Repair package.json before changing TypeScript configuration: ${parsed.error}`,
    }, 2);
  } else {
    const dependencies = dependencyMap(parsed.value);
    const typescriptSpecifier = dependencies.typescript;
    const nativeSpecifier = dependencies["@typescript/native"];
    const explicitStradaSpecifier = dependencies["@typescript/typescript6"];

    const typescriptIsStradaAlias =
      typeof typescriptSpecifier === "string" &&
      /^npm:@typescript\/typescript6@/.test(typescriptSpecifier);
    const nativeDeclaration =
      nativeSpecifier ?? (typescriptIsStradaAlias ? undefined : typescriptSpecifier);
    const stradaDeclaration =
      typescriptIsStradaAlias ? typescriptSpecifier : explicitStradaSpecifier;
    const declaredNativeVersion = versionFromSpecifier(nativeDeclaration);
    const declaredStradaVersion = versionFromSpecifier(stradaDeclaration);
    const compilerPath = localCompilerPath();
    const movingNativeTag = /^(?:latest|next|beta|rc)$/i.test(
      rangeFromSpecifier(nativeDeclaration) ?? "",
    );
    const compilerExecutionForScope =
      major(declaredNativeVersion) !== 7 &&
      movingNativeTag &&
      existsSync(compilerPath)
        ? executeCompilerVersion(compilerPath)
        : null;
    const typescript7InScope =
      major(declaredNativeVersion) === 7 ||
      major(compilerExecutionForScope?.version ?? null) === 7;
    const mode = typescript7InScope
      ? typescriptIsStradaAlias
        ? "dual-stack"
        : "direct"
      : null;
    const stradaCompilerPath = mode === "dual-stack" ? localCompilerPath("tsc6") : null;

    if (!typescript7InScope) {
      let compilerVersion = null;
      if (existsSync(compilerPath)) {
        compilerVersion = (
          compilerExecutionForScope ?? executeCompilerVersion(compilerPath)
        ).version ?? null;
      }
      emit({
        compilerPath: existsSync(compilerPath) ? compilerPath : null,
        compilerVersion,
        declaredNativeVersion,
        declaredStradaVersion,
        knowledgePin: KNOWLEDGE_PIN,
        mode: null,
        projectDirectory,
        status: "not-targeting-typescript-7",
        typescript7InScope: false,
        message: "This project does not declare TypeScript 7. Do not migrate it unless the user explicitly requests that change.",
      });
    } else if (!existsSync(compilerPath) && localPnpManifest() !== null) {
      emit({
        compilerPath: null,
        compilerVersion: null,
        declaredNativeVersion,
        declaredStradaVersion,
        knowledgePin: KNOWLEDGE_PIN,
        mode,
        projectDirectory,
        status: "compiler-layout-unsupported",
        typescript7InScope: true,
        message: "A Yarn Plug'n'Play manifest is present, but this local-only probe cannot resolve an executable without a node_modules/.bin path. Use an unplugged/project-provided executable or verify the installed compiler through the repository's trusted script; do not fall back to a registry runner.",
      }, 3);
    } else if (!existsSync(compilerPath)) {
      emit({
        compilerPath: null,
        compilerVersion: null,
        declaredNativeVersion,
        declaredStradaVersion,
        knowledgePin: KNOWLEDGE_PIN,
        mode,
        projectDirectory,
        status: "declared-not-installed",
        typescript7InScope: true,
        message: "TypeScript 7 is declared but its project-local tsc is absent. Install the locked dependencies, then run this probe again.",
      }, 2);
    } else {
      const executed = compilerExecutionForScope ?? executeCompilerVersion(compilerPath);
      const nativeDeclarationAcceptsInstalled = declarationAcceptsVersion(
        nativeDeclaration,
        executed.version,
      );
      if (executed.error !== undefined) {
        emit({
          compilerPath,
          compilerVersion: null,
          declaredNativeVersion,
          declaredStradaVersion,
          knowledgePin: KNOWLEDGE_PIN,
          mode,
          projectDirectory,
          status: "compiler-unusable",
          typescript7InScope: true,
          message: `The project-local compiler could not report its version: ${executed.error}`,
        }, 2);
      } else if (
        nativeDeclarationAcceptsInstalled === false
      ) {
        emit({
          compilerPath,
          compilerVersion: executed.version,
          declaredNativeVersion,
          declaredStradaVersion,
          knowledgePin: KNOWLEDGE_PIN,
          mode,
          projectDirectory,
          status: "compiler-mismatch",
          typescript7InScope: true,
          message: `The package.json TypeScript declaration ${JSON.stringify(nativeDeclaration)} does not accept the project-local tsc version ${executed.version}. Repair the locked install before editing source or tsconfig.`,
        }, 2);
      } else if (major(executed.version) !== 7) {
        emit({
          compilerPath,
          compilerVersion: executed.version,
          declaredNativeVersion,
          declaredStradaVersion,
          knowledgePin: KNOWLEDGE_PIN,
          mode,
          projectDirectory,
          status: "compiler-mismatch",
          typescript7InScope: true,
          message: "package.json declares TypeScript 7, but the project-local tsc is not TypeScript 7. Repair the install before editing source or tsconfig.",
        }, 2);
      } else if (executed.version !== KNOWLEDGE_PIN) {
        emit({
          compilerPath,
          compilerVersion: executed.version,
          declaredNativeVersion,
          declaredStradaVersion,
          knowledgePin: KNOWLEDGE_PIN,
          mode,
          projectDirectory,
          status: "version-difference",
          typescript7InScope: true,
          message: "The installed TypeScript version differs from this skill's 7.0.2 knowledge pin. Check the installed help and official release notes live before applying version-specific advice.",
        }, 3);
      } else if (explicitStradaSpecifier !== undefined && !typescriptIsStradaAlias) {
        emit({
          compilerPath,
          compilerVersion: executed.version,
          declaredNativeVersion,
          declaredStradaVersion,
          knowledgePin: KNOWLEDGE_PIN,
          mode,
          projectDirectory,
          status: "sidecar-layout-unverified",
          typescript7InScope: true,
          message: "@typescript/typescript6 is declared directly, so tools that import \"typescript\" still resolve the native package rather than the Strada API. Use Microsoft's documented typescript alias or verify that every API consumer imports the sidecar package explicitly.",
        }, 3);
      } else if (mode === "dual-stack" && !existsSync(stradaCompilerPath)) {
        emit({
          compilerPath,
          compilerVersion: executed.version,
          declaredNativeVersion,
          declaredStradaVersion,
          knowledgePin: KNOWLEDGE_PIN,
          mode,
          projectDirectory,
          status: "declared-sidecar-not-installed",
          stradaCompilerPath: null,
          stradaCompilerVersion: null,
          typescript7InScope: true,
          message: "The TypeScript 6 Strada sidecar is declared, but its project-local tsc6 executable is absent. Install the locked dependencies, then run this probe again.",
        }, 2);
      } else if (mode === "dual-stack") {
        const executedStrada = executeCompilerVersion(stradaCompilerPath);
        const stradaDeclarationAcceptsInstalled = declarationAcceptsVersion(
          stradaDeclaration,
          executedStrada.version,
        );
        if (executedStrada.error !== undefined) {
          emit({
            compilerPath,
            compilerVersion: executed.version,
            declaredNativeVersion,
            declaredStradaVersion,
            knowledgePin: KNOWLEDGE_PIN,
            mode,
            projectDirectory,
            status: "sidecar-unusable",
            stradaCompilerPath,
            stradaCompilerVersion: null,
            typescript7InScope: true,
            message: `The project-local TypeScript 6 sidecar could not report its version: ${executedStrada.error}`,
          }, 2);
        } else if (
          stradaDeclarationAcceptsInstalled === false
        ) {
          emit({
            compilerPath,
            compilerVersion: executed.version,
            declaredNativeVersion,
            declaredStradaVersion,
            knowledgePin: KNOWLEDGE_PIN,
            mode,
            projectDirectory,
            status: "sidecar-mismatch",
            stradaCompilerPath,
            stradaCompilerVersion: executedStrada.version,
            typescript7InScope: true,
            message: `The package.json Strada declaration ${JSON.stringify(stradaDeclaration)} does not accept the project-local tsc6 version ${executedStrada.version}. Repair the locked install before running compiler-API consumers.`,
          }, 2);
        } else if (major(executedStrada.version) !== 6) {
          emit({
            compilerPath,
            compilerVersion: executed.version,
            declaredNativeVersion,
            declaredStradaVersion,
            knowledgePin: KNOWLEDGE_PIN,
            mode,
            projectDirectory,
            status: "sidecar-mismatch",
            stradaCompilerPath,
            stradaCompilerVersion: executedStrada.version,
            typescript7InScope: true,
            message: "The declared Strada sidecar does not report TypeScript 6. Repair the dual-stack install before running compiler-API consumers.",
          }, 2);
        } else if (executedStrada.version !== STRADA_PIN) {
          emit({
            compilerPath,
            compilerVersion: executed.version,
            declaredNativeVersion,
            declaredStradaVersion,
            knowledgePin: KNOWLEDGE_PIN,
            mode,
            projectDirectory,
            status: "sidecar-version-difference",
            stradaCompilerPath,
            stradaCompilerVersion: executedStrada.version,
            typescript7InScope: true,
            message: `The installed Strada sidecar differs from this skill's ${STRADA_PIN} compatibility pin. Verify the consuming tool's supported compiler range before proceeding.`,
          }, 3);
        } else {
          emit({
            compilerPath,
            compilerVersion: executed.version,
            declaredNativeVersion,
            declaredStradaVersion,
            knowledgePin: KNOWLEDGE_PIN,
            mode,
            projectDirectory,
            status: "ready",
            stradaCompilerPath,
            stradaCompilerVersion: executedStrada.version,
            typescript7InScope: true,
          });
        }
      } else {
        emit({
          compilerPath,
          compilerVersion: executed.version,
          declaredNativeVersion,
          declaredStradaVersion,
          knowledgePin: KNOWLEDGE_PIN,
          mode,
          projectDirectory,
          status: "ready",
          typescript7InScope: true,
        });
      }
    }
  }
}
