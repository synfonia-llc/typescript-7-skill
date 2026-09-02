import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const probePath = join(scriptDirectory, "probe.mjs");
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function createProject(packageJson) {
  const directory = mkdtempSync(join(tmpdir(), "typescript-7-probe-"));
  temporaryDirectories.push(directory);
  if (packageJson !== undefined) {
    writeFileSync(
      join(directory, "package.json"),
      `${JSON.stringify(packageJson, null, 2)}\n`,
      "utf8",
    );
  }
  return directory;
}

function installFakeLocalCompiler(projectDirectory, version, binaryName = "tsc") {
  const binDirectory = join(projectDirectory, "node_modules", ".bin");
  mkdirSync(binDirectory, { recursive: true });

  if (process.platform === "win32") {
    writeFileSync(
      join(binDirectory, `${binaryName}.cmd`),
      `@echo off\r\necho Version ${version}\r\n`,
      "utf8",
    );
    return;
  }

  const executable = join(binDirectory, binaryName);
  writeFileSync(executable, `#!/bin/sh\nprintf 'Version ${version}\\n'\n`, "utf8");
  chmodSync(executable, 0o755);
}

function installUnusableLocalCompiler(projectDirectory, binaryName = "tsc") {
  const binDirectory = join(projectDirectory, "node_modules", ".bin");
  mkdirSync(binDirectory, { recursive: true });

  if (process.platform === "win32") {
    writeFileSync(
      join(binDirectory, `${binaryName}.cmd`),
      "@echo off\r\necho not-a-compiler-version\r\n",
      "utf8",
    );
    return;
  }

  const executable = join(binDirectory, binaryName);
  writeFileSync(executable, "#!/bin/sh\nprintf 'not-a-compiler-version\\n'\n", "utf8");
  chmodSync(executable, 0o755);
}

function runProbe(projectDirectory, options = {}) {
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, [probePath, "--json"], {
    cwd: projectDirectory,
    encoding: "utf8",
    env: {
      ...process.env,
      NPM_CONFIG_OFFLINE: "true",
      npm_config_yes: "false",
      ...(options.emptyPath === true ? { PATH: "" } : {}),
    },
    // The probe gives each compiler process five seconds to terminate. Keep
    // the outer harness comfortably above that bound so it can observe and
    // assert the probe's own failure status on a heavily loaded host.
    timeout: 15_000,
  });

  let payload;
  try {
    payload = JSON.parse(result.stdout.trim());
  } catch {
    payload = undefined;
  }

  return {
    elapsedMilliseconds: Date.now() - startedAt,
    payload,
    status: result.status,
    stderr: result.stderr,
    stdout: result.stdout,
  };
}

test("classifies an uninitialized directory without asking npm for tsc", () => {
  const project = createProject();

  const result = runProbe(project, { emptyPath: true });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.payload?.status, "uninitialized");
  assert.equal(result.payload?.typescript7InScope, false);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /tsc@|npm error/i);
  assert.ok(result.elapsedMilliseconds < 5_000);
});

test("reports a non-object package.json through the stable invalid status", () => {
  const project = createProject(null);

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "invalid-package-json");
  assert.equal(result.payload?.typescript7InScope, false);
  assert.match(result.payload?.message ?? "", /object|package\.json|repair/i);
});

test("reports malformed package.json syntax through the stable invalid status", () => {
  const project = createProject();
  writeFileSync(join(project, "package.json"), "{ nope", "utf8");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "invalid-package-json");
  assert.equal(result.payload?.typescript7InScope, false);
});

test("discovers the enclosing TypeScript project from a nested working directory", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "7.0.2" },
  });
  installFakeLocalCompiler(project, "7.0.2");
  const nestedDirectory = join(project, "src", "features", "example");
  mkdirSync(nestedDirectory, { recursive: true });

  const result = runProbe(nestedDirectory);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.payload?.status, "ready");
  assert.equal(result.payload?.projectDirectory, project);
  assert.equal(result.payload?.compilerPath, join(
    project,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsc.cmd" : "tsc",
  ));
});

