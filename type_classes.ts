import type { $, Predicate } from "./types.ts";

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
  readonly alt: AltFn<T, L>;
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
  readonly of: ApplicativeFn<T, L>;
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
  readonly ap: ApplyFn<T, L>;
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
export type Bifunctor<T, L extends LS = 2> = {
  readonly bimap: BifunctorFn<T, L>;
  readonly mapLeft: BifunctorMapFn<T, L>;
};

export type BifunctorFn<T, L extends LS> = {
  1: never;
  2: <A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
    tac: $<T, [A, C]>,
  ) => $<T, [B, D]>;
  3: <R, A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
    tac: $<T, [R, A, C]>,
  ) => $<T, [R, B, D]>;
}[L];

export type BifunctorMapFn<T, L extends LS> = {
  1: never;
  2: <E, F, A>(
    fef: (e: E) => F,
    tea: $<T, [E, A]>,
  ) => $<T, [F, A]>;
  3: <R, E, F, A>(
    fef: (e: E) => F,
    tea: $<T, [R, E, A]>,
  ) => $<T, [R, F, A]>;
}[L];

/**
 * Category
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#category
 */
export type Category<T> = Semigroupoid<T> & {
  readonly id: <I, J>() => $<T, [I, J]>;
};

/**
 * Chain
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#chain
 */
export type Chain<T, L extends LS = 1> = Apply<T, L> & {
  readonly chain: ChainFn<T, L>;
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
  readonly chainRec: ChainRecFn<T, L>;
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
  readonly extract: ComonadFn<T, L>;
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
  readonly contramap: ContravariantFn<T, L>;
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
  readonly extend: ExtendFn<T, L>;
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
  readonly filter: FilterableFn<T, L>;
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
  readonly reduce: FoldableFn<T, L>;
};

export type FoldableFn<T, L extends LS> = {
  1: <A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(faba: (a: A, b: B) => A, a: A, tb: $<T, [R, E, B]>) => A;
}[L];

/**
 * IndexedFoldable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#foldable
 */

export type IndexedFoldable<T, L extends LS = 1, I = number> = {
  readonly reduce: IndexedFoldableFn<T, L, I>;
};

export type IndexedFoldableFn<T, L extends LS, I> = {
  1: <A, B>(faba: (a: A, b: B, i: I) => A, a: A, tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B, i: I) => A, a: A, tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(
    faba: (a: A, b: B, i: I) => A,
    a: A,
    tb: $<T, [R, E, B]>,
  ) => A;
}[L];

/**
 * Functor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#functor
 */
export type Functor<T, L extends LS = 1> = {
  readonly map: FunctorFn<T, L>;
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
  readonly invert: (x: T) => T;
};

/**
 * Monad
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#monad
 */
export type Monad<T, L extends LS = 1> =
  & Applicative<T, L>
  & Chain<T, L>
  & {
    readonly join: MonadFn<T, L>;
  };

export type MonadFn<T, L extends LS> = {
  1: <A>(tta: $<T, [$<T, [A]>]>) => $<T, [A]>;
  2: <E, A>(tta: $<T, [E, $<T, [E, A]>]>) => $<T, [E, A]>;
  3: <R, E, A>(tta: $<T, [R, E, $<T, [R, E, A]>]>) => $<T, [R, E, A]>;
}[L];

/**
 * MonadThrow
 * https://github.com/gcanti/fp-ts/blob/master/src/MonadThrow.ts
 */
export type MonadThrow<T, L extends LS = 1> = Monad<T, L> & {
  readonly throwError: MonadThrowFn<T, L>;
};

export type MonadThrowFn<T, L extends LS> = {
  1: <E, A>(e: E) => $<T, [A]>;
  2: <E, A>(e: E) => $<T, [E, A]>;
  3: <R, E, A>(e: E) => $<T, [R, E, A]>;
}[L];

/**
 * Monoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#monoid
 */
