#!/usr/bin/env node
/**
 * Execute this script. Do not read it into context.
 *
 * cwd must be the TypeScript project (the folder with tsconfig.json and/or
 * node_modules/typescript).
 *
 * Prints: tsc --version, whether it looks like 7.x, tsc --showConfig (or a
 * short failure), and standing 7.0 warnings.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const isWin = process.platform === "win32";

function localBin(name) {
  return join(projectRoot, "node_modules", ".bin", isWin ? `${name}.cmd` : name);
}

function runTsc(args) {
  const tsc = localBin("tsc");
  if (existsSync(tsc)) {
    return spawnSync(tsc, args, { cwd: projectRoot, encoding: "utf8", shell: isWin });
  }
  const npx = isWin ? "npx.cmd" : "npx";
  return spawnSync(npx, ["--no-install", "tsc", ...args], {
    cwd: projectRoot,
    encoding: "utf8",
    shell: isWin,
  });
}

function heading(title) {
  return `\n=== ${title} ===`;
}

console.log(`project: ${projectRoot}`);

const pkgPath = join(projectRoot, "package.json");
if (existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    console.log(heading("package.json typescript fields"));
    console.log(`typescript: ${deps.typescript ?? "(not listed)"}`);
    console.log(`@typescript/native: ${deps["@typescript/native"] ?? "(not listed)"}`);
    console.log(`@typescript/typescript6: ${deps["@typescript/typescript6"] ?? "(not listed)"}`);
  } catch (err) {
    console.log(`package.json unreadable: ${err instanceof Error ? err.message : String(err)}`);
  }
} else {
  console.log("package.json: not found in cwd");
}

const version = runTsc(["--version"]);
console.log(heading("tsc --version"));
if (version.error) {
  console.log(`failed to spawn tsc: ${version.error.message}`);
  console.log("Install typescript@^7.0.2 in this project, then re-run.");
  process.exitCode = 1;
} else {
  const out = `${version.stdout ?? ""}${version.stderr ?? ""}`.trim();
  console.log(out || `(exit ${version.status})`);
  const looks7 = /\bVersion\s+7\./i.test(out) || /\b7\.\d+\.\d+/.test(out);
  console.log(`looks-like-typescript-7: ${looks7 ? "yes" : "NO — stop and fix the install before editing tsconfig"}`);
  if (version.status) process.exitCode = version.status;
}

const help = runTsc(["--help"]);
if (!help.error && /--checkers/.test(`${help.stdout ?? ""}${help.stderr ?? ""}`)) {
  console.log(heading("7.0-new flags present in --help"));
  console.log("--checkers, --builders, --singleThreaded: present");
} else if (!help.error) {
  console.log(heading("7.0-new flags present in --help"));
  console.log("--checkers/--builders/--singleThreaded: not found (this binary is probably not 7.0)");
}

const config = runTsc(["--showConfig"]);
console.log(heading("tsc --showConfig"));
if (config.error) {
  console.log(`failed: ${config.error.message}`);
} else if (config.status) {
  const err = `${config.stdout ?? ""}${config.stderr ?? ""}`.trim();
  console.log(err || `(exit ${config.status})`);
  console.log("No usable tsconfig in cwd, or tsc rejected the project.");
} else {
  process.stdout.write(config.stdout ?? "");
}

console.log(heading("standing 7.0 warnings"));
console.log("- ignoreDeprecations: \"6.0\" is not an escape hatch on TypeScript 7. Removed 6.0 flags are hard errors.");
console.log("- import * as ts from \"typescript\" is the Strada (JS) API. 7.0 has no stable programmatic API until 7.1.");
console.log("- types defaults to []. List \"types\": [\"node\"] (and test runners) explicitly.");
console.log("- rootDir defaults to the tsconfig directory. dist/src/ means set \"rootDir\": \"./src\".");
console.log("- lib is a type environment. Do not assume Node, browsers, or workers implement every lib.esnext name.");
console.log("- Run npx tsc --help rather than inventing compiler flags. Only --checkers, --builders, and --singleThreaded are 7.0-new.");
