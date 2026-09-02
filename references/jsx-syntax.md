# JSX syntax

## Scope

TSX/JSX as a **TypeScript language** feature: `compilerOptions.jsx`, element types, `key`, children, `.tsx` vs `.ts`. **Not** React hooks, Next.js, Vue, or component architecture.

## Contents

- [Task routes](#task-routes)
- [Which files and which jsx flag](#which-files-and-which-jsx-flag)
- [What the checker actually type-checks](#what-the-checker-actually-type-checks)
- [Intrinsic vs value-based elements](#intrinsic-vs-value-based-elements)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN writing `<Foo />` or `jsx`/`tsx` emit — set `compilerOptions.jsx` to match the **runtime factory**, then type the elements; do not import a framework skill.
- USE WHEN `.ts` files contain JSX — rename to `.tsx` (or `.jsx` under `checkJs`). The checker will not parse JSX in `.ts`.
- USE WHEN generic components look like `C<T>(props)` vs `C<T>()` JSX — 6.0 tightened generic JSX/function-expression checking; pass an explicit type argument if inference fails ([functions-and-call-signatures.md](functions-and-call-signatures.md)).

## Which files and which jsx flag

| `jsx` | Emit | Typical runtime |
| --- | --- | --- |
| `preserve` | JSX left in output | A bundler transforms later |
| `react-jsx` / `react-jsxdev` | automatic runtime (`jsx` import) | React 17+ automatic transform |
| `react` | `React.createElement` | Classic React |
| `react-native` | preserve-like for RN pipelines | React Native |

Pick from **effective** tsconfig (`tsc --showConfig`). Do not set `react-jsx` in a project whose bundler expects `preserve`, or the opposite.

`jsxImportSource` names the module of the automatic runtime (default `react`). Only set it when the project actually uses a different JSX factory.

## What the checker actually type-checks

JSX is typed through `JSX` namespace names the **project** provides (often `@types/react`, sometimes a custom `jsx-runtime` types package). This skill does not vendor those.

Rules that are language, not React:

- Expression children must be assignable to the element’s children type.
- Spread props are excess-checked against the element’s props type.
- Lowercase tags are **intrinsics** (`JSX.IntrinsicElements["div"]`). Uppercase tags are **values** in scope (`const Foo: …`).
- `<>…</>` is a fragment; it must exist on the JSX namespace.

```tsx
declare namespace JSX {
  interface IntrinsicElements {
    ok: { n: number };
  }
}

const el = <ok n={1} />;
```

If `JSX.IntrinsicElements` is missing, every intrinsic is an error. That is a **types package** problem (`types: []` may have dropped `@types/react`). List it in `"types"` or import the element so the namespace loads. [tsconfig-defaults-and-breaks.md](tsconfig-defaults-and-breaks.md).

## Intrinsic vs value-based elements

```tsx
function Box(props: { title: string }): JSX.Element {
  return <div>{props.title}</div>;
}

const node = <Box title="7" />;
```

A function component is a **function type** whose return is assignable to `JSX.Element` (or `ReactElement` in React types). Class components are instances with `render`. Do not teach hooks here.

Attribute names: `className` vs `class` is a **types** convention of the JSX namespace, not a TypeScript keyword.

## The 5.x lie

“JSX is React, so this skill should import `useState`.” JSX is syntax. The factory is config. If the user asked for React patterns, that is a different skill.

## Foot

Pin: TypeScript **7.0.2**. 6.0 blog (generic JSX / function-expression checking). See [sources.md](sources.md).
