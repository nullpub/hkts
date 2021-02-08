import type * as TC from "./type_classes.ts";
import type { _, _0, _1, Fix, Lazy } from "./types.ts";

import * as E from "./either.ts";
import * as I from "./io.ts";
import * as S from "./sequence.ts";
import { createDo } from "./derivations.ts";
import { apply, constant, flow, identity, pipe } from "./fns.ts";

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
  map: (fab) => (ta) => flow(ta, E.map(fab)),
};

export const Apply: TC.Apply<IOEither<_0, _1>, 2> = {
  ap: (tfab) =>
    (ta) =>
      () =>
        pipe(
          E.sequenceTuple(tfab(), ta()),
          E.map(([fab, a]) => fab(a)),
        ),
  map: Functor.map,
};

export const Applicative: TC.Applicative<IOEither<_0, _1>, 2> = {
  of: right,
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<IOEither<_0, _1>, 2> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: <E, A, B>(fatb: (a: A) => IOEither<E, B>) =>
    (ta: IOEither<E, A>) =>
      flow(ta, E.fold<E, A, E.Either<E, B>>(E.left, flow(fatb, apply()))),
};

export const Monad: TC.Monad<IOEither<_0, _1>, 2> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: Chain.chain(identity),
  chain: Chain.chain,
};

export const Bifunctor: TC.Bifunctor<IOEither<_0, _1>> = {
  bimap: flow(E.bimap, I.map),
  mapLeft: (fef) => I.map(E.mapLeft(fef)),
};

export const MonadThrow: TC.MonadThrow<IOEither<_0, _1>, 2> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: Monad.join,
  chain: Chain.chain,
  throwError: left,
};

export const Alt: TC.Alt<IOEither<_0, _1>, 2> = ({
  map: Monad.map,
  alt: (tb) => (ta) => flow(ta, E.fold(tb, E.right)),
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
    of: Applicative.of,
    ap: (tfab) => (ta) => pipe(ap(tfab())(ta()), constant),
    map: Functor.map,
    join: Monad.join,
    chain: Chain.chain,
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

/***************************************************************************************************
 * Do Notation
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
