/***************************************************************************************************
 * Nilable
 * Note: This type is not a true Functor so no type classes are implemented
 *
 * Nilable is a type like Maybe/Option that uses undefined/null in lieu of tagged unions.
 **************************************************************************************************/

import type * as TC from "./type_classes.ts";
import type { Lazy, Predicate, Fn } from "./types.ts";

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

export const fromPredicate = <A>(predicate: Predicate<A>) => (
  a: A
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

export const fold = <A, B>(onValue: (a: A) => B, onNil: (nil: Nil) => B) => (
  ta: Nilable<A>
): B => (isNil(ta) ? onNil(ta) : onValue(ta));

export const getOrElse = <B>(onNil: (nil: Nil) => B) => (ta: Nilable<B>): B =>
  isNil(ta) ? onNil(ta) : ta;

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
 * Pipeables
 **************************************************************************************************/

export const of = <A>(a: NonNullable<A>): Nilable<A> => a;

export const ap = <A, B>(tfab: Nilable<Fn<[A], NonNullable<B>>>) => (
  ta: Nilable<A>
): Nilable<B> => (isNil(ta) || isNil(tfab) ? nil : tfab(ta));

export const map = <A, B>(fab: Fn<[A], NonNullable<B>>) => (
  ta: Nilable<A>
): Nilable<B> => (isNil(ta) ? nil : fab(ta));

export const chain = <A, B>(fab: (a: A) => Nilable<B>) => (
  ma: Nilable<A>
): Nilable<B> => (isNil(ma) ? ma : fab(ma));
