import type * as TC from "./type_classes.ts";
import type { $, _ } from "./types.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { call, identity } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Identity<A> = A;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad: TC.Monad<Identity<_>> = {
  of: identity,
  ap: call,
  map: identity,
  join: identity,
  chain: identity,
};

export const Functor: TC.Functor<Identity<_>> = Monad;

export const Applicative: TC.Applicative<Identity<_>> = Monad;

export const Apply: TC.Apply<Identity<_>> = Monad;

export const Traversable: TC.Traversable<Identity<_>> = {
  map: Monad.map,
  reduce: (faba, a) => (tb) => faba(a, tb),
  traverse: <U>(_: TC.Applicative<U>) => call,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
