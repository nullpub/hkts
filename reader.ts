import type * as TC from "./type_classes.ts";
import type { _0, _1 } from "./types.ts";

import { createDo } from "./derivations.ts";
import { constant, flow, identity, pipe } from "./fns.ts";
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

export const Functor: TC.Functor<Reader<_0, _1>, 2> = {
  map: (fab) => (ta) => flow(ta, fab),
};

export const Apply: TC.Apply<Reader<_0, _1>, 2> = {
  ap: (tfab) => (ta) => (r) => pipe(ta(r), tfab(r)),
  map: Functor.map,
};

export const Applicative: TC.Applicative<Reader<_0, _1>, 2> = {
  of: constant,
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<Reader<_0, _1>, 2> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: (fatb) => (ta) => (r) => fatb(ta(r))(r),
};

export const Monad: TC.Monad<Reader<_0, _1>, 2> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: (tta) => (r) => tta(r)(r),
  chain: Chain.chain,
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

/***************************************************************************************************
 * Do
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
