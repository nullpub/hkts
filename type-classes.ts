import { identity } from "./fns.ts";
import { $ } from "./hkts.ts";

/***************************************************************************************************
 * Type Classes
 * * * -> * Static Land
 * * * -> * -> * Static Land
 **************************************************************************************************/

/**
 * Alt
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#alt
 */
export type Alt<T> = Functor<T> & {
  alt: <A>(ta: $<T, [A]>, tb: $<T, [A]>) => $<T, [A]>;
};
export type Alt2<T> = Functor2<T> & {
  alt: <E, A>(ta: $<T, [E, A]>, tb: $<T, [E, A]>) => $<T, [E, A]>;
};

/**
 * Alternative
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#alternative
 */
export type Alternative<T> = Applicative<T> & Plus<T>;
export type Alternative2<T> = Applicative2<T> & Plus2<T>;

/**
 * Applicative
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#applicative
 */
export type Applicative<T> = Apply<T> & {
  of: <A>(a: A) => $<T, [A]>;
};
export type Applicative2<T> = Apply2<T> & {
  of: <E, A>(a: A) => $<T, [E, A]>;
};

/**
 * Apply
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#apply
 */
export type Apply<T> = Functor<T> & {
  ap: <A, B>(tfab: $<T, [(a: A) => B]>, ta: $<T, [A]>) => $<T, [B]>;
};
export type Apply2<T> = Functor2<T> & {
  ap: <E, A, B>(tfab: $<T, [E, (a: A) => B]>, ta: $<T, [E, A]>) => $<T, [E, B]>;
};

/**
 * Bifunctor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#bifunctor
 */
export type Bifunctor<T> = {
  bimap: <A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
    tac: $<T, [A, C]>
  ) => $<T, [B, D]>;
};

/**
 * Category
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#category
 */
export type Category<T> = Semigroupoid<T> & {
  id: <I, J>() => $<T, [I, J]>;
};

/**
 * Chain
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#chain
 */
export type Chain<T> = Apply<T> & {
  chain: <A, B>(fatb: (a: A) => $<T, [B]>, ta: $<T, [A]>) => $<T, [B]>;
};
export type Chain2<T> = Apply2<T> & {
  chain: <E, A, B>(
    fatb: (a: A) => $<T, [E, B]>,
    ta: $<T, [E, A]>
  ) => $<T, [E, B]>;
};

/**
 * ChainRec
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#chainrec
 *
 * @todo Confirm type
 */
export type ChainRec<T> = Chain<T> & {
  chainRec: <A, B, C>(
    f: (next: (a: A) => C, done: (b: B) => C, a: A) => $<T, [C]>,
    a: A
  ) => $<T, [B]>;
};
export type ChainRec2<T> = Chain2<T> & {
  chainRec: <E, A, B, C>(
    f: (next: (a: A) => C, done: (b: B) => C, a: A) => $<T, [E, C]>,
    a: A
  ) => $<T, [E, B]>;
};

/**
 * Comonad
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#comonad
 */
export type Comonad<T> = Extend<T> & {
  extract: <A>(ta: $<T, [A]>) => A;
};
export type Comonad2<T> = Extend2<T> & {
  extract: <E, A>(ta: $<T, [E, A]>) => A;
};

/**
 * Contravariant
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#contravariant
 */
export type Contravariant<T> = {
  contramap: <A, B>(fab: (a: A) => B, tb: $<T, [B]>) => $<T, [A]>;
};
export type Contravariant2<T> = {
  contramap: <E, A, B>(fab: (a: A) => B, tb: $<T, [E, B]>) => $<T, [E, A]>;
};

/**
 * Extend
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#extend
 */
export type Extend<T> = Functor<T> & {
  extend: <A, B>(ftab: (t: $<T, [A]>) => B, ta: $<T, [A]>) => $<T, [B]>;
};
export type Extend2<T> = Functor2<T> & {
  extend: <E, A, B>(
    ftab: (t: $<T, [E, A]>) => B,
    ta: $<T, [E, A]>
  ) => $<T, [E, B]>;
};

/**
 * Filterable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#filterable
 */
export type Filterable<T> = {
  filter: <A>(predicate: (x: A) => boolean, ta: $<T, [A]>) => $<T, [A]>;
};
export type Filterable2<T> = {
  filter: <E, A>(
    predicate: (x: A) => boolean,
    ta: $<T, [E, A]>
  ) => $<T, [E, A]>;
};

/**
 * Foldable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#foldable
 */
export type Foldable<T> = {
  reduce: <A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [B]>) => A;
};
export type Foldable2<T> = {
  reduce: <E, A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [E, B]>) => A;
};

/**
 * Functor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#functor
 */
export type Functor<T> = {
  map: <A, B>(fab: (a: A) => B, ta: $<T, [A]>) => $<T, [B]>;
};
export type Functor2<T> = {
  map: <E, A, B>(fab: (a: A) => B, ta: $<T, [E, A]>) => $<T, [E, B]>;
};

