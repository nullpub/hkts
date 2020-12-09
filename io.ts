import type * as TC from "./type_classes.ts";
import type { $, _ } from "./types.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { constant, flow } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type IO<A> = () => A;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad: TC.Monad<IO<_>> = {
  of: constant,
  ap: (tfab) => (ta) => () => tfab()(ta()),
  map: (fab) => (ta) => () => fab(ta()),
  join: (tta) => tta(),
  chain: (fatb) => (ta) => fatb(ta()),
};

export const Alt: TC.Alt<IO<_>> = {
  alt: constant,
  map: Monad.map,
};

export const Functor: TC.Functor<IO<_>> = Monad;

export const Applicative: TC.Applicative<IO<_>> = Monad;

export const Apply: TC.Apply<IO<_>> = Monad;

export const Chain: TC.Chain<IO<_>> = Monad;

export const Extends: TC.Extend<IO<_>> = {
  map: Monad.map,
  extend: (ftab) => (ta) => () => ftab(ta),
};

export const Foldable: TC.Foldable<IO<_>> = {
  reduce: (faba, a) => (tb) => faba(a, tb()),
};

export const Traversable: TC.Traversable<IO<_>, 1> = {
  map: Monad.map,
  reduce: Foldable.reduce,
  traverse: <U>(A: TC.Applicative<U>) =>
    <A, B>(faub: (a: A) => $<U, [B]>) =>
      (ta: $<IO<_>, [A]>) =>
        A.map((ta: $<IO<_>, [A]>) => flow(ta, faub))(A.of(ta)),
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

export const { of, ap, map, join, chain } = Monad;

export const { reduce, traverse } = Traversable;

/***************************************************************************************************
 * @section Sequenec
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
