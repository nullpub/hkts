import type * as TC from "./type_classes.ts";
import type { $, _0, _1 } from "./types.ts";
import type { Either } from "./either.ts";
import type { Option } from "./option.ts";
import type { Lens } from "./lens.ts";
import type { Optional } from "./optional.ts";
import type { Prism } from "./prism.ts";
import type { Traversal } from "./traversal.ts";

import * as O from "./option.ts";
import * as E from "./either.ts";

import { constant, flow, identity } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Iso<S, A> = {
  readonly get: (s: S) => A;
  readonly reverseGet: (b: A) => S;
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const id = <S>(): Iso<S, S> => ({
  get: identity,
  reverseGet: identity,
});

export const make = <A, B>(
  get: (a: A) => B,
  reverseGet: (b: B) => A,
): Iso<A, B> => ({
  get,
  reverseGet,
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Iso<_0, _1>> = {
  id,
  compose: (ij, jk) => ({
    get: flow(ij.get, jk.get),
    reverseGet: flow(jk.reverseGet, ij.reverseGet),
  }),
};

/***************************************************************************************************
 * @section Converters
 **************************************************************************************************/

export const asLens = <S, A>(sa: Iso<S, A>): Lens<S, A> => ({
  get: sa.get,
  set: flow(sa.reverseGet, constant),
});

export const asPrism = <S, A>(sa: Iso<S, A>): Prism<S, A> => ({
  getOption: flow(sa.get, O.some),
  reverseGet: sa.reverseGet,
});

export const asOptional = <S, A>(sa: Iso<S, A>): Optional<S, A> => ({
  getOption: flow(sa.get, O.some),
  set: flow(sa.reverseGet, constant),
});

export const asTraversal = <S, A>(sa: Iso<S, A>): Traversal<S, A> => ({
  getModify: ({ map }) =>
    (f) => (s: S) => map((a: A) => sa.reverseGet(a), f(sa.get(s))),
});

/***************************************************************************************************
 * @section Pipeable Compose
 **************************************************************************************************/

export const compose = <A, B>(ab: Iso<A, B>) =>
  <S>(sa: Iso<S, A>): Iso<S, B> => Category.compose(sa, ab);

export const composeLens = <A, B>(ab: Lens<A, B>) =>
  <S>(sa: Iso<S, A>): Lens<S, B> => ({
    get: flow(sa.get, ab.get),
    set: (b) =>
      flow(
        sa.get,
        ab.set(b),
        sa.reverseGet,
      ),
  });

export const composePrism = <A, B>(ab: Prism<A, B>) =>
  <S>(sa: Iso<S, A>): Prism<S, B> => ({
    getOption: flow(sa.get, ab.getOption),
    reverseGet: flow(ab.reverseGet, sa.reverseGet),
  });

export const composeOptional = <A, B>(ab: Optional<A, B>) =>
  <S>(sa: Iso<S, A>): Optional<S, B> => ({
    getOption: flow(sa.get, ab.getOption),
    set: (b) => flow(sa.get, ab.set(b), sa.reverseGet),
  });

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const modify = <A>(f: (a: A) => A) =>
  <S>(sa: Iso<S, A>) => (s: S): S => sa.reverseGet(f(sa.get(s)));

export const map = <A, B>(
  ab: (a: A) => B,
  ba: (b: B) => A,
) =>
  <S>(sa: Iso<S, A>): Iso<S, B> => ({
    get: flow(sa.get, ab),
    reverseGet: flow(ba, sa.reverseGet),
  });

export const reverse = <S, A>(sa: Iso<S, A>): Iso<A, S> => ({
  get: sa.reverseGet,
  reverseGet: sa.get,
});

/***************************************************************************************************
 * @section Pipeable Over ADT
 **************************************************************************************************/

export const some: <S, A>(soa: Iso<S, Option<A>>) => Prism<S, A> = composePrism(
  {
    getOption: identity,
    reverseGet: O.some,
  },
);

export const right: <S, E, A>(sea: Iso<S, Either<E, A>>) => Prism<S, A> =
  composePrism({
    getOption: E.getRight,
    reverseGet: E.right,
  });

export const left: <S, E, A>(sea: Iso<S, Either<E, A>>) => Prism<S, E> =
  composePrism({
    getOption: E.getLeft,
    reverseGet: E.left,
  });
