/***************************************************************************************************
 * Nilable
 * Note: The Nilable Functor is not a true Functor as it does not satisfy the functor laws.
 * However, it is still fairly useful.
 *
 * Nilable is a type like Maybe/Option that uses undefined/null in lieu of tagged unions.
 **************************************************************************************************/

import type * as TC from "./type_classes.ts";
import type { _, Lazy, Predicate } from "./types.ts";

import { identity } from "./fns.ts";
import { createDo } from "./derivations.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/***************************************************************************************************
 * Types
 **************************************************************************************************/

export type Nil = undefined | null;

export type Nilable<A> = Nil | A;

/***************************************************************************************************
 * Constructors
 **************************************************************************************************/

export const nil: Nil = undefined;

export const constNil = () => nil;

export const fromPredicate = <A>(predicate: Predicate<A>) =>
  (
    a: A,
  ): Nilable<A> => (predicate(a) ? a : nil);

export const tryCatch = <A>(f: Lazy<A>): Nilable<A> => {
  try {
    return f();
  } catch (e) {
    return nil;
  }
};

/***************************************************************************************************
 * Destructors
 **************************************************************************************************/

export const fold = <A, B>(onValue: (a: A) => B, onNil: (nil: Nil) => B) =>
  (
    ta: Nilable<A>,
  ): B => (isNil(ta) ? onNil(ta) : onValue(ta));

export const getOrElse = <B>(onNil: (nil: Nil) => B) =>
  (ta: Nilable<B>): B => isNil(ta) ? onNil(ta) : ta;

export const toNullable = <A>(ma: Nilable<A>): A | null =>
  isNil(ma) ? null : ma;

export const toUndefined = <A>(ma: Nilable<A>): A | undefined =>
  isNil(ma) ? undefined : ma;

/***************************************************************************************************
 * Guards
 **************************************************************************************************/

export const isNil = <A>(m: Nilable<A>): m is Nil =>
  m === undefined || m === null;

export const isNotNil = <A>(m: Nilable<A>): m is NonNullable<A> => !isNil(m);

/***************************************************************************************************
 * Module Getters
 **************************************************************************************************/

export const getShow = <A>({ show }: TC.Show<A>): TC.Show<Nilable<A>> => ({
  show: (ma) => (isNil(ma) ? String(ma) : show(ma)),
});

/***************************************************************************************************
 * Modules (Note that these modules do not follow the Type Class laws)
 **************************************************************************************************/

export const Functor: TC.Functor<Nilable<_>> = {
  map: (fab) => (ta) => isNil(ta) ? nil : fab(ta),
};

export const Apply: TC.Apply<Nilable<_>> = {
  ap: (tfab) => (ta) => isNil(ta) || isNil(tfab) ? nil : tfab(ta),
  map: Functor.map,
};

export const Applicative: TC.Applicative<Nilable<_>> = {
  of: identity,
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<Nilable<_>> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: Functor.map,
};

export const Monad: TC.Monad<Nilable<_>> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: identity,
  chain: Chain.chain,
};

/***************************************************************************************************
 * Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

/***************************************************************************************************
 * Do Notation
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
