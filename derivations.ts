import type * as TC from "./type_classes.ts";
import type { $, _ } from "./types.ts";

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

/***************************************************************************************************
 * @section Do notation Derivation
 **************************************************************************************************/

// deno-fmt-ignore
export type Do<T, L extends TC.LS> = {
  1: {
    Do: $<T, [{}]>;
    bindTo: <N extends string>(name: N) => (<A>(ta: $<T, [A]>) => $<T, [{ [K in N]: A }]>);
    bind: <N extends string, A, B>(name: Exclude<N, keyof A>, fatb: (a: A) => $<T, [B]>) =>
      (ta: $<T, [A]>) => $<T, [{ [K in keyof A | N]: K extends keyof A ? A[K] : B }]>;
  };
  2: {
    Do: $<T, [never, {}]>;
    bindTo: <N extends string>(name: N) => (<E, A>(fa: $<T, [E, A]>) => $<T, [E, { [K in N]: A }]>);
    bind: <N extends string, E, A, B>(name: Exclude<N, keyof A>, fatb: (a: A) => $<T, [E, B]>) =>
      (ta: $<T, [E, A]>) => $<T, [E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }]>;
  };
  3: {
    Do: $<T, [never, never, {}]>
    bindTo: <N extends string>(name: N) => (<R, E, A>(fa: $<T, [R, E, A]>) => $<T, [R, E, { [K in N]: A }]>);
    bind: <N extends string, R, E, A, B>(name: Exclude<N, keyof A>, fatb: (a: A) => $<T, [R, E, B]>) =>
      (ta: $<T, [R, E, A]>) => $<T, [R, E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }]>;
  };
  4: {
    Do: $<T, [never, never, never, {}]>;
    bindTo: <N extends string>(name: N) => (<S, R, E, A>(fa: $<T, [S, R, E, A]>) => $<T, [S, R, E, { [K in N]: A }]>);
    bind: <N extends string, S, R, E, A, B>(name: Exclude<N, keyof A>, fatb: (a: A) => $<T, [S, R, E, B]>) =>
      (ta: $<T, [S, R, E, A]>) => $<T, [S, R, E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }]>;
  };
}[L]


type CreateDo = {
  <T, L extends 1>(M: TC.Monad<T, L>): Do<T, L>;
  <T, L extends 2>(M: TC.Monad<T, L>): Do<T, L>;
  <T, L extends 3>(M: TC.Monad<T, L>): Do<T, L>;
  <T, L extends 4>(M: TC.Monad<T, L>): Do<T, L>;
};

export const createDo: CreateDo = <T>(M: TC.Monad<T>): Do<T, 1> => ({
  Do: M.of({}),
  bindTo: (name) => M.map((a) => ({ [name]: a })),
  bind: (name, fatb) =>
    M.chain((a) => pipe(fatb(a), M.map((b) => ({ ...a, [name]: b })))),
});
