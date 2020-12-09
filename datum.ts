import type * as TC from "./type_classes.ts";
import type { $, _, Lazy } from "./types.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { identity, isNotNil, pipe } from "./fns.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export interface Initial {
  tag: "Initial";
}

export interface Pending {
  tag: "Pending";
}

export interface Refresh<A> {
  tag: "Refresh";
  value: A;
}

export interface Replete<A> {
  tag: "Replete";
  value: A;
}

export type Datum<A> = Initial | Pending | Refresh<A> | Replete<A>;

export type None = Initial | Pending;

export type Some<A> = Refresh<A> | Replete<A>;

export type Loading<A> = Pending | Refresh<A>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const initial: Initial = { tag: "Initial" };
export const pending: Pending = { tag: "Pending" };
export const refresh = <D>(value: D): Datum<D> => ({ tag: "Refresh", value });
export const replete = <D>(value: D): Datum<D> => ({ tag: "Replete", value });

export const constInitial = <A = never>(): Datum<A> => initial;
export const constPending = <A = never>(): Datum<A> => pending;

export const fromNullable = <A>(a: A): Datum<NonNullable<A>> =>
  isNotNil(a) ? replete(a) : initial;

export const tryCatch = <A>(f: Lazy<A>): Datum<A> => {
  try {
    return replete(f());
  } catch (_) {
    return initial;
  }
};

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const toLoading = <A>(ta: Datum<A>): Datum<A> =>
  pipe(
    ta,
    fold(
      constPending,
      constPending,
      refresh,
      refresh,
    ),
  );

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isInitial = <A>(ta: Datum<A>): ta is Initial =>
  ta.tag === "Initial";
export const isPending = <A>(ta: Datum<A>): ta is Pending =>
  ta.tag === "Pending";
export const isRefresh = <A>(ta: Datum<A>): ta is Refresh<A> =>
  ta.tag === "Refresh";
export const isReplete = <A>(ta: Datum<A>): ta is Replete<A> =>
  ta.tag === "Replete";

export const isNone = <A>(ta: Datum<A>): ta is None =>
  isInitial(ta) || isPending(ta);
export const isSome = <A>(ta: Datum<A>): ta is Some<A> =>
  isRefresh(ta) || isReplete(ta);

export const isLoading = <A>(ta: Datum<A>): ta is Loading<A> =>
  isPending(ta) || isRefresh(ta);

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <A, B>(
  onInitial: () => B,
  onPending: () => B,
  onReplete: (a: A) => B,
  onRefresh: (a: A) => B,
) =>
  (ma: Datum<A>): B => {
    switch (ma.tag) {
      case "Initial":
        return onInitial();
      case "Pending":
        return onPending();
      case "Refresh":
        return onRefresh(ma.value);
      case "Replete":
        return onReplete(ma.value);
    }
  };

export const getOrElse = <A>(onNone: Lazy<A>) =>
  fold<A, A>(onNone, onNone, identity, identity);

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <A>({ show }: TC.Show<A>): TC.Show<Datum<A>> => ({
  show: fold(
    () => `Initial`,
    () => `Pending`,
    (a) => `Replete(${show(a)})`,
    (a) => `Refresh(${show(a)})`,
  ),
});

export const getSemigroup = <A>(
  S: TC.Semigroup<A>,
): TC.Semigroup<Datum<A>> => ({
  concat: (mx, my) => {
    if (isNone(my)) {
      return mx;
    } else if (isNone(mx)) {
      return my;
    } else {
      if (isRefresh(my) || isRefresh(mx)) {
        return refresh(S.concat(mx.value, my.value));
      } else {
        return replete(S.concat(mx.value, my.value));
      }
    }
  },
});

export const getMonoid = <A>(S: TC.Semigroup<A>): TC.Monoid<Datum<A>> => ({
  ...getSemigroup(S),
  empty: () => initial,
});

export const getSetoid = <A>(S: TC.Setoid<A>): TC.Setoid<Datum<A>> => ({
  equals: (a, b) =>
    a === b ||
    (a.tag === b.tag &&
      (isSome(a) && isSome(b) ? S.equals(a.value, b.value) : true)),
});

export const getOrd = <A>(O: TC.Ord<A>): TC.Ord<Datum<A>> => {
  const { equals } = getSetoid(O);
  return {
    equals,
    lte: (ta, tb) =>
      pipe(
        ta,
        fold(
          () => isInitial(tb),
          () => isNone(tb),
          (a) =>
            pipe(
              tb,
              fold(
                () => false,
                () => false,
                (b) => O.lte(a, b),
                () => true,
              ),
            ),
          (a) =>
            pipe(
              tb,
              fold(
                () => false,
                () => false,
                () => false,
                (b) => O.lte(a, b),
              ),
            ),
        ),
      ),
  };
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Datum<_>> = {
  map: (fab) =>
    (ta) =>
      isRefresh(ta)
        ? refresh(fab(ta.value))
        : isReplete(ta)
        ? replete(fab(ta.value))
        : ta,
};

export const Monad: TC.Monad<Datum<_>> = {
  of: replete,
  ap: (tfab) =>
    (ta) => {
      if (isSome(tfab) && isSome(ta)) {
        const result = tfab.value(ta.value);
        if (isLoading(tfab) || isLoading(ta)) {
          return refresh(result);
        }
        return replete(result);
      }
      return isLoading(tfab) || isLoading(ta) ? pending : initial;
    },
  map: Functor.map,
  join: fold(
    constInitial,
    constPending,
    identity,
    toLoading,
  ),
  chain: (fatb) => (ta) => (isSome(ta) ? fatb(ta.value) : ta),
};

export const Applicative: TC.Applicative<Datum<_>> = Monad;

export const Apply: TC.Apply<Datum<_>> = Monad;

export const Alternative: TC.Alternative<Datum<_>> = {
  of: replete,
  ap: Monad.ap,
  map: Functor.map,
  zero: constInitial,
  alt: (tb) => (ta) => (isSome(ta) ? ta : tb),
};

export const Foldable: TC.Foldable<Datum<_>> = {
  reduce: (faba, a) => (tb) => (isSome(tb) ? faba(a, tb.value) : a),
};

export const Traversable: TC.Traversable<Datum<_>> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: <U>(A: TC.Applicative<U>) =>
    <A, B>(faub: (a: A) => $<U, [B]>) =>
      (
        ta: Datum<A>,
      ) =>
        isNone(ta)
          ? A.of(ta)
          : A.map((b) => isRefresh(ta) ? refresh(b) : replete(b))(
            faub(ta.value),
          ),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

export const { reduce, traverse } = Traversable;

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
