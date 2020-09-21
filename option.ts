import type * as TC from "./type_classes.ts";
import type { $, _ } from "./hkts.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { isNotNil, Lazy, Predicate } from "./fns.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type None = { tag: "None" };
export type Some<V> = { tag: "Some"; value: V };
export type Option<A> = None | Some<A>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const none: None = { tag: "None" };
export const some = <A>(value: A): Option<A> => ({ tag: "Some", value });
export const constNone = () => none;

export const fromNullable = <A>(a: A): Option<NonNullable<A>> =>
  isNotNil(a) ? some(a) : none;

export const fromPredicate = <A>(predicate: Predicate<A>) =>
  (
    a: A,
  ): Option<A> => (predicate(a) ? some(a) : none);

export const tryCatch = <A>(f: Lazy<A>): Option<A> => {
  try {
    return some(f());
  } catch (e) {
    return none;
  }
};

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <A, B>(onSome: (a: A) => B, onNone: () => B) =>
  (
    ta: Option<A>,
  ): B => (isNone(ta) ? onNone() : onSome(ta.value));

export const getOrElse = <B>(onNone: () => B, ta: Option<B>): B =>
  isNone(ta) ? onNone() : ta.value;

export const toNullable = <A>(ma: Option<A>): A | null =>
  isNone(ma) ? null : ma.value;

export const toUndefined = <A>(ma: Option<A>): A | undefined =>
  isNone(ma) ? undefined : ma.value;

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const mapNullable = <A, B>(f: (a: A) => B | null | undefined) =>
  (
    ma: Option<A>,
  ): Option<B> => (isNone(ma) ? none : fromNullable(f(ma.value)));

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isNone = <A>(m: Option<A>): m is None => m.tag === "None";
export const isSome = <A>(m: Option<A>): m is Some<A> => m.tag === "Some";

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <A>({ show }: TC.Show<A>): TC.Show<Option<A>> => ({
  show: (ma) => (isNone(ma) ? "None" : `${"Some"}(${show(ma.value)})`),
});

export const getSetoid = <A>(S: TC.Setoid<A>): TC.Setoid<Option<A>> => ({
  equals: (a, b) =>
    a === b || isNone(a)
      ? isNone(b)
      : (isNone(b) ? false : S.equals(a.value, b.value)),
});

export const getOrd = <A>(O: TC.Ord<A>): TC.Ord<Option<A>> => ({
  ...getSetoid(O),
  lte: (a, b) =>
    a === b || isNone(a)
      ? isNone(b)
      : (isNone(b) ? false : O.lte(a.value, b.value)),
});

export const getSemigroup = <A>(
  S: TC.Semigroup<A>,
): TC.Semigroup<Option<A>> => ({
  concat: (x, y) =>
    isNone(x) ? y : isNone(y) ? x : of(S.concat(x.value, y.value)),
});

export const getMonoid = <A>(M: TC.Monoid<A>): TC.Monoid<Option<A>> => ({
  ...getSemigroup(M),
  empty: constNone,
});

export const getGroup = <A>(G: TC.Group<A>): TC.Group<Option<A>> => ({
  ...getMonoid(G),
  invert: (ta) => isNone(ta) ? ta : some(G.invert(ta.value)),
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Option<_>> = {
  map: (fab, ta) => isNone(ta) ? ta : some(fab(ta.value)),
};

export const Monad = D.createMonad<Option<_>>({
  of: some,
  chain: (fatb, ta) => (isSome(ta) ? fatb(ta.value) : ta),
});

export const Alt: TC.Alt<Option<_>> = {
  alt: (a, b) => (isSome(a) ? a : b),
  map: Functor.map,
};

export const Applicative: TC.Applicative<Option<_>> = {
  of: some,
  ap: Monad.ap,
  map: Functor.map,
};

export const Apply: TC.Apply<Option<_>> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Alternative: TC.Alternative<Option<_>> = {
  of: some,
  ap: Monad.ap,
  map: Functor.map,
  zero: constNone,
  alt: Alt.alt,
};

export const Chain: TC.Chain<Option<_>> = {
  ap: Monad.ap,
  map: Functor.map,
  chain: Monad.chain,
};

export const Extends: TC.Extend<Option<_>> = {
  map: Functor.map,
  extend: (ftab, ta) => some(ftab(ta)),
};

export const Filterable: TC.Filterable<Option<_>> = {
  filter: (predicate, ta) => isNone(ta) ? ta : predicate(ta.value) ? ta : none,
};

export const Foldable: TC.Foldable<Option<_>> = {
  reduce: (faba, a, tb) => (isSome(tb) ? faba(a, tb.value) : a),
};

export const Plus: TC.Plus<Option<_>> = {
  alt: Alt.alt,
  map: Functor.map,
  zero: constNone,
};

export const Traversable: TC.Traversable<Option<_>> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: (F, faub, ta) =>
    isNone(ta) ? F.of(none) : F.map(some, faub(ta.value)),
};

/***************************************************************************************************
 * @section Transformers
 **************************************************************************************************/

type GetOptionMonad = {
  <T, L extends 1>(M: TC.Monad<T, L>): TC.Monad<$<T, [Option<_>]>, L>;
  <T, L extends 2>(M: TC.Monad<T, L>): TC.Monad<$<T, [Option<_>]>, L>;
  <T, L extends 3>(M: TC.Monad<T, L>): TC.Monad<$<T, [Option<_>]>, L>;
};

/**
 * This is an experimental interface. Ideally, the substitution type would handle this
 * a bit better so we wouldn't have to do unsafe coercion.
 * @experimental
 */
export const getOptionM: GetOptionMonad = <T>(M: TC.Monad<T>) =>
  D.createMonad<$<T, [Option<_>]>>({
    of: (a) => M.of(some(a)) as any,
    chain: <A, B>(fatb: any, ta: any) =>
      M.chain(
        (e: Option<A>) => (isNone(e) ? M.of(none) : fatb(e.value)),
        ta,
      ) as any,
  }) as any;

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
