import type * as TC from "./type_classes.ts";
import type { _, _0, _1 } from "./hkts.ts";

import { Fn, identity, isNotNil, Lazy } from "./fns.ts";
import * as DA from "./datum.ts";
import * as E from "./either.ts";
import * as D from "./derivations.ts";
import * as S from "./sequence.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Initial = DA.Initial;
export type Pending = DA.Pending;
export type Refresh<E, A> = DA.Refresh<E.Either<E, A>>;
export type Replete<E, A> = DA.Replete<E.Either<E, A>>;

export type Some<E, A> = DA.Some<E.Either<E, A>>;
export type None = DA.None;

export type Success<A> = DA.Some<E.Right<A>>;
export type Failure<E> = DA.Some<E.Left<E>>;

export type DatumEither<E, A> = DA.Datum<E.Either<E, A>>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const initial: Initial = DA.initial;
export const pending: Pending = DA.pending;
export const refresh = <E = never, A = never>(
  value: E.Either<E, A>,
): DatumEither<E, A> => DA.refresh(value);
export const replete = <E = never, A = never>(
  value: E.Either<E, A>,
): DatumEither<E, A> => DA.replete(value);

export const success = <E = never, A = never>(a: A): DatumEither<E, A> =>
  replete(E.right(a));
export const failure = <E = never, A = never>(e: E): DatumEither<E, A> =>
  replete(E.left(e));

export const constInitial = () => initial;
export const constPending = () => pending;

export const fromNullable = <E, A>(a: A): DatumEither<E, NonNullable<A>> =>
  isNotNil(a) ? replete(E.right(a)) : initial;

export const tryCatch = <E, A>(
  f: Lazy<A>,
  onError: (e: unknown) => E,
): DatumEither<E, A> => {
  try {
    return replete(E.right(f()));
  } catch (e) {
    return replete(E.left(onError(e)));
  }
};

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isInitial = <E, A>(m: DatumEither<E, A>): m is Initial =>
  m.tag === "Initial";
export const isPending = <E, A>(m: DatumEither<E, A>): m is Pending =>
  m.tag === "Pending";
export const isRefresh = <E, A>(m: DatumEither<E, A>): m is Refresh<E, A> =>
  m.tag === "Refresh";
export const isReplete = <E, A>(m: DatumEither<E, A>): m is Replete<E, A> =>
  m.tag === "Replete";

export const isNone = <E, A>(m: DatumEither<E, A>): m is None =>
  isInitial(m) || isPending(m);
export const isSome = <E, A>(m: DatumEither<E, A>): m is Some<E, A> =>
  isRefresh(m) || isReplete(m);

export const isSuccess = <E, A>(m: DatumEither<E, A>): m is Success<A> =>
  isSome(m) && E.isRight(m.value);
export const isFailure = <E, A>(m: DatumEither<E, A>): m is Failure<E> =>
  isSome(m) && E.isLeft(m.value);

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <E, A, B>(
  onInitial: () => B,
  onPending: () => B,
  onRefreshLeft: (e: E) => B,
  onRefreshRight: (a: A) => B,
  onRepleteLeft: (e: E) => B,
  onRepleteRight: (a: A) => B,
) =>
  (ma: DatumEither<E, A>): B => {
    switch (ma.tag) {
      case "Initial":
        return onInitial();
      case "Pending":
        return onPending();
      case "Refresh":
        return E.isLeft(ma.value)
          ? onRefreshLeft(ma.value.left)
          : onRefreshRight(ma.value.right);
      case "Replete":
        return E.isLeft(ma.value)
          ? onRepleteLeft(ma.value.left)
          : onRepleteRight(ma.value.right);
    }
  };

export const getOrElse = <E, A>(onNone: Lazy<A>, onError: Fn<[E], A>) =>
  fold<E, A, A>(onNone, onNone, onError, identity, onError, identity);

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <E, A>(
  SE: TC.Show<E>,
  SA: TC.Show<A>,
): TC.Show<DatumEither<E, A>> => {
  const { show } = E.getShow(SE, SA);
  return ({
    show: fold(
      () => `Initial`,
      () => `Pending`,
      (e) => `Refresh(${show(E.left(e))})`,
      (a) => `Refresh(${show(E.right(a))})`,
      (e) => `Replete(${show(E.left(e))})`,
      (a) => `Replete(${show(E.right(a))})`,
    ),
  });
};

export const getSemigroup = <E, A>(
  SE: TC.Semigroup<E>,
  SA: TC.Semigroup<A>,
): TC.Semigroup<DatumEither<E, A>> => {
  const { concat } = E.getSemigroup(SE, SA);
  return ({
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
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad = E.getEitherM(DA.Monad);

export const Functor: TC.Functor<DatumEither<_0, _1>, 2> = {
  map: Monad.map,
};

export const Applicative: TC.Applicative<DatumEither<_0, _1>, 2> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: TC.Apply<DatumEither<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Monad.map,
};

export const Alternative: TC.Alternative<DatumEither<_0, _1>, 2> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Functor.map,
  zero: constInitial,
  alt: (a, b) => (isSome(a) ? a : b),
};

export const Foldable: TC.Foldable<DatumEither<_0, _1>, 2> = {
  reduce: (faba, a, tb) => (isSuccess(tb) ? faba(a, tb.value.right) : a),
};

export const Traversable: TC.Traversable<DatumEither<_0, _1>, 2> = {
  map: Monad.map,
  reduce: Foldable.reduce,
  traverse: (F, faub, ta) =>
    isSuccess(ta) ? F.map(success, faub(ta.value.right)) : F.of(initial),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = S.createSequenceTuple(Apply);

export const sequenceStruct = S.createSequenceStruct(Apply);
