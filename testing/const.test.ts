import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

import * as Test from "./assert.ts";

import * as C from "../const.ts";
import { setoidNumber } from "../setoid.ts";

Deno.test({
  name: "Const Constructors",
  fn() {
    assertEquals(C.make(0), 0);
  },
});

Deno.test({
  name: "Const Module Getters",
  fn() {
    // getShow
    const SA = { show: (n: number) => n.toString() };
    const { show } = C.getShow(SA);
    assertEquals(show(1), "make(1)");

    // getSetoid
    const Setoid = C.getSetoid(setoidNumber);
    Test.assertSetoid(Setoid, {
      a: 1,
      b: 1,
      c: 1,
      z: 2,
    });

    // getOrd
    const Ord = C.getOrd({ ...setoidNumber, lte: (a, b) => a <= b });
    Test.assertOrd(Ord, {
      a: 1,
      b: 2,
    });

    // getSemigroup
    const add = (a: number, b: number) => a + b;
    const Semigroup = C.getSemigroup({ concat: add });
    Test.assertSemigroup(Semigroup, {
      a: 1,
      b: 2,
      c: 3,
    });

    // getMonoid
    const Monoid = C.getMonoid({ concat: add, empty: () => 0 });
    Test.assertMonoid(Monoid, {
      a: 1,
      b: 2,
      c: 3,
    });

    // getApply
    const Apply = C.getApply(Semigroup);
    Test.assertApply(Apply, {
      ta: 1,
      fab: (n: number) => n.toString(),
      fbc: (s: string) => s.length,
      tfab: 1,
      tfbc: 1,
    });

    // getApplicative
    const Applicative = C.getApplicative(Monoid);
    Test.assertApplicative(Applicative, {
      a: 1,
      ta: 1,
      fab: (n: number) => n.toString(),
      fbc: (s: string) => s.length,
      tfab: 1,
      tfbc: 1,
    });
  },
});

Deno.test({
  name: "Const Modules",
  fn() {
    const toString = (n: number): string => n.toString();
    const toLength = (s: string): number => s.length;

    Test.assertFunctor(C.Functor, {
      ta: C.make(1),
      fab: toString,
      fbc: toLength,
    });

    Test.assertContravariant(C.Contravariant, {
      tc: C.make<number, number>(1),
      fab: toString,
      fbc: toLength,
    });

    Test.assertBifunctor(C.Bifunctor, {
      tax: C.make<number, number>(1),
      fab: toString,
      fbc: toLength,
      fxy: toString,
      fyz: toLength,
    });
  },
});
