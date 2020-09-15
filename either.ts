import type * as TC from "./type-classes.ts";
import type { _0, _1 } from "./hkts.ts";

import { isNotNil, Lazy, Predicate, Refinement } from "./fns.ts";
import {
  createMonad2,
  createPipeableBifunctor,
  createPipeableMonad,
  createPipeableTraversable,
} from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Left<L> = { tag: "Left"; left: L };
export type Right<R> = { tag: "Right"; right: R };
export type Either<L, R> = Left<L> | Right<R>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const left = <L>(left: L): Left<L> => ({ tag: "Left", left });
export const right = <R>(right: R): Right<R> => ({ tag: "Right", right });

export function fromNullable<E>(e: E): <A>(a: A) => Either<E, NonNullable<A>> {
  return <A>(a: A) => (isNotNil(a) ? right(a) : left(e));
}

export function tryCatch<E, A>(
  f: Lazy<A>,
  onError: (e: unknown) => E
): Either<E, A> {
  try {
    return right(f());
  } catch (e) {
    return left(onError(e));
  }
}

export const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    a: A
  ) => Either<E, B>;
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => Either<E, A>;
} = <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E) => (a: A) =>
  predicate(a) ? right(a) : left(onFalse(a));

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <L, R, B>(
  onLeft: (left: L) => B,
  onRight: (right: R) => B
) => (ma: Either<L, R>): B =>
  isLeft(ma) ? onLeft(ma.left) : onRight(ma.right);

export const getOrElse = <E, A>(onLeft: (e: E) => A) => (ma: Either<E, A>): A =>
  isLeft(ma) ? onLeft(ma.left) : ma.right;

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const swap = <E, A>(ma: Either<E, A>): Either<A, E> =>
  isLeft(ma) ? right(ma.left) : left(ma.right);

export const orElse = <E, A, M>(onLeft: (e: E) => Either<M, A>) => (
  ma: Either<E, A>
): Either<M, A> => (isLeft(ma) ? onLeft(ma.left) : ma);

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isLeft = <L, R>(m: Either<L, R>): m is Left<L> => m.tag === "Left";
export const isRight = <L, R>(m: Either<L, R>): m is Right<R> =>
  m.tag === "Right";

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const getShow = <E, A>(
  Se: TC.Show<E>,
  Sa: TC.Show<A>
): TC.Show<Either<E, A>> => ({
  show: (ma) =>
    isLeft(ma) ? `Left(${Se.show(ma.left)})` : `Right(${Sa.show(ma.right)})`,
});

export const getSemigroup = <E, A>(
  S: TC.Semigroup<A>
): TC.Semigroup<Either<E, A>> => ({
  concat: (x, y) =>
    isLeft(y) ? x : isLeft(x) ? y : right(S.concat(x.right, y.right)),
});

export const Foldable: TC.Foldable2<Either<_0, _1>> = {
  reduce: (faba, a, tb) => (isRight(tb) ? faba(a, tb.right) : a),
};

export const Monad = createMonad2<Either<_0, _1>>({
  of: right,
  chain: (fatb, ta) => (isRight(ta) ? fatb(ta.right) : ta),
});

export const Traversable: TC.Traversable2<Either<_0, _1>> = {
  map: Monad.map,
  reduce: Foldable.reduce,
  traverse: (F, faub, ta) =>
    isLeft(ta) ? F.of(left(ta.left)) : F.map(right, faub(ta.right)),
};

export const Applicative: TC.Applicative2<Either<_0, _1>> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: TC.Apply2<Either<_0, _1>> = {
  ap: Monad.ap,
  map: Monad.map,
};

export const Bifunctor: TC.Bifunctor<Either<_0, _1>> = {
  bimap: (fab, fcd, tac) =>
    isLeft(tac) ? left(fab(tac.left)) : right(fcd(tac.right)),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = createPipeableMonad(Monad);

export const { reduce, traverse } = createPipeableTraversable(Traversable);

export const { bimap } = createPipeableBifunctor(Bifunctor);
