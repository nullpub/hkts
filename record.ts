import type * as TC from "./type_classes.ts";
import type { $, _ } from "./types.ts";

import * as D from "./derivations.ts";
import { hasOwnProperty } from "./fns.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

export const _map = <A, B, KS extends string>(
  fab: (a: A, i: string) => B,
  as: { [K in KS]: A },
): { [K in KS]: B } => {
  const keys = Object.keys(as) as KS[];
  const out: Partial<{ [K in KS]: B }> = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    out[key] = fab(as[key], key);
  }
  return out as { [K in KS]: B };
};

export const _reduce = <A, B, KS extends string>(
  faba: (b: B, a: A, i: string) => B,
  b: B,
  as: { [K in KS]: A },
): B => {
  const keys = Object.keys(as) as KS[];
  let out = b;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    out = faba(out, as[key], key);
  }
  return out;
};

export const _assign = <KS extends string>(i: KS) =>
  <
    R extends { [K in KS]: unknown },
  >(
    bs: R,
  ) =>
    (b: R[typeof i]): Partial<R> => {
      bs[i] = b;
      return bs;
    };

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Readonly<Record<string, _>>> = {
  map: (fab) => (ta) => _map(fab, ta),
};

export const IndexedFoldable: TC.IndexedFoldable<
  Readonly<Record<string, _>>,
  1,
  string
> = {
  reduce: (faba, a) => (tb) => _reduce(faba, a, tb),
};

export const IndexedTraversable: TC.IndexedTraversable<
  Readonly<Record<string, _>>,
  1,
  string
> = {
  map: Functor.map,
  reduce: IndexedFoldable.reduce,
  traverse: <U>(A: TC.Applicative<U>) =>
    <A, B>(faub: (a: A, i: string) => $<U, [B]>) =>
      IndexedFoldable.reduce(
        (fbs, a: A, i) => {
          return A.ap(A.map(_assign(i))(fbs))(faub(a, i));
        },
        A.of({}),
      ),
};

export const Foldable: TC.Foldable<
  Readonly<Record<string, _>>
> = IndexedFoldable;

export const Traversable: TC.Traversable<
  Readonly<Record<string, _>>
> = IndexedTraversable;

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <A>(SA: TC.Show<A>): TC.Show<Record<string, A>> => ({
  show: (ta) =>
    `{ ${
      Object.entries(ta).map(([key, value]) => `${key}: ${SA.show(value)}`)
        .join(", ")
    } }`,
});

/***************************************************************************************************
 * @section Traverses
 **************************************************************************************************/

// deno-fmt-ignore
type TraverseFn = {
  <U, L extends TC.LS = 1>(A: TC.Applicative<U, L>): <A, B>(
    faub: (a: A) => $<U, [B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [Record<K, B>]>;
  <U, L extends TC.LS = 2>(A: TC.Applicative<U, L>): <E, A, B>(
    faub: (a: A) => $<U, [E, B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [E, Record<K, B>]>;
  <U, L extends TC.LS = 3>(A: TC.Applicative<U, L>): <R, E, A, B>(
    faub: (a: A) => $<U, [R, E, B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [R, E, Record<K, B>]>;
  <U, L extends TC.LS = 4>(A: TC.Applicative<U, L>): <S, R, E, A, B>(
    faub: (a: A) => $<U, [S, R, E, B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [S, R, E, Record<K, B>]>;
};

export const traverse: TraverseFn = Traversable.traverse as TraverseFn;

// deno-fmt-ignore
type IndexedTraverseFn<I extends string = string> = {
  <U, L extends TC.LS = 1>(A: TC.Applicative<U, L>): <A, B>(
    faub: (a: A, i: I) => $<U, [B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [Record<K, B>]>;
  <U, L extends TC.LS = 2>(A: TC.Applicative<U, L>): <E, A, B>(
    faub: (a: A, i: I) => $<U, [E, B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [E, Record<K, B>]>;
  <U, L extends TC.LS = 3>(A: TC.Applicative<U, L>): <R, E, A, B>(
    faub: (a: A, i: I) => $<U, [R, E, B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [R, E, Record<K, B>]>;
  <U, L extends TC.LS = 4>(A: TC.Applicative<U, L>): <S, R, E, A, B>(
    faub: (a: A, i: I) => $<U, [S, R, E, B]>
  ) => <K extends string>(ta: Record<K, A>) => $<U, [S, R, E, Record<K, B>]>;
};

export const indexedTraverse: IndexedTraverseFn = Traversable
  .traverse as IndexedTraverseFn;

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const map = Traversable.map as <A, B>(
  fab: (a: A) => B,
) => <K extends string>(r: Record<K, A>) => Record<K, B>;

export const indexedMap = <A, B>(fab: (a: A, i: string) => B) =>
  <
    K extends string,
  >(
    r: Record<K, A>,
  ): Record<K, B> => _map(fab, r);

export const reduce = Traversable.reduce;

export const insertAt = <K extends string, A>(k: K, a: A) =>
  <KS extends K>(
    r: Record<KS | K, A>,
  ): Record<KS | K, A> => (r[k] === a ? r : { ...r, [k]: a });

export const deleteAt = <K extends string>(k: K) =>
  <KS extends string, A>(
    r: Record<KS | K, A>,
  ): Record<Exclude<KS, K>, A> => {
    if (!hasOwnProperty.call(r, k)) {
      return r;
    }
    const out = Object.assign({}, r);
    delete out[k];
    return out;
  };

export const omit = <A, P extends keyof A>(
  props: [P, ...Array<P>],
  a: A,
): { [K in keyof A]: K extends P ? never : A[K] } => {
  const out: A = Object.assign({}, a);
  for (const k of props) {
    delete out[k];
  }
  return out as { [K in keyof A]: K extends P ? never : A[K] };
};

export const pick = <R, K extends keyof R>(...props: [K, K, ...K[]]) =>
  (
    record: R,
  ): Pick<R, K> => {
    const output: Partial<Pick<R, K>> = {};

    for (const k of props) {
      output[k] = record[k];
    }
    return output as Pick<R, K>;
  };

export const keys = <P extends Record<string, unknown>>(p: P): keyof P[] =>
  (Object.keys(p) as unknown) as keyof P[];