/**
 * Group
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#group
 */
export type Group<T> = Monoid<T> & {
  invert: (x: T) => T;
};

/**
 * Monad
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#monad
 */
export type Monad<T> = Applicative<T> &
  Chain<T> & {
    join: <A>(tta: $<T, [$<T, [A]>]>) => $<T, [A]>;
  };
export type Monad2<T> = Applicative2<T> &
  Chain2<T> & {
    join: <E, A>(tta: $<T, [E, $<T, [E, A]>]>) => $<T, [E, A]>;
  };

/**
 * Monoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#monoid
 */
export type Monoid<T> = Semigroup<T> & {
  empty: () => T;
};

/**
 * Ord
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#ord
 */
export type Ord<T> = Setoid<T> & {
  lte: (a: T, b: T) => boolean;
};

/**
 * Plus
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#plus
 */
export type Plus<T> = Alt<T> & {
  zero: <A>() => $<T, [A]>;
};
export type Plus2<T> = Alt2<T> & {
  zero: <E, A>() => $<T, [E, A]>;
};

/**
 * Profunctor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#profunctor
 */
export type Profunctor<T> = {
  promap: <A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D,
    tbc: $<T, [B, C]>
  ) => $<T, [A, D]>;
};

/**
 * Semigroup
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#semigroup
 */
export type Semigroup<T> = {
  concat: (a: T, b: T) => T;
};

/**
 * Semigroupoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#semigroupoid
 */
export type Semigroupoid<T> = {
  compose: <I, J, K>(tij: $<T, [I, J]>, tjk: $<T, [J, K]>) => $<T, [I, K]>;
};

/**
 * Setoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#setoid
 */
export type Setoid<T> = {
  equals: (a: T, b: T) => boolean;
};

/**
 * Show
 * Take a type and prints a string for it.
 */
export type Show<T> = {
  show: (t: T) => string;
};

/**
 * Traversable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#traversable
 */
export type Traversable<T> = Functor<T> &
  Foldable<T> & {
    traverse: <U, A, B>(
      A: Applicative<U>,
      faUb: (a: A) => $<U, [B]>,
      Ta: $<T, [A]>
    ) => $<U, [$<T, [B]>]>;
  };
export type Traversable2<T> = Functor2<T> &
  Foldable2<T> & {
    traverse: <U, E, A, B>(
      A: Applicative<U>,
      faUb: (a: A) => $<U, [B]>,
      Ta: $<T, [E, A]>
    ) => $<U, [$<T, [E, B]>]>;
  };

/***************************************************************************************************
 * @section Pipeable
 **************************************************************************************************/

/**
 * Pipeable Alt
 */
export type AltP<T> = FunctorP<T> & {
  alt: <A>(ta: $<T, [A]>) => (tb: $<T, [A]>) => $<T, [A]>;
};
export type Alt2P<T> = Functor2P<T> & {
  alt: <E, A>(ta: $<T, [E, A]>) => (tb: $<T, [E, A]>) => $<T, [E, A]>;
};

/**
 * Pipeable Applicative
 */
export type ApplicativeP<T> = ApplyP<T> & {
  of: <A>(a: A) => $<T, [A]>;
};
export type Applicative2P<T> = Apply2P<T> & {
  of: <E, A>(a: A) => $<T, [E, A]>;
};

/**
 * Pipeable Apply
 */
export type ApplyP<T> = FunctorP<T> & {
  ap: <A, B>(tfab: $<T, [(a: A) => B]>) => (ta: $<T, [A]>) => $<T, [B]>;
};
export type Apply2P<T> = Functor2P<T> & {
  ap: <E, A, B>(
    tfab: $<T, [E, (a: A) => B]>
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
};

/**
 * Pipeable Bifunctor
 */
export type BifunctorP<T> = {
  bimap: <A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D
  ) => (tac: $<T, [A, C]>) => $<T, [B, D]>;
};

/**
 * Pipeable Chain
 */
export type ChainP<T> = ApplyP<T> & {
  chain: <A, B>(fatb: (a: A) => $<T, [B]>) => (ta: $<T, [A]>) => $<T, [B]>;
};
export type Chain2P<T> = Apply2P<T> & {
  chain: <E, A, B>(
    fatb: (a: A) => $<T, [E, B]>
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
};

/**
 * Pipeable Contravariant
 */
export type ContravariantP<T> = {
  contramap: <A, B>(fab: (a: A) => B) => (tb: $<T, [B]>) => $<T, [A]>;
};
export type Contravariant2P<T> = {
  contramap: <E, A, B>(fab: (a: A) => B) => (tb: $<T, [E, B]>) => $<T, [E, A]>;
};

/**
 * Pipeable Extend
 */
export type ExtendP<T> = FunctorP<T> & {
  extend: <A, B>(ftab: (t: $<T, [A]>) => B) => (ta: $<T, [A]>) => $<T, [B]>;
};
export type Extend2P<T> = Functor2P<T> & {
  extend: <E, A, B>(
    ftab: (t: $<T, [E, A]>) => B
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
};

/**
 * Pipeable Filterable
 */
export type FilterableP<T> = {
  filter: <A>(predicate: (x: A) => boolean) => (ta: $<T, [A]>) => $<T, [A]>;
};
export type Filterable2P<T> = {
  filter: <E, A>(
    predicate: (x: A) => boolean
  ) => (ta: $<T, [E, A]>) => $<T, [E, A]>;
};

/**
 * Pipeable Foldable
 */
export type FoldableP<T> = {
  reduce: <A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [B]>) => A;
};
export type Foldable2P<T> = {
  reduce: <E, A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [E, B]>) => A;
};

