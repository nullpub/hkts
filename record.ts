import type * as TC from "./type_classes.ts";
import type { _ } from "./hkts.ts";

import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

const _map = <A, B, R extends Record<string, A>>(
  fab: (a: A, i: string) => B,
  as: R,
): { [K in keyof R]: B } => {
  const keys = Object.keys(as);
  const out = {} as Record<string, B>;
  for (let i = 0; i < keys.length; i++) {
    out[keys[i]] = fab(as[i], keys[i]);
  }
  return out as { [K in keyof R]: B };
};

const _reduce = <A, B, R extends Record<string, A>>(
  faba: (b: B, a: A, i: string) => B,
  b: B,
  as: R,
): B => {
  const keys = Object.keys(as);
  let out = b;
  for (let i = 0; i < keys.length; i++) {
    out = faba(out, as[keys[i]], keys[i]);
  }
  return out;
};

const _assign = <R extends Record<string, any>>(i: keyof R) =>
  (bs: Partial<R>) =>
    (b: R[typeof i]): Partial<R> => {
      bs[i] = b;
      return bs;
    };

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const IndexedFoldable: TC.IndexedFoldable<
  { [key: string]: _ },
  1,
  string
> = {
  reduce: _reduce,
};

export const IndexedTraversable: TC.IndexedTraversable<
  Record<string, _>,
  1,
  string
> = {
  map: _map,
  reduce: IndexedFoldable.reduce,
  traverse: (A, faub, ta) =>
    IndexedFoldable.reduce(
      (fbs, a, i) => {
        return A.ap(
          A.map(_assign(i), fbs),
          faub(a, i),
        );
      },
      A.of({}),
      ta,
    ),
};

export const Foldable: TC.Foldable<Record<string, _>> = IndexedFoldable;

export const Traversable: TC.Traversable<Record<string, _>> =
  IndexedTraversable;

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { map, reduce, traverse } = D.createPipeableTraversable(
  Traversable,
);
