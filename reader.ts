import type * as TC from "./type_classes.ts";
import type { _0, _1 } from "./hkts.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { identity, constant } from "./fns.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Reader<R, A> = (r: R) => A;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const ask: <R>() => Reader<R, R> = () => identity;

export const asks: <R, A>(f: (r: R) => A) => Reader<R, A> = identity;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad = D.createMonad<Reader<_0, _1>, 2>({
  of: constant,
  chain: (fatb, ta) => (r) => fatb(ta(r))(r),
});

export const Applicative: TC.Applicative<Reader<_0, _1>, 2> = {
  of: constant,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: TC.Apply<Reader<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Monad.map,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
