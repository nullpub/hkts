import type * as TC from "./type_classes.ts";
import type { $, _0, _1, _2, _3, Fix, Lazy } from "./types.ts";

import * as E from "./either.ts";
import * as T from "./task.ts";
import { constant, identity, pipe } from "./fns.ts";
import { createMonad } from "./derivations.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

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

export const Monad = createMonad<TaskEither<_0, _1>, 2>({
  of: right,
  map: (fab) => T.map(E.map(fab)),
  chain: (fatb) => T.chain(E.fold((l) => left(l), fatb)),
});

export const Functor: TC.Functor<TaskEither<_0, _1>, 2> = Monad;

export const Applicative: TC.Applicative<TaskEither<_0, _1>, 2> = Monad;

export const Apply: TC.Apply<TaskEither<_0, _1>, 2> = Monad;

export const Chain: TC.Chain<TaskEither<_0, _1>, 2> = Monad;

export const Bifunctor: TC.Bifunctor<TaskEither<_0, _1>> = {
  bimap: (fab, fcd) => (tac) => () => tac().then(E.bimap(fab, fcd)),
  mapLeft: (fef) => Bifunctor.bimap(fef, identity),
};

export const MonadThrow: TC.MonadThrow<TaskEither<_0, _1>, 2> = {
  ...Monad,
  throwError: left,
};

export const Alt: TC.Alt<TaskEither<_0, _1>, 2> = ({
  map: Monad.map,
  alt: (tb) => (ta) => () => ta().then((te) => E.isLeft(te) ? tb() : te),
});

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getRightMonad = <E>(
  S: TC.Semigroup<E>,
): TC.Monad<TaskEither<Fix<E>, _0>> => {
  const M = E.getRightMonad(S);

  return ({
    of: right,
    ap: (tfab) => (ta) => async () => M.ap(await tfab())(await ta()),
    map: (fab) => (ta) => async () => M.map(fab)(await ta()),
    join: (tta) => () => tta().then((ta) => E.isLeft(ta) ? ta : ta.right()),
    chain: (fatb) =>
      (ta) => () => ta().then((a) => E.isLeft(a) ? a : fatb(a.right)()),
  });
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

export const { bimap, mapLeft } = Bifunctor;

export const widen: <F>() => <E, A>(
  ta: TaskEither<E, A>,
) => TaskEither<E | F, A> = constant(identity);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
