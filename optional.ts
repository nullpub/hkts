import type * as TC from "./type_classes.ts";
import type { _0, _1, Predicate, Refinement } from "./types.ts";
import type { Traversal } from "./traversal.ts";

import * as O from "./option.ts";
import * as L from "./lens.ts";
import * as I from "./iso.ts";
import * as A from "./array.ts";
import * as R from "./record.ts";
import { compose as composeOptional } from "./optional.ts";
import { constant, flow, identity, pipe } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Optional<S, A> = {
  readonly getOption: (s: S) => O.Option<A>;
  readonly set: (a: A) => (s: S) => S;
};

export type From<T> = T extends Optional<infer S, any> ? S : never;

export type To<T> = T extends Optional<any, infer A> ? A : never;

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
        composeOptional(sia.index(i)),
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
    set: (a) =>
      (r) => {
        if (r[k] === a || O.isNone(O.fromNullable(r[k]))) {
          return r;
        }
        return R.insertAt(k, a)(r);
      },
  }),
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
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Optional<_0, _1>> = {
  compose: (ij, jk) => compose(jk)(ij),
  id: id as <I, J>() => Optional<I, J>,
};
