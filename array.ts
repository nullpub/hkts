import type * as TC from "./type_classes.ts";
import type { $, _ } from "./types.ts";

import * as D from "./derivations.ts";
import * as O from "./option.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

export const _map = <A, B>(
  as: readonly A[],
  fab: (a: A, i: number) => B,
): ReadonlyArray<B> => {
  const out: B[] = new Array(as.length);
  for (let i = 0; i < as.length; i++) {
    out[i] = fab(as[i], i);
  }
  return out;
};

export const _reduce = <A, B>(
  as: readonly A[],
  fbab: (b: B, a: A, i: number) => B,
  b: B,
): B => {
  let out = b;
  for (let i = 0; i < as.length; i++) {
    out = fbab(out, as[i], i);
  }
  return out;
};

export const _concat = <A>(
  a: readonly A[],
  b: readonly A[],
): readonly A[] => {
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

const isOutOfBounds = <A>(i: number, as: readonly A[]): boolean =>
  i < 0 || i >= as.length;

const unsafeInsertAt = <A>(
  i: number,
  a: A,
  as: ReadonlyArray<A>,
): ReadonlyArray<A> => {
  const xs = as.slice();
  xs.splice(i, 0, a);
  return xs;
};

const unsafeUpdateAt = <A>(
  i: number,
  a: A,
  as: ReadonlyArray<A>,
): ReadonlyArray<A> => {
  if (as[i] === a) {
    return as;
  } else {
    const xs = as.slice();
    xs[i] = a;
    return xs;
  }
};

const unsafeDeleteAt = <A>(
  i: number,
  as: ReadonlyArray<A>,
): ReadonlyArray<A> => {
  const xs = as.slice();
  xs.splice(i, 1);
  return xs;
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const zero: ReadonlyArray<never> = [];

export const empty = <A = never>(): readonly A[] => zero;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monoid: TC.Monoid<ReadonlyArray<_>> = {
  empty,
  concat: _concat,
};

export const Functor: TC.Functor<ReadonlyArray<_>> = {
  map: (fab, ta) => _map(ta, (a) => fab(a)),
};

export const Monad: TC.Monad<ReadonlyArray<_>> = {
  of: (a) => [a],
  ap: (tfab, ta) => Monad.chain((f) => Monad.map(f, ta), tfab),
  map: (fab, ta) => _map(ta, (a) => fab(a)),
  join: (tta) => tta.flat(1),
  chain: (fatb, ta) =>
    // deno-lint-ignore no-explicit-any
    _reduce(ta, (bs, a) => _concat(bs, fatb(a)), [] as readonly any[]),
};

export const Apply: TC.Apply<ReadonlyArray<_>> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Applicative: TC.Applicative<ReadonlyArray<_>> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Functor.map,
};

export const Alt: TC.Alt<ReadonlyArray<_>> = {
  alt: (ta, tb) => ta.length === 0 ? tb : ta,
  map: Functor.map,
};

export const Filterable: TC.Filterable<ReadonlyArray<_>> = {
  filter: (predicate, ta) => ta.filter(predicate),
};

export const IndexedFoldable: TC.IndexedFoldable<ReadonlyArray<_>> = {
  reduce: (faba, a, tb) => _reduce(tb, faba, a),
};

export const IndexedTraversable: TC.IndexedTraversable<ReadonlyArray<_>> = {
  map: Monad.map,
  reduce: IndexedFoldable.reduce,
  traverse: <U, A, B>(
    A: TC.Applicative<U>,
    faub: (a: A, i: number) => $<U, [B]>,
    ta: readonly A[],
  ) =>
    IndexedFoldable.reduce(
      (fbs, a, i) =>
        A.ap(
          A.map((bs) =>
            (b: B) => {
              bs.push(b);
              return bs;
            }, fbs),
          faub(a, i),
        ),
      A.of([] as B[]),
      ta,
    ),
};

export const Foldable: TC.Foldable<ReadonlyArray<_>> = IndexedFoldable;

export const Traversable: TC.Traversable<ReadonlyArray<_>> = IndexedTraversable;

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getSetoid = <A>(S: TC.Setoid<A>): TC.Setoid<readonly A[]> => ({
  equals: (a, b) =>
    a === b || (a.length === b.length && a.every((v, i) => S.equals(v, b[i]))),
});

export const getOrd = <A>(O: TC.Ord<A>): TC.Ord<readonly A[]> => {
  const { equals } = getSetoid(O);
  return ({
    equals,
    lte: (a, b) => {
      const length = Math.min(a.length, b.length);
      for (let i = 0; i < length; i++) {
        if (!O.equals(a[i], b[i])) {
          return O.lte(a[i], b[i]);
        }
      }
      return a.length <= b.length;
    },
  });
};

export const getSemigroup = <A>(
  S: TC.Semigroup<A>,
): TC.Semigroup<readonly A[]> => ({
  concat: (a, b) => [a.reduce(S.concat, b.reduce(S.concat))],
});

export const getFreeSemigroup = <A>(): TC.Semigroup<readonly A[]> => ({
  concat: _concat,
});

export const getShow = <A>({ show }: TC.Show<A>): TC.Show<readonly A[]> => ({
  show: (ta) => `ReadonlyArray[${ta.map(show).join(", ")}]`,
});

export const getMonoid = <A = never>(): TC.Monoid<readonly A[]> => ({
  empty,
  concat: _concat,
});

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

export const {
  traverse: indexedTraverse,
  reduce: indexedReduce,
  map: indexedMap,
}: TC.IndexedTraversableP<ReadonlyArray<_>> = {
  map: (fab) => (ta) => _map(ta, fab),
  reduce: (faba, a) => (tb) => _reduce(tb, faba, a),
  traverse: <U>(A: TC.Applicative<U>) =>
    <A, B>(faUb: (a: A, i: number) => $<U, [B]>) =>
      (ta: readonly A[]) => IndexedTraversable.traverse(A, faUb, ta),
};

export const lookup = (i: number) =>
  <A>(as: readonly A[]): O.Option<A> =>
    isOutOfBounds(i, as) ? O.none : O.some(as[i]);

export const insertAt = <A>(i: number, a: A) =>
  (as: readonly A[]): O.Option<readonly A[]> =>
    isOutOfBounds(i, as) ? O.none : O.some(unsafeInsertAt(i, a, as));

export const updateAt = <A>(i: number, a: A) =>
  (as: readonly A[]): O.Option<readonly A[]> =>
    isOutOfBounds(i, as) ? O.none : O.some(unsafeUpdateAt(i, a, as));

export const deleteAt = (i: number) =>
  <A>(as: readonly A[]): O.Option<readonly A[]> =>
    isOutOfBounds(i, as) ? O.none : O.some(unsafeDeleteAt(i, as));

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
