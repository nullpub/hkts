import type * as TC from "./type_classes.ts";
import type { $, _ } from "./types.ts";

import { createMonad, createPipeableMonad } from "./derivations.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { identity } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Identity<A> = A;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Identity<_>> = {
  map: (fab, ta) => fab(ta),
};

export const Monad = createMonad<Identity<_>>({
  of: identity,
  chain: (fatb, ta) => fatb(ta),
});

export const Applicative: TC.Applicative<Identity<_>> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: TC.Apply<Identity<_>> = {
  ap: Monad.ap,
  map: Monad.map,
};

export const Traversable: TC.Traversable<Identity<_>> = {
  map: Functor.map,
  reduce: (faba, a, tb) => faba(a, tb),
  traverse: <U, A, B>(
    _: TC.Applicative<U>,
    faub: (a: A) => $<U, [B]>,
    ta: Identity<A>,
  ) => faub(ta),
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
