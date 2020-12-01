import type * as TC from "./type_classes.ts";
import type { _0, _1, _2, _3, Fix, Lazy } from "./types.ts";

import { pipe, flow } from "./fns.ts";
import * as E from "./either.ts";
import * as R from "./reader.ts";
import * as S from "./sequence.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type ReaderEither<S, L, R> = R.Reader<S, E.Either<L, R>>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const ask: <R, E = never>() => ReaderEither<R, E, R> = () => E.right;

export const asks: <R, A, E = never>(
  f: (r: R) => A
) => ReaderEither<R, E, A> = (f) => (r) => E.right(f(r));

export const left = <S = never, E = never, A = never>(
  left: E
): ReaderEither<S, E, A> => R.of(E.left(left));

export const right = <S = never, E = never, A = never>(
  right: A
): ReaderEither<S, E, A> => R.of(E.right(right));

export const tryCatch = <S, E, A>(
  f: Lazy<A>,
  onError: (e: unknown) => E
): ReaderEither<S, E, A> => {
  try {
    return R.of(E.right(f()));
  } catch (e) {
    return R.of(E.left(onError(e)));
  }
};

export const fromEither = <S, E, A>(
  ta: E.Either<E, A>
): ReaderEither<S, E, A> => R.of(ta);

export const orElse = <S, E, A, M>(onLeft: (e: E) => ReaderEither<S, M, A>) => (
  ma: ReaderEither<S, E, A>
): ReaderEither<S, M, A> => pipe(ma, R.chain(E.fold(onLeft, right)));

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

const Monad = E.composeMonad(R.Monad);

export const Functor: TC.Functor<ReaderEither<_0, _1, _2>, 3> = {
  map: Monad.map,
};

export const Bifunctor: TC.Bifunctor<ReaderEither<_0, _1, _2>, 3> = {
  bimap: (fab, fcd, tac) => flow(tac, E.bimap(fab, fcd)),
  mapLeft: (fef, tea) => flow(tea, E.mapLeft(fef)),
};

export const MonadThrow: TC.MonadThrow<ReaderEither<_0, _1, _2>, 3> = {
  ...Monad,
  throwError: left,
};

export const Alt: TC.Alt<ReaderEither<_0, _1, _2>, 3> = {
  map: Monad.map,
  alt: (ta, tb) => (r) =>
    pipe(
      ta(r),
      E.fold(() => tb(r), E.right)
    ),
};

export const Applicative: TC.Applicative<ReaderEither<_0, _1, _2>, 3> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: TC.Apply<ReaderEither<_0, _1, _2>, 3> = {
  ap: Monad.ap,
  map: Monad.map,
};

export const Chain: TC.Chain<ReaderEither<_0, _1, _2>, 3> = {
  ap: Monad.ap,
  map: Monad.map,
  chain: Monad.chain,
};

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getRightMonad = <F>(
  S: TC.Semigroup<F>
): TC.Monad<ReaderEither<_0, Fix<F>, _1>, 2> => {
  const M = E.getRightMonad(S);

  return {
    of: right,
    ap: (tfab, ta) => (r) => M.ap(tfab(r), ta(r)),
    map: (fab, ta) => (r) => M.map(fab, ta(r)),
    join: (tta) => (r) =>
      pipe(
        tta(r),
        E.chain((f) => f(r))
      ),
    chain: (fatb, ta) => (r) =>
      pipe(
        ta(r),
        E.chain((a) => fatb(a)(r))
      ),
  };
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { bimap, mapLeft } = D.createPipeableBifunctor(Bifunctor);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = S.createSequenceTuple(Apply);

export const sequenceStruct = S.createSequenceStruct(Apply);
