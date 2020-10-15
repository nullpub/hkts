import type * as TC from "./type_classes.ts";
import type { $, _0, _1, Fix } from "./types.ts";

import * as D from "./derivations.ts";
import * as E from "./either.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Left<L> = E.Left<L>;
export type Right<R> = E.Right<R>;
export type Both<L, R> = { tag: "Both"; left: L; right: R };
export type These<L, R> = E.Either<L, R> | Both<L, R>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const left = E.left;
export const right = E.right;
export const both = <L, R>(left: L, right: R): Both<L, R> => ({
  tag: "Both",
  left,
  right,
});

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <E, A, B>(
  onLeft: (e: E) => B,
  onRight: (a: A) => B,
  onBoth: (e: E, a: A) => B,
) =>
  (fa: These<E, A>) => {
    switch (fa.tag) {
      case "Left":
        return onLeft(fa.left);
      case "Right":
        return onRight(fa.right);
      case "Both":
        return onBoth(fa.left, fa.right);
    }
  };

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isLeft = <L, R>(m: These<L, R>): m is E.Left<L> =>
  m.tag === "Left";
export const isRight = <L, R>(m: These<L, R>): m is E.Right<R> =>
  m.tag === "Right";
export const isBoth = <L, R>(m: These<L, R>): m is Both<L, R> =>
  m.tag === "Both";

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <E, A>(
  SE: TC.Show<E>,
  SA: TC.Show<A>,
): TC.Show<These<E, A>> => ({
  show: fold(
    (left) => `Left(${SE.show(left)})`,
    (right) => `Right(${SA.show(right)})`,
    (left, right) => `Both(${SE.show(left)}, ${SA.show(right)})`,
  ),
});

export const getSemigroup = <E, A>(
  SE: TC.Semigroup<E>,
  SA: TC.Semigroup<A>,
): TC.Semigroup<These<E, A>> => ({
  concat: (x, y) => {
    if (isLeft(x)) {
      if (isLeft(y)) {
        return left(SE.concat(x.left, y.left));
      } else if (isRight(y)) {
        return both(x.left, y.right);
      }
      return both(SE.concat(x.left, y.left), y.right);
    }

    if (isRight(x)) {
      if (isLeft(y)) {
        return both(y.left, x.right);
      } else if (isRight(y)) {
        return right(SA.concat(x.right, y.right));
      }
      return both(y.left, SA.concat(x.right, y.right));
    }

    if (isLeft(y)) {
      return both(SE.concat(x.left, y.left), x.right);
    } else if (isRight(y)) {
      return both(x.left, SA.concat(x.right, y.right));
    }
    return both(SE.concat(x.left, y.left), SA.concat(x.right, y.right));
  },
});

export const getRightMonad = <E>(
  SE: TC.Semigroup<E>,
): TC.Monad<These<Fix<E>, _0>> =>
  D.createMonad<These<Fix<E>, _0>>({
    of: right,
    chain: (fatb, ta) => {
      if (isLeft(ta)) {
        return ta;
      } else if (isRight(ta)) {
        return fatb(ta.right);
      }

      const tb = fatb(ta.right);

      if (isLeft(tb)) {
        return left(SE.concat(ta.left, tb.left));
      } else if (isRight(tb)) {
        return both(ta.left, tb.right);
      }
      return both(SE.concat(ta.left, tb.left), tb.right);
    },
  });

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<These<_0, _1>, 2> = {
  map: (fab, ta) =>
    isLeft(ta)
      ? ta
      : isRight(ta)
      ? right(fab(ta.right))
      : both(ta.left, fab(ta.right)),
};

export const Bifunctor = D.createBifunctor<These<_0, _1>>({
  bimap: (fab, fcd, tac) =>
    isLeft(tac)
      ? left(fab(tac.left))
      : isRight(tac)
      ? right(fcd(tac.right))
      : both(fab(tac.left), fcd(tac.right)),
});

export const Foldable: TC.Foldable<These<_0, _1>, 2> = {
  reduce: (faba, a, tb) =>
    isLeft(tb) ? a : isRight(tb) ? faba(a, tb.right) : faba(a, tb.right),
};

export const Traversable: TC.Traversable<These<_0, _1>, 2> = {
  reduce: Foldable.reduce,
  map: Functor.map,
  traverse: <U, A, B, E>(
    F: TC.Applicative<U>,
    faub: (a: A) => $<U, [B]>,
    ta: These<E, A>,
  ) =>
    isLeft(ta)
      ? F.of(ta)
      : isRight(ta)
      ? F.map(right, faub(ta.right))
      : F.map((r) => both(ta.left, r), faub(ta.right)),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

export const { bimap } = D.createPipeableBifunctor(Bifunctor);
