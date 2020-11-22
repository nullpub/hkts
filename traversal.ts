import type * as TC from "./type_classes.ts";
import type { $, _0, _1, Predicate, Refinement } from "./types.ts";
import type { Iso } from "./iso.ts";
import type { Lens } from "./lens.ts";
import type { Prism } from "./prism.ts";
import type { Optional } from "./optional.ts";
import type { Option } from "./option.ts";

import * as Id from "./identity.ts";
import * as I from "./iso.ts";
import * as P from "./prism.ts";
import * as L from "./lens.ts";
import * as O from "./optional.ts";
import * as A from "./array.ts";
import { identity, pipe } from "./fns.ts";

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

export const composeIso = <A, B>(
  ab: Iso<A, B>,
) =>
  <S>(sa: Traversal<S, A>): Traversal<S, B> => compose(I.asTraversal(ab))(sa);

export const composeLens = <A, B>(
  ab: Lens<A, B>,
) =>
  <S>(sa: Traversal<S, A>): Traversal<S, B> => compose(L.asTraversal(ab))(sa);

export const composePrism = <A, B>(
  ab: Prism<A, B>,
) =>
  <S>(sa: Traversal<S, A>): Traversal<S, B> => compose(P.asTraversal(ab))(sa);

export const composeOptional = <A, B>(
  ab: Optional<A, B>,
) =>
  <S>(sa: Traversal<S, A>): Traversal<S, B> => compose(O.asTraversal(ab))(sa);

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
  compose(P.asTraversal(P.fromPredicate(predicate)));

export const prop = <A, P extends keyof A>(
  prop: P,
): (<S>(sa: Traversal<S, A>) => Traversal<S, A[P]>) =>
  compose(pipe(L.id<A>(), L.prop(prop), L.asTraversal));

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Traversal<S, A>) => Traversal<S, { [K in P]: A[K] }>) =>
  compose(pipe(L.id<A>(), L.props(...props), L.asTraversal));

export const index = (i: number) =>
  <S, A>(sa: Traversal<S, ReadonlyArray<A>>): Traversal<S, A> =>
    pipe(sa, compose(O.asTraversal(O.indexArray<A>().index(i))));

export const key = (key: string) =>
  <S, A>(sa: Traversal<S, Readonly<Record<string, A>>>): Traversal<S, A> =>
    pipe(sa, compose(O.asTraversal(O.indexRecord<A>().index(key))));

export const atKey = (key: string) =>
  <S, A>(
    sa: Traversal<S, Readonly<Record<string, A>>>,
  ): Traversal<S, Option<A>> =>
    pipe(sa, compose(L.asTraversal(L.atRecord<A>().at(key))));

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

export const fromArray = <S>() => compose(fromTraversable(A.Traversable)<S>());
