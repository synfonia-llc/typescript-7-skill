# Template literals and infer

## Scope

Template-literal **types**, `infer` inside them, and the **7.0 Unicode code-point** split (Corsa vs Strada). Not JS template strings as values. Not general conditionals ([type-manipulation.md](type-manipulation.md)).

## Contents

- [Task routes](#task-routes)
- [Template-literal types](#template-literal-types)
- [7.0: infer pulls a Unicode code point](#70-infer-pulls-a-unicode-code-point)
- [What to rewrite](#what-to-rewrite)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN branding or concatenating string literal types (`\`user:${Id}\``) — template-literal types; keep the unions small.
- USE WHEN `S extends \`${infer Head}${infer Tail}\`` is used on non-BMP text (emoji, many symbols) — **7.0 splits by code point**, not UTF-16 code units.
- USE WHEN a type-level `Length<S>` or grapheme walker **relied on surrogate halves** — it is wrong on 7.0; do not “fix” it by re-encoding unpaired surrogates.

## Template-literal types

```ts
type EventName = `on${Capitalize<"click" | "key">}`;
// "onClick" | "onKey"

type Route = `/users/${string}`;
function go(path: Route): void {
  void path;
}
```

Unions **distribute** through the holes. Huge unions (`300 × 300` concatenations) will slow the checker — that is still true on 7.0 even though `tsc` is faster. Constrain holes (`${Id}` where `Id extends string`) rather than unconstrained `string` when you need a finite union.

Intrinsic string types: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. They follow Unicode case mapping the checker implements; do not assume they match every runtime locale.

## 7.0: infer pulls a Unicode code point

Strada (JS TypeScript ≤6 default) inferred template holes by **UTF-16 code unit**, matching `s[0]`. A supplementary-plane character such as `"😀"` is two code units (`\uD83D\uDE00`), so:

```ts
type HeadTail<S> = S extends `${infer Head}${infer Tail}` ? [Head, Tail] : never;

type Result = HeadTail<"😀abc">;
// 5.x / Strada:  ["\ud83d", "\ude00abc"]
// 7.0 / Corsa:   ["😀", "abc"]
```

7.0 matches iterating with `for...of` or `[...str]`: one **Unicode code point** per empty placeholder. CHANGES.md: “Template literal type inference pulls off a full Unicode code point for empty placeholders.” Scanner **positions** are UTF-8 offsets, which is a different axis (diagnostics / API, not this type).

This is an intentional breaking change. Utilities that implemented `Length<S>` by repeatedly peeling `infer H` and counting steps now count **code points**, not UTF-16 units. Code that *wanted* unpaired surrogates as `Head` is broken.

## What to rewrite

- **Want code points** (almost always): keep the 7.0 behavior; delete UTF-16 comments.
- **Want UTF-16 unit length**: do it at **runtime** (`s.length`) or with an explicit type-level encoding of code units — do not expect `infer` to split surrogates.
- **Want grapheme clusters**: neither 5.x nor 7.0 `infer` does this. Runtime (`Intl.Segmenter`) only.

```ts
type Head<S extends string> = S extends `${infer H}${string}` ? H : never;
type Rest<S extends string> = S extends `${string}${infer R}` ? R : never;

type H = Head<"😀abc">; // "😀"
type R = Rest<"😀abc">; // "abc"
```

## The 5.x lie

“`s[0]` and `${infer H}` are the same.” They were, on UTF-16. On 7.0, `infer` agrees with iterating the string, not with `[]`.

## Foot

Pin: TypeScript **7.0.2**. 7.0 blog (“Template Literal Types Now Preserve Unicode Code Points”). typescript-go CHANGES.md (same). See [sources.md](sources.md).
