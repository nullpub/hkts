import { compose, identity } from "./fns.ts";
import { $, _ } from "./hkts.ts";
import * as SL from "./type-classes.ts";
import { pipe } from "./pipe.ts";

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

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const getOrElse = <B>(onNone: () => B, ta: Option<B>): B =>
  pipe(ta, fold(identity, onNone));

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
  map: (fab, ta) => pipe(ta, fold(compose(fab)(some), constNone)),
  join: (tta) => (isNone(tta) ? tta : tta.value),
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
  of: Monad.of,
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

export const fold = <A, B>(onSome: (a: A) => B, onNone: () => B) => (
  ta: Option<A>
): B => {
  switch (ta.tag) {
    case "None":
      return onNone();
    case "Some":
      return onSome(ta.value);
  }
};

export const of = some;

export const map = <A, B>(fab: (a: A) => B) => (ta: Option<A>): Option<B> =>
  Monad.map(fab, ta);

export const join = <A>(tta: Option<Option<A>>): Option<A> => Monad.join(tta);

export const chain = <A, B>(fatb: (a: A) => Option<B>) => (
  ta: Option<A>
): Option<B> => Monad.chain(fatb, ta);
