import type * as TC from "./type_classes.ts";
import type { _, Fn, Predicate } from "./types.ts";

import { fromEquals } from "./setoid.ts";
import { _reduce } from "./array.ts";

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
      const values = set.values();
      for (const b of values) {
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

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

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

export const getMonad = <B>(S: TC.Setoid<B>) => {
  const isElementOf = elem(S);

  const Monad = {
    of: (a: B) => new Set([a]),
    ap: <A>(tfab: Set<Fn<[A], B>>, ta: Set<A>) =>
      Monad.chain((f) => Monad.map(f, ta), tfab),
    map: <A>(fab: Fn<[A], B>, ta: Set<A>): Set<B> => {
      const tb = new Set<B>();
      const isIn = isElementOf(tb);
      for (const a of ta.values()) {
        const b = fab(a);
        if (!isIn(b)) {
          tb.add(b);
        }
      }
      return tb;
    },
    join: (tta: Set<Set<B>>): Set<B> => {
      const out = new Set<B>();
      const isIn = isElementOf(out);
      for (const ta of tta) {
        for (const a of ta) {
          if (!isIn(a)) {
            out.add(a);
          }
        }
      }
      return out;
    },
    chain: <A>(fatb: Fn<[A], Set<B>>, ta: Set<A>): Set<B> => {
      const tb = new Set<B>();
      const isIn = isElementOf(tb);
      for (const a of ta) {
        for (const b of fatb(a)) {
          if (!isIn(b)) {
            tb.add(b);
          }
        }
      }
      return tb;
    },
  };

  return Monad;
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const of = <A>(a: A): Set<A> => new Set([a]);
