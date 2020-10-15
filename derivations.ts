import type * as TC from "./type_classes.ts";
import type { $ } from "./types.ts";

import { identity } from "./fns.ts";

/***************************************************************************************************
 * @section Module Derivations
 **************************************************************************************************/

/**
 * Derive Monad module from of and chain
 */
type CreateMonad = {
  <T>(M: Pick<TC.Monad<T>, "of" | "chain">): TC.Monad<T>;
  <T, L extends 1>(M: Pick<TC.Monad<T, L>, "of" | "chain">): TC.Monad<T, L>;
  <T, L extends 2>(M: Pick<TC.Monad<T, L>, "of" | "chain">): TC.Monad<T, L>;
  <T, L extends 3>(M: Pick<TC.Monad<T, L>, "of" | "chain">): TC.Monad<T, L>;
  <T, L extends 4>(M: Pick<TC.Monad<T, L>, "of" | "chain">): TC.Monad<T, L>;
};

export const createMonad: CreateMonad = <T>({
  of,
  chain,
}: Pick<TC.Monad<T>, "of" | "chain">): TC.Monad<T> => {
  const map: TC.FunctorFn<T, 1> = (fab, ta) => chain((a) => of(fab(a)), ta);

  return {
    of,
    map,
    chain,
    join: (tta) => chain(identity, tta),
    ap: (tfab, ta) => chain((f) => map(f, ta), tfab),
  };
};

/**
 * Derive Bifunctor module from bimap
 */
type CreateBifunctor = {
  <T>(M: Pick<TC.Bifunctor<T>, "bimap">): TC.Bifunctor<T>;
  <T, L extends 1>(M: Pick<TC.Bifunctor<T, L>, "bimap">): TC.Bifunctor<T, L>;
  <T, L extends 2>(M: Pick<TC.Bifunctor<T, L>, "bimap">): TC.Bifunctor<T, L>;
  <T, L extends 3>(M: Pick<TC.Bifunctor<T, L>, "bimap">): TC.Bifunctor<T, L>;
  <T, L extends 4>(M: Pick<TC.Bifunctor<T, L>, "bimap">): TC.Bifunctor<T, L>;
};

export const createBifunctor: CreateBifunctor = <T>({
  bimap,
}: Pick<TC.Bifunctor<T>, "bimap">): TC.Bifunctor<T> => ({
  bimap,
  mapLeft: (fef, tea) => bimap(fef, identity, tea),
});

/***************************************************************************************************
 * @section Pipeable Module Derivations
 **************************************************************************************************/

/**
 * Derive Pipeable Monad from Monad.
 */
type CreatePipeableMonad = {
  <T>(M: TC.Monad<T>): TC.MonadP<T>;
  <T, L extends 1>(M: TC.Monad<T>): TC.MonadP<T, L>;
  <T, L extends 2>(M: TC.Monad<T, L>): TC.MonadP<T, L>;
  <T, L extends 3>(M: TC.Monad<T, L>): TC.MonadP<T, L>;
  <T, L extends 4>(M: TC.Monad<T, L>): TC.MonadP<T, L>;
};

export const createPipeableMonad: CreatePipeableMonad = <T>(
  M: TC.Monad<T>,
): TC.MonadP<T> => ({
  of: M.of,
  join: M.join,
  map: (fab) => (ta) => M.map(fab, ta),
  chain: (fatb) => (ta) => M.chain(fatb, ta),
  ap: (tfab) => (ta) => M.ap(tfab, ta),
});

/**
 * Derive Pipeable Traversable from Traversable.
 */
type CreatePipeableTraversable = {
  <T>(M: TC.Traversable<T>): TC.TraversableP<T>;
  <T, L extends 1>(M: TC.Traversable<T, L>): TC.TraversableP<T, L>;
  <T, L extends 2>(M: TC.Traversable<T, L>): TC.TraversableP<T, L>;
  <T, L extends 3>(M: TC.Traversable<T, L>): TC.TraversableP<T, L>;
  <T, L extends 4>(M: TC.Traversable<T, L>): TC.TraversableP<T, L>;
};

