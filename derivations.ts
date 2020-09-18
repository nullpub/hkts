import type * as TC from "./type_classes.ts";

import { identity } from "./fns.ts";

/***************************************************************************************************
 * @section Derivations
 **************************************************************************************************/

/**
 * Derive Monad from of, map, and join.
 */
type CreateMonad = {
  <T>(M: Pick<TC.Monad<T>, "of" | "chain">): TC.Monad<T>;
  <T, L extends 1>(M: Pick<TC.Monad<T, L>, "of" | "chain">): TC.Monad<T, L>;
  <T, L extends 2>(M: Pick<TC.Monad<T, L>, "of" | "chain">): TC.Monad<T, L>;
  <T, L extends 3>(M: Pick<TC.Monad<T, L>, "of" | "chain">): TC.Monad<T, L>;
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
 * Derive MonadP from Monad.
 */
type CreatePipeableMonad = {
  <T>(M: TC.Monad<T>): TC.MonadP<T>;
  <T, L extends 1>(M: TC.Monad<T>): TC.MonadP<T, L>;
  <T, L extends 2>(M: TC.Monad<T, L>): TC.MonadP<T, L>;
  <T, L extends 3>(M: TC.Monad<T, L>): TC.MonadP<T, L>;
};

export const createPipeableMonad: CreatePipeableMonad = <T>(
  M: TC.Monad<T>
): TC.MonadP<T> => ({
  of: M.of,
  join: M.join,
  map: (fab) => (ta) => M.map(fab, ta),
  chain: (fatb) => (ta) => M.chain(fatb, ta),
  ap: (tfab) => (ta) => M.ap(tfab, ta),
});

/**
 * Derive TraversableP from Traversable.
 */
type CreatePipeableTraversable = {
  <T>(M: TC.Traversable<T>): TC.TraversableP<T>;
  <T, L extends 1>(M: TC.Traversable<T, L>): TC.TraversableP<T, L>;
  <T, L extends 2>(M: TC.Traversable<T, L>): TC.TraversableP<T, L>;
  <T, L extends 3>(M: TC.Traversable<T, L>): TC.TraversableP<T, L>;
};

export const createPipeableTraversable: CreatePipeableTraversable = <T>(
  T: TC.Traversable<T>
): TC.TraversableP<T> => ({
  map: (fab) => (ta) => T.map(fab, ta),
  reduce: (faba, a) => (tb) => T.reduce(faba, a, tb),
  traverse: (A, faub) => (ta) => T.traverse(A, faub, ta),
});

/**
 * Derive BifunctorP from Bifunctor.
 */
export const createPipeableBifunctor = <T>({
  bimap,
}: TC.Bifunctor<T>): TC.BifunctorP<T> => ({
  bimap: (fab, fcd) => (tac) => bimap(fab, fcd, tac),
});
