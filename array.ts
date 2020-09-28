import type * as TC from "./type_classes.ts";
import type { _ } from "./hkts.ts";

import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

export const _map = <A, B>(
  as: ReadonlyArray<A>,
  fab: (a: A, i: number) => B,
): ReadonlyArray<B> => {
  const out: B[] = new Array(as.length);
  for (let i = 0; i < as.length; i++) {
    out[i] = fab(as[i], i);
  }
  return out;
};

export const _reduce = <A, B>(
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

const _concat = <A>(
  a: ReadonlyArray<A>,
  b: ReadonlyArray<A>,
): ReadonlyArray<A> => {
  if (a.length === 0) {
    return b;
  }

  if (b.length === 0) {
    return a;
  }

  const result = Array(a.length + b.length);

  for (let i = 0; i < a.length; i++) {
    result[i] = a[i];
  }

  for (let i = 0; i < b.length; i++) {
    result[i + a.length] = b[i];
  }
  return result;
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const zero: ReadonlyArray<never> = [];

export const empty = <A = never>(): ReadonlyArray<A> => zero;

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <A>({ show }: TC.Show<A>): TC.Show<readonly A[]> => ({
  show: (ta) => `ReadonlyArray[${ta.map(show).join(", ")}]`,
});

export const getMonoid = <A = never>(): TC.Monoid<ReadonlyArray<A>> => ({
  empty,
  concat: _concat,
});

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
