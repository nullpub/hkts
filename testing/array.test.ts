import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

import * as Test from "./assert.ts";

import * as A from "../array.ts";
import * as O from "../option.ts";
import * as I from "../identity.ts";

Deno.test({
  name: "Array Optimizations",
  fn() {
    // _map
    const MapCases = [
      {
        fn: (a: number, i: number) => a + i,
        arg: [1, 2, 3, 4, 5],
        want: [1, 3, 5, 7, 9],
      },
      { fn: (a: number) => a, arg: [1, 2, 3, 4, 5], want: [1, 2, 3, 4, 5] },
      { fn: (a: number) => a + 1, arg: [1, 2, 3, 4, 5], want: [2, 3, 4, 5, 6] },
      { fn: (a: number) => a + 1, arg: [], want: [] },
    ];

    MapCases.forEach(({ fn, arg, want }) => {
      assertEquals(A._map(arg, fn), want);
    });

    // _reduce
    const ReduceCases = [
      {
        fn: (b: number, a: number, i: number) => b + a + i,
        arg: [1, 2, 3, 4, 5],
        want: 25,
      },
      { fn: (b: number, a: number) => b + a, arg: [1, 2, 3, 4, 5], want: 15 },
      { fn: (b: number, a: number) => b + 1, arg: [1, 2, 3, 4, 5], want: 5 },
      { fn: (b: number, a = 0) => b + 1, arg: [], want: 0 },
    ];

    ReduceCases.forEach(({ fn, arg, want }, i) => {
      assertEquals(A._reduce(arg, fn, 0), want);
    });

    // _concat
    const ConcatCases = [
      { args: { a: [1, 2, 3], b: [4, 5, 6] }, want: [1, 2, 3, 4, 5, 6] },
      { args: { a: [], b: [4, 5, 6] }, want: [4, 5, 6] },
      { args: { a: [1, 2, 3], b: [] }, want: [1, 2, 3] },
      { args: { a: [], b: [] }, want: [] },
    ];

    ConcatCases.forEach(({ args: { a, b }, want }) => {
      assertEquals(A._concat(a, b), want);
    });

    // _isOutOfBounds
    const IsOutOfBoundsCases = [
      { args: { as: [1, 2, 3], i: 0 }, want: false },
      { args: { as: [1, 2, 3], i: -1 }, want: true },
      { args: { as: [1, 2, 3], i: 3 }, want: true },
      { args: { as: [], i: 0 }, want: true },
    ];

    IsOutOfBoundsCases.forEach(({ args: { as, i }, want }) => {
      assertEquals(A._isOutOfBounds(i, as), want);
    });

    // _unsafeInsertAt
    const UnsafeInsertAtCases = [
      { args: { i: 0, a: 10, as: [1, 2, 3] }, want: [10, 1, 2, 3] },
      { args: { i: 4, a: 10, as: [1, 2, 3] }, want: [1, 2, 3, 10] },
      { args: { i: -1, a: 10, as: [1, 2, 3] }, want: [1, 2, 10, 3] },
      { args: { i: -1, a: 10, as: [] }, want: [10] },
    ];

    UnsafeInsertAtCases.forEach(({ args: { i, a, as }, want }) => {
      assertEquals(A._unsafeInsertAt(i, a, as), want);
    });

    // _unsafeUpdateAt
    const unsafeUpdateAtCases = [
      { args: { i: 0, a: 10, as: [1, 2, 3] }, want: [10, 2, 3] },
      { args: { i: 4, a: 10, as: [1, 2, 3] }, want: [1, 2, 3, , 10] },
    ];

    unsafeUpdateAtCases.forEach(({ args: { i, a, as }, want }) => {
      assertEquals(A._unsafeUpdateAt(i, a, as), want);
    });

    // _unsafeDeleteAt
    const unsafeDeleteAtCases = [
      { args: { i: 0, as: [1, 2, 3] }, want: [2, 3] },
      { args: { i: 4, as: [1, 2, 3] }, want: [1, 2, 3] },
      { args: { i: -1, as: [1, 2, 3] }, want: [1, 2] },
      { args: { i: -5, as: [1, 2, 3] }, want: [2, 3] },
      { args: { i: 0, as: [] }, want: [] },
    ];

    unsafeDeleteAtCases.forEach(({ args: { i, as }, want }) => {
      assertEquals(A._unsafeDeleteAt(i, as), want);
    });
  },
});

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
  fn() {
    Test.assertFunctor(A.Functor, {
      ta: A.of(1),
      fab: toString,
      fbc: toLength,
    });

    Test.assertMonad(
      A.Monad,
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

    Test.assertApply(
      A.Apply,
      {
        ta: A.of(1),
        fab: toString,
        fbc: toLength,
        tfab: A.of(toString),
        tfbc: A.of(toLength),
      },
    );

    Test.assertApplicative(
      A.Applicative,
      {
        a: 1,
        ta: A.of(1),
        fab: toString,
        fbc: toLength,
        tfab: A.of(toString),
        tfbc: A.of(toLength),
      },
    );

    Test.assertAlt(
      A.Alt,
      {
        ta: [1, 2, 3],
        tb: [4, 5, 6],
        tc: [7, 8, 9],
        fab: toString,
        fbc: toLength,
      },
    );

    Test.assertFilterable(
      A.Filterable,
      {
        a: [1, 2, 3, 4],
        b: [-2, 0, 2, 4],
        f: (n: number) => n % 2 === 0,
        g: (n: number) => n < 3,
      },
    );

    Test.assertFoldable(
      A.Foldable,
      {
        a: 0,
        tb: [1, 2, 3, 4],
        faba: (a: number, b: number) => a + b,
      },
    );

    Test.assertMonoid<readonly any[]>(
      A.Monoid,
      {
        a: [1],
        b: [2],
        c: [3],
      },
    );
  },
});

