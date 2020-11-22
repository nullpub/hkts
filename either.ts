import type * as TC from "./type_classes.ts";
import type {
  $,
  _0,
  _1,
  _2,
  _3,
  Fix,
  Lazy,
  Predicate,
  Refinement,
} from "./types.ts";

import * as O from "./option.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { isNotNil, pipe } from "./fns.ts";
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

export const fromNullable = <E>(e: E) =>
  <A>(a: A): Either<E, NonNullable<A>> => (isNotNil(a) ? right(a) : left(e));

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
      return false;
    }

    if (isLeft(y)) {
      return false;
    }
    return OA.lte(x.right, y.right);
  },
});

export const getSemigroup = <E, A>(
  SE: TC.Semigroup<E>,
  SA: TC.Semigroup<A>,
): TC.Semigroup<Either<E, A>> => ({
  concat: (x, y) => {
    if (isLeft(x)) {
      if (isLeft(y)) {
        return left(SE.concat(x.left, y.left));
      }
      return y;
    }

    if (isLeft(y)) {
      return x;
    }
    return right(SA.concat(x.right, y.right));
  },
});

export const getMonoid = <E, A>(
  ME: TC.Monoid<E>,
  MA: TC.Monoid<A>,
): TC.Monoid<Either<E, A>> => ({
  ...getSemigroup(ME, MA),
  empty: () => right(MA.empty()),
});

/**
 * @todo Run this through a truth table to check that the law holds since empty is
 * right(MA.empty()). It's likely I'll need to create right/left semigroup, monoid,
 * etc instances or research how this is done elsewhere. I think maybe we focus on
 * a RightSemigroup, RightMonoidd, and RightGroup and fix E.
 */
export const getGroup = <E, A>(
  GE: TC.Group<E>,
  GA: TC.Group<A>,
): TC.Group<Either<E, A>> => ({
  ...getMonoid(GE, GA),
  invert: (ta) =>
    isLeft(ta) ? left(GE.invert(ta.left)) : right(GA.invert(ta.right)),
});

export const getRightMonad = <E>(
  S: TC.Semigroup<E>,
): TC.Monad<Either<Fix<E>, _0>> => ({
  of: right,
  ap: (tfab, ta) =>
    isLeft(tfab)
      ? (isLeft(ta) ? left(S.concat(tfab.left, ta.left)) : tfab)
      : (isLeft(ta) ? ta : right(tfab.right(ta.right))),
  map: (fab, ta) => isLeft(ta) ? ta : right(fab(ta.right)),
  join: (tta) => isLeft(tta) ? tta : tta.right,
  chain: (fatb, ta) => isLeft(ta) ? ta : fatb(ta.right),
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Either<_0, _1>, 2> = {
  map: (fab, ta) => isLeft(ta) ? ta : right(fab(ta.right)),
};

export const Bifunctor = D.createBifunctor<Either<_0, _1>>({
  bimap: (fab, fcd, tac) =>
    isLeft(tac) ? left(fab(tac.left)) : right(fcd(tac.right)),
});

export const Monad = D.createMonad<Either<_0, _1>, 2>({
  of: right,
  chain: (fatb, ta) => (isRight(ta) ? fatb(ta.right) : ta),
});

export const MonadThrow: TC.MonadThrow<Either<_0, _1>, 2> = ({
  ...Monad,
  throwError: left,
});

export const Alt: TC.Alt<Either<_0, _1>, 2> = {
  map: Functor.map,
  alt: (ta, tb) => isLeft(ta) ? tb : ta,
};

export const Applicative: TC.Applicative<Either<_0, _1>, 2> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Functor.map,
};

export const Apply: TC.Apply<Either<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<Either<_0, _1>, 2> = {
  ap: Monad.ap,
  map: Functor.map,
  chain: Monad.chain,
};

export const Extend: TC.Extend<Either<_0, _1>, 2> = {
  map: Functor.map,
  extend: (ftab, ta) => right(ftab(ta)),
};

export const Foldable: TC.Foldable<Either<_0, _1>, 2> = {
  reduce: (faba, a, tb) => (isRight(tb) ? faba(a, tb.right) : a),
};

export const Traversable: TC.Traversable<Either<_0, _1>, 2> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: <U, A, B, E>(
    F: TC.Applicative<U>,
    faub: (a: A) => $<U, [B]>,
    ta: Either<E, A>,
  ) => isLeft(ta) ? F.of(left(ta.left)) : F.map(right, faub(ta.right)),
};

/***************************************************************************************************
 * @section Transformers
 **************************************************************************************************/

// deno-fmt-ignore
type ComposeEitherMonad = {
  <T, L extends 1>(M: TC.Monad<T, L>): TC.Monad<$<T, [Either<_0, _1>]>, 2>;
  <T, L extends 2>(M: TC.Monad<T, L>): TC.Monad<$<T, [_0, Either<_1, _2>]>, 3>;
  <T, L extends 3>(M: TC.Monad<T, L>): TC.Monad<$<T, [_0, _1, Either<_2, _3>]>, 4>;
  <T, L extends 4>(M: TC.Monad<T, L>): unknown;
};

/**
 * This is an experimental interface. Ideally, the substitution type would handle this
 * a bit better so we wouldn't have to do unsafe coercion.
 * @experimental
 */
export const composeMonad: ComposeEitherMonad = <T>(M: TC.Monad<T>) =>
  D.createMonad<$<T, [Either<_0, _1>]>, 2>({
    of: <E, A>(a: A) =>
      (M.of(right(a)) as unknown) as $<$<T, [Either<_0, _1>]>, [E, A]>,
    chain: <E, A, B>(
      fatb: (a: A) => $<$<T, [Either<_0, _1>]>, [E, B]>,
      ta: $<$<T, [Either<_0, _1>]>, [E, A]>,
    ) =>
      (M.chain(
        (e: Either<E, A>): $<T, [unknown]> =>
          ((isLeft(e) ? M.of(left(e.left)) : fatb(e.right)) as unknown) as $<
            T,
            [unknown]
          >,
        ta as $<T, [Either<E, A>]>,
      ) as unknown) as $<$<T, [Either<_0, _1>]>, [E, B]>,
  });

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = D.createPipeableMonad(Monad);

export const { reduce, traverse } = D.createPipeableTraversable(Traversable);

export const { bimap, mapLeft } = D.createPipeableBifunctor(Bifunctor);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
