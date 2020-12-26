import type * as TC from "./type_classes.ts";
import type {
  $,
  _0,
  _1,
  _2,
  _3,
  Fix,
  Fn,
  Lazy,
  Predicate,
  Refinement,
} from "./types.ts";

import * as O from "./option.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { identity, isNotNil, pipe } from "./fns.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Left<L> = { tag: "Left"; left: L };

export type Right<R> = { tag: "Right"; right: R };

export type Either<L, R> = Left<L> | Right<R>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const left = <E = never, A = never>(left: E): Either<E, A> => ({
  tag: "Left",
  left,
});

export const right = <E = never, A = never>(right: A): Either<E, A> => ({
  tag: "Right",
  right,
});

export const fromNullable = <E>(e: Lazy<E>) =>
  <A>(a: A): Either<E, NonNullable<A>> => (isNotNil(a) ? right(a) : left(e()));

export const tryCatch = <E, A>(
  f: Lazy<A>,
  onError: (e: unknown) => E,
): Either<E, A> => {
  try {
    return right(f());
  } catch (e) {
    return left(onError(e));
  }
};

export const tryCatchWrap = <E, A, AS extends unknown[]>(
  fn: Fn<AS, A>,
  onError: (e: unknown) => E,
): Fn<AS, Either<E, A>> =>
  (...as: AS) => {
    try {
      return right(fn(...as));
    } catch (e) {
      return left(onError(e));
    }
  };

export const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    a: A,
  ) => Either<E, B>;
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => Either<E, A>;
} = <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E) =>
  (a: A) => predicate(a) ? right(a) : left(onFalse(a));

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <L, R, B>(
  onLeft: (left: L) => B,
  onRight: (right: R) => B,
) => (ma: Either<L, R>): B => isLeft(ma) ? onLeft(ma.left) : onRight(ma.right);

export const getOrElse = <E, A>(onLeft: (e: E) => A) =>
  (ma: Either<E, A>): A => isLeft(ma) ? onLeft(ma.left) : ma.right;

export const getRight = <E, A>(ma: Either<E, A>): O.Option<A> =>
  pipe(ma, fold(O.constNone, O.some));

export const getLeft = <E, A>(ma: Either<E, A>): O.Option<E> =>
  pipe(ma, fold(O.some, O.constNone));

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const swap = <E, A>(ma: Either<E, A>): Either<A, E> =>
  isLeft(ma) ? right(ma.left) : left(ma.right);

export const orElse = <E, A, M>(onLeft: (e: E) => Either<M, A>) =>
  (
    ma: Either<E, A>,
  ): Either<M, A> => (isLeft(ma) ? onLeft(ma.left) : ma);

export const stringifyJSON = <E>(
  u: unknown,
  onError: (reason: unknown) => E,
): Either<E, string> => tryCatch(() => JSON.stringify(u), onError);

/***************************************************************************************************
 * @section Guards
 **************************************************************************************************/

export const isLeft = <L, R>(m: Either<L, R>): m is Left<L> => m.tag === "Left";

export const isRight = <L, R>(m: Either<L, R>): m is Right<R> =>
  m.tag === "Right";

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <E, A>(
  SE: TC.Show<E>,
  SA: TC.Show<A>,
): TC.Show<Either<E, A>> => ({
  show: fold(
    (left) => `Left(${SE.show(left)})`,
    (right) => `Right(${SA.show(right)})`,
  ),
});

export const getSetoid = <E, A>(
  SE: TC.Setoid<E>,
  SA: TC.Setoid<A>,
): TC.Setoid<Either<E, A>> => ({
  equals: (x, y) => {
    if (isLeft(x)) {
      if (isLeft(y)) {
        return SE.equals(x.left, y.left);
      }
      return false;
    }

    if (isLeft(y)) {
      return false;
    }
    return SA.equals(x.right, y.right);
  },
});

