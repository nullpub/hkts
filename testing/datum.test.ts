import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import * as Test from "./assert.ts";
import * as D from "../datum.ts";
import * as I from "../identity.ts";
import { constant } from "../fns.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const addTwo = (n: number): number => n + 2;
const one = constant(1);

Deno.test({
  name: "Datum Constructors",
  fn(): void {
    assertEquals(D.initial, { tag: "Initial" });
    assertEquals(D.pending, { tag: "Pending" });
    assertEquals(D.refresh(1), { tag: "Refresh", value: 1 });
    assertEquals(D.replete(1), { tag: "Replete", value: 1 });

    assertEquals(D.constInitial(), { tag: "Initial" });
    assertEquals(D.constPending(), { tag: "Pending" });

    assertEquals(D.fromNullable([1, 2, 3][0]), { tag: "Replete", value: 1 });
    assertEquals(D.fromNullable([1, 2, 3][3]), { tag: "Initial" });

    assertEquals(D.tryCatch(() => [1, 2, 3][0]), { tag: "Replete", value: 1 });
    assertEquals(
      D.tryCatch(() => {
        throw new Error("Try Catch!");
      }),
      { tag: "Initial" },
    );
  },
});

Deno.test({
  name: "Datum Guards",
  fn(): void {
    assertEquals(D.isInitial(D.initial), true);
    assertEquals(D.isInitial(D.pending), false);
    assertEquals(D.isInitial(D.refresh(1)), false);
    assertEquals(D.isInitial(D.replete(1)), false);

    assertEquals(D.isPending(D.initial), false);
    assertEquals(D.isPending(D.pending), true);
    assertEquals(D.isPending(D.refresh(1)), false);
    assertEquals(D.isPending(D.replete(1)), false);

    assertEquals(D.isRefresh(D.initial), false);
    assertEquals(D.isRefresh(D.pending), false);
    assertEquals(D.isRefresh(D.refresh(1)), true);
    assertEquals(D.isRefresh(D.replete(1)), false);

    assertEquals(D.isReplete(D.initial), false);
    assertEquals(D.isReplete(D.pending), false);
    assertEquals(D.isReplete(D.refresh(1)), false);
    assertEquals(D.isReplete(D.replete(1)), true);

    assertEquals(D.isNone(D.initial), true);
    assertEquals(D.isNone(D.pending), true);
    assertEquals(D.isNone(D.refresh(1)), false);
    assertEquals(D.isNone(D.replete(1)), false);

    assertEquals(D.isSome(D.initial), false);
    assertEquals(D.isSome(D.pending), false);
    assertEquals(D.isSome(D.refresh(1)), true);
    assertEquals(D.isSome(D.replete(1)), true);
  },
});

Deno.test({
  name: "Datum Destructors",
  fn(): void {
    const fold = D.fold(one, one, addOne, addTwo);
    const getOrElse = D.getOrElse(() => 0);

    assertEquals(fold(D.initial), 1);
    assertEquals(fold(D.pending), 1);
    assertEquals(fold(D.replete(1)), 2);
    assertEquals(fold(D.refresh(1)), 3);

    assertEquals(getOrElse(D.initial), 0);
    assertEquals(getOrElse(D.pending), 0);
    assertEquals(getOrElse(D.replete(1)), 1);
    assertEquals(getOrElse(D.refresh(1)), 1);
  },
});

