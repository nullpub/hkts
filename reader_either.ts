import type * as TC from "./type_classes.ts";
import type { _0, _1, _2, _3, Fix, Lazy } from "./types.ts";

import * as E from "./either.ts";
import * as R from "./reader.ts";
import { createDo } from "./derivations.ts";
import { apply, constant, flow, identity, pipe } from "./fns.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type ReaderEither<S, L, R> = R.Reader<S, E.Either<L, R>>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const ask: <R, E = never>() => ReaderEither<R, E, R> = () => E.right;

export const asks: <R, A, E = never>(
  f: (r: R) => A,
) => ReaderEither<R, E, A> = (f) => (r) => E.right(f(r));

export const left = <S = never, E = never, A = never>(
  left: E,
): ReaderEither<S, E, A> => R.of(E.left(left));

export const right = <S = never, E = never, A = never>(
  right: A,
): ReaderEither<S, E, A> => R.of(E.right(right));

export const tryCatch = <S, E, A>(
  f: Lazy<A>,
  onError: (e: unknown) => E,
): ReaderEither<S, E, A> => {
  try {
    return R.of(E.right(f()));
  } catch (e) {
    return R.of(E.left(onError(e)));
  }
};

export const fromEither = <S, E, A>(
  ta: E.Either<E, A>,
): ReaderEither<S, E, A> => R.of(ta);

export const orElse = <S, E, A, M>(onLeft: (e: E) => ReaderEither<S, M, A>) =>
  (
    ma: ReaderEither<S, E, A>,
  ): ReaderEither<S, M, A> => pipe(ma, R.chain(E.fold(onLeft, right)));

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<ReaderEither<_0, _1, _2>, 3> = {
  map: (fab) => (ta) => flow(ta, E.map(fab)),
};

export const Apply: TC.Apply<ReaderEither<_0, _1, _2>, 3> = {
  ap: (tfab) =>
    (ta) => (r) => pipe(tfab(r), E.chain((fab) => pipe(ta(r), E.map(fab)))),
  map: Functor.map,
};

export const Applicative: TC.Applicative<ReaderEither<_0, _1, _2>, 3> = {
  of: flow(E.right, constant),
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<ReaderEither<_0, _1, _2>, 3> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: (fatb) => R.chain(E.fold(left, fatb)),
};

export const Monad: TC.Monad<ReaderEither<_0, _1, _2>, 3> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: Chain.chain(identity),
  chain: Chain.chain,
};

export const Bifunctor: TC.Bifunctor<ReaderEither<_0, _1, _2>, 3> = {
  bimap: (fab, fcd) => (tac) => flow(tac, E.bimap(fab, fcd)),
  mapLeft: (fef) => Bifunctor.bimap(fef, identity),
};

export const MonadThrow: TC.MonadThrow<ReaderEither<_0, _1, _2>, 3> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: Monad.join,
  chain: Chain.chain,
  throwError: left,
};

export const Alt: TC.Alt<ReaderEither<_0, _1, _2>, 3> = {
  map: Monad.map,
  alt: (tb) =>
    (ta) =>
      (r) =>
        pipe(
          ta(r),
          E.fold(() => tb(r), E.right),
        ),
};

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getRightMonad = <F>(
  S: TC.Semigroup<F>,
): TC.Monad<ReaderEither<_0, Fix<F>, _1>, 2> => {
  const M = E.getRightMonad(S);

  return {
    of: right,
    ap: (tfab) =>
      (ta) =>
        (r) =>
          pipe(
            ta(r),
            M.ap(tfab(r)),
          ),
    map: (fab) => (ta) => flow(ta, M.map(fab)),
    join: (tta) =>
      (r) =>
        pipe(
          tta(r),
          M.chain(apply(r)),
        ),
    chain: (fatb) =>
      (ta) =>
        (r) =>
          pipe(
            ta(r),
            M.chain(flow(fatb, apply(r))),
          ),
  };
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain, throwError } = MonadThrow;

export const { bimap, mapLeft } = Bifunctor;

export const { alt } = Alt;

export const compose = <E, B, C>(rbc: ReaderEither<B, E, C>) =>
  <A>(rab: ReaderEither<A, E, B>): ReaderEither<A, E, C> =>
    flow(rab, E.chain(rbc));

export const widen: <F>() => <R, E, A>(
  ta: ReaderEither<R, E, A>,
) => ReaderEither<R, E | F, A> = constant(identity);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

/***************************************************************************************************
 * Do
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
