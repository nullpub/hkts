import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as T from "../task.ts";
import { assertMonad } from "./assert.ts";

Deno.test({
  name: "Task Constructors",
  async fn(): Promise<void> {
    assertEquals(await T.of(1)(), 1);
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => T.of(n.toString());
const fromString = (s: string) => T.of(s.length);

Deno.test({
  name: "Task Modules",
  async fn() {
    await assertMonad(
      T.Monad,
      "Task",
      {
        a: 1,
        ta: T.of(1),
        fab: toString,
        fbc: toLength,
        tfab: T.of(toString),
        tfbc: T.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
