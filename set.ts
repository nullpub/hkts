import type * as HKT from "./hkt.ts";
import type * as TC from "./type_classes.ts";
import type { Fn, Predicate } from "./types.ts";

import { pipe } from "./fns.ts";
import { _reduce } from "./array.ts";
import { fromEquals } from "./setoid.ts";

/*******************************************************************************
 * Kind Registration
 ******************************************************************************/

export const URI = "Set";

export type URI = typeof URI;

declare module "./hkt.ts" {
  // deno-lint-ignore no-explicit-any
  export interface Kinds<_ extends any[]> {
    [URI]: Set<_[0]>;
  }
}

/*******************************************************************************
 * Constructors
 ******************************************************************************/

export const zero: Set<never> = new Set();

export const empty = <A = never>(): Set<A> => zero;

/*******************************************************************************
 * Utilities
 ******************************************************************************/

export const elem = <A>(S: TC.Setoid<A>) =>
  (set: Set<A>) =>
    (a: A): boolean => {
      for (const b of set) {
        if (S.equals(a)(b)) {
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

/*******************************************************************************
 * Modules
 ******************************************************************************/

export const Functor: TC.Functor<URI> = {
  map: <A, B>(fab: (a: A) => B) =>
    (ta: Set<A>): Set<B> => {
      const out = new Set<B>();
      for (const a of ta) {
        out.add(fab(a));
      }
      return out;
    },
};

export const Apply: TC.Apply<URI> = {
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
  map: Functor.map,
};

export const Filterable: TC.Filterable<URI> = {
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

export const Foldable: TC.Foldable<URI> = {
  reduce: <A, B>(faba: Fn<[A, B], A>, a: A) =>
    (tb: Set<B>): A => _reduce(Array.from(tb), faba, a),
};

export const Traversable: TC.Traversable<URI> = {
  map: Functor.map,
  reduce: Foldable.reduce,
  traverse: (A) =>
    (faub) =>
      (ta) =>
        pipe(
          ta,
          Foldable.reduce(
            (fbs, a) =>
              pipe(
                faub(a),
                A.ap(pipe(
                  fbs,
                  A.map((bs) =>
                    (b) => {
                      bs.add(b);
                      return bs;
                    }
                  ),
                )),
              ),
            A.of(new Set()),
          ),
        ),
};

/*******************************************************************************
 * Module Getters
 ******************************************************************************/

export const getShow = <A>(S: TC.Show<A>): TC.Show<Set<A>> => ({
  show: (s) => `Set([${Array.from(s.values()).map(S.show).join(", ")}])`,
});

export const getSetoid = <A>(S: TC.Setoid<A>): TC.Setoid<Set<A>> => {
  const subset = isSubset(S);
  return fromEquals((x) => (y) => subset(x)(y) && subset(y)(x));
};

export const getUnionMonoid = <A>(S: TC.Setoid<A>): TC.Monoid<Set<A>> => {
  const merge = union(S);
  return ({
    concat: merge,
    empty,
  });
};

/**
 * @deprecated
 */
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

/*******************************************************************************
 * Pipeables
 ******************************************************************************/

export const of = <A>(a: A): Set<A> => new Set([a]);

export const { filter } = Filterable;

export const { map, reduce, traverse } = Traversable;
