import type * as TC from "./type_classes.ts";
import type { $, _0, _1, _2, _3 } from "./hkts.ts";

import { isNotNil, Lazy, Predicate, Refinement } from "./fns.ts";
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
): TaskEither<E, A> => {
  try {
    return right(f());
  } catch (e) {
    return left(onError(e));
  }
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad = E.getEitherM(T.Monad);

export const Functor: TC.Functor<TaskEither<_0, _1>, 2> = {
  map: Monad.map,
};

export const Applicative: TC.Applicative<TaskEither<_0, _1>, 2> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: TC.Apply<TaskEither<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Functor.map,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = S.createSequenceTuple(Apply);

export const sequenceStruct = S.createSequenceStruct(Apply);
