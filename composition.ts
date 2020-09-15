import type { $ } from "./hkts.ts";
import type * as TC from "./type-classes.ts";

/***************************************************************************************************
 * @section Composition Modules
 **************************************************************************************************/

/**
 * Functor Composition
 */
export type FunctorComposition<F, G> = {
  map: <A, B>(fab: (a: A) => B, FGa: $<F, [$<G, [A]>]>) => $<F, [$<G, [B]>]>;
};

export type FunctorComposition2<F, G> = {
  map: <E, A, B>(
    fab: (a: A) => B,
    FGa: $<F, [E, $<G, [A]>]>
  ) => $<F, [E, $<G, [B]>]>;
};

/**
 * Apply Composition
 */
export type ApplyComposition<F, G> = FunctorComposition<F, G> & {
  ap: <A, B>(
    FGfab: $<F, [$<G, [(a: A) => B]>]>,
    FGa: $<F, [$<G, [A]>]>
  ) => $<F, [$<G, [B]>]>;
};

export type ApplyComposition2<F, G> = FunctorComposition2<F, G> & {
  ap: <E, A, B>(
    FGefab: $<F, [E, $<G, [(a: A) => B]>]>,
    FGea: $<F, [E, $<G, [A]>]>
  ) => $<F, [E, $<G, [B]>]>;
};

/**
 * Applicative Composition
 */
export type ApplicativeComposition<F, G> = ApplyComposition<F, G> & {
  of: <A>(a: A) => $<F, [$<G, [A]>]>;
};

export type ApplicativeComposition2<F, G> = ApplyComposition2<F, G> & {
  of: <E, A>(a: A) => $<F, [E, $<G, [A]>]>;
};

/**
 * Chain Composition
 * I'm not sure creating this composition generally is possible, see:
 * @todo http://web.cecs.pdx.edu/~mpj/pubs/RR-1004.pdf
 */
export type ChainComposition<F, G> = ApplyComposition<F, G> & {
  chain: <A, B>(
    faFGb: (a: A) => $<F, [$<G, [B]>]>,
    FGa: $<F, [$<G, [A]>]>
  ) => $<F, [$<G, [B]>]>;
};

export type ChainComposition2<F, G> = ApplyComposition2<F, G> & {
  chain: <E, A, B>(
    faFGeb: (a: A) => $<F, [E, $<G, [B]>]>,
    FGa: $<F, [E, $<G, [A]>]>
  ) => $<F, [E, $<G, [B]>]>;
};

/**
 * Monad Composition
 * I'm not sure creating this composition generally is possible, see:
 * @todo http://web.cecs.pdx.edu/~mpj/pubs/RR-1004.pdf
 */
export type MonadComposition<F, G> = ApplicativeComposition<F, G> &
  ChainComposition<F, G> & {
    join: <A>(FGFGa: $<F, [$<G, [$<F, [$<G, [A]>]>]>]>) => $<F, [$<G, [A]>]>;
  };

export type MonadComposition2<F, G> = ApplicativeComposition2<F, G> &
  ChainComposition2<F, G> & {
    join: <E, A>(
      FGFGea: $<F, [E, $<G, [$<F, [E, $<G, [A]>]>]>]>
    ) => $<F, [E, $<G, [A]>]>;
  };

/***************************************************************************************************
 * @section Composition Modules
 **************************************************************************************************/

/**
 * Functor
 */
export const getFunctorComposition: {
  <F, G>(F: TC.Functor<F>, G: TC.Functor<G>): FunctorComposition<F, G>;
  <F, G>(F: TC.Functor2<F>, G: TC.Functor<G>): FunctorComposition2<F, G>;
} = <F, G>(F: TC.Functor<F>, G: TC.Functor<G>): FunctorComposition<F, G> => ({
  map: (fab, FGa) => F.map((Ga) => G.map(fab, Ga), FGa),
});

/**
 * Apply
 */
export const getApplyComposition: {
  <F, G>(F: TC.Apply<F>, G: TC.Apply<G>): ApplyComposition<F, G>;
  <F, G>(F: TC.Apply2<F>, G: TC.Apply<G>): ApplyComposition2<F, G>;
} = <F, G>(F: TC.Apply<F>, G: TC.Apply<G>): ApplyComposition<F, G> => ({
  ...getFunctorComposition(F, G),
  ap: <A, B>(FGfab: $<F, [$<G, [(a: A) => B]>]>, FGfa: $<F, [$<G, [A]>]>) =>
    F.ap(
      F.map((h) => (ga: $<G, [A]>) => G.ap(h, ga), FGfab),
      FGfa
    ),
});

/**
 * Applicative
 */
export const getApplicativeComposition: {
  <F, G>(F: TC.Applicative<F>, G: TC.Applicative<G>): ApplicativeComposition<
    F,
    G
  >;
  <F, G>(F: TC.Applicative2<F>, G: TC.Applicative<G>): ApplicativeComposition2<
    F,
    G
  >;
} = <F, G>(
  F: TC.Applicative<F>,
  G: TC.Applicative<G>
): ApplicativeComposition<F, G> => ({
  ...getApplyComposition(F, G),
  of: (a) => F.of(G.of(a)),
});
