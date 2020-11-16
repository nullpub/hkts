// deno-lint-ignore-file no-explicit-any

import type { Ord } from "./type_classes.ts";

import { setoidStrict } from "./setoid.ts";

/***************************************************************************************************
 * @section Internal
 **************************************************************************************************/

// lte for primmimtives
const lte = (a: any, b: any): boolean => a <= b;

const equals = setoidStrict.equals;

/***************************************************************************************************
 * @section Module Instances
 **************************************************************************************************/

export const ordString: Ord<string> = {
  equals,
  lte,
};

export const ordNumber: Ord<number> = {
  equals,
  lte,
};

export const ordBoolean: Ord<boolean> = {
  equals,
  lte,
};

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const lt = <A>(O: Ord<A>) => (a: A, b: A): boolean =>
  O.lte(a, b) && !O.equals(a, b);

export const gt = <A>(O: Ord<A>) => (a: A, b: A): boolean => !O.lte(a, b);

export const geq = <A>(O: Ord<A>) => (a: A, b: A): boolean =>
  !O.lte(a, b) || O.equals(a, b);

export const min = <A>(O: Ord<A>) => (a: A, b: A): A => (O.lte(a, b) ? a : b);

export const max = <A>(O: Ord<A>) => (a: A, b: A): A => (O.lte(a, b) ? b : a);

export const clamp = <A>(O: Ord<A>) => (low: A, high: A) => (a: A): A =>
  O.lte(a, low) ? low : O.lte(high, a) ? high : a;
