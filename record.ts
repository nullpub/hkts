import type * as TC from "./type_classes.ts";
import type { $, _ } from "./hkts.ts";

import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

const _map = <A, B, KS extends string>(
  fab: (a: A, i: string) => B,
  as: { [K in KS]: A },
): { [K in KS]: B } => {
  const keys = Object.keys(as) as KS[];
  const out: Partial<{ [K in KS]: B }> = {};
  for (let i = 0; i < keys.length; i++) {
    out[keys[i]] = fab(as[keys[i]], keys[i]);
  }
  return out as { [K in KS]: B };
};

const _reduce = <A, B, KS extends string>(
  faba: (b: B, a: A, i: string) => B,
  b: B,
  as: { [K in KS]: A },
): B => {
  const keys = Object.keys(as) as KS[];
  let out = b;
  for (let i = 0; i < keys.length; i++) {
    out = faba(out, as[keys[i]], keys[i]);
  }
  return out;
};

const _assign = <KS extends string>(i: KS) =>
  <R extends { [K in KS]: any }>(bs: R) =>
    (b: R[typeof i]): Partial<R> => {
      bs[i] = b;
      return bs;
    };

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const IndexedFoldable: TC.IndexedFoldable<
  Readonly<Record<string, _>>,
  1,
  string
> = {
  reduce: _reduce,
};

export const IndexedTraversable: TC.IndexedTraversable<
  Readonly<Record<string, _>>,
  1,
  string
> = {
  map: _map,
  reduce: IndexedFoldable.reduce,
  traverse: (A, faub, ta) =>
    IndexedFoldable.reduce(
      (fbs, a, i) => {
        return A.ap(
          A.map(_assign(i as any), fbs),
          faub(a as any, i),
        );
      },
      A.of({}),
      ta,
    ),
};

export const Foldable: TC.Foldable<Readonly<Record<string, _>>> =
  IndexedFoldable;

export const Traversable: TC.Traversable<Readonly<Record<string, _>>> =
  IndexedTraversable;

export const PipeableTraversable = D.createPipeableTraversable(
  Traversable,
);

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const map = PipeableTraversable.map as <A, B>(
  fab: (a: A) => B,
) => <K extends string>(r: Record<K, A>) => Record<K, B>;

export const reduce = PipeableTraversable.reduce;

export const traverse = PipeableTraversable.traverse as <U>(
  A: TC.Applicative<U, 1>,
) => <A, B>(
  faub: (a: A) => $<U, [B]>,
) => <K extends string>(ta: Record<K, A>) => $<U, [Record<K, A>]>;
