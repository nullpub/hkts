import type * as TC from "./type_classes.ts";
import type { _0, _1 } from "./types.ts";
import type { Lens } from "./lens.ts";
import type { Optional } from "./optional.ts";
import type { Prism } from "./prism.ts";
import type { Traversal } from "./traversal.ts";

import * as O from "./option.ts";
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
  compose: (ij, jk) => ({
    get: flow(ij.get, jk.get),
    reverseGet: flow(jk.reverseGet, ij.reverseGet),
  }),
  id,
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

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

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

export const modify = <A>(f: (a: A) => A) =>
  <S>(sa: Iso<S, A>) => (s: S): S => sa.reverseGet(f(sa.get(s)));
