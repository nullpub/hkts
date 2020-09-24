import type * as TC from "./type_classes.ts";
import type { _ } from "./hkts.ts";

import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

const fastMap = <A, B, R extends Record<string, A>>(
  as: R,
  fab: (a: A, i: string) => B,
): { [K in keyof R]: B } => {
  const keys = Object.keys(as);
  const out = {} as Record<string, B>;
  for (let i = 0; i < keys.length; i++) {
    out[keys[i]] = fab(as[i], keys[i]);
  }
  return out as { [K in keyof R]: B };
};

const fastReduce = <A, B, R extends Record<string, A>>(
  as: R,
  faba: (b: B, a: A, i: string) => B,
  b: B,
): B => {
  const keys = Object.keys(as);
  let out = b;
  for (let i = 0; i < keys.length; i++) {
    out = faba(out, as[keys[i]], keys[i]);
  }
  return out;
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const IndexedFoldable: TC.IndexedFoldable<Record<string, _>, 1, string> =
  {
    reduce: (faba, a, tb) => fastReduce(tb, faba, a),
  };

export const IndexedTraversable: TC.IndexedTraversable<
  Record<string, _>,
  1,
  string
> = {
  map: (fab, ta) => fastMap(ta, fab),
  reduce: IndexedFoldable.reduce,
  traverse: (A, faub, ta) =>
    IndexedFoldable.reduce(
      (fbs, a, i) => {
        return A.ap(
          A.map((bs: any) =>
            (b: any) => {
              bs[i] = b;
              return bs;
            }, fbs) as any,
          faub(a, i),
        );
      },
      A.of({}),
      ta,
    ),
};

export const Foldable: TC.Foldable<Record<string, _>> = {
  reduce: (faba, a, tb) => IndexedFoldable.reduce(faba, a, tb),
};

export const Traversable: TC.Traversable<Record<string, _>> = {
  map: IndexedTraversable.map,
  reduce: Foldable.reduce,
  traverse: (A, faub, ta) => IndexedTraversable.traverse(A, faub, ta),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { map, reduce, traverse } = D.createPipeableTraversable(
  Traversable,
);
