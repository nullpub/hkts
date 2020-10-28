import type { Fn, Lazy, Nil, UnknownFn } from "./types.ts";

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isNotNil = <A>(a: A): a is NonNullable<A> =>
  a !== null && a !== undefined;

export const isNil = (a: unknown): a is Nil => a === null || a === undefined;

/***************************************************************************************************
 * @section Helper Functions
 **************************************************************************************************/

export const curry2 = <A, B, C>(fn: (a: A, b: B) => C) =>
  (a: A) => (b: B): C => fn(a, b);
export const curry3 = <A, B, C, D>(fn: (a: A, b: B, c: C) => D) =>
  (a: A) =>
    (
      b: B,
    ) => (c: C): D => fn(a, b, c);

export const identity = <A>(a: A): A => a;

export const flip = <A, B, C>(f: Fn<[A], Fn<[B], C>>): Fn<[B], Fn<[A], C>> =>
  (b) => (a) => f(a)(b);

export const compose = <A, B>(fab: Fn<[A], B>) =>
  <C>(fbc: Fn<[B], C>): Fn<[A], C> => (a) => fbc(fab(a));

export const constant = <A>(a: A): Lazy<A> => () => a;

export const memoize = <A, B>(f: (a: A) => B): (a: A) => B => {
  const cache = new Map();
  return (a) => {
    if (cache.has(a)) {
      return cache.get(a);
    }
    const b = f(a);
    cache.set(a, b);
    return b;
  };
};

export const typeOf = (x: unknown): string => (x === null ? "null" : typeof x);

export const intersect = <A, B>(a: A, b: B): A & B => {
  if (a !== undefined && b !== undefined) {
    const tx = typeOf(a);
    const ty = typeOf(b);
    if (tx === "object" || ty === "object") {
      return Object.assign({}, a, b);
    }
  }
  return b as A & B;
};

export const hasOwnProperty = Object.prototype.hasOwnProperty;

/***************************************************************************************************
 * @section Pipe
 * Original pipe function pulled from fp-ts and modified
 * https://github.com/gcanti/fp-ts/blob/master/src/pipeable.ts
 **************************************************************************************************/

export type PipeFn = {
  <A>(a: A): A;
  <A, B>(a: A, ab: (a: A) => B): B;
  <A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
  <A, B, C, D>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
  ): D;
  <A, B, C, D, E>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
  ): E;
  <A, B, C, D, E, F>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
  ): F;
  <A, B, C, D, E, F, G>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
  ): G;
  <A, B, C, D, E, F, G, H>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
  ): H;
  <A, B, C, D, E, F, G, H, I>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
  ): I;
  <A, B, C, D, E, F, G, H, I, J>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
    ij: (i: I) => J,
  ): J;
  <A, B, C, D, E, F, G, H, I, J, K>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
    ij: (i: I) => J,
    jk: (j: J) => K,
  ): K;
  <A, B, C, D, E, F, G, H, I, J, K, L>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
    ij: (i: I) => J,
    jk: (j: J) => K,
    kl: (K: K) => L,
  ): L;
  <A, B, C, D, E, F, G, H, I, J, K, L>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
    ij: (i: I) => J,
    jk: (j: J) => K,
    kl: (K: K) => L,
    end: never,
  ): L;
};

export const pipe: PipeFn = (a: unknown, ...fns: UnknownFn[]): unknown =>
  fns.reduce((val, fn) => fn(val), a);

/***************************************************************************************************
 * @section Flow
 * Original flow function pulled from fp-ts and modified
 * https://github.com/gcanti/fp-ts/blob/master/src/functions.ts
 **************************************************************************************************/

type FlowFn = {
  <A extends ReadonlyArray<unknown>, B>(ab: (...a: A) => B): (...a: A) => B;
  <A extends ReadonlyArray<unknown>, B, C>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
  ): (...a: A) => C;
  <A extends ReadonlyArray<unknown>, B, C, D>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
  ): (...a: A) => D;
  <A extends ReadonlyArray<unknown>, B, C, D, E>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
  ): (...a: A) => E;
  <A extends ReadonlyArray<unknown>, B, C, D, E, F>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
  ): (...a: A) => F;
  <A extends ReadonlyArray<unknown>, B, C, D, E, F, G>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
  ): (...a: A) => G;
  <A extends ReadonlyArray<unknown>, B, C, D, E, F, G, H>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
  ): (...a: A) => H;
  <A extends ReadonlyArray<unknown>, B, C, D, E, F, G, H, I>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
  ): (...a: A) => I;
  <A extends ReadonlyArray<unknown>, B, C, D, E, F, G, H, I, J>(
    ab: (...a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
    ij: (i: I) => J,
  ): (...a: A) => J;
};

export const flow: FlowFn = <AS extends unknown[], B>(
  a: (...as: AS) => B,
  ...fns: UnknownFn[]
): (...as: AS) => unknown => {
  return (...args: AS): unknown =>
    fns.reduce((b: unknown, f) => f(b), a(...args));
};
