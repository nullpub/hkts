// deno-lint-ignore-file no-explicit-any

import type { Ord } from "./type_classes.ts";

import { setoidStrict } from "./setoid.ts";
import { flow } from "./fns.ts";

/***************************************************************************************************
 * @section Internal
 **************************************************************************************************/

// lte for primmimtives
const _lte = (a: any, b: any): boolean => a <= b;

const _equals = setoidStrict.equals;

/***************************************************************************************************
 * @section Module Instances
 **************************************************************************************************/

export const ordString: Ord<string> = {
  equals: _equals,
  lte: _lte,
};

export const ordNumber: Ord<number> = {
  equals: _equals,
  lte: _lte,
};

export const ordBoolean: Ord<boolean> = {
  equals: _equals,
  lte: _lte,
};

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const lt = <A>(O: Ord<A>) => (a: A) => (b: A): boolean =>
  O.lte(a, b) && !O.equals(a, b);

export const gt = <A>(O: Ord<A>) => (a: A) => (b: A): boolean => !O.lte(a, b);

export const lte = <A>(O: Ord<A>) => (a: A) => (b: A): boolean => O.lte(a, b);

export const gte = <A>(O: Ord<A>) => (a: A) => (b: A): boolean =>
  !O.lte(a, b) || O.equals(a, b);

export const eq = <A>(O: Ord<A>) => (a: A) => (b: A): boolean => O.equals(a, b);

export const min = <A>(O: Ord<A>) => (a: A) => (b: A): A =>
  O.lte(a, b) ? a : b;

export const max = <A>(O: Ord<A>) => (a: A) => (b: A): A =>
  O.lte(a, b) ? b : a;

export const clamp = <A>(O: Ord<A>) => (low: A, high: A): ((a: A) => A) =>
  flow(max(O)(low), min(O)(high));

/***************************************************************************************************
 * @section Combinator Getters
 **************************************************************************************************/

export const getOrdUtilities = <A>(O: Ord<A>) => ({
  lt: lt(O),
  gt: gt(O),
  lte: lte(O),
  gte: gte(O),
  eq: eq(O),
  min: min(O),
  max: max(O),
  clamp: clamp(O),
});
