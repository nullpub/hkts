import type * as TC from "./type_classes.ts";

import { flow, identity, pipe } from "./fns.ts";

/***************************************************************************************************
 * @section Module Derivations
 **************************************************************************************************/

/**
 * Derive Monad module from of and chain
 */

type SomeMonad<T, L extends TC.LS> =
  & Pick<TC.Monad<T, L>, "of" | "chain">
  & Partial<Pick<TC.Monad<T, L>, "map">>;

type CreateMonad = {
  <T>(M: SomeMonad<T, 1>): TC.Monad<T>;
  <T, L extends 1>(M: SomeMonad<T, L>): TC.Monad<T, L>;
  <T, L extends 2>(M: SomeMonad<T, L>): TC.Monad<T, L>;
  <T, L extends 3>(M: SomeMonad<T, L>): TC.Monad<T, L>;
  <T, L extends 4>(M: SomeMonad<T, L>): TC.Monad<T, L>;
};

export const createMonad: CreateMonad = <T>(
  { of, map: _map, chain }: SomeMonad<T, 1>,
): TC.Monad<T> => {
  const map: TC.FunctorFn<T, 1> = _map ?? ((fab) => chain(flow(fab, of)));

  return {
    of,
    ap: (tfab) => (ta) => pipe(tfab, chain((fab) => map(fab)(ta))),
    map,
    chain,
    join: chain(identity),
  };
};