test("treats Windows command metacharacters in a project path as literal text", {
  skip: process.platform !== "win32",
}, () => {
  const container = createProject();
  const project = join(container, "a&echo PROBE_INJECTION()^!%PATH%");
  mkdirSync(project, { recursive: true });
  writeFileSync(
    join(project, "package.json"),
    `${JSON.stringify({
      private: true,
      devDependencies: { typescript: "7.0.2" },
    }, null, 2)}\n`,
    "utf8",
  );
  installFakeLocalCompiler(project, "7.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(result.payload?.status, "ready");
  assert.equal(result.payload?.compilerVersion, "7.0.2");
});

test("accepts a compiler hoisted to an enclosing workspace package", () => {
  const workspace = createProject({
    private: true,
    workspaces: ["packages/*"],
  });
  const project = join(workspace, "packages", "reporting");
  mkdirSync(join(project, "src"), { recursive: true });
  writeFileSync(
    join(project, "package.json"),
    `${JSON.stringify({
      name: "reporting",
      private: true,
      devDependencies: { typescript: "7.0.2" },
    }, null, 2)}\n`,
    "utf8",
  );
  installFakeLocalCompiler(workspace, "7.0.2");

  const result = runProbe(join(project, "src"));

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.payload?.status, "ready");
  assert.equal(result.payload?.projectDirectory, project);
  assert.equal(result.payload?.compilerPath, join(
    workspace,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsc.cmd" : "tsc",
  ));
});

test("does not borrow a compiler from an unrelated parent package", () => {
  const parent = createProject({ private: true });
  const project = join(parent, "nested-project");
  mkdirSync(project, { recursive: true });
  writeFileSync(
    join(project, "package.json"),
    `${JSON.stringify({
      name: "nested-project",
      private: true,
      devDependencies: { typescript: "7.0.2" },
    }, null, 2)}\n`,
    "utf8",
  );
  installFakeLocalCompiler(parent, "7.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "declared-not-installed");
  assert.equal(result.payload?.compilerPath, null);
});

test("does not inherit a TypeScript declaration from an unrelated parent package", () => {
  const parent = createProject({
    private: true,
    devDependencies: { typescript: "7.0.2" },
  });
  installFakeLocalCompiler(parent, "7.0.2");
  const project = join(parent, "nested-project");
  mkdirSync(project, { recursive: true });
  writeFileSync(
    join(project, "package.json"),
    `${JSON.stringify({ name: "nested-project", private: true }, null, 2)}\n`,
    "utf8",
  );

  const result = runProbe(project);

  assert.equal(result.status, 0);
  assert.equal(result.payload?.status, "not-targeting-typescript-7");
  assert.equal(result.payload?.projectDirectory, project);
  assert.equal(result.payload?.compilerPath, null);
});

test("uses an enclosing workspace TypeScript declaration when a child package inherits it", () => {
  const workspace = createProject({
    private: true,
    workspaces: ["packages/*"],
    devDependencies: { typescript: "7.0.2" },
  });
  const childPackage = join(workspace, "packages", "reporting");
  mkdirSync(join(childPackage, "src"), { recursive: true });
  writeFileSync(
    join(childPackage, "package.json"),
    `${JSON.stringify({ name: "reporting", private: true }, null, 2)}\n`,
    "utf8",
  );
  installFakeLocalCompiler(workspace, "7.0.2");

  const result = runProbe(join(childPackage, "src"));

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.payload?.status, "ready");
  assert.equal(result.payload?.projectDirectory, workspace);
  assert.equal(result.payload?.compilerPath, join(
    workspace,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsc.cmd" : "tsc",
  ));
});

test("does not turn an intentional TypeScript 6 project into a migration", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "6.0.2" },
  });
  installFakeLocalCompiler(project, "6.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.payload?.status, "not-targeting-typescript-7");
  assert.equal(result.payload?.typescript7InScope, false);
  assert.equal(result.payload?.compilerVersion, "6.0.2");
});

