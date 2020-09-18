/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Fn<AS extends unknown[], B> = (...as: AS) => B;

export type Nil = undefined | null;

export interface Lazy<A> {
  (): A;
}

export interface Predicate<A> {
  (a: A): boolean;
}

export interface Refinement<A, B extends A> {
  (a: A): a is B;
}

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isNotNil = <A>(a: A): a is NonNullable<A> =>
  a !== null && a !== undefined;

export const isNil = (a: unknown): a is Nil => a === null || a === undefined;

/***************************************************************************************************
 * @section Helper Functions
 **************************************************************************************************/

export const curry2 = <A, B, C>(fn: (a: A, b: B) => C) => (a: A) => (b: B): C =>
  fn(a, b);
export const curry3 = <A, B, C, D>(fn: (a: A, b: B, c: C) => D) => (a: A) => (
  b: B
) => (c: C): D => fn(a, b, c);

export const identity = <A>(a: A): A => a;

export const flip = <A, B, C>(f: (a: A) => (b: B) => C) => (b: B) => (
  a: A
): C => f(a)(b);

export const compose = <A, B>(fab: (a: A) => B) => <C>(fbc: (b: B) => C) => (
  a: A
): C => fbc(fab(a));

export const constant = <A>(a: A): Lazy<A> => () => a;

// export const isNil = <A>(a: A): a is Nul

/***************************************************************************************************
 * @section Pipe
 * Original pipe function pulled from fp-ts and modified
 * https://github.com/gcanti/fp-ts/blob/master/src/pipeable.ts
 **************************************************************************************************/

export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D
): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
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
  jk: (j: J) => K
): K;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L>(
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
  kl: (K: K) => L
): L;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L>(
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
  end: never
): L;
export function pipe(a: unknown, ...fns: Function[]): unknown {
  return fns.reduce((val, fn) => fn(val), a);
}
