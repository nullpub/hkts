import type * as TC from "./type-classes.ts";
import { identity } from "./fns.ts";

/***************************************************************************************************
 * @section Derivations
 **************************************************************************************************/

/**
 * Derive Monad from of, map, and join.
 */
export function createMonad<T>({
  of,
  chain,
}: Pick<TC.Monad<T>, "of" | "chain">): TC.Monad<T> {
  const map: TC.Functor<T>["map"] = (fab, ta) => chain((a) => of(fab(a)), ta);
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
export function createMonad2<T>(
  M: Pick<TC.Monad2<T>, "of" | "chain">
): TC.Monad2<T> {
  return createMonad<T>(M as TC.Monad<T>) as TC.Monad2<T>;
}

/**
 * Derive MonadP from Monad or Monad2.
 */
export const createPipeableMonad: {
  <T>(M: TC.Monad<T>): TC.MonadP<T>;
  <T>(M: TC.Monad2<T>): TC.Monad2P<T>;
} = <T>({ of, ap, map, join, chain }: TC.Monad<T>): TC.MonadP<T> => ({
  of,
  join,
  map: (fab) => (ta) => map(fab, ta),
  chain: (fatb) => (ta) => chain(fatb, ta),
  ap: (tfab) => (ta) => ap(tfab, ta),
});

/**
 * Derive TraversableP from Traversable or Traversable2.
 */
export const createPipeableTraversable: {
  <T>(M: TC.Traversable<T>): TC.TraversableP<T>;
  <T>(M: TC.Traversable2<T>): TC.Traversable2P<T>;
} = <T>({ traverse, reduce, map }: TC.Traversable<T>): TC.TraversableP<T> => ({
  map: (fab) => (ta) => map(fab, ta),
  reduce: (faba, a) => (ta) => reduce(faba, a, ta),
  traverse: (A, faub) => (ta) => traverse(A, faub, ta),
});

/**
 * Derive BifunctorP from Bifunctor.
 */
export const createPipeableBifunctor = <T>({
  bimap,
}: TC.Bifunctor<T>): TC.BifunctorP<T> => ({
  bimap: (fab, fcd) => (tac) => bimap(fab, fcd, tac),
});
