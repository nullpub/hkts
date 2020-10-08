import type * as TC from "./type_classes.ts";
import type { Fix, _, _0, _1 } from "./types.ts";
import { constant, Lazy, pipe } from "./fns.ts";

import * as E from "./either.ts";
import * as I from "./io.ts";
import * as S from "./sequence.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type IOEither<L, R> = I.IO<E.Either<L, R>>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const left = <E = never, A = never>(left: E): IOEither<E, A> =>
  I.of(E.left(left));

export const right = <E = never, A = never>(right: A): IOEither<E, A> =>
  I.of(E.right(right));

export const tryCatch = <E, A>(
  f: Lazy<A>,
  onError: (e: unknown) => E,
): IOEither<E, A> => {
  try {
    return right(f());
  } catch (e) {
    return left(onError(e));
  }
};

export const fromEither = <E, A>(ta: E.Either<E, A>): IOEither<E, A> =>
  pipe(ta, E.fold((e) => left(e), right));

export const orElse = <E, A, M>(onLeft: (e: E) => IOEither<M, A>) =>
  (ma: IOEither<E, A>): IOEither<M, A> =>
    pipe(
      ma,
      I.chain(E.fold(onLeft, right)),
    );

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<IOEither<_0, _1>, 2> = {
  map: (fab, ta) => pipe(ta, I.map(E.map(fab))),
};

export const Bifunctor: TC.Bifunctor<IOEither<_0, _1>> = {
  bimap: (fab, fcd, tac) => pipe(tac, I.map(E.bimap(fab, fcd))),
  mapLeft: (fef, tea) => pipe(tea, I.map(E.mapLeft(fef))),
};

export const Monad = E.getEitherM(I.Monad);

export const MonadThrow: TC.MonadThrow<IOEither<_0, _1>, 2> = {
  ...Monad,
  throwError: left,
};

export const Alt: TC.Alt<IOEither<_0, _1>, 2> = ({
  map: Monad.map,
  alt: (ta, tb) => pipe(ta(), E.fold(constant(tb), right)),
});

export const Applicative: TC.Applicative<IOEither<_0, _1>, 2> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Functor.map,
};

export const Apply: TC.Apply<IOEither<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<IOEither<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Functor.map,
  chain: Monad.chain,
};

export const Extends: TC.Extend<IOEither<_0, _1>, 2> = {
  map: Functor.map,
  extend: (tfab, ta) => right(tfab(ta)),
};

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getRightMonad = <E>(
  S: TC.Semigroup<E>,
): TC.Monad<IOEither<Fix<E>, _>> => {
  const { ap } = E.getRightMonad(S);

  return ({
    of: right,
    ap: (tfab, ta) => pipe(ap(tfab(), ta()), constant),
    map: Monad.map,
    join: Monad.join,
    chain: Monad.chain,
  });
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
