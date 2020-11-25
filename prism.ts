import type * as TC from "./type_classes.ts";
import type { $, _0, _1, Fn, Predicate, Refinement } from "./types.ts";
import type { Iso } from "./iso.ts";
import type { Lens } from "./lens.ts";
import type { Optional } from "./optional.ts";
import type { Traversal } from "./traversal.ts";

import * as O from "./option.ts";
import * as E from "./either.ts";
import { createTraversal } from "./derivations.ts";
import { flow, identity, pipe } from "./fns.ts";

import { atRecord } from "./at.ts";
import { indexArray, indexRecord } from "./index.ts";
import { id as lensId, prop as lensProp, props as lensProps } from "./lens.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Prism<S, A> = {
  readonly getOption: (s: S) => O.Option<A>;
  readonly reverseGet: (a: A) => S;
};

export type From<T> = T extends Prism<infer S, infer _> ? S : never;

export type To<T> = T extends Prism<infer _, infer A> ? A : never;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const id = <S>(): Prism<S, S> => ({
  getOption: O.some,
  reverseGet: identity,
});

type FromPredicate = {
  <S, A extends S>(refinement: Refinement<S, A>): Prism<S, A>;
  <A>(predicate: Predicate<A>): Prism<A, A>;
};

export const fromPredicate: FromPredicate = <A>(
  predicate: Predicate<A>,
): Prism<A, A> => ({
  getOption: O.fromPredicate(predicate),
  reverseGet: identity,
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Prism<_0, _1>> = {
  id,
  compose: (ij, jk) => ({
    getOption: flow(ij.getOption, O.chain(jk.getOption)),
    reverseGet: flow(jk.reverseGet, ij.reverseGet),
  }),
};

/***************************************************************************************************
 * @section Converters
 **************************************************************************************************/

export const asOptional = <S, A>(sa: Prism<S, A>): Optional<S, A> => ({
  getOption: sa.getOption,
  set: getSet(sa),
});

export const asTraversal = <S, A>(sa: Prism<S, A>): Traversal<S, A> => ({
  getModify: <T>(F: TC.Applicative<T>) =>
    (f: Fn<[A], $<T, [A]>>) =>
      (s: S) =>
        pipe(
          sa.getOption(s),
          O.fold(
            (a) => F.map((a) => getSet(sa)(a)(s), f(a)),
            () => F.of(s),
          ),
        ),
});

export const fromNullable = <S, A>(
  sa: Prism<S, A>,
): Prism<S, NonNullable<A>> => ({
  getOption: flow(sa.getOption, O.chain(O.fromNullable)),
  reverseGet: sa.reverseGet,
});

/***************************************************************************************************
 * @section Pipeable Compose
 **************************************************************************************************/

export const compose = <A, B>(ab: Prism<A, B>) =>
  <S>(sa: Prism<S, A>): Prism<S, B> => Category.compose(sa, ab);

export const composeIso = <A, B>(
  ab: Iso<A, B>,
) =>
  <S>(sa: Prism<S, A>): Prism<S, B> => ({
    getOption: flow(sa.getOption, O.map(ab.get)),
    reverseGet: flow(ab.reverseGet, sa.reverseGet),
  });

export const composeLens = <A, B>(
  ab: Lens<A, B>,
) =>
  <S>(sa: Prism<S, A>): Optional<S, B> => ({
    getOption: flow(sa.getOption, O.map(ab.get)),
    set: (b) =>
      (s) =>
        pipe(
          sa.getOption(s),
          O.fold(
            flow(ab.set(b), sa.reverseGet),
            () => s,
          ),
        ),
  });

export const composeOptional = <A, B>(ab: Optional<A, B>) =>
  <S>(sa: Prism<S, A>): Optional<S, B> => ({
    getOption: flow(sa.getOption, O.chain(ab.getOption)),
    set: (b) =>
      (s) =>
        pipe(
          sa.getOption(s),
          O.fold(
            flow(ab.set(b), sa.reverseGet),
            () => s,
          ),
        ),
  });

export const composeTraversal = <A, B>(ab: Traversal<A, B>) =>
  <S>(sa: Prism<S, A>): Traversal<S, B> => ({
    getModify: <T>(A: TC.Applicative<T>) =>
      (f: Fn<[B], $<T, [B]>>) =>
        (s: S) =>
          pipe(
            sa.getOption(s),
            O.fold(
              (a) => A.map(sa.reverseGet, ab.getModify(A)(f)(a)),
              () => A.of(s),
            ),
          ),
  });

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

type FilterFn = {
  <A, B extends A>(
    refinement: Refinement<A, B>,
  ): <S>(sa: Prism<S, A>) => Prism<S, B>;
  <A>(
    predicate: Predicate<A>,
  ): <S>(sa: Prism<S, A>) => Prism<S, A>;
};

export const filter: FilterFn = <A>(predicate: Predicate<A>) =>
  <S>(sa: Prism<S, A>): Prism<S, A> => ({
    getOption: flow(sa.getOption, O.chain(O.fromPredicate(predicate))),
    reverseGet: sa.reverseGet,
  });

export const traverse = <T>(T: TC.Traversable<T>) =>
  <S, A>(sa: Prism<S, $<T, [A]>>): Traversal<S, A> =>
    composeTraversal(createTraversal(T)<A>())(sa);

export const getModifyOption = <S, A>(sa: Prism<S, A>) =>
  (faa: (a: A) => A) =>
    (s: S): O.Option<S> =>
      pipe(
        sa.getOption(s),
        O.map((o) => {
          const na = faa(o);
          return na === o ? s : sa.reverseGet(na);
        }),
      );

export const modify = <S, A>(sa: Prism<S, A>) =>
  (f: (a: A) => A) =>
    (s: S): S =>
      pipe(
        getModifyOption(sa)(f)(s),
        O.getOrElse(() => s),
      );

export const getSet = <S, A>(sa: Prism<S, A>) =>
  (a: A) => (s: S): S => modify(sa)(() => a)(s);

export const prop = <A, P extends keyof A>(
  prop: P,
): (<S>(sa: Prism<S, A>) => Optional<S, A[P]>) =>
  pipe(
    lensId<A>(),
    lensProp(prop),
    composeLens,
  );

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Prism<S, A>) => Optional<S, { [K in P]: A[K] }>) =>
  pipe(
    lensId<A>(),
    lensProps(...props),
    composeLens,
  );

export const index = (i: number) =>
  <S, A>(sa: Prism<S, ReadonlyArray<A>>): Optional<S, A> =>
    composeOptional(indexArray<A>().index(i))(sa);

export const key = (key: string) =>
  <S, A>(sa: Prism<S, Readonly<Record<string, A>>>): Optional<S, A> =>
    composeOptional(indexRecord<A>().index(key))(sa);

export const atKey = (key: string) =>
  <S, A>(sa: Prism<S, Readonly<Record<string, A>>>): Optional<S, O.Option<A>> =>
    composeLens(atRecord<A>().at(key))(sa);

/***************************************************************************************************
 * @section Pipeable Over ADT
 **************************************************************************************************/

export const some = <A>(): Prism<O.Option<A>, A> => ({
  getOption: identity,
  reverseGet: O.some,
});

export const right = <E, A>(): Prism<E.Either<E, A>, A> => ({
  getOption: E.getRight,
  reverseGet: E.right,
});

export const left = <E, A>(): Prism<E.Either<E, A>, E> => ({
  getOption: E.getLeft,
  reverseGet: E.left,
});
