/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Fn<AS extends unknown[], B> = (...as: AS) => B;

/***************************************************************************************************
 * @section Functions
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

export const constant = <A>(a: A) => () => a;
