import type * as TC from "./type_classes.ts";
import type { _0, _1, _2, _3, Fix, Lazy } from "./types.ts";

import * as E from "./either.ts";
import * as T from "./task.ts";
import { createDo } from "./derivations.ts";
import { apply, constant, flow, identity, pipe, wait } from "./fns.ts";
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

export const orElse = <E, A>(onLeft: (e: E) => TaskEither<E, A>) =>
  T.chain(E.fold<E, A, TaskEither<E, A>>(onLeft, right));

/***************************************************************************************************
 * @section Modules (Sequential)
 **************************************************************************************************/

export const Functor: TC.Functor<TaskEither<_0, _1>, 2> = {
  map: flow(E.map, T.map) as TC.FunctorFn<TaskEither<_0, _1>, 2>,
};

export const Apply: TC.Apply<TaskEither<_0, _1>, 2> = {
  ap: (tfab) => (ta) => pipe(tfab, chain(flow(map, apply(ta)))),
  map: Functor.map,
};

export const Applicative: TC.Applicative<TaskEither<_0, _1>, 2> = {
  of: right,
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<TaskEither<_0, _1>, 2> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: <E, A, B>(fatb: (a: A) => TaskEither<E, B>) =>
    T.chain(E.fold<E, A, TaskEither<E, B>>(left, fatb)),
};

export const Monad: TC.Monad<TaskEither<_0, _1>, 2> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: T.chain(E.fold(left, identity)),
  chain: Chain.chain,
};

export const Bifunctor: TC.Bifunctor<TaskEither<_0, _1>> = {
  bimap: (fab, fcd) => (tac) => () => tac().then(E.bimap(fab, fcd)),
  mapLeft: (fef) => Bifunctor.bimap(fef, identity),
};

export const MonadThrow: TC.MonadThrow<TaskEither<_0, _1>, 2> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: Monad.join,
  chain: Chain.chain,
  throwError: left,
};

export const Alt: TC.Alt<TaskEither<_0, _1>, 2> = ({
  map: Functor.map,
  alt: (tb) => (ta) => () => ta().then((te) => E.isLeft(te) ? tb() : te),
});

/***************************************************************************************************
 * @section Modules (Parallel)
 **************************************************************************************************/

export const ApplyPar: TC.Apply<TaskEither<_0, _1>, 2> = {
  ap: flow(T.map(E.ap), T.ap),
  map: Functor.map,
};

export const MonadPar: TC.Monad<TaskEither<_0, _1>, 2> = {
  of: Applicative.of,
  ap: ApplyPar.ap,
  map: Functor.map,
  join: Monad.join,
  chain: Chain.chain,
};

export const MonadThrowPar: TC.MonadThrow<TaskEither<_0, _1>, 2> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: Monad.join,
  chain: Chain.chain,
  throwError: left,
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

export const timeout = <E, A>(ms: number, onTimeout: () => E) =>
  (ta: TaskEither<E, A>): TaskEither<E, A> =>
    () => Promise.race([ta(), wait(ms).then(flow(onTimeout, E.left))]);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

export const sequenceTuplePar = createSequenceTuple(ApplyPar);

export const sequenceStructPar = createSequenceStruct(ApplyPar);

/***************************************************************************************************
 * Do Notation
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
