import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import type { _ } from "../types.ts";
import * as E from "../either.ts";
import * as O from "../option.ts";
import * as Test from "./assert.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const addTwo = (n: number): number => n + 2;

Deno.test({
  name: "Either Constructors",
  fn(): void {
    const fromNullable = E.fromNullable(() => 0);

    assertEquals(E.left(1), { tag: "Left", left: 1 });
    assertEquals(E.right(1), { tag: "Right", right: 1 });

    assertEquals(fromNullable([1, 2, 3][3]), E.left(0));
    assertEquals(fromNullable([1, 2, 3][0]), E.right(1));

    assertEquals(E.tryCatch(() => 0, () => 0), E.right(0));
    assertEquals(
      E.tryCatch(() => {
        throw new Error("An Error");
      }, () => 0),
      E.left(0),
    );

    const fromPredicate = E.fromPredicate(
      (n: unknown) => typeof n === "number",
      () => 0,
    );
    assertEquals(fromPredicate("asdf"), E.left(0));
    assertEquals(fromPredicate(1), E.right(1));
  },
});

Deno.test({
  name: "Either Destructors",
  fn(): void {
    const fold = E.fold(addOne, addTwo);
    assertEquals(fold(E.left(1)), 2);
    assertEquals(fold(E.right(1)), 3);

    const getOrElse = E.getOrElse((n: number) => n.toString());
    assertEquals(getOrElse(E.left(1)), "1");
    assertEquals(getOrElse(E.right("asdf")), "asdf");

    assertEquals(E.getRight(E.right(0)), O.some(0));
    assertEquals(E.getRight(E.left(0)), O.none);
    assertEquals(E.getLeft(E.right(0)), O.none);
    assertEquals(E.getLeft(E.left(0)), O.some(0));
  },
});

Deno.test({
  name: "Either Combinators",
  fn(): void {
    assertEquals(E.swap(E.right(1)), E.left(1));
    assertEquals(E.swap(E.left(1)), E.right(1));

    const orElse = E.orElse((n: number) => E.right(n + 1));
    assertEquals(orElse(E.left(1)), E.right(2));
    assertEquals(orElse(E.right(1)), E.right(1));

    assertEquals(
      E.stringifyJSON({ a: 1 }, () => "error"),
      E.right('{"a":1}'),
    );
    const recurse: Record<string, unknown> = {};
    recurse["circular"] = recurse;
    assertEquals(
      E.stringifyJSON(recurse, () => "error"),
      E.left("error"),
    );
  },
});

Deno.test({
  name: "Either Guards",
  fn(): void {
    assertEquals(E.isLeft(E.left(1)), true);
    assertEquals(E.isLeft(E.right(1)), false);
    assertEquals(E.isRight(E.left(1)), false);
    assertEquals(E.isRight(E.right(1)), true);
  },
});

Deno.test({
  name: "Either Module Getters",
  fn() {
    // show
    const Show = { show: (n: number) => n.toString() };
    const { show } = E.getShow(Show, Show);

    assertEquals(show(E.left(1)), "Left(1)");
    assertEquals(show(E.right(1)), "Right(1)");

    // getSetoid
    const equals = (a: number, b: number) => a === b;

    const GetSetoidCases = [
      {
        equals,
        args: {
          a: E.right<number, number>(1),
          b: E.right(1),
          c: E.right(1),
          z: E.right(2),
        },
      },
      {
        equals,
        args: {
          a: E.left(1),
          b: E.left(1),
          c: E.left(1),
          z: E.left(2),
        },
      },
      {
        equals,
        args: {
          a: E.right(1),
          b: E.left(1),
          c: E.left(1),
          z: E.left(2),
        },
      },
      {
        equals,
        args: {
          a: E.left(1),
          b: E.right(1),
          c: E.right(1),
          z: E.right(2),
        },
      },
    ];

    GetSetoidCases.forEach(({ equals, args }) => {
      Test.assertSetoid(
        E.getSetoid({ equals }, { equals }),
        args,
      );
    });

    // getOrd
    const lte = (a: number, b: number) => a <= b;

    const GetOrdCases = [
      {
        equals,
        args: {
          a: E.right<number, number>(1),
          b: E.right(2),
        },
      },
      {
        equals,
        args: {
          a: E.right(1),
          b: E.left(2),
        },
      },
      {
        equals,
        args: {
          a: E.left(1),
          b: E.right(2),
        },
      },
      {
        equals,
        args: {
          a: E.left(1),
          b: E.left(2),
        },
      },
    ];

    GetOrdCases.forEach(({ equals, args }) => {
      Test.assertOrd(
        E.getOrd({ equals, lte }, { equals, lte }),
        args,
      );
    });

    // getSemigroup
    const GetSemigroupCases = [
      {
        concat: add,
        args: { a: E.right<number, number>(1), b: E.right(1), c: E.right(1) },
      },
      { concat: add, args: { a: E.right(1), b: E.right(1), c: E.left(1) } },
      { concat: add, args: { a: E.right(1), b: E.left(1), c: E.right(1) } },
      { concat: add, args: { a: E.right(1), b: E.left(1), c: E.left(1) } },
      { concat: add, args: { a: E.left(1), b: E.right(1), c: E.right(1) } },
      { concat: add, args: { a: E.left(1), b: E.right(1), c: E.left(1) } },
      { concat: add, args: { a: E.left(1), b: E.left(1), c: E.right(1) } },
      { concat: add, args: { a: E.left(1), b: E.left(1), c: E.left(1) } },
    ];

    GetSemigroupCases.forEach(({ concat, args }) => {
      Test.assertSemigroup(
        E.getRightSemigroup({ concat }),
        args,
      );
    });

    // getMonoid
    const empty = () => 0;
    const GetMonoidCases = [
      {
        empty,
        concat: add,
        args: { a: E.right(1), b: E.right(1), c: E.right(1) },
      },
      {
        empty,
        concat: add,
        args: { a: E.right(1), b: E.right(1), c: E.left(1) },
      },
      {
        empty,
        concat: add,
        args: { a: E.right(1), b: E.left(1), c: E.right(1) },
      },
      {
        empty,
        concat: add,
        args: { a: E.right(1), b: E.left(1), c: E.left(1) },
      },
      {
        empty,
        concat: add,
        args: { a: E.left(1), b: E.right(1), c: E.right(1) },
      },
      {
        empty,
        concat: add,
        args: { a: E.left(1), b: E.right(1), c: E.left(1) },
      },
      {
        empty,
        concat: add,
        args: { a: E.left(1), b: E.left(1), c: E.right(1) },
      },
      {
        empty,
        concat: add,
        args: { a: E.left(1), b: E.left(1), c: E.left(1) },
      },
    ];

    GetMonoidCases.forEach(({ concat, empty, args }) => {
      Test.assertMonoid(
        E.getRightMonoid({ concat, empty }),
        args,
      );
    });

    // getRightMonad
    const toString = (n: number): string => n.toString();
    const toLength = (s: string): number => s.length;

    const rightMonad = E.getRightMonad(
      { concat: add },
    );

    Test.assertMonad(
      rightMonad,
      {
        a: 1,
        ta: E.of(1),
        fab: toString,
        fbc: toLength,
        fatb: (n) => E.of(n.toString),
        fbtc: (s) => E.of(s.length),
        tfab: E.of(toString),
        tfbc: E.of(toLength),
      },
    );
  },
});

