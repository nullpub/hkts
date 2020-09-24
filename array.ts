import type * as TC from "./type_classes.ts";
import type { _ } from "./hkts.ts";

import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

const _map = <A, B>(as: ReadonlyArray<A>, fab: (a: A, i: number) => B): B[] => {
  const out: B[] = new Array(as.length);
  for (let i = 0; i < as.length; i++) {
    out[i] = fab(as[i], i);
  }
  return out;
};

const _reduce = <A, B>(
  as: ReadonlyArray<A>,
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

export const Monad = D.createMonad<ReadonlyArray<_>>({
  of: (a) => [a],
  chain: (fatb, ta) => _map(ta, fatb).flat(),
});

export const IndexedFoldable: TC.IndexedFoldable<ReadonlyArray<_>> = {
  reduce: (faba, a, tb) => _reduce(tb, faba, a),
};

export const IndexedTraversable: TC.IndexedTraversable<ReadonlyArray<_>> = {
  map: Monad.map,
  reduce: IndexedFoldable.reduce,
  traverse: (A, faub, ta) =>
    IndexedFoldable.reduce(
      (fbs, a, i) =>
        A.ap(
          A.map((bs: any) =>
            (b: any) => {
              bs.push(b);
              return bs;
            }, fbs) as any,
          faub(a, i),
        ),
      A.of([]),
      ta,
    ),
};

export const Foldable: TC.Foldable<ReadonlyArray<_>> = IndexedFoldable;

export const Traversable: TC.Traversable<ReadonlyArray<_>> = IndexedTraversable;

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);
