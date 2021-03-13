import type * as TC from "./type_classes.ts";
import type { Kind, URIS } from "./hkt.ts";

import { identity, pipe } from "./fns.ts";

/*******************************************************************************
 * Module Derivations
 ******************************************************************************/

/**
 * Derive Monad module from of and chain
 */
export const createMonad = <URI extends URIS>(
  { of, chain }: Pick<TC.Monad<URI>, "of" | "chain">,
): TC.Monad<URI> => {
  const Monad: TC.Monad<URI> = {
    of,
    ap: (tfai) => (ta) => pipe(tfai, chain((fab) => pipe(ta, Monad.map(fab)))),
    map: (fai) => (ta) => pipe(ta, chain((a) => of(fai(a)))),
    chain,
    join: chain(identity),
  };
  return Monad;
};

/*******************************************************************************
 * Do notation Derivation
 ******************************************************************************/

export const createDo = <URI extends URIS>(
  M: TC.Monad<URI>,
) => ({
  // deno-lint-ignore ban-types
  Do: <B = never, C = never, D = never>() => M.of<{}, B, C, D>({}),
  bindTo: (name: string) => M.map(<A = never>(a: A) => ({ [name]: a })),
  bind: <A = never, B = never, C = never, D = never, I = never>(
    name: string,
    fati: (a: A) => Kind<URI, [I, B, C, D]>,
  ) => M.chain((a: A) => pipe(fati(a), M.map((b) => ({ ...a, [name]: b })))),
});
