import type * as TC from "./type_classes.ts";
import type { $, _, Fn, Predicate } from "./types.ts";

import { pipe } from "./fns.ts";
import { _reduce } from "./array.ts";
import { fromEquals } from "./setoid.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const zero: Set<never> = new Set();

export const empty = <A = never>(): Set<A> => zero;

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

export const elem = <A>(S: TC.Setoid<A>) =>
  (set: Set<A>) =>
    (a: A): boolean => {
      for (const b of set) {
        if (S.equals(a, b)) {
          return true;
        }
      }
      return false;
    };

export const every = <A>(
  predicate: Predicate<A>,
) =>
  (set: Set<A>): boolean => {
    const values = set.values();
    for (const a of values) {
      if (!predicate(a)) {
        return false;
      }
    }
    return true;
  };

export const some = <A>(
  predicate: Predicate<A>,
) =>
  (set: Set<A>): boolean => {
    const values = set.values();
    for (const a of values) {
      if (predicate(a)) {
        return true;
      }
    }
    return false;
  };

export const isSubset = <A>(S: TC.Setoid<A>) =>
  (set: Set<A>) =>
    (check: Set<A>): boolean => {
      const isIn = elem(S)(set);
      return every(isIn)(check);
    };

export const union = <A>(S: TC.Setoid<A>) =>
  (as: Set<A>) =>
    (bs: Set<A>): Set<A> => {
      const out = new Set(as);
      const isIn = elem(S)(out);
      for (const b of bs) {
        if (!isIn(b)) {
          out.add(b);
        }
      }
      return out;
    };

export const intersection = <A>(S: TC.Setoid<A>) =>
  (ta: Set<A>) =>
    (tb: Set<A>): Set<A> => {
      const out = new Set<A>();
      const [small, big] = ta.size > tb.size ? [tb, ta] : [ta, tb];
      const isIn = elem(S)(small);
      for (const b of big) {
        if (isIn(b)) {
          out.add(b);
        }
      }
      return out;
    };

export const compact = <A>(S: TC.Setoid<A>) =>
  (ta: Set<A>): Set<A> => {
    const out = new Set<A>();
    const isIn = elem(S)(out);
    for (const a of ta) {
      if (!isIn(a)) {
        out.add(a);
      }
    }
    return out;
  };

export const join = <A>(tta: Set<Set<A>>): Set<A> => {
  const out = new Set<A>();
  for (const ta of tta) {
    for (const a of ta) {
      out.add(a);
    }
  }
  return out;
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Set<_>> = {
  map: <A, B>(fab: (a: A) => B) =>
    (ta: Set<A>): Set<B> => {
      const out = new Set<B>();
      for (const a of ta) {
        out.add(fab(a));
      }
      return out;
    },
};

export const Apply: TC.Apply<Set<_>> = {
  map: Functor.map,
  ap: <A, B>(tfab: Set<(a: A) => B>) =>
    (ta: Set<A>): Set<B> => {
      const out = new Set<B>();
      for (const fab of tfab) {
        for (const a of ta) {
          out.add(fab(a));
        }
      }
      return out;
    },
};

export const Filterable: TC.Filterable<Set<_>> = {
  filter: <A>(predicate: Predicate<A>) =>
    (ta: Set<A>): Set<A> => {
      const out: Set<A> = new Set();
      for (const a of ta) {
        if (predicate(a)) {
          out.add(a);
        }
      }
      return out;
    },
};

export const Foldable: TC.Foldable<Set<_>> = {
  reduce: <A, B>(faba: Fn<[A, B], A>, a: A) =>
    (tb: Set<B>): A => _reduce(Array.from(tb), faba, a),
};

export const Traversable: TC.Traversable<Set<_>> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: <U>(A: TC.Applicative<U>) =>
    <A, B>(faub: (a: A) => $<U, [B]>) =>
      (ta: Set<A>): $<U, [Set<B>]> =>
        pipe(
          ta,
          Foldable.reduce(
            (fbs, a) =>
              pipe(
                faub(a),
                A.ap(pipe(
                  fbs,
                  A.map((bs) =>
                    (b: B) => {
                      bs.add(b);
                      return bs;
                    }
                  ),
                )),
              ),
            A.of(new Set<B>()),
          ),
        ),
};

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <A>(S: TC.Show<A>): TC.Show<Set<A>> => ({
  show: (s) => `Set([${Array.from(s.values()).map(S.show).join(", ")}])`,
});

export const getSetoid = <A>(S: TC.Setoid<A>): TC.Setoid<Set<A>> => {
  const subset = isSubset(S);
  return fromEquals((x, y) => subset(x)(y) && subset(y)(x));
};

export const getUnionMonoid = <A>(S: TC.Setoid<A>): TC.Monoid<Set<A>> => {
  const merge = union(S);
  return ({
    concat: (a, b) => merge(a)(b),
    empty,
  });
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const of = <A>(a: A): Set<A> => new Set([a]);

export const { filter } = Filterable;

export const { map, reduce, traverse } = Traversable;

export const sequenceStruct = createSequenceStruct(Apply);

export const sequenceTuple = createSequenceTuple(Apply);
