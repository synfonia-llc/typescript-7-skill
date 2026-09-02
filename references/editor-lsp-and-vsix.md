# Editor LSP and the TypeScript 7 VSIX

## Scope

The **TypeScript 7** editor language server from this skill’s pin: `TypeScriptTeam.native-preview` **0.20260708.2**, bundled compiler **7.0.2**. Not a fix for `tsc` errors (those are source/tsconfig). Not Vue/Svelte plugins.

## Contents

- [Task routes](#task-routes)
- [Enable / disable](#enable--disable)
- [Settings (pin)](#settings-pin)
- [Commands (pin)](#commands-pin)
- [Hard limits](#hard-limits)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN turning TypeScript 7 on or off in Cursor / VS Code — `js/ts.experimental.useTsgo` or the Enable/Disable commands. CLI `tsc` is independent.
- USE WHEN the editor disagrees with the verified project-local `tsc` — trust CLI for merge gates; then check which LS is running (`useTsgo`, workspace `tsdk`).
- USE WHEN tsserver **plugins** vanished — the native LS does **not** load them. Dual-stack / disable TS 7 LS if a plugin is required.
- USE WHEN the workspace is untrusted — this extension **does not support** untrusted workspaces.

## Enable / disable

Pin VSIX readme:

```jsonc
{
  "js/ts.experimental.useTsgo": true,
  "js/ts.tsdk.path": "./node_modules/typescript"
}
```

Commands (category **TypeScript**): Enable TypeScript 7 / Disable TypeScript 7 language server (ids `typescript.native-preview.enable` / `.disable`). Restart: `typescript.native-preview.restart`.

Visual Studio: the 7.0 blog says recent VS enables TypeScript 7 from the workspace automatically.

`js/ts.tsdk.path` (and workspace trust) points the native LS at a **local** `typescript` package. If that package is aliased to 6.0 for eslint, the **editor** may still be 7 if `useTsgo` is true — or the reverse. Probe CLI and read the setting; do not assume they match.

Deprecated aliases: `typescript.native-preview.*` (customConfigFileName, trace.server, pprofDir, tsdk, additionalTsdkLocations, showDebugInfo, goMemLimit). Prefer `js/ts.*`.

## Settings (pin)

From the pin VSIX / current `_extension/package.json` (live may add more — read the installed `package.json`):

- `js/ts.experimental.useTsgo` — master enable (documented on the marketplace/readme; VS Code may own the contribution)
- `js/ts.tsdk.path` — local TypeScript package directory
- `js/ts.tsdk.additionalLocations` — extra search paths
- `js/ts.customConfigFileName` — e.g. `tsconfig.all.json`
- `js/ts.trace.server` — `off` | `messages` | `verbose` (default **verbose** on the extension)
- `js/ts.server.pprofDir` — pprof output directory
- `js/ts.server.goMemLimit` — Go memory limit (`^[0-9]+(([KMGT]i)?B)?$`)
- `js/ts.showDebugInfo`
- `js/ts.preferences.autoImportEntrypointDirectorySearch` — expensive recursive auto-import scan for packages **without** `exports`
- `js/ts.server.showFailedResponses` — `always` | `never` | `auto`
- `js/ts.contentMappers.enabled` — present on later extension builds
- `js/ts.server.trackFlakyDiagnostics` — `panic` | `log` | `never` | `auto` (later builds)

## Commands (pin)

`typescript.native-preview.*`:

- `enable` / `disable` / `restart`
- `output.focus` / `reportIssue` / `selectVersion`
- `goToSourceDefinition`
- `sortImports` / `removeUnusedImports`
- Dev: `dev.runGC`, `dev.saveHeapProfile`, `dev.saveAllocProfile`, `dev.startCPUProfile`, `dev.stopCPUProfile`
- `initializeAPIConnection.ui` (developer)

## Hard limits

- **Untrusted workspaces: not supported** (`capabilities.untrustedWorkspaces.supported: false`).
- **Activation:** javascript, javascriptreact, typescript, typescriptreact.
- **Engine:** VS Code `^1.126.0`.
- **tsserver plugins:** not loaded while the native LS is enabled globally (7.0 blog: Vue/MDX/Astro/Svelte/Angular template tools still need 6.0). Disable the TS 7 LS for those **editor** workflows; CLI `tsc` 7 can still check `.ts`.
- Workspace `tsdk` requires **workspace trust**.

## The 5.x lie

“Restart the TS server / switch tsdk to fix a type error.” If the verified project-local `tsc` is red, the source is red. The LS is not a second type system you can vote against.

## Foot

Pin: VSIX `TypeScriptTeam.native-preview` `0.20260708.2`, bundled **7.0.2**. Extension `package.json` + readme. 7.0 blog (LSP, plugins). See [sources.md](sources.md).
