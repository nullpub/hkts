import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertMonad } from "./assert.ts";

import * as O from "../option.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const chainOne = (n: number): O.Option<number> => n !== 1 ? O.some(n) : O.none;

Deno.test({
  name: "Option Constructors",
  fn(): void {
    assertEquals(O.some(1), { tag: "Some", value: 1 });
    assertEquals(O.none, { tag: "None" });
  },
});

Deno.test({
  name: "Option Destructors",
  fn(): void {
    const fold = O.fold(addOne, () => 0);
    assertEquals(fold(O.some(1)), 2);
    assertEquals(fold(O.none), 0);
  },
});

Deno.test({
  name: "Option Guards",
  fn(): void {
    assertEquals(O.isSome(O.none), false);
    assertEquals(O.isSome(O.some(1)), true);
    assertEquals(O.isNone(O.none), true);
    assertEquals(O.isNone(O.some(1)), false);
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => n % 2 === 0 ? O.of(n.toString()) : O.none;
const fromString = (s: string) => s.length === 0 ? O.none : O.of(s.length);

Deno.test({
  name: "Option Modules",
  async fn() {
    await assertMonad(
      O.Monad,
      "Option",
      {
        a: 1,
        ta: O.of(1),
        fab: toString,
        fbc: toLength,
        tfab: O.of(toString),
        tfbc: O.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