Deno.test({
  name: "Array Module Getters",
  fn() {
    const equals = (a: number, b: number) => a === b;
    const lte = (a: number, b: number) => a < b;
    const concat = (a: number, b: number) => a + b;

    Test.assertSetoid(
      A.getSetoid({ equals }),
      {
        a: [1, 2, 3],
        b: [1, 2, 3],
        c: [1, 2, 3],
        z: [1, 2, 3, 4],
      },
    );

    Test.assertOrd(
      A.getOrd({ equals, lte }),
      {
        a: [1, 2, 3],
        b: [3, 2, 1],
      },
    );

    Test.assertSemigroup(A.getSemigroup({ concat }), {
      a: [1, 2, 3],
      b: [2, 4, 8],
      c: [10, 12, 14],
    });

    Test.assertSemigroup(A.getFreeSemigroup<number>(), {
      a: [1],
      b: [2],
      c: [3],
    });

    // Module Getter: Show
    const { show } = A.getShow({ show: (n: number) => n.toString() });
    assertEquals(show([1, 2, 3]), "ReadonlyArray[1, 2, 3]");

    Test.assertMonoid(A.getMonoid<number>(), {
      a: [1, 2, 3],
      b: [2, 4, 8],
      c: [-2, 0, -100],
    });
  },
});

