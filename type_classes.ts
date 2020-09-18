import type { Predicate } from "./fns.ts";
import type { $ } from "./hkts.ts";

/***************************************************************************************************
 * Type Classes
 * * * -> * Static Land
 * * * -> * -> * Static Land
 * * * -> * -> * -> * Static Land
 **************************************************************************************************/

/**
 * Current supported typeclass lengths
 */
export type LS = 1 | 2 | 3;

/**
 * Compute the resultant typeclass length for typeclass composition
 */
export type AddLength<A extends LS, B extends LS> = {
  1: {
    1: 1;
    2: 2;
    3: 3;
  }[B];
  2: {
    1: 2;
    2: 3;
    3: never;
  }[B];
  3: {
    1: 3;
    2: never;
    3: never;
  }[B];
}[A];

/**
 * Alt
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#alt
 */
export type Alt<T, L extends LS = 1> = Functor<T, L> & {
  alt: AltFn<T, L>;
};

export type AltFn<T, L extends LS> = {
  1: <A>(ta: $<T, [A]>, tb: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(ta: $<T, [E, A]>, tb: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(ta: $<T, [R, E, A]>, tb: $<T, [R, E, A]>) => $<T, [R, E, A]>;
}[L];

/**
 * Alternative
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#alternative
 */
export type Alternative<T, L extends LS = 1> = Applicative<T, L> & Plus<T, L>;

/**
 * Applicative
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#applicative
 */
export type Applicative<T, L extends LS = 1> = Apply<T, L> & {
  of: ApplicativeFn<T, L>;
};

export type ApplicativeFn<T, L extends LS> = {
  1: <A>(a: A) => $<T, [A]>;
  2: <E, A>(a: A) => $<T, [E, A]>;
  3: <R, E, A>(a: A) => $<T, [R, E, A]>;
}[L];

/**
 * Apply
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#apply
 */
export type Apply<T, L extends LS = 1> = Functor<T, L> & {
  ap: ApplyFn<T, L>;
};

export type ApplyFn<T, L extends LS> = {
  1: <A, B>(tfab: $<T, [(a: A) => B]>, ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(tfab: $<T, [E, (a: A) => B]>, ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    tfab: $<T, [R, E, (a: A) => B]>,
    ta: $<T, [R, E, A]>,
  ) => $<T, [R, E, B]>;
}[L];

/**
 * Bifunctor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#bifunctor
 */
export type Bifunctor<T> = {
  bimap: <A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
    tac: $<T, [A, C]>,
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
export type Chain<T, L extends LS = 1> = Apply<T, L> & {
  chain: ChainFn<T, L>;
};

export type ChainFn<T, L extends LS> = {
  1: <A, B>(fatb: (a: A) => $<T, [B]>, ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(fatb: (a: A) => $<T, [E, B]>, ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    fatb: (a: A) => $<T, [R, E, B]>,
    ta: $<T, [R, E, A]>,
  ) => $<T, [R, E, B]>;
}[L];

/**
 * ChainRec
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#chainrec
 *
 * @todo Confirm type
 */
export type ChainRec<T, L extends LS = 1> = Chain<T, L> & {
  chainRec: ChainRecFn<T, L>;
};

export type ChainRecFn<T, L extends LS> = {
  1: <A, B, C>(
    f: (next: (a: A) => C, done: (b: B) => C, a: A) => $<T, [C]>,
    a: A,
  ) => $<T, [B]>;
  2: <E, A, B, C>(
    f: (next: (a: A) => C, done: (b: B) => C, a: A) => $<T, [E, C]>,
    a: A,
  ) => $<T, [E, B]>;
  3: <R, E, A, B, C>(
    f: (next: (a: A) => C, done: (b: B) => C, a: A) => $<T, [R, E, C]>,
    a: A,
  ) => $<T, [R, E, B]>;
}[L];

/**
 * Comonad
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#comonad
 */
export type Comonad<T, L extends LS = 1> = Extend<T, L> & {
  extract: ComonadFn<T, L>;
};

export type ComonadFn<T, L extends LS> = {
  1: <A>(ta: $<T, [A]>) => A;
  2: <E, A>(ta: $<T, [E, A]>) => A;
  3: <R, E, A>(ta: $<T, [R, E, A]>) => A;
}[L];

/**
 * Contravariant
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#contravariant
 */
export type Contravariant<T, L extends LS = 1> = {
  contramap: ContravariantFn<T, L>;
};

export type ContravariantFn<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B, tb: $<T, [B]>) => $<T, [A]>;
  2: <E, A, B>(fab: (a: A) => B, tb: $<T, [E, B]>) => $<T, [E, A]>;
  3: <R, E, A, B>(fab: (a: A) => B, tb: $<T, [R, E, B]>) => $<T, [R, E, A]>;
}[L];

/**
 * Extend
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#extend
 */
export type Extend<T, L extends LS = 1> = Functor<T, L> & {
  extend: ExtendFn<T, L>;
};

export type ExtendFn<T, L extends LS> = {
  1: <A, B>(ftab: (t: $<T, [A]>) => B, ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(ftab: (t: $<T, [E, A]>) => B, ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    ftab: (t: $<T, [R, E, A]>) => B,
    ta: $<T, [R, E, A]>,
  ) => $<T, [R, E, B]>;
}[L];

/**
 * Filterable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#filterable
 */
export type Filterable<T, L extends LS = 1> = {
  filter: FilterableFn<T, L>;
};

export type FilterableFn<T, L extends LS> = {
  1: <A>(predicate: Predicate<A>, ta: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(predicate: Predicate<A>, ta: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(predicate: Predicate<A>, ta: $<T, [R, E, A]>) => $<T, [R, E, A]>;
}[L];

/**
 * Foldable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#foldable
 */

export type Foldable<T, L extends LS = 1> = {
  reduce: FoldableFn<T, L>;
};

export type FoldableFn<T, L extends LS> = {
  1: <A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [R, E, B]>) => A;
}[L];

/**
 * Functor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#functor
 */
export type Functor<T, L extends LS = 1> = {
  map: FunctorFn<T, L>;
};

export type FunctorFn<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B, ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(fab: (a: A) => B, ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(fab: (a: A) => B, ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

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
export type MonadFn<T, L extends LS> = {
  1: <A>(tta: $<T, [$<T, [A]>]>) => $<T, [A]>;
  2: <E, A>(tta: $<T, [E, $<T, [E, A]>]>) => $<T, [E, A]>;
  3: <R, E, A>(tta: $<T, [R, E, $<T, [R, E, A]>]>) => $<T, [R, E, A]>;
}[L];

export type Monad<T, L extends LS = 1> =
  & Applicative<T, L>
  & Chain<T, L>
  & {
    join: MonadFn<T, L>;
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
export type PlusFn<T, L extends LS> = {
  1: <A>() => $<T, [A]>;
  2: <E, A>() => $<T, [E, A]>;
  3: <R, E, A>() => $<T, [R, E, A]>;
}[L];

export type Plus<T, L extends LS = 1> = Alt<T, L> & {
  zero: PlusFn<T, L>;
};

/**
 * Profunctor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#profunctor
 */
export type Profunctor<T> = {
  promap: <A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D,
    tbc: $<T, [B, C]>,
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
export type TraversableFn<T, L extends LS> = {
  1: <U, A, B>(
    A: Applicative<U>,
    faUb: (a: A) => $<U, [B]>,
    Ta: $<T, [A]>,
  ) => $<U, [$<T, [B]>]>;
  2: <U, E, A, B>(
    A: Applicative<U>,
    faUb: (a: A) => $<U, [B]>,
    Ta: $<T, [E, A]>,
  ) => $<U, [$<T, [E, B]>]>;
  3: <U, R, E, A, B>(
    A: Applicative<U>,
    faUb: (a: A) => $<U, [B]>,
    Ta: $<T, [R, E, A]>,
  ) => $<U, [$<T, [R, E, B]>]>;
}[L];

export type Traversable<T, L extends LS = 1> =
  & Functor<T, L>
  & Foldable<T, L>
  & {
    traverse: TraversableFn<T, L>;
  };

/***************************************************************************************************
 * @section Pipeable
 **************************************************************************************************/

/**
 * Pipeable Alt
 */
export type AltFnP<T, L extends LS> = {
  1: <A>(ta: $<T, [A]>) => (tb: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(ta: $<T, [E, A]>) => (tb: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(ta: $<T, [R, E, A]>) => (tb: $<T, [R, E, A]>) => $<T, [R, E, A]>;
}[L];

export type AltP<T, L extends LS = 1> = FunctorP<T, L> & {
  alt: AltFnP<T, L>;
};

/**
 * Pipeable Applicative
 */
export type ApplicativeFnP<T, L extends LS> = {
  1: <A>(a: A) => $<T, [A]>;
  2: <E, A>(a: A) => $<T, [E, A]>;
  3: <R, E, A>(a: A) => $<T, [R, E, A]>;
}[L];

export type ApplicativeP<T, L extends LS = 1> = ApplyP<T, L> & {
  of: ApplicativeFnP<T, L>;
};

/**
 * Pipeable Apply
 */
export type ApplyFnP<T, L extends LS> = {
  1: <A, B>(tfab: $<T, [(a: A) => B]>) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    tfab: $<T, [E, (a: A) => B]>,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    tfab: $<T, [R, E, (a: A) => B]>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

export type ApplyP<T, L extends LS = 1> = FunctorP<T, L> & {
  ap: ApplyFnP<T, L>;
};

/**
 * Pipeable Bifunctor
 */
export type BifunctorP<T> = {
  bimap: <A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
  ) => (tac: $<T, [A, C]>) => $<T, [B, D]>;
};

/**
 * Pipeable Chain
 */
export type ChainFnP<T, L extends LS> = {
  1: <A, B>(fatb: (a: A) => $<T, [B]>) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    fatb: (a: A) => $<T, [E, B]>,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    fatb: (a: A) => $<T, [R, E, B]>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

export type ChainP<T, L extends LS = 1> = ApplyP<T, L> & {
  chain: ChainFnP<T, L>;
};

/**
 * Pipeable Contravariant
 */
export type ContravariantFnP<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B) => (tb: $<T, [B]>) => $<T, [A]>;
  2: <E, A, B>(fab: (a: A) => B) => (tb: $<T, [E, B]>) => $<T, [E, A]>;
  3: <R, E, A, B>(fab: (a: A) => B) => (tb: $<T, [R, E, B]>) => $<T, [R, E, A]>;
}[L];

export type ContravariantP<T, L extends LS = 1> = {
  contramap: ContravariantFnP<T, L>;
};

/**
 * Pipeable Extend
 */
export type ExtendFnP<T, L extends LS> = {
  1: <A, B>(ftab: (t: $<T, [A]>) => B) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    ftab: (t: $<T, [E, A]>) => B,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    ftab: (t: $<T, [R, E, A]>) => B,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

export type ExtendP<T, L extends LS = 1> = FunctorP<T, L> & {
  extend: ExtendFnP<T, L>;
};

/**
 * Pipeable Filterable
 */
export type FilterableFnP<T, L extends LS> = {
  1: <A>(predicate: Predicate<A>) => (ta: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(predicate: Predicate<A>) => (ta: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(
    predicate: Predicate<A>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, A]>;
}[L];

export type FilterableP<T, L extends LS = 1> = {
  filter: FilterableFnP<T, L>;
};

/**
 * Pipeable Foldable
 */
export type FoldableFnP<T, L extends LS> = {
  1: <A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [R, E, B]>) => A;
}[L];

export type FoldableP<T, L extends LS = 1> = {
  reduce: FoldableFnP<T, L>;
};

/**
 * Pipeable Functor
 */
export type FunctorFnP<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(fab: (a: A) => B) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(fab: (a: A) => B) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

export type FunctorP<T, L extends LS = 1> = {
  map: FunctorFnP<T, L>;
};

/**
 * Pipeable Monad
 */
export type MonadFnP<T, L extends LS> = {
  1: <A>(tta: $<T, [$<T, [A]>]>) => $<T, [A]>;
  2: <E, A>(tta: $<T, [E, $<T, [E, A]>]>) => $<T, [E, A]>;
  3: <R, E, A>(tta: $<T, [R, E, $<T, [R, E, A]>]>) => $<T, [R, E, A]>;
}[L];

export type MonadP<T, L extends LS = 1> =
  & ApplicativeP<T, L>
  & ChainP<T, L>
  & {
    join: MonadFnP<T, L>;
  };

/**
 * Pipeable Profunctor
 */
export type ProfunctorP<T> = {
  promap: <A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D,
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
export type TraversableFnP<T, L extends LS> = {
  1: <U, A, B>(
    A: Applicative<U>,
    faub: (a: A) => $<U, [B]>,
  ) => (ta: $<T, [A]>) => $<U, [$<T, [B]>]>;
  2: <U, E, A, B>(
    A: Applicative<U>,
    faub: (a: A) => $<U, [B]>,
  ) => (ta: $<T, [E, A]>) => $<U, [$<T, [E, B]>]>;
  3: <U, R, E, A, B>(
    A: Applicative<U>,
    faub: (a: A) => $<U, [B]>,
  ) => (ta: $<T, [R, E, A]>) => $<U, [$<T, [R, E, B]>]>;
}[L];

export type TraversableP<T, L extends LS = 1> =
  & FunctorP<T, L>
  & FoldableP<T, L>
  & {
    traverse: TraversableFnP<T, L>;
  };
