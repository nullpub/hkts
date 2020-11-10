import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import * as E from "../either.ts";
import * as O from "../option.ts";
import { assertMonad } from "./assert.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const addTwo = (n: number): number => n + 2;

Deno.test({
  name: "Either Constructors",
  fn(): void {
    assertEquals(E.left(1), { tag: "Left", left: 1 });
    assertEquals(E.right(1), { tag: "Right", right: 1 });
  },
});

Deno.test({
  name: "Either Destructors",
  fn(): void {
    const fold = E.fold(addOne, addTwo);
    assertEquals(fold(E.left(1)), 2);
    assertEquals(fold(E.right(1)), 3);
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

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) =>
  n % 2 === 0 ? E.of(n.toString()) : E.left("Number Mod 2");
const fromString = (s: string) =>
  s.length === 0 ? E.left("Empty string") : E.of(s.length);

Deno.test({
  name: "Either Modules",
  async fn() {
    await assertMonad(
      E.Monad,
      "Either",
      {
        a: 1,
        ta: E.of(1),
        fab: toString,
        fbc: toLength,
        tfab: E.of(toString),
        tfbc: E.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