test("accepts a direct pinned TypeScript 7 installation", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "7.0.2" },
  });
  installFakeLocalCompiler(project, "7.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.payload, {
    compilerPath: join(project, "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc"),
    compilerVersion: "7.0.2",
    declaredNativeVersion: "7.0.2",
    declaredStradaVersion: null,
    knowledgePin: "7.0.2",
    mode: "direct",
    projectDirectory: project,
    status: "ready",
    typescript7InScope: true,
  });
});

test("accepts the pinned TypeScript 7 and TypeScript 6 dual stack", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      typescript: "npm:@typescript/typescript6@6.0.2",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");
  installFakeLocalCompiler(project, "6.0.2", "tsc6");

  const result = runProbe(project);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.payload?.status, "ready");
  assert.equal(result.payload?.mode, "dual-stack");
  assert.equal(result.payload?.declaredNativeVersion, "7.0.2");
  assert.equal(result.payload?.declaredStradaVersion, "6.0.2");
  assert.equal(result.payload?.compilerVersion, "7.0.2");
  assert.equal(result.payload?.stradaCompilerVersion, "6.0.2");
  assert.equal(result.payload?.stradaCompilerPath, join(
    project,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsc6.cmd" : "tsc6",
  ));
});

test("does not call an unaliased TypeScript 6 package API-consumer-ready", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/typescript6": "6.0.2",
      typescript: "7.0.2",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");
  installFakeLocalCompiler(project, "6.0.2", "tsc6");

  const result = runProbe(project);

  assert.equal(result.status, 3);
  assert.equal(result.payload?.status, "sidecar-layout-unverified");
  assert.equal(result.payload?.typescript7InScope, true);
  assert.match(result.payload?.message ?? "", /alias|import ["']typescript["']|consumer/i);
});

test("rejects a declared dual stack whose TypeScript 6 sidecar is absent", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      typescript: "npm:@typescript/typescript6@6.0.2",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "declared-sidecar-not-installed");
  assert.equal(result.payload?.compilerVersion, "7.0.2");
  assert.equal(result.payload?.stradaCompilerPath, null);
  assert.equal(result.payload?.stradaCompilerVersion, null);
});

test("rejects a dual-stack sidecar that is not TypeScript 6", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      typescript: "npm:@typescript/typescript6@6.0.2",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");
  installFakeLocalCompiler(project, "7.0.2", "tsc6");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "sidecar-mismatch");
  assert.equal(result.payload?.stradaCompilerVersion, "7.0.2");
});

test("stops for compatibility review when the TypeScript 6 sidecar differs from the pin", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      typescript: "npm:@typescript/typescript6@6.0.3",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");
  installFakeLocalCompiler(project, "6.0.3", "tsc6");

  const result = runProbe(project);

  assert.equal(result.status, 3);
  assert.equal(result.payload?.status, "sidecar-version-difference");
  assert.equal(result.payload?.stradaCompilerVersion, "6.0.3");
  assert.match(result.payload?.message ?? "", /supported|compatibility|range/i);
});

test("rejects an installed sidecar that differs from its exact declaration", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      typescript: "npm:@typescript/typescript6@6.0.3",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");
  installFakeLocalCompiler(project, "6.0.2", "tsc6");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "sidecar-mismatch");
  assert.equal(result.payload?.declaredStradaVersion, "6.0.3");
  assert.equal(result.payload?.stradaCompilerVersion, "6.0.2");
  assert.match(result.payload?.message ?? "", /exact|declaration|package\.json/i);
});

test("rejects an installed sidecar below its declared range", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      typescript: "npm:@typescript/typescript6@^6.0.3",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");
  installFakeLocalCompiler(project, "6.0.2", "tsc6");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "sidecar-mismatch");
  assert.equal(result.payload?.declaredStradaVersion, "6.0.3");
  assert.equal(result.payload?.stradaCompilerVersion, "6.0.2");
  assert.match(result.payload?.message ?? "", /declaration|range|package\.json/i);
});

test("reports a declared TypeScript 7 compiler that is not installed", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "7.0.2" },
  });

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "declared-not-installed");
  assert.equal(result.payload?.typescript7InScope, true);
  assert.match(result.payload?.message ?? "", /install/i);
});

