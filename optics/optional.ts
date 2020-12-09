import type * as TC from "../type_classes.ts";
import type { $, _0, _1, Fn, Predicate, Refinement } from "../types.ts";
import type { Either } from "../either.ts";
import type { Option } from "../option.ts";

import type { Iso } from "./iso.ts";
import type { Lens } from "./lens.ts";
import type { Prism } from "./prism.ts";
import { Traversal } from "./traversal.ts";

import * as O from "../option.ts";
import * as E from "../either.ts";
import { constant, flow, identity, pipe } from "../fns.ts";

import { atRecord } from "./at.ts";
import { indexArray, indexRecord } from "./index.ts";
import { id as lensId, prop as lensProp, props as lensProps } from "./lens.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Optional<S, A> = {
  readonly getOption: (s: S) => Option<A>;
  readonly set: (a: A) => (s: S) => S;
};

export type From<T> = T extends Optional<infer S, infer _> ? S : never;

export type To<T> = T extends Optional<infer _, infer A> ? A : never;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Optional<_0, _1>> = {
  id: () => ({
    getOption: O.some,
    set: constant,
  }),
  compose: (jk) =>
    (ij) => ({
      getOption: flow(ij.getOption, O.chain(jk.getOption)),
      set: (b) =>
        (s) =>
          pipe(
            ij.getOption(s),
            O.map(jk.set(b)),
            O.fold(ij.set, () => identity),
          )(s),
    }),
};

/***************************************************************************************************
 * @section Converters
 **************************************************************************************************/

export const asTraversal = <S, A>(sa: Optional<S, A>): Traversal<S, A> => ({
  getModify: <T>(F: TC.Applicative<T>) =>
    (f: Fn<[A], $<T, [A]>>) =>
      (s: S) =>
        pipe(
          sa.getOption(s),
          O.fold(
            (a) => pipe(f(a), F.map((a) => sa.set(a)(s))),
            () => F.of(s),
          ),
        ),
});

export const fromNullable = <S, A>(
  sa: Optional<S, A>,
): Optional<S, NonNullable<A>> => ({
  getOption: flow(sa.getOption, O.chain(O.fromNullable)),
  set: sa.set,
});

/***************************************************************************************************
 * @section Pipeable Compose
 **************************************************************************************************/

export const { id, compose } = Category;

export const composeIso = <A, B>(ab: Iso<A, B>) =>
  <S>(
    sa: Optional<S, A>,
  ): Optional<S, B> => ({
    getOption: flow(sa.getOption, O.map(ab.get)),
    set: flow(ab.reverseGet, sa.set),
  });

export const composeLens = <A, B>(ab: Lens<A, B>) =>
  <S>(
    sa: Optional<S, A>,
  ): Optional<S, B> => ({
    getOption: flow(sa.getOption, O.map(ab.get)),
    set: (b) =>
      (s) => {
        const oa = sa.getOption(s);
        const oa1 = pipe(oa, O.map(ab.set(b)));
        return O.isSome(oa1) ? sa.set(oa1.value)(s) : s;
      },
  });

export const composePrism = <A, B>(ab: Prism<A, B>) =>
  <S>(
    sa: Optional<S, A>,
  ): Optional<S, B> => ({
    getOption: flow(sa.getOption, O.chain(ab.getOption)),
    set: flow(ab.reverseGet, sa.set),
  });

export const composeTraversal = <A, B>(ab: Traversal<A, B>) =>
  <S>(
    sa: Optional<S, A>,
  ): Traversal<S, B> => ({
    getModify: <T>(A: TC.Applicative<T>) =>
      (f: Fn<[B], $<T, [B]>>) =>
        (s: S) =>
          pipe(
            sa.getOption(s),
            O.fold(
              (a) => pipe(ab.getModify(A)(f)(a), A.map((a) => sa.set(a)(s))),
              () => A.of(s),
            ),
          ),
  });

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

type FilterFn = {
  <A, B extends A>(refinement: Refinement<A, B>): <S>(
    sa: Optional<S, A>,
  ) => Optional<S, B>;
  <A>(predicate: Predicate<A>): <S>(sa: Optional<S, A>) => Optional<S, A>;
};

export const filter: FilterFn = <A>(predicate: Predicate<A>) =>
  <S>(
    sa: Optional<S, A>,
  ): Optional<S, A> => ({
    getOption: flow(sa.getOption, O.chain(O.fromPredicate(predicate))),
    set: sa.set,
  });

export const modify = <A>(faa: (a: A) => A) =>
  <S>(sa: Optional<S, A>) =>
    (
      s: S,
    ): S =>
      pipe(
        sa.getOption(s),
        O.map(faa),
        O.fold((a) => sa.set(a)(s), constant(s)),
      );

export const prop = <A, P extends keyof A>(prop: P) =>
  pipe(lensId<A>(), lensProp(prop), composeLens);

export const props = <A, P extends keyof A>(...props: [P, P, ...Array<P>]) =>
  pipe(lensId<A>(), lensProps(...props), composeLens);

export const index = (i: number) =>
  <S, A>(
    sa: Optional<S, ReadonlyArray<A>>,
  ): Optional<S, A> => pipe(sa, compose(indexArray<A>().index(i)));

export const key = (key: string) =>
  <S, A>(
    sa: Optional<S, Readonly<Record<string, A>>>,
  ): Optional<S, A> => pipe(sa, compose(indexRecord<A>().index(key)));

export const atKey = (key: string) =>
  <S, A>(
    sa: Optional<S, Readonly<Record<string, A>>>,
  ): Optional<S, Option<A>> => composeLens(atRecord<A>().at(key))(sa);

/***************************************************************************************************
 * @section Pipeable Over ADT
 **************************************************************************************************/

export const some: <S, A>(
  soa: Optional<S, Option<A>>,
) => Optional<S, A> = compose({
  getOption: identity,
  set: flow(O.some, constant),
});

export const right: <S, E, A>(
  sea: Optional<S, Either<E, A>>,
) => Optional<S, A> = compose({
  getOption: E.getRight,
  set: flow(E.right, constant),
});

export const left: <S, E, A>(
  sea: Optional<S, Either<E, A>>,
) => Optional<S, E> = compose({
  getOption: E.getLeft,
  set: flow(E.left, constant),
});
