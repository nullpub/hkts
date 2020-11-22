import type * as TC from "./type_classes.ts";
import type { $, _0, _1, Predicate, Refinement } from "./types.ts";
import type { Either } from "./either.ts";
import type { Iso } from "./iso.ts";
import type { Prism } from "./prism.ts";
import type { Traversal } from "./traversal.ts";
import type { Optional } from "./optional.ts";

import * as O from "./option.ts";
import * as R from "./record.ts";
import * as I from "./iso.ts";
import * as P from "./prism.ts";
import * as OP from "./optional.ts";
import * as T from "./traversal.ts";
import { constant, flow, identity, pipe } from "./fns.ts";

/***************************************************************************************************
 * @section Models
 **************************************************************************************************/

export type Lens<S, A> = {
  readonly get: (s: S) => A;
  readonly set: (a: A) => (s: S) => S;
};

export type From<T> = T extends Lens<infer S, infer _> ? S : never;

export type To<T> = T extends Lens<infer _, infer A> ? A : never;

export type At<S, I, A> = {
  readonly at: (i: I) => Lens<S, A>;
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const id = <S>(): Lens<S, S> => ({
  get: identity,
  set: constant,
});

export const atRecord = <A = never>(): At<
  Readonly<Record<string, A>>,
  string,
  O.Option<A>
> => ({
  at: (key) => ({
    get: (r) => O.fromNullable(r[key]),
    set: O.fold(
      (a) => R.insertAt(key, a),
      () => R.deleteAt(key),
    ),
  }),
});

export const atMap = <A = never>(): At<
  Map<string, A>,
  string,
  O.Option<A>
> => ({
  at: (key) => ({
    get: (m) => O.fromNullable(m.get(key)),
    set: O.fold(
      (a) => (m) => m.set(key, a),
      () =>
        (m) => {
          m.delete(key);
          return m;
        },
    ),
  }),
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Lens<_0, _1>> = {
  compose: (ij, jk) => ({
    get: (s) => jk.get(ij.get(s)),
    set: (b) => (s) => ij.set(jk.set(b)(ij.get(s)))(s),
  }),
  id,
};

/***************************************************************************************************
 * @section Converters
 **************************************************************************************************/

export const asOptional = <S, A>(sa: Lens<S, A>): Optional<S, A> => ({
  getOption: flow(sa.get, O.some),
  set: sa.set,
});

export const asTraversal = <S, A>(sa: Lens<S, A>): Traversal<S, A> => ({
  getModify: (A) => (f) => (s) => A.map((a) => sa.set(a)(s), f(sa.get(s))),
});

export const fromIso = <T, S>(iso: I.Iso<T, S>) =>
  <I, A>(sia: At<S, I, A>): At<T, I, A> => ({
    at: (i) => pipe(I.asLens(iso), compose(sia.at(i))),
  });

export const fromNullable = <S, A>(
  sa: Lens<S, A>,
): Optional<S, NonNullable<A>> => ({
  getOption: flow(sa.get, O.fromNullable),
  set: sa.set,
});

/***************************************************************************************************
 * @section Pipeable Compose
 **************************************************************************************************/

export const compose = <A, B>(
  ab: Lens<A, B>,
) => <S>(sa: Lens<S, A>): Lens<S, B> => Category.compose(sa, ab);

export const composeIso = <A, B>(
  ab: Iso<A, B>,
) => <S>(sa: Lens<S, A>): Lens<S, B> => Category.compose(sa, I.asLens(ab));

export const composePrism = <A, B>(
  ab: Prism<A, B>,
) =>
  <S>(sa: Lens<S, A>): Optional<S, B> => ({
    getOption: flow(sa.get, ab.getOption),
    set: flow(ab.reverseGet, sa.set),
  });

export const composeOptional = <A, B>(ab: Optional<A, B>) =>
  <S>(sa: Lens<S, A>): Optional<S, B> => ({
    getOption: flow(sa.get, ab.getOption),
    set: (b) =>
      pipe(
        sa,
        modify(ab.set(b)),
      ),
  });

export const composeTraversal = <A, B>(ab: Traversal<A, B>) =>
  <S>(sa: Lens<S, A>): Traversal<S, B> => T.compose(ab)(asTraversal(sa));

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

type FilterFn = {
  <A, B extends A>(
    refinement: Refinement<A, B>,
  ): <S>(sa: Lens<S, A>) => Optional<S, B>;
  <A>(
    predicate: Predicate<A>,
  ): <S>(sa: Lens<S, A>) => Optional<S, A>;
};

export const filter: FilterFn = <A>(predicate: Predicate<A>) =>
  <S>(sa: Lens<S, A>): Optional<S, A> => ({
    getOption: flow(sa.get, O.fromPredicate(predicate)),
    set: sa.set,
  });

export const modify = <A>(f: (a: A) => A) =>
  <S>(sa: Lens<S, A>) =>
    (s: S): S => {
      const o = sa.get(s);
      const n = f(o);
      return o === n ? s : sa.set(n)(s);
    };

export const prop = <A, P extends keyof A>(
  prop: P,
) =>
  <S>(sa: Lens<S, A>): Lens<S, A[P]> => ({
    get: flow(sa.get, (a) => a[prop]),
    set: (ap) => (s) => sa.set({ ...sa.get(s), [prop]: ap })(s),
  });

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
) =>
  <S>(sa: Lens<S, A>): Lens<S, { [K in P]: A[K] }> => ({
    get: flow(sa.get, R.pick(...props)),
    set: (a) => (s) => sa.set({ ...sa.get(s), ...a })(s),
  });

export const index = (i: number) =>
  <S, A>(sa: Lens<S, ReadonlyArray<A>>): Optional<S, A> =>
    pipe(sa, asOptional, OP.compose(OP.indexArray<A>().index(i)));

export const key = (key: string) =>
  <S, A>(sa: Lens<S, Readonly<Record<string, A>>>): Optional<S, A> =>
    pipe(
      asOptional(sa),
      OP.compose(OP.indexRecord<A>().index(key)),
    );

export const atKey = (key: string) =>
  <S, A>(sa: Lens<S, Readonly<Record<string, A>>>): Lens<S, O.Option<A>> =>
    pipe(sa, compose(atRecord<A>().at(key)));

export const traverse = <T>(
  M: TC.Traversable<T>,
) =>
  <S, A>(sta: Lens<S, $<T, [A]>>): Traversal<S, A> =>
    pipe(
      asTraversal(sta),
      T.compose(T.fromTraversable(M)()),
    );

/***************************************************************************************************
 * @section Pipeable Over ADT
 **************************************************************************************************/

export const some: <S, A>(soa: Lens<S, O.Option<A>>) => Optional<S, A> =
  composePrism(P.some());

export const right: <S, E, A>(sea: Lens<S, Either<E, A>>) => Optional<S, A> =
  composePrism(P.right());

export const left: <S, E, A>(sea: Lens<S, Either<E, A>>) => Optional<S, E> =
  composePrism(P.left());
