import type * as TC from "./type_classes.ts";
import type { $, _, Lazy } from "./types.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { identity, isNotNil } from "./fns.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Initial = { tag: "Initial" };
export type Pending = { tag: "Pending" };
export type Refresh<A> = { tag: "Refresh"; value: A };
export type Replete<A> = { tag: "Replete"; value: A };

export type None = Initial | Pending;
export type Some<A> = Refresh<A> | Replete<A>;

export type Datum<A> = Initial | Pending | Refresh<A> | Replete<A>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const initial: Initial = { tag: "Initial" };
export const pending: Pending = { tag: "Pending" };
export const refresh = <D>(value: D): Refresh<D> => ({ tag: "Refresh", value });
export const replete = <D>(value: D): Replete<D> => ({ tag: "Replete", value });

export const constInitial = () => initial;
export const constPending = () => pending;

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
 * @section Guards
 **************************************************************************************************/

export const isInitial = <A>(m: Datum<A>): m is Initial => m.tag === "Initial";
export const isPending = <A>(m: Datum<A>): m is Pending => m.tag === "Pending";
export const isRefresh = <A>(m: Datum<A>): m is Refresh<A> =>
  m.tag === "Refresh";
export const isReplete = <A>(m: Datum<A>): m is Replete<A> =>
  m.tag === "Replete";

export const isNone = <A>(m: Datum<A>): m is None =>
  isInitial(m) || isPending(m);
export const isSome = <A>(m: Datum<A>): m is Some<A> =>
  isRefresh(m) || isReplete(m);

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <A, B>(
  onInitial: () => B,
  onPending: () => B,
  onRefresh: (a: A) => B,
  onReplete: (a: A) => B,
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
 * @section Combinators
 **************************************************************************************************/

export const mapNullable = <A, B>(f: (a: A) => B | null | undefined) =>
  (
    ma: Datum<A>,
  ): Datum<B> => (isNone(ma) ? initial : fromNullable(f(ma.value)));

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <A>({ show }: TC.Show<A>): TC.Show<Datum<A>> => ({
  show: fold(
    () => `Initial`,
    () => `Pending`,
    (a) => `Refresh(${show(a)})`,
    (a) => `Replete(${show(a)})`,
  ),
});

export const getSemigroup = <A>({
  concat,
}: TC.Semigroup<A>): TC.Semigroup<Datum<A>> => ({
  concat: (mx, my) => {
    if (isNone(my)) {
      return mx;
    } else if (isNone(mx)) {
      return my;
    } else {
      if (isRefresh(my) || isRefresh(mx)) {
        return refresh(concat(mx.value, my.value));
      } else {
        return replete(concat(mx.value, my.value));
      }
    }
  },
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Datum<_>> = {
  map: (fab, ta) =>
    isRefresh(ta)
      ? refresh(fab(ta.value))
      : isReplete(ta)
      ? replete(fab(ta.value))
      : ta,
};

export const Monad = D.createMonad<Datum<_>>({
  of: replete,
  chain: (fatb, ta) => (isSome(ta) ? fatb(ta.value) : ta),
});

export const Applicative: TC.Applicative<Datum<_>> = {
  of: replete,
  ap: Monad.ap,
  map: Functor.map,
};

export const Apply: TC.Apply<Datum<_>> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Alternative: TC.Alternative<Datum<_>> = {
  of: replete,
  ap: Monad.ap,
  map: Functor.map,
  zero: constInitial,
  alt: (a, b) => (isSome(a) ? a : b),
};

export const Foldable: TC.Foldable<Datum<_>> = {
  reduce: (faba, a, tb) => (isSome(tb) ? faba(a, tb.value) : a),
};

export const Traversable: TC.Traversable<Datum<_>> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: <U, A, B>(
    F: TC.Applicative<U>,
    faub: (a: A) => $<U, [B]>,
    ta: Datum<A>,
  ) => isNone(ta) ? F.of(initial) : F.map(replete, faub(ta.value)),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
