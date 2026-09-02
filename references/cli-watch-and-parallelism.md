# CLI, watch, and parallelism

## Scope

How to run native `tsc` on 7.0.2. The **only** 7.0-new flags this skill documents: `--checkers`, `--builders`, `--singleThreaded`. Everything else: `npx tsc --help`. Watcher: Go port of Parcel’s watcher.

## Contents

- [Task routes](#task-routes)
- [Ordinary tsc](#ordinary-tsc)
- [--checkers](#--checkers)
- [--builders](#--builders)
- [--singleThreaded](#--singlethreaded)
- [--watch](#--watch)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN running typecheck or emit — `npx tsc` from the project, same binary the probe used.
- USE WHEN CI RAM spikes or you have many cores — tune `--checkers` / `--builders`; know they **multiply**.
- USE WHEN debugging a heisenbug vs 6.0 — `--singleThreaded` and a fixed `--checkers` count.
- USE WHEN `tsc file.ts` fails because a tsconfig is in cwd — pass `--ignoreConfig` or use `-p`.

## Ordinary tsc

```text
npx tsc
npx tsc -p tsconfig.json --pretty false
npx tsc --noEmit
npx tsc --build
npx tsc --showConfig
npx tsc --help
```

If cwd has a `tsconfig.json`, passing extra file paths is a **hard error** unless `--ignoreConfig`. That is a 7.0 enforcement of a 6.0 deprecation.

`--build` / `-b` builds project references ([project-references-and-build.md](project-references-and-build.md)).

Do not invoke `tsgo` unless the user is on a preview install.

## --checkers

Type-checking is **not** embarrassingly parallel. 7.0 starts a **fixed** number of checker workers that partition files **deterministically**. Default **4**.

- Raise (`--checkers 8`) on large machines: 7.0 blog showed further speedups (VS Code 16.7× vs 6.0) at **higher memory**.
- Lower (`--checkers 1`) on small CI VMs to avoid duplicate work / RAM.
- Changing the count can, in **rare** cases, surface order-dependent results. Pin the value in CI if you see that. `stableTypeOrdering` is already on and cannot be disabled.

## --builders

With `--build`, `--builders N` is how many **projects** in the reference graph may build at once. Independent of `--checkers` except that **memory multiplies**: `--checkers 4 --builders 4` can mean up to 16 checkers.

`--builders` should not change results; the DAG still constrains order. `--isolatedDeclarations` helps because declaration emit can proceed without waiting on a full check of dependencies (7.0 blog).

## --singleThreaded

Caps checkers to 1 **and** forces parse/emit onto one thread. Use for:

- comparing 6 vs 7 performance fairly
- tiny machines
- external orchestration that already parallelizes across processes

## --watch

Rebuilt on a Go port of `@parcel/watcher` (with assembly shims; no C++ toolchain). Prefer it over rolling your own poller. If watch is heavy, the old JS poller tax on `node_modules` was the thing they removed — do not “fix” watch by copying 5.x advice about `watchOptions` polling until `--help` / docs on **this** binary say so. `watchOptions` that still exist still work; **verify** with `--showConfig`.

## The 5.x lie

“More threads always help.” `--checkers` duplicates some work **on purpose**. Too many checkers OOMs CI. Measure.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (“Custom Scaling”, “Improved --watch Mode”). See [sources.md](sources.md).
