import type * as TC from "./type_classes.ts";
import type { _0, _1 } from "./types.ts";

import { constant, identity } from "./fns.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

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

export const Monad: TC.Monad<Reader<_0, _1>, 2> = {
  of: constant,
  ap: (tfab) =>
    (ta) =>
      (r) => {
        const fab = tfab(r);
        const a = ta(r);
        return fab(a);
      },
  map: (fab) => (ta) => (r) => fab(ta(r)),
  join: (tta) => (r) => tta(r)(r),
  chain: (fatb) => (ta) => (r) => fatb(ta(r))(r),
};

export const Functor: TC.Functor<Reader<_0, _1>, 2> = Monad;

export const Applicative: TC.Applicative<Reader<_0, _1>, 2> = Monad;

export const Apply: TC.Apply<Reader<_0, _1>, 2> = Monad;

export const Chain: TC.Chain<Reader<_0, _1>, 2> = Monad;

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