test("distinguishes an installed Yarn PnP layout from a missing install", () => {
  const project = createProject({
    private: true,
    packageManager: "yarn@4.9.2",
    devDependencies: { typescript: "7.0.2" },
  });
  writeFileSync(join(project, ".pnp.cjs"), "module.exports = {};\n", "utf8");

  const result = runProbe(project);

  assert.equal(result.status, 3);
  assert.equal(result.payload?.status, "compiler-layout-unsupported");
  assert.equal(result.payload?.typescript7InScope, true);
  assert.match(result.payload?.message ?? "", /PnP|layout|executable/i);
});

test("reports a project-local compiler that cannot identify itself", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "7.0.2" },
  });
  installUnusableLocalCompiler(project);

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "compiler-unusable");
  assert.equal(result.payload?.compilerVersion, null);
});

test("reports a project-local Strada sidecar that cannot identify itself", () => {
  const project = createProject({
    private: true,
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      typescript: "npm:@typescript/typescript6@6.0.2",
    },
  });
  installFakeLocalCompiler(project, "7.0.2");
  installUnusableLocalCompiler(project, "tsc6");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "sidecar-unusable");
  assert.equal(result.payload?.stradaCompilerVersion, null);
});

test("rejects a local compiler that disagrees with the TypeScript 7 declaration", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "7.0.2" },
  });
  installFakeLocalCompiler(project, "6.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "compiler-mismatch");
  assert.equal(result.payload?.compilerVersion, "6.0.2");
  assert.equal(result.payload?.declaredNativeVersion, "7.0.2");
});

test("rejects an installed TypeScript 7 compiler that differs from its exact declaration", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "7.0.3" },
  });
  installFakeLocalCompiler(project, "7.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "compiler-mismatch");
  assert.equal(result.payload?.declaredNativeVersion, "7.0.3");
  assert.equal(result.payload?.compilerVersion, "7.0.2");
  assert.match(result.payload?.message ?? "", /exact|declaration|package\.json/i);
});

test("allows an installed compiler within a declared range but stops at the knowledge pin", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "^7.0.2" },
  });
  installFakeLocalCompiler(project, "7.0.3");

  const result = runProbe(project);

  assert.equal(result.status, 3);
  assert.equal(result.payload?.status, "version-difference");
  assert.equal(result.payload?.declaredNativeVersion, "7.0.2");
  assert.equal(result.payload?.compilerVersion, "7.0.3");
});

test("rejects an installed TypeScript 7 compiler below its declared range", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "^7.1.0" },
  });
  installFakeLocalCompiler(project, "7.0.2");

  const result = runProbe(project);

  assert.equal(result.status, 2);
  assert.equal(result.payload?.status, "compiler-mismatch");
  assert.equal(result.payload?.declaredNativeVersion, "7.1.0");
  assert.equal(result.payload?.compilerVersion, "7.0.2");
  assert.match(result.payload?.message ?? "", /declaration|range|package\.json/i);
});

test("stops for live verification when TypeScript differs from the 7.0.2 knowledge pin", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "7.1.0" },
  });
  installFakeLocalCompiler(project, "7.1.0");

  const result = runProbe(project);

  assert.equal(result.status, 3);
  assert.equal(result.payload?.status, "version-difference");
  assert.equal(result.payload?.compilerVersion, "7.1.0");
  assert.equal(result.payload?.knowledgePin, "7.0.2");
  assert.match(result.payload?.message ?? "", /live|release notes/i);
});

test("uses an installed TypeScript 7 compiler to classify the moving next tag", () => {
  const project = createProject({
    private: true,
    devDependencies: { typescript: "next" },
  });
  installFakeLocalCompiler(project, "7.1.0");

  const result = runProbe(project);

  assert.equal(result.status, 3);
  assert.equal(result.payload?.status, "version-difference");
  assert.equal(result.payload?.typescript7InScope, true);
  assert.equal(result.payload?.compilerVersion, "7.1.0");
});
