import type * as TC from "./type_classes.ts";
import type { $, _, _0, _1, _2, _3, Lazy, Predicate } from "./types.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import * as D from "./derivations.ts";
import { identity } from "./fns.ts";

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
  (a: A): Nilable<A> => (predicate(a) ? a : nil);

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

export const fold = <A, B>(onSome: (a: A) => B, onNone: (nil: Nil) => B) =>
  (ta: Nilable<A>): B => (isNil(ta) ? onNone(ta) : onSome(ta));

export const getOrElse = <B>(onNone: (nil: Nil) => B) =>
  (ta: Nilable<B>): B => isNil(ta) ? onNone(ta) : ta;

export const toNullable = <A>(ma: Nilable<A>): A | null =>
  isNil(ma) ? null : ma;

export const toUndefined = <A>(ma: Nilable<A>): A | undefined =>
  isNil(ma) ? undefined : ma;

/***************************************************************************************************
 * Combinators
 **************************************************************************************************/

export const mapNullable = <A, B>(f: (a: A) => B | null | undefined) =>
  (
    ma: Nilable<A>,
  ): Nilable<B> => (isNil(ma) ? ma : f(ma));

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

export const getSetoid = <A>(S: TC.Setoid<A>): TC.Setoid<Nilable<A>> => ({
  equals: (a, b) =>
    a === b || isNil(a) ? isNil(b) : (isNil(b) ? false : S.equals(a, b)),
});

export const getOrd = <A>(O: TC.Ord<A>): TC.Ord<Nilable<A>> => ({
  ...getSetoid(O),
  lte: (a, b) =>
    a === b || isNil(a) ? isNil(b) : (isNil(b) ? false : O.lte(a, b)),
});

export const getSemigroup = <A>(
  S: TC.Semigroup<A>,
): TC.Semigroup<Nilable<A>> => ({
  concat: (x, y) => isNil(x) ? y : isNil(y) ? x : of(S.concat(x, y)),
});

export const getMonoid = <A>(M: TC.Monoid<A>): TC.Monoid<Nilable<A>> => ({
  ...getSemigroup(M),
  empty: constNil,
});

export const getGroup = <A>(G: TC.Group<A>): TC.Group<Nilable<A>> => ({
  ...getMonoid(G),
  invert: (ta) => isNil(ta) ? ta : G.invert(ta),
});

/***************************************************************************************************
 * Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Nilable<_>> = {
  map: (fab, ta) => isNil(ta) ? ta : fab(ta),
};

export const Monad: TC.Monad<Nilable<_>> = {
  of: identity,
  ap: (tfab, ta) => isNil(tfab) || isNil(ta) ? nil : tfab(ta),
  map: Functor.map,
  join: identity,
  chain: Functor.map,
};

export const Alt: TC.Alt<Nilable<_>> = {
  alt: (a, b) => (isNil(a) ? b : a),
  map: Functor.map,
};

export const Applicative: TC.Applicative<Nilable<_>> = {
  of: identity,
  ap: Monad.ap,
  map: Functor.map,
};

export const Apply: TC.Apply<Nilable<_>> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Alternative: TC.Alternative<Nilable<_>> = {
  of: identity,
  ap: Monad.ap,
  map: Functor.map,
  zero: constNil,
  alt: Alt.alt,
};

export const Chain: TC.Chain<Nilable<_>> = {
  ap: Monad.ap,
  map: Functor.map,
  chain: Monad.chain,
};

export const Extends: TC.Extend<Nilable<_>> = {
  map: Functor.map,
  extend: (ftab, ta) => ftab(ta),
};

export const Filterable: TC.Filterable<Nilable<_>> = {
  filter: (predicate, ta) => isNil(ta) ? ta : predicate(ta) ? ta : nil,
};

export const Foldable: TC.Foldable<Nilable<_>> = {
  reduce: (faba, a, tb) => (isNotNil(tb) ? faba(a, tb) : a),
};

export const Plus: TC.Plus<Nilable<_>> = {
  alt: Alt.alt,
  map: Functor.map,
  zero: constNil,
};

export const Traversable: TC.Traversable<Nilable<_>> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: <U>(F: TC.Applicative<U>) =>
    <A, B>(faub: (a: A) => $<U, [B]>, ta: Nilable<A>) =>
      isNil(ta) ? F.of(nil) : F.map(identity, faub(ta)),
};

/***************************************************************************************************
 * Transformers
 **************************************************************************************************/

// deno-fmt-ignore
type ComposeNilableMonad = {
  <T, L extends 1>(M: TC.Monad<T, L>): TC.Monad<$<T, [Nilable<_0>]>, L>;
  <T, L extends 2>(M: TC.Monad<T, L>): TC.Monad<$<T, [_0, Nilable<_1>]>, L>;
  <T, L extends 3>(M: TC.Monad<T, L>): TC.Monad<$<T, [_0, _1, Nilable<_2>]>, L>;
  <T, L extends 4>(M: TC.Monad<T, L>): TC.Monad<$<T, [_0, _1, _2, Nilable<_3>]>, L>;
};

/**
 * This is an experimental interface. Ideally, the substitution type would handle this
 * a bit better so we wouldn't have to do unsafe coercion.
 * @experimental
 */
export const composeMonad: ComposeNilableMonad = <T>(M: TC.Monad<T>) =>
  D.createMonad<$<T, [Nilable<_>]>>({
    of: <A>(a: A) => (M.of(a) as unknown) as $<$<T, [Nilable<_<0>>]>, [A]>,
    chain: <A, B>(
      fatb: (a: A) => $<$<T, [Nilable<_<0>>]>, [B]>,
      ta: $<$<T, [Nilable<_<0>>]>, [A]>,
    ) =>
      M.chain(
        (a: Nilable<A>) =>
          ((isNil(a) ? M.of(a) : fatb(a)) as unknown) as $<T, [unknown]>,
        ta as $<T, [Nilable<A>]>,
      ) as $<$<T, [Nilable<_<0>>]>, [B]>,
  });

/***************************************************************************************************
 * Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

/***************************************************************************************************
 * Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
