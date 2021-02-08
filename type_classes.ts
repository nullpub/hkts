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
export type LS = 1 | 2 | 3 | 4;

/**
 * Compute the resultant typeclass length for typeclass composition
 */
export type AddLength<A extends LS, B extends LS> = {
  1: { 1: 1; 2: 2; 3: 3; 4: 4 };
  2: { 1: 2; 2: 3; 3: 4; 4: never };
  3: { 1: 3; 2: 4; 3: never; 4: never };
  4: { 1: 4; 2: never; 3: never; 4: never };
}[A][B];

/**
 * Alt
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#alt
 */
export interface Alt<T, L extends LS = 1> extends Functor<T, L> {
  readonly alt: AltFn<T, L>;
}

export type AltFn<T, L extends LS> = {
  1: <A>(tb: $<T, [A]>) => (ta: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(tb: $<T, [E, A]>) => (ta: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(tb: $<T, [R, E, A]>) => (ta: $<T, [R, E, A]>) => $<T, [R, E, A]>;
  4: <S, R, E, A>(
    tb: $<T, [S, R, E, A]>,
  ) => (ta: $<T, [S, R, E, A]>) => $<T, [S, R, E, A]>;
}[L];

/**
 * Alternative
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#alternative
 */
export interface Alternative<T, L extends LS = 1>
  extends Applicative<T, L>, Plus<T, L> {}

/**
 * Applicative
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#applicative
 */

export interface Applicative<T, L extends LS = 1> extends Apply<T, L> {
  readonly of: ApplicativeFn<T, L>;
}

export type ApplicativeFn<T, L extends LS> = {
  1: <A>(a: A) => $<T, [A]>;
  2: <E = never, A = never>(a: A) => $<T, [E, A]>;
  3: <R = never, E = never, A = never>(a: A) => $<T, [R, E, A]>;
  4: <S = never, R = never, E = never, A = never>(a: A) => $<T, [S, R, E, A]>;
}[L];

/**
 * Apply
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#apply
 */
export interface Apply<T, L extends LS = 1> extends Functor<T, L> {
  readonly ap: ApplyFn<T, L>;
}

export type ApplyFn<T, L extends LS> = {
  1: <A, B>(tfab: $<T, [(a: A) => B]>) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    tfab: $<T, [E, (a: A) => B]>,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    tfab: $<T, [R, E, (a: A) => B]>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
  4: <S, R, E, A, B>(
    tfab: $<T, [S, R, E, (a: A) => B]>,
  ) => (ta: $<T, [S, R, E, A]>) => $<T, [S, R, E, B]>;
}[L];

/**
 * Bifunctor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#bifunctor
 */
export interface Bifunctor<T, L extends LS = 2> {
  readonly bimap: BifunctorFn<T, L>;
  readonly mapLeft: BifunctorMapFn<T, L>;
}

export type BifunctorFn<T, L extends LS> = {
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
  4: <S, R, A, B, C, D>(
    fab: (a: A) => B,
    fcd: (c: C) => D,
  ) => (
    tac: $<T, [S, R, A, C]>,
  ) => $<T, [S, R, B, D]>;
}[L];

export type BifunctorMapFn<T, L extends LS> = {
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
  4: <S, R, E, F, A>(
    fef: (e: E) => F,
  ) => (
    tea: $<T, [S, R, E, A]>,
  ) => $<T, [S, R, F, A]>;
}[L];

/**
 * Category
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#category
 */
export interface Category<T, L extends LS = 1> extends Semigroupoid<T, L> {
  readonly id: CategoryFn<T, L>;
}

export type CategoryFn<T, L extends LS> = {
  1: {
    <A>(): $<T, [A, A]>;
    <A, B>(): $<T, [A, B]>;
  };
  2: {
    <E, A>(): $<T, [E, A, A]>;
    <E, A, B>(): $<T, [E, A, B]>;
  };
  3: {
    <R, E, A>(): $<T, [R, E, A, A]>;
    <R, E, A, B>(): $<T, [R, E, A, B]>;
  };
  4: {
    <S, R, E, A>(): $<T, [S, R, E, A, A]>;
    <S, R, E, A, B>(): $<T, [S, R, E, A, B]>;
  };
}[L];

/**
 * Chain
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#chain
 */
export interface Chain<T, L extends LS = 1> extends Apply<T, L> {
  readonly chain: ChainFn<T, L>;
}

// deno-fmt-ignore
export type ChainFn<T, L extends LS> = {
  1: <A, B>(fatb: (a: A) => $<T, [B]>)
    => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    fatb: (a: A) => $<T, [E, B]>,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    fatb: (a: A) => $<T, [R, E, B]>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
  4: <S, R, E, A, B>(
    fatb: (a: A) => $<T, [S, R, E, B]>,
  ) => (ta: $<T, [S, R, E, A]>) => $<T, [S, R, E, B]>;
}[L];

/**
 * ChainRec
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#chainrec
 *
 * @todo Confirm type
 */
export interface ChainRec<T, L extends LS = 1> extends Chain<T, L> {
  readonly chainRec: ChainRecFn<T, L>;
}

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
  4: <S, R, E, A, B, C>(
    f: (next: (a: A) => C, done: (b: B) => C, a: A) => $<T, [S, R, E, C]>,
    a: A,
  ) => $<T, [S, R, E, B]>;
}[L];

/**
 * Comonad
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#comonad
 */
export interface Comonad<T, L extends LS = 1> extends Extend<T, L> {
  readonly extract: ComonadFn<T, L>;
}

export type ComonadFn<T, L extends LS> = {
  1: <A>(ta: $<T, [A]>) => A;
  2: <E, A>(ta: $<T, [E, A]>) => A;
  3: <R, E, A>(ta: $<T, [R, E, A]>) => A;
  4: <S, R, E, A>(ta: $<T, [S, R, E, A]>) => A;
}[L];

/**
 * Contravariant
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#contravariant
 */
export interface Contravariant<T, L extends LS = 1> {
  readonly contramap: ContravariantFn<T, L>;
}

export type ContravariantFn<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B) => (tb: $<T, [B]>) => $<T, [A]>;
  2: <E, A, B>(fab: (a: A) => B) => (tb: $<T, [E, B]>) => $<T, [E, A]>;
  3: <R, E, A, B>(fab: (a: A) => B) => (tb: $<T, [R, E, B]>) => $<T, [R, E, A]>;
  4: <S, R, E, A, B>(
    fab: (a: A) => B,
  ) => (tb: $<T, [S, R, E, B]>) => $<T, [S, R, E, A]>;
}[L];

