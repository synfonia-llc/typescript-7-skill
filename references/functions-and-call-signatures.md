# Functions and call signatures

## Scope

Function types, overloads, rest, `this` parameters, and the 6.0 **this-less** inference change that 7.0 inherited. Not generics details ([generics-inference-and-variance.md](generics-inference-and-variance.md)). Not JSDoc `@param` ([javascript-and-jsdoc.md](javascript-and-jsdoc.md)).

## Contents

- [Task routes](#task-routes)
- [7.0-legal function shapes](#70-legal-function-shapes)
- [Overloads](#overloads)
- [this parameters](#this-parameters)
- [This-less methods and inference order](#this-less-methods-and-inference-order)
- [The 5.x lie](#the-5x-lie)
- [Foot](#foot)

## Task routes

- USE WHEN writing a function, method, or call-signature type — annotate parameters; default `strict` includes `noImplicitAny`.
- USE WHEN a method-syntax callback infers `unknown` because it was listed before the producing function — 6.0 this-less inference usually fixes this; if it does not, add an explicit parameter type or type argument. See below.
- USE WHEN `this` is used inside a standalone function — write a `this: T` parameter; implicit `this: any` is an error under default `strict`.
- USE WHEN `strict: false` JS still errors on omitted `unknown`/`any`/`undefined` arguments — 7.0 (Corsa) no longer allows that omit. Pass the argument or type it `void`. [javascript-and-jsdoc.md](javascript-and-jsdoc.md).

## 7.0-legal function shapes

```ts
function add(a: number, b: number): number {
  return a + b;
}

const mul = (a: number, b: number): number => a * b;

type Fn = (x: string) => number;

function log(message: string, ...rest: unknown[]): void {
  console.log(message, ...rest);
}

function maybe(id?: string): string {
  return id ?? "anon";
}
```

Optional parameters (`id?: string`) are not the same as `id: string | undefined` required parameters. Callers may omit `?` parameters; they may not omit a required `string | undefined` unless you also mark it optional. See also [objects-and-interfaces.md](objects-and-interfaces.md) for `exactOptionalPropertyTypes`.

Rest: the binding must be `...name` in the value. A JSDoc `{...number}` on a **non-rest** parameter does **not** make it rest on 7.0.

## Overloads

Write overload signatures, then one implementation signature that is wide enough:

```ts
function parse(x: string): number;
function parse(x: number): string;
function parse(x: string | number): string | number {
  return typeof x === "string" ? Number(x) : String(x);
}
```

Do not export only the implementation signature. Callers see the overloads.

JSDoc `@overload` on **arrow functions / function expressions** is ignored on 7.0 (TypeScript has no arrow overloads). Write a call-signature object type instead ([javascript-and-jsdoc.md](javascript-and-jsdoc.md)).

## this parameters

```ts
function click(this: HTMLButtonElement, ev: Event): void {
  this.disabled = true;
  void ev;
}
```

`this` parameters are erased. They are not a real first argument. Arrow functions do not have their own `this`; do not put `this` parameters on arrows.

## This-less methods and inference order

Historically, **method syntax** was “contextually sensitive” because of implicit `this`, so generic inference skipped those members and then walked left-to-right. Property **order** could make `consume(y)` infer `unknown` even when `produce` supplied `T`.

TypeScript **6.0** (and therefore 7.0): if a function **never uses `this`**, it is **not** contextually sensitive for that reason. Method-syntax object literals infer like arrows:

```ts
declare function callIt<T>(obj: {
  produce: (x: number) => T;
  consume: (y: T) => void;
}): void;

callIt({
  consume(y) {
    return y.toFixed();
  },
  produce(x: number) {
    return x * 2;
  },
});
```

If inference still fails, pass a type argument (`callIt<number>(…)`) or annotate `y`.

## The 5.x lie

“Unannotated parameters are fine; JS will figure it out.” Default `noImplicitAny` says no. Annotate, or give a contextual type from the callee.

## Foot

Pin: TypeScript **7.0.2**. 6.0 blog (“Less Context-Sensitivity on this-less Functions”). CHANGES.md (omitted `unknown` args, `@overload` on arrows). See [sources.md](sources.md).
