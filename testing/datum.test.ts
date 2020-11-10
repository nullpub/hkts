import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import { assertMonad } from "./assert.ts";
import { constant } from "../fns.ts";
import * as D from "../datum.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const one = constant(1);

Deno.test({
  name: "Datum Constructors",
  fn(): void {
    assertEquals(D.replete(1), { tag: "Replete", value: 1 });
    assertEquals(D.initial, { tag: "Initial" });
  },
});

Deno.test({
  name: "Datum Destructors",
  fn(): void {
    const fold = D.fold(one, one, addOne, addOne);

    assertEquals(fold(D.replete(1)), 2);
    assertEquals(fold(D.initial), 1);
  },
});

Deno.test({
  name: "Datum Guards",
  fn(): void {
    assertEquals(D.isSome(D.initial), false);
    assertEquals(D.isSome(D.replete(1)), true);
    assertEquals(D.isNone(D.initial), true);
    assertEquals(D.isNone(D.replete(1)), false);
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => n % 2 === 0 ? D.of(n.toString()) : D.initial;
const fromString = (s: string) => s.length === 0 ? D.initial : D.of(s.length);

Deno.test({
  name: "Datum Modules",
  async fn() {
    await assertMonad(
      D.Monad,
      "Datum",
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
  },
});
