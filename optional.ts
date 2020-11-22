import type * as TC from "./type_classes.ts";
import type { _0, _1, Predicate, Refinement } from "./types.ts";
import type { Either } from "./either.ts";
import type { Iso } from "./iso.ts";
import type { Lens } from "./lens.ts";
import type { Prism } from "./prism.ts";
import type { Traversal } from "./traversal.ts";

import * as L from "./lens.ts";
import * as T from "./traversal.ts";
import * as OP from "./optional.ts";
import * as P from "./prism.ts";
import * as O from "./option.ts";
import * as I from "./iso.ts";
import * as A from "./array.ts";
import * as R from "./record.ts";
import { constant, flow, identity, isNil, pipe } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Optional<S, A> = {
  readonly getOption: (s: S) => O.Option<A>;
  readonly set: (a: A) => (s: S) => S;
};

export type From<T> = T extends Optional<infer S, infer _> ? S : never;

export type To<T> = T extends Optional<infer _, infer A> ? A : never;

export type Index<S, I, A> = {
  readonly index: (i: I) => Optional<S, A>;
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const id = <S>(): Optional<S, S> => ({
  getOption: O.some,
  set: constant,
});

export const fromAt = <T, J, B>(
  at: L.At<T, J, O.Option<B>>,
): Index<T, J, B> => ({
  index: flow(
    at.at,
    L.composePrism({
      getOption: identity,
      reverseGet: O.some,
    }),
  ),
});

export const fromIso = <T, S>(iso: I.Iso<T, S>) =>
  <I, A>(sia: Index<S, I, A>): Index<T, I, A> => ({
    index: (i) =>
      pipe(
        I.asOptional(iso),
        OP.compose(sia.index(i)),
      ),
  });

export const indexArray = <A = never>(): Index<
  ReadonlyArray<A>,
  number,
  A
> => ({
  index: (i) => ({
    getOption: A.lookup(i),
    set: (a) =>
      (as) =>
        pipe(
          A.updateAt(i, a)(as),
          O.getOrElse(() => as),
        ),
  }),
});

export const indexRecord = <A = never>(): Index<
  Readonly<Record<string, A>>,
  string,
  A
> => ({
  index: (k) => ({
    getOption: (r) => O.fromNullable(r[k]),
    set: (a) => (r) => r[k] === a || isNil(r[k]) ? r : R.insertAt(k, a)(r),
  }),
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Optional<_0, _1>> = {
  id,
  compose: (ij, jk) => ({
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
  getModify: (F) =>
    (f) =>
      (s) =>
        pipe(
          sa.getOption(s),
          O.fold(
            (a) => F.map((a: A) => sa.set(a)(s), f(a)),
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

export const compose = <A, B>(
  ab: Optional<A, B>,
) => <S>(sa: Optional<S, A>): Optional<S, B> => Category.compose(sa, ab);

export const composeLens = <A, B>(
  ab: Lens<A, B>,
) =>
  <S>(sa: Optional<S, A>): Optional<S, B> =>
    Category.compose(sa, L.asOptional(ab));

export const composeIso = <A, B>(
  ab: Iso<A, B>,
) =>
  <S>(sa: Optional<S, A>): Optional<S, B> =>
    Category.compose(sa, I.asOptional(ab));

export const composePrism = <A, B>(
  ab: Prism<A, B>,
) =>
  <S>(sa: Optional<S, A>): Optional<S, B> =>
    Category.compose(sa, P.asOptional(ab));

export const composeTraversal = <A, B>(
  ab: Traversal<A, B>,
) => <S>(sa: Optional<S, A>): Traversal<S, B> => T.compose(ab)(asTraversal(sa));

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

type FilterFn = {
  <A, B extends A>(
    refinement: Refinement<A, B>,
  ): <S>(sa: Optional<S, A>) => Optional<S, B>;
  <A>(
    predicate: Predicate<A>,
  ): <S>(sa: Optional<S, A>) => Optional<S, A>;
};

export const filter: FilterFn = <A>(predicate: Predicate<A>) =>
  <S>(sa: Optional<S, A>): Optional<S, A> => ({
    getOption: flow(sa.getOption, O.chain(O.fromPredicate(predicate))),
    set: sa.set,
  });

export const modify = <A>(
  faa: (a: A) => A,
) =>
  <S>(sa: Optional<S, A>) =>
    (s: S): S =>
      pipe(
        sa.getOption(s),
        O.map(faa),
        O.fold((a) => sa.set(a)(s), constant(s)),
      );

export const prop = <A, P extends keyof A>(
  prop: P,
): (<S>(sa: Optional<S, A>) => Optional<S, A[P]>) =>
  compose(pipe(L.id<A>(), L.prop(prop), L.asOptional));

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Optional<S, A>) => Optional<S, { [K in P]: A[K] }>) =>
  compose(pipe(L.id<A>(), L.props(...props), L.asOptional));

export const index = (i: number) =>
  <S, A>(sa: Optional<S, ReadonlyArray<A>>): Optional<S, A> =>
    pipe(sa, compose(indexArray<A>().index(i)));

export const key = (key: string) =>
  <S, A>(sa: Optional<S, Readonly<Record<string, A>>>): Optional<S, A> =>
    pipe(sa, compose(indexRecord<A>().index(key)));

export const atKey = (key: string) =>
  <S, A>(
    sa: Optional<S, Readonly<Record<string, A>>>,
  ): Optional<S, O.Option<A>> =>
    pipe(sa, compose(L.asOptional(L.atRecord<A>().at(key))));

/***************************************************************************************************
 * @section Pipeable Over ADT
 **************************************************************************************************/

export const some: <S, A>(soa: Optional<S, O.Option<A>>) => Optional<S, A> =
  composePrism(P.some());

export const right: <S, E, A>(
  sea: Optional<S, Either<E, A>>,
) => Optional<S, A> = composePrism(P.right());

export const left: <S, E, A>(sea: Optional<S, Either<E, A>>) => Optional<S, E> =
  composePrism(P.left());
