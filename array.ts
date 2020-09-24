import type * as TC from "./type_classes.ts";
import type { _ } from "./hkts.ts";

import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

const _map = <A, B>(as: A[], fab: (a: A, i: number) => B): B[] => {
  const out: B[] = new Array(as.length);
  for (let i = 0; i < as.length; i++) {
    out[i] = fab(as[i], i);
  }
  return out;
};

const _reduce = <A, B>(
  as: A[],
  fbab: (b: B, a: A, i: number) => B,
  b: B,
): B => {
  let out = b;
  for (let i = 0; i < as.length; i++) {
    out = fbab(out, as[i], i);
  }
  return out;
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad = D.createMonad<Array<_>>({
  of: (a) => [a],
  chain: (fatb, ta) => _map(ta, fatb).flat(),
});

export const IndexedFoldable: TC.IndexedFoldable<Array<_>> = {
  reduce: (faba, a, tb) => _reduce(tb, (a, b, i) => faba(a, b, i), a),
};

export const IndexedTraversable: TC.IndexedTraversable<Array<_>> = {
  map: Monad.map,
  reduce: IndexedFoldable.reduce,
  traverse: (A, faub, ta) =>
    IndexedFoldable.reduce(
      (fbs, a, i) =>
        A.ap(
          A.map((bs: any) => (b: any) => [...bs, b], fbs) as any,
          faub(a, i),
        ),
      A.of([]),
      ta,
    ),
};

export const Foldable: TC.Foldable<Array<_>> = {
  reduce: (faba, a, tb) => IndexedFoldable.reduce((a, b) => faba(a, b), a, tb),
};

export const Traversable: TC.Traversable<Array<_>> = {
  map: Monad.map,
  reduce: Foldable.reduce,
  traverse: (A, faub, ta) => IndexedTraversable.traverse(A, (a) => faub(a), ta),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);
