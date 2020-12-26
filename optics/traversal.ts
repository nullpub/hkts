import type * as TC from "../type_classes.ts";
import type { $, _0, _1, Fn, Predicate, Refinement } from "../types.ts";
import type { Either } from "../either.ts";
import type { Option } from "../option.ts";

import * as A from "../array.ts";
import * as I from "../identity.ts";
import * as O from "../option.ts";
import * as E from "../either.ts";
import * as C from "../const.ts";
import { flow, identity, pipe } from "../fns.ts";

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
import { createTraversal } from "./shared.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

// deno-fmt-ignore
export type GetModifyFn<S, A> = {
  <T, L extends 1>(A: TC.Applicative<T, L>): (
    f: (a: A) => $<T, [A]>
  ) => (s: S) => $<T, [S]>;
  <T, L extends 2>(A: TC.Applicative<T, L>): <E>(
    f: (a: A) => $<T, [E, A]>
  ) => (s: S) => $<T, [E, S]>;
  <T, L extends 3>(A: TC.Applicative<T, L>): <R, E>(
    f: (a: A) => $<T, [R, E, A]>
  ) => (s: S) => $<T, [R, E, S]>;
  <T, L extends 4>(A: TC.Applicative<T, L>): <U, R, E>(
    f: (a: A) => $<T, [U, R, E, A]>
  ) => (s: S) => $<T, [U, R, E, S]>;
};

export type Traversal<S, A> = {
  readonly getModify: GetModifyFn<S, A>;
};

export type From<T> = T extends Traversal<infer S, infer _> ? S : never;

export type To<T> = T extends Traversal<infer _, infer A> ? A : never;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const fromTraversable = createTraversal;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Traversal<_0, _1>> = {
  id: () => ({
    getModify: () => identity,
  }),
  compose: (jk) =>
    (ij) => ({
      getModify: (F) => {
        const fij = ij.getModify(F);
        const fjk = jk.getModify(F);
        return (f) => fij(fjk(f));
      },
    }),
};

/***************************************************************************************************
 * @section Pipeable Compose
 **************************************************************************************************/

export const id: <A>() => Traversal<A, A> = Category.id;

// deno-fmt-ignore
export const compose = <A, B>(ab: Traversal<A, B>) => <S>(
  sa: Traversal<S, A>
): Traversal<S, B> => ({
  getModify: pipe(sa, Category.compose(ab)).getModify
});

export const composeIso = flow(isoAsTraversal, compose);

export const composeLens = flow(lensAsTraversal, compose);

export const composePrism = flow(prismAsTraversal, compose);

export const composeOptional = flow(optionalAsTraversal, compose);

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const modify = <A>(f: (a: A) => A) =>
  <S>(sa: Traversal<S, A>) => sa.getModify(I.Applicative)(f);

export const set = <A>(a: A): (<S>(sa: Traversal<S, A>) => (s: S) => S) => {
  return modify(() => a);
};

type FilterFn = {
  <A, B extends A>(refinement: Refinement<A, B>): <S>(
    sa: Traversal<S, A>,
  ) => Traversal<S, B>;
  <A>(predicate: Predicate<A>): <S>(sa: Traversal<S, A>) => Traversal<S, A>;
};

export const filter: FilterFn = <A>(predicate: Predicate<A>) =>
  pipe(fromPredicate(predicate), composePrism);

export const prop = <A, P extends keyof A>(
  prop: P,
): (<S>(sa: Traversal<S, A>) => Traversal<S, A[P]>) =>
  pipe(lensId<A>(), lensProp(prop), composeLens);

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Traversal<S, A>) => Traversal<S, { [K in P]: A[K] }>) =>
  pipe(lensId<A>(), lensProps(...props), composeLens);

export const index = (i: number) =>
  <S, A>(
    sa: Traversal<S, ReadonlyArray<A>>,
  ): Traversal<S, A> => composeOptional(indexArray<A>().index(i))(sa);

export const key = (key: string) =>
  <S, A>(
    sa: Traversal<S, Readonly<Record<string, A>>>,
  ): Traversal<S, A> => composeOptional(indexRecord<A>().index(key))(sa);

export const atKey = (key: string) =>
  <S, A>(
    sa: Traversal<S, Readonly<Record<string, A>>>,
  ): Traversal<S, Option<A>> => composeLens(atRecord<A>().at(key))(sa);

// deno-fmt-ignore
type TraverseFn = {
  <T, L extends 1>(T: TC.Traversable<T, L>): <S, A>(
    sta: Traversal<S, $<T, [A]>>
  ) => Traversal<S, A>;
  <T, L extends 2>(T: TC.Traversable<T, L>): <S, E, A>(
    sta: Traversal<S, $<T, [E, A]>>
  ) => Traversal<S, A>;
  <T, L extends 3>(T: TC.Traversable<T, L>): <S, R, E, A>(
    sta: Traversal<S, $<T, [R, E, A]>>
  ) => Traversal<S, A>;
  <T, L extends 4>(T: TC.Traversable<T, L>): <S, Q, R, E, A>(
    sta: Traversal<S, $<T, [Q, R, E, A]>>
  ) => Traversal<S, A>;
};

export const traverse: TraverseFn = <T>(T: TC.Traversable<T>) =>
  <S, A>(
    sa: Traversal<S, $<T, [A]>>,
  ): Traversal<S, A> => pipe(sa, compose({ getModify: T.traverse } as any));

export const foldMap = <M>(M: TC.Monoid<M>) =>
  <A>(f: (a: A) => M) =>
    <S>(
      sa: Traversal<S, A>,
    ): ((s: S) => M) => sa.getModify(C.getApplicative(M))((a) => C.make(f(a)));

export const fold = <A>(
  M: TC.Monoid<A>,
): (<S>(sa: Traversal<S, A>) => (s: S) => A) => foldMap(M)(identity);

export const getAll = <S, A>(sa: Traversal<S, A>) =>
  (s: S): ReadonlyArray<A> => foldMap(A.getMonoid<A>())((a: A) => [a])(sa)(s);

/***************************************************************************************************
 * @section Pipeable Over ADT
 **************************************************************************************************/

export const some: <S, A>(
  soa: Traversal<S, Option<A>>,
) => Traversal<S, A> = composePrism({
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
