import type * as TC from "./type_classes.ts";
import type { _, Lazy } from "./types.ts";

import { createMonad, createPipeableMonad } from "./derivations.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Task<A> = () => Promise<A>;

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const delay = (ms: number) =>
  <A>(ma: Task<A>): Task<A> =>
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          ma().then(resolve);
        }, ms);
      });

export const fromThunk = <A>(fa: Lazy<A>): Task<A> =>
  () => Promise.resolve(fa());

export const tryCatch = <A>(fa: Lazy<A>, onError: (e: unknown) => A): Task<A> =>
  () => {
    try {
      return Promise.resolve(fa());
    } catch (e) {
      return Promise.resolve(onError(e));
    }
  };

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad = createMonad<Task<_>>({
  of: (a) => () => Promise.resolve(a),
  chain: (fatb, ta) => () => ta().then((a) => fatb(a)()),
});

export const Applicative: TC.Applicative<Task<_>> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: TC.Apply<Task<_>> = {
  ap: Monad.ap,
  map: Monad.map,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = createPipeableMonad(Monad);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
