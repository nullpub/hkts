import { isNotNil, Lazy, Predicate } from "./fns.ts";
import * as SL from "./type-classes.ts";
import { _ } from "./hkts.ts";

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

export const getShow = <A>({ show }: SL.Show<A>): SL.Show<Option<A>> => ({
  show: (ma) => (isNone(ma) ? "None" : `${"Some"}(${show(ma.value)})`),
});

export const fromNullable = <A>(a: A): Option<NonNullable<A>> =>
  isNotNil(a) ? some(a) : none;

export const fromPredicate = <A>(predicate: Predicate<A>) => (
  a: A
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

export const fold = <A, B>(onSome: (a: A) => B, onNone: () => B) => (
  ta: Option<A>
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

export const mapNullable = <A, B>(f: (a: A) => B | null | undefined) => (
  ma: Option<A>
): Option<B> => (isNone(ma) ? none : fromNullable(f(ma.value)));

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isNone = <A>(m: Option<A>): m is None => m.tag === "None";
export const isSome = <A>(m: Option<A>): m is Some<A> => m.tag === "Some";

/***************************************************************************************************
 * @section Instances
 **************************************************************************************************/

export const Monad = SL.createMonad<Option<_>>({
  of: some,
  chain: (fatb, ta) => (isSome(ta) ? fatb(ta.value) : ta),
});

export const Applicative: SL.Applicative<Option<_>> = {
  of: some,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: SL.Apply<Option<_>> = {
  ap: Monad.ap,
  map: Monad.map,
};

export const Alternative: SL.Alternative<Option<_>> = {
  of: some,
  ap: Monad.ap,
  map: Monad.map,
  zero: constNone,
  alt: (a, b) => (isSome(a) ? a : b),
};

export const Foldable: SL.Foldable<Option<_>> = {
  reduce: (faba, a, tb) => (isSome(tb) ? faba(a, tb.value) : a),
};

export const Traversable: SL.Traversable<Option<_>> = {
  map: Monad.map,
  reduce: Foldable.reduce,
  traverse: (F, faub, ta) =>
    isNone(ta) ? F.of(none) : F.map(some, faub(ta.value)),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = SL.createPipeableMonad(Monad);

export const { reduce, traverse } = SL.createPipeableTraversable(Traversable);
