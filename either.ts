import { _0, _1, $ } from "./hkts.ts";
import * as SL from "./type-classes.ts";

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

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <L, R, B>(
  onLeft: (left: L) => B,
  onRight: (right: R) => B
) => (ma: Either<L, R>): B =>
  isLeft(ma) ? onLeft(ma.left) : onRight(ma.right);

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isLeft = <L, R>(m: Either<L, R>): m is Left<L> => m.tag === "Left";
export const isRight = <L, R>(m: Either<L, R>): m is Right<R> =>
  m.tag === "Right";

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Foldable: SL.Foldable2<Either<_0, _1>> = {
  reduce: (faba, a, tb) => (isRight(tb) ? faba(a, tb.right) : a),
};

export const Monad = SL.createMonad2<Either<_0, _1>>({
  of: right,
  chain: (fatb, ta) => (isRight(ta) ? fatb(ta.right) : ta),
});

export const Traversable: SL.Traversable2<Either<_0, _1>> = {
  map: Monad.map,
  reduce: Foldable.reduce,
  traverse: (F, faub, ta) =>
    isLeft(ta) ? F.of(left(ta.left)) : F.map(right, faub(ta.right)),
};

export const Applicative: SL.Applicative2<Either<_0, _1>> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

export const Apply: SL.Apply2<Either<_0, _1>> = {
  ap: Monad.ap,
  map: Monad.map,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = SL.createPipeableMonad2(Monad);

export const { reduce, traverse } = SL.createPipeableTraversable2(Traversable);
