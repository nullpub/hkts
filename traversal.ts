import type * as TC from "./type_classes.ts";
import type { $, _0, _1, Predicate, Refinement } from "./types.ts";
import type { Either } from "./either.ts";
import type { Option } from "./option.ts";

import * as Id from "./identity.ts";
import * as O from "./option.ts";
import * as E from "./either.ts";
import { flow, identity, pipe } from "./fns.ts";

import { atRecord } from "./at.ts";
import { indexArray, indexRecord } from "./index.ts";
import { asTraversal as isoAsTraversal } from "./iso.ts";
import { asTraversal as prismAsTraversal, fromPredicate } from "./prism.ts";
import { asTraversal as optionalAsTraversal } from "./optional.ts";
import {
  asTraversal as lensAsTraversal,
  id as lensId,
  prop as lensProp,
  props as lensProps,
} from "./lens.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Traversal<S, A> = {
  readonly getModify: <T>(
    A: TC.Applicative<T>,
  ) => (f: (a: A) => $<T, [A]>) => (s: S) => $<T, [S]>;
};

export type From<T> = T extends Traversal<infer S, infer _> ? S : never;

export type To<T> = T extends Traversal<infer _, infer A> ? A : never;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const id = <S>(): Traversal<S, S> => ({
  getModify: (_) => (f) => f,
});

type FromTraversableFn = {
  <T, L extends 1>(T: TC.Traversable<T, L>): <A>() => Traversal<$<T, [A]>, A>;
  <T, L extends 2>(
    T: TC.Traversable<T, L>,
  ): <E, A>() => Traversal<$<T, [E, A]>, A>;
  <T, L extends 3>(
    T: TC.Traversable<T, L>,
  ): <R, E, A>() => Traversal<$<T, [R, E, A]>, A>;
  <T, L extends 4>(
    T: TC.Traversable<T, L>,
  ): <S, R, E, A>() => Traversal<$<T, [S, R, E, A]>, A>;
};

export const fromTraversable: FromTraversableFn = <T>(T: TC.Traversable<T>) =>
  <A>(): Traversal<$<T, [A]>, A> => ({
    getModify: <U>(A: TC.Applicative<U>) => {
      return (f: (a: A) => $<U, [A]>) => (s: $<T, [A]>) => T.traverse(A, f, s);
    },
  });

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Traversal<_0, _1>> = ({
  id: () => ({
    getModify: () => identity,
  }),
  compose: (tij, tjk) => ({
    getModify: (F) => {
      const fij = tij.getModify(F);
      const fjk = tjk.getModify(F);
      return (f) => fij(fjk(f));
    },
  }),
});

/***************************************************************************************************
 * @section Pipeable Compose
 **************************************************************************************************/

export const compose = <A, B>(
  ab: Traversal<A, B>,
) =>
  <S>(sa: Traversal<S, A>): Traversal<S, B> => ({
    getModify: (F) => (f) => sa.getModify(F)(ab.getModify(F)(f)),
  });

export const composeIso = flow(isoAsTraversal, compose);

export const composeLens = flow(lensAsTraversal, compose);

export const composePrism = flow(prismAsTraversal, compose);

export const composeOptional = flow(optionalAsTraversal, compose);

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const modify = <A>(f: (a: A) => A) =>
  <S>(sa: Traversal<S, A>) => (s: S): S => sa.getModify(Id.Applicative)(f)(s);

export const set = <A>(a: A): (<S>(sa: Traversal<S, A>) => (s: S) => S) => {
  return modify(() => a);
};

type FilterFn = {
  <A, B extends A>(
    refinement: Refinement<A, B>,
  ): <S>(sa: Traversal<S, A>) => Traversal<S, B>;
  <A>(
    predicate: Predicate<A>,
  ): <S>(sa: Traversal<S, A>) => Traversal<S, A>;
};

export const filter: FilterFn = <A>(predicate: Predicate<A>) =>
  pipe(
    fromPredicate(predicate),
    composePrism,
  );

export const prop = <A, P extends keyof A>(
  prop: P,
): (<S>(sa: Traversal<S, A>) => Traversal<S, A[P]>) =>
  pipe(lensId<A>(), lensProp(prop), composeLens);

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Traversal<S, A>) => Traversal<S, { [K in P]: A[K] }>) =>
  pipe(lensId<A>(), lensProps(...props), composeLens);

export const index = (i: number) =>
  <S, A>(sa: Traversal<S, ReadonlyArray<A>>): Traversal<S, A> =>
    composeOptional(indexArray<A>().index(i))(sa);

export const key = (key: string) =>
  <S, A>(sa: Traversal<S, Readonly<Record<string, A>>>): Traversal<S, A> =>
    composeOptional(indexRecord<A>().index(key))(sa);

export const atKey = (key: string) =>
  <S, A>(
    sa: Traversal<S, Readonly<Record<string, A>>>,
  ): Traversal<S, Option<A>> => composeLens(atRecord<A>().at(key))(sa);

/***************************************************************************************************
 * @section Pipeable Over ADT
 **************************************************************************************************/

export const some: <S, A>(soa: Traversal<S, Option<A>>) => Traversal<S, A> =
  composePrism({
    getOption: identity,
    reverseGet: O.some,
  });

export const right: <S, E, A>(
  sea: Traversal<S, Either<E, A>>,
) => Traversal<S, A> = composePrism({
  getOption: E.getRight,
  reverseGet: E.right,
});

export const left: <S, E, A>(
  sea: Traversal<S, Either<E, A>>,
) => Traversal<S, E> = composePrism({
  getOption: E.getLeft,
  reverseGet: E.left,
});