Deno.test({
  name: "Array Pipeables",
  fn() {
    // of
    const OfCases = [
      { arg: 1, want: [1] },
      { arg: undefined, want: [undefined] },
      { arg: null, want: [null] },
    ];

    OfCases.forEach(({ arg, want }) => {
      assertEquals(A.of(arg), want);
    });

    // ap
    const ApCases = [
      {
        args: { tfab: [(n: number) => n + 1], ta: [1, 2, 3] },
        want: [2, 3, 4],
      },
      {
        args: {
          tfab: [(n: number) => n + 1, (n: number) => n + 10],
          ta: [1, 2, 3],
        },
        want: [2, 3, 4, 11, 12, 13],
      },
      {
        args: {
          tfab: [],
          ta: [1, 2, 3],
        },
        want: [],
      },
      {
        args: {
          tfab: [(n: number) => n + 1],
          ta: [],
        },
        want: [],
      },
    ];

    ApCases.forEach(({ args: { tfab, ta }, want }) => {
      assertEquals(A.ap(tfab)(ta), want);
    });

    // map
    const MapCases = [
      { args: { fab: (n: number) => n + 1, ta: [1, 2, 3] }, want: [2, 3, 4] },
      { args: { fab: (n: number) => n + 1, ta: [] }, want: [] },
    ];

    MapCases.forEach(({ args: { fab, ta }, want }) => {
      assertEquals(A.map(fab)(ta), want);
    });

    // join
    const JoinCases = [
      { args: { tta: [[1, 2, 3], [4, 5, 6]] }, want: [1, 2, 3, 4, 5, 6] },
      { args: { tta: [[], [4, 5, 6]] }, want: [4, 5, 6] },
      { args: { tta: [[1, 2, 3], []] }, want: [1, 2, 3] },
      { args: { tta: [[], []] }, want: [] },
      { args: { tta: [] }, want: [] },
    ];

    JoinCases.forEach(({ args: { tta }, want }) => {
      assertEquals(A.join(tta), want);
    });

    // chain
    const ChainCases = [
      {
        args: { fatb: (n: number) => [n, n + 1], ta: [1, 2, 3] },
        want: [1, 2, 2, 3, 3, 4],
      },
      { args: { fatb: (n: number) => [n, n + 1], ta: [] }, want: [] },
      { args: { fatb: (n: number) => [], ta: [1, 2, 3] }, want: [] },
    ];

    ChainCases.forEach(({ args: { fatb, ta }, want }) => {
      assertEquals(A.chain(fatb)(ta), want);
    });

    // reduce
    const ReduceCases = [
      { fn: (b: number, a: number) => b + a, arg: [1, 2, 3, 4, 5], want: 15 },
      { fn: (b: number, a: number) => b + 1, arg: [1, 2, 3, 4, 5], want: 5 },
      { fn: (b: number, a = 0) => b + 1, arg: [], want: 0 },
    ];

    ReduceCases.forEach(({ fn, arg, want }) => {
      assertEquals(A.reduce(fn, 0)(arg), want);
    });

    // traverse
    const TraverseCases = [
      {
        args: {
          Ap: I.Applicative,
          faUb: (n: number) => [n, n + 1],
          ta: [1, 2, 3],
        },
        want: [[1, 2], [2, 3], [3, 4]],
      },
      {
        args: {
          Ap: I.Applicative,
          faUb: (n: number) => [n, n + 1],
          ta: [],
        },
        want: [],
      },
    ];

    TraverseCases.forEach(({ args: { Ap, faUb, ta }, want }) => {
      assertEquals(A.traverse(Ap)(faUb)(ta), want);
    });

    // indexedReduce
    const IndexedReduceCases = [
      {
        fn: (b: number, a: number, i: number) => b + a + i,
        arg: [1, 2, 3, 4, 5],
        want: 25,
      },
      {
        fn: (b: number, a: number, i: number) => b + i + 1,
        arg: [1, 2, 3, 4, 5],
        want: 15,
      },
      {
        fn: (b: number, a = 0, i = 0) => b + i + 1,
        arg: [],
        want: 0,
      },
    ];

    IndexedReduceCases.forEach(({ fn, arg, want }) => {
      assertEquals(A.indexedReduce(fn, 0)(arg), want);
    });

    // indexedTraverse
    const IndexedTraverseCases = [
      {
        args: {
          Ap: I.Applicative,
          faUb: (n: number, i: number) => [n, i],
          ta: [1, 2, 3],
        },
        want: [[1, 0], [2, 1], [3, 2]],
      },
      {
        args: {
          Ap: I.Applicative,
          faUb: (n: number, i: number) => [n, i],
          ta: [],
        },
        want: [],
      },
    ];

    IndexedTraverseCases.forEach(({ args: { Ap, faUb, ta }, want }) => {
      assertEquals(A.indexedTraverse(Ap)(faUb)(ta), want);
    });

    // lookup
    const LookupCases = [
      {
        args: { i: 0, as: [1, 2, 3] },
        want: O.some(1),
      },
      {
        args: { i: -1, as: [1, 2, 3] },
        want: O.none,
      },
      {
        args: { i: 3, as: [1, 2, 3] },
        want: O.none,
      },
      {
        args: { i: 0, as: [] },
        want: O.none,
      },
    ];

    LookupCases.forEach(({ args: { i, as }, want }) => {
      assertEquals(A.lookup(i)(as), want);
    });

    // insertAt
    const InsertAtCases = [
      {
        args: { i: 0, a: 10, as: [1, 2, 3] },
        want: O.some([10, 1, 2, 3]),
      },
      {
        args: { i: -1, a: 10, as: [1, 2, 3] },
        want: O.none,
      },
      {
        args: { i: 3, a: 10, as: [1, 2, 3] },
        want: O.some([1, 2, 3, 10]),
      },
      {
        args: { i: 0, a: 10, as: [] },
        want: O.some([10]),
      },
    ];

    InsertAtCases.forEach(({ args: { i, a, as }, want }) => {
      assertEquals(A.insertAt(i, a)(as), want);
    });

    // updateAt
    const UpdateAtCases = [
      {
        args: { i: 0, a: 10, as: [1, 2, 3] },
        want: O.some([10, 2, 3]),
      },
      {
        args: { i: -1, a: 10, as: [1, 2, 3] },
        want: O.none,
      },
      {
        args: { i: 3, a: 10, as: [1, 2, 3] },
        want: O.none,
      },
      {
        args: { i: 0, a: 10, as: [] },
        want: O.none,
      },
    ];

    UpdateAtCases.forEach(({ args: { i, a, as }, want }) => {
      assertEquals(A.updateAt(i, a)(as), want);
    });

    // deleteAt
    const DeleteAtCases = [
      {
        args: { i: 0, as: [1, 2, 3] },
        want: O.some([2, 3]),
      },
      {
        args: { i: -1, as: [1, 2, 3] },
        want: O.none,
      },
      {
        args: { i: 3, as: [1, 2, 3] },
        want: O.none,
      },
      {
        args: { i: 0, as: [] },
        want: O.none,
      },
    ];

    DeleteAtCases.forEach(({ args: { i, as }, want }) => {
      assertEquals(A.deleteAt(i)(as), want);
    });

    // sequenceTuple
    const SequenceTupleCases = [
      {
        args: { a: [1, 2], b: [3, 4] },
        want: [[1, 3], [1, 4], [2, 3], [2, 4]],
      },
      {
        args: { a: [1, 2], b: ["3", "4"] },
        want: [[1, "3"], [1, "4"], [2, "3"], [2, "4"]],
      },
      {
        args: { a: [1, 2], b: [] },
        want: [],
      },
    ];

    SequenceTupleCases.forEach(({ args: { a, b }, want }) => {
      assertEquals(A.sequenceTuple(a, b), want);
    });

    // sequenceStruct
    const SequenceStructCases = [
      {
        args: { a: [1, 2], b: [3, 4] },
        want: [{ a: 1, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 3 }, { a: 2, b: 4 }],
      },
      {
        args: { a: [1, 2], b: ["3", "4"] },
        want: [
          { a: 1, b: "3" },
          { a: 1, b: "4" },
          { a: 2, b: "3" },
          { a: 2, b: "4" },
        ],
      },
      {
        args: { a: [1, 2], b: [] },
        want: [],
      },
    ];

    SequenceStructCases.forEach(({ args, want }) => {
      assertEquals(A.sequenceStruct(args), want);
    });
  },
});
