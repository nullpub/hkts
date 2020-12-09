import type * as TC from "./type_classes.ts";
import type { _, _0, _1, Fix } from "./types.ts";

import { identity } from "./fns.ts";

/***************************************************************************************************
 * @section Models
 **************************************************************************************************/

export type Const<E, A = never> = E;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const make = <E, A = never>(e: E): Const<E, A> => e;

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <E, A>(S: TC.Show<E>): TC.Show<Const<E, A>> => ({
  show: (c) => `make(${S.show(c)})`,
});

export const getSetoid: <E, A>(
  E: TC.Setoid<E>,
) => TC.Setoid<Const<E, A>> = identity;

export const getOrd: <E, A>(O: TC.Ord<E>) => TC.Ord<Const<E, A>> = identity;

export const getSemigroup: <E, A>(
  S: TC.Semigroup<E>,
) => TC.Semigroup<Const<E, A>> = identity;

export const getMonoid: <E, A>(
  M: TC.Monoid<E>,
) => TC.Monoid<Const<E, A>> = identity;

export const getApply = <E>(
  S: TC.Semigroup<E>,
): TC.Apply<Const<Fix<E>, _>> => ({
  map: (_) => (ta) => ta,
  ap: (fab) => (fa) => make(S.concat(fab, fa)),
});

export const getApplicative = <E>(
  M: TC.Monoid<E>,
): TC.Applicative<Const<Fix<E>, _>> => {
  const A = getApply(M);
  const zero = M.empty();
  return {
    map: A.map,
    ap: A.ap,
    of: () => make(zero),
  };
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Const<_0, _1>, 2> = {
  map: (_) => (ta) => ta,
};

export const Contravariant: TC.Contravariant<Const<_0, _1>, 2> = {
  contramap: (_) => (tb) => tb,
};

export const Bifunctor: TC.Bifunctor<Const<_0, _1>, 2> = {
  bimap: (fab, _) => (tac) => make(fab(tac)),
  mapLeft: (fef) => Bifunctor.bimap(fef, identity),
};
