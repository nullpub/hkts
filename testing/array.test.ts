import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

import * as Test from "./assert.ts";

import * as A from "../array.ts";

Deno.test({
  name: "Array Constructors",
  fn() {
    assertEquals(A.zero, []);
    assertEquals(A.empty(), []);
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => A.of(n.toString());
const fromString = (s: string) => A.of(s.length);

Deno.test({
  name: "Array Modules",
  async fn() {
    await Test.assertFunctor(A.Functor, "Array", {
      ta: A.of(1),
      fab: toString,
      fbc: toLength,
    });

    await Test.assertMonad(
      A.Monad,
      "Array",
      {
        a: 1,
        ta: A.of(1),
        fab: toString,
        fbc: toLength,
        tfab: A.of(toString),
        tfbc: A.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );

    await Test.assertApply(
      A.Apply,
      "Array",
      {
        ta: A.of(1),
        fab: toString,
        fbc: toLength,
        tfab: A.of(toString),
        tfbc: A.of(toLength),
      },
    );

    await Test.assertApplicative(
      A.Applicative,
      "Array",
      {
        a: 1,
        ta: A.of(1),
        fab: toString,
        fbc: toLength,
        tfab: A.of(toString),
        tfbc: A.of(toLength),
      },
    );

    await Test.assertAlt(
      A.Alt,
      "Array",
      {
        ta: [1, 2, 3],
        tb: [4, 5, 6],
        tc: [7, 8, 9],
        fab: toString,
        fbc: toLength,
      },
    );

    await Test.assertFilterable(
      A.Filterable,
      "Array",
      {
        a: [1, 2, 3, 4],
        b: [-2, 0, 2, 4],
        f: (n: number) => n % 2 === 0,
        g: (n: number) => n < 3,
      },
    );

    await Test.assertFoldable(
      A.Foldable,
      "Array",
      {
        a: 0,
        tb: [1, 2, 3, 4],
        faba: (a: number, b: number) => a + b,
      },
    );
  },
});

Deno.test({
  name: "Array Module Getters",
  async fn() {
    const equals = (a: number, b: number) => a === b;
    const lte = (a: number, b: number) => a < b;
    const concat = (a: number, b: number) => a + b;

    await Test.assertSetoid(
      A.getSetoid({ equals }),
      "Array",
      {
        a: [1, 2, 3],
        b: [1, 2, 3],
        c: [1, 2, 3],
        z: [1, 2, 3, 4],
      },
    );

    await Test.assertOrd(
      A.getOrd({ equals, lte }),
      "Array",
      {
        a: [1, 2, 3],
        b: [3, 2, 1],
      },
    );

    await Test.assertSemigroup(A.getSemigroup({ concat }), "Array", {
      a: [1, 2, 3],
      b: [2, 4, 8],
      c: [10, 12, 14],
    });

    await Test.assertSemigroup(A.getFreeSemigroup<number>(), "Array", {
      a: [1],
      b: [2],
      c: [3],
    });

    const { show } = A.getShow({ show: (n: number) => n.toString() });
    assertEquals(show([1, 2, 3]), "ReadonlyArray[1, 2, 3]");

    await Test.assertMonoid(A.getMonoid<number>(), "Array", {
      a: [1, 2, 3],
      b: [2, 4, 8],
      c: [-2, 0, -100],
    });
  },
});