Deno.test({
  name: "Datum Module Getters",
  fn() {
    // show
    const { show } = D.getShow({ show: (n: number) => n.toString() });

    assertEquals(show(D.initial), "Initial");
    assertEquals(show(D.pending), "Pending");
    assertEquals(show(D.replete(1)), "Replete(1)");
    assertEquals(show(D.refresh(1)), "Refresh(1)");

    // getSemigroup
    const GeSemigroupCases = [
      { concat: add, args: { a: D.initial, b: D.initial, c: D.initial } },
      { concat: add, args: { a: D.initial, b: D.replete(1), c: D.initial } },
      { concat: add, args: { a: D.refresh(1), b: D.replete(1), c: D.pending } },
    ];

    GeSemigroupCases.forEach(({ concat, args }) => {
      Test.assertSemigroup(
        D.getSemigroup({ concat }),
        args,
      );
    });

    // getMonoid
    const GeMonoidCases = [
      {
        concat: add,
        args: { a: D.constInitial(), b: D.constInitial(), c: D.constInitial() },
      },
      {
        concat: add,
        args: { a: D.constInitial(), b: D.replete(1), c: D.constInitial() },
      },
      { concat: add, args: { a: D.refresh(1), b: D.replete(1), c: D.pending } },
    ];

    GeMonoidCases.forEach(({ concat, args }) => {
      Test.assertMonoid(
        D.getMonoid({ concat }),
        args,
      );
    });

    // getSetoid
    const equals = (a: number, b: number) => a === b;

    const GetSetoidCases = [
      {
        equals,
        args: {
          a: D.replete(1),
          b: D.replete(1),
          c: D.replete(1),
          z: D.refresh(1),
        },
      },
      {
        equals,
        args: {
          a: D.refresh(1),
          b: D.replete(1),
          c: D.constInitial(),
          z: D.replete(1),
        },
      },
      {
        equals,
        args: {
          a: D.refresh(1),
          b: D.replete(1),
          c: D.constInitial(),
          z: D.replete(1),
        },
      },
    ];

    GetSetoidCases.forEach(({ equals, args }) => {
      Test.assertSetoid(
        D.getSetoid({ equals }),
        args,
      );
    });

    // getOrd
    const lte = (a: number, b: number) => a <= b;

    const GetOrdCases = [
      {
        equals,
        args: {
          a: D.replete(1),
          b: D.replete(2),
          c: D.replete(3),
          z: D.refresh(1),
        },
      },
      {
        equals,
        args: {
          a: D.refresh(1),
          b: D.replete(1),
          c: D.constInitial(),
          z: D.replete(1),
        },
      },
      {
        equals,
        args: {
          a: D.refresh(1),
          b: D.replete(1),
          c: D.constInitial(),
          z: D.replete(1),
        },
      },
    ];

    GetOrdCases.forEach(({ equals, args }) => {
      Test.assertOrd(
        D.getOrd({ equals, lte }),
        args,
      );
    });
  },
});

