import type * as TC from "./type_classes.ts";
import type { $, _ } from "./types.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { constant, pipe } from "./fns.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type IO<A> = () => A;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<IO<_>> = {
  map: (fab, ta) => () => fab(ta()),
};

export const Monad = D.createMonad<IO<_>>({
  of: constant,
  chain: (fatb, ta) => fatb(ta()),
});

export const Alt: TC.Alt<IO<_>> = {
  alt: (a, _) => a,
  map: Functor.map,
};

export const Applicative: TC.Applicative<IO<_>> = {
  of: constant,
  ap: Monad.ap,
  map: Functor.map,
};

export const Apply: TC.Apply<IO<_>> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<IO<_>> = {
  ap: Monad.ap,
  map: Functor.map,
  chain: Monad.chain,
};

export const Extends: TC.Extend<IO<_>> = {
  map: Functor.map,
  extend: (ftab, ta) => () => ftab(ta),
};

export const Foldable: TC.Foldable<IO<_>> = {
  reduce: (faba, a, tb) => faba(a, tb()),
};

export const Traversable: TC.Traversable<IO<_>> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: <U, A, B>(
    F: TC.Applicative<U>,
    faub: (a: A) => $<U, [B]>,
    ta: IO<A>,
  ) => F.map((ta) => () => faub(ta()), F.of(ta)),
};

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getSemigroup = <A>(S: TC.Semigroup<A>): TC.Semigroup<IO<A>> => ({
  concat: (x, y) => () => S.concat(x(), y()),
});

export const getMonoid = <A>(M: TC.Monoid<A>): TC.Monoid<IO<A>> => ({
  ...getSemigroup(M),
  empty: constant(M.empty),
});

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

/***************************************************************************************************
 * @section Sequenec
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
