import type * as TC from "./type_classes.ts";
import type { Either } from "./either.ts";

import * as O from "./option.ts";
import * as L from "./lens.ts";
import { Traversal } from "./traversal.ts";
import {
  constant,
  Refinement,
  Predicate,
  pipe,
  flow,
  identity,
} from "./fns.ts";
import { _0, _1 } from "./types.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Optional<S, A> = {
  readonly getOption: (s: S) => O.Option<A>;
  readonly set: (a: A) => (s: S) => S;
};

export type From<T> = T extends Optional<infer S, any> ? S : never;
export type To<T> = T extends Optional<any, infer A> ? A : never;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const id = <S>(): Optional<S, S> => ({
  getOption: O.some,
  set: constant,
});

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

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const compose = <A, B>(
  ab: Optional<A, B>,
) =>
  <S>(sa: Optional<S, A>): Optional<S, B> => ({
    getOption: flow(sa.getOption, O.chain(ab.getOption)),
    set: (b) =>
      (s) =>
        pipe(
          sa.getOption(s),
          O.map(ab.set(b)),
          O.fold(sa.set, () => identity),
        )(s),
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

export const fromNullable = <S, A>(
  sa: Optional<S, A>,
): Optional<S, NonNullable<A>> => ({
  getOption: flow(sa.getOption, O.chain(O.fromNullable)),
  set: sa.set,
});

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

export const prop = <A, P extends keyof A>(
  prop: P,
): (<S>(sa: Optional<S, A>) => Optional<S, A[P]>) =>
  compose(pipe(L.id<A>(), L.prop(prop), L.asOptional));

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Optional<S, A>) => Optional<S, { [K in P]: A[K] }>) =>
  compose(pipe(L.id<A>(), L.props(...props), L.asOptional));

export const component = <A extends ReadonlyArray<unknown>, P extends keyof A>(
  prop: P,
): (<S>(sa: Optional<S, A>) => Optional<S, A[P]>) =>
  compose(pipe(L.id<A>(), L.component(prop), L.asOptional));

export const index = (i: number) =>
  <S, A>(sa: Optional<S, ReadonlyArray<A>>): Optional<S, A> => ({
    getOption: flow(sa.getOption, O.chain((as) => O.fromNullable(as[i]))),
    set: component<To<typeof sa>, number>(i)(sa).set,
  });

export const key = (key: string) =>
  <S, A>(sa: Optional<S, Readonly<Record<string, A>>>): Optional<S, A> => ({
    getOption: flow(sa.getOption, O.chain((a) => O.fromNullable(a[key]))),
    set: prop<To<typeof sa>, string>(key)(sa).set,
  });

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Optional<_0, _1>> = {
  compose: (ij, jk) => compose(jk)(ij),
  id: id as <I, J>() => Optional<I, J>,
};