export type Monoid<T> = Semigroup<T> & {
  readonly empty: () => T;
};

/**
 * Ord
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#ord
 */
export type Ord<T> = Setoid<T> & {
  readonly lte: (a: T, b: T) => boolean;
};

/**
 * Plus
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#plus
 */
export type Plus<T, L extends LS = 1> = Alt<T, L> & {
  readonly zero: PlusFn<T, L>;
};

export type PlusFn<T, L extends LS> = {
  1: <A>() => $<T, [A]>;
  2: <E, A>() => $<T, [E, A]>;
  3: <R, E, A>() => $<T, [R, E, A]>;
}[L];

/**
 * Profunctor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#profunctor
 */
export type Profunctor<T> = {
  readonly promap: <A, B, C, D>(
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
  readonly concat: (a: T, b: T) => T;
};

/**
 * Semigroupoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#semigroupoid
 */
export type Semigroupoid<T> = {
  readonly compose: <I, J, K>(
    tij: $<T, [I, J]>,
    tjk: $<T, [J, K]>,
  ) => $<T, [I, K]>;
};

/**
 * Setoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#setoid
 */
export type Setoid<T> = {
  readonly equals: (a: T, b: T) => boolean;
};

/**
 * Show
 * Take a type and prints a string for it.
 */
export type Show<T> = {
  readonly show: (t: T) => string;
};

/**
 * Traversable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#traversable
 */
export type Traversable<T, L extends LS = 1> =
  & Functor<T, L>
  & Foldable<T, L>
  & {
    readonly traverse: TraversableFn<T, L>;
  };

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

/**
 * Traversable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#traversable
 */
export type IndexedTraversable<T, L extends LS = 1, I = number> =
  & Functor<T, L>
  & IndexedFoldable<T, L, I>
  & {
    readonly traverse: IndexedTraversableFn<T, L, I>;
  };

export type IndexedTraversableFn<T, L extends LS, I> = {
  1: <U, A, B>(
    A: Applicative<U>,
    faUb: (a: A, i: I) => $<U, [B]>,
    Ta: $<T, [A]>,
  ) => $<U, [$<T, [B]>]>;
  2: <U, E, A, B>(
    A: Applicative<U>,
    faUb: (a: A, i: I) => $<U, [B]>,
    Ta: $<T, [E, A]>,
  ) => $<U, [$<T, [E, B]>]>;
  3: <U, R, E, A, B>(
    A: Applicative<U>,
    faUb: (a: A, i: I) => $<U, [B]>,
    Ta: $<T, [R, E, A]>,
  ) => $<U, [$<T, [R, E, B]>]>;
}[L];

/***************************************************************************************************
 * @section Pipeable
 **************************************************************************************************/

/**
 * Pipeable Alt
 */
export type AltP<T, L extends LS = 1> = FunctorP<T, L> & {
  readonly alt: AltFnP<T, L>;
};

export type AltFnP<T, L extends LS> = {
  1: <A>(ta: $<T, [A]>) => (tb: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(ta: $<T, [E, A]>) => (tb: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(ta: $<T, [R, E, A]>) => (tb: $<T, [R, E, A]>) => $<T, [R, E, A]>;
}[L];

/**
 * Pipeable Applicative
 */
export type ApplicativeP<T, L extends LS = 1> = ApplyP<T, L> & {
  readonly of: ApplicativeFnP<T, L>;
};

export type ApplicativeFnP<T, L extends LS> = {
  1: <A>(a: A) => $<T, [A]>;
  2: <E, A>(a: A) => $<T, [E, A]>;
  3: <R, E, A>(a: A) => $<T, [R, E, A]>;
}[L];

/**
 * Pipeable Apply
 */
export type ApplyP<T, L extends LS = 1> = FunctorP<T, L> & {
  readonly ap: ApplyFnP<T, L>;
};

export type ApplyFnP<T, L extends LS> = {
  1: <A, B>(tfab: $<T, [(a: A) => B]>) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    tfab: $<T, [E, (a: A) => B]>,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    tfab: $<T, [R, E, (a: A) => B]>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

/**
 * Pipeable Bifunctor
 */
export type BifunctorP<T, L extends LS = 2> = {
  readonly bimap: BifunctorFnP<T, L>;
  readonly mapLeft: BifunctorMapFnP<T, L>;
};

export type BifunctorFnP<T, L extends LS> = {
  1: never;
  2: <A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
  ) => (
    tac: $<T, [A, C]>,
  ) => $<T, [B, D]>;
  3: <R, A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
  ) => (
    tac: $<T, [R, A, C]>,
  ) => $<T, [R, B, D]>;
}[L];

export type BifunctorMapFnP<T, L extends LS> = {
  1: never;
  2: <E, F, A>(
    fef: (e: E) => F,
  ) => (
    tea: $<T, [E, A]>,
  ) => $<T, [F, A]>;
  3: <R, E, F, A>(
    fef: (e: E) => F,
  ) => (
    tea: $<T, [R, E, A]>,
  ) => $<T, [R, F, A]>;
}[L];

/**
 * Pipeable Chain
 */
export type ChainP<T, L extends LS = 1> = ApplyP<T, L> & {
  readonly chain: ChainFnP<T, L>;
};

export type ChainFnP<T, L extends LS> = {
  1: <A, B>(fatb: (a: A) => $<T, [B]>) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    fatb: (a: A) => $<T, [E, B]>,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    fatb: (a: A) => $<T, [R, E, B]>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

/**
 * Pipeable Contravariant
 */
export type ContravariantP<T, L extends LS = 1> = {
  readonly contramap: ContravariantFnP<T, L>;
};

export type ContravariantFnP<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B) => (tb: $<T, [B]>) => $<T, [A]>;
  2: <E, A, B>(fab: (a: A) => B) => (tb: $<T, [E, B]>) => $<T, [E, A]>;
  3: <R, E, A, B>(fab: (a: A) => B) => (tb: $<T, [R, E, B]>) => $<T, [R, E, A]>;
}[L];

/**
 * Pipeable Extend
 */
export type ExtendP<T, L extends LS = 1> = FunctorP<T, L> & {
  readonly extend: ExtendFnP<T, L>;
};

export type ExtendFnP<T, L extends LS> = {
  1: <A, B>(ftab: (t: $<T, [A]>) => B) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    ftab: (t: $<T, [E, A]>) => B,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    ftab: (t: $<T, [R, E, A]>) => B,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

/**
 * Pipeable Filterable
 */
export type FilterableP<T, L extends LS = 1> = {
  readonly filter: FilterableFnP<T, L>;
};

export type FilterableFnP<T, L extends LS> = {
  1: <A>(predicate: Predicate<A>) => (ta: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(predicate: Predicate<A>) => (ta: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(
    predicate: Predicate<A>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, A]>;
}[L];

/**
 * Pipeable Foldable
 */
export type FoldableP<T, L extends LS = 1> = {
  readonly reduce: FoldableFnP<T, L>;
};

export type FoldableFnP<T, L extends LS> = {
  1: <A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [R, E, B]>) => A;
}[L];

/**
 * Pipeable IndexedFoldable
 */
export type IndexedFoldableP<T, L extends LS = 1, I = number> = {
  readonly reduce: IndexedFoldableFnP<T, L, I>;
};

export type IndexedFoldableFnP<T, L extends LS, I> = {
  1: <A, B>(faba: (a: A, b: B, i: I) => A, a: A) => (tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B, i: I) => A, a: A) => (tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(
    faba: (a: A, b: B, i: I) => A,
    a: A,
  ) => (tb: $<T, [R, E, B]>) => A;
}[L];

/**
 * Pipeable Functor
 */
export type FunctorP<T, L extends LS = 1> = {
  readonly map: FunctorFnP<T, L>;
};

export type FunctorFnP<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(fab: (a: A) => B) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(fab: (a: A) => B) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
}[L];

/**
 * Pipeable Monad
 */
export type MonadP<T, L extends LS = 1> =
  & ApplicativeP<T, L>
  & ChainP<T, L>
  & {
    readonly join: MonadFnP<T, L>;
  };

export type MonadFnP<T, L extends LS> = {
  1: <A>(tta: $<T, [$<T, [A]>]>) => $<T, [A]>;
  2: <E, A>(tta: $<T, [E, $<T, [E, A]>]>) => $<T, [E, A]>;
  3: <R, E, A>(tta: $<T, [R, E, $<T, [R, E, A]>]>) => $<T, [R, E, A]>;
}[L];

/**
 * Pipeable MonadThrow
 * https://github.com/gcanti/fp-ts/blob/master/src/MonadThrow.ts
 */
export type MonadThrowP<T, L extends LS = 1> = MonadP<T, L> & {
  readonly throwError: MonadThrowFnP<T, L>;
};

export type MonadThrowFnP<T, L extends LS> = {
  1: <E, A>(e: E) => $<T, [A]>;
  2: <E, A>(e: E) => $<T, [E, A]>;
  3: <R, E, A>(e: E) => $<T, [R, E, A]>;
}[L];

/**
 * Pipeable Profunctor
 */
export type ProfunctorP<T> = {
  readonly promap: <A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D,
  ) => (tbc: $<T, [B, C]>) => $<T, [A, D]>;
};

/**
 * Pipeable Semigroupoid
 */
export type SemigroupoidP<T> = {
  readonly compose: <I, J, K>(
    tij: $<T, [I, J]>,
  ) => (tjk: $<T, [J, K]>) => $<T, [I, K]>;
};

/**
 * Pipeable Traversable
 */
export type TraversableP<T, L extends LS = 1> =
  & FunctorP<T, L>
  & FoldableP<T, L>
  & {
    readonly traverse: TraversableFnP<T, L>;
  };

export type TraversableFnP<T, L extends LS> = {
  1: <U>(
    A: Applicative<U>,
  ) => <A, B>(
    faub: (a: A) => $<U, [B]>,
  ) => (ta: $<T, [A]>) => $<U, [$<T, [B]>]>;
  2: <U>(
    A: Applicative<U>,
  ) => <A, B>(
    faub: (a: A) => $<U, [B]>,
  ) => <E>(ta: $<T, [E, A]>) => $<U, [$<T, [E, B]>]>;
  3: <U>(
    A: Applicative<U>,
  ) => <A, B>(
    faub: (a: A) => $<U, [B]>,
  ) => <R, E>(ta: $<T, [R, E, A]>) => $<U, [$<T, [R, E, B]>]>;
}[L];

/**
 * Pipeable IndexedTraversable
 */
export type IndexedTraversableP<T, L extends LS = 1, I = number> =
  & FunctorP<T, L>
  & IndexedFoldableP<T, L, I>
  & {
    readonly traverse: IndexedTraversableFnP<T, L, I>;
  };

export type IndexedTraversableFnP<T, L extends LS, I> = {
  1: <U>(
    A: Applicative<U>,
  ) => <A, B>(
    faub: (a: A, i: I) => $<U, [B]>,
  ) => (ta: $<T, [A]>) => $<U, [$<T, [B]>]>;
  2: <U>(
    A: Applicative<U>,
  ) => <A, B>(
    faub: (a: A, i: I) => $<U, [B]>,
  ) => <E>(ta: $<T, [E, A]>) => $<U, [$<T, [E, B]>]>;
  3: <U>(
    A: Applicative<U>,
  ) => <A, B>(
    faub: (a: A, i: I) => $<U, [B]>,
  ) => <R, E>(ta: $<T, [R, E, A]>) => $<U, [$<T, [R, E, B]>]>;
}[L];