export const createPipeableTraversable: CreatePipeableTraversable = <T>(
  T: TC.Traversable<T>,
): TC.TraversableP<T> => ({
  map: (fab) => (ta) => T.map(fab, ta),
  reduce: (faba, a) => (tb) => T.reduce(faba, a, tb),
  traverse: <U>(A: TC.Applicative<U>) =>
    <A, B>(faub: (a: A) => $<U, [B]>) =>
      (ta: $<T, [A]>) => T.traverse(A, faub, ta),
});

/**
 * Derive Pipeable Sequenceable from Sequenceable.
 */
type CreatePipeableSequenceable = {
  <T>(M: TC.Sequenceable<T>): TC.SequenceableP<T>;
  <T, L extends 1>(M: TC.Sequenceable<T, L>): TC.SequenceableP<T, L>;
  <T, L extends 2>(M: TC.Sequenceable<T, L>): TC.SequenceableP<T, L>;
  <T, L extends 3>(M: TC.Sequenceable<T, L>): TC.SequenceableP<T, L>;
  <T, L extends 4>(M: TC.Sequenceable<T, L>): TC.SequenceableP<T, L>;
};

export const createPipeableSequenceable: CreatePipeableSequenceable = <T>(
  S: TC.Sequenceable<T>,
): TC.SequenceableP<T> => ({
  sequence: <U>(A: TC.Applicative<U>) =>
    <A>(ta: $<T, [$<U, [A]>]>) => S.sequence(A, ta),
});

/**
 * Derive Pipeable IndexedTraversable from IndexedTraversable.
 */
type CreatePipeableIndexedTraversable = {
  <T, I>(M: TC.IndexedTraversable<T>): TC.IndexedTraversableP<T, 1, I>;
  <T, L extends 1, I>(
    M: TC.IndexedTraversable<T, L, I>,
  ): TC.IndexedTraversableP<T, L, I>;
  <T, L extends 2, I>(
    M: TC.IndexedTraversable<T, L, I>,
  ): TC.IndexedTraversableP<T, L, I>;
  <T, L extends 3, I>(
    M: TC.IndexedTraversable<T, L, I>,
  ): TC.IndexedTraversableP<T, L, I>;
  <T, L extends 4, I>(
    M: TC.IndexedTraversable<T, L, I>,
  ): TC.IndexedTraversableP<T, L, I>;
};

export const createPipeableIndexedTraversable:
  CreatePipeableIndexedTraversable = <T>(
    T: TC.IndexedTraversable<T>,
  ): TC.IndexedTraversableP<T> => ({
    map: (fab) => (ta) => T.map(fab, ta),
    reduce: (faba, a) => (tb) => T.reduce(faba, a, tb),
    traverse: <U>(A: TC.Applicative<U>) =>
      <A, B>(faub: (a: A, i: number) => $<U, [B]>) =>
        (ta: $<T, [A]>) => T.traverse(A, faub, ta),
  });

/**
 * Derive Pipeable Bifunctor from Bifunctor.
 */
type CreatePipeableBifunctor = {
  <T, L extends 1>(
    M: TC.Bifunctor<T, L>,
  ): TC.BifunctorP<T, L>;
  <T, L extends 2>(
    M: TC.Bifunctor<T, L>,
  ): TC.BifunctorP<T, L>;
  <T, L extends 3>(
    M: TC.Bifunctor<T, L>,
  ): TC.BifunctorP<T, L>;
  <T, L extends 4>(
    M: TC.Bifunctor<T, L>,
  ): TC.BifunctorP<T, L>;
};

export const createPipeableBifunctor: CreatePipeableBifunctor = <T>({
  bimap,
  mapLeft,
}: TC.Bifunctor<T>): TC.BifunctorP<T> => ({
  bimap: (fab, fcd) => (tac) => bimap(fab, fcd, tac),
  mapLeft: (fef) => (tac) => mapLeft(fef, tac),
});
