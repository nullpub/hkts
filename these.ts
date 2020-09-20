import type * as TC from "./type_classes.ts";
import type { Fixed, _0, _1 } from "./hkts.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
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
 * @section Modules
 **************************************************************************************************/

export const Foldable: TC.Foldable<These<_0, _1>, 2> = {
  reduce: (faba, a, tb) =>
    isLeft(tb) ? a : isRight(tb) ? faba(a, tb.right) : faba(a, tb.right),
};

export const Traversable: TC.Traversable<These<_0, _1>, 2> = {
  reduce: Foldable.reduce,
  map: (fab, ta) =>
    isLeft(ta)
      ? ta
      : isRight(ta)
      ? right(fab(ta.right))
      : both(ta.left, fab(ta.right)),
  traverse: (F, faub, ta) =>
    isLeft(ta)
      ? F.of(ta)
      : isRight(ta)
      ? F.map(right, faub(ta.right))
      : F.map((r) => both(ta.left, r), faub(ta.right)),
};

export const Apply: TC.Apply<These<_0, _1>, 2> = {
  map: Traversable.map,
  ap: (tfab, ta) =>
    join(Traversable.map((fab) => Traversable.map(fab, ta), tfab)),
};

export const Applicative: TC.Applicative<These<_0, _1>, 2> = {
  of: right,
  ap: Apply.ap,
  map: Apply.map,
};

export const Bifunctor: TC.Bifunctor<These<_0, _1>> = {
  bimap: (fab, fcd, tac) =>
    isLeft(tac)
      ? left(fab(tac.left))
      : isRight(tac)
      ? right(fcd(tac.right))
      : both(fab(tac.left), fcd(tac.right)),
};

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
  S: TC.Semigroup<A>,
): TC.Semigroup<These<E, A>> => ({
  concat: (x, y) =>
    isLeft(y) ? x : isLeft(x) ? y : right(S.concat(x.right, y.right)),
});

export const getApplicative = <E>(
  SE: TC.Semigroup<E>,
): TC.Applicative<These<Fixed<E>, _0>> => ({
  of: right,
  map: Applicative.map,
  ap: (tfab, ta) =>
    isLeft(tfab)
      ? isLeft(ta) ? left(SE.concat(tfab.left, ta.left)) : tfab
      : isLeft(ta)
      ? ta
      : right(tfab.right(ta.right)),
});

export const getMonad = <E>(
  SE: TC.Semigroup<E>,
): TC.Monad<These<Fixed<E>, _0>> => {
  const { of, ap, map } = getApplicative(SE);
  return {
    of,
    ap,
    map,
    join: join,
    chain: (fatb, ta) => join(map(fatb, ta)),
  };
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const join: TC.MonadFn<These<_0, _1>, 2> = (tta) =>
  isRight(tta) || isBoth(tta) ? tta.right : tta;

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

export const { bimap } = D.createPipeableBifunctor(Bifunctor);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
