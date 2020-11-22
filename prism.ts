import type * as TC from "./type_classes.ts";
import type { _0, _1, Predicate, Refinement } from "./types.ts";
import type { Traversal } from "./traversal.ts";
import type { Optional } from "./optional.ts";

import * as I from "./iso.ts";
import * as L from "./lens.ts";
import * as O from "./option.ts";
import * as E from "./either.ts";
import * as OP from "./optional.ts";
import * as T from "./traversal.ts";
import { flow, identity, pipe } from "./fns.ts";

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
  getModify: (F) =>
    (f) =>
      (s) =>
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
  ab: I.Iso<A, B>,
) => <S>(sa: Prism<S, A>): Prism<S, B> => Category.compose(sa, I.asPrism(ab));

export const composeLens = <A, B>(
  ab: L.Lens<A, B>,
) =>
  <S>(sa: Prism<S, A>): Optional<S, B> =>
    OP.compose(L.asOptional(ab))(asOptional(sa));

export const composeOptional = <A, B>(ab: Optional<A, B>) =>
  <S>(sa: Prism<S, A>): Optional<S, B> => OP.compose(ab)(asOptional(sa));

export const composeTraversal = <A, B>(ab: Traversal<A, B>) =>
  <S>(sa: Prism<S, A>): Traversal<S, B> => T.compose(ab)(asTraversal(sa));

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
  composeLens(pipe(L.id<A>(), L.prop(prop)));

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Prism<S, A>) => Optional<S, { [K in P]: A[K] }>) =>
  composeLens(pipe(L.id<A>(), L.props(...props)));

export const index = (i: number) =>
  <S, A>(sa: Prism<S, ReadonlyArray<A>>): Optional<S, A> =>
    pipe(asOptional(sa), OP.compose(OP.indexArray<A>().index(i)));

export const key = (key: string) =>
  <S, A>(sa: Prism<S, Readonly<Record<string, A>>>): Optional<S, A> =>
    pipe(
      asOptional(sa),
      OP.compose(OP.indexRecord<A>().index(key)),
    );

export const atKey = (key: string) =>
  <S, A>(sa: Prism<S, Readonly<Record<string, A>>>): Optional<S, O.Option<A>> =>
    composeLens(L.atRecord<A>().at(key))(sa);

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