/**
 * Pipeable Functor
 */
export type FunctorP<T> = {
  map: <A, B>(fab: (a: A) => B) => (ta: $<T, [A]>) => $<T, [B]>;
};
export type Functor2P<T> = {
  map: <E, A, B>(fab: (a: A) => B) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
};

/**
 * Pipeable Monad
 */
export type MonadP<T> = ApplicativeP<T> &
  ChainP<T> & {
    join: <A>(tta: $<T, [$<T, [A]>]>) => $<T, [A]>;
  };
export type Monad2P<T> = Applicative2P<T> &
  Chain2P<T> & {
    join: <E, A>(tta: $<T, [E, $<T, [E, A]>]>) => $<T, [E, A]>;
  };

/**
 * Pipeable Profunctor
 */
export type ProfunctorP<T> = {
  promap: <A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D
  ) => (tbc: $<T, [B, C]>) => $<T, [A, D]>;
};

/**
 * Pipeable Semigroupoid
 */
export type SemigroupoidP<T> = {
  compose: <I, J, K>(tij: $<T, [I, J]>) => (tjk: $<T, [J, K]>) => $<T, [I, K]>;
};

/**
 * Pipeable Traversable
 */
export type TraversableP<T> = FunctorP<T> &
  FoldableP<T> & {
    traverse: <U, A, B>(
      A: Applicative<U>,
      faub: (a: A) => $<U, [B]>
    ) => (ta: $<T, [A]>) => $<U, [$<T, [B]>]>;
  };
export type Traversable2P<T> = Functor2P<T> &
  Foldable2P<T> & {
    traverse: <U, E, A, B>(
      A: Applicative<U>,
      faub: (a: A) => $<U, [B]>
    ) => (ta: $<T, [E, A]>) => $<U, [$<T, [E, B]>]>;
  };

/***************************************************************************************************
 * @section Composition
 **************************************************************************************************/

/***************************************************************************************************
 * @section Derivations
 **************************************************************************************************/

/**
 * Derive Monad from of, map, and join.
 */
export function createMonad<T>({
  of,
  chain,
}: Pick<Monad<T>, "of" | "chain">): Monad<T> {
  const map: Functor<T>["map"] = (fab, ta) => chain((a) => of(fab(a)), ta);
  return {
    of,
    map,
    chain,
    join: (tta) => chain(identity, tta),
    ap: (tfab, ta) => chain((f) => map(f, ta), tfab),
  };
}

/**
 * Derive Monad2 from of, map, and join.
 */
export function createMonad2<T>(M: Pick<Monad2<T>, "of" | "chain">): Monad2<T> {
  return createMonad<T>(M as Monad<T>) as Monad2<T>;
}

/**
 * Derive MonadP from Monad.
 */
export function createPipeableMonad<T>({
  of,
  ap,
  map,
  join,
  chain,
}: Monad<T>): MonadP<T> {
  return {
    of,
    join,
    map: (fab) => (ta) => map(fab, ta),
    chain: (fatb) => (ta) => chain(fatb, ta),
    ap: (tfab) => (ta) => ap(tfab, ta),
  };
}
export function createPipeableMonad2<T>(M: Monad2<T>): Monad2P<T> {
  return createPipeableMonad<T>(M as any) as Monad2P<T>;
}

/**
 * Derive TraversableP from Traversable.
 */
export function createPipeableTraversable<T>({
  traverse,
  reduce,
  map,
}: Traversable<T>): TraversableP<T> {
  return {
    map: (fab) => (ta) => map(fab, ta),
    reduce: (faba, a) => (ta) => reduce(faba, a, ta),
    traverse: (A, faub) => (ta) => traverse(A, faub, ta),
  };
}
export function createPipeableTraversable2<T>(
  M: Traversable2<T>
): Traversable2P<T> {
  return createPipeableTraversable<T>(M as any) as Traversable2P<T>;
}

/**
 * Derive BifunctorP from Bifunctor.
 */
export function createPipeableBifunctor<T>({
  bimap,
}: Bifunctor<T>): BifunctorP<T> {
  return {
    bimap: (fab, fcd) => (tac) => bimap(fab, fcd, tac),
  };
}
