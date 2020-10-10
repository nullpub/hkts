import type * as TC from "./type_classes.ts";
import type { _ } from "./types.ts";

import { createMonad, createPipeableMonad } from "./derivations.ts";
import { createSequenceTuple, createSequenceStruct } from "./sequence.ts";
import { identity } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Identity<A> = A;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

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

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = createPipeableMonad(Monad);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