/**
 * Extend
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#extend
 */
export interface Extend<T, L extends LS = 1> extends Functor<T, L> {
  readonly extend: ExtendFn<T, L>;
}

export type ExtendFn<T, L extends LS> = {
  1: <A, B>(ftab: (t: $<T, [A]>) => B) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <E, A, B>(
    ftab: (t: $<T, [E, A]>) => B,
  ) => (ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <R, E, A, B>(
    ftab: (t: $<T, [R, E, A]>) => B,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
  4: <S, R, E, A, B>(
    ftab: (t: $<T, [S, R, E, A]>) => B,
  ) => (ta: $<T, [S, R, E, A]>) => $<T, [S, R, E, B]>;
}[L];

/**
 * Filterable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#filterable
 */
export interface Filterable<T, L extends LS = 1> {
  readonly filter: FilterableFn<T, L>;
}

export type FilterableFn<T, L extends LS> = {
  1: <A>(predicate: Predicate<A>) => (ta: $<T, [A]>) => $<T, [A]>;
  2: <E, A>(predicate: Predicate<A>) => (ta: $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(
    predicate: Predicate<A>,
  ) => (ta: $<T, [R, E, A]>) => $<T, [R, E, A]>;
  4: <S, R, E, A>(
    predicate: Predicate<A>,
  ) => (ta: $<T, [S, R, E, A]>) => $<T, [S, R, E, A]>;
}[L];

/**
 * Foldable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#foldable
 */

export interface Foldable<T, L extends LS = 1> {
  readonly reduce: FoldableFn<T, L>;
}

export type FoldableFn<T, L extends LS> = {
  1: <A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(faba: (a: A, b: B) => A, a: A) => (tb: $<T, [R, E, B]>) => A;
  4: <S, R, E, A, B>(
    faba: (a: A, b: B) => A,
    a: A,
  ) => (tb: $<T, [S, R, E, B]>) => A;
}[L];

/**
 * IndexedFoldable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#foldable
 */

export interface IndexedFoldable<T, L extends LS = 1, I = number> {
  readonly reduce: IndexedFoldableFn<T, L, I>;
}

export type IndexedFoldableFn<T, L extends LS, I> = {
  1: <A, B>(faba: (a: A, b: B, i: I) => A, a: A) => (tb: $<T, [B]>) => A;
  2: <E, A, B>(faba: (a: A, b: B, i: I) => A, a: A) => (tb: $<T, [E, B]>) => A;
  3: <R, E, A, B>(
    faba: (a: A, b: B, i: I) => A,
    a: A,
  ) => (tb: $<T, [R, E, B]>) => A;
  4: <S, R, E, A, B>(
    faba: (a: A, b: B, i: I) => A,
    a: A,
  ) => (tb: $<T, [S, R, E, B]>) => A;
}[L];

/**
 * Functor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#functor
 */
export interface Functor<T, L extends LS = 1> {
  readonly map: FunctorFn<T, L>;
}

// deno-fmt-ignore
export type FunctorFn<T, L extends LS> = {
  1: <A, B>(fab: (a: A) => B) => (ta: $<T, [A]>) => $<T, [B]>;
  2: <A, B>(fab: (a: A) => B) => <E>(ta: $<T, [E, A]>) => $<T, [E, B]>;
  3: <A, B>(fab: (a: A) => B) => <R, E>(ta: $<T, [R, E, A]>) => $<T, [R, E, B]>;
  4: <A, B>(fab: (a: A) => B) => <S, R, E>(ta: $<T, [S, R, E, A]>) => $<T, [S, R, E, B]>;
}[L];

/**
 * Group
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#group
 */
export interface Group<T> extends Monoid<T> {
  readonly invert: (x: T) => T;
} /**
 * Monad
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#monad
 * 
 * Here we extend Monad with a join function. Other names for join
 * are flatten or flat.
 */

export interface Monad<T, L extends LS = 1>
  extends Applicative<T, L>, Chain<T, L> {
  readonly join: MonadFn<T, L>;
}

export type MonadFn<T, L extends LS> = {
  1: <A>(tta: $<T, [$<T, [A]>]>) => $<T, [A]>;
  2: <E, A>(tta: $<T, [E, $<T, [E, A]>]>) => $<T, [E, A]>;
  3: <R, E, A>(tta: $<T, [R, E, $<T, [R, E, A]>]>) => $<T, [R, E, A]>;
  4: <S, R, E, A>(
    tta: $<T, [S, R, E, $<T, [S, R, E, A]>]>,
  ) => $<T, [S, R, E, A]>;
}[L];

/**
 * MonadThrow
 * https://github.com/gcanti/fp-ts/blob/master/src/MonadThrow.ts
 */
export interface MonadThrow<T, L extends LS = 1> extends Monad<T, L> {
  readonly throwError: MonadThrowFn<T, L>;
}

export type MonadThrowFn<T, L extends LS> = {
  1: <E, A>(e: E) => $<T, [A]>;
  2: <E, A>(e: E) => $<T, [E, A]>;
  3: <R, E, A>(e: E) => $<T, [R, E, A]>;
  4: <S, R, E, A>(e: E) => $<T, [S, R, E, A]>;
}[L];

/**
 * Monoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#monoid
 */
export interface Monoid<T> extends Semigroup<T> {
  readonly empty: () => T;
}

/**
 * Ord
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#ord
 */
export interface Ord<T> extends Setoid<T> {
  readonly lte: (a: T, b: T) => boolean;
}

/**
 * Plus
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#plus
 */

export interface Plus<T, L extends LS = 1> extends Alt<T, L> {
  readonly zero: PlusFn<T, L>;
}

export type PlusFn<T, L extends LS> = {
  1: <A>() => $<T, [A]>;
  2: <E, A>() => $<T, [E, A]>;
  3: <R, E, A>() => $<T, [R, E, A]>;
  4: <S, R, E, A>() => $<T, [S, R, E, A]>;
}[L];

/**
 * Profunctor
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#profunctor
 */
export interface Profunctor<T, L extends LS = 2> {
  readonly promap: ProfunctorFn<T, L>;
}

export type ProfunctorFn<T, L extends LS> = {
  1: never;
  2: <A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D,
  ) => (
    tbc: $<T, [B, C]>,
  ) => $<T, [A, D]>;
  3: <R, A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D,
  ) => (
    tbc: $<T, [R, B, C]>,
  ) => $<T, [R, A, D]>;
  4: <S, R, A, B, C, D>(
    fab: (x: A) => B,
    fcd: (x: C) => D,
  ) => (
    tbc: $<T, [S, R, B, C]>,
  ) => $<T, [S, R, A, D]>;
}[L];

/**
 * Semigroup
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#semigroup
 */
export interface Semigroup<T> {
  readonly concat: (a: T, b: T) => T;
}

/**
 * Semigroupoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#semigroupoid
 */

export interface Semigroupoid<T, L extends LS = 1> {
  readonly compose: SemigroupoidFn<T, L>;
}

export type SemigroupoidFn<T, L extends LS> = {
  1: <A, B, C>(
    tjk: $<T, [B, C]>,
  ) => (
    tij: $<T, [A, B]>,
  ) => $<T, [A, C]>;
  2: <E, A, B, C>(
    tjk: $<T, [E, B, C]>,
  ) => (
    tij: $<T, [E, A, B]>,
  ) => $<T, [E, A, C]>;
  3: <R, E, A, B, C>(
    tjk: $<T, [R, E, B, C]>,
  ) => (
    tij: $<T, [R, E, A, B]>,
  ) => $<T, [R, E, A, C]>;
  4: <S, R, E, A, B, C>(
    tjk: $<T, [S, R, E, B, C]>,
  ) => (
    tij: $<T, [S, R, E, A, B]>,
  ) => $<T, [S, R, E, A, C]>;
}[L];

/**
 * Setoid
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#setoid
 */
export interface Setoid<T> {
  readonly equals: (a: T, b: T) => boolean;
} /**
 * Show
 * Take a type and prints a string for it.
 */

export interface Show<T> {
  readonly show: (t: T) => string;
}

/**
 * Traversable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#traversable
 */
export interface Traversable<T, L extends LS = 1>
  extends Functor<T, L>, Foldable<T, L> {
  readonly traverse: TraversableFn<T, L>;
}

// deno-fmt-ignore
export type TraversableFn<T, L extends LS> = {
  1: {
    <U>(A: Applicative<U, 1>): <A, B>(faUb: (a: A) => $<U, [B]>) => (Ta: $<T, [A]>) => $<U, [$<T, [B]>]>
    <U>(A: Applicative<U, 2>): <A, B, J>(faUb: (a: A) => $<U, [J, B]>) => (Ta: $<T, [A]>) => $<U, [J, $<T, [B]>]>
    <U>(A: Applicative<U, 3>): <A, B, J, K>(faUb: (a: A) => $<U, [J, K, B]>) => (Ta: $<T, [A]>) => $<U, [J, K, $<T, [B]>]>
    <U>(A: Applicative<U, 4>): <A, B, J, K, L>(faUb: (a: A) => $<U, [J, K, L, B]>) => (Ta: $<T, [A]>) => $<U, [J, K, L, $<T, [B]>]>
  };
  2: {
    <U>(A: Applicative<U, 1>): <A, B, E>(faUb: (a: A) => $<U, [B]>) => (Ta: $<T, [E, A]>) => $<U, [$<T, [E, B]>]>
    <U>(A: Applicative<U, 2>): <A, B, E, J>(faUb: (a: A) => $<U, [J, B]>) => (Ta: $<T, [E, A]>) => $<U, [J, $<T, [E, B]>]>
    <U>(A: Applicative<U, 3>): <A, B, E, J, K>(faUb: (a: A) => $<U, [J, K, B]>) => (Ta: $<T, [E, A]>) => $<U, [J, K, $<T, [E, B]>]>
    <U>(A: Applicative<U, 4>): <A, B, E, J, K, L>(faUb: (a: A) => $<U, [J, K, L, B]>) => (Ta: $<T, [E, A]>) => $<U, [J, K, L, $<T, [E, B]>]>
  };
  3: {
    <U>(A: Applicative<U, 1>): <A, B, R, E>(faUb: (a: A) => $<U, [B]>) => (Ta: $<T, [R, E, A]>) => $<U, [$<T, [R, E, B]>]>
    <U>(A: Applicative<U, 2>): <A, B, R, E, J>(faUb: (a: A) => $<U, [J, B]>) => (Ta: $<T, [R, E, A]>) => $<U, [J, $<T, [R, E, B]>]>
    <U>(A: Applicative<U, 3>): <A, B, R, E, J, K>(faUb: (a: A) => $<U, [J, K, B]>) => (Ta: $<T, [R, E, A]>) => $<U, [J, K, $<T, [R, E, B]>]>
    <U>(A: Applicative<U, 4>): <A, B, R, E, J, K, L>(faUb: (a: A) => $<U, [J, K, L, B]>) => (Ta: $<T, [R, E, A]>) => $<U, [J, K, L, $<T, [R, E, B]>]>
  };
  4: {
    <U>(A: Applicative<U, 1>): <A, B, S, R, E>(faUb: (a: A) => $<U, [B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [$<T, [S, R, E, B]>]>
    <U>(A: Applicative<U, 2>): <A, B, S, R, E, J>(faUb: (a: A) => $<U, [J, B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [J, $<T, [S, R, E, B]>]>
    <U>(A: Applicative<U, 3>): <A, B, S, R, E, J, K>(faUb: (a: A) => $<U, [J, K, B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [J, K, $<T, [S, R, E, B]>]>
    <U>(A: Applicative<U, 4>): <A, B, S, R, E, J, K, L>(faUb: (a: A) => $<U, [J, K, L, B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [J, K, L, $<T, [S, R, E, B]>]>
  };
}[L];

/**
 * Indexed Traversable
 * https://github.com/fantasyland/static-land/blob/master/docs/spec.md#traversable
 * 
 * Based on the fp-ts indexed traversable. Mimics the traversable type but includes
 * an index type that is passed to the traverse mapping function.
 */
export interface IndexedTraversable<T, L extends LS = 1, I = number>
  extends Functor<T, L>, IndexedFoldable<T, L, I> {
  readonly traverse: IndexedTraversableFn<T, L, I>;
}

// deno-fmt-ignore
export type IndexedTraversableFn<T, L extends LS, I> = {
  1: {
    <U>(A: Applicative<U, 1>): <A, B>(faUb: (a: A, i: I) => $<U, [B]>) => (Ta: $<T, [A]>) => $<U, [$<T, [B]>]>
    <U>(A: Applicative<U, 2>): <A, B, J>(faUb: (a: A, i: I) => $<U, [J, B]>) => (Ta: $<T, [A]>) => $<U, [J, $<T, [B]>]>
    <U>(A: Applicative<U, 3>): <A, B, J, K>(faUb: (a: A, i: I) => $<U, [J, K, B]>) => (Ta: $<T, [A]>) => $<U, [J, K, $<T, [B]>]>
    <U>(A: Applicative<U, 4>): <A, B, J, K, L>(faUb: (a: A, i: I) => $<U, [J, K, L, B]>) => (Ta: $<T, [A]>) => $<U, [J, K, L, $<T, [B]>]>
  };
  2: {
    <U>(A: Applicative<U, 1>): <A, B, E>(faUb: (a: A, i: I) => $<U, [B]>) => (Ta: $<T, [E, A]>) => $<U, [$<T, [E, B]>]>
    <U>(A: Applicative<U, 2>): <A, B, E, J>(faUb: (a: A, i: I) => $<U, [J, B]>) => (Ta: $<T, [E, A]>) => $<U, [J, $<T, [E, B]>]>
    <U>(A: Applicative<U, 3>): <A, B, E, J, K>(faUb: (a: A, i: I) => $<U, [J, K, B]>) => (Ta: $<T, [E, A]>) => $<U, [J, K, $<T, [E, B]>]>
    <U>(A: Applicative<U, 4>): <A, B, E, J, K, L>(faUb: (a: A, i: I) => $<U, [J, K, L, B]>) => (Ta: $<T, [E, A]>) => $<U, [J, K, L, $<T, [E, B]>]>
  };
  3: {
    <U>(A: Applicative<U, 1>): <A, B, R, E>(faUb: (a: A, i: I) => $<U, [B]>) => (Ta: $<T, [R, E, A]>) => $<U, [$<T, [R, E, B]>]>
    <U>(A: Applicative<U, 2>): <A, B, R, E, J>(faUb: (a: A, i: I) => $<U, [J, B]>) => (Ta: $<T, [R, E, A]>) => $<U, [J, $<T, [R, E, B]>]>
    <U>(A: Applicative<U, 3>): <A, B, R, E, J, K>(faUb: (a: A, i: I) => $<U, [J, K, B]>) => (Ta: $<T, [R, E, A]>) => $<U, [J, K, $<T, [R, E, B]>]>
    <U>(A: Applicative<U, 4>): <A, B, R, E, J, K, L>(faUb: (a: A, i: I) => $<U, [J, K, L, B]>) => (Ta: $<T, [R, E, A]>) => $<U, [J, K, L, $<T, [R, E, B]>]>
  };
  4: {
    <U>(A: Applicative<U, 1>): <A, B, S, R, E>(faUb: (a: A, i: I) => $<U, [B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [$<T, [S, R, E, B]>]>
    <U>(A: Applicative<U, 2>): <A, B, S, R, E, J>(faUb: (a: A, i: I) => $<U, [J, B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [J, $<T, [S, R, E, B]>]>
    <U>(A: Applicative<U, 3>): <A, B, S, R, E, J, K>(faUb: (a: A, i: I) => $<U, [J, K, B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [J, K, $<T, [S, R, E, B]>]>
    <U>(A: Applicative<U, 4>): <A, B, S, R, E, J, K, L>(faUb: (a: A, i: I) => $<U, [J, K, L, B]>) => (Ta: $<T, [S, R, E, A]>) => $<U, [J, K, L, $<T, [S, R, E, B]>]>
  };
}[L];
