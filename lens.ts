import type * as TC from "./type_classes.ts";
import type { _0, _1 } from "./hkts.ts";

import * as O from "./option.ts";
import type { Optional } from "./optional.ts";
import { Prism } from "./prism.ts";
import { Traversal } from "./traversal.ts";
import {
  constant,
  flow,
  identity,
  pipe,
  Predicate,
  Refinement,
} from "./fns.ts";

/***************************************************************************************************
 * @section Models
 **************************************************************************************************/

export type Lens<S, A> = {
  readonly get: (s: S) => A;
  readonly set: (a: A) => (s: S) => S;
};

export type From<T> = T extends Lens<infer S, any> ? S : never;
export type To<T> = T extends Lens<any, infer A> ? A : never;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const id = <S>(): Lens<S, S> => ({
  get: identity,
  set: constant,
});

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

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const compose = <A, B>(
  ab: Lens<A, B>,
) =>
  <S>(sa: Lens<S, A>): Lens<S, B> => ({
    get: (s) => ab.get(sa.get(s)),
    set: (b) => (s) => sa.set(ab.set(b)(sa.get(s)))(s),
  });

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

export const modify = <A>(f: (a: A) => A) =>
  <S>(sa: Lens<S, A>) =>
    (s: S): S => {
      const o = sa.get(s);
      const n = f(o);
      return o === n ? s : sa.set(n)(s);
    };

export const fromNullable = <S, A>(
  sa: Lens<S, A>,
): Optional<S, NonNullable<A>> => ({
  getOption: flow(sa.get, O.fromNullable),
  set: sa.set,
});

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

export const prop = <A, P extends keyof A>(
  prop: P,
) =>
  <S>(sa: Lens<S, A>): Lens<S, A[P]> => ({
    get: flow(sa.get, (a) => a[prop]),
    set: (ap) =>
      (s) =>
        pipe(
          sa.get(s),
          (oa) =>
            ap === oa[prop]
              ? s
              : sa.set(Object.assign({}, oa, { [prop]: ap }))(s),
        ),
  });

export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
) =>
  <S>(sa: Lens<S, A>): Lens<S, { [K in P]: A[K] }> => ({
    get: (s) => {
      const a = sa.get(s);
      const r: { [K in P]?: A[K] } = {};
      for (const k of props) {
        r[k] = a[k];
      }
      return r as any;
    },
    set: (a) =>
      (s) => {
        const oa = sa.get(s);
        for (const k of props) {
          if (a[k] !== oa[k]) {
            return sa.set(Object.assign({}, oa, a))(s);
          }
        }
        return s;
      },
  });

export const component = <A extends ReadonlyArray<unknown>, P extends keyof A>(
  prop: P,
) =>
  <S>(sa: Lens<S, A>): Lens<S, A[P]> => ({
    get: (s) => sa.get(s)[prop],
    set: (ap) =>
      (s) => {
        const oa = sa.get(s);
        if (ap === oa[prop]) {
          return s;
        }
        const copy: A = oa.slice() as any;
        copy[prop] = ap;
        return sa.set(copy)(s);
      },
  });

export const index = (i: number) =>
  <S, A>(sa: Lens<S, ReadonlyArray<A>>): Optional<S, A> => ({
    getOption: flow(sa.get, (as) => O.fromNullable(as[i])),
    set: component<To<typeof sa>, number>(i)(sa).set,
  });

export const key = (key: string) =>
  <S, A>(sa: Lens<S, Readonly<Record<string, A>>>): Optional<S, A> => ({
    getOption: flow(sa.get, (a) => O.fromNullable(a[key])),
    set: prop<To<typeof sa>, string>(key)(sa).set,
  });

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Category: TC.Category<Lens<_0, _1>> = {
  compose: (ij, jk) => compose(jk)(ij),
  id: id as <I, J>() => Lens<I, J>,
};
