import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";
import { assertMonad } from "./assert.ts";

import * as N from "../nilable.ts";

const addOne = (n: number): number => n + 1;

Deno.test({
  name: "Nilable Constructors",
  fn(): void {
    assertEquals(N.of(1), 1);
    assertEquals(N.nil, undefined);
  },
});

Deno.test({
  name: "Nilable Destructors",
  fn(): void {
    const fold = N.fold(addOne, () => 0);
    assertEquals(fold(N.of(1)), 2);
    assertEquals(fold(N.nil), 0);
  },
});

Deno.test({
  name: "Nilable Guards",
  fn(): void {
    assertEquals(N.isNotNil(N.nil), false);
    assertEquals(N.isNotNil(N.of(1)), true);
    assertEquals(N.isNil(N.nil), true);
    assertEquals(N.isNil(N.of(1)), false);
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => n % 2 === 0 ? N.of(n.toString()) : N.nil;
const fromString = (s: string) => s.length === 0 ? N.nil : N.of(s.length);

Deno.test({
  name: "Nilable Modules",
  async fn() {
    await assertMonad(
      N.Monad,
      "Nilable",
      {
        a: 1,
        ta: N.of(1),
        fab: toString,
        fbc: toLength,
        tfab: N.of(toString),
        tfbc: N.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