Deno.test({
  name: "Either Modules",
  fn() {
    const toString = (n: number): string => n.toString();
    const toLength = (s: string): number => s.length;
    const fromNumber = (n: number) =>
      n % 2 === 0 ? E.of(n.toString()) : E.left(n);
    const fromString = (s: string) =>
      s.length === 0 ? E.left(s) : E.of(s.length);

    // Functor
    Test.assertFunctor(
      E.Functor,
      {
        ta: E.of(1),
        fab: toString,
        fbc: toLength,
      },
    );

    // Bifunctor
    const BifunctorCases = [
      { args: { tax: E.left("") } },
      { args: { tax: E.left("asfd") } },
      { args: { tax: E.right(0) } },
      { args: { tax: E.right(1) } },
      { args: { tax: E.right(2) } },
    ];

    BifunctorCases.forEach(({ args: { tax } }) => {
      Test.assertBifunctor(
        E.Bifunctor,
        {
          tax,
          fab: toLength,
          fbc: toString,
          fxy: toString,
          fyz: toLength,
        },
      );
    });

    // Monad
    const MonadCases = [
      {
        a: 1,
        ta: E.of(1),
        fab: toString,
        fbc: toLength,
        fatb: fromNumber,
        fbtc: fromString,
        tfab: E.of(toString),
        tfbc: E.of(toLength),
      },
      {
        a: 2,
        ta: E.left("ta"),
        fab: toString,
        fbc: toLength,
        fatb: fromNumber,
        fbtc: fromString,
        tfab: E.left("tfab"),
        tfbc: E.left("tfbc"),
      },
      {
        a: 0,
        ta: E.of(0),
        fab: toString,
        fbc: toLength,
        fatb: fromNumber,
        fbtc: fromString,
        tfab: E.of(toString),
        tfbc: E.left("tfbc"),
      },
    ];

    MonadCases.forEach((args) => {
      Test.assertMonad(
        E.Monad,
        args,
      );
    });

    // MonadThrow
    assertEquals(E.MonadThrow.throwError(1), E.left(1));

    // Alt
    const AltCases = [
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.right(0),
          tb: E.right(1),
          tc: E.right(2),
        },
      },
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.right(0),
          tb: E.right(1),
          tc: E.left(2),
        },
      },
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.right(0),
          tb: E.left(1),
          tc: E.right(2),
        },
      },
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.right(0),
          tb: E.left(1),
          tc: E.left(2),
        },
      },
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.left(0),
          tb: E.right(1),
          tc: E.right(2),
        },
      },
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.left(0),
          tb: E.right(1),
          tc: E.left(2),
        },
      },
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.left(0),
          tb: E.left(1),
          tc: E.right(2),
        },
      },
      {
        args: {
          fab: toString,
          fbc: toLength,
          ta: E.left(0),
          tb: E.left(1),
          tc: E.left(2),
        },
      },
    ];

    AltCases.forEach(({ args }) => {
      Test.assertAlt(E.Alt, args);
    });

    // Applicative - covered by Monad
    // Apply - covered by Monad
    // Chain - covered by Monad

    // Extend
    // Foldable
    // Traversable
  },
});