Deno.test({
  name: "Datum Modules",
  fn() {
    const toString = (n: number): string => n.toString();
    const toLength = (s: string): number => s.length;
    const fromNumber = (n: number) =>
      n % 2 === 0 ? D.of(n.toString()) : D.initial;
    const fromString = (s: string) =>
      s.length === 0 ? D.initial : D.of(s.length);

    // Functor
    Test.assertFunctor(
      D.Functor,
      {
        ta: D.of(1),
        fab: toString,
        fbc: toLength,
      },
    );

    // Monad
    Test.assertMonad(
      D.Monad,
      {
        a: 1,
        ta: D.of(1),
        fab: toString,
        fbc: toLength,
        tfab: D.of(toString),
        tfbc: D.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );

    // Applicative
    Test.assertApplicative(
      D.Applicative,
      {
        a: 1,
        ta: D.of(1),
        fab: toString,
        fbc: toLength,
        tfab: D.of(toString),
        tfbc: D.of(toLength),
      },
    );

    // Apply
    Test.assertApply(
      D.Apply,
      {
        ta: D.of(1),
        fab: toString,
        fbc: toLength,
        tfab: D.of(toString),
        tfbc: D.of(toLength),
      },
    );

    // Alternative
    Test.assertAlternative(
      D.Alternative,
      {
        a: 1,
        ta: D.of(1),
        tb: D.of(2),
        tc: D.of(3),
        fab: toString,
        fbc: toLength,
        tfab: D.of(toString),
        tfbc: D.of(toLength),
      },
    );

    // Foldable
    Test.assertFoldable(
      D.Foldable,
      {
        a: 0,
        tb: D.of(1),
        faba: (a, b: number) => a + b,
      },
    );
  },
});

Deno.test({
  name: "Datum Pipeables",
  fn() {
    // of
    assertEquals(D.of(1), { tag: "Replete", value: 1 });

    // ap
    const ApCases = [
      {
        args: { tfab: D.replete(addOne), ta: D.replete(1) },
        want: D.replete(2),
      },
      {
        args: { tfab: D.refresh(addOne), ta: D.replete(1) },
        want: D.refresh(2),
      },
      {
        args: { tfab: D.replete(addOne), ta: D.refresh(1) },
        want: D.refresh(2),
      },
      {
        args: { tfab: D.initial, ta: D.refresh(1) },
        want: D.pending,
      },
      {
        args: { tfab: D.initial, ta: D.pending },
        want: D.pending,
      },
      {
        args: { tfab: D.initial, ta: D.initial },
        want: D.initial,
      },
    ];

    ApCases.forEach(({ args: { tfab, ta }, want }) => {
      assertEquals(D.ap(tfab)(ta), want);
    });

    // map
    const MapCases = [
      { args: { fab: addOne, ta: D.initial }, want: D.initial },
      { args: { fab: addOne, ta: D.pending }, want: D.pending },
      { args: { fab: addOne, ta: D.replete(1) }, want: D.replete(2) },
      { args: { fab: addOne, ta: D.refresh(1) }, want: D.refresh(2) },
    ];

    MapCases.forEach(({ args: { fab, ta }, want }) => {
      assertEquals(D.map(fab)(ta), want);
    });

    // join
    const JoinCases = [
      { args: { tta: D.initial }, want: D.initial },
      { args: { tta: D.pending }, want: D.pending },
      { args: { tta: D.replete(D.initial) }, want: D.initial },
      { args: { tta: D.refresh(D.pending) }, want: D.pending },
      { args: { tta: D.refresh(D.replete(1)) }, want: D.refresh(1) },
    ];

    JoinCases.forEach(({ args: { tta }, want }) => {
      assertEquals(D.join(tta), want);
    });

    // chain
    const fatb = (n: number) => {
      switch (n % 4) {
        case 0:
          return D.initial;
        case 1:
          return D.pending;
        case 2:
          return D.replete(n);
        case 3:
          return D.refresh(n);
        default:
          return D.initial;
      }
    };

    const ChainCases = [
      { args: { fatb, ta: D.initial }, want: D.initial },
      { args: { fatb, ta: D.pending }, want: D.pending },
      { args: { fatb, ta: D.replete(0) }, want: D.initial },
      { args: { fatb, ta: D.replete(1) }, want: D.pending },
      { args: { fatb, ta: D.replete(2) }, want: D.replete(2) },
      { args: { fatb, ta: D.replete(3) }, want: D.refresh(3) },
      { args: { fatb, ta: D.refresh(0) }, want: D.initial },
      { args: { fatb, ta: D.refresh(1) }, want: D.pending },
      { args: { fatb, ta: D.refresh(2) }, want: D.replete(2) },
      { args: { fatb, ta: D.refresh(3) }, want: D.refresh(3) },
    ];

    ChainCases.forEach(({ args: { fatb, ta }, want }) => {
      assertEquals(D.chain(fatb)(ta), want);
    });

    // reduce
    const ReduceCases = [
      { args: { faba: add, a: 0, tb: D.initial }, want: 0 },
      { args: { faba: add, a: 0, tb: D.pending }, want: 0 },
      { args: { faba: add, a: 0, tb: D.replete(1) }, want: 1 },
      { args: { faba: add, a: 0, tb: D.refresh(1) }, want: 1 },
    ];

    ReduceCases.forEach(({ args: { faba, a, tb }, want }) => {
      assertEquals(D.reduce(faba, a)(tb), want);
    });

    // traverse
    const TraverseCases = [
      { args: { fab: addOne, ta: D.initial }, want: D.initial },
      { args: { fab: addOne, ta: D.pending }, want: D.pending },
      { args: { fab: addOne, ta: D.replete(1) }, want: D.replete(2) },
      { args: { fab: addOne, ta: D.refresh(1) }, want: D.refresh(2) },
    ];

    TraverseCases.forEach(({ args: { fab, ta }, want }) => {
      assertEquals(D.traverse(I.Applicative)(fab)(ta), want);
    });

    // sequenceTuple
    const SequenceTupleCases = [
      { args: { a: D.initial, b: D.initial }, want: D.initial },
      { args: { a: D.initial, b: D.pending }, want: D.pending },
      { args: { a: D.initial, b: D.replete(1) }, want: D.initial },
      { args: { a: D.initial, b: D.refresh(1) }, want: D.pending },

      { args: { a: D.pending, b: D.initial }, want: D.pending },
      { args: { a: D.pending, b: D.pending }, want: D.pending },
      { args: { a: D.pending, b: D.replete(1) }, want: D.pending },
      { args: { a: D.pending, b: D.refresh(1) }, want: D.pending },

      { args: { a: D.replete(1), b: D.initial }, want: D.initial },
      { args: { a: D.replete(1), b: D.pending }, want: D.pending },
      { args: { a: D.replete(1), b: D.replete(1) }, want: D.replete([1, 1]) },
      { args: { a: D.replete(1), b: D.refresh(1) }, want: D.refresh([1, 1]) },

      { args: { a: D.refresh(1), b: D.initial }, want: D.pending },
      { args: { a: D.refresh(1), b: D.pending }, want: D.pending },
      { args: { a: D.refresh(1), b: D.replete(1) }, want: D.refresh([1, 1]) },
      { args: { a: D.refresh(1), b: D.refresh(1) }, want: D.refresh([1, 1]) },
    ];

    SequenceTupleCases.forEach(({ args: { a, b }, want }) => {
      assertEquals(D.sequenceTuple(a, b), want);
    });

    // sequenceStruct
    const SequenceStructCases = [
      { args: { a: D.initial, b: D.initial }, want: D.initial },
      { args: { a: D.initial, b: D.pending }, want: D.pending },
      { args: { a: D.initial, b: D.replete(1) }, want: D.initial },
      { args: { a: D.initial, b: D.refresh(1) }, want: D.pending },

      { args: { a: D.pending, b: D.initial }, want: D.pending },
      { args: { a: D.pending, b: D.pending }, want: D.pending },
      { args: { a: D.pending, b: D.replete(1) }, want: D.pending },
      { args: { a: D.pending, b: D.refresh(1) }, want: D.pending },

      { args: { a: D.replete(1), b: D.initial }, want: D.initial },
      { args: { a: D.replete(1), b: D.pending }, want: D.pending },
      {
        args: { a: D.replete(1), b: D.replete(1) },
        want: D.replete({ a: 1, b: 1 }),
      },
      {
        args: { a: D.replete(1), b: D.refresh(1) },
        want: D.refresh({ a: 1, b: 1 }),
      },

      { args: { a: D.refresh(1), b: D.initial }, want: D.pending },
      { args: { a: D.refresh(1), b: D.pending }, want: D.pending },
      {
        args: { a: D.refresh(1), b: D.replete(1) },
        want: D.refresh({ a: 1, b: 1 }),
      },
      {
        args: { a: D.refresh(1), b: D.refresh(1) },
        want: D.refresh({ a: 1, b: 1 }),
      },
    ];

    SequenceStructCases.forEach(({ args, want }) => {
      assertEquals(D.sequenceStruct(args), want);
    });
  },
});
