import type * as TC from "./type_classes.ts";
import type { _0, _1, Fix, Lazy } from "./types.ts";

import { pipe } from "./fns.ts";
import * as E from "./either.ts";
import * as T from "./task.ts";
import * as S from "./sequence.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type TaskEither<L, R> = T.Task<E.Either<L, R>>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const left = <E = never, A = never>(left: E): TaskEither<E, A> =>
  T.of(E.left(left));

export const right = <E = never, A = never>(right: A): TaskEither<E, A> =>
  T.of(E.right(right));

export const tryCatch = <E, A>(
  f: Lazy<A>,
  onError: (e: unknown) => E,
): TaskEither<E, A> =>
  () => {
    try {
      return Promise.resolve(E.right(f()));
    } catch (e) {
      return Promise.resolve(E.left(onError(e)));
    }
  };

export const fromFailableTask = <E, A>(onError: (e: unknown) => E) =>
  (ta: T.Task<A>): TaskEither<E, A> =>
    () => ta().then(E.right).catch((e) => E.left(onError(e)));

export const fromEither = <E, A>(ta: E.Either<E, A>): TaskEither<E, A> =>
  pipe(ta, E.fold((e) => left(e), right));

export const orElse = <E, A, M>(onLeft: (e: E) => TaskEither<M, A>) =>
  (ma: TaskEither<E, A>): TaskEither<M, A> =>
    pipe(
      ma,
      T.chain(E.fold(onLeft, right)),
    );

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<TaskEither<_0, _1>, 2> = {
  map: (fab, ta) => () => ta().then(E.map(fab)),
};

export const Bifunctor: TC.Bifunctor<TaskEither<_0, _1>> = {
  bimap: (fab, fcd, tac) => () => tac().then(E.bimap(fab, fcd)),
  mapLeft: (fef, tea) => () => tea().then(E.mapLeft(fef)),
};

export const Monad = E.composeMonad(T.Monad);

export const MonadThrow: TC.MonadThrow<TaskEither<_0, _1>, 2> = {
  ...Monad,
  throwError: left,
};

export const Alt: TC.Alt<TaskEither<_0, _1>, 2> = ({
  map: Monad.map,
  alt: (ta, tb) => () => ta().then((te) => E.isLeft(te) ? tb() : te),
});

export const Applicative: TC.Applicative<TaskEither<_0, _1>, 2> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Functor.map,
};

export const Apply: TC.Apply<TaskEither<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<TaskEither<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Functor.map,
  chain: Monad.chain,
};

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getRightMonad = <E>(
  S: TC.Semigroup<E>,
): TC.Monad<TaskEither<Fix<E>, _0>> => {
  const M = E.getRightMonad(S);

  return ({
    of: right,
    ap: (tfab, ta) => async () => M.ap(await tfab(), await ta()),
    map: (fab, ta) => async () => M.map(fab, await ta()),
    join: (tta) => () => tta().then((ta) => E.isLeft(ta) ? ta : ta.right()),
    chain: (fatb, ta) =>
      () => ta().then((a) => E.isLeft(a) ? a : fatb(a.right)()),
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