export const getOrd = <E, A>(
  OE: TC.Ord<E>,
  OA: TC.Ord<A>,
): TC.Ord<Either<E, A>> => ({
  ...getSetoid(OE, OA),
  lte: (x, y) => {
    if (isLeft(x)) {
      if (isLeft(y)) {
        return OE.lte(x.left, y.left);
      }
      return true;
    }

    if (isLeft(y)) {
      return false;
    }
    return OA.lte(x.right, y.right);
  },
});

export const getSemigroup = <E, A>(
  SA: TC.Semigroup<A>,
): TC.Semigroup<Either<E, A>> => ({
  concat: (x, y) =>
    isLeft(x) ? x : isLeft(y) ? y : right(SA.concat(x.right, y.right)),
});

export const getMonoid = <E, A>(
  MA: TC.Monoid<A>,
): TC.Monoid<Either<E, A>> => ({
  ...getSemigroup(MA),
  empty: () => right(MA.empty()),
});

export const getRightMonad = <E>(
  S: TC.Semigroup<E>,
): TC.Monad<Either<Fix<E>, _0>> => ({
  of: right,
  ap: (tfab) =>
    (ta) =>
      isLeft(tfab)
        ? (isLeft(ta) ? left(S.concat(tfab.left, ta.left)) : tfab)
        : (isLeft(ta) ? ta : right(tfab.right(ta.right))),
  map: (fab) => (ta) => isLeft(ta) ? ta : right(fab(ta.right)),
  join: (tta) => isLeft(tta) ? tta : tta.right,
  chain: (fatb) => (ta) => isLeft(ta) ? ta : fatb(ta.right),
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad: TC.Monad<Either<_0, _1>, 2> = {
  of: right,
  ap: (tfab) =>
    (ta) => isLeft(ta) ? ta : isLeft(tfab) ? tfab : right(tfab.right(ta.right)),
  map: (fab) => (ta) => isLeft(ta) ? ta : right(fab(ta.right)),
  join: (tta) => isLeft(tta) ? tta : tta.right,
  chain: (fatb) => (ta) => (isRight(ta) ? fatb(ta.right) : ta),
};

export const Functor: TC.Functor<Either<_0, _1>, 2> = Monad;

export const Applicative: TC.Applicative<Either<_0, _1>, 2> = Monad;

export const Apply: TC.Apply<Either<_0, _1>, 2> = Monad;

export const Chain: TC.Chain<Either<_0, _1>, 2> = Monad;

export const Bifunctor: TC.Bifunctor<Either<_0, _1>, 2> = {
  bimap: (fab, fcd) =>
    (tac) => isLeft(tac) ? left(fab(tac.left)) : right(fcd(tac.right)),
  mapLeft: (fef) => Bifunctor.bimap(fef, identity),
};

export const MonadThrow: TC.MonadThrow<Either<_0, _1>, 2> = ({
  ...Monad,
  throwError: left,
});

export const Alt: TC.Alt<Either<_0, _1>, 2> = {
  map: Monad.map,
  alt: (tb) => (ta) => isLeft(ta) ? tb : ta,
};

export const Extend: TC.Extend<Either<_0, _1>, 2> = {
  map: Monad.map,
  extend: (ftab) => (ta) => right(ftab(ta)),
};

export const Foldable: TC.Foldable<Either<_0, _1>, 2> = {
  reduce: (faba, a) => (tb) => (isRight(tb) ? faba(a, tb.right) : a),
};

export const Traversable: TC.Traversable<Either<_0, _1>, 2> = {
  map: Monad.map,
  reduce: Foldable.reduce,
  traverse: <U>(A: TC.Applicative<U>) =>
    <E, A, B>(faub: (a: A) => $<U, [B]>) =>
      (ta: Either<E, A>) =>
        isLeft(ta) ? A.of(left(ta.left)) : A.map(right)(faub(ta.right)),
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

export const { reduce, traverse } = Traversable;

export const { bimap, mapLeft } = Bifunctor;

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
