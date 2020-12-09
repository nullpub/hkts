import type * as TC from "./type_classes.ts";
import type { _, _0, _1, Fix, Lazy } from "./types.ts";
import { constant, flow, pipe } from "./fns.ts";

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

export const Monad: TC.Monad<IOEither<_0, _1>, 2> = {
  of: right,
  ap: (tfab) =>
    (ta) =>
      () => {
        const efab = tfab();
        const ea = ta();
        return E.isLeft(efab)
          ? efab
          : E.isLeft(ea)
          ? ea
          : E.right(efab.right(ea.right));
      },
  map: (fab) => (ta) => () => pipe(ta(), E.map(fab)),
  join: (tta) => () => pipe(tta(), E.chain((ta) => ta())),
  chain: (fatb) =>
    (ta) => () => pipe(ta(), (a) => E.isLeft(a) ? a : fatb(a.right)()),
};

export const Functor: TC.Functor<IOEither<_0, _1>, 2> = Monad;

export const Applicative: TC.Applicative<IOEither<_0, _1>, 2> = Monad;

export const Apply: TC.Apply<IOEither<_0, _1>, 2> = Monad;

export const Chain: TC.Chain<IOEither<_0, _1>, 2> = Monad;

export const Bifunctor: TC.Bifunctor<IOEither<_0, _1>> = {
  bimap: (fab, fcd) => I.map(E.bimap(fab, fcd)),
  mapLeft: (fef) => I.map(E.mapLeft(fef)),
};

export const MonadThrow: TC.MonadThrow<IOEither<_0, _1>, 2> = {
  ...Monad,
  throwError: left,
};

export const Alt: TC.Alt<IOEither<_0, _1>, 2> = ({
  map: Monad.map,
  alt: (tb) => (ta) => () => pipe(ta(), (a) => E.isLeft(a) ? tb() : a),
});

export const Extends: TC.Extend<IOEither<_0, _1>, 2> = {
  map: Functor.map,
  extend: (tfab) => flow(tfab, right),
};

export const Foldable: TC.Foldable<IOEither<_0, _1>, 2> = {
  reduce: (faba, a) =>
    (tb) =>
      pipe(
        tb(),
        E.fold(() => a, (b) => faba(a, b)),
      ),
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
    ap: (tfab) => (ta) => pipe(ap(tfab())(ta()), constant),
    map: Monad.map,
    join: Monad.join,
    chain: Monad.chain,
  });
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

export const { bimap, mapLeft } = Bifunctor;

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = S.createSequenceTuple(Apply);

export const sequenceStruct = S.createSequenceStruct(Apply);
